import {
  CashierAccountingSummary,
  CashierControllerSettings,
  CustomerInquiry,
  CustomerOrder,
  DailyStats,
  FullMenuItemDef,
  FullMenuItemId,
  InquiryReplyMode,
  KitchenTicket,
  KitchenTicketStatus,
  PartnerShareEntry,
  PlayerCharacterId,
  PosCartLine,
  PosExtraItemId,
  PosMenuCategory,
  PosReceipt,
  RecipeId,
  ShiftSettlementPreview,
  VipMember,
  VipTier,
} from './types';

export const MENU_CATEGORY_LABELS_AR: Record<'all' | PosMenuCategory, string> = {
  all: 'الكل (١٤)',
  sandwiches: 'سندوتشات المحل',
  plates: 'أطباق وسرفيس',
  sides: 'سلطات ومقبلات',
  drinks: 'مشروبات وعصائر',
};

export const FULL_MENU_CATALOG: Record<FullMenuItemId, FullMenuItemDef> = {
  ful_oil: {
    id: 'ful_oil',
    nameAr: 'سندوتش فول بالزيت الحار',
    category: 'sandwiches',
    basePrice: 12,
    ingredientsDescAr: 'عيش بلدي + فول مدمس + زيت حار وكمون وليمون',
    prepNoteAr: 'يجهز في المطبخ من قدرة الفول الساخنة',
    linkedRecipeId: 'ful_oil',
  },
  ful_tahina: {
    id: 'ful_tahina',
    nameAr: 'سندوتش فول بالطحينة',
    category: 'sandwiches',
    basePrice: 15,
    ingredientsDescAr: 'عيش بلدي + فول مدمس + طحينة بالكمون',
    prepNoteAr: 'الأكثر طلباً في الفطار الصباحي',
    linkedRecipeId: 'ful_tahina',
  },
  taameya_plain: {
    id: 'taameya_plain',
    nameAr: 'سندوتش طعمية سخنة',
    category: 'sandwiches',
    basePrice: 12,
    ingredientsDescAr: 'عيش بلدي + أقراص طعمية طازجة بالسمسم',
    prepNoteAr: 'تُقلى طازجة في الزيت الذهبي',
    linkedRecipeId: 'taameya_plain',
  },
  taameya_salad: {
    id: 'taameya_salad',
    nameAr: 'طعمية بالسلطة والطحينة',
    category: 'sandwiches',
    basePrice: 18,
    ingredientsDescAr: 'عيش بلدي + طعمية + سلطة بلدي + طحينة',
    prepNoteAr: 'وجبة خفيفة متكاملة ومقرمشة',
    linkedRecipeId: 'taameya_salad',
  },
  fries_sandwich: {
    id: 'fries_sandwich',
    nameAr: 'سندوتش بطاطس بالمخلل',
    category: 'sandwiches',
    basePrice: 16,
    ingredientsDescAr: 'عيش بلدي + بطاطس محمرة + مخلل بلدي مشكل',
    prepNoteAr: 'بطاطس مقرمشة من القلاية مباشرة',
    linkedRecipeId: 'fries_sandwich',
  },
  mixed_special: {
    id: 'mixed_special',
    nameAr: 'سندوتش المعلم المشكل',
    category: 'sandwiches',
    basePrice: 24,
    ingredientsDescAr: 'عيش بلدي + فول + طعمية + سلطة + طحينة',
    prepNoteAr: 'خلطة المعلم الخاصة — يشبّع يوم كامل',
    linkedRecipeId: 'mixed_special',
  },
  ful_sausage_plate: {
    id: 'ful_sausage_plate',
    nameAr: 'طبق فول بالسمنة البلدي والدقة',
    category: 'plates',
    basePrice: 28,
    ingredientsDescAr: 'طبق فول ساخن بالسمنة البلدي + دقة ثوم + ٢ رغيف بلدي',
    prepNoteAr: 'يُقدم ساخناً مع رغيفين عيش بلدي',
  },
  taameya_platter: {
    id: 'taameya_platter',
    nameAr: 'سرفيس طعمية محشية وبطاطس',
    category: 'plates',
    basePrice: 36,
    ingredientsDescAr: '٦ أقراص طعمية محشية بالبصل + بطاطس + طحينة + عيش',
    prepNoteAr: 'مناسب للعائلة أو الشلة في المحل',
  },
  fries_plate: {
    id: 'fries_plate',
    nameAr: 'طبق بطاطس عائلي بالتوابل',
    category: 'plates',
    basePrice: 25,
    ingredientsDescAr: 'طبق كبير بطاطس مقرمشة + كاتشب + طحينة',
    prepNoteAr: 'يُحمر طازجاً على درجة عالية',
  },
  babaganoush: {
    id: 'babaganoush',
    nameAr: 'طبق بابا غنوج بالطحينة',
    category: 'sides',
    basePrice: 18,
    ingredientsDescAr: 'باذنجان مشوي + طحينة خام + بقدونس وزيت زيتون',
    prepNoteAr: 'مقبلات طازجة تُحضّر يومياً',
  },
  salad_pickles_plate: {
    id: 'salad_pickles_plate',
    nameAr: 'طبق سلطة بلدي ومخلل',
    category: 'sides',
    basePrice: 10,
    ingredientsDescAr: 'طماطم وخيار وبصل + مخلل لفت وجزر وفلفل',
    prepNoteAr: 'إضافة أساسية جنب أي طلب فول وطعمية',
  },
  tea_mint: {
    id: 'tea_mint',
    nameAr: 'كوباية شاي بالنعناع',
    category: 'drinks',
    basePrice: 10,
    ingredientsDescAr: 'شاي كشري مصري أصلي + نعناع أخضر فريش',
    prepNoteAr: 'تظبيط المزاج بعد الأكل في الحارة',
  },
  karkadeh: {
    id: 'karkadeh',
    nameAr: 'كركديه ساقع مثلج',
    category: 'drinks',
    basePrice: 14,
    ingredientsDescAr: 'كركديه أسواني مركز ساقع بسكر مظبوط',
    prepNoteAr: 'يروّي العطش في حر الشارع',
  },
  sugarcane_juice: {
    id: 'sugarcane_juice',
    nameAr: 'عصير قصب فريش',
    category: 'drinks',
    basePrice: 15,
    ingredientsDescAr: 'قصب معصور طازج برغوته في الكوباية الكبيرة',
    prepNoteAr: 'فريش بدون أي إضافات صناعية',
  },
};

