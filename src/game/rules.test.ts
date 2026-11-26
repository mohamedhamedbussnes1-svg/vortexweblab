import test from 'node:test';
import assert from 'node:assert/strict';
import type { OnlineRoomMember } from './types';
import {
  CITY_SHOPS,
  CITY_STREETS,
  DISTRICTS,
  getStreetContext,
} from './cityLayout';
import {
  accrueShopProfits,
  buyCityShop,
  canAddIngredient,
  CAREER_JOBS,
  clampDensitySettings,
  clampToPlayableWorld,
  collectAllShopProfits,
  computeDailySummary,
  computeReputationDelta,
  computeSunElevation,
  computeTaxiFare,
  computeTipBonus,
  consumeIngredients,
  createInitialCityShops,
  createInitialInventory,
  createInitialSave,
  evaluateAdaptiveQuality,
  formatGameClock,
  generateCustomerOrder,
  getDayPeriod,
  getLowStockIngredients,
  haveChild,
  hireShopManager,
  marryNpc,
  matchesOrder,
  PLAYER_CHARACTERS,
  resolveCircleAABB,
  restockIngredient,
  buyApartment,
  buyVehicle,
  canAccessCityManagement,
  canHaveChildNow,
  canPerformFixedRoleAction,
  CHILD_WAIT_SECONDS,
  getPlayerLifeStage,
  ROMANCE_NPCS,
} from './rules';
import {
  createCustomerDialogueSession,
  createInitialDialogueSession,
  evaluateCustomerServiceState,
  resolveDialogueChoice,
} from './social';
import { SCHOOL_CAMPUSES } from './cityLayout';
import {
  computeDiscountedGoodCost,
  createInitialHouseholdFamily,
  generateRandomStreetEvent,
  getVisibleHouseholdFamily,
  HOUSEHOLD_WAYPOINTS,
  pickHouseholdActivity,
  resolveStreetEventReward,
  tickRandomStreetEvent,
} from './events';
import {
  checkRedLightViolation,
  checkSpeedBumpImpact,
  computeDynamicPackCost,
  computeSizzleBonus,
  generateDailyMarketForecast,
  getTrafficSignalPhase,
  isGoldenSizzleWindow,
} from './worldSystems';

test('sandwich recipe matching requires exact ingredients and bread first', () => {
  const inv = createInitialInventory();

  const noBread = canAddIngredient([], 'ful', inv);
  assert.equal(noBread.ok, false);

  const pickBread = canAddIngredient([], 'bread', inv);
  assert.equal(pickBread.ok, true);

  assert.equal(matchesOrder(['bread', 'ful', 'tahina'], 'ful_tahina'), true);
  assert.equal(matchesOrder(['bread', 'tahina', 'ful'], 'ful_tahina'), true);
  assert.equal(matchesOrder(['bread', 'ful'], 'ful_tahina'), false);
  assert.equal(
    matchesOrder(['bread', 'ful', 'tahina', 'salad'], 'ful_tahina'),
    false,
  );
});

test('inventory consumption and market restocking enforce stock and money bounds', () => {
  let inv = createInitialInventory();
  inv = consumeIngredients(inv, ['bread', 'ful', 'tahina']);
  assert.equal(inv.bread, 23);
  assert.equal(inv.ful, 19);
  assert.equal(inv.tahina, 15);

  inv.salad = 2;
  const low = getLowStockIngredients(inv);
  assert.equal(low.includes('salad'), true);

  const failed = restockIngredient(5, inv, 'bread');
  assert.equal(failed.ok, false);
  assert.equal(failed.inventory.bread, 23);

  const success = restockIngredient(100, inv, 'bread');
  assert.equal(success.ok, true);
  assert.equal(success.money, 70);
  assert.equal(success.inventory.bread, 38);
});

