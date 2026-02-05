const request = require("supertest");
const app = require("../../server"); // Adjust path if needed

describe("Profile Update Flow Tests", () => {
  let server;
  let authToken;

  beforeAll(() => {
    server = app.listen(4003); // Use a different test port
  });

  afterAll((done) => {
    server.close(done);
  });

  const userData = {
    email: "profileuser@example.com",
    password: "Password123"
  };

  test("Signup → should create a new user for profile update", async () => {
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

  test("Update Name → should update with valid name", async () => {
    const res = await request(server)
      .put("/api/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Updated Name" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  test("Update Name → should fail with empty name", async () => {
    const res = await request(server)
      .put("/api/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("Update Email → should update with valid email", async () => {
    const res = await request(server)
      .put("/api/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ email: "newemail@example.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  test("Update Email → should fail with invalid email", async () => {
    const res = await request(server)
      .put("/api/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ email: "invalid-email" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("Update Email → should fail with duplicate email", async () => {
    const res = await request(server)
      .put("/api/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ email: "duplicate@example.com" }); // Assuming this email exists

    expect([400, 409]).toContain(res.statusCode);
    expect(res.body).toHaveProperty("message");
  });

  test("Update Password → should update with valid password", async () => {
    const res = await request(server)
      .put("/api/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ password: "NewPassword123" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  test("Update Password → should fail with weak password", async () => {
    const res = await request(server)
      .put("/api/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ password: "123" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("Update Profile → should fail with invalid token", async () => {
    const res = await request(server)
      .put("/api/profile")
      .set("Authorization", `Bearer invalid-token`)
      .send({ name: "Test" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });
});
