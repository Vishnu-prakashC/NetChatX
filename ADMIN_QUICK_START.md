# Admin Panel Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install express-rate-limit express-validator jest supertest
```

**Frontend:**
```bash
cd client
npm install react-router-dom
```

### 2. Set Environment Variables

Create or update your `.env` file in the server directory:

```env
# Add these to your existing .env file
ADMIN_JWT_SECRET=your_super_secret_admin_key_123
MONGO_URI=mongodb://localhost:27017/chat_app
```

### 3. Create Admin User

```bash
cd server
npm run create-admin
```

Follow the prompts to create your admin account.

### 4. Start the Application

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

### 5. Access Admin Panel

1. Open your browser to `http://localhost:3000/admin/login`
2. Login with your admin credentials
3. You'll be redirected to the dashboard

## 📋 Available Features

### Dashboard
- **Total Users**: Count of all registered users
- **Active Users (24h)**: Users active in the last 24 hours
- **Total Messages**: All messages sent in the system
- **Recent Signups**: Latest user registrations
- **Messages Chart**: Daily message activity

### User Management
- **View Users**: Paginated list with search and filters
- **Edit Users**: Change roles, display names, activate/deactivate
- **Delete Users**: Soft delete (deactivate) users
- **User Details**: Detailed view with message count

### Security
- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin-only endpoints
- **Rate Limiting**: Protection against brute force
- **Audit Logging**: Track all admin actions

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/login` | Admin login |
| GET | `/admin/dashboard` | Dashboard analytics |
| GET | `/admin/users` | List users (paginated) |
| GET | `/admin/users/:id` | Get user details |
| PATCH | `/admin/users/:id` | Update user |
| DELETE | `/admin/users/:id` | Delete user |
| GET | `/admin/audit-logs` | View audit logs |
| GET | `/admin/me` | Get admin profile |

## 🧪 Testing

Run the test suite:

```bash
cd server
npm test
```

## 🚨 Troubleshooting

### Can't login?
1. Check if admin user exists: `npm run create-admin`
2. Verify JWT secret is set in `.env`
3. Check server logs for errors

### Dashboard not loading?
1. Ensure MongoDB is running
2. Check database connection
3. Verify admin token is valid

### Users not showing?
1. Check if users exist in database
2. Verify pagination parameters
3. Check search/filter criteria

## 📚 Next Steps

1. **Customize**: Modify the UI components in `client/src/admin/`
2. **Extend**: Add new admin features in `server/routes/admin.js`
3. **Monitor**: Check audit logs regularly
4. **Secure**: Use strong passwords and JWT secrets

## 🔗 Useful Commands

```bash
# Create admin user interactively
npm run create-admin

# Create admin user from environment variables
npm run create-admin:env

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch tests
npm run test:watch
```

## 📖 Full Documentation

See `ADMIN_README.md` for complete documentation including:
- Detailed API documentation
- Security considerations
- Deployment instructions
- Database schema
- Advanced configuration

---

**Need Help?** Check the server logs and audit logs for detailed error information.
