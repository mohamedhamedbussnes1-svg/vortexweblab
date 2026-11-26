import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SoundEngine } from './audio';
import {
  animateHumanActor,
  CharacterStyleOptions,
  NpcMeshActor,
  setActorExpression,
} from './characterRig';
import {
  advanceKitchenTicketStatus,
  awardVipPoints,
  calculatePosTotals,
  computeAccountingSummary,
  computeShiftSettlementPreview,
  createDefaultCashierSettings,
  createInitialExtraPrices,
  createInitialVipMembers,
  createKitchenTicketFromReceipt,
  evaluateInquiryReply,
  generateCustomerInquiry,
  issuePosReceipt,
  VIP_TIER_CONFIG,
} from './cashier';
import {
  CITY_SHOPS,
  EW_ROADS_Z,
  GAS_STATION_DEF,
  getStreetContext,
  NS_ROADS_X,
  OWNABLE_BUILDINGS,
  REMOTE_CREW_APARTMENT,
  RESTAURANT_BRANCHES,
  SCHOOL_CAMPUSES,
  TAXI_WAYPOINTS,
} from './cityLayout';
import {
  buildChatLogEntry,
  createObjectDialogueSession,
  generateSmartArabicReply,
} from './conversation';
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
  acceptDeliveryOrder,
  applyWholesaleDailySupply,
  buyApartmentFurniture,
  buyCornicheVilla,
  celebrateSchoolHonorCeremony,
  completeDeliveryOrder,
  CORNICHE_VILLA_DAILY_INCOME,
  createDefaultSchoolReportCard,
  createInitialCrewLeaderboard,
  EGYPTIAN_SEASONS,
  FURNITURE_CATALOG,
  generateDeliveryDispatchBatch,
  getContractDiscountFactor,
  getSeasonModifiers,
  getSuggestedSeasonForDay,
  recordCrewChallengePoint,
  runHygieneInspection,
  sanitizeAndCleanShop,
  signWholesaleContract,
  tickDeliveryOrders,
  WHOLESALE_CONTRACTS,
} from './expansionSystems';
import {
  createOnlineRoomRequest,
  MultiplayerClient,
  SharedRoomStatePayload,
} from './multiplayer';
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
  OWNER_DISPLAY_NAME_AR,
  restoreNeeds,
  runInventoryAudit,
  sendInstaPayTransfer,
  tickCharacterNeeds,
  updateAdBoard,
  updateCustomProfiles,
  upgradeRestaurantFloor,
  verifyOwnerPinLocal,
} from './phoneOs';
import {
  accrueShopProfits,
  APARTMENT_CATALOG,
  buildCrewSlotsSnapshot,
  buyApartment,
  buyCityShop,
  buyVehicle,
  canAccessCityManagement,
  canAddIngredient,
  canPerformFixedRoleAction,
  CAREER_JOBS,
  clampDensitySettings,
  clampReputation,
  clampToCityBounds,
  collectAllShopProfits,
  computeReputationDelta,
  computeSunElevation,
  computeTaxiFare,
  computeTipBonus,
  computeUpgradeCost,
  consumeIngredients,
  createInitialCityShops,
  createInitialRomanceStates,
  createInitialSave,
  DEFAULT_DENSITY_SETTINGS,
  EGYPTIAN_NAMES,
  evaluateAdaptiveQuality,
  formatGameClock,
  generateCustomerOrder,
  getChildUnlockStatus,
  getDayPeriod,
  getPlayerLifeStage,
  haveChild,
  hireShopManager,
  INGREDIENTS,
  LIFE_STAGE_LABELS_AR,
  marryNpc,
  matchesOrder,
  PLAYER_CHARACTERS,
  RECIPES,
  resolveCircleAABB,
  restockIngredient,
  ROMANCE_NPCS,
  VEHICLE_CATALOG,
} from './rules';
import {
  buildRomanceChoices,
  createCustomerDialogueSession,
  createInitialDialogueSession,
  DialogueTurnContext,
  evaluateCustomerServiceState,
  resolveDialogueChoice,
} from './social';
import { createProceduralTextures, ProceduralTextureSet } from './textures';
import {
  AccompanyingPersonHud,
  ActiveDialogueSession,
  ActiveRepairMission,
  ActiveStreetEvent,
  ActiveTaxiMission,
  ApartmentId,
  CameraMode,
  CarCameraMode,
  CareerJobId,
  CashierControllerSettings,
  CharacterNeedsState,
  ChildMember,
  CityShopRuntimeState,
  CoopChatMessage,
  CrewChallengeScore,
  CrewRoleId,
  CustomProfilesMap,
  CustomerArchetype,
  CustomerBubbleHud,
  CustomerInquiry,
  CustomerOrder,
  DailyStats,
  DeliveryOrderItem,
  DensitySettings,
  EgyptianSeasonId,
  ElectronicAdBoardState,
  FacialExpression,
  FullMenuItemId,
  FurnitureItemId,
  GamePhase,
  GraphicsQuality,
  HouseholdMemberState,
  HudSnapshot,
  IngredientId,
  InquiryReplyMode,
  InspectionRecord,
  InstaPayTransferRecord,
  InteractableHint,
  InventoryAuditRecord,
  InventoryState,
  KitchenTicket,
  KitchenTicketStatus,
  MarketPriceForecast,
  MultiplayerStatus,
  OwnableBuildingId,
  OwnedVehicleId,
  PlayerAnimSyncState,
  PlayerCharacterId,
  PosExtraItemId,
  PosReceipt,
  RadioStationId,
  RecipeId,
  RemotePlayerPose,
  RestaurantBranchId,
  RoleActionKind,
  RomanceRuntimeState,
  SavePayload,
  SchoolEnrollmentState,
  SchoolReportCardState,
  ShiftSettlementRecord,
  ShopUpgrades,
  TrafficSignalPhase,
  VipMember,
  WeatherType,
  WholesaleContractId,
  WorldObjectChatKind,
} from './types';
import {
  getHamoTrack,
  getNextHamoTrackIndex,
  getPrevHamoTrackIndex,
  normalizeHamoTrackIndex,
} from './musicCatalog';
import { TrafficVehicleKind, VehiclePassengerVisual } from './vehicles';
import {
  buildEgyptianHaraWorld,
  BuiltWorld,
  getFloorElevationAt,
} from './worldBuilder';
import {
  TRAFFIC_INTERSECTIONS,
  checkRedLightViolation,
  checkSpeedBumpImpact,
  computeDynamicPackCost,
  computeSizzleBonus,
  generateDailyMarketForecast,
  getTrafficSignalPhase,
  isAxisRedLight,
  isGoldenSizzleWindow,
} from './worldSystems';

const STORAGE_KEY = 'elmoalem_simulator_save_v2';
const MAX_PEDESTRIANS = 70;
const MAX_TRAFFIC_VEHICLES = 24;

interface NpcRuntime {
  actor: NpcMeshActor;
  role: 'pedestrian' | 'customer';
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  speed: number;
  walkPhase: number;
  isRunner?: boolean;
  orderId?: string;
  customerName?: string;
  archetype?: CustomerArchetype;
  recipeId?: RecipeId;
  leaving?: boolean;
  diningSeatIdx?: number;
  dineTimer?: number;
  reactionEmoji?: string;
  reactionMoodLabel?: string;
  reactionLineAr?: string;
  reactionTone?: 'happy' | 'neutral' | 'upset';
  reactionExpression?: FacialExpression;
  reactionAnim?: 'wave' | 'argue' | 'talk' | 'eat';
  reactionTimer?: number;
  lastServiceScore?: number;
  hospitalityGiven?: boolean;
  feedbackRecorded?: boolean;
}

interface TrafficRuntime {
  mesh: THREE.Group;
  kind: TrafficVehicleKind;
  axis: 'ns' | 'ew';
  roadCoord: number; // X if ns, Z if ew
  posAlong: number;  // Z if ns, X if ew
  dir: 1 | -1;
  speed: number;
  lastCrossIndex: number;
}

interface BurstParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

interface SteamParticle {
  x: number;
  y: number;
  z: number;
  vy: number;
  phase: number;
}

interface RainDrop {
  x: number;
  y: number;
  z: number;
}

const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _scale = new THREE.Vector3();
const _skyDay = new THREE.Color(0x8bc3e8);
const _skySunset = new THREE.Color(0xe68a5c);
const _skyNight = new THREE.Color(0x131b2e);
const _skyRain = new THREE.Color(0x6b7b8c);
const _currentSky = new THREE.Color();
const _sunDay = new THREE.Color(0xfff2dc);
const _sunGolden = new THREE.Color(0xffa75e);
const _sunNight = new THREE.Color(0x7aa0d8);
const _curSun = new THREE.Color();
const _hemiGroundDay = new THREE.Color(0x7d6044);
const _hemiGroundGolden = new THREE.Color(0x8e5638);
const _hemiGroundNight = new THREE.Color(0x28324a);
const _curHemiGround = new THREE.Color();