export const FULL_MENU_ORDER: FullMenuItemId[] = [
  'ful_oil',
  'ful_tahina',
  'taameya_plain',
  'taameya_salad',
  'fries_sandwich',
  'mixed_special',
  'ful_sausage_plate',
  'taameya_platter',
  'fries_plate',
  'babaganoush',
  'salad_pickles_plate',
  'tea_mint',
  'karkadeh',
  'sugarcane_juice',
];

export const POS_EXTRA_IDS: PosExtraItemId[] = [
  'ful_sausage_plate',
  'taameya_platter',
  'fries_plate',
  'babaganoush',
  'salad_pickles_plate',
  'tea_mint',
  'karkadeh',
  'sugarcane_juice',
];

export const VIP_TIER_CONFIG: Record<
  VipTier,
  { labelAr: string; discountPct: number; minPoints: number }
> = {
  bronze: { labelAr: 'برونزي', discountPct: 5, minPoints: 0 },
  silver: { labelAr: 'فضي', discountPct: 10, minPoints: 100 },
  gold: { labelAr: 'ذهبي', discountPct: 15, minPoints: 250 },
};

export function computeVipTier(points: number): VipTier {
  if (points >= VIP_TIER_CONFIG.gold.minPoints) return 'gold';
  if (points >= VIP_TIER_CONFIG.silver.minPoints) return 'silver';
  return 'bronze';
}

