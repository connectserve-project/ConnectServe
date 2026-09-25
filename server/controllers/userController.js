const { User, Post, EventRegistration, Certificate, Notification, Event } = require('../models');
const { Op } = require('sequelize');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const findUserByIdOrMongoIdOrUsername = async (idOrUsername) => {
  if (typeof idOrUsername === 'number' || !isNaN(Number(idOrUsername))) {
    const user = await User.findByPk(idOrUsername);
    if (user) return user;
  }
  let user = await User.findOne({ where: { mongoId: String(idOrUsername) } });
  if (!user) {
    user = await User.findOne({ where: { username: String(idOrUsername).toLowerCase() } });
  }
  return user;
};

// @desc    Get user profile by ID or username
// @route   GET /api/users/:idOrUsername
// @access  Public (Optional Auth)
const getProfile = async (req, res, next) => {
  try {
    const { idOrUsername } = req.params;
    const user = await findUserByIdOrMongoIdOrUsername(idOrUsername);

    if (!user || user.isBanned) {
      return sendError(res, 'User profile not found.', 404);
    }

    // If this profile belongs to an organizer (whether organization or user),
    // also pull in posts that tag one of their own events
    // so they show up under their "Community Posts" tab too.
    const ownEvents = await Event.findAll({
      where: { organizerId: user.id },
      attributes: ['id'],
    });
    const ownEventIds = ownEvents.map((e) => e.id);

    // Fetch user's recent posts (their own posts, plus posts tagging their events)
    const posts = await Post.findAll({
      where: ownEventIds.length
        ? {
            [Op.or]: [
              { authorId: user.id },
              { eventTagId: { [Op.in]: ownEventIds } },
            ],
          }
        : { authorId: user.id },
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'role', 'orgDetails'] },
        { model: Event, as: 'eventTag', attributes: ['id', 'title', 'date', 'category'] },
      ],
    });

    const currentUserId = req.user ? (req.user.id || req.user._id) : null;
    const followers = Array.isArray(user.followers) ? user.followers : [];
    const isFollowing = currentUserId ? followers.some(fId => String(fId) === String(currentUserId)) : false;

    // Check visibility permissions for Sensitive Info & Certificates
    const viewerId = currentUserId ? String(currentUserId) : null;
    const viewerRole = req.user ? req.user.role : null;
    const isOwner = viewerId && viewerId === String(user.id);
    const isAdmin = viewerRole === 'admin';

    // If user is volunteer, fetch certificates (owner/admin only) and stats
    let certificates = [];
    let completedEventsCount = 0;
    if (user.role === 'user') {
      completedEventsCount = await EventRegistration.count({
        where: { userId: user.id, attended: true },
      });
      if (isOwner || isAdmin) {
        certificates = await Certificate.findAll({
          where: { userId: user.id },
          order: [['issueDate', 'DESC']],
        });
      }
    }

    const userObj = user.toJSON();

    if (!isOwner && !isAdmin) {
      delete userObj.email;
      delete userObj.mobileNumber;
      delete userObj.countryCode;
    }

    return sendSuccess(res, 'Profile retrieved successfully.', {
      user: userObj,
      posts,
      certificates,
      completedEventsCount,
      isFollowing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & avatar/banner
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findByPk(userId);
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    const {
      name,
      bio,
      location,
      skills,
      interests,
      socialLinks,
      orgDetails,
      username,
      gender,
      institution,
      countryCode,
      mobileNumber,
      state,
      country,
      pincode,
    } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (gender !== undefined) user.gender = gender;
    if (institution !== undefined) user.institution = institution;
    if (state !== undefined) user.state = state;
    if (country !== undefined) user.country = country;
    if (pincode !== undefined) user.pincode = pincode;
    if (countryCode !== undefined) user.countryCode = countryCode;

    if (mobileNumber !== undefined) {
      const cleanMobile = mobileNumber.trim();
      if (cleanMobile && cleanMobile !== user.mobileNumber) {
        const existing = await User.findOne({
          where: {
            mobileNumber: cleanMobile,
            id: { [Op.ne]: user.id },
          },
        });
        if (existing) {
          return sendError(res, 'This mobile number is already registered to another account.', 400);
        }
      }
      user.mobileNumber = cleanMobile;
    }

    if (skills) {
      user.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
    }
    if (interests) {
      user.interests = typeof interests === 'string' ? JSON.parse(interests) : interests;
    }
    if (socialLinks) {
      const parsedLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
      user.socialLinks = { ...(user.socialLinks || {}), ...parsedLinks };
    }

    if (username && username !== user.username) {
      const exists = await User.findOne({
        where: {
          username: username.toLowerCase(),
          id: { [Op.ne]: user.id },
        },
      });
      if (exists) {
        return sendError(res, 'Username is already taken.', 400);
      }
      user.username = username.toLowerCase();
    }

    if (user.role === 'organization' && orgDetails) {
      const parsedOrg = typeof orgDetails === 'string' ? JSON.parse(orgDetails) : orgDetails;
      const currentOrg = user.orgDetails || {};
      user.orgDetails = {
        ...currentOrg,
        mission: parsedOrg.mission !== undefined ? parsedOrg.mission : currentOrg.mission,
        registrationNumber: parsedOrg.registrationNumber !== undefined ? parsedOrg.registrationNumber : currentOrg.registrationNumber,
        contactPerson: parsedOrg.contactPerson !== undefined ? parsedOrg.contactPerson : currentOrg.contactPerson,
        foundedYear: parsedOrg.foundedYear !== undefined ? parsedOrg.foundedYear : currentOrg.foundedYear,
        category: parsedOrg.category !== undefined ? parsedOrg.category : currentOrg.category,
      };
    }

    // Handle avatar upload
    if (req.files && req.files.avatar && req.files.avatar[0]) {
      const file = req.files.avatar[0];
      if (user.avatar?.public_id) {
        await deleteFromCloudinary(user.avatar.public_id);
      }
      const uploadResult = await uploadToCloudinary(file.buffer, 'connectserve/profiles', {
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        mimetype: file.mimetype,
      });
      user.avatar = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    // Handle banner upload
    if (req.files && req.files.banner && req.files.banner[0]) {
      const file = req.files.banner[0];
      if (user.banner?.public_id) {
        await deleteFromCloudinary(user.banner.public_id);
      }
      const uploadResult = await uploadToCloudinary(file.buffer, 'connectserve/profiles', {
        transformation: [{ width: 1200, height: 400, crop: 'fill' }],
        mimetype: file.mimetype,
      });
      user.banner = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    // Handle verification document upload
    if (req.files && req.files.verificationDocument && req.files.verificationDocument[0]) {
      const file = req.files.verificationDocument[0];
      if (user.orgDetails?.verificationDocument?.public_id) {
        try { await deleteFromCloudinary(user.orgDetails.verificationDocument.public_id); } catch (e) {}
      }
      // Check if it is a pdf
      const isPdf = file.mimetype === 'application/pdf';
      const uploadResult = await uploadToCloudinary(file.buffer, 'connectserve/documents', {
        format: isPdf ? 'pdf' : undefined,
      });
      user.orgDetails = {
        ...(user.orgDetails || {}),
        verificationDocument: {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          mimetype: file.mimetype,
        }
      };
    }

    await user.save();

    return sendSuccess(res, 'Profile updated successfully.', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow / Unfollow user or organization
// @route   POST /api/users/:id/follow
// @access  Private
const toggleFollowUser = async (req, res, next) => {
  try {
    const targetUserIdParam = req.params.id;
    const currentUserId = req.user.id || req.user._id;

    const targetUser = await findUserByIdOrMongoIdOrUsername(targetUserIdParam);
    const currentUser = await User.findByPk(currentUserId);

    if (!targetUser) {
      return sendError(res, 'User not found.', 404);
    }

    if (String(targetUser.id) === String(currentUser.id)) {
      return sendError(res, 'You cannot follow yourself.', 400);
    }

    let myFollowing = Array.isArray(currentUser.following) ? [...currentUser.following] : [];
    let targetFollowers = Array.isArray(targetUser.followers) ? [...targetUser.followers] : [];

    const isFollowing = myFollowing.some(id => String(id) === String(targetUser.id));

    if (isFollowing) {
      // Unfollow
      myFollowing = myFollowing.filter(id => String(id) !== String(targetUser.id));
      targetFollowers = targetFollowers.filter(id => String(id) !== String(currentUser.id));

      currentUser.following = myFollowing;
      targetUser.followers = targetFollowers;

      await currentUser.save();
      await targetUser.save();

      return sendSuccess(res, `Unfollowed ${targetUser.name}.`, { isFollowing: false });
    } else {
      // Follow
      myFollowing.push(targetUser.id);
      targetFollowers.push(currentUser.id);

      currentUser.following = myFollowing;
      targetUser.followers = targetFollowers;

      await currentUser.save();
      await targetUser.save();

      // Create notification
      const notification = await Notification.create({
        recipientId: targetUser.id,
        senderId: currentUser.id,
        type: 'follow',
        title: 'New Follower',
        message: `${currentUser.name} started following you.`,
        entityId: currentUser.id,
        entityType: 'user',
        link: `/profile/${currentUser.username || currentUser.id}`,
      });

      // Socket notification emit
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${targetUser.id}`).emit('notification', notification);
      }

      return sendSuccess(res, `Following ${targetUser.name}.`, { isFollowing: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get top volunteers leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = async (req, res, next) => {
  try {
    const { timeframe = 'all', limit = 20 } = req.query;

    const where = { role: 'user', isBanned: false, isActive: true };

    const volunteers = await User.findAll({
      where,
      attributes: ['id', 'name', 'username', 'avatar', 'bio', 'location', 'volunteerHours', 'badges', 'createdAt'],
      order: [
        ['volunteerHours', 'DESC'],
        ['createdAt', 'ASC'],
      ],
      limit: parseInt(limit, 10),
    });

    const rankedVolunteers = volunteers.map((vol, index) => ({
      rank: index + 1,
      ...vol.toJSON(),
    }));

    return sendSuccess(res, 'Leaderboard retrieved successfully.', {
      volunteers: rankedVolunteers,
      timeframe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users and organizations
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res, next) => {
  try {
    const { q, role, page = 1, limit = 15 } = req.query;
    const where = { isBanned: false, isActive: true };

    if (role) {
      where.role = role;
    }

    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { username: { [Op.like]: `%${q}%` } },
      ];
    }

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const { count: total, rows: users } = await User.findAndCountAll({
      where,
      attributes: ['id', 'name', 'username', 'avatar', 'role', 'bio', 'location', 'skills', 'orgDetails', 'volunteerHours', 'badges'],
      offset,
      limit: parsedLimit,
      order: [['volunteerHours', 'DESC']],
      distinct: true,
    });

    return sendSuccess(res, 'Users search results.', {
      users,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and all associated data
// @route   DELETE /api/users/profile
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findByPk(userId);
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    // Delete avatar and banner from Cloudinary
    try {
      if (user.avatar?.public_id && user.avatar.public_id.trim() !== '') {
        await deleteFromCloudinary(user.avatar.public_id);
      }
      if (user.banner?.public_id && user.banner.public_id.trim() !== '') {
        await deleteFromCloudinary(user.banner.public_id);
      }
    } catch (_) {}

    // Delete posts
    const userPosts = await Post.findAll({ where: { authorId: userId } });
    for (const post of userPosts) {
      if (post.media?.public_id) {
        try { await deleteFromCloudinary(post.media.public_id); } catch (_) {}
      }
    }
    await Post.destroy({ where: { authorId: userId } });

    // If org: delete events
    if (user.role === 'organization') {
      const orgEvents = await Event.findAll({ where: { organizerId: userId } });
      const eventIds = orgEvents.map(e => e.id);
      if (eventIds.length > 0) {
        await EventRegistration.destroy({ where: { eventId: { [Op.in]: eventIds } } });
        await Event.destroy({ where: { organizerId: userId } });
      }
    }

    // Delete registrations
    await EventRegistration.destroy({ where: { userId } });

    // Delete certificates
    await Certificate.destroy({ where: { userId } });

    // Delete notifications
    await Notification.destroy({ where: { [Op.or]: [{ recipientId: userId }, { senderId: userId }] } });

    // Delete user
    await user.destroy();

    return sendSuccess(res, 'Account successfully deleted. We are sorry to see you go.', {});
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's volunteer QR token
// @route   GET /api/users/me/qrcode
// @access  Private
const getMyQrCode = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findByPk(userId);
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    if (!user.qrToken) {
      const crypto = require('crypto');
      user.qrToken = crypto.randomUUID();
      await user.save();
    }

    return sendSuccess(res, 'QR code token retrieved.', {
      qrToken: user.qrToken,
      payload: user.qrToken,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  toggleFollowUser,
  getLeaderboard,
  searchUsers,
  deleteAccount,
  getMyQrCode,
};