test('reputation, tips, and daily summary calculate accurately', () => {
  const repGood = computeReputationDelta(true, 0.8, 15, 15);
  assert.equal(repGood > 0, true);

  const repBad = computeReputationDelta(false, 0, 15, 15);
  assert.equal(repBad < 0, true);

  const tipCashier = computeTipBonus(0.8, 85, 2, 'cashier');
  const tipFryer = computeTipBonus(0.8, 85, 2, 'fryer');
  assert.equal(tipCashier > tipFryer, true);

  const summary = computeDailySummary({
    day: 1,
    revenue: 320,
    expenses: 90,
    ordersServed: 10,
    ordersMissed: 0,
    deliveriesCompleted: 2,
    tipsEarned: 25,
    taxiTrips: 1,
    repairsDone: 0,
    sideJobIncome: 40,
    shopDividends: 50,
  });
  assert.equal(summary.netProfit, 230);
});

test('customer order generator yields valid Egyptian orders', () => {
  const order = generateCustomerOrder('ord-1', 70, true, () => 0.1);
  assert.equal(order.id, 'ord-1');
  assert.equal(order.isDelivery, true);
  assert.ok(order.dialogueAr.length > 5);
  assert.ok(order.deliveryTargetName);
});

test('day period, clock formatting, and sun elevation curve', () => {
  assert.equal(getDayPeriod(0.3), 'morning');
  assert.equal(getDayPeriod(0.5), 'noon');
  assert.equal(getDayPeriod(0.7), 'afternoon');
  assert.equal(getDayPeriod(0.8), 'evening');
  assert.equal(getDayPeriod(0.95), 'night');
  assert.equal(formatGameClock(0.5), '12:00');
  assert.ok(computeSunElevation(0.5) > 0.9);
  assert.ok(computeSunElevation(0.0) < -0.9);
});

test('collision resolution pushes out of closed doors and skips open doors', () => {
  const boxes = [
    { minX: 5, maxX: 10, minZ: 5, maxZ: 10, active: true },
    { minX: -2, maxX: 2, minZ: -2, maxZ: 2, active: false },
  ];
  const pushed = resolveCircleAABB(4.7, 7.5, 0.6, boxes);
  assert.ok(pushed.x <= 4.4 + 1e-4);
  assert.equal(pushed.z, 7.5);

  const freeWalk = resolveCircleAABB(0, 0, 0.5, boxes);
  assert.equal(freeWalk.x, 0);
  assert.equal(freeWalk.z, 0);

  const clamped = clampToPlayableWorld(999, -999, 36, 36);
  assert.equal(clamped.x, 36);
  assert.equal(clamped.z, -36);
});

test('adaptive quality scales gracefully without rapid oscillation', () => {
  assert.equal(evaluateAdaptiveQuality('ultra', 20, true), 'medium');
  assert.equal(evaluateAdaptiveQuality('medium', 40, true), 'medium');
  assert.equal(evaluateAdaptiveQuality('low', 58, true), 'medium');
  assert.equal(evaluateAdaptiveQuality('ultra', 15, false), 'ultra');
});

test('4-player co-op roster defines distinct characters and roles', () => {
  const ids = Object.keys(PLAYER_CHARACTERS);
  assert.equal(ids.length, 4);
  const roles = new Set(Object.values(PLAYER_CHARACTERS).map((c) => c.roleId));
  assert.equal(roles.size, 4);
  const save = createInitialSave();
  assert.equal(save.selectedCharacterId, 'mohamed');
});

