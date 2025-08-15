// server/server.js
// Real-time chat server with Express, Socket.IO, and MongoDB

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config(); // Loads .env

// ----- Config -----
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chat_app';

// ----- App / HTTP / IO -----
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// ----- MongoDB -----
mongoose
  .connect(MONGO_URI, { autoIndex: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ----- Schemas / Models -----
const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true }, // added for room-based chats
    sender: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

// ----- REST Endpoints -----
app.get('/', (_req, res) => {
  res.send('Backend running ✅');
});
app.get('/ping', (req, res) => {
  res.json({ message: 'Server is alive 🚀' });
});

// Fetch recent messages for a room
app.get('/api/messages/:roomId', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
    const msgs = await Message.find({ roomId: req.params.roomId })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(msgs.reverse());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ----- Socket.IO -----
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // Join a specific chat room
  socket.on('joinRoom', async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Send recent messages to the joining user
    const recentMessages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(50);
    socket.emit('message', recentMessages.reverse());
  });

  // Handle sending message to a specific room
  socket.on('sendMessage', async (data) => {
    try {
      if (!data || !data.roomId || !data.sender || !data.text) return;

      const saved = await Message.create({
        roomId: String(data.roomId),
        sender: String(data.sender),
        text: String(data.text),
      });

      io.to(data.roomId).emit('message', {
        _id: saved._id,
        sender: saved.sender,
        text: saved.text,
        timestamp: saved.createdAt,
      });
    } catch (e) {
      console.error('Error saving message:', e.message);
      socket.emit('error_message', { error: 'Failed to send message' });
    }
  });

  socket.on('typing', (payload) => {
    if (payload?.roomId) {
      socket.to(payload.roomId).emit('user_typing', payload);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// ----- Start Server -----
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
