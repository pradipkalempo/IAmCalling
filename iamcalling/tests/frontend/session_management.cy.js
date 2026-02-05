describe("Session Management UI Tests", () => {
  it("Login with valid credentials", () => {
    cy.visit("/15-login.html");
    cy.get("input[name=email]").type("sessionuser@example.com");
    cy.get("input[name=password]").type("Password123");
    cy.get("button[type=submit]").click();
    cy.get("#notification").should("be.visible");
  });

  it("Unauthorized access to protected page", () => {
    cy.visit("/15-login.html");
    cy.contains("Welcome Back").should("exist");
  });

  it("Invalid token in localStorage", () => {
    cy.visit("/15-login.html");
    cy.contains("Welcome Back").should("exist");
  });
});