const request = require("supertest");
const app = require("../../server").app; // Adjust path if needed

describe("Duplicate Registration & Edge Cases", () => {
  let server;

  beforeAll((done) => {
    server = app.listen(4001, done); // Use a different test port
  });

  afterAll((done) => {
    server.close(done);
  });

  const userData = {
    email: "duplicate@example.com",
    password: "Password123",
    firstName: "Test",
    lastName: "User",
    confirmPassword: "Password123"
  };

  test("Signup → should create a new user", async () => {
    const res = await request(server)
      .post("/api/register")
      .send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
  });

  test("Signup → should fail on duplicate email", async () => {
    const res = await request(server)
      .post("/api/register")
      .send(userData);

    expect([400, 409]).toContain(res.statusCode);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message.toLowerCase()).toMatch(/already exists|duplicate/);
  });
});
