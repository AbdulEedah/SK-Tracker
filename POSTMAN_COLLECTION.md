# Startup Kano Portfolio API - Complete Backend Specification

This document provides a comprehensive API specification and implementation guide for the Startup Kano Portfolio backend. This is a complete reference that includes all endpoints, database schemas, authentication flows, and implementation requirements.

## 🎯 Project Overview

**Application**: Startup Kano Portfolio Management System  
**Architecture**: REST API with JWT Authentication  
**Database**: PostgreSQL (recommended) or MySQL  
**File Storage**: Local filesystem or AWS S3  
**Authentication**: JWT with refresh tokens  
**Authorization**: Role-based (Admin, Member)  

## 🏗️ Technical Stack Requirements

### Backend Framework Options
- **Node.js**: Express.js + TypeScript (recommended)
- **Python**: FastAPI or Django REST Framework
- **PHP**: Laravel or Symfony
- **Java**: Spring Boot
- **C#**: ASP.NET Core

### Required Dependencies
- JWT library for authentication
- Bcrypt for password hashing
- File upload handling (multer for Node.js)
- Database ORM (Prisma, Sequelize, TypeORM for Node.js)
- Email service (SendGrid, AWS SES, or SMTP)
- Redis for caching (optional but recommended)
- Rate limiting middleware

## 📋 Table of Contents

