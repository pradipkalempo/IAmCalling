import request from "supertest";
import app from "../../server.js"; // Adjust path if needed

describe("Session Management & Auth Check Tests", () => {
  let server;
  let authToken;

  beforeAll(() => {
    server = app.listen(4004); // Use a different test port
  });

  afterAll((done) => {
    server.close(done);
  });

  const userData = {
    email: "sessionuser@example.com",
    password: "Password123"
  };

  test("Signup → should create a new user for session tests", async () => {
    const res = await request(server)
      .post("/api/signup")
      .send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
  });

  test("Login → should get auth token", async () => {
    const res = await request(server)
      .post("/api/login")
      .send(userData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    authToken = res.body.token;
  });

  test("Check Auth → should return user data with valid token", async () => {
    const res = await request(server)
      .get("/api/check-auth")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
  });

  test("Check Auth → should fail with invalid token", async () => {
    const res = await request(server)
      .get("/api/check-auth")
      .set("Authorization", `Bearer invalid-token`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  test("Check Auth → should fail with expired token", async () => {
    const expiredToken = "expired-session-token";

    const res = await request(server)
      .get("/api/check-auth")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  test("Multiple Sessions → should allow multiple logins", async () => {
    // First login
    const res1 = await request(server)
      .post("/api/login")
      .send(userData);

    expect(res1.statusCode).toBe(200);
    expect(res1.body).toHaveProperty("token");

    // Second login (simulate another device)
    const res2 = await request(server)
      .post("/api/login")
      .send(userData);

    expect(res2.statusCode).toBe(200);
    expect(res2.body).toHaveProperty("token");

    // Both tokens should be valid
    const check1 = await request(server)
      .get("/api/check-auth")
      .set("Authorization", `Bearer ${res1.body.token}`);

    expect(check1.statusCode).toBe(200);

    const check2 = await request(server)
      .get("/api/check-auth")
      .set("Authorization", `Bearer ${res2.body.token}`);

    expect(check2.statusCode).toBe(200);
  });

  test("Logout → should clear session", async () => {
    const res = await request(server)
      .post("/api/logout")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");

    // Check auth should fail after logout
    const check = await request(server)
      .get("/api/check-auth")
      .set("Authorization", `Bearer ${authToken}`);

    expect(check.statusCode).toBe(401);
  });

  test("Unauthorized Access → should fail without token", async () => {
    const res = await request(server)
      .get("/api/check-auth");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });
});
