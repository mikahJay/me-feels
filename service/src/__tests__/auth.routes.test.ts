import request from 'supertest';
import app from '../index';

// Mock services to avoid real DB/HTTP calls
jest.mock('../services/auth.service', () => ({
  buildGoogleAuthUrl: jest.fn(() => 'https://accounts.google.com/auth?mock=1'),
  exchangeGoogleCode: jest.fn(),
}));

jest.mock('../db', () => ({
  pool: { query: jest.fn() },
  query: jest.fn(),
}));

describe('Auth Routes', () => {
  describe('GET /auth/google', () => {
    it('redirects to Google OAuth URL', async () => {
      const res = await request(app).get('/auth/google');
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('https://accounts.google.com/auth?mock=1');
    });
  });

  describe('GET /auth/google/callback', () => {
    it('redirects to web with error when OAuth returns error', async () => {
      const res = await request(app).get('/auth/google/callback?error=access_denied');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('auth_error=access_denied');
    });

    it('redirects to web with error when code is missing', async () => {
      const res = await request(app).get('/auth/google/callback');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('auth_error=missing_code');
    });

    it('redirects with access_token on success', async () => {
      const { exchangeGoogleCode } = require('../services/auth.service');
      (exchangeGoogleCode as jest.Mock).mockResolvedValueOnce({ accessToken: 'test.jwt.token' });

      const res = await request(app).get('/auth/google/callback?code=valid_code');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('access_token=test.jwt.token');
    });
  });

  describe('GET /auth/me', () => {
    it('returns 401 when no token provided', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 for invalid token', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid.token');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /health', () => {
    it('returns ok status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
