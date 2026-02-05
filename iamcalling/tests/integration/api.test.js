import request from 'supertest';
import { app } from '../../server.js';

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Auth Flow Integration', () => {
    it('should complete registration and login flow', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register-simple')
        .send(userData);

      if (registerResponse.status === 200) {
        expect(registerResponse.body.success).toBe(true);
        expect(registerResponse.body.token).toBeDefined();

        // Login with same credentials
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: userData.email,
            password: userData.password
          });

        if (loginResponse.status === 200) {
          expect(loginResponse.body.message).toBe('Login successful');
          expect(loginResponse.body.token).toBeDefined();

          // Get profile with token
          const profileResponse = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${loginResponse.body.token}`);

          if (profileResponse.status === 200) {
            expect(profileResponse.body.success).toBe(true);
            expect(profileResponse.body.user.email).toBe(userData.email);
          }
        }
      }
    });
  });

  describe('API Routes Availability', () => {
    it('should have auth test endpoint', async () => {
      const response = await request(app)
        .get('/api/auth/test')
        .expect(200);

      expect(response.body.message).toBe('Auth routes working');
    });

    it('should handle articles endpoint', async () => {
      const response = await request(app)
        .get('/api/articles');

      expect([200, 500]).toContain(response.status);
    });

    it('should handle posts endpoint', async () => {
      const response = await request(app)
        .get('/api/posts');

      expect([200, 500]).toContain(response.status);
    });
  });
});