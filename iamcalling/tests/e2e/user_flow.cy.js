describe('End-to-End User Flow', () => {
  it('should complete full user registration, login, profile update, and logout flow', () => {
    // Step 1: Register a new user
    cy.visit('/16-register.html');
    cy.get('input[name="firstName"]').type('E2ETest');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="email"]').type('e2etest@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.contains('Registration successful').should('be.visible');

    // Step 2: Login with the new user
    cy.visit('/15-login.html');
    cy.get('input[name="email"]').type('e2etest@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/15-login.html');

    // Step 3: Update profile
    cy.visit('/18-profile.html');
    cy.get('input[name="firstName"]').clear().type('UpdatedE2E');
    cy.get('input[name="lastName"]').clear().type('UpdatedUser');
    cy.get('button[type="submit"]').click();
    cy.contains('Profile updated successfully').should('be.visible');

    // Step 4: Logout
    cy.get('a[href*="logout"]').click();
    cy.contains('Please login to continue').should('be.visible');
  });

  it('should handle password reset flow', () => {
    cy.visit('/20-password_reset.html');
    cy.get('input[name="email"]').type('e2etest@example.com');
    cy.get('button[type="submit"]').click();
    cy.contains('Password reset email sent').should('be.visible');
  });

  it('should handle session expiry', () => {
    // Login first
    cy.visit('/15-login.html');
    cy.get('input[name="email"]').type('e2etest@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Simulate session expiry
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.reload();
    cy.contains('Session expired').should('be.visible');
  });
});
