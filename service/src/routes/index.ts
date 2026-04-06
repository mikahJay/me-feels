import { Router } from 'express';
import authRouter from './auth';
import emotionsRouter from './emotions';

const router = Router();

router.use('/auth', authRouter);
router.use('/emotions', emotionsRouter);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
