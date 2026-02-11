// Comprehensive End-to-End Tests for Messenger Module
const SUPABASE_URL = 'https://gkckyyyaoqsaouemjnxl.supabase.co';

const testUsers = {
  currentUser: {
    id: 999,
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    profile_photo: null
  },
  user1: {
    id: 201,
    first_name: 'Rahul',
    last_name: 'Yadav',
    email: 'rahul@test.com',
    profile_photo: null
  },
  user2: {
    id: 202,
    first_name: 'Pradip',
    last_name: 'Kale',
    email: 'pradip@test.com',
    profile_photo: null
  },
  user3: {
    id: 203,
    first_name: 'Shital',
    last_name: 'Kambale',
    email: 'shital@test.com',
    profile_photo: 'https://example.com/photo.jpg'
  }
};

const mockMessages = [
  {
    id: 1,
    sender_id: 201,
    receiver_id: 999,
    content: 'Hey from Rahul',
    created_at: '2026-02-11T08:00:00.000Z',
    read: false
  },
  {
    id: 2,
    sender_id: 999,
    receiver_id: 201,
    content: 'Hello Rahul',
    created_at: '2026-02-11T08:01:00.000Z',
    read: true
  },
  {
    id: 3,
    sender_id: 202,
    receiver_id: 999,
    content: 'Morning from Pradip',
    created_at: '2026-02-11T09:00:00.000Z',
    read: false
  },
  {
    id: 4,
    sender_id: 999,
    receiver_id: 202,
    content: 'Good morning Pradip',
    created_at: '2026-02-11T09:05:00.000Z',
    read: true
  },
  {
    id: 5,
    sender_id: 203,
    receiver_id: 999,
    content: 'Hi Test User!',
    created_at: '2026-02-11T10:00:00.000Z',
    read: false
  }
];

function buildSupabaseStub(win) {
  win.supabase = {
    createClient: () => ({
      channel: () => ({
        on: () => ({
          subscribe: () => ({})
        })
      })
    })
  };
}

function extractUserIdFromUrl(url, currentUserId) {
  const matches = Array.from(url.matchAll(/(?:sender_id|receiver_id)\.(?:eq|in)\.\(?(\d+)\)?/g));
  const ids = matches.map(m => parseInt(m[1], 10));
  return ids.find(id => id !== currentUserId);
}