export function createInitialVipMembers(): VipMember[] {
  return [
    {
      id: 'vip-1',
      nameAr: 'الحاج حسين',
      phone: '01012345678',
      points: 280,
      tier: 'gold',
      visits: 18,
      totalSpent: 1940,
    },
    {
      id: 'vip-2',
      nameAr: 'مدام نادية',
      phone: '01122334455',
      points: 145,
      tier: 'silver',
      visits: 11,
      totalSpent: 890,
    },
    {
      id: 'vip-3',
      nameAr: 'الأسطى سعيد',
      phone: '01299887766',
      points: 120,
      tier: 'silver',
      visits: 9,
      totalSpent: 720,
    },
    {
      id: 'vip-4',
      nameAr: 'كابتن حازم',
      phone: '01544332211',
      points: 60,
      tier: 'bronze',
      visits: 5,
      totalSpent: 340,
    },
    {
      id: 'vip-5',
      nameAr: 'آنسة ريم',
      phone: '01077665544',
      points: 45,
      tier: 'bronze',
      visits: 4,
      totalSpent: 260,
    },
  ];
}

export function awardVipPoints(
  members: VipMember[],
  vipId: string,
  spentAmount: number,
): VipMember[] {
  const earnedPoints = Math.max(2, Math.floor((Math.max(0, spentAmount) / 100) * 10));
  return members.map((m) => {
    if (m.id !== vipId) return m;
    const nextPoints = m.points + earnedPoints;
    return {
      ...m,
      points: nextPoints,
      tier: computeVipTier(nextPoints),
      visits: m.visits + 1,
      totalSpent: m.totalSpent + Math.max(0, Math.round(spentAmount)),
    };
  });
}

export function generateQrMatrix(seedStr: string, size = 11): boolean[][] {
  const n = Math.max(9, size);
  const grid: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));

  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (r0 + r < n && c0 + c < n) {
          grid[r0 + r][c0 + c] = !(r === 1 && c === 1);
        }
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, n - 3);
  drawFinder(n - 3, 0);

  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const inTopLeft = r < 4 && c < 4;
      const inTopRight = r < 4 && c >= n - 4;
      const inBottomLeft = r >= n - 4 && c < 4;
      if (inTopLeft || inTopRight || inBottomLeft) continue;
      hash = (Math.imul(hash ^ (r * 31 + c * 17), 1664525) + 1013904223) >>> 0;
      grid[r][c] = (hash & 1) === 1;
    }
  }
  return grid;
}

export function createInitialExtraPrices(): Record<PosExtraItemId, number> {
  return {
    ful_sausage_plate: FULL_MENU_CATALOG.ful_sausage_plate.basePrice,
    taameya_platter: FULL_MENU_CATALOG.taameya_platter.basePrice,
    fries_plate: FULL_MENU_CATALOG.fries_plate.basePrice,
    babaganoush: FULL_MENU_CATALOG.babaganoush.basePrice,
    salad_pickles_plate: FULL_MENU_CATALOG.salad_pickles_plate.basePrice,
    tea_mint: FULL_MENU_CATALOG.tea_mint.basePrice,
    karkadeh: FULL_MENU_CATALOG.karkadeh.basePrice,
    sugarcane_juice: FULL_MENU_CATALOG.sugarcane_juice.basePrice,
  };
}

export function createDefaultCashierSettings(): CashierControllerSettings {
  return {
    maxDiscountPct: 10,
    taxRatePct: 0,
    cashierRegisterLocked: false,
    allowCashierCustomDiscount: true,
    openingDrawerFloat: 200,
  };
}

export function isRecipeMenuId(id: FullMenuItemId): id is RecipeId {
  return (
    id === 'ful_oil' ||
    id === 'ful_tahina' ||
    id === 'taameya_plain' ||
    id === 'taameya_salad' ||
    id === 'fries_sandwich' ||
    id === 'mixed_special'
  );
}

