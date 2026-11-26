import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import type {
  CashierControllerSettings,
  CharacterNeedsState,
  CityShopRuntimeState,
  CoopChatMessage,
  CrewChallengeScore,
  CrewRoleId,
  CustomProfilesMap,
  EgyptianSeasonId,
  ElectronicAdBoardState,
  FurnitureItemId,
  InspectionRecord,
  InstaPayTransferRecord,
  InventoryState,
  KitchenTicket,
  OnlineRoomMember,
  OwnableBuildingId,
  OwnedVehicleId,
  PlayerAnimSyncState,
  PlayerCharacterId,
  PosExtraItemId,
  PosReceipt,
  RecipeId,
  RestaurantBranchId,
  SchoolEnrollmentState,
  SchoolReportCardState,
  ShiftSettlementRecord,
  ShopUpgrades,
  VipMember,
  WholesaleContractId,
} from './src/game/types.ts';

const ROOMS_SNAPSHOT_PATH = '/tmp/elmoalem-rooms-v2.json';

const PORT = Number(process.env.PORT || 3000);
const OWNER_PIN = process.env.OWNER_PIN || '20092011';
const ROOM_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const VALID_CHARACTERS: PlayerCharacterId[] = ['mohamed', 'ahmed', 'ali', 'mahmoud'];

const CHARACTER_TO_ROLE: Record<PlayerCharacterId, CrewRoleId> = {
  mohamed: 'assembler',
  ahmed: 'fryer',
  ali: 'cashier',
  mahmoud: 'driver',
};

const CHARACTER_NAMES_AR: Record<PlayerCharacterId, string> = {
  mohamed: 'المعلم محمد حامد',
  ahmed: 'أحمد',
  ali: 'علي',
  mahmoud: 'محمود',
};

const CHARACTER_START_ZONE: Record<PlayerCharacterId, { zoneAr: string; streetAr: string; x: number; z: number }> = {
  mohamed: { zoneAr: 'محل المعلم — فول وطعمية', streetAr: 'شارع المعلم الرئيسي', x: -10.8, z: -1.6 },
  ahmed: { zoneAr: 'مطبخ القلاية والفول', streetAr: 'شارع المعلم الرئيسي', x: -12.6, z: 0.4 },
  ali: { zoneAr: 'كاونتر الكاشير', streetAr: 'شارع المعلم الرئيسي', x: -9.8, z: 1.2 },
  mahmoud: { zoneAr: 'ساحة السيارة والتوصيل', streetAr: 'شارع المعلم الرئيسي', x: -3.6, z: 5.6 },
};

export interface SharedRoomGameState {
  day: number;
  money: number;
  reputation: number;
  shopOpen: boolean;
  shopLightsOn: boolean;
  inventory: InventoryState;
  prices: Record<RecipeId, number>;
  extraPrices: Record<PosExtraItemId, number>;
  cashierSettings: CashierControllerSettings;
  cashierReceipts: PosReceipt[];
  nextInvoiceSeq: number;
  vipMembers: VipMember[];
  kitchenTickets: KitchenTicket[];
  shiftSettlements: ShiftSettlementRecord[];
  upgrades: ShopUpgrades;
  cityShops: CityShopRuntimeState[];
  activeVehicleId: OwnedVehicleId;
  ownedVehicleIds: OwnedVehicleId[];
  carFuel: number;
  carCondition: number;
  adBoard: ElectronicAdBoardState;
  employeeWallets: Record<PlayerCharacterId, number>;
  instaPayTransfers: InstaPayTransferRecord[];
  ownedBuildingIds: OwnableBuildingId[];
  restaurantFloors: number;
  ownedBranchIds: RestaurantBranchId[];
  vehicleLockedByOwner: boolean;
  customProfiles: CustomProfilesMap;
  schoolEnrollment: SchoolEnrollmentState;
  crewNeeds: Record<PlayerCharacterId, CharacterNeedsState>;
  activeSeasonId: EgyptianSeasonId;
  wholesaleContracts: WholesaleContractId[];
  hygieneScore: number;
  qualityBadgeEarned: boolean;
  inspectionLogs: InspectionRecord[];
  ownedFurnitureIds: FurnitureItemId[];
  cornicheVillaOwned: boolean;
  schoolReport: SchoolReportCardState;
  crewLeaderboard: Record<PlayerCharacterId, CrewChallengeScore>;
}

interface ConnectedClient {
  clientId: string;
  ws: WebSocket;
  characterId: PlayerCharacterId;
  roleId: CrewRoleId;
  displayNameAr: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  inCar: boolean;
  moving: boolean;
  sprinting: boolean;
  holding: boolean;
  animState?: PlayerAnimSyncState;
  speechText?: string;
  zoneAr: string;
  streetAr: string;
}

interface RoomRecord {
  roomId: string;
  createdAt: number;
  lastActiveAt: number;
  seeded: boolean;
  clients: Map<string, ConnectedClient>;
  sharedState: SharedRoomGameState;
  chatHistory: CoopChatMessage[];
  cleanupTimer: ReturnType<typeof setTimeout> | null;
}

const rooms = new Map<string, RoomRecord>();

