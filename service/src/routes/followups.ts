import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import * as followUpsService from '../services/followups.service';
import * as emotionsService from '../services/emotions.service';

const router = Router();

router.use(requireAuth);

// POST /follow-ups — create a follow-up, optionally with an attached feel
router.post('/', async (req: Request, res: Response) => {
  const { rootFeelId, parentFollowUpId, description, attachedFeel } = req.body as {
    rootFeelId?: string;
    parentFollowUpId?: string;
    description?: string;
    attachedFeel?: { emotion: string; intensity: number; notes?: string };
  };

  if (!rootFeelId || !description?.trim()) {
    res.status(400).json({ error: 'rootFeelId and description are required' });
    return;
  }

  let attachedFeelId: string | undefined;

  if (attachedFeel) {
    const { emotion, intensity, notes } = attachedFeel;
    if (!emotion || typeof intensity !== 'number' || intensity < 1 || intensity > 10) {
      res.status(400).json({ error: 'attachedFeel requires valid emotion and intensity (1-10)' });
      return;
    }
    const entry = await emotionsService.createEntry(req.user!.sub, { emotion, intensity, notes });
    attachedFeelId = entry.id;
  }

  const followUp = await followUpsService.createFollowUp(req.user!.sub, {
    rootFeelId,
    parentFollowUpId,
    description: description.trim(),
    attachedFeelId,
  });

  res.status(201).json({ followUp });
});

// GET /follow-ups?feelId=xxx — flat list (tree built client-side)
router.get('/', async (req: Request, res: Response) => {
  const feelId = req.query.feelId as string | undefined;
  if (!feelId) {
    res.status(400).json({ error: 'feelId query param is required' });
    return;
  }
  const flat = await followUpsService.listFollowUps(req.user!.sub, feelId);
  const tree = followUpsService.buildTree(flat);
  res.json({ followUps: tree });
});

// DELETE /follow-ups/:id — soft-delete including all descendants
router.delete('/:id', async (req: Request, res: Response) => {
  const deleted = await followUpsService.deleteFollowUp(req.user!.sub, req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Follow-up not found' });
    return;
  }
  res.status(204).send();
});

export default router;