- [Database Schema](#database-schema)
- [Environment Setup](#environment-setup)
- [Authentication & Authorization](#authentication--authorization)
- [System Health](#system-health)
- [Users API](#users-api)
- [Tasks API](#tasks-api)
- [Reports API](#reports-api)
- [Meetings API](#meetings-api)
- [Events API](#events-api)
- [Notifications API](#notifications-api)
- [Dashboard & Analytics](#dashboard--analytics)
- [System Administration](#system-administration)
- [Search & Filtering](#search--filtering)
- [Email & Communications](#email--communications)
- [File Upload API](#file-upload-api)
- [Error Handling](#error-handling)
- [Testing & Validation](#testing--validation)
- [Deployment Requirements](#deployment-requirements)

---

## 🗄️ Database Schema

### Complete SQL Schema (PostgreSQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('personal', 'assigned')),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'acknowledged', 'revision_requested')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_personal BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    due_date TIMESTAMP,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    acknowledged_at TIMESTAMP,
    revision_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    admin_feedback TEXT,
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meetings table
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_date DATE NOT NULL,
    meeting_time TIME NOT NULL,
    duration INTEGER DEFAULT 60, -- in minutes
    location VARCHAR(255),
    meeting_type VARCHAR(20) DEFAULT 'in-person' CHECK (meeting_type IN ('in-person', 'virtual', 'hybrid')),
    max_attendees INTEGER,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meeting_url VARCHAR(500), -- for virtual meetings
    agenda TEXT,
    minutes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meeting registrations table
CREATE TABLE meeting_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled', 'attended', 'no_show')),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(meeting_id, user_id)
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(255),
    max_participants INTEGER,
    registration_deadline TIMESTAMP,
    type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('workshop', 'seminar', 'networking', 'training', 'conference', 'general')),
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    featured BOOLEAN DEFAULT false,
    banner_image VARCHAR(500),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event registrations table
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'waitlist', 'confirmed', 'cancelled', 'attended', 'no_show')),
    waitlist_position INTEGER,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Event feedback table
CREATE TABLE event_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    would_recommend BOOLEAN,
    suggestions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    related_resource_type VARCHAR(50), -- 'task', 'meeting', 'event', 'report'
    related_resource_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification preferences table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    task_assignments BOOLEAN DEFAULT true,
    task_updates BOOLEAN DEFAULT true,
    meeting_reminders BOOLEAN DEFAULT true,
    event_announcements BOOLEAN DEFAULT true,
    report_feedback BOOLEAN DEFAULT true,
    system_updates BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Files table
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('report', 'profile', 'event_banner', 'meeting_document', 'general')),
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    related_resource_type VARCHAR(50),
    related_resource_id UUID,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
    resource_type VARCHAR(50) NOT NULL, -- 'user', 'task', 'report', 'meeting', 'event'
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email templates table
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables TEXT[], -- Array of variable names
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task history table (for tracking changes)
CREATE TABLE task_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'created', 'status_changed', 'updated', 'assigned'
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_week_end ON reports(week_end);
CREATE INDEX idx_meetings_date_time ON meetings(meeting_date, meeting_time);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_events_date_time ON events(event_date, event_time);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_featured ON events(featured);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_category ON files(category);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
('app_name', 'Startup Kano Portfolio', 'Application name'),
('app_version', '1.0.0', 'Application version'),
('maintenance_mode', 'false', 'Maintenance mode flag'),
('registration_enabled', 'true', 'User registration enabled'),
('max_file_size_mb', '10', 'Maximum file upload size in MB'),
('session_timeout_minutes', '60', 'Session timeout in minutes'),
('password_min_length', '8', 'Minimum password length'),
('require_email_verification', 'false', 'Require email verification for new users');

-- Insert default email templates
INSERT INTO email_templates (name, subject, body, variables) VALUES
('welcome', 'Welcome to Startup Kano Portfolio', 
 '<h1>Welcome {{full_name}}!</h1><p>Your account has been created successfully.</p>', 
 ARRAY['full_name']),
('task_assignment', 'New Task Assigned: {{task_title}}', 
 '<h2>New Task Assignment</h2><p>You have been assigned a new task: <strong>{{task_title}}</strong></p><p>Due date: {{due_date}}</p><p>Assigned by: {{assigned_by}}</p>', 
 ARRAY['task_title', 'due_date', 'assigned_by']),
('meeting_reminder', 'Meeting Reminder: {{meeting_title}}', 
 '<h2>Meeting Reminder</h2><p>You have a meeting scheduled: <strong>{{meeting_title}}</strong></p><p>Date: {{meeting_date}}</p><p>Time: {{meeting_time}}</p><p>Location: {{location}}</p>', 
 ARRAY['meeting_title', 'meeting_date', 'meeting_time', 'location']);
```

### Database Relationships Summary

1. **Users** → One-to-many with Tasks, Reports, Meetings, Events, Notifications
2. **Tasks** → Many-to-one with Users (assigned_to, assigned_by)
3. **Reports** → Many-to-one with Users
4. **Meetings** → Many-to-many with Users (through meeting_registrations)
5. **Events** → Many-to-many with Users (through event_registrations)
6. **Files** → Many-to-one with Users, can be linked to any resource
7. **Audit Logs** → Track all changes across the system

### Required Database Migrations

```sql
-- Migration 001: Initial schema
-- (Run the complete schema above)

-- Migration 002: Add indexes (if not included in initial)
-- (Indexes are included in the schema above)

-- Migration 003: Add any future schema changes
-- Example:
-- ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500);
-- ALTER TABLE tasks ADD COLUMN estimated_hours INTEGER;
```
- [Events API](#events-api)
- [Notifications API](#notifications-api)
- [Dashboard & Analytics](#dashboard--analytics)
- [File Upload API](#file-upload-api)
- [Error Handling](#error-handling)

## 🔧 Environment Setup

### Base URL
```
{{baseUrl}} = http://localhost:3001/api/v1
```

### Environment Variables
Create these variables in your Postman environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | API base URL | `http://localhost:3001/api/v1` |
| `authToken` | JWT token from authentication | `Bearer eyJ...` |
| `userId` | Current user ID | `uuid-string` |

### Global Headers
Add these headers to all requests:
```
Authorization: {{authToken}}
Content-Type: application/json
```

---

## 🏥 System Health

### 1. Health Check
**GET** `{{baseUrl}}/health`

**Description:** Check if the API server is running and healthy.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-04-21T10:30:00Z",
    "version": "1.0.0",
    "uptime": 3600
  }
}
```

### 2. API Status
**GET** `{{baseUrl}}/status`

**Description:** Get detailed API status including database connectivity.

**Response:**
```json
{
  "success": true,
  "data": {
    "api": "healthy",
    "database": "connected",
    "redis": "connected",
    "services": {
      "auth": "operational",
      "notifications": "operational",
      "file_upload": "operational"
    }
  }
}
```

---

## 🔐 Authentication & Authorization

### JWT Implementation Requirements

#### Token Structure
```javascript
// Access Token Payload
{
  "sub": "user-uuid",           // Subject (user ID)
  "email": "user@example.com",  // User email
  "role": "admin|member",       // User role
  "iat": 1640995200,           // Issued at
  "exp": 1641001200,           // Expires at (1 hour)
  "type": "access"             // Token type
}

// Refresh Token Payload
{
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1640995200,
  "exp": 1643587200            // Expires at (30 days)
}
```

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- Special characters optional but recommended

#### Security Implementation
```javascript
// Password hashing (Node.js example)
const bcrypt = require('bcrypt');
const saltRounds = 12;

// Hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate JWT tokens
const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access'
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    {
      sub: user.id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};
```

#### Authorization Middleware
```javascript
// Role-based authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' }
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          error: { code: 'ACCESS_DENIED', message: 'Insufficient permissions' }
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
      });
    }
  };
};

// Usage examples:
// app.get('/admin/users', authorize(['admin']), getUsersController);
// app.get('/tasks/my-tasks', authorize(['admin', 'member']), getMyTasksController);
```

### 1. Sign Up
**POST** `{{baseUrl}}/auth/signup`

**Body:**
```json
{
  "email": "user@startupkano.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "phone_number": "+2348012345678",
  "role": "member"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@startupkano.com",
      "full_name": "John Doe",
      "role": "member"
    },
    "token": "eyJ..."
  }
}
```

### 2. Sign In
**POST** `{{baseUrl}}/auth/login`

**Body:**
```json
{
  "email": "user@startupkano.com",
  "password": "securePassword123"
}
```

### 3. Sign Out
**POST** `{{baseUrl}}/auth/logout`

**Headers:**
```
Authorization: {{authToken}}
```

### 4. Refresh Token
**POST** `{{baseUrl}}/auth/refresh`

**Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

### 5. Forgot Password
**POST** `{{baseUrl}}/auth/forgot-password`

**Body:**
```json
{
  "email": "user@startupkano.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent"
  }
}
```

### 6. Reset Password
**POST** `{{baseUrl}}/auth/reset-password`

**Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "newSecurePassword123"
}
```

### 7. Change Password
**POST** `{{baseUrl}}/auth/change-password`

**Headers:**
```
Authorization: {{authToken}}
```

**Body:**
```json
{
  "current_password": "currentPassword123",
  "new_password": "newSecurePassword123"
}
```

### 8. Verify Email
**POST** `{{baseUrl}}/auth/verify-email`

**Body:**
```json
{
  "token": "email_verification_token"
}
```

### 9. Resend Verification Email
**POST** `{{baseUrl}}/auth/resend-verification`

**Body:**
```json
{
  "email": "user@startupkano.com"
}
```

---

## 🏗️ Business Logic Requirements

### Task Management Rules
1. **Task Assignment**: Only admins can assign tasks to other users
2. **Task Status Flow**: pending → accepted → in_progress → completed → acknowledged
3. **Revision Requests**: Admins can request revisions on completed tasks
4. **Personal Tasks**: Users can create personal tasks for themselves
5. **Task Priorities**: urgent > high > medium > low
6. **Overdue Tasks**: Tasks past due date should be flagged
7. **Task History**: Track all status changes and updates

### Report Management Rules
1. **Weekly Reports**: Users submit reports for specific weeks
2. **One Report Per Week**: Users can only submit one report per week
3. **Report Status Flow**: draft → submitted → approved/rejected
4. **Admin Review**: Only admins can approve/reject reports
5. **Late Submissions**: Track and flag late report submissions
6. **Report Attachments**: Allow file attachments to reports

### Meeting Management Rules
1. **Registration Limits**: Enforce max_attendees limit
2. **Waitlist System**: Add users to waitlist when meeting is full
3. **Registration Deadlines**: Prevent registration after deadline
4. **Attendance Tracking**: Mark attendance during/after meetings
5. **Meeting Reminders**: Send email reminders 24h and 1h before
6. **Recurring Meetings**: Support weekly/monthly recurring meetings

### Event Management Rules
1. **Registration Limits**: Enforce max_participants limit
2. **Waitlist Management**: Automatic promotion from waitlist
3. **Registration Deadlines**: Enforce registration deadlines
4. **Featured Events**: Highlight important events
5. **Event Categories**: Organize events by type
6. **Feedback Collection**: Collect feedback after events
7. **Event Notifications**: Notify registered users of changes

### Notification Rules
1. **Auto-notifications**: Automatic notifications for key events
2. **User Preferences**: Respect user notification preferences
3. **Email Integration**: Send email notifications when enabled
4. **Notification Types**: info, success, warning, error
5. **Read Status**: Track read/unread status
6. **Bulk Operations**: Support bulk mark as read

### Notification Implementation Examples

#### Node.js Notification Service
```javascript
// NotificationService.js
class NotificationService {
  constructor(emailService, database) {
    this.emailService = emailService;
    this.db = database;
  }

  // Send notification to all users
  async sendToAllUsers(notificationData) {
    const { title, message, type, send_email } = notificationData;
    
    try {
      // Get all active users
      const users = await this.db.users.findAll({
        where: { is_active: true }
      });

      const notifications = users.map(user => ({
        user_id: user.id,
        title,
        message,
        type: type || 'info',
        created_at: new Date()
      }));

      // Bulk insert notifications
      const createdNotifications = await this.db.notifications.bulkCreate(notifications);

      // Send emails if requested
      if (send_email) {
        await this.sendBulkEmails(users, { title, message, type });
      }

      return {
        success: true,
        recipients_count: users.length,
        notification_id: `bulk-${Date.now()}`
      };
    } catch (error) {
      console.error('Send to all users error:', error);
      throw new Error('Failed to send notifications to all users');
    }
  }

  // Send notification to specific user
  async sendToUser(userId, notificationData) {
    const { title, message, type, send_email } = notificationData;
    
    try {
      // Get user details
      const user = await this.db.users.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create notification
      const notification = await this.db.notifications.create({
        user_id: userId,
        title,
        message,
        type: type || 'info'
      });

      // Send email if requested and user has email notifications enabled
      if (send_email && user.notification_preferences?.email_notifications) {
        await this.emailService.sendNotificationEmail(user, { title, message, type });
      }

      return {
        success: true,
        recipient: {
          user_id: user.id,
          name: user.full_name,
          email: user.email
        },
        notification_id: notification.id
      };
    } catch (error) {
      console.error('Send to user error:', error);
      throw error;
    }
  }

  // Send notification to user group
  async sendToGroup(targetGroup, notificationData) {
    const { title, message, type, send_email } = notificationData;
    
    try {
      let whereClause = { is_active: true };
      
      // Filter by group
      if (targetGroup === 'members') {
        whereClause.role = 'member';
      } else if (targetGroup === 'admins') {
        whereClause.role = 'admin';
      }
      // 'all' doesn't need additional filtering

      const users = await this.db.users.findAll({ where: whereClause });

      const notifications = users.map(user => ({
        user_id: user.id,
        title,
        message,
        type: type || 'info',
        created_at: new Date()
      }));

      await this.db.notifications.bulkCreate(notifications);

      if (send_email) {
        await this.sendBulkEmails(users, { title, message, type });
      }

      return {
        success: true,
        recipients_count: users.length,
        notification_id: `group-${targetGroup}-${Date.now()}`
      };
    } catch (error) {
      console.error('Send to group error:', error);
      throw new Error(`Failed to send notifications to ${targetGroup}`);
    }
  }

  // Send notification to multiple specific users
  async sendBulkNotifications(userIds, notificationData) {
    const { title, message, type, send_email } = notificationData;
    
    try {
      // Get users
      const users = await this.db.users.findAll({
        where: { 
          id: userIds,
          is_active: true 
        }
      });

      const foundUserIds = users.map(u => u.id);
      const failedRecipients = userIds.filter(id => !foundUserIds.includes(id));

      const notifications = users.map(user => ({
        user_id: user.id,
        title,
        message,
        type: type || 'info',
        created_at: new Date()
      }));

      await this.db.notifications.bulkCreate(notifications);

      if (send_email) {
        await this.sendBulkEmails(users, { title, message, type });
      }

      return {
        success: true,
        recipients_count: users.length,
        failed_recipients: failedRecipients,
        notification_id: `bulk-${Date.now()}`
      };
    } catch (error) {
      console.error('Send bulk notifications error:', error);
      throw new Error('Failed to send bulk notifications');
    }
  }

  // Helper method to send bulk emails
  async sendBulkEmails(users, notificationData) {
    const emailPromises = users
      .filter(user => user.notification_preferences?.email_notifications !== false)
      .map(user => 
        this.emailService.sendNotificationEmail(user, notificationData)
          .catch(error => {
            console.error(`Failed to send email to ${user.email}:`, error);
            return null; // Don't fail the entire operation
          })
      );

    await Promise.allSettled(emailPromises);
  }
}

// Controller implementations
const notificationService = new NotificationService(emailService, database);

// Send to all users
const sendToAllUsers = async (req, res) => {
  try {
    const { title, message, type, send_email } = req.body;
    
    // Validation
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and message are required'
        }
      });
    }

    const result = await notificationService.sendToAllUsers({
      title,
      message,
      type,
      send_email
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
};

// Send to specific user
const sendToUser = async (req, res) => {
  try {
    const { user_id, title, message, type, send_email } = req.body;
    
    if (!user_id || !title || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'User ID, title and message are required'
        }
      });
    }

    const result = await notificationService.sendToUser(user_id, {
      title,
      message,
      type,
      send_email
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode === 404 ? 'RESOURCE_NOT_FOUND' : 'SERVER_ERROR',
        message: error.message
      }
    });
  }
};

// Send to user group
const sendToGroup = async (req, res) => {
  try {
    const { target_group, title, message, type, send_email } = req.body;
    
    if (!target_group || !title || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Target group, title and message are required'
        }
      });
    }

    if (!['all', 'members', 'admins'].includes(target_group)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid target group. Must be: all, members, or admins'
        }
      });
    }

    const result = await notificationService.sendToGroup(target_group, {
      title,
      message,
      type,
      send_email
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
};

module.exports = {
  sendToAllUsers,
  sendToUser,
  sendToGroup,
  sendBulkNotifications: async (req, res) => {
    try {
      const { user_ids, title, message, type, send_email } = req.body;
      
      if (!user_ids || !Array.isArray(user_ids) || !title || !message) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User IDs array, title and message are required'
          }
        });
      }

      const result = await notificationService.sendBulkNotifications(user_ids, {
        title,
        message,
        type,
        send_email
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message
        }
      });
    }
  }
};
```

#### Email Service Integration
```javascript
// EmailService.js
class EmailService {
  constructor(transporter) {
    this.transporter = transporter;
  }

  async sendNotificationEmail(user, notificationData) {
    const { title, message, type } = notificationData;
    
    const emailTemplate = this.getEmailTemplate(type);
    const htmlContent = this.generateEmailHTML(title, message, type, user);

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: `${emailTemplate.prefix} ${title}`,
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Notification email sent to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${user.email}:`, error);
      throw error;
    }
  }

  getEmailTemplate(type) {
    const templates = {
      info: { prefix: '📢', color: '#3b82f6' },
      success: { prefix: '✅', color: '#10b981' },
      warning: { prefix: '⚠️', color: '#f59e0b' },
      error: { prefix: '❌', color: '#ef4444' }
    };
    return templates[type] || templates.info;
  }

  generateEmailHTML(title, message, type, user) {
    const template = this.getEmailTemplate(type);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${template.color}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${template.prefix} ${title}</h1>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
            <p>Hello ${user.full_name},</p>
            <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p style="color: #666; font-size: 14px;">
              This notification was sent from Startup Kano Portfolio System.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
```

### File Upload Rules
1. **File Size Limits**: Enforce maximum file size (configurable)
2. **File Type Validation**: Only allow specific file types
3. **Virus Scanning**: Scan uploaded files for malware
4. **Storage Organization**: Organize files by category and date
5. **Access Control**: Ensure users can only access their files
6. **Cleanup**: Remove orphaned files periodically

---

## 📊 Implementation Examples

### Node.js/Express Controller Examples

```javascript
// Task Controller Example
const createTask = async (req, res) => {
  try {
    const { title, description, type, priority, assigned_to } = req.body;
    const { user } = req; // From auth middleware

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and description are required',
          details: {
            title: !title ? 'Title is required' : null,
            description: !description ? 'Description is required' : null
          }
        }
      });
    }

    // Business logic
    if (type === 'assigned' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Only admins can assign tasks to other users'
        }
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      type,
      priority: priority || 'medium',
      assigned_to: type === 'assigned' ? assigned_to : user.sub,
      assigned_by: user.sub,
      is_personal: type === 'personal'
    });

    // Create notification for assigned user
    if (type === 'assigned' && assigned_to !== user.sub) {
      await Notification.create({
        user_id: assigned_to,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${title}`,
        type: 'info',
        related_resource_type: 'task',
        related_resource_id: task.id
      });

      // Send email notification if enabled
      const assignedUser = await User.findById(assigned_to);
      if (assignedUser && assignedUser.notification_preferences?.task_assignments) {
        await sendTaskAssignmentEmail(assignedUser, task, user);
      }
    }

    // Log audit trail
    await AuditLog.create({
      user_id: user.sub,
      action: 'create',
      resource_type: 'task',
      resource_id: task.id,
      new_values: task,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create task'
      }
    });
  }
};

// Report Controller Example
const submitReport = async (req, res) => {
  try {
    const { title, content, week_ending } = req.body;
    const { user } = req;

    // Check if user already submitted report for this week
    const existingReport = await Report.findOne({
      user_id: user.sub,
      week_end: week_ending
    });

    if (existingReport) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_RESOURCE',
          message: 'Report already submitted for this week'
        }
      });
    }

    // Calculate week start
    const weekEnd = new Date(week_ending);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    const report = await Report.create({
      user_id: user.sub,
      title,
      content,
      week_start: weekStart,
      week_end: weekEnd,
      status: 'submitted',
      submitted_at: new Date()
    });

    // Notify admins of new report
    const admins = await User.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      await Notification.create({
        user_id: admin.id,
        title: 'New Report Submitted',
        message: `${user.full_name} submitted a new weekly report`,
        type: 'info',
        related_resource_type: 'report',
        related_resource_id: report.id
      });
    }

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to submit report'
      }
    });
  }
};

// Meeting Registration Example
const registerForMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { user } = req;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Meeting not found'
        }
      });
    }

    // Check if registration is still open
    if (meeting.registration_deadline && new Date() > meeting.registration_deadline) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_CLOSED',
          message: 'Registration deadline has passed'
        }
      });
    }

    // Check if already registered
    const existingRegistration = await MeetingRegistration.findOne({
      meeting_id: meetingId,
      user_id: user.sub
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ALREADY_REGISTERED',
          message: 'Already registered for this meeting'
        }
      });
    }

    // Check capacity
    const currentRegistrations = await MeetingRegistration.count({
      where: { meeting_id: meetingId, status: 'registered' }
    });

    const status = currentRegistrations >= meeting.max_attendees ? 'waitlist' : 'registered';

    const registration = await MeetingRegistration.create({
      meeting_id: meetingId,
      user_id: user.sub,
      status
    });

    // Send confirmation notification
    await Notification.create({
      user_id: user.sub,
      title: status === 'registered' ? 'Meeting Registration Confirmed' : 'Added to Meeting Waitlist',
      message: `You have been ${status === 'registered' ? 'registered for' : 'added to the waitlist for'} ${meeting.title}`,
      type: 'success',
      related_resource_type: 'meeting',
      related_resource_id: meetingId
    });

    res.status(201).json({
      success: true,
      data: {
        registration,
        status,
        position: status === 'waitlist' ? currentRegistrations - meeting.max_attendees + 1 : null
      }
    });
  } catch (error) {
    console.error('Meeting registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to register for meeting'
      }
    });
  }
};
```

### Input Validation Examples

```javascript
// Validation middleware using Joi
const Joi = require('joi');

const validateCreateTask = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().min(10).max(2000).required(),
    type: Joi.string().valid('personal', 'assigned').required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    assigned_to: Joi.string().uuid().when('type', {
      is: 'assigned',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),
    due_date: Joi.date().iso().min('now').optional()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.details.reduce((acc, detail) => {
          acc[detail.path[0]] = detail.message;
          return acc;
        }, {})
      }
    });
  }

  req.body = value;
  next();
};

const validateCreateReport = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(255).required(),
    content: Joi.string().min(50).max(5000).required(),
    week_ending: Joi.date().iso().required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.details.reduce((acc, detail) => {
          acc[detail.path[0]] = detail.message;
          return acc;
        }, {})
      }
    });
  }

  req.body = value;
  next();
};
```

---

## 👥 Users API

### 1. Get All Users (Admin Only)
**GET** `{{baseUrl}}/users`

### 2. Get User by ID
**GET** `{{baseUrl}}/users/{{userId}}`

### 3. Get Current User Profile
**GET** `{{baseUrl}}/users/me`

### 4. Update User Profile
**PUT** `{{baseUrl}}/users/{{userId}}`

**Body:**
```json
{
  "full_name": "Updated Name",
  "phone_number": "+2348087654321"
}
```

### 5. Deactivate User (Admin Only)
**PATCH** `{{baseUrl}}/users/{{userId}}/status`

**Body:**
```json
{
  "is_active": false
}
```

### 6. Delete User (Admin Only)
**DELETE** `{{baseUrl}}/users/{{userId}}`

---

## ✅ Tasks API

### 1. Get All Tasks
**GET** `{{baseUrl}}/tasks`

**Query Parameters:**
```
page=1
limit=10
status=pending
priority=high
assigned_to=user-id
```

### 2. Get User's Tasks
**GET** `{{baseUrl}}/tasks/my-tasks`

### 3. Get Task by ID
**GET** `{{baseUrl}}/tasks/{{taskId}}`

### 4. Create Personal Task
**POST** `{{baseUrl}}/tasks`

**Body:**
```json
{
  "title": "Complete Project Documentation",
  "description": "Finalize all project documentation and submit for review",
  "type": "personal",
  "priority": "high"
}
```

### 5. Create Assigned Task (Admin Only)
**POST** `{{baseUrl}}/tasks`

**Body:**
```json
{
  "title": "Review Team Performance",
  "description": "Conduct weekly team performance review",
  "type": "assigned",
  "priority": "medium",
  "assigned_to": "target-user-id"
}
```

### 6. Update Task
**PUT** `{{baseUrl}}/tasks/{{taskId}}`

**Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "priority": "urgent"
}
```

### 7. Update Task Status
**PATCH** `{{baseUrl}}/tasks/{{taskId}}/status`

**Body:**
```json
{
  "status": "completed"
}
```

### 8. Accept Task
**PATCH** `{{baseUrl}}/tasks/{{taskId}}/accept`

### 9. Request Task Revision (Admin Only)
**PATCH** `{{baseUrl}}/tasks/{{taskId}}/revision`

**Body:**
```json
{
  "revision_notes": "Please add more details to the implementation section."
}
```

### 10. Delete Task
**DELETE** `{{baseUrl}}/tasks/{{taskId}}`

### 11. Bulk Update Tasks (Admin Only)
**PATCH** `{{baseUrl}}/tasks/bulk-update`

**Body:**
```json
{
  "task_ids": ["task-1", "task-2", "task-3"],
  "updates": {
    "status": "completed",
    "priority": "high"
  }
}
```

### 12. Search Tasks
**GET** `{{baseUrl}}/tasks/search`

**Query Parameters:**
```
q=search query
status=pending,in_progress
priority=high,urgent
assigned_to=user-id
date_from=2024-04-01
date_to=2024-04-30
page=1
limit=10
```

### 14. Get Task History
**GET** `{{baseUrl}}/tasks/{{taskId}}/history`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "history-1",
      "task_id": "task-123",
      "action": "status_changed",
      "old_value": "pending",
      "new_value": "in_progress",
      "changed_by": "user-456",
      "changed_at": "2024-04-21T10:30:00Z",
      "notes": "Started working on the task"
    }
  ]
}
```

### 15. Get Overdue Tasks
**GET** `{{baseUrl}}/tasks/overdue`

**Query Parameters:**
```
user_id=user-id (admin only)
days_overdue=7
```

---

## 📊 Reports API

### 1. Get All Reports (Admin Only)
**GET** `{{baseUrl}}/reports`

**Query Parameters:**
```
page=1
limit=10
user_id=user-id
status=submitted
```

### 2. Get User's Reports
**GET** `{{baseUrl}}/reports/my-reports`

### 3. Get Report by ID
**GET** `{{baseUrl}}/reports/{{reportId}}`

### 4. Submit Weekly Report
**POST** `{{baseUrl}}/reports`

**Body:**
```json
{
  "title": "Weekly Progress Report - Week 16",
  "content": "This week I completed the user authentication system and started working on the dashboard components.",
  "week_ending": "2024-04-19"
}
```

### 5. Update Report
**PUT** `{{baseUrl}}/reports/{{reportId}}`

**Body:**
```json
{
  "title": "Updated Report Title",
  "content": "Updated content"
}
```

### 6. Update Report Status (Admin Only)
**PATCH** `{{baseUrl}}/reports/{{reportId}}/status`

**Body:**
```json
{
  "status": "approved",
  "admin_feedback": "Great progress this week!"
}
```

### 7. Delete Report
**DELETE** `{{baseUrl}}/reports/{{reportId}}`

### 8. Search Reports
**GET** `{{baseUrl}}/reports/search`

**Query Parameters:**
```
q=search query
status=submitted,approved,rejected
user_id=user-id (admin only)
week_from=2024-04-01
week_to=2024-04-30
page=1
limit=10
```

### 9. Get Report Statistics (Admin Only)
**GET** `{{baseUrl}}/reports/statistics`

**Query Parameters:**
```
period=week|month|quarter
user_id=user-id (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_reports": 89,
    "submission_rate": 92.5,
    "approval_rate": 87.6,
    "avg_review_time": 1.5,
    "by_status": {
      "submitted": 12,
      "approved": 65,
      "rejected": 12
    }
  }
}
```

### 10. Bulk Approve Reports (Admin Only)
**PATCH** `{{baseUrl}}/reports/bulk-approve`

**Body:**
```json
{
  "report_ids": ["report-1", "report-2", "report-3"],
  "admin_feedback": "Great work this week!"
}
```

### 11. Export Reports
**GET** `{{baseUrl}}/reports/export`

**Query Parameters:**
```
format=csv|xlsx|pdf
period=month|quarter|year
user_id=user-id (admin only)
```

---

## 📅 Meetings API

### 1. Get All Meetings
**GET** `{{baseUrl}}/meetings`

**Query Parameters:**
```
page=1
limit=10
status=scheduled
date_from=2024-04-20
date_to=2024-04-30
```

### 2. Get Meeting by ID
**GET** `{{baseUrl}}/meetings/{{meetingId}}`

### 3. Get User's Meetings
**GET** `{{baseUrl}}/meetings/my-meetings`

### 4. Create Meeting (Admin Only)
**POST** `{{baseUrl}}/meetings`

**Body:**
```json
{
  "title": "Weekly Team Standup",
  "description": "Weekly progress review and planning session",
  "meeting_date": "2024-04-22",
  "meeting_time": "09:00",
  "duration": 60,
  "location": "Conference Room A",
  "meeting_type": "in-person",
  "max_attendees": 15
}
```

### 5. Update Meeting (Admin Only)
**PUT** `{{baseUrl}}/meetings/{{meetingId}}`

### 6. Register for Meeting
**POST** `{{baseUrl}}/meetings/{{meetingId}}/register`

### 7. Cancel Meeting Registration
**DELETE** `{{baseUrl}}/meetings/{{meetingId}}/register`

### 8. Update Meeting Status (Admin Only)
**PATCH** `{{baseUrl}}/meetings/{{meetingId}}/status`

**Body:**
```json
{
  "status": "completed"
}
```

### 9. Delete Meeting (Admin Only)
**DELETE** `{{baseUrl}}/meetings/{{meetingId}}`

### 10. Get Meeting Attendees
**GET** `{{baseUrl}}/meetings/{{meetingId}}/attendees`

**Response:**
```json
{
  "success": true,
  "data": {
    "registered": [
      {
        "user_id": "user-123",
        "name": "John Doe",
        "email": "john@example.com",
        "registered_at": "2024-04-20T10:00:00Z",
        "attendance_status": "confirmed"
      }
    ],
    "waitlist": [],
    "stats": {
      "total_registered": 15,
      "max_attendees": 20,
      "available_spots": 5
    }
  }
}
```

### 11. Mark Meeting Attendance (Admin Only)
**PATCH** `{{baseUrl}}/meetings/{{meetingId}}/attendance`

**Body:**
```json
{
  "attendees": [
    {
      "user_id": "user-123",
      "status": "present"
    },
    {
      "user_id": "user-456",
      "status": "absent"
    }
  ]
}
```

### 12. Get Meeting Minutes (Admin Only)
**GET** `{{baseUrl}}/meetings/{{meetingId}}/minutes`

### 13. Update Meeting Minutes (Admin Only)
**PUT** `{{baseUrl}}/meetings/{{meetingId}}/minutes`

**Body:**
```json
{
  "content": "Meeting minutes content here...",
  "action_items": [
    {
      "description": "Complete project documentation",
      "assigned_to": "user-123",
      "due_date": "2024-04-30"
    }
  ]
}
```

### 14. Search Meetings
**GET** `{{baseUrl}}/meetings/search`

**Query Parameters:**
```
q=search query
status=scheduled,completed,cancelled
type=in-person,virtual,hybrid
date_from=2024-04-01
date_to=2024-04-30
```

### 15. Get Recurring Meetings
**GET** `{{baseUrl}}/meetings/recurring`

### 16. Create Recurring Meeting (Admin Only)
**POST** `{{baseUrl}}/meetings/recurring`

**Body:**
```json
{
  "title": "Weekly Team Standup",
  "description": "Weekly progress review",
  "start_date": "2024-04-22",
  "time": "09:00",
  "duration": 60,
  "recurrence": {
    "type": "weekly",
    "interval": 1,
    "days_of_week": ["monday"],
    "end_date": "2024-12-31"
  },
  "location": "Conference Room A",
  "max_attendees": 15
}
```

---

## 🎉 Events API

### 1. Get All Events
**GET** `{{baseUrl}}/events`

**Query Parameters:**
```
page=1
limit=10
status=upcoming
type=workshop
featured=true
```

### 2. Get Event by ID
**GET** `{{baseUrl}}/events/{{eventId}}`

### 3. Get User's Registered Events
**GET** `{{baseUrl}}/events/my-events`

### 4. Create Event (Admin Only)
**POST** `{{baseUrl}}/events`

**Body:**
```json
{
  "title": "Innovation Workshop: AI in Business",
  "description": "Learn how to integrate AI solutions into your business processes",
  "event_date": "2024-04-28",
  "event_time": "10:00",
  "location": "Innovation Lab - Room 301",
  "max_participants": 25,
  "registration_deadline": "2024-04-26",
  "type": "workshop",
  "featured": true
}
```

### 5. Update Event (Admin Only)
**PUT** `{{baseUrl}}/events/{{eventId}}`

### 6. Register for Event
**POST** `{{baseUrl}}/events/{{eventId}}/register`

### 7. Cancel Event Registration
**DELETE** `{{baseUrl}}/events/{{eventId}}/register`

### 8. Update Event Status (Admin Only)
**PATCH** `{{baseUrl}}/events/{{eventId}}/status`

**Body:**
```json
{
  "status": "completed"
}
```

### 9. Delete Event (Admin Only)
**DELETE** `{{baseUrl}}/events/{{eventId}}`

### 10. Get Event Participants
**GET** `{{baseUrl}}/events/{{eventId}}/participants`

**Response:**
```json
{
  "success": true,
  "data": {
    "registered": [
      {
        "user_id": "user-123",
        "name": "John Doe",
        "email": "john@example.com",
        "registered_at": "2024-04-20T10:00:00Z",
        "attendance_status": "confirmed"
      }
    ],
    "waitlist": [
      {
        "user_id": "user-789",
        "name": "Jane Smith",
        "position": 1,
        "registered_at": "2024-04-21T09:00:00Z"
      }
    ],
    "stats": {
      "total_registered": 25,
      "max_participants": 25,
      "waitlist_count": 5
    }
  }
}
```

### 11. Mark Event Attendance (Admin Only)
**PATCH** `{{baseUrl}}/events/{{eventId}}/attendance`

**Body:**
```json
{
  "participants": [
    {
      "user_id": "user-123",
      "status": "attended"
    },
    {
      "user_id": "user-456",
      "status": "no_show"
    }
  ]
}
```

### 12. Get Event Feedback
**GET** `{{baseUrl}}/events/{{eventId}}/feedback`

### 13. Submit Event Feedback
**POST** `{{baseUrl}}/events/{{eventId}}/feedback`

**Body:**
```json
{
  "rating": 5,
  "comment": "Excellent workshop! Very informative and well-organized.",
  "would_recommend": true,
  "suggestions": "Maybe include more hands-on exercises."
}
```

### 14. Search Events
**GET** `{{baseUrl}}/events/search`

**Query Parameters:**
```
q=search query
type=workshop,seminar,networking,training
status=upcoming,completed,cancelled
featured=true
date_from=2024-04-01
date_to=2024-04-30
location=Innovation Lab
```

### 15. Get Featured Events
**GET** `{{baseUrl}}/events/featured`

### 16. Get Event Categories
**GET** `{{baseUrl}}/events/categories`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "workshop",
      "name": "Workshop",
      "description": "Hands-on learning sessions",
      "count": 12
    },
    {
      "id": "seminar",
      "name": "Seminar",
      "description": "Educational presentations",
      "count": 8
    }
  ]
}
```

### 17. Duplicate Event (Admin Only)
**POST** `{{baseUrl}}/events/{{eventId}}/duplicate`

**Body:**
```json
{
  "title": "Innovation Workshop: AI in Business - Session 2",
  "event_date": "2024-05-15",
  "event_time": "10:00"
}
```

---

## 🔔 Notifications API

### 1. Get User Notifications
**GET** `{{baseUrl}}/notifications`

**Query Parameters:**
```
page=1
limit=10
is_read=false
type=info
```

### 2. Get Notification by ID
**GET** `{{baseUrl}}/notifications/{{notificationId}}`

### 3. Create Notification (Admin Only)
**POST** `{{baseUrl}}/notifications`

**Body:**
```json
{
  "user_id": "target-user-id",
  "title": "New Task Assigned",
  "message": "You have been assigned a new task: Complete Project Documentation",
  "type": "info"
}
```

### 4. Mark Notification as Read
**PATCH** `{{baseUrl}}/notifications/{{notificationId}}/read`

### 5. Mark All Notifications as Read
**PATCH** `{{baseUrl}}/notifications/mark-all-read`

### 6. Delete Notification
**DELETE** `{{baseUrl}}/notifications/{{notificationId}}`

### 7. Get Unread Count
**GET** `{{baseUrl}}/notifications/unread-count`

### 8. Bulk Mark as Read
**PATCH** `{{baseUrl}}/notifications/bulk-read`

**Body:**
```json
{
  "notification_ids": ["notif-1", "notif-2", "notif-3"]
}
```

### 9. Get Notification Preferences
**GET** `{{baseUrl}}/notifications/preferences`

**Response:**
```json
{
  "success": true,
  "data": {
    "email_notifications": true,
    "push_notifications": true,
    "task_assignments": true,
    "task_updates": true,
    "meeting_reminders": true,
    "event_announcements": true,
    "report_feedback": true,
    "system_updates": false
  }
}
```

### 11. Update Notification Preferences
**PUT** `{{baseUrl}}/notifications/preferences`

**Body:**
```json
{
  "email_notifications": true,
  "push_notifications": false,
  "task_assignments": true,
  "task_updates": true,
  "meeting_reminders": true,
  "event_announcements": false,
  "report_feedback": true,
  "system_updates": false
}
```

### 12. Send Notification to All Users (Admin Only)
**POST** `{{baseUrl}}/notifications/send-all`

**Description:** Send a notification to all users in the system.

**Body:**
```json
{
  "title": "System Maintenance Notice",
  "message": "The system will be under maintenance on Sunday from 2-4 AM.",
  "type": "warning",
  "send_email": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Notification sent to all users",
    "recipients_count": 45,
    "notification_id": "notif-bulk-123"
  }
}
```

### 13. Send Notification to Specific User (Admin Only)
**POST** `{{baseUrl}}/notifications/send-user`

**Description:** Send a notification to a specific user.

**Body:**
```json
{
  "user_id": "user-123",
  "title": "Task Assignment Update",
  "message": "Your task deadline has been extended to next Friday.",
  "type": "info",
  "send_email": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Notification sent successfully",
    "recipient": {
      "user_id": "user-123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "notification_id": "notif-456"
  }
}
```

### 14. Send Notification to User Group (Admin Only)
**POST** `{{baseUrl}}/notifications/send-group`

**Description:** Send a notification to a specific group of users (members, admins, etc.).

**Body:**
```json
{
  "target_group": "members",
  "title": "Weekly Report Reminder",
  "message": "Don't forget to submit your weekly report by Friday.",
  "type": "info",
  "send_email": true
}
```

**Query Parameters for target_group:**
- `all` - All users
- `members` - Members only
- `admins` - Admins only

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Notification sent to members",
    "recipients_count": 38,
    "notification_id": "notif-group-789"
  }
}
```

