const { Conversation, Message, User } = require('../models');
const { Op } = require('sequelize');
const { uploadToCloudinary } = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const findConversationByIdOrMongoId = async (id, options = {}) => {
  if (typeof id === 'number' || !isNaN(Number(id))) {
    const conv = await Conversation.findByPk(id, options);
    if (conv) return conv;
  }
  return await Conversation.findOne({ where: { mongoId: String(id) }, ...options });
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
      return parts.some((p) => String(p) === String(userId));
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
        return convObj;
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
      recipient = await User.findOne({ where: { mongoId: String(recipientId) } });
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

    const conversation = await findConversationByIdOrMongoId(id);

    if (!conversation) {
      return sendError(res, 'Conversation not found or unauthorized.', 404);
    }

    const parts = Array.isArray(conversation.participants) ? conversation.participants.map(p => String(p)) : [];
    if (!parts.includes(String(userId))) {
      return sendError(res, 'Unauthorized access to conversation.', 403);
    }

    const messages = await Message.findAll({
      where: { conversationId: conversation.id },
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
    const { text, recipientId } = req.body;
    const userId = req.user.id || req.user._id;

    if (!text && !req.file) {
      return sendError(res, 'Message text or attachment is required.', 400);
    }

    const conversation = await findConversationByIdOrMongoId(id);

    if (!conversation) {
      return sendError(res, 'Conversation not found.', 404);
    }

    const parts = Array.isArray(conversation.participants) ? conversation.participants.map(p => String(p)) : [];
    const otherParticipantId = parts.find(p => p !== String(userId)) || recipientId;

    let media = { url: '', public_id: '' };
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'connectserve/chat', {
        transformation: [{ width: 800, crop: 'limit' }],
        mimetype: req.file.mimetype,
      });
      media = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    const message = await Message.create({
      conversationId: conversation.id,
      senderId: userId,
      recipientId: Number(otherParticipantId) || otherParticipantId,
      text: text || (media.url ? 'Sent an attachment' : ''),
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
      io.to(`conversation:${conversation.id}`).emit('new_message', populatedMessage);
      io.to(`user:${otherParticipantId}`).emit('direct_message_alert', {
        conversationId: conversation.id,
        sender: req.user,
        message: populatedMessage,
      });
    }

    return sendSuccess(res, 'Message sent.', { message: populatedMessage }, null, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
};
