const dotenv = require('dotenv');
const path = require('path');
const { Op } = require('sequelize');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const { connectDB } = require('./config/db');
const User = require('./models/User');
const Notification = require('./models/Notification');
const EventRegistration = require('./models/EventRegistration');
const Certificate = require('./models/Certificate');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const Review = require('./models/Review');

const hardDeleteSampleVolunteers = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    const usernames = ['aarav_sharma', 'ananya_v', 'rohan_g', 'priya_patel'];
    
    const users = await User.findAll({
      where: {
        username: {
          [Op.in]: usernames
        }
      }
    });

    if (users.length === 0) {
      console.log('No mock users found to delete.');
      process.exit(0);
    }

    const userIds = users.map(u => u.id);
    console.log(`Found ${userIds.length} mock users. Deleting associated records...`);

    // Delete Notifications
    if (Notification) {
      await Notification.destroy({ where: { recipientId: { [Op.in]: userIds } } });
      await Notification.destroy({ where: { senderId: { [Op.in]: userIds } } });
    }

    // Delete EventRegistrations
    if (EventRegistration) {
      await EventRegistration.destroy({ where: { userId: { [Op.in]: userIds } } });
    }

    // Delete Certificates
    if (Certificate) {
      await Certificate.destroy({ where: { userId: { [Op.in]: userIds } } });
    }

    // Delete Comments
    if (Comment) {
      await Comment.destroy({ where: { authorId: { [Op.in]: userIds } } });
    }

    // Delete Posts
    if (Post) {
      await Post.destroy({ where: { authorId: { [Op.in]: userIds } } });
    }

    // Delete Messages
    if (Message) {
      await Message.destroy({ where: { senderId: { [Op.in]: userIds } } });
      await Message.destroy({ where: { receiverId: { [Op.in]: userIds } } });
    }

    // Delete Reviews
    if (Review) {
      await Review.destroy({ where: { reviewerId: { [Op.in]: userIds } } });
      await Review.destroy({ where: { revieweeId: { [Op.in]: userIds } } });
    }

    // Finally delete the users
    const deletedCount = await User.destroy({
      where: {
        id: {
          [Op.in]: userIds
        }
      }
    });

    console.log(`Successfully hard deleted ${deletedCount} mock users and their associated records.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error deleting sample volunteers:', error);
    process.exit(1);
  }
};

hardDeleteSampleVolunteers();
