/**
 * Message Model
 * Defines the schema and model for chat messages
 */

const mongoose = require('mongoose');

/**
 * Message Schema
 * Defines the structure for message documents in MongoDB
 */
const messageSchema = new mongoose.Schema({
  // Room/Channel information
  roomId: {
    type: String,
    required: [true, 'Room ID is required'],
    trim: true,
    index: true
  },
  
  // Sender information
  sender: {
    type: String,
    required: [true, 'Sender is required']
  },
  
  // Message content
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

/**
 * Indexes for better query performance
 */
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 });

/**
 * Pre-save middleware
 */
messageSchema.pre('save', function(next) {
  // Update editedAt when message is marked as edited
  if (this.isModified('text') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  
  // Update deletedAt when message is marked as deleted
  if (this.isModified('isDeleted') && this.isDeleted) {
    this.deletedAt = new Date();
  }
  
  next();
});

/**
 * Instance method to soft delete a message
 */
messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

/**
 * Instance method to edit message
 */
messageSchema.methods.editMessage = function(newText) {
  if (this.isDeleted) {
    throw new Error('Cannot edit a deleted message');
  }
  
  this.text = newText;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

/**
 * Static method to get messages for a room
 * @param {string} roomId - Room identifier
 * @param {number} limit - Number of messages to retrieve
 * @param {Date} before - Get messages before this date
 * @returns {Promise<Message[]>} - Array of messages
 */
messageSchema.statics.getRoomMessages = function(roomId, limit = 50, before = null) {
  const query = { 
    roomId, 
    isDeleted: false 
  };
  
  if (before) {
    query.createdAt = { $lt: before };
  }
  
  return this.find(query)
    .populate('sender', 'username displayName avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

/**
 * Static method to get recent messages for a room
 * @param {string} roomId - Room identifier
 * @param {number} limit - Number of recent messages
 * @returns {Promise<Message[]>} - Array of recent messages
 */
messageSchema.statics.getRecentMessages = function(roomId, limit = 20) {
  return this.find({ 
    roomId, 
    isDeleted: false 
  })
    .populate('sender', 'username displayName avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

/**
 * Static method to search messages
 * @param {string} roomId - Room identifier
 * @param {string} searchTerm - Search term
 * @param {number} limit - Number of results
 * @returns {Promise<Message[]>} - Array of matching messages
 */
messageSchema.statics.searchMessages = function(roomId, searchTerm, limit = 20) {
  return this.find({
    roomId,
    text: { $regex: searchTerm, $options: 'i' },
    isDeleted: false
  })
    .populate('sender', 'username displayName avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

/**
 * Virtual for formatted timestamp
 */
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString();
});

/**
 * Virtual for formatted date
 */
messageSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Create and export the Message model
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
