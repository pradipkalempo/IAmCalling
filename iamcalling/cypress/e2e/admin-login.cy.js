describe('Admin Login', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1000/39-admin-login.html')
  })

  it('should load admin login page', () => {
    cy.contains('ADMIN ACCESS TERMINAL')
    cy.get('#password').should('be.visible')
    cy.get('button[type="submit"]').should('contain', 'AUTHENTICATE')
  })

  it('should login with admin password', () => {
    cy.get('#password').type('admin')
    cy.get('button[type="submit"]').click()
    
    // Should redirect to admin dashboard
    cy.url().should('include', '40-admin-dashboard-simple.html')
  })

  it('should login with admin123 password', () => {
    cy.get('#password').type('admin123')
    cy.get('button[type="submit"]').click()
    
    // Should redirect to admin dashboard
    cy.url().should('include', '40-admin-dashboard-simple.html')
  })

  it('should show error for invalid password', () => {
    cy.get('#password').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    // Should show error message
    cy.get('#errorMessage').should('be.visible')
    cy.get('#accessDenied').should('be.visible')
  })

  it('should clear password field on failed login', () => {
    cy.get('#password').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    // Password field should be cleared
    cy.get('#password').should('have.value', '')
  })
})