test('city layout defines 98 named streets across 6 districts, schools, and 15 open shops with workers', () => {
  assert.equal(CITY_STREETS.length, 98);
  const uniqueStreetNames = new Set(CITY_STREETS.map((s) => s.nameAr));
  assert.equal(uniqueStreetNames.size, 98);

  const coveredDistricts = new Set(CITY_STREETS.map((s) => s.districtId));
  assert.equal(coveredDistricts.size, Object.keys(DISTRICTS).length);

  const haraCtx = getStreetContext(0, 0);
  assert.equal(haraCtx.district.id, 'hara');
  assert.equal(haraCtx.street.nameAr, 'شارع المعلم الرئيسي');

  const cornicheCtx = getStreetContext(0, -72);
  assert.equal(cornicheCtx.district.id, 'corniche');

  assert.equal(SCHOOL_CAMPUSES.length, 2);
  assert.equal(CITY_SHOPS.length, 15);
  for (const s of CITY_SHOPS) {
    assert.ok(s.ownerNameAr.length > 2);
    assert.ok(s.workerNameAr.length > 2);
    assert.ok(s.purchasePrice > 0);
    assert.ok(s.dailyRevenue > 0);
  }
});

test('shop ownership, manager hiring, profit accrual, and taxi fare math work cleanly', () => {
  let shops = createInitialCityShops();
  let money = 600;

  const failBuy = buyCityShop(money, shops, 'shop-realestate');
  assert.equal(failBuy.ok, false);

  const okBuy = buyCityShop(money, shops, 'shop-kiosk');
  assert.equal(okBuy.ok, true);
  money = okBuy.money;
  shops = okBuy.shops;
  assert.equal(money, 360);

  const mgr = hireShopManager(money, shops, 'shop-kiosk');
  assert.equal(mgr.ok, true);
  assert.equal(mgr.cost, 96);
  money = mgr.money;
  shops = mgr.shops;

  shops = accrueShopProfits(shops, 0.5);
  const collected = collectAllShopProfits(money, shops);
  assert.equal(collected.totalCollected, 21);
  assert.equal(collected.money, money + 21);

  const fareShort = computeTaxiFare(15, 65);
  const fareLong = computeTaxiFare(95, 85);
  assert.ok(fareLong > fareShort);

  const clamped = clampDensitySettings({
    pedestrianDensity: 150,
    trafficDensity: -20,
    propDensity: 45.6,
  });
  assert.deepEqual(clamped, {
    pedestrianDensity: 100,
    trafficDensity: 0,
    propDensity: 46,
  });
  assert.equal(Object.keys(CAREER_JOBS).length, 6);
});

test('vehicles, apartments, romance flirting, marriage, and children progression work accurately', () => {
  const save = createInitialSave();
  let money = 2000;

  // Buy a vehicle
  const carRes = buyVehicle(money, save.ownedVehicleIds, 'taxi_verna');
  assert.equal(carRes.ok, true);
  money = carRes.money;
  assert.equal(carRes.ownedVehicleIds.includes('taxi_verna'), true);

  // Cannot marry before buying apartment
  const highAffStates = save.romanceStates.map((r, i) =>
    i === 0 ? { ...r, affection: 80 } : r,
  );
  const noAptMarry = marryNpc(money, [], highAffStates, ROMANCE_NPCS[0].id);
  assert.equal(noAptMarry.ok, false);

  // Fixed house apt_hara is owned from Day 1; upgrading to an extra apartment works too
  assert.equal(save.ownedApartmentIds.includes('apt_hara'), true);
  const aptRes = buyApartment(money, [], 'apt_hara');
  assert.equal(aptRes.ok, true);
  const extraAptRes = buyApartment(money, save.ownedApartmentIds, 'apt_schools');
  assert.equal(extraAptRes.ok, true);
  money = extraAptRes.money;

  const marryOk = marryNpc(money, aptRes.ownedApartmentIds, highAffStates, ROMANCE_NPCS[0].id);
  assert.equal(marryOk.ok, true);
  assert.equal(marryOk.spouseId, ROMANCE_NPCS[0].id);
  money = marryOk.money;

  const childOk = haveChild(money, marryOk.spouseId, []);
  assert.equal(childOk.ok, true);
  assert.equal(childOk.children.length, 1);

  // Dialogue flirting raises affection & yields Arabic response
  const session = createInitialDialogueSession('romance', ROMANCE_NPCS[1].id, {
    money: 500,
    reputation: 70,
    activeVehicleId: 'taxi_verna',
    ownedApartmentIds: aptRes.ownedApartmentIds,
    spouseId: null,
    children: [],
    romanceStates: save.romanceStates,
  });
  assert.ok(session.choices.length >= 4);
  const reply = resolveDialogueChoice(session, session.choices[0], {
    money: 500,
    reputation: 70,
    activeVehicleId: 'taxi_verna',
    ownedApartmentIds: aptRes.ownedApartmentIds,
    spouseId: null,
    children: [],
    romanceStates: save.romanceStates,
  });
  assert.ok(reply.affectionDelta > 0);
  assert.ok(reply.replyAr.length > 5);
});

