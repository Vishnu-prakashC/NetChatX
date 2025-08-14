const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection with fallback
const connectToMongoDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB Connected");
    } else {
      console.log("⚠️  No MONGO_URI found in environment variables");
      console.log("📝 Please create a .env file with your MongoDB connection string");
      
      // Try to connect to local MongoDB as fallback
      try {
        await mongoose.connect('mongodb://localhost:27017/chat_app');
        console.log("✅ Connected to local MongoDB");
      } catch (localError) {
        console.log("❌ Local MongoDB connection failed");
        console.log("💡 Starting server without database connection...");
        console.log("💡 Messages will be stored in memory only");
      }
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("💡 Starting server without database connection...");
    console.log("💡 Messages will be stored in memory only");
  }
};

// Connect to MongoDB
connectToMongoDB();

// Example route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Socket.io setup
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('send_message', (data) => {
    io.emit('receive_message', data); // Broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('🚀 Server running on port 5000');
});
