import { CityShopDef, DistrictId, StreetSegmentDef } from './types';

// 7 North-South Avenues x 7 Z-spans + 7 East-West Streets x 7 X-spans = 98 Named Streets!
export const NS_ROADS_X = [-82.5, -55, -27.5, 0, 27.5, 55, 82.5] as const;
export const EW_ROADS_Z = [-95.5, -67.5, -39.5, -11.5, 16.5, 44.5, 72.5] as const;

export const Z_SPANS: Array<{ min: number; max: number; mid: number; len: number }> = [
  { min: -108, max: -95.5, mid: -101.75, len: 12.5 },
  { min: -95.5, max: -67.5, mid: -81.5, len: 28 },
  { min: -67.5, max: -39.5, mid: -53.5, len: 28 },
  { min: -39.5, max: -11.5, mid: -25.5, len: 28 },
  { min: -11.5, max: 16.5, mid: 2.5, len: 28 },
  { min: 16.5, max: 44.5, mid: 30.5, len: 28 },
  { min: 44.5, max: 86, mid: 65.25, len: 41.5 },
];

export const X_SPANS: Array<{ min: number; max: number; mid: number; len: number }> = [
  { min: -98, max: -82.5, mid: -90.25, len: 15.5 },
  { min: -82.5, max: -55, mid: -68.75, len: 27.5 },
  { min: -55, max: -27.5, mid: -41.25, len: 27.5 },
  { min: -27.5, max: 0, mid: -13.75, len: 27.5 },
  { min: 0, max: 27.5, mid: 13.75, len: 27.5 },
  { min: 27.5, max: 55, mid: 41.25, len: 27.5 },
  { min: 55, max: 98, mid: 76.5, len: 43 },
];

export const CITY_BOUNDS = {
  minX: -97,
  maxX: 97,
  minZ: -105,
  maxZ: 84,
};

export const DISTRICTS: Record<
  DistrictId,
  {
    id: DistrictId;
    nameAr: string;
    vibeAr: string;
    accentHex: string;
    lightColorHex: number;
  }
> = {
  hara: {
    id: 'hara',
    nameAr: 'حارة المعلم الشعبية',
    vibeAr: 'حارة دافية بأنوار الزينة وريحة الفول والطعمية والبيوت الدافية',
    accentHex: '#f5b400',
    lightColorHex: 0xffcb69,
  },
  market: {
    id: 'market',
    nameAr: 'سوق الوكالة والتجارة',
    vibeAr: 'محلات مفتوحة وفرش خضار وعطارة وزحمة زباين طول اليوم',
    accentHex: '#10b981',
    lightColorHex: 0xffdd94,
  },
  workshop: {
    id: 'workshop',
    nameAr: 'حي الورش ومعرض السيارات',
    vibeAr: 'معرض سيارات وورش ميكانيكا ومحطات بنزين وصوت المفاتيح',
    accentHex: '#f97316',
    lightColorHex: 0xffb26b,
  },
  corniche: {
    id: 'corniche',
    nameAr: 'الكورنيش ووسط البلد',
    vibeAr: 'نخيل على شط النيل ومقاهي وأبراج ولافتات نيون مضيئة',
    accentHex: '#38bdf8',
    lightColorHex: 0xbfe3ff,
  },
  bakery: {
    id: 'bakery',
    nameAr: 'حي المخابز والأفران',
    vibeAr: 'أفران بلدي وريحة العيش الطازة والحلويات الشرقية',
    accentHex: '#eab308',
    lightColorHex: 0xffd27d,
  },
  residential: {
    id: 'residential',
    nameAr: 'الحي السكني والمدارس',
    vibeAr: 'مدارس وعمائر سكنية وشقق تمليك وحدائق للعائلات',
    accentHex: '#a78bfa',
    lightColorHex: 0xffe4b5,
  },
};