test('random street events spawn, tick, apply flash-sale discounts, and reward resolution', () => {
  const fight = generateRandomStreetEvent('ev-1', () => 0.2, 'street_fight');
  assert.equal(fight.type, 'street_fight');
  assert.ok(fight.rewardMoney > 0 && fight.rewardRep > 0);

  const ticked = tickRandomStreetEvent(fight, 10);
  assert.ok(ticked && ticked.timeRemaining === fight.maxTime - 10);
  assert.equal(tickRandomStreetEvent(fight, 999), null);

  const resFight = resolveStreetEventReward(fight);
  assert.equal(resFight.moneyGain, fight.rewardMoney);
  assert.ok(resFight.toastAr.length > 5);

  const sale = generateRandomStreetEvent('ev-2', () => 0.1, 'flash_sale');
  assert.equal(sale.type, 'flash_sale');
  assert.ok(sale.shopId && sale.discountPct === 35);
  assert.equal(computeDiscountedGoodCost(100, sale.shopId!, sale), 65);
  assert.equal(computeDiscountedGoodCost(100, 'other-shop', sale), 100);
});

test('household family AI schedules rooms and supports interactive Egyptian family dialogues', () => {
  const roster = createInitialHouseholdFamily();
  assert.equal(roster.length, 3);
  assert.deepEqual(
    roster.map((m) => m.id),
    ['home-wife', 'home-daughter', 'home-son'],
  );

  const nextWife = pickHouseholdActivity('home-wife', 0.45, 2);
  assert.ok(HOUSEHOLD_WAYPOINTS[nextWife.activity]);
  assert.ok(nextWife.speechAr.length > 5);

  const session = createInitialDialogueSession('household_wife', 'home-wife', {
    money: 500,
    reputation: 70,
    activeVehicleId: 'fiat_128',
    ownedApartmentIds: [],
    spouseId: null,
    children: [],
    romanceStates: [],
  });
  assert.equal(session.speakerNameAr, 'أمينة');
  assert.ok(session.choices.length >= 3);
  const giftChoice = session.choices.find((c) => c.tone === 'gift')!;
  const outcome = resolveDialogueChoice(session, giftChoice, {
    money: 500,
    reputation: 70,
    activeVehicleId: 'fiat_128',
    ownedApartmentIds: [],
    spouseId: null,
    children: [],
    romanceStates: [],
  });
  assert.ok(outcome.reputationDelta > 0);
  assert.equal(outcome.moneyDelta, -(giftChoice.cost ?? 0));
});

