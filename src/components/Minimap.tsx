import React from 'react';
import {
  CITY_SHOPS,
  EW_ROADS_Z,
  NS_ROADS_X,
  SCHOOL_CAMPUSES,
} from '../game/cityLayout';
import {
  ActiveStreetEvent,
  ActiveTaxiMission,
  CityShopRuntimeState,
  CustomerOrder,
} from '../game/types';

interface MinimapProps {
  playerPos: { x: number; z: number };
  playerYaw: number;
  carPos: { x: number; z: number };
  inCar: boolean;
  orders: CustomerOrder[];
  cityShops: CityShopRuntimeState[];
  activeTaxi: ActiveTaxiMission | null;
  activeStreetEvent: ActiveStreetEvent | null;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerPos,
  playerYaw,
  carPos,
  inCar,
  orders,
  cityShops,
  activeTaxi,
  activeStreetEvent,
}) => {
  // Player-centered scrolling GPS radar
  const scale = 1.1;
  const toRelX = (wx: number) => 50 + (wx - playerPos.x) * scale;
  const toRelY = (wz: number) => 50 + (wz - playerPos.z) * scale;

  const headingDeg = (-playerYaw * 180) / Math.PI;
  const activeDelivery = orders.find(
    (o) => o.isDelivery && o.deliveryX !== undefined && o.deliveryZ !== undefined,
  );

  return (
    <div
      className="relative w-16 h-16 sm:w-28 sm:h-28 rounded-full border-2 border-amber-400/75 shadow-xl overflow-hidden shrink-0"
      style={{ backgroundColor: '#15191f' }}
      aria-label="خريطة المدينة المصغرة"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* City background */}
        <rect width="100" height="100" fill="#1e242c" />

        {/* Nile River strip along northern corniche (Z < -108) */}
        <rect
          x={-200}
          y={toRelY(-158)}
          width={500}
          height={50 * scale}
          fill="#0c4a6e"
          opacity={0.9}
        />

        {/* 7 North-South Avenues */}
        {NS_ROADS_X.map((rx) => (
          <g key={`ns-${rx}`}>
            <rect
              x={toRelX(rx - 4.8)}
              y={toRelY(-108)}
              width={9.6 * scale}
              height={194 * scale}
              fill="#111419"
            />
            {rx === 0 && (
              <line
                x1={toRelX(rx)}
                y1={toRelY(-108)}
                x2={toRelX(rx)}
                y2={toRelY(86)}
                stroke="#f5b400"
                strokeWidth="0.9"
                strokeDasharray="3 3"
                opacity="0.7"
              />
            )}
          </g>
        ))}

        {/* 7 East-West Streets */}
        {EW_ROADS_Z.map((rz) => (
          <rect
            key={`ew-${rz}`}
            x={toRelX(-98)}
            y={toRelY(rz - 4.8)}
            width={196 * scale}
            height={9.6 * scale}
            fill="#111419"
          />
        ))}

        {/* Ful Shop (-13, 0) & Home (+13.5, 0) Hero Markers */}
        <rect
          x={toRelX(-17)}
          y={toRelY(-4.5)}
          width={8 * scale}
          height={9 * scale}
          rx="1.5"
          fill="#d97706"
          stroke="#fde68a"
          strokeWidth="0.9"
        />
        <rect
          x={toRelX(9.2)}
          y={toRelY(-5.3)}
          width={13.1 * scale}
          height={10.6 * scale}
          rx="1.5"
          fill="#38bdf8"
          stroke="#bae6fd"
          strokeWidth="0.9"
        />

        {/* 2 Enterable Schools */}
        {SCHOOL_CAMPUSES.map((sch) => {
          const sx = toRelX(sch.x);
          const sy = toRelY(sch.z);
          if (sx < -12 || sx > 112 || sy < -12 || sy > 112) return null;
          return (
            <rect
              key={sch.id}
              x={sx - 3.6}
              y={sy - 3.6}
              width="7.2"
              height="7.2"
              rx="1.5"
              fill="#3b82f6"
              stroke="#dbeafe"
              strokeWidth="0.8"
            />
          );
        })}

        {/* 15 Neighborhood Open Shops */}
        {CITY_SHOPS.map((shop) => {
          const st = cityShops.find((s) => s.id === shop.id);
          const sx = toRelX(shop.x);
          const sy = toRelY(shop.z);
          if (sx < -6 || sx > 106 || sy < -6 || sy > 106) return null;
          return (
            <circle
              key={shop.id}
              cx={sx}
              cy={sy}
              r="2.6"
              fill={st?.owned ? '#10b981' : shop.signColorHex}
              stroke="#0f172a"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Active Delivery Target */}
        {activeDelivery &&
          activeDelivery.deliveryX !== undefined &&
          activeDelivery.deliveryZ !== undefined && (
            <circle
              cx={toRelX(activeDelivery.deliveryX)}
              cy={toRelY(activeDelivery.deliveryZ)}
              r="4.2"
              fill="#22c55e"
              stroke="#ffffff"
              strokeWidth="1.1"
            />
          )}

        {/* Active Taxi Pickup / Dropoff Pin */}
        {activeTaxi && (
          <circle
            cx={toRelX(activeTaxi.pickedUp ? activeTaxi.dropoffX : activeTaxi.pickupX)}
            cy={toRelY(activeTaxi.pickedUp ? activeTaxi.dropoffZ : activeTaxi.pickupZ)}
            r="4.2"
            fill={activeTaxi.pickedUp ? '#38bdf8' : '#fbbf24'}
            stroke="#ffffff"
            strokeWidth="1.1"
          />
        )}

        {/* Active Random Street Event Beacon */}
        {activeStreetEvent && !activeStreetEvent.resolved && (
          <g>
            <circle
              cx={toRelX(activeStreetEvent.x)}
              cy={toRelY(activeStreetEvent.z)}
              r="4.8"
              fill="#f97316"
              stroke="#fffbeb"
              strokeWidth="1.1"
            />
            <text
              x={toRelX(activeStreetEvent.x)}
              y={toRelY(activeStreetEvent.z) + 2.1}
              textAnchor="middle"
              fontSize="6.5"
              fontWeight="900"
              fill="#111827"
            >
              !
            </text>
          </g>
        )}

        {/* Hero Sedan marker when on foot */}
        {!inCar && (
          <rect
            x={toRelX(carPos.x) - 2.4}
            y={toRelY(carPos.z) - 3.2}
            width="4.8"
            height="6.4"
            rx="1"
            fill="#dc2626"
            stroke="#fecaca"
            strokeWidth="0.8"
          />
        )}

        {/* Center Player Direction Arrow */}
        <g transform={`translate(50, 50) rotate(${headingDeg})`}>
          <circle r="7.5" fill="#f5b400" opacity="0.22" />
          <path
            d="M0 -6.2 L4.6 5.0 L0 2.4 L-4.6 5.0 Z"
            fill="#f5b400"
            stroke="#1a140e"
            strokeWidth="1"
          />
        </g>
      </svg>

      <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-300 leading-none">
        ش
      </span>
    </div>
  );
};
