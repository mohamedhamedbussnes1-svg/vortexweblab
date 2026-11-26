import React, { useState } from 'react';
import { Home, Play, RotateCcw, Settings } from 'lucide-react';
import { computeDailySummary } from '../game/rules';
import { DensitySettings, GraphicsQuality, HudSnapshot } from '../game/types';
import { PWAInstallButton } from './PWAInstallButton';

interface PauseModalProps {
  hud: HudSnapshot;
  touchControlsEnabled: boolean;
  onResume: () => void;
  onRestart: () => void;
  onTitle: () => void;
  onResetSave: () => void;
  onSetQuality: (q: GraphicsQuality) => void;
  onToggleAdaptive: () => void;
  onToggleTouch: () => void;
  onSetDensity: (partial: Partial<DensitySettings>) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  hud,
  touchControlsEnabled,
  onResume,
  onRestart,
  onTitle,
  onResetSave,
  onSetQuality,
  onToggleAdaptive,
  onToggleTouch,
  onSetDensity,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(12, 10, 8, 0.82)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-amber-500/35 p-6 text-stone-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#1b1815' }}
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2.5 pb-2 border-b border-stone-800">
          <Settings className="w-6 h-6 text-[#f5b400]" />
          <h2 className="font-display text-2xl font-extrabold text-[#f5b400]">
            قائمة الإيقاف
          </h2>
        </div>

        {/* Compact Status Line */}
        <div className="flex items-center justify-between text-xs text-stone-300 px-1">
          <span className="font-mono-num">
            الرصيد: <strong className="text-emerald-400">{Math.round(hud.money)} ج.م</strong>
          </span>
          <span className="font-mono-num">
            الطلبات: <strong className="text-amber-300">{hud.dailyStats.ordersServed}</strong>
          </span>
          <span className="font-mono-num text-stone-400">{hud.fpsEstimate} FPS</span>
        </div>

