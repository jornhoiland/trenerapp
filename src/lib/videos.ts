export interface SkadefriVideo {
  title: string;
  vimeoId: string;
  reps: string;
  level: number;
  category: 'løp' | 'kne' | 'skulder' | 'styrke';
}

export const SKADEFRI_VIDEOS: SkadefriVideo[] = [
  // Nivå 1
  { title: 'Trekantløp', vimeoId: '233652576', reps: 'Frem og tilbake på banen', level: 1, category: 'løp' },
  { title: 'Løp med kast bakover', vimeoId: '230553995', reps: 'Frem og tilbake på banen', level: 1, category: 'løp' },
  { title: 'Løp med stem', vimeoId: '230553916', reps: 'Frem og tilbake på banen', level: 1, category: 'kne' },
  { title: 'Hopp med dytt', vimeoId: '218592884', reps: '3 x 8–16 repetisjoner', level: 1, category: 'kne' },
  { title: 'Sideliggende rotasjon', vimeoId: '218597873', reps: '2–3 x 6–8 repetisjoner', level: 1, category: 'skulder' },
  { title: 'Pil og bue', vimeoId: '218592520', reps: '3 x 8–16 repetisjoner', level: 1, category: 'skulder' },
  { title: 'Utadrotasjon skulder med ball', vimeoId: '218593908', reps: '3 x 8–16 repetisjoner', level: 1, category: 'skulder' },
  { title: 'Push up-pasninger', vimeoId: '218592714', reps: '3 x 30 sekunder', level: 1, category: 'styrke' },
  { title: 'Markløft med partner', vimeoId: '218592735', reps: '3 x 8–16 repetisjoner', level: 1, category: 'styrke' },
  { title: 'Kast bakover', vimeoId: '218592423', reps: '3 x 8–16 repetisjoner', level: 1, category: 'skulder' },
  // Nivå 2
  { title: 'Løp med skøytehopp', vimeoId: '230553986', reps: 'Frem og tilbake på banen', level: 2, category: 'løp' },
  { title: 'Løp med kast bakover', vimeoId: '230553995', reps: 'Frem og tilbake på banen', level: 2, category: 'løp' },
  { title: 'Løp med tobenslanding', vimeoId: '230553951', reps: 'Frem og tilbake på banen', level: 2, category: 'kne' },
  { title: 'Rotasjonshopp med dytt', vimeoId: '218592900', reps: '3 x 8–16 repetisjoner', level: 2, category: 'kne' },
  { title: 'Utfall med sidebøy', vimeoId: '218597656', reps: '3 x 8–16 repetisjoner', level: 2, category: 'kne' },
  { title: 'Skulderpress med strikk', vimeoId: '218592540', reps: '3 x 8–16 repetisjoner', level: 2, category: 'skulder' },
  { title: 'Utadrotasjon av skulder med ball', vimeoId: '218592528', reps: '3 x 8–16 repetisjoner', level: 2, category: 'skulder' },
  { title: 'Push up-pasninger', vimeoId: '218592728', reps: '3 x 30 sekunder', level: 2, category: 'styrke' },
  { title: 'Markløft med partner', vimeoId: '218592735', reps: '3 x 8–16 repetisjoner', level: 2, category: 'styrke' },
  { title: 'Slipp og grip med ball', vimeoId: '218597610', reps: '3 x 8–16 repetisjoner', level: 2, category: 'skulder' },
  // Nivå 3
  { title: 'Sprunglauf', vimeoId: '230553885', reps: 'Frem og tilbake på banen', level: 3, category: 'løp' },
  { title: 'Løp med kast bakover', vimeoId: '230553995', reps: 'Frem og tilbake på banen', level: 3, category: 'løp' },
  { title: 'Løp med ettbenslanding', vimeoId: '230553962', reps: 'Frem og tilbake på banen', level: 3, category: 'kne' },
  { title: '90° rotasjon ett ben med dytt', vimeoId: '218592900', reps: '3 x 8–16 repetisjoner', level: 3, category: 'kne' },
  { title: 'Utfall med rotasjon', vimeoId: '218597641', reps: '3 x 8–16 repetisjoner', level: 3, category: 'kne' },
  { title: 'Stående Y-fall', vimeoId: '218592508', reps: '3 x 8–16 repetisjoner', level: 3, category: 'skulder' },
  { title: 'Opptrekk av strikk', vimeoId: '218592703', reps: '3 x 8–16 repetisjoner', level: 3, category: 'skulder' },
  { title: 'Push up med tågange', vimeoId: '218597856', reps: '3 x 8–16 repetisjoner', level: 3, category: 'styrke' },
  { title: 'Markløft med partner', vimeoId: '218592735', reps: '3 x 8–16 repetisjoner', level: 3, category: 'styrke' },
  { title: 'Stående mottak med kast bakover', vimeoId: '218592392', reps: '3 x 8–16 repetisjoner', level: 3, category: 'skulder' },
];

/** Parse a video_url value. Returns vimeo ID or external URL */
export function parseVideoUrl(url: string): { type: 'vimeo'; id: string } | { type: 'external'; url: string } {
  if (url.startsWith('vimeo:')) {
    return { type: 'vimeo', id: url.slice(6) };
  }
  return { type: 'external', url };
}

/** Find a Skadefri video by its vimeo ID */
export function findSkadefriVideo(vimeoId: string): SkadefriVideo | undefined {
  return SKADEFRI_VIDEOS.find((v) => v.vimeoId === vimeoId);
}

/** Get display label for a video_url */
export function getVideoLabel(videoUrl: string): string {
  const parsed = parseVideoUrl(videoUrl);
  if (parsed.type === 'vimeo') {
    const video = findSkadefriVideo(parsed.id);
    return video ? `Skadefri: ${video.title}` : 'Vimeo-video';
  }
  try {
    return new URL(parsed.url).hostname;
  } catch {
    return 'Ekstern video';
  }
}
