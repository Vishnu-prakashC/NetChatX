# Chat Application Backend

A real-time chat application backend built with Node.js, Express, Socket.IO, and MongoDB using Mongoose.

## Features

- **User Authentication**: JWT-based authentication with signup, login, and profile management
- **Real-time Messaging**: Socket.IO for real-time chat functionality
- **Message Management**: CRUD operations for messages with soft delete and editing
- **User Management**: User profiles, online status, and role-based access
- **Database Integration**: MongoDB with Mongoose for data persistence
- **Modular Architecture**: Clean separation of routes, models, middleware, and configuration

## Project Structure

```
server/
├── config/
│   └── db.js              # Database connection configuration
├── middleware/
│   └── auth.js            # Authentication middleware
├── models/
│   ├── User.js            # User model and schema
│   └── Message.js         # Message model and schema
├── routes/
│   ├── auth.js            # Authentication routes
│   └── messages.js        # Message routes
├── .env                   # Environment variables (create this)
├── server.js              # Main server file
└── package.json           # Dependencies and scripts
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository and navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment variables file:**
   Create a `.env` file in the server directory with the following content:
   ```env
   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/chat_app
   # For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/chat_app

   # JWT Secret Key (generate a strong secret for production)
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

   # Server Configuration
   PORT=5000
   CLIENT_ORIGIN=http://localhost:5173

   # Environment
   NODE_ENV=development
   ```

4. **Start MongoDB:**
   - **Local MongoDB**: Make sure MongoDB is running on your system
   - **MongoDB Atlas**: Use your Atlas connection string in the MONGO_URI

5. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login user | Public |
| POST | `/logout` | Logout user | Private |
| GET | `/me` | Get current user profile | Private |
| PUT | `/profile` | Update user profile | Private |
| POST | `/change-password` | Change user password | Private |
| GET | `/users` | Get all users (admin only) | Private (Admin) |

### Message Routes (`/api/messages`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/:roomId` | Get messages for a room | Private |
| POST | `/:roomId` | Send a message to a room | Private |
| PUT | `/:messageId` | Edit a message | Private |
| DELETE | `/:messageId` | Delete a message | Private |
| GET | `/search/:roomId` | Search messages in a room | Private |
| GET | `/recent/:roomId` | Get recent messages for a room | Private |
| GET | `/stats/:roomId` | Get message statistics for a room | Private |

### General Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server status |
| GET | `/ping` | Health check |
| GET | `/health` | Detailed health status |

## Socket.IO Events

### Client to Server Events

| Event | Description | Data |
|-------|-------------|------|
| `joinRoom` | Join a chat room | `{ roomId: string }` |
| `leaveRoom` | Leave a chat room | `{ roomId: string }` |
| `sendMessage` | Send a message | `{ roomId: string, text: string, messageType?: string }` |
| `typing` | Start typing indicator | `{ roomId: string, isTyping: boolean }` |
| `stopTyping` | Stop typing indicator | `{ roomId: string }` |

### Server to Client Events

| Event | Description | Data |
|-------|-------------|------|
| `roomMessages` | Recent messages for a room | `Message[]` |
| `newMessage` | New message received | `Message` |
| `userJoined` | User joined the room | `{ user: User, message: string }` |
| `userLeft` | User left the room | `{ user: User, message: string }` |
| `userTyping` | User typing status | `{ user: User, roomId: string, isTyping: boolean }` |
| `error` | Error message | `{ message: string }` |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

For Socket.IO connections, pass the token in the auth object:

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## Database Models

### User Model
- `username`: Unique username
- `email`: Unique email address
- `password`: Hashed password
- `displayName`: Display name for chat
- `avatar`: Avatar URL
- `isOnline`: Online status
- `lastSeen`: Last seen timestamp
- `role`: User role (user, admin, moderator)
- `isActive`: Account status

### Message Model
- `text`: Message content
- `sender`: Reference to User
- `senderName`: Sender's display name
- `roomId`: Chat room identifier
- `messageType`: Type of message (text, image, file, system)
- `isEdited`: Edit status
- `isDeleted`: Soft delete status
- `attachments`: File attachments
- `reactions`: Message reactions

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed validation errors"] // Optional
}
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Environment Variables
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)
- `CLIENT_ORIGIN`: Allowed client origin for CORS
- `NODE_ENV`: Environment (development/production)

### Testing the API

You can test the API using tools like Postman, curl, or any HTTP client:

1. **Register a new user:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"identifier":"testuser","password":"password123"}'
   ```

3. **Send a message:**
   ```bash
   curl -X POST http://localhost:5000/api/messages/general \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <your-jwt-token>" \
     -d '{"text":"Hello, world!"}'
   ```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong, unique `JWT_SECRET`
3. Use MongoDB Atlas or a production MongoDB instance
4. Set up proper CORS origins
5. Use a process manager like PM2
6. Set up SSL/HTTPS
7. Configure proper logging and monitoring

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS protection
- Rate limiting (can be added)
- SQL injection protection (MongoDB)
- XSS protection through input validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.