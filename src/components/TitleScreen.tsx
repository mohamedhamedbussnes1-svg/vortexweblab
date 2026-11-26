import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  Copy,
  KeyRound,
  Link2,
  Lock,
  LogOut,
  Play,
  RefreshCw,
  ShieldCheck,
  Users,
  Wifi,
  X,
} from 'lucide-react';
import { RoomLobbyInfo } from '../game/multiplayer';
import {
  getResolvedCharacterProfile,
  getStartingMoneyForCharacter,
} from '../game/phoneOs';
import {
  FRIENDS_STORY_CHAPTERS,
  FRIENDS_STORY_SUMMARY_AR,
  FRIENDS_STORY_TITLE_AR,
  PLAYER_CHARACTERS,
} from '../game/rules';
import {
  CustomProfilesMap,
  MultiplayerStatus,
  PlayerCharacterId,
} from '../game/types';
import { CharacterPortrait } from './CharacterPortrait';
import { PWAInstallButton } from './PWAInstallButton';

interface TitleScreenProps {
  day: number;
  money: number;
  reputation: number;
  selectedCharacterId: PlayerCharacterId;
  ownerUnlocked: boolean;
  customProfiles?: CustomProfilesMap;
  multiplayer: MultiplayerStatus;
  initialRoomCode?: string;
  lobbyInfo?: RoomLobbyInfo | null;
  inviteCopied?: boolean;
  onSelectCharacter: (id: PlayerCharacterId) => void;
  onVerifyOwnerPin: (pin: string) => Promise<boolean>;
  onCreateRoom: (characterId: PlayerCharacterId, displayNameAr?: string) => Promise<string | null>;
  onJoinRoom: (roomId: string, characterId: PlayerCharacterId, displayNameAr?: string) => void;
  onLeaveRoom: () => void;
  onRefreshRoom: (roomId: string) => Promise<RoomLobbyInfo | null>;
  onCopyInviteLink: () => void;
  onStart: () => void;
}

