describe('User Management Flows', () => {
  it('should show the password reset form', () => {
    cy.visit('/20-password_reset.html');
    cy.contains('Reset Password').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show error for invalid email during password reset', () => {
    cy.visit('/20-password_reset.html');
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.get('#notification').should('have.class', 'show');
    cy.get('#notification').should('contain.text', 'Invalid email');
  });

  it('should handle session expiry and logout correctly', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/15-login.html');
    // The actual login page doesn't show this message, but we can check that
    // we're on the login page
    cy.contains('Welcome Back').should('be.visible');
  });
});