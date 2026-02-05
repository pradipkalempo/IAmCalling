describe('Universal Navigation Bar Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1000/01-index.html')
    cy.wait(2000) // Wait for universal topbar to load
  })

  it('should display universal topbar', () => {
    cy.get('.universal-topbar')
      .should('be.visible')
      .and('have.css', 'position', 'fixed')
      .and('have.css', 'top', '0px')
  })

  it('should display navigation links in topbar', () => {
    // Check if navigation container exists
    cy.get('.topbar-nav')
      .should('exist')
      .and('be.visible')

    // Check individual navigation links
    const expectedLinks = [
      { text: 'Home', href: '01-index.html' },
      { text: 'Articles', href: '01-response-index.html' },
      { text: 'Battle', href: '10-political-battle.html' },
      { text: 'Test Ideology', href: '09-ideology-analyzer.html' },
      { text: 'About', href: '02-about.html' },
      { text: 'Categories', href: '04-categories.html' }
    ]

    expectedLinks.forEach((link) => {
      cy.get('.nav-link')
        .contains(link.text)
        .should('be.visible')
        .and('have.attr', 'href', link.href)
        .and('have.css', 'color', 'rgb(255, 255, 255)') // white color
    })
  })

  it('should have proper topbar layout', () => {
    // Check topbar structure
    cy.get('.topbar-container')
      .should('be.visible')
      .within(() => {
        // Left section - Logo
        cy.get('.topbar-left .topbar-logo')
          .should('be.visible')
          .and('contain', 'IAMCALLING')

        // Center section - Navigation
        cy.get('.topbar-center .topbar-nav')
          .should('be.visible')
          .find('.nav-link')
          .should('have.length', 6)

        // Right section - User display
        cy.get('.topbar-right .user-display')
          .should('be.visible')
      })
  })

  it('should navigate to correct pages when links are clicked', () => {
    // Test Home link
    cy.get('.nav-link').contains('Home').click()
    cy.url().should('include', '01-index.html')

    // Test Articles link
    cy.get('.nav-link').contains('Articles').click()
    cy.url().should('include', '01-response-index.html')

    // Go back to test other links
    cy.visit('http://localhost:1000/01-index.html')
    cy.wait(1000)

    // Test Battle link
    cy.get('.nav-link').contains('Battle').click()
    cy.url().should('include', '10-political-battle.html')
  })

  it('should have hover effects on navigation links', () => {
    cy.get('.nav-link').first()
      .trigger('mouseover')
      .should('have.css', 'background-color')
      .and('not.equal', 'rgba(0, 0, 0, 0)')
  })

  it('should be responsive on mobile', () => {
    // Test mobile viewport
    cy.viewport(375, 667)
    
    cy.get('.mobile-menu-btn')
      .should('be.visible')
      .click()

    cy.get('.topbar-nav.mobile-active')
      .should('be.visible')
      .find('.nav-link')
      .should('have.length', 6)
  })

  it('should maintain navigation across different pages', () => {
    const pages = [
      '01-index.html',
      '01-response-index.html', 
      '22-write_article.html'
    ]

    pages.forEach((page) => {
      cy.visit(`http://localhost:1000/${page}`)
      cy.wait(1000)
      
      cy.get('.universal-topbar')
        .should('be.visible')
      
      cy.get('.topbar-nav .nav-link')
        .should('have.length', 6)
        .and('be.visible')
    })
  })
})