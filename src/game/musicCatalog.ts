export interface HamoTrackDef {
  id: string;
  titleAr: string;
  artistAr: string;
  youtubeId: string;
  bpm: number;
  motifNotes: number[];
  bassNotes: number[];
}

export const HAMO_MORSHEDY_CHANNEL_URL =
  'https://www.youtube.com/channel/UCjtPjvDDqnoEPHIQAnmy4_g';

export const HAMO_MORSHEDY_TRACKS: HamoTrackDef[] = [
  {
    id: 'fokt',
    titleAr: 'مهرجان فوقت',
    artistAr: 'حمو المرشدي',
    youtubeId: 'NCpnxOXv7lE',
    bpm: 116,
    motifNotes: [293.66, 311.13, 392.0, 349.23, 392.0, 440.0, 392.0, 349.23],
    bassNotes: [146.83, 146.83, 155.56, 174.61],
  },
  {
    id: 'talaou',
    titleAr: 'طلعو علي إيدي',
    artistAr: 'حمو المرشدي',
    youtubeId: '0DqXwj7-QtY',
    bpm: 112,
    motifNotes: [329.63, 349.23, 415.3, 440.0, 415.3, 349.23, 329.63, 293.66],
    bassNotes: [164.81, 164.81, 174.61, 146.83],
  },
  {
    id: 'mesalem',
    titleAr: 'بطلت أجامل بقيت مسالم',
    artistAr: 'حمو المرشدي',
    youtubeId: 'aG0WSyaM09g',
    bpm: 108,
    motifNotes: [261.63, 277.18, 349.23, 329.63, 277.18, 261.63, 293.66, 349.23],
    bassNotes: [130.81, 130.81, 146.83, 174.61],
  },
  {
    id: 'malek_elghaba',
    titleAr: 'ملك الغابة (مهرجانات متواصلة)',
    artistAr: 'حمو المرشدي',
    youtubeId: 'NCpnxOXv7lE',
    bpm: 118,
    motifNotes: [293.66, 349.23, 440.0, 466.16, 440.0, 392.0, 349.23, 311.13],
    bassNotes: [146.83, 174.61, 155.56, 146.83],
  },
];

export function normalizeHamoTrackIndex(idx: number): number {
  const len = HAMO_MORSHEDY_TRACKS.length;
  if (len <= 0) return 0;
  return ((Math.trunc(idx) % len) + len) % len;
}

export function getNextHamoTrackIndex(current: number): number {
  return normalizeHamoTrackIndex(current + 1);
}

export function getPrevHamoTrackIndex(current: number): number {
  return normalizeHamoTrackIndex(current - 1);
}

export function getHamoTrack(index: number): HamoTrackDef {
  return HAMO_MORSHEDY_TRACKS[normalizeHamoTrackIndex(index)];
}

export function buildHamoYouTubeEmbedUrl(
  trackIndex: number,
  autoplay = true,
): string {
  const safeIdx = normalizeHamoTrackIndex(trackIndex);
  const current = HAMO_MORSHEDY_TRACKS[safeIdx];
  const uniqueIds = Array.from(
    new Set([
      current.youtubeId,
      ...HAMO_MORSHEDY_TRACKS.map((t) => t.youtubeId),
    ]),
  );
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    loop: '1',
    playlist: uniqueIds.join(','),
    rel: '0',
    playsinline: '1',
    modestbranding: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${current.youtubeId}?${params.toString()}`;
}
