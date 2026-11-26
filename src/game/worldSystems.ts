import { INGREDIENTS } from './rules';
import {
  CrewRoleId,
  IngredientId,
  MarketPriceForecast,
  TrafficSignalPhase,
} from './types';

export const TRAFFIC_INTERSECTIONS = [
  { id: 'int-north', x: 0, z: -11.5 },
  { id: 'int-south', x: 0, z: 16.5 },
] as const;

export const SPEED_BUMPS = [
  { id: 'bump-north', x: 0, z: -5.5 },
  { id: 'bump-south', x: 0, z: 10.5 },
] as const;

export function getTrafficSignalPhase(simTimeSec: number): TrafficSignalPhase {
  const cycle = ((simTimeSec % 20) + 20) % 20;
  if (cycle < 7.5) return 'ns_green';
  if (cycle < 10.0) return 'ns_yellow';
  if (cycle < 17.5) return 'ew_green';
  return 'ew_yellow';
}

export function isAxisRedLight(
  phase: TrafficSignalPhase,
  axis: 'ns' | 'ew',
): boolean {
  if (axis === 'ns') {
    return phase === 'ew_green' || phase === 'ew_yellow';
  }
  return phase === 'ns_green' || phase === 'ns_yellow';
}

export function checkRedLightViolation(
  carX: number,
  carZ: number,
  carYaw: number,
  speedKmh: number,
  phase: TrafficSignalPhase,
  cooldownSec: number,
): { violated: boolean; fine: number; axis: 'ns' | 'ew' } {
  if (cooldownSec > 0 || speedKmh < 30) {
    return { violated: false, fine: 0, axis: 'ns' };
  }
  // Heading closer to NS (cosYaw dominant) vs EW (sinYaw dominant)
  const cosAbs = Math.abs(Math.cos(carYaw));
  const sinAbs = Math.abs(Math.sin(carYaw));
  const axis: 'ns' | 'ew' = cosAbs >= sinAbs ? 'ns' : 'ew';

  if (!isAxisRedLight(phase, axis)) {
    return { violated: false, fine: 0, axis };
  }

  for (const inter of TRAFFIC_INTERSECTIONS) {
    const dist = Math.hypot(carX - inter.x, carZ - inter.z);
    if (dist <= 3.6) {
      return { violated: true, fine: 35, axis };
    }
  }
  return { violated: false, fine: 0, axis };
}

export function checkSpeedBumpImpact(
  prevX: number,
  prevZ: number,
  nextX: number,
  nextZ: number,
  speedKmh: number,
): { hit: boolean; tooFast: boolean; conditionDamage: number } {
  if (speedKmh < 12) {
    return { hit: false, tooFast: false, conditionDamage: 0 };
  }
  for (const bump of SPEED_BUMPS) {
    if (Math.abs(nextX - bump.x) <= 4.4) {
      const crossed =
        (prevZ <= bump.z && nextZ > bump.z) ||
        (prevZ >= bump.z && nextZ < bump.z);
      if (crossed) {
        const tooFast = speedKmh >= 48;
        return {
          hit: true,
          tooFast,
          conditionDamage: tooFast ? 2.5 : 0,
        };
      }
    }
  }
  return { hit: false, tooFast: false, conditionDamage: 0 };
}

// Golden Sizzle Timing: every 4.2s cycle has a 1.5s hot golden crunch window
export function isGoldenSizzleWindow(simTimeSec: number): boolean {
  const phase = ((simTimeSec % 4.2) + 4.2) % 4.2;
  return phase >= 2.3 && phase <= 3.8;
}

export function computeSizzleBonus(
  isGolden: boolean,
  roleId: CrewRoleId,
): number {
  if (!isGolden) return 0;
  return roleId === 'fryer' ? 7 : 5;
}

// Dynamic Daily Market Prices
export function createDefaultMarketForecast(): MarketPriceForecast {
  return {
    multipliers: {
      bread: 1,
      ful: 1,
      taameya: 1,
      salad: 1,
      tahina: 1,
      pickles: 1,
      fries: 1,
    },
    headlineAr: 'أسعار الجملة مستقرة اليوم في سوق الحارة',
    dealIngredientId: 'bread',
    shortageIngredientId: 'tahina',
  };
}

export function generateDailyMarketForecast(
  day: number,
  randFn: () => number = Math.random,
): MarketPriceForecast {
  const keys = Object.keys(INGREDIENTS) as IngredientId[];
  const dealIdx = Math.floor(((day * 3 + randFn() * keys.length) % keys.length));
  let shortageIdx = Math.floor(((day * 5 + 2 + randFn() * keys.length) % keys.length));
  if (shortageIdx === dealIdx) {
    shortageIdx = (dealIdx + 1) % keys.length;
  }

  const dealId = keys[dealIdx];
  const shortageId = keys[shortageIdx];

  const multipliers: Record<IngredientId, number> = {
    bread: 1,
    ful: 1,
    taameya: 1,
    salad: 1,
    tahina: 1,
    pickles: 1,
    fries: 1,
  };
  multipliers[dealId] = 0.75; // 25% cheaper
  multipliers[shortageId] = 1.3; // 30% pricier

  const headlineAr = `بورصة اليوم: عرض -٢٥٪ على ${INGREDIENTS[dealId].nameAr} · وزيادة ٣٠٪ في ${INGREDIENTS[shortageId].nameAr}`;
  return {
    multipliers,
    headlineAr,
    dealIngredientId: dealId,
    shortageIngredientId: shortageId,
  };
}

export function computeDynamicPackCost(
  ingredient: IngredientId,
  forecast: MarketPriceForecast,
): number {
  const def = INGREDIENTS[ingredient];
  const mult = forecast.multipliers[ingredient] ?? 1;
  return Math.max(5, Math.round(def.unitCost * def.packSize * mult));
}
