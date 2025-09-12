# Database Integration Setup Guide

This guide will help you set up MongoDB integration for your chat application.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# MongoDB Configuration
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
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# Start MongoDB service
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod
```

**MongoDB Atlas:**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a new cluster
- Get your connection string and update `MONGO_URI` in `.env`

### 4. Initialize Database

```bash
# Run the setup script to create indexes and sample data
node setup.js
```

### 5. Start the Server

```bash
npm start
```

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  displayName: String,
  avatar: String,
  isOnline: Boolean (default: false),
  lastSeen: Date,
  role: String (enum: ['user', 'admin', 'moderator']),
  isActive: Boolean (default: true),
  isEmailVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Collection

```javascript
{
  _id: ObjectId,
  text: String (required, max: 1000),
  sender: ObjectId (ref: 'User'),
  senderName: String (required),
  roomId: String (required, indexed),
  messageType: String (enum: ['text', 'image', 'file', 'system']),
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],
  isEdited: Boolean (default: false),
  editedAt: Date,
  isDeleted: Boolean (default: false),
  deletedAt: Date,
  reactions: [{
    emoji: String,
    users: [ObjectId],
    count: Number
  }],
  replyTo: ObjectId (ref: 'Message'),
  threadId: ObjectId (ref: 'Message'),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| GET | `/api/auth/users` | Get all users (admin) | Yes (Admin) |

### Message Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages/:roomId` | Get room messages | Yes |
| POST | `/api/messages/:roomId` | Send message | Yes |
| PUT | `/api/messages/:messageId` | Edit message | Yes |
| DELETE | `/api/messages/:messageId` | Delete message | Yes |
| GET | `/api/messages/search/:roomId` | Search messages | Yes |
| GET | `/api/messages/recent/:roomId` | Get recent messages | Yes |
| GET | `/api/messages/stats/:roomId` | Get message stats | Yes |

## Sample API Usage

### Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "password123"
  }'
```

### Send a Message

```bash
curl -X POST http://localhost:5000/api/messages/general \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "Hello, world!",
    "messageType": "text"
  }'
```

### Get Messages

```bash
curl -X GET http://localhost:5000/api/messages/general \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Socket.IO Events

### Client to Server

- `joinRoom` - Join a chat room
- `leaveRoom` - Leave a chat room
- `sendMessage` - Send a message
- `typing` - User is typing
- `stopTyping` - User stopped typing

### Server to Client

- `newMessage` - New message received
- `userJoined` - User joined room
- `userLeft` - User left room
- `userTyping` - User typing indicator
- `error` - Error occurred

## Database Indexes

The following indexes are automatically created for optimal performance:

- `{ email: 1 }` - User email lookup
- `{ username: 1 }` - User username lookup
- `{ isOnline: 1 }` - Online users query
- `{ roomId: 1, createdAt: -1 }` - Room messages query
- `{ sender: 1, createdAt: -1 }` - User messages query
- `{ text: 'text' }` - Full-text search

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Input validation and sanitization
- Rate limiting (configurable)
- CORS protection
- SQL injection prevention (NoSQL)

## Production Considerations

1. **Environment Variables**: Always use environment variables for sensitive data
2. **JWT Secret**: Use a strong, random JWT secret in production
3. **MongoDB Atlas**: Use MongoDB Atlas for production databases
4. **Connection Pooling**: Configure appropriate connection pool settings
5. **Monitoring**: Set up database monitoring and logging
6. **Backups**: Implement regular database backups
7. **SSL/TLS**: Use encrypted connections in production

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure MongoDB is running
2. **Authentication Failed**: Check JWT secret configuration
3. **Validation Errors**: Verify request data format
4. **Index Errors**: Run the setup script to create indexes

### Debug Mode

Set `NODE_ENV=development` to enable detailed error messages.

### Logs

Check server logs for detailed error information:

```bash
npm start 2>&1 | tee server.log
```

## Support

For issues and questions:
1. Check the server logs
2. Verify environment variables
3. Ensure MongoDB is running
4. Check network connectivity

## Next Steps

1. Test all API endpoints
2. Integrate with your frontend
3. Set up production environment
4. Configure monitoring and logging
5. Implement additional features as needed
