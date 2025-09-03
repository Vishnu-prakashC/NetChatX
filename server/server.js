// server/server.js
// Real-time chat server with Express, Socket.IO, and MongoDB

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

// ----- Config -----
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chat_app';

// ----- App Setup -----
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// ----- MongoDB -----
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ----- Schema & Model -----
const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true },
    sender: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

// ----- REST API -----
app.get('/', (_req, res) => res.send('Backend running ✅'));

app.get('/ping', (_req, res) => {
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
    console.error('Fetch error:', e.message);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ----- Socket.IO -----
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // Join a chat room
  socket.on('joinRoom', async (roomId) => {
    const readableRoomId = String(roomId);
    socket.join(readableRoomId);
    console.log(`User ${socket.id} joined room ${readableRoomId}`);

    // Send last 50 messages
    const recentMessages = await Message.find({ roomId: readableRoomId })
      .sort({ createdAt: -1 })
      .limit(50);

    socket.emit('message', recentMessages.reverse());
  });

  // Send a message
  socket.on('sendMessage', async (data) => {
    try {
      if (!data || !data.roomId || !data.sender || !data.text) return;

      const readableRoomId = String(data.roomId);

      let senderString;
      if (typeof data.sender === 'object' && data.sender !== null) {
        senderString = data.sender.email || data.sender.name || JSON.stringify(data.sender);
      } else {
        senderString = String(data.sender);
      }

      const saved = await Message.create({
        roomId: readableRoomId,
        sender: senderString,
        text: String(data.text),
      });

      io.to(readableRoomId).emit('message', {
        _id: saved._id,
        roomId: saved.roomId,
        sender: saved.sender,
        text: saved.text,
        timestamp: saved.createdAt,
      });
    } catch (e) {
      console.error('Error saving message:', e.message);
      socket.emit('error_message', { error: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (payload) => {
    if (payload?.roomId) {
      const readableRoomId = String(payload.roomId);
      socket.to(readableRoomId).emit('user_typing', payload);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// ----- Start Server -----
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
