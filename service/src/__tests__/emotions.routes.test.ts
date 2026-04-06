import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../index';

jest.mock('../services/emotions.service', () => ({
  createEntry: jest.fn(),
  listEntries: jest.fn(),
  getEntry: jest.fn(),
  deleteEntry: jest.fn(),
}));

jest.mock('../services/ai.service', () => ({
  analyzeEmotion: jest.fn().mockResolvedValue({
    summary: 'test',
    triggers: [],
    recommendations: [],
  }),
}));

jest.mock('../db', () => ({
  pool: { query: jest.fn() },
  query: jest.fn(),
}));

// Must match the default in config.ts since config is loaded at module init time
const TEST_SECRET = 'dev_secret_change_in_prod';
const TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

function makeToken(overrides: Record<string, unknown> = {}): string {
  return jwt.sign(
    { sub: TEST_USER_ID, email: 'user@test.com', name: 'Test User', ...overrides },
    TEST_SECRET
  );
}

const mockEntry = {
  id: 'entry-uuid',
  userId: TEST_USER_ID,
  emotion: 'happy',
  intensity: 8,
  notes: 'Great day',
  tags: [],
  aiInsights: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Emotions Routes', () => {
  describe('POST /emotions', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).post('/emotions').send({ emotion: 'happy', intensity: 7 });
      expect(res.status).toBe(401);
    });

    it('returns 400 when emotion is missing', async () => {
      const res = await request(app)
        .post('/emotions')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ intensity: 5 });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/emotion/i);
    });

    it('returns 400 when intensity is out of range', async () => {
      const res = await request(app)
        .post('/emotions')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ emotion: 'sad', intensity: 11 });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/intensity/i);
    });

    it('creates an entry and returns 201', async () => {
      const { createEntry } = require('../services/emotions.service');
      (createEntry as jest.Mock).mockResolvedValueOnce(mockEntry);

      const res = await request(app)
        .post('/emotions')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ emotion: 'happy', intensity: 8, notes: 'Great day' });

      expect(res.status).toBe(201);
      expect(res.body.entry).toMatchObject({ emotion: 'happy', intensity: 8 });
    });
  });

  describe('GET /emotions', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).get('/emotions');
      expect(res.status).toBe(401);
    });

    it('returns a list of entries', async () => {
      const { listEntries } = require('../services/emotions.service');
      (listEntries as jest.Mock).mockResolvedValueOnce([mockEntry]);

      const res = await request(app)
        .get('/emotions')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.entries).toHaveLength(1);
      expect(res.body.entries[0].emotion).toBe('happy');
    });
  });

  describe('GET /emotions/:id', () => {
    it('returns 404 when entry does not exist', async () => {
      const { getEntry } = require('../services/emotions.service');
      (getEntry as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/emotions/nonexistent-id')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(404);
    });

    it('returns the entry when found', async () => {
      const { getEntry } = require('../services/emotions.service');
      (getEntry as jest.Mock).mockResolvedValueOnce(mockEntry);

      const res = await request(app)
        .get(`/emotions/${mockEntry.id}`)
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.entry.id).toBe(mockEntry.id);
    });
  });

  describe('DELETE /emotions/:id', () => {
    it('returns 404 when entry does not exist', async () => {
      const { deleteEntry } = require('../services/emotions.service');
      (deleteEntry as jest.Mock).mockResolvedValueOnce(false);

      const res = await request(app)
        .delete('/emotions/nonexistent-id')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(404);
    });

    it('returns 204 on successful delete', async () => {
      const { deleteEntry } = require('../services/emotions.service');
      (deleteEntry as jest.Mock).mockResolvedValueOnce(true);

      const res = await request(app)
        .delete(`/emotions/${mockEntry.id}`)
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(204);
    });
  });
});
