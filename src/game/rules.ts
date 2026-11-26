import {
  createDefaultCashierSettings,
  createInitialExtraPrices,
  createInitialVipMembers,
} from './cashier';
import { CITY_BOUNDS, CITY_SHOPS, getStreetContext } from './cityLayout';
import {
  AABB2D,
  ApartmentCatalogItem,
  ApartmentId,
  CareerJobId,
  ChildMember,
  CityShopRuntimeState,
  CrewRoleId,
  CustomerArchetype,
  CustomerOrder,
  DailyStats,
  DayPeriod,
  DensitySettings,
  GraphicsQuality,
  IngredientDefinition,
  IngredientId,
  InventoryState,
  OnlinePlayerSlotState,
  OnlineRoomMember,
  OwnedVehicleId,
  PlayerCharacterDef,
  PlayerCharacterId,
  PlayerLifeStage,
  RecipeDefinition,
  RecipeId,
  RemotePlayerPose,
  RoleActionKind,
  RomanceNpcDef,
  RomanceRuntimeState,
  SavePayload,
  ShopUpgrades,
  VehicleCatalogItem,
} from './types';

export const PLAYER_CHARACTERS: Record<PlayerCharacterId, PlayerCharacterDef> = {
  mohamed: {
    id: 'mohamed',
    nameAr: 'المعلم محمد حامد',
    roleId: 'assembler',
    roleTitleAr: 'صاحب المحل والمدير (ثابت)',
    fixedDutyAr: 'فتح وقفل المحل، تسعير السندوتشات، شاشة الإعلانات، تقبيض الموظفين، العقارات والفروع (رأس المال 5,000,000 ج.م)',
    storyBioAr: 'المعلم محمد حامد — صاحب المحل والمدير الثابت برأس مال 5 مليون جنيه لتوسيع الإمبراطورية.',
    shirtHex: '#a82424',
    shirtColor: 0xa82424,
    pantsColor: 0x22262b,
    skinColor: 0xc99168,
    hasHoodie: true,
    hasMustache: true,
  },
  ahmed: {
    id: 'ahmed',
    nameAr: 'أحمد',
    roleId: 'fryer',
    roleTitleAr: 'الشيف ومعلم القلي والفول',
    fixedDutyAr: 'تحضير الفول والطعمية والبطاطس وضبط الطشّة الذهبية في المطبخ',
    storyBioAr: 'أستاذ القلية والسندوتشات — ريحة طعامه تجيب الزبون من آخر الشارع.',
    shirtHex: '#4d6b47',
    shirtColor: 0x4d6b47,
    pantsColor: 0x25282e,
    skinColor: 0xc38960,
    hasHoodie: false,
    hasMustache: false,
  },
  ali: {
    id: 'ali',
    nameAr: 'علي',
    roleId: 'cashier',
    roleTitleAr: 'الكاشير والمحاسب',
    fixedDutyAr: 'تقفيل الطلبات على الكاونتر، الحسابات، الضيافة والبقشيش',
    storyBioAr: 'لسانه حلو مع الزباين وبيحسب الجنيه قبل القرش في الدرج.',
    shirtHex: '#3c65ab',
    shirtColor: 0x3c65ab,
    pantsColor: 0x20252d,
    skinColor: 0xd49d75,
    hasHoodie: false,
    hasMustache: false,
  },
  mahmoud: {
    id: 'mahmoud',
    nameAr: 'محمود',
    roleId: 'driver',
    roleTitleAr: 'سائق التوصيل والسوق',
    fixedDutyAr: 'قيادة السيارة، توصيل الدليفري، وجلب البضاعة من السوق',
    storyBioAr: 'سريع في الـ ٩٨ شارع — يعرف كل زقاق وكورنيش في البلد.',
    shirtHex: '#d99b24',
    shirtColor: 0xd99b24,
    pantsColor: 0x26282e,
    skinColor: 0xc78f66,
    hasHoodie: true,
    hasMustache: true,
  },
};

export const FRIENDS_STORY_TITLE_AR = 'حكاية الـ ٤ أصحاب والبيت الثابت';
export const FRIENDS_STORY_SUMMARY_AR =
  'أربعة أصحاب من الحارة (محمد، علي، أحمد، محمود) جمعوا كل تحويشتهم واشتروا «محل المعلم» للفول والطعمية، وبنوا قدامه «البيت الثابت» عشان يبدأوا حياتهم أعزب في أعزب، وكل واحد فيهم ليه وظيفته الثابتة لحد ما يكبروا المحل، يتعرفوا، يتجوزوا، ويملوا البيت بالذرية الصالحة.';

export const FRIENDS_STORY_CHAPTERS: Array<{
  titleAr: string;
  bodyAr: string;
}> = [
  {
    titleAr: '١. الشراكة والمحل الأول',
    bodyAr: 'الأربعة أصحاب حطوا إيدهم في إيد بعض واشتروا محل فول وطعمية في قلب الحارة، واتفقوا إن كل واحد يمسك شغلته الثابتة من غير ما يضيعوا تعب بعض.',
  },
  {
    titleAr: '٢. البيت الثابت وحياة العزوبية',
    bodyAr: 'بنوا قدام المحل بيتهم الثابت على أرض الحارة: صالة بتلفزيون، مطبخ، وغرف نوم يرتاحوا فيها بعد الشفت ويحوشوا لمستقبلهم.',
  },
  {
    titleAr: '٣. من أعزب لتعارف وجواز وعيال',
    bodyAr: 'تبدأ الحكاية وأنت أعزب، تنزل تتعرف على بنات الحارة والكورنيش، تكسب قلب شريكتك وتتجوزها في البيت الثابت، وبعد فترة عشرة سعيدة ربنا يرزقكم بأول مولود!',
  },
];

export const INGREDIENTS: Record<IngredientId, IngredientDefinition> = {
  bread: {
    id: 'bread',
    nameAr: 'عيش بلدي',
    unitCost: 2,
    packSize: 15,
    lowThreshold: 6,
    colorHex: '#d8b482',
  },
  ful: {
    id: 'ful',
    nameAr: 'فول مدمس',
    unitCost: 3,
    packSize: 15,
    lowThreshold: 5,
    colorHex: '#6b4226',
  },
  taameya: {
    id: 'taameya',
    nameAr: 'طعمية سخنة',
    unitCost: 3,
    packSize: 15,
    lowThreshold: 5,
    colorHex: '#4f772d',
  },
  salad: {
    id: 'salad',
    nameAr: 'سلطة خضراء',
    unitCost: 2,
    packSize: 12,
    lowThreshold: 4,
    colorHex: '#52b788',
  },
  tahina: {
    id: 'tahina',
    nameAr: 'طحينة',
    unitCost: 2,
    packSize: 12,
    lowThreshold: 4,
    colorHex: '#e9d8a6',
  },
  pickles: {
    id: 'pickles',
    nameAr: 'مخلل بلدي',
    unitCost: 1,
    packSize: 12,
    lowThreshold: 4,
    colorHex: '#ca6702',
  },
  fries: {
    id: 'fries',
    nameAr: 'بطاطس محمرة',
    unitCost: 3,
    packSize: 12,
    lowThreshold: 4,
    colorHex: '#f4a261',
  },
};

