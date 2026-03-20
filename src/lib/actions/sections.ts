'use server';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addSection(sessionId: string, name: string) {
  if (!isSupabaseConfigured()) throw new Error('Supabase er ikke konfigurert.');
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('session_sections')
    .select('sort_order')
    .eq('session_id', sessionId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const sortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from('session_sections')
    .insert({ session_id: sessionId, name, sort_order: sortOrder })
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/sessions/${sessionId}`);
  return data;
}

export async function renameSection(id: string, sessionId: string, name: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from('session_sections')
    .update({ name })
    .eq('id', id);

  if (error) throw error;
  revalidatePath(`/sessions/${sessionId}`);
}

export async function deleteSection(id: string, sessionId: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();

  // Exercises in this section get section_id = null (handled by ON DELETE SET NULL)
  const { error } = await supabase
    .from('session_sections')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath(`/sessions/${sessionId}`);
}

export async function reorderSections(sessionId: string, orderedIds: string[]) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('session_sections').update({ sort_order: index }).eq('id', id)
    )
  );

  revalidatePath(`/sessions/${sessionId}`);
}

export async function moveExerciseToSection(exerciseId: string, sessionId: string, sectionId: string | null) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from('exercises')
    .update({ section_id: sectionId })
    .eq('id', exerciseId);

  if (error) throw error;
  revalidatePath(`/sessions/${sessionId}`);
}