### 15. Send Bulk Notifications (Admin Only)
**POST** `{{baseUrl}}/notifications/bulk-send`

**Description:** Send a notification to multiple specific users.

**Body:**
```json
{
  "user_ids": ["user-1", "user-2", "user-3"],
  "title": "Meeting Reminder",
  "message": "You have a team meeting tomorrow at 10 AM.",
  "type": "info",
  "send_email": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Notification sent to selected users",
    "recipients_count": 3,
    "failed_recipients": [],
    "notification_id": "notif-bulk-456"
  }
}
```

### 16. Get Notification Templates (Admin Only)
**GET** `{{baseUrl}}/notifications/templates`

### 17. Create Notification Template (Admin Only)
**POST** `{{baseUrl}}/notifications/templates`

**Body:**
```json
{
  "name": "Task Assignment",
  "subject": "New Task Assigned: {{task_title}}",
  "body": "You have been assigned a new task: {{task_title}}. Due date: {{due_date}}",
  "type": "info",
  "variables": ["task_title", "due_date", "assigned_by"]
}
```

---

## 📊 Dashboard & Analytics

### 1. Get Dashboard Statistics
**GET** `{{baseUrl}}/dashboard/stats`

**Description:** Get overall dashboard statistics for the current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": {
      "total": 25,
      "active": 8,
      "pending": 3,
      "completed": 12,
      "acknowledged": 2
    },
    "reports": {
      "total": 12,
      "submitted": 10,
      "approved": 8,
      "pending_review": 2
    },
    "meetings": {
      "upcoming": 3,
      "attended": 15,
      "missed": 1
    },
    "events": {
      "registered": 5,
      "attended": 3,
      "upcoming": 2
    }
  }
}
```

### 2. Get Admin Dashboard Statistics (Admin Only)
**GET** `{{baseUrl}}/admin/dashboard/stats`

**Description:** Get comprehensive statistics for admin dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 45,
      "active": 42,
      "inactive": 3,
      "new_this_month": 8
    },
    "tasks": {
      "total": 156,
      "pending": 23,
      "in_progress": 45,
      "completed": 78,
      "overdue": 10
    },
    "reports": {
      "total": 89,
      "pending_review": 12,
      "approved": 65,
      "rejected": 12
    },
    "meetings": {
      "scheduled": 15,
      "completed": 45,
      "cancelled": 3
    },
    "events": {
      "upcoming": 8,
      "completed": 12,
      "total_registrations": 234
    }
  }
}
```

