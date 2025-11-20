const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social_media', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    listUsers();
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
});

// Define User model (should match your actual schema)
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: { type: String, default: 'user' },
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('user', userSchema);

async function listUsers() {
    try {
        console.log('\n=== Users in the database ===');
        const users = await User.find({}).select('-password');
        
        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.log(`Found ${users.length} users:`);
            users.forEach((user, index) => {
                console.log(`\nUser ${index + 1}:`);
                console.log(`ID: ${user._id}`);
                console.log(`Username: ${user.username || 'N/A'}`);
                console.log(`Email: ${user.email || 'N/A'}`);
                console.log(`Role: ${user.role || 'user'}`);
                console.log(`Admin: ${user.isAdmin ? 'Yes' : 'No'}`);
                console.log(`Blocked: ${user.isBlocked ? 'Yes' : 'No'}`);
                console.log(`Created: ${user.createdAt}`);
            });
        }
        
        // Check for admin users
        const adminUsers = users.filter(user => user.role === 'admin' || user.isAdmin);
        if (adminUsers.length === 0) {
            console.log('\nNo admin users found in the database.');
        } else {
            console.log(`\nFound ${adminUsers.length} admin user(s):`);
            adminUsers.forEach((admin, index) => {
                console.log(`\nAdmin ${index + 1}:`);
                console.log(`ID: ${admin._id}`);
                console.log(`Username: ${admin.username || 'N/A'}`);
                console.log(`Email: ${admin.email || 'N/A'}`);
            });
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error listing users:', error);
        process.exit(1);
    }
}
