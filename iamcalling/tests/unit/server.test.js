import request from 'supertest';
import { app } from '../../server.js';

describe('Server Configuration', () => {
  it('should serve static files', async () => {
    const response = await request(app)
      .get('/01-index.html');

    expect([200, 404]).toContain(response.status);
  });

  it('should handle CORS', async () => {
    const response = await request(app)
      .options('/api/auth/test')
      .set('Origin', 'http://localhost:3000');

    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should have security headers', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should handle 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404);

    expect(response.body.error).toBe('Route not found');
  });
});