export function getMenuItemPrice(
  itemId: FullMenuItemId,
  recipePrices: Record<RecipeId, number>,
  extraPrices: Record<PosExtraItemId, number>,
): number {
  if (isRecipeMenuId(itemId)) {
    return recipePrices[itemId] ?? FULL_MENU_CATALOG[itemId].basePrice;
  }
  return extraPrices[itemId] ?? FULL_MENU_CATALOG[itemId].basePrice;
}

export interface PosCalculationInput {
  items: Array<{ itemId: FullMenuItemId; qty: number }>;
  recipePrices: Record<RecipeId, number>;
  extraPrices: Record<PosExtraItemId, number>;
  discountPct: number;
  vipDiscountPct?: number;
  settings: CashierControllerSettings;
  tipAmount?: number;
  paidAmount?: number;
  paymentMethod?: 'cash' | 'instapay';
}

export interface PosCalculationResult {
  lines: PosCartLine[];
  subtotal: number;
  appliedDiscountPct: number;
  discountAmount: number;
  vipDiscountPct: number;
  vipDiscountAmount: number;
  taxPct: number;
  taxAmount: number;
  tipAmount: number;
  total: number;
  paidAmount: number;
  changeAmount: number;
  isPaymentSufficient: boolean;
  shortBy: number;
}

export function calculatePosTotals(input: PosCalculationInput): PosCalculationResult {
  const lines: PosCartLine[] = input.items
    .filter((it) => it.qty > 0 && FULL_MENU_CATALOG[it.itemId])
    .map((it) => {
      const def = FULL_MENU_CATALOG[it.itemId];
      const unitPrice = getMenuItemPrice(it.itemId, input.recipePrices, input.extraPrices);
      const qty = Math.max(1, Math.min(50, Math.round(it.qty)));
      return {
        itemId: it.itemId,
        nameAr: def.nameAr,
        qty,
        unitPrice,
        lineTotal: unitPrice * qty,
      };
    });

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const allowedMax = input.settings.allowCashierCustomDiscount
    ? Math.max(0, Math.min(50, input.settings.maxDiscountPct))
    : 0;
  const appliedDiscountPct = Math.max(0, Math.min(allowedMax, input.discountPct));
  const discountAmount = Math.round((subtotal * appliedDiscountPct) / 100);

  const vipDiscountPct = Math.max(0, Math.min(20, input.vipDiscountPct ?? 0));
  const vipDiscountAmount = Math.round((subtotal * vipDiscountPct) / 100);

  const afterDiscount = Math.max(0, subtotal - discountAmount - vipDiscountAmount);
  const taxPct = Math.max(0, Math.min(25, input.settings.taxRatePct));
  const taxAmount = Math.round((afterDiscount * taxPct) / 100);
  const tipAmount = Math.max(0, Math.round(input.tipAmount ?? 0));
  const total = afterDiscount + taxAmount + tipAmount;

  const paymentMethod = input.paymentMethod ?? 'cash';
  const paidAmount =
    paymentMethod === 'instapay'
      ? total
      : Math.max(0, Math.round(input.paidAmount ?? total));
  const diff = paidAmount - total;
  return {
    lines,
    subtotal,
    appliedDiscountPct,
    discountAmount,
    vipDiscountPct,
    vipDiscountAmount,
    taxPct,
    taxAmount,
    tipAmount,
    total,
    paidAmount,
    changeAmount: Math.max(0, diff),
    isPaymentSufficient: total > 0 && paidAmount >= total,
    shortBy: Math.max(0, -diff),
  };
}

