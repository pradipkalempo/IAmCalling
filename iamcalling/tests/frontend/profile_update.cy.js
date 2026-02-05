describe("Profile Update Tests", () => {
  beforeEach(() => {
    cy.visit("/18-profile.html");
  });

  it("Loads profile page", () => {
    cy.contains("Alex Johnson").should("be.visible");
  });

  it("Opens edit name modal", () => {
    cy.get("#edit-name-btn").click();
    cy.get("#edit-name-modal").should("have.class", "active");
  });

  it("Updates name with valid input", () => {
    cy.get("#edit-name-btn").click();
    cy.get("#new-name").clear().type("Updated Name");
    cy.get("#edit-name-form").submit();
    // Check that the name was updated on the page
    cy.contains("Updated Name").should("be.visible");
  });
});