describe('End-to-End Navigation Tests', () => {
  it('should navigate through core pages without 404 errors', () => {
    // Test core pages that should exist
    cy.visit('/01-index.html', { timeout: 10000 });
    cy.title().should('include', 'IAMCALLING');
    
    cy.visit('/02-about.html', { timeout: 10000 });
    cy.contains('About Us').should('exist');
    
    cy.visit('/04-categories.html', { timeout: 10000 });
    cy.contains('Categories').should('exist');
    
    cy.visit('/09-ideology-analyzer.html', { timeout: 10000 });
    cy.contains('Ideological Analyzer').should('exist');
    
    cy.visit('/15-login.html', { timeout: 10000 });
    cy.contains('Welcome Back').should('exist');
    
    cy.visit('/16-register.html', { timeout: 10000 });
    cy.contains('Create Account').should('exist');
    
    cy.visit('/18-profile.html', { timeout: 10000 });
    cy.contains('Alex Johnson').should('exist');
    
    cy.visit('/19-user_settings.html', { timeout: 10000 });
    cy.contains('Account Settings').should('exist');
    
    cy.visit('/20-password_reset.html', { timeout: 10000 });
    cy.contains('Reset Password').should('exist');
  });

  it('should test main navigation menu links', () => {
    cy.visit('/06-enhanced-home.html', { timeout: 10000 });
    
    // Test navigation menu links that actually exist
    cy.get('a[href="06-enhanced-home.html"]', { timeout: 10000 }).first().should('exist');
    cy.get('a[href="04-categories.html"]', { timeout: 10000 }).first().should('exist');
    cy.get('a[href="09-ideology-analyzer.html"]', { timeout: 10000 }).first().should('exist');
    cy.get('a[href="22-write_article.html"]', { timeout: 10000 }).first().should('exist');
    
    // Test quick action links in sidebar
    cy.get('a[href="22-write_article.html"]', { timeout: 10000 }).eq(1).should('exist');
    cy.get('a[href="18-profile.html"]', { timeout: 10000 }).first().should('exist');
    cy.get('a[href="13-rewards_center.html"]', { timeout: 10000 }).first().should('exist');
    
    // Test messenger link (actual link in navigation)
    cy.get('a[href="34-icalluser-messenger.html"]', { timeout: 10000 }).first().should('exist');
  });

  it('should test that key user flow pages load successfully', () => {
    // Test that key user flow pages load
    cy.visit('/15-login.html', { timeout: 10000 });
    cy.contains('h1', 'Welcome Back').should('be.visible');
    
    cy.visit('/16-register.html', { timeout: 10000 });
    cy.contains('h1', 'Create Account').should('be.visible');
    
    cy.visit('/18-profile.html', { timeout: 10000 });
    cy.contains('.profile-name', 'Alex Johnson').should('be.visible');
    
    cy.visit('/06-enhanced-home.html', { timeout: 10000 });
    cy.contains('.welcome-title', 'Welcome back, Alex!').should('be.visible');
  });
});