export const RECIPES: Record<RecipeId, RecipeDefinition> = {
  ful_oil: {
    id: 'ful_oil',
    nameAr: 'سندوتش فول بالزيت',
    requiredIngredients: ['bread', 'ful'],
    basePrice: 12,
    prepSeconds: 6,
  },
  ful_tahina: {
    id: 'ful_tahina',
    nameAr: 'سندوتش فول بالطحينة',
    requiredIngredients: ['bread', 'ful', 'tahina'],
    basePrice: 15,
    prepSeconds: 8,
  },
  taameya_plain: {
    id: 'taameya_plain',
    nameAr: 'سندوتش طعمية',
    requiredIngredients: ['bread', 'taameya'],
    basePrice: 12,
    prepSeconds: 6,
  },
  taameya_salad: {
    id: 'taameya_salad',
    nameAr: 'طعمية بالسلطة والطحينة',
    requiredIngredients: ['bread', 'taameya', 'salad', 'tahina'],
    basePrice: 18,
    prepSeconds: 10,
  },
  fries_sandwich: {
    id: 'fries_sandwich',
    nameAr: 'سندوتش بطاطس بالمخلل',
    requiredIngredients: ['bread', 'fries', 'pickles'],
    basePrice: 16,
    prepSeconds: 8,
  },
  mixed_special: {
    id: 'mixed_special',
    nameAr: 'سندوتش المعلم المشكل',
    requiredIngredients: ['bread', 'ful', 'taameya', 'salad', 'tahina'],
    basePrice: 24,
    prepSeconds: 12,
  },
};

export const CREW_ROLES: Record<
  CrewRoleId,
  { id: CrewRoleId; titleAr: string; perkAr: string; speedMultiplier: number }
> = {
  cashier: {
    id: 'cashier',
    titleAr: 'علي · الكاشير والمحاسب',
    perkAr: 'محاسبة الزبائن، +٢٥٪ بقشيش وصبر أطول',
    speedMultiplier: 1.0,
  },
  assembler: {
    id: 'assembler',
    titleAr: 'محمد · صاحب المحل والمدير',
    perkAr: 'إدارة المحل، الأسعار، التوسعات والـ ٩٨ شارع',
    speedMultiplier: 1.15,
  },
  fryer: {
    id: 'fryer',
    titleAr: 'أحمد · الشيف ومعلم القلي والفول',
    perkAr: 'تحضير الفول والطعمية، طشّة ذهبي ومكافأة جودة',
    speedMultiplier: 1.1,
  },
  driver: {
    id: 'driver',
    titleAr: 'محمود · سائق التوصيل والسوق',
    perkAr: 'توصيل الطلبات، قيادة السيارة وتوفير الوقود',
    speedMultiplier: 1.05,
  },
};

export const ROLE_OWNER_BY_ACTION: Record<RoleActionKind, PlayerCharacterId> = {
  manage_shop: 'mohamed',
  serve_cashier: 'ali',
  cook_kitchen: 'ahmed',
  drive_delivery: 'mahmoud',
};

export function canAccessCityManagement(characterId: PlayerCharacterId): boolean {
  return characterId === 'mohamed';
}

export function canPerformFixedRoleAction(
  myCharacterId: PlayerCharacterId,
  onlineMode: boolean,
  members: Array<OnlineRoomMember | OnlinePlayerSlotState>,
  action: RoleActionKind,
): { allowed: boolean; ownerNameAr?: string; ownerRoleAr?: string; reasonAr?: string } {
  if (!onlineMode) {
    return { allowed: true };
  }
  const ownerId = ROLE_OWNER_BY_ACTION[action];
  if (myCharacterId === ownerId) {
    return { allowed: true };
  }
  const ownerSlot = members.find((m) => m.characterId === ownerId);
  const ownerDef = PLAYER_CHARACTERS[ownerId];
  // Strictly lock management to Owner when online, and lock station actions whenever that friend is present in the room!
  if (action === 'manage_shop' || ownerSlot?.connected) {
    return {
      allowed: false,
      ownerNameAr: ownerDef.nameAr,
      ownerRoleAr: ownerDef.roleTitleAr,
      reasonAr: `دي وظيفة ${ownerDef.nameAr} (${ownerDef.roleTitleAr}) الثابتة في الفريق!`,
    };
  }
  return { allowed: true };
}

const DEFAULT_SOLO_STATION_LOCATION: Record<
  PlayerCharacterId,
  { zoneAr: string; streetAr: string; x: number; z: number }
> = {
  mohamed: {
    zoneAr: 'محل المعلم — فول وطعمية',
    streetAr: 'شارع المعلم الرئيسي',
    x: -10.8,
    z: -1.6,
  },
  ahmed: {
    zoneAr: 'مطبخ القلاية والفول',
    streetAr: 'محل المعلم — شارع المعلم الرئيسي',
    x: -12.6,
    z: 0.4,
  },
  ali: {
    zoneAr: 'كاونتر الكاشير',
    streetAr: 'محل المعلم — شارع المعلم الرئيسي',
    x: -9.8,
    z: 1.2,
  },
  mahmoud: {
    zoneAr: 'ساحة السيارة والتوصيل',
    streetAr: 'شارع المعلم الرئيسي',
    x: -3.6,
    z: 5.6,
  },
};

export function buildCrewSlotsSnapshot(params: {
  selfCharacterId: PlayerCharacterId;
  selfPos: { x: number; z: number };
  selfZoneAr: string;
  selfStreetAr: string;
  selfInCar: boolean;
  onlineMode: boolean;
  members: OnlineRoomMember[];
  remotePoses: RemotePlayerPose[];
  customProfiles?: import('./types').CustomProfilesMap;
}): OnlinePlayerSlotState[] {
  const order: PlayerCharacterId[] = ['mohamed', 'ahmed', 'ali', 'mahmoud'];
  return order.map((charId) => {
    const def = PLAYER_CHARACTERS[charId];
    const custom = charId !== 'mohamed' ? params.customProfiles?.[charId] : undefined;
    const resolvedName = custom?.nameAr || def.nameAr;
    const resolvedRole = custom?.roleTitleAr || def.roleTitleAr;
    const isSelf = charId === params.selfCharacterId;
    if (isSelf) {
      const member = params.members.find((m) => m.characterId === charId);
      return {
        characterId: charId,
        nameAr: resolvedName,
        roleId: def.roleId,
        roleTitleAr: resolvedRole,
        fixedDutyAr: def.fixedDutyAr,
        shirtHex: def.shirtHex,
        connected: true,
        isSelf: true,
        displayNameAr: member?.displayNameAr || resolvedName,
        inCar: params.selfInCar,
        zoneAr: params.selfZoneAr,
        streetAr: params.selfStreetAr,
        x: Math.round(params.selfPos.x * 10) / 10,
        z: Math.round(params.selfPos.z * 10) / 10,
      };
    }

    const remoteMember = params.members.find((m) => m.characterId === charId && m.connected);
    const remotePose = params.remotePoses.find((p) => p.characterId === charId);
    if (remoteMember || remotePose) {
      const rx = remotePose?.x ?? remoteMember?.x ?? DEFAULT_SOLO_STATION_LOCATION[charId].x;
      const rz = remotePose?.z ?? remoteMember?.z ?? DEFAULT_SOLO_STATION_LOCATION[charId].z;
      const streetAr =
        remotePose?.streetAr ??
        remoteMember?.streetAr ??
        getStreetContext(rx, rz).street.nameAr;
      return {
        characterId: charId,
        nameAr: resolvedName,
        roleId: def.roleId,
        roleTitleAr: resolvedRole,
        fixedDutyAr: def.fixedDutyAr,
        shirtHex: def.shirtHex,
        connected: true,
        isSelf: false,
        displayNameAr: remotePose?.displayNameAr ?? remoteMember?.displayNameAr ?? resolvedName,
        inCar: Boolean(remotePose?.inCar ?? remoteMember?.inCar),
        zoneAr: remotePose?.zoneAr ?? remoteMember?.zoneAr ?? streetAr,
        streetAr,
        x: Math.round(rx * 10) / 10,
        z: Math.round(rz * 10) / 10,
      };
    }

    const station = DEFAULT_SOLO_STATION_LOCATION[charId];
    return {
      characterId: charId,
      nameAr: resolvedName,
      roleId: def.roleId,
      roleTitleAr: resolvedRole,
      fixedDutyAr: def.fixedDutyAr,
      shirtHex: def.shirtHex,
      connected: false,
      isSelf: false,
      displayNameAr: resolvedName,
      inCar: false,
      zoneAr: params.onlineMode ? 'لم ينضم للغرفة بعد' : station.zoneAr,
      streetAr: params.onlineMode ? 'في انتظار رابط الدعوة' : station.streetAr,
      x: station.x,
      z: station.z,
    };
  });
}

