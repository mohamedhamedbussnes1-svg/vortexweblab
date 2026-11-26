import { CITY_STREETS, DISTRICTS } from './cityLayout';
import {
  CrewChallengeScore,
  DeliveryOrderItem,
  EgyptianSeasonDef,
  EgyptianSeasonId,
  FurnitureCatalogItem,
  FurnitureItemId,
  IngredientId,
  InspectionRecord,
  InventoryState,
  OwnedVehicleId,
  PlayerCharacterId,
  SchoolEnrollmentState,
  SchoolReportCardState,
  WholesaleContractDef,
  WholesaleContractId,
} from './types';

// =========================================================================
// 1. EGYPTIAN SEASONS & LIVE EVENTS (رمضان، ماتش القمة، العيد)
// =========================================================================
export const EGYPTIAN_SEASONS: Record<EgyptianSeasonId, EgyptianSeasonDef> = {
  normal: {
    id: 'normal',
    nameAr: 'يوم عادي بالحارة',
    subtitleAr: 'حركة طبيعية لزبائن الفطار والغدا عبر الـ ٩٨ شارع',
    badgeColorHex: '#f59e0b',
    customerRushMultiplier: 1.0,
    tipMultiplier: 1.0,
    specialDrinkAr: 'شاي بالنعناع',
  },
  ramadan: {
    id: 'ramadan',
    nameAr: 'موسم رمضان وليالي السحور',
    subtitleAr: 'إقبال مضاعف وزينة رمضان وفوانيس + عصاير وتمر هندي',
    badgeColorHex: '#10b981',
    customerRushMultiplier: 1.6,
    tipMultiplier: 1.45,
    specialDrinkAr: 'تمر هندي وسوبيا مثلجة',
  },
  match_day: {
    id: 'match_day',
    nameAr: 'ليلة ماتش القمة في القهوة',
    subtitleAr: 'زحمة جماهير الكرة وسندوتشات سريعة وشاي على الفحم',
    badgeColorHex: '#38bdf8',
    customerRushMultiplier: 1.45,
    tipMultiplier: 1.3,
    specialDrinkAr: 'شاي خمسين وحلبة سخنة',
  },
  eid_feast: {
    id: 'eid_feast',
    nameAr: 'موسم العيد والفسح',
    subtitleAr: 'عائلات على كورنيش النيل وعيدية وبقشيش مضاعف',
    badgeColorHex: '#f472b6',
    customerRushMultiplier: 1.55,
    tipMultiplier: 1.5,
    specialDrinkAr: 'قصب مثلج وكركديه',
  },
};

export function getSeasonModifiers(seasonId: EgyptianSeasonId): EgyptianSeasonDef {
  return EGYPTIAN_SEASONS[seasonId] ?? EGYPTIAN_SEASONS.normal;
}

export function getSuggestedSeasonForDay(day: number): EgyptianSeasonId {
  const mod = Math.max(1, day) % 4;
  if (mod === 2) return 'match_day';
  if (mod === 3) return 'ramadan';
  if (mod === 0) return 'eid_feast';
  return 'normal';
}

// =========================================================================
// 2. ONLINE MOTORCYCLE DELIVERY DISPATCH ACROSS 98 STREETS
// =========================================================================
const DELIVERY_CUSTOMERS_AR = [
  'أستاذ طارق المدرس',
  'الحاج متولي التاجر',
  'مدام سحر المحاسبة',
  'كابتن هاني في النادي',
  'المهندس شريف',
  'أبلة نهى في المدرسة',
  'الأسطى رجب السباك',
  'دكتور مصطفى',
];

const DELIVERY_COMBOS_AR = [
  '٤ سندوتشات فول بالزيت + ٢ طعمية سخنة',
  'بوكس فطار المعلم المشكل + شاي بالنعناع',
  '٦ سندوتشات بطاطس مقلية + مخلل وطحينة',
  '٣ سبيشال المعلم + علبة فول بالخلطة',
  '٥ طعمية بالسلطة + ٢ كركديه مثلج',
];

