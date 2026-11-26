import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bike,
  Building2,
  Calculator,
  Calendar,
  Camera,
  CheckCircle2,
  Cloud,
  CloudRain,
  Coffee,
  Copy,
  Croissant,
  Flame,
  Heart,
  Home,
  Lightbulb,
  Lock,
  MapPin,
  MessageSquare,
  Moon,
  Pause,
  Phone,
  Radio,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Star,
  Store,
  Sun,
  UserCheck,
  Volume2,
  VolumeX,
  Wifi,
  Wrench,
  X,
} from 'lucide-react';
import { CITY_SHOPS } from '../game/cityLayout';
import { computeDiscountedGoodCost } from '../game/events';
import { EGYPTIAN_SEASONS } from '../game/expansionSystems';
import {
  CAREER_JOBS,
  CREW_ROLES,
  formatGameClock,
  getDayPeriodArabic,
  getLowStockIngredients,
  INGREDIENTS,
  matchesOrder,
  PLAYER_CHARACTERS,
  RECIPES,
  VEHICLE_CATALOG,
} from '../game/rules';
import {
  getResolvedCharacterProfile,
} from '../game/phoneOs';
import { HudSnapshot, RadioStationId } from '../game/types';
import { CashierModalTab } from './CashierPosModal';
import { CharacterPortrait } from './CharacterPortrait';
import { DialogueModal } from './DialogueModal';
import { HamoMusicPlayer } from './HamoMusicPlayer';
import { Minimap } from './Minimap';
import { Speedometer } from './Speedometer';

const RADIO_LABELS: Record<RadioStationId, string> = {
  hamo_morshedy: 'حمو المرشدي 🎵',
  shaabi: 'شعبي',
  cairo_fm: 'القاهرة FM',
  oud: 'طرب العود',
  off: 'الراديو: أوف',
};