export const CUSTOMER_DIALOGUES: Record<CustomerArchetype, string[]> = {
  rushed: [
    'يا عم أنا مستعجل جدًا، شوفلي الطلب ده بسرعة!',
    'هو الطلب هيتأخر كتير يا معلم؟ ورايا شغل!',
    'انجزني الله يباركلك يا أسطى!',
  ],
  calm: [
    'صباح الفل يا معلم، على مهلك خالص.',
    'الريحة النهاردة تفتح النفس، عايز طلب مظبوط.',
    'تسلم إيدك يا كبير، مفيش استعجال.',
  ],
  talkative: [
    'ازيك يا معلم وإزي الحارة النهاردة؟ الجو جميل أوي!',
    'سمعت إن الفول بتاعك مفيش زيه في المنطقة كلها!',
    'يا سلام على ريحة الطعمية وهي طالعة من القلاية!',
  ],
  haggler: [
    'السعر غلي ليه كده يا معلم؟ اعملنا واجب!',
    'الحساب كام يا كبير؟ ظبطنا عشان احنا زباين المحل.',
    'زودلي شوية طحينة بقى متبقاش بخيل!',
  ],
  regular: [
    'الطلب المعتاد بتاعي يا معلم، أنت عارفني!',
    'كل يوم باجي أفطر من عندك، طعم ميتنسيش.',
    'أحلى معلم في الحارة، ظبطلنا السندوتش!',
  ],
  bulk: [
    'يا معلم، عايز طلب كبير للشباب في الورشة!',
    'جهزلي كذا واحد عشان العيلة كلها مستنية الفطار.',
    'كتر السندوتشات يا ريس وادينا أحلى طعم!',
  ],
};

export const EGYPTIAN_NAMES = [
  'عم حسن',
  'أبو كريم',
  'الحاج محمود',
  'الأسطى طارق',
  'أستاذ شريف',
  'مدام نادية',
  'كابتن يوسف',
  'عم سعيد',
  'أم مازن',
  'شعبان',
];

export const CAREER_JOBS: Record<
  CareerJobId,
  {
    id: CareerJobId;
    titleAr: string;
    subtitleAr: string;
    bonusAr: string;
  }
> = {
  chef: {
    id: 'chef',
    titleAr: 'معلم فول وطعمية',
    subtitleAr: 'تشغيل المحل وتحضير السندوتشات للزبائن',
    bonusAr: 'دخلك الأساسي + سمعة الحارة',
  },
  taxi: {
    id: 'taxi',
    titleAr: 'سائق تاكسي القاهرة',
    subtitleAr: 'توصيل ركاب بين الـ ٩٨ شارع بالسيارة',
    bonusAr: '٣٥ إلى ٩٥ جنيه لكل مشوار',
  },
  delivery: {
    id: 'delivery',
    titleAr: 'دليفري سريع',
    subtitleAr: 'طلبات توصيل عاجلة لجميع أحياء المدينة',
    bonusAr: 'بقشيش مضاعف على التوصيل',
  },
  mechanic: {
    id: 'mechanic',
    titleAr: 'ميكانيكي سيارات',
    subtitleAr: 'إصلاح السيارات العطلانة في الورشة والشوارع',
    bonusAr: '٥٠ – ٧٥ جنيه لكل سيارة',
  },
  barista: {
    id: 'barista',
    titleAr: 'قهوجي قهوة الحارة',
    subtitleAr: 'تقديم الشاي والقهوة للزباين في المقهى',
    bonusAr: 'مكسب سريع + رفع السمعة',
  },
  baker: {
    id: 'baker',
    titleAr: 'خباز المخبز البلدي',
    subtitleAr: 'خبز عيش بلدي طازة في مخبز الأمانة',
    bonusAr: 'فلوس + ١٠ أرغفة مجانية للمحل',
  },
};

export const DEFAULT_DENSITY_SETTINGS: DensitySettings = {
  pedestrianDensity: 65,
  trafficDensity: 60,
  propDensity: 80,
};

export function clampDensitySettings(input: Partial<DensitySettings>): DensitySettings {
  const clampPct = (v: unknown, def: number) =>
    typeof v === 'number' && Number.isFinite(v)
      ? Math.max(0, Math.min(100, Math.round(v)))
      : def;
  return {
    pedestrianDensity: clampPct(input.pedestrianDensity, DEFAULT_DENSITY_SETTINGS.pedestrianDensity),
    trafficDensity: clampPct(input.trafficDensity, DEFAULT_DENSITY_SETTINGS.trafficDensity),
    propDensity: clampPct(input.propDensity, DEFAULT_DENSITY_SETTINGS.propDensity),
  };
}

export function createInitialCityShops(): CityShopRuntimeState[] {
  return CITY_SHOPS.map((s) => ({
    id: s.id,
    owned: false,
    hasManager: false,
    accumulatedProfit: 0,
  }));
}

export const DELIVERY_DROPOFFS = [
  { nameAr: 'ورشة الأسطى بليغ', x: 31.0, z: -21.0 },
  { nameAr: 'بقالة البركة', x: -31.0, z: -21.0 },
  { nameAr: 'كشك عم فرج', x: -7.2, z: 8.2 },
  { nameAr: 'قهوة الحارة', x: 14.5, z: 21.5 },
  { nameAr: 'مخبز الأمانة', x: -14.5, z: 21.5 },
  { nameAr: 'سوبرماركت النيل', x: 13.8, z: -41.5 },
  { nameAr: 'مطعم كشري التحرير', x: -13.8, z: -69.5 },
  { nameAr: 'صيدلية الشفاء', x: 36.5, z: 30.0 },
  { nameAr: 'حلواني الشام ومصر', x: 13.8, z: 46.5 },
];

export function createInitialInventory(): InventoryState {
  return {
    bread: 24,
    ful: 20,
    taameya: 20,
    salad: 14,
    tahina: 16,
    pickles: 14,
    fries: 14,
  };
}

