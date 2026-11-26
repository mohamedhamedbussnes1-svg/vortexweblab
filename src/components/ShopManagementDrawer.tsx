import React, { useState } from 'react';
import {
  Baby,
  Briefcase,
  Building2,
  Car,
  CheckCircle2,
  Heart,
  Home,
  Lock,
  MapPin,
  UserCheck,
  Wifi,
  X,
} from 'lucide-react';
import {
  CITY_SHOPS,
  CITY_STREETS,
  DISTRICTS,
  EW_ROADS_Z,
  NS_ROADS_X,
  PRIVATE_APARTMENT_DOOR_POS,
  SCHOOL_CAMPUSES,
} from '../game/cityLayout';
import {
  APARTMENT_CATALOG,
  CAREER_JOBS,
  CHILD_EXPENSE_COST,
  computeUpgradeCost,
  CREW_ROLES,
  INGREDIENTS,
  MARRIAGE_DOWRY_COST,
  RECIPES,
  ROMANCE_NPCS,
  VEHICLE_CATALOG,
} from '../game/rules';
import { FULL_MENU_CATALOG, POS_EXTRA_IDS } from '../game/cashier';
import {
  ApartmentId,
  CareerJobId,
  CrewRoleId,
  HudSnapshot,
  IngredientId,
  OwnedVehicleId,
  PosExtraItemId,
  RecipeId,
  ShopUpgrades,
} from '../game/types';
import { computeDynamicPackCost } from '../game/worldSystems';

interface ShopManagementDrawerProps {
  hud: HudSnapshot;
  onClose: () => void;
  onBuyIngredient: (id: IngredientId) => void;
  onSetPrice: (id: RecipeId, price: number) => void;
  onSetExtraPrice: (id: PosExtraItemId, price: number) => void;
  onOpenCashier?: () => void;
  onBuyUpgrade: (key: keyof ShopUpgrades) => void;
  onSelectRole: (role: CrewRoleId) => void;
  onSelectJob: (jobId: CareerJobId) => void;
  onBuyCityShop: (shopId: string) => void;
  onHireShopManager: (shopId: string) => void;
  onCollectShopProfits: () => void;
  onBuyVehicle: (id: OwnedVehicleId) => void;
  onSelectVehicle: (id: OwnedVehicleId) => void;
  onBuyApartment: (id: ApartmentId) => void;
  onSelectApartment: (id: ApartmentId) => void;
  onMarryGirl: (girlId: string) => void;
  onHaveChild: () => void;
}

type DrawerTab =
  | 'market'
  | 'menu'
  | 'empire'
  | 'vehicles'
  | 'family'
  | 'jobs'
  | 'crew'
  | 'map';

