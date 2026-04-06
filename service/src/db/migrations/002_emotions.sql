-- Emotions schema
CREATE SCHEMA IF NOT EXISTS emotions;

CREATE TABLE IF NOT EXISTS emotions.entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion     TEXT NOT NULL,
  intensity   SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 10),
  notes       TEXT,
  tags        TEXT[] DEFAULT '{}',
  ai_insights JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entries_user_id ON emotions.entries (user_id);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON emotions.entries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_emotion ON emotions.entries (emotion);
