#!/usr/bin/env node

/**
 * Environment Setup Script
 * Creates a .env file with default values for development
 */

const fs = require('fs');
const path = require('path');

const envContent = `# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/chat_app
# For MongoDB Atlas (cloud), use:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chat_app?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# Database Options
DB_NAME=chat_app
DB_HOST=localhost
DB_PORT=27017

# Security
BCRYPT_ROUNDS=12

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

const envPath = path.join(__dirname, '.env');

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Skipping creation.');
    console.log('💡 If you want to update it, please delete the existing .env file first.');
    return;
  }
  
  // Create .env file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please update the values in .env file as needed:');
  console.log('   - MONGO_URI: Your MongoDB connection string');
  console.log('   - JWT_SECRET: A strong secret key for JWT tokens');
  console.log('   - Other values as needed for your environment');
  
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}
