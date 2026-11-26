import { CITY_SHOPS, getStreetContext } from './cityLayout';
import {
  ActiveStreetEvent,
  FamilyActivityId,
  HouseholdMemberState,
  StreetEventType,
} from './types';

export interface StreetEventSpawnAnchor {
  x: number;
  z: number;
  streetAr: string;
}

const FIGHT_ANCHORS: StreetEventSpawnAnchor[] = [
  { x: -1.8, z: -8.2, streetAr: 'شارع المعلم الرئيسي' },
  { x: 3.2, z: 12.5, streetAr: 'شارع قهوة الحارة' },
  { x: -24.0, z: -11.5, streetAr: 'شارع الخليفة' },
  { x: 24.5, z: -14.0, streetAr: 'شارع ورشة الأسطى بليغ' },
];

const BROKEN_CAR_ANCHORS: StreetEventSpawnAnchor[] = [
  { x: 2.2, z: -19.5, streetAr: 'شارع السوق وبنزين المعلم' },
  { x: -2.2, z: 24.5, streetAr: 'شارع قهوة الحارة' },
  { x: 16.5, z: -11.5, streetAr: 'شارع سوق الخضار' },
  { x: -18.5, z: -39.5, streetAr: 'شارع الشريفين' },
];

const VENDOR_ANCHORS: StreetEventSpawnAnchor[] = [
  { x: 5.2, z: -6.5, streetAr: 'شارع المعلم الرئيسي' },
  { x: -5.4, z: 10.5, streetAr: 'حارة العيش والملح' },
  { x: -6.0, z: -24.0, streetAr: 'شارع السوق وبنزين المعلم' },
  { x: 5.8, z: 22.0, streetAr: 'شارع قهوة الحارة' },
];

const WEDDING_ANCHORS: StreetEventSpawnAnchor[] = [
  { x: 0, z: -20.5, streetAr: 'شارع السوق وبنزين المعلم' },
  { x: 0, z: 24.5, streetAr: 'شارع قهوة الحارة' },
  { x: -16.0, z: 16.5, streetAr: 'حارة العيش والملح' },
];

export function generateRandomStreetEvent(
  id: string,
  randFn: () => number = Math.random,
  forcedType?: StreetEventType,
): ActiveStreetEvent {
  const types: StreetEventType[] = [
    'street_fight',
    'broken_car',
    'flash_sale',
    'vendor_rush',
    'wedding_feast',
  ];
  const type = forcedType ?? types[Math.floor(randFn() * types.length)];

  if (type === 'street_fight') {
    const spot = FIGHT_ANCHORS[Math.floor(randFn() * FIGHT_ANCHORS.length)];
    return {
      id,
      type,
      titleAr: 'مشاجرة وخناقة في الحارة!',
      descriptionAr: 'زبونين بيتخانقوا على أولوية الدور — الحق فض المشاجرة [E]',
      streetAr: spot.streetAr,
      x: spot.x,
      z: spot.z,
      timeRemaining: 55,
      maxTime: 55,
      rewardMoney: 45,
      rewardRep: 6,
      resolved: false,
    };
  }

  if (type === 'broken_car') {
    const spot = BROKEN_CAR_ANCHORS[Math.floor(randFn() * BROKEN_CAR_ANCHORS.length)];
    return {
      id,
      type,
      titleAr: 'سيارة معطلة في نص الطريق!',
      descriptionAr: 'عربية وقفت بدخان — ساعد السواق وصلّح العطل [E]',
      streetAr: spot.streetAr,
      x: spot.x,
      z: spot.z,
      timeRemaining: 60,
      maxTime: 60,
      rewardMoney: 65,
      rewardRep: 5,
      resolved: false,
    };
  }

  if (type === 'flash_sale') {
    const shop = CITY_SHOPS[Math.floor(randFn() * CITY_SHOPS.length)];
    const ctx = getStreetContext(shop.x, shop.z);
    return {
      id,
      type,
      titleAr: `عرض خاص مفاجئ في ${shop.nameAr}!`,
      descriptionAr: 'خصم ٣٥٪ على البضاعة والمكونات لفترة محدودة — الحق اشتري!',
      streetAr: shop.streetNameAr || ctx.street.nameAr,
      x: shop.x,
      z: shop.z,
      timeRemaining: 65,
      maxTime: 65,
      rewardMoney: 25,
      rewardRep: 3,
      shopId: shop.id,
      discountPct: 35,
      resolved: false,
    };
  }

  if (type === 'wedding_feast') {
    const spot = WEDDING_ANCHORS[Math.floor(randFn() * WEDDING_ANCHORS.length)];
    return {
      id,
      type,
      titleAr: 'فرح في الحارة وعزومة ساندوتشات!',
      descriptionAr: 'أهل الفرح طالبين واجب الضيافة — روح لمكان الزينة [E] واستلم الأجر الكبير',
      streetAr: spot.streetAr,
      x: spot.x,
      z: spot.z,
      timeRemaining: 75,
      maxTime: 75,
      rewardMoney: 115,
      rewardRep: 10,
      resolved: false,
    };
  }

  const spot = VENDOR_ANCHORS[Math.floor(randFn() * VENDOR_ANCHORS.length)];
  return {
    id,
    type: 'vendor_rush',
    titleAr: 'زحمة رزق وبائع متجول في الشارع!',
    descriptionAr: 'عربية فاكهة وحركة زباين زيادة — باركله واسمع صوت الحارة [E]',
    streetAr: spot.streetAr,
    x: spot.x,
    z: spot.z,
    timeRemaining: 50,
    maxTime: 50,
    rewardMoney: 40,
    rewardRep: 4,
    resolved: false,
  };
}

