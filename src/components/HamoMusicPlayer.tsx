import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Music2,
  Pause,
  Play,
  Radio,
  SkipBack,
  SkipForward,
  Volume2,
  Youtube,
} from 'lucide-react';
import {
  buildHamoYouTubeEmbedUrl,
  getHamoTrack,
  HAMO_MORSHEDY_CHANNEL_URL,
  HAMO_MORSHEDY_TRACKS,
} from '../game/musicCatalog';
import { RadioStationId } from '../game/types';

interface HamoMusicPlayerProps {
  radioStation: RadioStationId;
  hamoTrackIndex: number;
  musicPaused: boolean;
  muted: boolean;
  inCar: boolean;
  touchControlsEnabled: boolean;
  onTogglePause: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSelectTrack: (index: number) => void;
  onSelectStation: (station: RadioStationId) => void;
  onToggleYoutubeStream: (active: boolean) => void;
}

const STATION_OPTIONS: Array<{ id: RadioStationId; labelAr: string }> = [
  { id: 'hamo_morshedy', labelAr: 'حمو المرشدي' },
  { id: 'shaabi', labelAr: 'شعبي' },
  { id: 'cairo_fm', labelAr: 'القاهرة FM' },
  { id: 'oud', labelAr: 'عود' },
  { id: 'off', labelAr: 'إيقاف' },
];