### 3. Get User Activity Analytics
**GET** `{{baseUrl}}/analytics/user-activity`

**Query Parameters:**
```
period=week|month|quarter|year
user_id=user-id (admin only)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "user_id": "user-123",
    "activity": {
      "tasks_completed": 15,
      "reports_submitted": 4,
      "meetings_attended": 8,
      "events_participated": 3,
      "login_frequency": 22,
      "avg_task_completion_time": 2.5
    },
    "trends": {
      "tasks": [2, 4, 3, 6],
      "reports": [1, 1, 1, 1],
      "meetings": [2, 2, 2, 2]
    }
  }
}
```

### 4. Get Task Performance Metrics
**GET** `{{baseUrl}}/analytics/task-performance`

**Query Parameters:**
```
period=week|month|quarter
team_id=team-id (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "metrics": {
      "total_tasks": 156,
      "completion_rate": 85.2,
      "avg_completion_time": 3.2,
      "overdue_rate": 6.4,
      "revision_rate": 12.8
    },
    "by_priority": {
      "urgent": { "total": 12, "completed": 11, "rate": 91.7 },
      "high": { "total": 34, "completed": 29, "rate": 85.3 },
      "medium": { "total": 78, "completed": 67, "rate": 85.9 },
      "low": { "total": 32, "completed": 26, "rate": 81.3 }
    },
    "by_user": [
      {
        "user_id": "user-123",
        "name": "John Doe",
        "tasks_assigned": 15,
        "tasks_completed": 13,
        "completion_rate": 86.7
      }
    ]
  }
}
```

