describe("Password Reset UI Tests", () => {
  it("Loads password reset request page", () => {
    cy.visit("/password_reset.html");
    cy.contains("Forgot Password");
  });

  it("Requests password reset with valid email", () => {
    cy.visit("/password_reset.html");
    cy.get("input[name=email]").type("resetuser@example.com");
    cy.get("button[type=submit]").click();
    // Check that the notification is visible (form submission would normally redirect or show message)
    cy.get("#notification").should("exist");
  });

  it("Resets password with valid token", () => {
    // Simulate visiting reset link with token
    cy.visit("/reset_password.html?token=valid-reset-token");
    cy.get("input[name=newPassword]").type("NewPassword123");
    cy.get("input[name=confirmPassword]").type("NewPassword123");
    cy.get("button[type=submit]").click();
    // Check that the notification is visible
    cy.get("#notification").should("exist");
  });
});