export const HamoMusicPlayer: React.FC<HamoMusicPlayerProps> = ({
  radioStation,
  hamoTrackIndex,
  musicPaused,
  muted,
  inCar,
  touchControlsEnabled,
  onTogglePause,
  onNextTrack,
  onPrevTrack,
  onSelectTrack,
  onSelectStation,
  onToggleYoutubeStream,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [youtubeActive, setYoutubeActive] = useState(false);
  const onToggleYoutubeRef = useRef(onToggleYoutubeStream);
  onToggleYoutubeRef.current = onToggleYoutubeStream;

  const currentTrack = getHamoTrack(hamoTrackIndex);
  const isActivelyPlaying =
    !muted && !musicPaused && radioStation !== 'off';

  useEffect(() => {
    if (radioStation !== 'hamo_morshedy' && youtubeActive) {
      setYoutubeActive(false);
      onToggleYoutubeRef.current(false);
    }
  }, [radioStation, youtubeActive]);

  useEffect(() => {
    return () => {
      onToggleYoutubeRef.current(false);
    };
  }, []);

  const handleToggleYoutube = () => {
    const next = !youtubeActive;
    setYoutubeActive(next);
    if (next && radioStation !== 'hamo_morshedy') {
      onSelectStation('hamo_morshedy');
    }
    onToggleYoutubeStream(next);
  };

  const bottomOffsetClass =
    inCar && touchControlsEnabled
      ? 'bottom-48'
      : inCar
        ? 'bottom-44'
        : touchControlsEnabled
          ? 'bottom-24'
          : 'bottom-4';

  const stationTitleAr =
    radioStation === 'hamo_morshedy'
      ? `${currentTrack.artistAr} — ${currentTrack.titleAr}`
      : radioStation === 'shaabi'
        ? 'راديو الشعبي والمهرجانات'
        : radioStation === 'cairo_fm'
          ? 'إذاعة القاهرة FM 104.2'
          : radioStation === 'oud'
            ? 'طرب العود الأصيل'
            : 'المزيكا متوقفة';

  return (
    <div
      className={`fixed ${bottomOffsetClass} left-4 z-30 pointer-events-auto flex flex-col items-start gap-2 max-w-[92vw]`}
    >
      {expanded && (
        <div
          data-testid="hamo-playlist-panel"
          className="w-80 rounded-2xl border border-amber-500/45 shadow-2xl overflow-hidden text-stone-100"
          style={{ backgroundColor: 'rgba(18, 14, 11, 0.96)' }}
        >
          <div className="px-3.5 py-2.5 border-b border-stone-800 flex items-center justify-between bg-[#241b13]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                <Music2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-amber-200">
                  مشغل أغاني حمو المرشدي
                </div>
                <div className="text-[10px] text-stone-400">
                  شغال على طول في الحارة والسيارة
                </div>
              </div>
            </div>
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                setExpanded(false);
              }}
              aria-label="تصغير مشغل الأغاني"
              className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* YouTube Official Continuous Stream Toggle */}
          <div className="p-3 border-b border-stone-800 space-y-2">
            <button
              type="button"
              tabIndex={-1}
              data-testid="hamo-youtube-toggle"
              onClick={(e) => {
                e.currentTarget.blur();
                handleToggleYoutube();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-extrabold cursor-pointer transition-colors ${
                youtubeActive
                  ? 'bg-red-600/25 border-red-400 text-red-200'
                  : 'bg-stone-900 border-stone-700 text-stone-200 hover:border-red-400/60'
              }`}
            >
              <span className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-400" />
                <span>
                  {youtubeActive
                    ? 'شغال: بث يوتيوب الرسمي (صوت حمو)'
                    : 'تشغيل بث يوتيوب الرسمي (صوت حمو)'}
                </span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-950/80 text-amber-300">
                {youtubeActive ? 'مفعل' : 'متاح'}
              </span>
            </button>

            {youtubeActive && radioStation === 'hamo_morshedy' && !musicPaused && !muted && (
              <div className="rounded-xl overflow-hidden border border-stone-700 bg-black">
                <iframe
                  data-testid="hamo-youtube-iframe"
                  title={`حمو المرشدي - ${currentTrack.titleAr}`}
                  src={buildHamoYouTubeEmbedUrl(hamoTrackIndex, true)}
                  className="w-full h-36"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-stone-400 px-0.5">
              <span>
                {youtubeActive
                  ? 'بث متواصل تلقائي من القناة الرسمية'
                  : 'إيقاع مهرجانات مدمج بدون إنترنت (شغال على طول)'}
              </span>
              <a
                href={HAMO_MORSHEDY_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold"
              >
                <span>القناة</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Hamo El Morshedy Track List */}
          <div className="p-2.5 space-y-1 max-h-48 overflow-y-auto">
            {HAMO_MORSHEDY_TRACKS.map((track, idx) => {
              const selected =
                radioStation === 'hamo_morshedy' && hamoTrackIndex === idx;
              return (
                <button
                  key={track.id}
                  type="button"
                  tabIndex={-1}
                  data-testid={`hamo-track-${track.id}`}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onSelectTrack(idx);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl border text-right text-xs cursor-pointer transition-colors ${
                    selected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-extrabold'
                      : 'bg-stone-900/75 border-stone-800 text-stone-300 hover:border-stone-600'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Volume2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        selected ? 'text-amber-300' : 'text-stone-500'
                      }`}
                    />
                    <span className="truncate">{track.titleAr}</span>
                  </span>
                  <span className="font-mono-num text-[10px] text-stone-400 shrink-0 mr-2">
                    {track.bpm} BPM
                  </span>
                </button>
              );
            })}
          </div>

          {/* Station Switcher */}
          <div className="px-2.5 pb-2.5 pt-1.5 border-t border-stone-800">
            <div className="text-[10px] font-bold text-stone-400 mb-1.5 flex items-center gap-1">
              <Radio className="w-3 h-3" />
              <span>محطات أخرى:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {STATION_OPTIONS.map((st) => {
                const active = radioStation === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onSelectStation(st.id);
                    }}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-stone-500'
                    }`}
                  >
                    {st.labelAr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Compact Floating Continuous Music Bar */}
      <div
        data-testid="hamo-player-bar"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-500/45 shadow-lg text-xs text-stone-100"
        style={{ backgroundColor: 'rgba(20, 15, 11, 0.94)' }}
      >
        <button
          type="button"
          tabIndex={-1}
          data-testid="hamo-play-toggle"
          onClick={(e) => {
            e.currentTarget.blur();
            onTogglePause();
          }}
          aria-label={isActivelyPlaying ? 'إيقاف الأغنية مؤقتاً' : 'تشغيل أغاني حمو المرشدي'}
          className={`p-1.5 rounded-lg font-extrabold cursor-pointer ${
            isActivelyPlaying
              ? 'bg-amber-400 text-stone-950 hover:bg-amber-300'
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          }`}
        >
          {isActivelyPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          type="button"
          tabIndex={-1}
          data-testid="hamo-prev-btn"
          onClick={(e) => {
            e.currentTarget.blur();
            onPrevTrack();
          }}
          aria-label="المهرجان السابق"
          className="p-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 cursor-pointer"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <div
          data-testid="hamo-current-track"
          className="px-1 max-w-[175px] sm:max-w-[230px] truncate font-bold text-amber-200 flex items-center gap-1.5"
        >
          <Music2
            className={`w-3.5 h-3.5 shrink-0 ${
              isActivelyPlaying ? 'text-emerald-400 animate-pulse' : 'text-stone-500'
            }`}
          />
          <span className="truncate">{stationTitleAr}</span>
        </div>

        <button
          type="button"
          tabIndex={-1}
          data-testid="hamo-next-btn"
          onClick={(e) => {
            e.currentTarget.blur();
            onNextTrack();
          }}
          aria-label="المهرجان التالي"
          className="p-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 cursor-pointer"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          tabIndex={-1}
          data-testid="hamo-expand-btn"
          onClick={(e) => {
            e.currentTarget.blur();
            setExpanded((v) => !v);
          }}
          aria-label="فتح قائمة أغاني حمو المرشدي"
          className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 cursor-pointer"
        >
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};