function saveRoomsSnapshotToDisk(): void {
  try {
    const serialized: Array<{
      roomId: string;
      createdAt: number;
      lastActiveAt: number;
      sharedState: SharedRoomGameState;
      chatHistory: CoopChatMessage[];
    }> = [];
    for (const r of rooms.values()) {
      serialized.push({
        roomId: r.roomId,
        createdAt: r.createdAt,
        lastActiveAt: r.lastActiveAt,
        sharedState: r.sharedState,
        chatHistory: r.chatHistory.slice(-40),
      });
    }
    fs.writeFileSync(ROOMS_SNAPSHOT_PATH, JSON.stringify(serialized), 'utf8');
  } catch {
    // Non-fatal persistence safeguard
  }
}

function loadRoomsSnapshotFromDisk(): void {
  try {
    if (!fs.existsSync(ROOMS_SNAPSHOT_PATH)) return;
    const raw = fs.readFileSync(ROOMS_SNAPSHOT_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Array<{
      roomId: string;
      createdAt: number;
      lastActiveAt: number;
      sharedState: Partial<SharedRoomGameState>;
      chatHistory?: CoopChatMessage[];
    }>;
    if (!Array.isArray(parsed)) return;
    const now = Date.now();
    for (const entry of parsed) {
      if (!entry || typeof entry.roomId !== 'string') continue;
      if (now - (entry.lastActiveAt ?? 0) > 24 * 60 * 60 * 1000) continue;
      rooms.set(entry.roomId, {
        roomId: entry.roomId,
        createdAt: entry.createdAt ?? now,
        lastActiveAt: entry.lastActiveAt ?? now,
        seeded: true,
        clients: new Map(),
        sharedState: mergePartialSharedState(createDefaultSharedState(), entry.sharedState),
        chatHistory: Array.isArray(entry.chatHistory) ? entry.chatHistory.slice(-40) : [],
        cleanupTimer: null,
      });
    }
  } catch {
    // Ignore corrupt snapshot
  }
}

function createDefaultSharedState(): SharedRoomGameState {
  return {
    day: 1,
    money: 5_000_000,
    reputation: 65,
    shopOpen: false,
    shopLightsOn: true,
    inventory: {
      bread: 24,
      ful: 20,
      taameya: 20,
      salad: 14,
      tahina: 16,
      pickles: 14,
      fries: 14,
    },
    prices: {
      ful_oil: 12,
      ful_tahina: 15,
      taameya_plain: 12,
      taameya_salad: 18,
      fries_sandwich: 16,
      mixed_special: 24,
    },
    extraPrices: {
      ful_sausage_plate: 28,
      taameya_platter: 36,
      fries_plate: 25,
      babaganoush: 18,
      salad_pickles_plate: 10,
      tea_mint: 10,
      karkadeh: 14,
      sugarcane_juice: 15,
    },
    cashierSettings: {
      maxDiscountPct: 10,
      taxRatePct: 0,
      cashierRegisterLocked: false,
      allowCashierCustomDiscount: true,
      openingDrawerFloat: 200,
    },
    cashierReceipts: [],
    nextInvoiceSeq: 1,
    vipMembers: [
      { id: 'vip-1', nameAr: 'الحاج حسين', phone: '01012345678', points: 280, tier: 'gold', visits: 18, totalSpent: 1940 },
      { id: 'vip-2', nameAr: 'مدام نادية', phone: '01122334455', points: 145, tier: 'silver', visits: 11, totalSpent: 890 },
      { id: 'vip-3', nameAr: 'الأسطى سعيد', phone: '01299887766', points: 120, tier: 'silver', visits: 9, totalSpent: 720 },
      { id: 'vip-4', nameAr: 'كابتن حازم', phone: '01544332211', points: 60, tier: 'bronze', visits: 5, totalSpent: 340 },
      { id: 'vip-5', nameAr: 'آنسة ريم', phone: '01077665544', points: 45, tier: 'bronze', visits: 4, totalSpent: 260 },
    ],
    kitchenTickets: [],
    shiftSettlements: [],
    upgrades: {
      fryerLevel: 1,
      fulPotLevel: 1,
      decorLevel: 1,
      carEngineLevel: 1,
    },
    cityShops: [],
    activeVehicleId: 'pickup',
    ownedVehicleIds: ['fiat_128', 'pickup', 'delivery_moto'],
    carFuel: 100,
    carCondition: 100,
    adBoard: {
      active: true,
      headlineAr: 'عرض المعلم اليوم — فطار سخن لكل الحارة!',
      promoTextAr: 'خصم ١٥٪ على السندوتشات المشكلة والطلبات العائلية + دليفري سريع',
      discountPct: 15,
      updatedAtClock: '08:00',
    },
    employeeWallets: {
      mohamed: 5_000_000,
      ahmed: 450,
      ali: 450,
      mahmoud: 450,
    },
    instaPayTransfers: [],
    ownedBuildingIds: [],
    restaurantFloors: 1,
    ownedBranchIds: [],
    vehicleLockedByOwner: false,
    customProfiles: {
      ahmed: { nameAr: 'أحمد', roleTitleAr: 'الشيف ومعلم القلي والفول' },
      ali: { nameAr: 'علي', roleTitleAr: 'الكاشير والمحاسب' },
      mahmoud: { nameAr: 'محمود', roleTitleAr: 'سائق التوصيل والسوق' },
      spouseNameAr: 'أمينة',
      sonNameAr: 'كريم',
      daughterNameAr: 'نور الصغيرة',
    },
    schoolEnrollment: {
      schoolNameAr: 'مدرسة بنها الخاصة',
      sonEnrolled: false,
      daughterEnrolled: false,
      sonGradeAr: 'الصف الأول الابتدائي',
      daughterGradeAr: 'KG2 — رياض أطفال',
      enrolledDay: null,
    },
    crewNeeds: {
      mohamed: { hunger: 88, thirst: 90 },
      ahmed: { hunger: 84, thirst: 86 },
      ali: { hunger: 85, thirst: 88 },
      mahmoud: { hunger: 82, thirst: 84 },
    },
    activeSeasonId: 'normal',
    wholesaleContracts: [],
    hygieneScore: 92,
    qualityBadgeEarned: false,
    inspectionLogs: [],
    ownedFurnitureIds: [],
    cornicheVillaOwned: false,
    schoolReport: {
      sonScore: 86,
      daughterScore: 91,
      sonGradeNoteAr: 'جيد جداً — متفوق في الحساب والقراءة',
      daughterGradeNoteAr: 'ممتازة — الأولى على فصل KG2',
      ceremoniesAttended: 0,
      lastCeremonyDay: null,
    },
    crewLeaderboard: {
      mohamed: { characterId: 'mohamed', ordersCooked: 0, cashierSales: 0, deliveriesCompleted: 0, points: 0 },
      ahmed: { characterId: 'ahmed', ordersCooked: 0, cashierSales: 0, deliveriesCompleted: 0, points: 0 },
      ali: { characterId: 'ali', ordersCooked: 0, cashierSales: 0, deliveriesCompleted: 0, points: 0 },
      mahmoud: { characterId: 'mahmoud', ordersCooked: 0, cashierSales: 0, deliveriesCompleted: 0, points: 0 },
    },
  };
}

function sanitizeRoomId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length < 4 || cleaned.length > 10) return null;
  return cleaned;
}