export function issuePosReceipt(params: {
  seq: number;
  day: number;
  clockStr: string;
  cashierNameAr: string;
  managerNameAr: string;
  customerNameAr: string;
  paymentMethod: 'cash' | 'instapay';
  calc: PosCalculationResult;
  source: 'pos' | 'counter';
  vipMemberId?: string;
  vipTier?: VipTier;
  isDelivery?: boolean;
}): { receipt: PosReceipt; nextSeq: number } {
  const padded = String(params.seq).padStart(4, '0');
  const invoiceNumber = `INV-${params.day}-${padded}`;
  const isDelivery = Boolean(params.isDelivery);
  const qrOrderCode = `ELMOALEM|${invoiceNumber}|${params.calc.total}|${isDelivery ? 'DLV' : 'POS'}`;
  const receipt: PosReceipt = {
    id: `rec-${params.day}-${params.seq}-${Math.random().toString(36).slice(2, 6)}`,
    invoiceNumber,
    day: params.day,
    clockStr: params.clockStr,
    cashierNameAr: params.cashierNameAr,
    managerNameAr: params.managerNameAr,
    customerNameAr: params.customerNameAr.trim() || 'زبون المحل',
    paymentMethod: params.paymentMethod,
    items: params.calc.lines,
    subtotal: params.calc.subtotal,
    discountPct: params.calc.appliedDiscountPct,
    discountAmount: params.calc.discountAmount,
    vipMemberId: params.vipMemberId,
    vipTier: params.vipTier,
    vipDiscountPct: params.calc.vipDiscountPct,
    vipDiscountAmount: params.calc.vipDiscountAmount,
    taxPct: params.calc.taxPct,
    taxAmount: params.calc.taxAmount,
    tipAmount: params.calc.tipAmount,
    total: params.calc.total,
    paidAmount: params.calc.paidAmount,
    changeAmount: params.calc.changeAmount,
    source: params.source,
    isDelivery,
    qrOrderCode,
    refundStatus: 'none',
  };
  return {
    receipt,
    nextSeq: params.seq + 1,
  };
}

export function computeAccountingSummary(
  receipts: PosReceipt[],
  settings: CashierControllerSettings,
): CashierAccountingSummary {
  let cashSalesTotal = 0;
  let instapaySalesTotal = 0;
  let totalDiscountsGiven = 0;
  let totalVipDiscountsGiven = 0;
  let totalTaxCollected = 0;
  let totalTipsCollected = 0;
  let refundedCount = 0;
  let refundedTotal = 0;
  let activeCount = 0;
  const itemAgg = new Map<
    FullMenuItemId,
    { itemId: FullMenuItemId; nameAr: string; qty: number; revenue: number }
  >();

  for (const r of receipts) {
    if (r.refundStatus === 'approved') {
      refundedCount += 1;
      refundedTotal += r.total;
      continue;
    }
    activeCount += 1;
    if (r.paymentMethod === 'cash') {
      cashSalesTotal += r.total;
    } else {
      instapaySalesTotal += r.total;
    }
    totalDiscountsGiven += r.discountAmount;
    totalVipDiscountsGiven += r.vipDiscountAmount ?? 0;
    totalTaxCollected += r.taxAmount;
    totalTipsCollected += r.tipAmount;

    for (const line of r.items) {
      const prev = itemAgg.get(line.itemId);
      if (prev) {
        prev.qty += line.qty;
        prev.revenue += line.lineTotal;
      } else {
        itemAgg.set(line.itemId, {
          itemId: line.itemId,
          nameAr: line.nameAr,
          qty: line.qty,
          revenue: line.lineTotal,
        });
      }
    }
  }

  const topSellingItems = Array.from(itemAgg.values())
    .sort((a, b) => b.revenue - a.revenue || b.qty - a.qty)
    .slice(0, 6);

  return {
    invoiceCount: activeCount,
    cashSalesTotal,
    instapaySalesTotal,
    totalDiscountsGiven,
    totalVipDiscountsGiven,
    totalTaxCollected,
    totalTipsCollected,
    refundedCount,
    refundedTotal,
    expectedCashDrawer: settings.openingDrawerFloat + cashSalesTotal,
    grossSalesTotal: cashSalesTotal + instapaySalesTotal,
    topSellingItems,
  };
}

