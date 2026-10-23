const { Conversation, Message, User, Report } = require('../models');
const { Op } = require('sequelize');
const { uploadToCloudinary, cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const findConversationById = async (id, options = {}) => {
  if (typeof id === 'number' || !isNaN(Number(id))) {
    const conv = await Conversation.findByPk(id, options);
    if (conv) return conv;
  }
  return null;
};

const getParticipantIds = (conv) =>
  Array.isArray(conv.participants) ? conv.participants.map((p) => String(p)) : [];
const getBlockedBy = (conv) =>
  Array.isArray(conv.blockedBy) ? conv.blockedBy.map((b) => String(b)) : [];
// When this user deleted the chat (null if they never did)
const getDeletedAt = (conv, userId) => {
  const d = conv.deletedBy && typeof conv.deletedBy === 'object' ? conv.deletedBy[String(userId)] : null;
  return d ? new Date(d) : null;
};

// Adds per-user block flags and strips the raw bookkeeping fields before sending to the client
const decorateConversation = (convObj, conv, userId) => {
  const blocked = getBlockedBy(conv);
  convObj.isBlockedByMe = blocked.includes(String(userId));
  convObj.isBlockedByOther = blocked.some((b) => b !== String(userId));
  delete convObj.blockedBy;
  delete convObj.deletedBy;
  return convObj;
};

const loadParticipantUser = (conv, userId) => {
  const parts = getParticipantIds(conv);
  return parts.includes(String(userId));
};

const notifyBlockChange = (req, conv, userId) => {
  const io = req.app.get('io');
  if (!io) return;
  const other = getParticipantIds(conv).find((p) => p !== String(userId));
  if (other) {
    io.to(`user:${other}`).emit('conversation_block_changed', { conversationId: conv.id });
  }
};


// ---------------------------------------------------------------------------
// Chat attachments (Photo / Video / Document) - uploaded straight from the
// browser to Cloudinary, so large files never pass through the server.
// ---------------------------------------------------------------------------
const MB = 1024 * 1024;
const ATTACHMENT_LIMITS = {
  image: 50 * MB,
  video: 100 * MB,
  document: 500 * MB,
};
const CHAT_UPLOAD_FOLDER = 'connectserve/chat';
const CLOUDINARY_RESOURCE_TYPE = { image: 'image', video: 'video', document: 'raw' };

// Cloudinary rejects signatures whose timestamp is more than 1 hour off its own clock
// ("Stale request"). If the server machine's clock is wrong, use Cloudinary's time instead.
let clockOffsetMs = 0;
let clockCheckedAt = 0;
const syncClockWithCloudinary = () =>
  new Promise((resolve) => {
    if (Date.now() - clockCheckedAt < 10 * 60 * 1000) return resolve();
    const https = require('https');
    const req = https.request(
      { method: 'HEAD', host: 'api.cloudinary.com', path: '/', timeout: 4000 },
      (res) => {
        const serverTime = Date.parse(res.headers.date);
        if (!Number.isNaN(serverTime)) {
          clockOffsetMs = serverTime - Date.now();
          clockCheckedAt = Date.now();
        }
        res.resume();
        resolve();
      }
    );
    req.on('timeout', () => { req.destroy(); resolve(); });
    req.on('error', () => resolve());
    req.end();
  });

// @desc    Get a signed upload payload so the browser can upload directly to Cloudinary
// @route   POST /api/chat/upload-signature
// @access  Private
const getUploadSignature = async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured()) {
      return sendError(res, 'File uploads are not configured on the server (Cloudinary).', 503);
    }

    const { type, size } = req.body;
    if (!ATTACHMENT_LIMITS[type]) {
      return sendError(res, 'Invalid attachment type.', 400);
    }
    if (Number(size) > ATTACHMENT_LIMITS[type]) {
      return sendError(
        res,
        `${type.charAt(0).toUpperCase() + type.slice(1)} must be smaller than ${ATTACHMENT_LIMITS[type] / MB} MB.`,
        400
      );
    }

    await syncClockWithCloudinary();
    const timestamp = Math.round((Date.now() + clockOffsetMs) / 1000);
    const paramsToSign = { folder: CHAT_UPLOAD_FOLDER, timestamp };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

    return sendSuccess(res, 'Upload signature created.', {
      signature,
      timestamp,
      folder: CHAT_UPLOAD_FOLDER,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      resourceType: CLOUDINARY_RESOURCE_TYPE[type],
    });
  } catch (error) {
    next(error);
  }
};

