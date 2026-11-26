import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  Bike,
  Building2,
  Calendar,
  Car,
  ClipboardCheck,
  Edit3,
  GraduationCap,
  Heart,
  Home,
  KeyRound,
  Layers,
  Lock,
  MapPin,
  MessageSquareText,
  MonitorPlay,
  Navigation,
  Package,
  Phone,
  PhoneCall,
  Send,
  ShieldCheck,
  ShoppingBag,
  Signal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  Unlock,
  Utensils,
  Wallet,
  X,
} from 'lucide-react';
import {
  CITY_SHOPS,
  DISTRICTS,
  GAS_STATION_DEF,
  getStreetContext,
  OWNABLE_BUILDINGS,
  REMOTE_CREW_APARTMENT,
  RESTAURANT_BRANCHES,
  SCHOOL_CAMPUSES,
} from '../game/cityLayout';
import {
  CORNICHE_VILLA_DAILY_INCOME,
  CORNICHE_VILLA_PRICE,
  EGYPTIAN_SEASONS,
  FURNITURE_CATALOG,
  getSortedCrewLeaderboard,
  WHOLESALE_CONTRACTS,
} from '../game/expansionSystems';
import {
  computeAdBoardCustomerBoost,
  computeRealEstateDailyIncome,
  getResolvedCharacterProfile,
  OWNER_DISPLAY_NAME_AR,
  OWNER_ROLE_TITLE_AR,
  RESTAURANT_FLOOR_UPGRADE_COST,
  SCHOOL_TUITION_COST,
} from '../game/phoneOs';
import {
  formatGameClock,
  INGREDIENTS,
  PLAYER_CHARACTERS,
  ROMANCE_NPCS,
  VEHICLE_CATALOG,
} from '../game/rules';
import {
  CustomProfilesMap,
  EgyptianSeasonId,
  ElectronicAdBoardState,
  FurnitureItemId,
  HudSnapshot,
  IngredientId,
  OwnableBuildingId,
  OwnedVehicleId,
  PlayerCharacterId,
  RestaurantBranchId,
  WholesaleContractId,
  WorldObjectChatKind,
} from '../game/types';
import { computeDynamicPackCost } from '../game/worldSystems';

export type PhoneAppId =
  | 'home'
  | 'delivery'
  | 'seasons'
  | 'supply'
  | 'crew'
  | 'inventory'
  | 'instapay'
  | 'ads'
  | 'expansion'
  | 'profiles'
  | 'garage'
  | 'family'
  | 'map'
  | 'needs';

interface MobilePhoneModalProps {
  hud: HudSnapshot;
  initialApp?: PhoneAppId;
  onClose: () => void;
  onCallFamily: (memberId: string) => void;
  onInviteCompanion: () => void;
  onQuickTaxi: () => void;
  onCollectShopProfits: () => void;
  onBuyIngredient: (id: IngredientId) => void;
  onUpdateAdBoard: (patch: Partial<ElectronicAdBoardState>) => void;
  onSendInstaPaySalary: (
    toCharacterId: PlayerCharacterId,
    amount: number,
    noteAr?: string,
  ) => boolean;
  onPerformInventoryAudit: () => void;
  onBuyBuilding: (id: OwnableBuildingId) => void;
  onUpgradeRestaurantFloor: () => void;
  onBuyBranch: (id: RestaurantBranchId) => void;
  onToggleVehicleLock: () => void;
  onBuyVehicle: (id: OwnedVehicleId) => void;
  onSelectVehicle: (id: OwnedVehicleId) => void;
  onUpdateCustomProfiles: (patch: Partial<CustomProfilesMap>) => void;
  onEnrollBenhaSchool: (target: 'son' | 'daughter' | 'both') => void;
  onEatFood: () => void;
  onDrinkWater: () => void;
  onStartObjectDialogue: (kind: WorldObjectChatKind) => void;
  onBoardCarWithCompanions: () => void;
  onSetSeason: (seasonId: EgyptianSeasonId) => void;
  onRefreshDeliveryDispatch: () => void;
  onAcceptDelivery: (orderId: string) => void;
  onCompleteDelivery: () => void;
  onSignWholesale: (contractId: WholesaleContractId) => void;
  onSanitizeShop: () => void;
  onRunInspection: () => void;
  onBuyFurniture: (itemId: FurnitureItemId) => void;
  onBuyCornicheVilla: () => void;
  onAttendSchoolCeremony: () => void;
}

const AD_PRESETS: Array<{ headline: string; promo: string; discount: number }> = [
  {
    headline: 'عرض الفطار الصباحي — سخن من القدرة!',
    promo: 'خصم ٢٠٪ على الفول والطعمية والبطاطس لمدة ساعتين',
    discount: 20,
  },
  {
    headline: 'بوكس المعلم العائلي + توصيل بالموتوسيكل!',
    promo: 'خصم ٢٥٪ على الوجبات العائلية والدليفري في الـ ٩٨ شارع',
    discount: 25,
  },
  {
    headline: 'ساعة السعادة — شاي بالنعناع هدية مع السندوتش!',
    promo: 'خصم ١٥٪ على جميع الطلبات الداخلية والتيك أواي',
    discount: 15,
  },
];

const OBJECT_CHAT_SHORTCUTS: Array<{ kind: WorldObjectChatKind; labelAr: string }> = [
  { kind: 'ad_board', labelAr: 'لوحة الإعلانات LED' },
  { kind: 'car', labelAr: 'السيارة / النصف نقل' },
  { kind: 'motorcycle', labelAr: 'موتوسيكل الدليفري' },
  { kind: 'fuel_pump', labelAr: 'طرمبة البنزينة' },
  { kind: 'ful_pot', labelAr: 'قدرة الفول النحاس' },
  { kind: 'school_gate', labelAr: 'بوابة مدرسة بنها' },
  { kind: 'apartment_door', labelAr: 'شقة الدور التاني' },
  { kind: 'felucca', labelAr: 'فلوكة الكورنيش' },
];

