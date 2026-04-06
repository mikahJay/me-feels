import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import type { EmotionEntry } from '../types';

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

export interface EmotionInsight {
  summary: string;
  triggers: string[];
  recommendations: string[];
}

export async function analyzeEmotion(entry: Pick<EmotionEntry, 'emotion' | 'intensity' | 'notes'>): Promise<EmotionInsight> {
  const prompt = `Analyze the following emotional entry and provide insights:
Emotion: ${entry.emotion}
Intensity (1-10): ${entry.intensity}
Notes: ${entry.notes ?? 'none'}

Respond with a JSON object containing:
- summary: a brief empathetic summary (1-2 sentences)
- triggers: array of potential emotional triggers based on context
- recommendations: array of 2-3 actionable recommendations

Respond ONLY with valid JSON, no markdown.`;

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  return JSON.parse(text) as EmotionInsight;
}

export async function generateActionPlan(
  recentEntries: Pick<EmotionEntry, 'emotion' | 'intensity' | 'notes' | 'createdAt'>[]
): Promise<string> {
  const summary = recentEntries
    .map(e => `- ${e.emotion} (intensity ${e.intensity}) on ${new Date(e.createdAt).toLocaleDateString()}`)
    .join('\n');

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Based on these recent emotional entries:\n${summary}\n\nCreate a personalized, compassionate action plan to help improve emotional wellbeing. Focus on patterns and practical steps.`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}