// Validates the attachment metadata the client sends after a direct Cloudinary upload
const sanitizeAttachment = (att) => {
  if (!att || typeof att !== 'object') return null;
  const type = att.type;
  if (!ATTACHMENT_LIMITS[type]) return null;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const url = String(att.url || '');
  const publicId = String(att.public_id || '');
  // Only accept files that really live in our Cloudinary chat folder
  if (!url.startsWith(`https://res.cloudinary.com/${cloudName}/`)) return null;
  if (!publicId.startsWith(`${CHAT_UPLOAD_FOLDER}/`)) return null;

  const bytes = Number(att.size) || 0;
  if (bytes > ATTACHMENT_LIMITS[type]) return null;

  return {
    url,
    public_id: publicId,
    type,
    name: String(att.name || 'file').slice(0, 200),
    size: bytes,
  };
};

const attachmentPreviewText = (media) => {
  if (!media || !media.url) return '';
  if (media.type === 'video') return '🎥 Video';
  if (media.type === 'document') return `📄 ${media.name || 'Document'}`;
  return '📷 Photo';
};

// @desc    Get all active conversations for current user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const allConversations = await Conversation.findAll({
      order: [['lastMessageAt', 'DESC']],
    });

    // Filter conversations where user is a participant
    const userConversations = allConversations.filter((c) => {
      const parts = Array.isArray(c.participants) ? c.participants : [];
      if (!parts.some((p) => String(p) === String(userId))) return false;
      // Hide chats this user deleted, until a newer message arrives
      const deletedAt = getDeletedAt(c, userId);
      if (deletedAt && new Date(c.lastMessageAt) <= deletedAt) return false;
      return true;
    });

    // Populate participants and lastMessage manually for rich response
    const populatedConversations = await Promise.all(
      userConversations.map(async (conv) => {
        const convObj = conv.toJSON();
        const participantIds = Array.isArray(conv.participants) ? conv.participants : [];
        
        const participantUsers = await User.findAll({
          where: { id: { [Op.in]: participantIds } },
          attributes: ['id', 'name', 'username', 'avatar', 'role', 'orgDetails'],
        });
        convObj.participants = participantUsers;

        if (conv.lastMessageId) {
          convObj.lastMessage = await Message.findByPk(conv.lastMessageId);
        }
        return decorateConversation(convObj, conv, userId);
      })
    );

    return sendSuccess(res, 'Conversations retrieved.', { conversations: populatedConversations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or Create conversation with another user
// @route   POST /api/chat/conversations
// @access  Private
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user.id || req.user._id;

    if (!recipientId) {
      return sendError(res, 'Recipient ID is required.', 400);
    }

    if (String(recipientId) === String(currentUserId)) {
      return sendError(res, 'Cannot start a chat with yourself.', 400);
    }

    let recipient = null;
    if (typeof recipientId === 'number' || !isNaN(Number(recipientId))) {
      recipient = await User.findByPk(recipientId);
    }

    if (!recipient) {
      return sendError(res, 'Recipient not found.', 404);
    }

    const allConversations = await Conversation.findAll();
    let conversation = allConversations.find((c) => {
      const parts = Array.isArray(c.participants) ? c.participants.map(p => String(p)) : [];
      return parts.length === 2 && parts.includes(String(currentUserId)) && parts.includes(String(recipient.id));
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, recipient.id],
        lastMessageText: '',
      });
    }

    const convObj = conversation.toJSON();
    convObj.participants = await User.findAll({
      where: { id: { [Op.in]: [currentUserId, recipient.id] } },
      attributes: ['id', 'name', 'username', 'avatar', 'role', 'orgDetails'],
    });

    if (conversation.lastMessageId) {
      convObj.lastMessage = await Message.findByPk(conversation.lastMessageId);
    }

    decorateConversation(convObj, conversation, currentUserId);
    return sendSuccess(res, 'Conversation ready.', { conversation: convObj });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const conversation = await findConversationById(id);

    if (!conversation) {
      return sendError(res, 'Conversation not found or unauthorized.', 404);
    }

    const parts = Array.isArray(conversation.participants) ? conversation.participants.map(p => String(p)) : [];
    if (!parts.includes(String(userId))) {
      return sendError(res, 'Unauthorized access to conversation.', 403);
    }

    const messageWhere = { conversationId: conversation.id };
    const deletedAt = getDeletedAt(conversation, userId);
    if (deletedAt) messageWhere.createdAt = { [Op.gt]: deletedAt };

    const messages = await Message.findAll({
      where: messageWhere,
      order: [['createdAt', 'ASC']],
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'username', 'avatar'] }],
    });

    // Mark messages from other participant as read
    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          conversationId: conversation.id,
          recipientId: userId,
          isRead: false,
        },
      }
    );

    return sendSuccess(res, 'Messages loaded.', { messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, recipientId, attachment } = req.body;
    const userId = req.user.id || req.user._id;

    if (!text && !req.file && !attachment) {
      return sendError(res, 'Message text or attachment is required.', 400);
    }

    const conversation = await findConversationById(id);

    if (!conversation) {
      return sendError(res, 'Conversation not found.', 404);
    }

    const parts = Array.isArray(conversation.participants) ? conversation.participants.map(p => String(p)) : [];
    if (!parts.includes(String(userId))) {
      return sendError(res, 'Unauthorized access to conversation.', 403);
    }
    const otherParticipantId = parts.find(p => p !== String(userId)) || recipientId;

    // Blocked conversation: nobody can send until the blocker unblocks
    const blockedBy = getBlockedBy(conversation);
    if (blockedBy.length > 0) {
      const iBlocked = blockedBy.includes(String(userId));
      return sendError(
        res,
        iBlocked
          ? 'You blocked this user. Unblock to send messages.'
          : "You can't send messages in this conversation.",
        403
      );
    }

    let media = { url: '', public_id: '' };
    if (attachment) {
      // Direct-to-Cloudinary upload (photo / video / document)
      const clean = sanitizeAttachment(attachment);
      if (!clean) {
        return sendError(res, 'Invalid attachment.', 400);
      }
      media = clean;
    } else if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'connectserve/chat', {
        transformation: [{ width: 800, crop: 'limit' }],
        mimetype: req.file.mimetype,
      });
      media = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        type: 'image',
        name: req.file.originalname || 'image',
        size: req.file.size || 0,
      };
    }

    const message = await Message.create({
      conversationId: conversation.id,
      senderId: userId,
      recipientId: Number(otherParticipantId) || otherParticipantId,
      text: text || attachmentPreviewText(media),
      media,
    });

    conversation.lastMessageId = message.id;
    conversation.lastMessageText = message.text;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findByPk(message.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'username', 'avatar'] }],
    });

    // Emit live message to Socket.IO room
    const io = req.app.get('io');
    if (io) {
      const livePayload = { ...populatedMessage.toJSON(), conversation: conversation.id };
      // Deliver to the conversation room plus both users' personal rooms.
      // Passing an array makes Socket.IO send once per socket (no duplicates),
      // so the message arrives in real time even if a room join was missed.
      io.to([
        `conversation:${conversation.id}`,
        `user:${userId}`,
        `user:${otherParticipantId}`,
      ]).emit('new_message', livePayload);
      io.to(`user:${otherParticipantId}`).emit('direct_message_alert', {
        conversationId: conversation.id,
        sender: {
          _id: req.user.id,
          id: req.user.id,
          name: req.user.name,
          username: req.user.username,
          avatar: req.user.avatar,
        },
        message: livePayload,
      });
    }

    return sendSuccess(res, 'Message sent.', { message: populatedMessage }, null, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a chat (hidden for the current user only; the other person keeps their copy)
// @route   DELETE /api/chat/conversations/:id
// @access  Private
const deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const conversation = await findConversationById(req.params.id);
    if (!conversation) return sendError(res, 'Conversation not found.', 404);
    if (!loadParticipantUser(conversation, userId)) {
      return sendError(res, 'Unauthorized access to conversation.', 403);
    }

    conversation.deletedBy = {
      ...(conversation.deletedBy && typeof conversation.deletedBy === 'object' ? conversation.deletedBy : {}),
      [String(userId)]: new Date().toISOString(),
    };
    await conversation.save();

    return sendSuccess(res, 'Chat deleted.', { conversationId: conversation.id });
  } catch (error) {
    next(error);
  }
};

