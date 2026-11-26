import React, { useState } from 'react';
import { Car, ChevronDown, ChevronUp, MapPin, Shield, Users, Wifi, WifiOff } from 'lucide-react';
import { OnlinePlayerSlotState } from '../game/types';

interface CrewRosterHudProps {
  slots: OnlinePlayerSlotState[];
  onlineMode: boolean;
  roomId: string | null;
}

export const CrewRosterHud: React.FC<CrewRosterHudProps> = ({
  slots,
  onlineMode,
  roomId,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const connectedCount = slots.filter((s) => s.connected).length;

  return (
    <section
      data-testid="crew-roster-hud"
      aria-label="حالة طاقم الأربعة أصحاب"
      className="pointer-events-auto w-full max-w-[248px] sm:max-w-[272px] rounded-2xl border border-amber-500/35 shadow-xl overflow-hidden text-stone-100"
      style={{ backgroundColor: 'rgba(18, 14, 11, 0.92)' }}
    >
      {/* Header Bar */}
      <button
        type="button"
        tabIndex={-1}
        data-testid="crew-roster-toggle"
        onClick={(e) => {
          e.currentTarget.blur();
          setCollapsed((v) => !v);
        }}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border-b border-stone-800/90 hover:bg-stone-900/60 cursor-pointer"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-display font-extrabold text-xs text-amber-200 truncate">
            فريق الـ ٤ أصحاب
          </span>
          {onlineMode && roomId && (
            <span className="font-mono-num text-[10px] font-bold text-emerald-400 shrink-0">
              {connectedCount}/4 · {roomId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 text-[10px] text-stone-400">
          <span>{onlineMode ? 'أونلاين' : 'فردي'}</span>
          {collapsed ? (
            <ChevronDown className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-amber-300" />
          )}
        </div>
      </button>

      {/* 4 Player Status Rows */}
      {!collapsed && (
        <div className="p-2 space-y-1.5">
          {slots.map((slot) => {
            const statusText = slot.isSelf
              ? slot.inCar
                ? 'أنت · تقود السيارة'
                : onlineMode
                  ? 'أنت · متصل الآن'
                  : 'أنت · نشط'
              : slot.connected
                ? slot.inCar
                  ? 'متصل · في السيارة'
                  : 'متصل الآن'
                : onlineMode
                  ? 'غير متصل'
                  : 'مناوب في موقعه';

            return (
              <div
                key={slot.characterId}
                data-testid={`crew-slot-${slot.characterId}`}
                className={`rounded-xl border px-2.5 py-1.5 transition-colors ${
                  slot.isSelf
                    ? 'border-amber-400/55 bg-amber-500/10'
                    : slot.connected
                      ? 'border-emerald-500/35 bg-stone-900/75'
                      : 'border-stone-800 bg-stone-950/60 opacity-85'
                }`}
              >
                {/* Top Row: Avatar Color + Name + Connection State */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/25"
                      style={{ backgroundColor: slot.shirtHex }}
                      aria-hidden="true"
                    />
                    <span className="font-display font-extrabold text-xs text-stone-100 truncate">
                      {slot.nameAr}
                    </span>
                    {slot.isSelf && (
                      <span className="text-[10px] font-bold text-amber-300 shrink-0">
                        (أنت)
                      </span>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold shrink-0 ${
                      slot.connected
                        ? 'text-emerald-400'
                        : onlineMode
                          ? 'text-stone-500'
                          : 'text-amber-200/70'
                    }`}
                  >
                    {slot.inCar ? (
                      <Car className="w-3 h-3 text-sky-400" />
                    ) : slot.connected ? (
                      <Wifi className="w-3 h-3" />
                    ) : (
                      <WifiOff className="w-3 h-3" />
                    )}
                    <span>{statusText}</span>
                  </span>
                </div>

                {/* Middle Row: Fixed Role */}
                <div className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-amber-300/95">
                  <Shield className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span className="truncate">{slot.roleTitleAr}</span>
                </div>

                {/* Bottom Row: Live 3D Location */}
                <div className="mt-0.5 flex items-center justify-between gap-1.5 text-[10px] text-stone-300">
                  <span className="inline-flex items-center gap-1 min-w-0 truncate">
                    <MapPin className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                    <span
                      data-testid={`crew-location-${slot.characterId}`}
                      className="truncate"
                    >
                      {slot.zoneAr}
                      {slot.streetAr && slot.streetAr !== slot.zoneAr
                        ? ` · ${slot.streetAr}`
                        : ''}
                    </span>
                  </span>
                  <span className="font-mono-num text-[9px] text-stone-500 shrink-0">
                    {Math.round(slot.x)},{Math.round(slot.z)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
