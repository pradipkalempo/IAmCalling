describe('Ideology Analyzer Page Tests', () => {
  beforeEach(() => {
    // Mock the API responses for photos
    cy.intercept('GET', '/api/cloudinary/photos/communist', {
      statusCode: 200,
      body: [
        'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1760666941/Ideology_root/communist/Angela_Davis-Communist_z4o9ce.jpg',
        'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1760666942/Ideology_root/communist/Arthur_Scargill-Communist_yxioao.jpg'
      ]
    }).as('getCommunistPhotos');
    
    cy.intercept('GET', '/api/cloudinary/photos/fascist', {
      statusCode: 200,
      body: [
        'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1760667763/Ideology_root/fascist/Al_Qaida-Fascist_h4y514.png',
        'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1760667764/Ideology_root/fascist/Anil_Mishra-Fascist_s9ckdo.png'
      ]
    }).as('getFascistPhotos');
    
    cy.intercept('GET', '/api/cloudinary/photos/leftist', {
      statusCode: 200,
      body: [
        'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1760668407/Ideology_root/leftist/Amartya_Sen-Leftist_dznh2c.png',
        'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1760668408/Ideology_root/leftist/Arvind_Kejriwal-Leftist_fmaqro.png'
      ]
    }).as('getLeftistPhotos');
    
    cy.intercept('GET', '/api/cloudinary/photos/rightist', {
      statusCode: 200,
      body: [
        'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1760674432/Ideology_root/rightist/AIPMLB-Rightist_cpz8u1.png',
        'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1760674433/Ideology_root/rightist/Akbar_Badshah-Rightist_lrc3px.png'
      ]
    }).as('getRightistPhotos');
    
    cy.intercept('GET', '/api/cloudinary/photos/neutral', {
      statusCode: 200,
      body: [
        'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1760673656/Ideology_root/neutral/Abdul_Kalam-Neutral_k1egt3.png',
        'https://res.cloudinary.com/dkvrhjvcj/image/upload/v1760673657/Ideology_root/neutral/Ajit_Pawar-Neutral_qsdtek.png'
      ]
    }).as('getNeutralPhotos');
  });

  it('should load the ideology analyzer page successfully', () => {
    cy.visit('/09-ideology-analyzer.html');
    cy.title().should('include', 'Ideology Blood Flow');
    cy.get('body').should('be.visible');
  });

  it('should display the game board and UI elements', () => {
    cy.visit('/09-ideology-analyzer.html');
    
    // Check that the game container exists
    cy.get('.game-container').should('exist');
    
    // Check that the game board exists
    cy.get('.game-board').should('exist');
    
    // Check that the photo selection section exists
    cy.get('.photo-selection-section').should('exist');
    
    // Check that the section header exists
    cy.get('.section-header').should('exist');
    
    // Check that the section title exists
    cy.get('.section-title').should('contain.text', 'Select a Direction');
  });

  it('should load photos from all ideology categories', () => {
    cy.visit('/09-ideology-analyzer.html');
    
    // Wait for all API calls to complete
    cy.wait(['@getCommunistPhotos', '@getFascistPhotos', '@getLeftistPhotos', '@getRightistPhotos', '@getNeutralPhotos']);
    
    // Check that photos are displayed in the container
    cy.get('.photo-container').should('exist');
    
    // Check that photo options are loaded
    cy.get('.photo-option').should('have.length.greaterThan', 0);
    
    // Check that each photo option has an image
    cy.get('.photo-option').first().find('.photo-image').should('exist');
    
    // Check that each photo option has info
    cy.get('.photo-option').first().find('.photo-info').should('exist');
  });

  it('should allow selecting a photo and proceed to next round', () => {
    cy.visit('/09-ideology-analyzer.html');
    
    // Wait for API calls
    cy.wait(['@getCommunistPhotos', '@getFascistPhotos', '@getLeftistPhotos', '@getRightistPhotos', '@getNeutralPhotos']);
    
    // Check initial round number
    cy.get('#current-round').should('contain.text', '1');
    
    // Select the first photo option
    cy.get('.photo-option').first().click();
    
    // Check that the round number updates (after a short delay for animation)
    cy.wait(1000);
    cy.get('#current-round').should('contain.text', '2');
  });

  it('should have proper styling and visual elements', () => {
    cy.visit('/09-ideology-analyzer.html');
    
    // Check that the game board has the correct background
    cy.get('.game-board').should('have.css', 'background');
    
    // Check that the photo selection section has the correct background
    cy.get('.photo-selection-section').should('have.css', 'background');
    
    // Check that photo options have the correct styling
    cy.get('.photo-option').should('have.css', 'border-radius');
    cy.get('.photo-option').should('have.css', 'box-shadow');
    
    // Check that the photo images exist
    cy.get('.photo-image').should('exist');
  });

  it('should display ideology brains at the bottom of the game board', () => {
    cy.visit('/09-ideology-analyzer.html');
    
    // Check that all ideology brains exist
    cy.get('.ideology-brain[data-ideology="fascist"]').should('exist');
    cy.get('.ideology-brain[data-ideology="rightist"]').should('exist');
    cy.get('.ideology-brain[data-ideology="neutral"]').should('exist');
    cy.get('.ideology-brain[data-ideology="leftist"]').should('exist');
    cy.get('.ideology-brain[data-ideology="communist"]').should('exist');
  });

  it('should have responsive design for mobile view', () => {
    cy.visit('/09-ideology-analyzer.html');
    
    // Test mobile view
    cy.viewport('iphone-6');
    
    // Check that the game container still exists
    cy.get('.game-container').should('exist');
    
    // Check that the game board still exists
    cy.get('.game-board').should('exist');
    
    // Check that the photo selection section still exists
    cy.get('.photo-selection-section').should('exist');
  });

  it('should have responsive design for desktop view', () => {
    cy.visit('/09-ideology-analyzer.html');
    
    // Test desktop view
    cy.viewport(1200, 800);
    
    // Check that the game container still exists
    cy.get('.game-container').should('exist');
    
    // Check that the game board still exists
    cy.get('.game-board').should('exist');
    
    // Check that the photo selection section still exists
    cy.get('.photo-selection-section').should('exist');
  });
});