export function createInitialPrices(): Record<RecipeId, number> {
  return {
    ful_oil: RECIPES.ful_oil.basePrice,
    ful_tahina: RECIPES.ful_tahina.basePrice,
    taameya_plain: RECIPES.taameya_plain.basePrice,
    taameya_salad: RECIPES.taameya_salad.basePrice,
    fries_sandwich: RECIPES.fries_sandwich.basePrice,
    mixed_special: RECIPES.mixed_special.basePrice,
  };
}

export function createInitialUpgrades(): ShopUpgrades {
  return {
    fryerLevel: 1,
    fulPotLevel: 1,
    decorLevel: 1,
    carEngineLevel: 1,
  };
}

export const VEHICLE_CATALOG: Record<OwnedVehicleId, VehicleCatalogItem> = {
  fiat_128: {
    id: 'fiat_128',
    nameAr: 'فيات 128 كلاسيك',
    subtitleAr: 'السيارة الحمراء الأصلية · اعتمادية في كل حارة',
    price: 0,
    topSpeedKmh: 96,
    bodyColor: 0xb92b27,
    accentHex: '#ef4444',
    fuelEconomyMult: 1.0,
    taxiBonusMult: 1.0,
    charmBonus: 0,
  },
  tuktuk: {
    id: 'tuktuk',
    nameAr: 'توك توك المعلم السريع',
    subtitleAr: 'خفيف جداً · يدخل الحواري الضيقة ويوفر ٤٠٪ بنزين',
    price: 320,
    topSpeedKmh: 78,
    bodyColor: 0xf59e0b,
    accentHex: '#f59e0b',
    fuelEconomyMult: 0.6,
    taxiBonusMult: 1.15,
    charmBonus: 2,
  },
  taxi_verna: {
    id: 'taxi_verna',
    nameAr: 'تاكسي القاهرة الحديث',
    subtitleAr: 'سريع ومكيف · يزود مكاسب مشاوير التاكسي +٣٥٪',
    price: 480,
    topSpeedKmh: 122,
    bodyColor: 0xf1f5f9,
    accentHex: '#38bdf8',
    fuelEconomyMult: 0.9,
    taxiBonusMult: 1.35,
    charmBonus: 8,
  },
  pickup: {
    id: 'pickup',
    nameAr: 'نصف نقل المعلم (لوك خاص)',
    subtitleAr: 'كابينة تسع ٤+ ركاب و٤ في الصندوق الخلفي · بقشيش توصيل مضاعف وقفل خاص بالمعلم',
    price: 680,
    topSpeedKmh: 118,
    bodyColor: 0x1e40af,
    accentHex: '#60a5fa',
    fuelEconomyMult: 1.15,
    taxiBonusMult: 1.15,
    charmBonus: 10,
  },
  delivery_moto: {
    id: 'delivery_moto',
    nameAr: 'موتوسيكل الدليفري السريع',
    subtitleAr: 'بصندوق دليفري حراري · يدخل كل الزقاق والشوارع ويضاعف مكاسب الدليفري',
    price: 390,
    topSpeedKmh: 132,
    bodyColor: 0xdc2626,
    accentHex: '#f87171',
    fuelEconomyMult: 0.52,
    taxiBonusMult: 1.35,
    charmBonus: 6,
  },
  sport_coupe: {
    id: 'sport_coupe',
    nameAr: 'كوبيه سبور ميتاليك',
    subtitleAr: 'سرعة ١٥٥ كم/س · جاذبية عالية عند بنات المدينة +٢٥٪',
    price: 1400,
    topSpeedKmh: 155,
    bodyColor: 0xd97706,
    accentHex: '#fbbf24',
    fuelEconomyMult: 1.1,
    taxiBonusMult: 1.25,
    charmBonus: 25,
  },
};

export const APARTMENT_CATALOG: Record<ApartmentId, ApartmentCatalogItem> = {
  apt_hara: {
    id: 'apt_hara',
    nameAr: 'البيت الثابت (بيت الحارة)',
    districtId: 'hara',
    streetAr: 'شارع المعلم الرئيسي (قدام المحل)',
    price: 400,
    roomsAr: 'صالة ومطبخ وحمام وغرف نوم · بيت الأصحاب الثابت',
    dailyMoraleBonus: 20,
    charmBonus: 10,
  },
  apt_schools: {
    id: 'apt_schools',
    nameAr: 'شقة حي المدارس الهادئ',
    districtId: 'residential',
    streetAr: 'شارع النهضة التعليمية',
    price: 750,
    roomsAr: '٣ غرف وصالة · قريبة من المدارس',
    dailyMoraleBonus: 40,
    charmBonus: 15,
  },
  apt_downtown: {
    id: 'apt_downtown',
    nameAr: 'شقة وسط البلد المودرن',
    districtId: 'market',
    streetAr: 'شارع الشريفين',
    price: 1250,
    roomsAr: '٣ غرف وتراس واسع · تشطيب سوبر لوكس',
    dailyMoraleBonus: 65,
    charmBonus: 22,
  },
  apt_corniche: {
    id: 'apt_corniche',
    nameAr: 'بنتهاوس الكورنيش النيلي',
    districtId: 'corniche',
    streetAr: 'ممشى أهل مصر الأوسط',
    price: 2200,
    roomsAr: '٤ غرف بإطلالة مباشرة على النيل',
    dailyMoraleBonus: 110,
    charmBonus: 35,
  },
};

export const ROMANCE_NPCS: RomanceNpcDef[] = [
  {
    id: 'girl-sara',
    nameAr: 'سارة',
    age: 24,
    jobAr: 'محاسبة في وسط البلد',
    personalityAr: 'ذوق وهادية وبتحب الجدعنة',
    districtId: 'hara',
    homeX: 4.5,
    homeZ: -5.5,
    dressColor: 0xbe185d,
    hijabColor: 0xfce7f3,
    skinColor: 0xd9a17c,
    shirtHex: '#be185d',
    introLineAr: 'أهلاً يا معلم! ريحة الفول والطعمية من محلك مالية الشارع كله.',
  },
  {
    id: 'girl-nour',
    nameAr: 'نور',
    age: 22,
    jobAr: 'طالبة هندسة على الكورنيش',
    personalityAr: 'دمها خفيف وبتحب الهزار اللطيف',
    districtId: 'corniche',
    homeX: -6.5,
    homeZ: -64.0,
    dressColor: 0x0284c7,
    hijabColor: null,
    skinColor: 0xd49b72,
    shirtHex: '#0284c7',
    introLineAr: 'مساء الفل! واقف بتتمشى على الكورنيش ولا مستني حد؟',
  },
  {
    id: 'girl-yasmin',
    nameAr: 'ياسمين',
    age: 25,
    jobAr: 'مصممة أزياء في حي المدارس',
    personalityAr: 'شيك وبتحب العربية الحلوة والطموح',
    districtId: 'residential',
    homeX: -36.0,
    homeZ: 48.0,
    dressColor: 0x7c3aed,
    hijabColor: 0xede9fe,
    skinColor: 0xc99168,
    shirtHex: '#7c3aed',
    introLineAr: 'إيه الأناقة دي! واضح إنك شغال على نفسك كويس في المدينة.',
  },
  {
    id: 'girl-mariam',
    nameAr: 'مريم',
    age: 26,
    jobAr: 'صيدلانية في صيدلية الشفاء',
    personalityAr: 'مثقفة وبتحب الكلام الرايق والاحترام',
    districtId: 'residential',
    homeX: 37.5,
    homeZ: 28.0,
    dressColor: 0x0f766e,
    hijabColor: 0xccfbf1,
    skinColor: 0xd29c74,
    shirtHex: '#0f766e',
    introLineAr: 'أهلاً بيك يا فندم، سمعت إنك أجدع واحد في الحي هنا.',
  },
  {
    id: 'girl-farah',
    nameAr: 'فرح',
    age: 23,
    jobAr: 'مصورة صحفية في السوق',
    personalityAr: 'مرحة وجريئة وبترد الكلمة بكلمتين',
    districtId: 'market',
    homeX: -8.0,
    homeZ: -34.0,
    dressColor: 0xe11d48,
    hijabColor: null,
    skinColor: 0xce966e,
    shirtHex: '#e11d48',
    introLineAr: 'يا مرحب يا معلم! استنى آخدلك صورة حلوة في وسط الزحمة دي.',
  },
  {
    id: 'girl-hadir',
    nameAr: 'هدير',
    age: 24,
    jobAr: 'جارتك في الحارة الشعبية',
    personalityAr: 'أصيلة وبنت بلد بتحب الشهامة والرزق الحلال',
    districtId: 'bakery',
    homeX: -12.0,
    homeZ: 18.5,
    dressColor: 0xd97706,
    hijabColor: 0xfef3c7,
    skinColor: 0xc68b62,
    shirtHex: '#d97706',
    introLineAr: 'صباح الهنا يا جاري! أخبار الشغل إيه النهاردة؟',
  },
];

