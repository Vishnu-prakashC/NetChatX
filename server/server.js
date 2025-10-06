/**
 * Chat Application Server
 * Real-time chat server with Express, Socket.IO, and MongoDB
 * Modular architecture with separate routes, models, and middleware
 */

require('dotenv').config();


const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const config = require('./config/config');
const helmet = require('helmet');

// Import custom modules
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Message = require('./models/Message');
const { authenticateToken } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');

// ----- Configuration -----
const PORT = config.port;
const CLIENT_ORIGIN = config.clientOrigin;

// ----- App Setup -----
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: config.socket.cors
});

// ----- Middleware -----
app.use(helmet());
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ----- Database Connection -----
connectDB();

// ----- Routes -----
app.get('/', (_req, res) => res.send('Chat App Backend Running ✅'));

app.get('/ping', (_req, res) => {
  res.json({ 
    message: 'Server is alive 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/admin', adminRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// ----- Socket.IO Authentication Middleware -----
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return next(new Error('Invalid or inactive user'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

// ----- Socket.IO Event Handlers -----
io.on('connection', (socket) => {
  console.log(`🟢 User connected: ${socket.user.username} (${socket.id})`);

  // Update user online status
  User.findByIdAndUpdate(socket.userId, { 
    isOnline: true, 
    lastSeen: new Date() 
  }).exec();

  // Join a chat room
  socket.on('joinRoom', async (roomId) => {
    try {
      const readableRoomId = String(roomId);
      socket.join(readableRoomId);
      console.log(`👤 ${socket.user.username} joined room: ${readableRoomId}`);

      // Send last 20 messages
      const recentMessages = await Message.getRecentMessages(readableRoomId, 20);
      socket.emit('roomMessages', recentMessages.reverse());

      // Notify others in the room
      socket.to(readableRoomId).emit('userJoined', {
        user: {
          id: socket.user._id,
          username: socket.user.username,
          displayName: socket.user.displayName || socket.user.username
        },
        message: `${socket.user.displayName || socket.user.username} joined the room`
      });

    } catch (error) {
      console.error('Join room error:', error.message);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave a chat room
  socket.on('leaveRoom', (roomId) => {
    const readableRoomId = String(roomId);
    socket.leave(readableRoomId);
    console.log(`👋 ${socket.user.username} left room: ${readableRoomId}`);
    
    socket.to(readableRoomId).emit('userLeft', {
      user: {
        id: socket.user._id,
        username: socket.user.username,
        displayName: socket.user.displayName || socket.user.username
      },
      message: `${socket.user.displayName || socket.user.username} left the room`
    });
  });

  // Send a message
  socket.on('sendMessage', async (data) => {
    try {
      if (!data || !data.roomId || !data.text) {
        return socket.emit('error', { message: 'Invalid message data' });
      }

      const readableRoomId = String(data.roomId);
      const messageText = String(data.text).trim();

      if (messageText.length === 0) {
        return socket.emit('error', { message: 'Message cannot be empty' });
      }

      if (messageText.length > 1000) {
        return socket.emit('error', { message: 'Message too long' });
      }

      // Create message in database
      const message = new Message({
        text: messageText,
        sender: socket.userId,
        senderName: socket.user.displayName || socket.user.username,
        roomId: readableRoomId,
        messageType: data.messageType || 'text'
      });

      await message.save();
      await message.populate('sender', 'username displayName avatar');

      // Broadcast message to room
      io.to(readableRoomId).emit('newMessage', {
        id: message._id,
        text: message.text,
        sender: {
          id: socket.user._id,
          username: socket.user.username,
          displayName: socket.user.displayName || socket.user.username,
          avatar: socket.user.avatar
        },
        roomId: readableRoomId,
        timestamp: message.createdAt,
        messageType: message.messageType
      });

    } catch (error) {
      console.error('Send message error:', error.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    if (data?.roomId) {
      const readableRoomId = String(data.roomId);
      socket.to(readableRoomId).emit('userTyping', {
        user: {
          id: socket.user._id,
          username: socket.user.username,
          displayName: socket.user.displayName || socket.user.username
        },
        roomId: readableRoomId,
        isTyping: data.isTyping || true
      });
    }
  });

  // Stop typing indicator
  socket.on('stopTyping', (data) => {
    if (data?.roomId) {
      const readableRoomId = String(data.roomId);
      socket.to(readableRoomId).emit('userTyping', {
        user: {
          id: socket.user._id,
          username: socket.user.username,
          displayName: socket.user.displayName || socket.user.username
        },
        roomId: readableRoomId,
        isTyping: false
      });
    }
  });

  // Disconnect
  socket.on('disconnect', async () => {
    console.log(`🔴 User disconnected: ${socket.user.username} (${socket.id})`);
    
    // Update user offline status
    try {
      await User.findByIdAndUpdate(socket.userId, { 
        isOnline: false, 
        lastSeen: new Date() 
      }).exec();
    } catch (error) {
      console.error('Error updating user status on disconnect:', error.message);
    }
  });
});

// ----- Error Handling -----
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler (Express 5: avoid "*" pattern)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ----- Graceful Shutdown -----
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// ----- Start Server -----
httpServer.listen(PORT, () => {
  console.log('🚀 Chat Application Server Started');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 Client origin: ${CLIENT_ORIGIN}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('📋 Available endpoints:');
  console.log('   GET  / - Server status');
  console.log('   GET  /ping - Health check');
  console.log('   GET  /health - Detailed health status');
  console.log('   POST /api/auth/register - User registration');
  console.log('   POST /api/auth/login - User login');
  console.log('   GET  /api/auth/me - Get current user');
  console.log('   GET  /api/messages/:roomId - Get room messages');
  console.log('   POST /api/messages/:roomId - Send message');
  console.log('   POST /admin/login - Admin login');
  console.log('   GET  /admin/dashboard - Admin dashboard');
  console.log('   GET  /admin/users - List users');
  console.log('   GET  /admin/users/:id - Get user details');
  console.log('   PATCH /admin/users/:id - Update user');
  console.log('   DELETE /admin/users/:id - Delete user');
  console.log('   GET  /admin/audit-logs - Get audit logs');
  console.log('🔌 Socket.IO events: joinRoom, leaveRoom, sendMessage, typing');
});
