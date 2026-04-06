-- Add soft-delete support to emotion entries
ALTER TABLE emotions.entries ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_entries_is_active ON emotions.entries (user_id, is_active);
