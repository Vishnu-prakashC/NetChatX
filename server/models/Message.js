const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

// Only create model if mongoose is connected
let Message;
try {
  Message = mongoose.model('Message', messageSchema);
} catch (error) {
  // Model already exists
  Message = mongoose.model('Message');
}

module.exports = Message;
