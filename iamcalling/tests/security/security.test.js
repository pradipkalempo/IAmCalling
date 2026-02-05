import request from 'supertest';
import app from '../../server.js';

describe('Security Tests', () => {
  test('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: maliciousInput, password: 'test' });
    
    expect(response.status).not.toBe(500);
  });

  test('should sanitize XSS attempts', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    const response = await request(app)
      .post('/api/posts')
      .send({ title: xssPayload, content: 'test' });
    
    expect(response.body.title).not.toContain('<script>');
  });

  test('should enforce rate limiting', async () => {
    const requests = Array(20).fill().map(() =>
      request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'wrong' })
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    expect(rateLimited).toBe(true);
  });
});
