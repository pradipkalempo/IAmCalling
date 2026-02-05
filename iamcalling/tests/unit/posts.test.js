import request from 'supertest';
import express from 'express';
import postsRouter from '../../routes/posts.js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(),
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }))
}));

const app = express();
app.use(express.json());
app.use('/posts', postsRouter);

describe('Posts Routes', () => {
  let mockSupabase;

  beforeEach(() => {
    jest.clearAllMocks();
    const { createClient } = require('@supabase/supabase-js');
    mockSupabase = createClient();
  });

  describe('GET /posts', () => {
    it('should fetch all posts', async () => {
      const mockPosts = [
        { id: 1, title: 'Post 1', content: 'Content 1', user_id: 1 },
        { id: 2, title: 'Post 2', content: 'Content 2', user_id: 2 }
      ];

      mockSupabase.from().select().order.mockResolvedValue({
        data: mockPosts,
        error: null
      });

      const response = await request(app)
        .get('/posts')
        .expect(200);

      expect(response.body).toEqual(mockPosts);
    });

    it('should handle database error', async () => {
      mockSupabase.from().select().order.mockResolvedValue({
        data: null,
        error: new Error('Database error')
      });

      const response = await request(app)
        .get('/posts')
        .expect(500);

      expect(response.body.error).toBe('Failed to fetch posts');
    });
  });

  describe('POST /posts', () => {
    it('should create post successfully', async () => {
      const mockPost = { id: 1, title: 'New Post', content: 'New content', user_id: 1 };
      
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockPost,
        error: null
      });

      const response = await request(app)
        .post('/posts')
        .send({
          title: 'New Post',
          content: 'New content',
          user_id: 1
        })
        .expect(201);

      expect(response.body.message).toBe('Post created successfully');
      expect(response.body.postId).toBe(1);
    });

    it('should return error for missing fields', async () => {
      const response = await request(app)
        .post('/posts')
        .send({
          title: 'New Post'
        })
        .expect(400);

      expect(response.body.error).toBe('Title, content, and user_id are required');
    });
  });

  describe('GET /posts/:id', () => {
    it('should fetch post by id', async () => {
      const mockPost = { id: 1, title: 'Test Post', content: 'Test content', user_id: 1 };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockPost,
        error: null
      });

      const response = await request(app)
        .get('/posts/1')
        .expect(200);

      expect(response.body).toEqual(mockPost);
    });
  });
});