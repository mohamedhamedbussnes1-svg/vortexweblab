import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceKitchenTicketStatus,
  awardVipPoints,
  calculatePosTotals,
  computeAccountingSummary,
  computeShiftSettlementPreview,
  computeVipTier,
  createDefaultCashierSettings,
  createInitialExtraPrices,
  createInitialVipMembers,
  createKitchenTicketFromReceipt,
  evaluateInquiryReply,
  FULL_MENU_ORDER,
  generateCustomerInquiry,
  generateQrMatrix,
  getMenuItemPrice,
  issuePosReceipt,
  SHOP_RENT_DAILY,
  UTILITIES_DAILY,
} from './cashier';
import { createInitialPrices } from './rules';

test('full Egyptian menu catalog defines 14 realistic items and reads El-Moalem overrides', () => {
  assert.equal(FULL_MENU_ORDER.length, 14);
  const recipePrices = createInitialPrices();
  const extraPrices = createInitialExtraPrices();

  assert.equal(getMenuItemPrice('ful_tahina', recipePrices, extraPrices), 15);
  assert.equal(getMenuItemPrice('tea_mint', recipePrices, extraPrices), 10);

  recipePrices.ful_tahina = 20;
  extraPrices.tea_mint = 12;
  assert.equal(getMenuItemPrice('ful_tahina', recipePrices, extraPrices), 20);
  assert.equal(getMenuItemPrice('tea_mint', recipePrices, extraPrices), 12);
});

test('POS calculation clamps discount to El-Moalem limit, applies tax, and computes exact cash change', () => {
  const recipePrices = createInitialPrices();
  const extraPrices = createInitialExtraPrices();
  const settings = {
    ...createDefaultCashierSettings(),
    maxDiscountPct: 10,
    taxRatePct: 10,
    allowCashierCustomDiscount: true,
    openingDrawerFloat: 200,
  };

  // 2x mixed_special (24 * 2 = 48) + 1x tea_mint (10) = 58
  // Requested discount 25% -> clamped by El-Moalem to 10% -> discount = 6 -> afterDiscount = 52
  // Tax 10% -> tax = 5 -> total = 57
  const calc = calculatePosTotals({
    items: [
      { itemId: 'mixed_special', qty: 2 },
      { itemId: 'tea_mint', qty: 1 },
    ],
    recipePrices,
    extraPrices,
    discountPct: 25,
    settings,
    paidAmount: 100,
    paymentMethod: 'cash',
  });

  assert.equal(calc.subtotal, 58);
  assert.equal(calc.appliedDiscountPct, 10);
  assert.equal(calc.discountAmount, 6);
  assert.equal(calc.taxAmount, 5);
  assert.equal(calc.total, 57);
  assert.equal(calc.changeAmount, 43);
  assert.equal(calc.isPaymentSufficient, true);

  const shortCalc = calculatePosTotals({
    items: [{ itemId: 'mixed_special', qty: 2 }],
    recipePrices,
    extraPrices,
    discountPct: 0,
    settings: { ...settings, taxRatePct: 0 },
    paidAmount: 40,
    paymentMethod: 'cash',
  });
  assert.equal(shortCalc.isPaymentSufficient, false);
  assert.equal(shortCalc.shortBy, 8);
});

test('receipt issuance and accounting summary aggregate cash drawer, instapay, tax, and top items', () => {
  const recipePrices = createInitialPrices();
  const extraPrices = createInitialExtraPrices();
  const settings = {
    ...createDefaultCashierSettings(),
    taxRatePct: 10,
    openingDrawerFloat: 200,
  };

  const calcCash = calculatePosTotals({
    items: [{ itemId: 'taameya_platter', qty: 1 }],
    recipePrices,
    extraPrices,
    discountPct: 0,
    settings,
    paidAmount: 50,
    paymentMethod: 'cash',
  });
  const r1 = issuePosReceipt({
    seq: 1,
    day: 1,
    clockStr: '09:15',
    cashierNameAr: 'علي',
    managerNameAr: 'محمد',
    customerNameAr: 'عم صابر',
    paymentMethod: 'cash',
    calc: calcCash,
    source: 'pos',
  });
  assert.equal(r1.receipt.invoiceNumber, 'INV-1-0001');
  assert.equal(r1.nextSeq, 2);

  const calcInsta = calculatePosTotals({
    items: [{ itemId: 'ful_sausage_plate', qty: 2 }],
    recipePrices,
    extraPrices,
    discountPct: 5,
    settings,
    paymentMethod: 'instapay',
  });
  const r2 = issuePosReceipt({
    seq: r1.nextSeq,
    day: 1,
    clockStr: '10:05',
    cashierNameAr: 'علي',
    managerNameAr: 'محمد',
    customerNameAr: 'الأستاذ كريم',
    paymentMethod: 'instapay',
    calc: calcInsta,
    source: 'pos',
  });

  const summary = computeAccountingSummary([r1.receipt, r2.receipt], settings);
  assert.equal(summary.invoiceCount, 2);
  assert.equal(summary.cashSalesTotal, r1.receipt.total);
  assert.equal(summary.instapaySalesTotal, r2.receipt.total);
  assert.equal(summary.expectedCashDrawer, 200 + r1.receipt.total);
  assert.ok(summary.totalTaxCollected > 0);
  assert.equal(summary.topSellingItems.length, 2);
});

