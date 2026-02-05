import request from "supertest";
import app from "../../server.js";

describe("Authentication API Tests", () => {
  test("Signup → should create a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: `testuser${Date.now()}@example.com`,
        password: "Password123",
        firstName: "Test",
        lastName: "User"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
  });

  test("Login → should login successfully", async () => {
    // First register a user
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: `loginuser${Date.now()}@example.com`,
        password: "Password123",
        firstName: "Login",
        lastName: "Test"
      });

    expect(registerRes.statusCode).toBe(201);

    // Then try to login
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: registerRes.body.user.email,
        password: "Password123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("token");
  });

  test("Login → fail with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "WrongPass"
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });
});
