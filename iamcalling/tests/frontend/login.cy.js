describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/15-login.html');
    cy.wait(1000); // Wait for page to load completely
  });

  it('should show validation errors for empty required fields', () => {
    // Clear any existing values and submit
    cy.get('input[name="email"]').clear();
    cy.get('input[name="password"]').clear();
    cy.get('button[type="submit"]').click();

    // Wait a bit for validation to trigger
    cy.wait(500);

    // Check if validation errors appear
    cy.get('#emailError').should('be.visible').and('contain.text', 'Email is required');
    cy.get('#passwordError').should('be.visible').and('contain.text', 'Password is required');
  });

  it('should show error for invalid credentials', () => {
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Wait for API response
    cy.wait(2000);

    // Check for error message
    cy.get('#notification').scrollIntoView().should('be.visible');
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    // Mock the successful login API response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { success: true, token: 'fake-jwt-token', user: { id: 1, email: 'test@example.com' } }
    }).as('loginRequest');

    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Test@123');
    cy.get('button[type="submit"]').click();

    // Wait for the API call
    cy.wait('@loginRequest');

    // Check for successful login indicators
    cy.get('#notification').scrollIntoView().should('be.visible');
    cy.contains('Welcome').should('be.visible');
    // OR check for redirect to dashboard
    // cy.url().should('include', '/dashboard');
  });
});