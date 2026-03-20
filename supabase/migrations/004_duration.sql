-- Add duration (in minutes) to exercises and exercise_templates
ALTER TABLE exercises ADD COLUMN duration_minutes INTEGER;
ALTER TABLE exercise_templates ADD COLUMN duration_minutes INTEGER;
