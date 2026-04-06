import { signJwt, buildGoogleAuthUrl } from '../services/auth.service';
import jwt from 'jsonwebtoken';
import type { User } from '../types';

// Mock the config so JWT secret is known
jest.mock('../config', () => ({
  config: {
    jwt: { secret: 'test_secret', expiresIn: '7d' },
    google: { clientId: 'test_client_id', redirectUri: 'http://localhost:3001/auth/google/callback' },
    anthropic: { apiKey: '' },
    db: { host: 'localhost', port: 5432, database: 'mefeels', user: 'mefeels', password: 'mefeels_dev' },
    port: 3001,
    nodeEnv: 'test',
  },
}));

jest.mock('../db', () => ({
  pool: { query: jest.fn() },
  query: jest.fn(),
}));

const mockUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: null,
  provider: 'google',
  providerId: 'google_123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Auth Service', () => {
  describe('signJwt', () => {
    it('creates a valid JWT with correct payload', () => {
      const token = signJwt(mockUser);
      const decoded = jwt.verify(token, 'test_secret') as { sub: string; email: string };
      expect(decoded.sub).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
    });
  });

  describe('buildGoogleAuthUrl', () => {
    it('returns a valid Google OAuth URL', () => {
      const url = buildGoogleAuthUrl();
      expect(url).toContain('accounts.google.com');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=');
    });
  });
});