export function createInitialRomanceStates(): RomanceRuntimeState[] {
  return ROMANCE_NPCS.map((g) => ({
    id: g.id,
    affection: 20,
    moodAr: 'متحفظة بس مبتسمة',
    talkCount: 0,
    married: false,
  }));
}

export function createInitialSave(
  characterId: PlayerCharacterId = 'mohamed',
): SavePayload {
  const startingMoney = characterId === 'mohamed' ? 5_000_000 : 450;
  return {
    version: 5,
    selectedCharacterId: characterId,
    money: startingMoney,
    reputation: 65,
    day: 1,
    inventory: createInitialInventory(),
    prices: createInitialPrices(),
    extraPrices: createInitialExtraPrices(),
    cashierSettings: createDefaultCashierSettings(),
    cashierReceipts: [],
    nextInvoiceSeq: 1,
    vipMembers: createInitialVipMembers(),
    kitchenTickets: [],
    shiftSettlements: [],
    upgrades: createInitialUpgrades(),
    carFuel: 100,
    carCondition: 100,
    activeVehicleId: characterId === 'mohamed' ? 'pickup' : 'fiat_128',
    ownedVehicleIds:
      characterId === 'mohamed'
        ? ['fiat_128', 'pickup', 'delivery_moto']
        : ['fiat_128'],
    ownedApartmentIds: ['apt_hara'],
    activeApartmentId: 'apt_hara',
    spouseId: null,
    marriedDay: null,
    marriageElapsedSec: 0,
    children: [],
    romanceStates: createInitialRomanceStates(),
    activeRole: PLAYER_CHARACTERS[characterId].roleId,
    activeJob: 'chef',
    cityShops: createInitialCityShops(),
    density: { ...DEFAULT_DENSITY_SETTINGS },
    radioStation: 'hamo_morshedy',
    quality: 'ultra',
    adaptiveQuality: true,
    ownerUnlocked: false,
    playerNeeds: { hunger: 88, thirst: 90 },
    crewNeeds: {
      mohamed: { hunger: 88, thirst: 90 },
      ahmed: { hunger: 84, thirst: 86 },
      ali: { hunger: 85, thirst: 88 },
      mahmoud: { hunger: 82, thirst: 84 },
    },
    adBoard: {
      active: true,
      headlineAr: 'عرض المعلم اليوم — فطار سخن لكل الحارة!',
      promoTextAr: 'خصم ١٥٪ على السندوتشات المشكلة والطلبات العائلية + دليفري سريع',
      discountPct: 15,
      updatedAtClock: '08:00',
    },
    employeeWallets: {
      mohamed: 5_000_000,
      ahmed: 450,
      ali: 450,
      mahmoud: 450,
    },
    instaPayTransfers: [],
    inventoryConsumedToday: {
      bread: 0,
      ful: 0,
      taameya: 0,
      salad: 0,
      tahina: 0,
      pickles: 0,
      fries: 0,
    },
    inventoryAuditLogs: [],
    ownedBuildingIds: [],
    restaurantFloors: 1,
    ownedBranchIds: [],
    vehicleLockedByOwner: false,
    customProfiles: {
      ahmed: { nameAr: PLAYER_CHARACTERS.ahmed.nameAr, roleTitleAr: PLAYER_CHARACTERS.ahmed.roleTitleAr },
      ali: { nameAr: PLAYER_CHARACTERS.ali.nameAr, roleTitleAr: PLAYER_CHARACTERS.ali.roleTitleAr },
      mahmoud: { nameAr: PLAYER_CHARACTERS.mahmoud.nameAr, roleTitleAr: PLAYER_CHARACTERS.mahmoud.roleTitleAr },
      spouseNameAr: 'أمينة',
      sonNameAr: 'كريم',
      daughterNameAr: 'نور الصغيرة',
    },
    schoolEnrollment: {
      schoolNameAr: 'مدرسة بنها الخاصة',
      sonEnrolled: false,
      daughterEnrolled: false,
      sonGradeAr: 'الصف الأول الابتدائي',
      daughterGradeAr: 'KG2 — رياض أطفال',
      enrolledDay: null,
    },
    activeSeasonId: 'normal',
    wholesaleContracts: [],
    hygieneScore: 92,
    qualityBadgeEarned: false,
    inspectionLogs: [],
    ownedFurnitureIds: [],
    cornicheVillaOwned: false,
    schoolReport: {
      sonScore: 86,
      daughterScore: 91,
      sonGradeNoteAr: 'جيد جداً — متفوق في الحساب والقراءة',
      daughterGradeNoteAr: 'ممتازة — الأولى على فصل KG2',
      ceremoniesAttended: 0,
      lastCeremonyDay: null,
    },
    crewLeaderboard: {
      mohamed: { characterId: 'mohamed', ordersCooked: 0, cashierSales: 0, deliveriesCompleted: 0, points: 0 },
      ahmed: { characterId: 'ahmed', ordersCooked: 0, cashierSales: 0, deliveriesCompleted: 0, points: 0 },
      ali: { characterId: 'ali', ordersCooked: 0, cashierSales: 0, deliveriesCompleted: 0, points: 0 },
      mahmoud: { characterId: 'mahmoud', ordersCooked: 0, cashierSales: 0, deliveriesCompleted: 0, points: 0 },
    },
  };
}

export function buyVehicle(
  money: number,
  ownedVehicleIds: OwnedVehicleId[],
  vehicleId: OwnedVehicleId,
): { ok: boolean; money: number; ownedVehicleIds: OwnedVehicleId[]; reasonAr?: string } {
  const def = VEHICLE_CATALOG[vehicleId];
  if (!def) {
    return { ok: false, money, ownedVehicleIds, reasonAr: 'السيارة غير موجودة' };
  }
  if (ownedVehicleIds.includes(vehicleId)) {
    return { ok: false, money, ownedVehicleIds, reasonAr: 'أنت تمتلك هذه السيارة بالفعل' };
  }
  if (money < def.price) {
    return { ok: false, money, ownedVehicleIds, reasonAr: `تحتاج ${def.price} ج.م لشراء ${def.nameAr}` };
  }
  return {
    ok: true,
    money: money - def.price,
    ownedVehicleIds: [...ownedVehicleIds, vehicleId],
  };
}

