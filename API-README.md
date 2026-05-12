# Backend API Integration Guide

This guide shows you how to consume the backend API at `https://startup-baas.onrender.com/api/v1` using the provided client and examples.

## Files Overview

- **`test-api.js`** - Main API client class and basic connectivity test
- **`api-usage-examples.js`** - Comprehensive usage examples for Node.js
- **`api-demo.html`** - Interactive web interface for testing the API
- **`API-README.md`** - This documentation file

## Quick Start

### 1. Test API Connectivity

```bash
node test-api.js
```

This will test basic connectivity and show you the API health status.

### 2. Use the Interactive Web Demo

Open `api-demo.html` in your browser to:
- Test API connectivity
- Sign up for a new account
- Login and logout
- Create and manage tasks
- View events and meetings
- See real-time API responses

### 3. Use in Your Node.js Application

```javascript
const { BackendAPIClient } = require('./test-api.js')

const client = new BackendAPIClient()

// Example usage
async function example() {
  // Check API health
  const health = await client.getHealth()
  console.log('API Health:', health)
  
  // Sign up a new user
  const newUser = await client.signup({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
  
  // Login
  await client.login('john@example.com', 'securePassword123')
  
  // Get user profile
  const profile = await client.getMyProfile()
  console.log('Profile:', profile)
  
  // Create a task
  const task = await client.createTask({
    title: 'Complete integration',
    description: 'Integrate the backend API',
    priority: 'high'
  })
  
  // Get my tasks
  const tasks = await client.getMyTasks()
  console.log('My tasks:', tasks)
}
```

## API Client Features

### Authentication
- ✅ User signup and login
- ✅ Automatic token management
- ✅ Token refresh handling
- ✅ Logout functionality

### User Management
- ✅ Get user profile
- ✅ Update user information
- ✅ List users (admin only)

### Task Management
- ✅ Create tasks
- ✅ Get my tasks with filters
- ✅ Update task status
- ✅ Get task history

### Events & Meetings
- ✅ List events and meetings
- ✅ Register for events/meetings
- ✅ Submit event feedback

### Notifications
- ✅ Get notifications
- ✅ Mark notifications as read
- ✅ Manage notification preferences

### File Upload
- ✅ Upload files with metadata
- ✅ Download files by ID

### Admin Features
- ✅ Dashboard statistics
- ✅ User management
- ✅ Audit logs
- ✅ System settings

## Available Endpoints

Based on the API documentation, here are the main endpoint categories:

### Public Endpoints
- `GET /health` - API health check
- `GET /status` - API status
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh

### Authenticated Endpoints
- `GET /users/me` - Get current user profile
- `POST /tasks` - Create task
- `GET /tasks/my-tasks` - Get my tasks
- `GET /events` - List events
- `GET /meetings` - List meetings
- `GET /notifications` - Get notifications
- `POST /files/upload` - Upload file

### Admin Endpoints
- `GET /admin/dashboard/stats` - Dashboard statistics
- `GET /admin/users` - List all users
- `PUT /admin/users/:id/role` - Update user role

## Error Handling

The API client includes built-in error handling:

```javascript
try {
  const result = await client.someMethod()
  console.log('Success:', result)
} catch (error) {
  console.error('Error:', error.message)
  // Handle specific error cases
  if (error.message.includes('401')) {
    // Handle authentication error
  }
}
```

## Authentication Flow

1. **Sign Up**: Create a new account with `client.signup()`
2. **Login**: Authenticate with `client.login()` - stores tokens automatically
3. **Use API**: Make authenticated requests - tokens are included automatically
4. **Token Refresh**: Handled automatically when tokens expire
5. **Logout**: Clear tokens with `client.logout()`

## Response Format

Most API responses follow this format:

```javascript
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

Error responses:
```javascript
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

## Environment Setup

The API client is configured to use:
- **Base URL**: `https://startup-baas.onrender.com/api/v1`
- **Authentication**: JWT Bearer tokens
- **Content Type**: `application/json`

## Next Steps

1. **Test the connection** using `node test-api.js`
2. **Try the web demo** by opening `api-demo.html`
3. **Integrate into your app** using the `BackendAPIClient` class
4. **Customize as needed** - the client is fully extensible

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your frontend domain is allowed by the backend
2. **401 Unauthorized**: Check that you're logged in and tokens are valid
3. **Network Errors**: Verify the backend URL is accessible

### Debug Mode

Enable debug logging by adding console.log statements in the `makeRequest` method:

```javascript
async makeRequest(endpoint, options = {}) {
  console.log('Making request to:', endpoint, options)
  // ... rest of method
}
```

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify API endpoint documentation
3. Test with the provided HTML demo first
4. Check network connectivity to the backend

Happy coding! 🚀