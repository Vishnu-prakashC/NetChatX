const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.temp' });

// Admin user details
const adminUser = {
    username: 'admin',
    email: 'admin@example.com',
    password: 'Admin@123', // You should change this after first login
    role: 'admin',
    isAdmin: true
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social_media', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    await createAdmin();
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
});

// Define User model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('user', userSchema);

async function createAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
            $or: [
                { username: adminUser.username },
                { email: adminUser.email }
            ]
        });

        if (existingAdmin) {
            console.log('Admin user already exists:');
            console.log(`Username: ${existingAdmin.username}`);
            console.log(`Email: ${existingAdmin.email}`);
            console.log('If you forgot the password, you can reset it.');
            process.exit(0);
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminUser.password, salt);

        // Create new admin user
        const newAdmin = new User({
            username: adminUser.username,
            email: adminUser.email,
            password: hashedPassword,
            role: 'admin',
            isAdmin: true
        });

        await newAdmin.save();
        
        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Email: admin@example.com');
        console.log('Password: Admin@123');
        console.log('\nIMPORTANT: Change this password after first login!');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}
