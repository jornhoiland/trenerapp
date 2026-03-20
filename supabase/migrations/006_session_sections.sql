-- Session sections: ordered groups within a session
CREATE TABLE session_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_session_sections_session_id ON session_sections(session_id);

-- Add section reference to exercises (replaces the old free-text section column)
ALTER TABLE exercises ADD COLUMN section_id UUID REFERENCES session_sections(id) ON DELETE SET NULL;

-- Drop old free-text section column
ALTER TABLE exercises DROP COLUMN IF EXISTS section;

CREATE INDEX idx_exercises_section_id ON exercises(section_id);