export function buyApartment(
  money: number,
  ownedApartmentIds: ApartmentId[],
  apartmentId: ApartmentId,
): { ok: boolean; money: number; ownedApartmentIds: ApartmentId[]; reasonAr?: string } {
  const def = APARTMENT_CATALOG[apartmentId];
  if (!def) {
    return { ok: false, money, ownedApartmentIds, reasonAr: 'الشقة غير موجودة' };
  }
  if (ownedApartmentIds.includes(apartmentId)) {
    return { ok: false, money, ownedApartmentIds, reasonAr: 'أنت تمتلك هذه الشقة بالفعل' };
  }
  if (money < def.price) {
    return { ok: false, money, ownedApartmentIds, reasonAr: `تحتاج ${def.price} ج.م لشراء ${def.nameAr}` };
  }
  return {
    ok: true,
    money: money - def.price,
    ownedApartmentIds: [...ownedApartmentIds, apartmentId],
  };
}

export const MARRIAGE_DOWRY_COST = 300;
export const CHILD_EXPENSE_COST = 150;
const CHILD_NAMES_BOY = ['آدم', 'عمر', 'ياسين', 'حمزة'];
const CHILD_NAMES_GIRL = ['ليلى', 'فريدة', 'مليكة', 'تالية'];

export function marryNpc(
  money: number,
  ownedApartmentIds: ApartmentId[],
  romanceStates: RomanceRuntimeState[],
  girlId: string,
): {
  ok: boolean;
  money: number;
  spouseId: string | null;
  romanceStates: RomanceRuntimeState[];
  reasonAr?: string;
} {
  if (ownedApartmentIds.length === 0) {
    return {
      ok: false,
      money,
      spouseId: null,
      romanceStates,
      reasonAr: 'لازم تشتري شقة تمليك الأول قبل الجواز! (من الإدارة أو مكتب العقارات)',
    };
  }
  if (romanceStates.some((r) => r.married)) {
    return {
      ok: false,
      money,
      spouseId: null,
      romanceStates,
      reasonAr: 'أنت متزوج بالفعل يا معلم!',
    };
  }
  const target = romanceStates.find((r) => r.id === girlId);
  if (!target) {
    return { ok: false, money, spouseId: null, romanceStates, reasonAr: 'الشخصية غير موجودة' };
  }
  if (target.affection < 70) {
    return {
      ok: false,
      money,
      spouseId: null,
      romanceStates,
      reasonAr: 'المودة لسه أقل من ٧٠٪ — اتكلم معاها وكسب قلبها الأول!',
    };
  }
  if (money < MARRIAGE_DOWRY_COST) {
    return {
      ok: false,
      money,
      spouseId: null,
      romanceStates,
      reasonAr: `تحتاج ${MARRIAGE_DOWRY_COST} ج.م للشبكة والفرح`,
    };
  }
  const next = romanceStates.map((r) =>
    r.id === girlId ? { ...r, married: true, affection: 100, moodAr: 'زوجتك السعيدة ❤️' } : r,
  );
  return { ok: true, money: money - MARRIAGE_DOWRY_COST, spouseId: girlId, romanceStates: next };
}

export const CHILD_WAIT_SECONDS = 45;

export function getPlayerLifeStage(
  romanceStates: RomanceRuntimeState[],
  spouseId: string | null,
  children: ChildMember[],
): PlayerLifeStage {
  if (children.length > 0) return 'parent';
  if (spouseId) return 'married';
  if (romanceStates.some((r) => r.talkCount > 0 || r.affection >= 28)) {
    return 'courting';
  }
  return 'single';
}

export const LIFE_STAGE_LABELS_AR: Record<PlayerLifeStage, string> = {
  single: 'أعزب في البيت الثابت',
  courting: 'في فترة تعارف وخطوبة',
  married: 'متزوج ومستقر',
  parent: 'أب ورب أسرة سعيدة',
};

export function getChildUnlockStatus(
  spouseId: string | null,
  children: ChildMember[],
  currentDay: number,
  marriedDay: number | null,
  marriageElapsedSec: number,
): { unlocked: boolean; remainingSec: number } {
  if (!spouseId || children.length >= 3) {
    return { unlocked: false, remainingSec: 0 };
  }
  if (marriedDay === null || currentDay > marriedDay || marriageElapsedSec >= CHILD_WAIT_SECONDS) {
    return { unlocked: true, remainingSec: 0 };
  }
  return {
    unlocked: false,
    remainingSec: Math.max(1, Math.ceil(CHILD_WAIT_SECONDS - marriageElapsedSec)),
  };
}

export function canHaveChildNow(
  spouseId: string | null,
  children: ChildMember[],
  currentDay = 1,
  marriedDay: number | null = null,
  marriageElapsedSec = 0,
): { eligible: boolean; waitRemainingSec: number } {
  const status = getChildUnlockStatus(
    spouseId,
    children,
    currentDay,
    marriedDay,
    marriageElapsedSec,
  );
  return {
    eligible: status.unlocked,
    waitRemainingSec: status.remainingSec,
  };
}

export function haveChild(
  money: number,
  spouseId: string | null,
  children: ChildMember[],
  options?: {
    currentDay?: number;
    marriedDay?: number | null;
    marriageElapsedSec?: number;
  },
): { ok: boolean; money: number; children: ChildMember[]; newChild?: ChildMember; reasonAr?: string } {
  if (!spouseId) {
    return { ok: false, money, children, reasonAr: 'أنت لسه أعزب! اتعرف واتجوز الأول قبل الخلفة' };
  }
  if (children.length >= 3) {
    return { ok: false, money, children, reasonAr: 'ربنا يبارك! عندك ٣ أولاد بالفعل في البيت الثابت' };
  }
  if (options && options.marriedDay !== undefined && options.marriedDay !== null) {
    const status = getChildUnlockStatus(
      spouseId,
      children,
      options.currentDay ?? options.marriedDay,
      options.marriedDay,
      options.marriageElapsedSec ?? 0,
    );
    if (!status.unlocked) {
      return {
        ok: false,
        money,
        children,
        reasonAr: `لسه متجوزين قريب! استمتع بفترة الجواز (${status.remainingSec}ث أو عدي يوم جديد) وبعدها ربنا يرزقكم بمولود ❤️`,
      };
    }
  }
  if (money < CHILD_EXPENSE_COST) {
    return {
      ok: false,
      money,
      children,
      reasonAr: `تحتاج ${CHILD_EXPENSE_COST} ج.م لتجهيز السبوع وغرفة البيبي`,
    };
  }
  const gender: 'boy' | 'girl' = children.length % 2 === 0 ? 'boy' : 'girl';
  const namePool = gender === 'boy' ? CHILD_NAMES_BOY : CHILD_NAMES_GIRL;
  const nameAr = namePool[children.length % namePool.length];
  const newChild: ChildMember = {
    id: `child-${children.length + 1}`,
    nameAr,
    gender,
    shirtColor: gender === 'boy' ? 0x3b82f6 : 0xec4899,
    happiness: 100,
  };
  return {
    ok: true,
    money: money - CHILD_EXPENSE_COST,
    children: [...children, newChild],
    newChild,
  };
}

