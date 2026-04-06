/**
 * Smoke tests — require a running service at SERVICE_URL (default: http://localhost:3001).
 * Run with: npm run test:smoke
 *
 * These tests verify the service can reach its dependencies:
 *   - /health      → service is up
 *   - /health/deep → database, Anthropic, and Google OAuth are reachable/configured
 *   - /auth/google → auth route is reachable (dev mode or real OAuth)
 *
 * They will not pass without the containers running and .env properly filled out.
 */

import axios from 'axios';

const BASE_URL = process.env.SERVICE_URL ?? 'http://localhost:3001';

const http = axios.create({ baseURL: BASE_URL, validateStatus: () => true });

describe('Smoke: service reachability', () => {
  it('GET /health returns 200 and status ok', async () => {
    const res = await http.get('/health');
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('ok');
    expect(res.data.timestamp).toBeDefined();
  });
});

describe('Smoke: dependency health', () => {
  it('GET /health/deep returns 200 when all dependencies are healthy', async () => {
    const res = await http.get('/health/deep');
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('ok');
  });

  it('GET /health/deep reports database check', async () => {
    const res = await http.get('/health/deep');
    expect(res.data.checks.database).toBeDefined();
    expect(res.data.checks.database.ok).toBe(true);
  });

  it('GET /health/deep reports anthropic check', async () => {
    const res = await http.get('/health/deep');
    expect(res.data.checks.anthropic).toBeDefined();
    expect(res.data.checks.anthropic.ok).toBe(true);
  });

  it('GET /health/deep reports google check', async () => {
    const res = await http.get('/health/deep');
    expect(res.data.checks.google).toBeDefined();
    expect(res.data.checks.google.ok).toBe(true);
  });
});

describe('Smoke: auth route reachability', () => {
  it('GET /auth/google responds (redirects or returns a response)', async () => {
    const res = await http.get('/auth/google', { maxRedirects: 0 });
    // In dev mode: redirects to web with token; in prod: redirects to Google
    expect([200, 302]).toContain(res.status);
  });

  it('GET /auth/me returns 401 when no token provided', async () => {
    const res = await http.get('/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('Smoke: emotions route reachability', () => {
  it('GET /emotions returns 401 when no token provided', async () => {
    const res = await http.get('/emotions');
    expect(res.status).toBe(401);
  });
});