### 5. Get Report Submission Trends
**GET** `{{baseUrl}}/analytics/report-trends`

**Query Parameters:**
```
period=month|quarter|year
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "quarter",
    "trends": {
      "submissions": [12, 15, 18, 14, 16, 19, 17, 20, 22, 18, 21, 23],
      "approval_rate": [85, 88, 92, 89, 91, 94, 87, 93, 95, 90, 92, 96],
      "avg_review_time": [2.1, 1.8, 1.5, 1.9, 1.6, 1.4, 1.7, 1.3, 1.2, 1.5, 1.1, 1.0]
    },
    "summary": {
      "total_submissions": 205,
      "avg_approval_rate": 90.2,
      "avg_review_time_days": 1.5
    }
  }
}
```

### 6. Export Analytics Data
**GET** `{{baseUrl}}/analytics/export`

**Query Parameters:**
```
type=tasks|reports|meetings|events|users
format=csv|xlsx|json
period=month|quarter|year
start_date=2024-01-01
end_date=2024-04-21
```

**Response:** File download or JSON with download URL

---

## 📁 File Upload API

### 1. Upload Report Attachment
**POST** `{{baseUrl}}/uploads/reports`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: multipart/form-data
```

**Body:** (Form Data)
```
file: [PDF file]
report_id: report-uuid
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file_url": "http://localhost:3001/uploads/reports/filename.pdf",
    "file_name": "filename.pdf",
    "file_size": 1024000
  }
}
```

### 2. Delete File
**DELETE** `{{baseUrl}}/uploads/{{fileId}}`

### 3. Get File
**GET** `{{baseUrl}}/uploads/reports/{{filename}}`

### 4. Upload Profile Picture
**POST** `{{baseUrl}}/uploads/profile`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: multipart/form-data
```

