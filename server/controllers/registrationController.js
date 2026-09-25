const { EventRegistration, Event, User, Certificate, Notification } = require('../models');
const { Op } = require('sequelize');
const { evaluateBadges } = require('../utils/badgeCalculator');
const { sendApplicationStatusEmail, sendNewApplicantEmail, sendCertificateEmail } = require('../utils/emailService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const findEventByIdOrMongoId = async (id) => {
  if (typeof id === 'number' || !isNaN(Number(id))) {
    const found = await Event.findByPk(id);
    if (found) return found;
  }
  return await Event.findOne({ where: { mongoId: String(id) } });
};

// @desc    Register / Apply for an event
// @route   POST /api/events/:id/register
// @access  Private (User/Volunteer)
const registerForEvent = async (req, res, next) => {
  try {
    const eventIdParam = req.params.id;
    const userId = req.user.id || req.user._id;
    const { notes } = req.body;

    const event = await findEventByIdOrMongoId(eventIdParam);
    if (!event) {
      return sendError(res, 'Event not found.', 404);
    }

    const organizer = await User.findByPk(event.organizerId);

    const eventDatePassed = new Date(event.date) < new Date();
    if (eventDatePassed && event.status !== 'completed') {
      // Auto-mark stale events as completed so future checks are fast
      event.status = 'completed';
      await event.save();
    }

    if (event.status === 'cancelled' || event.status === 'completed' || eventDatePassed) {
      return sendError(res, `This event has already ended and is no longer accepting volunteers.`, 400);
    }

    if (event.registeredCount >= event.volunteerSlots) {
      return sendError(res, 'Sorry, all volunteer slots for this event are filled.', 400);
    }

    const existing = await EventRegistration.findOne({
      where: { eventId: event.id, userId },
    });

    if (existing) {
      if (existing.status === 'cancelled') {
        existing.status = 'pending';
        existing.notes = notes || existing.notes;
        existing.appliedAt = new Date();
        await existing.save();
        return sendSuccess(res, 'Re-applied for event successfully.', { registration: existing });
      }
      return sendError(res, `You already have an active registration (${existing.status}) for this event.`, 400);
    }

    const registration = await EventRegistration.create({
      eventId: event.id,
      userId,
      status: 'pending',
      notes: notes || '',
    });

    // Notify organization
    if (organizer) {
      if (organizer.role === 'organization') { // organisation-only, per requirement
        sendNewApplicantEmail(organizer, req.user, event)
          .catch(err => console.error('[Email] New applicant email failed:', err.message));
      }

      const notification = await Notification.create({
        recipientId: organizer.id,
        senderId: userId,
        type: 'event_registered',
        title: 'New Volunteer Application',
        message: `${req.user.name} applied to volunteer for "${event.title}".`,
        entityId: event.id,
        entityType: 'event',
        link: `/org/dashboard`,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${organizer.id}`).emit('notification', notification);
      }
    }

    return sendSuccess(res, 'Application submitted successfully. Waiting for organizer confirmation.', {
      registration,
    }, null, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's registered events
// @route   GET /api/registrations/my
// @access  Private
const getMyRegistrations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const userId = req.user.id || req.user._id;

    const where = { userId };
    if (status && status !== 'all') {
      where.status = status;
    }

    const registrations = await EventRegistration.findAll({
      where,
      order: [['appliedAt', 'DESC']],
      include: [
        {
          model: Event,
          as: 'event',
          include: [
            {
              model: User,
              as: 'organizer',
              attributes: ['id', 'name', 'username', 'avatar', 'orgDetails'],
            },
          ],
        },
      ],
    });

    return sendSuccess(res, 'My registrations fetched.', { registrations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applicants for a specific event
// @route   GET /api/events/:id/applicants
// @access  Private (Event Organizer / Admin)
const getEventApplicants = async (req, res, next) => {
  try {
    const eventIdParam = req.params.id;
    const event = await findEventByIdOrMongoId(eventIdParam);

    if (!event) {
      return sendError(res, 'Event not found.', 404);
    }

    const userId = req.user.id || req.user._id;
    if (String(event.organizerId) !== String(userId) && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to view applicants for this event.', 403);
    }

    const registrations = await EventRegistration.findAll({
      where: { eventId: event.id },
      order: [['appliedAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'username', 'email', 'avatar', 'bio', 'location', 'skills', 'volunteerHours', 'badges'],
        },
      ],
    });

    return sendSuccess(res, 'Event applicants retrieved.', { event, registrations });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject an applicant
// @route   PUT /api/registrations/:id/status
// @access  Private (Event Organizer / Admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return sendError(res, 'Invalid status provided.', 400);
    }

    const registration = await EventRegistration.findByPk(req.params.id, {
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'user' },
      ],
    });

    if (!registration) {
      return sendError(res, 'Registration not found.', 404);
    }

    const event = registration.event;
    const userId = req.user.id || req.user._id;
    if (String(event.organizerId) !== String(userId) && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to manage this application.', 403);
    }

    const previousStatus = registration.status;
    registration.status = status;
    registration.statusUpdatedAt = new Date();
    await registration.save();

    // Adjust event registered count
    if (previousStatus !== 'approved' && status === 'approved') {
      event.registeredCount = (event.registeredCount || 0) + 1;
      await event.save();
    } else if (previousStatus === 'approved' && (status === 'rejected' || status === 'cancelled')) {
      event.registeredCount = Math.max(0, (event.registeredCount || 1) - 1);
      await event.save();
    }

    // Send in-app notification & email
    const notification = await Notification.create({
      recipientId: registration.userId,
      senderId: userId,
      type: status === 'approved' ? 'event_approved' : 'event_rejected',
      title: status === 'approved' ? 'Application Approved! 🎉' : 'Application Update',
      message: status === 'approved'
        ? `Your application for "${event.title}" has been approved!`
        : `Your application for "${event.title}" was not approved.`,
      entityId: event.id,
      entityType: 'event',
      link: `/events/${event.id}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${registration.userId}`).emit('notification', notification);
    }

    // Fire email notification asynchronously
    sendApplicationStatusEmail(registration.user, event, status, notes);

    return sendSuccess(res, `Applicant status updated to ${status}.`, { registration });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance and log volunteer hours + generate certificate
// @route   POST /api/registrations/:id/attendance
// @access  Private (Event Organizer / Admin)
const markAttendance = async (req, res, next) => {
  try {
    const { attended, customHours } = req.body;
    const registration = await EventRegistration.findByPk(req.params.id, {
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'user' },
      ],
    });

    if (!registration) {
      return sendError(res, 'Registration not found.', 404);
    }

    const event = registration.event;
    const userId = req.user.id || req.user._id;
    if (String(event.organizerId) !== String(userId) && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to mark attendance for this event.', 403);
    }

    const volunteer = await User.findByPk(registration.userId);
    const hoursToLog = Number(customHours) || event.hoursGranted || 0;

    const isAttended = attended === true || attended === 'true';

    if (isAttended && !registration.attended) {
      // Mark attended
      registration.attended = true;
      registration.status = 'attended';
      registration.hoursLogged = hoursToLog;
      registration.attendanceMarkedAt = new Date();

      // Add volunteer hours
      volunteer.volunteerHours = (volunteer.volunteerHours || 0) + hoursToLog;

      // Evaluate new badges
      const newBadges = evaluateBadges(volunteer, event);
      await volunteer.save();

      // Generate Certificate
      const certCode = `CS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const certificate = await Certificate.create({
        certificateCode: certCode,
        userId: volunteer.id,
        eventId: event.id,
        organizationId: userId,
        volunteerName: volunteer.name,
        eventTitle: event.title,
        organizationName: req.user.name,
        hours: hoursToLog,
        issueDate: new Date(),
        badgeAwarded: newBadges.length > 0 ? newBadges[0].name : 'Verified Community Volunteer',
      });

      registration.certificateIssued = true;
      await registration.save();

      sendCertificateEmail(volunteer, certificate)
        .catch(err => console.error('[Email] Certificate email failed:', err.message));

      // Notification
      const notification = await Notification.create({
        recipientId: volunteer.id,
        senderId: userId,
        type: 'certificate_issued',
        title: 'Volunteer Hours & Certificate Awarded! 🏆',
        message: `You earned ${hoursToLog} hours and a digital certificate for volunteering at "${event.title}".`,
        entityId: certificate.id,
        entityType: 'certificate',
        link: `/certificates`,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${volunteer.id}`).emit('notification', notification);
        io.to(`user:${volunteer.id}`).emit('certificate_earned', certificate);
      }

      return sendSuccess(res, `Attendance confirmed. ${hoursToLog} hours logged and certificate issued.`, {
        registration,
        certificate,
        newBadges,
        updatedHours: volunteer.volunteerHours,
      });
    } else if (!isAttended && registration.attended) {
      // Revoke attendance
      const previousHours = registration.hoursLogged || 0;
      registration.attended = false;
      registration.status = 'approved';
      registration.hoursLogged = 0;
      await registration.save();

      volunteer.volunteerHours = Math.max(0, (volunteer.volunteerHours || 0) - previousHours);
      await volunteer.save();

      return sendSuccess(res, 'Attendance unmarked and hours deducted.', { registration });
    }

    return sendSuccess(res, 'Attendance status saved.', { registration });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance by scanning volunteer's QR code
// @route   POST /api/events/:eventId/attendance/scan
// @access  Private (Event Organizer / Admin)
const scanAttendance = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { qrToken } = req.body;

    if (!qrToken || !qrToken.trim()) {
      return sendError(res, 'QR code token is required.', 400);
    }

    // 1) Look up User by qrToken
    const volunteer = await User.findOne({ where: { qrToken: qrToken.trim() } });
    if (!volunteer) {
      return sendError(res, 'Invalid QR code.', 404);
    }

    // 2) Find Event
    const event = await findEventByIdOrMongoId(eventId);
    if (!event) {
      return sendError(res, 'Event not found.', 404);
    }

    // 3) Verify requesting org actually owns this event
    const organizerId = req.user.id || req.user._id;
    if (String(event.organizerId) !== String(organizerId) && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to mark attendance for this event.', 403);
    }

    // 4) Find EventRegistration
    const registration = await EventRegistration.findOne({
      where: { eventId: event.id, userId: volunteer.id },
    });

    if (!registration || registration.status === 'rejected' || registration.status === 'cancelled') {
      return sendError(res, `${volunteer.name} has not registered or was not approved for this event.`, 400);
    }

    // 5) Prevent double-marking (return a friendly "Already marked present" message)
    if (registration.attended) {
      return sendSuccess(res, `Already marked present for ${volunteer.name}`, {
        alreadyMarked: true,
        user: { id: volunteer.id, name: volunteer.name, avatar: volunteer.avatar },
        registration,
      });
    }

    // 6) Mark attendance
    const hoursToLog = event.hoursGranted || 0;
    registration.attended = true;
    registration.status = 'attended';
    registration.hoursLogged = hoursToLog;
    registration.attendanceMarkedAt = new Date();

    volunteer.volunteerHours = (volunteer.volunteerHours || 0) + hoursToLog;
    const newBadges = evaluateBadges(volunteer, event);
    await volunteer.save();

    // Generate Certificate
    const certCode = `CS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const certificate = await Certificate.create({
      certificateCode: certCode,
      userId: volunteer.id,
      eventId: event.id,
      organizationId: organizerId,
      volunteerName: volunteer.name,
      eventTitle: event.title,
      organizationName: req.user.name,
      hours: hoursToLog,
      issueDate: new Date(),
      badgeAwarded: newBadges.length > 0 ? newBadges[0].name : 'Verified Community Volunteer',
    });

    registration.certificateIssued = true;
    await registration.save();

    sendCertificateEmail(volunteer, certificate)
      .catch(err => console.error('[Email] Certificate email failed:', err.message));

    // Send Notification & Socket
    const notification = await Notification.create({
      recipientId: volunteer.id,
      senderId: organizerId,
      type: 'certificate_issued',
      title: 'Attendance Marked & Certificate Awarded! 🏆',
      message: `Your QR code was scanned! You earned ${hoursToLog} hours and a digital certificate for "${event.title}".`,
      entityId: certificate.id,
      entityType: 'certificate',
      link: `/certificates`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${volunteer.id}`).emit('notification', notification);
      io.to(`user:${volunteer.id}`).emit('certificate_earned', certificate);
    }

    return sendSuccess(res, `Attendance marked for ${volunteer.name}`, {
      user: { id: volunteer.id, name: volunteer.name, avatar: volunteer.avatar },
      registration,
      certificate,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getEventApplicants,
  updateApplicationStatus,
  markAttendance,
  scanAttendance,
};
