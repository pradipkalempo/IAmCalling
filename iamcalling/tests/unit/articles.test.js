import request from 'supertest';
import express from 'express';
import articlesRouter from '../../routes/articles.js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      select: jest.fn(() => ({
        order: jest.fn(),
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }))
}));

const app = express();
app.use(express.json());
app.use('/articles', articlesRouter);

describe('Articles Routes', () => {
  let mockSupabase;

  beforeEach(() => {
    jest.clearAllMocks();
    const { createClient } = require('@supabase/supabase-js');
    mockSupabase = createClient();
  });

  describe('POST /articles', () => {
    it('should create article successfully', async () => {
      const mockArticle = { id: 1, title: 'Test Article', content: 'Test content' };
      
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockArticle,
        error: null
      });

      const response = await request(app)
        .post('/articles')
        .send({
          user_id: 1,
          title: 'Test Article',
          content: 'Test content'
        })
        .expect(201);

      expect(response.body.message).toBe('Article created successfully');
      expect(response.body.articleId).toBe(1);
    });

    it('should return error for missing fields', async () => {
      const response = await request(app)
        .post('/articles')
        .send({
          title: 'Test Article'
        })
        .expect(400);

      expect(response.body.error).toBe('user_id, title, and content are required');
    });
  });

  describe('GET /articles', () => {
    it('should fetch all articles', async () => {
      const mockArticles = [
        { id: 1, title: 'Article 1', content: 'Content 1' },
        { id: 2, title: 'Article 2', content: 'Content 2' }
      ];

      mockSupabase.from().select().order.mockResolvedValue({
        data: mockArticles,
        error: null
      });

      const response = await request(app)
        .get('/articles')
        .expect(200);

      expect(response.body).toEqual(mockArticles);
    });
  });

  describe('GET /articles/:id', () => {
    it('should fetch article by id', async () => {
      const mockArticle = { id: 1, title: 'Test Article', content: 'Test content' };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockArticle,
        error: null
      });

      const response = await request(app)
        .get('/articles/1')
        .expect(200);

      expect(response.body).toEqual(mockArticle);
    });
  });
});