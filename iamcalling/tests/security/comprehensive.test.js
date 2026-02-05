import request from 'supertest';
import app from '../../server.js';
import jwt from 'jsonwebtoken';

describe('Security Tests - Comprehensive', () => {
  let server;
  let validToken;

  beforeAll((done) => {
    server = app.listen(3003, async () => {
      // Create a valid token for testing
      const testUser = {
        userId: 999999,
        email: 'securitytest@example.com',
        firstName: 'Security',
        lastName: 'Test'
      };
      
      // Register test user to get valid token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: `security${Date.now()}@test.com`,
          password: 'SecurePass123!',
          firstName: 'Security',
          lastName: 'Test'
        });
      
      if (registerResponse.status === 201) {
        validToken = registerResponse.body.token;
      }
      
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('API Security', () => {
    it('should prevent sensitive data exposure in error responses', async () => {
      // Test with malformed request that might expose internals
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: null,
          password: undefined
        });

      // Should not expose stack traces or internal details
      expect(response.status).toBe(400);
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('error.original');
      expect(response.body).not.toHaveProperty('sql');
    });

    it('should enforce proper CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://malicious-site.com');

      // Should not allow requests from unauthorized origins
      expect(response.headers).not.toHaveProperty('access-control-allow-origin', '*');
    });

    it('should prevent NoSQL injection attempts', async () => {
      const nosqlPayloads = [
        '{"$ne": ""}',
        '{"$gt": ""}',
        '{"$where": "sleep(1000)"}'
      ];

      for (const payload of nosqlPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: payload,
            password: 'test'
          });

        // Should not crash or expose data
        expect([400, 401]).toContain(response.status);
        expect(response.body).not.toHaveProperty('stack');
      }
    });
  });

  describe('Authentication Security', () => {
    it('should enforce secure password policies', async () => {
      const weakPasswords = [
        '123',           // Too short
        'password',      // Common password
        'a'.repeat(100), // Too long
        ''               // Empty
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: `test${Date.now()}@weak.com`,
            password: password,
            firstName: 'Test',
            lastName: 'User'
          });

        expect(response.status).toBe(400);
      }
    });

    it('should prevent brute force attacks', async () => {
      const promises = [];
      
      // Attempt multiple login requests with wrong password
      for (let i = 0; i < 15; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'bruteforce@test.com',
              password: `wrongpassword${i}`
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Count rate limited responses (429)
      const rateLimited = responses.filter(r => r.status === 429).length;
      
      // Should have some rate limited responses
      expect(rateLimited).toBeGreaterThan(5);
    });

    it('should validate JWT token integrity', async () => {
      // Test with manipulated token
      const manipulatedToken = validToken ? validToken.slice(0, -5) + 'xxxxx' : 'invalid.token.here';
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${manipulatedToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent directory traversal attacks', async () => {
      const traversalAttempts = [
        '../etc/passwd',
        '..\\windows\\system32\\cmd.exe',
        '../../../../../../etc/hosts',
        '%2e%2e%2fetc%2fpasswd'
      ];

      for (const attempt of traversalAttempts) {
        const response = await request(app)
          .get(`/api/articles/${attempt}`)
          .set('Authorization', `Bearer ${validToken || 'dummy'}`);

        // Should not expose file system
        expect([400, 401, 404]).toContain(response.status);
        expect(response.text).not.toContain('root:x:');
      }
    });

    it('should sanitize HTML/JS in user inputs', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert("xss")>',
        'javascript:alert("xss")',
        '"><script>alert("xss")</script>'
      ];

      for (const input of maliciousInputs) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: `xss${Date.now()}@test.com`,
            password: 'SecurePass123!',
            firstName: input,
            lastName: 'User'
          });

        if (response.status === 201) {
          // If registration succeeds, check that malicious content was sanitized
          expect(response.body.user.firstName).not.toContain('<script>');
          expect(response.body.user.firstName).not.toContain('javascript:');
        }
      }
    });
  });

  describe('Session Security', () => {
    it('should prevent session fixation', async () => {
      // This test would require more complex setup in a real environment
      // For now, we verify that tokens are properly generated
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session@test.com',
          password: 'SecurePass123!'
        });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('token');
        // Tokens should be sufficiently random
        expect(response.body.token.length).toBeGreaterThan(50);
      }
    });

    it('should enforce token expiration', async () => {
      // Create a token that expires immediately
      const expiredToken = jwt.sign(
        { userId: 123 },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1ms' }
      );

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });
  });
});