const NS_STREET_NAMES: string[][] = [
  // X = -82.5
  [
    'كورنيش الجزيرة الغربي',
    'شارع السفارات',
    'شارع عرابي الغربي',
    'شارع روض الفرج',
    'حارة الفجر',
    'شارع الزهور والمدارس',
    'شارع الطالبية الغربي',
  ],
  // X = -55
  [
    'كورنيش الزمالك الغربي',
    'شارع قصر النيل الغربي',
    'شارع الباشا',
    'شارع البقالين',
    'شارع العائلات',
    'حارة الزعفران',
    'شارع مدرسة النيل بنات',
  ],
  // X = -27.5
  [
    'شارع النيل البحري',
    'شارع طلعت حرب',
    'شارع العطارين',
    'شارع بقالة البركة',
    'الحارة الغربية',
    'شارع المخبز القديم',
    'شارع الفنون والمدارس',
  ],
  // X = 0 (Main Avenue)
  [
    'ميدان كورنيش النيل',
    'شارع عبد المنعم رياض',
    'شارع التحرير الشمالي',
    'شارع السوق وبنزين المعلم',
    'شارع المعلم الرئيسي',
    'شارع قهوة الحارة',
    'شارع الأزهر القبلي',
  ],
  // X = +27.5
  [
    'شارع الجلاء البحري',
    'شارع رمسيس',
    'شارع السوبرماركت',
    'شارع ورشة الأسطى بليغ',
    'الحارة الشرقية',
    'شارع الحرفيين',
    'شارع مدرسة المعلم',
  ],
  // X = +55
  [
    'كورنيش شبرا الشرقي',
    'شارع النخيل',
    'شارع معرض السيارات',
    'شارع الصنايعية',
    'شارع المعادي الجديد',
    'شارع الصيدلية والمدارس',
    'شارع الجامعة القبلي',
  ],
  // X = +82.5
  [
    'كورنيش المعادي الشمالي',
    'شارع صلاح سالم',
    'شارع الأوتوستراد',
    'شارع التوك توك السريع',
    'شارع النزهة',
    'شارع التجمع الهادئ',
    'شارع الدائري الشرقي',
  ],
];

const EW_STREET_NAMES: string[][] = [
  // Z = -95.5 (Corniche Waterfront)
  [
    'ممشى الزمالك النيلي',
    'مرسى المراكب الغربي',
    'كورنيش النيل الملكي',
    'ممشى أهل مصر الأوسط',
    'كورنيش ماسبيرو',
    'مرسى القوارب الشرقي',
    'كورنيش النزهة',
  ],
  // Z = -67.5
  [
    'شارع الدقي البحري',
    'شارع المرسى الغربي',
    'شارع الكورنيش الغربي',
    'كورنيش وسط البلد',
    'شارع الكورنيش الشرقي',
    'ممشى النيل الجديد',
    'شارع البواخر',
  ],
  // Z = -39.5
  [
    'شارع العجوزة',
    'شارع وسط البلد الغربي',
    'شارع الشريفين',
    'شارع وكالة البلح',
    'شارع الغورية',
    'شارع السمسار والعقارات',
    'شارع القبة',
  ],
  // Z = -11.5
  [
    'شارع البستان',
    'حارة الفكهاني',
    'شارع الخليفة',
    'الشارع العرضي الشمالي',
    'شارع سوق الخضار',
    'شارع قطع الغيار',
    'شارع الكاوتش',
  ],
  // Z = +16.5
  [
    'شارع الورود',
    'شارع الريحان',
    'حارة العيش والملح',
    'الشارع العرضي الجنوبي',
    'شارع الطاولة والشاي',
    'شارع الجراجات',
    'شارع المجمع',
  ],
  // Z = +44.5 (Schools Boulevard)
  [
    'شارع النهضة التعليمية',
    'شارع المدرسة الثانوية بنات',
    'شارع التربية والتعليم',
    'حارة المخابز',
    'شارع الحلواني',
    'شارع المدرسة الابتدائية',
    'شارع الصيدلية والنجارة',
  ],
  // Z = +72.5
  [
    'شارع الهرم الجديد',
    'شارع السكن الهادئ',
    'شارع حدائق المعلم',
    'شارع الأسرة السعيدة',
    'شارع البساتين',
    'شارع المحطة القبلي',
    'طريق الواحة',
  ],
];

function classifyDistrict(cx: number, cz: number): DistrictId {
  if (cz <= -64) return 'corniche';
  if (cx >= 24 && cz >= -56 && cz <= 18) return 'workshop';
  if (cx >= -22 && cx <= 22 && cz >= -18 && cz <= 20) return 'hara';
  if (cz >= -64 && cz < -12 && cx < 25) return 'market';
  if (cz > 16 && cz <= 40 && cx >= -34 && cx <= 34) return 'bakery';
  return 'residential';
}

