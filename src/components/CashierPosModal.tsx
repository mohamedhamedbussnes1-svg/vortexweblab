import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Bike,
  Calculator,
  CheckCircle2,
  CreditCard,
  Delete,
  Flame,
  Lock,
  MessageSquare,
  Minus,
  PieChart,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Unlock,
  UserPlus,
  Wallet,
  X,
} from 'lucide-react';
import {
  calculatePosTotals,
  FULL_MENU_CATALOG,
  FULL_MENU_ORDER,
  generateQrMatrix,
  getMenuItemPrice,
  isRecipeMenuId,
  MENU_CATEGORY_LABELS_AR,
  VIP_TIER_CONFIG,
} from '../game/cashier';
import {
  CashierControllerSettings,
  FullMenuItemId,
  HudSnapshot,
  InquiryReplyMode,
  KitchenTicketStatus,
  PosExtraItemId,
  PosMenuCategory,
  PosReceipt,
  RecipeId,
  ShiftSettlementRecord,
  VipMember,
} from '../game/types';

export type CashierModalTab = 'pos' | 'kds' | 'inquiries' | 'accounting' | 'master';

interface CashierPosModalProps {
  hud: HudSnapshot;
  initialTab?: CashierModalTab;
  onClose: () => void;
  onCheckoutPos: (params: {
    items: Array<{ itemId: FullMenuItemId; qty: number }>;
    discountPct: number;
    paidAmount: number;
    paymentMethod: 'cash' | 'instapay';
    customerNameAr: string;
    tipAmount?: number;
    vipMemberId?: string;
    isDelivery?: boolean;
  }) => PosReceipt | null;
  onRegisterVip: (nameAr: string, phone: string) => VipMember | null;
  onAdvanceKitchenTicket: (ticketId: string, nextStatus: KitchenTicketStatus) => void;
  onRequestRefund: (receiptId: string, reasonAr: string) => void;
  onResolveRefund: (receiptId: string, approve: boolean) => void;
  onSettleShift: () => ShiftSettlementRecord | null;
  onAnswerInquiry: (
    inquiryId: string,
    mode: InquiryReplyMode,
  ) => {
    ok: boolean;
    replyAr: string;
    suggestedDiscountPct: number;
    shouldLoadToCart: boolean;
    suggestedQty: number;
  } | null;
  onSpawnInquiry: () => void;
  onSetRecipePrice: (id: RecipeId, price: number) => void;
  onSetExtraPrice: (id: PosExtraItemId, price: number) => void;
  onUpdateCashierSettings: (partial: Partial<CashierControllerSettings>) => void;
}

const EGYPTIAN_NOTES = [10, 20, 50, 100, 200] as const;
const REFUND_REASONS = [
  'تعديل أو إلغاء من الزبون',
  'خطأ في الحساب على الكاشير',
  'تأخير في التحضير',
] as const;