export function generateDeliveryDispatchBatch(
  count = 4,
  seedOffset = 0,
): DeliveryOrderItem[] {
  const list: DeliveryOrderItem[] = [];
  const candidateStreets = CITY_STREETS.filter(
    (s) => Math.hypot(s.centerX, s.centerZ) >= 16,
  );
  for (let i = 0; i < count; i++) {
    const idx = (seedOffset * 7 + i * 19) % candidateStreets.length;
    const st = candidateStreets[idx] ?? CITY_STREETS[0];
    const dist = Math.hypot(st.centerX, st.centerZ);
    const payout = Math.round(90 + dist * 2.1);
    const motoTipBonus = Math.round(35 + dist * 0.65);
    const totalSec = Math.max(70, Math.round(75 + dist * 1.1));
    list.push({
      id: `dlv-${Date.now().toString(36)}-${i}-${Math.floor(Math.random() * 999)}`,
      customerNameAr: DELIVERY_CUSTOMERS_AR[(seedOffset + i) % DELIVERY_CUSTOMERS_AR.length],
      streetNameAr: st.nameAr,
      districtNameAr: DISTRICTS[st.districtId]?.nameAr ?? 'حارة المعلم',
      targetX: st.centerX,
      targetZ: st.centerZ,
      itemsLabelAr: DELIVERY_COMBOS_AR[(seedOffset + i) % DELIVERY_COMBOS_AR.length],
      payout,
      motoTipBonus,
      remainingSec: totalSec,
      totalSec,
      status: 'available',
    });
  }
  return list;
}

export function acceptDeliveryOrder(
  orders: DeliveryOrderItem[],
  orderId: string,
): { ok: boolean; orders: DeliveryOrderItem[]; activeOrder: DeliveryOrderItem | null; reasonAr?: string } {
  if (orders.some((o) => o.status === 'active')) {
    return {
      ok: false,
      orders,
      activeOrder: orders.find((o) => o.status === 'active') ?? null,
      reasonAr: 'معاك أوردر دليفري شغال دلوقتي! سلمه الأول.',
    };
  }
  const target = orders.find((o) => o.id === orderId && o.status === 'available');
  if (!target) {
    return {
      ok: false,
      orders,
      activeOrder: null,
      reasonAr: 'الأوردر غير متاح حالياً.',
    };
  }
  const updatedOrder: DeliveryOrderItem = { ...target, status: 'active' };
  return {
    ok: true,
    orders: orders.map((o) => (o.id === orderId ? updatedOrder : o)),
    activeOrder: updatedOrder,
  };
}

export function completeDeliveryOrder(params: {
  orders: DeliveryOrderItem[];
  orderId: string;
  vehicleId: OwnedVehicleId;
  seasonId: EgyptianSeasonId;
}): {
  ok: boolean;
  orders: DeliveryOrderItem[];
  payout: number;
  tip: number;
  totalEarned: number;
  reasonAr?: string;
} {
  const active = params.orders.find((o) => o.id === params.orderId && o.status === 'active');
  if (!active) {
    return {
      ok: false,
      orders: params.orders,
      payout: 0,
      tip: 0,
      totalEarned: 0,
      reasonAr: 'مفيش أوردر دليفري نشط للتسليم.',
    };
  }
  const season = getSeasonModifiers(params.seasonId);
  const onMoto = params.vehicleId === 'delivery_moto';
  const fastEnough = active.remainingSec > 10;
  const rawTip = (onMoto ? active.motoTipBonus : Math.round(active.motoTipBonus * 0.5)) * (fastEnough ? 1 : 0.4);
  const tip = Math.round(rawTip * season.tipMultiplier);
  const totalEarned = active.payout + tip;
  return {
    ok: true,
    orders: params.orders.filter((o) => o.id !== params.orderId),
    payout: active.payout,
    tip,
    totalEarned,
  };
}

export function tickDeliveryOrders(
  orders: DeliveryOrderItem[],
  dt: number,
): { orders: DeliveryOrderItem[]; expiredOrder: DeliveryOrderItem | null } {
  let expiredOrder: DeliveryOrderItem | null = null;
  const next = orders
    .map((o) => {
      if (o.status !== 'active') return o;
      const rem = o.remainingSec - dt;
      if (rem <= 0) {
        expiredOrder = { ...o, remainingSec: 0, status: 'expired' };
        return expiredOrder;
      }
      return { ...o, remainingSec: rem };
    })
    .filter((o) => o.status !== 'expired');
  return { orders: next, expiredOrder };
}