export function tickRandomStreetEvent(
  ev: ActiveStreetEvent | null,
  dt: number,
): ActiveStreetEvent | null {
  if (!ev || ev.resolved) return null;
  const nextTime = ev.timeRemaining - dt;
  if (nextTime <= 0) return null;
  return { ...ev, timeRemaining: nextTime };
}

export function resolveStreetEventReward(ev: ActiveStreetEvent): {
  moneyGain: number;
  repGain: number;
  toastAr: string;
} {
  if (ev.type === 'street_fight') {
    return {
      moneyGain: ev.rewardMoney,
      repGain: ev.rewardRep,
      toastAr: `برافو يا معلم! فضيت الخناقة بالكلمة الطيبة (+${ev.rewardMoney} ج.م و+${ev.rewardRep} سمعة)`,
    };
  }
  if (ev.type === 'broken_car') {
    return {
      moneyGain: ev.rewardMoney,
      repGain: ev.rewardRep,
      toastAr: `تسلم إيدك! صلّحت العربية المعطلة والسواق شكر جدعنتك (+${ev.rewardMoney} ج.م و+${ev.rewardRep} سمعة)`,
    };
  }
  if (ev.type === 'flash_sale') {
    return {
      moneyGain: ev.rewardMoney,
      repGain: ev.rewardRep,
      toastAr: `استغليت العرض الخاص بنجاح (+${ev.rewardMoney} ج.م مكافأة و+${ev.rewardRep} سمعة)`,
    };
  }
  if (ev.type === 'wedding_feast') {
    return {
      moneyGain: ev.rewardMoney,
      repGain: ev.rewardRep,
      toastAr: `ألف مبروك! شرّفت الفرح بواجب المعلم وأخدت النقوط (+${ev.rewardMoney} ج.م و+${ev.rewardRep} سمعة)`,
    };
  }
  return {
    moneyGain: ev.rewardMoney,
    repGain: ev.rewardRep,
    toastAr: `شجعت البائع المتجول وحركة الزباين انتعشت (+${ev.rewardMoney} ج.م و+${ev.rewardRep} سمعة)`,
  };
}

