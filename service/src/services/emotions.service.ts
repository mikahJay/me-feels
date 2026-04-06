import { query } from '../db';
import type { EmotionEntry } from '../types';

export interface CreateEmotionInput {
  emotion: string;
  intensity: number;
  notes?: string;
  tags?: string[];
}

export async function createEntry(
  userId: string,
  input: CreateEmotionInput
): Promise<EmotionEntry> {
  const rows = await query<EmotionEntry>(
    `INSERT INTO emotions.entries (user_id, emotion, intensity, notes, tags)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, input.emotion, input.intensity, input.notes ?? null, input.tags ?? []]
  );
  return rows[0];
}

export async function listEntries(
  userId: string,
  limit = 20,
  offset = 0
): Promise<EmotionEntry[]> {
  return query<EmotionEntry>(
    `SELECT * FROM emotions.entries
     WHERE user_id = $1 AND is_active = TRUE
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
}

export async function getEntry(userId: string, entryId: string): Promise<EmotionEntry | null> {
  const rows = await query<EmotionEntry>(
    `SELECT * FROM emotions.entries WHERE id = $1 AND user_id = $2`,
    [entryId, userId]
  );
  return rows[0] ?? null;
}

export async function deleteEntry(userId: string, entryId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `UPDATE emotions.entries SET is_active = FALSE, updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND is_active = TRUE
     RETURNING id`,
    [entryId, userId]
  );
  return rows.length > 0;
}
