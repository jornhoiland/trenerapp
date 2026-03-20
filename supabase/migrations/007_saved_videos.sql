-- Saved videos: external URLs saved by the trainer
CREATE TABLE saved_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_videos_created_at ON saved_videos(created_at);
