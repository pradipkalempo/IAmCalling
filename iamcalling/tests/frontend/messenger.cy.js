describe('Messenger Functionality Tests', () => {
  beforeEach(() => {
    // Mock the API response for users
    cy.intercept('GET', '/api/users/messenger', {
      statusCode: 200,
      body: [
        {
          id: '1',
          name: 'Sarah Johnson',
          initials: 'SJ',
          email: 'sarah@example.com',
          profile_photo: null,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Michael Chen',
          initials: 'MC',
          email: 'michael@example.com',
          profile_photo: null,
          created_at: new Date().toISOString()
        }
      ]
    }).as('getUsers');
    
    // Visit the messenger page
    cy.visit('/34-icalluser-messenger.html');
  });

  it('should load the messenger page and display UI elements', () => {
    // Check that the page title is correct
    cy.title().should('include', 'Messages - IAMCALLING');
    
    // Check that the sidebar is present
    cy.get('.sidebar').should('exist');
    
    // Check that the main content area is present
    cy.get('.main-content').should('exist');
    
    // Check that the chat header is present
    cy.get('.chat-header').should('exist');
    
    // Check that the conversations list is present
    cy.get('.conversations-list').should('exist');
    
    // Check that the chat messages area is present
    cy.get('.chat-messages').should('exist');
    
    // Check that the chat input area is present
    cy.get('.chat-input-container').should('exist');
  });

  it('should load users and display them in the sidebar', () => {
    // Wait for the API call to complete
    cy.wait('@getUsers');
    
    // Check that users are displayed in the sidebar
    cy.get('.conversation-item').should('have.length', 2);
    
    // Check the first user
    cy.get('.conversation-item').first().within(() => {
      cy.get('.user-name').should('contain.text', 'Sarah Johnson');
      cy.get('.user-avatar').should('contain.text', 'SJ');
    });
    
    // Check the second user
    cy.get('.conversation-item').eq(1).within(() => {
      cy.get('.user-name').should('contain.text', 'Michael Chen');
      cy.get('.user-avatar').should('contain.text', 'MC');
    });
  });

  it('should allow selecting a user and displaying chat', () => {
    // Wait for the API call to complete
    cy.wait('@getUsers');
    
    // Click on the first user
    cy.get('.conversation-item').first().click();
    
    // Check that the user is marked as active
    cy.get('.conversation-item').first().should('have.class', 'active');
    
    // Check that the chat user name is updated
    cy.get('.chat-user-name').should('contain.text', 'Sarah Johnson');
    
    // Check that the chat user avatar is updated
    cy.get('.chat-user-avatar').should('contain.text', 'SJ');
    
    // Check that the initial message is displayed
    cy.get('.chat-messages').should('contain.text', 'Hi! Start your conversation with Sarah Johnson');
  });

  it('should allow sending messages', () => {
    // Wait for the API call to complete
    cy.wait('@getUsers');
    
    // Click on the first user
    cy.get('.conversation-item').first().click();
    
    // Type a message
    cy.get('#chatInput').type('Hello, this is a test message');
    
    // Click the send button
    cy.get('#sendBtn').click();
    
    // Check that the message is displayed in the chat
    cy.get('.message.sent').should('contain.text', 'Hello, this is a test message');
    
    // Check that the input field is cleared
    cy.get('#chatInput').should('have.value', '');
  });

  it('should allow sending messages with Enter key', () => {
    // Wait for the API call to complete
    cy.wait('@getUsers');
    
    // Click on the first user
    cy.get('.conversation-item').first().click();
    
    // Type a message and press Enter
    cy.get('#chatInput').type('Hello, this is a test message{enter}');
    
    // Check that the message is displayed in the chat
    cy.get('.message.sent').should('contain.text', 'Hello, this is a test message');
    
    // Check that the input field is cleared
    cy.get('#chatInput').should('have.value', '');
  });

  it('should show reply messages', () => {
    // Wait for the API call to complete
    cy.wait('@getUsers');
    
    // Click on the first user
    cy.get('.conversation-item').first().click();
    
    // Type a message and press Enter
    cy.get('#chatInput').type('Hello, this is a test message{enter}');
    
    // Wait for the reply (1 second delay in the code)
    cy.wait(1100);
    
    // Check that a reply message is displayed
    cy.get('.message.received').should('exist');
  });

  it('should allow making audio calls', () => {
    // Wait for the API call to complete
    cy.wait('@getUsers');
    
    // Click on the first user
    cy.get('.conversation-item').first().click();
    
    // Click the audio call button
    cy.get('#audioCallBtn').click();
    
    // Check that the call modal is displayed
    cy.get('.call-modal').should('exist');
    cy.get('.call-modal').should('contain.text', 'Audio Call');
    
    // Click the end call button
    cy.get('.end-call').click();
    
    // Check that the call modal is closed
    cy.get('.call-modal').should('not.exist');
  });

  it('should allow making video calls', () => {
    // Wait for the API call to complete
    cy.wait('@getUsers');
    
    // Click on the first user
    cy.get('.conversation-item').first().click();
    
    // Click the video call button
    cy.get('#videoCallBtn').click();
    
    // Check that the call modal is displayed
    cy.get('.call-modal').should('exist');
    cy.get('.call-modal').should('contain.text', 'Video Call');
    
    // Click the end call button
    cy.get('.end-call').click();
    
    // Check that the call modal is closed
    cy.get('.call-modal').should('not.exist');
  });

  it('should toggle sidebar on mobile', () => {
    // Wait for the API call to complete
    cy.wait('@getUsers');
    
    // Check that sidebar is initially hidden on mobile
    cy.viewport('iphone-6');
    cy.get('.sidebar').should('not.have.class', 'active');
    
    // Click the back button to show sidebar
    cy.get('.back-btn').click({force: true});
    
    // Check that sidebar is now visible
    cy.get('.sidebar').should('have.class', 'active');
    
    // Click the back button again to hide sidebar
    cy.get('.back-btn').click({force: true});
    
    // Check that sidebar is hidden again
    cy.get('.sidebar').should('not.have.class', 'active');
  });
});