const { sequelize } = require('../config/db');
const User = require('./User');
const Event = require('./Event');
const Post = require('./Post');
const Comment = require('./Comment');
const EventRegistration = require('./EventRegistration');
const Certificate = require('./Certificate');
const Review = require('./Review');
const Report = require('./Report');
const Conversation = require('./Conversation');
const Message = require('./Message');
const Notification = require('./Notification');

// User <-> Event
User.hasMany(Event, { foreignKey: 'organizerId', as: 'organizedEvents' });
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

// User <-> Post
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Event Tag on Post
Event.hasMany(Post, { foreignKey: 'eventTagId', as: 'taggedPosts' });
Post.belongsTo(Event, { foreignKey: 'eventTagId', as: 'eventTag' });

// Post <-> Comment
Post.hasMany(Comment, { foreignKey: 'postId', as: 'commentsList' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Event <-> EventRegistration
Event.hasMany(EventRegistration, { foreignKey: 'eventId', as: 'registrations' });
EventRegistration.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

User.hasMany(EventRegistration, { foreignKey: 'userId', as: 'registrations' });
EventRegistration.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User/Event <-> Certificate
User.hasMany(Certificate, { foreignKey: 'userId', as: 'certificates' });
Certificate.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Event.hasMany(Certificate, { foreignKey: 'eventId', as: 'certificates' });
Certificate.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

Certificate.belongsTo(User, { foreignKey: 'organizationId', as: 'organization' });

// Event <-> Review
Event.hasMany(Review, { foreignKey: 'eventId', as: 'reviews' });
Review.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Report
User.hasMany(Report, { foreignKey: 'reporterId', as: 'reportsSent' });
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'resolvedById', as: 'resolvedBy' });

// Conversation <-> Message
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

// Notification
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// Auto-attach _id alias to toJSON for frontend compatibility
const models = { User, Event, Post, Comment, EventRegistration, Certificate, Review, Report, Conversation, Message, Notification };

Object.values(models).forEach((model) => {
  if (model && model.prototype) {
    const originalToJSON = model.prototype.toJSON;
    model.prototype.toJSON = function () {
      const values = originalToJSON ? originalToJSON.call(this) : { ...this.get() };
      if (values.id !== undefined && values._id === undefined) {
        values._id = values.id;
      }
      return values;
    };
  }
});

module.exports = {
  sequelize,
  User,
  Event,
  Post,
  Comment,
  EventRegistration,
  Certificate,
  Review,
  Report,
  Conversation,
  Message,
  Notification,
};