const setBlockState = async (req, res, next, shouldBlock) => {
  try {
    const userId = req.user.id || req.user._id;
    const conversation = await findConversationById(req.params.id);
    if (!conversation) return sendError(res, 'Conversation not found.', 404);
    if (!loadParticipantUser(conversation, userId)) {
      return sendError(res, 'Unauthorized access to conversation.', 403);
    }

    const current = getBlockedBy(conversation);
    const me = String(userId);
    conversation.blockedBy = shouldBlock
      ? Array.from(new Set([...current, me]))
      : current.filter((b) => b !== me);
    await conversation.save();

    notifyBlockChange(req, conversation, userId);

    const convObj = decorateConversation(conversation.toJSON(), conversation, userId);
    return sendSuccess(res, shouldBlock ? 'User blocked.' : 'User unblocked.', { conversation: convObj });
  } catch (error) {
    next(error);
  }
};

// @desc    Block the other user in a conversation (no messages either way)
// @route   POST /api/chat/conversations/:id/block
// @access  Private
const blockUser = (req, res, next) => setBlockState(req, res, next, true);

// @desc    Unblock the other user in a conversation
// @route   DELETE /api/chat/conversations/:id/block
// @access  Private
const unblockUser = (req, res, next) => setBlockState(req, res, next, false);