function buildCityStreets(): StreetSegmentDef[] {
  const list: StreetSegmentDef[] = [];
  let idx = 1;

  // 49 North-South segments (7 roads x 7 spans)
  for (let r = 0; r < NS_ROADS_X.length; r++) {
    const rx = NS_ROADS_X[r];
    for (let s = 0; s < Z_SPANS.length; s++) {
      const span = Z_SPANS[s];
      const dId = classifyDistrict(rx, span.mid);
      list.push({
        id: `st-${String(idx).padStart(2, '0')}`,
        index: idx,
        nameAr: NS_STREET_NAMES[r][s],
        districtId: dId,
        axis: 'ns',
        centerX: rx,
        centerZ: span.mid,
        length: span.len,
        width: rx === 0 ? 10.6 : 9.4,
        vibeAr: DISTRICTS[dId].vibeAr,
      });
      idx++;
    }
  }

  // 49 East-West segments (7 roads x 7 spans) -> Total = 98 Named Streets!
  for (let r = 0; r < EW_ROADS_Z.length; r++) {
    const rz = EW_ROADS_Z[r];
    for (let s = 0; s < X_SPANS.length; s++) {
      const span = X_SPANS[s];
      const dId = classifyDistrict(span.mid, rz);
      list.push({
        id: `st-${String(idx).padStart(2, '0')}`,
        index: idx,
        nameAr: EW_STREET_NAMES[r][s],
        districtId: dId,
        axis: 'ew',
        centerX: span.mid,
        centerZ: rz,
        length: span.len,
        width: rz === -11.5 || rz === 16.5 || rz === 44.5 ? 10.4 : 9.4,
        vibeAr: DISTRICTS[dId].vibeAr,
      });
      idx++;
    }
  }

  return list;
}

export const CITY_STREETS: StreetSegmentDef[] = buildCityStreets();

export function getStreetContext(
  x: number,
  z: number,
): {
  street: StreetSegmentDef;
  district: (typeof DISTRICTS)[DistrictId];
} {
  let best = CITY_STREETS[0];
  let bestDist = Infinity;
  for (const st of CITY_STREETS) {
    const d = Math.hypot(x - st.centerX, z - st.centerZ);
    if (d < bestDist) {
      bestDist = d;
      best = st;
    }
  }
  return {
    street: best,
    district: DISTRICTS[best.districtId],
  };
}

export interface SchoolCampusDef {
  id: string;
  nameAr: string;
  subtitleAr: string;
  teacherNameAr: string;
  teacherLineAr: string;
  x: number;
  z: number;
  facingYaw: number;
  accentColor: number;
  hasBus?: boolean;
}

export const SCHOOL_CAMPUSES: SchoolCampusDef[] = [
  {
    id: 'school-nile-girls',
    nameAr: 'مدرسة بنها الخاصة',
    subtitleAr: '٣ مباني × ٤ طوابق · فصول وملاعب وحوش وبوابة',
    teacherNameAr: 'أستاذة هناء (مديرة مدرسة بنها الخاصة)',
    teacherLineAr: 'أهلاً يا معلم محمد! مدرسة بنها الخاصة جاهزة لتعليم ولادك — المباني الثلاثة والفصول والملاعب منورة!',
    x: -41.25,
    z: 58.5,
    facingYaw: Math.PI,
    accentColor: 0x3b82f6,
    hasBus: true,
  },
  {
    id: 'school-moalem-primary',
    nameAr: 'مدرسة المعلم الحديثة',
    subtitleAr: 'ابتدائي وإعدادي · فناء وملعب كرة',
    teacherNameAr: 'أستاذ طارق',
    teacherLineAr: 'أهلاً بأجدع معلم في الحي! الأولاد في الفسحة بيسلموا عليك.',
    x: 41.25,
    z: 58.5,
    facingYaw: Math.PI,
    accentColor: 0xeab308,
    hasBus: true,
  },
];

export const REMOTE_CREW_APARTMENT = {
  id: 'remote-crew-apt',
  nameAr: 'شقة الدور التاني — سكن المعلم والموظفين',
  streetAr: 'شارع الزهور والمدارس (شارع بعيد)',
  x: -68.75,
  z: 58.5,
  floorY: 3.6,
};

export const GAS_STATION_DEF = {
  id: 'gas-station-moalem',
  nameAr: 'محطة بنزين المعلم',
  streetAr: 'شارع السوق وبنزين المعلم',
  attendantNameAr: 'الأسطى فتحي عامل البنزينة',
  x: -13.75,
  z: -24.5,
};

export const PRIVATE_APARTMENT_DOOR_POS = { x: 11.4, z: 10.6 };

