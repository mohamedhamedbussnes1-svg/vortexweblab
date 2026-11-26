import React from 'react';
import { Fuel } from 'lucide-react';

interface SpeedometerProps {
  speedKmh: number;
  fuel: number;
  onExitCar: () => void;
}

export const Speedometer: React.FC<SpeedometerProps> = ({
  speedKmh,
  fuel,
  onExitCar,
}) => {
  const maxSpeed = 120;
  const clamped = Math.max(0, Math.min(maxSpeed, speedKmh));
  const ratio = clamped / maxSpeed;
  // Arc sweeps from -135 deg to +135 deg (270 deg total)
  const needleAngle = -135 + ratio * 270;

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const arcTotal = circumference * (270 / 360);
  const arcFilled = arcTotal * ratio;

  return (
    <div
      className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-amber-400/35 shadow-xl pointer-events-auto"
      style={{ backgroundColor: 'rgba(18, 15, 13, 0.9)' }}
    >
      {/* Analog + Digital Dial */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg viewBox="0 0 110 110" className="w-full h-full">
          {/* Outer bezel */}
          <circle
            cx="55"
            cy="55"
            r="51"
            fill="#14110f"
            stroke="#443b31"
            strokeWidth="2"
          />
          {/* Background track arc */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="#2f2a24"
            strokeWidth="7"
            strokeDasharray={`${arcTotal} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(135 55 55)"
          />
          {/* Active speed arc */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke={clamped > 85 ? '#ef4444' : '#f5b400'}
            strokeWidth="7"
            strokeDasharray={`${arcFilled} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(135 55 55)"
          />
          {/* Tick marks */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const ang = ((-135 + t * 270 - 90) * Math.PI) / 180;
            const x1 = 55 + Math.cos(ang) * 35;
            const y1 = 55 + Math.sin(ang) * 35;
            const x2 = 55 + Math.cos(ang) * 40;
            const y2 = 55 + Math.sin(ang) * 40;
            return (
              <line
                key={t}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#d6cfc7"
                strokeWidth="1.6"
                opacity="0.7"
              />
            );
          })}
          {/* Speed needle */}
          <g transform={`translate(55, 55) rotate(${needleAngle})`}>
            <polygon points="-2,4 0,-36 2,4" fill="#ef4444" />
            <circle cx="0" cy="0" r="4.5" fill="#f5b400" />
          </g>
        </svg>

        {/* Center digital KM/H */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 pointer-events-none">
          <span
            data-testid="hud-speed-kmh"
            className="font-mono-num text-2xl font-extrabold text-white leading-none"
          >
            {clamped}
          </span>
          <span className="text-[10px] font-bold tracking-wider text-stone-400">
            KM/H
          </span>
        </div>
      </div>

      {/* Fuel Bar + Exit Action */}
      <div className="w-full flex items-center gap-2 text-[11px]">
        <Fuel className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <div className="flex-1 h-2 rounded-full bg-stone-800 overflow-hidden">
          <div
            className={`h-full transition-all ${
              fuel > 30 ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, fuel))}%` }}
          />
        </div>
        <span className="font-mono-num font-bold text-stone-200">{fuel}%</span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.currentTarget.blur();
          onExitCar();
        }}
        className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-xs font-bold cursor-pointer"
      >
        نزول من السيارة [F]
      </button>
    </div>
  );
};
