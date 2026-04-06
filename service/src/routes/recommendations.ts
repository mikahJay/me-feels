import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import * as emotionsService from '../services/emotions.service';
import * as recommendationsService from '../services/recommendations.service';

const router = Router();

router.use(requireAuth);

// GET /recommendations?feelId=xxx
router.get('/', async (req: Request, res: Response) => {
  const feelId = req.query.feelId as string | undefined;
  if (!feelId) {
    res.status(400).json({ error: 'feelId query param is required' });
    return;
  }

  try {
    const feel = await emotionsService.getEntry(req.user!.sub, feelId);
    if (!feel) {
      res.status(404).json({ error: 'Feel not found' });
      return;
    }

    const recommendations = await recommendationsService.getRecommendations(req.user!.sub, {
      emotion: feel.emotion,
      intensity: feel.intensity,
      notes: feel.notes,
    });

    res.json({ recommendations });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;
