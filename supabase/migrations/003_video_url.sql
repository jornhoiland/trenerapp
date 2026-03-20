-- Add video_url to exercises and exercise_templates
ALTER TABLE exercises ADD COLUMN video_url TEXT;
ALTER TABLE exercise_templates ADD COLUMN video_url TEXT;
