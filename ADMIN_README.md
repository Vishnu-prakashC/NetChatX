# Admin Panel Documentation

This document provides comprehensive instructions for setting up and using the admin panel for the real-time chat application.

## Overview

The admin panel provides a secure interface for managing users, viewing analytics, and monitoring system activity. It includes:

- **User Management**: View, edit, activate/deactivate users, change roles
- **Dashboard**: Analytics and system overview
- **Audit Logs**: Track admin actions and system events
- **Security**: JWT-based authentication with role-based access control

## Backend Setup

### 1. Install Dependencies

```bash
cd server
npm install express-rate-limit express-validator
```

### 2. Environment Variables

Add these variables to your `.env` file:

```env
# Admin JWT Secret (use a strong, unique secret)
ADMIN_JWT_SECRET=your_super_secret_admin_jwt_key_here

# MongoDB URI
MONGO_URI=mongodb://localhost:27017/chat_app

# Optional: Admin user creation via environment variables
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123
ADMIN_DISPLAY_NAME=Administrator
```

### 3. Create Initial Admin User

#### Option A: Interactive Script
```bash
cd server
node utils/createAdmin.js
```

#### Option B: Environment Variables
```bash
cd server
node utils/createAdmin.js --env
```

### 4. Start the Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000` with admin routes available at `/admin/*`.

## Frontend Setup

### 1. Install Dependencies

```bash
cd client
npm install react-router-dom
```

### 2. Start the Frontend

```bash
cd client
npm run dev
```

The admin panel will be available at `http://localhost:3000/admin/login`.

## API Endpoints

### Authentication

#### POST /admin/login
Login as an admin user.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "admin": {
    "id": "user_id",
    "username": "admin",
    "email": "admin@example.com",
    "displayName": "Administrator",
    "role": "admin"
  }
}
```

### User Management

#### GET /admin/users
Get paginated list of users with optional filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 25, max: 100)
- `search` (string): Search by name or email
- `role` (string): Filter by role (user, moderator, admin)
- `active` (boolean): Filter by active status

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/admin/users?page=1&limit=20&search=john&role=user&active=true"
```

#### GET /admin/users/:id
Get detailed information about a specific user.

#### PATCH /admin/users/:id
Update user information.

**Request:**
```json
{
  "displayName": "New Display Name",
  "role": "moderator",
  "isActive": true
}
```

#### DELETE /admin/users/:id
Deactivate a user (soft delete).

### Dashboard

#### GET /admin/dashboard
Get dashboard analytics and statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers24h": 32,
    "totalMessages": 1245,
    "recentSignups": [...],
    "messagesPerDay": [...]
  }
}
```

### Audit Logs

#### GET /admin/audit-logs
Get paginated audit logs with optional filtering.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `action` (string): Filter by action type
- `adminId` (string): Filter by admin user ID
- `success` (boolean): Filter by success status

## Frontend Components

### AdminLogin
- Secure login form with validation
- JWT token storage
- Automatic redirect to dashboard

### AdminDashboard
- Statistics cards (total users, active users, messages)
- Recent signups list
- Messages per day chart
- Quick action buttons

### UsersList
- Paginated user table
- Search and filtering
- Inline role and status updates
- User deletion

### UserDetails
- Detailed user information
- Edit user details
- Role and status management
- Recent activity (placeholder)

### AdminNav
- Navigation sidebar
- Admin user info
- Logout functionality

## Security Features

### Authentication
- JWT-based authentication
- Role-based access control
- Token expiration (24 hours)
- Secure password hashing with bcrypt

### Rate Limiting
- Login attempts limited to 5 per 15 minutes per IP
- Prevents brute force attacks

### Input Validation
- Express-validator for request validation
- XSS protection
- SQL injection prevention

### Audit Logging
- All admin actions are logged
- IP address and user agent tracking
- Failed authentication attempts logged

## Database Models

### User Model (Extended)
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  displayName: String,
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  isActive: { type: Boolean, default: true },
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### AuditLog Model
```javascript
{
  adminId: ObjectId (ref: User),
  action: String,
  targetUserId: ObjectId (ref: User),
  details: Object,
  ipAddress: String,
  userAgent: String,
  success: Boolean,
  errorMessage: String,
  createdAt: Date
}
```

## Testing

### Run Tests
```bash
cd server
npm test
```

### Test Coverage
The test suite covers:
- Admin authentication
- User management endpoints
- Dashboard analytics
- Audit logging
- Error handling
- Security validations

## Deployment

### Environment Setup
1. Set production environment variables
2. Use strong, unique JWT secrets
3. Configure MongoDB connection string
4. Set up SSL/HTTPS in production

### Security Considerations
- Use environment variables for secrets
- Implement proper CORS settings
- Set up rate limiting
- Monitor audit logs regularly
- Keep dependencies updated

### Database Backup
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/chat_app" --out=backup/

# Restore backup
mongorestore --uri="mongodb://localhost:27017/chat_app" backup/chat_app/
```

## Troubleshooting

### Common Issues

1. **Admin login fails**
   - Check if admin user exists
   - Verify JWT secret is set
   - Check password hashing

2. **Dashboard data not loading**
   - Verify database connection
   - Check user permissions
   - Review server logs

3. **User management errors**
   - Check user ID format
   - Verify admin permissions
   - Review audit logs

### Logs
- Server logs: Check console output
- Audit logs: Available via `/admin/audit-logs` endpoint
- Database logs: Check MongoDB logs

## API Examples

### Create Admin User (cURL)
```bash
curl -X POST http://localhost:5000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Get Users (cURL)
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/admin/users?page=1&limit=20"
```

### Update User (cURL)
```bash
curl -X PATCH http://localhost:5000/admin/users/USER_ID \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"role":"moderator","isActive":true}'
```

## Support

For issues or questions:
1. Check the audit logs for error details
2. Review server console output
3. Verify environment configuration
4. Check database connectivity

The admin panel is designed to be secure, user-friendly, and maintainable. Regular updates and security patches are recommended.
