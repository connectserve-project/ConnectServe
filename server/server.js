const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// Load environment variables (supports root and server dirs)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const { connectDB } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const User = require('./models/User');
const { backfillQrTokens } = require('./utils/backfillQrTokens');

// Route imports

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Define CORS allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://www.connectserve.in'
].filter(Boolean);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach Socket.io to Express application instance
app.set('io', io);

// Security & Utility Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com",
          "https://*.cloudinary.com",
          "https://images.unsplash.com",
          "https://*.unsplash.com",
          "https:",
        ],
        mediaSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com",
          "https://*.cloudinary.com",
          "https:",
        ],
        connectSrc: ["'self'", "ws:", "wss:", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'ConnectServe API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO Real-time Connection Handler
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(`user:${userId}`);
    // console.log(`[Socket.io] User ${userId} joined room user:${userId}`);
  }

  // Join specific conversation room for 1:1 chat
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  // Typing indicators
  socket.on('typing', ({ conversationId, user }) => {
    socket.to(`conversation:${conversationId}`).emit('user_typing', { user, conversationId });
  });

  socket.on('stop_typing', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('user_stop_typing', { conversationId });
  });

  socket.on('disconnect', () => {
    // console.log(`[Socket.io] Socket disconnected: ${socket.id}`);
  });
});

// Serve static frontend in production or if build exists
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server and connect DB
const startServer = async () => {
  try {
    await connectDB();
    await backfillQrTokens();

    server.listen(PORT, () => {

      console.log(`====================================================`);
      console.log(`🚀 ConnectServe Server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.IO real-time engine active`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

// Export the Express app for Vercel
module.exports = app;