export const CashierPosModal: React.FC<CashierPosModalProps> = ({
  hud,
  initialTab,
  onClose,
  onCheckoutPos,
  onRegisterVip,
  onAdvanceKitchenTicket,
  onRequestRefund,
  onResolveRefund,
  onSettleShift,
  onAnswerInquiry,
  onSpawnInquiry,
  onSetRecipePrice,
  onSetExtraPrice,
  onUpdateCashierSettings,
}) => {
  const [tab, setTab] = useState<CashierModalTab>(initialTab ?? 'pos');
  const [category, setCategory] = useState<'all' | PosMenuCategory>('all');
  const [cart, setCart] = useState<Partial<Record<FullMenuItemId, number>>>({});
  const [customerNameAr, setCustomerNameAr] = useState('زبون المحل');
  const [selectedVipId, setSelectedVipId] = useState<string>('');
  const [showVipForm, setShowVipForm] = useState(false);
  const [newVipName, setNewVipName] = useState('');
  const [newVipPhone, setNewVipPhone] = useState('');
  const [isDelivery, setIsDelivery] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'instapay'>('cash');
  const [discountPct, setDiscountPct] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [paidInputStr, setPaidInputStr] = useState('');
  const [refundReasonAr, setRefundReasonAr] = useState<string>(REFUND_REASONS[0]);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(
    hud.cashierReceipts[0]?.id ?? null,
  );

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  const openInquiriesCount = hud.customerInquiries.filter((q) => !q.answered).length;
  const activeKitchenCount = hud.kitchenTickets.filter((t) => t.status !== 'served').length;
  const pendingRefundReceipts = hud.cashierReceipts.filter(
    (r) => r.refundStatus === 'pending',
  );
  const selectedVipMember = useMemo(
    () => hud.vipMembers.find((v) => v.id === selectedVipId) ?? null,
    [hud.vipMembers, selectedVipId],
  );
  const vipDiscountPct = selectedVipMember
    ? VIP_TIER_CONFIG[selectedVipMember.tier].discountPct
    : 0;

  const cartItems = useMemo(
    () =>
      (Object.entries(cart) as Array<[FullMenuItemId, number]>)
        .filter(([, qty]) => typeof qty === 'number' && qty > 0)
        .map(([itemId, qty]) => ({ itemId, qty })),
    [cart],
  );

  const parsedPaidAmount = useMemo(() => {
    const cleaned = Number(paidInputStr);
    if (!paidInputStr || !Number.isFinite(cleaned)) return 0;
    return Math.max(0, Math.round(cleaned));
  }, [paidInputStr]);

  const calc = useMemo(
    () =>
      calculatePosTotals({
        items: cartItems,
        recipePrices: hud.prices,
        extraPrices: hud.extraPrices,
        discountPct,
        vipDiscountPct,
        settings: hud.cashierSettings,
        tipAmount,
        paidAmount: paymentMethod === 'instapay' ? undefined : parsedPaidAmount,
        paymentMethod,
      }),
    [
      cartItems,
      hud.prices,
      hud.extraPrices,
      discountPct,
      vipDiscountPct,
      hud.cashierSettings,
      tipAmount,
      parsedPaidAmount,
      paymentMethod,
    ],
  );

  const filteredMenuIds = useMemo(
    () =>
      FULL_MENU_ORDER.filter((id) =>
        category === 'all' ? true : FULL_MENU_CATALOG[id].category === category,
      ),
    [category],
  );

  const activeReceipt = useMemo(
    () =>
      hud.cashierReceipts.find((r) => r.id === selectedReceiptId) ??
      hud.cashierReceipts[0] ??
      null,
    [hud.cashierReceipts, selectedReceiptId],
  );

  const addToCart = (itemId: FullMenuItemId, qtyDelta = 1) => {
    setCart((prev) => {
      const nextQty = Math.max(0, Math.min(50, (prev[itemId] ?? 0) + qtyDelta));
      const next = { ...prev };
      if (nextQty === 0) {
        delete next[itemId];
      } else {
        next[itemId] = nextQty;
      }
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
    setDiscountPct(0);
    setTipAmount(0);
    setPaidInputStr('');
    setCustomerNameAr('زبون المحل');
    setSelectedVipId('');
    setIsDelivery(false);
  };

  const loadWaitingOrderToPos = (orderIndex: number) => {
    const ord = hud.orders[orderIndex];
    if (!ord) return;
    setCart((prev) => ({
      ...prev,
      [ord.recipeId]: (prev[ord.recipeId] ?? 0) + ord.quantity,
    }));
    setCustomerNameAr(ord.customerName);
    if (ord.isDelivery) setIsDelivery(true);
  };

  const handleKeypadPress = (key: string) => {
    if (key === 'C') {
      setPaidInputStr('');
      return;
    }
    if (key === 'BKSP') {
      setPaidInputStr((prev) => prev.slice(0, -1));
      return;
    }
    setPaidInputStr((prev) => {
      const next = prev === '0' ? key : `${prev}${key}`;
      return next.length <= 5 ? next : prev;
    });
  };

  const handleAddBanknote = (note: number) => {
    setPaymentMethod('cash');
    setPaidInputStr((prev) => {
      const cur = Number(prev) || 0;
      return String(cur + note);
    });
  };

  const handleCreateVip = () => {
    const created = onRegisterVip(newVipName, newVipPhone);
    if (created) {
      setSelectedVipId(created.id);
      setCustomerNameAr(created.nameAr);
      setNewVipName('');
      setNewVipPhone('');
      setShowVipForm(false);
    }
  };

  const handleCompleteCheckout = () => {
    const receipt = onCheckoutPos({
      items: cartItems,
      discountPct,
      paidAmount: paymentMethod === 'instapay' ? calc.total : parsedPaidAmount,
      paymentMethod,
      customerNameAr: selectedVipMember ? selectedVipMember.nameAr : customerNameAr,
      tipAmount,
      vipMemberId: selectedVipMember?.id,
      isDelivery,
    });
    if (receipt) {
      setSelectedReceiptId(receipt.id);
      clearCart();
      setTab('accounting');
    }
  };

  const discountOptions = [0, 5, 10, 15, 20].filter(
    (pct) =>
      pct === 0 ||
      (hud.cashierSettings.allowCashierCustomDiscount &&
        pct <= hud.cashierSettings.maxDiscountPct),
  );

  return (
    <div
      data-testid="cashier-pos-modal"
      className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4"
      style={{ backgroundColor: 'rgba(10, 8, 6, 0.86)' }}
    >
      <div
        className="w-full max-w-6xl max-h-[94vh] flex flex-col rounded-2xl border border-emerald-500/35 text-stone-100 shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#14110f' }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-stone-800 bg-[#1a1512]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-sm sm:text-xl font-bold text-amber-300 truncate">
                  نظام الكاشير والمحاسبة — مطعم المعلم
                </h2>
                {hud.cashierSettings.cashierRegisterLocked && (
                  <span
                    data-testid="cashier-locked-badge"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/90 border border-rose-500/50 text-rose-300 text-[11px] font-bold"
                  >
                    <Lock className="w-3 h-3" />
                    الدرج مقفول بأمر المعلم
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5 truncate">
                الخزينة:{' '}
                <span className="font-mono-num text-emerald-400 font-bold">
                  {Math.round(hud.money)} ج.م
                </span>
                {' · '}
                الدرج:{' '}
                <span className="font-mono-num text-amber-300 font-bold">
                  {hud.cashierSummary.expectedCashDrawer} ج.م
                </span>
                <span className="hidden sm:inline">
                  {' · '}
                  فواتير اليوم:{' '}
                  <span className="font-mono-num text-stone-200 font-bold">
                    {hud.cashierSummary.invoiceCount}
                  </span>
                  {' · '}
                  المشرف: <span className="text-amber-200 font-bold">المعلم محمد</span>
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="cashier-close-btn"
            onClick={onClose}
            aria-label="إغلاق شاشة الكاشير"
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border-b border-stone-800 bg-[#191410] overflow-x-auto shrink-0">
          <button
            type="button"
            data-testid="cashier-tab-pos"
            onClick={() => setTab('pos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer ${
              tab === 'pos'
                ? 'bg-emerald-500 text-stone-950'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>الكاشير والمنيو (١٤)</span>
          </button>

          <button
            type="button"
            data-testid="cashier-tab-kds"
            onClick={() => setTab('kds')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer ${
              tab === 'kds'
                ? 'bg-orange-500 text-stone-950'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>شاشة المطبخ (KDS)</span>
            {activeKitchenCount > 0 && (
              <span
                className={`font-mono-num px-1.5 py-0.5 rounded-md text-[11px] font-black ${
                  tab === 'kds'
                    ? 'bg-stone-950 text-orange-300'
                    : 'bg-orange-600 text-white'
                }`}
              >
                {activeKitchenCount}
              </span>
            )}
          </button>

          <button
            type="button"
            data-testid="cashier-tab-inquiries"
            onClick={() => setTab('inquiries')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer ${
              tab === 'inquiries'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>استفسارات الزبائن</span>
            {openInquiriesCount > 0 && (
              <span
                className={`font-mono-num px-1.5 py-0.5 rounded-md text-[11px] font-black ${
                  tab === 'inquiries'
                    ? 'bg-stone-950 text-amber-300'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {openInquiriesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            data-testid="cashier-tab-accounting"
            onClick={() => setTab('accounting')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer ${
              tab === 'accounting'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>الفواتير والمحاسبة ({hud.cashierReceipts.length})</span>
          </button>

          <button
            type="button"
            data-testid="cashier-tab-master"
            onClick={() => setTab('master')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer ${
              tab === 'master'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>تحكم المعلم</span>
            {pendingRefundReceipts.length > 0 && (
              <span className="font-mono-num px-1.5 py-0.5 rounded-md text-[11px] font-black bg-rose-600 text-white">
                {pendingRefundReceipts.length}
              </span>
            )}
            {!hud.canControlPricesAndSettings && <Lock className="w-3.5 h-3.5 text-rose-400" />}
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {/* TAB 1: POS REGISTER + DIGITAL SCREEN + FULL MENU */}
          {tab === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Right / Menu Catalog (7 cols) */}
              <div className="lg:col-span-7 space-y-3 lg:max-h-[72vh] lg:overflow-y-auto lg:pl-1">
                {/* Category Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {(Object.keys(MENU_CATEGORY_LABELS_AR) as Array<'all' | PosMenuCategory>).map(
                    (catKey) => (
                      <button
                        key={catKey}
                        type="button"
                        data-testid={`pos-cat-${catKey}`}
                        onClick={() => setCategory(catKey)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          category === catKey
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                        }`}
                      >
                        {MENU_CATEGORY_LABELS_AR[catKey]}
                      </button>
                    ),
                  )}
                </div>

                {/* Quick Load Waiting Customer Orders */}
                {hud.orders.length > 0 && (
                  <div className="p-2.5 rounded-xl border border-amber-500/30 bg-[#201912]">
                    <div className="text-[11px] font-bold text-amber-300 mb-1.5">
                      طلبات الزبائن المنتظرين — اضغط لتحميل الطلب على شاشة الكاشير:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {hud.orders.map((ord, idx) => (
                        <button
                          key={ord.id}
                          type="button"
                          onClick={() => loadWaitingOrderToPos(idx)}
                          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 border border-stone-700 text-xs font-bold text-stone-200 cursor-pointer"
                        >
                          + {ord.customerName} ({ord.quantity}× {FULL_MENU_CATALOG[ord.recipeId]?.nameAr})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Menu Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredMenuIds.map((itemId) => {
                    const def = FULL_MENU_CATALOG[itemId];
                    const price = getMenuItemPrice(itemId, hud.prices, hud.extraPrices);
                    const qtyInCart = cart[itemId] ?? 0;
                    return (
                      <div
                        key={itemId}
                        data-testid={`pos-menu-item-${itemId}`}
                        className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
                          qtyInCart > 0
                            ? 'border-emerald-500/60 bg-[#17241e]'
                            : 'border-stone-800 bg-[#1e1814]'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-xs sm:text-sm font-extrabold text-stone-100 leading-snug">
                              {def.nameAr}
                            </div>
                            <span className="font-mono-num text-sm font-black text-emerald-400 shrink-0">
                              {price} ج.م
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                            {def.ingredientsDescAr}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/80">
                          <span className="text-[10px] text-stone-400 truncate">
                            {def.prepNoteAr}
                          </span>
                          {qtyInCart === 0 ? (
                            <button
                              type="button"
                              data-testid={`pos-add-${itemId}`}
                              onClick={() => addToCart(itemId, 1)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold shrink-0 cursor-pointer"
                            >
                              + إضافة
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => addToCart(itemId, -1)}
                                className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 flex items-center justify-center cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-mono-num text-xs font-black text-emerald-300 w-5 text-center">
                                {qtyInCart}
                              </span>
                              <button
                                type="button"
                                onClick={() => addToCart(itemId, 1)}
                                className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 flex items-center justify-center cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Left / Dual Digital Display + Keypad + Cart Checkout (5 cols) */}
              <div className="lg:col-span-5 lg:sticky lg:top-0 lg:self-start space-y-2.5">
                {/* Dual Digital POS LED Screen (Cashier + Customer Facing) */}
                <div
                  data-testid="pos-digital-screen"
                  className="p-3 rounded-2xl border-2 border-emerald-500/45 shadow-inner space-y-2"
                  style={{ backgroundColor: '#071a13' }}
                >
                  <div className="flex items-center justify-between text-[11px] text-emerald-300/90 border-b border-emerald-500/25 pb-2">
                    <span className="font-bold">شاشة عرض الكاشير والزبون الرقمية</span>
                    <span className="font-mono-num">
                      الخصم المسموح: {hud.cashierSettings.allowCashierCustomDiscount ? `${hud.cashierSettings.maxDiscountPct}%` : 'مغلق'} · الضريبة: {hud.cashierSettings.taxRatePct}%
                    </span>
                  </div>

                  {/* Customer-facing big 2-column LED */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/25">
                      <div className="text-[11px] text-emerald-300/80">الإجمالي المطلوب</div>
                      <div
                        data-testid="pos-display-total"
                        className="font-mono-num text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5"
                      >
                        {calc.total} <span className="text-xs font-bold">ج.م</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/25">
                      <div className="text-[11px] text-amber-300/80">
                        {calc.isPaymentSufficient || calc.total === 0
                          ? 'الباقي للزبون'
                          : 'المبلغ المتبقي'}
                      </div>
                      <div
                        data-testid="pos-display-change"
                        className={`font-mono-num text-2xl sm:text-3xl font-black mt-0.5 ${
                          calc.shortBy > 0 && paymentMethod === 'cash'
                            ? 'text-rose-400'
                            : 'text-amber-300'
                        }`}
                      >
                        {calc.shortBy > 0 && paymentMethod === 'cash'
                          ? `-${calc.shortBy}`
                          : calc.changeAmount}{' '}
                        <span className="text-xs font-bold">ج.م</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Digital Strip */}
                  <div className="grid grid-cols-4 gap-1.5 text-[11px] text-center pt-1">
                    <div className="p-1.5 rounded-lg bg-black/30">
                      <div className="text-stone-400">الفرعي</div>
                      <div className="font-mono-num font-bold text-stone-100">{calc.subtotal}ج</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/30">
                      <div className="text-stone-400">
                        {calc.vipDiscountAmount > 0 ? 'خصم + VIP' : 'خصم'}
                      </div>
                      <div className="font-mono-num font-bold text-rose-300">
                        -{calc.discountAmount + calc.vipDiscountAmount}ج
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/30">
                      <div className="text-stone-400">ضريبة</div>
                      <div className="font-mono-num font-bold text-amber-200">+{calc.taxAmount}ج</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/30">
                      <div className="text-stone-400">المدفوع</div>
                      <div
                        data-testid="pos-display-paid"
                        className="font-mono-num font-bold text-emerald-300"
                      >
                        {paymentMethod === 'instapay' ? calc.total : parsedPaidAmount}ج
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Order Lines */}
                <div className="p-3 rounded-xl border border-stone-800 bg-[#1c1612] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-300">
                      أصناف الفاتورة ({calc.lines.length})
                    </span>
                    {calc.lines.length > 0 && (
                      <button
                        type="button"
                        onClick={clearCart}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                      >
                        مسح السلة
                      </button>
                    )}
                  </div>

                  {calc.lines.length === 0 ? (
                    <div className="py-4 text-center text-xs text-stone-400 border border-dashed border-stone-700 rounded-xl">
                      اختر أصناف من المنيو الكامل لبدء الحساب وإصدار الفاتورة
                    </div>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-0.5">
                      {calc.lines.map((line) => (
                        <div
                          key={line.itemId}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-stone-900/90 border border-stone-800 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-stone-100 truncate">{line.nameAr}</div>
                            <div className="font-mono-num text-[11px] text-stone-400">
                              {line.qty} × {line.unitPrice} ج.م
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono-num font-extrabold text-emerald-400">
                              {line.lineTotal} ج.م
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(line.itemId, -1)}
                              className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* VIP Loyalty Card & Delivery Toggle */}
                  <div className="space-y-1.5 pt-1 border-t border-stone-800">
                    <div className="flex items-center gap-1.5">
                      <select
                        data-testid="pos-vip-select"
                        value={selectedVipId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedVipId(id);
                          const m = hud.vipMembers.find((v) => v.id === id);
                          if (m) setCustomerNameAr(m.nameAr);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-stone-900 border border-amber-500/40 text-xs text-amber-200 focus:outline-none"
                      >
                        <option value="">بطاقة الولاء VIP (زبون عادي — بدون خصم VIP)</option>
                        {hud.vipMembers.map((v) => (
                          <option key={v.id} value={v.id}>
                            ⭐ {v.nameAr} — {VIP_TIER_CONFIG[v.tier].labelAr} (خصم{' '}
                            {VIP_TIER_CONFIG[v.tier].discountPct}% · {v.points} نقطة)
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        data-testid="pos-vip-add-toggle"
                        onClick={() => setShowVipForm((s) => !s)}
                        title="تسجيل عميل VIP جديد"
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>VIP+</span>
                      </button>
                    </div>

                    {showVipForm && (
                      <div className="p-2 rounded-lg bg-stone-900 border border-amber-500/40 flex flex-wrap items-center gap-1.5">
                        <input
                          type="text"
                          data-testid="pos-vip-new-name"
                          value={newVipName}
                          onChange={(e) => setNewVipName(e.target.value)}
                          placeholder="اسم الزبون الدائم"
                          className="flex-1 min-w-[110px] px-2.5 py-1 rounded bg-stone-950 border border-stone-700 text-xs text-stone-100"
                        />
                        <input
                          type="text"
                          data-testid="pos-vip-new-phone"
                          value={newVipPhone}
                          onChange={(e) => setNewVipPhone(e.target.value)}
                          placeholder="رقم الموبايل"
                          className="w-28 px-2.5 py-1 rounded bg-stone-950 border border-stone-700 text-xs text-stone-100 font-mono-num"
                        />
                        <button
                          type="button"
                          data-testid="pos-vip-save-btn"
                          onClick={handleCreateVip}
                          className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold cursor-pointer"
                        >
                          حفظ
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        data-testid="pos-delivery-toggle"
                        onClick={() => setIsDelivery((d) => !d)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                          isDelivery
                            ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                            : 'bg-stone-900 border-stone-700 text-stone-300'
                        }`}
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>
                          {isDelivery ? 'أوردر دليفري + كود QR ✓' : 'طلب صالة / تيك أواي (+QR)'}
                        </span>
                      </button>
                      {selectedVipMember && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 text-[11px] font-bold shrink-0">
                          <Award className="w-3 h-3" />
                          <span>خصم {vipDiscountPct}%</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Name & Payment Method */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      value={customerNameAr}
                      onChange={(e) => setCustomerNameAr(e.target.value)}
                      placeholder="اسم الزبون"
                      className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          paymentMethod === 'cash'
                            ? 'bg-emerald-500 text-stone-950'
                            : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>كاش</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('instapay')}
                        className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          paymentMethod === 'instapay'
                            ? 'bg-sky-500 text-stone-950'
                            : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>إنستا باي</span>
                      </button>
                    </div>
                  </div>

                  {/* Discount & Tip Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="text-stone-400">خصم:</span>
                      {discountOptions.map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDiscountPct(pct)}
                          className={`font-mono-num px-2 py-1 rounded-md font-bold cursor-pointer ${
                            discountPct === pct
                              ? 'bg-amber-500 text-stone-950'
                              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-stone-400">بقشيش:</span>
                      {[0, 5, 10].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTipAmount(t)}
                          className={`font-mono-num px-2 py-1 rounded-md font-bold cursor-pointer ${
                            tipAmount === t
                              ? 'bg-emerald-500 text-stone-950'
                              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          +{t}ج
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Banknote Quick Buttons & Numeric Keypad */}
                  {paymentMethod === 'cash' && (
                    <div className="space-y-2 pt-1 border-t border-stone-800">
                      <div className="flex flex-wrap gap-1.5">
                        {EGYPTIAN_NOTES.map((note) => (
                          <button
                            key={note}
                            type="button"
                            data-testid={`pos-note-${note}`}
                            onClick={() => handleAddBanknote(note)}
                            className="font-mono-num flex-1 min-w-[52px] py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold cursor-pointer"
                          >
                            +{note}ج
                          </button>
                        ))}
                        <button
                          type="button"
                          data-testid="pos-exact-btn"
                          onClick={() => setPaidInputStr(String(calc.total))}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-bold cursor-pointer"
                        >
                          بالظبط
                        </button>
                      </div>

                      <div
                        data-testid="pos-keypad"
                        dir="ltr"
                        className="grid grid-cols-3 gap-1.5"
                      >
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'BKSP'].map(
                          (key) => (
                            <button
                              key={key}
                              type="button"
                              data-testid={`pos-key-${key}`}
                              onClick={() => handleKeypadPress(key)}
                              className={`font-mono-num py-2 rounded-lg text-sm font-black flex items-center justify-center cursor-pointer ${
                                key === 'C'
                                  ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40'
                                  : key === 'BKSP'
                                    ? 'bg-stone-800 hover:bg-stone-700 text-amber-300'
                                    : 'bg-stone-800 hover:bg-stone-700 text-stone-100'
                              }`}
                            >
                              {key === 'BKSP' ? <Delete className="w-4 h-4" /> : key}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Checkout CTA */}
                  <button
                    type="button"
                    data-testid="pos-checkout-btn"
                    disabled={
                      !hud.canOperateCashier ||
                      hud.cashierSettings.cashierRegisterLocked ||
                      calc.lines.length === 0 ||
                      !calc.isPaymentSufficient
                    }
                    onClick={handleCompleteCheckout}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-700 disabled:text-stone-400 text-stone-950 text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>
                      {hud.cashierSettings.cashierRegisterLocked
                        ? 'الدرج مقفول بأمر المعلم'
                        : !hud.canOperateCashier
                          ? 'مخصص للكاشير علي في الأونلاين'
                          : 'إصدار فاتورة وتحصيل الحساب'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1B: LIVE KITCHEN DISPLAY SYSTEM (KDS) */}
          {tab === 'kds' && (
            <div data-testid="kds-board" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-orange-500/35 bg-[#201610]">
                <div>
                  <h3 className="text-sm font-extrabold text-orange-300 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>شاشة المطبخ الحية (KDS) — الشيف أحمد وطاقم التحضير</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    كل فاتورة تصدر من شاشة الكاشير تصل فوراً هنا للشيف أحمد ليبدأ القلي والتحضير ويسلمها جاهزة للباص أو الدليفري.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono-num">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-amber-300 font-bold">
                    انتظار: {hud.kitchenTickets.filter((t) => t.status === 'queued').length}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-orange-500/40 text-orange-300 font-bold">
                    على النار: {hud.kitchenTickets.filter((t) => t.status === 'cooking').length}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-emerald-500/40 text-emerald-300 font-bold">
                    جاهز: {hud.kitchenTickets.filter((t) => t.status === 'ready').length}
                  </span>
                </div>
              </div>

              {hud.kitchenTickets.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-stone-700 text-xs text-stone-400">
                  لا توجد تذاكر مطبخ حالياً — أصدر فاتورة من شاشة الكاشير لتظهر هنا فوراً أمام الشيف أحمد!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {hud.kitchenTickets.map((ticket) => {
                    const statusStyle =
                      ticket.status === 'queued'
                        ? 'border-amber-500/45 bg-[#1e1711]'
                        : ticket.status === 'cooking'
                          ? 'border-orange-500/60 bg-[#25170e]'
                          : ticket.status === 'ready'
                            ? 'border-emerald-500/60 bg-[#12221a]'
                            : 'border-stone-800 bg-[#171412] opacity-75';
                    const statusLabelAr =
                      ticket.status === 'queued'
                        ? 'في الطابور'
                        : ticket.status === 'cooking'
                          ? 'جاري القلي والتحضير'
                          : ticket.status === 'ready'
                            ? 'جاهز على الباص'
                            : 'تم التسليم';

                    return (
                      <div
                        key={ticket.id}
                        data-testid={`kds-ticket-${ticket.invoiceNumber}`}
                        className={`p-3.5 rounded-xl border space-y-2.5 flex flex-col justify-between ${statusStyle}`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono-num text-xs font-black text-amber-300">
                              {ticket.invoiceNumber}
                            </span>
                            <span className="text-[11px] font-bold text-stone-300">
                              {statusLabelAr} · <span className="font-mono-num">{ticket.createdClock}</span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-extrabold text-stone-100">
                              {ticket.customerNameAr}
                            </span>
                            {ticket.isDelivery && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/50 text-sky-200 text-[10px] font-bold">
                                <Bike className="w-3 h-3" />
                                <span>دليفري</span>
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 pt-1 border-t border-stone-800/80">
                            {ticket.items.map((it, idx) => (
                              <div
                                key={`${ticket.id}-${it.itemId}-${idx}`}
                                className="flex items-center justify-between text-xs text-stone-200"
                              >
                                <span className="truncate">{it.nameAr}</span>
                                <span className="font-mono-num font-black text-amber-300 shrink-0">
                                  ×{it.qty}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-800/80">
                          {ticket.status === 'queued' && (
                            <button
                              type="button"
                              data-testid={`kds-btn-cook-${ticket.invoiceNumber}`}
                              disabled={!hud.canControlKitchen}
                              onClick={() => onAdvanceKitchenTicket(ticket.id, 'cooking')}
                              className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:bg-stone-700 disabled:text-stone-400 text-stone-950 text-xs font-black cursor-pointer"
                            >
                              {hud.canControlKitchen
                                ? 'بدء التحضير على النار 🔥'
                                : 'مخصص للشيف أحمد'}
                            </button>
                          )}
                          {ticket.status === 'cooking' && (
                            <button
                              type="button"
                              data-testid={`kds-btn-ready-${ticket.invoiceNumber}`}
                              disabled={!hud.canControlKitchen}
                              onClick={() => onAdvanceKitchenTicket(ticket.id, 'ready')}
                              className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-700 disabled:text-stone-400 text-stone-950 text-xs font-black cursor-pointer"
                            >
                              {hud.canControlKitchen
                                ? 'جاهز للتسليم على الباص ✅'
                                : 'مخصص للشيف أحمد'}
                            </button>
                          )}
                          {ticket.status === 'ready' && (
                            <button
                              type="button"
                              data-testid={`kds-btn-serve-${ticket.invoiceNumber}`}
                              onClick={() => onAdvanceKitchenTicket(ticket.id, 'served')}
                              className="w-full py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black cursor-pointer"
                            >
                              تم التسليم للزبون 🛵
                            </button>
                          )}
                          {ticket.status === 'served' && (
                            <div className="text-center text-[11px] font-bold text-emerald-400 py-1">
                              مكتمل ومسلّم {ticket.updatedClock ? `(${ticket.updatedClock})` : ''} ✓
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {tab === 'inquiries' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-[#1e1712]">
                <div>
                  <h3 className="text-sm font-extrabold text-amber-300">
                    مكتب استفسارات الزبائن والرد الفوري
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    الزبائن يسألون عن الأسعار الحقيقية والمكونات وحساب الباقي — رد بدقة لرفع السمعة وكسب البقشيش!
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="inquiry-spawn-btn"
                  onClick={onSpawnInquiry}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>استفسار زبون جديد</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hud.customerInquiries.map((inq) => {
                  const def = FULL_MENU_CATALOG[inq.targetItemId];
                  const unitPrice = getMenuItemPrice(
                    inq.targetItemId,
                    hud.prices,
                    hud.extraPrices,
                  );
                  const expectedTotal =
                    unitPrice *
                    inq.targetQty *
                    (1 + hud.cashierSettings.taxRatePct / 100);
                  const roundedTotal = Math.round(expectedTotal);

                  return (
                    <div
                      key={inq.id}
                      data-testid={`inquiry-card-${inq.id}`}
                      className={`p-4 rounded-xl border space-y-3 ${
                        inq.answered
                          ? 'border-emerald-500/40 bg-[#16201a]'
                          : 'border-amber-500/35 bg-[#1e1813]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{inq.customerMoodEmoji}</span>
                          <div>
                            <div className="text-sm font-extrabold text-amber-200">
                              {inq.customerNameAr}
                            </div>
                            <div className="text-[11px] text-stone-400">
                              يسأل عن: {inq.targetQty} × {def.nameAr}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[11px] font-bold ${
                            inq.answered ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {inq.answered ? 'تم الرد ✓' : 'ينتظر الرد'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-black/30 border border-stone-800 text-xs sm:text-sm text-stone-100 leading-relaxed">
                        "{inq.questionAr}"
                      </div>

                      {/* Real live menu guide for the cashier */}
                      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#091c15] border border-emerald-500/30 text-[11px]">
                        <span className="text-emerald-300 font-bold">
                          دليل شاشة الكاشير: سعر القطعة{' '}
                          <span className="font-mono-num text-white">{unitPrice} ج.م</span>
                        </span>
                        <span className="font-mono-num text-amber-300 font-bold">
                          الإجمالي الحالي: {roundedTotal} ج.م
                        </span>
                      </div>

                      {inq.answered && inq.replySummaryAr ? (
                        <div className="space-y-2">
                          <div
                            data-testid={`inquiry-reply-${inq.id}`}
                            className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/35 text-xs text-emerald-200 leading-relaxed"
                          >
                            {inq.replySummaryAr}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              addToCart(inq.targetItemId, inq.targetQty);
                              setCustomerNameAr(inq.customerNameAr);
                              setTab('pos');
                            }}
                            className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold cursor-pointer"
                          >
                            تحويل الطلب إلى شاشة الكاشير لإصدار الفاتورة
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            data-testid={`inquiry-btn-official-${inq.id}`}
                            onClick={() => onAnswerInquiry(inq.id, 'official_price')}
                            className="px-2.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-extrabold cursor-pointer"
                          >
                            الرد بالسعر الرسمي
                          </button>
                          <button
                            type="button"
                            data-testid={`inquiry-btn-change-${inq.id}`}
                            onClick={() => onAnswerInquiry(inq.id, 'calculate_change')}
                            className="px-2.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-stone-950 text-xs font-extrabold cursor-pointer"
                          >
                            توضيح الباقي بدقة
                          </button>
                          <button
                            type="button"
                            data-testid={`inquiry-btn-combo-${inq.id}`}
                            onClick={() => onAnswerInquiry(inq.id, 'combo_suggest')}
                            className="px-2.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold cursor-pointer"
                          >
                            اقتراح كومبو الشاي
                          </button>
                          <button
                            type="button"
                            data-testid={`inquiry-btn-discount-${inq.id}`}
                            onClick={() => {
                              const res = onAnswerInquiry(inq.id, 'apply_discount');
                              if (res?.ok) {
                                setDiscountPct(res.suggestedDiscountPct);
                              }
                            }}
                            className="px-2.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-amber-500/40 text-amber-200 text-xs font-bold cursor-pointer"
                          >
                            خصم المعلم ({hud.cashierSettings.allowCashierCustomDiscount ? `${Math.min(5, hud.cashierSettings.maxDiscountPct)}%` : 'مقفل'})
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: REAL-PRICE RECEIPTS & ACCOUNTING Z-REPORT */}
          {tab === 'accounting' && (
            <div className="space-y-4">
              {/* Z-Report Accounting Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-emerald-500/35 bg-[#112119]">
                  <div className="text-[11px] text-emerald-300">الدرج الفعلي المتوقع</div>
                  <div
                    data-testid="acc-expected-drawer"
                    className="font-mono-num text-xl font-black text-white mt-0.5"
                  >
                    {hud.cashierSummary.expectedCashDrawer} ج.م
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono-num mt-0.5">
                    عهدة {hud.cashierSettings.openingDrawerFloat} + صافي كاش {hud.cashierSummary.cashSalesTotal}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-stone-800 bg-[#1e1814]">
                  <div className="text-[11px] text-stone-400">صافي المبيعات المسجلة</div>
                  <div
                    data-testid="acc-gross-sales"
                    className="font-mono-num text-xl font-black text-amber-300 mt-0.5"
                  >
                    {hud.cashierSummary.grossSalesTotal} ج.م
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono-num mt-0.5">
                    كاش {hud.cashierSummary.cashSalesTotal} · إنستا {hud.cashierSummary.instapaySalesTotal}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-stone-800 bg-[#1e1814]">
                  <div className="text-[11px] text-stone-400">خصومات ومرتجعات</div>
                  <div className="font-mono-num text-xl font-black text-stone-100 mt-0.5">
                    {hud.cashierSummary.totalDiscountsGiven + hud.cashierSummary.totalVipDiscountsGiven} /{' '}
                    <span className="text-rose-400">{hud.cashierSummary.refundedTotal}</span> ج.م
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono-num mt-0.5">
                    خصم VIP {hud.cashierSummary.totalVipDiscountsGiven}ج · مرتجع ({hud.cashierSummary.refundedCount})
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-stone-800 bg-[#1e1814]">
                  <div className="text-[11px] text-stone-400">بقشيش وعدد الفواتير</div>
                  <div className="font-mono-num text-xl font-black text-emerald-400 mt-0.5">
                    {hud.cashierSummary.totalTipsCollected} ج.م
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono-num mt-0.5">
                    {hud.cashierSummary.invoiceCount} فاتورة فعّالة
                  </div>
                </div>
              </div>

              {/* Top Selling Items */}
              {hud.cashierSummary.topSellingItems.length > 0 && (
                <div className="p-3 rounded-xl border border-stone-800 bg-[#1a1511]">
                  <div className="text-xs font-bold text-amber-300 mb-2">
                    الأصناف الأكثر مبيعاً في الجرد المحاسبي
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {hud.cashierSummary.topSellingItems.map((it) => (
                      <div
                        key={it.itemId}
                        className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs"
                      >
                        <span className="font-bold text-stone-100">{it.nameAr}</span>
                        {' · '}
                        <span className="font-mono-num text-amber-300">{it.qty}×</span>
                        {' · '}
                        <span className="font-mono-num text-emerald-400 font-bold">
                          {it.revenue} ج.م
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Split Invoice Log & Thermal Print Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Invoices List */}
                <div className="lg:col-span-6 space-y-2">
                  <div className="text-xs font-bold text-stone-300">
                    دفتر الفواتير المرقمة
                  </div>
                  {hud.cashierReceipts.length === 0 ? (
                    <div className="p-6 text-center rounded-xl border border-dashed border-stone-700 text-xs text-stone-400">
                      لا توجد فواتير صادرة بعد — أتمم أول عملية بيع من الكاشير أو سلّم طلب على الكاونتر!
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto space-y-2 pr-0.5">
                      {hud.cashierReceipts.map((rec) => {
                        const selected = activeReceipt?.id === rec.id;
                        return (
                          <button
                            key={rec.id}
                            type="button"
                            data-testid={`receipt-row-${rec.invoiceNumber}`}
                            onClick={() => setSelectedReceiptId(rec.id)}
                            className={`w-full text-right p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer ${
                              selected
                                ? 'border-amber-400 bg-[#271e15]'
                                : 'border-stone-800 bg-[#1b1612] hover:border-stone-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono-num text-xs font-black text-amber-300">
                                  {rec.invoiceNumber}
                                </span>
                                <span className="text-[11px] text-stone-400">
                                  {rec.clockStr} · {rec.paymentMethod === 'cash' ? 'كاش' : 'إنستا باي'}
                                </span>
                                {rec.isDelivery && (
                                  <span className="text-[10px] font-bold text-sky-300">دليفري 🛵</span>
                                )}
                                {rec.refundStatus === 'pending' && (
                                  <span className="text-[10px] font-bold text-amber-300">⏳ مرتجع معلق</span>
                                )}
                                {rec.refundStatus === 'approved' && (
                                  <span className="text-[10px] font-bold text-rose-400">↩️ مرتجع</span>
                                )}
                              </div>
                              <div className="text-xs font-bold text-stone-200 mt-0.5">
                                {rec.customerNameAr} ({rec.items.length} أصناف) · الكاشير: {rec.cashierNameAr}
                              </div>
                            </div>
                            <div
                              className={`font-mono-num text-sm font-black shrink-0 ${
                                rec.refundStatus === 'approved'
                                  ? 'text-rose-400 line-through'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {rec.total} ج.م
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Thermal Invoice Slip + Deterministic SVG QR + Refund Flow */}
                <div className="lg:col-span-6 space-y-3">
                  {activeReceipt ? (
                    <div
                      data-testid="thermal-receipt-preview"
                      className="rounded-2xl bg-[#fbf8f1] text-stone-900 p-5 border-2 border-stone-300 shadow-lg space-y-3"
                    >
                      <div className="text-center border-b border-dashed border-stone-400 pb-3">
                        <div className="font-display text-lg font-black text-stone-900">
                          مطعم المعلم — فول وطعمية الحارة
                        </div>
                        <div className="text-[11px] text-stone-600 mt-0.5">
                          فاتورة ضريبية مبسطة بالأسعار الرسمية {activeReceipt.isDelivery ? '· طلب دليفري 🛵' : ''}
                        </div>
                        <div className="font-mono-num text-xs font-bold text-stone-800 mt-1">
                          رقم الفاتورة: {activeReceipt.invoiceNumber}
                        </div>
                        {activeReceipt.refundStatus === 'approved' && (
                          <div className="mt-1.5 inline-block px-2.5 py-0.5 rounded bg-rose-100 border border-rose-400 text-rose-800 text-[11px] font-black">
                            مرتجع معتمد ({activeReceipt.refundReasonAr})
                          </div>
                        )}
                        {activeReceipt.refundStatus === 'pending' && (
                          <div className="mt-1.5 inline-block px-2.5 py-0.5 rounded bg-amber-100 border border-amber-400 text-amber-800 text-[11px] font-black">
                            طلب مرتجع بانتظار موافقة المعلم محمد
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-700 border-b border-dashed border-stone-300 pb-2.5">
                        <div>
                          الزبون:{' '}
                          <span className="font-bold">
                            {activeReceipt.customerNameAr}
                            {activeReceipt.vipTier
                              ? ` (VIP ${VIP_TIER_CONFIG[activeReceipt.vipTier].labelAr})`
                              : ''}
                          </span>
                        </div>
                        <div className="text-left font-mono-num">
                          اليوم {activeReceipt.day} · {activeReceipt.clockStr}
                        </div>
                        <div>
                          الكاشير: <span className="font-bold">{activeReceipt.cashierNameAr}</span>
                        </div>
                        <div className="text-left">
                          المدير: <span className="font-bold">{activeReceipt.managerNameAr}</span>
                        </div>
                      </div>

                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-stone-300 text-stone-600">
                            <th className="py-1 text-right font-bold">الصنف</th>
                            <th className="py-1 text-center font-bold">ك</th>
                            <th className="py-1 text-center font-bold">سعر</th>
                            <th className="py-1 text-left font-bold">الإجمالي</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeReceipt.items.map((line, i) => (
                            <tr key={`${line.itemId}-${i}`} className="border-b border-stone-200">
                              <td className="py-1.5 font-bold text-stone-900">{line.nameAr}</td>
                              <td className="py-1.5 text-center font-mono-num">{line.qty}</td>
                              <td className="py-1.5 text-center font-mono-num">{line.unitPrice}ج</td>
                              <td className="py-1.5 text-left font-mono-num font-bold">
                                {line.lineTotal}ج
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="space-y-1 text-xs border-t border-dashed border-stone-400 pt-2.5">
                        <div className="flex justify-between">
                          <span>المجموع الفرعي:</span>
                          <span className="font-mono-num font-bold">{activeReceipt.subtotal} ج.م</span>
                        </div>
                        {activeReceipt.discountAmount > 0 && (
                          <div className="flex justify-between text-rose-700">
                            <span>خصم المعلم ({activeReceipt.discountPct}%):</span>
                            <span className="font-mono-num font-bold">
                              -{activeReceipt.discountAmount} ج.م
                            </span>
                          </div>
                        )}
                        {(activeReceipt.vipDiscountAmount ?? 0) > 0 && (
                          <div className="flex justify-between text-amber-800">
                            <span>خصم ولاء VIP ({activeReceipt.vipDiscountPct}%):</span>
                            <span className="font-mono-num font-bold">
                              -{activeReceipt.vipDiscountAmount} ج.م
                            </span>
                          </div>
                        )}
                        {activeReceipt.taxAmount > 0 && (
                          <div className="flex justify-between">
                            <span>ضريبة ({activeReceipt.taxPct}%):</span>
                            <span className="font-mono-num font-bold">
                              +{activeReceipt.taxAmount} ج.م
                            </span>
                          </div>
                        )}
                        {activeReceipt.tipAmount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>بقشيش الخدمة:</span>
                            <span className="font-mono-num font-bold">
                              +{activeReceipt.tipAmount} ج.م
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-black text-stone-950 border-t border-stone-400 pt-1.5">
                          <span>الصافي المطلوب:</span>
                          <span className="font-mono-num">{activeReceipt.total} ج.م</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-stone-700">
                          <span>
                            المدفوع ({activeReceipt.paymentMethod === 'cash' ? 'نقداً' : 'إنستا باي'}):
                          </span>
                          <span className="font-mono-num font-bold">{activeReceipt.paidAmount} ج.م</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-stone-800 font-bold">
                          <span>الباقي للزبون:</span>
                          <span className="font-mono-num">{activeReceipt.changeAmount} ج.م</span>
                        </div>
                      </div>

                      {/* Deterministic Inline SVG QR Verification Block */}
                      {(() => {
                        const qrCode =
                          activeReceipt.qrOrderCode ??
                          `ELMOALEM|${activeReceipt.invoiceNumber}|${activeReceipt.total}|POS`;
                        const matrix = generateQrMatrix(qrCode, 11);
                        return (
                          <div
                            data-testid="receipt-qr-block"
                            className="flex items-center justify-between gap-3 pt-2.5 border-t border-dashed border-stone-300"
                          >
                            <div className="space-y-0.5 text-[10px] text-stone-600 min-w-0">
                              <div className="font-bold text-stone-800">
                                {activeReceipt.isDelivery
                                  ? 'كود QR لتتبع الدليفري والفاتورة'
                                  : 'كود QR للتحقق من الفاتورة الإلكترونية'}
                              </div>
                              <div className="font-mono-num truncate" dir="ltr">
                                {qrCode}
                              </div>
                              <div>شكراً لزيارتكم حارة المعلم — بالهنا والشفا!</div>
                            </div>
                            <svg
                              data-testid="receipt-qr-svg"
                              width="56"
                              height="56"
                              viewBox={`0 0 ${matrix.length} ${matrix.length}`}
                              shapeRendering="crispEdges"
                              className="shrink-0 border border-stone-300 bg-white p-1 rounded"
                              aria-label="رمز QR للفاتورة"
                            >
                              {matrix.map((row, r) =>
                                row.map((on, c) =>
                                  on ? (
                                    <rect
                                      key={`${r}-${c}`}
                                      x={c}
                                      y={r}
                                      width={1}
                                      height={1}
                                      fill="#111827"
                                    />
                                  ) : null,
                                ),
                              )}
                            </svg>
                          </div>
                        );
                      })()}

                      {/* Receipt Actions: Print + Refund Request */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-dashed border-stone-300">
                        {activeReceipt.refundStatus !== 'approved' &&
                        activeReceipt.refundStatus !== 'pending' ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <select
                              value={refundReasonAr}
                              onChange={(e) => setRefundReasonAr(e.target.value)}
                              className="px-2 py-1 rounded bg-stone-200 text-stone-900 text-[11px] font-bold"
                            >
                              {REFUND_REASONS.map((rs) => (
                                <option key={rs} value={rs}>
                                  {rs}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              data-testid="receipt-refund-btn"
                              onClick={() => onRequestRefund(activeReceipt.id, refundReasonAr)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-bold cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>
                                {hud.canControlPricesAndSettings
                                  ? 'مرتجع وإلغاء فوري'
                                  : 'طلب مرتجع للمعلم'}
                              </span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-stone-600">
                            {activeReceipt.refundStatus === 'approved'
                              ? `مرتجع معتمد (${activeReceipt.refundApprovedByAr ?? 'المعلم'})`
                              : 'طلب المرتجع قيد المراجعة'}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => window.print?.()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>طباعة</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full min-h-[240px] flex items-center justify-center rounded-2xl border border-dashed border-stone-700 text-xs text-stone-400">
                      اختر فاتورة من القائمة لعرض تفاصيل الفاتورة الحرارية وكود QR
                    </div>
                  )}
                </div>
              </div>

              {/* Daily Shift Expenses & 4-Partner Profit Distribution Report */}
              <div
                data-testid="shift-settlement-panel"
                className="p-4 rounded-2xl border border-amber-500/35 bg-[#1b1511] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-amber-400" />
                      <span>
                        تقرير المصروفات وتقفيل وردية اليوم {hud.shiftSettlementPreview.day} وتوزيع الأرباح على الشركاء الـ ٤
                      </span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      حساب المصروفات اليومية (إيجار المحل والغاز والمشتريات) وتوزيع صافي الربح بنسب الشراكة الرسمية
                    </p>
                  </div>

                  <button
                    type="button"
                    data-testid="settle-shift-btn"
                    disabled={!hud.canControlPricesAndSettings}
                    onClick={onSettleShift}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-700 disabled:text-stone-400 text-stone-950 text-xs font-black cursor-pointer"
                  >
                    {hud.canControlPricesAndSettings
                      ? 'اعتماد وتقفيل الوردية وتوزيع الأرباح'
                      : 'مخصص للمعلم محمد'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800">
                    <div className="text-[11px] text-stone-400">صافي المبيعات</div>
                    <div className="font-mono-num font-black text-emerald-400 mt-0.5">
                      +{hud.shiftSettlementPreview.grossRevenue} ج.م
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800">
                    <div className="text-[11px] text-stone-400">إيجار وكهرباء وغاز</div>
                    <div className="font-mono-num font-black text-rose-300 mt-0.5">
                      -{hud.shiftSettlementPreview.shopRentExpense + hud.shiftSettlementPreview.utilitiesExpense} ج.م
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800">
                    <div className="text-[11px] text-stone-400">بضاعة وتجهيزات</div>
                    <div className="font-mono-num font-black text-rose-300 mt-0.5">
                      -{hud.shiftSettlementPreview.stockAndUpgradesExpense} ج.م
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800">
                    <div className="text-[11px] text-stone-400">مرتجعات مخصومة</div>
                    <div className="font-mono-num font-black text-amber-300 mt-0.5">
                      {hud.shiftSettlementPreview.refundsTotal} ج.م
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#102218] border border-emerald-500/40">
                    <div className="text-[11px] text-emerald-300">صافي الربح القابل للتوزيع</div>
                    <div
                      data-testid="settlement-net-profit"
                      className={`font-mono-num font-black text-base mt-0.5 ${
                        hud.shiftSettlementPreview.netProfit >= 0
                          ? 'text-emerald-300'
                          : 'text-rose-400'
                      }`}
                    >
                      {hud.shiftSettlementPreview.netProfit} ج.م
                    </div>
                  </div>
                </div>

                {/* 4 Partners Split Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {hud.shiftSettlementPreview.partnerShares.map((partner) => (
                    <div
                      key={partner.characterId}
                      data-testid={`partner-share-${partner.characterId}`}
                      className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-stone-100 truncate">
                          {partner.nameAr}
                        </div>
                        <div className="text-[10px] text-stone-400 truncate">
                          {partner.roleTitleAr}
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <div className="font-mono-num text-sm font-black text-amber-300">
                          {partner.amount} ج.م
                        </div>
                        <div className="font-mono-num text-[10px] text-stone-400">
                          {partner.sharePct}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {hud.shiftSettlements.length > 0 && (
                  <div className="pt-2 border-t border-stone-800 space-y-1.5">
                    <div className="text-[11px] font-bold text-stone-400">
                      سجل الورديات المقفلة ({hud.shiftSettlements.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hud.shiftSettlements.slice(0, 4).map((rec) => (
                        <div
                          key={rec.id}
                          data-testid={`settled-record-${rec.id}`}
                          className="px-3 py-1.5 rounded-lg bg-stone-900 border border-emerald-500/30 text-[11px]"
                        >
                          <span className="font-bold text-amber-200">اليوم {rec.day}</span>
                          {' · '}
                          <span className="font-mono-num text-stone-400">{rec.clockStr}</span>
                          {' · '}
                          <span className="font-mono-num text-emerald-400 font-bold">
                            صافي {rec.netProfit} ج.م
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EL-MOALEM MASTER CONTROL */}
          {tab === 'master' && (
            <div className="space-y-4">
              <div
                className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                  hud.canControlPricesAndSettings
                    ? 'border-emerald-500/40 bg-[#13221a]'
                    : 'border-rose-500/45 bg-[#261414]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {hud.canControlPricesAndSettings ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-sm font-extrabold text-stone-100">
                      {hud.canControlPricesAndSettings
                        ? 'لوحة تحكم المعلم محمد (صلاحية كاملة على الأسعار والكاشير والمرتجع)'
                        : 'وضع القراءة فقط — هذا القسم مخصص للمعلم محمد (صاحب المحل والمدير) في الأونلاين'}
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      أي تعديل في الأسعار أو الخصومات أو قفل الدرج أو اعتماد المرتجعات يتطبق فوراً عند باقي الفريق!
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Refunds Queue for El-Moalem Approval */}
              {pendingRefundReceipts.length > 0 && (
                <div
                  data-testid="master-pending-refunds"
                  className="p-3.5 rounded-xl border border-rose-500/45 bg-[#241313] space-y-2.5"
                >
                  <div className="text-xs font-extrabold text-rose-300 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4" />
                    <span>
                      طلبات مرتجع وإلغاء فواتير بانتظار موافقة المعلم ({pendingRefundReceipts.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {pendingRefundReceipts.map((rec) => (
                      <div
                        key={rec.id}
                        data-testid={`pending-refund-${rec.invoiceNumber}`}
                        className="p-2.5 rounded-lg bg-stone-950/75 border border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-amber-200">
                            <span className="font-mono-num">{rec.invoiceNumber}</span> · {rec.customerNameAr} (
                            <span className="font-mono-num text-rose-300">{rec.total} ج.م</span>)
                          </div>
                          <div className="text-[11px] text-stone-400">
                            طلب من: {rec.refundRequestedByAr ?? rec.cashierNameAr} · السبب: {rec.refundReasonAr}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            data-testid={`approve-refund-${rec.invoiceNumber}`}
                            disabled={!hud.canControlPricesAndSettings}
                            onClick={() => onResolveRefund(rec.id, true)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-stone-950 text-xs font-black cursor-pointer"
                          >
                            موافقة وخصم
                          </button>
                          <button
                            type="button"
                            data-testid={`reject-refund-${rec.invoiceNumber}`}
                            disabled={!hud.canControlPricesAndSettings}
                            onClick={() => onResolveRefund(rec.id, false)}
                            className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
                          >
                            رفض
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Register Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-stone-800 bg-[#1d1713] flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-extrabold text-stone-100">
                      حالة درج الكاشير
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      {hud.cashierSettings.cashierRegisterLocked
                        ? 'مقفول الآن — الكاشير لا يستطيع التحصيل'
                        : 'مفتوح للعمل والتحصيل الطبيعي'}
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="master-toggle-lock"
                    disabled={!hud.canControlPricesAndSettings}
                    onClick={() =>
                      onUpdateCashierSettings({
                        cashierRegisterLocked: !hud.cashierSettings.cashierRegisterLocked,
                      })
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold disabled:opacity-50 cursor-pointer ${
                      hud.cashierSettings.cashierRegisterLocked
                        ? 'bg-emerald-500 text-stone-950'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {hud.cashierSettings.cashierRegisterLocked ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>فتح الدرج</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>قفل الدرج</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-800 bg-[#1d1713] flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-extrabold text-stone-100">
                      سماحية خصم الكاشير
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      {hud.cashierSettings.allowCashierCustomDiscount
                        ? `مسموح لغاية ${hud.cashierSettings.maxDiscountPct}%`
                        : 'ممنوع — الأسعار ثابتة تماماً'}
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="master-toggle-discount"
                    disabled={!hud.canControlPricesAndSettings}
                    onClick={() =>
                      onUpdateCashierSettings({
                        allowCashierCustomDiscount:
                          !hud.cashierSettings.allowCashierCustomDiscount,
                      })
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold disabled:opacity-50 cursor-pointer ${
                      hud.cashierSettings.allowCashierCustomDiscount
                        ? 'bg-emerald-500 text-stone-950'
                        : 'bg-stone-700 text-stone-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {hud.cashierSettings.allowCashierCustomDiscount ? 'مفعل' : 'موقوف'}
                    </span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-800 bg-[#1d1713] flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-extrabold text-stone-100">
                      أقصى نسبة خصم (%)
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      يتحكم في خصومات الكاشير والزبائن
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={!hud.canControlPricesAndSettings}
                      onClick={() =>
                        onUpdateCashierSettings({
                          maxDiscountPct: Math.max(0, hud.cashierSettings.maxDiscountPct - 5),
                        })
                      }
                      className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-50 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono-num text-sm font-black text-amber-300 w-10 text-center">
                      {hud.cashierSettings.maxDiscountPct}%
                    </span>
                    <button
                      type="button"
                      disabled={!hud.canControlPricesAndSettings}
                      onClick={() =>
                        onUpdateCashierSettings({
                          maxDiscountPct: Math.min(30, hud.cashierSettings.maxDiscountPct + 5),
                        })
                      }
                      className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-50 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-800 bg-[#1d1713] flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-extrabold text-stone-100">
                      ضريبة الخدمة / القيمة (%)
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      تُضاف تلقائياً في شاشة الكاشير والفاتورة
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={!hud.canControlPricesAndSettings}
                      onClick={() =>
                        onUpdateCashierSettings({
                          taxRatePct: Math.max(0, hud.cashierSettings.taxRatePct - 2),
                        })
                      }
                      className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-50 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono-num text-sm font-black text-amber-300 w-10 text-center">
                      {hud.cashierSettings.taxRatePct}%
                    </span>
                    <button
                      type="button"
                      disabled={!hud.canControlPricesAndSettings}
                      onClick={() =>
                        onUpdateCashierSettings({
                          taxRatePct: Math.min(14, hud.cashierSettings.taxRatePct + 2),
                        })
                      }
                      className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-50 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-800 bg-[#1d1713] flex items-center justify-between gap-3 sm:col-span-2">
                  <div>
                    <div className="text-xs font-extrabold text-stone-100">
                      عهدة بداية الوردية في الدرج (فكة الكاشير)
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      يُحسب فوقها إجمالي مبيعات الكاش في التقرير المحاسبي (Z-Report)
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={!hud.canControlPricesAndSettings}
                      onClick={() =>
                        onUpdateCashierSettings({
                          openingDrawerFloat: Math.max(
                            0,
                            hud.cashierSettings.openingDrawerFloat - 50,
                          ),
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-xs font-bold cursor-pointer"
                    >
                      -٥٠
                    </button>
                    <span className="font-mono-num text-sm font-black text-emerald-400 min-w-[68px] text-center">
                      {hud.cashierSettings.openingDrawerFloat} ج.م
                    </span>
                    <button
                      type="button"
                      disabled={!hud.canControlPricesAndSettings}
                      onClick={() =>
                        onUpdateCashierSettings({
                          openingDrawerFloat: Math.min(
                            2000,
                            hud.cashierSettings.openingDrawerFloat + 50,
                          ),
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-xs font-bold cursor-pointer"
                    >
                      +٥٠
                    </button>
                  </div>
                </div>
              </div>

              {/* Full 14-item Menu Price Editor */}
              <div>
                <h3 className="text-sm font-extrabold text-amber-300 mb-2.5">
                  التحكم في أسعار المنيو الكامل (١٤ صنف — أسعار حقيقية)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {FULL_MENU_ORDER.map((itemId) => {
                    const def = FULL_MENU_CATALOG[itemId];
                    const curPrice = getMenuItemPrice(itemId, hud.prices, hud.extraPrices);
                    const changePrice = (delta: number) => {
                      const next = curPrice + delta;
                      if (isRecipeMenuId(itemId)) {
                        onSetRecipePrice(itemId, next);
                      } else {
                        onSetExtraPrice(itemId, next);
                      }
                    };
                    return (
                      <div
                        key={itemId}
                        data-testid={`master-price-row-${itemId}`}
                        className="p-3 rounded-xl border border-stone-800 bg-[#1c1612] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-stone-100 truncate">
                            {def.nameAr}
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono-num">
                            المرجعي: {def.basePrice} ج.م
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            data-testid={`master-price-dec-${itemId}`}
                            disabled={!hud.canControlPricesAndSettings}
                            onClick={() => changePrice(-1)}
                            className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span
                            data-testid={`master-price-val-${itemId}`}
                            className="font-mono-num text-sm font-black text-amber-300 w-9 text-center"
                          >
                            {curPrice}ج
                          </span>
                          <button
                            type="button"
                            data-testid={`master-price-inc-${itemId}`}
                            disabled={!hud.canControlPricesAndSettings}
                            onClick={() => changePrice(1)}
                            className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