test('traffic lights, speed bumps, golden sizzle, dynamic market, wedding feast, and ride invite work cleanly', () => {
  assert.equal(getTrafficSignalPhase(2), 'ns_green');
  assert.equal(getTrafficSignalPhase(8.5), 'ns_yellow');
  assert.equal(getTrafficSignalPhase(12), 'ew_green');
  assert.equal(getTrafficSignalPhase(18.5), 'ew_yellow');

  // Running NS red light at 45 km/h triggers fine; EW green does not
  const nsFine = checkRedLightViolation(0, -11.5, 0, 45, 'ew_green', 0);
  assert.equal(nsFine.violated, true);
  assert.equal(nsFine.fine, 35);
  const nsLegal = checkRedLightViolation(0, -11.5, 0, 45, 'ns_green', 0);
  assert.equal(nsLegal.violated, false);

  // Speed bump impact
  const bumpFast = checkSpeedBumpImpact(0, -6.0, 0, -5.0, 60);
  assert.equal(bumpFast.hit, true);
  assert.equal(bumpFast.tooFast, true);
  assert.ok(bumpFast.conditionDamage > 0);

  const bumpSlow = checkSpeedBumpImpact(0, -6.0, 0, -5.0, 22);
  assert.equal(bumpSlow.hit, true);
  assert.equal(bumpSlow.tooFast, false);
  assert.equal(bumpSlow.conditionDamage, 0);

  // Golden sizzle window & role bonus
  assert.equal(isGoldenSizzleWindow(3.0), true);
  assert.equal(isGoldenSizzleWindow(0.5), false);
  assert.ok(computeSizzleBonus(true, 'fryer') > computeSizzleBonus(true, 'assembler'));
  assert.equal(computeSizzleBonus(false, 'fryer'), 0);

  // Daily dynamic market forecast
  const forecast = generateDailyMarketForecast(2, () => 0.35);
  assert.notEqual(forecast.dealIngredientId, forecast.shortageIngredientId);
  assert.ok(
    computeDynamicPackCost(forecast.dealIngredientId, forecast) <
      computeDynamicPackCost(forecast.shortageIngredientId, forecast),
  );

  // Wedding feast event & companion ride dialogue
  const wedding = generateRandomStreetEvent('ev-w', () => 0.1, 'wedding_feast');
  assert.equal(wedding.type, 'wedding_feast');
  assert.ok(wedding.rewardMoney >= 100);
  assert.ok(resolveStreetEventReward(wedding).toastAr.includes('الفرح'));

  const wifeSession = createInitialDialogueSession('household_wife', 'home-wife', {
    money: 500,
    reputation: 70,
    activeVehicleId: 'fiat_128',
    ownedApartmentIds: [],
    spouseId: null,
    children: [],
    romanceStates: [],
  });
  const rideChoice = wifeSession.choices.find((c) => c.tone === 'ride');
  assert.ok(rideChoice);
  const rideRes = resolveDialogueChoice(wifeSession, rideChoice!, {
    money: 500,
    reputation: 70,
    activeVehicleId: 'fiat_128',
    ownedApartmentIds: [],
    spouseId: null,
    children: [],
    romanceStates: [],
  });
  assert.equal(rideRes.triggerRide, true);
});

