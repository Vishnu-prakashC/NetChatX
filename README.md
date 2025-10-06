# Chat Application - Day 4: Database Integration

A real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO, featuring complete database integration with MongoDB using Mongoose.

## 🚀 Features

- **Real-time messaging** with Socket.IO
- **User authentication** with JWT tokens
- **MongoDB integration** with Mongoose ODM
- **RESTful API** for all operations
- **Modular architecture** with separate routes, models, and middleware
- **Production-ready** with comprehensive error handling
- **Security features** including password hashing and input validation

## 📁 Project Structure

```
chat/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   │   ├── db.js          # Database connection
│   │   └── config.js      # Centralized config
│   ├── middleware/         # Express middleware
│   │   └── auth.js        # JWT authentication
│   ├── models/            # Mongoose models
│   │   ├── User.js        # User schema
│   │   └── Message.js     # Message schema
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication routes
│   │   └── messages.js    # Message routes
│   ├── setup.js           # Database setup script
│   ├── test-db.js         # Database test script
│   ├── env-setup.js       # Environment setup script
│   └── server.js          # Main server file
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Setup

```bash
# Create .env file with default values
cd server
npm run env:setup

# Edit .env file with your configuration
# MONGO_URI=mongodb://localhost:27017/chat_app
# JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# Initialize database with indexes and sample data
npm run setup
```

### 4. Start the Application

```bash
# Start the server (in server directory)
npm start

# Start the client (in client directory)
npm run dev
```

## MERN Real-Time Chat App

### Local Setup

#### Backend

```sh
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run dev
```

#### Frontend

```sh
cd client
npm install
npm run dev
```

### Seeding Admin

```sh
cd server
node utils/createAdmin.js
```

### Deployment

- Backend: Deploy `server` to Render. Set env vars from `.env.example`.
- Frontend: Deploy `client` to Vercel. Set `VITE_API_URL` to backend URL.

### Quick Test Checklist

- Start server and client, open two tabs, join same room, send messages.
- Refresh: previous messages load.
- Admin login works, user list loads, can change role/active.
- No secrets in git; `.env.example` exists.

## 🗄️ Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  displayName: String,
  avatar: String,
  isOnline: Boolean,
  lastSeen: Date,
  role: String (user/admin/moderator),
  isActive: Boolean,
  isEmailVerified: Boolean,
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
  senderName: String,
  roomId: String (required, indexed),
  messageType: String (text/image/file/system),
  attachments: Array,
  isEdited: Boolean,
  editedAt: Date,
  isDeleted: Boolean,
  deletedAt: Date,
  reactions: Array,
  replyTo: ObjectId (ref: 'Message'),
  threadId: ObjectId (ref: 'Message'),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |

### Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages/:roomId` | Get room messages | Yes |
| POST | `/api/messages/:roomId` | Send message | Yes |
| PUT | `/api/messages/:messageId` | Edit message | Yes |
| DELETE | `/api/messages/:messageId` | Delete message | Yes |
| GET | `/api/messages/search/:roomId` | Search messages | Yes |
| GET | `/api/messages/recent/:roomId` | Get recent messages | Yes |

## 🔧 Available Scripts

### Server Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run setup      # Initialize database with sample data
npm test           # Run database tests
npm run env:setup  # Create .env file with defaults
```

### Client Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🧪 Testing

### Database Tests

```bash
cd server
npm test
```

This will run comprehensive tests including:
- Database connection
- User CRUD operations
- Message CRUD operations
- Index performance
- Bulk operations

### Manual API Testing

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"password123"}'

# Send a message (replace YOUR_JWT_TOKEN)
curl -X POST http://localhost:5000/api/messages/general \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"text":"Hello, world!"}'
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Configurable cross-origin policies
- **Rate Limiting**: Configurable request limits
- **SQL Injection Prevention**: NoSQL security best practices

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chat_app
JWT_SECRET=your_very_strong_secret_key_here
CLIENT_ORIGIN=https://yourdomain.com
```

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URI` in your environment variables

### Security Checklist

- [ ] Change default JWT secret
- [ ] Use MongoDB Atlas for production
- [ ] Enable SSL/TLS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up database backups

## 📊 Performance Features

- **Database Indexes**: Optimized for common queries
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Lean queries and population
- **Caching**: Strategic data caching
- **Pagination**: Efficient data loading

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string
   - Verify network connectivity

2. **JWT Authentication Failed**
   - Check JWT_SECRET in environment
   - Verify token format
   - Check token expiration

3. **Validation Errors**
   - Check request data format
   - Verify required fields
   - Check data types

### Debug Mode

Set `NODE_ENV=development` for detailed error messages.

## 📚 Documentation

- [Database Setup Guide](server/DATABASE_SETUP.md)
- [API Documentation](server/API_DOCS.md)
- [Frontend Guide](client/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Next Steps

1. **Frontend Integration**: Connect React components to the API
2. **Real-time Features**: Implement Socket.IO on the frontend
3. **File Uploads**: Add image and file sharing
4. **Push Notifications**: Implement real-time notifications
5. **Mobile App**: Create React Native version
6. **Advanced Features**: Message reactions, threads, voice messages

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review server logs
3. Test database connection
4. Verify environment variables

---

**Day 4 Complete!** 🎉 Your chat application now has full MongoDB integration with a production-ready backend API.
