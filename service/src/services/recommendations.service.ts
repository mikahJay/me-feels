import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { query } from '../db';

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

export interface Recommendation {
  description: string;
  rationale: string;
}

interface EffectivePattern {
  followUpDescription: string;
  beforeEmotion: string;
  beforeIntensity: number;
  afterEmotion: string;
  afterIntensity: number;
}

interface CurrentFeel {
  emotion: string;
  intensity: number;
  notes: string | null;
}

/**
 * Fetches follow-ups from the user's history where a feel logged within 24h
 * after the follow-up showed a different (potentially improved) emotional state.
 * Claude ultimately judges "improvement" from the before/after context.
 */
async function getEffectivePatterns(userId: string): Promise<EffectivePattern[]> {
  const rows = await query<{
    follow_up_description: string;
    before_emotion: string;
    before_intensity: number;
    after_emotion: string;
    after_intensity: number;
  }>(
    `SELECT
       fu.description            AS follow_up_description,
       e_before.emotion          AS before_emotion,
       e_before.intensity        AS before_intensity,
       e_after.emotion           AS after_emotion,
       e_after.intensity         AS after_intensity
     FROM emotions.follow_ups fu
     JOIN emotions.entries e_before
       ON e_before.id = fu.root_feel_id
      AND e_before.is_active = TRUE
     JOIN emotions.entries e_after
       ON e_after.user_id = fu.user_id
      AND e_after.created_at > fu.created_at
      AND e_after.created_at <= fu.created_at + INTERVAL '24 hours'
      AND e_after.is_active = TRUE
      AND e_after.id != e_before.id
     WHERE fu.user_id = $1
       AND fu.is_active = TRUE
     ORDER BY fu.created_at DESC
     LIMIT 30`,
    [userId]
  );

  return rows.map(r => ({
    followUpDescription: r.follow_up_description,
    beforeEmotion: r.before_emotion,
    beforeIntensity: r.before_intensity,
    afterEmotion: r.after_emotion,
    afterIntensity: r.after_intensity,
  }));
}

export async function getRecommendations(
  userId: string,
  feel: CurrentFeel
): Promise<Recommendation[]> {
  const patterns = await getEffectivePatterns(userId);

  const patternSection =
    patterns.length > 0
      ? `\nThis user's personal history — follow-up actions and how they felt within 24 hours after:\n` +
        patterns
          .map(
            p =>
              `  • "${p.followUpDescription}" → was feeling ${p.beforeEmotion} (${p.beforeIntensity}/10), afterwards felt ${p.afterEmotion} (${p.afterIntensity}/10)`
          )
          .join('\n')
      : `\nNo personal history yet — rely on general evidence-based strategies.`;

  const prompt = `You are a compassionate emotional wellness assistant. A user has logged how they are feeling and needs help deciding what to do next.

Current feel:
  Emotion: ${feel.emotion}
  Intensity: ${feel.intensity}/10${feel.notes ? `\n  Notes: ${feel.notes}` : ''}
${patternSection}

Suggest 4 specific, actionable follow-up actions tailored to this user's current emotional state and personal patterns where available. Prefer actions that have previously led to emotional improvement for this user. Each action should be something a person can realistically do today.

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "recommendations": [
    { "description": "...", "rationale": "..." }
  ]
}`;

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 768,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}';
  // Strip markdown code fences Claude sometimes adds despite instructions
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const parsed = JSON.parse(text) as { recommendations: Recommendation[] };
  return parsed.recommendations ?? [];
}
