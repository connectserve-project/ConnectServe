const { Notification, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const findNotificationByIdOrMongoId = async (id, recipientId) => {
  if (typeof id === 'number' || !isNaN(Number(id))) {
    const notif = await Notification.findByPk(id);
    if (notif && String(notif.recipientId) === String(recipientId)) return notif;
  }
  return await Notification.findOne({ where: { mongoId: String(id), recipientId } });
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { count: total, rows: notifications } = await Notification.findAndCountAll({
      where: { recipientId: userId },
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'username', 'avatar'] },
      ],
      distinct: true,
    });

    const unreadCount = await Notification.count({
      where: { recipientId: userId, isRead: false },
    });

    return sendSuccess(res, 'Notifications fetched.', {
      notifications,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const notification = await findNotificationByIdOrMongoId(req.params.id, userId);

    if (!notification) {
      return sendError(res, 'Notification not found.', 404);
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return sendSuccess(res, 'Notification marked as read.', { notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { recipientId: userId, isRead: false } }
    );

    return sendSuccess(res, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const unreadCount = await Notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    return sendSuccess(res, 'Unread notification count.', { unreadCount });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
