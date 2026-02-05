describe('Login → Dashboard → Logout End-to-End Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    firstName: 'SystemTest',
    lastName: 'User',
    email: `systemtest${timestamp}@example.com`,
    password: 'securePassword123'
  };

  before(() => {
    // Clear any existing data that might interfere with tests
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should complete the full flow: Register → Login → Dashboard → Logout', () => {
    // Step 1: Register a new user
    cy.visit('/16-register.html');
    cy.get('input[name="firstName"]').type(testUser.firstName);
    cy.get('input[name="lastName"]').type(testUser.lastName);
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[name="confirmPassword"]').type(testUser.password);
    cy.get('#terms').check();
    cy.get('button[type="submit"]').click();
    
    // Wait for either success or already registered message
    cy.get('#notification', { timeout: 10000 }).should('be.visible');
    
    // Handle both cases: new registration or existing user
    cy.get('#notification').then(($notification) => {
      const text = $notification.text();
      if (text.includes('already registered')) {
        // User already exists, proceed to login
        cy.visit('/15-login.html');
        cy.get('input[name="email"]').type(testUser.email);
        cy.get('input[name="password"]').type(testUser.password);
        cy.get('button[type="submit"]').click();
      } else {
        // New registration, wait for redirect
        cy.contains('Registration successful').should('be.visible');
        // Wait for automatic redirect to dashboard
        cy.url({ timeout: 10000 }).should('include', '/18-profile.html');
      }
    });
    
    // Step 2: Verify we're on the dashboard
    cy.url({ timeout: 10000 }).should('include', '/18-profile.html');
    cy.contains('Profile').should('be.visible');
    cy.contains(testUser.firstName).should('be.visible');
    cy.contains(testUser.lastName).should('be.visible');

    // Step 3: Logout
    // Click on the profile thumbnail to open the dropdown menu
    cy.get('.profile-thumbnail').click();
    // Click on the logout button in the dropdown menu
    cy.get('.logout-action').click();
    
    // After logout, should be redirected to home page
    cy.url({ timeout: 10000 }).should('include', '/01-index.html');
  });

  it('should prevent access to dashboard after logout', () => {
    // Try to access dashboard after logout
    cy.visit('/18-profile.html');
    
    // Should be redirected to home page
    cy.url({ timeout: 10000 }).should('include', '/01-index.html');
  });

  it('should allow re-login after logout', () => {
    // Login again with the same credentials
    cy.visit('/15-login.html');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Should be redirected to dashboard
    cy.url({ timeout: 10000 }).should('include', '/18-profile.html');

    // Verify we're on the dashboard
    cy.contains('Profile').should('be.visible');
    cy.contains(testUser.firstName).should('be.visible');
  });
});