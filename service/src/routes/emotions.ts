import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import * as emotionsService from '../services/emotions.service';
import { analyzeEmotion } from '../services/ai.service';

const router = Router();

router.use(requireAuth);

// POST /emotions — create a new emotion entry
router.post('/', async (req: Request, res: Response) => {
  const { emotion, intensity, notes, tags } = req.body as {
    emotion?: string;
    intensity?: number;
    notes?: string;
    tags?: string[];
  };

  if (!emotion || typeof intensity !== 'number') {
    res.status(400).json({ error: 'emotion and intensity are required' });
    return;
  }

  if (intensity < 1 || intensity > 10) {
    res.status(400).json({ error: 'intensity must be between 1 and 10' });
    return;
  }

  const entry = await emotionsService.createEntry(req.user!.sub, { emotion, intensity, notes, tags });

  // Non-blocking AI analysis
  analyzeEmotion(entry)
    .then(insights => {
      // In a real app, update the entry with insights via a queue/background job
      console.log('AI insights generated for entry', entry.id, insights);
    })
    .catch(err => console.error('AI analysis failed:', err));

  res.status(201).json({ entry });
});

// GET /emotions — list emotion entries for current user
router.get('/', async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10), 100);
  const offset = parseInt(String(req.query.offset ?? '0'), 10);
  const entries = await emotionsService.listEntries(req.user!.sub, limit, offset);
  res.json({ entries });
});

// GET /emotions/:id — get a single entry
router.get('/:id', async (req: Request, res: Response) => {
  const entry = await emotionsService.getEntry(req.user!.sub, req.params.id);
  if (!entry) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }
  res.json({ entry });
});

// DELETE /emotions/:id — delete an entry
router.delete('/:id', async (req: Request, res: Response) => {
  const deleted = await emotionsService.deleteEntry(req.user!.sub, req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }
  res.status(204).send();
});

export default router;
