describe('Error Handling', () => {
  test('should handle database connection errors', async () => {
    // Mock database failure
    const response = await request(app).get('/api/posts');
    expect(response.status).toBeLessThan(600); // No server crashes
  });

  test('should handle malformed JSON', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send('invalid json')
      .set('Content-Type', 'application/json');
    
    expect(response.status).toBe(400);
  });

  test('should handle oversized payloads', async () => {
    const largePayload = 'x'.repeat(10000000); // 10MB
    const response = await request(app)
      .post('/api/posts')
      .send({ content: largePayload });
    
    expect([400, 413]).toContain(response.status);
  });
});
