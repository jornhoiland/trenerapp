-- History folders for categorizing completed sessions
CREATE TABLE history_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add folder reference to sessions
ALTER TABLE sessions ADD COLUMN folder_id UUID REFERENCES history_folders(id) ON DELETE SET NULL;

-- Exercise templates (reusable exercises)
CREATE TABLE exercise_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_individual BOOLEAN NOT NULL DEFAULT FALSE,
  individual_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_folder_id ON sessions(folder_id);
CREATE INDEX idx_exercise_templates_name ON exercise_templates(name);
