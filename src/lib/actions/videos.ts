'use server';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSavedVideos() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  // Fetch from saved_videos table
  const { data: saved, error } = await supabase
    .from('saved_videos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;

  // Backfill: find external video URLs from exercises not yet in saved_videos
  const { data: exercises } = await supabase
    .from('exercises')
    .select('video_url, name')
    .not('video_url', 'is', null)
    .not('video_url', 'like', 'vimeo:%');

  if (exercises && exercises.length > 0) {
    const savedUrls = new Set((saved ?? []).map((s) => s.url));
    const toInsert = exercises
      .filter((ex) => ex.video_url && !savedUrls.has(ex.video_url))
      .map((ex) => ({ url: ex.video_url!, title: ex.name }));

    if (toInsert.length > 0) {
      // Deduplicate by URL before inserting
      const uniqueInserts = [...new Map(toInsert.map((v) => [v.url, v])).values()];
      await supabase
        .from('saved_videos')
        .upsert(uniqueInserts, { onConflict: 'url', ignoreDuplicates: true });

      // Re-fetch after backfill
      const { data: refreshed } = await supabase
        .from('saved_videos')
        .select('*')
        .order('created_at', { ascending: false });
      return refreshed ?? [];
    }
  }

  return saved ?? [];
}

export async function saveVideo(url: string, title?: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();

  // Upsert — ignore if URL already exists
  const { error } = await supabase
    .from('saved_videos')
    .upsert({ url, title: title || null }, { onConflict: 'url', ignoreDuplicates: true });

  if (error) throw error;
  revalidatePath('/videoer');
}

export async function deleteSavedVideo(id: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from('saved_videos')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/videoer');
}
