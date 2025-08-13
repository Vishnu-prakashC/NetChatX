import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

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
