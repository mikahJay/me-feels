import { Router } from 'express';
import authRouter from './auth';
import emotionsRouter from './emotions';
import followUpsRouter from './followups';
import recommendationsRouter from './recommendations';
import { query } from '../db';
import { config } from '../config';

const router = Router();

router.use('/auth', authRouter);
router.use('/emotions', emotionsRouter);
router.use('/follow-ups', followUpsRouter);
router.use('/recommendations', recommendationsRouter);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/health/deep', async (_req, res) => {
  const checks: Record<string, { ok: boolean; error?: string }> = {};

  try {
    await query('SELECT 1');
    checks.database = { ok: true };
  } catch (err) {
    checks.database = { ok: false, error: (err as Error).message };
  }

  checks.anthropic = config.anthropic.apiKey
    ? { ok: true }
    : { ok: false, error: 'ANTHROPIC_API_KEY not configured' };

  checks.google =
    config.google.clientId && config.google.clientSecret
      ? { ok: true }
      : { ok: false, error: 'GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured' };

  const allOk = Object.values(checks).every(c => c.ok);
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
});

export default router;
