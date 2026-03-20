'use server';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Session } from '@/types/database';

export async function getSessions(status?: 'planned' | 'completed') {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let query = supabase.from('sessions').select('*, exercises(*), session_sections(*)').order('date', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getSession(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*, exercises(*), session_sections(*)')
    .eq('id', id)
    .order('sort_order', { referencedTable: 'exercises' })
    .order('sort_order', { referencedTable: 'session_sections' })
    .maybeSingle();

  if (error) throw new Error(`getSession failed: ${error.message} (code: ${error.code})`);
  return data;
}

export async function createSession(title: string, date: string) {
  if (!isSupabaseConfigured()) throw new Error('Supabase er ikke konfigurert. Oppdater .env.local med dine Supabase-nøkler.');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .insert({ title, date, status: 'planned' })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/');
  return data as Session;
}

export async function updateSession(id: string, updates: Partial<Pick<Session, 'title' | 'date' | 'notes'>>) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/');
  revalidatePath(`/sessions/${id}`);
}

export async function completeSession(id: string, folderId?: string | null) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status: 'completed' };
  if (folderId !== undefined) updates.folder_id = folderId;
  const { error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/historikk');
  revalidatePath(`/sessions/${id}`);
}

export async function deleteSession(id: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/historikk');
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from('sessions')
    .update({ is_favorite: isFavorite })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/');
  revalidatePath(`/sessions/${id}`);
}

export async function duplicateSession(id: string, newTitle?: string, reuseDate?: string) {
  if (!isSupabaseConfigured()) throw new Error('Supabase er ikke konfigurert.');
  const supabase = await createClient();

  // Get original session with exercises and sections
  const { data: original, error: fetchError } = await supabase
    .from('sessions')
    .select('*, exercises(*), session_sections(*)')
    .eq('id', id)
    .order('sort_order', { referencedTable: 'exercises' })
    .order('sort_order', { referencedTable: 'session_sections' })
    .single();

  if (fetchError || !original) throw new Error(fetchError?.message || 'Fant ikke økten.');

  // Create new session
  const { data: newSession, error: createError } = await supabase
    .from('sessions')
    .insert({
      title: newTitle || original.title,
      date: reuseDate || new Date().toISOString().split('T')[0],
      notes: null,
      status: 'planned',
      is_favorite: false,
    })
    .select()
    .single();

  if (createError) throw createError;

  // Duplicate sections and build old->new ID map
  const sectionIdMap = new Map<string, string>();
  if (original.session_sections && original.session_sections.length > 0) {
    const sectionsToInsert = original.session_sections.map((s: { name: string; sort_order: number }) => ({
      session_id: newSession.id,
      name: s.name,
      sort_order: s.sort_order,
    }));

    const { data: newSections } = await supabase
      .from('session_sections')
      .insert(sectionsToInsert)
      .select();

    if (newSections) {
      original.session_sections.forEach((oldSection: { id: string }, i: number) => {
        sectionIdMap.set(oldSection.id, newSections[i].id);
      });
    }
  }

  // Duplicate exercises
  if (original.exercises && original.exercises.length > 0) {
    const exercises = original.exercises.map((ex: { name: string; description: string | null; sort_order: number; is_individual: boolean; individual_note: string | null; video_url: string | null; duration_minutes: number | null; section_id: string | null }) => ({
      session_id: newSession.id,
      name: ex.name,
      description: ex.description,
      sort_order: ex.sort_order,
      is_individual: ex.is_individual,
      individual_note: ex.individual_note,
      video_url: ex.video_url,
      duration_minutes: ex.duration_minutes,
      section_id: ex.section_id ? sectionIdMap.get(ex.section_id) || null : null,
      is_done: false,
    }));

    await supabase.from('exercises').insert(exercises);
  }

  return newSession;
}

export async function getFavoriteSessions() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*, exercises(*), session_sections(*)')
    .eq('is_favorite', true)
    .order('title');

  if (error) throw error;
  return data;
}

export async function reopenSession(id: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();

  // Reset all exercises to not done
  const { error: exError } = await supabase
    .from('exercises')
    .update({ is_done: false })
    .eq('session_id', id);

  if (exError) throw exError;

  const { error } = await supabase
    .from('sessions')
    .update({ status: 'planned' })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/historikk');
  revalidatePath(`/sessions/${id}`);
}

export interface TrainingInsights {
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  totalCompleted: number;
  totalExercisesThisMonth: number;
  topExercises: { name: string; count: number }[];
  individualAdaptations: { note: string; count: number }[];
}

export async function getTrainingInsights(): Promise<TrainingInsights> {
  if (!isSupabaseConfigured()) {
    return { sessionsThisWeek: 0, sessionsThisMonth: 0, totalCompleted: 0, totalExercisesThisMonth: 0, topExercises: [], individualAdaptations: [] };
  }
  const supabase = await createClient();

  const now = new Date();
  const dayOfWeek = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);
  const weekStart = monday.toISOString().split('T')[0];
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const { data: completed } = await supabase
    .from('sessions')
    .select('*, exercises(*)')
    .eq('status', 'completed')
    .order('date', { ascending: false });

  const sessions = completed || [];

  const sessionsThisWeek = sessions.filter((s) => s.date >= weekStart).length;
  const sessionsThisMonth = sessions.filter((s) => s.date >= monthStart).length;
  const totalExercisesThisMonth = sessions
    .filter((s) => s.date >= monthStart)
    .reduce((sum, s) => sum + (s.exercises?.length || 0), 0);

  const exerciseCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    (s.exercises || []).forEach((ex: { name: string }) => {
      const key = ex.name.trim().toLowerCase();
      exerciseCounts[key] = (exerciseCounts[key] || 0) + 1;
    });
  });
  const topExercises = Object.entries(exerciseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }));

  const adaptations: Record<string, { note: string; count: number }> = {};
  sessions.forEach((s) => {
    (s.exercises || []).forEach((ex: { is_individual: boolean; individual_note: string | null }) => {
      if (ex.is_individual && ex.individual_note) {
        const key = ex.individual_note.trim().toLowerCase();
        if (!adaptations[key]) {
          adaptations[key] = { note: ex.individual_note, count: 0 };
        }
        adaptations[key].count++;
      }
    });
  });
  const individualAdaptations = Object.values(adaptations)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { sessionsThisWeek, sessionsThisMonth, totalCompleted: sessions.length, totalExercisesThisMonth, topExercises, individualAdaptations };
}
