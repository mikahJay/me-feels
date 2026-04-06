import { Router, Request, Response } from 'express';
import { buildGoogleAuthUrl, devLogin, exchangeGoogleCode } from '../services/auth.service';
import { requireAuth } from '../middleware/auth';
import { config } from '../config';

const router = Router();

// GET /auth/google — redirect to Google consent screen (or auto-login in dev mode)
router.get('/google', async (_req: Request, res: Response) => {
  if (config.devMode) {
    try {
      const tokens = await devLogin();
      res.redirect(`${process.env.WEB_URL ?? 'http://localhost:3000'}?access_token=${tokens.accessToken}`);
    } catch (err) {
      console.error('Dev login error:', err);
      res.redirect(`${process.env.WEB_URL ?? 'http://localhost:3000'}?auth_error=dev_login_failed`);
    }
    return;
  }
  const url = buildGoogleAuthUrl();
  res.redirect(url);
});

// GET /auth/google/callback — handle OAuth callback
router.get('/google/callback', async (req: Request, res: Response) => {
  const { code, error } = req.query as { code?: string; error?: string };

  if (error || !code) {
    res.redirect(`${process.env.WEB_URL ?? 'http://localhost:3000'}?auth_error=${error ?? 'missing_code'}`);
    return;
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    res.redirect(`${process.env.WEB_URL ?? 'http://localhost:3000'}?access_token=${tokens.accessToken}`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect(`${process.env.WEB_URL ?? 'http://localhost:3000'}?auth_error=server_error`);
  }
});

// GET /auth/me — return current user info from JWT
router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// POST /auth/logout — client-side token deletion; server-side stateless
router.post('/logout', requireAuth, (_req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