import type { OwnableBuildingDef, RestaurantBranchDef } from './types';

export const OWNABLE_BUILDINGS: OwnableBuildingDef[] = [
  {
    id: 'bld_moalem_tower',
    nameAr: 'برج المعلم التجاري',
    districtId: 'market',
    streetAr: 'شارع بقالة البركة',
    x: -41.25,
    z: -25.5,
    floors: 6,
    price: 240_000,
    dailyRentIncome: 8_500,
    colorHex: 0xd9c2a3,
  },
  {
    id: 'bld_corniche_plaza',
    nameAr: 'عمارة كورنيش النيل',
    districtId: 'corniche',
    streetAr: 'كورنيش النيل الملكي',
    x: -68.75,
    z: -81.5,
    floors: 7,
    price: 420_000,
    dailyRentIncome: 14_500,
    colorHex: 0xe2d4bc,
  },
  {
    id: 'bld_market_arcade',
    nameAr: 'برج السوق الجديد',
    districtId: 'market',
    streetAr: 'حارة الفجر',
    x: -68.75,
    z: 2.5,
    floors: 5,
    price: 185_000,
    dailyRentIncome: 6_200,
    colorHex: 0xcfb997,
  },
  {
    id: 'bld_station_court',
    nameAr: 'عمارة الأوتوستراد',
    districtId: 'workshop',
    streetAr: 'شارع الأوتوستراد',
    x: 68.75,
    z: -25.5,
    floors: 6,
    price: 270_000,
    dailyRentIncome: 9_400,
    colorHex: 0xc5d0dc,
  },
  {
    id: 'bld_benha_heights',
    nameAr: 'برج المعادي السكني',
    districtId: 'residential',
    streetAr: 'شارع المعادي الجديد',
    x: 68.75,
    z: 30.5,
    floors: 7,
    price: 360_000,
    dailyRentIncome: 12_500,
    colorHex: 0xd8c8b4,
  },
];

export const RESTAURANT_BRANCHES: RestaurantBranchDef[] = [
  {
    id: 'branch_corniche',
    nameAr: 'محل المعلم — فرع الكورنيش',
    streetAr: 'كورنيش النزهة',
    districtId: 'corniche',
    x: 68.75,
    z: -77.0,
    facingYaw: 0,
    price: 350_000,
    dailyProfit: 16_000,
  },
  {
    id: 'branch_school',
    nameAr: 'محل المعلم — فرع المدارس',
    streetAr: 'شارع النهضة التعليمية',
    districtId: 'residential',
    x: -13.75,
    z: 52.0,
    facingYaw: Math.PI,
    price: 260_000,
    dailyProfit: 11_500,
  },
  {
    id: 'branch_market',
    nameAr: 'محل المعلم — فرع سوق الغرب',
    streetAr: 'شارع البقالين',
    districtId: 'market',
    x: -68.75,
    z: -22.0,
    facingYaw: 0,
    price: 290_000,
    dailyProfit: 13_000,
  },
];

