const { Event, EventRegistration, Review, User, Post } = require('../models');
const { Op } = require('sequelize');
const { uploadToCloudinary, deleteFromCloudinary, toPlayableVideoUrl } = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Helper to resolve model by PK 
const findEventById = async (id, options = {}) => {
  if (typeof id === 'number' || !isNaN(Number(id))) {
    const found = await Event.findByPk(id, options);
    if (found) return found;
  }
  return null;
};

// @desc    Create a new community service event
// @route   POST /api/events
// @access  Private (Organization / Admin)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      date,
      endDate,
      time,
      location,
      locationType,
      volunteerSlots,
      hoursGranted,
      requirements,
      skillsNeeded,
    } = req.body;

    let banner = {
      url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&auto=format&fit=crop&q=80',
      public_id: '',
      mediaType: 'image',
    };

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        'connectserve/events',
        isVideo
          ? { mimetype: req.file.mimetype }
          : { transformation: [{ width: 1200, height: 600, crop: 'fill' }], mimetype: req.file.mimetype }
      );
      banner = {
        url: isVideo ? toPlayableVideoUrl(uploadResult.secure_url) : uploadResult.secure_url,
        public_id: uploadResult.public_id,
        mediaType: isVideo ? 'video' : 'image',
      };
    }

    const parsedRequirements = requirements
      ? (typeof requirements === 'string' ? JSON.parse(requirements) : requirements)
      : [];
    const parsedSkills = skillsNeeded
      ? (typeof skillsNeeded === 'string' ? JSON.parse(skillsNeeded) : skillsNeeded)
      : [];

    const userId = req.user.id || req.user._id;

    if (req.user.role === 'organization' && !req.user.orgDetails?.isVerified) {
      return sendError(res, 'Your organisation is pending verification by Admin. You cannot create events yet.', 403);
    }

    const event = await Event.create({
      organizerId: userId,
      title,
      description,
      category: category || 'Community Development',
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      time: time || '09:00 AM - 01:00 PM',
      location,
      locationType: locationType || 'in-person',
      volunteerSlots: Number(volunteerSlots) || 20,
      hoursGranted: Number(hoursGranted) || 4,
      banner,
      requirements: parsedRequirements,
      skillsNeeded: parsedSkills,
      status: 'upcoming',
    });

    const populatedEvent = await Event.findByPk(event.id, {
      include: [{ model: User, as: 'organizer', attributes: ['id', 'name', 'username', 'avatar', 'orgDetails'] }],
    });

    // Emit live event announcement
    const io = req.app.get('io');
    if (io) {
      io.emit('new_event_created', populatedEvent);
    }

    return sendSuccess(res, 'Event created successfully.', { event: populatedEvent }, null, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get / Browse community service events with search and filters
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      locationType,
      status,
      startDate,
      endDate,
      organizerId,
      upcoming,
      page = 1,
      limit = 9,
      sortBy = 'date_asc',
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category && category !== 'All') {
      where.category = category;
    }

    if (locationType && locationType !== 'all') {
      where.locationType = locationType;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (organizerId) {
      where.organizerId = organizerId;
    }

    // upcoming=true -> hide events that are done (end date / start day already passed, cancelled or completed)
    if (upcoming === 'true') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      where.status = { [Op.in]: ['upcoming', 'ongoing'] };
      where[Op.and] = [
        ...(where[Op.and] || []),
        {
          [Op.or]: [
            { endDate: { [Op.gte]: startOfToday } },
            { endDate: null, date: { [Op.gte]: startOfToday } },
          ],
        },
      ];
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    let order = [['date', 'ASC']];
    if (sortBy === 'date_desc') order = [['date', 'DESC']];
    if (sortBy === 'hours_desc') order = [['hoursGranted', 'DESC']];
    if (sortBy === 'rating_desc') order = [['averageRating', 'DESC']];
    if (sortBy === 'popular') order = [['registeredCount', 'DESC']];

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const { count: total, rows: events } = await Event.findAndCountAll({
      where,
      order,
      offset,
      limit: parsedLimit,
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'username', 'avatar', 'orgDetails'],
        },
      ],
      distinct: true,
    });

    return sendSuccess(res, 'Events fetched successfully.', {
      events,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit),
      hasMore: offset + events.length < total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID with registration status
// @route   GET /api/events/:id
// @access  Public (Optional Auth)
const getEventById = async (req, res, next) => {
  try {
    const event = await findEventById(req.params.id, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'username', 'avatar', 'bio', 'location', 'orgDetails'],
        },
      ],
    });

    if (!event) {
      return sendError(res, 'Event not found.', 404);
    }

    let userRegistration = null;
    if (req.user) {
      const userId = req.user.id || req.user._id;
      userRegistration = await EventRegistration.findOne({
        where: { eventId: event.id, userId },
      });
    }

    const reviews = await Review.findAll({
      where: { eventId: event.id },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'username', 'avatar'],
        },
      ],
    });

    return sendSuccess(res, 'Event details loaded.', {
      event,
      userRegistration,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Event Organizer / Admin)
const updateEvent = async (req, res, next) => {
  try {
    const event = await findEventById(req.params.id);
    if (!event) {
      return sendError(res, 'Event not found.', 404);
    }

    const userId = req.user.id || req.user._id;
    if (String(event.organizerId) !== String(userId) && req.user.role !== 'admin') {
      return sendError(res, 'You are not authorized to edit this event.', 403);
    }

    const fieldsToUpdate = [
      'title', 'description', 'category', 'date', 'endDate', 'time',
      'location', 'locationType', 'volunteerSlots', 'hoursGranted', 'status',
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'date' || field === 'endDate') {
          event[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else if (field === 'volunteerSlots' || field === 'hoursGranted') {
          event[field] = Number(req.body[field]);
        } else {
          event[field] = req.body[field];
        }
      }
    });

    if (req.body.requirements) {
      event.requirements = typeof req.body.requirements === 'string'
        ? JSON.parse(req.body.requirements)
        : req.body.requirements;
    }

    if (req.body.skillsNeeded) {
      event.skillsNeeded = typeof req.body.skillsNeeded === 'string'
        ? JSON.parse(req.body.skillsNeeded)
        : req.body.skillsNeeded;
    }

    if (req.file) {
      if (event.banner?.public_id) {
        await deleteFromCloudinary(event.banner.public_id, event.banner.mediaType);
      }
      const isVideo = req.file.mimetype.startsWith('video/');
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        'connectserve/events',
        isVideo
          ? { mimetype: req.file.mimetype }
          : { transformation: [{ width: 1200, height: 600, crop: 'fill' }], mimetype: req.file.mimetype }
      );
      event.banner = {
        url: isVideo ? toPlayableVideoUrl(uploadResult.secure_url) : uploadResult.secure_url,
        public_id: uploadResult.public_id,
        mediaType: isVideo ? 'video' : 'image',
      };
    }

    await event.save();
    const updated = await Event.findByPk(event.id, {
      include: [{ model: User, as: 'organizer', attributes: ['id', 'name', 'username', 'avatar', 'orgDetails'] }],
    });

    return sendSuccess(res, 'Event updated successfully.', { event: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Event Organizer / Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await findEventById(req.params.id);
    if (!event) {
      return sendError(res, 'Event not found.', 404);
    }

    const userId = req.user.id || req.user._id;
    if (String(event.organizerId) !== String(userId) && req.user.role !== 'admin') {
      return sendError(res, 'You are not authorized to delete this event.', 403);
    }

    if (event.banner?.public_id) {
      await deleteFromCloudinary(event.banner.public_id, event.banner.mediaType);
    }

    // Unlink posts tagged with this event so the delete never hits an FK error
    await Post.update({ eventTagId: null }, { where: { eventTagId: event.id } });
    await EventRegistration.destroy({ where: { eventId: event.id } });
    await Review.destroy({ where: { eventId: event.id } });
    await event.destroy();

    return sendSuccess(res, 'Event and associated registrations deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Add review & rating for an attended event
// @route   POST /api/events/:id/reviews
// @access  Private
const addEventReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const eventIdParam = req.params.id;
    const userId = req.user.id || req.user._id;

    const event = await findEventById(eventIdParam);
    if (!event) {
      return sendError(res, 'Event not found.', 404);
    }

    // Verify user attended or registered
    const registration = await EventRegistration.findOne({
      where: {
        eventId: event.id,
        userId,
        status: { [Op.in]: ['approved', 'attended'] },
      },
    });

    if (!registration) {
      return sendError(res, 'You can only review events you were registered or attended.', 403);
    }

    const existingReview = await Review.findOne({ where: { eventId: event.id, userId } });
    if (existingReview) {
      return sendError(res, 'You have already reviewed this event.', 400);
    }

    const review = await Review.create({
      eventId: event.id,
      userId,
      rating: Number(rating),
      comment,
    });

    // Recalculate event average rating
    const allReviews = await Review.findAll({ where: { eventId: event.id } });
    const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

    event.averageRating = parseFloat(avg.toFixed(1));
    event.totalRatings = allReviews.length;
    await event.save();

    const populatedReview = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'username', 'avatar'] }],
    });

    return sendSuccess(res, 'Review submitted successfully.', { review: populatedReview, averageRating: event.averageRating }, null, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get real platform active statistics (volunteers, NGOs, hours, drives)
// @route   GET /api/events/stats
// @access  Public
const getPublicStats = async (req, res, next) => {
  try {
    const activeVolunteers = await User.count({ where: { role: 'user', isActive: true, isBanned: false } });
    const verifiedNGOs = await User.count({ where: { role: 'organization', isActive: true, isBanned: false } });
    const completedDrives = await Event.count({ where: { status: 'completed' } });
    const totalDrives = await Event.count();

    // Aggregate total volunteer hours logged across volunteers
    const hoursLogged = (await User.sum('volunteerHours', {
      where: { role: 'user', isActive: true, isBanned: false },
    })) || 0;

    return sendSuccess(res, 'Platform statistics retrieved successfully.', {
      activeVolunteers,
      verifiedNGOs,
      hoursLogged,
      drivesCompleted: completedDrives,
      totalDrives,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addEventReview,
  getPublicStats,
};
