/**
 * Database Configuration
 * Handles MongoDB connection using Mongoose
 */

const mongoose = require('mongoose');
const config = require('./config');

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const mongoURI = config.database.uri;
    const options = config.database.options;

    await mongoose.connect(mongoURI, options);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Graceful fallback - continue without database
    console.log('💡 Starting server without database connection...');
    console.log('💡 Some features may not work properly');
    
    // Don't exit the process, let the server continue
    return false;
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error.message);
  }
};

/**
 * Check if database is connected
 * @returns {boolean}
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  disconnectDB,
  isConnected
};

