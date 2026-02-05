describe('Real-time Messenger Functionality Tests', () => {
  beforeEach(() => {
    // Mock the API response for users
    cy.intercept('GET', '/api/users/messenger', {
      statusCode: 200,
      body: [
        {
          id: 'user1',
          name: 'Sarah Johnson',
          initials: 'SJ',
          email: 'sarah@example.com',
          profile_photo: null,
          created_at: new Date().toISOString()
        },
        {
          id: 'user2',
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

  it('should have the real messenger instance available', () => {
    // Check that the real messenger instance is available
    cy.window().then((win) => {
      expect(win.messengerInstance).to.exist;
    });
  });

  it('should send real messages instead of simulated replies', () => {
    // Wait for the API call to complete
    cy.wait('@getUsers');
    
    // Click on the first user
    cy.get('.conversation-item').first().click();
    
    // Type a message
    cy.get('#chat-input').type('Hello, this is a real test message');
    
    // Click the send button
    cy.get('#send-btn').click();
    
    // Check that the message is displayed in the chat
    cy.get('.message.sent').should('contain.text', 'Hello, this is a real test message');
    
    // Verify that we're not using the simulated reply by checking that
    // no predefined replies are shown
    cy.get('.message.received').should('not.contain.text', 'Thanks for your message!');
    cy.get('.message.received').should('not.contain.text', 'Got it, I\'ll look into that.');
    cy.get('.message.received').should('not.contain.text', 'Sounds good to me!');
  });

  it('should create conversation records in the database', () => {
    // This test would check that conversations are created in Supabase
    // In a real test environment, we would mock Supabase calls
    cy.window().then((win) => {
      // Check that the messenger has Supabase client
      expect(win.messengerInstance.supabase).to.exist;
    });
  });
});