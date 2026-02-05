import request from "supertest";
import app from "../../server.js";

describe("Security Testing - Authentication", () => {
  let server;

  beforeAll((done) => {
    server = app.listen(3002, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe("SQL Injection Prevention", () => {
    it("should prevent SQL injection in login", async () => {
      const maliciousEmail = "' OR '1'='1'; --";
      const response = await request(app)
        .post("/api/login")
        .send({
          email: maliciousEmail,
          password: "password123"
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should prevent SQL injection in registration", async () => {
      const maliciousEmail = "test@example.com'; DROP TABLE users; --";
      const response = await request(app)
        .post("/api/register")
        .send({
          email: maliciousEmail,
          password: "password123",
          full_name: "Test User"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("XSS Prevention", () => {
    it("should sanitize XSS in user input", async () => {
      const xssPayload = "<script>alert('XSS')</script>";
      const response = await request(app)
        .post("/api/register")
        .send({
          email: "xss@example.com",
          password: "password123",
          full_name: xssPayload
        });

      expect(response.status).toBe(201);
      // Check that the script tags are not in the response
      expect(response.body.full_name).not.toContain("<script>");
    });
  });

  describe("CSRF Protection", () => {
    it("should require proper authentication headers", async () => {
      const response = await request(app)
        .post("/api/articles")
        .send({
          title: "Test Article",
          content: "Content"
        });

      expect(response.status).toBe(401);
    });
  });

  describe("JWT Token Validation", () => {
    it("should reject malformed JWT tokens", async () => {
      const response = await request(app)
        .get("/api/profile")
        .set("Authorization", "Bearer invalid.jwt.token");

      expect(response.status).toBe(401);
    });

    it("should reject expired tokens", async () => {
      const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const response = await request(app)
        .get("/api/profile")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe("Rate Limiting", () => {
    it("should enforce rate limiting on login attempts", async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post("/api/login")
            .send({
              email: "test@example.com",
              password: "wrongpassword"
            })
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      // At least some requests should be rate limited
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe("Input Sanitization", () => {
    it("should validate email format", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({
          email: "invalid-email",
          password: "password123",
          full_name: "Test User"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should validate password strength", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({
          email: "test@example.com",
          password: "123", // Too short
          full_name: "Test User"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should prevent oversized payloads", async () => {
      const largeContent = "x".repeat(1000000); // 1MB of data
      const response = await request(app)
        .post("/api/articles")
        .send({
          title: "Test",
          content: largeContent
        });

      expect(response.status).toBe(413); // Payload too large
    });
  });
});