interface GameHudProps {
  hud: HudSnapshot;
  muted: boolean;
  inviteCopied?: boolean;
  touchControlsEnabled: boolean;
  onCopyInviteLink?: () => void;
  onToggleMute: () => void;
  onToggleTouchControls: () => void;
  onPause: () => void;
  onOpenCashier: (initialTab?: CashierModalTab) => void;
  onOpenManagement: () => void;
  onOpenPhone: () => void;
  onOpenDeliveryPhone?: () => void;
  onSendCoopChat: (text: string) => void;
  onCycleCamera: () => void;
  onInteract: () => void;
  onToggleCar: () => void;
  onToggleHeadlights: () => void;
  onCycleRadio: () => void;
  onToggleMusicPause: () => void;
  onNextHamoTrack: () => void;
  onPrevHamoTrack: () => void;
  onSelectHamoTrack: (index: number) => void;
  onSelectRadioStation: (station: RadioStationId) => void;
  onToggleYoutubeStream: (active: boolean) => void;
  onToggleBlinker: (side: 'left' | 'right') => void;
  onEatFood: () => void;
  onDrinkWater: () => void;
  onCloseShopOwner: () => void;
  onBuyFromShopOwner: (shopId: string, goodId: string) => void;
  onBuyCityShop: (shopId: string) => void;
  onHireShopManager: (shopId: string) => void;
  onSelectDialogueChoice: (choiceId: string) => void;
  onSendDialogueKeyboardMessage: (text: string) => void;
  onToggleAccompany: (holdHand?: boolean) => void;
  onBoardCarWithCompanions: () => void;
  onCloseDialogue: () => void;
  onMobileMove: (x: number, y: number) => void;
  onTouchLookDelta: (dx: number, dy: number) => void;
  onMobileSprint: (active: boolean) => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  hud,
  muted,
  inviteCopied = false,
  touchControlsEnabled,
  onCopyInviteLink,
  onToggleMute,
  onToggleTouchControls,
  onPause,
  onOpenCashier,
  onOpenManagement,
  onOpenPhone,
  onOpenDeliveryPhone,
  onSendCoopChat,
  onCycleCamera,
  onInteract,
  onToggleCar,
  onToggleHeadlights,
  onCycleRadio,
  onToggleMusicPause,
  onNextHamoTrack,
  onPrevHamoTrack,
  onSelectHamoTrack,
  onSelectRadioStation,
  onToggleYoutubeStream,
  onToggleBlinker,
  onEatFood,
  onDrinkWater,
  onCloseShopOwner,
  onBuyFromShopOwner,
  onBuyCityShop,
  onHireShopManager,
  onSelectDialogueChoice,
  onSendDialogueKeyboardMessage,
  onToggleAccompany,
  onBoardCarWithCompanions,
  onCloseDialogue,
  onMobileMove,
  onTouchLookDelta,
  onMobileSprint,
}) => {
  const lowStock = getLowStockIngredients(hud.inventory);
  const openInquiriesCount = hud.customerInquiries.filter((q) => !q.answered).length;
  const activeKdsCount = hud.kitchenTickets.filter((t) => t.status !== 'served').length;
  const pendingRefundCount = hud.cashierReceipts.filter(
    (r) => r.refundStatus === 'pending',
  ).length;
  const cashierAlertCount = openInquiriesCount + pendingRefundCount;
  const lookTouchRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const joyRef = useRef<HTMLDivElement | null>(null);

  const handleJoystickPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joyRef.current) return;
    const rect = joyRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.4;
    const dx = Math.max(-maxR, Math.min(maxR, e.clientX - cx));
    const dy = Math.max(-maxR, Math.min(maxR, e.clientY - cy));
    onMobileMove(dx / maxR, dy / maxR);
  };

  const WeatherIcon =
    hud.weather === 'rainy'
      ? CloudRain
      : hud.weather === 'cloudy'
        ? Cloud
        : hud.dayPeriod === 'night' || hud.dayPeriod === 'evening'
          ? Moon
          : Sun;

  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState('');
  const activeSeason = EGYPTIAN_SEASONS[hud.activeSeasonId] ?? EGYPTIAN_SEASONS.normal;

  const activeProfile = getResolvedCharacterProfile(
    hud.selectedCharacterId,
    hud.customProfiles,
  );
  const activeDelivery = hud.orders.find((o) => o.isDelivery);

  const activeShopDef = hud.activeShopOwnerId
    ? CITY_SHOPS.find((s) => s.id === hud.activeShopOwnerId) ?? null
    : null;
  const activeShopRuntime = activeShopDef
    ? hud.cityShops.find((s) => s.id === activeShopDef.id)
    : undefined;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none select-none overflow-hidden">
      {/* Top Perimeter Bar */}
      <div className="flex items-start justify-between gap-2 sm:gap-3 p-2 sm:p-3 md:p-4">
        {/* Top-Right (RTL Start): Player Portrait + Economy + Clock + Reputation */}
        <div className="flex flex-col items-start gap-1.5 sm:gap-2 pointer-events-auto min-w-0">
          <div
            className="flex flex-wrap items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl border border-amber-500/30 shadow-lg"
            style={{ backgroundColor: 'rgba(20, 16, 13, 0.9)' }}
          >
            {/* Avatar + Name + Balance */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-amber-400/50 shrink-0 bg-stone-800">
                <CharacterPortrait
                  characterId={hud.selectedCharacterId}
                  className="w-full h-full"
                />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs font-extrabold text-amber-100 leading-tight">
                  {activeProfile.nameAr}
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    data-testid="hud-money"
                    className="font-mono-num text-sm sm:text-lg font-extrabold text-emerald-400 leading-none"
                  >
                    {Math.round(hud.money).toLocaleString('en-US')}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-amber-300">ج.م</span>
                </div>
              </div>
            </div>

            <span className="text-stone-700 hidden sm:inline" aria-hidden="true">
              |
            </span>

            {/* Clock & Day */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-stone-100">
              <WeatherIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              <div className="leading-tight">
                <div className="font-mono-num font-bold">
                  {formatGameClock(hud.timeOfDay)}
                </div>
                <div className="hidden sm:block text-[11px] text-stone-400">
                  اليوم {hud.day} ({getDayPeriodArabic(hud.dayPeriod)})
                </div>
              </div>
            </div>

            <span className="text-stone-700 hidden sm:inline" aria-hidden="true">
              |
            </span>

            {/* Reputation */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />
              <div className="leading-tight">
                <div className="hidden sm:block text-[10px] text-stone-400">سمعة</div>
                <span
                  data-testid="hud-reputation"
                  className="font-mono-num text-xs sm:text-sm font-extrabold text-amber-300"
                >
                  {Math.round(hud.reputation)}%
                </span>
              </div>
            </div>

            <span className="text-stone-700 hidden sm:inline" aria-hidden="true">
              |
            </span>

            {/* Shop Open/Closed */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <Store className="w-3.5 h-3.5 text-amber-300" />
              <span
                data-testid="hud-shop-status"
                className={
                  hud.shopOpen
                    ? 'text-emerald-400 font-bold'
                    : 'text-rose-400 font-bold'
                }
              >
                {hud.shopOpen ? 'المحل مفتوح' : 'المحل مغلق'}
              </span>
            </div>
          </div>

          {/* Universal Hunger & Thirst Bars + Quick Eat/Drink */}
          <div
            className="inline-flex flex-wrap items-center gap-2 px-2.5 py-1 rounded-xl border border-stone-700/80 text-[11px] shadow"
            style={{ backgroundColor: 'rgba(20, 16, 13, 0.9)' }}
          >
            <div className="flex items-center gap-1.5" data-testid="hud-hunger">
              <span className="text-amber-300 font-bold">🥙 شبع</span>
              <span className="font-mono-num font-extrabold text-amber-100">
                {Math.round(hud.playerNeeds.hunger)}%
              </span>
              <button
                type="button"
                tabIndex={-1}
                data-testid="hud-eat-btn"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onEatFood();
                }}
                className="px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-[10px] cursor-pointer"
              >
                أكل
              </button>
            </div>
            <span className="text-stone-700">|</span>
            <div className="flex items-center gap-1.5" data-testid="hud-thirst">
              <span className="text-sky-300 font-bold">🥤 ماء</span>
              <span className="font-mono-num font-extrabold text-sky-100">
                {Math.round(hud.playerNeeds.thirst)}%
              </span>
              <button
                type="button"
                tabIndex={-1}
                data-testid="hud-drink-btn"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onDrinkWater();
                }}
                className="px-1.5 py-0.5 rounded bg-sky-400 hover:bg-sky-300 text-stone-950 font-extrabold text-[10px] cursor-pointer"
              >
                شرب
              </button>
            </div>
            <span className="text-stone-700">|</span>
            <div
              data-testid="hud-season-pill"
              className="flex items-center gap-1 text-[11px] font-bold"
              style={{ color: activeSeason.badgeColorHex }}
            >
              <Calendar className="w-3 h-3 shrink-0" />
              <span>{activeSeason.nameAr}</span>
            </div>
            <span className="text-stone-700">|</span>
            <div
              data-testid="hud-hygiene-pill"
              className={`flex items-center gap-1 text-[11px] font-bold ${
                hud.hygieneScore >= 75 ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span className="font-mono-num">
                نظافة {Math.round(hud.hygieneScore)}%{hud.qualityBadgeEarned ? ' 🏆' : ''}
              </span>
            </div>
          </div>

          {hud.activeDeliveryOrder && (
            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-delivery-banner"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenDeliveryPhone?.();
              }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-xl border border-orange-400/65 text-[11px] font-extrabold text-orange-100 shadow cursor-pointer"
              style={{ backgroundColor: 'rgba(38, 20, 8, 0.94)' }}
            >
              <Bike className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>
                دليفري: {hud.activeDeliveryOrder.streetNameAr} · {Math.ceil(hud.activeDeliveryOrder.remainingSec)}ث
              </span>
            </button>
          )}

          {/* Street / District / Job Location Strip */}
          <div
            data-testid="hud-location-bar"
            className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-amber-500/20 text-[11px] sm:text-xs text-stone-100 shadow max-w-[205px] sm:max-w-none"
            style={{ backgroundColor: 'rgba(20, 16, 13, 0.88)' }}
          >
            {hud.playerZoneAr !== hud.currentStreetAr && (
              <>
                <span className="font-bold text-stone-100">{hud.playerZoneAr}</span>
                <span aria-hidden="true" className="text-stone-600">
                  ·
                </span>
              </>
            )}
            <span className="text-amber-200 font-semibold truncate">
              {hud.currentStreetAr}
            </span>
            <span aria-hidden="true" className="text-stone-600 hidden sm:inline">
              ·
            </span>
            <span className="text-stone-400 hidden sm:inline">
              {hud.currentDistrictAr}
            </span>
            <span aria-hidden="true" className="text-stone-600 hidden sm:inline">
              ·
            </span>
            <span className="text-amber-300 font-bold hidden sm:inline">
              {CAREER_JOBS[hud.activeJob].titleAr}
            </span>
            <span aria-hidden="true" className="text-stone-600 hidden md:inline">
              ·
            </span>
            <span className="text-stone-300 hidden md:inline-flex items-center gap-1">
              {hud.roleLocked && <Lock className="w-3 h-3 text-amber-400" />}
              <span>{CREW_ROLES[hud.activeRole].titleAr}</span>
            </span>
            <span aria-hidden="true" className="text-stone-600 hidden sm:inline">
              ·
            </span>
            <span
              data-testid="hud-life-stage"
              className="text-pink-300 font-bold hidden sm:inline"
            >
              {hud.spouseNameAr
                ? `${hud.spouseNameAr}${hud.children.length > 0 ? ` (${hud.children.length} أولاد)` : ''}`
                : hud.lifeStageLabelAr}
            </span>
          </div>

          {hud.multiplayer.mode === 'online' && hud.multiplayer.roomId && (
            <div
              data-testid="hud-online-bar"
              className="inline-flex flex-wrap items-center gap-2 px-2.5 py-1 rounded-xl border border-emerald-500/40 text-[11px] text-emerald-200 shadow"
              style={{ backgroundColor: 'rgba(13, 28, 22, 0.92)' }}
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono-num font-bold">
                غرفة {hud.multiplayer.roomId} · {Math.max(1, hud.multiplayer.members.length)}/4
              </span>
              {onCopyInviteLink && (
                <button
                  type="button"
                  data-testid="hud-copy-invite-btn"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onCopyInviteLink();
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{inviteCopied ? 'تم النسخ ✓' : 'نسخ الرابط'}</span>
                </button>
              )}
            </div>
          )}

          {hud.latestInstaPayToast && (
            <div
              data-testid="hud-instapay-toast"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-emerald-400/60 text-[11px] font-extrabold text-emerald-200 shadow"
              style={{ backgroundColor: 'rgba(12, 34, 24, 0.94)' }}
            >
              <span>{hud.latestInstaPayToast}</span>
            </div>
          )}

          {(hud.accompanyingList.length > 0 || hud.holdingSonHand) && (
            <div
              data-testid="hud-accompanying-badge"
              className="inline-flex flex-wrap items-center gap-1.5 px-2.5 py-1 rounded-xl border border-pink-400/45 text-[11px] font-bold text-pink-200 shadow"
              style={{ backgroundColor: 'rgba(34, 18, 28, 0.92)' }}
            >
              <span>
                {hud.holdingSonHand ? '🤝 ماسك إيدك · ' : ''}
                معاك {hud.accompanyingList.length} مرافق
                {hud.inCar
                  ? ` (كابينة ${hud.cabSeatCount}/4 · صندوق ${hud.flatbedSeatCount}/4)`
                  : ''}
              </span>
            </div>
          )}
        </div>

        {/* Top-Left (RTL End): Utility Buttons + Live Circular Minimap */}
        <div className="flex items-start gap-2 sm:gap-3 pointer-events-auto shrink-0">
          <div className="flex flex-wrap justify-end items-center gap-1 sm:gap-1.5 max-w-[110px] sm:max-w-none">
            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-camera-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onCycleCamera();
              }}
              aria-label="تبديل زاوية الكاميرا"
              title="تبديل الكاميرا [C]"
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-amber-500/30 text-amber-100 hover:bg-amber-500/20 text-xs font-bold cursor-pointer"
              style={{ backgroundColor: 'rgba(20, 16, 13, 0.88)' }}
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline whitespace-nowrap">
                {hud.inCar
                  ? hud.carCameraMode === 'cockpit'
                    ? 'كابينة السائق [C]'
                    : 'خلف السيارة [C]'
                  : hud.cameraMode === 'first_person'
                    ? 'منظور أول [C]'
                    : hud.cameraMode === 'third_person'
                      ? 'منظور ثالث [C]'
                      : 'كاميرا واسعة [C]'}
              </span>
            </button>

            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-cashier-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenCashier('pos');
              }}
              aria-label="فتح نظام الكاشير والفواتير"
              title="الكاشير والمنيو والفواتير [K]"
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-emerald-500/45 text-emerald-100 hover:bg-emerald-500/20 text-xs font-bold cursor-pointer"
              style={{ backgroundColor: 'rgba(13, 28, 22, 0.9)' }}
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline whitespace-nowrap">
                الكاشير [K]
              </span>
              {cashierAlertCount > 0 && (
                <span className="font-mono-num text-[11px] text-amber-300 font-black">
                  ({cashierAlertCount})
                </span>
              )}
            </button>

            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-management-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenManagement();
              }}
              aria-label={
                hud.canManageCity
                  ? 'إدارة المحل والسوق والمدينة'
                  : 'الإدارة والمدينة مخصصة للمعلم محمد حامد فقط'
              }
              title={
                hud.canManageCity
                  ? 'الإدارة والمدينة [Tab]'
                  : 'مخصص للمعلم محمد حامد فقط 🔒'
              }
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                hud.canManageCity
                  ? 'border-amber-500/30 text-amber-100 hover:bg-amber-500/20'
                  : 'border-stone-700/70 text-stone-400 hover:border-rose-500/40'
              }`}
              style={{ backgroundColor: 'rgba(20, 16, 13, 0.88)' }}
            >
              {hud.canManageCity ? (
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="hidden md:inline whitespace-nowrap">
                {hud.canManageCity ? 'الإدارة والمدينة [Tab]' : 'الإدارة (محمد فقط)'}
              </span>
              {hud.canManageCity && lowStock.length > 0 && (
                <span className="font-mono-num text-[11px] text-rose-400 font-bold">
                  ({lowStock.length})
                </span>
              )}
            </button>

            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-phone-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenPhone();
              }}
              aria-label="فتح موبايل المعلم"
              title="موبايل المعلم [M]"
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/20 text-xs font-bold cursor-pointer"
              style={{ backgroundColor: 'rgba(20, 16, 13, 0.88)' }}
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline whitespace-nowrap">
                الموبايل [M]
              </span>
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleTouchControls();
              }}
              aria-label="تبديل أزرار اللمس للموبايل"
              title="أزرار الموبايل"
              className={`p-2 rounded-xl border text-stone-200 cursor-pointer ${
                touchControlsEnabled
                  ? 'border-amber-400 text-amber-300'
                  : 'border-stone-700 hover:border-amber-500/40'
              }`}
              style={{ backgroundColor: 'rgba(20, 16, 13, 0.88)' }}
            >
              <Smartphone className="w-4 h-4" />
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleMute();
              }}
              aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
              className="p-2 rounded-xl border border-stone-700 hover:border-amber-500/40 text-stone-200 cursor-pointer"
              style={{ backgroundColor: 'rgba(20, 16, 13, 0.88)' }}
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-pause-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onPause();
              }}
              aria-label="إيقاف مؤقت"
              className="p-2 rounded-xl border border-stone-700 hover:border-amber-500/40 text-stone-200 cursor-pointer"
              style={{ backgroundColor: 'rgba(20, 16, 13, 0.88)' }}
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          <Minimap
            playerPos={hud.playerPos}
            playerYaw={hud.playerYaw}
            carPos={hud.carPos}
            inCar={hud.inCar}
            orders={hud.orders}
            cityShops={hud.cityShops}
            activeTaxi={hud.activeTaxi}
            activeStreetEvent={hud.activeStreetEvent}
          />
        </div>
      </div>

      {/* Side Mission & Orders Stack */}
      <div className="px-2 sm:px-3 md:px-4 max-w-[235px] sm:max-w-xs space-y-1.5 sm:space-y-2">
        {/* Live KDS Floating Quick-Open Pill */}
        {activeKdsCount > 0 && (
          <button
            type="button"
            tabIndex={-1}
            data-testid="hud-kds-pill"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenCashier('kds');
            }}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-orange-500/55 text-[11px] font-extrabold text-orange-200 hover:bg-orange-950/90 shadow cursor-pointer"
            style={{ backgroundColor: 'rgba(38, 20, 10, 0.94)' }}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span>شاشة المطبخ (KDS):</span>
            <span className="font-mono-num text-amber-300">{activeKdsCount} طلب</span>
          </button>
        )}

        {/* Active Companion Ride or Golden Sizzle or Traffic Fines Micro-Badges */}
        {(hud.companionNameAr ||
          hud.trafficFines > 0 ||
          (hud.goldenSizzleActive &&
            !hud.inCar &&
            (hud.playerZoneAr.includes('فول وطعمية') || hud.heldIngredients.length > 0))) && (
          <div className="flex flex-wrap gap-1.5 pointer-events-none">
            {hud.companionNameAr && (
              <div
                data-testid="hud-companion-badge"
                className="px-2.5 py-1 rounded-xl border border-pink-400/50 text-[11px] font-bold text-pink-200 flex items-center gap-1 shadow"
                style={{ backgroundColor: 'rgba(34, 18, 28, 0.92)' }}
              >
                <Heart className="w-3 h-3 fill-pink-400 text-pink-400 shrink-0" />
                <span>
                  {hud.companionCornicheDone
                    ? `فسحة النيل تمت مع ${hud.companionNameAr}`
                    : `فسحة مع ${hud.companionNameAr} ← الكورنيش`}
                </span>
              </div>
            )}
            {hud.goldenSizzleActive &&
              !hud.inCar &&
              (hud.playerZoneAr.includes('فول وطعمية') || hud.heldIngredients.length > 0) && (
                <div
                  data-testid="hud-golden-sizzle"
                  className="px-2.5 py-1 rounded-xl border border-amber-400/65 text-[11px] font-extrabold text-amber-200 flex items-center gap-1 shadow"
                  style={{ backgroundColor: 'rgba(40, 26, 10, 0.94)' }}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>طشّة ذهبي الآن! (+٥ ج)</span>
                </div>
              )}
            {hud.trafficFines > 0 && (
              <div
                data-testid="hud-traffic-fines"
                className="px-2.5 py-1 rounded-xl border border-rose-500/45 text-[11px] font-bold text-rose-300 shadow"
                style={{ backgroundColor: 'rgba(34, 14, 16, 0.92)' }}
              >
                مخالفات: {hud.trafficFines}
              </div>
            )}
          </div>
        )}

        {/* Active Random Street Event Banner */}
        {hud.activeStreetEvent && !hud.activeStreetEvent.resolved && (
          <div
            data-testid="hud-street-event"
            className="p-3 rounded-2xl border border-orange-400/55 text-xs shadow-lg"
            style={{ backgroundColor: 'rgba(30, 18, 10, 0.93)' }}
          >
            <div className="flex items-center justify-between gap-2 font-display font-extrabold text-orange-300 mb-1">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                <span>{hud.activeStreetEvent.titleAr}</span>
              </span>
              <span className="font-mono-num text-emerald-400 shrink-0">
                {hud.activeStreetEvent.type === 'flash_sale' && hud.activeStreetEvent.discountPct
                  ? `خصم ${hud.activeStreetEvent.discountPct}%`
                  : `+${hud.activeStreetEvent.rewardMoney} ج.م`}
              </span>
            </div>
            <div className="text-stone-100 text-[11px] leading-snug">
              {hud.activeStreetEvent.descriptionAr}
            </div>
            <div className="flex items-center justify-between text-[10px] text-amber-200 mt-1.5">
              <span>{hud.activeStreetEvent.streetAr}</span>
              <span className="font-mono-num">
                {Math.max(1, Math.ceil(hud.activeStreetEvent.timeRemaining))}ث
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden mt-1">
              <div
                className="h-full bg-orange-400 transition-all"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      (hud.activeStreetEvent.timeRemaining /
                        Math.max(1, hud.activeStreetEvent.maxTime)) *
                        100,
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Household Family Room Status when inside Fixed House */}
        {hud.playerZoneAr === 'البيت الثابت (بيت الحارة)' && hud.householdFamily.length > 0 && (
          <div
            data-testid="hud-household-family"
            className="p-2.5 rounded-2xl border border-sky-400/35 text-[11px] shadow-lg space-y-1"
            style={{ backgroundColor: 'rgba(14, 22, 32, 0.92)' }}
          >
            <div className="flex items-center gap-1.5 font-display font-extrabold text-sky-300">
              <Home className="w-3.5 h-3.5 text-sky-400" />
              <span>أهلك في البيت الثابت</span>
            </div>
            {hud.householdFamily.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2 text-stone-200">
                <span className="font-bold text-amber-200">{m.nameAr}</span>
                <span className="text-stone-400 truncate">{m.roomAr}</span>
              </div>
            ))}
          </div>
        )}

        {/* Active Taxi Mission Strip */}
        {hud.activeTaxi && (
          <div
            data-testid="hud-taxi-mission"
            className="p-3 rounded-2xl border border-sky-400/45 text-xs shadow-lg"
            style={{ backgroundColor: 'rgba(15, 22, 32, 0.92)' }}
          >
            <div className="flex items-center justify-between gap-2 font-display font-extrabold text-sky-300 mb-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>مشوار تاكسي القاهرة</span>
              </span>
              <span className="font-mono-num text-emerald-400">
                {hud.activeTaxi.fare} ج.م
              </span>
            </div>
            <div className="text-stone-100 font-bold">
              الراكب: {hud.activeTaxi.passengerName}
            </div>
            <div className="text-[11px] text-amber-200 mt-0.5">
              {hud.activeTaxi.pickedUp
                ? `وصّله إلى: ${hud.activeTaxi.dropoffStreetAr} (النقطة البنفسجية)`
                : `اركب السيارة واتجه إلى: ${hud.activeTaxi.pickupStreetAr} (العمود السماوي)`}
            </div>
          </div>
        )}

        {/* Active Mechanic Repair Strip */}
        {hud.activeJob === 'mechanic' && hud.activeRepair && (
          <div
            className="p-3 rounded-2xl border border-orange-400/45 text-xs shadow-lg"
            style={{ backgroundColor: 'rgba(28, 18, 12, 0.92)' }}
          >
            <div className="flex items-center justify-between gap-2 font-display font-extrabold text-orange-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-orange-400" />
                <span>مهمة الميكانيكي</span>
              </span>
              <span className="font-mono-num text-emerald-400">
                +{hud.activeRepair.reward} ج.م
              </span>
            </div>
            <div className="text-stone-200 text-[11px]">
              {hud.activeRepair.issueAr} — اضغط [E] عند الورشة
            </div>
          </div>
        )}

        {/* Quick Reminder for Barista / Baker */}
        {hud.activeJob === 'barista' && (
          <div
            className="p-2.5 rounded-2xl border border-amber-500/35 text-xs flex items-center gap-2"
            style={{ backgroundColor: 'rgba(24, 18, 12, 0.9)' }}
          >
            <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-stone-200">
              شغل القهوجي: اتجه لقهوة الحارة واضغط [E] لتقديم الشاي
            </span>
          </div>
        )}
        {hud.activeJob === 'baker' && (
          <div
            className="p-2.5 rounded-2xl border border-amber-500/35 text-xs flex items-center gap-2"
            style={{ backgroundColor: 'rgba(24, 18, 12, 0.9)' }}
          >
            <Croissant className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-stone-200">
              شغل الخباز: اتجه لمخبز الأمانة واضغط [E] لخبز عيش طازة
            </span>
          </div>
        )}

        {hud.inCar && activeDelivery && (
          <div
            className="p-3 rounded-2xl border border-amber-400/45 text-xs shadow-lg"
            style={{ backgroundColor: 'rgba(20, 16, 13, 0.92)' }}
          >
            <div className="flex items-center gap-1.5 font-display font-extrabold text-amber-300 mb-1">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>مهمة التوصيل</span>
            </div>
            <div className="text-stone-100 font-bold">
              اوصل الطلب للزبون: {activeDelivery.deliveryTargetName}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
              {hud.heldReadyPack === activeDelivery.recipeId
                ? 'الطلب معك — اتجه للعمود الأخضر واضغط [E]'
                : 'جهّز الطلب من المحل واضغط [E] عند الكاونتر'}
            </div>
          </div>
        )}

        {hud.orders.map((order, idx) => {
          const recipe = RECIPES[order.recipeId];
          const pct = Math.max(
            0,
            Math.min(100, (order.patience / order.maxPatience) * 100),
          );
          const readyToServe =
            !hud.inCar &&
            hud.heldIngredients.length > 0 &&
            matchesOrder(hud.heldIngredients, order.recipeId);

          return (
            <div
              key={order.id}
              className="p-3 rounded-2xl border border-amber-500/25 text-xs shadow-lg"
              style={{ backgroundColor: 'rgba(18, 15, 13, 0.9)' }}
            >
              {idx === 0 && (
                <div className="text-[11px] font-display font-extrabold text-amber-400 mb-1 border-b border-stone-800 pb-1">
                  الطلب الحالي
                </div>
              )}

              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-amber-200 truncate">
                  {order.customerName}
                  {order.isDelivery ? ` · توصيل (${order.deliveryTargetName})` : ''}
                </span>
                <span className="font-mono-num text-stone-200 font-bold shrink-0">
                  {order.deliveredCount}/{order.quantity}
                </span>
              </div>

              <div className="font-display font-extrabold text-sm text-white mb-1">
                {recipe.nameAr} × {order.quantity - order.deliveredCount}
              </div>

              <div className="flex flex-wrap gap-1 text-[11px] text-stone-300 mb-2">
                {recipe.requiredIngredients.map((ing, i) => (
                  <span key={ing}>
                    {INGREDIENTS[ing].nameAr}
                    {i < recipe.requiredIngredients.length - 1 ? ' + ' : ''}
                  </span>
                ))}
              </div>

              <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden mb-1.5">
                <div
                  className={`h-full transition-all ${
                    pct > 55
                      ? 'bg-emerald-400'
                      : pct > 28
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {readyToServe && (
                <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/45 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>جهزت الطلب — سلّم عند الكاونتر [E]</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating 3D-Projected Customer Speech Bubble with Dynamic Mood Emoji */}
      {hud.customerBubble?.visible && (
        <div
          data-testid="customer-speech-bubble"
          className="fixed -translate-x-1/2 -translate-y-full pointer-events-none z-20"
          style={{
            left: `${hud.customerBubble.screenX}%`,
            top: `${hud.customerBubble.screenY}%`,
          }}
        >
          <div
            className={`relative px-3.5 py-2 rounded-2xl border-2 shadow-xl max-w-[250px] text-center ${
              hud.customerBubble.tone === 'happy'
                ? 'bg-emerald-50 text-stone-950 border-emerald-700'
                : hud.customerBubble.tone === 'upset'
                  ? 'bg-rose-50 text-stone-950 border-rose-700'
                  : 'bg-amber-50 text-stone-950 border-stone-900'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <span
                data-testid="customer-bubble-emoji"
                className="text-base leading-none"
                aria-hidden="true"
              >
                {hud.customerBubble.emoji}
              </span>
              <span className="text-[10px] font-extrabold text-stone-800 leading-none">
                {hud.customerBubble.customerName} · {hud.customerBubble.moodLabelAr}
              </span>
            </div>
            <div className="text-xs font-extrabold leading-snug">
              {hud.customerBubble.text}
            </div>
            <div
              className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop:
                  hud.customerBubble.tone === 'happy'
                    ? '8px solid #ecfdf5'
                    : hud.customerBubble.tone === 'upset'
                      ? '8px solid #fff1f2'
                      : '8px solid #fffbeb',
              }}
            />
          </div>
        </div>
      )}

      {/* Center Crosshair + Context Prompt (On Foot) */}
      {!hud.inCar && !activeShopDef && !hud.activeDialogue && (
        <>
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-2 h-2 rounded-full border border-amber-100/90 bg-amber-400/75" />
          </div>
          {hud.activeHint && (
            <div
              data-testid="hud-interact-hint"
              className={`fixed left-1/2 -translate-x-1/2 pointer-events-none ${
                hud.cameraMode === 'first_person'
                  ? 'top-[62%] sm:top-[56%]'
                  : 'top-[66%] sm:top-[63%]'
              } px-3.5 py-2 rounded-xl border border-amber-400/50 text-center shadow-lg max-w-[90vw]`}
              style={{ backgroundColor: 'rgba(18, 14, 11, 0.92)' }}
            >
              <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 font-mono-num font-extrabold text-[11px]">
                  {hud.activeHint.keyHint}
                </span>
                <span>{hud.activeHint.labelAr}</span>
              </div>
              {hud.activeHint.subLabelAr && (
                <div className="text-[11px] text-stone-300 mt-0.5">
                  {hud.activeHint.subLabelAr}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* In-Car Context Prompt (Taxi pickup/dropoff, Fuel pump) */}
      {hud.inCar && hud.activeHint && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-20">
          <div
            data-testid="hud-car-interact-hint"
            className="px-4 py-2 rounded-xl border border-sky-400/60 text-center shadow-lg"
            style={{ backgroundColor: 'rgba(14, 20, 28, 0.94)' }}
          >
            <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-sky-400 text-stone-950 font-mono-num font-extrabold text-[11px]">
                {hud.activeHint.keyHint}
              </span>
              <span>{hud.activeHint.labelAr}</span>
            </div>
            {hud.activeHint.subLabelAr && (
              <div className="text-[11px] text-stone-300 mt-0.5">
                {hud.activeHint.subLabelAr}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification (Below top HUD bars while driving so gauges & bars stay unobstructed) */}
      {hud.toastMessage && (
        <div
          className={`fixed ${
            hud.inCar ? 'top-44' : 'bottom-28'
          } left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl border border-amber-400/40 text-xs md:text-sm font-bold text-amber-100 text-center max-w-md shadow-lg`}
          style={{ backgroundColor: 'rgba(22, 17, 13, 0.94)' }}
        >
          {hud.toastMessage}
        </div>
      )}

      {/* Bottom Perimeter Cluster: Held Sandwich OR In-Car Cockpit Controls */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-max max-w-[95vw] flex flex-col items-center gap-2">
        {hud.heldReadyPack && (
          <div
            className="px-4 py-2 rounded-xl border border-emerald-400/45 text-xs font-bold text-emerald-200"
            style={{ backgroundColor: 'rgba(18, 28, 22, 0.92)' }}
          >
            معاك طلب توصيل جاهز: {RECIPES[hud.heldReadyPack].nameAr} — اتجه للهدف الأخضر [E]
          </div>
        )}

        {hud.heldIngredients.length > 0 && !hud.inCar && (
          <div
            className="px-4 py-2 rounded-xl border border-amber-400/35 flex items-center gap-2 text-xs"
            style={{ backgroundColor: 'rgba(20, 16, 13, 0.92)' }}
          >
            <span className="text-amber-300 font-bold">السندوتش في يدك:</span>
            <span className="text-stone-100">
              {hud.heldIngredients.map((i) => INGREDIENTS[i].nameAr).join(' · ')}
            </span>
          </div>
        )}

        {hud.inCar && (
          <div
            data-testid="car-cockpit-controls"
            className="pointer-events-auto flex flex-wrap md:flex-nowrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-2xl border border-amber-500/35 shadow-xl text-xs whitespace-nowrap"
            style={{ backgroundColor: 'rgba(18, 15, 13, 0.92)' }}
          >
            <div className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 font-bold text-sky-300">
              {VEHICLE_CATALOG[hud.activeVehicleId]?.nameAr ?? 'فيات 128'}
              {hud.vehicleLockedByOwner ? ' 🔒' : ''}
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 font-mono-num font-extrabold text-amber-300">
              الغيار: {hud.carGearLabel}
            </div>
            {(hud.cabSeatCount > 0 || hud.flatbedSeatCount > 0 || hud.activeVehicleId === 'pickup') && (
              <div className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 font-mono-num text-[11px] text-emerald-300">
                كابينة {hud.cabSeatCount}/4 · صندوق {hud.flatbedSeatCount}/4
              </div>
            )}

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleHeadlights();
              }}
              aria-label="تشغيل أو إطفاء كشافات السيارة"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold cursor-pointer ${
                hud.carHeadlightsOn
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                  : 'border-stone-700 text-stone-300 hover:border-stone-500'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>النور [L]</span>
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onCycleRadio();
              }}
              aria-label="تغيير محطة الراديو"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold cursor-pointer ${
                hud.radioStation !== 'off'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'border-stone-700 text-stone-300 hover:border-stone-500'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{RADIO_LABELS[hud.radioStation]} [R]</span>
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleBlinker('left');
              }}
              aria-label="إشارة يسار"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border font-bold cursor-pointer ${
                hud.carLeftBlinker
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                  : 'border-stone-700 text-stone-300 hover:border-stone-500'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>[Q]</span>
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleBlinker('right');
              }}
              aria-label="إشارة يمين"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border font-bold cursor-pointer ${
                hud.carRightBlinker
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                  : 'border-stone-700 text-stone-300 hover:border-stone-500'
              }`}
            >
              <span>[Z]</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Driving Analog/Digital Speedometer (Bottom-Left) */}
      {hud.inCar && (
        <div className="fixed bottom-4 left-4 pointer-events-auto">
          <Speedometer
            speedKmh={hud.carSpeedKmh}
            fuel={hud.carFuel}
            onExitCar={onToggleCar}
          />
        </div>
      )}

      {/* Continuous Hamo El Morshedy Music Player (Always accessible on foot & in car) */}
      <HamoMusicPlayer
        radioStation={hud.radioStation}
        hamoTrackIndex={hud.hamoTrackIndex}
        musicPaused={hud.musicPaused}
        muted={muted}
        inCar={hud.inCar}
        touchControlsEnabled={touchControlsEnabled}
        onTogglePause={onToggleMusicPause}
        onNextTrack={onNextHamoTrack}
        onPrevTrack={onPrevHamoTrack}
        onSelectTrack={onSelectHamoTrack}
        onSelectStation={onSelectRadioStation}
        onToggleYoutubeStream={onToggleYoutubeStream}
      />

      {/* Shop Owner Negotiation & Buyout Modal */}
      {activeShopDef && (
        <div
          data-testid="shop-owner-modal"
          className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-auto"
          style={{ backgroundColor: 'rgba(10, 8, 6, 0.78)' }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-amber-500/40 bg-[#1a1511] text-stone-100 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-[#221b15]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-amber-200">
                    {activeShopDef.nameAr}
                  </h3>
                  <div className="text-xs text-stone-400">
                    {activeShopDef.categoryAr} · {activeShopDef.streetNameAr} · صاحب المحل: {activeShopDef.ownerNameAr}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseShopOwner}
                aria-label="إغلاق نافذة التاجر"
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Owner Speech */}
              <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 text-sm text-amber-100">
                <span className="font-bold text-amber-400">{activeShopDef.ownerNameAr}: </span>
                &ldquo;{activeShopDef.ownerGreetingAr}&rdquo;
              </div>

              {/* Goods to Buy */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-stone-400 mb-2">
                  <span>بضاعة وخدمات المحل</span>
                  <span className="font-mono-num text-emerald-400">
                    رصيدك: {Math.round(hud.money)} ج.م
                  </span>
                </div>
                <div className="space-y-2">
                  {activeShopDef.goods.map((g) => {
                    const effectiveCost = computeDiscountedGoodCost(
                      g.cost,
                      activeShopDef.id,
                      hud.activeStreetEvent,
                    );
                    const hasDiscount = effectiveCost < g.cost;
                    return (
                      <div
                        key={g.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-stone-800 bg-stone-900/60"
                      >
                        <span className="text-sm font-bold text-stone-100">
                          {g.labelAr}
                        </span>
                        <button
                          type="button"
                          onClick={() => onBuyFromShopOwner(activeShopDef.id, g.id)}
                          disabled={hud.money < effectiveCost}
                          className="px-3.5 py-1.5 rounded-lg bg-[#f5b400] hover:bg-[#ffca2c] disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-extrabold text-xs font-mono-num cursor-pointer disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
                        >
                          {hasDiscount && (
                            <span className="line-through opacity-60">{g.cost}</span>
                          )}
                          <span>شراء ({effectiveCost} ج.م)</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shop Buyout / Manager Hire */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300">
                    تملك المحل والدخل السلبي
                  </span>
                  <span className="font-mono-num text-emerald-400 font-bold">
                    عائد يومي: +{activeShopDef.dailyRevenue} ج.م
                  </span>
                </div>

                {!activeShopRuntime?.owned ? (
                  <button
                    type="button"
                    data-testid="shop-owner-buy-property"
                    onClick={() => onBuyCityShop(activeShopDef.id)}
                    disabled={hud.money < activeShopDef.purchasePrice}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-extrabold text-sm cursor-pointer disabled:cursor-not-allowed"
                  >
                    شراء المحل بالكامل ({activeShopDef.purchasePrice} ج.م)
                  </button>
                ) : !activeShopRuntime.hasManager ? (
                  <button
                    type="button"
                    onClick={() => onHireShopManager(activeShopDef.id)}
                    disabled={hud.money < Math.round(activeShopDef.purchasePrice * 0.4)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-extrabold text-sm cursor-pointer disabled:cursor-not-allowed"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>
                      تعيين مدير للمحل (+٥٥٪ أرباح · {Math.round(activeShopDef.purchasePrice * 0.4)} ج.م)
                    </span>
                  </button>
                ) : (
                  <div className="text-center text-xs font-bold text-emerald-300 py-1.5">
                    أنت المالك الفعلي للمحل والمدير يدير المبيعات يومياً!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branching Dialogue, Keyboard Chat & Accompany Modal */}
      {hud.activeDialogue && (
        <DialogueModal
          session={hud.activeDialogue}
          money={hud.money}
          onSelectChoice={onSelectDialogueChoice}
          onSendKeyboardMessage={onSendDialogueKeyboardMessage}
          onToggleAccompany={onToggleAccompany}
          onBoardCarWithCompanions={onBoardCarWithCompanions}
          onClose={onCloseDialogue}
        />
      )}

      {/* Optional Mobile Touch Controls */}
      {touchControlsEnabled && (
        <>
          <div
            className="fixed inset-y-24 left-0 w-1/2 pointer-events-auto"
            onPointerDown={(e) => {
              lookTouchRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
            }}
            onPointerMove={(e) => {
              if (!lookTouchRef.current || lookTouchRef.current.id !== e.pointerId) return;
              const dx = e.clientX - lookTouchRef.current.x;
              const dy = e.clientY - lookTouchRef.current.y;
              lookTouchRef.current.x = e.clientX;
              lookTouchRef.current.y = e.clientY;
              onTouchLookDelta(dx, dy);
            }}
            onPointerUp={() => {
              lookTouchRef.current = null;
            }}
            onPointerCancel={() => {
              lookTouchRef.current = null;
            }}
          />

          <div
            ref={joyRef}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              handleJoystickPointer(e);
            }}
            onPointerMove={(e) => {
              if (e.buttons > 0) handleJoystickPointer(e);
            }}
            onPointerUp={() => onMobileMove(0, 0)}
            onPointerCancel={() => onMobileMove(0, 0)}
            className="fixed bottom-6 right-6 w-28 h-28 rounded-full border-2 border-amber-400/45 flex items-center justify-center pointer-events-auto touch-none"
            style={{ backgroundColor: 'rgba(20, 16, 13, 0.72)' }}
          >
            <div className="w-10 h-10 rounded-full bg-amber-400/75" />
          </div>

          <div className="fixed bottom-6 left-6 flex items-center gap-2.5 pointer-events-auto">
            <button
              type="button"
              onTouchStart={() => onMobileSprint(true)}
              onTouchEnd={() => onMobileSprint(false)}
              onMouseDown={() => onMobileSprint(true)}
              onMouseUp={() => onMobileSprint(false)}
              className="w-12 h-12 rounded-full border border-stone-500 text-xs font-bold text-stone-100"
              style={{ backgroundColor: 'rgba(20, 16, 13, 0.85)' }}
            >
              جري
            </button>
            <button
              type="button"
              onClick={onToggleCar}
              className="w-12 h-12 rounded-full border border-amber-400/40 text-xs font-bold text-amber-200"
              style={{ backgroundColor: 'rgba(20, 16, 13, 0.85)' }}
            >
              سيارة
            </button>
            <button
              type="button"
              onClick={onInteract}
              className="w-14 h-14 rounded-full bg-[#f5b400] text-stone-950 font-extrabold text-sm shadow-lg"
            >
              تفاعل
            </button>
          </div>
        </>
      )}

      {/* Real-Time 4-Player Co-op Squad Chat (Bottom-Right Corner) */}
      <div
        className={`fixed ${
          touchControlsEnabled ? 'bottom-36' : 'bottom-4'
        } right-4 z-30 pointer-events-auto flex flex-col items-start gap-2`}
      >
        {chatOpen && (
          <div
            data-testid="hud-coop-chat-panel"
            className="w-72 sm:w-80 rounded-2xl border border-emerald-500/45 shadow-2xl overflow-hidden flex flex-col"
            style={{ backgroundColor: 'rgba(15, 19, 17, 0.95)' }}
          >
            <div className="px-3 py-2 border-b border-stone-800 flex items-center justify-between text-xs font-extrabold text-emerald-300">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>شات الأصحاب أونلاين ({hud.coopChatMessages.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label="إغلاق الشات"
                className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              data-testid="hud-coop-chat-log"
              className="p-2.5 space-y-1.5 max-h-44 overflow-y-auto text-[11px]"
            >
              {hud.coopChatMessages.length === 0 ? (
                <div className="text-stone-400 text-center py-3">
                  ابعت رسالة لأصحابك في الغرفة تظهر فوق راسك وفي الشات!
                </div>
              ) : (
                hud.coopChatMessages.slice(-20).map((m) => (
                  <div
                    key={m.id}
                    className="p-1.5 rounded-lg bg-stone-900/80 border border-stone-800"
                  >
                    <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold">
                      <span>{m.senderNameAr}</span>
                      <span className="font-mono-num text-stone-500">{m.clockStr}</span>
                    </div>
                    <div className="text-stone-100 mt-0.5 leading-snug">{m.text}</div>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatText.trim()) return;
                onSendCoopChat(chatText);
                setChatText('');
              }}
              className="p-2 border-t border-stone-800 flex items-center gap-1.5"
            >
              <input
                type="text"
                data-testid="hud-coop-chat-input"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="اكتب رسالة للأصحاب..."
                maxLength={120}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-700 bg-stone-950 text-stone-100 text-xs focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                data-testid="hud-coop-chat-send"
                className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold cursor-pointer"
                aria-label="إرسال رسالة للشات"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          tabIndex={-1}
          data-testid="hud-coop-chat-toggle"
          onClick={(e) => {
            e.currentTarget.blur();
            setChatOpen((v) => !v);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/45 text-xs font-extrabold text-emerald-200 hover:bg-emerald-950/90 shadow-lg cursor-pointer"
          style={{ backgroundColor: 'rgba(13, 25, 20, 0.92)' }}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>شات الأصحاب</span>
          {hud.coopChatMessages.length > 0 && (
            <span className="font-mono-num px-1.5 py-0.5 rounded-full bg-emerald-500 text-stone-950 text-[10px]">
              {hud.coopChatMessages.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
