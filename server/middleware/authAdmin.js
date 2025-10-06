/**
 * Admin Authentication Middleware
 * Verifies JWT tokens and ensures user has admin privileges
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const config = require('../config/config');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

/**
 * Middleware to authenticate admin users
 * Verifies JWT token and checks for admin role
 */
const authAdmin = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Find user and check if they exist and are active
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User account is inactive.'
      });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      // Log unauthorized access attempt
      await AuditLog.logAction(user._id, 'login', {
        success: false,
        errorMessage: 'Insufficient privileges - not an admin',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Attach admin user to request object
    req.admin = user;
    req.adminId = user._id;
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    
    // Log failed authentication attempt
    try {
      await AuditLog.logAction(null, 'login', {
        success: false,
        errorMessage: error.message,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
    } catch (logError) {
      console.error('Failed to log auth error:', logError.message);
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token has expired.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

/**
 * Middleware to authenticate admin using admin JWT
 */
const authAdminJWT = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== 'admin' || !admin.active) {
      return res.status(403).json({ error: 'Admin only' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware to log admin actions
 * Should be used after authAdmin middleware
 */
const logAdminAction = (action) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log the action after response is sent
      setImmediate(async () => {
        try {
          await AuditLog.logAction(req.adminId, action, {
            targetUserId: req.params.id || null,
            details: {
              method: req.method,
              url: req.originalUrl,
              body: req.method !== 'GET' ? req.body : undefined,
              query: req.query
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            success: res.statusCode < 400
          });
        } catch (error) {
          console.error('Failed to log admin action:', error.message);
        }
      });
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Rate limiting for admin login attempts
 */
const rateLimit = require('express-rate-limit');

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

module.exports = {
  authAdmin,
  authAdminJWT,
  logAdminAction,
  adminLoginLimiter
};