export const CITY_SHOPS: CityShopDef[] = [
  {
    id: 'shop-bakery',
    nameAr: 'مخبز الأمانة',
    categoryAr: 'أفران وعيش بلدي',
    districtId: 'bakery',
    streetNameAr: 'شارع قهوة الحارة',
    ownerNameAr: 'الحاج سيد الفران',
    ownerGreetingAr: 'أهلاً يا معلم! العيش البلدي السخن لسه طالع من بيت النار والعمال شغالين.',
    workerNameAr: 'الأسطى مسعد الخباز',
    workerRoleAr: 'خباز العيش البلدي',
    workerLineAr: 'الفرن حامي والعيش بيطلع طازة كل دقيقة! تحب نجهزلك شيكارة؟',
    x: -14.5,
    z: 23.6,
    facingYaw: Math.PI,
    signColorHex: '#f59e0b',
    glowHex: 0xf59e0b,
    facadeColor: 0x6b3518,
    purchasePrice: 380,
    dailyRevenue: 45,
    goods: [
      { id: 'bread-pack', labelAr: '٢٠ رغيف عيش بلدي طازة', cost: 22, ingredientId: 'bread', packQty: 20 },
      { id: 'bread-jumbo', labelAr: '٤٠ رغيف شيكارة كبيرة', cost: 40, ingredientId: 'bread', packQty: 40 },
    ],
  },
  {
    id: 'shop-ahwa',
    nameAr: 'قهوة الحارة',
    categoryAr: 'مقهى بلدي',
    districtId: 'hara',
    streetNameAr: 'الشارع العرضي الجنوبي',
    ownerNameAr: 'المعلم شوقي القهوجي',
    ownerGreetingAr: 'نورت القهوة يا ريس! القهوجي جوه بيصب أحلى شاي بالنعناع.',
    workerNameAr: 'إبراهيم القهوجي',
    workerRoleAr: 'صب الشاي والقهوة',
    workerLineAr: 'أحلى شاي مظبوط في الخمسينة لأجدع معلم في الحارة!',
    x: 14.5,
    z: 23.6,
    facingYaw: Math.PI,
    signColorHex: '#10b981',
    glowHex: 0x10b981,
    facadeColor: 0x123b2b,
    purchasePrice: 450,
    dailyRevenue: 55,
    goods: [
      { id: 'tea-boost', labelAr: 'براد شاي بالنعناع (+٤ سمعة)', cost: 18, reputationBoost: 4 },
      { id: 'ahwa-hospitality', labelAr: 'ضيافة زبائن المحل (+٨ سمعة)', cost: 32, reputationBoost: 8 },
    ],
  },
  {
    id: 'shop-workshop',
    nameAr: 'ورشة الأسطى بليغ',
    categoryAr: 'ميكانيكا وصيانة',
    districtId: 'workshop',
    streetNameAr: 'شارع ورشة الأسطى بليغ',
    ownerNameAr: 'الأسطى بليغ',
    ownerGreetingAr: 'عربيتك في أمان يا معلم! الصبيان جوه الورشة شغالين على المواتير.',
    workerNameAr: 'تامر الميكانيكي',
    workerRoleAr: 'فني مواتير وعفشة',
    workerLineAr: 'شدّينا البوجيهات وظبطنا الكربراتير، أي عربية تطلع من عندنا جديدة!',
    x: 33.6,
    z: -23.5,
    facingYaw: -Math.PI / 2,
    signColorHex: '#f97316',
    glowHex: 0xf97316,
    facadeColor: 0x3b2d23,
    purchasePrice: 620,
    dailyRevenue: 75,
    goods: [
      { id: 'full-tune', labelAr: 'صيانة كاملة للسيارة + تفويل', cost: 25, fuelBoost: 100 },
    ],
  },
  {
    id: 'shop-grocery',
    nameAr: 'بقالة البركة',
    categoryAr: 'بقالة وتموين',
    districtId: 'market',
    streetNameAr: 'شارع بقالة البركة',
    ownerNameAr: 'عم رجب البقال',
    ownerGreetingAr: 'الجبنة والمخلل والطحينة الطازة عندنا جوه المحل بأحسن سعر جملة!',
    workerNameAr: 'مصطفى البقال',
    workerRoleAr: 'مسؤول الأرفف والميزان',
    workerLineAr: 'كل البضاعة مترتبة وطازة، اتفضل ادخل بنفسك وشوف الأسعار.',
    x: -33.6,
    z: -23.5,
    facingYaw: Math.PI / 2,
    signColorHex: '#3b82f6',
    glowHex: 0x3b82f6,
    facadeColor: 0x1b345c,
    purchasePrice: 360,
    dailyRevenue: 40,
    goods: [
      { id: 'tahina-jar', labelAr: 'جردل طحينة (١٥ حصة)', cost: 24, ingredientId: 'tahina', packQty: 15 },
      { id: 'pickles-jar', labelAr: 'برطمان مخلل بلدي (١٨ حصة)', cost: 14, ingredientId: 'pickles', packQty: 18 },
    ],
  },
  {
    id: 'shop-kiosk',
    nameAr: 'كشك عم فرج',
    categoryAr: 'كشك ومشروبات',
    districtId: 'hara',
    streetNameAr: 'حارة العيش والملح',
    ownerNameAr: 'عم فرج',
    ownerGreetingAr: 'صباح الفل يا معلم! اتفضل ادخل، المشروبات الساقعة جاهزة.',
    workerNameAr: 'بلال الكشك',
    workerRoleAr: 'بائع بالكشك',
    workerLineAr: 'الزباين طول اليوم هنا يا معلم، الشارع شغال نار!',
    x: -9.5,
    z: 8.2,
    facingYaw: Math.PI / 2,
    signColorHex: '#22c55e',
    glowHex: 0x22c55e,
    facadeColor: 0x285444,
    purchasePrice: 240,
    dailyRevenue: 28,
    goods: [
      { id: 'kiosk-soda', labelAr: 'كراتين ساقع للزبائن (+٣ سمعة)', cost: 15, reputationBoost: 3 },
    ],
  },
  {
    id: 'shop-supermarket',
    nameAr: 'سوبرماركت النيل',
    categoryAr: 'سوبرماركت وتجارة جملة',
    districtId: 'corniche',
    streetNameAr: 'شارع السوبرماركت',
    ownerNameAr: 'أستاذ وائل',
    ownerGreetingAr: 'أهلاً بأشهر معلم! السوبرماركت مفتوح والأرفف مليانة جوه.',
    workerNameAr: 'مؤمن الكاشير',
    workerRoleAr: 'كاشير السوبرماركت',
    workerLineAr: 'الحسابات مظبوطة والفواتير سريعة، نورت السوبرماركت يا فندم!',
    x: 13.8,
    z: -45.5,
    facingYaw: 0,
    signColorHex: '#06b6d4',
    glowHex: 0x06b6d4,
    facadeColor: 0x164e63,
    purchasePrice: 780,
    dailyRevenue: 95,
    goods: [
      { id: 'sm-ful', labelAr: 'شيكارة فول مدمس (٢٥ حصة)', cost: 52, ingredientId: 'ful', packQty: 25 },
      { id: 'sm-taameya', labelAr: 'عجينة طعمية جاهزة (٢٥ حصة)', cost: 52, ingredientId: 'taameya', packQty: 25 },
      { id: 'sm-fries', labelAr: 'شيكارة بطاطس (٢٠ حصة)', cost: 42, ingredientId: 'fries', packQty: 20 },
    ],
  },
  {
    id: 'shop-butcher',
    nameAr: 'جزارة الأمانة',
    categoryAr: 'جزارة ومشويات',
    districtId: 'market',
    streetNameAr: 'شارع الغورية',
    ownerNameAr: 'المعلم مدحت الجزار',
    ownerGreetingAr: 'لحمة بلدي صابحة كل يوم! ادخل وشوف الشغل النظيف جوه.',
    workerNameAr: 'حمدي الصبي',
    workerRoleAr: 'تجهيز وتقطيع',
    workerLineAr: 'السكينة حامية واللحمة بتشفشف، تحت أمرك يا معلم!',
    x: -13.8,
    z: -45.5,
    facingYaw: 0,
    signColorHex: '#ef4444',
    glowHex: 0xef4444,
    facadeColor: 0x5c1919,
    purchasePrice: 540,
    dailyRevenue: 65,
    goods: [
      { id: 'butcher-rep', labelAr: 'وليمة لأهل الحارة (+٦ سمعة)', cost: 28, reputationBoost: 6 },
    ],
  },
  {
    id: 'shop-juice',
    nameAr: 'عصير القصب والمنعشات',
    categoryAr: 'عصائر طازة',
    districtId: 'corniche',
    streetNameAr: 'كورنيش وسط البلد',
    ownerNameAr: 'كابتن هاني',
    ownerGreetingAr: 'أحلى كوباية قصب باللمون تروي العطشان على الكورنيش!',
    workerNameAr: 'عماد العصيرجي',
    workerRoleAr: 'عصارة القصب',
    workerLineAr: 'القصب ساقع تلج والرغوة بتلمع، تشرب إيه يا باشا؟',
    x: 13.8,
    z: -73.0,
    facingYaw: 0,
    signColorHex: '#84cc16',
    glowHex: 0x84cc16,
    facadeColor: 0x2d4f1e,
    purchasePrice: 320,
    dailyRevenue: 38,
    goods: [
      { id: 'juice-salad', labelAr: 'خضار وسلطة طازة (١٨ حصة)', cost: 24, ingredientId: 'salad', packQty: 18 },
    ],
  },
  {
    id: 'shop-attar',
    nameAr: 'عطارة ومطحن الحسين',
    categoryAr: 'توابل وبقوليات',
    districtId: 'market',
    streetNameAr: 'شارع العطارين',
    ownerNameAr: 'الحاج ممدوح العطار',
    ownerGreetingAr: 'الكمون والكزبرة والفول البلدي من قلب الصعيد!',
    workerNameAr: 'وليد العطار',
    workerRoleAr: 'مطحنة البهارات',
    workerLineAr: 'ريحة الكمون المحمص ماليه الشارع كله يا معلم!',
    x: -41.0,
    z: -45.5,
    facingYaw: 0,
    signColorHex: '#d97706',
    glowHex: 0xd97706,
    facadeColor: 0x523415,
    purchasePrice: 490,
    dailyRevenue: 58,
    goods: [
      { id: 'attar-ful', labelAr: 'فول بلدي درجة أولى (٢٢ حصة)', cost: 44, ingredientId: 'ful', packQty: 22 },
      { id: 'attar-tahina', labelAr: 'طحينة سمسم أحمر (٢٠ حصة)', cost: 28, ingredientId: 'tahina', packQty: 20 },
    ],
  },
  {
    id: 'shop-koshary',
    nameAr: 'مطعم كشري التحرير',
    categoryAr: 'مطعم شعبي',
    districtId: 'corniche',
    streetNameAr: 'شارع التحرير الشمالي',
    ownerNameAr: 'الشيف طارق',
    ownerGreetingAr: 'المحل شغال ٢٤ ساعة في وسط البلد والعمال جوه مبيهدوش!',
    workerNameAr: 'شريف الشيف',
    workerRoleAr: 'مغرفة الكشري والدقة',
    workerLineAr: 'الطبق بيطلع بتقلية مقرمشة ودقة حارة! اتفضل جوه.',
    x: -13.8,
    z: -73.0,
    facingYaw: 0,
    signColorHex: '#e11d48',
    glowHex: 0xe11d48,
    facadeColor: 0x4c1726,
    purchasePrice: 680,
    dailyRevenue: 82,
    goods: [
      { id: 'koshary-rep', labelAr: 'دعاية ومهرجان طعام (+٧ سمعة)', cost: 30, reputationBoost: 7 },
    ],
  },
  {
    id: 'shop-carwash',
    nameAr: 'مغسلة وكاوتش الكورنيش',
    categoryAr: 'خدمات السيارات',
    districtId: 'workshop',
    streetNameAr: 'شارع الصنايعية',
    ownerNameAr: 'الأسطى كريم',
    ownerGreetingAr: 'غسيل وتشحيم وضبط زوايا في ٥ دقايق!',
    workerNameAr: 'فتحي عامل المغسلة',
    workerRoleAr: 'غسيل وتلميع السيارات',
    workerLineAr: 'الفوم والضغط العالي بيخلوا العربية مراية يا ريس!',
    x: 41.0,
    z: 2.0,
    facingYaw: -Math.PI / 2,
    signColorHex: '#0ea5e9',
    glowHex: 0x0ea5e9,
    facadeColor: 0x1e3a5f,
    purchasePrice: 420,
    dailyRevenue: 48,
    goods: [
      { id: 'wash-fuel', labelAr: 'غسيل + تزويد بنزين كامل', cost: 22, fuelBoost: 100 },
    ],
  },
  {
    id: 'shop-sweets',
    nameAr: 'حلواني الشام ومصر',
    categoryAr: 'حلويات شرقي',
    districtId: 'bakery',
    streetNameAr: 'شارع الحلواني',
    ownerNameAr: 'المعلم فؤاد الحلواني',
    ownerGreetingAr: 'كنافة وبسبوسة بالسمنة البلدي — ادخل وشوف الصواني جوه!',
    workerNameAr: 'خالد الحلواني',
    workerRoleAr: 'صنايعي كنافة وبقلاوة',
    workerLineAr: 'الشربات الدافي لسه مسقي على الكنافة يا معلم!',
    x: 13.8,
    z: 50.5,
    facingYaw: Math.PI,
    signColorHex: '#ec4899',
    glowHex: 0xec4899,
    facadeColor: 0x541c3c,
    purchasePrice: 560,
    dailyRevenue: 66,
    goods: [
      { id: 'sweets-rep', labelAr: 'صينية بسبوسة للزبائن (+٥ سمعة)', cost: 22, reputationBoost: 5 },
    ],
  },
  {
    id: 'shop-pharmacy',
    nameAr: 'صيدلية الشفاء',
    categoryAr: 'صيدلية ٢٤ ساعة',
    districtId: 'residential',
    streetNameAr: 'شارع الصيدلية والمدارس',
    ownerNameAr: 'د. سمر',
    ownerGreetingAr: 'أهلاً يا فندم، الصيدلية مفتوحة وبنخدم كل سكان الحي السكني والمدارس.',
    workerNameAr: 'د. مروان',
    workerRoleAr: 'صيدلي مناوب',
    workerLineAr: 'كل الأدوية والفيتامينات مرتبة وجاهزة لخدمة الحارة.',
    x: 41.0,
    z: 30.0,
    facingYaw: -Math.PI / 2,
    signColorHex: '#14b8a6',
    glowHex: 0x14b8a6,
    facadeColor: 0x134e4a,
    purchasePrice: 640,
    dailyRevenue: 76,
    goods: [
      { id: 'pharm-rep', labelAr: 'حملة صحة للحي (+٦ سمعة)', cost: 25, reputationBoost: 6 },
    ],
  },
  {
    id: 'shop-realestate',
    nameAr: 'مكتب عقارات المعلم',
    categoryAr: 'شقق تمليك وإدارة عقارات',
    districtId: 'market',
    streetNameAr: 'شارع السمسار والعقارات',
    ownerNameAr: 'أستاذ أشرف السمسار',
    ownerGreetingAr: 'عايز تشتري شقة تمليك للجواز أو تتملك محلات؟ المكتب مفتوح قدامك!',
    workerNameAr: 'أستاذ باسم',
    workerRoleAr: 'مستشار عقاري',
    workerLineAr: 'عندنا شقق تمليك من أول الحارة لحد الكورنيش!',
    x: 41.0,
    z: -45.5,
    facingYaw: 0,
    signColorHex: '#eab308',
    glowHex: 0xeab308,
    facadeColor: 0x3b2f13,
    purchasePrice: 900,
    dailyRevenue: 115,
    goods: [
      { id: 're-promo', labelAr: 'حملة إعلانية كبرى (+١٠ سمعة)', cost: 45, reputationBoost: 10 },
    ],
  },
  {
    id: 'shop-cardealer',
    nameAr: 'معرض المعلم للسيارات',
    categoryAr: 'بيع وشراء السيارات والتكاتك',
    districtId: 'workshop',
    streetNameAr: 'شارع معرض السيارات',
    ownerNameAr: 'المعلم هيثم موتورز',
    ownerGreetingAr: 'أفخم تشكيلة سيارات من الفيات والتوك توك لحد الكوبيه السبور!',
    workerNameAr: 'سيف مبيعات المعرض',
    workerRoleAr: 'فاحص وتجربة قيادة',
    workerLineAr: 'العربيات بتلمع في الصالة، تقدر تشتري اللي يعجبك من الإدارة أو من المعرض!',
    x: 41.0,
    z: -73.0,
    facingYaw: 0,
    signColorHex: '#38bdf8',
    glowHex: 0x38bdf8,
    facadeColor: 0x1e293b,
    purchasePrice: 1050,
    dailyRevenue: 130,
    goods: [
      { id: 'dealer-tune', labelAr: 'تلميع وفحص كامل (+١٠٠٪ بنزين وحالة)', cost: 30, fuelBoost: 100 },
    ],
  },
];

