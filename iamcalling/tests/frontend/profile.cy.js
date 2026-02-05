describe('Profile Page Tests', () => {
  it('should load the profile page successfully', () => {
    cy.visit('/18-profile.html');
    cy.get('.profile-container').should('be.visible');
    cy.get('.profile-header').should('be.visible');
  });

  it('should display profile information', () => {
    cy.visit('/18-profile.html');
    cy.get('.profile-name').should('be.visible');
    cy.get('.profile-stats').should('be.visible');
  });

  it('should have working navigation', () => {
    cy.visit('/18-profile.html');
    // Check for the home link in the navbar
    cy.get('a[href="06-enhanced-home.html"]').should('exist');
    // Check for the user settings link in the profile dropdown
    cy.get('a[href="19-user_settings.html"]').should('exist');
  });
});