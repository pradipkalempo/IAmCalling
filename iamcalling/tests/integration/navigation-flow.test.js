const request = require('supertest');
const { app } = require('../../server');

describe('Navigation Flow Tests', () => {
  test('should serve all pages from same origin', async () => {
    const pages = ['/', '/login', '/dashboard', '/profile', '/challenges', '/leaderboard', '/forum', '/categories', '/submit-challenge', '/ideology-analyzer', '/analytics'];

    for (const page of pages) {
      const response = await request(app).get(page);
      expect(response.status).toBe(200);
      expect(response.type).toMatch(/html/);
    }
  });

  test('API calls should work from frontend pages', async () => {
    // Test that API calls work when frontend and backend are on same port
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:3001');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  test('static assets should be accessible', async () => {
    // Test that CSS, JS, and other static files are accessible
    const staticFiles = ['/js/main.js', '/css/style.css'];

    for (const file of staticFiles) {
      const response = await request(app).get(file);
      expect(response.status).toBeLessThan(404);
    }
  });

  test('SPA routing should work correctly', async () => {
    // Test that unknown routes fall back to index.html for SPA routing
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/html/);
  });
});