test('dynamic customer expressions, praise, complaint, and hospitality affect shop reputation', () => {
  const ctx = {
    money: 500,
    reputation: 60,
    activeVehicleId: 'fiat_128' as const,
    ownedApartmentIds: [],
    spouseId: null,
    children: [],
    romanceStates: [],
  };

  const greatEval = evaluateCustomerServiceState({
    archetype: 'regular',
    patienceRatio: 0.9,
    chargedPrice: 15,
    basePrice: 15,
    decorLevel: 2,
    goldenSizzle: true,
    served: true,
  });
  assert.ok(greatEval.score >= 85);
  assert.equal(greatEval.emoji, '🤩');
  assert.equal(greatEval.moodTone, 'happy');
  assert.equal(greatEval.facialExpression, 'happy');
  assert.equal(greatEval.animPose, 'wave');

  const poorEval = evaluateCustomerServiceState({
    archetype: 'rushed',
    patienceRatio: 0.12,
    chargedPrice: 30,
    basePrice: 15,
    decorLevel: 1,
    served: false,
  });
  assert.ok(poorEval.score < 30);
  assert.equal(poorEval.emoji, '😡');
  assert.equal(poorEval.moodTone, 'upset');
  assert.equal(poorEval.facialExpression, 'angry');
  assert.equal(poorEval.animPose, 'argue');

  const happySession = createCustomerDialogueSession({
    targetId: 'cust-1',
    customerName: 'عم صابر',
    archetype: 'regular',
    recipeNameAr: 'سندوتش فول سادة',
    served: true,
    serviceEval: greatEval,
  });
  assert.equal(happySession.targetType, 'customer');
  const praiseChoice = happySession.choices.find((c) => c.tone === 'praise');
  assert.ok(praiseChoice);
  const praiseRes = resolveDialogueChoice(happySession, praiseChoice!, ctx);
  assert.ok(praiseRes.reputationDelta >= 4);
  assert.equal(praiseRes.feedbackKind, 'praise');
  assert.equal(praiseRes.customerExpression, 'happy');
  assert.equal(praiseRes.customerAnim, 'wave');

  const upsetSession = createCustomerDialogueSession({
    targetId: 'cust-2',
    customerName: 'الأستاذ طارق',
    archetype: 'rushed',
    recipeNameAr: 'سندوتش طعمية',
    served: false,
    serviceEval: poorEval,
  });
  const complaintChoice = upsetSession.choices.find((c) => c.tone === 'complaint');
  assert.ok(complaintChoice);
  const complaintRes = resolveDialogueChoice(upsetSession, complaintChoice!, ctx);
  assert.ok(complaintRes.reputationDelta <= -4);
  assert.equal(complaintRes.feedbackKind, 'complaint');
  assert.equal(complaintRes.customerExpression, 'angry');
  assert.equal(complaintRes.customerAnim, 'argue');

  const hospitalityChoice = upsetSession.choices.find((c) => c.tone === 'hospitality');
  assert.ok(hospitalityChoice);
  const hospitalityRes = resolveDialogueChoice(upsetSession, hospitalityChoice!, ctx);
  assert.equal(hospitalityRes.moneyDelta, -10);
  assert.equal(hospitalityRes.reputationDelta, 2);
  assert.equal(hospitalityRes.hospitalityRestoresPatience, true);
  assert.equal(hospitalityRes.customerExpression, 'happy');
});

test('fixed house single-start, life-stage progression, household visibility, and delayed childbirth work accurately', () => {
  const save = createInitialSave();
  assert.equal(save.spouseId, null);
  assert.deepEqual(save.ownedApartmentIds, ['apt_hara']);
  assert.equal(save.activeApartmentId, 'apt_hara');
  assert.deepEqual(save.children, []);

  const roster = createInitialHouseholdFamily();
  assert.equal(getVisibleHouseholdFamily(roster, null, []).length, 0);
  assert.equal(getPlayerLifeStage(save.romanceStates, null, []), 'single');

  const courtingStates = save.romanceStates.map((r, i) =>
    i === 0 ? { ...r, talkCount: 1, affection: 40 } : r,
  );
  assert.equal(getPlayerLifeStage(courtingStates, null, []), 'courting');

  const highAff = save.romanceStates.map((r, i) =>
    i === 0 ? { ...r, talkCount: 4, affection: 85 } : r,
  );
  const married = marryNpc(900, save.ownedApartmentIds, highAff, ROMANCE_NPCS[0].id);
  assert.equal(married.ok, true);
  assert.equal(getPlayerLifeStage(married.romanceStates, married.spouseId, []), 'married');

  const visibleWifeOnly = getVisibleHouseholdFamily(
    roster,
    married.spouseId,
    [],
    ROMANCE_NPCS[0].nameAr,
  );
  assert.equal(visibleWifeOnly.length, 1);
  assert.equal(visibleWifeOnly[0].id, 'home-wife');
  assert.equal(visibleWifeOnly[0].nameAr, ROMANCE_NPCS[0].nameAr);

  // Immediately after marrying on day 1, childbirth is locked until CHILD_WAIT_SECONDS or next day
  const waitCheck = canHaveChildNow(married.spouseId, [], 1, 1, 5);
  assert.equal(waitCheck.eligible, false);
  assert.equal(waitCheck.waitRemainingSec, CHILD_WAIT_SECONDS - 5);

  const tooEarly = haveChild(600, married.spouseId, [], {
    currentDay: 1,
    marriedDay: 1,
    marriageElapsedSec: 5,
  });
  assert.equal(tooEarly.ok, false);

  // Unlocks after CHILD_WAIT_SECONDS on same day or on day > marriedDay
  const unlockedByTime = haveChild(600, married.spouseId, [], {
    currentDay: 1,
    marriedDay: 1,
    marriageElapsedSec: CHILD_WAIT_SECONDS,
  });
  assert.equal(unlockedByTime.ok, true);
  assert.equal(unlockedByTime.children.length, 1);
  assert.equal(
    getPlayerLifeStage(married.romanceStates, married.spouseId, unlockedByTime.children),
    'parent',
  );

  const unlockedByDay = canHaveChildNow(married.spouseId, [], 2, 1, 0);
  assert.equal(unlockedByDay.eligible, true);

  const visibleWithChild = getVisibleHouseholdFamily(
    roster,
    married.spouseId,
    unlockedByTime.children,
    ROMANCE_NPCS[0].nameAr,
  );
  assert.equal(visibleWithChild.length, 2);
});