export function buyCityShop(
  money: number,
  shops: CityShopRuntimeState[],
  shopId: string,
): { ok: boolean; money: number; shops: CityShopRuntimeState[]; reasonAr?: string } {
  const def = CITY_SHOPS.find((s) => s.id === shopId);
  const idx = shops.findIndex((s) => s.id === shopId);
  if (!def || idx === -1) {
    return { ok: false, money, shops, reasonAr: 'المحل غير موجود' };
  }
  if (shops[idx].owned) {
    return { ok: false, money, shops, reasonAr: 'أنت تمتلك هذا المحل بالفعل' };
  }
  if (money < def.purchasePrice) {
    return { ok: false, money, shops, reasonAr: `تحتاج ${def.purchasePrice} ج.م لشراء ${def.nameAr}` };
  }
  const next = shops.map((s, i) => (i === idx ? { ...s, owned: true } : s));
  return { ok: true, money: money - def.purchasePrice, shops: next };
}

export function hireShopManager(
  money: number,
  shops: CityShopRuntimeState[],
  shopId: string,
): { ok: boolean; money: number; shops: CityShopRuntimeState[]; cost: number; reasonAr?: string } {
  const def = CITY_SHOPS.find((s) => s.id === shopId);
  const idx = shops.findIndex((s) => s.id === shopId);
  if (!def || idx === -1) {
    return { ok: false, money, shops, cost: 0, reasonAr: 'المحل غير موجود' };
  }
  if (!shops[idx].owned) {
    return { ok: false, money, shops, cost: 0, reasonAr: 'اشترِ المحل أولاً قبل تعيين مدير' };
  }
  if (shops[idx].hasManager) {
    return { ok: false, money, shops, cost: 0, reasonAr: 'يوجد مدير معين لهذا المحل بالفعل' };
  }
  const cost = Math.round(def.purchasePrice * 0.4);
  if (money < cost) {
    return { ok: false, money, shops, cost, reasonAr: `تحتاج ${cost} ج.م لتعيين مدير للمحل` };
  }
  const next = shops.map((s, i) => (i === idx ? { ...s, hasManager: true } : s));
  return { ok: true, money: money - cost, shops: next, cost };
}

export function accrueShopProfits(
  shops: CityShopRuntimeState[],
  fractionOfDay: number,
): CityShopRuntimeState[] {
  return shops.map((s) => {
    if (!s.owned) return s;
    const def = CITY_SHOPS.find((d) => d.id === s.id);
    if (!def) return s;
    const mult = s.hasManager ? 1.55 : 1.0;
    return {
      ...s,
      accumulatedProfit: s.accumulatedProfit + def.dailyRevenue * mult * fractionOfDay,
    };
  });
}

export function collectAllShopProfits(
  money: number,
  shops: CityShopRuntimeState[],
): { totalCollected: number; money: number; shops: CityShopRuntimeState[] } {
  let total = 0;
  const next = shops.map((s) => {
    if (!s.owned || s.accumulatedProfit < 1) return s;
    const whole = Math.floor(s.accumulatedProfit);
    total += whole;
    return { ...s, accumulatedProfit: s.accumulatedProfit - whole };
  });
  return { totalCollected: total, money: money + total, shops: next };
}

export function computeTaxiFare(distanceMeters: number, reputation: number): number {
  const base = 24;
  const distFare = Math.round(distanceMeters * 0.68);
  const repBonus = reputation >= 75 ? 10 : 0;
  return Math.max(30, Math.min(140, base + distFare + repBonus));
}

/**
 * Checks whether the currently assembled sandwich matches the requested recipe.
 * Every required ingredient must be present, and no extra mismatched ingredients should ruin it.
 */
export function matchesOrder(
  heldIngredients: IngredientId[],
  recipeId: RecipeId,
): boolean {
  const recipe = RECIPES[recipeId];
  if (!recipe) return false;
  if (heldIngredients.length !== recipe.requiredIngredients.length) {
    return false;
  }
  const heldSet = new Set(heldIngredients);
  if (heldSet.size !== heldIngredients.length) {
    return false;
  }
  return recipe.requiredIngredients.every((req) => heldSet.has(req));
}

/**
 * Determines whether an ingredient can be added to the current sandwich in hand.
 * Bread must always be picked first!
 */
export function canAddIngredient(
  heldIngredients: IngredientId[],
  ingredient: IngredientId,
  inventory: InventoryState,
): { ok: boolean; reasonAr?: string } {
  if (inventory[ingredient] <= 0) {
    return {
      ok: false,
      reasonAr: `خلص ${INGREDIENTS[ingredient].nameAr}! اشترِ من السوق`,
    };
  }
  if (ingredient === 'bread') {
    if (heldIngredients.includes('bread')) {
      return { ok: false, reasonAr: 'معاك رغيف عيش مفتوح بالفعل!' };
    }
    return { ok: true };
  }
  if (!heldIngredients.includes('bread')) {
    return { ok: false, reasonAr: 'خد رغيف عيش بلدي الأول!' };
  }
  if (heldIngredients.includes(ingredient)) {
    return { ok: false, reasonAr: `أضفت ${INGREDIENTS[ingredient].nameAr} بالفعل` };
  }
  return { ok: true };
}

/**
 * Deducts one unit of each ingredient used in a completed sandwich.
 */
export function consumeIngredients(
  inventory: InventoryState,
  used: IngredientId[],
): InventoryState {
  const next = { ...inventory };
  for (const item of used) {
    next[item] = Math.max(0, next[item] - 1);
  }
  return next;
}

export function getLowStockIngredients(inventory: InventoryState): IngredientId[] {
  return (Object.keys(INGREDIENTS) as IngredientId[]).filter(
    (id) => inventory[id] <= INGREDIENTS[id].lowThreshold,
  );
}

export function restockIngredient(
  money: number,
  inventory: InventoryState,
  ingredient: IngredientId,
): { ok: boolean; money: number; inventory: InventoryState; cost: number } {
  const def = INGREDIENTS[ingredient];
  const cost = def.unitCost * def.packSize;
  if (money < cost) {
    return { ok: false, money, inventory, cost };
  }
  return {
    ok: true,
    money: money - cost,
    inventory: {
      ...inventory,
      [ingredient]: inventory[ingredient] + def.packSize,
    },
    cost,
  };
}

export function computeTipBonus(
  patienceRatio: number,
  reputation: number,
  decorLevel: number,
  activeRole: CrewRoleId,
): number {
  let tip = 0;
  if (patienceRatio >= 0.65) {
    tip += 3;
  } else if (patienceRatio >= 0.4) {
    tip += 1;
  }
  if (reputation >= 80) {
    tip += 2;
  }
  tip += Math.max(0, decorLevel - 1) * 2;
  if (activeRole === 'cashier') {
    tip = Math.ceil(tip * 1.25) + 1;
  }
  return tip;
}

export function computePriceFairnessModifier(
  chargedPrice: number,
  basePrice: number,
): number {
  const ratio = chargedPrice / Math.max(1, basePrice);
  if (ratio <= 1.0) return 2;
  if (ratio <= 1.25) return 0;
  if (ratio <= 1.5) return -2;
  return -5;
}

