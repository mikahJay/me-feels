import { analyzeEmotion, generateActionPlan } from '../services/ai.service';

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: 'You seem to be feeling stressed.',
              triggers: ['work pressure', 'deadlines'],
              recommendations: ['Take a 5-minute break', 'Try deep breathing'],
            }),
          },
        ],
      }),
    },
  }));
});

jest.mock('../config', () => ({
  config: {
    jwt: { secret: 'test_secret', expiresIn: '7d' },
    google: { clientId: '', redirectUri: 'http://localhost:3001/auth/google/callback' },
    anthropic: { apiKey: 'test_key' },
    db: { host: 'localhost', port: 5432, database: 'mefeels', user: 'mefeels', password: 'mefeels_dev' },
    port: 3001,
    nodeEnv: 'test',
  },
}));

describe('AI Service', () => {
  describe('analyzeEmotion', () => {
    it('returns structured insights from Claude', async () => {
      const insights = await analyzeEmotion({
        emotion: 'anxious',
        intensity: 7,
        notes: 'Big presentation tomorrow',
      });

      expect(insights).toHaveProperty('summary');
      expect(insights).toHaveProperty('triggers');
      expect(insights).toHaveProperty('recommendations');
      expect(Array.isArray(insights.triggers)).toBe(true);
      expect(Array.isArray(insights.recommendations)).toBe(true);
    });
  });

  describe('generateActionPlan', () => {
    it('returns a string action plan', async () => {
      const plan = await generateActionPlan([
        { emotion: 'sad', intensity: 5, notes: null, createdAt: new Date() },
      ]);

      expect(typeof plan).toBe('string');
    });
  });
});
