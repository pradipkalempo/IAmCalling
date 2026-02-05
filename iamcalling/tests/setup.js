import { app, server } from '../server.js';

let testServer;

beforeAll(async () => {
  // Setup file for tests
  console.log('Test environment setup');
  // Ensure server is running on port 3001 for tests
  if (!server.listening) {
    testServer = app.listen(3001);
  }
  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
});

afterAll(async () => {
  if (testServer) {
    await new Promise(resolve => testServer.close(resolve));
  }
});

export { testServer };