export function createKitchenTicketFromReceipt(receipt: PosReceipt): KitchenTicket {
  return {
    id: `kds-${receipt.invoiceNumber}`,
    invoiceNumber: receipt.invoiceNumber,
    customerNameAr: receipt.customerNameAr,
    items: receipt.items.map((it) => ({ ...it })),
    status: 'queued',
    isDelivery: Boolean(receipt.isDelivery),
    createdClock: receipt.clockStr,
  };
}

export function advanceKitchenTicketStatus(
  ticket: KitchenTicket,
  nextStatus: KitchenTicketStatus,
  actorNameAr: string,
  clockStr: string,
): KitchenTicket {
  const validOrder: Record<KitchenTicketStatus, KitchenTicketStatus[]> = {
    queued: ['cooking'],
    cooking: ['ready'],
    ready: ['served'],
    served: [],
  };
  if (!validOrder[ticket.status].includes(nextStatus)) {
    return ticket;
  }
  return {
    ...ticket,
    status: nextStatus,
    chefNameAr:
      nextStatus === 'cooking' || nextStatus === 'ready'
        ? actorNameAr
        : ticket.chefNameAr,
    updatedClock: clockStr,
  };
}

export const SHOP_RENT_DAILY = 60;
export const UTILITIES_DAILY = 35;

export const PARTNER_PROFIT_SPLITS: Array<{
  characterId: PlayerCharacterId;
  nameAr: string;
  roleTitleAr: string;
  sharePct: number;
}> = [
  { characterId: 'mohamed', nameAr: 'محمد', roleTitleAr: 'صاحب المحل والمدير', sharePct: 30 },
  { characterId: 'ahmed', nameAr: 'أحمد', roleTitleAr: 'الشيف ومعلم القلي', sharePct: 25 },
  { characterId: 'ali', nameAr: 'علي', roleTitleAr: 'الكاشير والمحاسب', sharePct: 25 },
  { characterId: 'mahmoud', nameAr: 'محمود', roleTitleAr: 'سائق التوصيل والسوق', sharePct: 20 },
];

export function computeShiftSettlementPreview(params: {
  day: number;
  summary: CashierAccountingSummary;
  dailyStats: DailyStats;
}): ShiftSettlementPreview {
  const { day, summary, dailyStats } = params;
  const grossRevenue = summary.grossSalesTotal;
  const tipsAndSideIncome = dailyStats.sideJobIncome + dailyStats.shopDividends;
  const shopRentExpense = SHOP_RENT_DAILY;
  const utilitiesExpense = UTILITIES_DAILY;
  const stockAndUpgradesExpense = Math.max(0, Math.round(dailyStats.expenses));
  const refundsTotal = summary.refundedTotal;
  const totalExpenses = shopRentExpense + utilitiesExpense + stockAndUpgradesExpense;
  const netProfit = Math.round(grossRevenue + tipsAndSideIncome - totalExpenses);
  const distributable = Math.max(0, netProfit);

  let allocated = 0;
  const partnerShares: PartnerShareEntry[] = PARTNER_PROFIT_SPLITS.map((p, idx) => {
    const rawAmt =
      idx === 0
        ? 0
        : Math.round((distributable * p.sharePct) / 100);
    allocated += rawAmt;
    return {
      characterId: p.characterId,
      nameAr: p.nameAr,
      roleTitleAr: p.roleTitleAr,
      sharePct: p.sharePct,
      amount: rawAmt,
    };
  });
  if (partnerShares.length > 0) {
    partnerShares[0] = {
      ...partnerShares[0],
      amount: Math.max(0, distributable - allocated),
    };
  }

  return {
    day,
    grossRevenue,
    tipsAndSideIncome,
    shopRentExpense,
    utilitiesExpense,
    stockAndUpgradesExpense,
    refundsTotal,
    totalExpenses,
    netProfit,
    partnerShares,
  };
}

