describe('Login Page - Cross-Browser Compatibility', () => {
  const testUser = {
    email: 'compatibility@test.com',
    password: 'TestPass123!',
    firstName: 'Compatibility',
    lastName: 'Test'
  };

  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should work on Chrome Desktop', { browser: 'chrome' }, () => {
    cy.visit('/15-login.html');
    
    // Test form submission
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Should show either success or error message (we're testing the UI flow)
    cy.get('#notification, .error-message, .success-message').should('be.visible');
  });

  it('should work on Firefox Desktop', { browser: 'firefox' }, () => {
    cy.visit('/15-login.html');
    
    // Test form validation
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="password"]').type('123');
    cy.get('button[type="submit"]').click();
    
    // Should show validation errors
    cy.get('.error-message').should('be.visible');
  });

  it('should work on Mobile Chrome', { browser: 'chrome', viewportHeight: 667, viewportWidth: 375 }, () => {
    cy.visit('/15-login.html');
    
    // Mobile view should have responsive elements
    cy.get('.mobile-menu').should('exist');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should work on Mobile Safari', { browser: 'webkit', viewportHeight: 667, viewportWidth: 375 }, () => {
    cy.visit('/15-login.html');
    
    // Test touch interactions
    cy.get('input[name="email"]').click().type(testUser.email);
    cy.get('input[name="password"]').click().type(testUser.password);
    
    // Button should be tappable
    cy.get('button[type="submit"]').should('be.visible').click();
  });

  it('should maintain session across page navigation', () => {
    // Mock successful login
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { 
        success: true, 
        token: 'test-jwt-token', 
        user: { id: 1, email: testUser.email } 
      }
    }).as('loginRequest');

    cy.visit('/15-login.html');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Wait for login
    cy.wait('@loginRequest');
    
    // Navigate to another page
    cy.visit('/01-index.html');
    
    // Should maintain logged-in state (check for user-specific elements)
    cy.get('.user-profile, .logout-button').should('exist');
  });

  it('should handle network errors gracefully', () => {
    // Simulate network failure
    cy.intercept('POST', '/api/auth/login', {
      forceNetworkError: true
    }).as('failedLogin');

    cy.visit('/15-login.html');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    cy.wait('@failedLogin');
    
    // Should show network error message
    cy.get('.error-message').should('contain.text', 'network');
  });

  it('should be accessible with keyboard navigation', () => {
    cy.visit('/15-login.html');
    
    // Test tab navigation
    cy.get('body').tab();
    cy.focused().should('have.attr', 'name', 'email');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'name', 'password');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'type', 'submit');
  });

  it('should support screen readers', () => {
    cy.visit('/15-login.html');
    
    // Check for accessibility attributes
    cy.get('input[name="email"]').should('have.attr', 'aria-label').or('have.attr', 'aria-describedby');
    cy.get('input[name="password"]').should('have.attr', 'aria-label').or('have.attr', 'aria-describedby');
    cy.get('button[type="submit"]').should('have.attr', 'aria-label').or('contain.text', 'Login');
  });
});