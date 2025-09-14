/**
 * Admin API Tests
 * Tests for admin authentication and user management endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import your app and models
const app = require('../server');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const config = require('../config/config');

describe('Admin API Tests', () => {
  let adminUser;
  let regularUser;
  let adminToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/chat_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create test admin user
    adminUser = new User({
      username: 'testadmin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    await adminUser.save();

    // Create test regular user
    regularUser = new User({
      username: 'testuser',
      email: 'user@test.com',
      password: 'password123',
      role: 'user',
      isActive: true,
      isEmailVerified: true
    });
    await regularUser.save();

    // Generate admin token
    adminToken = jwt.sign(
      { userId: adminUser._id, role: 'admin' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await AuditLog.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /admin/login', () => {
    it('should login admin with valid credentials', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.admin).toBeDefined();
      expect(response.body.admin.role).toBe('admin');
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login for non-admin user', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({
          email: 'user@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({
          email: 'admin@test.com'
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /admin/dashboard', () => {
    it('should return dashboard data for authenticated admin', async () => {
      const response = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalUsers).toBeDefined();
      expect(response.body.data.activeUsers24h).toBeDefined();
      expect(response.body.data.totalMessages).toBeDefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/admin/dashboard');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /admin/users', () => {
    it('should return paginated users list for authenticated admin', async () => {
      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should support search and filtering', async () => {
      const response = await request(app)
        .get('/admin/users?search=test&role=user&active=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/admin/users');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /admin/users/:id', () => {
    it('should return user details for authenticated admin', async () => {
      const response = await request(app)
        .get(`/admin/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBe(regularUser._id.toString());
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/admin/users/${regularUser._id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /admin/users/:id', () => {
    it('should update user for authenticated admin', async () => {
      const response = await request(app)
        .patch(`/admin/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'moderator',
          displayName: 'Updated Name'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('moderator');
    });

    it('should prevent admin from changing their own role', async () => {
      const response = await request(app)
        .patch(`/admin/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'user'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot change your own admin role');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .patch(`/admin/users/${regularUser._id}`)
        .send({
          role: 'moderator'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /admin/users/:id', () => {
    it('should deactivate user for authenticated admin', async () => {
      const response = await request(app)
        .delete(`/admin/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify user is deactivated
      const updatedUser = await User.findById(regularUser._id);
      expect(updatedUser.isActive).toBe(false);
    });

    it('should prevent admin from deleting themselves', async () => {
      const response = await request(app)
        .delete(`/admin/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot delete your own account');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .delete(`/admin/users/${regularUser._id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /admin/audit-logs', () => {
    it('should return audit logs for authenticated admin', async () => {
      const response = await request(app)
        .get('/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.logs).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should support pagination and filtering', async () => {
      const response = await request(app)
        .get('/admin/audit-logs?page=1&limit=10&action=login')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/admin/audit-logs');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /admin/me', () => {
    it('should return admin profile for authenticated admin', async () => {
      const response = await request(app)
        .get('/admin/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.role).toBe('admin');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/admin/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
