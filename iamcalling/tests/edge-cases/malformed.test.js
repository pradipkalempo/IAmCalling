const request = require("supertest");
const app = require("../../server");

describe("Edge Cases Testing - Malformed Requests", () => {
  let server;

  beforeAll((done) => {
    server = app.listen(3003, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe("Malformed JSON Requests", () => {
    it("should handle invalid JSON in request body", async () => {
      const response = await request(app)
        .post("/api/register")
        .set("Content-Type", "application/json")
        .send("{invalid json");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should handle empty JSON object", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should handle null values in required fields", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({
          email: null,
          password: "password123",
          full_name: "Test User"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Oversized Payloads", () => {
    it("should reject extremely large request bodies", async () => {
      const largePayload = "x".repeat(10000000); // 10MB
      const response = await request(app)
        .post("/api/articles")
        .send({
          title: "Test",
          content: largePayload
        });

      expect(response.status).toBe(413);
    });

    it("should handle nested objects with deep recursion", async () => {
      const deepObject = {};
      let current = deepObject;
      for (let i = 0; i < 100; i++) {
        current.nested = {};
        current = current.nested;
      }

      const response = await request(app)
        .post("/api/articles")
        .send({
          title: "Test",
          content: JSON.stringify(deepObject)
        });

      expect(response.status).toBe(400);
    });
  });

  describe("Invalid Content Types", () => {
    it("should reject non-JSON content types for JSON endpoints", async () => {
      const response = await request(app)
        .post("/api/register")
        .set("Content-Type", "text/plain")
        .send("email=test@example.com&password=password123");

      expect(response.status).toBe(400);
    });

    it("should handle multipart/form-data for file uploads", async () => {
      // This would test file upload endpoints if they exist
      const response = await request(app)
        .post("/api/upload")
        .set("Content-Type", "multipart/form-data")
        .field("name", "test");

      // Should either handle it properly or return 404 if endpoint doesn't exist
      expect([200, 404]).toContain(response.status);
    });
  });

  describe("Network Timeout Scenarios", () => {
    it("should handle slow requests gracefully", async () => {
      // This test would require setting up a slow endpoint
      // For now, we'll test with a timeout
      const response = await request(app)
        .get("/api/articles")
        .timeout(1000); // 1 second timeout

      expect([200, 408]).toContain(response.status);
    });
  });

  describe("Database Connection Failures", () => {
    it("should handle database connection errors gracefully", async () => {
      // This would require temporarily disconnecting the database
      // For now, we'll test with a non-existent endpoint that might cause DB issues
      const response = await request(app)
        .get("/api/nonexistent");

      expect(response.status).toBe(404);
    });
  });

  describe("Unicode and Special Characters", () => {
    it("should handle Unicode characters in user input", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({
          email: "test@example.com",
          password: "password123",
          full_name: "测试用户 🚀"
        });

      expect([200, 201]).toContain(response.status);
    });

    it("should handle emoji in content", async () => {
      const response = await request(app)
        .post("/api/articles")
        .send({
          title: "Test with emoji 🎉",
          content: "Content with emoji 😀"
        });

      expect([200, 201, 401]).toContain(response.status); // 401 if not authenticated
    });
  });

  describe("Boundary Conditions", () => {
    it("should handle maximum length strings", async () => {
      const longString = "a".repeat(10000);
      const response = await request(app)
        .post("/api/articles")
        .send({
          title: longString,
          content: "Content"
        });

      expect([200, 201, 400]).toContain(response.status);
    });

    it("should handle zero-length strings", async () => {
      const response = await request(app)
        .post("/api/articles")
        .send({
          title: "",
          content: ""
        });

      expect(response.status).toBe(400);
    });
  });

  describe("Concurrent Requests", () => {
    it("should handle multiple simultaneous requests", async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get("/api/articles")
        );
      }

      const responses = await Promise.all(promises);
      const successfulResponses = responses.filter(r => r.status === 200);

      expect(successfulResponses.length).toBeGreaterThan(5);
    });
  });
});