export const ShopManagementDrawer: React.FC<ShopManagementDrawerProps> = ({
  hud,
  onClose,
  onBuyIngredient,
  onSetPrice,
  onSetExtraPrice,
  onOpenCashier,
  onBuyUpgrade,
  onSelectRole,
  onSelectJob,
  onBuyCityShop,
  onHireShopManager,
  onCollectShopProfits,
  onBuyVehicle,
  onSelectVehicle,
  onBuyApartment,
  onSelectApartment,
  onMarryGirl,
  onHaveChild,
}) => {
  const [tab, setTab] = useState<DrawerTab>('market');

  const upgradeLabels: Array<{
    key: keyof ShopUpgrades;
    titleAr: string;
    descAr: string;
  }> = [
    {
      key: 'fryerLevel',
      titleAr: 'تطوير القلاية',
      descAr: 'قلي طعمية وبطاطس أسرع وبجودة أعلى',
    },
    {
      key: 'fulPotLevel',
      titleAr: 'قدرة الفول النحاسية الكبيرة',
      descAr: 'تحافظ على سخونة الفول وتجذب الزبائن',
    },
    {
      key: 'decorLevel',
      titleAr: 'ديكور ولافتات المحل',
      descAr: 'ترفع البقشيش وسمعة المحل في الحارة',
    },
    {
      key: 'carEngineLevel',
      titleAr: 'تعديل موتور السيارة المشتركة',
      descAr: 'سرعة أعلى في التوصيل ومشاوير التاكسي',
    },
  ];

  // Map 98-street world bounds [-102..102] x [-112..88] onto [0..280] x [0..260] SVG
  const mapX = (wx: number) => ((wx + 102) / 204) * 280;
  const mapY = (wz: number) => ((wz + 112) / 200) * 260;

  const ownedCount = hud.cityShops.filter((s) => s.owned).length;
  const totalDividends = Math.floor(
    hud.cityShops.reduce((sum, s) => sum + (s.owned ? s.accumulatedProfit : 0), 0),
  );

  if (!hud.canManageCity) {
    return (
      <div
        data-testid="management-drawer-locked"
        className="fixed inset-0 z-30 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(12, 9, 7, 0.82)' }}
      >
        <div
          className="w-full max-w-md rounded-2xl border border-rose-500/45 text-stone-100 shadow-2xl p-6 text-center space-y-4"
          style={{ backgroundColor: '#1b1510' }}
        >
          <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-300">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-display text-lg font-extrabold text-amber-300">
            الإدارة والمدينة مخصصة للمعلم محمد حامد فقط
          </h2>
          <p className="text-xs text-stone-300 leading-relaxed">
            شراء محلات المدينة، تسعير المنيو، التطويرات، وإدارة الـ ٩٨ شارع متاحة حصرياً لصاحب المحل والمدير <span className="text-amber-300 font-bold">المعلم محمد حامد</span>.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="management-drawer"
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(12, 9, 7, 0.8)' }}
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-amber-500/35 text-stone-100 shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#1b1510' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
          <div>
            <h2 className="font-display text-xl font-bold text-amber-400">
              إدارة المحل وإمبراطورية الـ ٩٨ شارع
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              الرصيد:{' '}
              <span className="font-mono-num text-amber-300 font-bold">
                {Math.round(hud.money)} ج.م
              </span>
              {' · '}
              <span>تمتلك {ownedCount}/{CITY_SHOPS.length} محل</span>
              {' · '}
              <span>الحي: {hud.currentDistrictAr}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق لوحة الإدارة"
            className="p-2 rounded-lg hover:bg-stone-800 text-stone-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-stone-900/75 border-b border-stone-800">
          {(
            [
              ['market', 'السوق والمخزون'],
              ['menu', 'الأسعار والتطوير'],
              ['empire', `محلات المدينة (${ownedCount}/${CITY_SHOPS.length})`],
              ['vehicles', `معرض السيارات (${hud.ownedVehicleIds.length}/٦)`],
              ['family', 'الشقق والأسرة'],
              ['jobs', 'الوظائف (٦)'],
              ['crew', 'طاقم الـ ٤'],
              ['map', 'خريطة الـ ٩٨ شارع'],
            ] as Array<[DrawerTab, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              data-testid={`drawer-tab-${id}`}
              onClick={() => setTab(id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                tab === id
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
          {tab === 'market' && (
            <div className="space-y-3">
              <div
                data-testid="market-forecast-banner"
                className="p-3 rounded-xl border border-amber-500/35 text-xs text-amber-200 font-bold"
                style={{ backgroundColor: '#241c13' }}
              >
                {hud.marketForecast.headlineAr}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(INGREDIENTS) as IngredientId[]).map((id) => {
                  const def = INGREDIENTS[id];
                  const stock = hud.inventory[id];
                  const baseCost = def.unitCost * def.packSize;
                  const cost = computeDynamicPackCost(id, hud.marketForecast);
                  const isDeal = cost < baseCost;
                  const isHigh = cost > baseCost;
                  const isLow = stock <= def.lowThreshold;
                  return (
                    <div
                      key={id}
                      className="p-3.5 rounded-xl border border-stone-800 flex items-center justify-between gap-3"
                      style={{ backgroundColor: '#231b15' }}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-stone-100">
                          <span>{def.nameAr}</span>
                          {isDeal && (
                            <span className="text-[10px] font-extrabold text-emerald-400">
                              عرض -٢٥٪
                            </span>
                          )}
                          {isHigh && (
                            <span className="text-[10px] font-extrabold text-rose-400">
                              مرتفع +٣٠٪
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-xs font-mono-num mt-0.5 ${
                            isLow ? 'text-rose-400 font-bold' : 'text-stone-400'
                          }`}
                        >
                          المتوفر: {stock} {isLow ? '(قرب يخلص!)' : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onBuyIngredient(id)}
                        className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold whitespace-nowrap cursor-pointer"
                      >
                        +{def.packSize} ({cost} ج.م)
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'menu' && (
            <div className="space-y-5">
              {onOpenCashier && (
                <div className="p-3 rounded-xl border border-emerald-500/35 bg-[#12221a] flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-emerald-200 font-bold">
                    شاشة الكاشير الكاملة: المنيو الـ ١٤ صنف + الفواتير + استفسارات الزبائن + تحكم المعلم
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCashier();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-extrabold cursor-pointer"
                  >
                    فتح شاشة الكاشير [K]
                  </button>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-amber-300 mb-2.5">
                  أسعار السندوتشات
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(RECIPES) as RecipeId[]).map((rid) => {
                    const rec = RECIPES[rid];
                    const price = hud.prices[rid];
                    return (
                      <div
                        key={rid}
                        className="p-3 rounded-xl border border-stone-800 flex items-center justify-between gap-2"
                        style={{ backgroundColor: '#231b15' }}
                      >
                        <div>
                          <div className="text-xs font-bold text-stone-100">
                            {rec.nameAr}
                          </div>
                          <div className="text-[11px] text-stone-400">
                            السعر العادل: {rec.basePrice} ج.م
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={!hud.canControlPricesAndSettings}
                            onClick={() => onSetPrice(rid, price - 1)}
                            className="w-7 h-7 rounded-md bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono-num text-sm font-bold text-amber-300 w-8 text-center">
                            {price}
                          </span>
                          <button
                            type="button"
                            disabled={!hud.canControlPricesAndSettings}
                            onClick={() => onSetPrice(rid, price + 1)}
                            className="w-7 h-7 rounded-md bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-amber-300 mb-2.5">
                  أسعار الأطباق والسرفيس والمشروبات (٨ أصناف إضافية)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {POS_EXTRA_IDS.map((eid) => {
                    const def = FULL_MENU_CATALOG[eid];
                    const price = hud.extraPrices[eid] ?? def.basePrice;
                    return (
                      <div
                        key={eid}
                        className="p-3 rounded-xl border border-stone-800 flex items-center justify-between gap-2"
                        style={{ backgroundColor: '#231b15' }}
                      >
                        <div>
                          <div className="text-xs font-bold text-stone-100">
                            {def.nameAr}
                          </div>
                          <div className="text-[11px] text-stone-400">
                            السعر المرجعي: {def.basePrice} ج.م
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={!hud.canControlPricesAndSettings}
                            onClick={() => onSetExtraPrice(eid, price - 1)}
                            className="w-7 h-7 rounded-md bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono-num text-sm font-bold text-amber-300 w-8 text-center">
                            {price}
                          </span>
                          <button
                            type="button"
                            disabled={!hud.canControlPricesAndSettings}
                            onClick={() => onSetExtraPrice(eid, price + 1)}
                            className="w-7 h-7 rounded-md bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-amber-300 mb-2.5">
                  تطوير المحل والسيارة
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {upgradeLabels.map((u) => {
                    const lvl = hud.upgrades[u.key];
                    const cost = computeUpgradeCost(u.key, lvl);
                    return (
                      <div
                        key={u.key}
                        className="p-3 rounded-xl border border-stone-800 flex flex-col justify-between gap-2"
                        style={{ backgroundColor: '#231b15' }}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-100">
                              {u.titleAr}
                            </span>
                            <span className="font-mono-num text-[11px] text-amber-400">
                              مستوى {lvl}/4
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            {u.descAr}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={lvl >= 4}
                          onClick={() => onBuyUpgrade(u.key)}
                          className="w-full py-1.5 rounded-lg bg-amber-500 disabled:bg-stone-700 disabled:text-stone-400 text-stone-950 text-xs font-extrabold cursor-pointer"
                        >
                          {lvl >= 4 ? 'مكتمل' : `تطوير (${cost} ج.م)`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'empire' && (
            <div className="space-y-3">
              <div
                className="p-3.5 rounded-xl border border-emerald-500/35 flex flex-wrap items-center justify-between gap-3"
                style={{ backgroundColor: '#16241d' }}
              >
                <div>
                  <div className="text-xs font-bold text-emerald-300">
                    أرباح المحلات المملوكة الجاهزة للتحصيل
                  </div>
                  <div className="font-mono-num text-lg font-extrabold text-white mt-0.5">
                    {totalDividends} ج.م
                  </div>
                </div>
                <button
                  type="button"
                  disabled={totalDividends <= 0}
                  onClick={onCollectShopProfits}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-700 disabled:text-stone-400 text-stone-950 text-xs font-extrabold cursor-pointer"
                >
                  تحصيل الأرباح الآن
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CITY_SHOPS.map((shop) => {
                  const st = hud.cityShops.find((s) => s.id === shop.id);
                  const isOwned = Boolean(st?.owned);
                  const hasManager = Boolean(st?.hasManager);
                  const mgrCost = Math.round(shop.purchasePrice * 0.4);
                  return (
                    <div
                      key={shop.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 ${
                        isOwned ? 'border-emerald-500/50' : 'border-stone-800'
                      }`}
                      style={{ backgroundColor: '#231b15' }}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-sm text-amber-200">
                            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{shop.nameAr}</span>
                          </div>
                          {isOwned && (
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              ملكك
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          {shop.categoryAr} · {shop.streetNameAr}
                        </div>
                        <div className="text-[11px] text-stone-300 mt-1">
                          المالك: {shop.ownerNameAr} · ربح يومي:{' '}
                          <span className="font-mono-num text-emerald-400 font-bold">
                            +{shop.dailyRevenue} ج.م
                          </span>
                        </div>
                      </div>

                      {!isOwned ? (
                        <button
                          type="button"
                          onClick={() => onBuyCityShop(shop.id)}
                          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold cursor-pointer"
                        >
                          شراء تمليك ({shop.purchasePrice} ج.م)
                        </button>
                      ) : !hasManager ? (
                        <button
                          type="button"
                          onClick={() => onHireShopManager(shop.id)}
                          className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-stone-950 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>تعيين مدير +٥٥٪ ربح ({mgrCost} ج.م)</span>
                        </button>
                      ) : (
                        <div className="text-center py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-bold">
                          يعمل بمدير محترف · الأرباح تتراكم تلقائياً
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'vehicles' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-300">
                اشترِ نصف نقل (٤ كابينة + ٤ صندوق) وموتوسيكل دليفري وسيارات من معرض المعلم — تقدر تقفل سيارتك بلوك خاص بالمعلم من الموبايل [M]:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(VEHICLE_CATALOG).map((v) => {
                  const owned = hud.ownedVehicleIds.includes(v.id);
                  const active = hud.activeVehicleId === v.id;
                  return (
                    <div
                      key={v.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 ${
                        active
                          ? 'border-amber-400'
                          : owned
                            ? 'border-emerald-500/45'
                            : 'border-stone-800'
                      }`}
                      style={{ backgroundColor: '#231b15' }}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-bold text-sm text-amber-200">
                            <Car className="w-4 h-4 shrink-0" style={{ color: v.accentHex }} />
                            <span>{v.nameAr}</span>
                          </div>
                          {active && (
                            <span className="text-[11px] font-bold text-amber-300">
                              سيارتك الحالية
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">{v.subtitleAr}</p>
                        <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-mono-num text-stone-200">
                          <span className="px-2 py-0.5 rounded bg-stone-900">
                            سرعة: {v.topSpeedKmh} كم/س
                          </span>
                          <span className="px-2 py-0.5 rounded bg-stone-900">
                            أجرة تاكسي: ×{v.taxiBonusMult}
                          </span>
                          {v.charmBonus > 0 && (
                            <span className="px-2 py-0.5 rounded bg-pink-500/15 text-pink-300">
                              جاذبية +{v.charmBonus}
                            </span>
                          )}
                        </div>
                      </div>

                      {!owned ? (
                        <button
                          type="button"
                          disabled={hud.money < v.price}
                          onClick={() => onBuyVehicle(v.id)}
                          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 text-xs font-extrabold cursor-pointer disabled:cursor-not-allowed"
                        >
                          شراء المركبة ({v.price} ج.م)
                        </button>
                      ) : active ? (
                        <div className="text-center py-1.5 rounded-lg bg-amber-500/15 text-amber-300 text-xs font-bold">
                          مركونة قدام المحل وجاهزة للقيادة
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectVehicle(v.id)}
                          className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-extrabold cursor-pointer"
                        >
                          قيادة هذه المركبة الآن
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'family' && (
            <div className="space-y-5">
              {/* Life Stage Progression Tracker */}
              <div
                data-testid="life-stage-tracker"
                className="p-3.5 rounded-xl border border-pink-400/35 space-y-2.5"
                style={{ backgroundColor: '#22171d' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-display font-bold text-sm text-pink-200">
                    رحلة المعلم في البيت الثابت
                  </div>
                  <span className="text-xs font-extrabold text-amber-300">
                    الحالة: {hud.lifeStageLabelAr}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-bold">
                  {(
                    [
                      ['single', '١. أعزب'],
                      ['courting', '٢. تعارف'],
                      ['married', '٣. جواز'],
                      ['parent', '٤. خلفة وعيال'],
                    ] as const
                  ).map(([stageKey, label]) => {
                    const order = { single: 0, courting: 1, married: 2, parent: 3 };
                    const reached = order[hud.lifeStage] >= order[stageKey];
                    return (
                      <div
                        key={stageKey}
                        className={`py-1.5 px-1 rounded-lg border ${
                          reached
                            ? 'border-pink-400/60 bg-pink-500/20 text-pink-100'
                            : 'border-stone-800 bg-stone-900/70 text-stone-500'
                        }`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Apartments */}
              <div>
                <h3 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                  <Home className="w-4 h-4" />
                  <span>البيت الثابت والشقق التمليك</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(APARTMENT_CATALOG).map((apt) => {
                    const owned = hud.ownedApartmentIds.includes(apt.id);
                    const active = hud.activeApartmentId === apt.id;
                    return (
                      <div
                        key={apt.id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 ${
                          active
                            ? 'border-sky-400'
                            : owned
                              ? 'border-emerald-500/45'
                              : 'border-stone-800'
                        }`}
                        style={{ backgroundColor: '#231b15' }}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm text-amber-100">
                              {apt.nameAr}
                            </span>
                            {active && (
                              <span className="text-[11px] font-bold text-sky-300">
                                سكنك الحالي
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            {apt.streetAr} · {apt.roomsAr}
                          </div>
                          <div className="text-[11px] text-emerald-400 font-bold mt-1">
                            عائد راحة يومي: +{apt.dailyMoraleBonus} ج.م · جاذبية +{apt.charmBonus}
                          </div>
                        </div>
                        {!owned ? (
                          <button
                            type="button"
                            disabled={hud.money < apt.price}
                            onClick={() => onBuyApartment(apt.id)}
                            className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 text-xs font-extrabold cursor-pointer disabled:cursor-not-allowed"
                          >
                            شراء الشقة ({apt.price} ج.م)
                          </button>
                        ) : active ? (
                          <div className="text-center py-1.5 rounded-lg bg-sky-500/15 text-sky-300 text-xs font-bold">
                            البيت الثابت مفتوح قدام المحل في الحارة
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectApartment(apt.id)}
                            className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-stone-950 text-xs font-extrabold cursor-pointer"
                          >
                            الانتقال لهذا المسكن
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Marriage & Children */}
              <div>
                <h3 className="text-sm font-bold text-pink-300 mb-2 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-pink-400/50" />
                  <span>التعارف والجواز والخلفة</span>
                </h3>

                {hud.spouseId && (
                  <div
                    className="p-4 rounded-xl border border-pink-500/45 mb-3 space-y-3"
                    style={{ backgroundColor: '#261720' }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-base text-pink-200">
                          زوجتك: {hud.spouseNameAr} ❤️
                        </div>
                        <div className="text-xs text-stone-300">
                          عايشة معاك في البيت الثابت (تقدر تكلمها جوه البيت في أي وقت)
                        </div>
                      </div>
                      <button
                        type="button"
                        data-testid="drawer-have-child-btn"
                        disabled={
                          !hud.childEligible ||
                          hud.children.length >= 3 ||
                          hud.money < CHILD_EXPENSE_COST
                        }
                        onClick={onHaveChild}
                        className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-800 disabled:text-stone-400 text-stone-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Baby className="w-4 h-4" />
                        <span>
                          {hud.children.length >= 3
                            ? 'لديك ٣ أولاد (الحد الأقصى)'
                            : !hud.childEligible
                              ? `فترة الجواز: باقي ${hud.childWaitRemainingSec}ث للخلفة`
                              : `إنجاب مولود جديد (${CHILD_EXPENSE_COST} ج.م)`}
                        </span>
                      </button>
                    </div>

                    {hud.children.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {hud.children.map((ch) => (
                          <div
                            key={ch.id}
                            className="p-2.5 rounded-lg bg-stone-900/70 border border-stone-700 text-xs"
                          >
                            <div className="font-bold text-amber-200">{ch.nameAr}</div>
                            <div className="text-[11px] text-stone-400">
                              {ch.gender === 'girl' ? 'بنت جميلة' : 'ولد بطل'} · سعادة {ch.happiness}%
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ROMANCE_NPCS.map((girl) => {
                    const st = hud.romanceStates.find((r) => r.id === girl.id);
                    const aff = st?.affection ?? 20;
                    const eligible =
                      !hud.spouseId &&
                      aff >= 70 &&
                      hud.ownedApartmentIds.length > 0 &&
                      hud.money >= MARRIAGE_DOWRY_COST;
                    return (
                      <div
                        key={girl.id}
                        className="p-3 rounded-xl border border-stone-800 space-y-2"
                        style={{ backgroundColor: '#231b15' }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-pink-200">
                            {girl.nameAr} ({girl.age} سنة)
                          </span>
                          <span className="font-mono-num text-xs font-bold text-pink-300">
                            مودة {Math.round(aff)}%
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {girl.jobAr} · {girl.personalityAr}
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-stone-900 overflow-hidden">
                          <div
                            className={`h-full ${aff >= 70 ? 'bg-emerald-400' : 'bg-pink-400'}`}
                            style={{ width: `${Math.min(100, aff)}%` }}
                          />
                        </div>
                        {!hud.spouseId && (
                          <button
                            type="button"
                            disabled={!eligible}
                            onClick={() => onMarryGirl(girl.id)}
                            className="w-full py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 text-xs font-extrabold cursor-pointer disabled:cursor-not-allowed"
                          >
                            {hud.ownedApartmentIds.length === 0
                              ? 'اشترِ شقة تمليك أولاً'
                              : aff < 70
                                ? 'اتكلم معاها وارفع المودة لـ ٧٠٪'
                                : `جواز رسمي (${MARRIAGE_DOWRY_COST} ج.م)`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'jobs' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-300">
                اختر مهنتك في مدينة المعلم — تقدر تشتغل سائق تاكسي في الـ ٩٨ شارع أو ميكانيكي أو خباز أو قهوجي في أي وقت:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(CAREER_JOBS) as CareerJobId[]).map((jid) => {
                  const job = CAREER_JOBS[jid];
                  const active = hud.activeJob === jid;
                  return (
                    <button
                      key={jid}
                      type="button"
                      onClick={() => onSelectJob(jid)}
                      className={`p-3.5 rounded-xl border text-right cursor-pointer ${
                        active
                          ? 'border-amber-400 bg-amber-500/15'
                          : 'border-stone-800 bg-stone-900/50 hover:border-stone-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4" />
                          {job.titleAr}
                        </span>
                        {active && (
                          <span className="text-[11px] text-emerald-400 font-bold">
                            نشط حالياً
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-300 mt-1">
                        {job.subtitleAr}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-bold mt-1">
                        {job.bonusAr}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'crew' && (
            <div className="space-y-4">
              {hud.roleLocked && (
                <div className="p-3 rounded-xl border border-amber-400/45 bg-amber-500/10 flex items-center gap-2 text-xs font-bold text-amber-200">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    اللعب الأونلاين شغال: وظيفة كل صاحب ثابتة ومقفولة حسب شخصيته عشان الفريق يشتغل بتكامل!
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hud.crewSlots.map((slot) => (
                  <div
                    key={slot.characterId}
                    className={`p-3.5 rounded-xl border space-y-1.5 ${
                      slot.isSelf
                        ? 'border-amber-400 bg-amber-500/10'
                        : slot.connected
                          ? 'border-emerald-500/45 bg-emerald-500/10'
                          : 'border-stone-800 bg-stone-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-extrabold text-sm text-amber-200">
                        {slot.nameAr} · {slot.roleTitleAr}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          slot.isSelf
                            ? 'bg-amber-400 text-stone-950'
                            : slot.connected
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        <Wifi className="w-2.5 h-2.5" />
                        <span>
                          {slot.isSelf ? 'أنت' : slot.connected ? 'متصل الآن' : 'غير متصل'}
                        </span>
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-300">{slot.fixedDutyAr}</div>
                    <div className="text-[10px] text-stone-400">
                      الموقع: {slot.zoneAr} · {slot.streetAr}
                    </div>
                  </div>
                ))}
              </div>

              {!hud.roleLocked && (
                <>
                  <p className="text-xs text-stone-300 pt-2 border-t border-stone-800">
                    في اللعب الفردي تقدر تبدل دورك مؤقتاً للمساعدة في أي محطة:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Object.keys(CREW_ROLES) as CrewRoleId[]).map((rid) => {
                      const r = CREW_ROLES[rid];
                      const active = hud.activeRole === rid;
                      return (
                        <button
                          key={rid}
                          type="button"
                          onClick={() => onSelectRole(rid)}
                          className={`p-3 rounded-xl border text-right cursor-pointer ${
                            active
                              ? 'border-amber-400 bg-amber-500/15'
                              : 'border-stone-800 bg-stone-900/50 hover:border-stone-600'
                          }`}
                        >
                          <div className="text-xs font-bold text-amber-300">{r.titleAr}</div>
                          <div className="text-[11px] text-stone-300 mt-1">{r.perkAr}</div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'map' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-7 flex flex-col items-center">
                <svg
                  viewBox="0 0 280 260"
                  className="w-full max-w-[300px] aspect-[14/13] rounded-xl border border-stone-700 bg-[#1c2128]"
                >
                  {/* Nile river top edge */}
                  <rect x="0" y="0" width="280" height="14" fill="#0c4a6e" />
                  <text x="140" y="10" fontSize="7.5" fill="#bae6fd" textAnchor="middle">
                    نهر النيل — الكورنيش
                  </text>

                  {/* 7 N-S & 7 E-W Avenues (98 Street Segments!) */}
                  {NS_ROADS_X.map((rx) => (
                    <rect
                      key={`m-ns-${rx}`}
                      x={mapX(rx) - 3.5}
                      y="14"
                      width="7"
                      height="246"
                      fill="#2d333b"
                    />
                  ))}
                  {EW_ROADS_Z.map((rz) => (
                    <rect
                      key={`m-ew-${rz}`}
                      x="0"
                      y={mapY(rz) - 3.5}
                      width="280"
                      height="7"
                      fill="#2d333b"
                    />
                  ))}

                  {/* Ful Shop, Shared Home & Private Apartment */}
                  <rect x={mapX(-13) - 5} y={mapY(0) - 5} width="10" height="10" rx="2" fill="#f59e0b" />
                  <rect x={mapX(13.5) - 5} y={mapY(0) - 5} width="10" height="10" rx="2" fill="#38bdf8" />
                  <rect
                    x={mapX(PRIVATE_APARTMENT_DOOR_POS.x) - 4}
                    y={mapY(PRIVATE_APARTMENT_DOOR_POS.z) - 4}
                    width="8"
                    height="8"
                    rx="2"
                    fill="#ec4899"
                  />

                  {/* 2 Enterable Schools */}
                  {SCHOOL_CAMPUSES.map((sch) => (
                    <rect
                      key={`m-${sch.id}`}
                      x={mapX(sch.x) - 6}
                      y={mapY(sch.z) - 5}
                      width="12"
                      height="10"
                      rx="2"
                      fill="#3b82f6"
                      stroke="#dbeafe"
                      strokeWidth="1"
                    />
                  ))}

                  {/* All 15 City Shops */}
                  {CITY_SHOPS.map((shop) => {
                    const st = hud.cityShops.find((s) => s.id === shop.id);
                    return (
                      <circle
                        key={`m-${shop.id}`}
                        cx={mapX(shop.x)}
                        cy={mapY(shop.z)}
                        r="3.8"
                        fill={st?.owned ? '#10b981' : shop.signColorHex}
                        stroke="#09090b"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Car & Player */}
                  <circle cx={mapX(hud.carPos.x)} cy={mapY(hud.carPos.z)} r="4.5" fill="#ef4444" stroke="#fff" strokeWidth="1" />
                  <circle cx={mapX(hud.playerPos.x)} cy={mapY(hud.playerPos.z)} r="5.2" fill="#fbbf24" stroke="#000" strokeWidth="1.5" />
                </svg>

                <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-stone-300 mt-2">
                  <span className="text-amber-300">الأصفر: موقعك</span>
                  <span>·</span>
                  <span className="text-rose-400">الأحمر: السيارة</span>
                  <span>·</span>
                  <span className="text-blue-400">الأزرق: المدارس</span>
                  <span>·</span>
                  <span className="text-emerald-400">الأخضر: محلاتك</span>
                </div>
              </div>

              <div className="md:col-span-5 space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>موقعك الحالي: {hud.currentStreetAr}</span>
                </div>
                <div className="text-[11px] text-stone-400">
                  {CITY_STREETS.length} شارعاً مسمى في ٦ أحياء:
                </div>
                <div className="space-y-1.5">
                  {Object.values(DISTRICTS).map((d) => (
                    <div
                      key={d.id}
                      className="p-2 rounded-lg border border-stone-800 text-[11px]"
                      style={{ backgroundColor: '#231b15' }}
                    >
                      <div className="font-bold" style={{ color: d.accentHex }}>
                        {d.nameAr}
                      </div>
                      <div className="text-stone-400 leading-snug">{d.vibeAr}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
