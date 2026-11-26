import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buyOwnableBuilding,
  buyRestaurantBranch,
  computeAdBoardCustomerBoost,
  computeRealEstateDailyIncome,
  createDefaultAdBoard,
  createDefaultCustomProfiles,
  createDefaultSchoolEnrollment,
  createEmptyConsumedMap,
  createInitialCharacterNeeds,
  createInitialCrewNeeds,
  createInitialEmployeeWallets,
  enrollChildInBenhaSchool,
  getResolvedCharacterProfile,
  getStartingMoneyForCharacter,
  MOHAMED_STARTING_MONEY,
  NON_OWNER_STARTING_MONEY,
  OWNER_DISPLAY_NAME_AR,
  OWNER_ROLE_TITLE_AR,
  restoreNeeds,
  runInventoryAudit,
  SCHOOL_TUITION_COST,
  sendInstaPayTransfer,
  tickCharacterNeeds,
  updateAdBoard,
  updateCustomProfiles,
  upgradeRestaurantFloor,
  verifyOwnerPinLocal,
} from './phoneOs';
import {
  OWNABLE_BUILDINGS,
  REMOTE_CREW_APARTMENT,
  RESTAURANT_BRANCHES,
  SCHOOL_CAMPUSES,
} from './cityLayout';
import { createInitialInventory, createInitialSave, VEHICLE_CATALOG } from './rules';

test('fixed owner Mohamed Hamed starts with 5M and PIN verification works accurately', () => {
  assert.equal(getStartingMoneyForCharacter('mohamed'), 5_000_000);
  assert.equal(MOHAMED_STARTING_MONEY, 5_000_000);
  assert.equal(getStartingMoneyForCharacter('ahmed'), NON_OWNER_STARTING_MONEY);
  assert.equal(getStartingMoneyForCharacter('ali'), 450);
  assert.equal(getStartingMoneyForCharacter('mahmoud'), 450);

  const expectedPin = ['2009', '2011'].join('');
  assert.equal(verifyOwnerPinLocal(expectedPin), true);
  assert.equal(verifyOwnerPinLocal('00000000'), false);
  assert.equal(verifyOwnerPinLocal(''), false);

  const save = createInitialSave('mohamed');
  assert.equal(save.money, 5_000_000);
  assert.equal(save.activeVehicleId, 'pickup');
  assert.equal(save.ownedVehicleIds.includes('delivery_moto'), true);
});

test('custom profiles allow renaming crew & family while locking Mohamed Hamed forever', () => {
  const defaults = createDefaultCustomProfiles();
  const updated = updateCustomProfiles(defaults, {
    ahmed: { nameAr: 'أحمد الشيف', roleTitleAr: 'شيف أول المطبخ' },
    sonNameAr: 'يوسف',
    daughterNameAr: 'مريم الصغيرة',
  });
  assert.equal(getResolvedCharacterProfile('ahmed', updated).nameAr, 'أحمد الشيف');
  assert.equal(getResolvedCharacterProfile('ahmed', updated).roleTitleAr, 'شيف أول المطبخ');
  assert.equal(updated.sonNameAr, 'يوسف');
  assert.equal(updated.daughterNameAr, 'مريم الصغيرة');

  const owner = getResolvedCharacterProfile('mohamed', updated);
  assert.equal(owner.nameAr, OWNER_DISPLAY_NAME_AR);
  assert.equal(owner.roleTitleAr, OWNER_ROLE_TITLE_AR);
});

test('electronic ad board updates cleanly and boosts customer spawn multiplier', () => {
  const board = createDefaultAdBoard();
  const boosted = computeAdBoardCustomerBoost(board);
  assert.equal(boosted.spawnMultiplier > 1.15, true);
  assert.equal(boosted.maxOrdersBonus, 1);

  const updated = updateAdBoard(
    board,
    { active: true, headlineAr: 'خصم الجمعة ٢٥٪', discountPct: 25 },
    '10:30',
  );
  assert.equal(updated.discountPct, 25);
  assert.equal(updated.updatedAtClock, '10:30');

  const disabled = updateAdBoard(updated, { active: false }, '11:00');
  const offBoost = computeAdBoardCustomerBoost(disabled);
  assert.equal(offBoost.spawnMultiplier, 1);
  assert.equal(offBoost.maxOrdersBonus, 0);
});

