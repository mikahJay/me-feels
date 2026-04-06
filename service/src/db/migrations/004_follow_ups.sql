-- Follow-ups: actions/events/thoughts linked to a feel, infinitely nestable
CREATE TABLE IF NOT EXISTS emotions.follow_ups (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  root_feel_id        UUID NOT NULL REFERENCES emotions.entries(id) ON DELETE CASCADE,
  parent_follow_up_id UUID REFERENCES emotions.follow_ups(id) ON DELETE CASCADE,
  description         TEXT NOT NULL,
  attached_feel_id    UUID REFERENCES emotions.entries(id) ON DELETE SET NULL,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_root_feel_id ON emotions.follow_ups (root_feel_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_parent_id    ON emotions.follow_ups (parent_follow_up_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_user_id      ON emotions.follow_ups (user_id);