const CHARACTER_ORDER: PlayerCharacterId[] = [
  'mohamed',
  'ahmed',
  'ali',
  'mahmoud',
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  day,
  money,
  reputation,
  selectedCharacterId,
  ownerUnlocked,
  customProfiles,
  multiplayer,
  initialRoomCode = '',
  lobbyInfo,
  inviteCopied = false,
  onSelectCharacter,
  onVerifyOwnerPin,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onRefreshRoom,
  onCopyInviteLink,
  onStart,
}) => {
  const [storyOpen, setStoryOpen] = useState(false);
  const [roomInput, setRoomInput] = useState(initialRoomCode);
  const [creatingRoom, setCreatingRoom] = useState(false);

  // Owner PIN Gate state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [startAfterPin, setStartAfterPin] = useState(false);

  useEffect(() => {
    if (initialRoomCode && !roomInput) {
      setRoomInput(initialRoomCode);
    }
  }, [initialRoomCode, roomInput]);

  const activeMembers =
    multiplayer.mode === 'online'
      ? multiplayer.members
      : lobbyInfo?.members ?? [];

  const takenByOther = (id: PlayerCharacterId): boolean => {
    if (multiplayer.mode === 'online' && multiplayer.lockedCharacterId === id) {
      return false;
    }
    return activeMembers.some((m) => m.connected && m.characterId === id);
  };

  // Auto-select first open character if friend joined via invite link and current one is taken
  useEffect(() => {
    if (multiplayer.mode !== 'solo') return;
    if (!takenByOther(selectedCharacterId)) return;
    const firstFree = CHARACTER_ORDER.find((id) => !takenByOther(id));
    if (firstFree) {
      onSelectCharacter(firstFree);
    }
  }, [lobbyInfo, multiplayer.mode, selectedCharacterId, onSelectCharacter]);

  const activeChar = PLAYER_CHARACTERS[selectedCharacterId];
  const activeProfile = getResolvedCharacterProfile(selectedCharacterId, customProfiles);
  const isOnline = multiplayer.mode === 'online';

  const handleCharacterClick = (id: PlayerCharacterId) => {
    onSelectCharacter(id);
    if (id === 'mohamed' && !ownerUnlocked) {
      setStartAfterPin(false);
      setPinError(null);
      setPinValue('');
      setPinModalOpen(true);
    }
  };

  const handleStartClick = () => {
    if (selectedCharacterId === 'mohamed' && !ownerUnlocked) {
      setStartAfterPin(true);
      setPinError(null);
      setPinValue('');
      setPinModalOpen(true);
      return;
    }
    onStart();
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinValue.trim()) {
      setPinError('من فضلك أدخل باسورد المعلم محمد حامد.');
      return;
    }
    setVerifyingPin(true);
    setPinError(null);
    try {
      const ok = await onVerifyOwnerPin(pinValue.trim());
      if (ok) {
        setPinModalOpen(false);
        setPinValue('');
        if (startAfterPin) {
          setStartAfterPin(false);
          onStart();
        }
      } else {
        setPinError('الباسورد غير صحيح — حساب المعلم محمد حامد محمي برقم سري.');
      }
    } finally {
      setVerifyingPin(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-20 flex flex-col justify-between gap-2.5 p-2.5 sm:p-4 md:p-6 overflow-y-auto"
      style={{
        background:
          'linear-gradient(180deg, rgba(16, 12, 9, 0.72) 0%, rgba(16, 12, 9, 0.25) 40%, rgba(14, 11, 8, 0.94) 100%)',
      }}
    >
      {/* Top minimal wordmark, PWA install button & saved summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200/90">
        <div className="flex items-center gap-2">
          <span className="font-mono-num tracking-wider font-bold">ELMOALEM SIMULATOR</span>
          <button
            type="button"
            data-testid="title-story-btn"
            onClick={() => setStoryOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-400/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-[11px] font-bold cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>قصة الـ ٤ أصحاب</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PWAInstallButton compact />
          <span className="font-mono-num">
            اليوم {day} · {Math.round(money).toLocaleString('en-US')} ج.م · السمعة {Math.round(reputation)}%
          </span>
        </div>
      </div>

      {/* Center-Top Wooden & Gold Emblem + Chef Hat + Egyptian Flag */}
      <div className="flex flex-col items-center text-center my-1 sm:my-2">
        <div className="relative inline-flex flex-col items-center">
          <svg
            viewBox="0 0 260 66"
            className="w-40 sm:w-48 md:w-60 h-10 sm:h-12 md:h-14 -mb-2.5 sm:-mb-3 relative z-10"
            aria-hidden="true"
          >
            <g transform="translate(100, 4)">
              <path
                d="M14 34 C4 32, 2 18, 13 13 C17 3, 43 3, 47 13 C58 18, 56 32, 46 34 Z"
                fill="#e2e8f0"
                stroke="#334155"
                strokeWidth="2.5"
              />
              <rect
                x="15"
                y="32"
                width="30"
                height="12"
                rx="3"
                fill="#cbd5e1"
                stroke="#334155"
                strokeWidth="2"
              />
              <line x1="23" y1="15" x2="23" y2="30" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              <line x1="30" y1="12" x2="30" y2="30" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              <line x1="37" y1="15" x2="37" y2="30" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            </g>

            <g transform="translate(182, 6) rotate(-7)">
              <line x1="2" y1="4" x2="2" y2="40" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" />
              <path d="M4 6 Q26 2 48 8 L48 18 Q26 12 4 16 Z" fill="#ce1126" />
              <path d="M4 16 Q26 12 48 18 L48 28 Q26 22 4 26 Z" fill="#ffffff" />
              <path d="M4 26 Q26 22 48 28 L48 38 Q26 32 4 36 Z" fill="#111111" />
              <polygon points="26,18 29,22 26,25 23,22" fill="#c09300" />
            </g>
          </svg>

          <div
            className="px-5 py-2 sm:px-6 sm:py-2.5 md:px-7 md:py-3 rounded-2xl border-4 border-[#3a2010] shadow-2xl"
            style={{
              background:
                'linear-gradient(180deg, #5d361d 0%, #432512 52%, #2e180b 100%)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.65), inset 0 2px 0 rgba(255,215,130,0.25)',
            }}
          >
            <h1
              className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold text-[#f7be2d] leading-snug tracking-tight"
              style={{ textShadow: '0 3px 0 #2b1508, 0 6px 14px rgba(0,0,0,0.65)' }}
            >
              محاكي المعلم
            </h1>
            <div
              className="mt-2 px-4 py-0.5 rounded-lg inline-block border border-[#8a552b]/60"
              style={{ backgroundColor: 'rgba(28, 15, 7, 0.72)' }}
            >
              <span className="font-display text-sm sm:text-base md:text-xl font-extrabold text-amber-100">
                فول وطعمية · ٩٨ شارع · مدرسة بنها الخاصة
              </span>
            </div>
          </div>

          <p
            className="mt-1.5 text-[11px] sm:text-xs md:text-sm font-extrabold text-[#fbd35a]"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >
            المعلم محمد حامد (٥ مليون ج.م) · نصف نقل ٤+٤ · موتوسيكل دليفري · إنستا باي · كلام مع الكل!
          </p>
        </div>
      </div>

      {/* Bottom 4-Player Co-op Lobby + Online Invite Deck */}
      <div className="w-full max-w-5xl mx-auto">
        <div
          className="rounded-2xl border border-amber-500/35 p-3 md:p-4 shadow-2xl space-y-2.5 sm:space-y-3"
          style={{ backgroundColor: 'rgba(18, 15, 13, 0.93)' }}
        >
          {/* Online Multiplayer Room Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-2.5 rounded-xl border border-stone-800 bg-stone-900/85">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
              <Wifi className={`w-4 h-4 ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>
                {isOnline
                  ? `غرفة أونلاين نشطة: ${multiplayer.roomId} (${activeMembers.length}/٤ متصلين)`
                  : 'اللعب أونلاين برابط دعوة للأصحاب (حتى ٤ لاعبين · مزامنة أنيميشن وحوارات)'}
              </span>
            </div>

            {!isOnline ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="create-room-btn"
                  disabled={creatingRoom}
                  onClick={async () => {
                    setCreatingRoom(true);
                    try {
                      const created = await onCreateRoom(selectedCharacterId);
                      if (created) setRoomInput(created);
                    } finally {
                      setCreatingRoom(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-xs cursor-pointer disabled:opacity-60"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{creatingRoom ? 'جاري الإنشاء...' : 'إنشاء غرفة + رابط دعوة'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    data-testid="room-code-input"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                    placeholder="كود الغرفة"
                    dir="ltr"
                    maxLength={10}
                    className="w-24 px-2 py-1.5 rounded-lg border border-stone-700 bg-stone-950 text-amber-200 text-xs font-mono-num font-bold text-center focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    data-testid="join-room-btn"
                    onClick={() => onJoinRoom(roomInput, selectedCharacterId)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs cursor-pointer"
                  >
                    انضمام
                  </button>
                  {roomInput.trim().length >= 4 && (
                    <button
                      type="button"
                      onClick={() => onRefreshRoom(roomInput)}
                      aria-label="تحديث حالة الغرفة"
                      className="p-1.5 rounded-lg border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-300 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="copy-invite-link-btn"
                  onClick={onCopyInviteLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{inviteCopied ? 'تم نسخ رابط الدعوة ✓' : 'نسخ رابط الدعوة للأصحاب'}</span>
                </button>
                <button
                  type="button"
                  data-testid="leave-room-btn"
                  onClick={onLeaveRoom}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>فصل</span>
                </button>
              </div>
            )}
          </div>

          {multiplayer.errorAr && (
            <div
              data-testid="room-error-banner"
              className="px-3 py-1.5 rounded-lg border border-rose-500/45 bg-rose-500/15 text-rose-200 text-xs font-bold"
            >
              {multiplayer.errorAr}
            </div>
          )}

          {/* Header & Fixed Role Note */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-200 font-display font-bold text-xs sm:text-sm">
              <Users className="w-4 h-4 text-amber-400" />
              <span>طاقم الـ ٤ أصحاب — المعلم محمد حامد ثابت ومؤمن بباسورد</span>
            </div>
            <span className="text-[11px] text-emerald-300 font-bold">
              وظيفة {activeProfile.nameAr}: {activeChar.fixedDutyAr}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            {/* 4 Selectable Character Portrait Cards */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CHARACTER_ORDER.map((id) => {
                const char = PLAYER_CHARACTERS[id];
                const resolved = getResolvedCharacterProfile(id, customProfiles);
                const isSelected = selectedCharacterId === id;
                const taken = takenByOther(id);
                const lockedSelf = isOnline && multiplayer.lockedCharacterId === id;
                const disabled = taken || (isOnline && !lockedSelf);
                const startMoney = getStartingMoneyForCharacter(id);
                const isOwnerCard = id === 'mohamed';
                return (
                  <button
                    key={id}
                    type="button"
                    data-character={id}
                    aria-pressed={isSelected}
                    disabled={disabled}
                    onClick={() => handleCharacterClick(id)}
                    className={`group flex flex-col items-center rounded-xl border-2 p-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-950/50'
                        : 'border-stone-700/80 bg-stone-900/75 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="relative w-full aspect-[4/3.2] sm:aspect-[4/4.1] rounded-lg overflow-hidden bg-stone-800">
                      <CharacterPortrait
                        characterId={id}
                        className="w-full h-full object-cover"
                      />
                      {isOwnerCard && (
                        <div
                          className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 ${
                            ownerUnlocked
                              ? 'bg-emerald-500 text-stone-950'
                              : 'bg-amber-400 text-stone-950'
                          }`}
                        >
                          {ownerUnlocked ? (
                            <>
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>مفتوح</span>
                            </>
                          ) : (
                            <>
                              <KeyRound className="w-2.5 h-2.5" />
                              <span>باسورد</span>
                            </>
                          )}
                        </div>
                      )}
                      {taken && (
                        <div
                          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1"
                        >
                          <Lock className="w-2.5 h-2.5" />
                          <span>محجوز</span>
                        </div>
                      )}
                      <div
                        className="absolute inset-x-0 bottom-0 py-1 px-1 text-center font-display text-xs font-extrabold text-white"
                        style={{
                          background:
                            'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(14,11,8,0.92) 45%)',
                        }}
                      >
                        {resolved.nameAr}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-1 text-[10px] md:text-[11px] font-bold leading-tight text-center">
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500 text-stone-950'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      </span>
                      <span className={isSelected ? 'text-amber-300' : 'text-stone-400'}>
                        {resolved.roleTitleAr}
                      </span>
                    </div>
                    <div
                      className={`mt-0.5 font-mono-num text-[10px] font-extrabold ${
                        isOwnerCard ? 'text-emerald-400' : 'text-stone-400'
                      }`}
                    >
                      {startMoney.toLocaleString('en-US')} ج.م بداية
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Map Preview + Start Game CTA */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-2.5 rounded-xl border border-stone-800 bg-stone-900/80 p-3">
              <div className="flex items-center gap-3">
                <svg
                  viewBox="0 0 120 72"
                  className="w-24 h-14 rounded-lg border border-amber-500/30 shrink-0"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="hara-thumb-sky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6ea8d6" />
                      <stop offset="65%" stopColor="#f2b872" />
                      <stop offset="100%" stopColor="#3b342e" />
                    </linearGradient>
                  </defs>
                  <rect width="120" height="72" fill="url(#hara-thumb-sky)" />
                  <rect x="0" y="48" width="120" height="24" fill="#2b2b2e" />
                  <polygon points="38,72 52,48 68,48 82,72" fill="#3a3a40" />
                  <rect x="8" y="20" width="34" height="32" fill="#d9c2a3" />
                  <rect x="6" y="34" width="38" height="7" fill="#c02828" />
                  <rect x="78" y="16" width="36" height="36" fill="#c8b090" />
                  <rect x="52" y="10" width="8" height="38" fill="#dfd2bc" />
                  <polygon points="51,10 56,2 61,10" fill="#c29b48" />
                  <rect x="46" y="49" width="10" height="8" rx="2" fill="#1e1e22" />
                  <rect x="72" y="54" width="16" height="9" rx="2" fill="#b81d24" />
                </svg>

                <div className="text-right min-w-0">
                  <div className="font-display font-extrabold text-sm text-amber-100">
                    حارة المعلم والـ ٩٨ شارع
                  </div>
                  <div className="font-mono-num text-[11px] text-emerald-400 font-bold mt-0.5">
                    {isOnline
                      ? `${activeMembers.length}/4 متصل أونلاين`
                      : '١٥ محل مفتوح · شقة دور ٢ · مدرسة بنها'}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5 truncate">
                    {activeProfile.nameAr} · {activeProfile.roleTitleAr}
                  </div>
                </div>
              </div>

              {selectedCharacterId === 'mohamed' && !ownerUnlocked && (
                <button
                  type="button"
                  data-testid="open-owner-pin-btn"
                  onClick={() => {
                    setStartAfterPin(false);
                    setPinError(null);
                    setPinModalOpen(true);
                  }}
                  className="w-full py-1.5 rounded-lg border border-amber-400/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>تفعيل حساب المعلم محمد بالباسورد</span>
                </button>
              )}

              <button
                type="button"
                data-start="true"
                onClick={(e) => {
                  e.currentTarget.blur();
                  handleStartClick();
                }}
                className="w-full py-2.5 rounded-xl bg-[#f5b400] hover:bg-[#ffca2c] active:scale-[0.98] text-stone-950 font-display font-extrabold text-base md:text-lg flex items-center justify-center gap-2 transition-transform cursor-pointer shadow-lg shadow-amber-950/50"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>
                  {selectedCharacterId === 'mohamed' && !ownerUnlocked
                    ? 'إدخال باسورد المعلم والدخول'
                    : isOnline
                      ? 'نزول للحارة مع أصحابك'
                      : 'بدء اللعبة'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-1.5 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center text-[11px] text-stone-300/85 font-medium">
          <span>
            WASD تحرك · الماوس نظر · E تفاعل وكلام · F ركوب السيارة · M الموبايل · K الكاشير · Tab الإدارة (محمد فقط) · Esc إيقاف
          </span>
          <span className="px-2 py-0.5 rounded-full border border-cyan-500/35 bg-cyan-950/50 text-cyan-300 font-extrabold text-[10px]">
            تطوير VORTEXweblab
          </span>
        </div>
      </div>

      {/* Owner PIN Modal for Mohamed Hamed */}
      {pinModalOpen && (
        <div
          data-testid="owner-pin-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto"
          style={{ backgroundColor: 'rgba(10, 8, 6, 0.86)' }}
        >
          <form
            onSubmit={handlePinSubmit}
            className="w-full max-w-sm rounded-2xl border-2 border-amber-500/55 p-5 text-stone-100 shadow-2xl space-y-4"
            style={{ backgroundColor: '#1b1510' }}
          >
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
              <div className="flex items-center gap-2 font-display font-extrabold text-base text-amber-300">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <span>دخول المعلم محمد حامد</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPinModalOpen(false);
                  setStartAfterPin(false);
                }}
                aria-label="إغلاق نافذة الباسورد"
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              حساب <span className="text-amber-300 font-bold">المعلم محمد حامد</span> (صاحب المحل برأس مال <span className="text-emerald-400 font-mono-num font-bold">5,000,000 ج.م</span> وبصلاحية إنستا باي وقفل النصف نقل والعقارات) محمي برقم سري.
            </p>

            <div>
              <label
                htmlFor="owner-pin-field"
                className="block text-xs font-bold text-amber-200 mb-1.5"
              >
                أدخل باسورد المعلم:
              </label>
              <input
                id="owner-pin-field"
                data-testid="owner-pin-input"
                type="password"
                inputMode="numeric"
                autoFocus
                dir="ltr"
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/45 bg-stone-950 text-amber-200 font-mono-num text-base font-extrabold text-center tracking-widest focus:outline-none focus:border-amber-400"
              />
            </div>

            {pinError && (
              <div
                data-testid="owner-pin-error"
                className="p-2.5 rounded-xl border border-rose-500/45 bg-rose-500/15 text-rose-200 text-xs font-bold"
              >
                {pinError}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                data-testid="owner-pin-submit"
                disabled={verifyingPin}
                className="flex-1 py-2.5 rounded-xl bg-[#f5b400] hover:bg-[#ffca2c] disabled:opacity-60 text-stone-950 font-display font-extrabold text-sm cursor-pointer"
              >
                {verifyingPin ? 'جاري التحقق...' : 'تأكيد وفتح حساب المعلم'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPinModalOpen(false);
                  onSelectCharacter('ahmed');
                }}
                className="px-3 py-2.5 rounded-xl border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-bold cursor-pointer"
              >
                العب بأحمد
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4 Friends Story Modal */}
      {storyOpen && (
        <div
          data-testid="friends-story-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto"
          style={{ backgroundColor: 'rgba(10, 8, 6, 0.85)' }}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-amber-500/45 p-5 text-stone-100 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            style={{ backgroundColor: '#1b1510' }}
          >
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
              <div className="flex items-center gap-2 font-display font-extrabold text-lg text-amber-300">
                <BookOpen className="w-5 h-5" />
                <span>{FRIENDS_STORY_TITLE_AR}</span>
              </div>
              <button
                type="button"
                onClick={() => setStoryOpen(false)}
                aria-label="إغلاق القصة"
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed bg-stone-900/80 p-3.5 rounded-xl border border-stone-800">
              {FRIENDS_STORY_SUMMARY_AR}
            </p>

            <div className="space-y-2.5">
              {FRIENDS_STORY_CHAPTERS.map((ch) => (
                <div
                  key={ch.titleAr}
                  className="p-3 rounded-xl border border-stone-800 bg-stone-900/55"
                >
                  <div className="font-display font-bold text-sm text-amber-300">
                    {ch.titleAr}
                  </div>
                  <div className="text-xs text-stone-300 mt-1 leading-relaxed">
                    {ch.bodyAr}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CHARACTER_ORDER.map((id) => {
                const c = PLAYER_CHARACTERS[id];
                const resolved = getResolvedCharacterProfile(id, customProfiles);
                return (
                  <div
                    key={id}
                    className="p-2.5 rounded-xl border border-stone-800 bg-stone-900/70 text-xs"
                  >
                    <div className="font-bold text-amber-200">
                      {resolved.nameAr} · {resolved.roleTitleAr}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">{c.storyBioAr}</div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setStoryOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#f5b400] hover:bg-[#ffca2c] text-stone-950 font-display font-extrabold text-sm cursor-pointer"
            >
              يلا بينا على الحارة!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