// =========================================================================
// 3. WHOLESALE SUPPLY CONTRACTS & HYGIENE/TAMWEEN INSPECTION
// =========================================================================
export const WHOLESALE_CONTRACTS: Record<WholesaleContractId, WholesaleContractDef> = {
  bakery_baladi: {
    id: 'bakery_baladi',
    nameAr: 'تعاقد مخبز الحارة البلدي',
    subtitleAr: 'خصم ٣٠٪ على توريد العيش البلدي + ١٢ رغيف مجاناً كل صباح',
    price: 3_500,
    discountPct: 30,
    dailyAutoUnits: { bread: 12 },
  },
  ful_farm: {
    id: 'ful_farm',
    nameAr: 'تعاقد مزرعة الفول والخضار',
    subtitleAr: 'خصم ٣٠٪ على الفول والطعمية والسلطة + توريد صباحي تلقائي',
    price: 5_200,
    discountPct: 30,
    dailyAutoUnits: { ful: 8, taameya: 8, salad: 6 },
  },
  oil_refinery: {
    id: 'oil_refinery',
    nameAr: 'تعاقد معصرة الزيت والطحينة',
    subtitleAr: 'خصم ٢٥٪ على الطحينة والمخلل والبطاطس + جودة زيت أعلى',
    price: 4_500,
    discountPct: 25,
    dailyAutoUnits: { tahina: 6, pickles: 6, fries: 6 },
  },
};

export function signWholesaleContract(
  money: number,
  owned: WholesaleContractId[],
  contractId: WholesaleContractId,
): { ok: boolean; money: number; contracts: WholesaleContractId[]; reasonAr?: string } {
  const def = WHOLESALE_CONTRACTS[contractId];
  if (!def) return { ok: false, money, contracts: owned, reasonAr: 'التعاقد غير موجود.' };
  if (owned.includes(contractId)) {
    return { ok: false, money, contracts: owned, reasonAr: 'هذا التعاقد مفعّل بالفعل!' };
  }
  if (money < def.price) {
    return {
      ok: false,
      money,
      contracts: owned,
      reasonAr: `تحتاج ${def.price.toLocaleString('en-US')} ج.م لتوقيع ${def.nameAr}.`,
    };
  }
  return {
    ok: true,
    money: money - def.price,
    contracts: [...owned, contractId],
  };
}

export function getContractDiscountFactor(
  owned: WholesaleContractId[],
  ingredientId: IngredientId,
): number {
  let discountPct = 0;
  if (ingredientId === 'bread' && owned.includes('bakery_baladi')) {
    discountPct = WHOLESALE_CONTRACTS.bakery_baladi.discountPct;
  } else if (
    (ingredientId === 'ful' || ingredientId === 'taameya' || ingredientId === 'salad') &&
    owned.includes('ful_farm')
  ) {
    discountPct = WHOLESALE_CONTRACTS.ful_farm.discountPct;
  } else if (
    (ingredientId === 'tahina' || ingredientId === 'pickles' || ingredientId === 'fries') &&
    owned.includes('oil_refinery')
  ) {
    discountPct = WHOLESALE_CONTRACTS.oil_refinery.discountPct;
  }
  return 1 - discountPct / 100;
}

export function applyWholesaleDailySupply(
  inventory: InventoryState,
  contracts: WholesaleContractId[],
): InventoryState {
  const next = { ...inventory };
  for (const cid of contracts) {
    const def = WHOLESALE_CONTRACTS[cid];
    if (!def) continue;
    for (const [k, qty] of Object.entries(def.dailyAutoUnits)) {
      const key = k as IngredientId;
      next[key] = Math.min(300, (next[key] ?? 0) + (qty ?? 0));
    }
  }
  return next;
}

export function sanitizeAndCleanShop(
  money: number,
  hygieneScore: number,
): { ok: boolean; money: number; hygieneScore: number; cost: number; reasonAr?: string } {
  const cost = 180;
  if (hygieneScore >= 98) {
    return {
      ok: false,
      money,
      hygieneScore,
      cost: 0,
      reasonAr: 'المحل والمطبخ معقم ونظيف بنسبة ١٠٠٪!',
    };
  }
  if (money < cost) {
    return {
      ok: false,
      money,
      hygieneScore,
      cost,
      reasonAr: `تحتاج ${cost} ج.م لأدوات التعقيم وتغيير الزيت.`,
    };
  }
  return {
    ok: true,
    money: money - cost,
    hygieneScore: 100,
    cost,
  };
}

