'use server';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getFolders() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('history_folders')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createFolder(name: string) {
  if (!isSupabaseConfigured()) throw new Error('Supabase er ikke konfigurert.');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('history_folders')
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/historikk');
  return data;
}

export async function deleteFolder(id: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();

  // Unset folder_id on sessions in this folder
  await supabase.from('sessions').update({ folder_id: null }).eq('folder_id', id);

  const { error } = await supabase.from('history_folders').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/historikk');
}

export async function renameFolder(id: string, name: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { error } = await supabase.from('history_folders').update({ name }).eq('id', id);
  if (error) throw error;
  revalidatePath('/historikk');
}

export async function moveSessionToFolder(sessionId: string, folderId: string | null) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { error } = await supabase.from('sessions').update({ folder_id: folderId }).eq('id', sessionId);
  if (error) throw error;
  revalidatePath('/historikk');
}
