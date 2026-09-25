const { Post, Comment, User, Notification, Report, Event } = require('../models');
const { Op } = require('sequelize');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { sendEventTaggedEmail } = require('../utils/emailService');

const findPostByIdOrMongoId = async (id, options = {}) => {
  if (typeof id === 'number' || !isNaN(Number(id))) {
    const found = await Post.findByPk(id, options);
    if (found) return found;
  }
  return await Post.findOne({ where: { mongoId: String(id) }, ...options });
};

// Helper to attach real-time comments count to post JSON objects
const populatePostCounts = async (postInstance) => {
  const postObj = typeof postInstance.toJSON === 'function' ? postInstance.toJSON() : { ...postInstance };
  const realCount = await Comment.count({ where: { postId: postObj.id } });
  postObj.commentsCount = realCount;
  return postObj;
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { content, eventTag, tags, location } = req.body;
    const userId = req.user.id || req.user._id;

    if (!content && !req.file) {
      return sendError(res, 'Post must have either text content or an image.', 400);
    }

    let media = { url: '', public_id: '', mediaType: 'none' };

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'connectserve/posts', {
        transformation: [{ width: 1200, crop: 'limit' }],
        mimetype: req.file.mimetype,
      });
      media = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        mediaType: 'image',
      };
    }

    const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

    const post = await Post.create({
      authorId: userId,
      content: content || '',
      media,
      eventTagId: eventTag ? Number(eventTag) || undefined : undefined,
      tags: parsedTags,
      location: location || '',
    });

    const populatedPostInstance = await Post.findByPk(post.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'role', 'orgDetails'] },
        { model: Event, as: 'eventTag', attributes: ['id', 'title', 'date', 'category', 'banner'] },
      ],
    });

    const populatedPost = await populatePostCounts(populatedPostInstance);

    if (post.eventTagId) {
      const taggedEvent = await Event.findByPk(post.eventTagId);
      if (taggedEvent) {
        const organizer = await User.findByPk(taggedEvent.organizerId);
        // Organisation-only: only send if the event owner is an 'organization'
        // and is not tagging their own event.
        if (organizer && organizer.role === 'organization' && String(organizer.id) !== String(userId)) {
          sendEventTaggedEmail(organizer, req.user, taggedEvent, populatedPost)
            .catch(err => console.error('[Email] Event tag email failed:', err.message));
        }
      }
    }

    // Emit live post to followers via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('new_public_post', populatedPost);
    }

    return sendSuccess(res, 'Post published successfully.', { post: populatedPost }, null, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get feed posts (supports scope=all or scope=following)
// @route   GET /api/posts or GET /api/posts/feed
// @access  Private for scope=following, Optional for scope=all
const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const scope = req.query.scope || 'all';
    const skip = (page - 1) * limit;

    let where = { isReported: false };

    if (scope === 'following') {
      const userId = req.user ? (req.user.id || req.user._id) : null;
      if (!userId) {
        return sendError(res, 'Authentication required for following feed.', 401);
      }

      const user = await User.findByPk(userId);
      const rawFollowing = user && Array.isArray(user.following) ? user.following : [];

      if (rawFollowing.length === 0) {
        return sendSuccess(res, 'Feed loaded successfully.', {
          posts: [],
          total: 0,
          page,
          pages: 0,
          hasMore: false,
        });
      }

      where.authorId = { [Op.in]: rawFollowing };
    }

    const { count: total, rows: posts } = await Post.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'role', 'orgDetails'] },
        { model: Event, as: 'eventTag', attributes: ['id', 'title', 'date', 'category', 'banner', 'location', 'hoursGranted'] },
      ],
      distinct: true,
    });

    const postsWithCounts = await Promise.all(posts.map(populatePostCounts));

    return sendSuccess(res, 'Feed loaded successfully.', {
      posts: postsWithCounts,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get explore / public posts
// @route   GET /api/posts/explore
// @access  Public
const getExplorePosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const { search } = req.query;
    const skip = (page - 1) * limit;

    const where = { isReported: false };

    if (search) {
      where.content = { [Op.like]: `%${search}%` };
    }
    if (req.query.eventId) {
      where.eventTagId = req.query.eventId;
    }

    const { count: total, rows: posts } = await Post.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'role', 'orgDetails'] },
        { model: Event, as: 'eventTag', attributes: ['id', 'title', 'date', 'category', 'banner', 'location'] },
      ],
      distinct: true,
    });

    const postsWithCounts = await Promise.all(posts.map(populatePostCounts));

    return sendSuccess(res, 'Explore posts loaded.', {
      posts: postsWithCounts,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID with comments
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res, next) => {
  try {
    const postInstance = await findPostByIdOrMongoId(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'role', 'orgDetails'] },
        { model: Event, as: 'eventTag', attributes: ['id', 'title', 'date', 'category', 'banner', 'location'] },
      ],
    });

    if (!postInstance) {
      return sendError(res, 'Post not found.', 404);
    }

    const post = await populatePostCounts(postInstance);

    const comments = await Comment.findAll({
      where: { postId: post.id },
      order: [['createdAt', 'ASC']],
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'role'] },
      ],
    });

    return sendSuccess(res, 'Post fetched.', { post, comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Like or Unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res, next) => {
  try {
    const post = await findPostByIdOrMongoId(req.params.id);
    if (!post) {
      return sendError(res, 'Post not found.', 404);
    }

    const userId = req.user.id || req.user._id;
    let likesList = Array.isArray(post.likes) ? [...post.likes] : [];
    const hasLiked = likesList.some(id => String(id) === String(userId));

    if (hasLiked) {
      likesList = likesList.filter(id => String(id) !== String(userId));
      post.likes = likesList;
      await post.save();
      return sendSuccess(res, 'Post unliked.', { isLiked: false, likesCount: post.likes.length });
    } else {
      likesList.push(userId);
      post.likes = likesList;
      await post.save();

      // Send notification to post author if not self
      if (String(post.authorId) !== String(userId)) {
        const notification = await Notification.create({
          recipientId: post.authorId,
          senderId: userId,
          type: 'like',
          title: 'New Like',
          message: `${req.user.name} liked your post.`,
          entityId: post.id,
          entityType: 'post',
          link: `/posts/${post.id}`,
        });

        const io = req.app.get('io');
        if (io) {
          io.to(`user:${post.authorId}`).emit('notification', notification);
        }
      }

      return sendSuccess(res, 'Post liked.', { isLiked: true, likesCount: post.likes.length });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return sendError(res, 'Comment text is required.', 400);
    }

    const post = await findPostByIdOrMongoId(req.params.id);
    if (!post) {
      return sendError(res, 'Post not found.', 404);
    }

    const userId = req.user.id || req.user._id;

    const comment = await Comment.create({
      postId: post.id,
      authorId: userId,
      content: content.trim(),
    });

    const realCount = await Comment.count({ where: { postId: post.id } });
    post.commentsCount = realCount;
    await post.save();

    const populatedComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'role'] }],
    });

    // Notify author if not self
    if (String(post.authorId) !== String(userId)) {
      const notification = await Notification.create({
        recipientId: post.authorId,
        senderId: userId,
        type: 'comment',
        title: 'New Comment',
        message: `${req.user.name} commented: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
        entityId: post.id,
        entityType: 'post',
        link: `/posts/${post.id}`,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${post.authorId}`).emit('notification', notification);
      }
    }

    return sendSuccess(res, 'Comment added.', { comment: populatedComment }, null, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return sendError(res, 'Comment not found.', 404);
    }

    const userId = req.user.id || req.user._id;

    // Only author or admin can delete
    if (String(comment.authorId) !== String(userId) && req.user.role !== 'admin') {
      return sendError(res, 'You are not authorized to delete this comment.', 403);
    }

    await comment.destroy();

    const post = await findPostByIdOrMongoId(postId);
    if (post) {
      const realCount = await Comment.count({ where: { postId: post.id } });
      post.commentsCount = realCount;
      await post.save();
    }

    return sendSuccess(res, 'Comment deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await findPostByIdOrMongoId(req.params.id);
    if (!post) {
      return sendError(res, 'Post not found.', 404);
    }

    const userId = req.user.id || req.user._id;

    // Check authorization: author or admin
    if (String(post.authorId) !== String(userId) && req.user.role !== 'admin') {
      return sendError(res, 'You are not authorized to delete this post.', 403);
    }

    // Delete image from Cloudinary if exists
    if (post.media?.public_id) {
      await deleteFromCloudinary(post.media.public_id);
    }

    // Delete comments
    await Comment.destroy({ where: { postId: post.id } });

    // Delete post
    await post.destroy();

    return sendSuccess(res, 'Post deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Share / Increment share count
// @route   POST /api/posts/:id/share
// @access  Private
const sharePost = async (req, res, next) => {
  try {
    const post = await findPostByIdOrMongoId(req.params.id);
    if (!post) {
      return sendError(res, 'Post not found.', 404);
    }
    post.sharesCount = (post.sharesCount || 0) + 1;
    await post.save();
    return sendSuccess(res, 'Post shared.', { sharesCount: post.sharesCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Report post for moderation
// @route   POST /api/posts/:id/report
// @access  Private
const reportPost = async (req, res, next) => {
  try {
    const { reason, details } = req.body;
    const post = await findPostByIdOrMongoId(req.params.id);
    if (!post) {
      return sendError(res, 'Post not found.', 404);
    }

    const userId = req.user.id || req.user._id;

    const report = await Report.create({
      reporterId: userId,
      targetType: 'post',
      targetId: post.id,
      reason: reason || 'inappropriate_content',
      details: details || '',
    });

    post.reportsCount = (post.reportsCount || 0) + 1;
    if (post.reportsCount >= 3) {
      post.isReported = true;
    }
    await post.save();

    return sendSuccess(res, 'Report submitted for review.', { report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getFeed,
  getExplorePosts,
  getPostById,
  toggleLikePost,
  addComment,
  deleteComment,
  deletePost,
  sharePost,
  reportPost,
};