test('customer inquiries calculate exact answers and respect El-Moalem discount lock', () => {
  const recipePrices = createInitialPrices();
  const extraPrices = createInitialExtraPrices();
  const inq = generateCustomerInquiry('inq-1', recipePrices, extraPrices, [], () => 0.25);
  assert.ok(inq.questionAr.length > 8);

  const lockedSettings = {
    ...createDefaultCashierSettings(),
    maxDiscountPct: 0,
    allowCashierCustomDiscount: false,
  };
  const blockedDiscount = evaluateInquiryReply({
    inquiry: inq,
    mode: 'apply_discount',
    recipePrices,
    extraPrices,
    settings: lockedSettings,
  });
  assert.equal(blockedDiscount.ok, false);

  const unlockedSettings = {
    ...createDefaultCashierSettings(),
    maxDiscountPct: 15,
    allowCashierCustomDiscount: true,
  };
  const officialReply = evaluateInquiryReply({
    inquiry: inq,
    mode: 'official_price',
    recipePrices,
    extraPrices,
    settings: unlockedSettings,
  });
  assert.equal(officialReply.ok, true);
  assert.ok(officialReply.reputationDelta >= 1);
  assert.equal(officialReply.shouldLoadToCart, true);

  const allowedDiscount = evaluateInquiryReply({
    inquiry: inq,
    mode: 'apply_discount',
    recipePrices,
    extraPrices,
    settings: unlockedSettings,
  });
  assert.equal(allowedDiscount.ok, true);
  assert.equal(allowedDiscount.suggestedDiscountPct, 5);
});

test('VIP loyalty applies tier discount, upgrades tier via points, and stamps deterministic delivery QR', () => {
  const recipePrices = createInitialPrices();
  const extraPrices = createInitialExtraPrices();
  const settings = createDefaultCashierSettings();
  let members = createInitialVipMembers();
  assert.equal(computeVipTier(95), 'bronze');
  assert.equal(computeVipTier(100), 'silver');
  assert.equal(computeVipTier(250), 'gold');

  // Gold VIP gets 15% off 100 EGP (10x tea_mint = 100 -> -15 = 85)
  const calc = calculatePosTotals({
    items: [{ itemId: 'tea_mint', qty: 10 }],
    recipePrices,
    extraPrices,
    discountPct: 0,
    vipDiscountPct: 15,
    settings,
    paidAmount: 100,
    paymentMethod: 'cash',
  });
  assert.equal(calc.vipDiscountAmount, 15);
  assert.equal(calc.total, 85);

  const issued = issuePosReceipt({
    seq: 7,
    day: 2,
    clockStr: '11:30',
    cashierNameAr: 'علي',
    managerNameAr: 'المعلم محمد',
    customerNameAr: 'الحاج حسين',
    paymentMethod: 'cash',
    calc,
    source: 'pos',
    vipMemberId: 'vip-1',
    vipTier: 'gold',
    isDelivery: true,
  });
  assert.equal(issued.receipt.isDelivery, true);
  assert.equal(issued.receipt.qrOrderCode, 'ELMOALEM|INV-2-0007|85|DLV');

  const qrA = generateQrMatrix(issued.receipt.qrOrderCode!, 11);
  const qrB = generateQrMatrix(issued.receipt.qrOrderCode!, 11);
  assert.deepEqual(qrA, qrB);
  assert.equal(qrA.length, 11);
  assert.equal(qrA[0][0], true);
  assert.equal(qrA[1][1], false);

  // Bronze member with 95 points upgrades to silver after +10 points
  members = members.map((m) => (m.id === 'vip-4' ? { ...m, points: 95 } : m));
  const updated = awardVipPoints(members, 'vip-4', 100);
  const upgraded = updated.find((m) => m.id === 'vip-4')!;
  assert.equal(upgraded.points, 105);
  assert.equal(upgraded.tier, 'silver');
});