export function runHygieneInspection(params: {
  hygieneScore: number;
  inventory: InventoryState;
  day: number;
  clockStr: string;
}): {
  record: InspectionRecord;
  qualityBadgeEarned: boolean;
} {
  const lowItems = Object.values(params.inventory).filter((v) => v <= 2).length;
  const effectiveScore = Math.max(0, Math.min(100, Math.round(params.hygieneScore - lowItems * 4)));
  const passed = effectiveScore >= 72;
  const moneyDelta = passed ? 1_200 : -450;
  const reputationDelta = passed ? 6 : -5;
  return {
    qualityBadgeEarned: passed,
    record: {
      id: `insp-${Date.now().toString(36)}-${Math.floor(Math.random() * 999)}`,
      clockStr: params.clockStr,
      day: params.day,
      passed,
      hygieneScore: effectiveScore,
      summaryAr: passed
        ? 'اجتياز تفتيش الصحة والتموين بنجاح — منح المحل وسام النظافة والجودة (+١,٢٠٠ ج.م دعم)'
        : 'ملاحظة تموينية على نظافة القلاية أو نقص الأصناف — غرامة ٤٥٠ ج.م، عقّم المحل فوراً!',
      moneyDelta,
      reputationDelta,
    },
  };
}

// =========================================================================
// 4. SCHOOL REPORT CARDS, CEREMONIES & HOME FURNITURE / CORNICHE VILLA
// =========================================================================
export const CORNICHE_VILLA_PRICE = 1_200_000;
export const CORNICHE_VILLA_DAILY_INCOME = 18_000;

export const FURNITURE_CATALOG: Record<FurnitureItemId, FurnitureCatalogItem> = {
  damietta_salon: {
    id: 'damietta_salon',
    nameAr: 'صالون دمياطي مدهب فخم',
    subtitleAr: 'يضيف فخامة لشقة المعلم ويرفع راحة الطاقم والأسرة',
    price: 28_000,
    comfortBonus: 12,
  },
  smart_tv_65: {
    id: 'smart_tv_65',
    nameAr: 'شاشة سمارت ٦٥ بوصة لماتشات القمة',
    subtitleAr: 'لمتابعة الدوري المصري وليالي الشقة مع الأصحاب',
    price: 22_000,
    comfortBonus: 10,
  },
  alumetal_kitchen: {
    id: 'alumetal_kitchen',
    nameAr: 'مطبخ ألمونتال كامل + مبرد مياه',
    subtitleAr: 'وجبات البيت تشبع وتروي بالكامل فوراً',
    price: 35_000,
    comfortBonus: 15,
  },
  kids_modern_room: {
    id: 'kids_modern_room',
    nameAr: 'أوضة أطفال ومذاكرة مودرن',
    subtitleAr: 'ترفع تفوق الابن والابنة في مدرسة بنها الخاصة',
    price: 24_000,
    comfortBonus: 14,
  },
};

export function createDefaultSchoolReportCard(): SchoolReportCardState {
  return {
    sonScore: 86,
    daughterScore: 91,
    sonGradeNoteAr: 'جيد جداً — متفوق في الحساب والقراءة',
    daughterGradeNoteAr: 'ممتازة — الأولى على فصل KG2',
    ceremoniesAttended: 0,
    lastCeremonyDay: null,
  };
}

export function celebrateSchoolHonorCeremony(params: {
  enrollment: SchoolEnrollmentState;
  report: SchoolReportCardState;
  day: number;
  ownedFurnitureIds: FurnitureItemId[];
}): {
  ok: boolean;
  report: SchoolReportCardState;
  moneyBonus: number;
  reputationBonus: number;
  reasonAr?: string;
} {
  if (!params.enrollment.sonEnrolled && !params.enrollment.daughterEnrolled) {
    return {
      ok: false,
      report: params.report,
      moneyBonus: 0,
      reputationBonus: 0,
      reasonAr: 'قدّم للأولاد في مدرسة بنها الخاصة أولاً لحضور حفل التفوق!',
    };
  }
  if (params.report.lastCeremonyDay === params.day) {
    return {
      ok: false,
      report: params.report,
      moneyBonus: 0,
      reputationBonus: 0,
      reasonAr: 'حضرت حفل التكريم النهاردة بالفعل! استنى بكرة لشهادة جديدة.',
    };
  }
  const hasKidsRoom = params.ownedFurnitureIds.includes('kids_modern_room');
  const nextSon = Math.min(100, params.report.sonScore + (hasKidsRoom ? 5 : 3));
  const nextDaughter = Math.min(100, params.report.daughterScore + (hasKidsRoom ? 4 : 3));
  return {
    ok: true,
    moneyBonus: 2_500,
    reputationBonus: 8,
    report: {
      sonScore: nextSon,
      daughterScore: nextDaughter,
      sonGradeNoteAr: nextSon >= 95 ? 'امتياز مع مرتبة الشرف في مدرسة بنها' : 'متفوق ونشيط جداً',
      daughterGradeNoteAr: nextDaughter >= 95 ? 'الطفلة المثالية والأولى على المدرسة' : 'ممتازة ومحبوبة',
      ceremoniesAttended: params.report.ceremoniesAttended + 1,
      lastCeremonyDay: params.day,
    },
  };
}

