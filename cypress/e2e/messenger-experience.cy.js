const SUPABASE_URL = 'https://gkckyyyaoqsaouemjnxl.supabase.co';

const currentUser = {
  id: 999,
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com'
};

const users = [
  {
    id: 201,
    first_name: 'Rahul',
    last_name: 'Yadav',
    email: 'rahul@test.com',
    profile_photo: null
  },
  {
    id: 202,
    first_name: 'Pradip',
    last_name: 'Kale',
    email: 'pradip@test.com',
    profile_photo: null
  }
];

const messages = [
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

function otherUserIdFromUrl(url, currentUserId) {
  const matches = Array.from(url.matchAll(/(?:sender_id|receiver_id)\.eq\.(\d+)/g));
  const ids = matches.map((match) => parseInt(match[1], 10));
  return ids.find((id) => id !== currentUserId);
}

describe('Messenger E2E UX + UI', () => {
  beforeEach(() => {
    cy.intercept('GET', `${SUPABASE_URL}/rest/v1/users*`, {
      statusCode: 200,
      body: users
    }).as('getUsers');

    cy.intercept('GET', `${SUPABASE_URL}/rest/v1/messages*`, (req) => {
      const url = req.url;

      if (url.includes('order=created_at.asc')) {
        const otherUserId = otherUserIdFromUrl(url, currentUser.id);
        const filtered = messages
          .filter((msg) =>
            (msg.sender_id === currentUser.id && msg.receiver_id === otherUserId) ||
            (msg.sender_id === otherUserId && msg.receiver_id === currentUser.id)
          )
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        req.reply({ statusCode: 200, body: filtered });
        return;
      }

      if (url.includes('order=created_at.desc')) {
        const sorted = [...messages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        req.reply({ statusCode: 200, body: sorted });
        return;
      }

      req.reply({ statusCode: 200, body: [] });
    }).as('getMessages');

    cy.intercept('POST', `${SUPABASE_URL}/rest/v1/messages`, {
      statusCode: 201,
      body: {}
    }).as('postMessage');

    cy.visit('/34-icalluser-messenger.html', {
      onBeforeLoad(win) {
        win.localStorage.clear();
        win.localStorage.setItem('currentUser', JSON.stringify(currentUser));
        buildSupabaseStub(win);
      },
      failOnStatusCode: false
    });
    
    cy.wait(2000);
  });

  it('renders core UI and design tokens', () => {
    cy.wait('@getUsers', { timeout: 15000 });
    cy.get('body', { timeout: 10000 }).should('be.visible');

    cy.contains('Messages', { timeout: 10000 }).should('be.visible');
    cy.get('#searchBox', { timeout: 10000 }).should('have.attr', 'placeholder', 'Search conversations...');
    cy.get('.conversation-item', { timeout: 10000 }).should('have.length', 2);

    cy.get('body').should('have.css', 'background-color', 'rgb(11, 20, 26)');
    cy.get('#send-btn').should('have.css', 'background-color', 'rgb(0, 168, 132)');
  });

  it('sorts conversations by latest activity and supports search', () => {
    cy.wait('@getUsers');
    cy.wait('@getMessages');

    cy.get('.conversation-item').first().should('have.attr', 'data-user-id', '202');

    cy.get('#searchBox').type('rahul');
    cy.get('.conversation-item:visible').should('have.length', 1);
    cy.contains('Rahul Yadav').should('be.visible');
  });

  it('opens a conversation, loads messages, clears unread badge, and sends message', () => {
    cy.wait('@getUsers');
    cy.wait('@getMessages');

    cy.get('.conversation-item[data-user-id="201"]').as('rahulRow');
    cy.get('@rahulRow').find('.unread-badge').should('exist');

    cy.get('@rahulRow').click();
    cy.wait('@getMessages');

    cy.get('#chatUserName').should('contain.text', 'Rahul Yadav');
    cy.get('#chatUserStatus').should('contain.text', 'Online');

    cy.get('#chat-messages').within(() => {
      cy.contains('Hey from Rahul').should('be.visible');
      cy.contains('Hello Rahul').should('be.visible');
    });

    cy.get('@rahulRow').find('.unread-badge').should('not.be.visible');

    cy.get('#chat-input').type('New message from test');
    cy.get('#send-btn').click();

    cy.get('.message.sent').should('contain.text', 'New message from test');
    cy.get('.conversation-item').first().should('have.attr', 'data-user-id', '201');
    cy.get('@rahulRow').find('.last-message').should('contain.text', 'New message from test');
  });

  it('supports mobile navigation back to list', () => {
    cy.viewport(375, 667);
    cy.wait('@getUsers');

    cy.get('.conversation-item').first().click();
    cy.get('#chat-window-view').should('have.class', 'active');

    cy.get('#back-btn').click();
    cy.get('#chat-window-view').should('not.have.class', 'active');
  });
});
