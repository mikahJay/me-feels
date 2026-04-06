import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.SERVICE_PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  devMode: process.env.DEV_MODE === 'true',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev_secret_change_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3001/auth/google/callback',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
  },
  db: {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    database: process.env.POSTGRES_DB ?? 'mefeels',
    user: process.env.POSTGRES_USER ?? 'mefeels',
    password: process.env.POSTGRES_PASSWORD ?? 'mefeels_dev',
  },
};
