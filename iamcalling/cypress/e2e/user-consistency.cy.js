describe('User Consistency Test', () => {
  beforeEach(() => {
    // Set up consistent user data
    cy.window().then((win) => {
      const userData = {
        name: 'Test User',
        full_name: 'Test User',
        first_name: 'Test',
        email: 'test@example.com',
        ideology: 'neutral',
        photo: 'https://ui-avatars.com/api/?name=Test+User&background=0a3d0a&color=fff&size=50'
      };
      
      win.localStorage.setItem('currentUser', JSON.stringify(userData));
      win.localStorage.setItem('userToken', 'test-token-123');
    });
  });

  it('should show consistent user across index and profile pages', () => {
    // Visit index page
    cy.visit('http://localhost:1000/01-index.html');
    
    // Wait for topbar to load
    cy.wait(1000);
    
    // Check topbar shows correct user
    cy.get('#universal-topbar').should('be.visible');
    cy.get('.profile-link').should('contain', 'Test User');
    
    // Click on profile link
    cy.get('.profile-link').click();
    
    // Should be on profile page
    cy.url().should('include', '18-profile.html');
    
    // Check profile page shows same user
    cy.get('h1, .profile-name, .user-name').should('contain', 'Test User');
  });

  it('should show consistent user in write article page', () => {
    // Visit write article page
    cy.visit('http://localhost:1000/22-write_article.html');
    
    // Wait for page to load
    cy.wait(1000);
    
    // Check user info section shows correct user
    cy.get('#currentUserName').should('contain', 'Test User');
  });

  it('should maintain user consistency after navigation', () => {
    // Start at index
    cy.visit('http://localhost:1000/01-index.html');
    cy.wait(1000);
    
    // Verify topbar user
    cy.get('.profile-link').should('contain', 'Test User');
    
    // Navigate to write article
    cy.visit('http://localhost:1000/22-write_article.html');
    cy.wait(1000);
    
    // Verify same user in write article
    cy.get('#currentUserName').should('contain', 'Test User');
    
    // Navigate to profile
    cy.visit('http://localhost:1000/18-profile.html');
    cy.wait(1000);
    
    // Verify same user in profile
    cy.get('h1, .profile-name, .user-name').should('contain', 'Test User');
  });

  it('should detect user inconsistency', () => {
    // Set inconsistent data
    cy.window().then((win) => {
      const topbarUser = {
        name: 'Saddam',
        full_name: 'SA Saddam'
      };
      const profileUser = {
        name: 'Sahil Kazi',
        full_name: 'Sahil Kazi'
      };
      
      win.localStorage.setItem('topbarUserData', JSON.stringify(topbarUser));
      win.localStorage.setItem('profileUserData', JSON.stringify(profileUser));
    });
    
    cy.visit('http://localhost:1000/01-index.html');
    cy.wait(1000);
    
    // Should show consistent user (topbar should override)
    cy.get('.profile-link').should('not.contain', 'Sahil Kazi');
  });
});