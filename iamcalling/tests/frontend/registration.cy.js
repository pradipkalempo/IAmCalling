describe('Registration Page', () => {
  beforeEach(() => {
    cy.visit('/16-register.html');
    cy.wait(1000); // Wait for page to load completely
  });

  it('should show validation errors for empty required fields', () => {
    cy.get('button[type="submit"]').click();
    cy.get('#notification').should('be.visible');
    cy.get('#notification').should('contain.text', 'First Name is required');
  });

  it('should show error for invalid email format', () => {
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('input[type="checkbox"]').check();
    cy.get('button[type="submit"]').click();
    cy.get('#notification').should('be.visible');
    cy.get('#notification').should('contain.text', 'Please enter a valid email address');
  });

  it('should show error if passwords do not match', () => {
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password321');
    cy.get('input[type="checkbox"]').check();
    cy.get('button[type="submit"]').click();
    cy.get('#notification').should('be.visible');
    cy.get('#notification').should('contain.text', 'Passwords do not match');
  });

  it('should register successfully with valid data', () => {
    // Mock the successful registration API response
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: { message: 'Registration successful. You are now logged in.' }
    }).as('registerRequest');

    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="email"]').type('testuser@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('input[type="checkbox"]').check();
    cy.get('button[type="submit"]').click();

    // Wait for the API call
    cy.wait('@registerRequest');

    // Check for successful registration message
    cy.get('#notification').should('be.visible');
    cy.get('#notification').should('contain.text', 'Registration successful');
  });
});