const INQUIRY_CUSTOMER_NAMES = [
  'الحاج حسين',
  'مدام نادية',
  'أحمد أفندي',
  'الأسطى سعيد',
  'آنسة ريم',
  'عم رمضان',
  'كابتن حازم',
];

export function generateCustomerInquiry(
  id: string,
  recipePrices: Record<RecipeId, number>,
  extraPrices: Record<PosExtraItemId, number>,
  orders: CustomerOrder[],
  randFn: () => number = Math.random,
): CustomerInquiry {
  const namesPool =
    orders.length > 0
      ? [orders[0].customerName, ...INQUIRY_CUSTOMER_NAMES]
      : INQUIRY_CUSTOMER_NAMES;
  const customerNameAr = namesPool[Math.floor(randFn() * namesPool.length)];
  const itemId = FULL_MENU_ORDER[Math.floor(randFn() * FULL_MENU_ORDER.length)];
  const itemDef = FULL_MENU_CATALOG[itemId];
  const price = getMenuItemPrice(itemId, recipePrices, extraPrices);

  const topics: CustomerInquiry['topic'][] = [
    'price_check',
    'multi_total',
    'change_check',
    'discount_request',
    'ingredients',
  ];
  const topic = topics[Math.floor(randFn() * topics.length)];

  if (topic === 'multi_total') {
    const qty = 2 + Math.floor(randFn() * 3);
    return {
      id,
      customerNameAr,
      customerMoodEmoji: '🤔',
      topic,
      targetItemId: itemId,
      targetQty: qty,
      questionAr: `يا أستاذ الكاشير، لو طلبت ${qty} × ${itemDef.nameAr} الحساب الصافي يبقى كام بالظبط؟`,
      answered: false,
    };
  }

  if (topic === 'change_check') {
    const qty = 1 + Math.floor(randFn() * 2);
    const total = price * qty;
    const note = total <= 45 ? 50 : total <= 90 ? 100 : 200;
    return {
      id,
      customerNameAr,
      customerMoodEmoji: '💵',
      topic,
      targetItemId: itemId,
      targetQty: qty,
      tenderedCash: note,
      questionAr: `معايا ورقة بـ ${note} ج.م وهاخد ${qty} × ${itemDef.nameAr} — الباقي بتاعي كام يا كاشير؟`,
      answered: false,
    };
  }

  if (topic === 'discount_request') {
    const qty = 3;
    return {
      id,
      customerNameAr,
      customerMoodEmoji: '🙂',
      topic,
      targetItemId: itemId,
      targetQty: qty,
      questionAr: `إحنا زباين الحارة وناويين على ${qty} × ${itemDef.nameAr}، المعلم محمد سامح بخصم ولا الأسعار ثابتة؟`,
      answered: false,
    };
  }

  if (topic === 'ingredients') {
    return {
      id,
      customerNameAr,
      customerMoodEmoji: '🧐',
      topic,
      targetItemId: itemId,
      targetQty: 1,
      questionAr: `ممكن أعرف مكونات "${itemDef.nameAr}" وإيه المميز فيه وسعره كام عندكم؟`,
      answered: false,
    };
  }

  return {
    id,
    customerNameAr,
    customerMoodEmoji: '💬',
    topic: 'price_check',
    targetItemId: itemId,
    targetQty: 1,
    questionAr: `لو سمحت يا كاشير، ${itemDef.nameAr} بكام النهاردة في المنيو الرسمي؟`,
    answered: false,
  };
}

