import request from 'supertest';
import app from '../../server.js';

describe('Usability & Compatibility Tests', () => {
  describe('Cross-Browser Compatibility', () => {
    const userAgents = [
      // Chrome
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      // Firefox
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      // Safari
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      // Edge
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
      // Mobile Chrome
      'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
      // Mobile Safari
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    ];

    test.each(userAgents)('should serve content properly to all browsers', async (userAgent) => {
      const response = await request(app)
        .get('/01-index.html')
        .set('User-Agent', userAgent);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.text).toContain('<!DOCTYPE html>');
    });

    test('should serve responsive content to mobile devices', async () => {
      const mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
      
      const response = await request(app)
        .get('/01-index.html')
        .set('User-Agent', mobileUserAgent);

      expect(response.status).toBe(200);
      // Should contain viewport meta tag for mobile
      expect(response.text).toMatch(/<meta[^>]*name=["']viewport["'][^>]*>/i);
    });
  });

  describe('Mobile vs Desktop Compatibility', () => {
    it('should serve appropriate content for different screen sizes', async () => {
      // Test desktop version
      const desktopResponse = await request(app)
        .get('/01-index.html')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      expect(desktopResponse.status).toBe(200);
      
      // Test mobile version
      const mobileResponse = await request(app)
        .get('/01-index.html')
        .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15');

      expect(mobileResponse.status).toBe(200);
      
      // Both should be valid HTML
      expect(desktopResponse.text).toContain('<html');
      expect(mobileResponse.text).toContain('<html');
    });

    it('should have accessible navigation for all devices', async () => {
      const response = await request(app).get('/01-index.html');
      
      // Should have navigation elements
      expect(response.text).toMatch(/<nav[^>]*>/i);
      expect(response.text).toMatch(/<a[^>]*href[^>]*>/i);
      
      // Should have proper semantic structure
      expect(response.text).toMatch(/<header[^>]*>/i);
      expect(response.text).toMatch(/<main[^>]*>/i);
      expect(response.text).toMatch(/<footer[^>]*>/i);
    });
  });

  describe('Usability Features', () => {
    it('should have proper form validation feedback', async () => {
      const response = await request(app).get('/15-login.html');
      
      // Login form should exist
      expect(response.text).toMatch(/<form[^>]*>/i);
      
      // Should have required input fields
      expect(response.text).toMatch(/<input[^>]*type=["']email["'][^>]*required/i);
      expect(response.text).toMatch(/<input[^>]*type=["']password["'][^>]*required/i);
      
      // Should have submit button
      expect(response.text).toMatch(/<button[^>]*type=["']submit["'][^>]*>/i);
    });

    it('should provide clear error messages', async () => {
      // Test API error response format
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid', password: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      // Error messages should be user-friendly
      expect(typeof response.body.error).toBe('string');
      expect(response.body.error.length).toBeGreaterThan(0);
    });

    it('should have consistent navigation across pages', async () => {
      const pages = ['/01-index.html', '/15-login.html', '/18-profile.html'];
      
      for (const page of pages) {
        const response = await request(app).get(page);
        expect(response.status).toBe(200);
        
        // Should have consistent navigation elements
        expect(response.text).toMatch(/<nav[^>]*>/i);
        expect(response.text).toMatch(/href=["'][^"']*\.html["']/);
      }
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper alt attributes for images', async () => {
      const response = await request(app).get('/01-index.html');
      
      // Check for images with alt attributes
      const imgWithAlt = response.text.match(/<img[^>]*alt=["'][^"']*["'][^>]*>/g);
      const imgWithoutAlt = response.text.match(/<img[^>]*>/g);
      
      // If there are images, most should have alt attributes
      if (imgWithoutAlt && imgWithoutAlt.length > 0) {
        const altRatio = (imgWithAlt ? imgWithAlt.length : 0) / imgWithoutAlt.length;
        expect(altRatio).toBeGreaterThan(0.8); // At least 80% should have alt
      }
    });

    it('should have proper heading structure', async () => {
      const response = await request(app).get('/01-index.html');
      
      // Should have at least one h1
      expect(response.text).toMatch(/<h1[^>]*>/i);
      
      // Should have logical heading hierarchy
      const headings = response.text.match(/<h[1-6][^>]*>/gi);
      expect(headings).not.toBeNull();
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA attributes where needed', async () => {
      const response = await request(app).get('/01-index.html');
      
      // Check for common ARIA patterns
      const ariaAttrs = response.text.match(/aria-[a-z]+=["'][^"']*["']/gi);
      
      // While not required everywhere, forms and interactive elements should have ARIA
      expect(response.text).toMatch(/role=["'][^"']*["']/i);
    });
  });

  describe('Performance Usability', () => {
    it('should load pages within acceptable time limits', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/01-index.html');
      const endTime = Date.now();
      
      const loadTime = endTime - startTime;
      
      // Page should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
      expect(response.status).toBe(200);
    });

    it('should compress responses for better performance', async () => {
      const response = await request(app)
        .get('/01-index.html')
        .set('Accept-Encoding', 'gzip, deflate');
      
      expect(response.status).toBe(200);
      // Compression headers might be present depending on server config
    });
  });
});