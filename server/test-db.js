#!/usr/bin/env node

/**
 * Database Test Script
 * Tests the MongoDB connection and basic CRUD operations
 */

const mongoose = require('mongoose');
const config = require('./config/config');
const User = require('./models/User');
const Message = require('./models/Message');

/**
 * Test database connection
 */
async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    await mongoose.connect(config.database.uri, config.database.options);
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Test user operations
 */
async function testUserOperations() {
  try {
    console.log('\n👤 Testing user operations...');
    
    // Test user creation
    const testUser = new User({
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      password: 'testpassword123',
      displayName: 'Test User'
    });
    
    await testUser.save();
    console.log('✅ User creation successful');
    
    // Test user retrieval
    const foundUser = await User.findById(testUser._id);
    console.log('✅ User retrieval successful');
    
    // Test password comparison
    const isPasswordValid = await foundUser.comparePassword('testpassword123');
    console.log('✅ Password comparison successful:', isPasswordValid);
    
    // Test user update
    foundUser.displayName = 'Updated Test User';
    await foundUser.save();
    console.log('✅ User update successful');
    
    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ User deletion successful');
    
    return true;
  } catch (error) {
    console.error('❌ User operations failed:', error.message);
    return false;
  }
}

/**
 * Test message operations
 */
async function testMessageOperations() {
  try {
    console.log('\n💬 Testing message operations...');
    
    // Create a test user for messages
    const testUser = new User({
      username: 'msguser_' + Date.now(),
      email: 'msg_' + Date.now() + '@example.com',
      password: 'testpassword123',
      displayName: 'Message Test User'
    });
    await testUser.save();
    
    // Test message creation
    const testMessage = new Message({
      text: 'This is a test message',
      sender: testUser._id,
      senderName: testUser.displayName,
      roomId: 'test-room',
      messageType: 'text'
    });
    
    await testMessage.save();
    console.log('✅ Message creation successful');
    
    // Test message retrieval
    const foundMessage = await Message.findById(testMessage._id);
    console.log('✅ Message retrieval successful');
    
    // Test message search
    const searchResults = await Message.searchMessages('test-room', 'test message', 10);
    console.log('✅ Message search successful:', searchResults.length, 'results');
    
    // Test message update
    await foundMessage.editMessage('This is an updated test message');
    console.log('✅ Message update successful');
    
    // Test message soft delete
    await foundMessage.softDelete();
    console.log('✅ Message soft delete successful');
    
    // Clean up
    await Message.findByIdAndDelete(testMessage._id);
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Cleanup successful');
    
    return true;
  } catch (error) {
    console.error('❌ Message operations failed:', error.message);
    return false;
  }
}

/**
 * Test database indexes
 */
async function testIndexes() {
  try {
    console.log('\n📊 Testing database indexes...');
    
    // Test user indexes
    const userIndexes = await User.collection.getIndexes();
    console.log('✅ User indexes:', Object.keys(userIndexes).length);
    
    // Test message indexes
    const messageIndexes = await Message.collection.getIndexes();
    console.log('✅ Message indexes:', Object.keys(messageIndexes).length);
    
    return true;
  } catch (error) {
    console.error('❌ Index test failed:', error.message);
    return false;
  }
}

/**
 * Test database performance
 */
async function testPerformance() {
  try {
    console.log('\n⚡ Testing database performance...');
    
    const startTime = Date.now();
    
    // Test bulk user creation
    const users = [];
    for (let i = 0; i < 100; i++) {
      users.push({
        username: 'perfuser_' + i + '_' + Date.now(),
        email: 'perf_' + i + '_' + Date.now() + '@example.com',
        password: 'testpassword123',
        displayName: 'Performance Test User ' + i
      });
    }
    
    await User.insertMany(users);
    const insertTime = Date.now() - startTime;
    console.log(`✅ Bulk insert (100 users): ${insertTime}ms`);
    
    // Test query performance
    const queryStart = Date.now();
    const foundUsers = await User.find({ username: /perfuser_/ }).limit(10);
    const queryTime = Date.now() - queryStart;
    console.log(`✅ Query performance: ${queryTime}ms`);
    
    // Clean up
    await User.deleteMany({ username: /perfuser_/ });
    console.log('✅ Performance test cleanup successful');
    
    return true;
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 Starting database tests...\n');
  
  const results = {
    connection: false,
    users: false,
    messages: false,
    indexes: false,
    performance: false
  };
  
  // Test connection
  results.connection = await testConnection();
  if (!results.connection) {
    console.log('\n❌ Connection test failed. Please check your MongoDB setup.');
    process.exit(1);
  }
  
  // Run other tests
  results.users = await testUserOperations();
  results.messages = await testMessageOperations();
  results.indexes = await testIndexes();
  results.performance = await testPerformance();
  
  // Display results
  console.log('\n📋 Test Results:');
  console.log('================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Database integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  // Close connection
  await mongoose.connection.close();
  console.log('\n🔌 Database connection closed.');
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests, testConnection, testUserOperations, testMessageOperations };