export function evaluateInquiryReply(params: {
  inquiry: CustomerInquiry;
  mode: InquiryReplyMode;
  recipePrices: Record<RecipeId, number>;
  extraPrices: Record<PosExtraItemId, number>;
  settings: CashierControllerSettings;
}): {
  ok: boolean;
  replyAr: string;
  reputationDelta: number;
  tipGain: number;
  suggestedDiscountPct: number;
  shouldLoadToCart: boolean;
  suggestedQty: number;
} {
  const { inquiry, mode, recipePrices, extraPrices, settings } = params;
  const def = FULL_MENU_CATALOG[inquiry.targetItemId];
  const unitPrice = getMenuItemPrice(inquiry.targetItemId, recipePrices, extraPrices);
  const rawTotal = unitPrice * inquiry.targetQty;
  const taxAdd = Math.round((rawTotal * settings.taxRatePct) / 100);
  const totalWithTax = rawTotal + taxAdd;

  if (mode === 'apply_discount') {
    if (!settings.allowCashierCustomDiscount || settings.maxDiscountPct <= 0) {
      return {
        ok: false,
        replyAr: `المعلم قافل الخصومات حالياً (الحد الأقصى ٠٪). اعتذر للزبون بأسلوب شيك وبلغه السعر الرسمي (${totalWithTax} ج.م).`,
        reputationDelta: 0,
        tipGain: 0,
        suggestedDiscountPct: 0,
        shouldLoadToCart: false,
        suggestedQty: inquiry.targetQty,
      };
    }
    const grantedPct = Math.min(settings.maxDiscountPct, 5);
    const discountedTotal = Math.max(
      1,
      totalWithTax - Math.round((rawTotal * grantedPct) / 100),
    );
    return {
      ok: true,
      replyAr: `تحت أمرك يا ${inquiry.customerNameAr}! بصلاحية المعلم محمد عملنالك خصم ${grantedPct}% وبقى الحساب ${discountedTotal} ج.م بدل ${totalWithTax} ج.م!`,
      reputationDelta: 2,
      tipGain: 4,
      suggestedDiscountPct: grantedPct,
      shouldLoadToCart: true,
      suggestedQty: inquiry.targetQty,
    };
  }

  if (mode === 'calculate_change') {
    const cash = inquiry.tenderedCash ?? (totalWithTax <= 50 ? 50 : 100);
    const change = Math.max(0, cash - totalWithTax);
    return {
      ok: true,
      replyAr: `الحساب الرسمي لـ ${inquiry.targetQty} × ${def.nameAr} هو ${totalWithTax} ج.م، ومن ${cash} ج.م يبقى الباقي بالظبط ${change} ج.م تفضل حضرتك!`,
      reputationDelta: 2,
      tipGain: 3,
      suggestedDiscountPct: 0,
      shouldLoadToCart: true,
      suggestedQty: inquiry.targetQty,
    };
  }

  if (mode === 'combo_suggest') {
    const teaPrice = getMenuItemPrice('tea_mint', recipePrices, extraPrices);
    const comboTotal = totalWithTax + teaPrice;
    return {
      ok: true,
      replyAr: `${def.nameAr} سعره ${unitPrice} ج.م (${def.ingredientsDescAr})، ولو تزود كوباية شاي بالنعناع بـ ${teaPrice} ج.م يبقى المجموع ${comboTotal} ج.م — تحب أنزله على الفاتورة؟`,
      reputationDelta: 2,
      tipGain: 3,
      suggestedDiscountPct: 0,
      shouldLoadToCart: true,
      suggestedQty: inquiry.targetQty,
    };
  }

  return {
    ok: true,
    replyAr: `أهلاً يا ${inquiry.customerNameAr}! سعر ${def.nameAr} في منيو المعلم النهاردة ${unitPrice} ج.م (${def.ingredientsDescAr})${
      inquiry.targetQty > 1 ? ` · إجمالي ${inquiry.targetQty} قطع = ${totalWithTax} ج.م` : ''
    }.`,
    reputationDelta: 1,
    tipGain: 2,
    suggestedDiscountPct: 0,
    shouldLoadToCart: true,
    suggestedQty: inquiry.targetQty,
  };
}
