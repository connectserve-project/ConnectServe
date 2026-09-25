const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { MongoClient } = require('mongodb');
const {
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
} = require('../models');

async function runMigration() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set in .env file!');
    process.exit(1);
  }

  console.log('🚀 Starting Data Migration: MongoDB Atlas -> Supabase PostgreSQL...');
  console.log(`📡 Connecting to MongoDB Atlas...`);
  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const mongoDb = mongoClient.db();
  console.log('✅ Connected to MongoDB Atlas successfully.');

  console.log('📡 Authenticating and syncing Supabase PostgreSQL tables...');
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  console.log('✅ Supabase PostgreSQL tables created/resynced successfully.');


  const idMap = {}; // Maps mongo ObjectId string -> MySQL integer primary key

  // 1. Migrate Users
  const rawUsers = await mongoDb.collection('users').find({}).toArray();
  console.log(`\n📦 Migrating ${rawUsers.length} Users...`);
  for (const doc of rawUsers) {
    const mongoIdStr = doc._id.toString();
    const createdUser = await User.create({
      mongoId: mongoIdStr,
      name: doc.name || 'User',
      username: doc.username || null,
      email: doc.email,
      password: doc.password || 'password123',
      role: doc.role || 'user',
      avatar: doc.avatar || { url: '', public_id: '' },
      banner: doc.banner || { url: '', public_id: '' },
      bio: doc.bio || '',
      gender: doc.gender || '',
      institution: doc.institution || '',
      countryCode: doc.countryCode || '+91',
      mobileNumber: doc.mobileNumber || '',
      location: doc.location || '',
      state: doc.state || '',
      country: doc.country || '',
      pincode: doc.pincode || '',
      skills: doc.skills || [],
      interests: doc.interests || [],
      socialLinks: doc.socialLinks || {},
      orgDetails: doc.orgDetails || {},
      volunteerHours: doc.volunteerHours || 0,
      badges: doc.badges || [],
      followers: (doc.followers || []).map(f => f.toString()),
      following: (doc.following || []).map(f => f.toString()),
      isActive: doc.isActive !== false,
      isBanned: doc.isBanned === true,
      resetPasswordToken: doc.resetPasswordToken || null,
      resetPasswordExpire: doc.resetPasswordExpire || null,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    });
    idMap[mongoIdStr] = createdUser.id;
  }
  console.log(`✅ Migrated ${rawUsers.length} Users.`);

  // 2. Migrate Events
  const rawEvents = await mongoDb.collection('events').find({}).toArray();
  console.log(`\n📦 Migrating ${rawEvents.length} Events...`);
  for (const doc of rawEvents) {
    const mongoIdStr = doc._id.toString();
    const organizerMongoId = doc.organizer ? doc.organizer.toString() : null;
    const organizerId = idMap[organizerMongoId] || 1;

    const createdEvent = await Event.create({
      mongoId: mongoIdStr,
      organizerId,
      title: doc.title,
      description: doc.description,
      category: doc.category || 'Community Development',
      date: doc.date,
      endDate: doc.endDate || null,
      time: doc.time || '09:00 AM - 01:00 PM',
      location: doc.location,
      locationType: doc.locationType || 'in-person',
      volunteerSlots: doc.volunteerSlots || 20,
      registeredCount: doc.registeredCount || 0,
      hoursGranted: doc.hoursGranted || 4,
      banner: doc.banner || { url: '', public_id: '' },
      requirements: doc.requirements || [],
      skillsNeeded: doc.skillsNeeded || [],
      status: doc.status || 'upcoming',
      averageRating: doc.averageRating || 0,
      totalRatings: doc.totalRatings || 0,
      isFeatured: doc.isFeatured === true,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    });
    idMap[mongoIdStr] = createdEvent.id;
  }
  console.log(`✅ Migrated ${rawEvents.length} Events.`);

  // 3. Migrate Posts
  const rawPosts = await mongoDb.collection('posts').find({}).toArray();
  console.log(`\n📦 Migrating ${rawPosts.length} Posts...`);
  for (const doc of rawPosts) {
    const mongoIdStr = doc._id.toString();
    const authorMongoId = doc.author ? doc.author.toString() : null;
    const authorId = idMap[authorMongoId] || 1;

    const eventTagMongoId = doc.eventTag ? doc.eventTag.toString() : null;
    const eventTagId = eventTagMongoId ? idMap[eventTagMongoId] || null : null;

    const createdPost = await Post.create({
      mongoId: mongoIdStr,
      authorId,
      content: doc.content,
      media: doc.media || { url: '', public_id: '', mediaType: 'none' },
      likes: (doc.likes || []).map(l => l.toString()),
      commentsCount: doc.commentsCount || 0,
      sharesCount: doc.sharesCount || 0,
      eventTagId,
      tags: doc.tags || [],
      location: doc.location || '',
      isReported: doc.isReported === true,
      reportsCount: doc.reportsCount || 0,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    });
    idMap[mongoIdStr] = createdPost.id;
  }
  console.log(`✅ Migrated ${rawPosts.length} Posts.`);

  // 4. Migrate Comments
  const rawComments = await mongoDb.collection('comments').find({}).toArray();
  console.log(`\n📦 Migrating ${rawComments.length} Comments...`);
  for (const doc of rawComments) {
    const mongoIdStr = doc._id.toString();
    const postMongoId = doc.post ? doc.post.toString() : null;
    const postId = idMap[postMongoId];
    const authorMongoId = doc.author ? doc.author.toString() : null;
    const authorId = idMap[authorMongoId] || 1;

    if (postId) {
      const createdComment = await Comment.create({
        mongoId: mongoIdStr,
        postId,
        authorId,
        content: doc.content,
        likes: (doc.likes || []).map(l => l.toString()),
        isReported: doc.isReported === true,
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.updatedAt || new Date(),
      });
      idMap[mongoIdStr] = createdComment.id;
    }
  }
  console.log(`✅ Migrated ${rawComments.length} Comments.`);

  // 5. Migrate Event Registrations
  const rawRegistrations = await mongoDb.collection('eventregistrations').find({}).toArray();
  console.log(`\n📦 Migrating ${rawRegistrations.length} Event Registrations...`);
  for (const doc of rawRegistrations) {
    const mongoIdStr = doc._id.toString();
    const eventMongoId = doc.event ? doc.event.toString() : null;
    const eventId = idMap[eventMongoId];
    const userMongoId = doc.user ? doc.user.toString() : null;
    const userId = idMap[userMongoId];

    if (eventId && userId) {
      const createdReg = await EventRegistration.create({
        mongoId: mongoIdStr,
        eventId,
        userId,
        status: doc.status || 'pending',
        attended: doc.attended === true,
        hoursLogged: doc.hoursLogged || 0,
        notes: doc.notes || '',
        appliedAt: doc.appliedAt || doc.createdAt || new Date(),
        statusUpdatedAt: doc.statusUpdatedAt || null,
        attendanceMarkedAt: doc.attendanceMarkedAt || null,
        certificateIssued: doc.certificateIssued === true,
        reviewGiven: doc.reviewGiven === true,
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.updatedAt || new Date(),
      });
      idMap[mongoIdStr] = createdReg.id;
    }
  }
  console.log(`✅ Migrated ${rawRegistrations.length} Event Registrations.`);

  // 6. Migrate Certificates
  const rawCerts = await mongoDb.collection('certificates').find({}).toArray();
  console.log(`\n📦 Migrating ${rawCerts.length} Certificates...`);
  for (const doc of rawCerts) {
    const mongoIdStr = doc._id.toString();
    const userMongoId = doc.user ? doc.user.toString() : null;
    const userId = idMap[userMongoId] || 1;
    const eventMongoId = doc.event ? doc.event.toString() : null;
    const eventId = idMap[eventMongoId] || 1;
    const orgMongoId = doc.organization ? doc.organization.toString() : null;
    const organizationId = idMap[orgMongoId] || 1;

    const createdCert = await Certificate.create({
      mongoId: mongoIdStr,
      certificateCode: doc.certificateCode,
      userId,
      eventId,
      organizationId,
      volunteerName: doc.volunteerName,
      eventTitle: doc.eventTitle,
      organizationName: doc.organizationName,
      hours: doc.hours || 0,
      issueDate: doc.issueDate || doc.createdAt || new Date(),
      badgeAwarded: doc.badgeAwarded || 'Community Service Certificate',
      pdfUrl: doc.pdfUrl || { url: '', public_id: '' },
      isRevoked: doc.isRevoked === true,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    });
    idMap[mongoIdStr] = createdCert.id;
  }
  console.log(`✅ Migrated ${rawCerts.length} Certificates.`);

  // 7. Migrate Reviews
  const rawReviews = await mongoDb.collection('reviews').find({}).toArray();
  console.log(`\n📦 Migrating ${rawReviews.length} Reviews...`);
  for (const doc of rawReviews) {
    const mongoIdStr = doc._id.toString();
    const eventMongoId = doc.event ? doc.event.toString() : null;
    const eventId = idMap[eventMongoId];
    const userMongoId = doc.user ? doc.user.toString() : null;
    const userId = idMap[userMongoId];

    if (eventId && userId) {
      const createdReview = await Review.create({
        mongoId: mongoIdStr,
        eventId,
        userId,
        rating: doc.rating,
        comment: doc.comment,
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.updatedAt || new Date(),
      });
      idMap[mongoIdStr] = createdReview.id;
    }
  }
  console.log(`✅ Migrated ${rawReviews.length} Reviews.`);

  // 8. Migrate Reports
  const rawReports = await mongoDb.collection('reports').find({}).toArray();
  console.log(`\n📦 Migrating ${rawReports.length} Reports...`);
  for (const doc of rawReports) {
    const mongoIdStr = doc._id.toString();
    const reporterMongoId = doc.reporter ? doc.reporter.toString() : null;
    const reporterId = idMap[reporterMongoId] || 1;
    const resolvedByMongoId = doc.resolvedBy ? doc.resolvedBy.toString() : null;
    const resolvedById = resolvedByMongoId ? idMap[resolvedByMongoId] || null : null;

    const createdReport = await Report.create({
      mongoId: mongoIdStr,
      reporterId,
      targetType: doc.targetType,
      targetId: doc.targetId ? doc.targetId.toString() : '',
      reason: doc.reason,
      details: doc.details || '',
      status: doc.status || 'pending',
      resolutionNotes: doc.resolutionNotes || '',
      resolvedById,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    });
    idMap[mongoIdStr] = createdReport.id;
  }
  console.log(`✅ Migrated ${rawReports.length} Reports.`);

  // 9. Migrate Conversations
  const rawConversations = await mongoDb.collection('conversations').find({}).toArray();
  console.log(`\n📦 Migrating ${rawConversations.length} Conversations...`);
  for (const doc of rawConversations) {
    const mongoIdStr = doc._id.toString();
    const createdConv = await Conversation.create({
      mongoId: mongoIdStr,
      participants: (doc.participants || []).map(p => p.toString()),
      lastMessageText: doc.lastMessageText || '',
      lastMessageAt: doc.lastMessageAt || new Date(),
      unreadCounts: doc.unreadCounts || {},
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    });
    idMap[mongoIdStr] = createdConv.id;
  }
  console.log(`✅ Migrated ${rawConversations.length} Conversations.`);

  // 10. Migrate Messages
  const rawMessages = await mongoDb.collection('messages').find({}).toArray();
  console.log(`\n📦 Migrating ${rawMessages.length} Messages...`);
  for (const doc of rawMessages) {
    const mongoIdStr = doc._id.toString();
    const convMongoId = doc.conversation ? doc.conversation.toString() : null;
    const conversationId = idMap[convMongoId];
    const senderMongoId = doc.sender ? doc.sender.toString() : null;
    const senderId = idMap[senderMongoId] || 1;
    const recipientMongoId = doc.recipient ? doc.recipient.toString() : null;
    const recipientId = idMap[recipientMongoId] || 1;

    if (conversationId) {
      const createdMsg = await Message.create({
        mongoId: mongoIdStr,
        conversationId,
        senderId,
        recipientId,
        text: doc.text,
        media: doc.media || { url: '', public_id: '' },
        isRead: doc.isRead === true,
        readAt: doc.readAt || null,
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.updatedAt || new Date(),
      });
      idMap[mongoIdStr] = createdMsg.id;
    }
  }
  console.log(`✅ Migrated ${rawMessages.length} Messages.`);

  // 11. Migrate Notifications
  const rawNotifications = await mongoDb.collection('notifications').find({}).toArray();
  console.log(`\n📦 Migrating ${rawNotifications.length} Notifications...`);
  for (const doc of rawNotifications) {
    const mongoIdStr = doc._id.toString();
    const recipientMongoId = doc.recipient ? doc.recipient.toString() : null;
    const recipientId = idMap[recipientMongoId] || 1;
    const senderMongoId = doc.sender ? doc.sender.toString() : null;
    const senderId = senderMongoId ? idMap[senderMongoId] || null : null;

    const createdNotif = await Notification.create({
      mongoId: mongoIdStr,
      recipientId,
      senderId,
      type: doc.type,
      title: doc.title || '',
      message: doc.message || '',
      entityId: doc.entityId ? doc.entityId.toString() : null,
      entityType: doc.entityType || null,
      link: doc.link || '',
      isRead: doc.isRead === true,
      readAt: doc.readAt || null,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    });
    idMap[mongoIdStr] = createdNotif.id;
  }
  console.log(`✅ Migrated ${rawNotifications.length} Notifications.`);

  await mongoClient.close();

  // Final Audit Summary
  console.log('\n====================================================');
  console.log('🎉 DATA MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  console.log(`Users count:           ${await User.count()} (Mongo: ${rawUsers.length})`);
  console.log(`Events count:          ${await Event.count()} (Mongo: ${rawEvents.length})`);
  console.log(`Posts count:           ${await Post.count()} (Mongo: ${rawPosts.length})`);
  console.log(`Comments count:        ${await Comment.count()} (Mongo: ${rawComments.length})`);
  console.log(`Registrations count:   ${await EventRegistration.count()} (Mongo: ${rawRegistrations.length})`);
  console.log(`Certificates count:    ${await Certificate.count()} (Mongo: ${rawCerts.length})`);
  console.log(`Reviews count:         ${await Review.count()} (Mongo: ${rawReviews.length})`);
  console.log(`Reports count:         ${await Report.count()} (Mongo: ${rawReports.length})`);
  console.log(`Conversations count:   ${await Conversation.count()} (Mongo: ${rawConversations.length})`);
  console.log(`Messages count:        ${await Message.count()} (Mongo: ${rawMessages.length})`);
  console.log(`Notifications count:   ${await Notification.count()} (Mongo: ${rawNotifications.length})`);
  console.log('====================================================\n');
}

runMigration().catch((err) => {
  console.error('❌ Data Migration Error:', err);
  process.exit(1);
});
