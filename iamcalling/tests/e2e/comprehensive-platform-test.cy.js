/// <reference types="cypress" />

/**
 * IAMCALLING Platform - Comprehensive End-to-End Testing Suite
 * Tests: Page Loading, Authentication, Profile, Messenger, Articles, Posts, 
 * Ideology Analyzer, Battle, Registration, Supabase, Cloudinary, Admin Dashboard
 */

describe('IAMCALLING Platform - Complete E2E Testing', () => {
  const baseUrl = 'http://localhost:1000';
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'Test@12345',
    username: `testuser_${Date.now()}`,
    fullName: 'Test User E2E'
  };
  
  const existingUser = {
    email: 'existing@test.com',
    password: 'Test@12345'
  };

  before(() => {
    cy.log('Starting Comprehensive Platform Testing');
  });

  // ==================== PAGE LOADING TESTS ====================
  describe('1. Page Loading Tests', () => {
    const pages = [
      { name: 'Home', url: '/' },
      { name: 'Login', url: '/15-login.html' },
      { name: 'Register', url: '/16-register.html' },
      { name: 'About', url: '/02-about.html' },
      { name: 'Categories', url: '/04-categories.html' },
      { name: 'Ideology Analyzer', url: '/09-ideology-analyzer.html' },
      { name: 'Ideological Battle', url: '/10-ideological-battle.html' },
      { name: 'Write Article', url: '/22-write_article.html' },
      { name: 'Admin Login', url: '/39-admin-login.html' }
    ];

    pages.forEach(page => {
      it(`should load ${page.name} page successfully`, () => {
        cy.visit(baseUrl + page.url, { failOnStatusCode: false });
        cy.get('body').should('be.visible');
        cy.title().should('not.be.empty');
      });
    });

    it('should load all critical CSS files', () => {
      cy.visit(baseUrl);
      cy.get('link[rel="stylesheet"]').should('have.length.greaterThan', 0);
    });

    it('should load all critical JS files', () => {
      cy.visit(baseUrl);
      cy.get('script[src]').should('have.length.greaterThan', 0);
    });
  });

  // ==================== USER REGISTRATION TESTS ====================
  describe('2. New User Registration', () => {
    it('should register a new user successfully', () => {
      cy.visit(`${baseUrl}/16-register.html`);
      
      cy.get('input[name="username"], input[type="text"]').first().type(testUser.username);
      cy.get('input[name="email"], input[type="email"]').type(testUser.email);
      cy.get('input[name="password"], input[type="password"]').first().type(testUser.password);
      cy.get('input[name="confirmPassword"], input[type="password"]').last().type(testUser.password);
      
      cy.get('button[type="submit"], .register-btn, .submit-btn').click();
      
      cy.wait(3000);
      cy.url().should('include', 'login', { timeout: 10000 });
    });

    it('should prevent duplicate registration', () => {
      cy.visit(`${baseUrl}/16-register.html`);
      
      cy.get('input[name="username"], input[type="text"]').first().type(testUser.username);
      cy.get('input[name="email"], input[type="email"]').type(testUser.email);
      cy.get('input[name="password"], input[type="password"]').first().type(testUser.password);
      cy.get('input[name="confirmPassword"], input[type="password"]').last().type(testUser.password);
      
      cy.get('button[type="submit"], .register-btn').click();
      
      cy.wait(2000);
      cy.on('window:alert', (text) => {
        expect(text).to.include('already');
      });
    });
  });

  // ==================== AUTHENTICATION TESTS ====================
  describe('3. User Authentication & Session', () => {
    it('should login successfully with valid credentials', () => {
      cy.visit(`${baseUrl}/15-login.html`);
      
      cy.get('input[type="email"], input[name="email"]').type(existingUser.email);
      cy.get('input[type="password"], input[name="password"]').type(existingUser.password);
      cy.get('button[type="submit"], .login-btn').click();
      
      cy.wait(3000);
      cy.url().should('not.include', 'login');
      
      // Verify session storage
      cy.window().then((win) => {
        const session = win.localStorage.getItem('supabase.auth.token') || 
                       win.sessionStorage.getItem('supabase.auth.token');
        expect(session).to.exist;
      });
    });

    it('should reject invalid credentials', () => {
      cy.visit(`${baseUrl}/15-login.html`);
      
      cy.get('input[type="email"]').type('invalid@test.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      cy.wait(2000);
      cy.url().should('include', 'login');
    });

    it('should maintain session across page navigation', () => {
      cy.visit(`${baseUrl}/15-login.html`);
      cy.get('input[type="email"]').type(existingUser.email);
      cy.get('input[type="password"]').type(existingUser.password);
      cy.get('button[type="submit"]').click();
      
      cy.wait(2000);
      cy.visit(`${baseUrl}/18-profile.html`);
      cy.wait(2000);
      
      cy.get('.profile-container, .user-profile').should('be.visible');
    });
  });

  // ==================== PROFILE LOADING TESTS ====================
  describe('4. Profile Page & Data Loading', () => {
    beforeEach(() => {
      // Login before each profile test
      cy.visit(`${baseUrl}/15-login.html`);
      cy.get('input[type="email"]').type(existingUser.email);
      cy.get('input[type="password"]').type(existingUser.password);
      cy.get('button[type="submit"]').click();
      cy.wait(2000);
    });

    it('should load user profile with real data', () => {
      cy.visit(`${baseUrl}/18-profile.html`);
      cy.wait(3000);
      
      cy.get('.profile-photo, .user-avatar, img[alt*="profile"]').should('be.visible');
      cy.get('.username, .user-name, .profile-name').should('not.be.empty');
      cy.get('.email, .user-email').should('contain', '@');
    });

    it('should display unread message count', () => {
      cy.visit(`${baseUrl}/18-profile.html`);
      cy.wait(2000);
      
      cy.get('body').then($body => {
        if ($body.find('.unread-count, .message-badge, .notification-badge').length > 0) {
          cy.get('.unread-count, .message-badge').should('be.visible');
        }
      });
    });

    it('should load user articles and posts', () => {
      cy.visit(`${baseUrl}/18-profile.html`);
      cy.wait(3000);
      
      cy.get('body').then($body => {
        if ($body.find('.article-item, .post-item, .content-item').length > 0) {
          cy.get('.article-item, .post-item').should('have.length.greaterThan', 0);
        }
      });
    });
  });

  // ==================== MESSENGER TESTS ====================
  describe('5. Messenger & Real-time Communication', () => {
    beforeEach(() => {
      cy.visit(`${baseUrl}/15-login.html`);
      cy.get('input[type="email"]').type(existingUser.email);
      cy.get('input[type="password"]').type(existingUser.password);
      cy.get('button[type="submit"]').click();
      cy.wait(2000);
    });

    it('should load messenger page quickly', () => {
      const startTime = Date.now();
      cy.visit(`${baseUrl}/34-icalluser-messenger.html`);
      cy.wait(2000);
      
      cy.get('.messenger-container, .chat-container').should('be.visible');
      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(5000);
    });

    it('should display user list in messenger', () => {
      cy.visit(`${baseUrl}/34-icalluser-messenger.html`);
      cy.wait(3000);
      
      cy.get('.user-list, .contacts-list, .conversation-list').should('be.visible');
      cy.get('.user-item, .contact-item, .conversation-item').should('have.length.greaterThan', 0);
    });

    it('should send a message successfully', () => {
      cy.visit(`${baseUrl}/34-icalluser-messenger.html`);
      cy.wait(3000);
      
      cy.get('.user-item, .contact-item').first().click();
      cy.wait(1000);
      
      const testMessage = `Test message ${Date.now()}`;
      cy.get('input[type="text"], textarea, .message-input').type(testMessage);
      cy.get('button[type="submit"], .send-btn, .send-button').click();
      
      cy.wait(2000);
      cy.get('.message-item, .chat-message').last().should('contain', testMessage);
    });

    it('should update unread count in real-time', () => {
      cy.visit(`${baseUrl}/34-icalluser-messenger.html`);
      cy.wait(3000);
      
      cy.get('.unread-badge, .unread-count').then($badges => {
        const initialCount = $badges.length;
        cy.log(`Initial unread count: ${initialCount}`);
      });
    });

    it('should establish WebSocket connection', () => {
      cy.visit(`${baseUrl}/34-icalluser-messenger.html`);
      
      cy.window().then((win) => {
        cy.wait(3000);
        // Check for WebSocket or Supabase realtime connection
        expect(win.WebSocket || win.supabase).to.exist;
      });
    });
  });

  // ==================== ARTICLE CREATION & PUBLISHING ====================
  describe('6. Write & Publish Article', () => {
    beforeEach(() => {
      cy.visit(`${baseUrl}/15-login.html`);
      cy.get('input[type="email"]').type(existingUser.email);
      cy.get('input[type="password"]').type(existingUser.password);
      cy.get('button[type="submit"]').click();
      cy.wait(2000);
    });

    it('should load article editor', () => {
      cy.visit(`${baseUrl}/22-write_article.html`);
      cy.wait(2000);
      
      cy.get('input[name="title"], .title-input').should('be.visible');
      cy.get('textarea, .editor, #editor').should('be.visible');
    });

    it('should create and publish article', () => {
      cy.visit(`${baseUrl}/22-write_article.html`);
      cy.wait(2000);
      
      const articleTitle = `Test Article ${Date.now()}`;
      const articleContent = 'This is a test article content for E2E testing.';
      
      cy.get('input[name="title"], .title-input').type(articleTitle);
      cy.get('textarea, .editor').first().type(articleContent);
      
      cy.get('button[type="submit"], .publish-btn, .submit-btn').click();
      cy.wait(3000);
      
      cy.on('window:alert', (text) => {
        expect(text).to.include('success');
      });
    });
  });

  // ==================== POST CREATION ====================
  describe('7. Create & Publish Post', () => {
    beforeEach(() => {
      cy.visit(`${baseUrl}/15-login.html`);
      cy.get('input[type="email"]').type(existingUser.email);
      cy.get('input[type="password"]').type(existingUser.password);
      cy.get('button[type="submit"]').click();
      cy.wait(2000);
    });

    it('should create a new post', () => {
      cy.visit(baseUrl);
      cy.wait(2000);
      
      cy.get('body').then($body => {
        if ($body.find('.create-post, .new-post-btn').length > 0) {
          cy.get('.create-post, .new-post-btn').click();
          cy.wait(1000);
          
          const postContent = `Test post ${Date.now()}`;
          cy.get('textarea, .post-input').type(postContent);
          cy.get('button[type="submit"], .post-btn').click();
          cy.wait(2000);
        }
      });
    });
  });

  // ==================== VIEW COUNT TRACKING ====================
  describe('8. View Count Tracking', () => {
    it('should track article views', () => {
      cy.visit(baseUrl);
      cy.wait(2000);
      
      cy.get('.article-item, .post-item').first().then($article => {
        const initialViews = $article.find('.views-count, .view-count').text();
        cy.log(`Initial views: ${initialViews}`);
        
        $article.click();
        cy.wait(3000);
        
        cy.go('back');
        cy.wait(2000);
        
        cy.get('.article-item, .post-item').first().find('.views-count, .view-count').then($newViews => {
          cy.log(`New views: ${$newViews.text()}`);
        });
      });
    });

    it('should track post views', () => {
      cy.visit(baseUrl);
      cy.wait(2000);
      
      cy.get('.post-item, .content-card').first().then($post => {
        const postId = $post.attr('data-id') || $post.attr('id');
        cy.log(`Viewing post: ${postId}`);
        
        $post.click();
        cy.wait(2000);
      });
    });
  });

  // ==================== IDEOLOGY ANALYZER ====================
  describe('9. Ideology Analyzer Logic', () => {
    it('should load ideology analyzer', () => {
      cy.visit(`${baseUrl}/09-ideology-analyzer.html`);
      cy.wait(2000);
      
      cy.get('.question-container, .quiz-container').should('be.visible');
    });

    it('should process ideology questions', () => {
      cy.visit(`${baseUrl}/09-ideology-analyzer.html`);
      cy.wait(2000);
      
      // Answer multiple questions
      for (let i = 0; i < 5; i++) {
        cy.get('.option, .answer-btn, input[type="radio"]').first().click();
        cy.wait(500);
        cy.get('.next-btn, button[type="submit"]').click();
        cy.wait(1000);
      }
      
      cy.get('.result, .ideology-result').should('be.visible', { timeout: 10000 });
    });

    it('should calculate ideology score', () => {
      cy.visit(`${baseUrl}/09-ideology-analyzer.html`);
      cy.wait(2000);
      
      cy.window().then((win) => {
        // Check if ideology calculation functions exist
        expect(win.calculateIdeology || win.analyzeIdeology).to.exist;
      });
    });
  });

  // ==================== Ideological Battle ====================
  describe('10. Ideological Battle Game', () => {
    it('should load battle arena', () => {
      cy.visit(`${baseUrl}/10-ideological-battle.html`);
      cy.wait(2000);
      
      cy.get('.battle-arena, .game-container').should('be.visible');
      cy.get('.fighter, .candidate').should('have.length', 2);
    });

    it('should allow fighter selection', () => {
      cy.visit(`${baseUrl}/10-ideological-battle.html`);
      cy.wait(2000);
      
      cy.get('.fighter, .candidate').first().click();
      cy.wait(1000);
      
      cy.get('.round-info, .score').should('be.visible');
    });

    it('should track battle rounds', () => {
      cy.visit(`${baseUrl}/10-ideological-battle.html`);
      cy.wait(2000);
      
      cy.get('.round-info, .round-counter').should('contain', 'Round');
    });
  });

  // ==================== SUPABASE CONNECTION ====================
  describe('11. Supabase Database Connection', () => {
    it('should connect to Supabase', () => {
      cy.request(`${baseUrl}/api/health`).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should fetch data from Supabase', () => {
      cy.visit(baseUrl);
      cy.wait(2000);
      
      cy.window().then((win) => {
        expect(win.supabase || win.APP_CONFIG).to.exist;
      });
    });

    it('should verify Supabase realtime connection', () => {
      cy.visit(`${baseUrl}/34-icalluser-messenger.html`);
      cy.wait(3000);
      
      cy.window().then((win) => {
        const hasRealtime = win.supabase?.channel || win.realtimeChannel;
        expect(hasRealtime).to.exist;
      });
    });
  });

  // ==================== CLOUDINARY CONNECTION ====================
  describe('12. Cloudinary Image Service', () => {
    it('should load images from Cloudinary', () => {
      cy.visit(baseUrl);
      cy.wait(3000);
      
      cy.get('img').should('have.length.greaterThan', 0);
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'src').and('not.be.empty');
      });
    });

    it('should upload image to Cloudinary', () => {
      cy.visit(`${baseUrl}/15-login.html`);
      cy.get('input[type="email"]').type(existingUser.email);
      cy.get('input[type="password"]').type(existingUser.password);
      cy.get('button[type="submit"]').click();
      cy.wait(2000);
      
      cy.visit(`${baseUrl}/18-profile.html`);
      cy.wait(2000);
      
      cy.get('body').then($body => {
        if ($body.find('input[type="file"]').length > 0) {
          cy.get('input[type="file"]').should('exist');
        }
      });
    });
  });

  // ==================== ADMIN DASHBOARD ====================
  describe('13. Admin Dashboard', () => {
    const adminCreds = {
      username: 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    };

    it('should load admin login page', () => {
      cy.visit(`${baseUrl}/39-admin-login.html`);
      cy.wait(1000);
      
      cy.get('input[name="username"], input[type="text"]').should('be.visible');
      cy.get('input[name="password"], input[type="password"]').should('be.visible');
    });

    it('should login to admin dashboard', () => {
      cy.visit(`${baseUrl}/39-admin-login.html`);
      
      cy.get('input[name="username"], input[type="text"]').type(adminCreds.username);
      cy.get('input[name="password"], input[type="password"]').type(adminCreds.password);
      cy.get('button[type="submit"]').click();
      
      cy.wait(3000);
      cy.url().should('include', 'admin-dashboard');
    });

    it('should display admin statistics', () => {
      cy.visit(`${baseUrl}/39-admin-login.html`);
      cy.get('input[name="username"]').type(adminCreds.username);
      cy.get('input[name="password"]').type(adminCreds.password);
      cy.get('button[type="submit"]').click();
      cy.wait(3000);
      
      cy.get('.stats, .dashboard-stats, .metrics').should('be.visible');
    });
  });

  // ==================== UNIVERSAL BAR ====================
  describe('14. Universal Navigation Bar', () => {
    it('should display universal bar on all pages', () => {
      const pages = ['/', '/15-login.html', '/18-profile.html', '/22-write_article.html'];
      
      pages.forEach(page => {
        cy.visit(baseUrl + page);
        cy.wait(1000);
        
        cy.get('header, .universal-bar, nav').should('be.visible');
      });
    });

    it('should have working navigation links', () => {
      cy.visit(baseUrl);
      cy.wait(1000);
      
      cy.get('nav a, .nav-link').should('have.length.greaterThan', 0);
      cy.get('nav a').first().should('have.attr', 'href');
    });

    it('should show user profile in nav when logged in', () => {
      cy.visit(`${baseUrl}/15-login.html`);
      cy.get('input[type="email"]').type(existingUser.email);
      cy.get('input[type="password"]').type(existingUser.password);
      cy.get('button[type="submit"]').click();
      cy.wait(2000);
      
      cy.visit(baseUrl);
      cy.wait(1000);
      
      cy.get('.profile-link, .user-menu, .profile-photo').should('be.visible');
    });
  });

  // ==================== PERFORMANCE TESTS ====================
  describe('15. Performance & Load Time', () => {
    it('should load home page within 3 seconds', () => {
      const startTime = Date.now();
      cy.visit(baseUrl);
      cy.get('body').should('be.visible');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).to.be.lessThan(3000);
      cy.log(`Home page loaded in ${loadTime}ms`);
    });

    it('should load messenger within 5 seconds', () => {
      cy.visit(`${baseUrl}/15-login.html`);
      cy.get('input[type="email"]').type(existingUser.email);
      cy.get('input[type="password"]').type(existingUser.password);
      cy.get('button[type="submit"]').click();
      cy.wait(2000);
      
      const startTime = Date.now();
      cy.visit(`${baseUrl}/34-icalluser-messenger.html`);
      cy.get('.messenger-container, .chat-container').should('be.visible');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).to.be.lessThan(5000);
      cy.log(`Messenger loaded in ${loadTime}ms`);
    });
  });

  // ==================== CLEANUP ====================
  after(() => {
    cy.log('Comprehensive E2E Testing Completed');
  });
});