export function computeReputationDelta(
  servedOnTime: boolean,
  patienceRatio: number,
  chargedPrice: number,
  basePrice: number,
): number {
  if (!servedOnTime) {
    return -6;
  }
  const speedBonus = patienceRatio >= 0.6 ? 3 : 1;
  const priceDelta = computePriceFairnessModifier(chargedPrice, basePrice);
  return speedBonus + priceDelta;
}

export function clampReputation(rep: number): number {
  return Math.max(0, Math.min(100, Math.round(rep)));
}

export function computeUpgradeCost(
  upgradeKey: keyof ShopUpgrades,
  currentLevel: number,
): number {
  const baseByKey: Record<keyof ShopUpgrades, number> = {
    fryerLevel: 140,
    fulPotLevel: 120,
    decorLevel: 160,
    carEngineLevel: 180,
  };
  return baseByKey[upgradeKey] * currentLevel;
}

export function computeDailySummary(stats: DailyStats): {
  netProfit: number;
  ratingLabelAr: string;
} {
  const netProfit = stats.revenue - stats.expenses;
  let ratingLabelAr = 'يوم جيد في الحارة';
  if (stats.ordersServed >= 8 && netProfit >= 100) {
    ratingLabelAr = 'معلم كبير! المحل كله بيتكلم عنك';
  } else if (netProfit < 0) {
    ratingLabelAr = 'خسارة بسيطة — راجع الأسعار والمخزون بكرة';
  }
  return { netProfit, ratingLabelAr };
}

export function generateCustomerOrder(
  id: string,
  reputation: number,
  allowDelivery: boolean,
  randFn: () => number = Math.random,
): CustomerOrder {
  const archetypes: CustomerArchetype[] = [
    'rushed',
    'calm',
    'talkative',
    'haggler',
    'regular',
    'bulk',
  ];
  const archetype = archetypes[Math.floor(randFn() * archetypes.length)];
  const recipeKeys = Object.keys(RECIPES) as RecipeId[];
  const unlockedPool: RecipeId[] =
    reputation >= 55 ? recipeKeys : recipeKeys.slice(0, 4);
  const recipeId = unlockedPool[Math.floor(randFn() * unlockedPool.length)];
  const customerName =
    EGYPTIAN_NAMES[Math.floor(randFn() * EGYPTIAN_NAMES.length)];
  const dialoguePool = CUSTOMER_DIALOGUES[archetype];
  const dialogueAr =
    dialoguePool[Math.floor(randFn() * dialoguePool.length)];

  let maxPatience = 55;
  if (archetype === 'rushed') maxPatience = 38;
  if (archetype === 'calm') maxPatience = 75;
  if (archetype === 'bulk') maxPatience = 72;

  const isDelivery = allowDelivery && randFn() < 0.25;
  const dropoff = isDelivery
    ? DELIVERY_DROPOFFS[Math.floor(randFn() * DELIVERY_DROPOFFS.length)]
    : undefined;

  const quantity = archetype === 'bulk' ? 2 : 1;

  return {
    id,
    customerName,
    archetype,
    recipeId,
    quantity,
    deliveredCount: 0,
    patience: maxPatience,
    maxPatience,
    dialogueAr,
    isDelivery,
    deliveryTargetName: dropoff?.nameAr,
    deliveryX: dropoff?.x,
    deliveryZ: dropoff?.z,
    offeredTip: isDelivery ? 12 : 3,
  };
}

/**
 * Day/Night Cycle helpers.
 * timeOfDay in [0, 1): 0.0 = midnight, 0.25 = 06:00, 0.5 = 12:00, 0.75 = 18:00
 */
export function getDayPeriod(timeOfDay: number): DayPeriod {
  const t = ((timeOfDay % 1) + 1) % 1;
  if (t >= 0.23 && t < 0.42) return 'morning';
  if (t >= 0.42 && t < 0.62) return 'noon';
  if (t >= 0.62 && t < 0.75) return 'afternoon';
  if (t >= 0.75 && t < 0.86) return 'evening';
  return 'night';
}

export function getDayPeriodArabic(period: DayPeriod): string {
  switch (period) {
    case 'morning':
      return 'صباح الخير';
    case 'noon':
      return 'الظهر';
    case 'afternoon':
      return 'العصر';
    case 'evening':
      return 'المساء';
    case 'night':
      return 'الليل';
  }
}

export function formatGameClock(timeOfDay: number): string {
  const t = ((timeOfDay % 1) + 1) % 1;
  const totalMinutes = Math.floor(t * 24 * 60);
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const hh = String(hours24).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function computeSunElevation(timeOfDay: number): number {
  // Peak at noon (0.5), horizon at 0.25 and 0.75
  return Math.sin((timeOfDay - 0.25) * Math.PI * 2);
}

/**
 * Resolves a circle (player or car) against 2D AABB building obstacles so actors slide along walls cleanly.
 */
export function resolveCircleAABB(
  x: number,
  z: number,
  radius: number,
  boxes: AABB2D[],
): { x: number; z: number } {
  let outX = x;
  let outZ = z;
  for (const box of boxes) {
    if (box.active === false) continue;
    const closestX = Math.max(box.minX, Math.min(outX, box.maxX));
    const closestZ = Math.max(box.minZ, Math.min(outZ, box.maxZ));
    const dx = outX - closestX;
    const dz = outZ - closestZ;
    const distSq = dx * dx + dz * dz;
    if (distSq < radius * radius) {
      if (distSq > 1e-8) {
        const dist = Math.sqrt(distSq);
        const push = radius - dist;
        outX += (dx / dist) * push;
        outZ += (dz / dist) * push;
      } else {
        // Inside box center fallback: push out along shallowest axis
        const penLeft = Math.abs(outX - box.minX);
        const penRight = Math.abs(box.maxX - outX);
        const penTop = Math.abs(outZ - box.minZ);
        const penBot = Math.abs(box.maxZ - outZ);
        const minPen = Math.min(penLeft, penRight, penTop, penBot);
        if (minPen === penLeft) outX = box.minX - radius;
        else if (minPen === penRight) outX = box.maxX + radius;
        else if (minPen === penTop) outZ = box.minZ - radius;
        else outZ = box.maxZ + radius;
      }
    }
  }
  return { x: outX, z: outZ };
}

export function clampToPlayableWorld(
  x: number,
  z: number,
  limitX = 36,
  limitZ = 36,
): { x: number; z: number } {
  return {
    x: Math.max(-limitX, Math.min(limitX, x)),
    z: Math.max(-limitZ, Math.min(limitZ, z)),
  };
}

export function clampToCityBounds(x: number, z: number): { x: number; z: number } {
  return {
    x: Math.max(CITY_BOUNDS.minX, Math.min(CITY_BOUNDS.maxX, x)),
    z: Math.max(CITY_BOUNDS.minZ, Math.min(CITY_BOUNDS.maxZ, z)),
  };
}

/**
 * Adaptive quality evaluator: avoids rapid oscillation by requiring low FPS threshold.
 */
export function evaluateAdaptiveQuality(
  current: GraphicsQuality,
  avgFps: number,
  adaptiveEnabled: boolean,
): GraphicsQuality {
  if (!adaptiveEnabled) return current;
  if (avgFps < 26 && current === 'ultra') return 'medium';
  if (avgFps < 22 && current === 'medium') return 'low';
  if (avgFps > 52 && current === 'low') return 'medium';
  if (avgFps > 56 && current === 'medium') return 'ultra';
  return current;
}