export function buyApartmentFurniture(
  money: number,
  owned: FurnitureItemId[],
  itemId: FurnitureItemId,
): { ok: boolean; money: number; owned: FurnitureItemId[]; reasonAr?: string } {
  const def = FURNITURE_CATALOG[itemId];
  if (!def) return { ok: false, money, owned, reasonAr: 'قطعة الأثاث غير موجودة.' };
  if (owned.includes(itemId)) {
    return { ok: false, money, owned, reasonAr: 'اشتريت هذا الأثاث للشقة بالفعل!' };
  }
  if (money < def.price) {
    return {
      ok: false,
      money,
      owned,
      reasonAr: `تحتاج ${def.price.toLocaleString('en-US')} ج.م لشراء ${def.nameAr}.`,
    };
  }
  return { ok: true, money: money - def.price, owned: [...owned, itemId] };
}

export function buyCornicheVilla(
  money: number,
  alreadyOwned: boolean,
): { ok: boolean; money: number; owned: boolean; reasonAr?: string } {
  if (alreadyOwned) {
    return { ok: false, money, owned: true, reasonAr: 'أنت تمتلك فيلا كورنيش النيل بالفعل!' };
  }
  if (money < CORNICHE_VILLA_PRICE) {
    return {
      ok: false,
      money,
      owned: false,
      reasonAr: `تحتاج ${CORNICHE_VILLA_PRICE.toLocaleString('en-US')} ج.م لشراء فيلا كورنيش النيل.`,
    };
  }
  return { ok: true, money: money - CORNICHE_VILLA_PRICE, owned: true };
}

// =========================================================================
// 5. 4-CREW ONLINE CHALLENGE LEADERBOARD
// =========================================================================
export function createInitialCrewLeaderboard(): Record<PlayerCharacterId, CrewChallengeScore> {
  return {
    mohamed: { characterId: 'mohamed', ordersCooked: 0, cashierSales: 0, deliveriesCompleted: 0, points: 0 },
    ahmed: { characterId: 'ahmed', ordersCooked: 0, cashierSales: 0, deliveriesCompleted: 0, points: 0 },
    ali: { characterId: 'ali', ordersCooked: 0, cashierSales: 0, deliveriesCompleted: 0, points: 0 },
    mahmoud: { characterId: 'mahmoud', ordersCooked: 0, cashierSales: 0, deliveriesCompleted: 0, points: 0 },
  };
}

export function recordCrewChallengePoint(
  board: Record<PlayerCharacterId, CrewChallengeScore>,
  characterId: PlayerCharacterId,
  category: 'cook' | 'cashier' | 'delivery',
  pointsDelta = 15,
): Record<PlayerCharacterId, CrewChallengeScore> {
  const cur = board[characterId] ?? {
    characterId,
    ordersCooked: 0,
    cashierSales: 0,
    deliveriesCompleted: 0,
    points: 0,
  };
  return {
    ...board,
    [characterId]: {
      ...cur,
      ordersCooked: cur.ordersCooked + (category === 'cook' ? 1 : 0),
      cashierSales: cur.cashierSales + (category === 'cashier' ? 1 : 0),
      deliveriesCompleted: cur.deliveriesCompleted + (category === 'delivery' ? 1 : 0),
      points: cur.points + pointsDelta,
    },
  };
}

export function getSortedCrewLeaderboard(
  board: Record<PlayerCharacterId, CrewChallengeScore>,
): CrewChallengeScore[] {
  return Object.values(board).sort((a, b) => b.points - a.points);
}
