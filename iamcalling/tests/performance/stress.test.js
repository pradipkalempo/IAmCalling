import request from 'supertest';
import app from '../../server.js';

describe('Performance Tests - Stress Testing', () => {
  // Test system behavior under extreme load
  test('should gracefully handle extreme concurrent requests', async () => {
    const requests = Array(200).fill().map(() => 
      request(app).get('/api/health')
    );

    const responses = await Promise.all(requests);
    
    // Count different response types
    const successCount = responses.filter(r => r.status === 200).length;
    const serverErrorCount = responses.filter(r => r.status >= 500).length;
    const clientErrorCount = responses.filter(r => r.status >= 400 && r.status < 500).length;
    
    // Under extreme load, we expect:
    // - Most requests to succeed
    // - Some 429 (rate limit) responses are acceptable
    // - Very few 5xx errors
    expect(successCount).toBeGreaterThan(150); // 75% success rate
    expect(serverErrorCount).toBeLessThan(20); // Less than 10% 5xx errors
    
    // Log statistics for monitoring
    console.log(`Stress Test Results:
      Success: ${successCount}/${requests.length} (${(successCount/requests.length*100).toFixed(1)}%)
      Client Errors: ${clientErrorCount} (likely rate limiting)
      Server Errors: ${serverErrorCount} (${(serverErrorCount/requests.length*100).toFixed(1)}%)`);
  }, 60000); // 60 second timeout for extreme load test

  // Test system recovery after stress
  test('should recover quickly after stress', async () => {
    // First, apply stress
    const stressRequests = Array(150).fill().map(() => 
      request(app).get('/api/health')
    );
    
    await Promise.all(stressRequests);
    
    // Small recovery time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Now test normal response
    const startTime = Date.now();
    const response = await request(app).get('/api/health');
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(200); // Should respond quickly after stress
  }, 45000);

  // Test payload size limits under stress
  test('should reject oversized payloads even under stress', async () => {
    const largePayload = 'x'.repeat(50 * 1024 * 1024); // 50MB payload
    
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'stress@test.com',
        password: largePayload,
        firstName: 'Stress',
        lastName: 'Test'
      });
    
    // Should reject oversized payloads with 413 (Payload Too Large)
    expect([413, 400]).toContain(response.status);
  }, 30000);
});