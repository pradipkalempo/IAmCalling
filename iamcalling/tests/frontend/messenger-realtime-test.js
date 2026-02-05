// Messenger Real-time Functionality Test
describe('Messenger Real-time Functionality', () => {
    beforeEach(() => {
        // Clear localStorage to ensure clean test state
        cy.clearLocalStorage();
    });

    it('should establish Supabase real-time connection and send/receive messages', () => {
        // Visit the messenger page as User 1 (Rahul)
        cy.visit('http://localhost:1000/34-icalluser-messenger.html');
        
        // Wait for initialization
        cy.get('.conversation-item', { timeout: 10000 }).should('exist');
        
        // Login as Rahul (assuming test user setup)
        cy.window().then((win) => {
            // Set test user data in localStorage
            const testUser = {
                id: 95,
                full_name: 'Rahul Yadav',
                email: 'rahul@test.com'
            };
            win.localStorage.setItem('currentUser', JSON.stringify(testUser));
            win.location.reload();
        });
        
        // Wait for user data to load
        cy.contains('Rahul Yadav', { timeout: 10000 }).should('exist');
        
        // Select Pradip (user 88) to chat with
        cy.contains('Pradip Kale').click();
        
        // Type and send a message
        const testMessage = `Test message at ${new Date().toISOString()}`;
        cy.get('#chat-input').type(testMessage);
        cy.get('#send-btn').click();
        
        // Verify message was sent
        cy.contains(testMessage).should('exist');
        
        // Verify message appears in UI (sent message)
        cy.get('.message.sent').contains(testMessage).should('exist');
    });

    it('should receive messages in real-time', () => {
        // This test would require two browser instances or mocking
        // For now, we'll test the subscription mechanism
        
        cy.visit('http://localhost:1000/34-icalluser-messenger.html');
        
        // Check that Supabase is initialized
        cy.window().then((win) => {
            expect(win.messenger).to.exist;
            expect(win.messenger.supabase).to.exist;
        });
        
        // Check that real-time subscriptions are set up
        cy.window().then((win) => {
            // Look for subscription status in console logs
            cy.stub(win.console, 'log').as('consoleLog');
            cy.stub(win.console, 'error').as('consoleError');
        });
        
        // Wait a bit for subscriptions to establish
        cy.wait(2000);
        
        // Check console for subscription messages
        cy.get('@consoleLog').should('be.calledWith', '📡 Message subscription: SUBSCRIBED');
    });

    it('should handle subscription errors gracefully', () => {
        cy.visit('http://localhost:1000/34-icalluser-messenger.html');
        
        // Mock a subscription error
        cy.window().then((win) => {
            // Intercept and simulate subscription error
            cy.stub(win.console, 'error').as('consoleError');
        });
        
        // Trigger subscription error handling
        cy.window().then((win) => {
            if (win.messenger && win.messenger.handleSubscriptionError) {
                win.messenger.handleSubscriptionError(new Error('Test subscription error'));
            }
        });
        
        // Verify error handling
        cy.get('@consoleError').should('be.calledWith', '❌ Subscription error handler:');
    });
});