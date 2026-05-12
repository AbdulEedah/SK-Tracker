#+ API Endpoints and Data Objects

This document consolidates the public REST endpoints implemented in the backend and the common request/response shapes. Paths are relative to the API root (e.g., `https://api.example.com/`). Authentication is JWT for protected endpoints unless noted.

---

## Auth

- POST /auth/signup
	- Public
	- Body: { name, email, password, role? }
	- Response: { success: true, data: { id, email, name, ... } }

- POST /auth/login
	- Public
	- Body: { email, password }
	- Response: { access_token, refresh_token, user }

- POST /auth/logout
	- Authenticated (Bearer)
	- Body: none
	- Response: { success: true }

- POST /auth/refresh
	- Public (requires refresh_token in body)
	- Body: { refresh_token }
	- Response: { access_token, refresh_token }

- POST /auth/change-password
	- Authenticated
	- Body: { current_password, new_password }
	- Response: { success: true }

- POST /auth/forgot-password
	- Public
	- Body: { email }
	- Response: { success: true }

- POST /auth/reset-password
	- Public
	- Body: { token, new_password }
	- Response: { success: true }

- POST /auth/verify-email
	- Public
	- Body: { token }
	- Response: { success: true }

- POST /auth/resend-verification
	- Public
	- Body: { email }
	- Response: { success: true }

---

## Users

All `/users` endpoints require `Authorization: Bearer <token>` and are guarded; some require `admin` role.

- GET /users
	- Roles: admin
	- Query: ?page=&limit=
	- Response: { success: true, data: [ user ] }

- GET /users/me
	- Returns authenticated user's profile
	- Response: { success: true, data: { id, email, name, role, ... } }

- GET /users/:userId
	- Response: { success: true, data: user }

- PUT /users/:userId
	- Body: partial user fields to update
	- Response: { success: true, data: user }

- PATCH /users/:userId/status
	- Roles: admin
	- Body: { is_active: boolean }
	- Response: { success: true, data: { is_active } }

- DELETE /users/:userId
	- Roles: admin
	- Soft-delete (sets is_active false)
	- Response: { success: true }

---

## Tasks

Protected endpoints under `/tasks`.

- POST /tasks
	- Body: { title, description, assignee_id?, due_date?, priority?, type?, ... }
	- Response: { success: true, data: task }

- GET /tasks/my-tasks
	- Query: ?status=&priority=
	- Response: [ task ]

- GET /tasks/overdue
	- Query: ?days_overdue=
	- Response: [ task ]

- GET /tasks/search
	- Query: ?query=&status=&priority=
	- Response: [ task ]

- GET /tasks
	- Query: ?type=&status=
	- Response: [ task ]

- GET /tasks/:id/history
	- Response: [ history entries ]

- GET /tasks/:id
	- Response: { success: true, data: task }

- PUT /tasks/:id
	- Body: partial task fields to update
	- Response: updated task

- PATCH /tasks/:id/status
	- Body: { status }
	- Response: updated status

- PATCH /tasks/:id/accept
	- Marks task accepted by current user

- PATCH /tasks/:id/revision
	- Roles: admin
	- Body: { revision_notes }

- PATCH /tasks/bulk-update
	- Roles: admin
	- Body: { task_ids: string[], updates: object }

- DELETE /tasks/:id
	- Response: { success: true }

---

## Communications (Email templates)

- POST /communications/email-templates
	- Roles: admin
	- Body: { name, subject, body, variables? }
	- Response: created template

- GET /communications/email-templates
	- Response: [ template ]

- GET /communications/email-templates/:id
	- Response: template

- PUT /communications/email-templates/:id
	- Roles: admin
	- Body: update fields

- DELETE /communications/email-templates/:id
	- Roles: admin

- POST /communications/email-templates/:id/test
	- Roles: admin
	- Body: test data to render template

---

## Admin

All endpoints under `/admin` require `admin` role via the controller decorator.

- GET /admin/dashboard/stats
	- Response: aggregate statistics for dashboard

- GET /admin/users
	- Query: ?page=&limit=

- GET /admin/users/:id

- PUT /admin/users/:id/role
	- Body: { role }

- PATCH /admin/users/:id/status
	- Body: { is_active }

- DELETE /admin/users/:id

- GET /admin/audit-logs
	- Query: ?page=&limit=

- GET /admin/settings

- PUT /admin/settings/:key
	- Body: { value }

---

## Reports

- POST /reports
	- Body: { title, content, related_task_id?, ... }
	- Response: created report

- GET /reports
	- Query: ?page=&limit=

- GET /reports/:id

- PATCH /reports/:id

- PATCH /reports/:id/status
	- Roles: admin

- DELETE /reports/:id

---

## Meetings

- POST /meetings
	- Roles: admin

- GET /meetings
	- Query: ?type=&status=

- GET /meetings/:id

- PATCH /meetings/:id
	- Roles: admin

- DELETE /meetings/:id
	- Roles: admin

- POST /meetings/:id/register
	- Registers authenticated user for meeting

---

## Events

- POST /events
	- Roles: admin

- GET /events
	- Query: ?type=&status=&featured=

- GET /events/:id

- PATCH /events/:id
	- Roles: admin

- DELETE /events/:id
	- Roles: admin

- POST /events/:id/register

- POST /events/:id/feedback
	- Body: { rating?, comments? }

---

## Notifications

- GET /notifications
	- Returns user's notifications

- POST /notifications/read-all
	- Marks all as read

- PUT /notifications/:id/read
	- Marks single notification as read

- GET /notifications/preferences

- PUT /notifications/preferences
	- Body: preference object

---

## Files

- POST /files/upload
	- Multipart file upload field `file`
	- Optional body: `category`, `is_public` (string 'true'|'false')
	- Response: { success: true, data: { id, filename, url, ... } }

- GET /files/:id
	- Returns the file (stream)

- DELETE /files/:id
	- Authenticated

---

## App / Health

- GET /
	- Returns greeting string

- GET /health
	- Response: { status: 'ok', message, timestamp }

- GET /status
	- Response: { success: true, status: 'running', uptime, timestamp }

---

## Notes & Data Objects

- Common pagination query: `?page=1&limit=10`
- `user` object: { id, name, email, role, is_active, created_at, updated_at }
- `task` object (typical): { id, title, description, status, priority, assignee_id, created_by, due_date, metadata }
- `report` object: { id, title, content, author_id, related_task_id?, status }
- `meeting` / `event`: { id, title, description, start_date, end_date, location, type, status }

If you want I can expand each endpoint with exact DTO fields (inferred from services/entities) and example requests/responses, or create a Postman/OpenAPI export.