export const MobilePhoneModal: React.FC<MobilePhoneModalProps> = ({
  hud,
  initialApp,
  onClose,
  onCallFamily,
  onInviteCompanion,
  onQuickTaxi,
  onCollectShopProfits,
  onBuyIngredient,
  onUpdateAdBoard,
  onSendInstaPaySalary,
  onPerformInventoryAudit,
  onBuyBuilding,
  onUpgradeRestaurantFloor,
  onBuyBranch,
  onToggleVehicleLock,
  onBuyVehicle,
  onSelectVehicle,
  onUpdateCustomProfiles,
  onEnrollBenhaSchool,
  onEatFood,
  onDrinkWater,
  onStartObjectDialogue,
  onBoardCarWithCompanions,
  onSetSeason,
  onRefreshDeliveryDispatch,
  onAcceptDelivery,
  onCompleteDelivery,
  onSignWholesale,
  onSanitizeShop,
  onRunInspection,
  onBuyFurniture,
  onBuyCornicheVilla,
  onAttendSchoolCeremony,
}) => {
  const [app, setApp] = useState<PhoneAppId>(initialApp ?? 'home');

  useEffect(() => {
    if (initialApp) {
      setApp(initialApp);
    }
  }, [initialApp]);

  // Electronic Ad Board form state
  const [adHeadline, setAdHeadline] = useState(hud.adBoard.headlineAr);
  const [adPromo, setAdPromo] = useState(hud.adBoard.promoTextAr);
  const [adDiscount, setAdDiscount] = useState(hud.adBoard.discountPct);
  const [adActive, setAdActive] = useState(hud.adBoard.active);

  // InstaPay form state
  const [ipRecipient, setIpRecipient] = useState<PlayerCharacterId>('ahmed');
  const [ipAmount, setIpAmount] = useState('500');
  const [ipNote, setIpNote] = useState('قبض الشفت ومكافأة الاجتهاد');

  // Editable Names/Professions form state
  const [profForm, setProfForm] = useState<CustomProfilesMap>(hud.customProfiles);

  useEffect(() => {
    setAdHeadline(hud.adBoard.headlineAr);
    setAdPromo(hud.adBoard.promoTextAr);
    setAdDiscount(hud.adBoard.discountPct);
    setAdActive(hud.adBoard.active);
  }, [hud.adBoard]);

  useEffect(() => {
    setProfForm(hud.customProfiles);
  }, [hud.customProfiles]);

  const isOwner = hud.selectedCharacterId === 'mohamed';
  const selfProfile = getResolvedCharacterProfile(
    hud.selectedCharacterId,
    hud.customProfiles,
  );
  const spouseDef = hud.spouseId
    ? ROMANCE_NPCS.find((g) => g.id === hud.spouseId) ?? null
    : null;
  const warmRomance = hud.romanceStates
    .filter((r) => r.affection >= 45)
    .sort((a, b) => b.affection - a.affection)[0];
  const warmCompanionDef = warmRomance
    ? ROMANCE_NPCS.find((g) => g.id === warmRomance.id) ?? null
    : null;
  const activePartnerDef = spouseDef ?? warmCompanionDef;
  const canInviteCompanion = Boolean(hud.companionNameAr || activePartnerDef);
  const totalDividends = Math.floor(
    hud.cityShops.reduce((s, sh) => s + (sh.owned ? sh.accumulatedProfit : 0), 0),
  );
  const currentCtx = getStreetContext(hud.playerPos.x, hud.playerPos.z);
  const adBoost = computeAdBoardCustomerBoost(hud.adBoard);
  const passiveRealEstateDaily = computeRealEstateDailyIncome(
    hud.ownedBuildingIds,
    hud.ownedBranchIds,
    hud.restaurantFloors,
    hud.cornicheVillaOwned,
  );
  const activeSeason = EGYPTIAN_SEASONS[hud.activeSeasonId] ?? EGYPTIAN_SEASONS.normal;
  const sortedCrewBoard = getSortedCrewLeaderboard(hud.crewLeaderboard);

  const APP_TILES: Array<{
    id: Exclude<PhoneAppId, 'home'>;
    titleAr: string;
    subtitleAr: string;
    badgeAr?: string;
    colorCls: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'delivery',
      titleAr: 'دليفري الموتوسيكل',
      subtitleAr: 'طلبات الـ ٩٨ شارع السريعة',
      badgeAr: hud.activeDeliveryOrder ? 'شغال 🛵' : `${hud.deliveryOrders.length} طلب`,
      colorCls: 'border-orange-500/45 bg-orange-500/12 text-orange-200',
      icon: <Bike className="w-5 h-5 text-orange-400" />,
    },
    {
      id: 'seasons',
      titleAr: 'المواسم والأحداث',
      subtitleAr: activeSeason.nameAr,
      badgeAr: `إقبال ×${activeSeason.customerRushMultiplier}`,
      colorCls: 'border-teal-500/45 bg-teal-500/12 text-teal-200',
      icon: <Calendar className="w-5 h-5 text-teal-400" />,
    },
    {
      id: 'supply',
      titleAr: 'الجملة والتفتيش',
      subtitleAr: 'تعاقدات التوريد والصحة',
      badgeAr: `نظافة ${Math.round(hud.hygieneScore)}%`,
      colorCls: 'border-lime-500/45 bg-lime-500/12 text-lime-200',
      icon: <ShieldCheck className="w-5 h-5 text-lime-400" />,
    },
    {
      id: 'crew',
      titleAr: 'تحدي الأصحاب',
      subtitleAr: 'ترتيب الطاقم والعملات',
      badgeAr: `${hud.crewLeaderboard[hud.selectedCharacterId]?.points ?? 0} ن`,
      colorCls: 'border-amber-400/50 bg-amber-400/12 text-amber-200',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'inventory',
      titleAr: 'المخزون والجرد',
      subtitleAr: 'مشتريات السوق وجرد اليوم',
      badgeAr: `${hud.inventoryAuditLogs.length} جرد`,
      colorCls: 'border-amber-500/45 bg-amber-500/12 text-amber-200',
      icon: <ClipboardCheck className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'instapay',
      titleAr: 'إنستا باي والرواتب',
      subtitleAr: isOwner ? 'تقبيض الموظفين لحظياً' : 'محفظتك والتحويلات',
      badgeAr: `${Math.round(hud.employeeWallets[hud.selectedCharacterId] ?? 0).toLocaleString('en-US')} ج`,
      colorCls: 'border-emerald-500/45 bg-emerald-500/12 text-emerald-200',
      icon: <Wallet className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'ads',
      titleAr: 'شاشة الإعلانات LED',
      subtitleAr: 'عروض اليوم والخصومات',
      badgeAr: hud.adBoard.active ? `خصم ${hud.adBoard.discountPct}%` : 'مطفية',
      colorCls: 'border-cyan-500/45 bg-cyan-500/12 text-cyan-200',
      icon: <MonitorPlay className="w-5 h-5 text-cyan-400" />,
    },
    {
      id: 'expansion',
      titleAr: 'العقارات والفيلا',
      subtitleAr: 'الأدوار + الفروع + أثاث الشقة',
      badgeAr: hud.cornicheVillaOwned ? 'فيلا النيل 🏰' : `${hud.restaurantFloors} دور`,
      colorCls: 'border-yellow-500/45 bg-yellow-500/12 text-yellow-200',
      icon: <Building2 className="w-5 h-5 text-yellow-400" />,
    },
    {
      id: 'profiles',
      titleAr: 'الأسامي والمهن',
      subtitleAr: 'تعديل الفريق والأسرة',
      badgeAr: 'تخصيص',
      colorCls: 'border-purple-500/45 bg-purple-500/12 text-purple-200',
      icon: <Edit3 className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'garage',
      titleAr: 'السيارات والقفل',
      subtitleAr: 'نصف نقل + موتوسيكل + لوك',
      badgeAr: hud.vehicleLockedByOwner ? 'مقفولة 🔒' : `${hud.ownedVehicleIds.length}/٦`,
      colorCls: 'border-sky-500/45 bg-sky-500/12 text-sky-200',
      icon: <Car className="w-5 h-5 text-sky-400" />,
    },
    {
      id: 'family',
      titleAr: 'الأسرة وبنها الخاصة',
      subtitleAr: 'الشهادات والتفوق + المرافقين',
      badgeAr:
        hud.schoolEnrollment.sonEnrolled && hud.schoolEnrollment.daughterEnrolled
          ? 'مقيدين ✓'
          : 'تقديم',
      colorCls: 'border-pink-500/45 bg-pink-500/12 text-pink-200',
      icon: <GraduationCap className="w-5 h-5 text-pink-400" />,
    },
    {
      id: 'map',
      titleAr: 'الـ ٩٨ شارع والكلام',
      subtitleAr: 'GPS + تاكسي + كلم أي شيء',
      badgeAr: '٩٨ شارع',
      colorCls: 'border-indigo-500/45 bg-indigo-500/12 text-indigo-200',
      icon: <Navigation className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'needs',
      titleAr: 'الأكل والعطش',
      subtitleAr: 'طاقة المعلم والطاقم',
      badgeAr: `${Math.round(hud.playerNeeds.hunger)}% شبع`,
      colorCls: 'border-lime-500/45 bg-lime-500/12 text-lime-200',
      icon: <Utensils className="w-5 h-5 text-lime-400" />,
    },
  ];

  const appTitleMap: Record<PhoneAppId, string> = {
    home: 'هاتف المعلم الذكي OS',
    delivery: 'دليفري الموتوسيكل — ٩٨ شارع',
    seasons: 'المواسم والأحداث المصرية',
    supply: 'تعاقدات الجملة وتفتيش الصحة',
    crew: 'تحدي الطاقم الأونلاين',
    inventory: 'المخزون والجرد والمشتريات',
    instapay: 'إنستا باي — تقبيض الموظفين',
    ads: 'لوحة الإعلانات الإلكترونية LED',
    expansion: 'العقارات والفيلا والأثاث',
    profiles: 'تعديل الأسامي والمهن',
    garage: 'السيارات ولوك المعلم الخاص',
    family: 'مدرسة بنها الخاصة والشهادات',
    map: 'خريطة الـ ٩٨ شارع والكلام التفاعلي',
    needs: 'الأكل والشرب وحالة الطاقم',
  };

  return (
    <div
      data-testid="elmoalem-phone-modal"
      className="fixed inset-0 z-40 flex items-center justify-center p-2.5 sm:p-4"
      style={{ backgroundColor: 'rgba(8, 7, 10, 0.78)' }}
    >
      <div
        className="w-full max-w-[440px] rounded-[2rem] border-2 border-amber-500/50 text-stone-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ backgroundColor: '#121015' }}
      >
        {/* Top Phone Notch & Status Bar */}
        <div
          className="px-5 pt-3 pb-2.5 border-b border-stone-800/90 flex items-center justify-between gap-2"
          style={{ backgroundColor: '#19161e' }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-mono-num text-amber-300 font-bold">
            <Signal className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatGameClock(hud.timeOfDay)}</span>
            <span className="text-stone-600">·</span>
            <span className="text-emerald-400">
              {Math.round(hud.money).toLocaleString('en-US')} ج.م
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-display font-bold text-amber-200 flex items-center gap-1 truncate max-w-[155px]">
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{selfProfile.nameAr}</span>
            </span>
            <button
              type="button"
              data-testid="phone-close-btn"
              onClick={onClose}
              aria-label="إغلاق الموبايل"
              className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* App Sub-Header when inside an App */}
        {app !== 'home' && (
          <div
            className="px-4 py-2 border-b border-stone-800 flex items-center justify-between gap-2"
            style={{ backgroundColor: '#16131a' }}
          >
            <button
              type="button"
              data-testid="phone-back-home-btn"
              onClick={() => setApp('home')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>التطبيقات</span>
            </button>
            <span className="text-xs font-display font-extrabold text-amber-100 truncate">
              {appTitleMap[app]}
            </span>
          </div>
        )}

        {/* Screen Body */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto flex-1">
          {/* HOME LAUNCHER GRID */}
          {app === 'home' && (
            <div className="space-y-3">
              {/* Owner / Wallet Quick Card */}
              <div
                className="p-3 rounded-2xl border border-amber-500/35 flex items-center justify-between gap-2"
                style={{ backgroundColor: '#1d1822' }}
              >
                <div>
                  <div className="text-xs font-extrabold text-amber-200 flex items-center gap-1.5">
                    <span>{selfProfile.nameAr}</span>
                    {isOwner && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 text-[10px] font-black">
                        المالك الثابت
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    {currentCtx.street.nameAr} · {currentCtx.district.nameAr}
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-mono-num text-sm font-extrabold text-emerald-400">
                    {Math.round(hud.money).toLocaleString('en-US')} ج.م
                  </div>
                  <div className="text-[10px] text-stone-400">
                    شبع {Math.round(hud.playerNeeds.hunger)}% · ماء {Math.round(hud.playerNeeds.thirst)}%
                  </div>
                </div>
              </div>

              {/* 9 Smartphone Apps Grid */}
              <div
                data-testid="phone-home-grid"
                className="grid grid-cols-2 gap-2.5"
              >
                {APP_TILES.map((tile) => (
                  <button
                    key={tile.id}
                    type="button"
                    data-testid={`phone-app-${tile.id}`}
                    onClick={() => setApp(tile.id)}
                    className={`p-3 rounded-2xl border text-right flex flex-col justify-between gap-2 transition-transform active:scale-[0.98] cursor-pointer ${tile.colorCls}`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="p-2 rounded-xl bg-stone-950/65">{tile.icon}</div>
                      {tile.badgeAr && (
                        <span className="font-mono-num text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-stone-950/70 text-stone-100">
                          {tile.badgeAr}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-display font-extrabold leading-tight">
                        {tile.titleAr}
                      </div>
                      <div className="text-[10px] opacity-80 mt-0.5 leading-snug">
                        {tile.subtitleAr}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NEW APP A: MOTORCYCLE DELIVERY DISPATCH */}
          {app === 'delivery' && (
            <div className="space-y-3" data-testid="phone-view-delivery">
              <div
                className="p-3.5 rounded-2xl border border-orange-500/45 space-y-2"
                style={{ backgroundColor: '#231710' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-200">
                    <Bike className="w-4 h-4 text-orange-400" />
                    <span>تطبيق توصيل الموتوسيكل (٩٨ شارع)</span>
                  </div>
                  <button
                    type="button"
                    data-testid="delivery-refresh-btn"
                    onClick={onRefreshDeliveryDispatch}
                    className="px-2.5 py-1 rounded-lg bg-orange-400 hover:bg-orange-300 text-stone-950 text-[11px] font-extrabold cursor-pointer"
                  >
                    تحديث الطلبات 🔄
                  </button>
                </div>
                <p className="text-[11px] text-stone-300 leading-snug">
                  اقبل أوردر دليفري واركب موتوسيكل الدليفري — هيظهر عمود برتقالي عند عنوان الزبون في أي شارع للوصول السريع ومضاعفة التيبس.
                </p>
              </div>

              {hud.activeDeliveryOrder && (
                <div
                  data-testid="delivery-active-card"
                  className="p-3.5 rounded-2xl border-2 border-emerald-400/65 bg-emerald-950/35 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-extrabold text-emerald-300">
                    <span>🛵 أوردر دليفري نشط الآن</span>
                    <span className="font-mono-num text-amber-300">
                      {Math.ceil(hud.activeDeliveryOrder.remainingSec)}ث
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white">
                    {hud.activeDeliveryOrder.customerNameAr} — {hud.activeDeliveryOrder.streetNameAr} ({hud.activeDeliveryOrder.districtNameAr})
                  </div>
                  <div className="text-[11px] text-stone-200">
                    {hud.activeDeliveryOrder.itemsLabelAr}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="font-mono-num text-xs font-bold text-emerald-400">
                      الأجرة: {hud.activeDeliveryOrder.payout} ج + تيبس موتوسيكل {hud.activeDeliveryOrder.motoTipBonus} ج
                    </span>
                    <button
                      type="button"
                      data-testid="delivery-complete-btn"
                      onClick={onCompleteDelivery}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-[11px] font-extrabold cursor-pointer"
                    >
                      تسليم يدوي الآن ✓
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {hud.deliveryOrders
                  .filter((d) => d.status === 'available')
                  .map((d) => (
                    <div
                      key={d.id}
                      data-testid={`delivery-card-${d.id}`}
                      className="p-3 rounded-xl border border-stone-800 bg-stone-900/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-200">{d.customerNameAr}</span>
                        <span className="font-mono-num font-extrabold text-emerald-400">
                          {d.payout} ج + {d.motoTipBonus} تيبس
                        </span>
                      </div>
                      <div className="text-[11px] text-orange-200 font-semibold">
                        📍 {d.streetNameAr} · {d.districtNameAr}
                      </div>
                      <div className="text-[11px] text-stone-400">{d.itemsLabelAr}</div>
                      <button
                        type="button"
                        data-testid={`delivery-accept-${d.id}`}
                        disabled={Boolean(hud.activeDeliveryOrder)}
                        onClick={() => onAcceptDelivery(d.id)}
                        className="w-full py-1.5 rounded-lg bg-orange-400 hover:bg-orange-300 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-extrabold text-xs cursor-pointer disabled:cursor-not-allowed"
                      >
                        {hud.activeDeliveryOrder ? 'أنهِ الأوردر الحالي أولاً' : 'استلام الأوردر والانطلاق 🛵'}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* NEW APP B: EGYPTIAN SEASONS & LIVE EVENTS */}
          {app === 'seasons' && (
            <div className="space-y-3" data-testid="phone-view-seasons">
              <div
                className="p-3.5 rounded-2xl border border-teal-500/45 space-y-1.5"
                style={{ backgroundColor: '#112220' }}
              >
                <div className="flex items-center justify-between text-xs font-extrabold text-teal-200">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    <span>الموسم النشط الآن</span>
                  </span>
                  <span className="font-mono-num text-amber-300">
                    إقبال ×{activeSeason.customerRushMultiplier} · تيبس ×{activeSeason.tipMultiplier}
                  </span>
                </div>
                <div className="text-sm font-display font-extrabold text-white">
                  {activeSeason.nameAr}
                </div>
                <div className="text-[11px] text-stone-300">{activeSeason.subtitleAr}</div>
                <div className="text-[11px] text-emerald-300 font-bold">
                  مشروب الموسم المميز: {activeSeason.specialDrinkAr}
                </div>
              </div>

              {!isOwner && (
                <div className="p-2.5 rounded-xl border border-amber-500/35 bg-amber-500/10 text-[11px] text-amber-200">
                  تغيير موسم المدينة متاح لـ {OWNER_DISPLAY_NAME_AR} فقط.
                </div>
              )}

              <div className="space-y-2">
                {(Object.keys(EGYPTIAN_SEASONS) as EgyptianSeasonId[]).map((sid) => {
                  const s = EGYPTIAN_SEASONS[sid];
                  const active = hud.activeSeasonId === sid;
                  return (
                    <button
                      key={sid}
                      type="button"
                      data-testid={`season-btn-${sid}`}
                      disabled={!isOwner}
                      onClick={() => onSetSeason(sid)}
                      className={`w-full p-3 rounded-xl border text-right space-y-1 cursor-pointer disabled:opacity-60 ${
                        active
                          ? 'border-teal-400 bg-teal-500/15'
                          : 'border-stone-800 bg-stone-900/70 hover:border-teal-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-extrabold">
                        <span style={{ color: s.badgeColorHex }}>{s.nameAr}</span>
                        <span className="font-mono-num text-[11px] text-emerald-400">
                          {active ? 'مفعّل ✓' : `إقبال ×${s.customerRushMultiplier}`}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-300">{s.subtitleAr}</div>
                      <div className="text-[10px] text-amber-300">
                        المشروب: {s.specialDrinkAr} · البقشيش ×{s.tipMultiplier}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* NEW APP C: WHOLESALE SUPPLY CONTRACTS & HYGIENE / TAMWEEN INSPECTION */}
          {app === 'supply' && (
            <div className="space-y-3" data-testid="phone-view-supply">
              <div
                className="p-3.5 rounded-2xl border border-lime-500/45 space-y-2.5"
                style={{ backgroundColor: '#132116' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-lime-200">
                    <ShieldCheck className="w-4 h-4 text-lime-400" />
                    <span>مؤشر النظافة وتفتيش الصحة</span>
                  </div>
                  <span
                    data-testid="supply-hygiene-score"
                    className={`font-mono-num text-sm font-black ${
                      hud.hygieneScore >= 75
                        ? 'text-emerald-400'
                        : hud.hygieneScore >= 50
                          ? 'text-amber-300'
                          : 'text-rose-400'
                    }`}
                  >
                    {Math.round(hud.hygieneScore)}%
                  </span>
                </div>

                {hud.qualityBadgeEarned && (
                  <div
                    data-testid="supply-quality-badge"
                    className="p-2 rounded-xl bg-amber-400/15 border border-amber-400/60 text-xs font-extrabold text-amber-200 flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>المحل حاصل على وسام النظافة والجودة 🏆</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-testid="supply-sanitize-btn"
                    onClick={onSanitizeShop}
                    className="py-2 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-[11px] cursor-pointer"
                  >
                    تنظيف وتعقيم (١٨٠ ج.م)
                  </button>
                  <button
                    type="button"
                    data-testid="supply-inspect-btn"
                    onClick={onRunInspection}
                    className="py-2 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-[11px] cursor-pointer"
                  >
                    تفتيش الصحة الآن 📋
                  </button>
                </div>
              </div>

              {/* Wholesale Contracts */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  <span>تعاقدات توريد الجملة ({hud.wholesaleContracts.length}/٣)</span>
                </div>
                {(Object.keys(WHOLESALE_CONTRACTS) as WholesaleContractId[]).map((cid) => {
                  const def = WHOLESALE_CONTRACTS[cid];
                  const signed = hud.wholesaleContracts.includes(cid);
                  return (
                    <div
                      key={cid}
                      className={`p-3 rounded-xl border space-y-1.5 ${
                        signed
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-stone-800 bg-stone-900/70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-100">{def.nameAr}</span>
                        <span className="font-mono-num text-emerald-400 font-bold">
                          خصم {def.discountPct}%
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-300">{def.subtitleAr}</div>
                      {signed ? (
                        <div className="text-[11px] font-extrabold text-emerald-400">
                          تعاقد ساري والتوريد الصباحي شغال ✓
                        </div>
                      ) : (
                        <button
                          type="button"
                          data-testid={`wholesale-sign-${cid}`}
                          disabled={!isOwner || hud.money < def.price}
                          onClick={() => onSignWholesale(cid)}
                          className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-extrabold text-[11px] font-mono-num cursor-pointer disabled:cursor-not-allowed"
                        >
                          توقيع التعاقد ({def.price.toLocaleString('en-US')} ج.م)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Inspection Records */}
              {hud.inspectionLogs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-stone-400">سجل تفتيش الصحة والتموين:</div>
                  {hud.inspectionLogs.slice(0, 4).map((rec) => (
                    <div
                      key={rec.id}
                      data-testid="inspection-log-entry"
                      className={`p-2.5 rounded-xl border text-[11px] ${
                        rec.passed
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                          : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                      }`}
                    >
                      <div className="font-bold">
                        اليوم {rec.day} ({rec.clockStr}) · نظافة {rec.hygieneScore}%
                      </div>
                      <div className="mt-0.5">{rec.summaryAr}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NEW APP D: 4-CREW ONLINE CHALLENGE LEADERBOARD */}
          {app === 'crew' && (
            <div className="space-y-3" data-testid="phone-view-crew">
              <div
                className="p-3.5 rounded-2xl border border-amber-400/45 space-y-1.5"
                style={{ backgroundColor: '#241b12' }}
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-200">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>تحدي الطاقم الأربعة — لوحة النقاط الحية</span>
                </div>
                <p className="text-[11px] text-stone-300">
                  كل سندوتش بيتجهز أو فاتورة كاشير أو توصيل دليفري بيزود نقاطك في الغرفة الأونلاين قدام أصحابك.
                </p>
              </div>

              <div className="space-y-2">
                {sortedCrewBoard.map((row, idx) => {
                  const prof = getResolvedCharacterProfile(row.characterId, hud.customProfiles);
                  const isMe = row.characterId === hud.selectedCharacterId;
                  return (
                    <div
                      key={row.characterId}
                      data-testid={`leaderboard-row-${row.characterId}`}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        isMe
                          ? 'border-amber-400 bg-amber-500/15'
                          : 'border-stone-800 bg-stone-900/70'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-100">
                          <span className="font-mono-num text-amber-400">#{idx + 1}</span>
                          <span>{prof.nameAr}</span>
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono-num mt-0.5">
                          سندوتشات {row.ordersCooked} · فواتير {row.cashierSales} · دليفري {row.deliveriesCompleted}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-stone-950 border border-amber-500/35 font-mono-num text-xs font-black text-emerald-400 shrink-0">
                        {row.points} نقطة
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* APP 1: INVENTORY AUDIT & MARKET PURCHASES */}
          {app === 'inventory' && (
            <div className="space-y-3" data-testid="phone-view-inventory">
              <div
                className="p-3 rounded-2xl border border-amber-500/40 space-y-2"
                style={{ backgroundColor: '#231b12' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-display font-bold text-xs text-amber-300">
                    <ShoppingBag className="w-4 h-4" />
                    <span>برنامج المشتريات وجرد المخزون</span>
                  </div>
                  <button
                    type="button"
                    data-testid="phone-run-audit-btn"
                    onClick={onPerformInventoryAudit}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-[11px] font-extrabold cursor-pointer"
                  >
                    إجراء جرد للمخزون الآن 📋
                  </button>
                </div>
                <p className="text-[11px] text-stone-200 leading-snug">
                  {hud.marketForecast.headlineAr}
                </p>
              </div>

              {/* Live Stock & Consumed Today */}
              <div className="space-y-2">
                {(Object.keys(INGREDIENTS) as IngredientId[]).map((id) => {
                  const def = INGREDIENTS[id];
                  const stock = hud.inventory[id];
                  const used = hud.inventoryConsumedToday[id] ?? 0;
                  const baseCost = def.unitCost * def.packSize;
                  const liveCost = computeDynamicPackCost(id, hud.marketForecast);
                  const isDeal = liveCost < baseCost;
                  const isHigh = liveCost > baseCost;
                  const isLow = stock <= def.lowThreshold;
                  return (
                    <div
                      key={id}
                      className="p-2.5 rounded-xl border border-stone-800 flex items-center justify-between gap-2"
                      style={{ backgroundColor: '#1b1720' }}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-100">
                          <span>{def.nameAr}</span>
                          {isDeal && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                              <TrendingDown className="w-3 h-3" />
                              -٢٥٪
                            </span>
                          )}
                          {isHigh && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-400">
                              <TrendingUp className="w-3 h-3" />
                              +٣٠٪
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono-num text-stone-400">
                          متاح:{' '}
                          <span className={isLow ? 'text-rose-400 font-bold' : 'text-amber-200'}>
                            {stock}
                          </span>
                          {' · '}استهلاك اليوم: {used}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={hud.money < liveCost}
                        onClick={() => onBuyIngredient(id)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-extrabold text-[11px] font-mono-num cursor-pointer disabled:cursor-not-allowed shrink-0"
                      >
                        شراء +{def.packSize} ({liveCost} ج)
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Latest Audit Logs */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-stone-400">
                  سجل تقارير الجرد المعتمدة ({hud.inventoryAuditLogs.length})
                </div>
                {hud.inventoryAuditLogs.length === 0 ? (
                  <div className="p-2.5 rounded-xl border border-stone-800 text-[11px] text-stone-400 bg-stone-900/50">
                    اضغط &ldquo;إجراء جرد للمخزون الآن&rdquo; لتوثيق الكميات والنواقص وقيمة البضاعة.
                  </div>
                ) : (
                  hud.inventoryAuditLogs.slice(0, 4).map((aud) => (
                    <div
                      key={aud.id}
                      data-testid="inventory-audit-entry"
                      className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-[11px] flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-emerald-200">
                          جرد اليوم {aud.day} ({aud.clockStr}) — {aud.auditorNameAr}
                        </div>
                        <div className="text-stone-300 font-mono-num">
                          إجمالي: {aud.totalUnits} وحدة · نواقص: {aud.lowStockCount}
                        </div>
                      </div>
                      <span className="font-mono-num font-extrabold text-amber-300 shrink-0">
                        {aud.estimatedValue.toLocaleString('en-US')} ج.م
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* APP 2: INSTAPAY SALARIES & WALLETS */}
          {app === 'instapay' && (
            <div className="space-y-3" data-testid="phone-view-instapay">
              <div
                className="p-3.5 rounded-2xl border border-emerald-500/45 space-y-2"
                style={{ backgroundColor: '#11221b' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" />
                    <span>نظام إنستا باي — محفظة المعلم والموظفين</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['mohamed', 'ahmed', 'ali', 'mahmoud'] as PlayerCharacterId[]).map((cid) => {
                    const p = getResolvedCharacterProfile(cid, hud.customProfiles);
                    const bal = hud.employeeWallets[cid] ?? 0;
                    return (
                      <div
                        key={cid}
                        data-testid={`instapay-wallet-${cid}`}
                        className={`p-2 rounded-xl border text-[11px] ${
                          hud.selectedCharacterId === cid
                            ? 'border-emerald-400 bg-emerald-500/15'
                            : 'border-stone-800 bg-stone-900/70'
                        }`}
                      >
                        <div className="font-bold text-amber-100 truncate">{p.nameAr}</div>
                        <div className="font-mono-num font-extrabold text-emerald-400">
                          {Math.round(bal).toLocaleString('en-US')} ج.م
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {isOwner ? (
                <div
                  className="p-3.5 rounded-2xl border border-amber-500/35 space-y-2.5"
                  style={{ backgroundColor: '#1d1822' }}
                >
                  <div className="text-xs font-extrabold text-amber-200">
                    إرسال مرتب / مكافأة عبر إنستا باي
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {(['ahmed', 'ali', 'mahmoud'] as PlayerCharacterId[]).map((cid) => {
                      const p = getResolvedCharacterProfile(cid, hud.customProfiles);
                      return (
                        <button
                          key={cid}
                          type="button"
                          data-testid={`instapay-target-${cid}`}
                          onClick={() => setIpRecipient(cid)}
                          className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold cursor-pointer ${
                            ipRecipient === cid
                              ? 'bg-emerald-500 text-stone-950 border-emerald-400'
                              : 'bg-stone-900 text-stone-200 border-stone-700'
                          }`}
                        >
                          {p.nameAr}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {['250', '500', '1000', '2500'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setIpAmount(amt)}
                        className="flex-1 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200 font-mono-num text-[11px] font-bold cursor-pointer"
                      >
                        {amt}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    data-testid="instapay-amount-input"
                    min={10}
                    value={ipAmount}
                    onChange={(e) => setIpAmount(e.target.value)}
                    placeholder="المبلغ بالجنيه"
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl border border-stone-700 bg-stone-950 text-emerald-300 font-mono-num text-sm font-bold focus:outline-none focus:border-emerald-400"
                  />

                  <input
                    type="text"
                    data-testid="instapay-note-input"
                    value={ipNote}
                    onChange={(e) => setIpNote(e.target.value)}
                    placeholder="سبب التحويل (مثال: قبض الشفت)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-700 bg-stone-950 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  />

                  <button
                    type="button"
                    data-testid="instapay-send-btn"
                    onClick={() => {
                      const val = Number(ipAmount);
                      onSendInstaPaySalary(ipRecipient, val, ipNote);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>تحويل فوري على موبايل الموظف (InstaPay)</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-stone-800 bg-stone-900/65 text-xs text-stone-300">
                  التحويلات صادرة من {OWNER_DISPLAY_NAME_AR} فقط — بيوصلك إشعار لحظي على موبايلك فور إرسال القبض!
                </div>
              )}

              {/* Transfer History */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-stone-400">
                  سجل تحويلات إنستا باي ({hud.instaPayTransfers.length})
                </div>
                {hud.instaPayTransfers.length === 0 ? (
                  <div className="p-2.5 rounded-xl border border-stone-800 text-[11px] text-stone-400">
                    لم يتم إرسال أي رواتب بعد اليوم.
                  </div>
                ) : (
                  hud.instaPayTransfers.slice(0, 6).map((tr) => (
                    <div
                      key={tr.id}
                      data-testid="instapay-transfer-item"
                      className="p-2.5 rounded-xl border border-stone-800 bg-stone-900/70 flex items-center justify-between gap-2 text-[11px]"
                    >
                      <div>
                        <div className="font-bold text-emerald-200">
                          إلى {tr.toNameAr} · {tr.noteAr}
                        </div>
                        <div className="text-stone-400">
                          اليوم {tr.day} ({tr.clockStr}) · من {tr.fromNameAr}
                        </div>
                      </div>
                      <span className="font-mono-num font-extrabold text-emerald-400 shrink-0">
                        +{tr.amount.toLocaleString('en-US')} ج.م
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* APP 3: ELECTRONIC LED AD BOARD */}
          {app === 'ads' && (
            <div className="space-y-3" data-testid="phone-view-ads">
              {/* Live Preview of Shop LED Screen */}
              <div
                className={`p-3.5 rounded-2xl border-2 text-center space-y-1.5 ${
                  adActive
                    ? 'border-cyan-400/70 bg-[#0d1c29]'
                    : 'border-stone-700 bg-stone-900/70 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className={adActive ? 'text-emerald-400' : 'text-rose-400'}>
                    {adActive ? '● شاشة المحل LED شغالة' : '○ الشاشة مطفية'}
                  </span>
                  <span className="text-cyan-300 font-mono-num">
                    إقبال الزبائن ×{adBoost.spawnMultiplier.toFixed(2)}
                  </span>
                </div>
                <div className="font-display font-extrabold text-sm text-amber-300">
                  {adHeadline || 'عروض المعلم'}
                </div>
                <div className="text-[11px] text-cyan-100 leading-snug">{adPromo}</div>
                <div className="inline-block px-3 py-0.5 rounded-full bg-rose-500 text-white font-mono-num text-xs font-black">
                  خصم {adDiscount}%
                </div>
              </div>

              {!isOwner && (
                <div className="p-2.5 rounded-xl border border-amber-500/35 bg-amber-500/10 text-[11px] text-amber-200">
                  تحكم شاشة الإعلانات الخاصة بالمحل متاح لـ {OWNER_DISPLAY_NAME_AR}.
                </div>
              )}

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-200">حالة لوحة الإعلانات</span>
                  <button
                    type="button"
                    data-testid="adboard-toggle-btn"
                    disabled={!isOwner}
                    onClick={() => setAdActive((v) => !v)}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer disabled:opacity-50 ${
                      adActive
                        ? 'bg-emerald-500 text-stone-950'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {adActive ? 'مفتوحة على الشاشة ✓' : 'تشغيل الشاشة'}
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    عنوان العرض الرئيسي
                  </label>
                  <input
                    type="text"
                    data-testid="adboard-headline-input"
                    disabled={!isOwner}
                    value={adHeadline}
                    onChange={(e) => setAdHeadline(e.target.value)}
                    maxLength={56}
                    className="w-full px-3 py-2 rounded-xl border border-stone-700 bg-stone-950 text-amber-200 text-xs font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    تفاصيل العرض والخصم
                  </label>
                  <input
                    type="text"
                    data-testid="adboard-promo-input"
                    disabled={!isOwner}
                    value={adPromo}
                    onChange={(e) => setAdPromo(e.target.value)}
                    maxLength={90}
                    className="w-full px-3 py-2 rounded-xl border border-stone-700 bg-stone-950 text-stone-100 text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 mb-1">
                    <span>نسبة الخصم لجذب الزبائن</span>
                    <span className="font-mono-num text-amber-300">{adDiscount}%</span>
                  </div>
                  <input
                    type="range"
                    data-testid="adboard-discount-input"
                    disabled={!isOwner}
                    min={0}
                    max={50}
                    step={5}
                    value={adDiscount}
                    onChange={(e) => setAdDiscount(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-stone-400 font-bold">قوالب عروض جاهزة:</div>
                  {AD_PRESETS.map((p) => (
                    <button
                      key={p.headline}
                      type="button"
                      disabled={!isOwner}
                      onClick={() => {
                        setAdActive(true);
                        setAdHeadline(p.headline);
                        setAdPromo(p.promo);
                        setAdDiscount(p.discount);
                      }}
                      className="w-full p-2 rounded-xl border border-stone-800 bg-stone-900/70 hover:border-cyan-400/50 text-right text-[11px] text-stone-200 cursor-pointer disabled:opacity-50"
                    >
                      {p.headline} ({p.discount}%)
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  data-testid="adboard-save-btn"
                  disabled={!isOwner}
                  onClick={() =>
                    onUpdateAdBoard({
                      active: adActive,
                      headlineAr: adHeadline,
                      promoTextAr: adPromo,
                      discountPct: adDiscount,
                    })
                  }
                  className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-extrabold text-xs cursor-pointer"
                >
                  نشر العرض على شاشة المحل فوراً 📺
                </button>
              </div>
            </div>
          )}

          {/* APP 4: REAL ESTATE, RESTAURANT FLOORS & BRANCHES */}
          {app === 'expansion' && (
            <div className="space-y-3" data-testid="phone-view-expansion">
              {/* Passive Real Estate Income Summary */}
              <div
                className="p-3 rounded-2xl border border-emerald-500/40 flex items-center justify-between gap-2"
                style={{ backgroundColor: '#13221b' }}
              >
                <div>
                  <div className="text-[11px] text-emerald-300 font-bold">
                    الدخل اليومي للعقارات والفروع والأدوار
                  </div>
                  <div className="font-mono-num text-sm font-extrabold text-white">
                    +{passiveRealEstateDaily.toLocaleString('en-US')} ج.م / يوم
                  </div>
                </div>
                {totalDividends > 0 && (
                  <button
                    type="button"
                    onClick={onCollectShopProfits}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-stone-950 text-[11px] font-extrabold cursor-pointer"
                  >
                    تحصيل ({totalDividends} ج)
                  </button>
                )}
              </div>

              {/* Restaurant Floors Expansion */}
              <div
                className="p-3.5 rounded-2xl border border-amber-500/40 space-y-2"
                style={{ backgroundColor: '#231b14' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-200 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>تعلية أدوار مطعم المعلم</span>
                  </span>
                  <span className="font-mono-num text-xs font-bold text-emerald-400">
                    {hud.restaurantFloors}/٣ أدوار
                  </span>
                </div>
                <p className="text-[11px] text-stone-300">
                  كل دور إضافي يبني صالة طعام علوية بسلم حقيقي وروف ويزيد ربح المطعم +٤,٥٠٠ ج.م يومياً.
                </p>
                <button
                  type="button"
                  data-testid="expansion-upgrade-floor-btn"
                  disabled={!isOwner || hud.restaurantFloors >= 3}
                  onClick={onUpgradeRestaurantFloor}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-extrabold text-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  {hud.restaurantFloors >= 3
                    ? 'مبني ٣ أدوار بالكامل ✓'
                    : `بناء الدور ${hud.restaurantFloors + 1} (${(
                        RESTAURANT_FLOOR_UPGRADE_COST[hud.restaurantFloors + 1] ?? 220_000
                      ).toLocaleString('en-US')} ج.م)`}
                </button>
              </div>

              {/* Restaurant Branches */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-300">
                  فروع مطعم المعلم في المدينة ({hud.ownedBranchIds.length}/٣)
                </div>
                {RESTAURANT_BRANCHES.map((br) => {
                  const owned = hud.ownedBranchIds.includes(br.id);
                  return (
                    <div
                      key={br.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        owned
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-stone-800 bg-stone-900/60'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-amber-100 truncate">
                          {br.nameAr}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {br.streetAr} · ربح +{br.dailyProfit.toLocaleString('en-US')} ج/يوم
                        </div>
                      </div>
                      {owned ? (
                        <span className="text-[11px] font-extrabold text-emerald-400 shrink-0">
                          مفتوح ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          data-testid={`expansion-buy-branch-${br.id}`}
                          disabled={!isOwner || hud.money < br.price}
                          onClick={() => onBuyBranch(br.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 text-[11px] font-extrabold font-mono-num shrink-0 cursor-pointer"
                        >
                          {br.price.toLocaleString('en-US')} ج
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Ownable Towers / Buildings */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-300">
                  شراء العماير والأبراج ({hud.ownedBuildingIds.length}/{OWNABLE_BUILDINGS.length})
                </div>
                {OWNABLE_BUILDINGS.map((bld) => {
                  const owned = hud.ownedBuildingIds.includes(bld.id);
                  return (
                    <div
                      key={bld.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        owned
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-stone-800 bg-stone-900/60'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-stone-100 truncate">
                          {bld.nameAr} ({bld.floors} أدوار)
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {bld.streetAr} · إيجار +{bld.dailyRentIncome.toLocaleString('en-US')} ج/يوم
                        </div>
                      </div>
                      {owned ? (
                        <span className="text-[11px] font-extrabold text-emerald-400 shrink-0">
                          ملك المعلم ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          data-testid={`expansion-buy-building-${bld.id}`}
                          disabled={!isOwner || hud.money < bld.price}
                          onClick={() => onBuyBuilding(bld.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 text-[11px] font-extrabold font-mono-num shrink-0 cursor-pointer"
                        >
                          {bld.price.toLocaleString('en-US')} ج
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Corniche Nile Luxury Villa */}
              <div
                className="p-3.5 rounded-2xl border border-amber-400/55 space-y-2"
                style={{ backgroundColor: '#241b12' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-amber-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>فيلا كورنيش النيل الفاخرة</span>
                  </span>
                  <span className="font-mono-num text-[11px] font-extrabold text-emerald-400">
                    +{CORNICHE_VILLA_DAILY_INCOME.toLocaleString('en-US')} ج/يوم
                  </span>
                </div>
                <p className="text-[11px] text-stone-300">
                  فيلا خاصة على النيل للمعلم محمد وأسرته والطاقم بعائد استثماري يومي ضخم.
                </p>
                <button
                  type="button"
                  data-testid="expansion-buy-villa-btn"
                  disabled={!isOwner || hud.cornicheVillaOwned || hud.money < CORNICHE_VILLA_PRICE}
                  onClick={onBuyCornicheVilla}
                  className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-extrabold text-xs font-mono-num cursor-pointer disabled:cursor-not-allowed"
                >
                  {hud.cornicheVillaOwned
                    ? 'فيلا كورنيش النيل مملوكة للمعلم ✓'
                    : `شراء فيلا كورنيش النيل (${CORNICHE_VILLA_PRICE.toLocaleString('en-US')} ج.م)`}
                </button>
              </div>

              {/* Luxury Apartment Furniture */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-300">
                  أثاث شقة الدور التاني الفاخر ({hud.ownedFurnitureIds.length}/٤)
                </div>
                {(Object.keys(FURNITURE_CATALOG) as FurnitureItemId[]).map((fid) => {
                  const f = FURNITURE_CATALOG[fid];
                  const owned = hud.ownedFurnitureIds.includes(fid);
                  return (
                    <div
                      key={fid}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        owned
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-stone-800 bg-stone-900/65'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-amber-100 truncate">
                          {f.nameAr}
                        </div>
                        <div className="text-[10px] text-stone-400">{f.subtitleAr}</div>
                      </div>
                      {owned ? (
                        <span className="text-[11px] font-extrabold text-emerald-400 shrink-0">
                          مفروش ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          data-testid={`expansion-buy-furniture-${fid}`}
                          disabled={!isOwner || hud.money < f.price}
                          onClick={() => onBuyFurniture(fid)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 text-[11px] font-extrabold font-mono-num shrink-0 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {f.price.toLocaleString('en-US')} ج
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* APP 5: EDITABLE NAMES & PROFESSIONS */}
          {app === 'profiles' && (
            <div className="space-y-3" data-testid="phone-view-profiles">
              <div className="p-3 rounded-xl border border-amber-500/45 bg-amber-500/10 space-y-1">
                <div className="flex items-center justify-between text-xs font-extrabold text-amber-200">
                  <span>{OWNER_DISPLAY_NAME_AR}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-stone-950 text-[10px]">
                    ثابت 🔒
                  </span>
                </div>
                <div className="text-[11px] text-stone-300">
                  {OWNER_ROLE_TITLE_AR} — الاسم والمنصب مثبتان للمعلم محمد حامد دائماً.
                </div>
              </div>

              {(['ahmed', 'ali', 'mahmoud'] as const).map((cid) => (
                <div
                  key={cid}
                  className="p-3 rounded-xl border border-stone-800 bg-stone-900/60 space-y-2"
                >
                  <div className="text-[11px] font-bold text-emerald-300">
                    تخصيص {PLAYER_CHARACTERS[cid].nameAr}
                  </div>
                  <input
                    type="text"
                    data-testid={`profile-name-${cid}`}
                    disabled={!isOwner}
                    value={profForm[cid].nameAr}
                    onChange={(e) =>
                      setProfForm((prev) => ({
                        ...prev,
                        [cid]: { ...prev[cid], nameAr: e.target.value },
                      }))
                    }
                    placeholder="الاسم"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-700 bg-stone-950 text-stone-100 text-xs font-bold"
                  />
                  <input
                    type="text"
                    data-testid={`profile-role-${cid}`}
                    disabled={!isOwner}
                    value={profForm[cid].roleTitleAr}
                    onChange={(e) =>
                      setProfForm((prev) => ({
                        ...prev,
                        [cid]: { ...prev[cid], roleTitleAr: e.target.value },
                      }))
                    }
                    placeholder="المهنة"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-700 bg-stone-950 text-amber-200 text-xs"
                  />
                </div>
              ))}

              <div className="p-3 rounded-xl border border-stone-800 bg-stone-900/60 space-y-2">
                <div className="text-[11px] font-bold text-pink-300">أسماء الأسرة والأولاد</div>
                <input
                  type="text"
                  data-testid="profile-spouse-name"
                  disabled={!isOwner}
                  value={profForm.spouseNameAr}
                  onChange={(e) =>
                    setProfForm((p) => ({ ...p, spouseNameAr: e.target.value }))
                  }
                  placeholder="اسم الزوجة"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-700 bg-stone-950 text-stone-100 text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    data-testid="profile-son-name"
                    disabled={!isOwner}
                    value={profForm.sonNameAr}
                    onChange={(e) =>
                      setProfForm((p) => ({ ...p, sonNameAr: e.target.value }))
                    }
                    placeholder="اسم الابن"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-700 bg-stone-950 text-stone-100 text-xs"
                  />
                  <input
                    type="text"
                    data-testid="profile-daughter-name"
                    disabled={!isOwner}
                    value={profForm.daughterNameAr}
                    onChange={(e) =>
                      setProfForm((p) => ({ ...p, daughterNameAr: e.target.value }))
                    }
                    placeholder="اسم الابنة"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-700 bg-stone-950 text-stone-100 text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                data-testid="profiles-save-btn"
                disabled={!isOwner}
                onClick={() => onUpdateCustomProfiles(profForm)}
                className="w-full py-2.5 rounded-xl bg-purple-400 hover:bg-purple-300 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-extrabold text-xs cursor-pointer"
              >
                حفظ الأسامي والمهن الجديدة ✓
              </button>
            </div>
          )}

          {/* APP 6: GARAGE, PICKUP, MOTO & OWNER LOCK */}
          {app === 'garage' && (
            <div className="space-y-3" data-testid="phone-view-garage">
              <div
                className="p-3.5 rounded-2xl border border-sky-500/45 space-y-2"
                style={{ backgroundColor: '#131d29' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-extrabold text-sky-200 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>لوك السيارة الخاص بالمعلم محمد</span>
                  </div>
                  <span className="font-mono-num text-[11px] text-amber-300">
                    كابينة {hud.cabSeatCount}/4 · صندوق {hud.flatbedSeatCount}/4
                  </span>
                </div>
                <button
                  type="button"
                  data-testid="garage-owner-lock-btn"
                  disabled={!isOwner}
                  onClick={onToggleVehicleLock}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                    hud.vehicleLockedByOwner
                      ? 'bg-rose-500 hover:bg-rose-400 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
                  }`}
                >
                  {hud.vehicleLockedByOwner ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>السيارة مقفولة بلوك المعلم (اضغط للفتح)</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>قفل السيارة على المعلم محمد فقط 🔒</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                {Object.values(VEHICLE_CATALOG).map((v) => {
                  const owned = hud.ownedVehicleIds.includes(v.id);
                  const active = hud.activeVehicleId === v.id;
                  return (
                    <div
                      key={v.id}
                      className={`p-3 rounded-xl border space-y-2 ${
                        active
                          ? 'border-amber-400 bg-amber-500/12'
                          : 'border-stone-800 bg-stone-900/65'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-amber-200">{v.nameAr}</span>
                        <span className="font-mono-num text-[11px] text-stone-300">
                          {v.topSpeedKmh} كم/س
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 leading-snug">{v.subtitleAr}</div>
                      {!owned ? (
                        <button
                          type="button"
                          data-testid={`phone-buy-vehicle-${v.id}`}
                          disabled={hud.money < v.price}
                          onClick={() => onBuyVehicle(v.id)}
                          className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 text-stone-950 text-xs font-extrabold cursor-pointer"
                        >
                          شراء ({v.price} ج.م)
                        </button>
                      ) : active ? (
                        <div className="text-center text-[11px] font-bold text-emerald-400">
                          مركبتك النشطة الآن أمامك ✓
                        </div>
                      ) : (
                        <button
                          type="button"
                          data-testid={`phone-select-vehicle-${v.id}`}
                          onClick={() => onSelectVehicle(v.id)}
                          className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-extrabold cursor-pointer"
                        >
                          تبديل وقيادة الآن
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* APP 7: BENHA PRIVATE SCHOOL, FAMILY & COMPANIONS */}
          {app === 'family' && (
            <div className="space-y-3" data-testid="phone-view-family">
              {/* Benha Private School Card */}
              <div
                className="p-3.5 rounded-2xl border border-blue-500/45 space-y-2.5"
                style={{ backgroundColor: '#131b2b' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-display font-bold text-xs text-blue-200">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    <span>{SCHOOL_CAMPUSES[0].nameAr}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300">
                    ٣ مباني × ٤ طوابق + ملاعب
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800">
                    <div className="font-bold text-amber-200">
                      الابن: {hud.customProfiles.sonNameAr}
                    </div>
                    <div className="text-stone-400">{hud.schoolEnrollment.sonGradeAr}</div>
                    <div
                      className={
                        hud.schoolEnrollment.sonEnrolled
                          ? 'text-emerald-400 font-bold mt-0.5'
                          : 'text-amber-300 mt-0.5'
                      }
                    >
                      {hud.schoolEnrollment.sonEnrolled ? 'مقيد بالمدرسة ✓' : 'لم يُقدَّم بعد'}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800">
                    <div className="font-bold text-pink-200">
                      الابنة: {hud.customProfiles.daughterNameAr}
                    </div>
                    <div className="text-stone-400">{hud.schoolEnrollment.daughterGradeAr}</div>
                    <div
                      className={
                        hud.schoolEnrollment.daughterEnrolled
                          ? 'text-emerald-400 font-bold mt-0.5'
                          : 'text-amber-300 mt-0.5'
                      }
                    >
                      {hud.schoolEnrollment.daughterEnrolled ? 'مقيدة بالمدرسة ✓' : 'لم تُقدَّم بعد'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="school-enroll-both-btn"
                  disabled={
                    hud.schoolEnrollment.sonEnrolled && hud.schoolEnrollment.daughterEnrolled
                  }
                  onClick={() => onEnrollBenhaSchool('both')}
                  className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:bg-emerald-500/20 disabled:text-emerald-300 text-stone-950 font-extrabold text-xs cursor-pointer"
                >
                  {hud.schoolEnrollment.sonEnrolled && hud.schoolEnrollment.daughterEnrolled
                    ? 'تم قيد الابن والابنة في مدرسة بنها الخاصة ✓'
                    : `تقديم الابن والابنة في مدرسة بنها (${(SCHOOL_TUITION_COST * 2).toLocaleString('en-US')} ج.م)`}
                </button>

                {/* School Report Card & Honor Ceremony */}
                <div className="p-2.5 rounded-xl bg-stone-950/75 border border-blue-400/30 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-amber-200">
                    <span>شهادة درجات مدرسة بنها</span>
                    <span className="font-mono-num text-emerald-400">
                      حفلات التكريم: {hud.schoolReport.ceremoniesAttended}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-1.5 rounded-lg bg-stone-900/90">
                      <div className="font-bold text-amber-200">
                        {hud.customProfiles.sonNameAr}: {hud.schoolReport.sonScore}%
                      </div>
                      <div className="text-stone-400">{hud.schoolReport.sonGradeNoteAr}</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-stone-900/90">
                      <div className="font-bold text-pink-200">
                        {hud.customProfiles.daughterNameAr}: {hud.schoolReport.daughterScore}%
                      </div>
                      <div className="text-stone-400">{hud.schoolReport.daughterGradeNoteAr}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="school-ceremony-btn"
                    onClick={onAttendSchoolCeremony}
                    className="w-full py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-[11px] cursor-pointer"
                  >
                    حضور حفل التفوق والتكريم (+٢,٥٠٠ ج.م و+٨ سمعة) 🏆
                  </button>
                </div>
              </div>

              {/* Accompanying List */}
              <div
                className="p-3 rounded-2xl border border-emerald-500/35 space-y-2"
                style={{ backgroundColor: '#14211b' }}
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
                  <span>المرافقين معك الآن ({hud.accompanyingList.length}/٨)</span>
                  {hud.accompanyingList.length > 0 && (
                    <button
                      type="button"
                      onClick={onBoardCarWithCompanions}
                      className="px-2.5 py-1 rounded-lg bg-sky-400 text-stone-950 text-[10px] font-extrabold cursor-pointer"
                    >
                      ركبهم العربية 🚗
                    </button>
                  )}
                </div>
                {hud.accompanyingList.length === 0 ? (
                  <p className="text-[11px] text-stone-400">
                    قرب من ابنك أو زوجتك أو أي حد واضغط [E] ثم &ldquo;امسك إيدي 🤝&rdquo; أو &ldquo;اصطحبه معي&rdquo;.
                  </p>
                ) : (
                  hud.accompanyingList.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-xl bg-stone-900/75 border border-stone-800 flex items-center justify-between text-[11px]"
                    >
                      <span className="font-bold text-amber-100">
                        {p.nameAr} {p.holdingHand ? '🤝' : ''}
                      </span>
                      <span className="text-sky-300">
                        {p.seatZone === 'cab'
                          ? 'في الكابينة'
                          : p.seatZone === 'flatbed'
                            ? 'في الصندوق الخلفي'
                            : 'يمشي معك'}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Corniche Companion Joyride Card */}
              <div
                className="p-3.5 rounded-2xl border border-pink-500/40 space-y-2"
                style={{ backgroundColor: '#221520' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-display font-bold text-xs text-pink-200">
                    <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                    <span>فسحة الكورنيش بالسيارة</span>
                  </div>
                  {hud.companionNameAr && (
                    <span className="text-[11px] font-bold text-emerald-300">
                      معاك: {hud.companionNameAr}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  data-testid="phone-companion-btn"
                  disabled={!canInviteCompanion}
                  onClick={onInviteCompanion}
                  className={`w-full py-2 rounded-xl font-extrabold text-xs cursor-pointer disabled:opacity-50 ${
                    hud.companionNameAr
                      ? 'bg-stone-800 text-amber-200 border border-stone-600'
                      : 'bg-pink-500 hover:bg-pink-400 text-stone-950'
                  }`}
                >
                  {hud.companionNameAr
                    ? 'إنهاء الفسحة'
                    : activePartnerDef
                      ? `دعوة ${activePartnerDef.nameAr} لفسحة الكورنيش 🚗`
                      : 'ارفع المودة لـ ٤٥٪ الأول لفسحة الكورنيش'}
                </button>
              </div>

              {/* Family Contacts */}
              {hud.householdFamily.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl border border-stone-800 bg-stone-900/65 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-amber-100">{m.nameAr}</div>
                    <div className="text-[10px] text-stone-400 truncate">
                      {m.roleAr} · {m.roomAr}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCallFamily(m.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-stone-950 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>اتصال</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* APP 8: 98 STREETS MAP, DELIVERY & UNIVERSAL OBJECT CHAT */}
          {app === 'map' && (
            <div className="space-y-3" data-testid="phone-view-map">
              <div
                className="p-3 rounded-2xl border border-amber-500/35 flex items-center justify-between gap-2 text-xs"
                style={{ backgroundColor: '#1f1914' }}
              >
                <div>
                  <div className="text-[10px] text-stone-400">موقعك GPS الآن</div>
                  <div className="font-bold text-amber-200">{hud.currentStreetAr}</div>
                  <div className="text-[11px] text-stone-300">{hud.playerZoneAr}</div>
                </div>
                <Navigation className="w-5 h-5 text-amber-400 shrink-0" />
              </div>

              {/* Quick Taxi / Delivery Dispatch */}
              <button
                type="button"
                data-testid="phone-taxi-btn"
                onClick={onQuickTaxi}
                className="w-full py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-stone-950 font-extrabold text-xs cursor-pointer"
              >
                {hud.activeTaxi
                  ? `متابعة مشوار: ${hud.activeTaxi.passengerName}`
                  : 'تشغيل مشوار تاكسي / دليفري في الـ ٩٨ شارع'}
              </button>

              {/* Universal Object Chat Shortcuts */}
              <div
                className="p-3 rounded-2xl border border-cyan-500/35 space-y-2"
                style={{ backgroundColor: '#131b22' }}
              >
                <div className="text-xs font-extrabold text-cyan-200 flex items-center gap-1.5">
                  <MessageSquareText className="w-4 h-4 text-cyan-400" />
                  <span>كلم أي شيء في المدينة بالكيبورد</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {OBJECT_CHAT_SHORTCUTS.map((o) => (
                    <button
                      key={o.kind}
                      type="button"
                      data-testid={`phone-chat-object-${o.kind}`}
                      onClick={() => {
                        onClose();
                        onStartObjectDialogue(o.kind);
                      }}
                      className="p-2 rounded-xl border border-stone-800 bg-stone-900/75 hover:border-cyan-400/55 text-[11px] font-bold text-stone-100 text-right cursor-pointer"
                    >
                      {o.labelAr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key City Destinations */}
              <div className="p-3 rounded-xl border border-stone-800 bg-stone-900/60 space-y-1 text-[11px]">
                <div className="font-bold text-amber-300">أهم معالم المدينة:</div>
                <div className="text-stone-300">• {GAS_STATION_DEF.nameAr} — {GAS_STATION_DEF.streetAr}</div>
                <div className="text-stone-300">• {REMOTE_CREW_APARTMENT.nameAr} — {REMOTE_CREW_APARTMENT.streetAr}</div>
                <div className="text-stone-300">• {SCHOOL_CAMPUSES[0].nameAr} — {SCHOOL_CAMPUSES[0].subtitleAr}</div>
                <div className="text-stone-300">• جميع الـ {CITY_SHOPS.length} محل مفتوحين وبجواهم منتجات وموظفين</div>
              </div>

              {/* 6 Districts */}
              <div className="space-y-1.5">
                {Object.values(DISTRICTS).map((d) => {
                  const isHere = currentCtx.district.id === d.id;
                  return (
                    <div
                      key={d.id}
                      className={`p-2.5 rounded-xl border ${
                        isHere ? 'border-amber-400' : 'border-stone-800'
                      }`}
                      style={{ backgroundColor: isHere ? '#251e14' : '#1b1720' }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-xs font-bold flex items-center gap-1"
                          style={{ color: d.accentHex }}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          {d.nameAr}
                        </span>
                        {isHere && (
                          <span className="text-[10px] font-bold text-emerald-400">هنا الآن</span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{d.vibeAr}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* APP 9: HUNGER & THIRST FOR EVERYONE */}
          {app === 'needs' && (
            <div className="space-y-3" data-testid="phone-view-needs">
              <div className="p-3.5 rounded-2xl border border-lime-500/40 bg-[#142016] space-y-2.5">
                <div className="text-xs font-extrabold text-lime-200">
                  احتياجاتك من الأكل والشرب
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-testid="phone-eat-btn"
                    onClick={onEatFood}
                    className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs cursor-pointer"
                  >
                    🥙 وجبة سخنة (+شبع)
                  </button>
                  <button
                    type="button"
                    data-testid="phone-drink-btn"
                    onClick={onDrinkWater}
                    className="py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-stone-950 font-extrabold text-xs cursor-pointer"
                  >
                    🥤 ماء وعصير (+ارتواء)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-400">
                  مستوى الجوع والعطش لكل الطاقم:
                </div>
                {(['mohamed', 'ahmed', 'ali', 'mahmoud'] as PlayerCharacterId[]).map((cid) => {
                  const prof = getResolvedCharacterProfile(cid, hud.customProfiles);
                  const st =
                    cid === hud.selectedCharacterId ? hud.playerNeeds : hud.crewNeeds[cid];
                  return (
                    <div
                      key={cid}
                      className="p-2.5 rounded-xl border border-stone-800 bg-stone-900/65 space-y-1.5"
                    >
                      <div className="text-xs font-bold text-amber-100">{prof.nameAr}</div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <div className="flex justify-between text-amber-300 mb-0.5">
                            <span>الشبع</span>
                            <span className="font-mono-num">{Math.round(st.hunger)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-stone-800 overflow-hidden">
                            <div
                              className="h-full bg-amber-400"
                              style={{ width: `${Math.round(st.hunger)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sky-300 mb-0.5">
                            <span>الارتواء</span>
                            <span className="font-mono-num">{Math.round(st.thirst)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-stone-800 overflow-hidden">
                            <div
                              className="h-full bg-sky-400"
                              style={{ width: `${Math.round(st.thirst)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Smartphone Dock */}
        <div
          className="px-3 py-2 border-t border-stone-800 grid grid-cols-5 gap-1"
          style={{ backgroundColor: '#17141b' }}
        >
          {(
            [
              ['home', 'الرئيسية', <Home key="h" className="w-4 h-4" />],
              ['instapay', 'إنستا باي', <Wallet key="w" className="w-4 h-4" />],
              ['ads', 'الإعلانات', <MonitorPlay key="a" className="w-4 h-4" />],
              ['inventory', 'الجرد', <ClipboardCheck key="i" className="w-4 h-4" />],
              ['map', 'الخريطة', <MapPin key="m" className="w-4 h-4" />],
            ] as Array<[PhoneAppId, string, React.ReactNode]>
          ).map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setApp(id)}
              className={`py-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold cursor-pointer ${
                app === id
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
