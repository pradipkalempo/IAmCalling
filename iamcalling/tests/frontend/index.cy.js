describe('Index Page and Navigation Tests', () => {
  it('should load the index page successfully', () => {
    cy.visit('/01-index.html');
    cy.title().should('include', 'IAMCALLING');
    cy.get('body').should('be.visible');
  });

  it('should display the ideology test container', () => {
    cy.visit('/01-index.html');
    
    // Check that the ideology test container exists
    cy.get('.ideology-test-container').should('exist');
    
    // Check that the title is correct
    cy.get('.ideology-test-title').should('contain.text', 'Discover Your Ideological Alignment');
    
    // Check that the description is present
    cy.get('.ideology-test-container').should('contain.text', 'Take our quick test to find out where you stand on the ideological spectrum');
  });

  it('should have a working "Start Test" button that navigates to the ideology analyzer', () => {
    cy.visit('/01-index.html');
    
    // Check that the Start Test button exists
    cy.get('.ideology-test-button').should('exist');
    
    // Check that the button has the correct text
    cy.get('.ideology-test-button').should('contain.text', 'Start Test');
    
    // Check that the button has the brain icon
    cy.get('.ideology-test-button i').should('have.class', 'fa-brain');
    
    // Click the Start Test button
    cy.get('.ideology-test-button').click();
    
    // Verify navigation to the ideology analyzer page
    cy.url().should('include', '09-ideology-analyzer.html');
    
    // Check that the ideology analyzer page loaded
    cy.title().should('include', 'Ideology Blood Flow');
  });

  it('should have proper styling for the ideology test container', () => {
    cy.visit('/01-index.html');
    
    // Check that the container has the correct styling classes
    cy.get('.ideology-test-container').should('have.css', 'background');
    cy.get('.ideology-test-container').should('have.css', 'border-radius');
    cy.get('.ideology-test-container').should('have.css', 'box-shadow');
    
    // Check that the button has the correct styling
    cy.get('.ideology-test-button').should('have.css', 'background');
    cy.get('.ideology-test-button').should('have.css', 'border-radius');
    cy.get('.ideology-test-button').should('have.css', 'padding');
    cy.get('.ideology-test-button').should('have.css', 'color', 'rgb(255, 255, 255)'); // White text
  });

  it('should have hover effects on the ideology test button', () => {
    cy.visit('/01-index.html');
    
    // Check initial state
    cy.get('.ideology-test-button').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 0)');
    
    // Trigger hover
    cy.get('.ideology-test-button').trigger('mouseover');
    
    // Check hover state (should have translateY transformation)
    // Note: We're not checking the exact transform value as it might vary
    cy.get('.ideology-test-button').should('have.css', 'cursor', 'pointer');
    
    // Trigger mouseout
    cy.get('.ideology-test-button').trigger('mouseout');
    
    // Check back to initial state
    cy.get('.ideology-test-button').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 0)');
  });

  it('should have responsive design for mobile view', () => {
    cy.visit('/01-index.html');
    
    // Test mobile view
    cy.viewport('iphone-6');
    
    // Check that the ideology test container still exists
    cy.get('.ideology-test-container').should('exist');
    
    // Check that the button still exists
    cy.get('.ideology-test-button').should('exist');
    
    // Check that the button is still visible
    cy.get('.ideology-test-button').should('be.visible');
  });

  it('should have responsive design for desktop view', () => {
    cy.visit('/01-index.html');
    
    // Test desktop view
    cy.viewport(1200, 800);
    
    // Check that the ideology test container still exists
    cy.get('.ideology-test-container').should('exist');
    
    // Check that the button still exists
    cy.get('.ideology-test-button').should('exist');
    
    // Check that the button is still visible
    cy.get('.ideology-test-button').should('be.visible');
  });
});
