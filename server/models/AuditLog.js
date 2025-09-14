/**
 * AuditLog Model
 * Tracks admin actions for security and compliance
 */

const mongoose = require('mongoose');

/**
 * AuditLog Schema
 * Records all administrative actions for audit trail
 */
const auditLogSchema = new mongoose.Schema({
  // Admin who performed the action
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Action performed
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'create_user',
      'update_user',
      'delete_user',
      'activate_user',
      'deactivate_user',
      'change_role',
      'view_users',
      'view_dashboard',
      'view_audit_logs',
      'export_data',
      'system_config'
    ]
  },
  
  // Target user (if action affects a specific user)
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Additional details about the action
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // IP address of the admin
  ipAddress: {
    type: String,
    default: null
  },
  
  // User agent string
  userAgent: {
    type: String,
    default: null
  },
  
  // Success status
  success: {
    type: Boolean,
    default: true
  },
  
  // Error message if action failed
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Indexes for better query performance
 */
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetUserId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

/**
 * Static method to log an admin action
 * @param {ObjectId} adminId - ID of the admin performing the action
 * @param {string} action - Action being performed
 * @param {Object} options - Additional options
 * @returns {Promise<AuditLog>} - Created audit log entry
 */
auditLogSchema.statics.logAction = async function(adminId, action, options = {}) {
  const {
    targetUserId = null,
    details = {},
    ipAddress = null,
    userAgent = null,
    success = true,
    errorMessage = null
  } = options;

  const auditLog = new this({
    adminId,
    action,
    targetUserId,
    details,
    ipAddress,
    userAgent,
    success,
    errorMessage
  });

  return await auditLog.save();
};

/**
 * Static method to get audit logs with pagination
 * @param {Object} filters - Filter options
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of records per page
 * @returns {Promise<Object>} - Paginated audit logs
 */
auditLogSchema.statics.getPaginatedLogs = async function(filters = {}, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  const query = {};
  
  if (filters.adminId) {
    query.adminId = filters.adminId;
  }
  
  if (filters.action) {
    query.action = filters.action;
  }
  
  if (filters.targetUserId) {
    query.targetUserId = filters.targetUserId;
  }
  
  if (filters.success !== undefined) {
    query.success = filters.success;
  }
  
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) {
      query.createdAt.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      query.createdAt.$lte = new Date(filters.dateTo);
    }
  }

  const [logs, total] = await Promise.all([
    this.find(query)
      .populate('adminId', 'username email displayName')
      .populate('targetUserId', 'username email displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query)
  ]);

  return {
    logs,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  };
};

// Create and export the AuditLog model
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
