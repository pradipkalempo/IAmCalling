const request = require("supertest");
const app = require("../../server"); // Adjust path if needed

describe("Password Reset Flow Tests", () => {
  let server;

  beforeAll(() => {
    server = app.listen(4002); // Use a different test port
  });

  afterAll((done) => {
    server.close(done);
  });

  const userData = {
    email: "resetuser@example.com",
    password: "Password123"
  };

  test("Signup → should create a new user for reset", async () => {
    const res = await request(server)
      .post("/api/signup")
      .send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
  });

  test("Request Password Reset → should send reset email", async () => {
    const res = await request(server)
      .post("/api/forgot-password")
      .send({ email: userData.email });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  test("Reset Password → should reset with valid token", async () => {
    // Assuming a valid reset token is obtained from the previous test
    const resetToken = "valid-reset-token"; // In real scenario, extract from email or mock

    const res = await request(server)
      .post("/api/reset-password")
      .send({ token: resetToken, newPassword: "NewPassword123" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  test("Reset Password → should fail with invalid token", async () => {
    const res = await request(server)
      .post("/api/reset-password")
      .send({ token: "invalid-token", newPassword: "NewPassword123" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("Reset Password → should fail with expired token", async () => {
    const expiredToken = "expired-reset-token";

    const res = await request(server)
      .post("/api/reset-password")
      .send({ token: expiredToken, newPassword: "NewPassword123" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });
});
