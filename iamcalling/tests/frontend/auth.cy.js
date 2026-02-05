describe("Authentication UI Tests", () => {
  beforeEach(() => {
    cy.visit("/15-login.html");
  });

  it("Loads login page", () => {
    cy.contains("Welcome Back");
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("button[type=submit]").should("contain", "Login");
  });

  it("Shows 'Please enter a valid email' for invalid email format", () => {
    cy.get("#email").type("invalid-email");
    cy.get("#password").type("password123");
    cy.get("button[type=submit]").click();
    cy.get("#emailError").should("be.visible");
    cy.get("#emailError").should("contain", "Please enter a valid email");
  });

  it("Shows error message for failed login", () => {
    // Mock the API response for failed login
    cy.intercept('POST', '/api/auth/login', { statusCode: 401, body: { message: 'Invalid credentials' } }).as('loginRequest');

    cy.get("#email").type("wrong@example.com");
    cy.get("#password").type("wrongpassword");
    cy.get("button[type=submit]").click();

    // Wait for the API call
    cy.wait('@loginRequest');
    
    cy.get("#notification").should("be.visible");
    cy.get("#notification").should("contain", "Invalid credentials");
  });

  it("Shows 'Login successful' and redirects for valid credentials", () => {
    // Mock the API response for successful login
    cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: { success: true, message: 'Login successful' } }).as('loginRequest');

    cy.get("#email").type("testuser@example.com");
    cy.get("#password").type("password123");
    cy.get("button[type=submit]").click();

    // Wait for the API call
    cy.wait('@loginRequest');
    
    cy.get("#notification").should("be.visible");
    cy.get("#notification").should("contain", "Login successful");

    // Wait for redirect
    cy.wait(1100); // Wait slightly more than 1 second
    cy.url().should("include", "18-profile.html");
  });
});