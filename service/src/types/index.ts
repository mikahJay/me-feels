export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: string;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmotionEntry {
  id: string;
  userId: string;
  emotion: string;
  intensity: number;
  notes: string | null;
  tags: string[];
  aiInsights: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string | null;
  iat?: number;
  exp?: number;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface AuthTokens {
  accessToken: string;
}
