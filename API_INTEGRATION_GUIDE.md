# API Integration Guide

This guide explains how your frontend is now configured to work with your backend API.

## ✅ What's Been Updated

### 1. API Client (`src/lib/api.ts`)
- **Base URL**: Changed from `/api/v1` to root level endpoints
- **Authentication**: Updated to use `access_token` instead of `token`
- **Endpoints**: All endpoints now match your API documentation
- **New Methods Added**:
  - `changePassword()`, `forgotPassword()`, `resetPassword()`
  - `getOverdueTasks()`, `searchTasks()`, `getTaskHistory()`
  - `bulkUpdateTasks()`
  - `submitEventFeedback()`
  - `getNotificationPreferences()`, `updateNotificationPreferences()`
  - Admin methods: `getAdminDashboardStats()`, `getAuditLogs()`, etc.

### 2. Data Types (`src/lib/types.ts`)
- **User**: Changed `full_name` → `name`, removed `phone_number`
- **Task**: Changed `assigned_to` → `assignee_id`, `assigned_by` → `created_by`
- **Report**: Updated to match your API structure
- **Meeting/Event**: Updated to match your API structure

### 3. Authentication Context (`src/contexts/AuthContext.tsx`)
- Updated to handle new login response format: `{ access_token, refresh_token, user }`
- Removed phone number from signup process
- Better error handling for API responses

### 4. Components Updated
- **Navbar**: Updated to use `user.name` instead of `user.full_name`
- **Dashboard**: Updated task filtering to use new field names
- **Signup**: Removed phone number field to match API

### 5. Environment Configuration
- **Base URL**: `NEXT_PUBLIC_API_URL=http://localhost:3001`
- **No `/api/v1` suffix** - endpoints are at root level

## 🚀 How to Test the Integration

### 1. Start Your Backend
Make sure your backend is running on `http://localhost:3001`

### 2. Test API Connection
```bash
cd startup-kano-portfolio
node test-api.js
```

### 3. Start Frontend
```bash
npm run dev
```

### 4. Test Authentication
1. Go to `http://localhost:3000/auth/signup`
2. Create a new account
3. Try logging in at `http://localhost:3000/auth/login`

## 📋 API Endpoints Your Frontend Uses

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh

### Users
- `GET /users/me` - Get current user profile
- `GET /users` - Get all users (admin only)
- `PUT /users/:id` - Update user
- `PATCH /users/:id/status` - Update user status (admin only)

### Tasks
- `GET /tasks/my-tasks` - Get user's tasks
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `PATCH /tasks/:id/status` - Update task status
- `PATCH /tasks/:id/accept` - Accept task
- `PATCH /tasks/:id/revision` - Request revision
- `DELETE /tasks/:id` - Delete task

### Reports
- `GET /reports` - Get reports
- `POST /reports` - Create report
- `PATCH /reports/:id` - Update report
- `PATCH /reports/:id/status` - Update report status (admin only)

### Meetings
- `GET /meetings` - Get meetings
- `POST /meetings` - Create meeting (admin only)
- `POST /meetings/:id/register` - Register for meeting

### Events
- `GET /events` - Get events
- `POST /events` - Create event (admin only)
- `POST /events/:id/register` - Register for event
- `POST /events/:id/feedback` - Submit feedback

### Notifications
- `GET /notifications` - Get user notifications
- `POST /notifications/read-all` - Mark all as read
- `PUT /notifications/:id/read` - Mark single as read

### Files
- `POST /files/upload` - Upload file
- `GET /files/:id` - Get file
- `DELETE /files/:id` - Delete file

### Admin
- `GET /admin/dashboard/stats` - Dashboard statistics
- `GET /admin/users` - Manage users
- `GET /admin/audit-logs` - Audit logs

### Health
- `GET /health` - Health check
- `GET /status` - System status

## 🔧 Expected API Response Formats

### Login Response
```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token-here",
    "refresh_token": "refresh-token-here",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "member",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Task Object
```json
{
  "id": "task-id",
  "title": "Task Title",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "assignee_id": "user-id",
  "created_by": "admin-id",
  "due_date": "2024-01-01T00:00:00Z",
  "type": "assigned",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## 🐛 Troubleshooting

### Backend Connection Issues
1. Verify backend is running on `http://localhost:3001`
2. Check CORS settings in your backend
3. Ensure health endpoint `/health` is accessible

### Authentication Issues
1. Check JWT token format in login response
2. Verify Authorization header: `Bearer <token>`
3. Check token expiration handling

### Data Format Issues
1. Ensure API responses match expected formats
2. Check field names match the updated types
3. Verify success/error response structure

## 🔄 Offline Mode

The frontend includes offline fallback functionality:
- If backend is unreachable, switches to offline mode
- Uses mock data for development
- Shows offline indicator in UI
- Prevents signup in offline mode

## 📝 Next Steps

1. **Test all endpoints** with your backend
2. **Verify authentication flow** works correctly
3. **Check data synchronization** between frontend and backend
4. **Test error handling** for various scenarios
5. **Validate file upload** functionality
6. **Test admin features** with admin role

Your frontend is now fully configured to work with your backend API! 🎉