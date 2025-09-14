/**
 * Admin Routes
 * Protected admin-only API endpoints for user management and analytics
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult, query } = require('express-validator');
const mongoose = require('mongoose');

const User = require('../models/User');
const Message = require('../models/Message');
const AuditLog = require('../models/AuditLog');
const { authAdmin, logAdminAction, adminLoginLimiter } = require('../middleware/authAdmin');
const config = require('../config/config');

const router = express.Router();

// ----- Admin Authentication -----

/**
 * POST /admin/login
 * Admin login endpoint
 */
router.post('/login', 
  adminLoginLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find admin user
      const admin = await User.findOne({ 
        email: email.toLowerCase(),
        role: 'admin',
        isActive: true
      }).select('+password');

      if (!admin) {
        // Log failed login attempt
        await AuditLog.logAction(null, 'login', {
          success: false,
          errorMessage: 'Admin not found or inactive',
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        // Log failed login attempt
        await AuditLog.logAction(admin._id, 'login', {
          success: false,
          errorMessage: 'Invalid password',
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: admin._id,
          role: admin.role,
          email: admin.email
        },
        config.jwt.secret,
        { expiresIn: '24h' }
      );

      // Log successful login
      await AuditLog.logAction(admin._id, 'login', {
        success: true,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Login successful',
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          displayName: admin.displayName || admin.username,
          role: admin.role
        }
      });

    } catch (error) {
      console.error('Admin login error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// ----- Protected Admin Routes -----

/**
 * GET /admin/dashboard
 * Get dashboard analytics
 */
router.get('/dashboard', 
  authAdmin,
  logAdminAction('view_dashboard'),
  async (req, res) => {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get basic counts
      const [
        totalUsers,
        activeUsers24h,
        totalMessages,
        recentSignups,
        messagesPerDay
      ] = await Promise.all([
        // Total users
        User.countDocuments({ isActive: true }),
        
        // Active users in last 24h
        User.countDocuments({ 
          lastSeen: { $gte: oneDayAgo },
          isActive: true 
        }),
        
        // Total messages
        Message.countDocuments(),
        
        // Recent signups (last 7 days)
        User.find({ 
          createdAt: { $gte: sevenDaysAgo },
          isActive: true 
        })
        .select('username email displayName createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
        
        // Messages per day for last 7 days
        Message.aggregate([
          {
            $match: {
              createdAt: { $gte: sevenDaysAgo }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          },
          {
            $project: {
              date: '$_id',
              count: 1,
              _id: 0
            }
          }
        ])
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers24h,
          totalMessages,
          recentSignups,
          messagesPerDay
        }
      });

    } catch (error) {
      console.error('Dashboard error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data'
      });
    }
  }
);

/**
 * GET /admin/users
 * Get paginated list of users with search and filters
 */
router.get('/users',
  authAdmin,
  logAdminAction('view_users'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('role').optional().isIn(['user', 'admin', 'moderator']).withMessage('Invalid role'),
    query('active').optional().isBoolean().withMessage('Active must be boolean')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 25;
      const skip = (page - 1) * limit;

      // Build query
      const query = {};
      
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [
          { username: searchRegex },
          { email: searchRegex },
          { displayName: searchRegex }
        ];
      }
      
      if (req.query.role) {
        query.role = req.query.role;
      }
      
      if (req.query.active !== undefined) {
        query.isActive = req.query.active === 'true';
      }

      // Get users and total count
      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get users error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }
);

/**
 * GET /admin/users/:id
 * Get specific user details
 */
router.get('/users/:id',
  authAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      const user = await User.findById(id)
        .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user's message count
      const messageCount = await Message.countDocuments({ sender: id });

      res.json({
        success: true,
        data: {
          ...user.toObject(),
          messageCount
        }
      });

    } catch (error) {
      console.error('Get user error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user details'
      });
    }
  }
);

/**
 * PATCH /admin/users/:id
 * Update user (role, active status)
 */
router.patch('/users/:id',
  authAdmin,
  logAdminAction('update_user'),
  [
    body('role').optional().isIn(['user', 'admin', 'moderator']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    body('displayName').optional().isString().trim().isLength({ max: 50 }).withMessage('Display name too long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const updates = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      // Prevent admin from demoting themselves
      if (id === req.adminId.toString() && updates.role && updates.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot change your own admin role'
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });

    } catch (error) {
      console.error('Update user error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }
);

/**
 * DELETE /admin/users/:id
 * Delete user (soft delete by setting isActive to false)
 */
router.delete('/users/:id',
  authAdmin,
  logAdminAction('delete_user'),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      // Prevent admin from deleting themselves
      if (id === req.adminId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Soft delete by setting isActive to false
      await User.findByIdAndUpdate(id, { isActive: false });

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }
);

/**
 * GET /admin/audit-logs
 * Get paginated audit logs
 */
router.get('/audit-logs',
  authAdmin,
  logAdminAction('view_audit_logs'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('action').optional().isString().withMessage('Action must be a string'),
    query('adminId').optional().isMongoId().withMessage('Invalid admin ID'),
    query('success').optional().isBoolean().withMessage('Success must be boolean')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const filters = {
        action: req.query.action,
        adminId: req.query.adminId,
        success: req.query.success === 'true' ? true : req.query.success === 'false' ? false : undefined
      };

      const result = await AuditLog.getPaginatedLogs(filters, page, limit);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Get audit logs error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit logs'
      });
    }
  }
);

/**
 * GET /admin/me
 * Get current admin profile
 */
router.get('/me',
  authAdmin,
  async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          id: req.admin._id,
          username: req.admin.username,
          email: req.admin.email,
          displayName: req.admin.displayName || req.admin.username,
          role: req.admin.role,
          isActive: req.admin.isActive,
          lastSeen: req.admin.lastSeen,
          createdAt: req.admin.createdAt
        }
      });
    } catch (error) {
      console.error('Get admin profile error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch admin profile'
      });
    }
  }
);

module.exports = router;
