'use server';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { parseVideoUrl } from '@/lib/videos';
import { saveVideo } from '@/lib/actions/videos';

export async function addExercise(sessionId: string, name: string, isIndividual: boolean = false, individualNote?: string, description?: string, videoUrl?: string, durationMinutes?: number, sectionId?: string) {
  if (!isSupabaseConfigured()) throw new Error('Supabase er ikke konfigurert.');
  const supabase = await createClient();

  // Get max sort_order
  const { data: existing } = await supabase
    .from('exercises')
    .select('sort_order')
    .eq('session_id', sessionId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const sortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const insertData: Record<string, unknown> = {
    session_id: sessionId,
    name,
    description: description || null,
    sort_order: sortOrder,
    is_individual: isIndividual,
    individual_note: individualNote || null,
    video_url: videoUrl || null,
  };
  if (sectionId) {
    insertData.section_id = sectionId;
  }
  if (durationMinutes != null) {
    insertData.duration_minutes = durationMinutes;
  }

  const { data, error } = await supabase
    .from('exercises')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  // Auto-save external video URLs
  if (videoUrl) {
    const parsed = parseVideoUrl(videoUrl);
    if (parsed.type === 'external') {
      saveVideo(parsed.url, name).catch(() => {});
    }
  }
  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath('/');
  return data;
}

export async function updateExercise(id: string, sessionId: string, updates: { name?: string; description?: string | null; is_individual?: boolean; individual_note?: string | null; duration_minutes?: number | null; section_id?: string | null; video_url?: string | null }) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  // Only include duration_minutes if explicitly provided (avoids errors if column doesn't exist yet)
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.is_individual !== undefined) dbUpdates.is_individual = updates.is_individual;
  if (updates.individual_note !== undefined) dbUpdates.individual_note = updates.individual_note;
  if (updates.duration_minutes !== undefined) dbUpdates.duration_minutes = updates.duration_minutes;
  if (updates.section_id !== undefined) dbUpdates.section_id = updates.section_id;
  if (updates.video_url !== undefined) dbUpdates.video_url = updates.video_url;

  const { error } = await supabase
    .from('exercises')
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw error;

  // Auto-save external video URLs
  if (updates.video_url) {
    const parsed = parseVideoUrl(updates.video_url);
    if (parsed.type === 'external') {
      saveVideo(parsed.url, updates.name).catch(() => {});
    }
  }

  revalidatePath(`/sessions/${sessionId}`);
}

export async function toggleExercise(id: string, sessionId: string, isDone: boolean) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from('exercises')
    .update({ is_done: isDone })
    .eq('id', id);

  if (error) throw error;
  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath('/');
}

export async function deleteExercise(id: string, sessionId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath('/');
}

export async function reorderExercise(exerciseId: string, sessionId: string, direction: 'up' | 'down') {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();

  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, sort_order')
    .eq('session_id', sessionId)
    .order('sort_order', { ascending: true });

  if (!exercises || exercises.length < 2) return;

  const idx = exercises.findIndex((e) => e.id === exerciseId);
  if (idx === -1) return;
  if (direction === 'up' && idx === 0) return;
  if (direction === 'down' && idx === exercises.length - 1) return;

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  const current = exercises[idx];
  const swap = exercises[swapIdx];

  await Promise.all([
    supabase.from('exercises').update({ sort_order: swap.sort_order }).eq('id', current.id),
    supabase.from('exercises').update({ sort_order: current.sort_order }).eq('id', swap.id),
  ]);

  revalidatePath(`/sessions/${sessionId}`);
}

export async function reorderExercises(sessionId: string, orderedIds: string[]) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('exercises').update({ sort_order: index }).eq('id', id)
    )
  );

  revalidatePath(`/sessions/${sessionId}`);
}
