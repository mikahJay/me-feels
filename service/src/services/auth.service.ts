import axios from 'axios';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { query } from '../db';
import type { GoogleUserInfo, User, JwtPayload, AuthTokens } from '../types';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export async function exchangeGoogleCode(code: string): Promise<AuthTokens> {
  const tokenRes = await axios.post<{
    access_token: string;
    token_type: string;
  }>(GOOGLE_TOKEN_URL, {
    code,
    client_id: config.google.clientId,
    client_secret: config.google.clientSecret,
    redirect_uri: config.google.redirectUri,
    grant_type: 'authorization_code',
  });

  const { access_token } = tokenRes.data;

  const userRes = await axios.get<GoogleUserInfo>(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const googleUser = userRes.data;
  const user = await upsertUser(googleUser);

  return { accessToken: signJwt(user) };
}

async function upsertUser(googleUser: GoogleUserInfo): Promise<User> {
  const rows = await query<User>(
    `INSERT INTO auth.users (email, name, avatar_url, provider, provider_id)
     VALUES ($1, $2, $3, 'google', $4)
     ON CONFLICT (provider, provider_id)
     DO UPDATE SET
       email      = EXCLUDED.email,
       name       = EXCLUDED.name,
       avatar_url = EXCLUDED.avatar_url,
       updated_at = NOW()
     RETURNING *`,
    [googleUser.email, googleUser.name, googleUser.picture, googleUser.id]
  );
  return rows[0];
}

export function signJwt(user: User): string {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

const DEV_USER: GoogleUserInfo = {
  id: 'dev-local-bob',
  email: 'bob@local.dev',
  name: 'bob',
  picture: '',
};

export async function devLogin(): Promise<AuthTokens> {
  const user = await upsertUser(DEV_USER);
  return { accessToken: signJwt(user) };
}

export function buildGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: config.google.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
