export type Session = {
  id: string;
  title: string;
  date: string;
  notes: string | null;
  status: 'planned' | 'completed';
  is_favorite: boolean;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Exercise = {
  id: string;
  session_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_individual: boolean;
  individual_note: string | null;
  is_done: boolean;
  video_url: string | null;
  duration_minutes: number | null;
  section_id: string | null;
};

export type SessionSection = {
  id: string;
  session_id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type SessionWithExercises = Session & {
  exercises: Exercise[];
  session_sections: SessionSection[];
};

export type HistoryFolder = {
  id: string;
  name: string;
  created_at: string;
};

export type ExerciseTemplate = {
  id: string;
  name: string;
  description: string | null;
  is_individual: boolean;
  individual_note: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  category: string | null;
  created_at: string;
};

export type SavedVideo = {
  id: string;
  url: string;
  title: string | null;
  created_at: string;
};
