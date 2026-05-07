-- Seed standard exercise templates with categories
INSERT INTO exercise_templates (name, description, category, duration_minutes, is_individual, created_at)
VALUES
  -- Oppvarming
  ('Jogging på stedet', 'Varme opp kroppen', 'Oppvarming', 5, false, now()),
  ('Armrotasjoner', 'Sirkelrotasjoner begge armer', 'Oppvarming', 2, false, now()),
  ('Beinstrekk', 'Dynamiske beinstrekk', 'Oppvarming', 3, false, now()),

  -- Styrke
  ('Knebøy', '3 sett x 10 repetisjon', 'Styrke', 10, false, now()),
  ('Liegestøtter', '3 sett x 8-12 repetisjon', 'Styrke', 8, false, now()),
  ('Setninger', '3 sett x 10 repetisjon', 'Styrke', 10, false, now()),

  -- Teknikk
  ('Pasningsserie', 'Grunnleggende pasningteknikkøvelse', 'Teknikk', 15, false, now()),
  ('Skuddtrening', 'Øvelser for å forbedre skuddteknikk', 'Teknikk', 15, false, now()),

  -- Utholdenhet
  ('Intervalltrening', '5x2 min intensivt + 1 min pause', 'Utholdenhet', 20, false, now()),
  ('Aerob løping', 'Moderat tempo løping', 'Utholdenhet', 20, false, now()),

  -- Skadefri
  ('Hofteabduksjon', 'Skadeprevensjon for hofter', 'Skadefri', 5, false, now()),
  ('Rotatormansjettøvelse', 'Styrkøvelse for rotatormansjetten', 'Skadefri', 5, false, now())
ON CONFLICT DO NOTHING;
