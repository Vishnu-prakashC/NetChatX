# Quick Start Guide - Day 4 Database Integration

Get your chat application running with MongoDB integration in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Server dependencies
cd server
npm install

# Client dependencies (if needed)
cd ../client
npm install
```

### 2. Set Up Environment

```bash
# Create .env file with defaults
cd server
npm run env:setup
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
# or
mongod
```

**MongoDB Atlas (Cloud):**
- Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create free account
- Create cluster
- Get connection string
- Update `MONGO_URI` in `.env` file

### 4. Initialize Database

```bash
cd server
npm run setup
```

### 5. Start the Server

```bash
npm start
```

You should see:
```
🚀 Chat Application Server Started
📡 Server running on: http://localhost:5000
✅ MongoDB Connected Successfully
```

### 6. Test the API

```bash
# Test server health
curl http://localhost:5000/ping

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"password123"}'
```

## 🧪 Run Tests

```bash
cd server
npm test
```

## 📱 Connect Frontend

1. Start the React client:
```bash
cd client
npm run dev
```

2. The frontend should connect to the backend automatically

## 🔧 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"

# Test connection string
mongosh "mongodb://localhost:27017/chat_app"
```

### Port Already in Use

```bash
# Kill process on port 5000
npx kill-port 5000

# Or change port in .env file
PORT=3001
```

### Environment Variables

Make sure your `.env` file has:
```env
MONGO_URI=mongodb://localhost:27017/chat_app
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
```

## ✅ Success Indicators

- Server starts without errors
- MongoDB connection successful
- API endpoints respond correctly
- Database tests pass
- Frontend connects to backend

## 🎯 What's Working

- ✅ User registration and login
- ✅ JWT authentication
- ✅ Message storage and retrieval
- ✅ Real-time messaging with Socket.IO
- ✅ Database indexes for performance
- ✅ Input validation and error handling
- ✅ Production-ready configuration

## 🚀 Next Steps

1. Test all API endpoints
2. Connect your frontend
3. Customize the UI
4. Add more features
5. Deploy to production

---

**You're all set!** Your chat application now has full database integration! 🎉