**Body:** (Form Data)
```
file: [Image file - JPG, PNG, GIF]
user_id: user-uuid
```

### 5. Upload Event Banner (Admin Only)
**POST** `{{baseUrl}}/uploads/events`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: multipart/form-data
```

**Body:** (Form Data)
```
file: [Image file]
event_id: event-uuid
```

### 6. Upload Meeting Documents (Admin Only)
**POST** `{{baseUrl}}/uploads/meetings`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: multipart/form-data
```

**Body:** (Form Data)
```
file: [PDF, DOC, DOCX file]
meeting_id: meeting-uuid
document_type: agenda|minutes|presentation
```

### 7. Get File Metadata
**GET** `{{baseUrl}}/uploads/{{fileId}}/metadata`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file-123",
    "filename": "report.pdf",
    "original_name": "Weekly Report - Week 16.pdf",
    "size": 1024000,
    "mime_type": "application/pdf",
    "uploaded_by": "user-456",
    "uploaded_at": "2024-04-21T10:30:00Z",
    "category": "report",
    "is_public": false
  }
}
```

### 8. Get User Files
**GET** `{{baseUrl}}/uploads/my-files`

**Query Parameters:**
```
category=reports|profile|documents
page=1
limit=10
```

### 9. Get Storage Usage
**GET** `{{baseUrl}}/uploads/storage-usage`

**Response:**
```json
{
  "success": true,
  "data": {
    "used_bytes": 52428800,
    "used_mb": 50,
    "limit_mb": 1000,
    "usage_percentage": 5.0,
    "by_category": {
      "reports": 30,
      "profile": 5,
      "documents": 15
    }
  }
}
```

---

## 🔧 System Administration

### 1. Get System Settings (Admin Only)
**GET** `{{baseUrl}}/admin/settings`

**Response:**
```json
{
  "success": true,
  "data": {
    "app_name": "Startup Kano Portfolio",
    "app_version": "1.0.0",
    "maintenance_mode": false,
    "registration_enabled": true,
    "max_file_size_mb": 10,
    "allowed_file_types": ["pdf", "doc", "docx", "jpg", "png"],
    "session_timeout_minutes": 60,
    "password_policy": {
      "min_length": 8,
      "require_uppercase": true,
      "require_lowercase": true,
      "require_numbers": true,
      "require_symbols": false
    }
  }
}
```

### 2. Update System Settings (Admin Only)
**PUT** `{{baseUrl}}/admin/settings`

**Body:**
```json
{
  "maintenance_mode": false,
  "registration_enabled": true,
  "max_file_size_mb": 15,
  "session_timeout_minutes": 120
}
```

### 3. Get Audit Logs (Admin Only)
**GET** `{{baseUrl}}/admin/audit-logs`

**Query Parameters:**
```
user_id=user-id
action=login|logout|create|update|delete
resource=users|tasks|reports|meetings|events
date_from=2024-04-01
date_to=2024-04-21
page=1
limit=50
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "log-123",
      "user_id": "user-456",
      "user_name": "John Doe",
      "action": "create",
      "resource": "task",
      "resource_id": "task-789",
      "details": {
        "title": "Complete Project Documentation",
        "assigned_to": "user-123"
      },
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "timestamp": "2024-04-21T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "total_pages": 25
  }
}
```

### 4. Backup Database (Admin Only)
**POST** `{{baseUrl}}/admin/backup`

**Response:**
```json
{
  "success": true,
  "data": {
    "backup_id": "backup-20240421-103000",
    "filename": "startup_kano_backup_20240421_103000.sql",
    "size_bytes": 5242880,
    "created_at": "2024-04-21T10:30:00Z",
    "download_url": "/admin/backups/backup-20240421-103000/download"
  }
}
```

### 5. Get System Logs (Admin Only)
**GET** `{{baseUrl}}/admin/logs`

**Query Parameters:**
```
level=error|warn|info|debug
date_from=2024-04-01
date_to=2024-04-21
page=1
limit=100
```

### 6. Clear Cache (Admin Only)
**POST** `{{baseUrl}}/admin/cache/clear`

**Body:**
```json
{
  "cache_types": ["user_sessions", "api_responses", "file_metadata"]
}
```

---

## 🔍 Search & Filtering

### 1. Global Search
**GET** `{{baseUrl}}/search`

**Query Parameters:**
```
q=search query
types=users,tasks,reports,meetings,events
limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-123",
        "name": "John Doe",
        "email": "john@example.com",
        "type": "user"
      }
    ],
    "tasks": [
      {
        "id": "task-456",
        "title": "Complete Project Documentation",
        "status": "pending",
        "type": "task"
      }
    ],
    "reports": [],
    "meetings": [],
    "events": [],
    "total_results": 15
  }
}
```

### 2. Advanced Search
**POST** `{{baseUrl}}/search/advanced`

**Body:**
```json
{
  "query": "project documentation",
  "filters": {
    "types": ["tasks", "reports"],
    "date_range": {
      "start": "2024-04-01",
      "end": "2024-04-21"
    },
    "status": ["pending", "in_progress"],
    "priority": ["high", "urgent"],
    "assigned_to": ["user-123", "user-456"]
  },
  "sort": {
    "field": "created_at",
    "order": "desc"
  },
  "page": 1,
  "limit": 20
}
```

### 3. Get Search Suggestions
**GET** `{{baseUrl}}/search/suggestions`

**Query Parameters:**
```
q=partial query
type=users|tasks|reports|meetings|events
limit=10
```

### 4. Save Search Query
**POST** `{{baseUrl}}/search/saved`

**Body:**
```json
{
  "name": "My High Priority Tasks",
  "query": "high priority tasks assigned to me",
  "filters": {
    "types": ["tasks"],
    "priority": ["high", "urgent"],
    "assigned_to": ["current_user"]
  }
}
```

### 5. Get Saved Searches
**GET** `{{baseUrl}}/search/saved`

---

## 📧 Email & Communications

### 1. Send Email (Admin Only)
**POST** `{{baseUrl}}/communications/email`

**Body:**
```json
{
  "to": ["user1@example.com", "user2@example.com"],
  "cc": ["manager@example.com"],
  "subject": "Weekly Team Update",
  "body": "HTML or plain text email content",
  "template": "weekly_update",
  "variables": {
    "week_ending": "2024-04-21",
    "team_name": "Development Team"
  }
}
```

### 2. Get Email Templates (Admin Only)
**GET** `{{baseUrl}}/communications/email-templates`

### 3. Create Email Template (Admin Only)
**POST** `{{baseUrl}}/communications/email-templates`

**Body:**
```json
{
  "name": "Task Assignment",
  "subject": "New Task Assigned: {{task_title}}",
  "body": "<h1>New Task Assignment</h1><p>You have been assigned: {{task_title}}</p>",
  "variables": ["task_title", "due_date", "assigned_by"]
}
```

### 4. Send SMS Notification (Admin Only)
**POST** `{{baseUrl}}/communications/sms`

**Body:**
```json
{
  "to": ["+2348012345678"],
  "message": "Reminder: You have a meeting at 2 PM today.",
  "template": "meeting_reminder",
  "variables": {
    "meeting_title": "Weekly Standup",
    "meeting_time": "2:00 PM"
  }
}
```

### 5. Get Communication History
**GET** `{{baseUrl}}/communications/history`

**Query Parameters:**
```
user_id=user-id
type=email|sms|notification
date_from=2024-04-01
date_to=2024-04-21
```

---

## ⚠️ Error Handling

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `409` | Conflict |
| `422` | Unprocessable Entity |
| `500` | Internal Server Error |

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

### Success Response Format
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

---

## 🧪 Test Scripts

### Pre-request Script (Set Auth Token)
```javascript
// Get auth token from environment or previous request
const authToken = pm.environment.get("authToken");
if (authToken) {
    pm.request.headers.add({
        key: "Authorization",
        value: `Bearer ${authToken}`
    });
}

