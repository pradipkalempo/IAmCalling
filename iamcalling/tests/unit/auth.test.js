import request from 'supertest';
import express from 'express';
import authRouter from '../../routes/auth.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Mock dependencies
jest.mock('../../simple-db.js', () => ({
  default: {
    createUser: jest.fn(),
    findUserByEmail: jest.fn(),
    findUserById: jest.fn()
  }
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /auth/test', () => {
    it('should return auth test response', async () => {
      const response = await request(app)
        .get('/auth/test')
        .expect(200);

      expect(response.body.message).toBe('Auth routes working');
      expect(response.body.availableRoutes).toHaveLength(5);
    });
  });

  describe('POST /auth/register-simple', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date()
      };

      const { default: simpleDB } = await import('../../simple-db.js');
      simpleDB.createUser.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock-token');

      const response = await request(app)
        .post('/auth/register-simple')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe('mock-token');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return error for missing fields', async () => {
      const response = await request(app)
        .post('/auth/register-simple')
        .send({
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All fields required');
    });
  });

  describe('POST /auth/login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password'
      };

      const { default: simpleDB } = await import('../../simple-db.js');
      simpleDB.findUserByEmail.mockReturnValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBe('mock-token');
    });

    it('should return error for invalid credentials', async () => {
      const { default: simpleDB } = await import('../../simple-db.js');
      simpleDB.findUserByEmail.mockReturnValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body.message).toBe('Logout successful');
    });
  });
});