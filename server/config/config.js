/**
 * Application Configuration
 * Centralized configuration management for the chat application
 */

require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  // Database Configuration
  database: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/chat_app',
    name: process.env.DB_NAME || 'chat_app',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 27017,
    options: {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'chat-app',
    audience: 'chat-app-users'
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    passwordMinLength: 6,
    usernameMinLength: 3,
    usernameMaxLength: 30,
    messageMaxLength: 1000
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Socket.IO Configuration
  socket: {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  },

  // Message Configuration
  message: {
    maxLength: 1000,
    maxRecentMessages: 50,
    maxSearchResults: 20
  },

  // User Configuration
  user: {
    roles: ['user', 'admin', 'moderator'],
    defaultRole: 'user',
    maxDisplayNameLength: 50
  }
};

// Validation
if (!config.jwt.secret || config.jwt.secret === 'your_super_secret_jwt_key_here_change_this_in_production') {
  console.warn('⚠️  WARNING: Using default JWT secret. Please set JWT_SECRET in your environment variables for production!');
}

if (config.nodeEnv === 'production' && config.database.uri.includes('localhost')) {
  console.warn('⚠️  WARNING: Using localhost MongoDB in production. Please set MONGO_URI to your production database!');
}

module.exports = config;