export function computeDiscountedGoodCost(
  baseCost: number,
  shopId: string,
  activeEvent: ActiveStreetEvent | null,
): number {
  if (
    activeEvent &&
    !activeEvent.resolved &&
    activeEvent.type === 'flash_sale' &&
    activeEvent.shopId === shopId &&
    activeEvent.discountPct
  ) {
    return Math.max(1, Math.round(baseCost * (1 - activeEvent.discountPct / 100)));
  }
  return baseCost;
}

// =========================================================================
// INTEGRATED HOUSEHOLD FAMILY AI (الأسرة المصرية في المنزل المشترك)
// =========================================================================

export interface HouseholdWaypoint {
  x: number;
  z: number;
  yaw: number;
  roomAr: string;
  pose: 'sit' | 'eat' | 'work' | 'talk' | 'idle' | 'wave';
}

export const HOUSEHOLD_WAYPOINTS: Record<FamilyActivityId, HouseholdWaypoint> = {
  sitting_tv: {
    x: 13.45,
    z: 2.35,
    yaw: -Math.PI / 2,
    roomAr: 'الصالة أمام التلفزيون',
    pose: 'sit',
  },
  cooking: {
    x: 20.6,
    z: 2.6,
    yaw: Math.PI / 2,
    roomAr: 'المطبخ',
    pose: 'work',
  },
  eating: {
    x: 19.1,
    z: 1.5,
    yaw: 0,
    roomAr: 'سفرة المطبخ',
    pose: 'eat',
  },
  resting: {
    x: 13.8,
    z: -2.4,
    yaw: Math.PI,
    roomAr: 'غرفة النوم',
    pose: 'idle',
  },
  playing: {
    x: 12.1,
    z: 1.1,
    yaw: Math.PI * 0.25,
    roomAr: 'سجادة الصالة',
    pose: 'wave',
  },
  chatting: {
    x: 11.4,
    z: 0.4,
    yaw: -Math.PI / 2,
    roomAr: 'مدخل الصالة',
    pose: 'talk',
  },
};

const FAMILY_SPEECHES: Record<
  HouseholdMemberState['id'],
  Record<FamilyActivityId, string>
> = {
  'home-wife': {
    sitting_tv: 'قاعدة أرتاح شوية وأتفرج على المسلسل في الصالة',
    cooking: 'بحضّر الأكل السخن والشاي بالنعناع في المطبخ',
    eating: 'تعالى اتغدى معانا يا معلم الأكل جاهز على السفرة',
    resting: 'بروّق غرفة النوم عشان ترتاح بعد الشغل',
    playing: 'بتابع الأولاد وهم بيلعبوا في الصالة',
    chatting: 'نورت البيت يا أبو الأولاد! يومك كان عامل إيه؟',
  },
  'home-daughter': {
    sitting_tv: 'بتفرج على الكرتون مع أخويا في الصالة!',
    cooking: 'بساعد ماما في تحضير العصير والسلطة',
    eating: 'الأكل طعمه يجنن يا بابا، تعالى اقعد جنبنا!',
    resting: 'براجع دروس المدرسة في هدوء',
    playing: 'يا بابا! جبتلك رسمة حلوة عملتها في المدرسة',
    chatting: 'أهلاً يا بابا! الشنطة الجديدة عاجباني أوي',
  },
  'home-son': {
    sitting_tv: 'الماتش شغال في التلفزيون يا بابا!',
    cooking: 'جعان يا ماما، هو الغدا فاضله كتير؟',
    eating: 'هممم.. تسلم إيديكم الأكل سخن وجميل!',
    resting: 'بحضّر كورة القدم عشان أنزل ألعب في الحوش',
    playing: 'شوطة جوول! بتفرج عليا يا بابا؟ ⚽',
    chatting: 'بابا جه! هتحكيلنا حكاية الشارع والمحل النهاردة؟',
  },
};

