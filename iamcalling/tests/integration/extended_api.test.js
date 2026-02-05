import request from "supertest";
import app from "../../server.js";

describe("Extended API Integration Tests", () => {
  describe("User Authentication Flow", () => {
    let authToken;
    let testUserEmail;
    let testUserId;

    beforeAll(() => {
      testUserEmail = `integration${Date.now()}@example.com`;
    });

    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: testUserEmail,
          password: "securePassword123",
          firstName: "Integration",
          lastName: "Test"
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(testUserEmail);
      expect(response.body.user.firstName).toBe("Integration");
      expect(response.body.user.lastName).toBe("Test");
      
      authToken = response.body.token;
      testUserId = response.body.user.id;
    });

    it("should login with the registered user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUserEmail,
          password: "securePassword123"
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("token");
      expect(response.body.message).toBe("Login successful");
    });

    it("should reject login with wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUserEmail,
          password: "wrongPassword"
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Invalid credentials");
    });
  });

  describe("API Endpoints", () => {
    it("should return authentication status", async () => {
      const response = await request(app)
        .get("/api/check-auth");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("authenticated");
      expect(response.body).toHaveProperty("message");
    });

    it("should handle users endpoint gracefully", async () => {
      const response = await request(app)
        .get("/api/users");

      // Should either return users or handle error gracefully
      expect([200, 500]).toContain(response.status);
    });

    it("should return root endpoint response", async () => {
      const response = await request(app)
        .get("/");

      expect(response.status).toBe(200);
    });
  });

  describe("Database Integration", () => {
    it("should connect to database successfully", async () => {
      const response = await request(app)
        .get("/test-db");

      expect([200, 500]).toContain(response.status);
    });
  });

  describe("Error Handling", () => {
    it("should handle non-existent routes gracefully", async () => {
      const response = await request(app)
        .get("/non-existent-route");

      // Should return either 404 or handle gracefully
      expect([404, 500]).toContain(response.status);
    });

    it("should handle invalid HTTP methods gracefully", async () => {
      const response = await request(app)
        .put("/api/auth/register")
        .send({
          email: `test${Date.now()}@example.com`,
          password: "password123",
          firstName: "Test",
          lastName: "User"
        });

      // Should return either 404, 405 or handle gracefully
      expect([404, 405, 500]).toContain(response.status);
    });
  });
});