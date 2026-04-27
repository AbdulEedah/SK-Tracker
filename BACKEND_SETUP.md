# Backend Setup Guide

This document explains how to set up a custom backend for the Startup Kano Portfolio application after removing Supabase dependencies.

## 🚀 Quick Start

The frontend is now configured to work with a custom REST API backend. You need to create a backend server that implements the API endpoints defined in the [Postman Collection](./POSTMAN_COLLECTION.md).

## 🔧 Environment Configuration

1. Copy the environment example file:
```bash
cp .env.example .env.local
```

2. Update the API URL in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NODE_ENV=development
```

## 📋 Required API Endpoints

Your backend must implement these endpoints (see [POSTMAN_COLLECTION.md](./POSTMAN_COLLECTION.md) for details):

### Authentication
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`

### Users
- `GET /api/v1/users` (Admin only)
- `GET /api/v1/users/me`
- `GET /api/v1/users/:id`
- `PUT /api/v1/users/:id`
- `PATCH /api/v1/users/:id/status`
- `DELETE /api/v1/users/:id`

### Tasks
- `GET /api/v1/tasks/my-tasks`
- `GET /api/v1/tasks/:id`
- `POST /api/v1/tasks`
- `PUT /api/v1/tasks/:id`
- `PATCH /api/v1/tasks/:id/status`
- `PATCH /api/v1/tasks/:id/accept`
- `PATCH /api/v1/tasks/:id/revision`
- `DELETE /api/v1/tasks/:id`

### Reports
- `GET /api/v1/reports/my-reports`
- `GET /api/v1/reports/:id`
- `POST /api/v1/reports`
- `PUT /api/v1/reports/:id`
- `PATCH /api/v1/reports/:id/status`
- `DELETE /api/v1/reports/:id`

### Meetings
- `GET /api/v1/meetings/my-meetings`
- `GET /api/v1/meetings/:id`
- `POST /api/v1/meetings`
- `PUT /api/v1/meetings/:id`
- `POST /api/v1/meetings/:id/register`
- `DELETE /api/v1/meetings/:id/register`
- `PATCH /api/v1/meetings/:id/status`
- `DELETE /api/v1/meetings/:id`

### Events
- `GET /api/v1/events/my-events`
- `GET /api/v1/events/:id`
- `POST /api/v1/events`
- `PUT /api/v1/events/:id`
- `POST /api/v1/events/:id/register`
- `DELETE /api/v1/events/:id/register`
- `PATCH /api/v1/events/:id/status`
- `DELETE /api/v1/events/:id`

### Notifications
- `GET /api/v1/notifications`
- `GET /api/v1/notifications/:id`
- `POST /api/v1/notifications`
- `PATCH /api/v1/notifications/:id/read`
- `PATCH /api/v1/notifications/mark-all-read`
- `DELETE /api/v1/notifications/:id`
- `GET /api/v1/notifications/unread-count`

### File Uploads
- `POST /api/v1/uploads/reports`
- `DELETE /api/v1/uploads/:id`
- `GET /api/v1/uploads/reports/:filename`

### Health Check
- `GET /api/v1/health`

## 🗄️ Database Schema

Based on the original Supabase schema, your database should have these tables:

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR NOT NULL,
    phone_number VARCHAR,
    role VARCHAR CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR CHECK (type IN ('personal', 'assigned')) NOT NULL,
    status VARCHAR CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'acknowledged', 'revision_requested')) DEFAULT 'pending',
    priority VARCHAR CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id) NOT NULL,
    assigned_by UUID REFERENCES users(id),
    is_personal BOOLEAN DEFAULT false,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    acknowledged_at TIMESTAMP,
    revision_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Reports Table
```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    week_ending DATE NOT NULL,
    status VARCHAR CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')) DEFAULT 'submitted',
    admin_feedback TEXT,
    attachment_url VARCHAR,
    attachment_name VARCHAR,
    submitted_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Meetings Table
```sql
CREATE TABLE meetings (
    id UUID PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    meeting_date DATE NOT NULL,
    meeting_time TIME NOT NULL,
    duration INTEGER NOT NULL,
    location VARCHAR NOT NULL,
    meeting_type VARCHAR CHECK (meeting_type IN ('in-person', 'virtual', 'hybrid')) NOT NULL,
    meeting_link VARCHAR,
    max_attendees INTEGER,
    status VARCHAR CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')) DEFAULT 'scheduled',
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Meeting Attendees Table
```sql
CREATE TABLE meeting_attendees (
    id UUID PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    status VARCHAR CHECK (status IN ('invited', 'registered', 'attended', 'cancelled')) DEFAULT 'registered',
    registered_at TIMESTAMP DEFAULT NOW(),
    joined_at TIMESTAMP
);
```

### Events Table
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR NOT NULL,
    max_participants INTEGER,
    registration_deadline DATE,
    status VARCHAR CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
    type VARCHAR,
    featured BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Event Registrations Table
```sql
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    status VARCHAR CHECK (status IN ('registered', 'attended', 'cancelled')) DEFAULT 'registered',
    registered_at TIMESTAMP DEFAULT NOW()
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Authentication

Your backend should implement JWT-based authentication:

1. **Login Response Format:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "User Name",
      "role": "member"
    },
    "token": "jwt-token-here",
    "refresh_token": "refresh-token-here"
  }
}
```

2. **Protected Routes:** All endpoints except `/auth/signup` and `/auth/login` require the `Authorization: Bearer <token>` header.

3. **Role-Based Access:** Admin-only endpoints should check the user's role.

## 📝 Response Format

All API responses should follow this format:

### Success Response
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

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      // Additional error details
    }
  }
}
```

## 🚀 Backend Technology Suggestions

You can implement the backend using any technology stack. Here are some popular options:

### Node.js + Express
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma/TypeORM
- **Authentication:** jsonwebtoken
- **File Upload:** multer
- **Validation:** joi or yup

### Python + FastAPI
- **Framework:** FastAPI
- **Database:** PostgreSQL with SQLAlchemy
- **Authentication:** python-jose
- **File Upload:** python-multipart
- **Validation:** Pydantic

### Go + Gin
- **Framework:** Gin
- **Database:** PostgreSQL with GORM
- **Authentication:** golang-jwt
- **File Upload:** Built-in multipart
- **Validation:** go-playground/validator

### Java + Spring Boot
- **Framework:** Spring Boot
- **Database:** PostgreSQL with JPA
- **Authentication:** Spring Security + JWT
- **File Upload:** Spring Web
- **Validation:** Bean Validation

## 🔄 Development Mode

The frontend includes offline/mock mode for development:

1. If the backend is not available (health check fails), the app will use mock data
2. Mock users and tasks are defined in `/src/lib/api.ts`
3. This allows frontend development without a backend

## 📚 Next Steps

1. Choose your backend technology stack
2. Set up the database with the provided schema
3. Implement the API endpoints following the Postman collection
4. Test the integration with the frontend
5. Deploy both frontend and backend

## 🐛 Troubleshooting

### CORS Issues
Make sure your backend allows requests from your frontend domain:
```javascript
// Express.js example
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

### Authentication Issues
- Ensure JWT tokens are properly signed and verified
- Check token expiration times
- Verify the Authorization header format: `Bearer <token>`

### Database Connection
- Verify database connection strings
- Check if all required tables exist
- Ensure proper indexes are created for performance

---

For detailed API specifications, refer to the [Postman Collection](./POSTMAN_COLLECTION.md).