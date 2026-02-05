import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('Utility Functions', () => {
  describe('JWT Token Handling', () => {
    const secret = 'test-secret';
    const payload = { userId: 1, email: 'test@example.com' };

    it('should create and verify JWT token', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      expect(token).toBeDefined();

      const decoded = jwt.verify(token, secret);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should handle expired token', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '0s' });
      
      setTimeout(() => {
        expect(() => {
          jwt.verify(token, secret);
        }).toThrow();
      }, 100);
    });

    it('should handle invalid token', () => {
      expect(() => {
        jwt.verify('invalid-token', secret);
      }).toThrow();
    });
  });

  describe('Password Hashing', () => {
    const password = 'testpassword123';

    it('should hash and compare password', async () => {
      const hash = await bcrypt.hash(password, 10);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('wrongpassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);
      
      expect(hash1).not.toBe(hash2);
      
      const isValid1 = await bcrypt.compare(password, hash1);
      const isValid2 = await bcrypt.compare(password, hash2);
      
      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });
  });

  describe('Environment Variables', () => {
    it('should have required environment variables', () => {
      const requiredVars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET'
      ];

      requiredVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined();
      });
    });
  });
});