export function createInitialHouseholdFamily(): HouseholdMemberState[] {
  return [
    {
      id: 'home-wife',
      nameAr: 'أمينة',
      roleAr: 'الزوجة · ست البيت',
      activity: 'cooking',
      roomAr: HOUSEHOLD_WAYPOINTS.cooking.roomAr,
      speechAr: FAMILY_SPEECHES['home-wife'].cooking,
    },
    {
      id: 'home-daughter',
      nameAr: 'نور الصغيرة',
      roleAr: 'الابنة',
      activity: 'sitting_tv',
      roomAr: HOUSEHOLD_WAYPOINTS.sitting_tv.roomAr,
      speechAr: FAMILY_SPEECHES['home-daughter'].sitting_tv,
    },
    {
      id: 'home-son',
      nameAr: 'كريم',
      roleAr: 'الابن',
      activity: 'playing',
      roomAr: HOUSEHOLD_WAYPOINTS.playing.roomAr,
      speechAr: FAMILY_SPEECHES['home-son'].playing,
    },
  ];
}

export function pickHouseholdActivity(
  memberId: HouseholdMemberState['id'],
  timeOfDay: number,
  stepIndex: number,
): HouseholdMemberState {
  const schedules: Record<HouseholdMemberState['id'], FamilyActivityId[]> = {
    'home-wife': ['cooking', 'eating', 'sitting_tv', 'chatting', 'resting'],
    'home-daughter': ['sitting_tv', 'eating', 'playing', 'chatting', 'resting'],
    'home-son': ['playing', 'sitting_tv', 'eating', 'chatting'],
  };
  const pool = schedules[memberId];
  const baseIdx = Math.floor(((timeOfDay * 10) + stepIndex) % pool.length);
  const activity = pool[Math.abs(baseIdx) % pool.length];
  const wp = HOUSEHOLD_WAYPOINTS[activity];

  const meta: Record<HouseholdMemberState['id'], { nameAr: string; roleAr: string }> = {
    'home-wife': { nameAr: 'أمينة', roleAr: 'الزوجة · ست البيت' },
    'home-daughter': { nameAr: 'نور الصغيرة', roleAr: 'الابنة' },
    'home-son': { nameAr: 'كريم', roleAr: 'الابن' },
  };

  return {
    id: memberId,
    nameAr: meta[memberId].nameAr,
    roleAr: meta[memberId].roleAr,
    activity,
    roomAr: wp.roomAr,
    speechAr: FAMILY_SPEECHES[memberId][activity],
  };
}

export function getVisibleHouseholdFamily(
  roster: HouseholdMemberState[],
  spouseId: string | null,
  children: Array<{ id: string; gender: 'boy' | 'girl'; nameAr?: string }>,
  spouseNameAr?: string | null,
): HouseholdMemberState[] {
  if (!spouseId) return [];
  const visible: HouseholdMemberState[] = [];
  const wife = roster.find((m) => m.id === 'home-wife');
  if (wife) {
    visible.push({
      ...wife,
      nameAr: spouseNameAr || wife.nameAr,
      roleAr: 'الزوجة · شريكة البيت الثابت',
    });
  }
  const hasSon = children.some((c) => c.gender === 'boy') || children.length >= 1;
  const hasDaughter = children.some((c) => c.gender === 'girl') || children.length >= 2;
  if (hasSon) {
    const son = roster.find((m) => m.id === 'home-son');
    if (son) {
      const firstBoy = children.find((c) => c.gender === 'boy') ?? children[0];
      visible.push({
        ...son,
        nameAr: firstBoy?.nameAr || son.nameAr,
      });
    }
  }
  if (hasDaughter) {
    const daughter = roster.find((m) => m.id === 'home-daughter');
    if (daughter) {
      const firstGirl = children.find((c) => c.gender === 'girl') ?? children[1];
      visible.push({
        ...daughter,
        nameAr: firstGirl?.nameAr || daughter.nameAr,
      });
    }
  }
  return visible;
}
