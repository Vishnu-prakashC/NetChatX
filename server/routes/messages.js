/**
 * Message Routes
 * Handles message-related endpoints for chat functionality
 */

const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/messages/search/:roomId
 * @desc    Search messages in a room
 * @access  Private
 */
router.get('/search/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { q: searchTerm, limit = 20 } = req.query;

    // Validation
    if (!roomId || roomId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    if (!searchTerm || searchTerm.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    // Parse limit
    const searchLimit = Math.min(parseInt(limit, 10) || 20, 50);

    // Search messages
    const messages = await Message.searchMessages(roomId, searchTerm.trim(), searchLimit);

    res.json({
      success: true,
      data: {
        messages,
        roomId,
        searchTerm: searchTerm.trim(),
        count: messages.length
      }
    });

  } catch (error) {
    console.error('Search messages error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages'
    });
  }
});

/**
 * @route   GET /api/messages/recent/:roomId
 * @desc    Get recent messages for a room (for initial load)
 * @access  Private
 */
router.get('/recent/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 20 } = req.query;

    // Validate roomId
    if (!roomId || roomId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    // Parse limit
    const messageLimit = Math.min(parseInt(limit, 10) || 20, 50);

    // Get recent messages
    const messages = await Message.getRecentMessages(roomId, messageLimit);

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to get chronological order
        roomId,
        count: messages.length
      }
    });

  } catch (error) {
    console.error('Get recent messages error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent messages'
    });
  }
});

/**
 * @route   GET /api/messages/stats/:roomId
 * @desc    Get message statistics for a room
 * @access  Private
 */
router.get('/stats/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;

    // Validate roomId
    if (!roomId || roomId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    // Get message statistics
    const totalMessages = await Message.countDocuments({ 
      roomId, 
      isDeleted: false 
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMessages = await Message.countDocuments({
      roomId,
      isDeleted: false,
      createdAt: { $gte: today }
    });

    const activeUsers = await Message.distinct('sender', {
      roomId,
      isDeleted: false,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    res.json({
      success: true,
      data: {
        roomId,
        stats: {
          totalMessages,
          todayMessages,
          activeUsers: activeUsers.length
        }
      }
    });

  } catch (error) {
    console.error('Get message stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get message statistics'
    });
  }
});

/**
 * @route   GET /api/messages/:roomId
 * @desc    Get messages for a specific room
 * @access  Private
 */
router.get('/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    // Validate roomId
    if (!roomId || roomId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    // Parse limit and ensure it's within bounds
    const messageLimit = Math.min(parseInt(limit, 10) || 50, 100);
    
    // Parse before date if provided
    let beforeDate = null;
    if (before) {
      beforeDate = new Date(before);
      if (isNaN(beforeDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format for "before" parameter'
        });
      }
    }

    // Get messages
    const messages = await Message.getRoomMessages(roomId, messageLimit, beforeDate);

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to get chronological order
        roomId,
        count: messages.length,
        hasMore: messages.length === messageLimit
      }
    });

  } catch (error) {
    console.error('Get messages error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages'
    });
  }
});

/**
 * @route   POST /api/messages/:roomId
 * @desc    Send a message to a specific room
 * @access  Private
 */
router.post('/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text, messageType = 'text', replyTo } = req.body;

    // Validation
    if (!roomId || roomId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 1000 characters'
      });
    }

    // Validate message type
    const validMessageTypes = ['text', 'image', 'file', 'system'];
    if (!validMessageTypes.includes(messageType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message type'
      });
    }

    // Validate replyTo if provided
    if (replyTo) {
      const replyMessage = await Message.findById(replyTo);
      if (!replyMessage) {
        return res.status(400).json({
          success: false,
          message: 'Reply message not found'
        });
      }
    }

    // Create new message
    const message = new Message({
      text: text.trim(),
      sender: req.user._id,
      senderName: req.user.displayName || req.user.username,
      roomId: roomId.trim(),
      messageType,
      replyTo: replyTo || null
    });

    await message.save();

    // Populate sender information
    await message.populate('sender', 'username displayName avatar');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Send message error:', error.message);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

/**
 * @route   PUT /api/messages/:messageId
 * @desc    Edit a message
 * @access  Private
 */
router.put('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    // Validation
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 1000 characters'
      });
    }

    // Find message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender or admin
    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    // Check if message is deleted
    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a deleted message'
      });
    }

    // Edit message
    await message.editMessage(text.trim());
    await message.populate('sender', 'username displayName avatar');

    res.json({
      success: true,
      message: 'Message edited successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Edit message error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message'
    });
  }
});

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message (soft delete)
 * @access  Private
 */
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender or admin
    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Check if message is already deleted
    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Message is already deleted'
      });
    }

    // Soft delete message
    await message.softDelete();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

module.exports = router;