test('fixed multiplayer co-op role locking enforces each friend duty online while remaining open offline', () => {
  const members: OnlineRoomMember[] = [
    {
      clientId: 'p1',
      characterId: 'mohamed',
      roleId: 'assembler',
      displayNameAr: 'محمد',
      connected: true,
      zoneAr: 'محل المعلم',
    },
    {
      clientId: 'p2',
      characterId: 'ali',
      roleId: 'cashier',
      displayNameAr: 'علي',
      connected: true,
      zoneAr: 'محل المعلم',
    },
    {
      clientId: 'p3',
      characterId: 'ahmed',
      roleId: 'fryer',
      displayNameAr: 'أحمد',
      connected: true,
      zoneAr: 'محل المعلم',
    },
    {
      clientId: 'p4',
      characterId: 'mahmoud',
      roleId: 'driver',
      displayNameAr: 'محمود',
      connected: true,
      zoneAr: 'الشارع',
    },
  ];

  // Offline mode allows any action regardless of character
  assert.equal(canPerformFixedRoleAction('ali', false, members, 'manage_shop').allowed, true);
  assert.equal(canPerformFixedRoleAction('ali', false, members, 'cook_kitchen').allowed, true);

  // Online mode locks each duty to its owner
  assert.equal(canPerformFixedRoleAction('mohamed', true, members, 'manage_shop').allowed, true);
  assert.equal(canPerformFixedRoleAction('ali', true, members, 'manage_shop').allowed, false);
  assert.equal(canPerformFixedRoleAction('ali', true, members, 'serve_cashier').allowed, true);
  assert.equal(canPerformFixedRoleAction('mohamed', true, members, 'serve_cashier').allowed, false);
  assert.equal(canPerformFixedRoleAction('ahmed', true, members, 'cook_kitchen').allowed, true);
  assert.equal(canPerformFixedRoleAction('mahmoud', true, members, 'cook_kitchen').allowed, false);
  assert.equal(canPerformFixedRoleAction('mahmoud', true, members, 'drive_delivery').allowed, true);
  assert.equal(canPerformFixedRoleAction('ahmed', true, members, 'drive_delivery').allowed, false);

  // City & shop administration is strictly restricted to Mohamed only (both offline and online)
  assert.equal(canAccessCityManagement('mohamed'), true);
  assert.equal(canAccessCityManagement('ahmed'), false);
  assert.equal(canAccessCityManagement('ali'), false);
  assert.equal(canAccessCityManagement('mahmoud'), false);
});

