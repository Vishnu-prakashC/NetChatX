const Message = require('../models/Message');
const User = require('../models/User');

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('joinRoom', async ({ roomId }) => {
      socket.join(roomId);
    });

    socket.on('leaveRoom', ({ roomId }) => {
      socket.leave(roomId);
    });

    socket.on('sendMessage', async ({ roomId, sender, text }) => {
      if (!roomId || !sender || !text) return;
      try {
        const msg = await Message.create({ roomId, sender, text });
        io.to(roomId).emit('receiveMessage', msg);
        await User.updateOne({ name: sender }, { lastSeen: new Date() });
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('typing', ({ roomId, sender }) => {
      socket.to(roomId).emit('user_typing', { roomId, sender });
    });
  });
};
