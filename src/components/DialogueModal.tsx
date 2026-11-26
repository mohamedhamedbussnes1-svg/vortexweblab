import React, { useState } from 'react';
import {
  Car,
  HandHeart,
  Heart,
  MessageCircle,
  Send,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react';
import { ActiveDialogueSession, DialogueChoice } from '../game/types';

interface DialogueModalProps {
  session: ActiveDialogueSession;
  money: number;
  onSelectChoice: (choiceId: string) => void;
  onSendKeyboardMessage: (text: string) => void;
  onToggleAccompany: (holdHand?: boolean) => void;
  onBoardCarWithCompanions: () => void;
  onClose: () => void;
}

const TONE_BADGES: Record<DialogueChoice['tone'], { label: string; cls: string }> = {
  flirt_sweet: { label: 'غزل لطيف', cls: 'bg-pink-500/20 text-pink-300 border-pink-400/35' },
  flirt_bold: { label: 'معاكسة جريئة', cls: 'bg-rose-500/20 text-rose-300 border-rose-400/35' },
  joke: { label: 'هزار', cls: 'bg-amber-500/20 text-amber-300 border-amber-400/35' },
  respectful: { label: 'كلام محترم', cls: 'bg-sky-500/20 text-sky-300 border-sky-400/35' },
  gift: { label: 'هدية / عزومة', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35' },
  propose: { label: 'طلب جواز ❤️', cls: 'bg-rose-500 text-white border-rose-300' },
  family: { label: 'العائلة', cls: 'bg-emerald-500 text-stone-950 border-emerald-300' },
  ride: { label: 'فسحة الكورنيش 🚗', cls: 'bg-sky-500/20 text-sky-300 border-sky-400/35' },
  praise: { label: 'مدح للمحل 🌟', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/45' },
  complaint: { label: 'شكوى للسمعة 📢', cls: 'bg-rose-500/20 text-rose-300 border-rose-400/45' },
  hospitality: { label: 'ضيافة وتقدير ☕', cls: 'bg-amber-500/20 text-amber-300 border-amber-400/45' },
  leave: { label: 'انصراف', cls: 'bg-stone-800 text-stone-300 border-stone-700' },
};

export const DialogueModal: React.FC<DialogueModalProps> = ({
  session,
  money,
  onSelectChoice,
  onSendKeyboardMessage,
  onToggleAccompany,
  onBoardCarWithCompanions,
  onClose,
}) => {
  const [chatText, setChatText] = useState('');
  const isRomance = session.targetType === 'romance' || session.targetType === 'spouse';
  const isWorldObject = session.targetType === 'world_object';
  const affection = session.affection ?? 0;

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = chatText.trim();
    if (!cleaned) return;
    onSendKeyboardMessage(cleaned);
    setChatText('');
  };

  return (
    <div
      data-testid="dialogue-modal"
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 pointer-events-auto"
      style={{ backgroundColor: 'rgba(10, 8, 6, 0.72)' }}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-amber-500/45 text-stone-100 shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#1b1510' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-stone-800"
          style={{ backgroundColor: '#241c15' }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isRomance
                  ? 'bg-pink-500/15 border-pink-400/40 text-pink-300'
                  : 'bg-amber-500/15 border-amber-400/40 text-amber-300'
              }`}
            >
              {isRomance ? (
                <Heart className="w-5 h-5 fill-pink-400/40" />
              ) : (
                <MessageCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-amber-200 leading-tight">
                {session.speakerNameAr}
              </h3>
              <div className="text-xs text-stone-400 mt-0.5">{session.speakerRoleAr}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق المحادثة"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
          >
            <span>[Esc] إغلاق</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 max-h-[78vh] overflow-y-auto">
          {/* Affection Meter for Romance & Spouse */}
          {session.affection !== undefined && (
            <div
              className="p-3 rounded-xl border border-pink-500/30 space-y-1.5"
              style={{ backgroundColor: '#25171d' }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-pink-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>مستوى القبول والمودة</span>
                </span>
                <span
                  data-testid="dialogue-affection-pct"
                  className="font-mono-num font-extrabold text-pink-300"
                >
                  {Math.round(affection)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-900 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    affection >= 70
                      ? 'bg-emerald-400'
                      : affection >= 40
                        ? 'bg-pink-400'
                        : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, affection))}%` }}
                />
              </div>
              {!session.married && (
                <div className="text-[11px] text-stone-300">
                  {session.canPropose
                    ? 'جاهزة للجواز! تقدر تطلب إيدها الآن من الاختيارات بالأسفل ❤️'
                    : 'مطلوب شقة تمليك + مودة ٧٠٪ للجواز (تقدر تشتري الشقة من لوحة الإدارة [Tab])'}
                </div>
              )}
            </div>
          )}

          {/* Customer Expression & Service Quality Meter */}
          {session.targetType === 'customer' && session.serviceQualityScore !== undefined && (
            <div
              data-testid="dialogue-customer-quality"
              className="p-3 rounded-xl border border-amber-500/35 space-y-2"
              style={{
                backgroundColor:
                  session.moodTone === 'happy'
                    ? '#16241a'
                    : session.moodTone === 'upset'
                      ? '#281518'
                      : '#241d15',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    data-testid="dialogue-customer-emoji"
                    className="text-2xl leading-none"
                    aria-hidden="true"
                  >
                    {session.customerEmoji ?? '🙂'}
                  </span>
                  <div>
                    <div className="text-xs font-extrabold text-amber-100">
                      حالة الزبون: {session.serviceQualityLabelAr}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      تقييم جودة الخدمة يؤثر مباشرة على سمعة المحل
                    </div>
                  </div>
                </div>
                <span
                  data-testid="dialogue-service-score"
                  className="font-mono-num text-sm font-extrabold text-amber-300"
                >
                  {Math.round(session.serviceQualityScore)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-900 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    session.serviceQualityScore >= 70
                      ? 'bg-emerald-400'
                      : session.serviceQualityScore >= 45
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                  }`}
                  style={{
                    width: `${Math.max(0, Math.min(100, session.serviceQualityScore))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Accompany / Hold Hand / Board Car Actions for Any Person */}
          {!isWorldObject && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="dialogue-accompany-btn"
                onClick={() => onToggleAccompany(false)}
                className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer ${
                  session.isAccompanying && !session.isHoldingHand
                    ? 'bg-emerald-500 text-stone-950 border-emerald-400'
                    : 'bg-stone-800 hover:bg-stone-700 text-amber-200 border-amber-500/35'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>
                  {session.isAccompanying ? 'إنهاء المرافقة' : 'اصطحبه معي 🚶'}
                </span>
              </button>

              <button
                type="button"
                data-testid="dialogue-hold-hand-btn"
                onClick={() => onToggleAccompany(true)}
                className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer ${
                  session.isHoldingHand
                    ? 'bg-pink-500 text-white border-pink-300'
                    : 'bg-pink-500/15 hover:bg-pink-500/25 text-pink-200 border-pink-400/40'
                }`}
              >
                <HandHeart className="w-3.5 h-3.5" />
                <span>{session.isHoldingHand ? 'سيب إيدي' : 'امسك إيدي 🤝'}</span>
              </button>

              <button
                type="button"
                data-testid="dialogue-board-car-btn"
                onClick={onBoardCarWithCompanions}
                className="flex-1 min-w-[150px] py-2 px-3 rounded-xl border border-sky-400/45 bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Car className="w-3.5 h-3.5" />
                <span>اركب العربية معي (٤+٤)</span>
              </button>
            </div>
          )}

          {/* NPC / Object Latest Speech Bubble */}
          <div
            data-testid="dialogue-npc-line"
            className="p-4 rounded-2xl border border-amber-400/30 text-sm sm:text-base leading-relaxed text-amber-50 font-semibold"
            style={{ backgroundColor: '#261e17' }}
          >
            <span className="text-amber-400 font-extrabold">{session.speakerNameAr}: </span>
            &ldquo;{session.npcLineAr}&rdquo;
          </div>

          {/* Interactive Keyboard Chat Log */}
          {session.chatLog && session.chatLog.length > 0 && (
            <div
              data-testid="dialogue-chat-log"
              className="p-3 rounded-xl border border-stone-800 space-y-2 max-h-36 overflow-y-auto"
              style={{ backgroundColor: '#15110d' }}
            >
              {session.chatLog.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col text-xs ${
                    msg.isPlayer ? 'items-start' : 'items-end'
                  }`}
                >
                  <div
                    className={`px-3 py-1.5 rounded-xl max-w-[88%] leading-snug ${
                      msg.isPlayer
                        ? 'bg-amber-500/20 border border-amber-400/40 text-amber-100'
                        : 'bg-emerald-500/15 border border-emerald-400/35 text-emerald-100'
                    }`}
                  >
                    <span className="font-extrabold text-[10px] opacity-80 block">
                      {msg.senderAr} · {msg.clockStr}
                    </span>
                    <span>{msg.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Free-Text Keyboard Conversation Input */}
          <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
            <input
              type="text"
              data-testid="dialogue-chat-input"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              maxLength={140}
              placeholder={`اكتب كلامك بالكيبورد لـ ${session.speakerNameAr}...`}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-amber-500/40 bg-stone-950 text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              data-testid="dialogue-chat-send"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال</span>
            </button>
          </form>

          {/* Player Dialogue Choices */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400 font-bold">
              <span>اختيارات سريعة:</span>
              <span className="font-mono-num text-emerald-400">
                رصيدك: {Math.round(money).toLocaleString('en-US')} ج.م
              </span>
            </div>

            {session.choices.map((choice) => {
              const cannotAfford = Boolean(choice.cost && money < choice.cost);
              const waitingForChild =
                choice.id === 'have-child' && session.canHaveChild === false;
              const disabled = cannotAfford || waitingForChild;
              const badge = TONE_BADGES[choice.tone];
              return (
                <button
                  key={choice.id}
                  type="button"
                  data-testid={`dialogue-choice-${choice.id}`}
                  disabled={disabled}
                  onClick={() => onSelectChoice(choice.id)}
                  className="w-full p-3 rounded-xl border border-stone-700/80 hover:border-amber-400/70 hover:bg-stone-800/85 disabled:opacity-45 disabled:hover:border-stone-700/80 disabled:cursor-not-allowed text-right transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  style={{ backgroundColor: '#221a14' }}
                >
                  <span className="text-xs sm:text-sm font-bold text-stone-100 leading-snug">
                    {choice.labelAr}
                    {waitingForChild && session.childWaitRemainingSec
                      ? ` (باقي ${session.childWaitRemainingSec}ث أو عدي يوم)`
                      : ''}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {choice.cost !== undefined && (
                      <span
                        className={`font-mono-num text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                          cannotAfford
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {choice.cost} ج.م
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