function computeNpcLookYaw(
  npcX: number,
  npcZ: number,
  npcYaw: number,
  targetX: number,
  targetZ: number,
): number {
  const dx = targetX - npcX;
  const dz = targetZ - npcZ;
  if (dx * dx + dz * dz > 25) return 0;
  let diff = Math.atan2(dx, dz) - npcYaw;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

export class ElmoalemEngine {
  private container: HTMLElement;
  private onHudUpdate: (snapshot: HudSnapshot) => void;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private textures: ProceduralTextureSet;
  private world: BuiltWorld;
  public sound: SoundEngine;

  private isSoftwareGl: boolean;
  private frameId = 0;
  private disposed = false;
  private lastTimeMs = performance.now();
  private hudSyncTimer = 0;
  private titlePanAngle = 0;

  // Lights for Day/Night cycle
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  // First-person held sandwich group attached to camera
  private heldHandGroup: THREE.Group;
  private heldMeshParts: Record<IngredientId, THREE.Mesh>;
  private heldSkinMat: THREE.MeshStandardMaterial;
  private heldSleeveMat: THREE.MeshStandardMaterial;
  private cookActionTimer = 0;

  // Core simulation state
  private phase: GamePhase = 'title';
  private money = 450;
  private reputation = 65;
  private day = 1;
  private timeOfDay = 0.32;
  private weather: WeatherType = 'sunny';
  private weatherTimer = 75;
  private shopOpen = false;
  private shopLightsOn = true;
  private shutterProgress = 0;

  private inventory: InventoryState;
  private prices: Record<RecipeId, number>;
  private extraPrices: Record<PosExtraItemId, number> = createInitialExtraPrices();
  private cashierSettings: CashierControllerSettings = createDefaultCashierSettings();
  private cashierReceipts: PosReceipt[] = [];
  private nextInvoiceSeq = 1;
  private vipMembers: VipMember[] = createInitialVipMembers();
  private kitchenTickets: KitchenTicket[] = [];
  private shiftSettlements: ShiftSettlementRecord[] = [];
  private customerInquiries: CustomerInquiry[] = [];
  private inquirySpawnTimer = 7;
  private inquirySeq = 1;
  private upgrades: ShopUpgrades;
  private selectedCharacterId: PlayerCharacterId = 'mohamed';
  private activeRole: CrewRoleId = 'assembler';
  private activeJob: CareerJobId = 'chef';
  private cityShops: CityShopRuntimeState[] = createInitialCityShops();
  private activeShopOwnerId: string | null = null;
  private activeVehicleId: OwnedVehicleId = 'fiat_128';
  private ownedVehicleIds: OwnedVehicleId[] = ['fiat_128'];
  private ownedApartmentIds: ApartmentId[] = ['apt_hara'];
  private activeApartmentId: ApartmentId | null = 'apt_hara';
  private spouseId: string | null = null;
  private marriedDay: number | null = null;
  private marriageElapsedSec = 0;
  private childUnlockNotified = false;
  private children: ChildMember[] = [];
  private romanceStates: RomanceRuntimeState[] = createInitialRomanceStates();
  private activeDialogue: ActiveDialogueSession | null = null;
  private activeDialogueCustomerNpc: NpcRuntime | null = null;
  private density: DensitySettings = { ...DEFAULT_DENSITY_SETTINGS };
  private quality: GraphicsQuality = 'ultra';
  private adaptiveQuality = true;

  // Online Multiplayer Client & Remote 3D Teammates
  private mp: MultiplayerClient;
  private remotePlayerActors = new Map<
    string,
    {
      actor: NpcMeshActor;
      pose: RemotePlayerPose;
      phase: number;
    }
  >();

  private heldIngredients: IngredientId[] = [];
  private heldReadyPack: RecipeId | null = null;
  private orders: CustomerOrder[] = [];
  private orderCounter = 1;
  private orderSpawnTimer = 2.5;
  private activeTaxi: ActiveTaxiMission | null = null;
  private activeRepair: ActiveRepairMission | null = null;
  private taxiSpawnCooldown = 0;
  private activeStreetEvent: ActiveStreetEvent | null = null;
  private streetEventCooldown = 0.8;
  private streetEventCounter = 1;
  private householdFamily: HouseholdMemberState[] = createInitialHouseholdFamily();
  private familyStepIndex = 0;
  private familyScheduleTimer = 14;
  private familyPosMap = new Map<
    HouseholdMemberState['id'],
    { x: number; z: number; yaw: number; phase: number }
  >([
    ['home-wife', { x: 20.6, z: 2.6, yaw: Math.PI / 2, phase: 0.2 }],
    ['home-daughter', { x: 13.45, z: 2.35, yaw: -Math.PI / 2, phase: 1.5 }],
    ['home-son', { x: 12.1, z: 1.1, yaw: Math.PI * 0.25, phase: 2.7 }],
  ]);

  private dailyStats: DailyStats = {
    day: 1,
    revenue: 0,
    expenses: 0,
    ordersServed: 0,
    ordersMissed: 0,
    deliveriesCompleted: 0,
    tipsEarned: 0,
    taxiTrips: 0,
    repairsDone: 0,
    sideJobIncome: 0,
    shopDividends: 0,
  };

  // Player & Camera state
  private cameraMode: CameraMode = 'first_person';
  private carCameraMode: CarCameraMode = 'chase';
  private snapCameraNextFrame = true;
  private camRaycaster = new THREE.Raycaster();
  private playerX = -4.2;
  private playerY = 1.68;
  private playerZ = 1.8;
  private playerYaw = Math.PI / 2;
  private playerPitch = -0.04;
  private walkDistance = 0;
  private stepAccum = 0;

  // Vehicle & Cockpit state
  private inCar = false;
  private carX = -3.6;
  private carZ = 5.6;
  private carYaw = 0;
  private carSpeed = 0;
  private prevCarSpeed = 0;
  private carFuel = 100;
  private carCondition = 100;
  private carGearLabel = 'N';
  private prevGearLabel = 'N';
  private shiftAnimTimer = 0;
  private carDoorAnimTimer = 0;
  private carHeadlightsOn = false;
  private carLeftBlinker = false;
  private carRightBlinker = false;
  private blinkerTimer = 0;
  private blinkerPhaseOn = false;
  private radioStation: RadioStationId = 'hamo_morshedy';
  private hamoTrackIndex = 0;
  private musicPaused = false;
  private externalYoutubeActive = false;
  private tasbeehAngleX = 0;
  private tasbeehAngleZ = 0;
  private wiperPhase = 0;

  // Input state
  private keysHeld = new Set<string>();
  private dragLooking = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private mobileMoveX = 0;
  private mobileMoveY = 0;
  private mobileSprint = false;

  // Pooled City Actors, Vehicles & Particles
  private pedestrians: NpcRuntime[] = [];
  private customers: NpcRuntime[] = [];
  private trafficFleet: TrafficRuntime[] = [];
  private activePedestrianCount = 0;
  private activeTrafficCount = 0;
  private steamParticles: SteamParticle[] = [];
  private burstParticles: BurstParticle[] = [];
  private rainDrops: RainDrop[] = [];
  private activeHint: InteractableHint | null = null;
  private customerBubble: CustomerBubbleHud | null = null;
  private toastMessage: string | null = null;
  private toastTimer = 0;
  private cameraTrauma = 0;
  private profitAccrualAccum = 0;

  // World Systems v3 state (traffic lights, fines, golden sizzle, companion, market)
  private simTimeSec = 0;
  private trafficSignal: TrafficSignalPhase = 'ns_green';
  private redLightCooldown = 0;
  private trafficFines = 0;
  private heldCrispBonus = false;
  private companionDef: {
    nameAr: string;
    dressColor: number;
    skinColor: number;
    hijabColor: number | null;
  } | null = null;
  private companionCornicheDone = false;
  private marketForecast: MarketPriceForecast = generateDailyMarketForecast(1);
  private lightningFlashTimer = 0;
  private phoneModalOpen = false;

  // Expansion v2 state (Owner PIN, Profiles, Needs, Ad Board, InstaPay, Audit, Expansion, Companions)
  private ownerUnlocked = false;
  private playerNeeds: CharacterNeedsState = createInitialCharacterNeeds();
  private crewNeeds: Record<PlayerCharacterId, CharacterNeedsState> = createInitialCrewNeeds();
  private adBoard: ElectronicAdBoardState = createDefaultAdBoard();
  private employeeWallets: Record<PlayerCharacterId, number> = createInitialEmployeeWallets();
  private instaPayTransfers: InstaPayTransferRecord[] = [];
  private seenTransferIds = new Set<string>();
  private latestInstaPayToast: string | null = null;
  private latestInstaPayTimer = 0;
  private inventoryConsumedToday: Record<IngredientId, number> = createEmptyConsumedMap();
  private inventoryAuditLogs: InventoryAuditRecord[] = [];
  private ownedBuildingIds: OwnableBuildingId[] = [];
  private restaurantFloors = 1;
  private ownedBranchIds: RestaurantBranchId[] = [];
  private vehicleLockedByOwner = false;
  private customProfiles: CustomProfilesMap = createDefaultCustomProfiles();
  private schoolEnrollment: SchoolEnrollmentState = createDefaultSchoolEnrollment();
  private accompanyingFollowers: Array<{
    id: string;
    nameAr: string;
    roleAr: string;
    actor: NpcMeshActor;
    holdHand: boolean;
    shirtColor: number;
    skinColor: number;
    hijabColor?: number | null;
    isChild?: boolean;
  }> = [];
  private localAnimOverride: PlayerAnimSyncState | null = null;
  private localAnimOverrideTimer = 0;
  private localSpeechOverride: string | null = null;
  private localSpeechTimer = 0;
  private groundY = 0.14;
  private pedBumpCooldown = 0;

  // Expansion v3 state (Seasons, Moto Delivery, Wholesale & Hygiene, School Report & Villa/Furniture, Co-op Chat & Leaderboard)
  private activeSeasonId: EgyptianSeasonId = 'normal';
  private deliveryOrders: DeliveryOrderItem[] = generateDeliveryDispatchBatch(4, 1);
  private deliverySeq = 2;
  private wholesaleContracts: WholesaleContractId[] = [];
  private hygieneScore = 92;
  private qualityBadgeEarned = false;
  private inspectionLogs: InspectionRecord[] = [];
  private ownedFurnitureIds: FurnitureItemId[] = [];
  private cornicheVillaOwned = false;
  private schoolReport: SchoolReportCardState = createDefaultSchoolReportCard();
  private crewLeaderboard: Record<PlayerCharacterId, CrewChallengeScore> = createInitialCrewLeaderboard();
  private coopChatMessages: CoopChatMessage[] = [];
  private seenChatIds = new Set<string>();

  // FPS telemetry
  private fpsSamples: number[] = [];
  private fpsEstimate = 60;
  private adaptiveCheckTimer = 0;

  private resizeObserver: ResizeObserver;

  constructor(
    container: HTMLElement,
    onHudUpdate: (snapshot: HudSnapshot) => void,
  ) {
    this.container = container;
    this.onHudUpdate = onHudUpdate;
    this.sound = new SoundEngine();

    const save = this.loadSave();
    this.money = save.money;
    this.reputation = save.reputation;
    this.day = save.day;
    this.inventory = save.inventory;
    this.prices = save.prices;
    this.extraPrices = { ...createInitialExtraPrices(), ...(save.extraPrices ?? {}) };
    this.cashierSettings = {
      ...createDefaultCashierSettings(),
      ...(save.cashierSettings ?? {}),
    };
    this.cashierReceipts = Array.isArray(save.cashierReceipts)
      ? save.cashierReceipts.slice(0, 60)
      : [];
    this.nextInvoiceSeq = Math.max(1, save.nextInvoiceSeq ?? 1);
    this.vipMembers =
      Array.isArray(save.vipMembers) && save.vipMembers.length > 0
        ? save.vipMembers
        : createInitialVipMembers();
    this.kitchenTickets = Array.isArray(save.kitchenTickets)
      ? save.kitchenTickets.slice(0, 30)
      : [];
    this.shiftSettlements = Array.isArray(save.shiftSettlements)
      ? save.shiftSettlements.slice(0, 20)
      : [];
    this.customerInquiries = [
      generateCustomerInquiry(
        `inq-${this.inquirySeq++}`,
        this.prices,
        this.extraPrices,
        this.orders,
      ),
    ];
    this.upgrades = save.upgrades;
    this.carFuel = save.carFuel;
    this.carCondition = save.carCondition;
    this.selectedCharacterId = save.selectedCharacterId ?? 'mohamed';
    this.activeRole = save.activeRole;
    this.activeJob = save.activeJob ?? 'chef';
    this.cityShops = save.cityShops?.length === CITY_SHOPS.length
      ? save.cityShops
      : createInitialCityShops();
    this.activeVehicleId = save.activeVehicleId ?? 'fiat_128';
    this.ownedVehicleIds = save.ownedVehicleIds?.length ? save.ownedVehicleIds : ['fiat_128'];
    this.ownedApartmentIds =
      save.ownedApartmentIds?.length > 0 ? save.ownedApartmentIds : ['apt_hara'];
    if (!this.ownedApartmentIds.includes('apt_hara')) {
      this.ownedApartmentIds = ['apt_hara', ...this.ownedApartmentIds];
    }
    this.activeApartmentId = save.activeApartmentId ?? 'apt_hara';
    this.spouseId = save.spouseId ?? null;
    this.marriedDay = save.marriedDay ?? (this.spouseId ? Math.max(1, this.day - 1) : null);
    this.marriageElapsedSec = save.marriageElapsedSec ?? (this.spouseId ? 50 : 0);
    this.children = save.children ?? [];
    this.childUnlockNotified = Boolean(
      this.spouseId &&
        getChildUnlockStatus(
          this.spouseId,
          this.children,
          this.day,
          this.marriedDay,
          this.marriageElapsedSec,
        ).unlocked,
    );
    this.romanceStates =
      save.romanceStates?.length === ROMANCE_NPCS.length
        ? save.romanceStates
        : createInitialRomanceStates();
    this.density = clampDensitySettings(save.density ?? DEFAULT_DENSITY_SETTINGS);
    this.radioStation = save.radioStation ?? 'hamo_morshedy';
    this.quality = save.quality;
    this.adaptiveQuality = save.adaptiveQuality;
    this.ownerUnlocked = Boolean(save.ownerUnlocked);
    this.playerNeeds = save.playerNeeds ?? createInitialCharacterNeeds();
    this.crewNeeds = save.crewNeeds ?? createInitialCrewNeeds();
    this.adBoard = save.adBoard ?? createDefaultAdBoard();
    this.employeeWallets = save.employeeWallets ?? createInitialEmployeeWallets();
    if (this.selectedCharacterId === 'mohamed') {
      this.employeeWallets.mohamed = this.money;
    }
    this.instaPayTransfers = Array.isArray(save.instaPayTransfers)
      ? save.instaPayTransfers.slice(0, 40)
      : [];
    for (const tr of this.instaPayTransfers) this.seenTransferIds.add(tr.id);
    this.inventoryConsumedToday = save.inventoryConsumedToday ?? createEmptyConsumedMap();
    this.inventoryAuditLogs = Array.isArray(save.inventoryAuditLogs)
      ? save.inventoryAuditLogs.slice(0, 20)
      : [];
    this.ownedBuildingIds = Array.isArray(save.ownedBuildingIds) ? save.ownedBuildingIds : [];
    this.restaurantFloors = Math.max(1, Math.min(3, save.restaurantFloors ?? 1));
    this.ownedBranchIds = Array.isArray(save.ownedBranchIds) ? save.ownedBranchIds : [];
    this.vehicleLockedByOwner = Boolean(save.vehicleLockedByOwner);
    this.customProfiles = save.customProfiles ?? createDefaultCustomProfiles();
    this.schoolEnrollment = save.schoolEnrollment ?? createDefaultSchoolEnrollment();
    this.activeSeasonId = save.activeSeasonId ?? 'normal';
    this.wholesaleContracts = Array.isArray(save.wholesaleContracts) ? save.wholesaleContracts : [];
    this.hygieneScore = typeof save.hygieneScore === 'number' ? save.hygieneScore : 92;
    this.qualityBadgeEarned = Boolean(save.qualityBadgeEarned);
    this.inspectionLogs = Array.isArray(save.inspectionLogs) ? save.inspectionLogs.slice(0, 20) : [];
    this.ownedFurnitureIds = Array.isArray(save.ownedFurnitureIds) ? save.ownedFurnitureIds : [];
    this.cornicheVillaOwned = Boolean(save.cornicheVillaOwned);
    this.schoolReport = save.schoolReport ?? createDefaultSchoolReportCard();
    this.crewLeaderboard = save.crewLeaderboard ?? createInitialCrewLeaderboard();
    this.dailyStats.day = this.day;
    this.marketForecast = generateDailyMarketForecast(this.day);

    this.mp = new MultiplayerClient({
      onStatusChange: (st) => {
        if (st.lockedCharacterId && st.lockedCharacterId !== this.selectedCharacterId) {
          this.selectedCharacterId = st.lockedCharacterId;
          this.activeRole = PLAYER_CHARACTERS[st.lockedCharacterId].roleId;
          this.applyCharacterAppearance();
        }
        this.emitHud();
      },
      onSharedState: (shared, actorClientId, toastAr) => {
        this.applyRemoteSharedState(shared);
        if (toastAr && actorClientId && actorClientId !== this.mp.getStatus().clientId) {
          this.showToast(toastAr);
        }
        this.emitHud();
      },
      onRemotePose: (pose) => {
        this.upsertRemotePlayerPose(pose);
      },
      onMemberDisconnected: (clientId) => {
        this.removeRemotePlayerActor(clientId);
      },
      onChatMessage: (message, isHistory) => {
        if (this.seenChatIds.has(message.id)) return;
        this.seenChatIds.add(message.id);
        this.coopChatMessages = [...this.coopChatMessages.slice(-39), message];
        if (!isHistory && message.clientId !== this.mp.getStatus().clientId) {
          this.showToast(`💬 ${message.senderNameAr}: ${message.text}`);
        }
        this.emitHud();
      },
      onToast: (msg) => {
        this.showToast(msg);
      },
    });

    this.isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(1, container.clientWidth || window.innerWidth);
    const height = Math.max(1, container.clientHeight || window.innerHeight);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: this.isSoftwareGl,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.04;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8bc3e8);
    this.scene.fog = new THREE.FogExp2(0x8bc3e8, 0.0068);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(
      new RoomEnvironment(),
      0.04,
    ).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(68, width / height, 0.1, 210);
    this.camera.rotation.order = 'YXZ';
    this.scene.add(this.camera);

    this.hemiLight = new THREE.HemisphereLight(0xaad4f5, 0x7d6044, 0.72);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff0d4, 1.55);
    this.sunLight.position.set(24, 38, 18);
    if (!this.isSoftwareGl) {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(1024, 1024);
      this.sunLight.shadow.camera.near = 2;
      this.sunLight.shadow.camera.far = 120;
      const d = 48;
      this.sunLight.shadow.camera.left = -d;
      this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d;
      this.sunLight.shadow.camera.bottom = -d;
      this.sunLight.shadow.bias = -0.0005;
      this.sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.sunLight);

    this.textures = createProceduralTextures(this.renderer);
    this.world = buildEgyptianHaraWorld(
      this.scene,
      this.textures,
      this.isSoftwareGl,
    );
    this.applyVehicleVisual();
    this.syncFamilyActorsVisibility();
    this.world.setAdBoardDisplay(this.adBoard);
    this.world.setRestaurantFloors(this.restaurantFloors);
    this.world.setOwnedBuildings(this.ownedBuildingIds);
    this.world.setOwnedBranches(this.ownedBranchIds);
    this.world.heroCar.setOwnerLockVisual(this.vehicleLockedByOwner);

    // First-person Cook Hands & Held Sandwich Rig attached to Camera
    this.camera.add(this.world.cookHandsGroup);
    this.heldHandGroup = new THREE.Group();
    this.heldHandGroup.position.set(0.32, -0.28, -0.52);
    this.heldHandGroup.rotation.set(0.15, -0.25, 0.05);
    this.camera.add(this.heldHandGroup);

    this.heldSkinMat = new THREE.MeshStandardMaterial({
      color: 0xc99168,
      map: this.textures.skinMicro,
      roughness: 0.66,
    });
    this.heldSleeveMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      bumpMap: this.textures.fabricWeave,
      bumpScale: 0.015,
      roughness: 0.85,
    });
    const heldSleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.056, 0.16, 12),
      this.heldSleeveMat,
    );
    heldSleeve.position.set(0.12, -0.17, 0.24);
    heldSleeve.rotation.set(Math.PI * 0.44, 0, -0.28);
    this.heldHandGroup.add(heldSleeve);
    const heldForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.045, 0.19, 12),
      this.heldSkinMat,
    );
    heldForearm.position.set(0.06, -0.11, 0.13);
    heldForearm.rotation.set(Math.PI * 0.44, 0, -0.28);
    this.heldHandGroup.add(heldForearm);
    const heldPalm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.032, 0.052, 4, 8),
      this.heldSkinMat,
    );
    heldPalm.position.set(0.0, -0.055, 0.01);
    heldPalm.rotation.set(Math.PI * 0.48, 0, 0.15);
    this.heldHandGroup.add(heldPalm);
    const heldThumb = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.013, 0.028, 4, 6),
      this.heldSkinMat,
    );
    heldThumb.position.set(-0.065, -0.025, 0.02);
    heldThumb.rotation.set(0.4, 0, 0.55);
    this.heldHandGroup.add(heldThumb);
    const paperWrap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.115, 0.085, 0.095, 14),
      new THREE.MeshStandardMaterial({
        color: 0xb5895a,
        bumpMap: this.textures.fabricWeave,
        bumpScale: 0.01,
        roughness: 0.9,
      }),
    );
    paperWrap.position.y = -0.03;
    this.heldHandGroup.add(paperWrap);

    this.applyCharacterAppearance();

    const makePart = (
      geo: THREE.BufferGeometry,
      color: number,
      y: number,
    ): THREE.Mesh => {
      const m = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({ color, roughness: 0.75 }),
      );
      m.position.y = y;
      m.visible = false;
      this.heldHandGroup.add(m);
      return m;
    };
    this.heldMeshParts = {
      bread: makePart(new THREE.CylinderGeometry(0.11, 0.11, 0.045, 14), 0xd9b37c, 0.015),
      ful: makePart(new THREE.SphereGeometry(0.065, 10, 8), 0x6b4226, 0.042),
      taameya: makePart(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 10), 0x4f772d, 0.052),
      salad: makePart(new THREE.BoxGeometry(0.09, 0.025, 0.09), 0x52b788, 0.065),
      tahina: makePart(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 10), 0xe9d8a6, 0.075),
      pickles: makePart(new THREE.BoxGeometry(0.06, 0.02, 0.06), 0xca6702, 0.08),
      fries: makePart(new THREE.BoxGeometry(0.08, 0.03, 0.07), 0xf4a261, 0.085),
    };

    // Pooled Pedestrians (70), Traffic Vehicles (24), and Particles
    this.initPedestrianPool();
    this.initTrafficFleet();
    this.initParticles();
    this.applyDensitySettings();

    if (this.activeJob === 'taxi') {
      this.spawnTaxiMission();
    } else if (this.activeJob === 'mechanic') {
      this.spawnRepairMission();
    }

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);
    this.bindEvents();
    this.syncBodyState();
    this.emitHud();

    this.updateTitleFlyover(0);
    this.updateDayNightAndWeather(0);
    this.scheduleNextTick();
  }

  private loadSave(): SavePayload {
    const fallback = createInitialSave('mohamed');
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as Partial<SavePayload>;
      const charId = parsed.selectedCharacterId ?? 'mohamed';
      const upgradedMoney =
        charId === 'mohamed' && (parsed.version ?? 0) < 6 && (parsed.money ?? 0) < 5000
          ? MOHAMED_STARTING_MONEY
          : parsed.money ?? fallback.money;
      return {
        ...fallback,
        ...parsed,
        money: upgradedMoney,
        inventory: { ...fallback.inventory, ...(parsed.inventory ?? {}) },
        prices: { ...fallback.prices, ...(parsed.prices ?? {}) },
        extraPrices: {
          ...createInitialExtraPrices(),
          ...(parsed.extraPrices ?? {}),
        },
        cashierSettings: {
          ...createDefaultCashierSettings(),
          ...(parsed.cashierSettings ?? {}),
        },
        cashierReceipts: Array.isArray(parsed.cashierReceipts)
          ? parsed.cashierReceipts.slice(0, 60)
          : [],
        nextInvoiceSeq:
          typeof parsed.nextInvoiceSeq === 'number' && parsed.nextInvoiceSeq >= 1
            ? Math.round(parsed.nextInvoiceSeq)
            : 1,
        vipMembers:
          Array.isArray(parsed.vipMembers) && parsed.vipMembers.length > 0
            ? parsed.vipMembers
            : createInitialVipMembers(),
        kitchenTickets: Array.isArray(parsed.kitchenTickets)
          ? parsed.kitchenTickets.slice(0, 30)
          : [],
        shiftSettlements: Array.isArray(parsed.shiftSettlements)
          ? parsed.shiftSettlements.slice(0, 20)
          : [],
        upgrades: { ...fallback.upgrades, ...(parsed.upgrades ?? {}) },
        radioStation:
          (parsed.version ?? 0) < 7
            ? 'hamo_morshedy'
            : (parsed.radioStation ?? 'hamo_morshedy'),
        density: clampDensitySettings(parsed.density ?? fallback.density),
        cityShops:
          Array.isArray(parsed.cityShops) && parsed.cityShops.length === CITY_SHOPS.length
            ? parsed.cityShops
            : fallback.cityShops,
      };
    } catch {
      return fallback;
    }
  }

  public saveGame(): void {
    const payload: SavePayload = {
      version: 7,
      selectedCharacterId: this.selectedCharacterId,
      money: this.money,
      reputation: this.reputation,
      day: this.day,
      inventory: this.inventory,
      prices: this.prices,
      extraPrices: this.extraPrices,
      cashierSettings: this.cashierSettings,
      cashierReceipts: this.cashierReceipts.slice(0, 60),
      nextInvoiceSeq: this.nextInvoiceSeq,
      vipMembers: this.vipMembers.slice(0, 40),
      kitchenTickets: this.kitchenTickets.slice(0, 30),
      shiftSettlements: this.shiftSettlements.slice(0, 20),
      upgrades: this.upgrades,
      carFuel: this.carFuel,
      carCondition: this.carCondition,
      activeVehicleId: this.activeVehicleId,
      ownedVehicleIds: this.ownedVehicleIds,
      ownedApartmentIds: this.ownedApartmentIds,
      activeApartmentId: this.activeApartmentId,
      spouseId: this.spouseId,
      marriedDay: this.marriedDay,
      marriageElapsedSec: this.marriageElapsedSec,
      children: this.children,
      romanceStates: this.romanceStates,
      activeRole: this.activeRole,
      activeJob: this.activeJob,
      cityShops: this.cityShops,
      density: this.density,
      radioStation: this.radioStation,
      quality: this.quality,
      adaptiveQuality: this.adaptiveQuality,
      ownerUnlocked: this.ownerUnlocked,
      playerNeeds: this.playerNeeds,
      crewNeeds: this.crewNeeds,
      adBoard: this.adBoard,
      employeeWallets: this.employeeWallets,
      instaPayTransfers: this.instaPayTransfers.slice(0, 40),
      inventoryConsumedToday: this.inventoryConsumedToday,
      inventoryAuditLogs: this.inventoryAuditLogs.slice(0, 20),
      ownedBuildingIds: this.ownedBuildingIds,
      restaurantFloors: this.restaurantFloors,
      ownedBranchIds: this.ownedBranchIds,
      vehicleLockedByOwner: this.vehicleLockedByOwner,
      customProfiles: this.customProfiles,
      schoolEnrollment: this.schoolEnrollment,
      activeSeasonId: this.activeSeasonId,
      wholesaleContracts: this.wholesaleContracts,
      hygieneScore: Math.round(this.hygieneScore),
      qualityBadgeEarned: this.qualityBadgeEarned,
      inspectionLogs: this.inspectionLogs.slice(0, 20),
      ownedFurnitureIds: this.ownedFurnitureIds,
      cornicheVillaOwned: this.cornicheVillaOwned,
      schoolReport: this.schoolReport,
      crewLeaderboard: this.crewLeaderboard,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  }

  public resetProgress(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    const fresh = createInitialSave('mohamed');
    this.selectedCharacterId = fresh.selectedCharacterId;
    this.activeRole = fresh.activeRole;
    this.activeJob = fresh.activeJob;
    this.money = fresh.money;
    this.reputation = fresh.reputation;
    this.day = 1;
    this.inventory = fresh.inventory;
    this.prices = fresh.prices;
    this.extraPrices = createInitialExtraPrices();
    this.cashierSettings = createDefaultCashierSettings();
    this.cashierReceipts = [];
    this.nextInvoiceSeq = 1;
    this.vipMembers = createInitialVipMembers();
    this.kitchenTickets = [];
    this.shiftSettlements = [];
    this.customerInquiries = [
      generateCustomerInquiry(
        `inq-${this.inquirySeq++}`,
        this.prices,
        this.extraPrices,
        this.orders,
      ),
    ];
    this.upgrades = fresh.upgrades;
    this.cityShops = fresh.cityShops;
    this.activeVehicleId = fresh.activeVehicleId;
    this.ownedVehicleIds = fresh.ownedVehicleIds;
    this.ownedApartmentIds = fresh.ownedApartmentIds;
    this.activeApartmentId = fresh.activeApartmentId;
    this.spouseId = fresh.spouseId;
    this.marriedDay = fresh.marriedDay ?? null;
    this.marriageElapsedSec = fresh.marriageElapsedSec ?? 0;
    this.childUnlockNotified = false;
    this.children = fresh.children;
    this.romanceStates = fresh.romanceStates;
    this.activeDialogue = null;
    this.companionDef = null;
    this.companionCornicheDone = false;
    this.marketForecast = generateDailyMarketForecast(1);
    this.world.heroCar.setCompanionVisible(false);
    this.world.heroCar.setMultiPassengers([]);
    this.world.heroCar.setOwnerLockVisual(false);
    this.density = fresh.density;
    this.radioStation = fresh.radioStation;
    this.carFuel = 100;
    this.carCondition = 100;
    this.ownerUnlocked = false;
    this.playerNeeds = createInitialCharacterNeeds();
    this.crewNeeds = createInitialCrewNeeds();
    this.adBoard = createDefaultAdBoard();
    this.employeeWallets = createInitialEmployeeWallets();
    this.instaPayTransfers = [];
    this.latestInstaPayToast = null;
    this.inventoryConsumedToday = createEmptyConsumedMap();
    this.inventoryAuditLogs = [];
    this.ownedBuildingIds = [];
    this.restaurantFloors = 1;
    this.ownedBranchIds = [];
    this.vehicleLockedByOwner = false;
    this.customProfiles = createDefaultCustomProfiles();
    this.schoolEnrollment = createDefaultSchoolEnrollment();
    this.activeSeasonId = 'normal';
    this.deliveryOrders = generateDeliveryDispatchBatch(4, 1);
    this.wholesaleContracts = [];
    this.hygieneScore = 92;
    this.qualityBadgeEarned = false;
    this.inspectionLogs = [];
    this.ownedFurnitureIds = [];
    this.cornicheVillaOwned = false;
    this.schoolReport = createDefaultSchoolReportCard();
    this.crewLeaderboard = createInitialCrewLeaderboard();
    this.coopChatMessages = [];
    this.seenChatIds.clear();
    this.clearAccompanyingFollowers();
    this.world.setAdBoardDisplay(this.adBoard);
    this.world.setRestaurantFloors(1);
    this.world.setOwnedBuildings([]);
    this.world.setOwnedBranches([]);
    this.applyDensitySettings();
    this.applyCharacterAppearance();
    this.applyVehicleVisual();
    this.syncFamilyActorsVisibility();
    this.restartCurrentShift();
    this.showToast('تم إعادة ضبط اللعبة بنجاح (رصيد المعلم محمد: ٥,٠٠٠,٠٠٠ ج.م)');
  }

  private clearAccompanyingFollowers(): void {
    for (const f of this.accompanyingFollowers) {
      this.scene.remove(f.actor.group);
    }
    this.accompanyingFollowers = [];
    this.syncVehiclePassengersVisual();
  }

  private applyCharacterAppearance(): void {
    const def = PLAYER_CHARACTERS[this.selectedCharacterId] ?? PLAYER_CHARACTERS.mohamed;
    this.world.setPlayerAppearance(def.shirtColor, def.skinColor);
    if (this.heldSkinMat) this.heldSkinMat.color.setHex(def.skinColor);
    if (this.heldSleeveMat) this.heldSleeveMat.color.setHex(def.shirtColor);
  }

  private applyVehicleVisual(): void {
    const def = VEHICLE_CATALOG[this.activeVehicleId] ?? VEHICLE_CATALOG.fiat_128;
    this.world.heroCar.setVehicleType(
      this.activeVehicleId,
      def.bodyColor,
      this.activeVehicleId === 'sport_coupe',
    );
    this.syncVehiclePassengersVisual();
  }

  private syncVehiclePassengersVisual(): void {
    const visuals: VehiclePassengerVisual[] = [];
    if (this.companionDef) {
      visuals.push({
        shirtColor: this.companionDef.dressColor,
        skinColor: this.companionDef.skinColor,
        hijabColor: this.companionDef.hijabColor,
      });
    }
    for (const f of this.accompanyingFollowers) {
      visuals.push({
        shirtColor: f.shirtColor,
        skinColor: f.skinColor,
        hijabColor: f.hijabColor,
        isChild: f.isChild,
      });
    }
    this.world.heroCar.setMultiPassengers(visuals);
  }

  private syncFamilyActorsVisibility(): void {
    const marriedDef = this.spouseId ? ROMANCE_NPCS.find((g) => g.id === this.spouseId) : null;
    this.world.spouseActor.group.visible = Boolean(marriedDef);
    if (marriedDef) {
      this.world.spouseActor.shirtMaterial.color.setHex(marriedDef.dressColor);
      this.world.spouseActor.skinMaterial.color.setHex(marriedDef.skinColor);
    }
    for (let i = 0; i < this.world.childActors.length; i++) {
      const childDef = this.children[i];
      this.world.childActors[i].group.visible = Boolean(childDef);
      if (childDef) {
        this.world.childActors[i].shirtMaterial.color.setHex(childDef.shirtColor);
      }
    }
    const hasSon = this.children.some((c) => c.gender === 'boy') || this.children.length >= 1;
    const hasDaughter = this.children.some((c) => c.gender === 'girl') || this.children.length >= 2;
    for (const entry of this.world.householdActors) {
      if (entry.id === 'home-wife') {
        entry.actor.group.visible = Boolean(marriedDef);
        if (marriedDef) {
          entry.actor.shirtMaterial.color.setHex(marriedDef.dressColor);
          entry.actor.skinMaterial.color.setHex(marriedDef.skinColor);
        }
      } else if (entry.id === 'home-son') {
        entry.actor.group.visible = hasSon;
      } else if (entry.id === 'home-daughter') {
        entry.actor.group.visible = hasDaughter;
      }
    }
  }

  public setPhoneModalOpen(open: boolean): void {
    this.phoneModalOpen = open;
    if (open) {
      this.keysHeld.clear();
      this.dragLooking = false;
    }
  }

  private isUiModalOpen(): boolean {
    return Boolean(this.activeShopOwnerId || this.activeDialogue || this.phoneModalOpen);
  }

  public async verifyAndUnlockOwner(pin: string): Promise<boolean> {
    let ok = verifyOwnerPinLocal(pin);
    try {
      const res = await fetch('/api/auth/verify-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        const data = (await res.json()) as { ok?: boolean; valid?: boolean };
        if (typeof data.valid === 'boolean') ok = data.valid;
      }
    } catch {
      // Fallback to local SHA-256 verification when offline
    }
    if (ok) {
      this.ownerUnlocked = true;
      this.selectCharacter('mohamed');
      this.sound.playCashRegister();
      this.showToast(`تم فتح حساب ${OWNER_DISPLAY_NAME_AR} (٥,٠٠٠,٠٠٠ ج.م)`);
    } else {
      this.sound.playError();
    }
    this.emitHud();
    return ok;
  }

  public selectCharacter(id: PlayerCharacterId): void {
    const def = PLAYER_CHARACTERS[id];
    if (!def) return;
    const mpStatus = this.mp.getStatus();
    if (mpStatus.mode === 'online' && mpStatus.lockedCharacterId && mpStatus.lockedCharacterId !== id) {
      this.sound.playError();
      this.showToast('أنت متصل في غرفة أونلاين بشخصيتك الثابتة!');
      return;
    }
    if (this.phase === 'title' && this.day === 1 && this.dailyStats.ordersServed === 0) {
      if (id === 'mohamed') {
        if (this.dailyStats.expenses === 0 && this.money < MOHAMED_STARTING_MONEY) {
          this.money = MOHAMED_STARTING_MONEY;
        }
        this.employeeWallets.mohamed = this.money;
      } else {
        if (this.dailyStats.expenses === 0) {
          this.money = this.employeeWallets[id] ?? getStartingMoneyForCharacter(id);
        }
      }
    }
    this.selectedCharacterId = id;
    this.activeRole = def.roleId;
    this.applyCharacterAppearance();
    this.sound.playPickup();
    this.saveGame();
    this.emitHud();
  }

  private getSharedRoomPayload(): SharedRoomStatePayload {
    return {
      day: this.day,
      money: this.money,
      reputation: this.reputation,
      shopOpen: this.shopOpen,
      shopLightsOn: this.shopLightsOn,
      inventory: { ...this.inventory },
      prices: { ...this.prices },
      extraPrices: { ...this.extraPrices },
      cashierSettings: { ...this.cashierSettings },
      cashierReceipts: this.cashierReceipts.slice(0, 40),
      nextInvoiceSeq: this.nextInvoiceSeq,
      vipMembers: this.vipMembers.map((v) => ({ ...v })),
      kitchenTickets: this.kitchenTickets.slice(0, 30),
      shiftSettlements: this.shiftSettlements.slice(0, 20),
      upgrades: { ...this.upgrades },
      cityShops: this.cityShops.map((s) => ({ ...s })),
      activeVehicleId: this.activeVehicleId,
      ownedVehicleIds: [...this.ownedVehicleIds],
      carFuel: this.carFuel,
      carCondition: this.carCondition,
      adBoard: { ...this.adBoard },
      employeeWallets: { ...this.employeeWallets },
      instaPayTransfers: this.instaPayTransfers.slice(0, 30),
      ownedBuildingIds: [...this.ownedBuildingIds],
      restaurantFloors: this.restaurantFloors,
      ownedBranchIds: [...this.ownedBranchIds],
      vehicleLockedByOwner: this.vehicleLockedByOwner,
      customProfiles: { ...this.customProfiles },
      schoolEnrollment: { ...this.schoolEnrollment },
      crewNeeds: { ...this.crewNeeds },
      activeSeasonId: this.activeSeasonId,
      wholesaleContracts: [...this.wholesaleContracts],
      hygieneScore: Math.round(this.hygieneScore),
      qualityBadgeEarned: this.qualityBadgeEarned,
      inspectionLogs: this.inspectionLogs.slice(0, 20),
      ownedFurnitureIds: [...this.ownedFurnitureIds],
      cornicheVillaOwned: this.cornicheVillaOwned,
      schoolReport: { ...this.schoolReport },
      crewLeaderboard: { ...this.crewLeaderboard },
    };
  }

  private applyRemoteSharedState(shared: SharedRoomStatePayload): void {
    this.day = shared.day;
    this.money = shared.money;
    this.reputation = shared.reputation;
    if (this.shopOpen !== shared.shopOpen) {
      this.shopOpen = shared.shopOpen;
      if (this.shopOpen && this.orders.length === 0) {
        this.orderSpawnTimer = 0.05;
      }
    }
    this.shopLightsOn = shared.shopLightsOn;
    this.inventory = { ...shared.inventory };
    this.prices = { ...shared.prices };
    if (shared.extraPrices) {
      this.extraPrices = { ...this.extraPrices, ...shared.extraPrices };
    }
    if (shared.cashierSettings) {
      this.cashierSettings = { ...this.cashierSettings, ...shared.cashierSettings };
    }
    if (Array.isArray(shared.cashierReceipts)) {
      this.cashierReceipts = shared.cashierReceipts.slice(0, 60);
    }
    if (typeof shared.nextInvoiceSeq === 'number' && shared.nextInvoiceSeq >= 1) {
      this.nextInvoiceSeq = Math.max(this.nextInvoiceSeq, shared.nextInvoiceSeq);
    }
    if (Array.isArray(shared.vipMembers)) {
      this.vipMembers = shared.vipMembers.slice(0, 40);
    }
    if (Array.isArray(shared.kitchenTickets)) {
      this.kitchenTickets = shared.kitchenTickets.slice(0, 30);
    }
    if (Array.isArray(shared.shiftSettlements)) {
      this.shiftSettlements = shared.shiftSettlements.slice(0, 20);
    }
    this.upgrades = { ...shared.upgrades };
    if (shared.cityShops && shared.cityShops.length === CITY_SHOPS.length) {
      this.cityShops = shared.cityShops.map((s) => ({ ...s }));
    }
    if (shared.activeVehicleId && shared.activeVehicleId !== this.activeVehicleId) {
      this.activeVehicleId = shared.activeVehicleId;
      this.applyVehicleVisual();
    }
    if (Array.isArray(shared.ownedVehicleIds) && shared.ownedVehicleIds.length > 0) {
      this.ownedVehicleIds = [...shared.ownedVehicleIds];
    }
    this.carFuel = shared.carFuel;
    this.carCondition = shared.carCondition;
    if (shared.adBoard) {
      this.adBoard = shared.adBoard;
      this.world.setAdBoardDisplay(this.adBoard);
    }
    if (shared.employeeWallets) {
      this.employeeWallets = { ...this.employeeWallets, ...shared.employeeWallets };
    }
    if (Array.isArray(shared.instaPayTransfers)) {
      for (const tr of shared.instaPayTransfers) {
        if (!this.seenTransferIds.has(tr.id)) {
          this.seenTransferIds.add(tr.id);
          if (tr.toCharacterId === this.selectedCharacterId) {
            this.latestInstaPayToast = `💸 وصلك تحويل إنستا باي ${tr.amount} ج.م من ${tr.fromNameAr} (${tr.noteAr})`;
            this.latestInstaPayTimer = 6.5;
            this.sound.playCashRegister();
          }
        }
      }
      this.instaPayTransfers = shared.instaPayTransfers.slice(0, 40);
    }
    if (Array.isArray(shared.ownedBuildingIds)) {
      this.ownedBuildingIds = [...shared.ownedBuildingIds];
      this.world.setOwnedBuildings(this.ownedBuildingIds);
    }
    if (typeof shared.restaurantFloors === 'number') {
      this.restaurantFloors = Math.max(1, Math.min(3, shared.restaurantFloors));
      this.world.setRestaurantFloors(this.restaurantFloors);
    }
    if (Array.isArray(shared.ownedBranchIds)) {
      this.ownedBranchIds = [...shared.ownedBranchIds];
      this.world.setOwnedBranches(this.ownedBranchIds);
    }
    if (typeof shared.vehicleLockedByOwner === 'boolean') {
      this.vehicleLockedByOwner = shared.vehicleLockedByOwner;
      this.world.heroCar.setOwnerLockVisual(this.vehicleLockedByOwner);
    }
    if (shared.customProfiles) {
      this.customProfiles = shared.customProfiles;
    }
    if (shared.schoolEnrollment) {
      this.schoolEnrollment = shared.schoolEnrollment;
    }
    if (shared.crewNeeds) {
      this.crewNeeds = { ...this.crewNeeds, ...shared.crewNeeds };
    }
    if (shared.activeSeasonId) {
      this.activeSeasonId = shared.activeSeasonId;
    }
    if (Array.isArray(shared.wholesaleContracts)) {
      this.wholesaleContracts = [...shared.wholesaleContracts];
    }
    if (typeof shared.hygieneScore === 'number') {
      this.hygieneScore = shared.hygieneScore;
    }
    if (typeof shared.qualityBadgeEarned === 'boolean') {
      this.qualityBadgeEarned = shared.qualityBadgeEarned;
    }
    if (Array.isArray(shared.inspectionLogs)) {
      this.inspectionLogs = shared.inspectionLogs.slice(0, 20);
    }
    if (Array.isArray(shared.ownedFurnitureIds)) {
      this.ownedFurnitureIds = [...shared.ownedFurnitureIds];
    }
    if (typeof shared.cornicheVillaOwned === 'boolean') {
      this.cornicheVillaOwned = shared.cornicheVillaOwned;
    }
    if (shared.schoolReport) {
      this.schoolReport = { ...shared.schoolReport };
    }
    if (shared.crewLeaderboard) {
      this.crewLeaderboard = { ...shared.crewLeaderboard };
    }
    this.saveGame();
  }

  private syncRoomAction(action: string, toastAr?: string): void {
    const st = this.mp.getStatus();
    if (st.mode !== 'online') return;
    this.mp.sendAction(action, this.getSharedRoomPayload(), toastAr);
  }

  private checkRolePermission(action: RoleActionKind): boolean {
    const st = this.mp.getStatus();
    const check = canPerformFixedRoleAction(
      this.selectedCharacterId,
      st.mode === 'online',
      st.members,
      action,
    );
    if (!check.allowed) {
      this.sound.playError();
      this.showToast(check.reasonAr ?? 'هذه المهمة مخصصة لدور آخر في الفريق!');
      return false;
    }
    return true;
  }

  private requireMohamedCityManagement(): boolean {
    if (!canAccessCityManagement(this.selectedCharacterId)) {
      this.notifyCityManagementLocked();
      return false;
    }
    return true;
  }

  public notifyCityManagementLocked(): void {
    this.sound.playError();
    this.showToast('🔒 الإدارة والمدينة مخصصة للمعلم محمد حامد فقط!');
  }

  public async createAndJoinOnlineRoom(
    characterId?: PlayerCharacterId,
    displayNameAr?: string,
  ): Promise<string | null> {
    if (characterId) {
      this.selectCharacter(characterId);
    }
    const created = await createOnlineRoomRequest(this.getSharedRoomPayload());
    if (!created) {
      this.sound.playError();
      this.showToast('تعذر إنشاء غرفة أونلاين حالياً.');
      return null;
    }
    this.joinOnlineRoom(created.roomId, characterId ?? this.selectedCharacterId, displayNameAr);
    return created.roomId;
  }

  public joinOnlineRoom(
    roomId: string,
    characterId?: PlayerCharacterId,
    displayNameAr?: string,
  ): void {
    if (characterId) {
      this.selectedCharacterId = characterId;
      this.activeRole = PLAYER_CHARACTERS[characterId].roleId;
      this.applyCharacterAppearance();
    }
    const charDef = PLAYER_CHARACTERS[this.selectedCharacterId];
    this.mp.connect({
      roomId,
      characterId: this.selectedCharacterId,
      displayNameAr: displayNameAr?.trim() || charDef.nameAr,
      initialState: this.getSharedRoomPayload(),
    });
    this.emitHud();
  }

  public leaveOnlineRoom(): void {
    for (const clientId of Array.from(this.remotePlayerActors.keys())) {
      this.removeRemotePlayerActor(clientId);
    }
    this.mp.disconnect(true);
    this.showToast('عدت إلى الوضع الفردي بنجاح');
    this.emitHud();
  }

  private upsertRemotePlayerPose(pose: RemotePlayerPose): void {
    if (!pose.clientId || pose.clientId === this.mp.getStatus().clientId) return;
    let entry = this.remotePlayerActors.get(pose.clientId);
    if (!entry) {
      const def = PLAYER_CHARACTERS[pose.characterId] ?? PLAYER_CHARACTERS.ali;
      const actor = this.world.createNpcActor({
        shirtColor: def.shirtColor,
        pantsColor: def.pantsColor,
        skinColor: def.skinColor,
        hasMustache: def.hasMustache,
        hasJacket: def.hasHoodie,
        hatType: 'hair',
      });
      actor.group.position.set(pose.x, 0.08, pose.z);
      actor.group.rotation.y = pose.yaw + Math.PI;
      actor.group.visible = !pose.inCar;
      entry = { actor, pose, phase: 0 };
      this.remotePlayerActors.set(pose.clientId, entry);
      this.emitHud();
    } else {
      entry.pose = pose;
    }
  }

  private removeRemotePlayerActor(clientId: string): void {
    const entry = this.remotePlayerActors.get(clientId);
    if (!entry) return;
    this.scene.remove(entry.actor.group);
    this.remotePlayerActors.delete(clientId);
    this.emitHud();
  }

  private initPedestrianPool(): void {
    const palette: CharacterStyleOptions[] = [
      { shirtColor: 0x2b5c8f, pantsColor: 0x1e293b, skinColor: 0xc58d63, isGalabiya: true, hasMustache: true, hatType: 'taqiyah', hatColor: 0xf4f1ea },
      { shirtColor: 0x8c422c, pantsColor: 0x3b332b, skinColor: 0xd39c72, isGalabiya: true, hasBeard: true, hatType: 'hair', hatColor: 0x221b17 },
      { shirtColor: 0x3a6b4c, pantsColor: 0x2b2d30, skinColor: 0xb67a52, hatType: 'cap', hatColor: 0x1d3557 },
      { shirtColor: 0x7c3aed, pantsColor: 0x1e293b, skinColor: 0xd8a882, hasHijab: true, hijabColor: 0xf1f5f9 },
      { shirtColor: 0xbe123c, pantsColor: 0x27272a, skinColor: 0xc9926b, hasHijab: true, hijabColor: 0xfde68a },
      { shirtColor: 0x0f766e, pantsColor: 0x292524, skinColor: 0xbc8258, hasJacket: true, hasMustache: true, hatType: 'hair' },
      { shirtColor: 0xca8a04, pantsColor: 0x1f2937, skinColor: 0xc78f66, hasOveralls: true, hatType: 'cap', hatColor: 0x991b1b },
      { shirtColor: 0x475569, pantsColor: 0x18181b, skinColor: 0xd29c74, isGalabiya: false, hasMustache: true, hatType: 'hair' },
    ];

    for (let i = 0; i < MAX_PEDESTRIANS; i++) {
      const style = palette[i % palette.length];
      const actor = this.world.createNpcActor(style);
      const onNsSidewalk = i % 2 === 0;
      let startX = 0;
      let startZ = 0;
      let targetX = 0;
      let targetZ = 0;

      if (onNsSidewalk) {
        const roadX = NS_ROADS_X[i % NS_ROADS_X.length];
        const sideSign = i % 4 < 2 ? -1 : 1;
        startX = roadX + sideSign * 6.45;
        startZ = -94 + ((i * 23) % 168);
        targetX = startX;
        targetZ = startZ > 0 ? -96 : 76;
      } else {
        const roadZ = EW_ROADS_Z[i % EW_ROADS_Z.length];
        const sideSign = i % 4 < 2 ? -1 : 1;
        startZ = roadZ + sideSign * 6.45;
        startX = -88 + ((i * 29) % 176);
        targetZ = startZ;
        targetX = startX > 0 ? -90 : 90;
      }

      const startsOnRoad =
        NS_ROADS_X.some((rx) => Math.abs(startX - rx) < 5.25) ||
        EW_ROADS_Z.some((rz) => Math.abs(startZ - rz) < 5.25);
      actor.group.position.set(startX, startsOnRoad ? 0.022 : 0.14, startZ);
      this.pedestrians.push({
        actor,
        role: 'pedestrian',
        x: startX,
        z: startZ,
        targetX,
        targetZ,
        speed: 1.45 + (i % 5) * 0.24,
        walkPhase: i * 1.1,
        isRunner: i % 11 === 0,
      });
    }
  }

  private initTrafficFleet(): void {
    const kinds: TrafficVehicleKind[] = [
      'taxi',
      'microbus',
      'sedan',
      'pickup',
      'tuktuk',
      'motorcycle',
    ];
    const colors = [0x1e40af, 0x0f766e, 0x7c2d12, 0x334155, 0xca8a04, 0x991b1b];

    for (let i = 0; i < MAX_TRAFFIC_VEHICLES; i++) {
      const kind = kinds[i % kinds.length];
      const mesh = this.world.createTrafficVehicle(kind, colors[i % colors.length]);
      const axis: 'ns' | 'ew' = i % 2 === 0 ? 'ns' : 'ew';
      const dir: 1 | -1 = i % 4 < 2 ? 1 : -1;
      const roadCoord =
        axis === 'ns'
          ? NS_ROADS_X[i % NS_ROADS_X.length]
          : EW_ROADS_Z[i % EW_ROADS_Z.length];
      const posAlong =
        axis === 'ns' ? -98 + ((i * 21) % 172) : -90 + ((i * 25) % 180);

      const t: TrafficRuntime = {
        mesh,
        kind,
        axis,
        roadCoord,
        posAlong,
        dir,
        speed:
          kind === 'tuktuk'
            ? 6.0
            : kind === 'motorcycle'
              ? 10.6
              : kind === 'microbus'
                ? 8.2
                : 9.4,
        lastCrossIndex: -1,
      };
      this.positionTrafficMesh(t);
      this.trafficFleet.push(t);
    }
  }

  private positionTrafficMesh(t: TrafficRuntime): void {
    // Right-hand lane rule (+2.1 to the right of travel direction)
    if (t.axis === 'ns') {
      // Moving +Z -> right is -X; moving -Z -> right is +X
      const laneX = t.roadCoord + (t.dir === 1 ? -2.2 : 2.2);
      t.mesh.position.set(laneX, 0, t.posAlong);
      // Vehicle model forward is -Z; dir=+1 (+Z) needs rotation Math.PI
      t.mesh.rotation.y = t.dir === 1 ? Math.PI : 0;
    } else {
      // Moving +X -> right is +Z; moving -X -> right is -Z
      const laneZ = t.roadCoord + (t.dir === 1 ? 2.2 : -2.2);
      t.mesh.position.set(t.posAlong, 0, laneZ);
      // Forward -Z rotated -PI/2 faces +X; +PI/2 faces -X
      t.mesh.rotation.y = t.dir === 1 ? -Math.PI / 2 : Math.PI / 2;
    }
  }

  private applyDensitySettings(): void {
    const pedTarget = Math.round((this.density.pedestrianDensity / 100) * MAX_PEDESTRIANS);
    const carTarget = Math.round((this.density.trafficDensity / 100) * MAX_TRAFFIC_VEHICLES);
    this.activePedestrianCount = pedTarget;
    this.activeTrafficCount = carTarget;

    for (let i = 0; i < this.pedestrians.length; i++) {
      this.pedestrians[i].actor.group.visible = i < pedTarget;
    }
    for (let i = 0; i < this.trafficFleet.length; i++) {
      this.trafficFleet[i].mesh.visible = i < carTarget;
    }
    this.world.propClutterGroup.visible = this.density.propDensity >= 20;
  }

  private initParticles(): void {
    for (let i = 0; i < 24; i++) {
      const isPot = i < 12;
      this.steamParticles.push({
        x: -12.2 + (Math.random() - 0.5) * 0.35,
        y: 1.55 + Math.random() * 0.7,
        z: (isPot ? 1.0 : -0.35) + (Math.random() - 0.5) * 0.35,
        vy: 0.45 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
      });
    }
    for (let i = 0; i < 140; i++) {
      this.rainDrops.push({
        x: (Math.random() - 0.5) * 44,
        y: Math.random() * 14,
        z: (Math.random() - 0.5) * 44,
      });
    }
  }

  private spawnCelebrationBurst(x: number, y: number, z: number): void {
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const spd = 1.4 + Math.random() * 2.0;
      this.burstParticles.push({
        x,
        y,
        z,
        vx: Math.cos(ang) * spd,
        vy: 2.2 + Math.random() * 2.4,
        vz: Math.sin(ang) * spd,
        life: 0,
        maxLife: 0.7 + Math.random() * 0.35,
      });
    }
  }

  private handleResize(): void {
    if (this.disposed) return;
    const w = Math.max(1, this.container.clientWidth || window.innerWidth);
    const h = Math.max(1, this.container.clientHeight || window.innerHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    const dom = this.renderer.domElement;
    dom.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const targetEl = e.target as HTMLElement | null;
    if (
      targetEl &&
      (targetEl.tagName === 'INPUT' ||
        targetEl.tagName === 'TEXTAREA' ||
        targetEl.tagName === 'SELECT' ||
        targetEl.isContentEditable)
    ) {
      if (e.code === 'Escape') {
        targetEl.blur();
      }
      return;
    }

    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(
        e.code,
      )
    ) {
      if (this.phase === 'playing' && !this.isUiModalOpen()) {
        e.preventDefault();
      }
    }

    const firstPress = !this.keysHeld.has(e.code);
    this.keysHeld.add(e.code);
    if (!firstPress) return;

    if (this.phase === 'title') {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this.startGame();
      }
      return;
    }

    if (e.code === 'Escape' || e.code === 'KeyP') {
      if (this.phoneModalOpen) {
        if (e.code === 'Escape') {
          window.dispatchEvent(new CustomEvent('elmoalem:close-modals'));
        }
        return;
      }
      if (this.activeDialogue) {
        this.closeDialogue();
        return;
      }
      if (this.activeShopOwnerId) {
        this.closeShopOwnerModal();
        return;
      }
      if (this.phase === 'playing') {
        this.pauseGame();
      } else if (this.phase === 'paused') {
        this.resumeGame();
      }
      return;
    }

    if (this.phase !== 'playing' || this.isUiModalOpen()) return;

    if (e.code === 'KeyE') {
      this.triggerInteract();
    } else if (e.code === 'KeyF') {
      this.toggleCarMode();
    } else if (e.code === 'KeyC') {
      this.cycleCamera();
    } else if (e.code === 'KeyL' && this.inCar) {
      this.toggleCarHeadlights();
    } else if (e.code === 'KeyR' && this.inCar) {
      this.cycleRadioStation();
    } else if (e.code === 'KeyQ' && this.inCar) {
      this.toggleCarBlinker('left');
    } else if (e.code === 'KeyZ' && this.inCar) {
      this.toggleCarBlinker('right');
    } else if (e.code === 'KeyH' && this.inCar) {
      this.sound.playCarHorn();
    } else if (e.code === 'KeyM') {
      document.exitPointerLock?.();
      window.dispatchEvent(new CustomEvent('elmoalem:toggle-phone'));
    } else if (e.code === 'KeyK') {
      document.exitPointerLock?.();
      window.dispatchEvent(new CustomEvent('elmoalem:toggle-cashier'));
    } else if (e.code === 'Digit1') {
      this.tryQuickAddIngredient('bread');
    } else if (e.code === 'Digit2') {
      this.tryQuickAddIngredient('ful');
    } else if (e.code === 'Digit3') {
      this.tryQuickAddIngredient('taameya');
    } else if (e.code === 'Digit4') {
      this.tryQuickAddIngredient('salad');
    } else if (e.code === 'Digit5') {
      this.tryQuickAddIngredient('tahina');
    } else if (e.code === 'Digit6') {
      this.tryQuickAddIngredient('pickles');
    } else if (e.code === 'Digit7') {
      this.tryQuickAddIngredient('fries');
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keysHeld.delete(e.code);
  };

  private onWindowBlur = (): void => {
    this.keysHeld.clear();
    this.dragLooking = false;
    this.mobileMoveX = 0;
    this.mobileMoveY = 0;
    this.mobileSprint = false;
  };

  private onVisibilityChange = (): void => {
    if (document.hidden) {
      this.onWindowBlur();
    }
  };

  private onMouseDown = (e: MouseEvent): void => {
    if (this.phase !== 'playing' || this.isUiModalOpen()) return;
    if (e.button === 0) {
      this.dragLooking = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      const canvas = this.renderer.domElement;
      if (document.pointerLockElement !== canvas && canvas.requestPointerLock) {
        try {
          const p = canvas.requestPointerLock() as unknown as Promise<void> | undefined;
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch {
          // ignore in headless
        }
      }
    }
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (this.phase !== 'playing' || this.isUiModalOpen()) return;
    if (document.pointerLockElement === this.renderer.domElement) {
      this.playerYaw -= e.movementX * 0.0024;
      this.playerPitch = THREE.MathUtils.clamp(
        this.playerPitch - e.movementY * 0.0022,
        -1.15,
        1.15,
      );
    } else if (this.dragLooking) {
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.playerYaw -= dx * 0.0038;
      this.playerPitch = THREE.MathUtils.clamp(
        this.playerPitch - dy * 0.0032,
        -1.15,
        1.15,
      );
    }
  };

  private onMouseUp = (): void => {
    this.dragLooking = false;
  };

  // --- Public UI Controls & Mobile Input ---
  public setMobileMove(x: number, y: number): void {
    this.mobileMoveX = x;
    this.mobileMoveY = y;
  }

  public applyTouchLookDelta(dx: number, dy: number): void {
    if (this.phase !== 'playing' || this.isUiModalOpen()) return;
    this.playerYaw -= dx * 0.0045;
    this.playerPitch = THREE.MathUtils.clamp(
      this.playerPitch - dy * 0.004,
      -1.15,
      1.15,
    );
  }

  public setMobileSprint(active: boolean): void {
    this.mobileSprint = active;
  }

  public setDensitySettings(partial: Partial<DensitySettings>): void {
    this.density = clampDensitySettings({ ...this.density, ...partial });
    this.applyDensitySettings();
    this.saveGame();
    this.emitHud();
  }

  public toggleCarHeadlights(): void {
    this.carHeadlightsOn = !this.carHeadlightsOn;
    this.sound.playPickup();
    this.showToast(this.carHeadlightsOn ? 'تم تشغيل كشافات السيارة' : 'تم إطفاء الكشافات');
    this.emitHud();
  }

  public toggleCarBlinker(side: 'left' | 'right'): void {
    if (side === 'left') {
      this.carLeftBlinker = !this.carLeftBlinker;
      if (this.carLeftBlinker) this.carRightBlinker = false;
    } else {
      this.carRightBlinker = !this.carRightBlinker;
      if (this.carRightBlinker) this.carLeftBlinker = false;
    }
    this.blinkerTimer = 0;
    this.blinkerPhaseOn = true;
    this.emitHud();
  }

  private syncMusicEngine(): void {
    this.sound.setContinuousMusic({
      station: this.radioStation,
      isPlaying: this.phase === 'playing',
      paused: this.musicPaused,
      externalStreamActive: this.externalYoutubeActive,
      trackIndex: this.hamoTrackIndex,
      onAutoAdvanceTrack: (nextIdx) => {
        this.hamoTrackIndex = nextIdx;
        this.emitHud();
      },
    });
  }

  public cycleRadioStation(): void {
    const order: RadioStationId[] = ['hamo_morshedy', 'shaabi', 'cairo_fm', 'oud', 'off'];
    const idx = order.indexOf(this.radioStation);
    this.radioStation = order[(idx + 1) % order.length];
    this.musicPaused = false;
    this.syncMusicEngine();
    const labels: Record<RadioStationId, string> = {
      hamo_morshedy: 'حمو المرشدي — مهرجانات متواصلة 🎵',
      shaabi: 'راديو الشعبي والمهرجانات',
      cairo_fm: 'إذاعة القاهرة FM 104.2',
      oud: 'طرب العود الأصيل',
      off: 'المزيكا مطفية',
    };
    this.showToast(`الصوتيات: ${labels[this.radioStation]}`);
    this.saveGame();
    this.emitHud();
  }

  public setRadioStation(station: RadioStationId): void {
    this.radioStation = station;
    if (station !== 'off') {
      this.musicPaused = false;
    }
    this.syncMusicEngine();
    this.saveGame();
    this.emitHud();
  }

  public setHamoTrack(index: number): void {
    this.hamoTrackIndex = normalizeHamoTrackIndex(index);
    this.radioStation = 'hamo_morshedy';
    this.musicPaused = false;
    this.syncMusicEngine();
    const track = getHamoTrack(this.hamoTrackIndex);
    this.showToast(`🎵 شغال الآن: ${track.titleAr} — ${track.artistAr}`);
    this.saveGame();
    this.emitHud();
  }

  public nextHamoTrack(): void {
    this.setHamoTrack(getNextHamoTrackIndex(this.hamoTrackIndex));
  }

  public prevHamoTrack(): void {
    this.setHamoTrack(getPrevHamoTrackIndex(this.hamoTrackIndex));
  }

  public toggleMusicPaused(): void {
    if (this.radioStation === 'off') {
      this.radioStation = 'hamo_morshedy';
      this.musicPaused = false;
    } else {
      this.musicPaused = !this.musicPaused;
    }
    this.syncMusicEngine();
    this.emitHud();
  }

  public setYoutubeMusicActive(active: boolean): void {
    if (this.externalYoutubeActive === active) return;
    this.externalYoutubeActive = active;
    if (active) {
      this.radioStation = 'hamo_morshedy';
      this.musicPaused = false;
    }
    this.syncMusicEngine();
    this.emitHud();
  }

  public setCareerJob(jobId: CareerJobId): void {
    this.activeJob = jobId;
    if (jobId === 'taxi') {
      this.spawnTaxiMission();
    } else {
      this.activeTaxi = null;
      this.world.taxiPassengerActor.group.visible = false;
      this.world.taxiPickupBeacon.visible = false;
      this.world.taxiDropoffBeacon.visible = false;
    }

    if (jobId === 'mechanic') {
      this.spawnRepairMission();
    } else {
      this.activeRepair = null;
    }

    const def = CAREER_JOBS[jobId];
    this.sound.playPickup();
    this.showToast(`وظيفتك الحالية: ${def.titleAr} — ${def.bonusAr}`);
    this.saveGame();
    this.emitHud();
  }

  private spawnTaxiMission(): void {
    const startIdx = Math.floor(Math.random() * TAXI_WAYPOINTS.length);
    let endIdx = (startIdx + 2 + Math.floor(Math.random() * (TAXI_WAYPOINTS.length - 3))) % TAXI_WAYPOINTS.length;
    if (endIdx === startIdx) endIdx = (startIdx + 1) % TAXI_WAYPOINTS.length;

    const pickup = TAXI_WAYPOINTS[startIdx];
    const dropoff = TAXI_WAYPOINTS[endIdx];
    const dist = Math.hypot(dropoff.x - pickup.x, dropoff.z - pickup.z);
    const fare = computeTaxiFare(dist, this.reputation);

    this.activeTaxi = {
      passengerName: EGYPTIAN_NAMES[Math.floor(Math.random() * EGYPTIAN_NAMES.length)],
      pickupStreetAr: pickup.streetAr,
      dropoffStreetAr: dropoff.streetAr,
      pickupX: pickup.x,
      pickupZ: pickup.z,
      dropoffX: dropoff.x,
      dropoffZ: dropoff.z,
      pickedUp: false,
      fare,
      timer: 140,
    };

    this.world.taxiPassengerActor.group.visible = true;
    this.world.taxiPassengerActor.group.position.set(pickup.x, 0.14, pickup.z);
    this.world.taxiPickupBeacon.visible = true;
    this.world.taxiPickupBeacon.position.set(pickup.x, 0, pickup.z);
    this.world.taxiDropoffBeacon.visible = false;
  }

  private spawnRepairMission(): void {
    this.activeRepair = {
      id: `rep-${Date.now()}`,
      vehicleNameAr: 'سيارة زبون — عطل موتور',
      issueAr: 'صيانة البطارية والرادياتير في ورشة الأسطى بليغ',
      reward: this.activeJob === 'mechanic' ? 75 : 55,
      x: 31.2,
      z: -20.5,
      progress: 0,
    };
  }

  public closeShopOwnerModal(): void {
    this.activeShopOwnerId = null;
    this.emitHud();
  }

  public buyFromShopOwner(shopId: string, goodId: string): void {
    const shop = CITY_SHOPS.find((s) => s.id === shopId);
    const good = shop?.goods.find((g) => g.id === goodId);
    if (!shop || !good) return;

    const effectiveCost = computeDiscountedGoodCost(
      good.cost,
      shopId,
      this.activeStreetEvent,
    );

    if (this.money < effectiveCost) {
      this.sound.playError();
      this.showToast(`تحتاج ${effectiveCost} ج.م للشراء من ${shop.ownerNameAr}`);
      return;
    }

    this.money -= effectiveCost;
    this.dailyStats.expenses += effectiveCost;

    if (good.ingredientId && good.packQty) {
      this.inventory = {
        ...this.inventory,
        [good.ingredientId]: this.inventory[good.ingredientId] + good.packQty,
      };
    }
    if (good.fuelBoost) {
      this.carFuel = Math.min(100, this.carFuel + good.fuelBoost);
      this.carCondition = 100;
    }
    if (good.reputationBoost) {
      this.reputation = clampReputation(this.reputation + good.reputationBoost);
    }

    let extraFlashMsg = '';
    if (
      this.activeStreetEvent &&
      !this.activeStreetEvent.resolved &&
      this.activeStreetEvent.type === 'flash_sale' &&
      this.activeStreetEvent.shopId === shopId
    ) {
      const rew = resolveStreetEventReward(this.activeStreetEvent);
      this.money += rew.moneyGain;
      this.dailyStats.revenue += rew.moneyGain;
      this.reputation = clampReputation(this.reputation + rew.repGain);
      this.activeStreetEvent = null;
      this.streetEventCooldown = 28 + Math.random() * 14;
      this.syncStreetEventVisuals(0);
      extraFlashMsg = ` · ${rew.toastAr}`;
    }

    this.sound.playCashRegister();
    this.saveGame();
    this.showToast(`اشتريت ${good.labelAr} من ${shop.ownerNameAr}${extraFlashMsg}`);
    this.emitHud();
  }

  public buyCityShopById(shopId: string): void {
    if (!this.requireMohamedCityManagement()) return;
    const res = buyCityShop(this.money, this.cityShops, shopId);
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر شراء المحل');
      return;
    }
    const def = CITY_SHOPS.find((s) => s.id === shopId);
    this.dailyStats.expenses += this.money - res.money;
    this.money = res.money;
    this.cityShops = res.shops;
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(this.playerX, 1.8, this.playerZ);
    this.saveGame();
    const msg = `ألف مبروك! أصبحت مالك "${def?.nameAr ?? ''}" بالكامل!`;
    this.showToast(msg);
    this.syncRoomAction('buy_city_shop', `محمد اشترى ${def?.nameAr ?? 'محل جديد'} للفريق!`);
    this.emitHud();
  }

  public hireCityShopManager(shopId: string): void {
    if (!this.requireMohamedCityManagement()) return;
    const res = hireShopManager(this.money, this.cityShops, shopId);
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر تعيين مدير');
      return;
    }
    this.money = res.money;
    this.dailyStats.expenses += res.cost;
    this.cityShops = res.shops;
    this.sound.playCashRegister();
    this.saveGame();
    this.showToast('تم تعيين مدير للمحل — الأرباح اليومية زادت +٥٥٪');
    this.syncRoomAction('hire_manager', 'محمد عيّن مدير جديد لمحل المدينة!');
    this.emitHud();
  }

  public collectShopDividends(): void {
    if (!this.requireMohamedCityManagement()) return;
    const res = collectAllShopProfits(this.money, this.cityShops);
    if (res.totalCollected <= 0) {
      this.sound.playError();
      this.showToast('لا توجد أرباح جاهزة للتحصيل حالياً');
      return;
    }
    this.money = res.money;
    this.cityShops = res.shops;
    this.dailyStats.revenue += res.totalCollected;
    this.dailyStats.shopDividends += res.totalCollected;
    this.sound.playCashRegister();
    this.saveGame();
    this.showToast(`تم تحصيل ${res.totalCollected} ج.م أرباح محلاتك بالمدينة!`);
    this.syncRoomAction('collect_profits', `محمد حصّل +${res.totalCollected} ج.م أرباح المحلات!`);
    this.emitHud();
  }

  // --- Vehicles, Apartments, Marriage & Branching Dialogue ---
  public buyVehicleById(vehicleId: OwnedVehicleId): void {
    const res = buyVehicle(this.money, this.ownedVehicleIds, vehicleId);
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر شراء السيارة');
      return;
    }
    const def = VEHICLE_CATALOG[vehicleId];
    this.dailyStats.expenses += this.money - res.money;
    this.money = res.money;
    this.ownedVehicleIds = res.ownedVehicleIds;
    this.activeVehicleId = vehicleId;
    this.applyVehicleVisual();
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(this.carX, 1.5, this.carZ);
    this.saveGame();
    this.showToast(`مبروك عليك ${def.nameAr}! تم تسليمها عند المحل`);
    this.emitHud();
  }

  public selectActiveVehicle(vehicleId: OwnedVehicleId): void {
    if (!this.ownedVehicleIds.includes(vehicleId)) return;
    this.activeVehicleId = vehicleId;
    this.applyVehicleVisual();
    this.sound.playPickup();
    this.saveGame();
    this.showToast(`ركبت الآن: ${VEHICLE_CATALOG[vehicleId].nameAr}`);
    this.emitHud();
  }

  public buyApartmentById(apartmentId: ApartmentId): void {
    const res = buyApartment(this.money, this.ownedApartmentIds, apartmentId);
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر شراء الشقة');
      return;
    }
    const def = APARTMENT_CATALOG[apartmentId];
    this.dailyStats.expenses += this.money - res.money;
    this.money = res.money;
    this.ownedApartmentIds = res.ownedApartmentIds;
    this.activeApartmentId = apartmentId;
    this.reputation = clampReputation(this.reputation + 5);
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(this.playerX, 1.8, this.playerZ);
    this.saveGame();
    this.showToast(`ألف مبروك! اشتريت ${def.nameAr} — جاهزة للجواز والأسرة!`);
    this.emitHud();
  }

  public selectActiveApartment(apartmentId: ApartmentId): void {
    if (!this.ownedApartmentIds.includes(apartmentId)) return;
    this.activeApartmentId = apartmentId;
    this.sound.playPickup();
    this.saveGame();
    this.showToast(`سكنك الرئيسي الآن: ${APARTMENT_CATALOG[apartmentId].nameAr}`);
    this.emitHud();
  }

  public marryRomanceNpcById(girlId: string): void {
    const res = marryNpc(this.money, this.ownedApartmentIds, this.romanceStates, girlId);
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر إتمام الزواج');
      return;
    }
    const def = ROMANCE_NPCS.find((g) => g.id === girlId);
    this.dailyStats.expenses += this.money - res.money;
    this.money = res.money;
    this.spouseId = res.spouseId;
    this.marriedDay = this.day;
    this.marriageElapsedSec = 0;
    this.childUnlockNotified = false;
    this.romanceStates = res.romanceStates;
    this.reputation = clampReputation(this.reputation + 10);
    this.syncFamilyActorsVisibility();
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(this.playerX, 2.0, this.playerZ);
    this.saveGame();
    this.showToast(`ألف مبروك يا عريس! اتجوزت ${def?.nameAr ?? ''} ❤️ في البيت الثابت!`);
    this.syncRoomAction('marry', `${PLAYER_CHARACTERS[this.selectedCharacterId].nameAr} اتجوز ${def?.nameAr ?? ''}! 🎉`);
    this.emitHud();
  }

  public haveFamilyChild(): void {
    const res = haveChild(this.money, this.spouseId, this.children, {
      currentDay: this.day,
      marriedDay: this.marriedDay,
      marriageElapsedSec: this.marriageElapsedSec,
    });
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر الإنجاب');
      return;
    }
    this.dailyStats.expenses += this.money - res.money;
    this.money = res.money;
    this.children = res.children;
    this.reputation = clampReputation(this.reputation + 5);
    this.syncFamilyActorsVisibility();
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(this.playerX, 2.0, this.playerZ);
    this.saveGame();
    this.showToast(`ألف مبروك المولود "${res.newChild?.nameAr ?? ''}" 🎉 نور البيت الثابت!`);
    this.syncRoomAction('have_child', `ربنا رزق ${PLAYER_CHARACTERS[this.selectedCharacterId].nameAr} بمولود جديد: ${res.newChild?.nameAr ?? ''}!`);
    this.emitHud();
  }

  public callFamilyMember(memberId: string): void {
    const member = this.householdFamily.find((m) => m.id === memberId);
    const spouse = this.spouseId ? ROMANCE_NPCS.find((g) => g.id === this.spouseId) : null;
    this.reputation = clampReputation(this.reputation + 1);
    this.sound.playPickup();
    if (spouse && (memberId === spouse.id || memberId === 'spouse')) {
      this.showToast(`مكالمة دافية مع ${spouse.nameAr}: "مستنياك في الشقة يا معلم ❤️" (+١ سمعة)`);
    } else if (member) {
      this.showToast(`${member.nameAr} (${member.roomAr}): "البيت بخير يا بابا، ربنا يرزقك!" (+١ سمعة)`);
    } else {
      this.showToast('طمنّت على أهلك في البيت واطمنت عليك الحارة (+١ سمعة)');
    }
    this.emitHud();
  }

  public inviteCompanionFromPhone(): void {
    if (this.companionDef) {
      const prevName = this.companionDef.nameAr;
      this.companionDef = null;
      this.companionCornicheDone = false;
      this.world.heroCar.setCompanionVisible(false);
      this.sound.playPickup();
      this.showToast(`انتهت الفسحة وعادت ${prevName} للبيت`);
      this.emitHud();
      return;
    }

    const spouse = this.spouseId ? ROMANCE_NPCS.find((g) => g.id === this.spouseId) : null;
    const warmRomance = this.romanceStates
      .filter((r) => r.affection >= 45)
      .sort((a, b) => b.affection - a.affection)[0];
    const romanceDef = warmRomance
      ? ROMANCE_NPCS.find((g) => g.id === warmRomance.id) ?? null
      : null;

    if (spouse) {
      this.companionDef = {
        nameAr: spouse.nameAr,
        dressColor: spouse.dressColor,
        skinColor: spouse.skinColor,
        hijabColor: 0xf8fafc,
      };
    } else if (romanceDef) {
      this.companionDef = {
        nameAr: romanceDef.nameAr,
        dressColor: romanceDef.dressColor,
        skinColor: romanceDef.skinColor,
        hijabColor: 0xfef3c7,
      };
    } else {
      this.sound.playError();
      this.showToast('أنت لسه أعزب! اتعرف على بنت الحلال وارفع المودة لـ ٤٥٪ الأول 🚗');
      this.emitHud();
      return;
    }

    this.companionCornicheDone = false;
    this.world.heroCar.setCompanionVisible(
      true,
      this.companionDef.dressColor,
      this.companionDef.skinColor,
      this.companionDef.hijabColor,
    );
    this.sound.playPickup();
    this.showToast(
      `${this.companionDef.nameAr} ركبت جنبك في العربية! طلع بيها على الكورنيش (شارع النيل) 🚗❤️`,
    );
    this.emitHud();
  }

  public triggerQuickTaxiOrDelivery(): void {
    if (this.activeJob !== 'taxi') {
      this.setCareerJob('taxi');
      return;
    }
    if (!this.activeTaxi) {
      this.spawnTaxiMission();
    }
    if (this.activeTaxi) {
      this.sound.playPickup();
      this.showToast(
        `طلب تاكسي نشط: ${this.activeTaxi.passengerName} عند ${this.activeTaxi.pickupStreetAr} (${this.activeTaxi.fare} ج.م)`,
      );
      this.emitHud();
    }
  }

  private getDialogueContext(): DialogueTurnContext {
    return {
      money: this.money,
      reputation: this.reputation,
      activeVehicleId: this.activeVehicleId,
      ownedApartmentIds: this.ownedApartmentIds,
      spouseId: this.spouseId,
      marriedDay: this.marriedDay,
      marriageElapsedSec: this.marriageElapsedSec,
      currentDay: this.day,
      children: this.children,
      romanceStates: this.romanceStates,
    };
  }

  public async updateAdBoardOffer(patch: Partial<ElectronicAdBoardState>): Promise<void> {
    if (!this.checkRolePermission('manage_shop')) return;
    const clockStr = formatGameClock(this.timeOfDay);
    this.adBoard = updateAdBoard(this.adBoard, patch, clockStr);
    this.world.setAdBoardDisplay(this.adBoard);
    this.sound.playPickup();
    this.saveGame();
    this.showToast(
      this.adBoard.active
        ? `📺 تم تحديث شاشة العروض: "${this.adBoard.headlineAr}" (خصم ${this.adBoard.discountPct}٪)`
        : '📺 تم إطفاء شاشة الإعلانات الإلكترونية',
    );
    this.syncRoomAction(
      'update_ad_board',
      `المعلم محمد حدّث شاشة عروض المحل: ${this.adBoard.headlineAr}`,
    );
    this.emitHud();
  }

  public sendInstaPaySalary(
    toCharacterId: PlayerCharacterId,
    amount: number,
    noteAr?: string,
  ): boolean {
    if (this.selectedCharacterId !== 'mohamed' && !this.checkRolePermission('manage_shop')) {
      return false;
    }
    const clockStr = formatGameClock(this.timeOfDay);
    const res = sendInstaPayTransfer({
      senderCharacterId: this.selectedCharacterId,
      senderMoney: this.money,
      wallets: this.employeeWallets,
      toCharacterId,
      amount,
      noteAr,
      clockStr,
      day: this.day,
      profiles: this.customProfiles,
    });
    if (!res.ok || !res.record) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر إرسال تحويل إنستا باي');
      return false;
    }
    this.money = res.senderMoney;
    this.dailyStats.expenses += res.record.amount;
    this.employeeWallets = {
      ...res.wallets,
      mohamed: this.money,
    };
    this.seenTransferIds.add(res.record.id);
    this.instaPayTransfers = [res.record, ...this.instaPayTransfers].slice(0, 40);
    this.latestInstaPayToast = `💸 تم تحويل ${res.record.amount.toLocaleString('en-US')} ج.م إنستا باي إلى ${res.record.toNameAr}`;
    this.latestInstaPayTimer = 5.5;
    this.sound.playCashRegister();
    this.saveGame();
    this.showToast(this.latestInstaPayToast);
    this.syncRoomAction(
      'insta_pay_transfer',
      `💸 ${OWNER_DISPLAY_NAME_AR} حوّل ${res.record.amount} ج.م إنستا باي إلى ${res.record.toNameAr}!`,
    );
    this.emitHud();
    return true;
  }

  public performInventoryAudit(): InventoryAuditRecord {
    const profile = getResolvedCharacterProfile(this.selectedCharacterId, this.customProfiles);
    const record = runInventoryAudit({
      inventory: this.inventory,
      consumedToday: this.inventoryConsumedToday,
      clockStr: formatGameClock(this.timeOfDay),
      day: this.day,
      auditorNameAr: profile.nameAr,
    });
    this.inventoryAuditLogs = [record, ...this.inventoryAuditLogs].slice(0, 20);
    this.sound.playPickup();
    this.saveGame();
    this.showToast(
      `📋 جرد المخزون تم: ${record.totalUnits} وحدة (قيمة ${record.estimatedValue.toLocaleString('en-US')} ج.م · نواقص: ${record.lowStockCount})`,
    );
    this.emitHud();
    return record;
  }

  public buyBuildingById(buildingId: OwnableBuildingId): void {
    if (!this.checkRolePermission('manage_shop')) return;
    const res = buyOwnableBuilding(this.money, this.ownedBuildingIds, buildingId);
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر شراء العمارة');
      return;
    }
    const def = OWNABLE_BUILDINGS.find((b) => b.id === buildingId);
    this.dailyStats.expenses += this.money - res.money;
    this.money = res.money;
    if (this.selectedCharacterId === 'mohamed') this.employeeWallets.mohamed = this.money;
    this.ownedBuildingIds = res.ownedBuildingIds;
    this.world.setOwnedBuildings(this.ownedBuildingIds);
    this.reputation = clampReputation(this.reputation + 6);
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(this.playerX, 2.0, this.playerZ);
    this.saveGame();
    const msg = `🏢 مبروك! المعلم محمد اشترى ${def?.nameAr ?? 'عمارة جديدة'} بالكامل!`;
    this.showToast(msg);
    this.syncRoomAction('buy_building', msg);
    this.emitHud();
  }

  public upgradeRestaurantFloorLevel(): void {
    if (!this.checkRolePermission('manage_shop')) return;
    const res = upgradeRestaurantFloor(this.money, this.restaurantFloors);
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر بناء الدور');
      return;
    }
    this.dailyStats.expenses += res.cost;
    this.money = res.money;
    if (this.selectedCharacterId === 'mohamed') this.employeeWallets.mohamed = this.money;
    this.restaurantFloors = res.floors;
    this.world.setRestaurantFloors(this.restaurantFloors);
    this.reputation = clampReputation(this.reputation + 8);
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(-12.5, 3.8, 0);
    this.saveGame();
    const msg = `🏗️ تم بناء الدور ${this.restaurantFloors} لمطعم المعلم! سلم الصعود والروف جاهزين`;
    this.showToast(msg);
    this.syncRoomAction('upgrade_restaurant_floor', msg);
    this.emitHud();
  }

  public buyRestaurantBranchById(branchId: RestaurantBranchId): void {
    if (!this.checkRolePermission('manage_shop')) return;
    const res = buyRestaurantBranch(this.money, this.ownedBranchIds, branchId);
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر افتتاح الفرع');
      return;
    }
    const def = RESTAURANT_BRANCHES.find((b) => b.id === branchId);
    this.dailyStats.expenses += this.money - res.money;
    this.money = res.money;
    if (this.selectedCharacterId === 'mohamed') this.employeeWallets.mohamed = this.money;
    this.ownedBranchIds = res.ownedBranchIds;
    this.world.setOwnedBranches(this.ownedBranchIds);
    this.reputation = clampReputation(this.reputation + 7);
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(this.playerX, 2.0, this.playerZ);
    this.saveGame();
    const msg = `🥙 مبروك! تم افتتاح ${def?.nameAr ?? 'فرع جديد'} في ${def?.streetAr ?? ''}!`;
    this.showToast(msg);
    this.syncRoomAction('buy_restaurant_branch', msg);
    this.emitHud();
  }

  public toggleVehicleOwnerLock(): void {
    if (this.selectedCharacterId !== 'mohamed') {
      this.sound.playError();
      this.showToast(`🔒 قفل وفتح السيارة خاص بـ ${OWNER_DISPLAY_NAME_AR} فقط!`);
      return;
    }
    this.vehicleLockedByOwner = !this.vehicleLockedByOwner;
    this.world.heroCar.setOwnerLockVisual(this.vehicleLockedByOwner);
    this.sound.playDoor();
    this.saveGame();
    const msg = this.vehicleLockedByOwner
      ? '🔒 تم تفعيل قفل المعلم للسيارة — مفيش حد يسوقها غيرك!'
      : '🔓 تم فتح قفل السيارة لجميع أعضاء الفريق';
    this.showToast(msg);
    this.syncRoomAction('toggle_vehicle_lock', msg);
    this.emitHud();
  }

  public updateCustomProfileSettings(patch: Partial<CustomProfilesMap>): void {
    if (!this.checkRolePermission('manage_shop')) return;
    this.customProfiles = updateCustomProfiles(this.customProfiles, patch);
    this.sound.playPickup();
    this.saveGame();
    this.showToast('✏️ تم تحديث الأسامي والمهن (مع تثبيت المعلم محمد حامد كصاحب المحل)');
    this.syncRoomAction('update_custom_profiles', 'المعلم محمد حدّث أسماء ومهن الفريق والأسرة!');
    this.emitHud();
  }

  public enrollBenhaSchool(target: 'son' | 'daughter' | 'both'): void {
    const res = enrollChildInBenhaSchool(this.money, this.schoolEnrollment, target, this.day);
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر التقديم في مدرسة بنها الخاصة');
      return;
    }
    this.money = res.money;
    this.dailyStats.expenses += res.cost;
    if (this.selectedCharacterId === 'mohamed') this.employeeWallets.mohamed = this.money;
    this.schoolEnrollment = res.enrollment;
    this.reputation = clampReputation(this.reputation + 6);
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(this.playerX, 2.0, this.playerZ);
    this.saveGame();
    this.showToast('🎓 تم تقديم الابن والابنة بنجاح في مدرسة بنها الخاصة (٣ مباني × ٤ طوابق)!');
    this.syncRoomAction('enroll_school', 'المعلم محمد قدّم لأولاده في مدرسة بنها الخاصة! 🎒');
    this.emitHud();
  }

  public eatFood(): void {
    this.playerNeeds = restoreNeeds(this.playerNeeds, 42, 6);
    this.crewNeeds = {
      ...this.crewNeeds,
      [this.selectedCharacterId]: this.playerNeeds,
      ahmed: restoreNeeds(this.crewNeeds.ahmed, 25, 0),
      ali: restoreNeeds(this.crewNeeds.ali, 25, 0),
      mahmoud: restoreNeeds(this.crewNeeds.mahmoud, 25, 0),
    };
    this.localAnimOverride = 'eat';
    this.localAnimOverrideTimer = 2.0;
    this.localSpeechOverride = 'بالهنا والشفا يا معلم! 🥙';
    this.localSpeechTimer = 3.0;
    this.sound.playPickup();
    this.saveGame();
    this.showToast('🥙 أكلت وجبة ساخنة! نسبة الشبع ارتفعت الآن');
    this.emitHud();
  }

  public drinkWater(): void {
    this.playerNeeds = restoreNeeds(this.playerNeeds, 0, 48);
    this.crewNeeds = {
      ...this.crewNeeds,
      [this.selectedCharacterId]: this.playerNeeds,
      ahmed: restoreNeeds(this.crewNeeds.ahmed, 0, 28),
      ali: restoreNeeds(this.crewNeeds.ali, 0, 28),
      mahmoud: restoreNeeds(this.crewNeeds.mahmoud, 0, 28),
    };
    this.localAnimOverride = 'eat';
    this.localAnimOverrideTimer = 1.6;
    this.localSpeechOverride = 'عصير بارد ومية ترد الروح! 🥤';
    this.localSpeechTimer = 2.8;
    this.sound.playPickup();
    this.saveGame();
    this.showToast('🥤 شربت مياه وعصير بارد! نسبة الارتواء انتعشت');
    this.emitHud();
  }

  // =========================================================================
  // EXPANSION V3 PUBLIC ACTIONS (Seasons, Moto Delivery, Wholesale/Hygiene, Villa/Furniture, School Report, Co-op Chat)
  // =========================================================================
  public setEgyptianSeason(seasonId: EgyptianSeasonId): void {
    if (!this.checkRolePermission('manage_shop')) return;
    this.activeSeasonId = seasonId;
    const def = EGYPTIAN_SEASONS[seasonId];
    this.sound.playPickup();
    this.saveGame();
    this.showToast(`🎉 تم تفعيل موسم: ${def.nameAr} (إقبال ×${def.customerRushMultiplier})`);
    this.syncRoomAction('set_season', `المعلم محمد فعّل موسم: ${def.nameAr}!`);
    this.emitHud();
  }

  public refreshDeliveryDispatch(): void {
    this.deliveryOrders = [
      ...this.deliveryOrders.filter((o) => o.status === 'active'),
      ...generateDeliveryDispatchBatch(3, this.deliverySeq++),
    ];
    this.sound.playPickup();
    this.showToast('🛵 تم تحديث طلبات الدليفري الأونلاين عبر الـ ٩٨ شارع');
    this.emitHud();
  }

  public acceptDeliveryDispatch(orderId: string): void {
    const res = acceptDeliveryOrder(this.deliveryOrders, orderId);
    if (!res.ok || !res.activeOrder) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر استلام أوردر الدليفري');
      return;
    }
    this.deliveryOrders = res.orders;
    this.sound.playPickup();
    this.showToast(
      `🛵 استلمت أوردر ${res.activeOrder.customerNameAr} إلى ${res.activeOrder.streetNameAr} (${res.activeOrder.payout} ج.م)!`,
    );
    this.emitHud();
  }

  public completeActiveDeliveryNow(): void {
    const active = this.deliveryOrders.find((o) => o.status === 'active');
    if (!active) {
      this.sound.playError();
      this.showToast('مفيش أوردر دليفري نشط للتسليم دلوقتي.');
      return;
    }
    const res = completeDeliveryOrder({
      orders: this.deliveryOrders,
      orderId: active.id,
      vehicleId: this.activeVehicleId,
      seasonId: this.activeSeasonId,
    });
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر تسليم الأوردر');
      return;
    }
    this.deliveryOrders =
      res.orders.length < 2
        ? [...res.orders, ...generateDeliveryDispatchBatch(3, this.deliverySeq++)]
        : res.orders;
    this.money += res.totalEarned;
    if (this.selectedCharacterId === 'mohamed') this.employeeWallets.mohamed = this.money;
    this.dailyStats.revenue += res.payout;
    this.dailyStats.tipsEarned += res.tip;
    this.dailyStats.deliveriesCompleted += 1;
    this.dailyStats.ordersServed += 1;
    this.reputation = clampReputation(this.reputation + 3);
    this.crewLeaderboard = recordCrewChallengePoint(
      this.crewLeaderboard,
      this.selectedCharacterId,
      'delivery',
      30,
    );
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(this.playerX, 1.8, this.playerZ);
    this.saveGame();
    this.showToast(
      `✅ تم تسليم أوردر الدليفري لـ ${active.customerNameAr}! (+${res.payout} ج.م + ${res.tip} تيبس)`,
    );
    this.syncRoomAction(
      'complete_delivery',
      `${PLAYER_CHARACTERS[this.selectedCharacterId].nameAr} سلّم أوردر دليفري (+${res.totalEarned} ج.م)! 🛵`,
    );
    this.emitHud();
  }

  public signWholesaleContractById(contractId: WholesaleContractId): void {
    if (!this.checkRolePermission('manage_shop')) return;
    const res = signWholesaleContract(this.money, this.wholesaleContracts, contractId);
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر توقيع التعاقد');
      return;
    }
    this.money = res.money;
    if (this.selectedCharacterId === 'mohamed') this.employeeWallets.mohamed = this.money;
    this.wholesaleContracts = res.contracts;
    this.dailyStats.expenses += WHOLESALE_CONTRACTS[contractId].price;
    this.sound.playCashRegister();
    this.saveGame();
    this.showToast(`📜 تم توقيع ${WHOLESALE_CONTRACTS[contractId].nameAr}!`);
    this.syncRoomAction(
      'sign_wholesale_contract',
      `المعلم محمد وقّع ${WHOLESALE_CONTRACTS[contractId].nameAr}!`,
    );
    this.emitHud();
  }

  public sanitizeShopNow(): void {
    const res = sanitizeAndCleanShop(this.money, this.hygieneScore);
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر تعقيم المحل');
      return;
    }
    this.money = res.money;
    if (this.selectedCharacterId === 'mohamed') this.employeeWallets.mohamed = this.money;
    this.hygieneScore = res.hygieneScore;
    this.dailyStats.expenses += res.cost;
    this.sound.playPickup();
    this.saveGame();
    this.showToast('🧽 تم تنظيف وتعقيم المحل والقلاية بنسبة ١٠٠٪!');
    this.syncRoomAction('sanitize_shop', 'المحل والمطبخ تم تعقيمهم بالكامل ١٠٠٪!');
    this.emitHud();
  }

  public runInspectionNow(): void {
    const clockStr = formatGameClock(this.timeOfDay);
    const res = runHygieneInspection({
      hygieneScore: this.hygieneScore,
      inventory: this.inventory,
      day: this.day,
      clockStr,
    });
    this.qualityBadgeEarned = res.qualityBadgeEarned;
    this.inspectionLogs = [res.record, ...this.inspectionLogs].slice(0, 20);
    this.money = Math.max(0, this.money + res.record.moneyDelta);
    if (this.selectedCharacterId === 'mohamed') this.employeeWallets.mohamed = this.money;
    this.reputation = clampReputation(this.reputation + res.record.reputationDelta);
    if (res.record.passed) {
      this.sound.playCashRegister();
      this.spawnCelebrationBurst(this.playerX, 2.0, this.playerZ);
    } else {
      this.sound.playError();
    }
    this.saveGame();
    this.showToast(res.record.summaryAr);
    this.syncRoomAction('hygiene_inspection', res.record.summaryAr);
    this.emitHud();
  }

  public buyFurnitureItem(itemId: FurnitureItemId): void {
    if (!this.checkRolePermission('manage_shop')) return;
    const res = buyApartmentFurniture(this.money, this.ownedFurnitureIds, itemId);
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر شراء الأثاث');
      return;
    }
    this.money = res.money;
    if (this.selectedCharacterId === 'mohamed') this.employeeWallets.mohamed = this.money;
    this.ownedFurnitureIds = res.owned;
    this.dailyStats.expenses += FURNITURE_CATALOG[itemId].price;
    this.reputation = clampReputation(this.reputation + 3);
    this.sound.playCashRegister();
    this.saveGame();
    this.showToast(`🛋️ تم فرش ${FURNITURE_CATALOG[itemId].nameAr} في الشقة!`);
    this.syncRoomAction('buy_furniture', `المعلم محمد اشترى ${FURNITURE_CATALOG[itemId].nameAr} للشقة!`);
    this.emitHud();
  }

  public buyCornicheVillaProperty(): void {
    if (!this.checkRolePermission('manage_shop')) return;
    const res = buyCornicheVilla(this.money, this.cornicheVillaOwned);
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر شراء الفيلا');
      return;
    }
    this.money = res.money;
    if (this.selectedCharacterId === 'mohamed') this.employeeWallets.mohamed = this.money;
    this.cornicheVillaOwned = true;
    this.reputation = clampReputation(this.reputation + 12);
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(this.playerX, 2.2, this.playerZ);
    this.saveGame();
    this.showToast(
      `🏰 مبروك يا معلم! اشتريت فيلا كورنيش النيل (+${CORNICHE_VILLA_DAILY_INCOME.toLocaleString('en-US')} ج.م عائد يومي)!`,
    );
    this.syncRoomAction('buy_corniche_villa', 'المعلم محمد حامد اشترى فيلا فاخرة على كورنيش النيل! 🏰');
    this.emitHud();
  }

  public attendSchoolCeremony(): void {
    const res = celebrateSchoolHonorCeremony({
      enrollment: this.schoolEnrollment,
      report: this.schoolReport,
      day: this.day,
      ownedFurnitureIds: this.ownedFurnitureIds,
    });
    if (!res.ok) {
      this.sound.playError();
      this.showToast(res.reasonAr ?? 'تعذر حضور الحفلة');
      return;
    }
    this.schoolReport = res.report;
    this.money += res.moneyBonus;
    if (this.selectedCharacterId === 'mohamed') this.employeeWallets.mohamed = this.money;
    this.reputation = clampReputation(this.reputation + res.reputationBonus);
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(this.playerX, 2.2, this.playerZ);
    this.saveGame();
    this.showToast(
      `🏆 حضرت حفل التفوق في مدرسة بنها الخاصة! (+${res.moneyBonus} ج.م مكافأة تفوق و+${res.reputationBonus} سمعة)`,
    );
    this.syncRoomAction(
      'school_ceremony',
      'أولاد المعلم محمد حامد اتكرموا في حفل التفوق بمدرسة بنها الخاصة! 🎓🏆',
    );
    this.emitHud();
  }

  public sendCoopChatMessage(text: string): void {
    const clean = text.trim().slice(0, 120);
    if (!clean) return;
    const st = this.mp.getStatus();
    if (st.mode === 'online') {
      this.mp.sendChatMessage(clean);
      this.localSpeechOverride = clean.slice(0, 90);
      this.localSpeechTimer = 3.5;
      return;
    }
    // Solo local echo in chat log so user can preview squad radio/chat anytime
    const profile = getResolvedCharacterProfile(this.selectedCharacterId, this.customProfiles);
    const localMsg: CoopChatMessage = {
      id: `local-${Date.now().toString(36)}`,
      clientId: 'local',
      characterId: this.selectedCharacterId,
      senderNameAr: profile.nameAr,
      text: clean,
      clockStr: formatGameClock(this.timeOfDay),
      timestamp: Date.now(),
    };
    this.coopChatMessages = [...this.coopChatMessages.slice(-39), localMsg];
    this.localSpeechOverride = clean.slice(0, 90);
    this.localSpeechTimer = 3.5;
    this.emitHud();
  }

  public startObjectDialogue(kind: WorldObjectChatKind, customId?: string): void {
    this.activeDialogueCustomerNpc = null;
    const objId = customId || `obj-${kind}`;
    const customTitle =
      kind === 'car'
        ? VEHICLE_CATALOG[this.activeVehicleId]?.nameAr
        : undefined;
    this.activeDialogue = createObjectDialogueSession(kind, objId, {
      customTitleAr: customTitle,
      adBoard: this.adBoard,
    });
    this.keysHeld.clear();
    this.dragLooking = false;
    document.exitPointerLock?.();
    this.sound.playPickup();
    this.emitHud();
  }

  public toggleAccompanyTarget(
    targetId: string,
    speakerNameAr: string,
    roleAr: string,
    holdHand: boolean,
    style?: { shirtColor?: number; skinColor?: number; hijabColor?: number | null; isChild?: boolean },
  ): boolean {
    const existingIdx = this.accompanyingFollowers.findIndex((f) => f.id === targetId);
    if (existingIdx !== -1) {
      const existing = this.accompanyingFollowers[existingIdx];
      if (holdHand && !existing.holdHand) {
        existing.holdHand = true;
        this.syncVehiclePassengersVisual();
        this.sound.playPickup();
        this.showToast(`🤝 مسكت إيد ${existing.nameAr} وبتتمشوا سوا!`);
        this.emitHud();
        return true;
      }
      this.scene.remove(existing.actor.group);
      this.accompanyingFollowers.splice(existingIdx, 1);
      this.syncVehiclePassengersVisual();
      this.sound.playPickup();
      this.showToast(`👋 ${existing.nameAr} رجع لمكانه بعد المشوار`);
      this.emitHud();
      return false;
    }

    if (this.accompanyingFollowers.length >= 8) {
      this.sound.playError();
      this.showToast('أقصى عدد للمرافقين حالياً هو ٨ أفراد (٤ بالكابينة + ٤ بالصندوق)');
      return false;
    }

    const shirtColor = style?.shirtColor ?? (holdHand ? 0x2563eb : 0x0f766e);
    const skinColor = style?.skinColor ?? 0xd29c74;
    const hijabColor = style?.hijabColor ?? null;
    const isChild =
      style?.isChild ??
      (/son|daughter|child|student/i.test(targetId) || /ابن|بنت|طفل|طالب/.test(roleAr));

    const actor = this.world.createNpcActor({
      shirtColor,
      skinColor,
      pantsColor: 0x1e293b,
      hasHijab: Boolean(hijabColor),
      hijabColor: hijabColor ?? undefined,
      hatType: isChild ? 'cap' : 'hair',
      hatColor: 0xfbbf24,
    });
    if (isChild) actor.group.scale.setScalar(0.74);
    actor.group.position.set(this.playerX + 0.9, this.groundY, this.playerZ + 0.6);
    actor.group.visible = !this.inCar;

    this.accompanyingFollowers.push({
      id: targetId,
      nameAr: speakerNameAr,
      roleAr,
      actor,
      holdHand,
      shirtColor,
      skinColor,
      hijabColor,
      isChild,
    });
    this.syncVehiclePassengersVisual();
    this.sound.playPickup();
    this.showToast(
      holdHand
        ? `🤝 مسكت إيد ${speakerNameAr} وبيمشي جنبك في كل مكان!`
        : `🚶 ${speakerNameAr} بقى مرافقك! (${this.accompanyingFollowers.length} مرافق · يسع ٤ بالكابينة + ٤ بالصندوق)`,
    );
    this.syncRoomAction(
      'accompany',
      `${PLAYER_CHARACTERS[this.selectedCharacterId].nameAr} اصطحب ${speakerNameAr}${holdHand ? ' بإيده' : ''}!`,
    );
    this.emitHud();
    return true;
  }

  public toggleAccompanyFromCurrentDialogue(holdHand = false): void {
    if (!this.activeDialogue || this.activeDialogue.targetType === 'world_object') return;
    const d = this.activeDialogue;
    const isChildTarget =
      d.targetType === 'child' ||
      d.targetType === 'household_son' ||
      d.targetType === 'household_daughter' ||
      d.targetType === 'student';
    const nextJoined = this.toggleAccompanyTarget(
      d.targetId,
      d.speakerNameAr,
      d.speakerRoleAr,
      holdHand,
      {
        isChild: isChildTarget,
        hijabColor: d.targetType === 'spouse' || d.targetType === 'romance' || d.targetType === 'household_wife' ? 0xf8fafc : null,
      },
    );
    this.activeDialogue = {
      ...d,
      isAccompanying: nextJoined,
      isHoldingHand: nextJoined && holdHand,
    };
    this.emitHud();
  }

  public boardVehicleWithCompanions(): void {
    if (this.activeDialogue && this.activeDialogue.targetType !== 'world_object') {
      const d = this.activeDialogue;
      if (!this.accompanyingFollowers.some((f) => f.id === d.targetId)) {
        this.toggleAccompanyTarget(d.targetId, d.speakerNameAr, d.speakerRoleAr, false);
      }
      this.activeDialogue = null;
    }
    this.syncVehiclePassengersVisual();
    const dist = Math.hypot(this.playerX - this.carX, this.playerZ - this.carZ);
    if (!this.inCar && dist > 4.6) {
      this.playerX = this.carX + 1.8;
      this.playerZ = this.carZ + 1.4;
    }
    if (!this.inCar) {
      this.toggleCarMode();
    } else {
      this.emitHud();
    }
  }

  public sendDialogueKeyboardMessage(rawText: string): void {
    if (!this.activeDialogue) return;
    const clean = rawText.replace(/[<>`]/g, '').trim().slice(0, 140);
    if (!clean) return;

    const clockStr = formatGameClock(this.timeOfDay);
    const senderProfile = getResolvedCharacterProfile(
      this.selectedCharacterId,
      this.customProfiles,
    );
    const playerEntry = buildChatLogEntry(senderProfile.nameAr, clean, true, clockStr);

    const reply = generateSmartArabicReply({
      session: this.activeDialogue,
      playerMessage: clean,
      playerNeeds: this.playerNeeds,
      schoolEnrollment: this.schoolEnrollment,
      playerNameAr: senderProfile.nameAr,
    });

    const npcEntry = buildChatLogEntry(
      this.activeDialogue.speakerNameAr,
      reply.replyAr,
      false,
      clockStr,
    );

    if (reply.reputationDelta !== 0) {
      this.reputation = clampReputation(this.reputation + reply.reputationDelta);
    }
    if (
      (this.activeDialogue.targetType === 'romance' ||
        this.activeDialogue.targetType === 'spouse') &&
      reply.affectionDelta !== 0
    ) {
      this.romanceStates = this.romanceStates.map((r) =>
        r.id === this.activeDialogue?.targetId
          ? {
              ...r,
              affection: Math.max(0, Math.min(100, r.affection + reply.affectionDelta)),
            }
          : r,
      );
    }

    this.localAnimOverride = reply.animPose;
    this.localAnimOverrideTimer = 2.6;
    this.localSpeechOverride = clean;
    this.localSpeechTimer = 3.5;

    // Trigger accompanying/school/needs effects if requested in free text
    if (reply.effect === 'hold_son_hand') {
      this.toggleAccompanyFromCurrentDialogue(true);
    } else if (reply.effect === 'accompany_me') {
      this.toggleAccompanyFromCurrentDialogue(false);
    } else if (reply.effect === 'stop_accompany') {
      if (this.accompanyingFollowers.some((f) => f.id === this.activeDialogue?.targetId)) {
        this.toggleAccompanyFromCurrentDialogue(false);
      }
    } else if (reply.effect === 'board_vehicle') {
      this.boardVehicleWithCompanions();
    } else if (reply.effect === 'enroll_both') {
      this.enrollBenhaSchool('both');
    } else if (reply.effect === 'give_food') {
      this.eatFood();
    } else if (reply.effect === 'give_drink') {
      this.drinkWater();
    } else if (reply.effect === 'refuel_car') {
      if (this.money >= 20) {
        this.money -= 20;
        this.carFuel = 100;
        this.carCondition = 100;
        this.sound.playCashRegister();
      }
    } else if (reply.effect === 'boost_ad_promo') {
      this.adBoard = updateAdBoard(
        this.adBoard,
        { active: true, headlineAr: clean.slice(0, 46) },
        clockStr,
      );
      this.world.setAdBoardDisplay(this.adBoard);
    }

    if (this.activeDialogue) {
      const prevLog = this.activeDialogue.chatLog ?? [];
      this.activeDialogue = {
        ...this.activeDialogue,
        npcLineAr: reply.replyAr,
        chatLog: [...prevLog, playerEntry, npcEntry].slice(-24),
        isAccompanying: this.accompanyingFollowers.some(
          (f) => f.id === this.activeDialogue?.targetId,
        ),
        isHoldingHand: this.accompanyingFollowers.some(
          (f) => f.id === this.activeDialogue?.targetId && f.holdHand,
        ),
      };
    }

    this.sound.playPickup();
    this.saveGame();
    this.syncRoomAction(
      'chat_action',
      `💬 ${senderProfile.nameAr}: "${clean.slice(0, 42)}"`,
    );
    this.emitHud();
  }

  public openDialogueSession(
    targetType: ActiveDialogueSession['targetType'],
    targetId: string,
  ): void {
    this.activeDialogueCustomerNpc = null;
    const session = createInitialDialogueSession(targetType, targetId, this.getDialogueContext());
    if (targetId === 'home-son') {
      session.speakerNameAr = this.customProfiles.sonNameAr;
    } else if (targetId === 'home-daughter') {
      session.speakerNameAr = this.customProfiles.daughterNameAr;
    } else if (targetId === 'home-wife' && !this.spouseId) {
      session.speakerNameAr = this.customProfiles.spouseNameAr;
    } else if (targetId.startsWith('ful-coworker-')) {
      const crewId = targetId.replace('ful-coworker-', '') as PlayerCharacterId;
      if (crewId === 'ahmed' || crewId === 'ali' || crewId === 'mahmoud') {
        const prof = getResolvedCharacterProfile(crewId, this.customProfiles);
        session.speakerNameAr = prof.nameAr;
        session.speakerRoleAr = prof.roleTitleAr;
      }
    }
    const school = SCHOOL_CAMPUSES.find((s) => s.id === targetId);
    if (school) {
      session.speakerNameAr = school.teacherNameAr;
      session.speakerRoleAr = `معلم في ${school.nameAr}`;
      session.npcLineAr = school.teacherLineAr;
    }
    session.isAccompanying = this.accompanyingFollowers.some((f) => f.id === targetId);
    session.isHoldingHand = this.accompanyingFollowers.some(
      (f) => f.id === targetId && f.holdHand,
    );
    session.chatLog = [];
    this.activeDialogue = session;
    this.keysHeld.clear();
    this.dragLooking = false;
    document.exitPointerLock?.();
    this.sound.playPickup();
    this.emitHud();
  }

  private getCustomerEvaluation(npc: NpcRuntime) {
    const ord = npc.orderId ? this.orders.find((o) => o.id === npc.orderId) : undefined;
    const recipeId = ord?.recipeId ?? npc.recipeId ?? 'ful_oil';
    const recipe = RECIPES[recipeId];
    const patienceRatio = ord ? ord.patience / Math.max(1, ord.maxPatience) : 0.78;
    return {
      ord,
      recipe,
      eval: evaluateCustomerServiceState({
        archetype: ord?.archetype ?? npc.archetype ?? 'calm',
        patienceRatio,
        chargedPrice: this.prices[recipeId] ?? recipe.basePrice,
        basePrice: recipe.basePrice,
        decorLevel: this.upgrades.decorLevel,
        served: !ord,
        hospitalityGiven: npc.hospitalityGiven,
      }),
    };
  }

  public openCustomerDialogue(npc: NpcRuntime): void {
    const { ord, recipe, eval: serviceEval } = this.getCustomerEvaluation(npc);
    if (npc.reactionTimer && npc.reactionTimer > 0 && npc.reactionEmoji && npc.reactionLineAr) {
      serviceEval.emoji = npc.reactionEmoji;
      serviceEval.moodLabelAr = npc.reactionMoodLabel ?? serviceEval.moodLabelAr;
      serviceEval.moodTone = npc.reactionTone ?? serviceEval.moodTone;
      serviceEval.dynamicLineAr = npc.reactionLineAr;
      if (npc.lastServiceScore !== undefined) {
        serviceEval.score = npc.lastServiceScore;
      }
    }
    this.activeDialogueCustomerNpc = npc;
    this.activeDialogue = createCustomerDialogueSession({
      targetId: ord?.id ?? `dining-${npc.customerName ?? 'guest'}`,
      customerName: ord?.customerName ?? npc.customerName ?? 'زبون المحل',
      archetype: ord?.archetype ?? npc.archetype ?? 'calm',
      recipeNameAr: recipe.nameAr,
      served: !ord,
      feedbackRecorded: npc.feedbackRecorded,
      serviceEval,
    });
    this.keysHeld.clear();
    this.dragLooking = false;
    document.exitPointerLock?.();
    this.sound.playPickup();
    this.emitHud();
  }

  public closeDialogue(): void {
    this.activeDialogue = null;
    this.activeDialogueCustomerNpc = null;
    this.emitHud();
  }

  public selectDialogueChoice(choiceId: string): void {
    if (!this.activeDialogue) return;
    const choice = this.activeDialogue.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    const res = resolveDialogueChoice(this.activeDialogue, choice, this.getDialogueContext());
    if (res.closeDialogue) {
      this.closeDialogue();
      return;
    }

    if (this.activeDialogue.targetType === 'world_object') {
      if (choice.id === 'obj-enroll-both') {
        this.enrollBenhaSchool('both');
      } else if (choice.id === 'obj-refuel') {
        if (this.money >= 20) {
          this.money -= 20;
          this.dailyStats.expenses += 20;
          this.carFuel = 100;
          this.carCondition = 100;
          this.sound.playCashRegister();
          this.showToast('⛽ تم تفويل السيارة ١٠٠٪ بنزين!');
        } else {
          this.sound.playError();
          this.showToast('تحتاج ٢٠ ج.م لتفويل السيارة');
        }
      }
      this.activeDialogue = {
        ...this.activeDialogue,
        npcLineAr: res.replyAr,
      };
      this.saveGame();
      this.emitHud();
      return;
    }

    if (res.moneyDelta !== 0) {
      this.money = Math.max(0, this.money + res.moneyDelta);
      if (res.moneyDelta < 0) {
        this.dailyStats.expenses += Math.abs(res.moneyDelta);
      }
    }
    if (res.reputationDelta !== 0) {
      this.reputation = clampReputation(this.reputation + res.reputationDelta);
    }

    if (res.triggerRide) {
      const targetId = this.activeDialogue.targetId;
      if (targetId === 'home-wife') {
        this.companionDef = {
          nameAr: 'أمينة',
          dressColor: 0x6d28d9,
          skinColor: 0xd09a72,
          hijabColor: 0x1e293b,
        };
      } else {
        const girl = ROMANCE_NPCS.find((g) => g.id === targetId);
        this.companionDef = girl
          ? {
              nameAr: girl.nameAr,
              dressColor: girl.dressColor,
              skinColor: girl.skinColor,
              hijabColor: 0xf8fafc,
            }
          : {
              nameAr: this.activeDialogue.speakerNameAr,
              dressColor: 0xbe185d,
              skinColor: 0xd8a882,
              hijabColor: 0xfef3c7,
            };
      }
      this.companionCornicheDone = false;
      this.world.heroCar.setCompanionVisible(
        true,
        this.companionDef.dressColor,
        this.companionDef.skinColor,
        this.companionDef.hijabColor,
      );
      this.activeDialogue = null;
      this.sound.playPickup();
      this.saveGame();
      this.showToast(
        `${this.companionDef.nameAr} مستنياك في الكرسي اللي جنبك! سوق على الكورنيش 🚗❤️`,
      );
      this.emitHud();
      return;
    } else if (res.triggerMarry) {
      const mRes = marryNpc(this.money, this.ownedApartmentIds, this.romanceStates, this.activeDialogue.targetId);
      if (mRes.ok) {
        this.dailyStats.expenses += this.money - mRes.money;
        this.money = mRes.money;
        this.spouseId = mRes.spouseId;
        this.marriedDay = this.day;
        this.marriageElapsedSec = 0;
        this.childUnlockNotified = false;
        this.romanceStates = mRes.romanceStates;
        this.syncFamilyActorsVisibility();
        this.sound.playCashRegister();
        this.spawnCelebrationBurst(this.playerX, 2.0, this.playerZ);
        this.showToast(`ألف مبروك يا معلم! اتجوزت ${this.activeDialogue.speakerNameAr} ❤️ في البيت الثابت`);
        this.syncRoomAction('marry', `${PLAYER_CHARACTERS[this.selectedCharacterId].nameAr} اتجوز ${this.activeDialogue.speakerNameAr}! ❤️`);
      } else {
        this.sound.playError();
        this.activeDialogue = {
          ...this.activeDialogue,
          npcLineAr: mRes.reasonAr ?? res.replyAr,
        };
        this.emitHud();
        return;
      }
    } else if (res.triggerChild) {
      const cRes = haveChild(this.money, this.spouseId, this.children, {
        currentDay: this.day,
        marriedDay: this.marriedDay,
        marriageElapsedSec: this.marriageElapsedSec,
      });
      if (cRes.ok) {
        this.dailyStats.expenses += this.money - cRes.money;
        this.money = cRes.money;
        this.children = cRes.children;
        this.syncFamilyActorsVisibility();
        this.sound.playCashRegister();
        this.spawnCelebrationBurst(this.playerX, 2.0, this.playerZ);
        this.showToast(`ألف مبروك! ربنا رزقك بـ "${cRes.newChild?.nameAr ?? ''}" 🎉`);
        this.syncRoomAction('have_child', `ربنا رزق ${PLAYER_CHARACTERS[this.selectedCharacterId].nameAr} بمولود جديد!`);
      } else {
        this.sound.playError();
        this.activeDialogue = {
          ...this.activeDialogue,
          npcLineAr: cRes.reasonAr ?? res.replyAr,
        };
        this.emitHud();
        return;
      }
    } else if (
      (this.activeDialogue.targetType === 'romance' || this.activeDialogue.targetType === 'spouse') &&
      res.affectionDelta !== 0
    ) {
      this.romanceStates = this.romanceStates.map((r) => {
        if (r.id !== this.activeDialogue?.targetId) return r;
        const nextAff = Math.max(0, Math.min(100, r.affection + res.affectionDelta));
        return {
          ...r,
          affection: nextAff,
          talkCount: r.talkCount + 1,
          moodAr: nextAff >= 75 ? 'معجبة جداً ❤️' : nextAff >= 45 ? 'مبسوطة وبتضحك 😊' : r.moodAr,
        };
      });
      this.sound.playPickup();
    } else {
      this.sound.playPickup();
    }

    // Refresh dialogue card with updated affection & choices
    if (this.activeDialogue.targetType === 'customer') {
      const npc = this.activeDialogueCustomerNpc;
      if (npc) {
        if (res.feedbackKind) {
          npc.feedbackRecorded = true;
        }
        if (res.hospitalityRestoresPatience) {
          npc.hospitalityGiven = true;
          const ord = npc.orderId ? this.orders.find((o) => o.id === npc.orderId) : undefined;
          if (ord) {
            ord.patience = Math.min(ord.maxPatience, ord.patience + 22);
          }
        }
        npc.reactionEmoji = res.customerEmoji ?? npc.reactionEmoji;
        npc.reactionMoodLabel = res.customerMoodLabelAr ?? npc.reactionMoodLabel;
        npc.reactionTone = res.customerMoodTone ?? npc.reactionTone;
        npc.reactionExpression = res.customerExpression ?? npc.reactionExpression;
        npc.reactionAnim = res.customerAnim ?? npc.reactionAnim;
        npc.reactionLineAr = res.replyAr;
        npc.reactionTimer = 6.0;
        if (res.customerExpression) {
          setActorExpression(npc.actor, res.customerExpression);
        }
        if (res.feedbackKind === 'praise') {
          this.sound.playCashRegister();
          this.spawnCelebrationBurst(npc.x, 1.8, npc.z);
          this.showToast(`مدح من ${npc.customerName ?? 'الزبون'}! ارتفعت سمعة المحل 🌟`);
        } else if (res.feedbackKind === 'complaint') {
          this.sound.playError();
          this.showToast(`شكوى من ${npc.customerName ?? 'الزبون'}! تأثرت سمعة المحل 📢`);
        }
      }

      const nextScore = res.hospitalityRestoresPatience
        ? Math.min(100, (this.activeDialogue.serviceQualityScore ?? 55) + 22)
        : this.activeDialogue.serviceQualityScore;
      this.activeDialogue = {
        ...this.activeDialogue,
        npcLineAr: res.replyAr,
        customerEmoji: res.customerEmoji ?? this.activeDialogue.customerEmoji,
        moodTone: res.customerMoodTone ?? this.activeDialogue.moodTone,
        serviceQualityLabelAr:
          res.customerMoodLabelAr ?? this.activeDialogue.serviceQualityLabelAr,
        serviceQualityScore: nextScore,
        choices: this.activeDialogue.choices.filter(
          (c) => !res.feedbackKind || (c.tone !== 'praise' && c.tone !== 'complaint'),
        ),
      };
    } else if (this.activeDialogue.targetType === 'romance' || this.activeDialogue.targetType === 'spouse') {
      const st = this.romanceStates.find((r) => r.id === this.activeDialogue?.targetId);
      const ctx = this.getDialogueContext();
      const childUnlock = getChildUnlockStatus(
        this.spouseId,
        this.children,
        this.day,
        this.marriedDay,
        this.marriageElapsedSec,
      );
      this.activeDialogue = {
        ...this.activeDialogue,
        targetType: st?.married ? 'spouse' : 'romance',
        npcLineAr: res.replyAr,
        affection: st?.affection ?? this.activeDialogue.affection,
        married: st?.married ?? this.activeDialogue.married,
        canPropose: !st?.married && (st?.affection ?? 0) >= 70 && this.ownedApartmentIds.length > 0 && !this.spouseId,
        canHaveChild: Boolean(st?.married && childUnlock.unlocked),
        childWaitRemainingSec: st?.married && !childUnlock.unlocked ? childUnlock.remainingSec : 0,
        choices: st ? buildRomanceChoices(st, ctx) : this.activeDialogue.choices,
      };
    } else {
      this.activeDialogue = {
        ...this.activeDialogue,
        npcLineAr: res.replyAr,
      };
    }

    this.saveGame();
    this.emitHud();
  }

  public cycleCamera(): void {
    if (this.phase !== 'playing') return;
    if (this.inCar) {
      this.carCameraMode =
        this.carCameraMode === 'chase' ? 'cockpit' : 'chase';
      this.snapCameraNextFrame = true;
      this.updateVehicleDriving(0.016);
      this.renderer.render(this.scene, this.camera);
      this.sound.playPickup();
      this.showToast(
        this.carCameraMode === 'cockpit'
          ? 'كاميرا السائق الداخلية (من خلف الطارة)'
          : 'كاميرا خارجية خلف السيارة',
      );
      this.emitHud();
      return;
    }

    const nextMap: Record<CameraMode, CameraMode> = {
      first_person: 'third_person',
      third_person: 'wide_follow',
      wide_follow: 'first_person',
    };
    this.cameraMode = nextMap[this.cameraMode];
    this.snapCameraNextFrame = true;
    this.world.playerActor.group.visible =
      this.phase === 'playing' && !this.inCar && this.cameraMode !== 'first_person';
    this.updateFirstPersonWalk(0.016);
    this.renderer.render(this.scene, this.camera);
    this.sound.playPickup();
    const labels: Record<CameraMode, string> = {
      first_person: 'كاميرا المنظور الأول',
      third_person: 'كاميرا المنظور الثالث (تشوف المعلم)',
      wide_follow: 'كاميرا الحارة الواسعة',
    };
    this.showToast(labels[this.cameraMode]);
    this.emitHud();
  }

  public startGame(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.keysHeld.clear();
    this.activeShopOwnerId = null;
    this.phase = 'playing';
    this.playerX = -4.2;
    this.playerY = 1.68;
    this.playerZ = 1.8;
    this.playerYaw = Math.PI / 2;
    this.playerPitch = -0.04;
    this.inCar = false;
    this.snapCameraNextFrame = true;
    this.world.playerActor.group.visible = this.cameraMode !== 'first_person';
    this.world.playerActor.group.position.set(this.playerX, 0, this.playerZ);
    this.world.playerActor.group.rotation.y = this.playerYaw + Math.PI;
    this.updateFirstPersonWalk(0.016);
    this.renderer.render(this.scene, this.camera);
    this.syncMusicEngine();
    this.syncBodyState();
    this.updateContextualHint();
    this.showToast('أهلاً يا معلم! مدينة من ٩٨ شارع ومدارس و١٥ محل مفتوح ومزيكا حمو المرشدي شغالة 🎵');
    this.emitHud();
  }

  public pauseGame(): void {
    if (this.phase !== 'playing') return;
    this.phase = 'paused';
    this.activeShopOwnerId = null;
    this.activeDialogue = null;
    this.customerBubble = null;
    this.world.yellowArrowGroup.visible = false;
    this.keysHeld.clear();
    this.dragLooking = false;
    this.syncMusicEngine();
    document.exitPointerLock?.();
    this.syncBodyState();
    this.emitHud();
  }

  public resumeGame(): void {
    if (this.phase !== 'paused') return;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.keysHeld.clear();
    this.phase = 'playing';
    this.syncMusicEngine();
    this.syncBodyState();
    this.emitHud();
  }

  public returnToTitle(): void {
    this.phase = 'title';
    this.activeShopOwnerId = null;
    this.activeDialogue = null;
    this.customerBubble = null;
    this.world.yellowArrowGroup.visible = false;
    this.keysHeld.clear();
    this.world.playerActor.group.visible = false;
    this.syncMusicEngine();
    document.exitPointerLock?.();
    this.syncBodyState();
    this.emitHud();
  }

  public restartCurrentShift(): void {
    this.keysHeld.clear();
    this.activeShopOwnerId = null;
    this.activeDialogue = null;
    this.phase = 'playing';
    this.inCar = false;
    this.syncMusicEngine();
    this.playerX = -4.2;
    this.playerY = 1.68;
    this.playerZ = 1.8;
    this.playerYaw = Math.PI / 2;
    this.playerPitch = -0.04;
    this.carX = -3.6;
    this.carZ = 5.6;
    this.carYaw = 0;
    this.carSpeed = 0;
    this.world.heroCar.carGroup.position.set(this.carX, 0, this.carZ);
    this.world.heroCar.carGroup.rotation.y = 0;
    this.heldIngredients = [];
    this.heldReadyPack = null;
    this.heldCrispBonus = false;
    this.redLightCooldown = 0;
    this.trafficFines = 0;
    this.clearCustomerNpcs();
    this.orders = [];
    this.activeStreetEvent = null;
    this.streetEventCooldown = 0.8;
    this.syncStreetEventVisuals(0);
    this.timeOfDay = 0.32;
    this.shopOpen = false;
    this.shutterProgress = 0;
    this.dailyStats = {
      day: this.day,
      revenue: 0,
      expenses: 0,
      ordersServed: 0,
      ordersMissed: 0,
      deliveriesCompleted: 0,
      tipsEarned: 0,
      taxiTrips: 0,
      repairsDone: 0,
      sideJobIncome: 0,
      shopDividends: 0,
    };
    this.syncBodyState();
    this.emitHud();
  }

  public startNextDay(): void {
    this.day += 1;
    this.marketForecast = generateDailyMarketForecast(this.day);
    this.companionCornicheDone = false;
    this.inventoryConsumedToday = createEmptyConsumedMap();
    this.playerNeeds = createInitialCharacterNeeds();
    this.crewNeeds = createInitialCrewNeeds();
    // Daily shop profits + buildings/branches + apartment/family morale credit at start of new day
    this.cityShops = accrueShopProfits(this.cityShops, 0.35);
    this.inventory = applyWholesaleDailySupply(this.inventory, this.wholesaleContracts);
    this.activeSeasonId = getSuggestedSeasonForDay(this.day);
    this.deliveryOrders = generateDeliveryDispatchBatch(4, this.deliverySeq++);
    const bestAptBonus = this.ownedApartmentIds.reduce(
      (best, id) => Math.max(best, APARTMENT_CATALOG[id]?.dailyMoraleBonus ?? 0),
      0,
    );
    const realEstateIncome = computeRealEstateDailyIncome(
      this.ownedBuildingIds,
      this.ownedBranchIds,
      this.restaurantFloors,
      this.cornicheVillaOwned,
    );
    const familyBonus = (this.spouseId ? 25 : 0) + this.children.length * 15 + bestAptBonus;
    const totalDayCredit = familyBonus + realEstateIncome;
    if (totalDayCredit > 0) {
      this.money += totalDayCredit;
      if (this.selectedCharacterId === 'mohamed') this.employeeWallets.mohamed = this.money;
      this.dailyStats.shopDividends += realEstateIncome;
      this.reputation = clampReputation(this.reputation + 2);
    }
    this.saveGame();
    this.restartCurrentShift();
    this.syncRoomAction(
      'next_day',
      `${PLAYER_CHARACTERS[this.selectedCharacterId].nameAr} بدأ يوم جديد (اليوم ${this.day})! ☀️`,
    );
    this.showToast(
      totalDayCredit > 0
        ? `يوم جديد سعيد! اليوم ${this.day} — ${EGYPTIAN_SEASONS[this.activeSeasonId].nameAr} (+${totalDayCredit.toLocaleString('en-US')} ج.م عوائد)`
        : `يوم جديد سعيد يا معلم! اليوم ${this.day} — ${EGYPTIAN_SEASONS[this.activeSeasonId].nameAr}`,
    );
  }

  private clearCustomerNpcs(): void {
    for (let i = this.customers.length - 1; i >= 0; i--) {
      this.scene.remove(this.customers[i].actor.group);
      this.customers.splice(i, 1);
    }
  }

  public setQuality(q: GraphicsQuality): void {
    this.quality = q;
    if (this.isSoftwareGl) {
      this.renderer.setPixelRatio(1);
    } else {
      const ratio =
        q === 'ultra'
          ? Math.min(window.devicePixelRatio, 2)
          : q === 'medium'
            ? 1.25
            : 0.9;
      this.renderer.setPixelRatio(ratio);
      this.renderer.shadowMap.enabled = q !== 'low';
    }
    this.saveGame();
    this.emitHud();
  }

  public setAdaptiveQuality(enabled: boolean): void {
    this.adaptiveQuality = enabled;
    this.saveGame();
    this.emitHud();
  }

  public setCrewRole(role: CrewRoleId): void {
    if (this.mp.getStatus().mode === 'online') {
      this.sound.playError();
      this.showToast('في اللعب الأونلاين كل صاحب ليه وظيفته الثابتة حسب شخصيته!');
      return;
    }
    this.activeRole = role;
    this.saveGame();
    this.showToast(
      `تم التبديل إلى: ${
        role === 'cashier'
          ? 'كاشير وحسابات'
          : role === 'assembler'
            ? 'صاحب المحل والمدير'
            : role === 'fryer'
              ? 'معلم القلي والفول'
              : 'سائق التوصيل'
      }`,
    );
    this.emitHud();
  }

  public buyIngredientPack(id: IngredientId): void {
    if (!this.checkRolePermission('drive_delivery')) return;
    const rawCost = computeDynamicPackCost(id, this.marketForecast);
    const discountFactor = getContractDiscountFactor(this.wholesaleContracts, id);
    const dynamicCost = Math.max(5, Math.round(rawCost * discountFactor));
    const res = restockIngredient(this.money, this.inventory, id);
    if (this.money < dynamicCost) {
      this.sound.playError();
      this.showToast(`رصيدك لا يكفي لشراء شحنة (${dynamicCost} جنيه)`);
      return;
    }
    this.money -= dynamicCost;
    this.inventory = res.ok
      ? res.inventory
      : {
          ...this.inventory,
          [id]: this.inventory[id] + 15,
        };
    this.dailyStats.expenses += dynamicCost;
    this.sound.playCashRegister();
    this.saveGame();
    this.showToast(
      discountFactor < 1
        ? `تم توريد شحنة بسعر تعاقد الجملة (-${dynamicCost} ج.م)`
        : `تم توريد شحنة جديدة بسعر البورصة (-${dynamicCost} جنيه)`,
    );
    this.syncRoomAction('buy_ingredient', `${PLAYER_CHARACTERS[this.selectedCharacterId].nameAr} جاب بضاعة جديدة للمحل!`);
    this.emitHud();
  }

  public setRecipePrice(recipeId: RecipeId, newPrice: number): void {
    if (!this.checkRolePermission('manage_shop')) return;
    this.prices[recipeId] = Math.max(6, Math.min(80, Math.round(newPrice)));
    this.saveGame();
    this.syncRoomAction('set_price');
    this.emitHud();
  }

  public setExtraItemPrice(itemId: PosExtraItemId, newPrice: number): void {
    if (!this.checkRolePermission('manage_shop')) return;
    this.extraPrices[itemId] = Math.max(5, Math.min(180, Math.round(newPrice)));
    this.saveGame();
    this.syncRoomAction('set_extra_price');
    this.emitHud();
  }

  public updateCashierSettings(partial: Partial<CashierControllerSettings>): void {
    if (!this.checkRolePermission('manage_shop')) return;
    this.cashierSettings = {
      maxDiscountPct:
        typeof partial.maxDiscountPct === 'number' && Number.isFinite(partial.maxDiscountPct)
          ? Math.max(0, Math.min(50, Math.round(partial.maxDiscountPct)))
          : this.cashierSettings.maxDiscountPct,
      taxRatePct:
        typeof partial.taxRatePct === 'number' && Number.isFinite(partial.taxRatePct)
          ? Math.max(0, Math.min(25, Math.round(partial.taxRatePct)))
          : this.cashierSettings.taxRatePct,
      cashierRegisterLocked:
        typeof partial.cashierRegisterLocked === 'boolean'
          ? partial.cashierRegisterLocked
          : this.cashierSettings.cashierRegisterLocked,
      allowCashierCustomDiscount:
        typeof partial.allowCashierCustomDiscount === 'boolean'
          ? partial.allowCashierCustomDiscount
          : this.cashierSettings.allowCashierCustomDiscount,
      openingDrawerFloat:
        typeof partial.openingDrawerFloat === 'number' && Number.isFinite(partial.openingDrawerFloat)
          ? Math.max(0, Math.min(10_000, Math.round(partial.openingDrawerFloat)))
          : this.cashierSettings.openingDrawerFloat,
    };
    this.sound.playPickup();
    this.saveGame();
    this.showToast(
      this.cashierSettings.cashierRegisterLocked
        ? '🔒 المعلم قفل درج الكاشير مؤقتاً'
        : 'تم تحديث إعدادات وضوابط المعلم على الكاشير',
    );
    this.syncRoomAction(
      'update_cashier_settings',
      'المعلم محمد حدّث ضوابط والأسعار في الكاشير!',
    );
    this.emitHud();
  }

  public checkoutPosOrder(params: {
    items: Array<{ itemId: FullMenuItemId; qty: number }>;
    discountPct: number;
    paidAmount: number;
    paymentMethod: 'cash' | 'instapay';
    customerNameAr: string;
    tipAmount?: number;
    vipMemberId?: string;
    isDelivery?: boolean;
  }): PosReceipt | null {
    if (!this.checkRolePermission('serve_cashier')) return null;
    if (this.cashierSettings.cashierRegisterLocked) {
      this.sound.playError();
      this.showToast('🔒 درج الكاشير مقفول بأمر المعلم محمد! اطلب منه الفتح من لوحة التحكم.');
      return null;
    }

    const vipMember = params.vipMemberId
      ? this.vipMembers.find((v) => v.id === params.vipMemberId)
      : undefined;
    const vipDiscountPct = vipMember ? VIP_TIER_CONFIG[vipMember.tier].discountPct : 0;

    const calc = calculatePosTotals({
      items: params.items,
      recipePrices: this.prices,
      extraPrices: this.extraPrices,
      discountPct: params.discountPct,
      vipDiscountPct,
      settings: this.cashierSettings,
      tipAmount: params.tipAmount ?? 0,
      paidAmount: params.paidAmount,
      paymentMethod: params.paymentMethod,
    });

    if (calc.lines.length === 0) {
      this.sound.playError();
      this.showToast('أضف صنف واحد على الأقل للفاتورة!');
      return null;
    }
    if (!calc.isPaymentSufficient) {
      this.sound.playError();
      this.showToast(`المبلغ المدفوع ناقص ${calc.shortBy} ج.م!`);
      return null;
    }

    const cashierNameAr =
      PLAYER_CHARACTERS[this.selectedCharacterId]?.nameAr ?? 'علي';
    const issued = issuePosReceipt({
      seq: this.nextInvoiceSeq,
      day: this.day,
      clockStr: formatGameClock(this.timeOfDay),
      cashierNameAr,
      managerNameAr: 'المعلم محمد',
      customerNameAr: vipMember ? vipMember.nameAr : params.customerNameAr,
      paymentMethod: params.paymentMethod,
      calc,
      source: 'pos',
      vipMemberId: vipMember?.id,
      vipTier: vipMember?.tier,
      isDelivery: params.isDelivery,
    });

    this.nextInvoiceSeq = issued.nextSeq;
    this.cashierReceipts = [issued.receipt, ...this.cashierReceipts].slice(0, 60);

    if (vipMember) {
      this.vipMembers = awardVipPoints(this.vipMembers, vipMember.id, calc.total);
    }

    const kdsTicket = createKitchenTicketFromReceipt(issued.receipt);
    this.kitchenTickets = [kdsTicket, ...this.kitchenTickets].slice(0, 30);

    this.money += calc.total;
    this.dailyStats.revenue += calc.total;
    this.dailyStats.tipsEarned += calc.tipAmount;
    this.dailyStats.ordersServed += 1;
    this.crewLeaderboard = recordCrewChallengePoint(
      this.crewLeaderboard,
      this.selectedCharacterId,
      'cashier',
      20,
    );
    this.reputation = clampReputation(this.reputation + 1);

    this.sound.playCashRegister();
    this.spawnCelebrationBurst(-9.9, 1.45, 0.65);
    this.saveGame();
    this.showToast(
      `🧾 فاتورة ${issued.receipt.invoiceNumber} — ${calc.total} ج.م${
        params.isDelivery ? ' (أوردر دليفري للمطبخ 🛵)' : ' (اترسل لشاشة المطبخ 🔥)'
      }`,
    );
    this.syncRoomAction(
      'pos_checkout',
      `${cashierNameAr} أصدر فاتورة ${issued.receipt.invoiceNumber} بقيمة ${calc.total} ج.م وأرسلها للمطبخ!`,
    );
    this.emitHud();
    return issued.receipt;
  }

  public registerVipCustomer(nameAr: string, phone: string): VipMember | null {
    const cleanName = nameAr.replace(/[<>`]/g, '').trim().slice(0, 28);
    const cleanPhone = phone.replace(/[^\d+]/g, '').slice(0, 15) || '01000000000';
    if (!cleanName) {
      this.sound.playError();
      this.showToast('اكتب اسم الزبون الدائم أولاً!');
      return null;
    }
    const created: VipMember = {
      id: `vip-${Date.now().toString(36).slice(-4)}-${Math.floor(Math.random() * 90 + 10)}`,
      nameAr: cleanName,
      phone: cleanPhone,
      points: 15,
      tier: 'bronze',
      visits: 0,
      totalSpent: 0,
    };
    this.vipMembers = [created, ...this.vipMembers].slice(0, 40);
    this.sound.playPickup();
    this.saveGame();
    this.showToast(`⭐ تم تسجيل "${cleanName}" في بطاقة الولاء VIP (خصم ٥٪)!`);
    this.syncRoomAction('register_vip', `تم تسجيل عميل VIP جديد: ${cleanName}`);
    this.emitHud();
    return created;
  }

  public advanceKitchenTicket(ticketId: string, nextStatus: KitchenTicketStatus): void {
    const ticket = this.kitchenTickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    if (nextStatus === 'cooking' || nextStatus === 'ready') {
      if (!this.checkRolePermission('cook_kitchen')) return;
    } else if (nextStatus === 'served') {
      const mpSt = this.mp.getStatus();
      const canServe =
        canPerformFixedRoleAction(
          this.selectedCharacterId,
          mpSt.mode === 'online',
          mpSt.members,
          'serve_cashier',
        ).allowed ||
        (ticket.isDelivery &&
          canPerformFixedRoleAction(
            this.selectedCharacterId,
            mpSt.mode === 'online',
            mpSt.members,
            'drive_delivery',
          ).allowed);
      if (!canServe) {
        this.sound.playError();
        this.showToast('تسليم الأوردر الجاهز من صلاحية الكاشير علي أو سائق التوصيل محمود!');
        return;
      }
    }

    const actorNameAr = PLAYER_CHARACTERS[this.selectedCharacterId]?.nameAr ?? 'أحمد';
    const clockStr = formatGameClock(this.timeOfDay);
    const updated = advanceKitchenTicketStatus(ticket, nextStatus, actorNameAr, clockStr);
    if (updated === ticket) return;

    this.kitchenTickets = this.kitchenTickets.map((t) =>
      t.id === ticketId ? updated : t,
    );
    if (nextStatus === 'cooking') {
      this.sound.playSizzle();
    } else if (nextStatus === 'ready') {
      this.sound.playPickup();
    } else {
      this.sound.playCashRegister();
    }
    this.saveGame();
    const statusLabelAr =
      nextStatus === 'cooking'
        ? 'بدأ التحضير على النار 🔥'
        : nextStatus === 'ready'
          ? 'جاهز للتسليم على الباص ✅'
          : 'تم التسليم للزبون 🛵';
    this.showToast(`أوردر ${ticket.invoiceNumber}: ${statusLabelAr}`);
    this.syncRoomAction('kds_advance', `${actorNameAr}: ${ticket.invoiceNumber} — ${statusLabelAr}`);
    this.emitHud();
  }

  public requestOrExecuteRefund(receiptId: string, reasonAr: string): void {
    const receipt = this.cashierReceipts.find((r) => r.id === receiptId);
    if (!receipt) return;
    if (receipt.refundStatus === 'approved') {
      this.showToast('تم رد هذه الفاتورة مسبقاً!');
      return;
    }

    const mpSt = this.mp.getStatus();
    const isManager = canPerformFixedRoleAction(
      this.selectedCharacterId,
      mpSt.mode === 'online',
      mpSt.members,
      'manage_shop',
    ).allowed;

    if (!isManager && !this.checkRolePermission('serve_cashier')) {
      return;
    }

    const actorNameAr = PLAYER_CHARACTERS[this.selectedCharacterId]?.nameAr ?? 'علي';
    const cleanReason = reasonAr.trim() || 'مراجعة حساب الفاتورة';
    const clockStr = formatGameClock(this.timeOfDay);

    if (isManager) {
      this.cashierReceipts = this.cashierReceipts.map((r) =>
        r.id === receiptId
          ? {
              ...r,
              refundStatus: 'approved',
              refundReasonAr: cleanReason,
              refundRequestedByAr: actorNameAr,
              refundApprovedByAr: 'المعلم محمد',
              refundedAtClock: clockStr,
            }
          : r,
      );
      this.money = Math.max(0, this.money - receipt.total);
      this.sound.playCashRegister();
      this.saveGame();
      this.showToast(`↩️ المعلم اعتمد مرتجع ${receipt.invoiceNumber} (-${receipt.total} ج.م)`);
      this.syncRoomAction(
        'approve_refund',
        `المعلم محمد اعتمد مرتجع الفاتورة ${receipt.invoiceNumber} (-${receipt.total} ج.م)!`,
      );
      this.emitHud();
      return;
    }

    this.cashierReceipts = this.cashierReceipts.map((r) =>
      r.id === receiptId
        ? {
            ...r,
            refundStatus: 'pending',
            refundReasonAr: cleanReason,
            refundRequestedByAr: actorNameAr,
          }
        : r,
    );
    this.sound.playPickup();
    this.saveGame();
    this.showToast(`⏳ تم إرسال طلب مرتجع ${receipt.invoiceNumber} لموافقة المعلم محمد`);
    this.syncRoomAction(
      'request_refund',
      `${actorNameAr} يطلب موافقة المعلم على مرتجع ${receipt.invoiceNumber} (${cleanReason})`,
    );
    this.emitHud();
  }

  public resolvePendingRefund(receiptId: string, approve: boolean): void {
    if (!this.checkRolePermission('manage_shop')) return;
    const receipt = this.cashierReceipts.find((r) => r.id === receiptId);
    if (!receipt || receipt.refundStatus === 'approved') return;

    const clockStr = formatGameClock(this.timeOfDay);
    this.cashierReceipts = this.cashierReceipts.map((r) =>
      r.id === receiptId
        ? {
            ...r,
            refundStatus: approve ? 'approved' : 'rejected',
            refundApprovedByAr: 'المعلم محمد',
            refundedAtClock: clockStr,
          }
        : r,
    );
    if (approve) {
      this.money = Math.max(0, this.money - receipt.total);
      this.sound.playCashRegister();
    } else {
      this.sound.playError();
    }
    this.saveGame();
    this.showToast(
      approve
        ? `✅ تم اعتماد مرتجع ${receipt.invoiceNumber} وخصم ${receipt.total} ج.م من الدرج`
        : `❌ تم رفض طلب مرتجع ${receipt.invoiceNumber}`,
    );
    this.syncRoomAction(
      approve ? 'approve_refund' : 'reject_refund',
      approve
        ? `المعلم محمد اعتمد مرتجع ${receipt.invoiceNumber} (-${receipt.total} ج.م)!`
        : `المعلم محمد رفض طلب مرتجع ${receipt.invoiceNumber}.`,
    );
    this.emitHud();
  }

  public settleDailyShift(): ShiftSettlementRecord | null {
    if (!this.checkRolePermission('manage_shop')) return null;
    const summary = computeAccountingSummary(this.cashierReceipts, this.cashierSettings);
    const preview = computeShiftSettlementPreview({
      day: this.day,
      summary,
      dailyStats: this.dailyStats,
    });
    const record: ShiftSettlementRecord = {
      ...preview,
      id: `settle-d${this.day}-${Date.now().toString(36).slice(-4)}`,
      clockStr: formatGameClock(this.timeOfDay),
      settledByAr: PLAYER_CHARACTERS[this.selectedCharacterId]?.nameAr ?? 'محمد',
    };
    this.shiftSettlements = [record, ...this.shiftSettlements].slice(0, 20);
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(-9.9, 1.5, 0.65);
    this.saveGame();
    this.showToast(
      `📊 تم تقفيل وردية اليوم ${this.day}! الصافي: ${record.netProfit} ج.م وموزع على الـ ٤ شركاء`,
    );
    this.syncRoomAction(
      'settle_shift',
      `المعلم محمد قفّل وردية اليوم ${this.day} ووزع أرباح الشركاء الـ ٤ (صافي ${record.netProfit} ج.م)!`,
    );
    this.emitHud();
    return record;
  }

  public answerCustomerInquiry(
    inquiryId: string,
    mode: InquiryReplyMode,
  ): ReturnType<typeof evaluateInquiryReply> | null {
    if (!this.checkRolePermission('serve_cashier')) return null;
    const inq = this.customerInquiries.find((q) => q.id === inquiryId);
    if (!inq) return null;

    const evalRes = evaluateInquiryReply({
      inquiry: inq,
      mode,
      recipePrices: this.prices,
      extraPrices: this.extraPrices,
      settings: this.cashierSettings,
    });

    inq.answered = true;
    inq.replySummaryAr = evalRes.replyAr;

    if (evalRes.ok) {
      this.reputation = clampReputation(this.reputation + evalRes.reputationDelta);
      if (evalRes.tipGain > 0) {
        this.money += evalRes.tipGain;
        this.dailyStats.revenue += evalRes.tipGain;
        this.dailyStats.tipsEarned += evalRes.tipGain;
      }
      this.sound.playPickup();
      this.showToast(`💬 ${evalRes.replyAr}`);
    } else {
      this.sound.playError();
      this.showToast(evalRes.replyAr);
    }

    this.saveGame();
    this.emitHud();
    return evalRes;
  }

  public spawnCustomerInquiryManual(): void {
    const fresh = generateCustomerInquiry(
      `inq-${this.inquirySeq++}`,
      this.prices,
      this.extraPrices,
      this.orders,
    );
    this.customerInquiries = [fresh, ...this.customerInquiries].slice(0, 6);
    this.sound.playPickup();
    this.emitHud();
  }

  public buyUpgrade(key: keyof ShopUpgrades): void {
    if (!this.requireMohamedCityManagement()) return;
    const current = this.upgrades[key];
    if (current >= 4) {
      this.showToast('وصلت للحد الأقصى لهذا التطوير!');
      return;
    }
    const cost = computeUpgradeCost(key, current);
    if (this.money < cost) {
      this.sound.playError();
      this.showToast(`تحتاج ${cost} جنيه لهذا التطوير`);
      return;
    }
    this.money -= cost;
    this.dailyStats.expenses += cost;
    this.upgrades[key] = current + 1;
    this.sound.playCashRegister();
    this.saveGame();
    this.showToast('تم التطوير بنجاح! جودة المحل ارتفعت');
    this.syncRoomAction('buy_upgrade', 'محمد طوّر تجهيزات المحل!');
    this.emitHud();
  }

  public toggleShopOpen(): void {
    if (!this.checkRolePermission('manage_shop')) return;
    this.shopOpen = !this.shopOpen;
    if (this.shopOpen && this.orders.length === 0) {
      this.orderSpawnTimer = 0.05;
    }
    this.sound.playDoor();
    const toast = this.shopOpen
      ? 'تم فتح محل المعلم! الزبائن في الطريق'
      : 'تم غلق شاتر المحل';
    this.showToast(toast);
    this.syncRoomAction('toggle_shop', this.shopOpen ? 'محمد فتح محل المعلم!' : 'محمد قفل المحل.');
    this.emitHud();
  }

  public toggleCarMode(): void {
    if (this.inCar) {
      this.inCar = false;
      this.carSpeed = 0;
      this.carDoorAnimTimer = 0.72;
      this.world.heroCar.cockpitHandsGroup.visible = false;
      this.syncMusicEngine();
      this.sound.playCarDoor(true);
      this.snapCameraNextFrame = true;

      const sideX = Math.cos(this.carYaw) * 1.9;
      const sideZ = -Math.sin(this.carYaw) * 1.9;
      const resolved = resolveCircleAABB(
        this.carX - sideX,
        this.carZ - sideZ,
        0.55,
        this.world.colliders,
      );
      this.playerX = resolved.x;
      this.playerZ = resolved.z;
      this.groundY = 0.14;
      this.playerY = 1.68;
      this.world.playerActor.group.visible = this.cameraMode !== 'first_person';
      for (let fi = 0; fi < this.accompanyingFollowers.length; fi++) {
        const f = this.accompanyingFollowers[fi];
        f.actor.group.visible = true;
        f.actor.group.position.set(
          this.playerX + ((fi % 3) - 1) * 0.9,
          0.14,
          this.playerZ + 1.0 + Math.floor(fi / 3) * 0.75,
        );
      }
      this.updateFirstPersonWalk(0.016);
      this.renderer.render(this.scene, this.camera);
      this.showToast('نزلت من السيارة المشتركة');
      this.emitHud();
      return;
    }

    if (this.vehicleLockedByOwner && this.selectedCharacterId !== 'mohamed') {
      this.sound.playError();
      this.showToast(`🔒 السيارة مقفولة بمفتاح ${OWNER_DISPLAY_NAME_AR}!`);
      this.emitHud();
      return;
    }

    const dist = Math.hypot(this.playerX - this.carX, this.playerZ - this.carZ);
    if (dist <= 4.6) {
      this.inCar = true;
      this.carDoorAnimTimer = 0.72;
      this.snapCameraNextFrame = true;
      this.world.playerActor.group.visible = false;
      for (const f of this.accompanyingFollowers) {
        f.actor.group.visible = false;
      }
      this.syncVehiclePassengersVisual();
      this.sound.playCarDoor(false);
      this.syncMusicEngine();
      this.updateVehicleDriving(0.016);
      this.renderer.render(this.scene, this.camera);
      const vehName = VEHICLE_CATALOG[this.activeVehicleId]?.nameAr ?? 'السيارة';
      const passengerCount = this.accompanyingFollowers.length + (this.companionDef ? 1 : 0);
      this.showToast(
        passengerCount > 0
          ? `ركبت ${vehName} ومعاك ${passengerCount} راكب (كابينة + صندوق) — WASD قيادة · C الكاميرا · F نزول`
          : `ركبت ${vehName} — WASD قيادة · C الداخلية · L النور · R الراديو · F نزول`,
      );
      this.emitHud();
    } else {
      this.showToast('اقترب من السيارة أو الموتوسيكل للركوب [F]');
    }
  }

  private tryQuickAddIngredient(ing: IngredientId): void {
    const insideShop =
      this.playerX >= -16.8 &&
      this.playerX <= -8.6 &&
      this.playerZ >= -4.6 &&
      this.playerZ <= 4.6;
    if (!insideShop || this.inCar) return;
    this.handleAddIngredient(ing);
  }

  private handleAddIngredient(ing: IngredientId): void {
    if (!this.checkRolePermission('cook_kitchen')) return;
    if (this.heldReadyPack) {
      this.sound.playError();
      this.showToast('معاك طلب توصيل جاهز! سلمه للسيارة أو الكاونتر أولاً');
      return;
    }
    const check = canAddIngredient(this.heldIngredients, ing, this.inventory);
    if (!check.ok) {
      this.sound.playError();
      this.showToast(check.reasonAr ?? 'لا يمكن إضافة المكون');
      return;
    }
    this.heldIngredients = [...this.heldIngredients, ing];
    this.cookActionTimer = 0.38;
    const isFried = ing === 'taameya' || ing === 'fries';
    const goldenHit = isFried && isGoldenSizzleWindow(this.simTimeSec);
    if (goldenHit) {
      this.heldCrispBonus = true;
    }
    if (isFried || ing === 'ful') {
      this.sound.playSizzle(goldenHit);
    } else {
      this.sound.playPickup();
    }
    if (goldenHit) {
      this.showToast('طشّة ذهبي مقرمشة! (+٥ ج.م إضافية عند التقديم)');
    }
    this.emitHud();
  }

  public triggerInteract(): void {
    if (this.phase !== 'playing') return;
    if (this.activeHint === null) return;

    const act = this.activeHint.actionType;
    switch (act) {
      case 'toggle_shop':
        this.toggleShopOpen();
        break;
      case 'toggle_lights':
        if (!this.checkRolePermission('manage_shop')) return;
        this.shopLightsOn = !this.shopLightsOn;
        this.sound.playPickup();
        this.showToast(this.shopLightsOn ? 'تم تشغيل الأنوار' : 'تم إطفاء الأنوار');
        this.syncRoomAction('toggle_lights');
        this.emitHud();
        break;
      case 'toggle_door': {
        const door = this.world.doors.find((d) => d.id === this.activeHint?.doorId);
        if (door) {
          door.isOpen = !door.isOpen;
          if (door.collider) {
            door.collider.active = !door.isOpen;
          }
          this.sound.playDoor();
          this.showToast(door.isOpen ? 'تم فتح الباب' : 'تم غلق الباب');
          this.emitHud();
        }
        break;
      }
      case 'talk_shop_owner': {
        if (this.activeHint.shopId) {
          this.activeShopOwnerId = this.activeHint.shopId;
          this.keysHeld.clear();
          this.dragLooking = false;
          document.exitPointerLock?.();
          this.sound.playPickup();
          this.emitHud();
        }
        break;
      }
      case 'talk_person': {
        const targetId = this.activeHint.personId ?? 'street-ped';
        const kind = this.activeHint.personKind ?? 'pedestrian';
        if (kind === 'customer') {
          const idxStr = targetId.replace('cust-', '');
          const custIdx = Number(idxStr);
          const custNpc =
            (!Number.isNaN(custIdx) && this.customers[custIdx]) ||
            this.customers.find((c) => !c.leaving && Math.hypot(c.x - this.playerX, c.z - this.playerZ) <= 3.2);
          if (custNpc) {
            this.openCustomerDialogue(custNpc);
          }
        } else if (kind === 'spouse' && this.spouseId) {
          this.openDialogueSession('spouse', this.spouseId);
        } else {
          this.openDialogueSession(kind, targetId);
        }
        break;
      }
      case 'talk_object': {
        if (this.activeHint.objectKind) {
          this.startObjectDialogue(this.activeHint.objectKind, this.activeHint.objectId);
        }
        break;
      }
      case 'school_enroll': {
        this.enrollBenhaSchool('both');
        break;
      }
      case 'taxi_action':
        this.handleTaxiInteract();
        break;
      case 'mechanic_repair':
        this.handleMechanicRepair();
        break;
      case 'bakery_bake':
        this.handleBakeryJob();
        break;
      case 'ahwa_serve':
        this.handleAhwaJob();
        break;
      case 'pick_bread':
        this.handleAddIngredient('bread');
        break;
      case 'add_ful':
        this.handleAddIngredient('ful');
        break;
      case 'add_taameya':
        this.handleAddIngredient('taameya');
        break;
      case 'add_salad':
        this.handleAddIngredient('salad');
        break;
      case 'add_tahina':
        this.handleAddIngredient('tahina');
        break;
      case 'add_pickles':
        this.handleAddIngredient('pickles');
        break;
      case 'add_fries':
        this.handleAddIngredient('fries');
        break;
      case 'discard_sandwich':
        this.heldIngredients = [];
        this.heldReadyPack = null;
        this.heldCrispBonus = false;
        this.sound.playPickup();
        this.showToast('تم تفريغ السندوتش');
        this.emitHud();
        break;
      case 'serve_customer':
        this.serveCounterOrder();
        break;
      case 'open_cashier':
        document.exitPointerLock?.();
        window.dispatchEvent(new CustomEvent('elmoalem:toggle-cashier'));
        break;
      case 'enter_car':
        this.toggleCarMode();
        break;
      case 'refuel_car':
        if (this.money < 25) {
          this.sound.playError();
          this.showToast('تحتاج ٢٥ جنيه لتموين وصيانة السيارة');
        } else {
          this.money -= 25;
          this.dailyStats.expenses += 25;
          this.carFuel = 100;
          this.carCondition = 100;
          this.sound.playCashRegister();
          this.saveGame();
          this.showToast('تم تفويل السيارة وصيانتها بالكامل!');
          this.emitHud();
        }
        break;
      case 'open_market':
        window.dispatchEvent(new CustomEvent('elmoalem:open-market'));
        break;
      case 'home_tv':
        this.reputation = clampReputation(this.reputation + 1);
        this.sound.playPickup();
        this.showToast('قعدت ترتاح في الصالة قدام التلفزيون في جو مصري دافي');
        this.emitHud();
        break;
      case 'home_sofa':
        this.reputation = clampReputation(this.reputation + 1);
        this.sound.playPickup();
        this.showToast('قعدت على الكنبة وشربت كوباية شاي مظبوط في جو البيت');
        this.emitHud();
        break;
      case 'home_eat':
        this.reputation = clampReputation(this.reputation + 2);
        this.eatFood();
        break;
      case 'home_drink':
        this.reputation = clampReputation(this.reputation + 1);
        this.drinkWater();
        break;
      case 'home_kitchen':
        this.reputation = clampReputation(this.reputation + 2);
        this.sound.playSizzle();
        this.eatFood();
        break;
      case 'mediate_fight':
      case 'fix_broken_car':
      case 'encourage_vendor':
      case 'serve_wedding_feast':
        this.resolveActiveStreetEvent();
        break;
      case 'home_sleep':
        this.phase = 'gameover';
        this.customerBubble = null;
        this.world.yellowArrowGroup.visible = false;
        this.keysHeld.clear();
        this.syncMusicEngine();
        document.exitPointerLock?.();
        this.saveGame();
        this.syncBodyState();
        this.emitHud();
        break;
      case 'deliver_order':
        this.completeDeliveryDropoff();
        break;
    }
  }

  private resolveActiveStreetEvent(): void {
    if (!this.activeStreetEvent || this.activeStreetEvent.resolved) return;
    const ev = this.activeStreetEvent;
    const rew = resolveStreetEventReward(ev);
    this.money += rew.moneyGain;
    this.dailyStats.revenue += rew.moneyGain;
    this.dailyStats.sideJobIncome += rew.moneyGain;
    this.reputation = clampReputation(this.reputation + rew.repGain);
    if (ev.type === 'broken_car') {
      this.sound.playWrenchRepair();
    } else {
      this.sound.playCashRegister();
    }
    this.spawnCelebrationBurst(ev.x, 1.6, ev.z);
    this.activeStreetEvent = null;
    this.streetEventCooldown = 28 + Math.random() * 14;
    this.syncStreetEventVisuals(0);
    this.saveGame();
    this.showToast(rew.toastAr);
    this.emitHud();
  }

  private handleTaxiInteract(): void {
    if (!this.activeTaxi) return;
    if (!this.activeTaxi.pickedUp) {
      this.activeTaxi.pickedUp = true;
      this.world.taxiPassengerActor.group.visible = false;
      this.world.taxiPickupBeacon.visible = false;
      this.world.taxiDropoffBeacon.visible = true;
      this.world.taxiDropoffBeacon.position.set(
        this.activeTaxi.dropoffX,
        0,
        this.activeTaxi.dropoffZ,
      );
      this.sound.playCarDoor(true);
      this.showToast(`ركب معاك ${this.activeTaxi.passengerName} — وصّله إلى ${this.activeTaxi.dropoffStreetAr}`);
      this.emitHud();
    } else {
      const mult = VEHICLE_CATALOG[this.activeVehicleId]?.taxiBonusMult ?? 1;
      const fare = Math.round(this.activeTaxi.fare * mult);
      this.money += fare;
      this.dailyStats.revenue += fare;
      this.dailyStats.taxiTrips += 1;
      this.dailyStats.sideJobIncome += fare;
      this.reputation = clampReputation(this.reputation + 3);
      this.sound.playCashRegister();
      this.spawnCelebrationBurst(this.carX, 1.5, this.carZ);
      this.world.taxiDropoffBeacon.visible = false;
      this.showToast(`وصّلت ${this.activeTaxi.passengerName} بنجاح! استلمت ${fare} ج.م أجرة`);
      this.activeTaxi = null;
      this.taxiSpawnCooldown = 2.0;
      this.saveGame();
      this.emitHud();
    }
  }

  private handleMechanicRepair(): void {
    const reward = this.activeJob === 'mechanic' ? 75 : 55;
    this.money += reward;
    this.dailyStats.revenue += reward;
    this.dailyStats.repairsDone += 1;
    this.dailyStats.sideJobIncome += reward;
    this.reputation = clampReputation(this.reputation + 2);
    this.sound.playWrenchRepair();
    this.spawnCelebrationBurst(31.2, 1.5, -20.5);
    this.saveGame();
    this.showToast(`أحسنت يا أسطى! خلصت صيانة العربية واستلمت ${reward} ج.م`);
    this.emitHud();
  }

  private handleBakeryJob(): void {
    const pay = this.activeJob === 'baker' ? 30 : 22;
    this.money += pay;
    this.dailyStats.revenue += pay;
    this.dailyStats.sideJobIncome += pay;
    this.inventory = { ...this.inventory, bread: this.inventory.bread + 10 };
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(-16.6, 1.5, 22.0);
    this.saveGame();
    this.showToast(`خبزت طاولة عيش بلدي ساخنة! (+${pay} ج.م و+١٠ أرغفة)`);
    this.emitHud();
  }

  private handleAhwaJob(): void {
    const pay = this.activeJob === 'barista' ? 35 : 25;
    this.money += pay;
    this.dailyStats.revenue += pay;
    this.dailyStats.sideJobIncome += pay;
    this.reputation = clampReputation(this.reputation + 2);
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(16.6, 1.5, 22.0);
    this.saveGame();
    this.showToast(`سخنت الشاي والقهوة للزباين! (+${pay} ج.م و+٢ سمعة)`);
    this.emitHud();
  }

  private serveCounterOrder(): void {
    if (!this.checkRolePermission('serve_cashier')) return;
    if (this.orders.length === 0) {
      this.sound.playError();
      this.showToast('مفيش زبائن منتظرين حالياً');
      return;
    }
    if (this.heldIngredients.length === 0) {
      this.sound.playError();
      this.showToast('جهز السندوتش الأول من الطاولة!');
      return;
    }

    let matchedIdx = this.orders.findIndex(
      (ord) =>
        !ord.isDelivery &&
        this.heldIngredients.length ===
          RECIPES[ord.recipeId].requiredIngredients.length &&
        RECIPES[ord.recipeId].requiredIngredients.every((r) =>
          this.heldIngredients.includes(r),
        ),
    );

    if (matchedIdx === -1) {
      matchedIdx = this.orders.findIndex(
        (ord) =>
          ord.isDelivery &&
          !this.heldReadyPack &&
          this.heldIngredients.length ===
            RECIPES[ord.recipeId].requiredIngredients.length &&
          RECIPES[ord.recipeId].requiredIngredients.every((r) =>
            this.heldIngredients.includes(r),
          ),
      );
      if (matchedIdx !== -1) {
        const delOrder = this.orders[matchedIdx];
        for (const ing of this.heldIngredients) {
          this.inventoryConsumedToday[ing] = (this.inventoryConsumedToday[ing] ?? 0) + 1;
        }
        this.inventory = consumeIngredients(this.inventory, this.heldIngredients);
        this.heldIngredients = [];
        this.heldReadyPack = delOrder.recipeId;
        this.sound.playPickup();
        this.showToast(
          `جهزت طلب توصيل لـ ${delOrder.deliveryTargetName}! اركب السيارة [F] ووصله`,
        );
        this.emitHud();
        return;
      }

      this.sound.playError();
      this.showToast('المكونات مش مطابقة لطلب الزبون! راجع الطلب');
      return;
    }

    const order = this.orders[matchedIdx];
    const recipe = RECIPES[order.recipeId];
    for (const ing of this.heldIngredients) {
      this.inventoryConsumedToday[ing] = (this.inventoryConsumedToday[ing] ?? 0) + 1;
    }
    this.inventory = consumeIngredients(this.inventory, this.heldIngredients);
    this.heldIngredients = [];
    order.deliveredCount += 1;

    const price = this.prices[order.recipeId];
    const patienceRatio = order.patience / Math.max(1, order.maxPatience);
    const tip = computeTipBonus(
      patienceRatio,
      this.reputation,
      this.upgrades.decorLevel,
      this.activeRole,
    );
    const sizzleBonus = computeSizzleBonus(this.heldCrispBonus, this.activeRole);
    const vipFastBonus = order.archetype === 'rushed' && patienceRatio >= 0.7 ? 5 : 0;
    this.heldCrispBonus = false;
    const extraTip = tip + sizzleBonus + vipFastBonus;
    const totalEarned = price + extraTip;
    this.money += totalEarned;
    this.dailyStats.revenue += totalEarned;
    this.dailyStats.tipsEarned += extraTip;

    // Issue official numbered receipt in the cashier accounting ledger
    const counterCalc = calculatePosTotals({
      items: [{ itemId: order.recipeId, qty: 1 }],
      recipePrices: this.prices,
      extraPrices: this.extraPrices,
      discountPct: 0,
      settings: this.cashierSettings,
      tipAmount: extraTip,
      paidAmount: totalEarned,
      paymentMethod: 'cash',
    });
    const issuedCounter = issuePosReceipt({
      seq: this.nextInvoiceSeq,
      day: this.day,
      clockStr: formatGameClock(this.timeOfDay),
      cashierNameAr: PLAYER_CHARACTERS[this.selectedCharacterId]?.nameAr ?? 'علي',
      managerNameAr: 'المعلم محمد',
      customerNameAr: order.customerName,
      paymentMethod: 'cash',
      calc: counterCalc,
      source: 'counter',
    });
    this.nextInvoiceSeq = issuedCounter.nextSeq;
    this.cashierReceipts = [issuedCounter.receipt, ...this.cashierReceipts].slice(0, 60);

    this.sound.playCashRegister();
    this.spawnCelebrationBurst(-9.5, 1.5, 0);
    this.cameraTrauma = Math.min(1, this.cameraTrauma + 0.16);

    if (order.deliveredCount >= order.quantity) {
      this.dailyStats.ordersServed += 1;
      this.crewLeaderboard = recordCrewChallengePoint(
        this.crewLeaderboard,
        this.selectedCharacterId,
        'cook',
        25,
      );
      const repDelta = computeReputationDelta(
        true,
        patienceRatio,
        price,
        recipe.basePrice,
      );
      this.reputation = clampReputation(this.reputation + repDelta);

      const postEval = evaluateCustomerServiceState({
        archetype: order.archetype,
        patienceRatio,
        chargedPrice: price,
        basePrice: recipe.basePrice,
        decorLevel: this.upgrades.decorLevel,
        goldenSizzle: sizzleBonus > 0,
        served: true,
      });
      const servedNpc = this.customers.find((c) => c.orderId === order.id);
      if (servedNpc) {
        servedNpc.reactionEmoji = postEval.emoji;
        servedNpc.reactionMoodLabel = postEval.moodLabelAr;
        servedNpc.reactionLineAr = postEval.dynamicLineAr;
        servedNpc.reactionTone = postEval.moodTone;
        servedNpc.reactionExpression = postEval.facialExpression;
        servedNpc.reactionAnim = postEval.animPose;
        servedNpc.reactionTimer = 6.0;
        servedNpc.lastServiceScore = postEval.score;
        setActorExpression(servedNpc.actor, postEval.facialExpression);
      }

      this.releaseCustomerNpc(order.id, true);
      this.orders.splice(matchedIdx, 1);
      const bonusNote = sizzleBonus > 0 ? ' · قرمشة ذهبية!' : vipFastBonus > 0 ? ' · مكافأة سرعة VIP!' : '';
      this.showToast(
        `${postEval.emoji} ${order.customerName}: "${postEval.dynamicLineAr}" (+${totalEarned} ج.م${bonusNote})`,
      );
    } else {
      this.showToast(
        `سندوتش ${order.deliveredCount}/${order.quantity} جاهز! كمّل الباقي لـ ${order.customerName}`,
      );
    }

    this.saveGame();
    this.syncRoomAction('serve_counter');
    this.emitHud();
  }

  private completeDeliveryDropoff(): void {
    if (!this.checkRolePermission('drive_delivery')) return;
    const delIdx = this.orders.findIndex(
      (o) => o.isDelivery && o.recipeId === this.heldReadyPack,
    );
    if (delIdx === -1) return;
    const ord = this.orders[delIdx];
    const price = this.prices[ord.recipeId];
    const jobMult = this.activeJob === 'delivery' ? 2 : this.activeVehicleId === 'pickup' ? 1.5 : 1;
    const bonus = Math.round((ord.offeredTip + (this.activeRole === 'driver' ? 8 : 0)) * jobMult);
    const total = price + bonus;
    this.money += total;
    this.dailyStats.revenue += total;
    this.dailyStats.tipsEarned += bonus;
    this.dailyStats.ordersServed += 1;
    this.dailyStats.deliveriesCompleted += 1;
    this.reputation = clampReputation(this.reputation + 4);
    this.heldReadyPack = null;
    this.orders.splice(delIdx, 1);
    this.sound.playCashRegister();
    this.spawnCelebrationBurst(this.carX, 1.5, this.carZ);
    this.saveGame();
    this.showToast(`تم التوصيل بنجاح! استلمت ${total} جنيه`);
    this.syncRoomAction('delivery_complete', `محمود وصّل طلب الدليفري وكسب +${total} ج.م!`);
    this.emitHud();
  }

  private releaseCustomerNpc(orderId: string, tryDine = false): void {
    for (const npc of this.customers) {
      if (npc.orderId !== orderId) continue;
      if (tryDine && this.world.diningSeats.length > 0) {
        const occupied = new Set(
          this.customers
            .map((c) => c.diningSeatIdx)
            .filter((idx): idx is number => idx !== undefined),
        );
        const freeIdx = this.world.diningSeats.findIndex((_, i) => !occupied.has(i));
        if (freeIdx !== -1) {
          const seat = this.world.diningSeats[freeIdx];
          npc.orderId = undefined;
          npc.diningSeatIdx = freeIdx;
          npc.dineTimer = 10;
          npc.leaving = false;
          npc.targetX = seat.x;
          npc.targetZ = seat.z;
          continue;
        }
      }
      npc.leaving = true;
      npc.targetX = -5.6;
      npc.targetZ = Math.random() > 0.5 ? 28 : -28;
    }
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    this.toastTimer = 3.8;
    this.emitHud();
  }

  private syncBodyState(): void {
    document.body.dataset.state = this.phase;
  }

  private scheduleNextTick(): void {
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);
    if (this.isSoftwareGl) {
      this.afterDraw(() => this.tick());
    } else {
      this.frameId = requestAnimationFrame(() => this.tick());
    }
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick(): void {
    if (this.disposed) return;

    const now = performance.now();
    const rawDt = (now - this.lastTimeMs) / 1000;
    this.lastTimeMs = now;
    const maxDt = this.isSoftwareGl ? 0.1 : 0.05;
    const dt = Math.min(Math.max(rawDt, 0.001), maxDt);

    if (rawDt > 0.002 && rawDt < 0.5) {
      this.fpsSamples.push(Math.min(120, 1 / rawDt));
      if (this.fpsSamples.length > 24) this.fpsSamples.shift();
      this.fpsEstimate = Math.max(
        1,
        Math.round(
          this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length,
        ),
      );
    }

    if (this.phase === 'title') {
      this.updateTitleFlyover(dt);
      this.updateAmbientWorld(dt);
      this.updateDayNightAndWeather(dt * 0.25);
    } else if (this.phase === 'playing') {
      this.updatePlaying(dt);
      this.updateAmbientWorld(dt);
      this.updateDayNightAndWeather(dt);
    }

    this.adaptiveCheckTimer += dt;
    if (this.adaptiveCheckTimer >= 3.0) {
      this.adaptiveCheckTimer = 0;
      const nextQ = evaluateAdaptiveQuality(
        this.quality,
        this.fpsEstimate,
        this.adaptiveQuality,
      );
      if (nextQ !== this.quality) {
        this.setQuality(nextQ);
      }
    }

    this.hudSyncTimer += dt;
    if (this.hudSyncTimer >= 0.12) {
      this.hudSyncTimer = 0;
      this.emitHud();
    }

    this.scheduleNextTick();
  }

  private updateTitleFlyover(dt: number): void {
    this.titlePanAngle += dt * 0.14;
    const camX = Math.sin(this.titlePanAngle) * 2.4;
    const camZ = 9.2 + Math.cos(this.titlePanAngle) * 2.4;
    this.camera.position.set(camX, 4.15, camZ);
    this.camera.lookAt(-2.5, 2.5, -10.5);
  }

  private updatePlaying(dt: number): void {
    this.simTimeSec += dt;
    this.trafficSignal = getTrafficSignalPhase(this.simTimeSec);
    if (this.redLightCooldown > 0) {
      this.redLightCooldown = Math.max(0, this.redLightCooldown - dt);
    }

    // Sync visible 3D shop upgrades & golden sizzle ring & live traffic signals
    this.world.upgradedFulPot2.visible = this.upgrades.fulPotLevel >= 2;
    this.world.upgradedFryerAddons.visible = this.upgrades.fryerLevel >= 2;
    this.world.upgradedDecorAddons.visible = this.upgrades.decorLevel >= 2;

    const goldenNow = isGoldenSizzleWindow(this.simTimeSec);
    const sizzleMat = this.world.sizzleRingMesh.material as THREE.MeshBasicMaterial;
    sizzleMat.opacity = goldenNow ? 0.55 + Math.sin(this.simTimeSec * 14) * 0.3 : 0.08;
    this.world.sizzleRingMesh.scale.setScalar(
      goldenNow ? 1.05 + Math.sin(this.simTimeSec * 12) * 0.08 : 0.92,
    );

    const nsPhase = this.trafficSignal;
    this.world.nsSignalMats.green.emissiveIntensity = nsPhase === 'ns_green' ? 1.9 : 0.1;
    this.world.nsSignalMats.yellow.emissiveIntensity = nsPhase === 'ns_yellow' ? 1.9 : 0.1;
    this.world.nsSignalMats.red.emissiveIntensity =
      nsPhase === 'ew_green' || nsPhase === 'ew_yellow' ? 1.9 : 0.1;
    this.world.ewSignalMats.green.emissiveIntensity = nsPhase === 'ew_green' ? 1.9 : 0.1;
    this.world.ewSignalMats.yellow.emissiveIntensity = nsPhase === 'ew_yellow' ? 1.9 : 0.1;
    this.world.ewSignalMats.red.emissiveIntensity =
      nsPhase === 'ns_green' || nsPhase === 'ns_yellow' ? 1.9 : 0.1;

    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) {
        this.toastMessage = null;
      }
    }
    if (this.latestInstaPayTimer > 0) {
      this.latestInstaPayTimer -= dt;
      if (this.latestInstaPayTimer <= 0) {
        this.latestInstaPayToast = null;
      }
    }
    if (this.localAnimOverrideTimer > 0) {
      this.localAnimOverrideTimer -= dt;
      if (this.localAnimOverrideTimer <= 0) {
        this.localAnimOverride = null;
      }
    }
    if (this.localSpeechTimer > 0) {
      this.localSpeechTimer -= dt;
      if (this.localSpeechTimer <= 0) {
        this.localSpeechOverride = null;
      }
    }
    if (this.pedBumpCooldown > 0) {
      this.pedBumpCooldown = Math.max(0, this.pedBumpCooldown - dt);
    }

    // Universal Hunger & Thirst for Player & All Crew
    const movingNow =
      this.keysHeld.has('KeyW') ||
      this.keysHeld.has('KeyS') ||
      this.keysHeld.has('KeyA') ||
      this.keysHeld.has('KeyD') ||
      Math.abs(this.mobileMoveX) > 0.1 ||
      Math.abs(this.mobileMoveY) > 0.1;
    this.playerNeeds = tickCharacterNeeds(this.playerNeeds, dt, movingNow || this.shopOpen);
    this.crewNeeds = {
      ...this.crewNeeds,
      [this.selectedCharacterId]: this.playerNeeds,
      ahmed: tickCharacterNeeds(
        this.crewNeeds.ahmed,
        dt,
        this.selectedCharacterId === 'ahmed' ? movingNow : this.shopOpen,
      ),
      ali: tickCharacterNeeds(
        this.crewNeeds.ali,
        dt,
        this.selectedCharacterId === 'ali' ? movingNow : this.shopOpen,
      ),
      mahmoud: tickCharacterNeeds(
        this.crewNeeds.mahmoud,
        dt,
        this.selectedCharacterId === 'mahmoud' ? movingNow : this.shopOpen,
      ),
    };
    if (this.selectedCharacterId === 'ahmed' || this.selectedCharacterId === 'ali' || this.selectedCharacterId === 'mahmoud') {
      this.crewNeeds[this.selectedCharacterId] = this.playerNeeds;
    }

    // Animate hinged architectural doors smoothly
    for (const door of this.world.doors) {
      const target = door.isOpen ? door.openAngle : 0;
      door.pivot.rotation.y = THREE.MathUtils.damp(door.pivot.rotation.y, target, 8, dt);
    }

    // Animate Benha Private School students playing in courtyard & near classrooms
    const studentDistSq = (this.playerX - 30) * (this.playerX - 30) + (this.playerZ - 60) * (this.playerZ - 60);
    if (studentDistSq < 70 * 70) {
      const tSec = performance.now() * 0.001;
      for (let si = 0; si < this.world.benhaStudents.length; si++) {
        const stActor = this.world.benhaStudents[si];
        const pose = si % 3 === 0 ? 'run' : si % 3 === 1 ? 'wave' : 'walk';
        animateHumanActor(stActor, pose, tSec * 3.2 + si * 1.3, dt);
        if (pose !== 'wave') {
          stActor.group.rotation.y += dt * (si % 2 === 0 ? 0.55 : -0.45);
        }
      }
    }

    // Active Taxi respawning if player is Taxi Driver
    if (this.activeJob === 'taxi' && !this.activeTaxi) {
      this.taxiSpawnCooldown -= dt;
      if (this.taxiSpawnCooldown <= 0) {
        this.spawnTaxiMission();
      }
    }
    if (this.activeTaxi) {
      this.activeTaxi.timer -= dt;
      if (this.activeTaxi.timer <= 0) {
        this.showToast('الراكب مشي لسيارة تانية — جاري البحث عن طلب جديد');
        this.spawnTaxiMission();
      }
    }

    if (!this.isUiModalOpen()) {
      if (this.keysHeld.has('ArrowLeft')) this.playerYaw += 2.0 * dt;
      if (this.keysHeld.has('ArrowRight')) this.playerYaw -= 2.0 * dt;
    }

    if (this.inCar) {
      this.updateVehicleDriving(dt);
    } else {
      this.updateFirstPersonWalk(dt);
    }

    this.updateHeldSandwichVisual(dt);
    this.updateShopShutterAndLights(dt);
    this.updateCustomerOrders(dt);
    this.updateStreetEventsAndFamily(dt);
    this.updateMultiplayerSync(dt);
    this.updateContextualHint();
    this.updateCustomerBubble();
  }

  private updateMultiplayerSync(dt: number): void {
    // Advance marriage time & notify once when childbirth unlocks after waiting period
    if (this.spouseId && this.children.length < 3) {
      this.marriageElapsedSec += dt;
      if (!this.childUnlockNotified) {
        const unlock = getChildUnlockStatus(
          this.spouseId,
          this.children,
          this.day,
          this.marriedDay,
          this.marriageElapsedSec,
        );
        if (unlock.unlocked) {
          this.childUnlockNotified = true;
          this.showToast('ربنا بارك لكم! أصبحت جاهز للخلفة وإنجاب مولود جديد في البيت الثابت ❤️');
          this.saveGame();
        }
      }
    }

    // Broadcast player pose + live animation/speech state when online
    const mpStatus = this.mp.getStatus();
    if (mpStatus.mode === 'online') {
      const ctx = getStreetContext(this.playerX, this.playerZ);
      const moving =
        this.keysHeld.has('KeyW') ||
        this.keysHeld.has('KeyS') ||
        this.keysHeld.has('KeyA') ||
        this.keysHeld.has('KeyD') ||
        Math.abs(this.mobileMoveX) > 0.1 ||
        Math.abs(this.mobileMoveY) > 0.1 ||
        (this.inCar && Math.abs(this.carSpeed) > 0.3);
      const sprinting =
        this.keysHeld.has('ShiftLeft') ||
        this.keysHeld.has('ShiftRight') ||
        this.mobileSprint;
      const holding = this.heldIngredients.length > 0 || Boolean(this.heldReadyPack);
      const animState: PlayerAnimSyncState =
        this.localAnimOverride ??
        (this.inCar
          ? 'drive'
          : moving
            ? sprinting
              ? 'run'
              : 'walk'
            : holding
              ? 'hold'
              : this.accompanyingFollowers.some((f) => f.holdHand)
                ? 'hold_hand'
                : 'idle');

      this.mp.sendPose({
        x: this.inCar ? this.carX : this.playerX,
        y: this.playerY,
        z: this.inCar ? this.carZ : this.playerZ,
        yaw: this.inCar ? this.carYaw : this.playerYaw,
        inCar: this.inCar,
        moving,
        sprinting,
        holding,
        animState,
        speechText: this.localSpeechOverride ?? undefined,
        zoneAr: this.getCurrentZoneArabic(),
        streetAr: ctx.street.nameAr,
      });
    }

    // Interpolate and animate remote 3D teammate avatars
    const nowSec = performance.now() * 0.001;
    for (const entry of this.remotePlayerActors.values()) {
      const { actor, pose } = entry;
      actor.group.visible = !pose.inCar;
      if (pose.inCar) continue;
      const curX = actor.group.position.x;
      const curZ = actor.group.position.z;
      const nextX = THREE.MathUtils.lerp(curX, pose.x, Math.min(1, dt * 12));
      const nextZ = THREE.MathUtils.lerp(curZ, pose.z, Math.min(1, dt * 12));
      const stepDist = Math.hypot(nextX - curX, nextZ - curZ);
      const remoteGroundY = pose.y >= 2.5 ? Math.max(0.08, pose.y - 1.54) : 0.08;
      actor.group.position.set(nextX, remoteGroundY, nextZ);
      actor.group.rotation.y = pose.yaw + Math.PI;
      if (pose.moving || stepDist > 0.01) {
        entry.phase += Math.max(stepDist * 3.8, dt * 6.5);
        animateHumanActor(actor, pose.sprinting ? 'run' : 'walk', entry.phase, dt);
      } else if (pose.animState && pose.animState !== 'idle' && pose.animState !== 'drive') {
        animateHumanActor(actor, pose.animState, nowSec, dt);
      } else {
        animateHumanActor(actor, pose.holding ? 'hold' : 'idle', nowSec, dt);
      }
    }
  }

  private updateStreetEventsAndFamily(dt: number): void {
    // 1. Random Street Events lifecycle
    if (this.activeStreetEvent) {
      this.activeStreetEvent = tickRandomStreetEvent(this.activeStreetEvent, dt);
      if (!this.activeStreetEvent) {
        this.streetEventCooldown = 26 + Math.random() * 14;
      }
    } else {
      this.streetEventCooldown -= dt;
      if (this.streetEventCooldown <= 0) {
        this.activeStreetEvent = generateRandomStreetEvent(
          `evt-${this.streetEventCounter++}`,
        );
        this.showToast(`حدث جديد في الحارة: ${this.activeStreetEvent.titleAr}`);
      }
    }
    this.syncStreetEventVisuals(dt);

    // 2. Household Family AI schedule rotation
    this.familyScheduleTimer -= dt;
    if (this.familyScheduleTimer <= 0) {
      this.familyScheduleTimer = 15 + Math.random() * 6;
      this.familyStepIndex += 1;
      this.householdFamily = this.householdFamily.map((member) =>
        pickHouseholdActivity(member.id, this.timeOfDay, this.familyStepIndex),
      );
    }
  }

  private syncStreetEventVisuals(dt: number): void {
    const visuals = this.world.streetEventVisuals;
    const ev = this.activeStreetEvent;
    if (!ev || ev.resolved) {
      visuals.fightGroup.visible = false;
      visuals.brokenCarGroup.visible = false;
      visuals.vendorGroup.visible = false;
      visuals.weddingGroup.visible = false;
      visuals.beacon.visible = false;
      return;
    }

    const nowSec = performance.now() * 0.001;
    visuals.beacon.visible = true;
    visuals.beacon.position.set(ev.x, 0, ev.z);
    visuals.beacon.rotation.y += dt * 1.8;

    visuals.fightGroup.visible = ev.type === 'street_fight';
    visuals.brokenCarGroup.visible = ev.type === 'broken_car';
    visuals.vendorGroup.visible = ev.type === 'vendor_rush';
    visuals.weddingGroup.visible = ev.type === 'wedding_feast';

    if (ev.type === 'street_fight') {
      visuals.fightGroup.position.set(ev.x, 0, ev.z);
      animateHumanActor(visuals.fightActorA, 'argue', nowSec * 1.4, dt || 0.016);
      animateHumanActor(visuals.fightActorB, 'argue', nowSec * 1.4 + 1.2, dt || 0.016);
    } else if (ev.type === 'broken_car') {
      visuals.brokenCarGroup.position.set(ev.x, 0.08, ev.z);
      const blink = Math.sin(nowSec * 8) > 0 ? 1.8 : 0.12;
      for (const hm of visuals.brokenCarHazardMats) {
        hm.emissiveIntensity = blink;
      }
      for (let si = 0; si < visuals.brokenCarSmoke.length; si++) {
        const sm = visuals.brokenCarSmoke[si];
        const rise = ((nowSec * 0.7 + si * 0.18) % 1);
        sm.position.y = 1.15 + rise * 1.85;
        sm.scale.setScalar(0.75 + rise * 0.9);
      }
    } else if (ev.type === 'vendor_rush') {
      visuals.vendorGroup.position.set(ev.x, 0.14, ev.z);
      animateHumanActor(visuals.vendorActor, 'wave', nowSec * 1.2, dt || 0.016);
    } else if (ev.type === 'wedding_feast') {
      visuals.weddingGroup.position.set(ev.x, 0, ev.z);
      for (let wi = 0; wi < visuals.weddingActors.length; wi++) {
        animateHumanActor(visuals.weddingActors[wi], 'wave', nowSec * 1.4 + wi * 1.3, dt || 0.016);
      }
    }
  }

  private updateFirstPersonWalk(dt: number): void {
    let forward = 0;
    let strafe = 0;
    if (!this.isUiModalOpen()) {
      if (this.keysHeld.has('KeyW') || this.keysHeld.has('ArrowUp')) forward += 1;
      if (this.keysHeld.has('KeyS') || this.keysHeld.has('ArrowDown')) forward -= 1;
      if (this.keysHeld.has('KeyD')) strafe += 1;
      if (this.keysHeld.has('KeyA')) strafe -= 1;
      forward += -this.mobileMoveY;
      strafe += this.mobileMoveX;
    }

    const len = Math.hypot(forward, strafe);
    const isSprinting =
      this.keysHeld.has('ShiftLeft') ||
      this.keysHeld.has('ShiftRight') ||
      this.mobileSprint;

    if (len > 0.05) {
      const nf = forward / Math.max(1, len);
      const ns = strafe / Math.max(1, len);
      const baseSpeed = isSprinting ? 7.6 : 5.2;
      const sinY = Math.sin(this.playerYaw);
      const cosY = Math.cos(this.playerYaw);

      const moveX = (-sinY * nf + cosY * ns) * baseSpeed * dt;
      const moveZ = (-cosY * nf - sinY * ns) * baseSpeed * dt;

      const onUpperFloor = this.groundY >= 2.2;
      const activeColliders = onUpperFloor
        ? this.world.colliders.filter((c) => {
            const insideRemoteApt =
              c.minX >= REMOTE_CREW_APARTMENT.x - 6 &&
              c.maxX <= REMOTE_CREW_APARTMENT.x + 6 &&
              c.minZ >= REMOTE_CREW_APARTMENT.z - 5 &&
              c.maxZ <= REMOTE_CREW_APARTMENT.z + 5;
            const insideShop =
              c.minX >= -18 && c.maxX <= -8 && c.minZ >= -5.5 && c.maxZ <= 5.5;
            return !insideRemoteApt && !insideShop;
          })
        : [...this.world.colliders];
      if (!this.shopOpen && !onUpperFloor) {
        activeColliders.push({ minX: -9.1, maxX: -8.6, minZ: -2.8, maxZ: 2.8, active: true });
      }
      const res = resolveCircleAABB(
        this.playerX + moveX,
        this.playerZ + moveZ,
        0.48,
        activeColliders,
      );
      let nextPX = res.x;
      let nextPZ = res.z;

      // High-density Pedestrian Bump Colliders
      if (!onUpperFloor) {
        for (let pi = 0; pi < this.activePedestrianCount && pi < this.pedestrians.length; pi++) {
          const ped = this.pedestrians[pi];
          if (!ped.actor.group.visible) continue;
          const bdx = nextPX - ped.x;
          const bdz = nextPZ - ped.z;
          const bDist = Math.hypot(bdx, bdz);
          if (bDist > 0.001 && bDist < 0.64) {
            const push = 0.64 - bDist;
            nextPX += (bdx / bDist) * push;
            nextPZ += (bdz / bDist) * push;
            if (this.pedBumpCooldown <= 0) {
              this.pedBumpCooldown = 2.6;
              this.cameraTrauma = Math.min(1, this.cameraTrauma + 0.12);
            }
          }
        }
      }

      const clamped = clampToCityBounds(nextPX, nextPZ);
      const stepDist = Math.hypot(clamped.x - this.playerX, clamped.z - this.playerZ);
      this.playerX = clamped.x;
      this.playerZ = clamped.z;
      this.groundY = getFloorElevationAt(
        this.playerX,
        this.playerZ,
        this.restaurantFloors,
        this.groundY,
      );
      this.playerY = this.groundY + 1.54;

      this.walkDistance += stepDist;
      this.stepAccum += stepDist;
      if (this.stepAccum >= (isSprinting ? 1.7 : 1.45)) {
        this.stepAccum = 0;
        this.sound.playFootstep(isSprinting);
      }
    } else {
      this.groundY = getFloorElevationAt(
        this.playerX,
        this.playerZ,
        this.restaurantFloors,
        this.groundY,
      );
      this.playerY = this.groundY + 1.54;
    }

    // Animate sculpted GTA player actor when in 3rd-person / wide camera
    const pActor = this.world.playerActor;
    pActor.group.visible = !this.inCar && this.cameraMode !== 'first_person';
    pActor.group.position.set(this.playerX, Math.max(0, this.groundY - 0.14), this.playerZ);
    pActor.group.rotation.y = this.playerYaw + Math.PI;
    const isHolding = this.heldIngredients.length > 0 || Boolean(this.heldReadyPack);
    const anyHoldHand = this.accompanyingFollowers.some((f) => f.holdHand);
    if (len > 0.05) {
      animateHumanActor(
        pActor,
        isSprinting ? 'run' : 'walk',
        this.walkDistance * 3.4,
        dt,
      );
      if (anyHoldHand) {
        pActor.rightArm.rotation.x = -0.78;
        pActor.rightElbow.rotation.x = -0.35;
      } else if (isHolding) {
        pActor.rightArm.rotation.x = -0.65;
        pActor.rightElbow.rotation.x = -0.55;
      }
    } else if (this.localAnimOverride && this.localAnimOverride !== 'drive' && this.localAnimOverride !== 'idle') {
      animateHumanActor(pActor, this.localAnimOverride, this.simTimeSec, dt);
    } else {
      animateHumanActor(
        pActor,
        anyHoldHand ? 'hold_hand' : isHolding ? 'hold' : 'idle',
        this.timeOfDay * 60,
        dt,
      );
    }

    // Walk accompanying followers & children holding player's hand seamlessly
    const nowFollowSec = performance.now() * 0.001;
    const pSin = Math.sin(this.playerYaw);
    const pCos = Math.cos(this.playerYaw);
    for (let fi = 0; fi < this.accompanyingFollowers.length; fi++) {
      const f = this.accompanyingFollowers[fi];
      f.actor.group.visible = !this.inCar;
      const targetX = f.holdHand
        ? this.playerX + pCos * 0.68 + pSin * 0.18
        : this.playerX + pSin * (1.2 + Math.floor(fi / 2) * 0.85) + pCos * ((fi % 2 === 0 ? -1 : 1) * 0.72);
      const targetZ = f.holdHand
        ? this.playerZ - pSin * 0.68 + pCos * 0.18
        : this.playerZ + pCos * (1.2 + Math.floor(fi / 2) * 0.85) - pSin * ((fi % 2 === 0 ? -1 : 1) * 0.72);
      const curFX = f.actor.group.position.x;
      const curFZ = f.actor.group.position.z;
      const fdx = targetX - curFX;
      const fdz = targetZ - curFZ;
      const fDist = Math.hypot(fdx, fdz);
      const followSpeed = f.holdHand ? 6.5 : 5.4;
      const step = Math.min(fDist, followSpeed * dt);
      const nextFX = fDist > 0.04 ? curFX + (fdx / fDist) * step : curFX;
      const nextFZ = fDist > 0.04 ? curFZ + (fdz / fDist) * step : curFZ;
      const fElev = getFloorElevationAt(nextFX, nextFZ, this.restaurantFloors, this.groundY);
      f.actor.group.position.set(nextFX, Math.max(0.08, fElev), nextFZ);
      f.actor.group.rotation.y = fDist > 0.08 ? Math.atan2(fdx, fdz) : this.playerYaw + Math.PI;
      if (fDist > 0.12) {
        animateHumanActor(f.actor, 'walk', nowFollowSec * 5.2 + fi, dt);
        if (f.holdHand) {
          f.actor.leftArm.rotation.x = -0.82;
          f.actor.leftArm.rotation.z = -0.22;
        }
      } else {
        animateHumanActor(f.actor, f.holdHand ? 'hold_hand' : 'idle', nowFollowSec + fi, dt);
      }
    }

    const bobOffset = len > 0.05 ? Math.sin(this.walkDistance * 2.6) * 0.04 : 0;
    this.cameraTrauma = Math.max(0, this.cameraTrauma - dt * 1.8);
    const shake = this.cameraTrauma * this.cameraTrauma * 0.03;

    if (this.cameraMode === 'first_person') {
      _vec3A.set(
        this.playerX + (Math.random() - 0.5) * shake,
        this.playerY + bobOffset,
        this.playerZ + (Math.random() - 0.5) * shake,
      );
      if (this.snapCameraNextFrame) {
        this.camera.position.copy(_vec3A);
        this.snapCameraNextFrame = false;
      } else {
        this.camera.position.lerp(_vec3A, 1 - Math.exp(-18 * dt));
      }
      _euler.set(this.playerPitch, this.playerYaw, 0, 'YXZ');
      this.camera.quaternion.setFromEuler(_euler);
    } else {
      const isWide = this.cameraMode === 'wide_follow';
      const backDist = isWide ? 5.6 : 2.85;
      const rightOffset = isWide ? 0.0 : 0.45;
      const baseHeight = isWide ? 1.65 : 0.56;

      const sinY = Math.sin(this.playerYaw);
      const cosY = Math.cos(this.playerYaw);
      _vec3B.set(
        this.playerX + cosY * rightOffset * 0.45,
        1.52,
        this.playerZ - sinY * rightOffset * 0.45,
      );
      const pitchShift = -Math.sin(this.playerPitch) * (backDist * 0.45);
      _vec3A.set(
        this.playerX + sinY * backDist + cosY * rightOffset,
        Math.max(0.75, 1.52 + baseHeight + pitchShift),
        this.playerZ + cosY * backDist - sinY * rightOffset,
      );

      _vec3C.copy(_vec3A).sub(_vec3B);
      const desiredLen = _vec3C.length();
      if (desiredLen > 0.1) {
        _vec3C.normalize();
        this.camRaycaster.set(_vec3B, _vec3C);
        this.camRaycaster.near = 0.2;
        this.camRaycaster.far = desiredLen;
        const hits = this.camRaycaster.intersectObjects(
          this.world.cameraOccluders,
          false,
        );
        if (hits.length > 0 && hits[0].distance < desiredLen) {
          const safeDist = Math.max(0.65, hits[0].distance - 0.35);
          _vec3A.copy(_vec3B).addScaledVector(_vec3C, safeDist);
        }
      }

      if (this.snapCameraNextFrame) {
        this.camera.position.copy(_vec3A);
        this.snapCameraNextFrame = false;
      } else {
        this.camera.position.lerp(_vec3A, 1 - Math.exp(-14 * dt));
      }
      _vec3C.set(
        this.playerX - sinY * 4.5 + cosY * (rightOffset * 0.5),
        1.48 + Math.sin(this.playerPitch) * 2.4,
        this.playerZ - cosY * 4.5 - sinY * (rightOffset * 0.5),
      );
      this.camera.lookAt(_vec3C);
    }
  }

  private updateVehicleDriving(dt: number): void {
    const accelInput =
      (this.keysHeld.has('KeyW') || this.keysHeld.has('ArrowUp') ? 1 : 0) -
      (this.keysHeld.has('KeyS') || this.keysHeld.has('ArrowDown') ? 1 : 0) -
      this.mobileMoveY;
    const steerInput =
      (this.keysHeld.has('KeyA') || this.keysHeld.has('ArrowLeft') ? 1 : 0) -
      (this.keysHeld.has('KeyD') || this.keysHeld.has('ArrowRight') ? 1 : 0) -
      this.mobileMoveX;

    const vehDef = VEHICLE_CATALOG[this.activeVehicleId] ?? VEHICLE_CATALOG.fiat_128;
    const baseMaxFwd = (vehDef.topSpeedKmh / 7.2) + (this.upgrades.carEngineLevel - 1) * 2.0;
    const maxFwd = this.carFuel < 10 ? Math.min(baseMaxFwd, 4.2) : baseMaxFwd;
    if (this.carFuel > 0.2 && Math.abs(accelInput) > 0.05) {
      this.carSpeed += accelInput * 12.6 * dt;
    } else {
      this.carSpeed *= Math.exp(-3.2 * dt);
      if (Math.abs(this.carSpeed) < 0.06) this.carSpeed = 0;
    }
    if (this.keysHeld.has('Space')) {
      this.carSpeed *= Math.exp(-9.0 * dt);
    }
    this.carSpeed = THREE.MathUtils.clamp(this.carSpeed, -6.5, maxFwd);

    if (Math.abs(this.carSpeed) > 0.35) {
      const steerDir = this.carSpeed >= 0 ? 1 : -1;
      this.carYaw += steerInput * steerDir * 2.15 * dt;
      const fuelRate = (this.activeRole === 'driver' ? 0.45 : 0.72) * vehDef.fuelEconomyMult;
      this.carFuel = Math.max(0, this.carFuel - Math.abs(this.carSpeed) * fuelRate * dt * 0.12);
    }

    const prevCarX = this.carX;
    const prevCarZ = this.carZ;
    const vx = -Math.sin(this.carYaw) * this.carSpeed * dt;
    const vz = -Math.cos(this.carYaw) * this.carSpeed * dt;
    const resolved = resolveCircleAABB(
      this.carX + vx,
      this.carZ + vz,
      1.35,
      this.world.colliders,
    );
    const clamped = clampToCityBounds(resolved.x, resolved.z);
    if (Math.hypot(clamped.x - (this.carX + vx), clamped.z - (this.carZ + vz)) > 0.08) {
      this.carSpeed *= 0.4;
      this.carCondition = Math.max(15, this.carCondition - 0.5);
    }
    this.carX = clamped.x;
    this.carZ = clamped.z;

    // High-density vehicle-to-traffic-vehicle bump collision
    for (let ti = 0; ti < this.activeTrafficCount && ti < this.trafficFleet.length; ti++) {
      const tv = this.trafficFleet[ti];
      const tdx = this.carX - tv.mesh.position.x;
      const tdz = this.carZ - tv.mesh.position.z;
      const tDist = Math.hypot(tdx, tdz);
      if (tDist > 0.01 && tDist < 2.25) {
        const push = 2.25 - tDist;
        this.carX += (tdx / tDist) * push * 0.85;
        this.carZ += (tdz / tDist) * push * 0.85;
        this.carSpeed *= -0.22;
        this.carCondition = Math.max(15, this.carCondition - 0.8);
        this.cameraTrauma = Math.min(1, this.cameraTrauma + 0.35);
        if (this.pedBumpCooldown <= 0) {
          this.pedBumpCooldown = 2.2;
          this.sound.playBump();
          this.sound.playCarHorn();
        }
      }
    }

    this.playerX = this.carX;
    this.playerZ = this.carZ;

    const kmhNow = Math.round(Math.abs(this.carSpeed) * 7.2);
    const redCheck = checkRedLightViolation(
      this.carX,
      this.carZ,
      this.carYaw,
      kmhNow,
      this.trafficSignal,
      this.redLightCooldown,
    );
    if (redCheck.violated) {
      this.redLightCooldown = 8;
      this.money = Math.max(0, this.money - redCheck.fine);
      this.dailyStats.expenses += redCheck.fine;
      this.trafficFines += 1;
      this.sound.playFineWhistle();
      this.showToast(`مخالفة كسر إشارة حمراء! -${redCheck.fine} ج.م`);
    }

    const bumpCheck = checkSpeedBumpImpact(prevCarX, prevCarZ, this.carX, this.carZ, kmhNow);
    const car = this.world.heroCar;
    if (bumpCheck.hit) {
      this.sound.playBump();
      this.cameraTrauma = Math.min(1, this.cameraTrauma + (bumpCheck.tooFast ? 0.55 : 0.2));
      car.carChassisTilt.rotation.x += bumpCheck.tooFast ? -0.14 : -0.05;
      if (bumpCheck.tooFast) {
        this.carCondition = Math.max(10, this.carCondition - bumpCheck.conditionDamage);
        this.showToast('خفف السرعة على المطب! السيارة اتهبدت (-حالة)');
      }
    }

    if (this.companionDef && !this.companionCornicheDone) {
      const stCtx = getStreetContext(this.carX, this.carZ);
      if (stCtx.district.id === 'corniche') {
        this.companionCornicheDone = true;
        this.reputation = clampReputation(this.reputation + 4);
        this.romanceStates = this.romanceStates.map((r) =>
          r.id === this.spouseId || ROMANCE_NPCS.find((g) => g.id === r.id)?.nameAr === this.companionDef?.nameAr
            ? { ...r, affection: Math.min(100, r.affection + 15), moodAr: 'فرحانة بفسحة النيل ❤️' }
            : r,
        );
        this.sound.playCashRegister();
        this.spawnCelebrationBurst(this.carX, 1.8, this.carZ);
        this.showToast(`أحلى فسحة على الكورنيش مع ${this.companionDef.nameAr}! ❤️ (+١٥ مودة و+٤ سمعة)`);
      }
    }

    // Engine smoke when condition < 30%
    const showSmoke = this.carCondition < 30;
    for (let si = 0; si < car.heroSmokeMeshes.length; si++) {
      const sm = car.heroSmokeMeshes[si];
      sm.visible = showSmoke;
      if (showSmoke) {
        const rise = (this.simTimeSec * 0.9 + si * 0.25) % 1;
        sm.position.set(Math.sin(this.simTimeSec * 4 + si) * 0.16, 0.95 + rise * 1.4, -1.6);
        sm.scale.setScalar(0.65 + rise * 0.9);
      }
    }

    car.carGroup.position.set(this.carX, 0, this.carZ);
    car.carGroup.rotation.y = this.carYaw;

    // Suspension pitch & roll
    const isBraking =
      this.keysHeld.has('Space') ||
      (Math.abs(this.carSpeed) > 0.4 && accelInput * this.carSpeed < 0);
    const targetPitch = isBraking
      ? -0.032 * Math.sign(this.carSpeed || 1)
      : Math.abs(accelInput) > 0.05 && this.carFuel > 0.2
        ? accelInput * 0.022
        : 0;
    const speedRatio = Math.min(1, Math.abs(this.carSpeed) / maxFwd);
    const targetRoll =
      -steerInput * speedRatio * 0.045 * (this.carSpeed >= 0 ? 1 : -1);
    car.carChassisTilt.rotation.x = THREE.MathUtils.damp(
      car.carChassisTilt.rotation.x,
      targetPitch,
      8,
      dt,
    );
    car.carChassisTilt.rotation.z = THREE.MathUtils.damp(
      car.carChassisTilt.rotation.z,
      targetRoll,
      8,
      dt,
    );

    // Wheels spin & front wheels visibly steer
    for (const w of car.carWheels) {
      w.rotation.x -= this.carSpeed * dt * 2.4;
    }
    for (const fp of car.frontWheelSteerPivots) {
      fp.rotation.y = THREE.MathUtils.damp(fp.rotation.y, steerInput * 0.42, 12, dt);
    }

    // Steering wheel & Cockpit hands visibility
    car.carSteeringWheel.rotation.z = THREE.MathUtils.damp(
      car.carSteeringWheel.rotation.z,
      steerInput * 0.85,
      10,
      dt,
    );
    car.cockpitHandsGroup.visible = this.inCar && this.carCameraMode === 'cockpit';

    // Gear calculation + animated Gear Stick + driver right-hand shift gesture
    const kmh = Math.round(Math.abs(this.carSpeed) * 7.2);
    this.carGearLabel =
      this.carSpeed < -0.35
        ? 'R'
        : Math.abs(this.carSpeed) <= 0.35
          ? 'N'
          : kmh < 22
            ? '1'
            : kmh < 45
              ? '2'
              : kmh < 72
                ? '3'
                : '4';
    if (this.carGearLabel !== this.prevGearLabel) {
      this.prevGearLabel = this.carGearLabel;
      this.shiftAnimTimer = 0.28;
    }
    const gearTilt =
      this.carGearLabel === 'R'
        ? 0.24
        : this.carGearLabel === 'N'
          ? 0
          : this.carGearLabel === '1' || this.carGearLabel === '3'
            ? -0.22
            : 0.2;
    car.gearStickPivot.rotation.x = THREE.MathUtils.damp(
      car.gearStickPivot.rotation.x,
      gearTilt,
      12,
      dt,
    );
    if (this.shiftAnimTimer > 0) {
      this.shiftAnimTimer -= dt;
      car.rightArmAnchor.position.x = THREE.MathUtils.damp(car.rightArmAnchor.position.x, 0.28, 18, dt);
      car.rightArmAnchor.position.y = THREE.MathUtils.damp(car.rightArmAnchor.position.y, -0.06, 18, dt);
    } else {
      car.rightArmAnchor.position.x = THREE.MathUtils.damp(car.rightArmAnchor.position.x, 0.142, 14, dt);
      car.rightArmAnchor.position.y = THREE.MathUtils.damp(car.rightArmAnchor.position.y, 0.02, 14, dt);
    }

    // Physical 3D Dashboard Needles (Speed, RPM, Fuel)
    const speedNorm = Math.min(1, kmh / 120);
    car.speedNeedlePivot.rotation.z = THREE.MathUtils.damp(
      car.speedNeedlePivot.rotation.z,
      0.95 - speedNorm * 2.45,
      10,
      dt,
    );
    const rpmNorm = Math.min(1, 0.18 + ((kmh % 32) / 32) * 0.72 + (Math.abs(accelInput) > 0.1 ? 0.18 : 0));
    car.rpmNeedlePivot.rotation.z = THREE.MathUtils.damp(
      car.rpmNeedlePivot.rotation.z,
      0.9 - rpmNorm * 2.1,
      12,
      dt,
    );
    car.fuelNeedlePivot.rotation.z = THREE.MathUtils.damp(
      car.fuelNeedlePivot.rotation.z,
      THREE.MathUtils.lerp(-0.85, 0.85, this.carFuel / 100),
      8,
      dt,
    );

    // Mirror Hanging Tasbeeh Physics Pendulum
    const accelG = (this.carSpeed - this.prevCarSpeed) / Math.max(0.01, dt);
    this.prevCarSpeed = this.carSpeed;
    const targetTasbeehX = THREE.MathUtils.clamp(accelG * 0.018, -0.35, 0.35);
    const targetTasbeehZ = THREE.MathUtils.clamp(steerInput * speedRatio * 0.42, -0.42, 0.42);
    this.tasbeehAngleX = THREE.MathUtils.damp(this.tasbeehAngleX, targetTasbeehX, 5, dt);
    this.tasbeehAngleZ = THREE.MathUtils.damp(this.tasbeehAngleZ, targetTasbeehZ, 5, dt);
    car.tasbeehPivot.rotation.x = this.tasbeehAngleX;
    car.tasbeehPivot.rotation.z = this.tasbeehAngleZ;

    // Taillight brake brightness
    car.carTaillightsMat.emissiveIntensity = isBraking ? 1.8 : 0.45;
    car.radioGlowMat.emissiveIntensity = this.radioStation === 'off' ? 0.08 : 0.9;

    // Camera placement
    if (this.carCameraMode === 'cockpit') {
      const sinC = Math.sin(this.carYaw);
      const cosC = Math.cos(this.carYaw);
      const lx = -0.38;
      const lz = 0.04;
      _vec3A.set(
        this.carX + lx * cosC + lz * sinC,
        1.25,
        this.carZ - lx * sinC + lz * cosC,
      );
      if (this.snapCameraNextFrame) {
        this.camera.position.copy(_vec3A);
        this.snapCameraNextFrame = false;
      } else {
        this.camera.position.lerp(_vec3A, 1 - Math.exp(-26 * dt));
      }
      const lookX = -0.22;
      const lookZ = -7.5;
      _vec3B.set(
        this.carX + lookX * cosC + lookZ * sinC,
        1.06,
        this.carZ - lookX * sinC + lookZ * cosC,
      );
      this.camera.lookAt(_vec3B);
    } else {
      const behindX = this.carX + Math.sin(this.carYaw) * 6.5;
      const behindZ = this.carZ + Math.cos(this.carYaw) * 6.5;
      _vec3A.set(behindX, 3.45, behindZ);
      if (this.snapCameraNextFrame) {
        this.camera.position.copy(_vec3A);
        this.snapCameraNextFrame = false;
      } else {
        this.camera.position.lerp(_vec3A, 1 - Math.exp(-8 * dt));
      }
      _vec3B.set(
        this.carX - Math.sin(this.carYaw) * 3.0,
        1.3,
        this.carZ - Math.cos(this.carYaw) * 3.0,
      );
      this.camera.lookAt(_vec3B);
    }
  }

  private updateHeldSandwichVisual(dt: number): void {
    const insideFulShop =
      this.playerX >= -17.0 &&
      this.playerX <= -8.6 &&
      this.playerZ >= -4.8 &&
      this.playerZ <= 4.8;
    const isFpPlaying = this.phase === 'playing' && !this.inCar && this.cameraMode === 'first_person';

    if (this.cookActionTimer > 0) {
      this.cookActionTimer = Math.max(0, this.cookActionTimer - dt);
    }
    const dipProgress = this.cookActionTimer > 0 ? 1 - this.cookActionTimer / 0.38 : 0;
    const dipArc = Math.sin(dipProgress * Math.PI);
    const walkBob = Math.sin(this.walkDistance * 3.0) * 0.008;

    this.heldHandGroup.visible = isFpPlaying && this.heldIngredients.length > 0;
    if (this.heldHandGroup.visible) {
      this.heldHandGroup.position.set(0.32, -0.28 + walkBob - dipArc * 0.025, -0.52 - dipArc * 0.03);
    }

    this.world.cookHandsGroup.visible =
      isFpPlaying && insideFulShop && this.heldIngredients.length === 0;
    if (this.world.cookHandsGroup.visible) {
      this.world.cookHandsGroup.position.set(0, walkBob - dipArc * 0.055, -dipArc * 0.09);
      this.world.cookHandsGroup.rotation.x = -dipArc * 0.34;
    }

    const parts = this.heldMeshParts;
    (Object.keys(parts) as IngredientId[]).forEach((k) => {
      parts[k].visible = this.heldIngredients.includes(k);
    });
  }

  private updateShopShutterAndLights(dt: number): void {
    const targetShutter = this.shopOpen ? 1 : 0;
    this.shutterProgress = THREE.MathUtils.damp(
      this.shutterProgress,
      targetShutter,
      12.0,
      dt,
    );
    this.world.shutterMesh.position.y = THREE.MathUtils.lerp(
      1.55,
      3.3,
      this.shutterProgress,
    );
    this.world.shutterMesh.scale.y = THREE.MathUtils.lerp(
      1.0,
      0.16,
      this.shutterProgress,
    );

    const intensityScale = this.shopLightsOn ? 1 : 0.08;
    this.world.shopLights[0].intensity = 3.2 * intensityScale;
    this.world.shopLights[1].intensity = 1.8 * intensityScale;
  }

  private updateCustomerOrders(dt: number): void {
    for (let i = this.orders.length - 1; i >= 0; i--) {
      const o = this.orders[i];
      const patienceDrain =
        (this.activeRole === 'cashier' ? 0.8 : 1.0) * dt;
      o.patience -= patienceDrain;
      if (o.patience <= 0) {
        this.dailyStats.ordersMissed += 1;
        this.reputation = clampReputation(this.reputation - 6);
        const missedNpc = this.customers.find((c) => c.orderId === o.id);
        if (missedNpc) {
          missedNpc.reactionEmoji = '😡';
          missedNpc.reactionMoodLabel = 'غاضب ومشي';
          missedNpc.reactionLineAr = 'زهقت من التأخير! خدمة بطيئة جداً وهقدم شكوى!';
          missedNpc.reactionTone = 'upset';
          missedNpc.reactionExpression = 'angry';
          missedNpc.reactionAnim = 'argue';
          missedNpc.reactionTimer = 3.8;
          setActorExpression(missedNpc.actor, 'angry');
        }
        this.releaseCustomerNpc(o.id);
        this.orders.splice(i, 1);
        this.sound.playError();
        this.showToast(`😡 زهق ${o.customerName} ومشي بسبب التأخير!`);
      }
    }

    const adBoost = computeAdBoardCustomerBoost(this.adBoard);
    const seasonMod = getSeasonModifiers(this.activeSeasonId);
    const maxConcurrentOrders = 3 + adBoost.maxOrdersBonus + (this.activeSeasonId !== 'normal' ? 1 : 0);
    if (this.shopOpen) {
      this.hygieneScore = Math.max(30, this.hygieneScore - dt * 0.045);
    }
    const tickedDlv = tickDeliveryOrders(this.deliveryOrders, dt);
    this.deliveryOrders = tickedDlv.orders;
    if (tickedDlv.expiredOrder) {
      this.reputation = clampReputation(this.reputation - 2);
      this.showToast(`⏱️ انتهى وقت أوردر دليفري ${tickedDlv.expiredOrder.customerNameAr}!`);
    }
    if (this.shopOpen && this.orders.length < maxConcurrentOrders) {
      this.orderSpawnTimer -= dt * adBoost.spawnMultiplier * seasonMod.customerRushMultiplier;
      if (this.orderSpawnTimer <= 0) {
        this.orderSpawnTimer = Math.max(3.6, 10 - this.reputation * 0.04);
        const allowDelivery = this.orderCounter > 1;
        const id = `ord-${this.orderCounter++}`;
        const ord = generateCustomerOrder(id, this.reputation, allowDelivery);
        this.orders.push(ord);

        if (!ord.isDelivery) {
          const queueSlot = this.orders.filter((x) => !x.isDelivery).length - 1;
          const customerStyles: CharacterStyleOptions[] = [
            { shirtColor: 0x3d5a80, pantsColor: 0x293241, skinColor: 0xc99168, isGalabiya: true, hasMustache: true, hatType: 'taqiyah', hatColor: 0xf0ebe1 },
            { shirtColor: 0x98c1d9, pantsColor: 0x2b303a, skinColor: 0xd9a47c, hatType: 'hair', hatColor: 0x241c18 },
            { shirtColor: 0xb5533c, pantsColor: 0x332b24, skinColor: 0xb87c53, isGalabiya: true, hasMustache: true, hatType: 'hair', hatColor: 0x1e1815 },
            { shirtColor: 0x4d7c5b, pantsColor: 0x25282c, skinColor: 0xce946b, hasMustache: true, hatType: 'cap', hatColor: 0x2b2d42 },
            { shirtColor: 0x6d597a, pantsColor: 0x2b2d42, skinColor: 0xc2875e, hasHijab: true, hijabColor: 0xf1f5f9 },
          ];
          const actor = this.world.createNpcActor(
            customerStyles[this.orderCounter % customerStyles.length],
          );
          actor.group.position.set(-6.2, 0, 2.7);
          this.customers.push({
            actor,
            role: 'customer',
            x: -6.2,
            z: 2.7,
            targetX: -8.95,
            targetZ: -0.9 + queueSlot * 1.1,
            speed: 2.1,
            walkPhase: 0,
            orderId: ord.id,
            customerName: ord.customerName,
            archetype: ord.archetype,
            recipeId: ord.recipeId,
          });
        }
        this.showToast(`طلب جديد من ${ord.customerName}: "${ord.dialogueAr}"`);
      }

      this.inquirySpawnTimer -= dt;
      if (this.inquirySpawnTimer <= 0) {
        this.inquirySpawnTimer = 15 + Math.random() * 10;
        const openCount = this.customerInquiries.filter((q) => !q.answered).length;
        if (openCount < 3) {
          const freshInq = generateCustomerInquiry(
            `inq-${this.inquirySeq++}`,
            this.prices,
            this.extraPrices,
            this.orders,
          );
          this.customerInquiries = [freshInq, ...this.customerInquiries].slice(0, 6);
        }
      }
    }

    const activeDispatch = this.deliveryOrders.find((d) => d.status === 'active');
    if (activeDispatch) {
      this.world.deliveryBeacon.visible = true;
      this.world.deliveryBeacon.position.set(activeDispatch.targetX, 0, activeDispatch.targetZ);
      this.world.deliveryBeacon.rotation.y += dt * 1.8;
      const dDist = Math.hypot(
        (this.inCar ? this.carX : this.playerX) - activeDispatch.targetX,
        (this.inCar ? this.carZ : this.playerZ) - activeDispatch.targetZ,
      );
      if (dDist <= 6.5) {
        this.completeActiveDeliveryNow();
      }
    } else {
      const activeDelivery = this.orders.find(
        (o) => o.isDelivery && o.deliveryX !== undefined,
      );
      if (activeDelivery && activeDelivery.deliveryX !== undefined && activeDelivery.deliveryZ !== undefined) {
        this.world.deliveryBeacon.visible = true;
        this.world.deliveryBeacon.position.set(
          activeDelivery.deliveryX,
          0,
          activeDelivery.deliveryZ,
        );
        this.world.deliveryBeacon.rotation.y += dt * 1.6;
      } else {
        this.world.deliveryBeacon.visible = false;
      }
    }
  }

  private updateAmbientWorld(dt: number): void {
    const car = this.world.heroCar;

    // 1. Hero Car Driver Door Swing Animation
    if (this.carDoorAnimTimer > 0) {
      this.carDoorAnimTimer = Math.max(0, this.carDoorAnimTimer - dt);
    }
    const targetDoorYaw = this.carDoorAnimTimer > 0.22 ? -1.05 : 0;
    car.driverDoorPivot.rotation.y = THREE.MathUtils.damp(
      car.driverDoorPivot.rotation.y,
      targetDoorYaw,
      11,
      dt,
    );

    // 2. Rain Wipers & Turn Signal Blinkers
    if (this.weather === 'rainy' && this.inCar) {
      this.wiperPhase += dt * 5.2;
      const sweep = -0.35 + Math.sin(this.wiperPhase) * 0.55;
      car.wiperLeftPivot.rotation.z = sweep;
      car.wiperRightPivot.rotation.z = sweep;
    } else {
      car.wiperLeftPivot.rotation.z = THREE.MathUtils.damp(car.wiperLeftPivot.rotation.z, -1.25, 8, dt);
      car.wiperRightPivot.rotation.z = THREE.MathUtils.damp(car.wiperRightPivot.rotation.z, -1.25, 8, dt);
    }

    if (this.inCar && (this.carLeftBlinker || this.carRightBlinker)) {
      this.blinkerTimer += dt;
      if (this.blinkerTimer >= 0.42) {
        this.blinkerTimer = 0;
        this.blinkerPhaseOn = !this.blinkerPhaseOn;
        this.sound.playTurnSignal(this.blinkerPhaseOn);
      }
      const glow = this.blinkerPhaseOn ? 1.8 : 0.05;
      car.leftBlinkerMat.emissiveIntensity = this.carLeftBlinker ? glow : 0.05;
      car.dashLeftIndMat.emissiveIntensity = this.carLeftBlinker ? glow : 0.05;
      car.rightBlinkerMat.emissiveIntensity = this.carRightBlinker ? glow : 0.05;
      car.dashRightIndMat.emissiveIntensity = this.carRightBlinker ? glow : 0.05;
    } else {
      car.leftBlinkerMat.emissiveIntensity = 0.05;
      car.rightBlinkerMat.emissiveIntensity = 0.05;
      car.dashLeftIndMat.emissiveIntensity = 0.05;
      car.dashRightIndMat.emissiveIntensity = 0.05;
    }

    // 3. Nile River Water + Felucca Sailboats + Mission Beacons + Waving Taxi Passenger
    this.textures.nileWater.offset.x = (this.textures.nileWater.offset.x + dt * 0.03) % 1;
    for (let fi = 0; fi < this.world.cornicheFeluccas.length; fi++) {
      const f = this.world.cornicheFeluccas[fi];
      f.group.position.x += f.dir * f.speed * dt;
      if (f.group.position.x > 92) {
        f.dir = -1;
        f.group.rotation.y = -Math.PI / 2;
      } else if (f.group.position.x < -92) {
        f.dir = 1;
        f.group.rotation.y = Math.PI / 2;
      }
      f.group.position.y = Math.sin(performance.now() * 0.002 + fi * 1.4) * 0.08;
      f.group.rotation.z = Math.sin(performance.now() * 0.0017 + fi) * 0.035;
    }
    if (this.world.taxiPickupBeacon.visible) {
      this.world.taxiPickupBeacon.rotation.y += dt * 1.8;
      animateHumanActor(
        this.world.taxiPassengerActor,
        'wave',
        performance.now() * 0.002,
        dt,
      );
    }
    if (this.world.taxiDropoffBeacon.visible) {
      this.world.taxiDropoffBeacon.rotation.y += dt * 1.8;
    }

    // 4. Shop Owners, Shop Workers, Ful Co-Workers, Romance NPCs, Family & Flags
    const nowSec = performance.now() * 0.001;
    for (let i = 0; i < this.world.flagMeshes.length; i++) {
      this.world.flagMeshes[i].rotation.y = Math.sin(nowSec * 3.2 + i) * 0.16;
    }
    for (let i = 0; i < this.world.fulCoworkers.length; i++) {
      const cw = this.world.fulCoworkers[i];
      const cwLook = computeNpcLookYaw(
        cw.group.position.x,
        cw.group.position.z,
        cw.group.rotation.y,
        this.playerX,
        this.playerZ,
      );
      animateHumanActor(cw, 'talk', nowSec + i * 1.7, dt, cwLook);
    }
    for (let i = 0; i < this.world.shopOwners.length; i++) {
      const owner = this.world.shopOwners[i];
      const distSq =
        (owner.x - this.playerX) * (owner.x - this.playerX) +
        (owner.z - this.playerZ) * (owner.z - this.playerZ);
      if (distSq > 70 * 70) continue;
      const lookYaw = computeNpcLookYaw(
        owner.x,
        owner.z,
        owner.actor.group.rotation.y,
        this.playerX,
        this.playerZ,
      );
      animateHumanActor(
        owner.actor,
        distSq < 25 ? 'talk' : 'idle',
        nowSec + i * 0.8,
        dt,
        lookYaw,
      );
    }
    for (let i = 0; i < this.world.shopWorkers.length; i++) {
      const wk = this.world.shopWorkers[i];
      const distSq =
        (wk.x - this.playerX) * (wk.x - this.playerX) +
        (wk.z - this.playerZ) * (wk.z - this.playerZ);
      if (distSq > 55 * 55) continue;
      const lookYaw = computeNpcLookYaw(
        wk.x,
        wk.z,
        wk.actor.group.rotation.y,
        this.playerX,
        this.playerZ,
      );
      animateHumanActor(wk.actor, distSq < 20 ? 'talk' : 'idle', nowSec + i * 1.1, dt, lookYaw);
    }
    for (let i = 0; i < this.world.romanceActors.length; i++) {
      const ra = this.world.romanceActors[i];
      const distSq =
        (ra.homeX - this.playerX) * (ra.homeX - this.playerX) +
        (ra.homeZ - this.playerZ) * (ra.homeZ - this.playerZ);
      if (distSq > 70 * 70) continue;
      const lookYaw = computeNpcLookYaw(
        ra.homeX,
        ra.homeZ,
        ra.actor.group.rotation.y,
        this.playerX,
        this.playerZ,
      );
      animateHumanActor(ra.actor, distSq < 18 ? 'wave' : 'idle', nowSec + ra.phaseOffset, dt, lookYaw);
    }
    if (this.world.spouseActor.group.visible) {
      const spLook = computeNpcLookYaw(
        this.world.spouseActor.group.position.x,
        this.world.spouseActor.group.position.z,
        this.world.spouseActor.group.rotation.y,
        this.playerX,
        this.playerZ,
      );
      animateHumanActor(this.world.spouseActor, 'talk', nowSec, dt, spLook);
    }
    for (let i = 0; i < this.world.childActors.length; i++) {
      const ch = this.world.childActors[i];
      if (!ch.group.visible) continue;
      animateHumanActor(ch, 'wave', nowSec + i * 1.4, dt);
    }

    // Autonomous Household Family AI walking & room activities inside Shared Home
    for (let i = 0; i < this.world.householdActors.length; i++) {
      const entry = this.world.householdActors[i];
      const state = this.householdFamily.find((m) => m.id === entry.id);
      const pos = this.familyPosMap.get(entry.id);
      if (!state || !pos) continue;
      const wp = HOUSEHOLD_WAYPOINTS[state.activity];
      const dx = wp.x - pos.x;
      const dz = wp.z - pos.z;
      const dist = Math.hypot(dx, dz);
      const nearHome =
        Math.hypot(pos.x - this.playerX, pos.z - this.playerZ) < 26;
      if (dist > 0.18) {
        const step = Math.min(dist, 1.35 * dt);
        pos.x += (dx / dist) * step;
        pos.z += (dz / dist) * step;
        pos.yaw = Math.atan2(dx, dz);
        pos.phase += step * 3.5;
        entry.actor.group.position.set(pos.x, 0.16, pos.z);
        entry.actor.group.rotation.y = pos.yaw;
        if (nearHome) {
          animateHumanActor(entry.actor, 'walk', pos.phase, dt);
        }
      } else {
        entry.actor.group.position.set(pos.x, 0.16, pos.z);
        entry.actor.group.rotation.y = wp.yaw;
        if (nearHome) {
          animateHumanActor(entry.actor, wp.pose, nowSec + i * 1.3, dt);
        }
      }
    }

    // 5. Pooled Pedestrians + Active Customers
    const animateList = (list: NpcRuntime[], limit: number, isCustomer: boolean) => {
      for (let i = list.length - 1; i >= 0; i--) {
        if (!isCustomer && i >= limit) continue;
        const npc = list[i];
        const dx = npc.targetX - npc.x;
        const dz = npc.targetZ - npc.z;
        const dist = Math.hypot(dx, dz);

        const playerDistSq =
          (npc.x - this.playerX) * (npc.x - this.playerX) +
          (npc.z - this.playerZ) * (npc.z - this.playerZ);
        const nearPlayer = playerDistSq <= 68 * 68;

        if (isCustomer) {
          if (npc.reactionTimer && npc.reactionTimer > 0) {
            npc.reactionTimer = Math.max(0, npc.reactionTimer - dt);
          }
          if (npc.reactionTimer && npc.reactionTimer > 0 && npc.reactionExpression) {
            setActorExpression(npc.actor, npc.reactionExpression);
          } else if (npc.leaving) {
            setActorExpression(
              npc.actor,
              npc.reactionTone === 'upset' ? 'angry' : 'happy',
            );
          } else if (npc.diningSeatIdx !== undefined) {
            setActorExpression(
              npc.actor,
              npc.reactionTone === 'upset' ? 'angry' : 'happy',
            );
          } else if (npc.orderId) {
            const { eval: liveEval } = this.getCustomerEvaluation(npc);
            setActorExpression(npc.actor, liveEval.facialExpression);
          }
        }

        if (dist > 0.16) {
          const step = Math.min(dist, npc.speed * dt);
          npc.x += (dx / dist) * step;
          npc.z += (dz / dist) * step;
          const onRoadNow =
            !isCustomer &&
            (NS_ROADS_X.some((rx) => Math.abs(npc.x - rx) < 5.25) ||
              EW_ROADS_Z.some((rz) => Math.abs(npc.z - rz) < 5.25));
          const npcY = isCustomer ? 0.08 : onRoadNow ? 0.022 : 0.14;
          npc.actor.group.position.set(npc.x, npcY, npc.z);
          npc.actor.group.rotation.y = Math.atan2(dx, dz);
          npc.walkPhase += step * 3.6;
          if (nearPlayer) {
            const lookYaw = computeNpcLookYaw(
              npc.x,
              npc.z,
              npc.actor.group.rotation.y,
              this.playerX,
              this.playerZ,
            );
            animateHumanActor(
              npc.actor,
              npc.isRunner ? 'run' : 'walk',
              npc.walkPhase,
              dt,
              lookYaw,
            );
          }
        } else if (isCustomer && npc.diningSeatIdx !== undefined) {
          const seat = this.world.diningSeats[npc.diningSeatIdx];
          npc.actor.group.position.set(seat.x, 0.12, seat.z);
          npc.actor.group.rotation.y = seat.yaw;
          if (nearPlayer) {
            const lookYaw = computeNpcLookYaw(
              seat.x,
              seat.z,
              seat.yaw,
              this.playerX,
              this.playerZ,
            );
            animateHumanActor(npc.actor, 'eat', nowSec + i, dt, lookYaw);
          }
          npc.dineTimer = (npc.dineTimer ?? 10) - dt;
          if (npc.dineTimer <= 0) {
            npc.diningSeatIdx = undefined;
            npc.leaving = true;
            npc.targetX = -6.4;
            npc.targetZ = Math.random() > 0.5 ? 28 : -28;
          }
        } else if (!isCustomer) {
          if (npc.targetX === npc.x) {
            npc.targetZ = npc.targetZ > 0 ? -96 : 76;
          } else {
            npc.targetX = npc.targetX > 0 ? -90 : 90;
          }
        } else if (npc.leaving) {
          this.scene.remove(npc.actor.group);
          list.splice(i, 1);
        } else {
          npc.actor.group.rotation.y = -Math.PI / 2;
          if (nearPlayer) {
            const { eval: liveEval } = this.getCustomerEvaluation(npc);
            const activePose =
              npc.reactionTimer && npc.reactionTimer > 0 && npc.reactionAnim
                ? npc.reactionAnim
                : liveEval.animPose;
            const lookYaw = computeNpcLookYaw(
              npc.x,
              npc.z,
              npc.actor.group.rotation.y,
              this.playerX,
              this.playerZ,
            );
            animateHumanActor(npc.actor, activePose, nowSec + i, dt, lookYaw);
          }
        }
      }
    };
    animateList(this.pedestrians, this.activePedestrianCount, false);
    animateList(this.customers, this.customers.length, true);

    // 6. AI Traffic Fleet Cruising 98 Streets (with Red-Light Braking + Microbus Stops)
    for (let i = 0; i < this.activeTrafficCount && i < this.trafficFleet.length; i++) {
      const t = this.trafficFleet[i];
      const worldX = t.axis === 'ns' ? t.roadCoord : t.posAlong;
      const worldZ = t.axis === 'ns' ? t.posAlong : t.roadCoord;
      const redLightStop =
        isAxisRedLight(this.trafficSignal, t.axis) &&
        TRAFFIC_INTERSECTIONS.some((inter) => {
          const ahead =
            t.axis === 'ns'
              ? (inter.z - worldZ) * t.dir
              : (inter.x - worldX) * t.dir;
          const lateral =
            t.axis === 'ns' ? Math.abs(worldX - inter.x) : Math.abs(worldZ - inter.z);
          return lateral < 4.5 && ahead > 2.8 && ahead < 8.5;
        });
      const microbusStop =
        t.kind === 'microbus' &&
        Math.sin(nowSec * 0.45 + i * 2.1) > 0.91 &&
        (Math.abs(worldZ - 16.5) < 4 || Math.abs(worldZ + 24) < 4);

      if (!redLightStop && !microbusStop) {
        t.posAlong += t.dir * t.speed * dt;
      }

      if (t.axis === 'ns') {
        if (t.posAlong > 78) {
          t.posAlong = 78;
          t.dir = -1;
        } else if (t.posAlong < -102) {
          t.posAlong = -102;
          t.dir = 1;
        }
        // Turn occasionally when crossing an E-W street
        const crossIdx = EW_ROADS_Z.findIndex((rz) => Math.abs(t.posAlong - rz) < 0.75);
        if (crossIdx !== -1 && crossIdx !== t.lastCrossIndex) {
          t.lastCrossIndex = crossIdx;
          if ((i + crossIdx + Math.floor(nowSec)) % 4 === 0) {
            t.axis = 'ew';
            t.posAlong = t.roadCoord;
            t.roadCoord = EW_ROADS_Z[crossIdx];
            t.dir = t.posAlong > 0 ? -1 : 1;
          }
        } else if (crossIdx === -1) {
          t.lastCrossIndex = -1;
        }
      } else {
        if (t.posAlong > 92) {
          t.posAlong = 92;
          t.dir = -1;
        } else if (t.posAlong < -92) {
          t.posAlong = -92;
          t.dir = 1;
        }
        const crossIdx = NS_ROADS_X.findIndex((rx) => Math.abs(t.posAlong - rx) < 0.75);
        if (crossIdx !== -1 && crossIdx !== t.lastCrossIndex) {
          t.lastCrossIndex = crossIdx;
          if ((i + crossIdx + Math.floor(nowSec)) % 4 === 0) {
            t.axis = 'ns';
            t.posAlong = t.roadCoord;
            t.roadCoord = NS_ROADS_X[crossIdx];
            t.dir = t.posAlong > 0 ? -1 : 1;
          }
        } else if (crossIdx === -1) {
          t.lastCrossIndex = -1;
        }
      }
      this.positionTrafficMesh(t);
    }

    // 7. Sizzling Fryer Patties/Bubbles + Steam particles rising from Ful Pot & Taameya Fryer
    for (let i = 0; i < this.world.fryingPatties.length; i++) {
      const fp = this.world.fryingPatties[i];
      fp.position.y = 0.25 + Math.sin(nowSec * 5.2 + i * 1.4) * 0.008;
      fp.rotation.y += dt * (i % 2 === 0 ? 0.35 : -0.25);
    }

    for (let i = 0; i < this.steamParticles.length; i++) {
      const sp = this.steamParticles[i];
      sp.y += sp.vy * dt;
      sp.phase += dt * 2.2;
      if (sp.y > 2.65) {
        sp.y = 1.55;
      }
      const s = 0.7 + (sp.y - 1.55) * 0.7;
      _vec3A.set(sp.x + Math.sin(sp.phase) * 0.04, sp.y, sp.z);
      _scale.setScalar(s);
      _quat.identity();
      _mat4.compose(_vec3A, _quat, _scale);
      this.world.steamInstanced.setMatrixAt(i, _mat4);
    }
    this.world.steamInstanced.instanceMatrix.needsUpdate = true;

    // 8. Celebration burst particles
    for (let i = 0; i < 32; i++) {
      const bp = this.burstParticles[i];
      if (bp && bp.life < bp.maxLife) {
        bp.life += dt;
        bp.vy -= 6.5 * dt;
        bp.x += bp.vx * dt;
        bp.y += bp.vy * dt;
        bp.z += bp.vz * dt;
        const sc = Math.max(0.01, 1 - bp.life / bp.maxLife);
        _vec3A.set(bp.x, bp.y, bp.z);
        _scale.setScalar(sc);
        _mat4.compose(_vec3A, _quat, _scale);
      } else {
        _vec3A.set(0, -50, 0);
        _scale.setScalar(0.001);
        _mat4.compose(_vec3A, _quat, _scale);
      }
      this.world.burstInstanced.setMatrixAt(i, _mat4);
    }
    this.world.burstInstanced.instanceMatrix.needsUpdate = true;
    this.burstParticles = this.burstParticles.filter((b) => b.life < b.maxLife);
  }

  private updateDayNightAndWeather(dt: number): void {
    const stepFrac = dt * 0.0024;
    this.timeOfDay = (this.timeOfDay + stepFrac) % 1;
    const elev = computeSunElevation(this.timeOfDay);

    // Passive business profit accrual from owned shops
    if (this.phase === 'playing') {
      this.profitAccrualAccum += stepFrac;
      if (this.profitAccrualAccum >= 0.02) {
        this.cityShops = accrueShopProfits(this.cityShops, this.profitAccrualAccum);
        this.profitAccrualAccum = 0;
      }
    }

    this.weatherTimer -= dt;
    if (this.weatherTimer <= 0) {
      this.weatherTimer = 55 + Math.random() * 45;
      const roll = Math.random();
      this.weather = roll < 0.62 ? 'sunny' : roll < 0.84 ? 'cloudy' : 'rainy';
      this.sound.setRainAmbience(this.weather === 'rainy' && this.phase === 'playing');
    }

    this.world.rainInstanced.visible = this.weather === 'rainy';
    if (this.weather === 'rainy') {
      for (let i = 0; i < this.rainDrops.length; i++) {
        const rd = this.rainDrops[i];
        rd.y -= 16 * dt;
        if (rd.y < 0) {
          rd.y = 14;
          rd.x = this.playerX + (Math.random() - 0.5) * 32;
          rd.z = this.playerZ + (Math.random() - 0.5) * 32;
        }
        _vec3A.set(rd.x, rd.y, rd.z);
        _scale.set(1, 1, 1);
        _mat4.compose(_vec3A, _quat, _scale);
        this.world.rainInstanced.setMatrixAt(i, _mat4);
      }
      this.world.rainInstanced.instanceMatrix.needsUpdate = true;
    }

    if (elev > 0.18) {
      _currentSky.copy(_skyDay);
    } else if (elev > -0.1) {
      const t = (elev + 0.1) / 0.28;
      _currentSky.copy(_skySunset).lerp(_skyDay, t);
    } else {
      const t = THREE.MathUtils.clamp((elev + 0.4) / 0.3, 0, 1);
      _currentSky.copy(_skyNight).lerp(_skySunset, t);
    }
    if (this.weather === 'rainy') {
      _currentSky.lerp(_skyRain, 0.55);
    } else if (this.weather === 'cloudy') {
      _currentSky.lerp(_skyRain, 0.25);
    }

    (this.scene.background as THREE.Color).copy(_currentSky);
    (this.scene.fog as THREE.FogExp2).color.copy(_currentSky);

    // Wet Rain Asphalt Gloss + Subtle Lightning Flash
    const isRain = this.weather === 'rainy';
    for (let mi = 0; mi < this.world.asphaltMaterials.length; mi++) {
      this.world.asphaltMaterials[mi].roughness = isRain ? 0.24 : 0.88;
      this.world.asphaltMaterials[mi].metalness = isRain ? 0.20 : 0.02;
    }
    if (isRain) {
      if (this.lightningFlashTimer > 0) {
        this.lightningFlashTimer = Math.max(0, this.lightningFlashTimer - dt);
      } else if (Math.random() < dt * 0.06) {
        this.lightningFlashTimer = 0.22;
      }
    } else {
      this.lightningFlashTimer = 0;
    }

    this.sunLight.position.set(
      Math.cos(this.timeOfDay * Math.PI * 2) * 36,
      Math.max(4, elev * 42),
      18,
    );
    if (elev > 0.22) {
      _curSun.copy(_sunDay);
      _curHemiGround.copy(_hemiGroundDay);
    } else if (elev > -0.08) {
      const t = (elev + 0.08) / 0.3;
      _curSun.copy(_sunGolden).lerp(_sunDay, t);
      _curHemiGround.copy(_hemiGroundGolden).lerp(_hemiGroundDay, t);
    } else {
      const t = THREE.MathUtils.clamp((elev + 0.38) / 0.3, 0, 1);
      _curSun.copy(_sunNight).lerp(_sunGolden, t);
      _curHemiGround.copy(_hemiGroundNight).lerp(_hemiGroundGolden, t);
    }
    this.sunLight.color.copy(_curSun);
    this.hemiLight.groundColor.copy(_curHemiGround);

    const sunStrength = THREE.MathUtils.clamp((elev + 0.2) * 1.4, 0.18, 1.55);
    const flashBoost = this.lightningFlashTimer > 0 ? 1.35 : 0;
    this.sunLight.intensity =
      (this.weather === 'rainy' ? sunStrength * 0.55 : sunStrength) + flashBoost;
    this.hemiLight.intensity = THREE.MathUtils.clamp(0.32 + elev * 0.45, 0.25, 0.78);

    const isDark = elev < 0.12;
    for (const l of this.world.streetLampLights) {
      l.intensity = isDark ? 3.2 : 0;
    }
    this.world.streetLampBulbMat.emissiveIntensity = isDark ? 1.5 : 0.25;
    for (const sb of this.world.stringLightBulbs) {
      sb.emissiveIntensity = isDark ? 1.3 : 0.45;
    }
    for (const nm of this.world.shopNeonMaterials) {
      nm.emissiveIntensity = isDark ? 0.98 : 0.48;
    }

    const beamOn = this.inCar && (this.carHeadlightsOn || isDark);
    this.world.heroCar.carHeadlightsMat.emissiveIntensity = beamOn ? 1.7 : 0.35;
    this.world.heroCar.headlightSpot.intensity = beamOn ? 6.8 : 0;
  }

  private updateContextualHint(): void {
    const bob = Math.sin(performance.now() * 0.006) * 0.1;

    // 1. Check Taxi Passenger Pickup / Dropoff (works both inside car & on foot!)
    if (this.activeTaxi) {
      const tx = this.activeTaxi.pickedUp
        ? this.activeTaxi.dropoffX
        : this.activeTaxi.pickupX;
      const tz = this.activeTaxi.pickedUp
        ? this.activeTaxi.dropoffZ
        : this.activeTaxi.pickupZ;
      const tDist = Math.hypot(this.playerX - tx, this.playerZ - tz);
      if (tDist <= 6.2) {
        this.activeHint = {
          id: 'taxi-stop',
          actionType: 'taxi_action',
          labelAr: this.activeTaxi.pickedUp
            ? `توصيل ${this.activeTaxi.passengerName} (+${this.activeTaxi.fare} ج.م)`
            : `إركاب ${this.activeTaxi.passengerName} إلى ${this.activeTaxi.dropoffStreetAr}`,
          keyHint: 'E',
        };
        this.world.yellowArrowGroup.visible = !this.inCar;
        this.world.yellowArrowGroup.position.set(tx, 2.3 + bob, tz);
        return;
      }
    }

    // 2. Check Delivery Dropoff
    if (this.heldReadyPack) {
      const delOrd = this.orders.find(
        (o) =>
          o.isDelivery &&
          o.recipeId === this.heldReadyPack &&
          o.deliveryX !== undefined,
      );
      if (delOrd && delOrd.deliveryX !== undefined && delOrd.deliveryZ !== undefined) {
        const dDist = Math.hypot(
          this.playerX - delOrd.deliveryX,
          this.playerZ - delOrd.deliveryZ,
        );
        if (dDist <= 5.5) {
          this.activeHint = {
            id: 'delivery-dropoff',
            actionType: 'deliver_order',
            labelAr: `تسليم طلب ${delOrd.customerName}`,
            subLabelAr: delOrd.deliveryTargetName,
            keyHint: 'E',
          };
          this.world.yellowArrowGroup.visible = !this.inCar;
          this.world.yellowArrowGroup.position.set(
            delOrd.deliveryX,
            2.4 + bob,
            delOrd.deliveryZ,
          );
          return;
        }
      }
    }

    if (this.inCar) {
      this.world.yellowArrowGroup.visible = false;
      const pumpDist = Math.hypot(
        this.carX - GAS_STATION_DEF.x,
        this.carZ - GAS_STATION_DEF.z,
      );
      if (pumpDist <= 9.5) {
        this.activeHint = {
          id: 'fuel-pump',
          actionType: 'refuel_car',
          labelAr: 'تموين وصيانة السيارة في محطة بنزين المعلم (٢٥ جنيه)',
          keyHint: 'E',
        };
        return;
      }
      this.activeHint = null;
      return;
    }

    // 3. Check Random Street Event near player on foot
    const ev = this.activeStreetEvent;
    if (ev && !ev.resolved && ev.type !== 'flash_sale') {
      const evDist = Math.hypot(this.playerX - ev.x, this.playerZ - ev.z);
      if (evDist <= 4.4) {
        const actionType: InteractableHint['actionType'] =
          ev.type === 'street_fight'
            ? 'mediate_fight'
            : ev.type === 'broken_car'
              ? 'fix_broken_car'
              : ev.type === 'wedding_feast'
                ? 'serve_wedding_feast'
                : 'encourage_vendor';
        const labelAr =
          ev.type === 'street_fight'
            ? 'فض المشاجرة والصلح بين الزبائن'
            : ev.type === 'broken_car'
              ? 'مساعدة السواق وإصلاح السيارة المعطلة'
              : ev.type === 'wedding_feast'
                ? 'تقديم واجب الضيافة في الفرح الشعبي'
                : 'مباركة البائع المتجول وتنشيط الحركة';
        this.activeHint = {
          id: ev.id,
          actionType,
          labelAr,
          subLabelAr: `+${ev.rewardMoney} ج.م و+${ev.rewardRep} سمعة`,
          keyHint: 'E',
        };
        this.world.yellowArrowGroup.visible = true;
        this.world.yellowArrowGroup.position.set(ev.x, 2.35 + bob, ev.z);
        return;
      }
    }

    let best: InteractableHint | null = null;
    let bestWorldPos: THREE.Vector3 | null = null;
    let bestScore = Infinity;

    _vec3A.set(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();

    for (const item of this.world.interactables) {
      if (!item.mesh.visible && item.actionType === 'talk_person') continue;
      if (this.heldIngredients.length > 0 && item.actionType === 'open_cashier') continue;
      if (Math.abs((item.position.y - 0.9) - this.groundY) > 2.35) continue;
      const dx = item.position.x - this.playerX;
      const dz = item.position.z - this.playerZ;
      const dist = Math.hypot(dx, dz);
      if (dist > item.radius) continue;

      _vec3B.set(dx, item.position.y - this.playerY, dz).normalize();
      const dot = _vec3A.dot(_vec3B);
      const score = dist - dot * 1.4;
      if (score < bestScore) {
        bestScore = score;
        bestWorldPos = item.position;
        best = {
          id: item.id,
          actionType: item.actionType,
          labelAr: item.labelAr,
          subLabelAr: item.subLabelAr,
          keyHint: item.keyHint,
          shopId: item.shopId,
          doorId: item.doorId,
          personId: item.personId,
          personKind: item.personKind,
          objectKind: item.objectKind,
          objectId: item.objectId,
        };
      }
    }

    const holdingMatchingOrder =
      this.heldIngredients.length > 0 &&
      this.orders.some(
        (o) => !o.isDelivery && matchesOrder(this.heldIngredients, o.recipeId),
      );

    // Allow directly talking with any waiting or dining customer at the shop (when not serving a ready sandwich)
    if (!holdingMatchingOrder) {
      for (let i = 0; i < this.customers.length; i++) {
        const cust = this.customers[i];
        if (cust.leaving && !(cust.reactionTimer && cust.reactionTimer > 0)) continue;
        const dist = Math.hypot(cust.x - this.playerX, cust.z - this.playerZ);
        const canOverrideShopPrompt =
          this.heldIngredients.length === 0 &&
          (best?.actionType === 'serve_customer' ||
            (this.shopOpen && best?.actionType === 'toggle_shop'));
        const maxRange = canOverrideShopPrompt ? 3.6 : 2.65;
        if (dist <= maxRange && (!best || canOverrideShopPrompt || dist < bestScore + 0.6)) {
          best = {
            id: `cust-${i}`,
            actionType: 'talk_person',
            labelAr: `حوار مع الزبون: ${cust.customerName ?? 'زبون المحل'}`,
            subLabelAr: 'شوف تقييمه، اسمع مدح أو شكوى، أو طيّب خاطره [E]',
            keyHint: 'E',
            personId: `cust-${i}`,
            personKind: 'customer',
          };
          bestWorldPos = _vec3C.set(cust.x, 1.35, cust.z);
          break;
        }
      }
    }

    if (!best) {
      // Allow talking to any nearby walking citizen on the street!
      for (let i = 0; i < this.activePedestrianCount && i < this.pedestrians.length; i++) {
        const ped = this.pedestrians[i];
        if (!ped.actor.group.visible) continue;
        const dist = Math.hypot(ped.x - this.playerX, ped.z - this.playerZ);
        if (dist <= 2.75) {
          best = {
            id: `ped-${i}`,
            actionType: 'talk_person',
            labelAr: 'التحدث مع أحد المارة',
            subLabelAr: 'اضغط [E] للدردشة والضحك مع أهل الحي',
            keyHint: 'E',
            personId: `ped-${i}`,
            personKind: 'pedestrian',
          };
          bestWorldPos = _vec3C.set(ped.x, 1.35, ped.z);
          break;
        }
      }
    }

    this.activeHint = best;
    if (best && bestWorldPos) {
      this.world.yellowArrowGroup.visible = true;
      const arrowY =
        best.actionType === 'serve_customer'
          ? 2.35 + bob
          : bestWorldPos.y + 0.85 + bob;
      this.world.yellowArrowGroup.position.set(
        bestWorldPos.x,
        arrowY,
        bestWorldPos.z,
      );
      this.world.yellowArrowGroup.rotation.y += 0.04;
    } else {
      this.world.yellowArrowGroup.visible = false;
    }
  }

  private updateCustomerBubble(): void {
    if (this.phase !== 'playing' || this.inCar) {
      this.customerBubble = null;
      return;
    }

    const activeCustomerNpc =
      this.customers.find(
        (n) =>
          n.role === 'customer' &&
          n.reactionTimer !== undefined &&
          n.reactionTimer > 0 &&
          n.reactionEmoji,
      ) ??
      this.customers.find(
        (n) => n.role === 'customer' && !n.leaving && (n.orderId || n.diningSeatIdx !== undefined),
      );
    if (!activeCustomerNpc) {
      this.customerBubble = null;
      return;
    }

    const dist = Math.hypot(
      activeCustomerNpc.x - this.playerX,
      activeCustomerNpc.z - this.playerZ,
    );
    if (dist > 18) {
      this.customerBubble = null;
      return;
    }

    this.camera.updateMatrixWorld();
    _vec3C.set(activeCustomerNpc.x, 2.1, activeCustomerNpc.z);
    _vec3C.project(this.camera);

    if (_vec3C.z > 1 || _vec3C.z < -1 || Math.abs(_vec3C.x) > 0.92 || Math.abs(_vec3C.y) > 0.92) {
      this.customerBubble = null;
      return;
    }

    const screenX = THREE.MathUtils.clamp((_vec3C.x * 0.5 + 0.5) * 100, 10, 90);
    const screenY = THREE.MathUtils.clamp((-_vec3C.y * 0.5 + 0.5) * 100, 12, 68);

    const { ord, eval: liveEval } = this.getCustomerEvaluation(activeCustomerNpc);
    const useReaction =
      Boolean(activeCustomerNpc.reactionTimer && activeCustomerNpc.reactionTimer > 0 && activeCustomerNpc.reactionEmoji);

    this.customerBubble = {
      customerName: ord?.customerName ?? activeCustomerNpc.customerName ?? 'زبون المحل',
      emoji: useReaction ? activeCustomerNpc.reactionEmoji! : liveEval.emoji,
      moodLabelAr: useReaction
        ? activeCustomerNpc.reactionMoodLabel ?? liveEval.moodLabelAr
        : liveEval.moodLabelAr,
      tone: useReaction
        ? activeCustomerNpc.reactionTone ?? liveEval.moodTone
        : liveEval.moodTone,
      text: useReaction
        ? activeCustomerNpc.reactionLineAr ?? liveEval.dynamicLineAr
        : liveEval.moodTone === 'upset'
          ? liveEval.dynamicLineAr
          : ord?.dialogueAr ?? liveEval.dynamicLineAr,
      screenX,
      screenY,
      visible: true,
    };
  }

  private getCurrentZoneArabic(): string {
    if (this.inCar) return 'داخل السيارة المشتركة';
    if (
      this.playerX >= -17 &&
      this.playerX <= -8.5 &&
      this.playerZ >= -5 &&
      this.playerZ <= 5
    ) {
      return 'محل المعلم — فول وطعمية';
    }
    if (
      this.playerX >= 9 &&
      this.playerX <= 22.6 &&
      this.playerZ >= -5.6 &&
      this.playerZ <= 5.6
    ) {
      return 'البيت الثابت (بيت الحارة)';
    }
    if (
      this.playerX >= 8.5 &&
      this.playerX <= 19 &&
      this.playerZ <= -16 &&
      this.playerZ >= -28
    ) {
      return 'سوق الحارة';
    }
    if (
      this.playerX <= -9 &&
      this.playerX >= -20 &&
      this.playerZ <= -16 &&
      this.playerZ >= -28
    ) {
      return 'محطة البنزين';
    }
    if (
      this.playerX >= 9 &&
      this.playerX <= 17.8 &&
      this.playerZ >= 7.8 &&
      this.playerZ <= 15.0
    ) {
      return 'البيت الثابت · جناح الأسرة';
    }
    if (
      this.playerX >= 8.5 &&
      this.playerX <= 19.5 &&
      this.playerZ <= -100 &&
      this.playerZ >= -107
    ) {
      return 'بنتهاوس الكورنيش النيلي';
    }
      if (
      Math.abs(this.playerX - REMOTE_CREW_APARTMENT.x) < 7 &&
      Math.abs(this.playerZ - REMOTE_CREW_APARTMENT.z) < 7
    ) {
      return REMOTE_CREW_APARTMENT.nameAr;
    }
    const nearSchool = SCHOOL_CAMPUSES.find(
      (sch) => Math.hypot(this.playerX - sch.x, this.playerZ - sch.z) < 16,
    );
    if (nearSchool) return nearSchool.nameAr;
    const nearShop = CITY_SHOPS.find(
      (s) => Math.hypot(this.playerX - s.x, this.playerZ - s.z) < 6.5,
    );
    if (nearShop) return nearShop.nameAr;
    return getStreetContext(this.playerX, this.playerZ).street.nameAr;
  }

  public getSnapshot(): HudSnapshot {
    const ctx = getStreetContext(this.playerX, this.playerZ);
    const spouseDef = this.spouseId ? ROMANCE_NPCS.find((g) => g.id === this.spouseId) : null;
    const lifeStage = getPlayerLifeStage(this.romanceStates, this.spouseId, this.children);
    const childUnlock = getChildUnlockStatus(
      this.spouseId,
      this.children,
      this.day,
      this.marriedDay,
      this.marriageElapsedSec,
    );
    const mpStatus = this.mp.getStatus();
    const playerZoneAr = this.getCurrentZoneArabic();
    const remotePoses = Array.from(this.remotePlayerActors.values()).map((r) => r.pose);
    const visibleHousehold = getVisibleHouseholdFamily(
      this.householdFamily,
      this.spouseId,
      this.children,
      spouseDef?.nameAr ?? this.customProfiles.spouseNameAr,
    ).map((m) =>
      m.id === 'home-son'
        ? { ...m, nameAr: this.customProfiles.sonNameAr }
        : m.id === 'home-daughter'
          ? { ...m, nameAr: this.customProfiles.daughterNameAr }
          : m,
    );

    const totalPassengers = this.accompanyingFollowers.length + (this.companionDef ? 1 : 0);
    const maxCabPassengers =
      this.activeVehicleId === 'delivery_moto' ? 1 : 4;
    const cabSeatCount = Math.min(maxCabPassengers, totalPassengers);
    const flatbedSeatCount =
      this.activeVehicleId === 'pickup'
        ? Math.min(4, Math.max(0, totalPassengers - 4))
        : 0;
    const accompanyingList: AccompanyingPersonHud[] = this.accompanyingFollowers.map((f, idx) => {
      const seatIndex = idx + (this.companionDef ? 1 : 0);
      const seatZone: AccompanyingPersonHud['seatZone'] = !this.inCar
        ? 'walking'
        : seatIndex < 4
          ? 'cab'
          : 'flatbed';
      return {
        id: f.id,
        nameAr: f.nameAr,
        roleAr: f.roleAr,
        holdingHand: f.holdHand,
        seatZone,
      };
    });

    const rawCrewSlots = buildCrewSlotsSnapshot({
      selfCharacterId: this.selectedCharacterId,
      selfPos: { x: this.playerX, z: this.playerZ },
      selfZoneAr: playerZoneAr,
      selfStreetAr: ctx.street.nameAr,
      selfInCar: this.inCar,
      onlineMode: mpStatus.mode === 'online',
      members: mpStatus.members,
      remotePoses,
    }).map((slot) => {
      const resolved = getResolvedCharacterProfile(slot.characterId, this.customProfiles);
      return {
        ...slot,
        nameAr: resolved.nameAr,
        roleTitleAr: resolved.roleTitleAr,
      };
    });

    return {
      phase: this.phase,
      selectedCharacterId: this.selectedCharacterId,
      money: this.money,
      reputation: this.reputation,
      day: this.day,
      timeOfDay: this.timeOfDay,
      dayPeriod: getDayPeriod(this.timeOfDay),
      weather: this.weather,
      shopOpen: this.shopOpen,
      shopLightsOn: this.shopLightsOn,
      heldIngredients: [...this.heldIngredients],
      heldReadyPack: this.heldReadyPack,
      orders: this.orders.map((o) => ({ ...o })),
      inventory: { ...this.inventory },
      prices: { ...this.prices },
      upgrades: { ...this.upgrades },
      inCar: this.inCar,
      carSpeedKmh: Math.round(Math.abs(this.carSpeed) * 7.2),
      carGearLabel: this.carGearLabel,
      carFuel: Math.round(this.carFuel),
      carCondition: Math.round(this.carCondition),
      carHeadlightsOn: this.carHeadlightsOn,
      carLeftBlinker: this.carLeftBlinker,
      carRightBlinker: this.carRightBlinker,
      radioStation: this.radioStation,
      hamoTrackIndex: this.hamoTrackIndex,
      musicPaused: this.musicPaused,
      activeVehicleId: this.activeVehicleId,
      ownedVehicleIds: [...this.ownedVehicleIds],
      ownedApartmentIds: [...this.ownedApartmentIds],
      activeApartmentId: this.activeApartmentId,
      spouseId: this.spouseId,
      spouseNameAr: spouseDef?.nameAr ?? null,
      marriedDay: this.marriedDay,
      marriageElapsedSec: this.marriageElapsedSec,
      lifeStage,
      lifeStageLabelAr: LIFE_STAGE_LABELS_AR[lifeStage],
      childEligible: childUnlock.unlocked,
      childWaitRemainingSec: childUnlock.remainingSec,
      children: this.children.map((c) => ({ ...c })),
      romanceStates: this.romanceStates.map((r) => ({ ...r })),
      activeDialogue: this.activeDialogue
        ? {
            ...this.activeDialogue,
            choices: [...this.activeDialogue.choices],
            chatLog: [...(this.activeDialogue.chatLog ?? [])],
          }
        : null,
      activeRole: this.activeRole,
      roleLocked: mpStatus.mode === 'online',
      activeJob: this.activeJob,
      activeTaxi: this.activeTaxi ? { ...this.activeTaxi } : null,
      activeRepair: this.activeRepair ? { ...this.activeRepair } : null,
      activeStreetEvent: this.activeStreetEvent ? { ...this.activeStreetEvent } : null,
      householdFamily: visibleHousehold,
      companionNameAr: this.companionDef?.nameAr ?? null,
      companionCornicheDone: this.companionCornicheDone,
      trafficSignal: this.trafficSignal,
      trafficFines: this.trafficFines,
      goldenSizzleActive: isGoldenSizzleWindow(this.simTimeSec),
      marketForecast: this.marketForecast,
      cityShops: this.cityShops.map((s) => ({ ...s })),
      activeShopOwnerId: this.activeShopOwnerId,
      density: { ...this.density },
      activePedestrianCount: this.activePedestrianCount,
      activeTrafficCount: this.activeTrafficCount,
      activeHint: this.activeHint,
      customerBubble: this.customerBubble,
      toastMessage: this.toastMessage,
      dailyStats: { ...this.dailyStats },
      fpsEstimate: this.fpsEstimate,
      quality: this.quality,
      adaptiveQuality: this.adaptiveQuality,
      cameraMode: this.cameraMode,
      carCameraMode: this.carCameraMode,
      playerZoneAr,
      currentStreetAr: ctx.street.nameAr,
      currentDistrictAr: ctx.district.nameAr,
      playerPos: { x: this.playerX, z: this.playerZ },
      playerYaw: this.playerYaw,
      carPos: { x: this.carX, z: this.carZ },
      multiplayer: mpStatus,
      crewSlots: rawCrewSlots,
      remotePlayersCount: this.remotePlayerActors.size,
      extraPrices: { ...this.extraPrices },
      cashierSettings: { ...this.cashierSettings },
      cashierReceipts: this.cashierReceipts.map((r) => ({ ...r })),
      nextInvoiceSeq: this.nextInvoiceSeq,
      cashierSummary: computeAccountingSummary(this.cashierReceipts, this.cashierSettings),
      customerInquiries: this.customerInquiries.map((q) => ({ ...q })),
      vipMembers: this.vipMembers.map((v) => ({ ...v })),
      kitchenTickets: this.kitchenTickets.map((k) => ({ ...k })),
      shiftSettlements: this.shiftSettlements.map((s) => ({ ...s })),
      shiftSettlementPreview: computeShiftSettlementPreview({
        day: this.day,
        summary: computeAccountingSummary(this.cashierReceipts, this.cashierSettings),
        dailyStats: this.dailyStats,
      }),
      canControlPricesAndSettings: canPerformFixedRoleAction(
        this.selectedCharacterId,
        mpStatus.mode === 'online',
        mpStatus.members,
        'manage_shop',
      ).allowed,
      canManageCity: canAccessCityManagement(this.selectedCharacterId),
      canOperateCashier: canPerformFixedRoleAction(
        this.selectedCharacterId,
        mpStatus.mode === 'online',
        mpStatus.members,
        'serve_cashier',
      ).allowed,
      canControlKitchen: canPerformFixedRoleAction(
        this.selectedCharacterId,
        mpStatus.mode === 'online',
        mpStatus.members,
        'cook_kitchen',
      ).allowed,
      ownerUnlocked: this.ownerUnlocked,
      playerNeeds: {
        hunger: Math.round(this.playerNeeds.hunger),
        thirst: Math.round(this.playerNeeds.thirst),
      },
      crewNeeds: {
        mohamed: {
          hunger: Math.round(this.crewNeeds.mohamed.hunger),
          thirst: Math.round(this.crewNeeds.mohamed.thirst),
        },
        ahmed: {
          hunger: Math.round(this.crewNeeds.ahmed.hunger),
          thirst: Math.round(this.crewNeeds.ahmed.thirst),
        },
        ali: {
          hunger: Math.round(this.crewNeeds.ali.hunger),
          thirst: Math.round(this.crewNeeds.ali.thirst),
        },
        mahmoud: {
          hunger: Math.round(this.crewNeeds.mahmoud.hunger),
          thirst: Math.round(this.crewNeeds.mahmoud.thirst),
        },
      },
      adBoard: { ...this.adBoard },
      employeeWallets: { ...this.employeeWallets },
      instaPayTransfers: this.instaPayTransfers.map((t) => ({ ...t })),
      latestInstaPayToast: this.latestInstaPayToast,
      inventoryConsumedToday: { ...this.inventoryConsumedToday },
      inventoryAuditLogs: this.inventoryAuditLogs.map((a) => ({ ...a })),
      ownedBuildingIds: [...this.ownedBuildingIds],
      restaurantFloors: this.restaurantFloors,
      ownedBranchIds: [...this.ownedBranchIds],
      vehicleLockedByOwner: this.vehicleLockedByOwner,
      customProfiles: { ...this.customProfiles },
      schoolEnrollment: { ...this.schoolEnrollment },
      accompanyingList,
      holdingSonHand: this.accompanyingFollowers.some((f) => f.holdHand),
      cabSeatCount,
      flatbedSeatCount,
      activeSeasonId: this.activeSeasonId,
      deliveryOrders: this.deliveryOrders.map((d) => ({ ...d })),
      activeDeliveryOrder: this.deliveryOrders.find((d) => d.status === 'active') ?? null,
      wholesaleContracts: [...this.wholesaleContracts],
      hygieneScore: Math.round(this.hygieneScore),
      qualityBadgeEarned: this.qualityBadgeEarned,
      inspectionLogs: this.inspectionLogs.slice(0, 20),
      ownedFurnitureIds: [...this.ownedFurnitureIds],
      cornicheVillaOwned: this.cornicheVillaOwned,
      schoolReport: { ...this.schoolReport },
      crewLeaderboard: { ...this.crewLeaderboard },
      coopChatMessages: this.coopChatMessages.slice(-30),
    };
  }

  private emitHud(): void {
    this.onHudUpdate(this.getSnapshot());
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.mp.disconnect(false);
    for (const entry of this.remotePlayerActors.values()) {
      this.scene.remove(entry.actor.group);
    }
    this.remotePlayerActors.clear();
    this.clearAccompanyingFollowers();
    this.resizeObserver.disconnect();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.renderer.domElement.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);

    this.sound.dispose();
    this.world.dispose();
    this.textures.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
