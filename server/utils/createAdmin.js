/**
 * Create Admin User Script
 * Creates an initial admin user for the application
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const User = require('../models/User');
const config = require('../config/config');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Helper function to ask for password (hidden input)
const askPassword = (question) => {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    process.stdin.on('data', (char) => {
      char = char + '';
      
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeAllListeners('data');
          console.log('');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
};

// Main function to create admin
const createAdmin = async () => {
  try {
    console.log('🔧 Admin User Creation Script');
    console.log('============================\n');

    // Connect to database
    console.log('📡 Connecting to database...');
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to database\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Active: ${existingAdmin.isActive}`);
      
      const overwrite = await askQuestion('\nDo you want to create another admin? (y/N): ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('❌ Admin creation cancelled');
        process.exit(0);
      }
    }

    // Get admin details
    console.log('\n📝 Please provide admin user details:');
    
    const username = await askQuestion('Username: ');
    if (!username || username.length < 3) {
      console.log('❌ Username must be at least 3 characters long');
      process.exit(1);
    }

    const email = await askQuestion('Email: ');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('❌ Please provide a valid email address');
      process.exit(1);
    }

    const displayName = await askQuestion('Display Name (optional): ') || username;

    const password = await askPassword('Password: ');
    if (!password || password.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      process.exit(1);
    }

    const confirmPassword = await askPassword('Confirm Password: ');
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      process.exit(1);
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      console.log('❌ User with this username or email already exists');
      process.exit(1);
    }

    // Create admin user
    console.log('\n🔄 Creating admin user...');
    
    const admin = new User({
      username,
      email: email.toLowerCase(),
      displayName,
      password,
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Details:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Display Name: ${admin.displayName}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.isActive}`);
    console.log(`   Created: ${admin.createdAt}`);

    console.log('\n🚀 You can now login to the admin panel using these credentials.');
    console.log('   Admin Panel URL: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('💡 This error usually means the username or email already exists.');
    }
    
    process.exit(1);
  } finally {
    // Close database connection and readline interface
    await mongoose.connection.close();
    rl.close();
    console.log('\n👋 Goodbye!');
  }
};

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Admin User Creation Script');
  console.log('==========================');
  console.log('');
  console.log('Usage: node createAdmin.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --env          Use environment variables for admin creation');
  console.log('');
  console.log('Environment Variables (for --env option):');
  console.log('  ADMIN_USERNAME  Admin username');
  console.log('  ADMIN_EMAIL     Admin email');
  console.log('  ADMIN_PASSWORD  Admin password');
  console.log('  ADMIN_DISPLAY_NAME  Admin display name (optional)');
  console.log('');
  process.exit(0);
}

if (args.includes('--env')) {
  // Create admin using environment variables
  const createAdminFromEnv = async () => {
    try {
      console.log('🔧 Creating admin from environment variables...');
      
      const username = process.env.ADMIN_USERNAME;
      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASSWORD;
      const displayName = process.env.ADMIN_DISPLAY_NAME || username;

      if (!username || !email || !password) {
        console.log('❌ Missing required environment variables:');
        console.log('   ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD');
        process.exit(1);
      }

      // Connect to database
      await mongoose.connect(config.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      // Check if admin already exists
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        console.log('⚠️  Admin user already exists');
        process.exit(0);
      }

      // Create admin
      const admin = new User({
        username,
        email: email.toLowerCase(),
        displayName,
        password,
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });

      await admin.save();
      console.log('✅ Admin user created successfully from environment variables!');

    } catch (error) {
      console.error('❌ Error creating admin:', error.message);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
    }
  };

  createAdminFromEnv();
} else {
  // Interactive mode
  createAdmin();
}

module.exports = { createAdmin };
