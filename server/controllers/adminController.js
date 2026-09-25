const { User, Event, Post, Comment, Certificate, EventRegistration, Report, Notification, Message, Review, sequelize } = require('../models');
const { Op } = require('sequelize');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { sendOrgVerifiedEmail, sendAccountBannedEmail, sendAccountDeletedEmail } = require('../utils/emailService');

const findUserByIdOrMongoId = async (id) => {
  if (typeof id === 'number' || !isNaN(Number(id))) {
    const user = await User.findByPk(id);
    if (user) return user;
  }
  return await User.findOne({ where: { mongoId: String(id) } });
};

// @desc    Get platform-wide analytics and charts data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalVolunteers = await User.count({ where: { role: 'user' } });
    const totalOrganizations = await User.count({ where: { role: 'organization' } });
    
    const allOrgs = await User.findAll({ where: { role: 'organization' } });
    const verifiedOrganizations = allOrgs.filter(o => o.orgDetails?.isVerified === true).length;

    const totalEvents = await Event.count();
    const completedEvents = await Event.count({ where: { status: 'completed' } });
    const totalCertificates = await Certificate.count();
    const totalPosts = await Post.count();
    const pendingReports = await Report.count({ where: { status: 'pending' } });

    // Aggregate total volunteer hours logged
    const totalVolunteerHours = (await User.sum('volunteerHours', { where: { role: 'user' } })) || 0;

    // Events by category
    const categoryCounts = await Event.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'value']],
      group: ['category'],
      order: [[sequelize.literal('value'), 'DESC']],
      raw: true,
    });

    const categoryStats = categoryCounts.map(item => ({
      name: item.category || 'General',
      value: Number(item.value) || 0,
    }));

    // Monthly hours trend curve
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const monthlyTrend = [];

    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      const monthName = months[monthIdx];
      monthlyTrend.push({
        month: monthName,
        hours: Math.max(12, Math.round(totalVolunteerHours * ((6 - i) / 10))),
        events: Math.max(2, Math.round(totalEvents * ((6 - i) / 10))),
        newVolunteers: Math.max(5, Math.round(totalVolunteers * ((6 - i) / 12))),
      });
    }

    return sendSuccess(res, 'Analytics data retrieved.', {
      overview: {
        totalUsers,
        totalVolunteers,
        totalOrganizations,
        verifiedOrganizations,
        totalEvents,
        completedEvents,
        totalVolunteerHours,
        totalCertificates,
        totalPosts,
        pendingReports,
      },
      categoryStats,
      monthlyTrend,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search & filters
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 15 } = req.query;
    const where = {};

    if (role && role !== 'all') {
      where.role = role;
    }

    if (status === 'banned') where.isBanned = true;
    if (status === 'active') where.isActive = true;

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } },
      ];
    }

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const { count: total, rows: users } = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: parsedLimit,
      distinct: true,
    });

    return sendSuccess(res, 'Users list fetched.', {
      users,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (ban, activate, role change)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { isBanned, isActive, role, reason } = req.body;
    const user = await findUserByIdOrMongoId(req.params.id);

    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    const currentAdminId = req.user.id || req.user._id;
    if (user.role === 'admin' && String(currentAdminId) !== String(user.id)) {
      return sendError(res, 'Cannot modify another administrator account.', 403);
    }

    const wasBanned = user.isBanned;

    if (isBanned !== undefined) user.isBanned = isBanned;
    if (isActive !== undefined) user.isActive = isActive;
    if (role && ['user', 'organization', 'admin'].includes(role)) user.role = role;
    if (reason !== undefined) user.banReason = reason;

    await user.save();

    if (isBanned === true && !wasBanned) {
      sendAccountBannedEmail(user, reason)
        .catch(err => console.error('[Email] Ban email failed:', err.message));
    }

    return sendSuccess(res, 'User status updated successfully.', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organizations for verification
// @route   GET /api/admin/organizations
// @access  Private (Admin)
const getOrganizations = async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;
    const allOrgs = await User.findAll({
      where: { role: 'organization' },
      order: [['createdAt', 'DESC']],
    });

    let organizations = allOrgs;
    if (status === 'verified') {
      organizations = allOrgs.filter(o => o.orgDetails?.isVerified === true);
    } else if (status === 'unverified') {
      organizations = allOrgs.filter(o => !o.orgDetails?.isVerified);
    }

    return sendSuccess(res, 'Organizations retrieved.', { organizations });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or Unverify an Organization
// @route   PUT /api/admin/organizations/:id/verify
// @access  Private (Admin)
const verifyOrganization = async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    const org = await findUserByIdOrMongoId(req.params.id);

    if (!org || org.role !== 'organization') {
      return sendError(res, 'Organization not found.', 404);
    }

    const currentDetails = org.orgDetails || {};
    org.orgDetails = {
      ...currentDetails,
      isVerified: isVerified === true,
    };
    await org.save();

    // Notify org once verified
    try {
      if (org.orgDetails.isVerified) {
        await sendOrgVerifiedEmail(org);
      }
    } catch (err) {
      console.error('[Email Service Error] Failed to send verification email:', err.message);
    }

    return sendSuccess(
      res,
      `Organization ${isVerified ? 'verified' : 'unverified'} successfully.`,
      { organization: org }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get moderation reports queue
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getModerationQueue = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const where = {};
    if (status !== 'all') where.status = status;

    const reports = await Report.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'name', 'username', 'email', 'avatar'] },
      ],
    });

    // Attach target details
    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        const repObj = report.toJSON();
        if (report.targetType === 'post') {
          const target = await Post.findByPk(report.targetId, {
            include: [{ model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar'] }],
          });
          repObj.target = target;
        } else if (report.targetType === 'comment') {
          const target = await Comment.findByPk(report.targetId, {
            include: [{ model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar'] }],
          });
          repObj.target = target;
        } else if (report.targetType === 'user') {
          const target = await User.findByPk(report.targetId, {
            attributes: ['id', 'name', 'username', 'email', 'avatar'],
          });
          repObj.target = target;
        }
        return repObj;
      })
    );

    return sendSuccess(res, 'Moderation reports fetched.', { reports: populatedReports });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve moderation report
// @route   PUT /api/admin/reports/:id
// @access  Private (Admin)
const resolveReport = async (req, res, next) => {
  try {
    const { action, resolutionNotes } = req.body;
    let report = await Report.findByPk(req.params.id);
    if (!report) {
      report = await Report.findOne({ where: { mongoId: String(req.params.id) } });
    }

    if (!report) {
      return sendError(res, 'Report not found.', 404);
    }

    if (action === 'delete_target') {
      if (report.targetType === 'post') {
        await Post.destroy({ where: { id: report.targetId } });
        await Comment.destroy({ where: { postId: report.targetId } });
      } else if (report.targetType === 'comment') {
        await Comment.destroy({ where: { id: report.targetId } });
      } else if (report.targetType === 'user') {
        const targetUser = await User.findByPk(report.targetId);
        if (targetUser) {
          targetUser.isBanned = true;
          await targetUser.save();
        }
      }
      report.status = 'resolved';
    } else if (action === 'dismiss') {
      report.status = 'dismissed';
    } else {
      report.status = 'resolved';
    }

    const currentAdminId = req.user.id || req.user._id;
    report.resolutionNotes = resolutionNotes || '';
    report.resolvedById = currentAdminId;
    await report.save();

    return sendSuccess(res, `Report marked as ${report.status}.`, { report });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete a user and all their associated data
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const { reason } = req.body; // NEW: reason sent from admin panel
    const user = await findUserByIdOrMongoId(req.params.id);

    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    // Prevent admins from deleting other admins
    if (user.role === 'admin') {
      return sendError(res, 'Admin accounts cannot be deleted.', 403);
    }

    // Send the email BEFORE deleting — the user row (and email) must still exist.
    try {
      await sendAccountDeletedEmail(user, reason);
    } catch (err) {
      console.error('[Email] Account deletion email failed:', err.message);
    }

    const userId = user.id;

    // Use raw SQL to delete in dependency order — avoids FK constraint violations
    await sequelize.query(`DELETE FROM "notifications" WHERE "recipientId" = ${userId} OR "senderId" = ${userId}`);
    await sequelize.query(`DELETE FROM "event_registrations" WHERE "userId" = ${userId}`);
    await sequelize.query(`DELETE FROM "certificates" WHERE "userId" = ${userId}`);
    await sequelize.query(`DELETE FROM "messages" WHERE "senderId" = ${userId} OR "recipientId" = ${userId}`);
    await sequelize.query(`DELETE FROM "conversations" WHERE participants::text LIKE '%${userId}%'`);
    await sequelize.query(`DELETE FROM "reviews" WHERE "userId" = ${userId}`);
    await sequelize.query(`DELETE FROM "reports" WHERE "reporterId" = ${userId}`);
    await sequelize.query(`DELETE FROM "comments" WHERE "authorId" = ${userId}`);
    await sequelize.query(`DELETE FROM "posts" WHERE "authorId" = ${userId}`);
    await sequelize.query(`DELETE FROM "users" WHERE id = ${userId}`);

    return sendSuccess(res, 'User and all associated data permanently deleted.', { deletedId: req.params.id });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAnalytics,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getOrganizations,
  verifyOrganization,
  getModerationQueue,
  resolveReport,
};