// Add request timestamp
pm.environment.set("requestTimestamp", new Date().toISOString());

// Set common headers
pm.request.headers.add({
    key: "X-Client-Version",
    value: "1.0.0"
});

pm.request.headers.add({
    key: "X-Request-ID",
    value: pm.variables.replaceIn("{{$guid}}")
});
```

### Test Script (Save Auth Token)
```javascript
// Save auth token from login response
if (pm.response.code === 200 || pm.response.code === 201) {
    const responseJson = pm.response.json();
    if (responseJson.success && responseJson.data) {
        // Save auth token
        if (responseJson.data.token) {
            pm.environment.set("authToken", responseJson.data.token);
        }
        
        // Save user info
        if (responseJson.data.user) {
            pm.environment.set("userId", responseJson.data.user.id);
            pm.environment.set("userRole", responseJson.data.user.role);
            pm.environment.set("userEmail", responseJson.data.user.email);
        }
        
        // Save resource IDs for chaining requests
        if (responseJson.data.id) {
            pm.environment.set("lastCreatedId", responseJson.data.id);
        }
    }
}

// Test response status
pm.test("Status code is successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);
});

// Test response format
pm.test("Response has success field", function () {
    if (pm.response.code !== 204) {
        const responseJson = pm.response.json();
        pm.expect(responseJson).to.have.property('success');
        pm.expect(responseJson.success).to.be.a('boolean');
    }
});

// Test response time
pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Test for required fields in success responses
pm.test("Success response has data field", function () {
    if (pm.response.code === 200 || pm.response.code === 201) {
        const responseJson = pm.response.json();
        if (responseJson.success) {
            pm.expect(responseJson).to.have.property('data');
        }
    }
});

// Test error responses
pm.test("Error response has proper format", function () {
    if (pm.response.code >= 400) {
        const responseJson = pm.response.json();
        pm.expect(responseJson).to.have.property('success');
        pm.expect(responseJson.success).to.be.false;
        pm.expect(responseJson).to.have.property('error');
        pm.expect(responseJson.error).to.have.property('message');
    }
});

// Test pagination for list endpoints
pm.test("List responses have pagination meta", function () {
    if (pm.response.code === 200) {
        const responseJson = pm.response.json();
        const url = pm.request.url.toString();
        
        // Check if this is a list endpoint
        const listEndpoints = ['/users', '/tasks', '/reports', '/meetings', '/events', '/notifications'];
        const isListEndpoint = listEndpoints.some(endpoint => url.includes(endpoint) && !url.includes('/my-'));
        
        if (isListEndpoint && responseJson.success && Array.isArray(responseJson.data)) {
            pm.expect(responseJson).to.have.property('meta');
            pm.expect(responseJson.meta).to.have.property('page');
            pm.expect(responseJson.meta).to.have.property('limit');
            pm.expect(responseJson.meta).to.have.property('total');
        }
    }
});

// Log response for debugging
console.log("Response:", pm.response.json());
```

### Collection-level Pre-request Script
```javascript
// Set base URL if not already set
if (!pm.environment.get("baseUrl")) {
    pm.environment.set("baseUrl", "http://localhost:3001/api/v1");
}

// Generate unique test data
pm.environment.set("testEmail", `test.${Date.now()}@example.com`);
pm.environment.set("testPhone", `+234801${Math.floor(Math.random() * 10000000)}`);
pm.environment.set("timestamp", new Date().toISOString());

// Helper function to generate random string
pm.globals.set("generateRandomString", function(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
});
```

### Environment Variables for Testing
```javascript
// Development Environment
{
  "baseUrl": "http://localhost:3001/api/v1",
  "authToken": "",
  "userId": "",
  "userRole": "",
  "userEmail": "",
  "testEmail": "",
  "testPhone": "",
  "lastCreatedId": "",
  "requestTimestamp": ""
}

