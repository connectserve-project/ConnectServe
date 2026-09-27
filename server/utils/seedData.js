const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const EventRegistration = require('../models/EventRegistration');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Review = require('../models/Review');

dotenv.config();

/**
 * Clear all sample/demo data from the database.
 */
const seedData = async () => {
  try {
    console.log('[Data Reset] Connecting to database...');
    await connectDB();

    console.log('[Data Reset] Clearing all sample data from database collections...');
    await Promise.all([
      User.deleteMany(),
      Event.deleteMany(),
      Post.deleteMany(),
      Comment.deleteMany(),
      EventRegistration.deleteMany(),
      Certificate.deleteMany(),
      Notification.deleteMany(),
      Conversation.deleteMany(),
      Message.deleteMany(),
      Review.deleteMany(),
    ]);

    console.log('[Data Reset] Database reset complete. All sample data removed.');

    if (require.main === module) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Data Reset Error]', error);
    if (require.main === module) {
      await disconnectDB();
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