// Curated taxi pickup & dropoff waypoints across the 98 streets & schools
export const TAXI_WAYPOINTS: Array<{ streetAr: string; x: number; z: number }> = [
  { streetAr: 'شارع المعلم الرئيسي', x: -3.5, z: -2.0 },
  { streetAr: 'كورنيش وسط البلد', x: 0, z: -67.5 },
  { streetAr: 'ممشى أهل مصر الأوسط', x: 0, z: -95.5 },
  { streetAr: 'سوق وكالة البلح', x: 12.5, z: -39.5 },
  { streetAr: 'ورشة الأسطى بليغ', x: 27.5, z: -23.5 },
  { streetAr: 'بقالة البركة', x: -27.5, z: -23.5 },
  { streetAr: 'قهوة الحارة', x: 14.5, z: 16.5 },
  { streetAr: 'مخبز الأمانة', x: -14.5, z: 16.5 },
  { streetAr: 'سوبرماركت النيل', x: 27.5, z: -39.5 },
  { streetAr: 'معرض المعلم للسيارات', x: 55.0, z: -67.5 },
  { streetAr: 'مدرسة بنها الخاصة', x: -41.25, z: 44.5 },
  { streetAr: 'مدرسة المعلم الحديثة', x: 41.25, z: 44.5 },
  { streetAr: 'شقة الدور التاني — شارع الزهور والمدارس', x: -68.75, z: 44.5 },
  { streetAr: 'محطة بنزين المعلم', x: -13.75, z: -11.5 },
  { streetAr: 'صيدلية الشفاء', x: 55.0, z: 30.0 },
  { streetAr: 'شارع الأوتوستراد', x: 82.5, z: -25.5 },
];
