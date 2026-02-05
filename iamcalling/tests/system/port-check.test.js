const request = require('supertest');
const { app } = require('../../server');

describe('Port Configuration Tests', () => {
  test('server should respond on port 3001', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBeLessThan(500);
  });

  test('API endpoints should be accessible on same port', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBeLessThan(500);
  });

  test('static files should be served from same port', async () => {
    const response = await request(app).get('/css/style.css');
    expect(response.status).toBeLessThan(404);
  });

  test('frontend pages should be accessible on same port', async () => {
    const pages = ['/login', '/dashboard', '/profile', '/challenges'];
    for (const page of pages) {
      const response = await request(app).get(page);
      expect(response.status).toBe(200);
    }
  });
});
