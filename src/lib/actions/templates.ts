'use server';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getExerciseTemplates() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exercise_templates')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createExerciseTemplate(template: {
  name: string;
  description?: string | null;
  is_individual?: boolean;
  individual_note?: string | null;
  video_url?: string | null;
  duration_minutes?: number | null;
  category?: string | null;
}) {
  if (!isSupabaseConfigured()) throw new Error('Supabase er ikke konfigurert.');
  const supabase = await createClient();
  const insertData: Record<string, unknown> = {
      name: template.name,
      description: template.description || null,
      is_individual: template.is_individual || false,
      individual_note: template.individual_note || null,
      video_url: template.video_url || null,
      category: template.category || null,
    };
    if (template.duration_minutes != null) {
      insertData.duration_minutes = template.duration_minutes;
    }
    const { data, error } = await supabase
    .from('exercise_templates')
    .insert(insertData)
    .select()
    .single();
  if (error) throw error;
  revalidatePath('/ovelser');
  return data;
}

export async function updateExerciseTemplate(
  id: string,
  updates: { name?: string; description?: string | null; is_individual?: boolean; individual_note?: string | null; video_url?: string | null; duration_minutes?: number | null; category?: string | null }
) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { error } = await supabase.from('exercise_templates').update(updates).eq('id', id);
  if (error) throw error;
  revalidatePath('/ovelser');
}

export async function deleteExerciseTemplate(id: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { error } = await supabase.from('exercise_templates').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/ovelser');
}
