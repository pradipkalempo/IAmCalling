import request from 'supertest';
import { app } from '../../server.js';

describe('Performance Tests - Scalability', () => {
  // Test for handling increased load
  test('should handle high concurrent requests with low error rate', async () => {
    const requests = Array(100).fill().map(() => 
      request(app).get('/api/health')
    );

    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.status === 200).length;
    const errorRate = (requests.length - successCount) / requests.length;

    // Allow 5% error rate for high load
    expect(errorRate).toBeLessThan(0.05);
    expect(responses[0].body).toBeDefined();
  }, 45000); // 45 second timeout for high load test

  // Test response time under load
  test('should maintain response times under load', async () => {
    const startTime = Date.now();
    
    // Send 50 concurrent requests
    const requests = Array(50).fill().map(() => 
      request(app).get('/api/health')
    );

    const responses = await Promise.all(requests);
    const endTime = Date.now();
    
    // Calculate average response time
    const totalTime = endTime - startTime;
    const avgResponseTime = totalTime / requests.length;
    
    // Average response time should be under 100ms per request
    expect(avgResponseTime).toBeLessThan(100);
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  }, 30000);

  // Test memory usage stability
  test('should maintain stable memory usage under sustained load', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Send requests over time to simulate sustained load
    for (let i = 0; i < 10; i++) {
      const requests = Array(20).fill().map(() => 
        request(app).get('/api/health')
      );
      
      await Promise.all(requests);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = (finalMemory - initialMemory) / initialMemory;
    
    // Memory growth should be less than 20%
    expect(memoryGrowth).toBeLessThan(0.2);
  }, 30000);
});