test('approved refunds deduct from net cash drawer while pending refunds stay active until approved', () => {
  const recipePrices = createInitialPrices();
  const extraPrices = createInitialExtraPrices();
  const settings = createDefaultCashierSettings();

  const c1 = calculatePosTotals({
    items: [{ itemId: 'taameya_platter', qty: 1 }],
    recipePrices,
    extraPrices,
    discountPct: 0,
    settings,
  });
  const c2 = calculatePosTotals({
    items: [{ itemId: 'ful_sausage_plate', qty: 1 }],
    recipePrices,
    extraPrices,
    discountPct: 0,
    settings,
  });

  const r1 = issuePosReceipt({
    seq: 1,
    day: 1,
    clockStr: '09:00',
    cashierNameAr: 'علي',
    managerNameAr: 'المعلم محمد',
    customerNameAr: 'زبون ١',
    paymentMethod: 'cash',
    calc: c1,
    source: 'pos',
  }).receipt;
  const r2 = issuePosReceipt({
    seq: 2,
    day: 1,
    clockStr: '09:20',
    cashierNameAr: 'علي',
    managerNameAr: 'المعلم محمد',
    customerNameAr: 'زبون ٢',
    paymentMethod: 'cash',
    calc: c2,
    source: 'pos',
  }).receipt;

  r2.refundStatus = 'pending';
  const pendingSummary = computeAccountingSummary([r1, r2], settings);
  assert.equal(pendingSummary.invoiceCount, 2);
  assert.equal(pendingSummary.refundedCount, 0);
  assert.equal(pendingSummary.cashSalesTotal, r1.total + r2.total);

  r2.refundStatus = 'approved';
  const approvedSummary = computeAccountingSummary([r1, r2], settings);
  assert.equal(approvedSummary.invoiceCount, 1);
  assert.equal(approvedSummary.refundedCount, 1);
  assert.equal(approvedSummary.refundedTotal, r2.total);
  assert.equal(approvedSummary.cashSalesTotal, r1.total);
  assert.equal(approvedSummary.expectedCashDrawer, settings.openingDrawerFloat + r1.total);
});

test('KDS ticket advances strictly through queued -> cooking -> ready -> served', () => {
  const recipePrices = createInitialPrices();
  const extraPrices = createInitialExtraPrices();
  const settings = createDefaultCashierSettings();
  const calc = calculatePosTotals({
    items: [{ itemId: 'mixed_special', qty: 2 }],
    recipePrices,
    extraPrices,
    discountPct: 0,
    settings,
  });
  const receipt = issuePosReceipt({
    seq: 3,
    day: 1,
    clockStr: '12:00',
    cashierNameAr: 'علي',
    managerNameAr: 'المعلم محمد',
    customerNameAr: 'عم طارق',
    paymentMethod: 'cash',
    calc,
    source: 'pos',
    isDelivery: true,
  }).receipt;

  let ticket = createKitchenTicketFromReceipt(receipt);
  assert.equal(ticket.status, 'queued');
  assert.equal(ticket.isDelivery, true);

  // Cannot skip cooking -> served directly
  const skipped = advanceKitchenTicketStatus(ticket, 'served', 'علي', '12:02');
  assert.equal(skipped.status, 'queued');

  ticket = advanceKitchenTicketStatus(ticket, 'cooking', 'أحمد', '12:02');
  assert.equal(ticket.status, 'cooking');
  assert.equal(ticket.chefNameAr, 'أحمد');

  ticket = advanceKitchenTicketStatus(ticket, 'ready', 'أحمد', '12:05');
  assert.equal(ticket.status, 'ready');

  ticket = advanceKitchenTicketStatus(ticket, 'served', 'محمود', '12:09');
  assert.equal(ticket.status, 'served');
});

test('shift settlement computes daily expenses and splits positive net profit across the 4 partners summing to 100%', () => {
  const settings = createDefaultCashierSettings();
  const summary = {
    ...computeAccountingSummary([], settings),
    grossSalesTotal: 400,
    refundedTotal: 28,
  };
  const preview = computeShiftSettlementPreview({
    day: 1,
    summary,
    dailyStats: {
      day: 1,
      revenue: 400,
      expenses: 105,
      ordersServed: 10,
      ordersMissed: 0,
      deliveriesCompleted: 2,
      tipsEarned: 20,
      taxiTrips: 0,
      repairsDone: 0,
      sideJobIncome: 50,
      shopDividends: 50,
    },
  });

  // Net = 400 + (50 + 50) - (60 + 35 + 105) = 500 - 200 = 300
  assert.equal(preview.totalExpenses, SHOP_RENT_DAILY + UTILITIES_DAILY + 105);
  assert.equal(preview.netProfit, 300);
  assert.equal(preview.partnerShares.length, 4);
  const sumShares = preview.partnerShares.reduce((s, p) => s + p.amount, 0);
  assert.equal(sumShares, 300);
  assert.equal(preview.partnerShares[0].amount, 90); // 30% Mohamed
  assert.equal(preview.partnerShares[1].amount, 75); // 25% Ahmed
  assert.equal(preview.partnerShares[2].amount, 75); // 25% Ali
  assert.equal(preview.partnerShares[3].amount, 60); // 20% Mahmoud
});