describe('Messenger Module - Comprehensive E2E Tests', () => {
  
  beforeEach(() => {
    // Intercept users API
    cy.intercept('GET', `${SUPABASE_URL}/rest/v1/users*`, {
      statusCode: 200,
      body: [testUsers.user1, testUsers.user2, testUsers.user3]
    }).as('getUsers');

    // Intercept messages API
    cy.intercept('GET', `${SUPABASE_URL}/rest/v1/messages*`, (req) => {
      const url = req.url;

      if (url.includes('order=created_at.asc')) {
        const otherUserId = extractUserIdFromUrl(url, testUsers.currentUser.id);
        const filtered = mockMessages
          .filter(msg =>
            (msg.sender_id === testUsers.currentUser.id && msg.receiver_id === otherUserId) ||
            (msg.sender_id === otherUserId && msg.receiver_id === testUsers.currentUser.id)
          )
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        req.reply({ statusCode: 200, body: filtered });
      } else if (url.includes('order=created_at.desc')) {
        const sorted = [...mockMessages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        req.reply({ statusCode: 200, body: sorted });
      } else {
        req.reply({ statusCode: 200, body: mockMessages });
      }
    }).as('getMessages');

    // Intercept POST messages
    cy.intercept('POST', `${SUPABASE_URL}/rest/v1/messages`, (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: Date.now(),
          ...req.body,
          created_at: new Date().toISOString()
        }
      });
    }).as('postMessage');

    // Visit messenger page
    cy.visit('/34-icalluser-messenger.html', {
      onBeforeLoad(win) {
        win.localStorage.clear();
        win.localStorage.setItem('currentUser', JSON.stringify(testUsers.currentUser));
        buildSupabaseStub(win);
      },
      failOnStatusCode: false
    });
    
    cy.wait(2000);
  });

  describe('UI Rendering and Design', () => {
    it('should render all core UI elements correctly', () => {
      cy.wait('@getUsers', { timeout: 15000 });
      cy.get('body', { timeout: 10000 }).should('be.visible');
      
      cy.contains('Messages', { timeout: 10000 }).should('be.visible');
      cy.get('#searchBox', { timeout: 10000 }).should('exist').and('have.attr', 'placeholder', 'Search conversations...');
      cy.get('.conversation-item', { timeout: 10000 }).should('have.length', 3);
      cy.get('#chat-list-view').should('be.visible');
      cy.get('#chat-window-view').should('exist');
    });

    it('should apply correct design tokens and styling', () => {
      cy.wait('@getUsers');
      
      cy.get('body').should('have.css', 'background-color', 'rgb(11, 20, 26)');
      cy.get('#send-btn').should('have.css', 'background-color', 'rgb(0, 168, 132)');
      cy.get('.chat-list-header').should('have.css', 'background-color', 'rgb(32, 44, 51)');
    });

    it('should display user avatars with fallback', () => {
      cy.wait('@getUsers');
      
      cy.get('.user-avatar img').should('have.length', 3);
      cy.get('.user-avatar img').first().should('have.attr', 'src').and('include', 'ui-avatars.com');
    });

    it('should show online status indicators', () => {
      cy.wait('@getUsers');
      
      cy.get('.user-status.online').should('have.length', 3);
      cy.get('.user-status.online').first().should('have.css', 'background-color', 'rgb(0, 168, 132)');
    });
  });

  describe('Conversation List Functionality', () => {
    it('should load and display all users', () => {
      cy.wait('@getUsers');
      
      cy.contains('Rahul Yadav').should('be.visible');
      cy.contains('Pradip Kale').should('be.visible');
      cy.contains('Shital Kambale').should('be.visible');
    });

    it('should sort conversations by latest message time', () => {
      cy.wait('@getUsers');
      cy.wait('@getMessages');
      
      cy.get('.conversation-item').first().should('have.attr', 'data-user-id', '203');
      cy.get('.conversation-item').eq(1).should('have.attr', 'data-user-id', '202');
      cy.get('.conversation-item').last().should('have.attr', 'data-user-id', '201');
    });

    it('should display unread message badges correctly', () => {
      cy.wait('@getUsers');
      cy.wait('@getMessages');
      
      cy.get('.conversation-item[data-user-id="201"]').find('.unread-badge').should('exist');
      cy.get('.conversation-item[data-user-id="202"]').find('.unread-badge').should('exist');
      cy.get('.conversation-item[data-user-id="203"]').find('.unread-badge').should('exist');
    });

    it('should show last message preview in conversation list', () => {
      cy.wait('@getUsers');
      cy.wait('@getMessages');
      
      cy.get('.conversation-item[data-user-id="203"]').find('.last-message').should('contain', 'Hi Test User!');
    });

    it('should display message timestamps', () => {
      cy.wait('@getUsers');
      cy.wait('@getMessages');
      
      cy.get('.message-time').should('have.length.at.least', 3);
    });
  });

  describe('Search Functionality', () => {
    it('should filter conversations by user name', () => {
      cy.wait('@getUsers');
      
      cy.get('#searchBox').type('rahul');
      cy.get('.conversation-item:visible').should('have.length', 1);
      cy.contains('Rahul Yadav').should('be.visible');
      cy.contains('Pradip Kale').should('not.be.visible');
    });

    it('should be case-insensitive', () => {
      cy.wait('@getUsers');
      
      cy.get('#searchBox').type('PRADIP');
      cy.get('.conversation-item:visible').should('have.length', 1);
      cy.contains('Pradip Kale').should('be.visible');
    });

    it('should show all conversations when search is cleared', () => {
      cy.wait('@getUsers');
      
      cy.get('#searchBox').type('rahul');
      cy.get('.conversation-item:visible').should('have.length', 1);
      
      cy.get('#searchBox').clear();
      cy.get('.conversation-item:visible').should('have.length', 3);
    });

    it('should show no results for non-matching search', () => {
      cy.wait('@getUsers');
      
      cy.get('#searchBox').type('nonexistent');
      cy.get('.conversation-item:visible').should('have.length', 0);
    });
  });

  describe('Chat Window Functionality', () => {
    it('should open chat window when conversation is clicked', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      cy.get('#chat-window-view').should('have.class', 'active');
      cy.get('#chatUserName').should('contain.text', 'Rahul Yadav');
    });

    it('should load and display conversation messages', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      cy.get('#chat-messages').within(() => {
        cy.contains('Hey from Rahul').should('be.visible');
        cy.contains('Hello Rahul').should('be.visible');
      });
    });

    it('should display sent and received messages with correct styling', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      cy.get('.message.received').should('exist');
      cy.get('.message.sent').should('exist');
      cy.get('.message.sent .message-bubble').should('have.css', 'background-color', 'rgb(0, 92, 75)');
    });

    it('should show user status as Online', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      cy.get('#chatUserStatus').should('contain.text', 'Online');
    });

    it('should clear unread badge when opening conversation', () => {
      cy.wait('@getUsers');
      cy.wait('@getMessages');
      
      cy.get('.conversation-item[data-user-id="201"]').as('rahulConv');
      cy.get('@rahulConv').find('.unread-badge').should('exist');
      
      cy.get('@rahulConv').click();
      cy.wait('@getMessages');
      
      cy.get('@rahulConv').find('.unread-badge').should('not.be.visible');
    });

    it('should highlight active conversation', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      cy.get('.conversation-item[data-user-id="201"]').should('have.class', 'active');
    });
  });

  describe('Message Sending', () => {
    it('should send a text message successfully', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      const testMessage = 'Test message from Cypress';
      cy.get('#chat-input').type(testMessage);
      cy.get('#send-btn').click();
      
      cy.wait('@postMessage');
      cy.get('.message.sent').last().should('contain.text', testMessage);
    });

    it('should send message on Enter key press', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      const testMessage = 'Enter key test message';
      cy.get('#chat-input').type(testMessage + '{enter}');
      
      cy.wait('@postMessage');
      cy.get('.message.sent').last().should('contain.text', testMessage);
    });

    it('should clear input field after sending', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      cy.get('#chat-input').type('Test message{enter}');
      cy.wait('@postMessage');
      
      cy.get('#chat-input').should('have.value', '');
    });

    it('should not send empty messages', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      const initialMessageCount = cy.get('.message').its('length');
      
      cy.get('#chat-input').type('   ');
      cy.get('#send-btn').click();
      
      cy.get('.message').its('length').should('equal', initialMessageCount);
    });

    it('should display message timestamp', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      cy.get('#chat-input').type('Timestamp test{enter}');
      cy.wait('@postMessage');
      
      cy.get('.message.sent').last().find('.message-time').should('exist');
    });

    it('should show delivery status icon for sent messages', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      cy.get('#chat-input').type('Status test{enter}');
      cy.wait('@postMessage');
      
      cy.get('.message.sent').last().find('.fa-check-double').should('exist');
    });

    it('should scroll to bottom after sending message', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      cy.get('#chat-input').type('Scroll test{enter}');
      cy.wait('@postMessage');
      
      cy.get('#chat-messages').then($el => {
        expect($el[0].scrollTop).to.be.closeTo($el[0].scrollHeight - $el[0].clientHeight, 10);
      });
    });

    it('should move conversation to top after sending message', () => {
      cy.wait('@getUsers');
      cy.wait('@getMessages');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      cy.get('#chat-input').type('Move to top test{enter}');
      cy.wait('@postMessage');
      
      cy.get('#back-btn').click();
      cy.get('.conversation-item').first().should('have.attr', 'data-user-id', '201');
    });

    it('should update last message preview in conversation list', () => {
      cy.wait('@getUsers');
      cy.wait('@getMessages');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      const newMessage = 'Preview update test';
      cy.get('#chat-input').type(newMessage + '{enter}');
      cy.wait('@postMessage');
      
      cy.get('#back-btn').click();
      cy.get('.conversation-item[data-user-id="201"]').find('.last-message').should('contain', newMessage);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should show back button on mobile', () => {
      cy.viewport(375, 667);
      cy.wait('@getUsers');
      
      cy.get('.conversation-item').first().click();
      cy.wait('@getMessages');
      
      cy.get('#back-btn').should('be.visible');
    });

    it('should navigate back to conversation list on mobile', () => {
      cy.viewport(375, 667);
      cy.wait('@getUsers');
      
      cy.get('.conversation-item').first().click();
      cy.wait('@getMessages');
      
      cy.get('#chat-window-view').should('have.class', 'active');
      cy.get('#back-btn').click();
      cy.get('#chat-window-view').should('not.have.class', 'active');
    });

    it('should hide back button on desktop', () => {
      cy.viewport(1280, 720);
      cy.wait('@getUsers');
      
      cy.get('.conversation-item').first().click();
      cy.wait('@getMessages');
      
      cy.get('#back-btn').should('not.be.visible');
    });

    it('should display side-by-side layout on desktop', () => {
      cy.viewport(1280, 720);
      cy.wait('@getUsers');
      
      cy.get('#chat-list-view').should('be.visible');
      cy.get('#chat-window-view').should('be.visible');
    });
  });

  describe('Multiple Conversations', () => {
    it('should switch between different conversations', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      cy.get('#chatUserName').should('contain.text', 'Rahul Yadav');
      
      cy.get('#back-btn').click();
      
      cy.get('.conversation-item[data-user-id="202"]').click();
      cy.wait('@getMessages');
      cy.get('#chatUserName').should('contain.text', 'Pradip Kale');
    });

    it('should maintain separate message history for each conversation', () => {
      cy.wait('@getUsers');
      
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      cy.get('#chat-messages').within(() => {
        cy.contains('Hey from Rahul').should('be.visible');
      });
      
      cy.get('#back-btn').click();
      
      cy.get('.conversation-item[data-user-id="202"]').click();
      cy.wait('@getMessages');
      cy.get('#chat-messages').within(() => {
        cy.contains('Morning from Pradip').should('be.visible');
        cy.contains('Hey from Rahul').should('not.exist');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API failures gracefully', () => {
      cy.intercept('GET', `${SUPABASE_URL}/rest/v1/users*`, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getUsersError');
      
      cy.visit('/34-icalluser-messenger.html', {
        onBeforeLoad(win) {
          win.localStorage.setItem('currentUser', JSON.stringify(testUsers.currentUser));
          buildSupabaseStub(win);
        }
      });
      
      cy.wait('@getUsersError');
      cy.get('#conversationsList').should('exist');
    });

    it('should handle message send failures', () => {
      cy.intercept('POST', `${SUPABASE_URL}/rest/v1/messages`, {
        statusCode: 500,
        body: { error: 'Failed to send' }
      }).as('postMessageError');
      
      cy.wait('@getUsers');
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      cy.get('#chat-input').type('Error test{enter}');
      cy.wait('@postMessageError');
      
      cy.get('.message.sent').last().should('contain.text', 'Error test');
    });
  });

  describe('Performance', () => {
    it('should load users within acceptable time', () => {
      const startTime = Date.now();
      cy.wait('@getUsers').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(2000);
      });
    });

    it('should render conversation list efficiently', () => {
      cy.wait('@getUsers');
      cy.get('.conversation-item').should('have.length', 3);
      cy.get('.conversation-item').each($el => {
        cy.wrap($el).should('be.visible');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper input labels and placeholders', () => {
      cy.wait('@getUsers');
      cy.get('#searchBox').should('have.attr', 'placeholder', 'Search conversations...');
      cy.get('#chat-input').should('have.attr', 'placeholder', 'Type a message');
    });

    it('should support keyboard navigation', () => {
      cy.wait('@getUsers');
      cy.get('.conversation-item[data-user-id="201"]').click();
      cy.wait('@getMessages');
      
      cy.get('#chat-input').focus().should('have.focus');
      cy.get('#chat-input').type('Keyboard test{enter}');
      cy.wait('@postMessage');
    });
  });
});