// Staging Environment
{
  "baseUrl": "https://staging-api.startupkano.com/api/v1",
  "authToken": "",
  "userId": "",
  "userRole": "",
  "userEmail": "",
  "testEmail": "",
  "testPhone": "",
  "lastCreatedId": "",
  "requestTimestamp": ""
}

// Production Environment
{
  "baseUrl": "https://api.startupkano.com/api/v1",
  "authToken": "",
  "userId": "",
  "userRole": "",
  "userEmail": "",
  "testEmail": "",
  "testPhone": "",
  "lastCreatedId": "",
  "requestTimestamp": ""
}
```

---

## 📝 Notes

### API Design Principles
1. **RESTful Design**: All endpoints follow REST conventions
2. **Consistent Response Format**: All responses use the same success/error structure
3. **HTTP Status Codes**: Proper status codes for different scenarios
4. **Authentication**: JWT-based authentication for all protected endpoints
5. **Authorization**: Role-based access control (RBAC) for admin-only endpoints
6. **Pagination**: Consistent pagination for list endpoints
7. **Filtering & Search**: Query parameters for filtering and searching
8. **Bulk Operations**: Batch operations for efficiency
9. **File Uploads**: Multipart form data for file uploads
10. **Audit Trail**: Comprehensive logging for all operations

### Security Considerations
1. **Authentication**: All endpoints except signup/login require JWT authentication
2. **Authorization**: Role-based permissions (admin vs member)
3. **Input Validation**: Server-side validation for all inputs
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **CORS**: Configure CORS for frontend integration
6. **HTTPS**: Use HTTPS in production
7. **File Upload Security**: Validate file types and sizes
8. **SQL Injection**: Use parameterized queries
9. **XSS Protection**: Sanitize user inputs
10. **Password Security**: Hash passwords with bcrypt

### Performance Optimization
1. **Pagination**: Use `page` and `limit` parameters for large datasets
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Database Indexing**: Add indexes on frequently queried fields
4. **Compression**: Enable gzip compression
5. **CDN**: Use CDN for file uploads and static assets
6. **Connection Pooling**: Use database connection pooling
7. **Lazy Loading**: Implement lazy loading for related data
8. **Background Jobs**: Use queues for heavy operations

### Testing Strategy
1. **Unit Tests**: Test individual API endpoints
2. **Integration Tests**: Test endpoint interactions
3. **Load Testing**: Test performance under load
4. **Security Testing**: Test for vulnerabilities
5. **API Documentation**: Keep documentation updated
6. **Mock Data**: Use consistent test data
7. **Environment Separation**: Separate dev/staging/prod environments

### Monitoring & Logging
1. **Request Logging**: Log all API requests
2. **Error Tracking**: Monitor and track errors
3. **Performance Metrics**: Track response times
4. **Health Checks**: Implement health check endpoints
5. **Audit Logs**: Track user actions
6. **Alerts**: Set up alerts for critical issues
7. **Analytics**: Track API usage patterns

### Deployment Considerations
1. **Environment Variables**: Use environment variables for configuration
2. **Database Migrations**: Version control database schema changes
3. **Backup Strategy**: Regular database backups
4. **Rollback Plan**: Plan for rolling back deployments
5. **Load Balancing**: Use load balancers for high availability
6. **SSL Certificates**: Ensure SSL certificates are valid
7. **Monitoring**: Set up monitoring and alerting

### API Versioning
- Current version: `v1`
- Version in URL path: `/api/v1/`
- Backward compatibility maintained
- Deprecation notices for old versions
- Migration guides for version updates

### Rate Limiting
- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated users
- Higher limits for admin users
- Rate limit headers in responses
- 429 status code when limit exceeded

### Error Codes Reference
| Code | Description | Action |
|------|-------------|---------|
| `AUTH_REQUIRED` | Authentication required | Provide valid JWT token |
| `INVALID_CREDENTIALS` | Invalid login credentials | Check email/password |
| `ACCESS_DENIED` | Insufficient permissions | Contact admin for access |
| `VALIDATION_ERROR` | Input validation failed | Fix input data |
| `RESOURCE_NOT_FOUND` | Resource doesn't exist | Check resource ID |
| `DUPLICATE_RESOURCE` | Resource already exists | Use different identifier |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait before retrying |
| `FILE_TOO_LARGE` | File size exceeds limit | Use smaller file |
| `INVALID_FILE_TYPE` | File type not allowed | Use supported file type |
| `SERVER_ERROR` | Internal server error | Contact support |

---

## 🧪 Testing & Validation

### Required Test Coverage

#### Unit Tests
```javascript
// Example test structure (Jest/Mocha)
describe('Task API', () => {
  describe('POST /tasks', () => {
    it('should create a personal task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        type: 'personal',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.assigned_to).toBe(userId);
    });

    it('should prevent non-admin from assigning tasks', async () => {
      const taskData = {
        title: 'Assigned Task',
        description: 'Test Description',
        type: 'assigned',
        assigned_to: 'other-user-id'
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${memberToken}`)
        .send(taskData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

#### Integration Tests
- Test complete user workflows
- Test authentication flows
- Test file upload processes
- Test email sending
- Test database transactions

#### API Tests (Postman/Newman)
- All endpoints return correct status codes
- Response formats match specifications
- Authentication works correctly
- Authorization rules are enforced
- Error handling works properly

### Performance Requirements
- Response time < 200ms for simple queries
- Response time < 1s for complex queries
- Support 100 concurrent users
- Database queries optimized with indexes
- File uploads handle up to 10MB files
- API rate limiting implemented

---

## 🚀 Deployment Requirements

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/startup_kano
DATABASE_SSL=false

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-here

# Server Configuration
PORT=3001
NODE_ENV=production
API_VERSION=v1

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png,gif

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@startupkano.com
FROM_NAME=Startup Kano Portfolio

# Redis (optional)
REDIS_URL=redis://localhost:6379

# AWS S3 (if using cloud storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=startup-kano-files

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
RATE_LIMIT_MAX_REQUESTS=1000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/health || exit 1

# Start application
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/startup_kano
      - JWT_SECRET=your-jwt-secret
      - JWT_REFRESH_SECRET=your-refresh-secret
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=startup_kano
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] CORS configured for frontend domain
- [ ] Rate limiting enabled
- [ ] File upload directory permissions set
- [ ] Email service configured and tested
- [ ] Backup strategy implemented
- [ ] Monitoring and logging set up
- [ ] Health checks working
- [ ] Load balancer configured (if needed)
- [ ] CDN configured for file uploads (if needed)

### Monitoring & Logging
```javascript
// Logging middleware
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.sub
    });
  });
  
  next();
};
```

### Security Headers
```javascript
// Security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📞 Support & Maintenance

### API Documentation
- Generate OpenAPI/Swagger documentation
- Keep documentation updated with code changes
- Provide example requests/responses
- Document error codes and meanings

### Backup Strategy
- Daily database backups
- Weekly full system backups
- Test backup restoration monthly
- Store backups in multiple locations

### Update Process
- Use semantic versioning
- Maintain backward compatibility
- Provide migration guides
- Test updates in staging environment

### Support Contacts
- Technical issues: Contact project maintainer
- API questions: Refer to this documentation
- Feature requests: Submit through proper channels

---

## ✅ Implementation Checklist

### Phase 1: Core Setup
- [ ] Set up project structure
- [ ] Configure database connection
- [ ] Implement authentication system
- [ ] Create user management endpoints
- [ ] Set up basic error handling

### Phase 2: Core Features
- [ ] Implement task management
- [ ] Implement report system
- [ ] Implement meeting management
- [ ] Implement event management
- [ ] Add notification system

### Phase 3: Advanced Features
- [ ] Add file upload functionality
- [ ] Implement search and filtering
- [ ] Add dashboard analytics
- [ ] Implement email notifications
- [ ] Add audit logging

### Phase 4: Production Ready
- [ ] Add comprehensive testing
- [ ] Implement rate limiting
- [ ] Add monitoring and logging
- [ ] Configure deployment
- [ ] Set up backup systems

### Phase 5: Documentation & Handover
- [ ] Complete API documentation
- [ ] Create deployment guide
- [ ] Provide testing instructions
- [ ] Conduct code review
- [ ] Hand over to frontend team

---

## 🔗 Backend Implementation Notes

- Use JWT for authentication
- Implement role-based access control (RBAC)
- Add input validation and sanitization
- Use proper HTTP status codes
- Implement pagination for list endpoints
- Add logging and monitoring
- Use environment variables for configuration
- Implement proper error handling

---