function sanitizeDisplayName(raw: unknown, fallback: string, maxLen = 24): string {
  if (typeof raw !== 'string') return fallback;
  const cleaned = raw.replace(/[<>`"'\\/\x00-\x1F]/g, '').trim().slice(0, maxLen);
  return cleaned || fallback;
}

function generateRoomCode(): string {
  for (let attempt = 0; attempt < 16; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      const idx = crypto.randomInt(0, ROOM_CHARS.length);
      code += ROOM_CHARS[idx];
    }
    if (!rooms.has(code)) return code;
  }
  return `HARA${crypto.randomInt(10, 99)}`;
}

function getOrCreateRoom(roomId: string): RoomRecord {
  const existing = rooms.get(roomId);
  if (existing) {
    if (existing.cleanupTimer) {
      clearTimeout(existing.cleanupTimer);
      existing.cleanupTimer = null;
    }
    existing.lastActiveAt = Date.now();
    return existing;
  }
  const created: RoomRecord = {
    roomId,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    seeded: false,
    clients: new Map(),
    sharedState: createDefaultSharedState(),
    chatHistory: [],
    cleanupTimer: null,
  };
  rooms.set(roomId, created);
  saveRoomsSnapshotToDisk();
  return created;
}

function serializeMembers(room: RoomRecord): OnlineRoomMember[] {
  const list: OnlineRoomMember[] = [];
  for (const c of room.clients.values()) {
    list.push({
      clientId: c.clientId,
      characterId: c.characterId,
      roleId: c.roleId,
      displayNameAr: c.displayNameAr,
      connected: c.ws.readyState === WebSocket.OPEN,
      zoneAr: c.zoneAr,
      streetAr: c.streetAr,
      inCar: c.inCar,
      x: c.x,
      z: c.z,
    });
  }
  return list;
}

function broadcastToRoom(room: RoomRecord, payload: unknown, excludeClientId?: string): void {
  const serialized = JSON.stringify(payload);
  for (const client of room.clients.values()) {
    if (excludeClientId && client.clientId === excludeClientId) continue;
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(serialized);
    }
  }
}

function mergePartialSharedState(
  target: SharedRoomGameState,
  incoming: Partial<SharedRoomGameState> | undefined,
): SharedRoomGameState {
  if (!incoming || typeof incoming !== 'object') return target;
  const next = { ...target };
  if (typeof incoming.day === 'number' && Number.isFinite(incoming.day)) {
    next.day = Math.max(1, Math.min(999, Math.round(incoming.day)));
  }
  if (typeof incoming.money === 'number' && Number.isFinite(incoming.money)) {
    next.money = Math.max(0, Math.min(100_000_000, Math.round(incoming.money)));
  }
  if (typeof incoming.reputation === 'number' && Number.isFinite(incoming.reputation)) {
    next.reputation = Math.max(0, Math.min(100, Math.round(incoming.reputation)));
  }
  if (typeof incoming.shopOpen === 'boolean') next.shopOpen = incoming.shopOpen;
  if (typeof incoming.shopLightsOn === 'boolean') next.shopLightsOn = incoming.shopLightsOn;
  if (typeof incoming.carFuel === 'number' && Number.isFinite(incoming.carFuel)) {
    next.carFuel = Math.max(0, Math.min(100, Math.round(incoming.carFuel)));
  }
  if (typeof incoming.carCondition === 'number' && Number.isFinite(incoming.carCondition)) {
    next.carCondition = Math.max(0, Math.min(100, Math.round(incoming.carCondition)));
  }
  if (incoming.inventory && typeof incoming.inventory === 'object') {
    const inv = { ...next.inventory };
    for (const k of Object.keys(inv) as Array<keyof InventoryState>) {
      const val = incoming.inventory[k];
      if (typeof val === 'number' && Number.isFinite(val)) {
        inv[k] = Math.max(0, Math.min(999, Math.round(val)));
      }
    }
    next.inventory = inv;
  }
  if (incoming.prices && typeof incoming.prices === 'object') {
    const prices = { ...next.prices };
    for (const k of Object.keys(prices) as Array<keyof typeof prices>) {
      const val = incoming.prices[k];
      if (typeof val === 'number' && Number.isFinite(val)) {
        prices[k] = Math.max(6, Math.min(80, Math.round(val)));
      }
    }
    next.prices = prices;
  }
  if (incoming.extraPrices && typeof incoming.extraPrices === 'object') {
    const extraPrices = { ...next.extraPrices };
    for (const k of Object.keys(extraPrices) as Array<PosExtraItemId>) {
      const val = incoming.extraPrices[k];
      if (typeof val === 'number' && Number.isFinite(val)) {
        extraPrices[k] = Math.max(5, Math.min(180, Math.round(val)));
      }
    }
    next.extraPrices = extraPrices;
  }
  if (incoming.cashierSettings && typeof incoming.cashierSettings === 'object') {
    const cs = incoming.cashierSettings;
    next.cashierSettings = {
      maxDiscountPct:
        typeof cs.maxDiscountPct === 'number' && Number.isFinite(cs.maxDiscountPct)
          ? Math.max(0, Math.min(50, Math.round(cs.maxDiscountPct)))
          : next.cashierSettings.maxDiscountPct,
      taxRatePct:
        typeof cs.taxRatePct === 'number' && Number.isFinite(cs.taxRatePct)
          ? Math.max(0, Math.min(25, Math.round(cs.taxRatePct)))
          : next.cashierSettings.taxRatePct,
      cashierRegisterLocked:
        typeof cs.cashierRegisterLocked === 'boolean'
          ? cs.cashierRegisterLocked
          : next.cashierSettings.cashierRegisterLocked,
      allowCashierCustomDiscount:
        typeof cs.allowCashierCustomDiscount === 'boolean'
          ? cs.allowCashierCustomDiscount
          : next.cashierSettings.allowCashierCustomDiscount,
      openingDrawerFloat:
        typeof cs.openingDrawerFloat === 'number' && Number.isFinite(cs.openingDrawerFloat)
          ? Math.max(0, Math.min(10_000, Math.round(cs.openingDrawerFloat)))
          : next.cashierSettings.openingDrawerFloat,
    };
  }
  if (Array.isArray(incoming.cashierReceipts)) {
    next.cashierReceipts = incoming.cashierReceipts
      .filter((r) => r && typeof r.invoiceNumber === 'string')
      .slice(0, 40);
  }
  if (typeof incoming.nextInvoiceSeq === 'number' && Number.isFinite(incoming.nextInvoiceSeq)) {
    next.nextInvoiceSeq = Math.max(1, Math.min(999_999, Math.round(incoming.nextInvoiceSeq)));
  }
  if (Array.isArray(incoming.vipMembers)) {
    next.vipMembers = incoming.vipMembers
      .filter((v) => v && typeof v.id === 'string' && typeof v.nameAr === 'string')
      .slice(0, 40);
  }
  if (Array.isArray(incoming.kitchenTickets)) {
    next.kitchenTickets = incoming.kitchenTickets
      .filter((k) => k && typeof k.id === 'string' && typeof k.invoiceNumber === 'string')
      .slice(0, 30);
  }
  if (Array.isArray(incoming.shiftSettlements)) {
    next.shiftSettlements = incoming.shiftSettlements
      .filter((s) => s && typeof s.id === 'string')
      .slice(0, 20);
  }
  if (incoming.upgrades && typeof incoming.upgrades === 'object') {
    const up = { ...next.upgrades };
    for (const k of Object.keys(up) as Array<keyof ShopUpgrades>) {
      const val = incoming.upgrades[k];
      if (typeof val === 'number' && Number.isFinite(val)) {
        up[k] = Math.max(1, Math.min(4, Math.round(val)));
      }
    }
    next.upgrades = up;
  }
  if (Array.isArray(incoming.cityShops)) {
    next.cityShops = incoming.cityShops
      .filter((s) => s && typeof s.id === 'string')
      .map((s) => ({
        id: s.id.slice(0, 48),
        owned: Boolean(s.owned),
        hasManager: Boolean(s.hasManager),
        accumulatedProfit:
          typeof s.accumulatedProfit === 'number' && Number.isFinite(s.accumulatedProfit)
            ? Math.max(0, s.accumulatedProfit)
            : 0,
      }));
  }
  if (Array.isArray(incoming.ownedVehicleIds)) {
    next.ownedVehicleIds = incoming.ownedVehicleIds.slice(0, 6) as OwnedVehicleId[];
  }
  if (typeof incoming.activeVehicleId === 'string') {
    next.activeVehicleId = incoming.activeVehicleId as OwnedVehicleId;
  }
  if (incoming.adBoard && typeof incoming.adBoard === 'object') {
    next.adBoard = {
      active: Boolean(incoming.adBoard.active),
      headlineAr: sanitizeDisplayName(incoming.adBoard.headlineAr, next.adBoard.headlineAr, 56),
      promoTextAr: sanitizeDisplayName(incoming.adBoard.promoTextAr, next.adBoard.promoTextAr, 90),
      discountPct: Math.max(0, Math.min(50, Math.round(Number(incoming.adBoard.discountPct) || 0))),
      updatedAtClock: sanitizeDisplayName(incoming.adBoard.updatedAtClock, next.adBoard.updatedAtClock, 10),
    };
  }
  if (incoming.employeeWallets && typeof incoming.employeeWallets === 'object') {
    const ew = { ...next.employeeWallets };
    for (const k of VALID_CHARACTERS) {
      const val = incoming.employeeWallets[k];
      if (typeof val === 'number' && Number.isFinite(val)) {
        ew[k] = Math.max(0, Math.min(100_000_000, Math.round(val)));
      }
    }
    next.employeeWallets = ew;
  }
  if (Array.isArray(incoming.instaPayTransfers)) {
    next.instaPayTransfers = incoming.instaPayTransfers
      .filter((t) => t && typeof t.id === 'string' && typeof t.amount === 'number')
      .slice(0, 40);
  }
  if (Array.isArray(incoming.ownedBuildingIds)) {
    next.ownedBuildingIds = incoming.ownedBuildingIds.slice(0, 8) as OwnableBuildingId[];
  }
  if (typeof incoming.restaurantFloors === 'number' && Number.isFinite(incoming.restaurantFloors)) {
    next.restaurantFloors = Math.max(1, Math.min(3, Math.round(incoming.restaurantFloors)));
  }
  if (Array.isArray(incoming.ownedBranchIds)) {
    next.ownedBranchIds = incoming.ownedBranchIds.slice(0, 6) as RestaurantBranchId[];
  }
  if (typeof incoming.vehicleLockedByOwner === 'boolean') {
    next.vehicleLockedByOwner = incoming.vehicleLockedByOwner;
  }
  if (incoming.customProfiles && typeof incoming.customProfiles === 'object') {
    next.customProfiles = {
      ahmed: incoming.customProfiles.ahmed ?? next.customProfiles.ahmed,
      ali: incoming.customProfiles.ali ?? next.customProfiles.ali,
      mahmoud: incoming.customProfiles.mahmoud ?? next.customProfiles.mahmoud,
      spouseNameAr: sanitizeDisplayName(incoming.customProfiles.spouseNameAr, next.customProfiles.spouseNameAr),
      sonNameAr: sanitizeDisplayName(incoming.customProfiles.sonNameAr, next.customProfiles.sonNameAr),
      daughterNameAr: sanitizeDisplayName(incoming.customProfiles.daughterNameAr, next.customProfiles.daughterNameAr),
    };
  }
  if (incoming.schoolEnrollment && typeof incoming.schoolEnrollment === 'object') {
    next.schoolEnrollment = {
      ...next.schoolEnrollment,
      ...incoming.schoolEnrollment,
    };
  }
  if (incoming.crewNeeds && typeof incoming.crewNeeds === 'object') {
    next.crewNeeds = {
      ...next.crewNeeds,
      ...incoming.crewNeeds,
    };
  }
  if (typeof incoming.activeSeasonId === 'string') {
    next.activeSeasonId = incoming.activeSeasonId as EgyptianSeasonId;
  }
  if (Array.isArray(incoming.wholesaleContracts)) {
    next.wholesaleContracts = incoming.wholesaleContracts.slice(0, 5) as WholesaleContractId[];
  }
  if (typeof incoming.hygieneScore === 'number' && Number.isFinite(incoming.hygieneScore)) {
    next.hygieneScore = Math.max(0, Math.min(100, Math.round(incoming.hygieneScore)));
  }
  if (typeof incoming.qualityBadgeEarned === 'boolean') {
    next.qualityBadgeEarned = incoming.qualityBadgeEarned;
  }
  if (Array.isArray(incoming.inspectionLogs)) {
    next.inspectionLogs = incoming.inspectionLogs.slice(0, 20);
  }
  if (Array.isArray(incoming.ownedFurnitureIds)) {
    next.ownedFurnitureIds = incoming.ownedFurnitureIds.slice(0, 6) as FurnitureItemId[];
  }
  if (typeof incoming.cornicheVillaOwned === 'boolean') {
    next.cornicheVillaOwned = incoming.cornicheVillaOwned;
  }
  if (incoming.schoolReport && typeof incoming.schoolReport === 'object') {
    next.schoolReport = {
      ...next.schoolReport,
      ...incoming.schoolReport,
    };
  }
  if (incoming.crewLeaderboard && typeof incoming.crewLeaderboard === 'object') {
    next.crewLeaderboard = {
      ...next.crewLeaderboard,
      ...incoming.crewLeaderboard,
    };
  }
  return next;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function computeCrc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function toDosTimeDate(date: Date): { dosTime: number; dosDate: number } {
  const year = Math.max(1980, date.getFullYear());
  const dosTime =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((date.getSeconds() >> 1) & 0x1f);
  const dosDate =
    (((year - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);
  return { dosTime, dosDate };
}

function collectGitHubExportFiles(rootDir: string): string[] {
  const excludedDirs = new Set([
    'node_modules',
    'dist',
    'dev-dist',
    'build',
    'coverage',
    '.git',
    '.aistudio',
    '.playwright-cli',
  ]);
  const files: string[] = [];

  const walk = (dir: string, relPrefix: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (excludedDirs.has(entry.name)) continue;
        const nextRel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
        walk(path.join(dir, entry.name), nextRel);
      } else if (entry.isFile()) {
        if (entry.name.startsWith('.env') && entry.name !== '.env.example') continue;
        if (entry.name === '.DS_Store' || entry.name.endsWith('.log')) continue;
        const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
        files.push(relPath);
      }
    }
  };

  walk(rootDir, '');
  return files;
}

function buildCleanGitHubZip(rootDir: string): Buffer {
  const relFiles = collectGitHubExportFiles(rootDir);
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const relPath of relFiles) {
    const fullPath = path.join(rootDir, relPath);
    const rawData = fs.readFileSync(fullPath);
    const stat = fs.statSync(fullPath);
    const { dosTime, dosDate } = toDosTimeDate(stat.mtime);
    const crc = computeCrc32(rawData);
    const compressed = zlib.deflateRawSync(rawData, { level: 6 });
    const useStore = compressed.length >= rawData.length;
    const payload = useStore ? rawData : compressed;
    const method = useStore ? 0 : 8;
    const nameBuf = Buffer.from(relPath, 'utf8');

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(payload.length, 18);
    localHeader.writeUInt32LE(rawData.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuf, payload);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(payload.length, 20);
    centralHeader.writeUInt32LE(rawData.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + payload.length;
  }

  const centralDirBuffer = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(relFiles.length, 8);
  eocd.writeUInt16LE(relFiles.length, 10);
  eocd.writeUInt32LE(centralDirBuffer.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirBuffer, eocd]);
}

async function startServer() {
  loadRoomsSnapshotFromDisk();
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, activeRooms: rooms.size });
  });

  app.get('/api/github-package.zip', (_req, res) => {
    try {
      const zipBuffer = buildCleanGitHubZip(process.cwd());
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="elmoalem-simulator-github.zip"');
      res.setHeader('Content-Length', String(zipBuffer.length));
      res.setHeader('Cache-Control', 'no-store');
      res.send(zipBuffer);
    } catch (err) {
      console.error('Failed to build GitHub ZIP:', err);
      res.status(500).json({ ok: false, errorAr: 'تعذر تجهيز حزمة GitHub حالياً' });
    }
  });

  app.post('/api/auth/verify-owner', (req, res) => {
    const rawPin = typeof req.body?.pin === 'string' ? req.body.pin.trim() : '';
    const a = Buffer.from(rawPin);
    const b = Buffer.from(OWNER_PIN);
    const valid = a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
    res.json({ ok: true, valid });
  });

  app.post('/api/rooms', (req, res) => {
    const requestedCode = sanitizeRoomId(req.body?.roomId);
    const roomId = requestedCode ?? generateRoomCode();
    const room = getOrCreateRoom(roomId);
    if (!room.seeded && req.body?.initialState) {
      room.sharedState = mergePartialSharedState(room.sharedState, req.body.initialState);
      room.seeded = true;
      saveRoomsSnapshotToDisk();
    }
    res.json({
      ok: true,
      roomId: room.roomId,
      invitePath: `/?room=${room.roomId}`,
      members: serializeMembers(room),
      occupiedCharacters: Array.from(room.clients.values()).map((c) => c.characterId),
    });
  });

  app.get('/api/rooms/:roomId', (req, res) => {
    const roomId = sanitizeRoomId(req.params.roomId);
    if (!roomId) {
      res.status(400).json({ ok: false, errorAr: 'رمز الغرفة غير صالح' });
      return;
    }
    const room = rooms.get(roomId);
    if (!room) {
      res.json({
        ok: true,
        exists: false,
        roomId,
        members: [],
        occupiedCharacters: [],
        maxPlayers: 4,
      });
      return;
    }
    res.json({
      ok: true,
      exists: true,
      roomId: room.roomId,
      members: serializeMembers(room),
      occupiedCharacters: Array.from(room.clients.values()).map((c) => c.characterId),
      maxPlayers: 4,
    });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    try {
      const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      if (reqUrl.pathname === '/ws') {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      }
    } catch {
      socket.destroy();
    }
  });

  wss.on('connection', (ws, req) => {
    let joinedRoom: RoomRecord | null = null;
    let joinedClient: ConnectedClient | null = null;

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const queryRoom = sanitizeRoomId(url.searchParams.get('room'));

    ws.on('message', (raw) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(raw.toString()) as Record<string, unknown>;
      } catch {
        return;
      }

      if (msg.type === 'join') {
        const roomId = sanitizeRoomId(msg.roomId ?? queryRoom);
        const charId = msg.characterId as PlayerCharacterId;
        if (!roomId || !VALID_CHARACTERS.includes(charId)) {
          ws.send(
            JSON.stringify({
              type: 'room:error',
              code: 'INVALID_JOIN',
              messageAr: 'بيانات الغرفة أو الشخصية غير صالحة.',
            }),
          );
          return;
        }

        const room = getOrCreateRoom(roomId);
        // Only seed initial state when the room has never been seeded yet
        if (!room.seeded && msg.initialState && typeof msg.initialState === 'object') {
          room.sharedState = mergePartialSharedState(
            room.sharedState,
            msg.initialState as Partial<SharedRoomGameState>,
          );
          room.seeded = true;
          saveRoomsSnapshotToDisk();
        }

        // Enforce fixed character/role uniqueness per room
        for (const existing of room.clients.values()) {
          if (existing.characterId === charId && existing.ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                code: 'CHARACTER_TAKEN',
                messageAr: `شخصية ${CHARACTER_NAMES_AR[charId]} محجوزة لصاحبك في الغرفة! اختر شخصية تانية.`,
              }),
            );
            return;
          }
        }

        const clientId = crypto.randomUUID().slice(0, 8);
        const startPos = CHARACTER_START_ZONE[charId];
        const client: ConnectedClient = {
          clientId,
          ws,
          characterId: charId,
          roleId: CHARACTER_TO_ROLE[charId],
          displayNameAr: sanitizeDisplayName(msg.displayNameAr, CHARACTER_NAMES_AR[charId]),
          x: startPos.x,
          y: 1.68,
          z: startPos.z,
          yaw: Math.PI / 2,
          inCar: false,
          moving: false,
          sprinting: false,
          holding: false,
          zoneAr: startPos.zoneAr,
          streetAr: startPos.streetAr,
        };

        room.clients.set(clientId, client);
        room.lastActiveAt = Date.now();
        joinedRoom = room;
        joinedClient = client;

        const members = serializeMembers(room);
        ws.send(
          JSON.stringify({
            type: 'room:welcome',
            roomId: room.roomId,
            clientId,
            characterId: client.characterId,
            roleId: client.roleId,
            sharedState: room.sharedState,
            members,
            chatHistory: room.chatHistory,
          }),
        );

        broadcastToRoom(
          room,
          {
            type: 'room:members',
            roomId: room.roomId,
            members,
            toastAr: `انضم ${client.displayNameAr} (${CHARACTER_NAMES_AR[charId]}) إلى الحارة!`,
          },
          clientId,
        );
        return;
      }

      if (!joinedRoom || !joinedClient) return;
      joinedRoom.lastActiveAt = Date.now();

      if (msg.type === 'player:pose') {
        if (typeof msg.x === 'number' && Number.isFinite(msg.x)) joinedClient.x = msg.x;
        if (typeof msg.y === 'number' && Number.isFinite(msg.y)) joinedClient.y = msg.y;
        if (typeof msg.z === 'number' && Number.isFinite(msg.z)) joinedClient.z = msg.z;
        if (typeof msg.yaw === 'number' && Number.isFinite(msg.yaw)) joinedClient.yaw = msg.yaw;
        joinedClient.inCar = Boolean(msg.inCar);
        joinedClient.moving = Boolean(msg.moving);
        joinedClient.sprinting = Boolean(msg.sprinting);
        joinedClient.holding = Boolean(msg.holding);
        if (typeof msg.animState === 'string') {
          joinedClient.animState = msg.animState as PlayerAnimSyncState;
        }
        if (typeof msg.speechText === 'string') {
          joinedClient.speechText = sanitizeDisplayName(msg.speechText, '', 90);
        } else {
          joinedClient.speechText = undefined;
        }
        if (typeof msg.zoneAr === 'string') {
          joinedClient.zoneAr = sanitizeDisplayName(msg.zoneAr, joinedClient.zoneAr, 48);
        }
        if (typeof msg.streetAr === 'string') {
          joinedClient.streetAr = sanitizeDisplayName(msg.streetAr, joinedClient.streetAr, 48);
        }

        broadcastToRoom(
          joinedRoom,
          {
            type: 'player:pose',
            clientId: joinedClient.clientId,
            characterId: joinedClient.characterId,
            roleId: joinedClient.roleId,
            displayNameAr: joinedClient.displayNameAr,
            x: joinedClient.x,
            y: joinedClient.y,
            z: joinedClient.z,
            yaw: joinedClient.yaw,
            inCar: joinedClient.inCar,
            moving: joinedClient.moving,
            sprinting: joinedClient.sprinting,
            holding: joinedClient.holding,
            animState: joinedClient.animState,
            speechText: joinedClient.speechText,
            zoneAr: joinedClient.zoneAr,
            streetAr: joinedClient.streetAr,
          },
          joinedClient.clientId,
        );
        return;
      }

      if (msg.type === 'chat:message') {
        const cleanText = sanitizeDisplayName(msg.text, '', 120);
        if (!cleanText) return;
        const nowDate = new Date();
        const clockStr = `${String(nowDate.getHours()).padStart(2, '0')}:${String(nowDate.getMinutes()).padStart(2, '0')}`;
        const chatMsg: CoopChatMessage = {
          id: `cm-${Date.now().toString(36)}-${crypto.randomInt(100, 999)}`,
          clientId: joinedClient.clientId,
          characterId: joinedClient.characterId,
          senderNameAr: joinedClient.displayNameAr,
          text: cleanText,
          clockStr,
          timestamp: Date.now(),
        };
        joinedRoom.chatHistory = [...joinedRoom.chatHistory.slice(-39), chatMsg];
        joinedClient.speechText = cleanText.slice(0, 90);
        saveRoomsSnapshotToDisk();
        broadcastToRoom(joinedRoom, {
          type: 'chat:message',
          roomId: joinedRoom.roomId,
          message: chatMsg,
        });
        return;
      }

      if (msg.type === 'room:action') {
        const action = typeof msg.action === 'string' ? msg.action : '';
        const managementOnlyActions = new Set([
          'toggle_shop',
          'toggle_lights',
          'set_price',
          'set_extra_price',
          'update_cashier_settings',
          'buy_upgrade',
          'buy_city_shop',
          'hire_manager',
          'collect_profits',
          'approve_refund',
          'reject_refund',
          'settle_shift',
          'update_ad_board',
          'insta_pay_transfer',
          'buy_building',
          'upgrade_restaurant_floor',
          'buy_restaurant_branch',
          'toggle_vehicle_lock',
          'update_custom_profiles',
          'set_season',
          'sign_wholesale_contract',
          'buy_furniture',
          'buy_corniche_villa',
        ]);
        if (managementOnlyActions.has(action) && joinedClient.characterId !== 'mohamed') {
          ws.send(
            JSON.stringify({
              type: 'room:error',
              code: 'ROLE_LOCKED',
              messageAr: 'إدارة المحل والأسعار والتحكم في الكاشير والتوسعات هي صلاحية المعلم محمد حامد (صاحب المحل والمدير)!',
            }),
          );
          return;
        }

        const stateDelta = msg.stateDelta as Partial<SharedRoomGameState> | undefined;
        joinedRoom.sharedState = mergePartialSharedState(joinedRoom.sharedState, stateDelta);
        saveRoomsSnapshotToDisk();
        const toastAr =
          typeof msg.toastAr === 'string'
            ? msg.toastAr.replace(/[<>`]/g, '').slice(0, 140)
            : undefined;

        broadcastToRoom(joinedRoom, {
          type: 'room:state',
          roomId: joinedRoom.roomId,
          actorClientId: joinedClient.clientId,
          actorNameAr: joinedClient.displayNameAr,
          action,
          sharedState: joinedRoom.sharedState,
          toastAr,
        });
      }
    });

    ws.on('close', () => {
      if (!joinedRoom || !joinedClient) return;
      joinedRoom.clients.delete(joinedClient.clientId);
      const members = serializeMembers(joinedRoom);
      broadcastToRoom(joinedRoom, {
        type: 'room:members',
        roomId: joinedRoom.roomId,
        members,
        disconnectedClientId: joinedClient.clientId,
        toastAr: `غادر ${joinedClient.displayNameAr} الجلسة مؤقتاً.`,
      });
      if (joinedRoom.clients.size === 0) {
        const rid = joinedRoom.roomId;
        joinedRoom.cleanupTimer = setTimeout(() => {
          const check = rooms.get(rid);
          if (check && check.clients.size === 0) {
            rooms.delete(rid);
          }
        }, 15 * 60 * 1000);
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    app.get('/@vite-plugin-pwa/pwa-entry-point-loaded', (_req, res) => {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.send('export default function registerDevSW() {}\n');
    });
    app.get(['/dev-sw.js', '/sw.js'], (_req, res) => {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.send(
        "self.addEventListener('install', () => self.skipWaiting());\n" +
          "self.addEventListener('activate', (e) => {\n" +
          "  e.waitUntil((async () => {\n" +
          "    const keys = await caches.keys();\n" +
          "    await Promise.all(keys.map((k) => caches.delete(k)));\n" +
          "    await self.registration.unregister();\n" +
          "  })());\n" +
          "});\n",
      );
    });
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        allowedHosts: true,
        ws: {
          server,
          path: '/__vite_hmr',
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
        return next();
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`ELMOALEM server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ELMOALEM server:', err);
  process.exit(1);
});
