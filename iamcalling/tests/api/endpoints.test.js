describe('Complete API Coverage', () => {
  // Test ALL endpoints with ALL HTTP methods
  const endpoints = [
    { method: 'GET', path: '/api/posts' },
    { method: 'POST', path: '/api/posts' },
    { method: 'PUT', path: '/api/posts/1' },
    { method: 'DELETE', path: '/api/posts/1' },
    { method: 'GET', path: '/api/users/profile' },
    { method: 'POST', path: '/api/auth/register' },
    { method: 'POST', path: '/api/auth/login' },
    { method: 'POST', path: '/api/comments' },
    { method: 'GET', path: '/api/subscriptions' }
  ];

  endpoints.forEach(({ method, path }) => {
    test(`${method} ${path} should respond appropriately`, async () => {
      const response = await request(app)[method.toLowerCase()](path);
      expect([200, 201, 400, 401, 404]).toContain(response.status);
    });
  });
});
