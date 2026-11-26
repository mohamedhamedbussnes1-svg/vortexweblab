import assert from 'node:assert/strict';
import test from 'node:test';
import {
  acceptDeliveryOrder,
  applyWholesaleDailySupply,
  buyApartmentFurniture,
  buyCornicheVilla,
  celebrateSchoolHonorCeremony,
  completeDeliveryOrder,
  CORNICHE_VILLA_PRICE,
  createDefaultSchoolReportCard,
  createInitialCrewLeaderboard,
  EGYPTIAN_SEASONS,
  generateDeliveryDispatchBatch,
  getContractDiscountFactor,
  getSeasonModifiers,
  getSortedCrewLeaderboard,
  getSuggestedSeasonForDay,
  recordCrewChallengePoint,
  runHygieneInspection,
  sanitizeAndCleanShop,
  signWholesaleContract,
  tickDeliveryOrders,
} from './expansionSystems.ts';
import { createDefaultSchoolEnrollment } from './phoneOs.ts';
import { createInitialSave } from './rules.ts';

test('Egyptian seasons define rush & tip multipliers and rotate cleanly by day', () => {
  assert.equal(EGYPTIAN_SEASONS.ramadan.customerRushMultiplier > 1.4, true);
  assert.equal(getSeasonModifiers('eid_feast').tipMultiplier, 1.5);
  assert.equal(getSuggestedSeasonForDay(1), 'normal');
  assert.equal(getSuggestedSeasonForDay(2), 'match_day');
  assert.equal(getSuggestedSeasonForDay(3), 'ramadan');
  assert.equal(getSuggestedSeasonForDay(4), 'eid_feast');
});

test('online motorcycle delivery dispatch generates 98-street orders, accepts once, and pays moto bonus', () => {
  const batch = generateDeliveryDispatchBatch(4, 1);
  assert.equal(batch.length, 4);
  const first = batch[0];
  const accepted = acceptDeliveryOrder(batch, first.id);
  assert.equal(accepted.ok, true);
  assert.equal(accepted.activeOrder?.status, 'active');

  // Cannot accept a second concurrent delivery while one is active
  const secondTry = acceptDeliveryOrder(accepted.orders, batch[1].id);
  assert.equal(secondTry.ok, false);

  // Moto completion awards full motoTipBonus * season multiplier
  const completedMoto = completeDeliveryOrder({
    orders: accepted.orders,
    orderId: first.id,
    vehicleId: 'delivery_moto',
    seasonId: 'ramadan',
  });
  assert.equal(completedMoto.ok, true);
  assert.equal(completedMoto.payout, first.payout);
  assert.equal(completedMoto.totalEarned > first.payout, true);
  assert.equal(completedMoto.orders.length, 3);

  // Expiration removes timed-out active orders cleanly
  const ticked = tickDeliveryOrders(accepted.orders, 500);
  assert.equal(ticked.expiredOrder?.id, first.id);
  assert.equal(ticked.orders.length, 3);
});

test('wholesale contracts cut unit costs, add morning stock, and hygiene inspection awards/fines accurately', () => {
  const save = createInitialSave('mohamed');
  const signed = signWholesaleContract(save.money, [], 'bakery_baladi');
  assert.equal(signed.ok, true);
  assert.equal(getContractDiscountFactor(signed.contracts, 'bread'), 0.7);

  const restocked = applyWholesaleDailySupply(save.inventory, signed.contracts);
  assert.equal(restocked.bread, save.inventory.bread + 12);

  const passInsp = runHygieneInspection({
    hygieneScore: 95,
    inventory: restocked,
    day: 2,
    clockStr: '11:00',
  });
  assert.equal(passInsp.record.passed, true);
  assert.equal(passInsp.qualityBadgeEarned, true);
  assert.equal(passInsp.record.moneyDelta, 1200);

  const failInsp = runHygieneInspection({
    hygieneScore: 55,
    inventory: restocked,
    day: 2,
    clockStr: '14:00',
  });
  assert.equal(failInsp.record.passed, false);
  assert.equal(failInsp.record.moneyDelta, -450);

  const cleaned = sanitizeAndCleanShop(5000, 55);
  assert.equal(cleaned.ok, true);
  assert.equal(cleaned.hygieneScore, 100);
});

test('Benha school honor ceremony, apartment furniture, and Corniche Villa upgrade state cleanly', () => {
  let enrollment = createDefaultSchoolEnrollment();
  const report = createDefaultSchoolReportCard();
  const notEnrolled = celebrateSchoolHonorCeremony({
    enrollment,
    report,
    day: 1,
    ownedFurnitureIds: [],
  });
  assert.equal(notEnrolled.ok, false);

  enrollment = { ...enrollment, sonEnrolled: true, daughterEnrolled: true };
  const furnRes = buyApartmentFurniture(5_000_000, [], 'kids_modern_room');
  assert.equal(furnRes.ok, true);

  const ceremony = celebrateSchoolHonorCeremony({
    enrollment,
    report,
    day: 1,
    ownedFurnitureIds: furnRes.owned,
  });
  assert.equal(ceremony.ok, true);
  assert.equal(ceremony.report.sonScore, 91);
  assert.equal(ceremony.moneyBonus, 2500);

  const villaRes = buyCornicheVilla(furnRes.money, false);
  assert.equal(villaRes.ok, true);
  assert.equal(villaRes.money, furnRes.money - CORNICHE_VILLA_PRICE);
});

test('crew challenge leaderboard accumulates points and sorts top performer first', () => {
  let board = createInitialCrewLeaderboard();
  board = recordCrewChallengePoint(board, 'ahmed', 'cook', 20);
  board = recordCrewChallengePoint(board, 'mahmoud', 'delivery', 45);
  const sorted = getSortedCrewLeaderboard(board);
  assert.equal(sorted[0].characterId, 'mahmoud');
  assert.equal(sorted[0].deliveriesCompleted, 1);
  assert.equal(sorted[1].characterId, 'ahmed');
});
