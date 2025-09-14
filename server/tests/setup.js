/**
 * Jest Test Setup
 * Global test configuration and setup
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.ADMIN_JWT_SECRET = 'test_admin_jwt_secret';
process.env.MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/chat_test';

// Increase timeout for database operations
jest.setTimeout(10000);
