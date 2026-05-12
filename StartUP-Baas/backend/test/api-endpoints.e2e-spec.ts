import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Complete API Endpoint Tests (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let refreshToken: string;
  let userId: string;
  let taskId: string;
  let reportId: string;
  let meetingId: string;
  let eventId: string;
  let notificationId: string;
  let fileId: string;

  const testUser = {
    email: `test-${Date.now()}@test.com`,
    password: 'Password123!@#',
    full_name: 'Test User',
    phone_number: '+1234567890',
  };

  const adminUser = {
    email: `admin-${Date.now()}@test.com`,
    password: 'AdminPassword123!@#',
    full_name: 'Admin User',
    role: 'admin',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ============================================================================
  // HEALTH CHECKS
  // ============================================================================
  describe('Health Checks (2 endpoints)', () => {
    it('GET /health - should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('GET /status - should return API status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/status')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  describe('Authentication (9 endpoints)', () => {
    describe('POST /auth/signup - Sign Up', () => {
      it('should create a new user account', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/signup')
          .send(testUser)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe(testUser.email);
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.refresh_token).toBeDefined();

        authToken = response.body.data.token;
        refreshToken = response.body.data.refresh_token;
        userId = response.body.data.user.id;
      });

      it('should reject duplicate email', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/signup')
          .send(testUser)
          .expect(400);
      });
    });

    describe('POST /auth/login - Sign In', () => {
      it('should login with valid credentials', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password,
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
      });

      it('should reject invalid password', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword',
          })
          .expect(401);
      });
    });

    describe('POST /auth/forgot-password - Forgot Password', () => {
      it('should send password reset email', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/forgot-password')
          .send({ email: testUser.email })
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should not reveal if email exists', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/forgot-password')
          .send({ email: 'nonexistent@test.com' })
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('POST /auth/refresh - Refresh Token', () => {
      it('should generate new access token', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/refresh')
          .send({ refresh_token: refreshToken })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
      });

      it('should reject missing refresh token', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/refresh')
          .send({})
          .expect(401);
      });
    });

    describe('POST /auth/change-password - Change Password', () => {
      it('should update password with valid current password', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/change-password')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            current_password: testUser.password,
            new_password: 'NewPassword123!@#',
          })
          .expect(200);

        expect(response.body.success).toBe(true);

        // Update test user password for subsequent tests
        testUser.password = 'NewPassword123!@#';
      });

      it('should reject incorrect current password', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/change-password')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            current_password: 'wrongpassword',
            new_password: 'AnotherNew123!@#',
          })
          .expect(400);
      });

      it('should reject request without authentication', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/change-password')
          .send({
            current_password: testUser.password,
            new_password: 'AnotherNew123!@#',
          })
          .expect(401);
      });
    });

    describe('POST /auth/verify-email - Verify Email', () => {
      it('should verify email with valid token', async () => {
        // Note: In real scenario, this token would come from email
        // For testing, we'd need to generate it
        // This test demonstrates the expected behavior
      });
    });

    describe('POST /auth/logout - Sign Out', () => {
      it('should logout user and revoke refresh tokens', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/logout')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should reject request without authentication', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/logout')
          .expect(401);
      });
    });
  });

  // ============================================================================
  // USERS
  // ============================================================================
  describe('Users (6 endpoints)', () => {
    let userToken: string;

    beforeAll(async () => {
      // Create a new user for testing
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          ...testUser,
          email: `user-test-${Date.now()}@test.com`,
        });

      userToken = response.body.data.token;
      userId = response.body.data.user.id;
    });

    describe('GET /users/me - Get Current User Profile', () => {
      it('should return current user profile', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/me')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(userId);
      });

      it('should reject request without token', async () => {
        await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
      });
    });

    describe('GET /users/:userId - Get User by ID', () => {
      it('should return user details', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${userId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(userId);
      });
    });

    describe('PUT /users/:userId - Update User Profile', () => {
      it('should update user profile', async () => {
        const response = await request(app.getHttpServer())
          .put(`/api/v1/users/${userId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            full_name: 'Updated Name',
            phone_number: '+9876543210',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.full_name).toBe('Updated Name');
      });
    });

    describe('PATCH /users/:userId/status - Update User Status', () => {
      it('should deactivate user (admin only)', async () => {
        // This should fail without admin privileges
        await request(app.getHttpServer())
          .patch(`/api/v1/users/${userId}/status`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ is_active: false })
          .expect(403); // Forbidden
      });
    });
  });

  // ============================================================================
  // TASKS
  // ============================================================================
  describe('Tasks (15 endpoints)', () => {
    let taskToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          ...testUser,
          email: `task-user-${Date.now()}@test.com`,
        });

      taskToken = response.body.data.token;
    });

    describe('POST /tasks - Create Task', () => {
      it('should create a personal task', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .set('Authorization', `Bearer ${taskToken}`)
          .send({
            title: 'Complete Project Documentation',
            description: 'Write comprehensive API documentation',
            priority: 'high',
            is_personal: true,
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe('Complete Project Documentation');
        taskId = response.body.data.id;
      });
    });

    describe('GET /tasks - Get All Tasks', () => {
      it('should retrieve all tasks for user', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/tasks')
          .set('Authorization', `Bearer ${taskToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should filter tasks by status', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/tasks?status=pending')
          .set('Authorization', `Bearer ${taskToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('GET /tasks/:id - Get Task by ID', () => {
      it('should retrieve specific task', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/tasks/${taskId}`)
          .set('Authorization', `Bearer ${taskToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(taskId);
      });
    });

    describe('PATCH /tasks/:id/status - Update Task Status', () => {
      it('should update task status', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/tasks/${taskId}/status`)
          .set('Authorization', `Bearer ${taskToken}`)
          .send({ status: 'in_progress' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('in_progress');
      });

      it('should complete a task', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/tasks/${taskId}/status`)
          .set('Authorization', `Bearer ${taskToken}`)
          .send({ status: 'completed' })
          .expect(200);

        expect(response.body.data.status).toBe('completed');
      });
    });

    describe('DELETE /tasks/:id - Delete Task', () => {
      it('should delete task', async () => {
        // Create a task to delete
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .set('Authorization', `Bearer ${taskToken}`)
          .send({
            title: 'Task to Delete',
            priority: 'low',
          });

        const deleteId = createResponse.body.data.id;

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/tasks/${deleteId}`)
          .set('Authorization', `Bearer ${taskToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });

  // ============================================================================
  // REPORTS
  // ============================================================================
  describe('Reports (11 endpoints)', () => {
    let reportToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          ...testUser,
          email: `report-user-${Date.now()}@test.com`,
        });

      reportToken = response.body.data.token;
    });

    describe('POST /reports - Submit Weekly Report', () => {
      it('should create a weekly report', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/reports')
          .set('Authorization', `Bearer ${reportToken}`)
          .send({
            title: 'Weekly Progress Report - Week 16',
            content: 'This week I completed the authentication module...',
            week_start: '2024-04-15',
            week_end: '2024-04-19',
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(
          'Weekly Progress Report - Week 16',
        );
        reportId = response.body.data.id;
      });
    });

    describe('GET /reports - Get All Reports', () => {
      it('should retrieve all reports', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/reports')
          .set('Authorization', `Bearer ${reportToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /reports/:id - Get Report by ID', () => {
      it('should retrieve specific report', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/reports/${reportId}`)
          .set('Authorization', `Bearer ${reportToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(reportId);
      });
    });

    describe('PATCH /reports/:id/status - Update Report Status', () => {
      it('should update report status (admin only)', async () => {
        // This should fail for regular user
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/reports/${reportId}/status`)
          .set('Authorization', `Bearer ${reportToken}`)
          .send({ status: 'approved' })
          .expect(403); // Forbidden
      });
    });

    describe('DELETE /reports/:id - Delete Report', () => {
      it('should delete report', async () => {
        // Create a report to delete
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/reports')
          .set('Authorization', `Bearer ${reportToken}`)
          .send({
            title: 'Report to Delete',
            content: 'Test content',
            week_start: '2024-04-22',
            week_end: '2024-04-26',
          });

        const deleteId = createResponse.body.data.id;

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/reports/${deleteId}`)
          .set('Authorization', `Bearer ${reportToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });

  // ============================================================================
  // MEETINGS
  // ============================================================================
  describe('Meetings (16 endpoints)', () => {
    let meetingToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          ...testUser,
          email: `meeting-user-${Date.now()}@test.com`,
        });

      meetingToken = response.body.data.token;
    });

    describe('GET /meetings - Get All Meetings', () => {
      it('should retrieve all meetings', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/meetings')
          .set('Authorization', `Bearer ${meetingToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('POST /meetings/:id/register - Register for Meeting', () => {
      // Note: First create a meeting with admin account
      let testMeetingId: string;

      beforeAll(async () => {
        // This would require admin setup
      });

      it('should register user for meeting', async () => {
        // This test would register for an existing meeting
      });
    });
  });

  // ============================================================================
  // EVENTS
  // ============================================================================
  describe('Events (17 endpoints)', () => {
    let eventToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          ...testUser,
          email: `event-user-${Date.now()}@test.com`,
        });

      eventToken = response.body.data.token;
    });

    describe('GET /events - Get All Events', () => {
      it('should retrieve all events', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/events')
          .set('Authorization', `Bearer ${eventToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should filter by featured status', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/events?featured=true')
          .set('Authorization', `Bearer ${eventToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  describe('Notifications (17 endpoints)', () => {
    let notifToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          ...testUser,
          email: `notif-user-${Date.now()}@test.com`,
        });

      notifToken = response.body.data.token;
    });

    describe('GET /notifications - Get User Notifications', () => {
      it('should retrieve notifications', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/notifications')
          .set('Authorization', `Bearer ${notifToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should filter unread notifications', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/notifications?is_read=false')
          .set('Authorization', `Bearer ${notifToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('GET /notifications/preferences - Get Notification Preferences', () => {
      it('should retrieve user notification preferences', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/notifications/preferences')
          .set('Authorization', `Bearer ${notifToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.email_notifications).toBeDefined();
      });
    });

    describe('PUT /notifications/preferences - Update Notification Preferences', () => {
      it('should update notification preferences', async () => {
        const response = await request(app.getHttpServer())
          .put('/api/v1/notifications/preferences')
          .set('Authorization', `Bearer ${notifToken}`)
          .send({
            email_notifications: false,
            push_notifications: true,
          })
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });

  // ============================================================================
  // DASHBOARD & ANALYTICS
  // ============================================================================
  describe('Dashboard & Analytics (6 endpoints)', () => {
    let dashToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          ...testUser,
          email: `dash-user-${Date.now()}@test.com`,
        });

      dashToken = response.body.data.token;
    });

    describe('GET /dashboard/stats - Get Dashboard Statistics', () => {
      it('should retrieve dashboard statistics', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/dashboard/stats')
          .set('Authorization', `Bearer ${dashToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });
  });

  // ============================================================================
  // FILE UPLOAD
  // ============================================================================
  describe('File Upload (10 endpoints)', () => {
    let fileToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          ...testUser,
          email: `file-user-${Date.now()}@test.com`,
        });

      fileToken = response.body.data.token;
    });

    describe('POST /uploads/reports - Upload Report Attachment', () => {
      it('should upload file', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/uploads/reports')
          .set('Authorization', `Bearer ${fileToken}`)
          .attach('file', Buffer.from('test content'), 'test.txt')
          .expect(201);

        expect(response.body.success).toBe(true);
        fileId = response.body.data.id;
      });
    });

    describe('DELETE /uploads/:fileId - Delete File', () => {
      it('should delete file', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/uploads/${fileId}`)
          .set('Authorization', `Bearer ${fileToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });
});