test('InstaPay salary transfer deducts from Mohamed and credits employee wallet', () => {
  const wallets = createInitialEmployeeWallets();
  const blocked = sendInstaPayTransfer({
    senderCharacterId: 'ahmed',
    senderMoney: 1000,
    wallets,
    toCharacterId: 'ali',
    amount: 200,
    clockStr: '12:00',
    day: 1,
  });
  assert.equal(blocked.ok, false);

  const success = sendInstaPayTransfer({
    senderCharacterId: 'mohamed',
    senderMoney: 5_000_000,
    wallets,
    toCharacterId: 'ahmed',
    amount: 2_500,
    noteAr: 'راتب الشفت الأول',
    clockStr: '12:15',
    day: 1,
  });
  assert.equal(success.ok, true);
  assert.equal(success.senderMoney, 4_997_500);
  assert.equal(success.wallets.ahmed, 2_950);
  assert.equal(success.record?.amount, 2_500);
});

test('inventory audit calculates total units, low-stock items, and estimated value', () => {
  const inv = createInitialInventory();
  inv.bread = 2; // below low threshold
  const consumed = createEmptyConsumedMap();
  consumed.bread = 12;

  const audit = runInventoryAudit({
    inventory: inv,
    consumedToday: consumed,
    clockStr: '14:00',
    day: 2,
    auditorNameAr: OWNER_DISPLAY_NAME_AR,
  });
  assert.equal(audit.lowStockCount >= 1, true);
  assert.equal(audit.totalUnits > 50, true);
  assert.equal(audit.estimatedValue > 100, true);
  assert.equal(audit.consumedToday.bread, 12);
});

test('real estate towers, restaurant floors (1..3), and branches upgrade and earn passive income', () => {
  let money = 5_000_000;
  const fl2 = upgradeRestaurantFloor(money, 1);
  assert.equal(fl2.ok, true);
  assert.equal(fl2.floors, 2);
  money = fl2.money;

  const fl3 = upgradeRestaurantFloor(money, fl2.floors);
  assert.equal(fl3.ok, true);
  assert.equal(fl3.floors, 3);
  money = fl3.money;

  const fl4 = upgradeRestaurantFloor(money, fl3.floors);
  assert.equal(fl4.ok, false);

  const bldRes = buyOwnableBuilding(money, [], OWNABLE_BUILDINGS[0].id);
  assert.equal(bldRes.ok, true);
  assert.equal(bldRes.ownedBuildingIds.length, 1);
  money = bldRes.money;

  const brRes = buyRestaurantBranch(money, [], RESTAURANT_BRANCHES[0].id);
  assert.equal(brRes.ok, true);
  assert.equal(brRes.ownedBranchIds.length, 1);

  const income = computeRealEstateDailyIncome(
    bldRes.ownedBuildingIds,
    brRes.ownedBranchIds,
    fl3.floors,
  );
  assert.equal(
    income,
    OWNABLE_BUILDINGS[0].dailyRentIncome + RESTAURANT_BRANCHES[0].dailyProfit + 9_000,
  );
});

test('Benha school enrollment, universal hunger/thirst, pickup & moto, and remote apartment layout', () => {
  const enroll0 = createDefaultSchoolEnrollment();
  const enrollRes = enrollChildInBenhaSchool(5_000_000, enroll0, 'both', 1);
  assert.equal(enrollRes.ok, true);
  assert.equal(enrollRes.cost, SCHOOL_TUITION_COST * 2);
  assert.equal(enrollRes.enrollment.sonEnrolled, true);
  assert.equal(enrollRes.enrollment.daughterEnrolled, true);

  let needs = createInitialCharacterNeeds();
  const crewNeeds = createInitialCrewNeeds();
  assert.equal(Object.keys(crewNeeds).length, 4);
  needs = tickCharacterNeeds(needs, 20, true);
  assert.equal(needs.hunger < 88, true);
  assert.equal(needs.thirst < 90, true);
  needs = restoreNeeds(needs, 30, 30);
  assert.equal(needs.hunger <= 100 && needs.thirst <= 100, true);

  assert.equal(SCHOOL_CAMPUSES[0].nameAr, 'مدرسة بنها الخاصة');
  assert.equal(REMOTE_CREW_APARTMENT.floorY > 3.0, true);
  assert.equal(Boolean(VEHICLE_CATALOG.delivery_moto), true);
  assert.equal(Boolean(VEHICLE_CATALOG.pickup), true);
});
