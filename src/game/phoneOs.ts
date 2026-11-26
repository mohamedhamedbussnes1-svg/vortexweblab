import { OWNABLE_BUILDINGS, RESTAURANT_BRANCHES } from './cityLayout';
import { INGREDIENTS, PLAYER_CHARACTERS } from './rules';
import {
  CharacterNeedsState,
  CustomProfilesMap,
  ElectronicAdBoardState,
  IngredientId,
  InstaPayTransferRecord,
  InventoryAuditRecord,
  InventoryState,
  OwnableBuildingId,
  PlayerCharacterId,
  RestaurantBranchId,
  SchoolEnrollmentState,
} from './types';

export const OWNER_DISPLAY_NAME_AR = 'المعلم محمد حامد';
export const OWNER_ROLE_TITLE_AR = 'صاحب المحل والمدير';
export const MOHAMED_STARTING_MONEY = 5_000_000;
export const NON_OWNER_STARTING_MONEY = 450;

// SHA-256 hex digest of the owner access PIN (avoids plaintext credentials in client bundle)
const OWNER_PIN_SHA256 =
  '5e82459d588a3fe068c51eae2dd78ae9f74464779c259a37a59700d98d60507a';

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

export function sha256HexSync(ascii: string): string {
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isPrime = (n: number): boolean => {
    for (let factor = 2, root = Math.sqrt(n); factor <= root; factor++) {
      if (n % factor === 0) return false;
    }
    return true;
  };
  const fracBits = (n: number): number => ((n - (n | 0)) * maxWord) | 0;

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) hash[primeCounter] = fracBits(mathPow(candidate, 1 / 2));
      k[primeCounter] = fracBits(mathPow(candidate, 1 / 3));
      primeCounter++;
    }
  }

  let padded = ascii + '\x80';
  while ((padded.length % 64) - 56) padded += '\x00';
  for (let i = 0; i < padded.length; i++) {
    const j = padded.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = hash.slice(0);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export function verifyOwnerPinLocal(pinInput: string): boolean {
  const cleaned = pinInput.trim();
  if (!cleaned) return false;
  return sha256HexSync(cleaned) === OWNER_PIN_SHA256;
}

export function getStartingMoneyForCharacter(characterId: PlayerCharacterId): number {
  return characterId === 'mohamed' ? MOHAMED_STARTING_MONEY : NON_OWNER_STARTING_MONEY;
}

export function createDefaultCustomProfiles(): CustomProfilesMap {
  return {
    ahmed: {
      nameAr: PLAYER_CHARACTERS.ahmed.nameAr,
      roleTitleAr: PLAYER_CHARACTERS.ahmed.roleTitleAr,
    },
    ali: {
      nameAr: PLAYER_CHARACTERS.ali.nameAr,
      roleTitleAr: PLAYER_CHARACTERS.ali.roleTitleAr,
    },
    mahmoud: {
      nameAr: PLAYER_CHARACTERS.mahmoud.nameAr,
      roleTitleAr: PLAYER_CHARACTERS.mahmoud.roleTitleAr,
    },
    spouseNameAr: 'أمينة',
    sonNameAr: 'كريم',
    daughterNameAr: 'نور الصغيرة',
  };
}

export function sanitizeArabicLabel(raw: string, fallback: string, maxLen = 28): string {
  const cleaned = raw.replace(/[<>`"'\\/\x00-\x1F]/g, '').trim().slice(0, maxLen);
  return cleaned || fallback;
}

export function updateCustomProfiles(
  current: CustomProfilesMap,
  patch: Partial<CustomProfilesMap>,
): CustomProfilesMap {
  return {
    ahmed: patch.ahmed
      ? {
          nameAr: sanitizeArabicLabel(patch.ahmed.nameAr, current.ahmed.nameAr, 22),
          roleTitleAr: sanitizeArabicLabel(
            patch.ahmed.roleTitleAr,
            current.ahmed.roleTitleAr,
            32,
          ),
        }
      : { ...current.ahmed },
    ali: patch.ali
      ? {
          nameAr: sanitizeArabicLabel(patch.ali.nameAr, current.ali.nameAr, 22),
          roleTitleAr: sanitizeArabicLabel(patch.ali.roleTitleAr, current.ali.roleTitleAr, 32),
        }
      : { ...current.ali },
    mahmoud: patch.mahmoud
      ? {
          nameAr: sanitizeArabicLabel(patch.mahmoud.nameAr, current.mahmoud.nameAr, 22),
          roleTitleAr: sanitizeArabicLabel(
            patch.mahmoud.roleTitleAr,
            current.mahmoud.roleTitleAr,
            32,
          ),
        }
      : { ...current.mahmoud },
    spouseNameAr:
      patch.spouseNameAr !== undefined
        ? sanitizeArabicLabel(patch.spouseNameAr, current.spouseNameAr, 22)
        : current.spouseNameAr,
    sonNameAr:
      patch.sonNameAr !== undefined
        ? sanitizeArabicLabel(patch.sonNameAr, current.sonNameAr, 22)
        : current.sonNameAr,
    daughterNameAr:
      patch.daughterNameAr !== undefined
        ? sanitizeArabicLabel(patch.daughterNameAr, current.daughterNameAr, 22)
        : current.daughterNameAr,
  };
}

export function getResolvedCharacterProfile(
  characterId: PlayerCharacterId,
  profiles?: CustomProfilesMap,
): { nameAr: string; roleTitleAr: string } {
  if (characterId === 'mohamed') {
    // Fixed owner cannot be changed
    return {
      nameAr: OWNER_DISPLAY_NAME_AR,
      roleTitleAr: OWNER_ROLE_TITLE_AR,
    };
  }
  const base = PLAYER_CHARACTERS[characterId];
  const custom = profiles?.[characterId];
  return {
    nameAr: custom?.nameAr || base.nameAr,
    roleTitleAr: custom?.roleTitleAr || base.roleTitleAr,
  };
}

export function createDefaultAdBoard(): ElectronicAdBoardState {
  return {
    active: true,
    headlineAr: 'عرض المعلم اليوم — فطار سخن لكل الحارة!',
    promoTextAr: 'خصم ١٥٪ على السندوتشات المشكلة والطلبات العائلية + دليفري سريع',
    discountPct: 15,
    updatedAtClock: '08:00',
  };
}

export function updateAdBoard(
  current: ElectronicAdBoardState,
  patch: Partial<ElectronicAdBoardState>,
  clockStr: string,
): ElectronicAdBoardState {
  const discountPct =
    typeof patch.discountPct === 'number' && Number.isFinite(patch.discountPct)
      ? Math.max(0, Math.min(50, Math.round(patch.discountPct)))
      : current.discountPct;
  return {
    active: typeof patch.active === 'boolean' ? patch.active : current.active,
    headlineAr:
      patch.headlineAr !== undefined
        ? sanitizeArabicLabel(patch.headlineAr, current.headlineAr, 56)
        : current.headlineAr,
    promoTextAr:
      patch.promoTextAr !== undefined
        ? sanitizeArabicLabel(patch.promoTextAr, current.promoTextAr, 90)
        : current.promoTextAr,
    discountPct,
    updatedAtClock: clockStr,
  };
}

export function computeAdBoardCustomerBoost(ad: ElectronicAdBoardState): {
  spawnMultiplier: number;
  maxOrdersBonus: number;
} {
  if (!ad.active) return { spawnMultiplier: 1.0, maxOrdersBonus: 0 };
  const spawnMultiplier = 1.15 + Math.min(0.45, ad.discountPct * 0.012);
  const maxOrdersBonus = ad.discountPct >= 10 ? 1 : 0;
  return { spawnMultiplier, maxOrdersBonus };
}

export function createInitialEmployeeWallets(): Record<PlayerCharacterId, number> {
  return {
    mohamed: MOHAMED_STARTING_MONEY,
    ahmed: 450,
    ali: 450,
    mahmoud: 450,
  };
}

export function sendInstaPayTransfer(params: {
  senderCharacterId: PlayerCharacterId;
  senderMoney: number;
  wallets: Record<PlayerCharacterId, number>;
  toCharacterId: PlayerCharacterId;
  amount: number;
  noteAr?: string;
  clockStr: string;
  day: number;
  profiles?: CustomProfilesMap;
}): {
  ok: boolean;
  senderMoney: number;
  wallets: Record<PlayerCharacterId, number>;
  record?: InstaPayTransferRecord;
  reasonAr?: string;
} {
  if (params.senderCharacterId !== 'mohamed') {
    return {
      ok: false,
      senderMoney: params.senderMoney,
      wallets: params.wallets,
      reasonAr: `تحويل المرتبات عبر إنستا باي متاح فقط لحساب ${OWNER_DISPLAY_NAME_AR}!`,
    };
  }
  const cleanAmount = Math.round(params.amount);
  if (!Number.isFinite(cleanAmount) || cleanAmount < 10) {
    return {
      ok: false,
      senderMoney: params.senderMoney,
      wallets: params.wallets,
      reasonAr: 'أقل مبلغ للتحويل عبر إنستا باي هو ١٠ ج.م.',
    };
  }
  if (params.senderMoney < cleanAmount) {
    return {
      ok: false,
      senderMoney: params.senderMoney,
      wallets: params.wallets,
      reasonAr: 'رصيد المعلم محمد لا يكفي لإتمام التحويل.',
    };
  }
  const targetProfile = getResolvedCharacterProfile(params.toCharacterId, params.profiles);
  const nextWallets: Record<PlayerCharacterId, number> = {
    ...params.wallets,
    [params.toCharacterId]: (params.wallets[params.toCharacterId] ?? 0) + cleanAmount,
  };
  const record: InstaPayTransferRecord = {
    id: `ip-${Date.now().toString(36)}-${Math.floor(Math.random() * 999)}`,
    toCharacterId: params.toCharacterId,
    toNameAr: targetProfile.nameAr,
    fromNameAr: OWNER_DISPLAY_NAME_AR,
    amount: cleanAmount,
    noteAr: sanitizeArabicLabel(params.noteAr || 'قبض راتب ومكافأة الشفت', 'قبض راتب', 45),
    clockStr: params.clockStr,
    day: params.day,
  };
  return {
    ok: true,
    senderMoney: params.senderMoney - cleanAmount,
    wallets: nextWallets,
    record,
  };
}

export function createEmptyConsumedMap(): Record<IngredientId, number> {
  return {
    bread: 0,
    ful: 0,
    taameya: 0,
    salad: 0,
    tahina: 0,
    pickles: 0,
    fries: 0,
  };
}

export function runInventoryAudit(params: {
  inventory: InventoryState;
  consumedToday: Record<IngredientId, number>;
  clockStr: string;
  day: number;
  auditorNameAr: string;
}): InventoryAuditRecord {
  const keys = Object.keys(INGREDIENTS) as IngredientId[];
  let totalUnits = 0;
  let lowStockCount = 0;
  let estimatedValue = 0;
  for (const k of keys) {
    const qty = params.inventory[k] ?? 0;
    totalUnits += qty;
    if (qty <= INGREDIENTS[k].lowThreshold) {
      lowStockCount++;
    }
    estimatedValue += qty * INGREDIENTS[k].unitCost;
  }
  return {
    id: `aud-${Date.now().toString(36)}-${Math.floor(Math.random() * 999)}`,
    clockStr: params.clockStr,
    day: params.day,
    auditorNameAr: params.auditorNameAr,
    totalUnits,
    lowStockCount,
    estimatedValue,
    consumedToday: { ...params.consumedToday },
  };
}

export const RESTAURANT_FLOOR_UPGRADE_COST: Record<number, number> = {
  2: 120_000,
  3: 220_000,
};

export function upgradeRestaurantFloor(
  money: number,
  currentFloors: number,
): { ok: boolean; money: number; floors: number; cost: number; reasonAr?: string } {
  if (currentFloors >= 3) {
    return {
      ok: false,
      money,
      floors: currentFloors,
      cost: 0,
      reasonAr: 'المطعم وصل الحد الأقصى (٣ أدوار كاملة)!',
    };
  }
  const nextFloor = currentFloors + 1;
  const cost = RESTAURANT_FLOOR_UPGRADE_COST[nextFloor] ?? 220_000;
  if (money < cost) {
    return {
      ok: false,
      money,
      floors: currentFloors,
      cost,
      reasonAr: `تحتاج ${cost.toLocaleString('en-US')} ج.م لبناء الدور ${nextFloor} للمطعم.`,
    };
  }
  return {
    ok: true,
    money: money - cost,
    floors: nextFloor,
    cost,
  };
}

export function buyOwnableBuilding(
  money: number,
  ownedBuildingIds: OwnableBuildingId[],
  buildingId: OwnableBuildingId,
): { ok: boolean; money: number; ownedBuildingIds: OwnableBuildingId[]; reasonAr?: string } {
  const def = OWNABLE_BUILDINGS.find((b) => b.id === buildingId);
  if (!def) {
    return { ok: false, money, ownedBuildingIds, reasonAr: 'العمارة غير موجودة.' };
  }
  if (ownedBuildingIds.includes(buildingId)) {
    return { ok: false, money, ownedBuildingIds, reasonAr: 'أنت تمتلك هذه العمارة بالفعل!' };
  }
  if (money < def.price) {
    return {
      ok: false,
      money,
      ownedBuildingIds,
      reasonAr: `تحتاج ${def.price.toLocaleString('en-US')} ج.م لشراء ${def.nameAr}.`,
    };
  }
  return {
    ok: true,
    money: money - def.price,
    ownedBuildingIds: [...ownedBuildingIds, buildingId],
  };
}

export function buyRestaurantBranch(
  money: number,
  ownedBranchIds: RestaurantBranchId[],
  branchId: RestaurantBranchId,
): { ok: boolean; money: number; ownedBranchIds: RestaurantBranchId[]; reasonAr?: string } {
  const def = RESTAURANT_BRANCHES.find((b) => b.id === branchId);
  if (!def) {
    return { ok: false, money, ownedBranchIds, reasonAr: 'الفرع غير موجود.' };
  }
  if (ownedBranchIds.includes(branchId)) {
    return { ok: false, money, ownedBranchIds, reasonAr: 'أنت افتتحت هذا الفرع بالفعل!' };
  }
  if (money < def.price) {
    return {
      ok: false,
      money,
      ownedBranchIds,
      reasonAr: `تحتاج ${def.price.toLocaleString('en-US')} ج.م لافتتاح ${def.nameAr}.`,
    };
  }
  return {
    ok: true,
    money: money - def.price,
    ownedBranchIds: [...ownedBranchIds, branchId],
  };
}

export function computeRealEstateDailyIncome(
  ownedBuildingIds: OwnableBuildingId[],
  ownedBranchIds: RestaurantBranchId[],
  restaurantFloors: number,
  cornicheVillaOwned = false,
): number {
  const buildingRent = ownedBuildingIds.reduce((sum, id) => {
    const def = OWNABLE_BUILDINGS.find((b) => b.id === id);
    return sum + (def?.dailyRentIncome ?? 0);
  }, 0);
  const branchIncome = ownedBranchIds.reduce((sum, id) => {
    const def = RESTAURANT_BRANCHES.find((b) => b.id === id);
    return sum + (def?.dailyProfit ?? 0);
  }, 0);
  const floorBonus = Math.max(0, restaurantFloors - 1) * 4_500;
  const villaIncome = cornicheVillaOwned ? 18_000 : 0;
  return buildingRent + branchIncome + floorBonus + villaIncome;
}

export function createDefaultSchoolEnrollment(): SchoolEnrollmentState {
  return {
    schoolNameAr: 'مدرسة بنها الخاصة',
    sonEnrolled: false,
    daughterEnrolled: false,
    sonGradeAr: 'الصف الأول الابتدائي',
    daughterGradeAr: 'KG2 — رياض أطفال',
    enrolledDay: null,
  };
}

export const SCHOOL_TUITION_COST = 2_500;

export function enrollChildInBenhaSchool(
  money: number,
  current: SchoolEnrollmentState,
  target: 'son' | 'daughter' | 'both',
  day: number,
): { ok: boolean; money: number; enrollment: SchoolEnrollmentState; cost: number; reasonAr?: string } {
  const needSon = (target === 'son' || target === 'both') && !current.sonEnrolled;
  const needDaughter = (target === 'daughter' || target === 'both') && !current.daughterEnrolled;
  if (!needSon && !needDaughter) {
    return {
      ok: false,
      money,
      enrollment: current,
      cost: 0,
      reasonAr: 'الأولاد مقدمين بالفعل في مدرسة بنها الخاصة!',
    };
  }
  const units = (needSon ? 1 : 0) + (needDaughter ? 1 : 0);
  const cost = units * SCHOOL_TUITION_COST;
  if (money < cost) {
    return {
      ok: false,
      money,
      enrollment: current,
      cost,
      reasonAr: `مصروفات التقديم في مدرسة بنها الخاصة ${cost} ج.م.`,
    };
  }
  return {
    ok: true,
    money: money - cost,
    cost,
    enrollment: {
      ...current,
      sonEnrolled: current.sonEnrolled || needSon,
      daughterEnrolled: current.daughterEnrolled || needDaughter,
      enrolledDay: current.enrolledDay ?? day,
    },
  };
}

export function createInitialCharacterNeeds(): CharacterNeedsState {
  return { hunger: 88, thirst: 90 };
}

export function createInitialCrewNeeds(): Record<PlayerCharacterId, CharacterNeedsState> {
  return {
    mohamed: { hunger: 88, thirst: 90 },
    ahmed: { hunger: 84, thirst: 86 },
    ali: { hunger: 85, thirst: 88 },
    mahmoud: { hunger: 82, thirst: 84 },
  };
}

export function tickCharacterNeeds(
  needs: CharacterNeedsState,
  dt: number,
  isMovingOrWorking: boolean,
): CharacterNeedsState {
  const factor = isMovingOrWorking ? 1.45 : 0.75;
  // ~0.22 hunger/sec and ~0.28 thirst/sec -> gradual realistic drain over 5-7 mins
  return {
    hunger: Math.max(5, Math.min(100, needs.hunger - dt * 0.22 * factor)),
    thirst: Math.max(5, Math.min(100, needs.thirst - dt * 0.28 * factor)),
  };
}

export function restoreNeeds(
  needs: CharacterNeedsState,
  foodBoost: number,
  drinkBoost: number,
): CharacterNeedsState {
  return {
    hunger: Math.max(0, Math.min(100, Math.round(needs.hunger + foodBoost))),
    thirst: Math.max(0, Math.min(100, Math.round(needs.thirst + drinkBoost))),
  };
}