// @desc    Report the other user in a conversation to the admins
// @route   POST /api/chat/conversations/:id/report
// @access  Private
const reportUser = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { reason, details } = req.body;

    if (!reason || !String(reason).trim()) {
      return sendError(res, 'Please select a reason for the report.', 400);
    }

    const conversation = await findConversationById(req.params.id);
    if (!conversation) return sendError(res, 'Conversation not found.', 404);
    if (!loadParticipantUser(conversation, userId)) {
      return sendError(res, 'Unauthorized access to conversation.', 403);
    }

    const otherId = getParticipantIds(conversation).find((p) => p !== String(userId));
    if (!otherId) return sendError(res, 'No user to report in this conversation.', 400);

    const existing = await Report.findOne({
      where: {
        reporterId: userId,
        targetType: 'user',
        targetId: String(otherId),
        conversationId: conversation.id,
        status: 'pending',
      },
    });
    if (existing) {
      return sendError(res, 'You have already reported this user. Admins are reviewing it.', 400);
    }

    const report = await Report.create({
      reporterId: userId,
      targetType: 'user',
      targetId: String(otherId),
      conversationId: conversation.id,
      reason: String(reason).trim().slice(0, 100),
      details: details ? String(details).trim().slice(0, 500) : '',
    });

    return sendSuccess(res, 'Report submitted. Our admins will review this chat.', { report }, null, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  deleteConversation,
  blockUser,
  unblockUser,
  reportUser,
  getUploadSignature,
};
