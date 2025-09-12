#!/usr/bin/env node

/**
 * Database Setup Script
 * Initializes the MongoDB database with sample data and indexes
 */

const mongoose = require('mongoose');
const config = require('./config/config');
const User = require('./models/User');
const Message = require('./models/Message');

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(config.database.uri, config.database.options);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

/**
 * Create database indexes for better performance
 */
async function createIndexes() {
  try {
    console.log('📊 Creating database indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 });
    await User.collection.createIndex({ username: 1 });
    await User.collection.createIndex({ isOnline: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    
    // Message indexes
    await Message.collection.createIndex({ roomId: 1, createdAt: -1 });
    await Message.collection.createIndex({ sender: 1, createdAt: -1 });
    await Message.collection.createIndex({ createdAt: -1 });
    await Message.collection.createIndex({ text: 'text' }); // Text search index
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
}

/**
 * Create sample data for testing
 */
async function createSampleData() {
  try {
    console.log('👥 Creating sample users...');
    
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('ℹ️  Users already exist, skipping sample data creation');
      return;
    }
    
    // Create sample users
    const users = [
      {
        username: 'admin',
        email: 'admin@chat.com',
        password: 'admin123',
        displayName: 'Admin User',
        role: 'admin',
        isEmailVerified: true
      },
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        displayName: 'John Doe',
        role: 'user',
        isEmailVerified: true
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123',
        displayName: 'Jane Smith',
        role: 'user',
        isEmailVerified: true
      },
      {
        username: 'moderator',
        email: 'mod@chat.com',
        password: 'mod123',
        displayName: 'Moderator',
        role: 'moderator',
        isEmailVerified: true
      }
    ];
    
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} sample users`);
    
    // Create sample messages
    console.log('💬 Creating sample messages...');
    const sampleMessages = [
      {
        text: 'Welcome to the chat application! 🎉',
        sender: createdUsers[0]._id,
        senderName: createdUsers[0].displayName,
        roomId: 'general',
        messageType: 'system'
      },
      {
        text: 'Hello everyone! How is everyone doing today?',
        sender: createdUsers[1]._id,
        senderName: createdUsers[1].displayName,
        roomId: 'general',
        messageType: 'text'
      },
      {
        text: 'Hi John! I\'m doing great, thanks for asking! 😊',
        sender: createdUsers[2]._id,
        senderName: createdUsers[2].displayName,
        roomId: 'general',
        messageType: 'text'
      },
      {
        text: 'This is a private message between admin and moderator',
        sender: createdUsers[0]._id,
        senderName: createdUsers[0].displayName,
        roomId: 'admin-room',
        messageType: 'text'
      }
    ];
    
    await Message.insertMany(sampleMessages);
    console.log(`✅ Created ${sampleMessages.length} sample messages`);
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  }
}

/**
 * Display database statistics
 */
async function showStats() {
  try {
    const userCount = await User.countDocuments();
    const messageCount = await Message.countDocuments();
    const onlineUsers = await User.countDocuments({ isOnline: true });
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Messages: ${messageCount}`);
    console.log(`   Online Users: ${onlineUsers}`);
    
    // Show sample users
    const users = await User.find().select('username email displayName role isOnline').limit(5);
    console.log('\n👥 Sample Users:');
    users.forEach(user => {
      console.log(`   ${user.username} (${user.email}) - ${user.role} - ${user.isOnline ? 'Online' : 'Offline'}`);
    });
    
  } catch (error) {
    console.error('❌ Error getting statistics:', error.message);
  }
}

/**
 * Main setup function
 */
async function setup() {
  console.log('🚀 Starting database setup...\n');
  
  await connectDB();
  await createIndexes();
  await createSampleData();
  await showStats();
  
  console.log('\n✅ Database setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Start the server: npm start');
  console.log('   2. Test the API endpoints');
  console.log('   3. Connect your frontend application');
  
  process.exit(0);
}

// Run setup if this file is executed directly
if (require.main === module) {
  setup().catch(error => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = { setup, connectDB, createIndexes, createSampleData };