        {/* Primary Menu Stack */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3.5 px-4 rounded-xl bg-[#f5b400] hover:bg-[#ffca2c] text-stone-950 font-display font-extrabold text-base flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-amber-950/40"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>استكمال اللعب</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-expanded={settingsOpen}
            className="w-full py-3 px-4 rounded-xl bg-[#343230] hover:bg-[#413f3c] text-stone-100 font-display font-bold text-sm flex items-center justify-center gap-2.5 cursor-pointer border border-stone-700/70"
          >
            <Settings className="w-4 h-4 text-amber-300" />
            <span>إعدادات اللعبة وكثافة المدينة</span>
          </button>

          {/* Expandable Settings + City Density Panel */}
          {settingsOpen && (
            <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-200">جودة الرسوميات</span>
                <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg">
                  {(
                    [
                      ['ultra', 'عالية'],
                      ['medium', 'متوسطة'],
                      ['low', 'خفيفة'],
                    ] as Array<[GraphicsQuality, string]>
                  ).map(([q, label]) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => onSetQuality(q)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                        hud.quality === q
                          ? 'bg-[#f5b400] text-stone-950'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pedestrian, Traffic & Prop Density Sliders */}
              <div className="pt-2 border-t border-stone-800 space-y-2.5">
                <div className="text-xs font-bold text-amber-300">
                  التحكم في كثافة الحارة والمدينة
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-200 mb-1">
                    <label htmlFor="slider-ped">كثافة الناس والمشاة</label>
                    <span className="font-mono-num text-amber-300 font-bold">
                      {hud.density.pedestrianDensity}% ({hud.activePedestrianCount} شخص)
                    </span>
                  </div>
                  <input
                    id="slider-ped"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={hud.density.pedestrianDensity}
                    onChange={(e) =>
                      onSetDensity({ pedestrianDensity: Number(e.target.value) })
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-200 mb-1">
                    <label htmlFor="slider-traffic">كثافة المركبات والتكاتك</label>
                    <span className="font-mono-num text-amber-300 font-bold">
                      {hud.density.trafficDensity}% ({hud.activeTrafficCount} مركبة)
                    </span>
                  </div>
                  <input
                    id="slider-traffic"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={hud.density.trafficDensity}
                    onChange={(e) =>
                      onSetDensity({ trafficDensity: Number(e.target.value) })
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-200 mb-1">
                    <label htmlFor="slider-props">كثافة التفاصيل والأسلاك والزينة</label>
                    <span className="font-mono-num text-amber-300 font-bold">
                      {hud.density.propDensity}%
                    </span>
                  </div>
                  <input
                    id="slider-props"
                    type="range"
                    min={0}
                    max={100}
                    step={10}
                    value={hud.density.propDensity}
                    onChange={(e) =>
                      onSetDensity({ propDensity: Number(e.target.value) })
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-800">
                <span className="font-bold text-stone-200">تحسين الجودة التلقائي</span>
                <button
                  type="button"
                  onClick={onToggleAdaptive}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                    hud.adaptiveQuality
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {hud.adaptiveQuality ? 'مفعل' : 'متوقف'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-200">أزرار الموبايل (اللمس)</span>
                <button
                  type="button"
                  onClick={onToggleTouch}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                    touchControlsEnabled
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {touchControlsEnabled ? 'ظاهرة' : 'مخفية'}
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl bg-[#343230] hover:bg-[#413f3c] text-stone-100 font-display font-bold text-sm flex items-center justify-center gap-2.5 cursor-pointer border border-stone-700/70"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
            <span>إعادة اليوم</span>
          </button>

          <button
            type="button"
            onClick={onTitle}
            className="w-full py-3 px-4 rounded-xl bg-[#343230] hover:bg-[#413f3c] text-stone-100 font-display font-bold text-sm flex items-center justify-center gap-2.5 cursor-pointer border border-stone-700/70"
          >
            <Home className="w-4 h-4 text-amber-300" />
            <span>القائمة الرئيسية</span>
          </button>

          <div className="flex justify-center pt-1">
            <PWAInstallButton />
          </div>
        </div>

        <button
          type="button"
          onClick={onResetSave}
          className="w-full pt-1 text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
        >
          مسح الحفظ والبدء من الصفر
        </button>
      </div>
    </div>
  );
};

interface DaySummaryModalProps {
  hud: HudSnapshot;
  onNextDay: () => void;
  onTitle: () => void;
}

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({
  hud,
  onNextDay,
  onTitle,
}) => {
  const { netProfit, ratingLabelAr } = computeDailySummary(hud.dailyStats);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(14, 11, 8, 0.85)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-amber-500/40 p-6 text-stone-100 shadow-2xl space-y-5"
        style={{ backgroundColor: '#1b1510' }}
      >
        <div>
          <h2 className="font-display text-2xl font-extrabold text-amber-400">
            حساب نهاية اليوم {hud.day}
          </h2>
          <p className="text-xs text-stone-300 mt-1">{ratingLabelAr}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-xl bg-stone-900/75 border border-stone-800">
            <div className="text-xs text-stone-400">إجمالي الدخل</div>
            <div className="font-mono-num text-xl font-bold text-emerald-400">
              +{hud.dailyStats.revenue} ج.م
            </div>
          </div>
          <div className="p-3 rounded-xl bg-stone-900/75 border border-stone-800">
            <div className="text-xs text-stone-400">المصروفات</div>
            <div className="font-mono-num text-xl font-bold text-rose-400">
              -{hud.dailyStats.expenses} ج.م
            </div>
          </div>
          <div className="p-3 rounded-xl bg-stone-900/75 border border-stone-800">
            <div className="text-xs text-stone-400">صافي الربح</div>
            <div className="font-mono-num text-xl font-bold text-amber-300">
              {netProfit >= 0 ? `+${netProfit}` : netProfit} ج.م
            </div>
          </div>
          <div className="p-3 rounded-xl bg-stone-900/75 border border-stone-800">
            <div className="text-xs text-stone-400">طلبات + مشاوير تاكسي</div>
            <div className="font-mono-num text-xl font-bold text-stone-100">
              {hud.dailyStats.ordersServed} / {hud.dailyStats.taxiTrips}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800">
            <div className="text-[11px] text-stone-400">دخل الوظائف والورشة</div>
            <div className="font-mono-num text-sm font-bold text-sky-300">
              +{hud.dailyStats.sideJobIncome} ج.م ({hud.dailyStats.repairsDone} صيانة)
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800">
            <div className="text-[11px] text-stone-400">أرباح المحلات المملوكة</div>
            <div className="font-mono-num text-sm font-bold text-emerald-300">
              +{hud.dailyStats.shopDividends} ج.م
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            data-start="true"
            onClick={onNextDay}
            className="w-full py-3.5 rounded-xl bg-[#f5b400] hover:bg-[#ffca2c] text-stone-950 font-display font-extrabold text-base cursor-pointer"
          >
            ابدأ اليوم {hud.day + 1}
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
          >
            العودة للقائمة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};
