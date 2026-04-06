import { query } from '../db';
import type { FollowUp } from '../types';

export interface CreateFollowUpInput {
  rootFeelId: string;
  parentFollowUpId?: string;
  description: string;
  attachedFeelId?: string;
}

export async function createFollowUp(userId: string, input: CreateFollowUpInput): Promise<FollowUp> {
  const rows = await query<FollowUp>(
    `INSERT INTO emotions.follow_ups
       (user_id, root_feel_id, parent_follow_up_id, description, attached_feel_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      userId,
      input.rootFeelId,
      input.parentFollowUpId ?? null,
      input.description,
      input.attachedFeelId ?? null,
    ]
  );
  return rows[0];
}

// Returns all active follow-ups for a root feel, flat list ordered by creation
export async function listFollowUps(userId: string, rootFeelId: string): Promise<FollowUp[]> {
  return query<FollowUp>(
    `SELECT fu.*,
       CASE WHEN ae.id IS NOT NULL THEN
         json_build_object(
           'id', ae.id, 'emotion', ae.emotion, 'intensity', ae.intensity,
           'notes', ae.notes, 'createdAt', ae.created_at
         )
       ELSE NULL END AS "attachedFeel"
     FROM emotions.follow_ups fu
     LEFT JOIN emotions.entries ae ON ae.id = fu.attached_feel_id AND ae.is_active = TRUE
     WHERE fu.root_feel_id = $1 AND fu.user_id = $2 AND fu.is_active = TRUE
     ORDER BY fu.created_at ASC`,
    [rootFeelId, userId]
  );
}

export async function deleteFollowUp(userId: string, followUpId: string): Promise<boolean> {
  // Soft-delete the follow-up and all its descendants via recursive CTE
  const rows = await query<{ id: string }>(
    `WITH RECURSIVE descendants AS (
       SELECT id FROM emotions.follow_ups WHERE id = $1 AND user_id = $2
       UNION ALL
       SELECT fu.id FROM emotions.follow_ups fu
       JOIN descendants d ON fu.parent_follow_up_id = d.id
     )
     UPDATE emotions.follow_ups SET is_active = FALSE, updated_at = NOW()
     WHERE id IN (SELECT id FROM descendants)
     RETURNING id`,
    [followUpId, userId]
  );
  return rows.length > 0;
}

// Build nested tree from flat list
export function buildTree(flat: FollowUp[]): FollowUp[] {
  const map = new Map<string, FollowUp>();
  const roots: FollowUp[] = [];

  for (const fu of flat) {
    map.set(fu.id, { ...fu, children: [] });
  }

  for (const fu of map.values()) {
    if (fu.parentFollowUpId) {
      const parent = map.get(fu.parentFollowUpId);
      if (parent) {
        parent.children!.push(fu);
        continue;
      }
    }
    roots.push(fu);
  }

  return roots;
}
