export type GamePhase = 'title' | 'playing' | 'paused' | 'gameover';

export type IngredientId =
  | 'bread'
  | 'ful'
  | 'taameya'
  | 'salad'
  | 'tahina'
  | 'pickles'
  | 'fries';

export type RecipeId =
  | 'ful_oil'
  | 'ful_tahina'
  | 'taameya_plain'
  | 'taameya_salad'
  | 'fries_sandwich'
  | 'mixed_special';

export type PosExtraItemId =
  | 'ful_sausage_plate'
  | 'taameya_platter'
  | 'fries_plate'
  | 'babaganoush'
  | 'salad_pickles_plate'
  | 'tea_mint'
  | 'karkadeh'
  | 'sugarcane_juice';

export type FullMenuItemId = RecipeId | PosExtraItemId;

export type PosMenuCategory = 'sandwiches' | 'plates' | 'sides' | 'drinks';

export interface FullMenuItemDef {
  id: FullMenuItemId;
  nameAr: string;
  category: PosMenuCategory;
  basePrice: number;
  ingredientsDescAr: string;
  prepNoteAr: string;
  linkedRecipeId?: RecipeId;
}

export interface PosCartLine {
  itemId: FullMenuItemId;
  nameAr: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export type VipTier = 'bronze' | 'silver' | 'gold';

export interface VipMember {
  id: string;
  nameAr: string;
  phone: string;
  points: number;
  tier: VipTier;
  visits: number;
  totalSpent: number;
}

export type RefundStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface PosReceipt {
  id: string;
  invoiceNumber: string;
  day: number;
  clockStr: string;
  cashierNameAr: string;
  managerNameAr: string;
  customerNameAr: string;
  paymentMethod: 'cash' | 'instapay';
  items: PosCartLine[];
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  taxPct: number;
  taxAmount: number;
  tipAmount: number;
  total: number;
  paidAmount: number;
  changeAmount: number;
  source: 'pos' | 'counter';
  vipMemberId?: string;
  vipTier?: VipTier;
  vipDiscountPct?: number;
  vipDiscountAmount?: number;
  isDelivery?: boolean;
  qrOrderCode?: string;
  refundStatus?: RefundStatus;
  refundReasonAr?: string;
  refundRequestedByAr?: string;
  refundApprovedByAr?: string;
  refundedAtClock?: string;
}

export type KitchenTicketStatus = 'queued' | 'cooking' | 'ready' | 'served';

export interface KitchenTicket {
  id: string;
  invoiceNumber: string;
  customerNameAr: string;
  items: PosCartLine[];
  status: KitchenTicketStatus;
  isDelivery: boolean;
  createdClock: string;
  chefNameAr?: string;
  updatedClock?: string;
}

export interface PartnerShareEntry {
  characterId: PlayerCharacterId;
  nameAr: string;
  roleTitleAr: string;
  sharePct: number;
  amount: number;
}

export interface ShiftSettlementPreview {
  day: number;
  grossRevenue: number;
  tipsAndSideIncome: number;
  shopRentExpense: number;
  utilitiesExpense: number;
  stockAndUpgradesExpense: number;
  refundsTotal: number;
  totalExpenses: number;
  netProfit: number;
  partnerShares: PartnerShareEntry[];
}

export interface ShiftSettlementRecord extends ShiftSettlementPreview {
  id: string;
  clockStr: string;
  settledByAr: string;
}

export type InquiryReplyMode =
  | 'official_price'
  | 'combo_suggest'
  | 'apply_discount'
  | 'calculate_change';

export interface CustomerInquiry {
  id: string;
  customerNameAr: string;
  customerMoodEmoji: string;
  topic: 'price_check' | 'multi_total' | 'change_check' | 'discount_request' | 'ingredients';
  questionAr: string;
  targetItemId: FullMenuItemId;
  targetQty: number;
  tenderedCash?: number;
  answered: boolean;
  replySummaryAr?: string;
}

export interface CashierControllerSettings {
  maxDiscountPct: number;
  taxRatePct: number;
  cashierRegisterLocked: boolean;
  allowCashierCustomDiscount: boolean;
  openingDrawerFloat: number;
}

export interface CashierAccountingSummary {
  invoiceCount: number;
  cashSalesTotal: number;
  instapaySalesTotal: number;
  totalDiscountsGiven: number;
  totalVipDiscountsGiven: number;
  totalTaxCollected: number;
  totalTipsCollected: number;
  refundedCount: number;
  refundedTotal: number;
  expectedCashDrawer: number;
  grossSalesTotal: number;
  topSellingItems: Array<{ itemId: FullMenuItemId; nameAr: string; qty: number; revenue: number }>;
}

export type CrewRoleId = 'cashier' | 'assembler' | 'fryer' | 'driver';

export type CareerJobId =
  | 'chef'
  | 'taxi'
  | 'delivery'
  | 'mechanic'
  | 'barista'
  | 'baker';

export type DistrictId =
  | 'hara'
  | 'market'
  | 'workshop'
  | 'corniche'
  | 'bakery'
  | 'residential';

export type OwnedVehicleId =
  | 'fiat_128'
  | 'tuktuk'
  | 'taxi_verna'
  | 'pickup'
  | 'delivery_moto'
  | 'sport_coupe';

export type ApartmentId =
  | 'apt_hara'
  | 'apt_schools'
  | 'apt_downtown'
  | 'apt_corniche';

export type CustomerArchetype =
  | 'rushed'
  | 'calm'
  | 'talkative'
  | 'haggler'
  | 'regular'
  | 'bulk';

export type WeatherType = 'sunny' | 'cloudy' | 'rainy';

export type DayPeriod = 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';

export type GraphicsQuality = 'ultra' | 'medium' | 'low';

export type CameraMode = 'first_person' | 'third_person' | 'wide_follow';

export type CarCameraMode = 'chase' | 'cockpit';

export type PlayerCharacterId = 'mohamed' | 'ahmed' | 'ali' | 'mahmoud';

export type RadioStationId = 'hamo_morshedy' | 'shaabi' | 'cairo_fm' | 'oud' | 'off';

export type PlayerLifeStage = 'single' | 'courting' | 'married' | 'parent';

export type RoleActionKind =
  | 'manage_shop'
  | 'serve_cashier'
  | 'cook_kitchen'
  | 'drive_delivery';

export interface OnlineRoomMember {
  clientId: string;
  characterId: PlayerCharacterId;
  roleId: CrewRoleId;
  displayNameAr: string;
  connected: boolean;
  zoneAr: string;
  streetAr?: string;
  inCar?: boolean;
  x?: number;
  z?: number;
}

export interface OnlinePlayerSlotState {
  characterId: PlayerCharacterId;
  nameAr: string;
  roleId: CrewRoleId;
  roleTitleAr: string;
  fixedDutyAr: string;
  shirtHex: string;
  connected: boolean;
  isSelf: boolean;
  displayNameAr: string;
  inCar: boolean;
  zoneAr: string;
  streetAr: string;
  x: number;
  z: number;
}

export type PlayerAnimSyncState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'talk'
  | 'work'
  | 'hold'
  | 'wave'
  | 'sit'
  | 'eat'
  | 'drive'
  | 'argue'
  | 'hold_hand';

export interface RemotePlayerPose {
  clientId: string;
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
  streetAr?: string;
}

export interface MultiplayerStatus {
  mode: 'solo' | 'connecting' | 'online' | 'error';
  roomId: string | null;
  inviteUrl: string | null;
  clientId: string | null;
  lockedCharacterId: PlayerCharacterId | null;
  members: OnlineRoomMember[];
  errorAr: string | null;
}

export interface PlayerCharacterDef {
  id: PlayerCharacterId;
  nameAr: string;
  roleId: CrewRoleId;
  roleTitleAr: string;
  fixedDutyAr: string;
  storyBioAr: string;
  shirtHex: string;
  shirtColor: number;
  pantsColor: number;
  skinColor: number;
  hasHoodie: boolean;
  hasMustache: boolean;
}

export interface VehicleCatalogItem {
  id: OwnedVehicleId;
  nameAr: string;
  subtitleAr: string;
  price: number;
  topSpeedKmh: number;
  bodyColor: number;
  accentHex: string;
  fuelEconomyMult: number;
  taxiBonusMult: number;
  charmBonus: number;
}

export interface ApartmentCatalogItem {
  id: ApartmentId;
  nameAr: string;
  districtId: DistrictId;
  streetAr: string;
  price: number;
  roomsAr: string;
  dailyMoraleBonus: number;
  charmBonus: number;
}

export interface RomanceNpcDef {
  id: string;
  nameAr: string;
  age: number;
  jobAr: string;
  personalityAr: string;
  districtId: DistrictId;
  homeX: number;
  homeZ: number;
  dressColor: number;
  hijabColor: number | null;
  skinColor: number;
  shirtHex: string;
  introLineAr: string;
}

export interface RomanceRuntimeState {
  id: string;
  affection: number; // 0..100
  moodAr: string;
  talkCount: number;
  married: boolean;
}

export interface ChildMember {
  id: string;
  nameAr: string;
  gender: 'boy' | 'girl';
  shirtColor: number;
  happiness: number;
}

export type FacialExpression = 'happy' | 'neutral' | 'talking' | 'angry' | 'surprised';

export type StreetEventType =
  | 'street_fight'
  | 'broken_car'
  | 'flash_sale'
  | 'vendor_rush'
  | 'wedding_feast';

export type TrafficSignalPhase = 'ns_green' | 'ns_yellow' | 'ew_green' | 'ew_yellow';

export interface MarketPriceForecast {
  multipliers: Record<IngredientId, number>;
  headlineAr: string;
  dealIngredientId: IngredientId;
  shortageIngredientId: IngredientId;
}

export interface ActiveStreetEvent {
  id: string;
  type: StreetEventType;
  titleAr: string;
  descriptionAr: string;
  streetAr: string;
  x: number;
  z: number;
  timeRemaining: number;
  maxTime: number;
  rewardMoney: number;
  rewardRep: number;
  shopId?: string;
  discountPct?: number;
  resolved: boolean;
}

export type FamilyActivityId =
  | 'sitting_tv'
  | 'cooking'
  | 'eating'
  | 'resting'
  | 'playing'
  | 'chatting';

export interface HouseholdMemberState {
  id: 'home-wife' | 'home-daughter' | 'home-son';
  nameAr: string;
  roleAr: string;
  activity: FamilyActivityId;
  roomAr: string;
  speechAr: string;
}

export interface DialogueChoice {
  id: string;
  labelAr: string;
  tone:
    | 'flirt_sweet'
    | 'flirt_bold'
    | 'joke'
    | 'respectful'
    | 'gift'
    | 'propose'
    | 'family'
    | 'ride'
    | 'praise'
    | 'complaint'
    | 'hospitality'
    | 'leave';
  cost?: number;
}

export interface ChatMessageEntry {
  id: string;
  senderAr: string;
  text: string;
  isPlayer: boolean;
  clockStr: string;
}

export interface ActiveDialogueSession {
  targetType:
    | 'romance'
    | 'worker'
    | 'pedestrian'
    | 'customer'
    | 'spouse'
    | 'child'
    | 'household_wife'
    | 'household_daughter'
    | 'household_son'
    | 'school_staff'
    | 'student'
    | 'crew_member'
    | 'world_object';
  targetId: string;
  objectKind?: WorldObjectChatKind;
  speakerNameAr: string;
  speakerRoleAr: string;
  npcLineAr: string;
  customerEmoji?: string;
  serviceQualityScore?: number;
  serviceQualityLabelAr?: string;
  moodTone?: 'happy' | 'neutral' | 'upset';
  affection?: number;
  married?: boolean;
  canPropose?: boolean;
  canHaveChild?: boolean;
  childWaitRemainingSec?: number;
  isAccompanying?: boolean;
  isHoldingHand?: boolean;
  chatLog?: ChatMessageEntry[];
  choices: DialogueChoice[];
}

export type WorldObjectChatKind =
  | 'ad_board'
  | 'car'
  | 'motorcycle'
  | 'fuel_pump'
  | 'ful_pot'
  | 'fryer'
  | 'school_gate'
  | 'classroom_board'
  | 'tree'
  | 'building'
  | 'felucca'
  | 'bench'
  | 'apartment_door';

export interface CharacterNeedsState {
  hunger: number; // 0..100 (100 = full)
  thirst: number; // 0..100 (100 = hydrated)
}

export interface ElectronicAdBoardState {
  active: boolean;
  headlineAr: string;
  promoTextAr: string;
  discountPct: number; // 0..50
  updatedAtClock: string;
}

export interface InstaPayTransferRecord {
  id: string;
  toCharacterId: PlayerCharacterId;
  toNameAr: string;
  fromNameAr: string;
  amount: number;
  noteAr: string;
  clockStr: string;
  day: number;
}

export interface InventoryAuditRecord {
  id: string;
  clockStr: string;
  day: number;
  auditorNameAr: string;
  totalUnits: number;
  lowStockCount: number;
  estimatedValue: number;
  consumedToday: Record<IngredientId, number>;
}

export type OwnableBuildingId =
  | 'bld_moalem_tower'
  | 'bld_corniche_plaza'
  | 'bld_market_arcade'
  | 'bld_station_court'
  | 'bld_benha_heights';

export interface OwnableBuildingDef {
  id: OwnableBuildingId;
  nameAr: string;
  districtId: DistrictId;
  streetAr: string;
  x: number;
  z: number;
  floors: number;
  price: number;
  dailyRentIncome: number;
  colorHex: number;
}

export type RestaurantBranchId =
  | 'branch_corniche'
  | 'branch_school'
  | 'branch_market';

export interface RestaurantBranchDef {
  id: RestaurantBranchId;
  nameAr: string;
  streetAr: string;
  districtId: DistrictId;
  x: number;
  z: number;
  facingYaw: number;
  price: number;
  dailyProfit: number;
}

export interface EditableProfileEntry {
  nameAr: string;
  roleTitleAr: string;
}

export interface CustomProfilesMap {
  ahmed: EditableProfileEntry;
  ali: EditableProfileEntry;
  mahmoud: EditableProfileEntry;
  spouseNameAr: string;
  sonNameAr: string;
  daughterNameAr: string;
}

export interface SchoolEnrollmentState {
  schoolNameAr: string;
  sonEnrolled: boolean;
  daughterEnrolled: boolean;
  sonGradeAr: string;
  daughterGradeAr: string;
  enrolledDay: number | null;
}

export interface AccompanyingPersonHud {
  id: string;
  nameAr: string;
  roleAr: string;
  holdingHand: boolean;
  seatZone: 'walking' | 'cab' | 'flatbed';
}

export interface DensitySettings {
  pedestrianDensity: number; // 0..100
  trafficDensity: number; // 0..100
  propDensity: number; // 0..100
}

export interface StreetSegmentDef {
  id: string;
  index: number; // 1..98
  nameAr: string;
  districtId: DistrictId;
  axis: 'ns' | 'ew';
  centerX: number;
  centerZ: number;
  length: number;
  width: number;
  vibeAr: string;
}

export interface CityShopGood {
  id: string;
  labelAr: string;
  cost: number;
  ingredientId?: IngredientId;
  packQty?: number;
  fuelBoost?: number;
  reputationBoost?: number;
}

export interface CityShopDef {
  id: string;
  nameAr: string;
  categoryAr: string;
  districtId: DistrictId;
  streetNameAr: string;
  ownerNameAr: string;
  ownerGreetingAr: string;
  workerNameAr: string;
  workerRoleAr: string;
  workerLineAr: string;
  x: number;
  z: number;
  facingYaw: number;
  signColorHex: string;
  glowHex: number;
  facadeColor: number;
  purchasePrice: number;
  dailyRevenue: number;
  goods: CityShopGood[];
}

export interface CityShopRuntimeState {
  id: string;
  owned: boolean;
  hasManager: boolean;
  accumulatedProfit: number;
}

export interface ActiveTaxiMission {
  passengerName: string;
  pickupStreetAr: string;
  dropoffStreetAr: string;
  pickupX: number;
  pickupZ: number;
  dropoffX: number;
  dropoffZ: number;
  pickedUp: boolean;
  fare: number;
  timer: number;
}

export interface ActiveRepairMission {
  id: string;
  vehicleNameAr: string;
  issueAr: string;
  reward: number;
  x: number;
  z: number;
  progress: number;
}

export interface CustomerBubbleHud {
  customerName: string;
  emoji: string;
  moodLabelAr: string;
  tone: 'happy' | 'neutral' | 'upset';
  text: string;
  screenX: number;
  screenY: number;
  visible: boolean;
}

export interface RecipeDefinition {
  id: RecipeId;
  nameAr: string;
  requiredIngredients: IngredientId[];
  basePrice: number;
  prepSeconds: number;
}

export interface IngredientDefinition {
  id: IngredientId;
  nameAr: string;
  unitCost: number;
  packSize: number;
  lowThreshold: number;
  colorHex: string;
}

export interface CustomerOrder {
  id: string;
  customerName: string;
  archetype: CustomerArchetype;
  recipeId: RecipeId;
  quantity: number;
  deliveredCount: number;
  patience: number;
  maxPatience: number;
  dialogueAr: string;
  isDelivery: boolean;
  deliveryTargetName?: string;
  deliveryX?: number;
  deliveryZ?: number;
  offeredTip: number;
}

export type EgyptianSeasonId = 'normal' | 'ramadan' | 'match_day' | 'eid_feast';

export interface EgyptianSeasonDef {
  id: EgyptianSeasonId;
  nameAr: string;
  subtitleAr: string;
  badgeColorHex: string;
  customerRushMultiplier: number;
  tipMultiplier: number;
  specialDrinkAr: string;
}

export interface DeliveryOrderItem {
  id: string;
  customerNameAr: string;
  streetNameAr: string;
  districtNameAr: string;
  targetX: number;
  targetZ: number;
  itemsLabelAr: string;
  payout: number;
  motoTipBonus: number;
  remainingSec: number;
  totalSec: number;
  status: 'available' | 'active' | 'delivered' | 'expired';
}

export type WholesaleContractId = 'bakery_baladi' | 'ful_farm' | 'oil_refinery';

export interface WholesaleContractDef {
  id: WholesaleContractId;
  nameAr: string;
  subtitleAr: string;
  price: number;
  discountPct: number;
  dailyAutoUnits: Partial<Record<IngredientId, number>>;
}

export interface InspectionRecord {
  id: string;
  clockStr: string;
  day: number;
  passed: boolean;
  hygieneScore: number;
  summaryAr: string;
  moneyDelta: number;
  reputationDelta: number;
}

export type FurnitureItemId =
  | 'damietta_salon'
  | 'smart_tv_65'
  | 'alumetal_kitchen'
  | 'kids_modern_room';

export interface FurnitureCatalogItem {
  id: FurnitureItemId;
  nameAr: string;
  subtitleAr: string;
  price: number;
  comfortBonus: number;
}

export interface SchoolReportCardState {
  sonScore: number;
  daughterScore: number;
  sonGradeNoteAr: string;
  daughterGradeNoteAr: string;
  ceremoniesAttended: number;
  lastCeremonyDay: number | null;
}

export interface CrewChallengeScore {
  characterId: PlayerCharacterId;
  ordersCooked: number;
  cashierSales: number;
  deliveriesCompleted: number;
  points: number;
}

export interface CoopChatMessage {
  id: string;
  clientId: string;
  characterId: PlayerCharacterId;
  senderNameAr: string;
  text: string;
  clockStr: string;
  timestamp: number;
}

export interface InventoryState {
  bread: number;
  ful: number;
  taameya: number;
  salad: number;
  tahina: number;
  pickles: number;
  fries: number;
}

export interface ShopUpgrades {
  fryerLevel: number;
  fulPotLevel: number;
  decorLevel: number;
  carEngineLevel: number;
}

export interface DailyStats {
  day: number;
  revenue: number;
  expenses: number;
  ordersServed: number;
  ordersMissed: number;
  deliveriesCompleted: number;
  tipsEarned: number;
  taxiTrips: number;
  repairsDone: number;
  sideJobIncome: number;
  shopDividends: number;
}

export interface InteractableHint {
  id: string;
  actionType:
    | 'toggle_shop'
    | 'toggle_lights'
    | 'toggle_door'
    | 'pick_bread'
    | 'add_ful'
    | 'add_taameya'
    | 'add_salad'
    | 'add_tahina'
    | 'add_pickles'
    | 'add_fries'
    | 'serve_customer'
    | 'discard_sandwich'
    | 'enter_car'
    | 'refuel_car'
    | 'open_market'
    | 'home_sleep'
    | 'home_tv'
    | 'home_sofa'
    | 'home_eat'
    | 'home_drink'
    | 'home_kitchen'
    | 'deliver_order'
    | 'talk_shop_owner'
    | 'talk_person'
    | 'talk_object'
    | 'school_enroll'
    | 'mediate_fight'
    | 'fix_broken_car'
    | 'encourage_vendor'
    | 'serve_wedding_feast'
    | 'taxi_action'
    | 'mechanic_repair'
    | 'bakery_bake'
    | 'ahwa_serve'
    | 'open_cashier';
  labelAr: string;
  subLabelAr?: string;
  keyHint: string;
  shopId?: string;
  doorId?: string;
  personId?: string;
  objectKind?: WorldObjectChatKind;
  objectId?: string;
  personKind?:
    | 'romance'
    | 'worker'
    | 'pedestrian'
    | 'customer'
    | 'spouse'
    | 'child'
    | 'household_wife'
    | 'household_daughter'
    | 'household_son'
    | 'school_staff'
    | 'student'
    | 'crew_member';
}

export interface HudSnapshot {
  phase: GamePhase;
  selectedCharacterId: PlayerCharacterId;
  money: number;
  reputation: number;
  day: number;
  timeOfDay: number;
  dayPeriod: DayPeriod;
  weather: WeatherType;
  shopOpen: boolean;
  shopLightsOn: boolean;
  heldIngredients: IngredientId[];
  heldReadyPack: RecipeId | null;
  orders: CustomerOrder[];
  inventory: InventoryState;
  prices: Record<RecipeId, number>;
  upgrades: ShopUpgrades;
  inCar: boolean;
  carSpeedKmh: number;
  carGearLabel: string;
  carFuel: number;
  carCondition: number;
  carHeadlightsOn: boolean;
  carLeftBlinker: boolean;
  carRightBlinker: boolean;
  radioStation: RadioStationId;
  hamoTrackIndex: number;
  musicPaused: boolean;
  activeVehicleId: OwnedVehicleId;
  ownedVehicleIds: OwnedVehicleId[];
  ownedApartmentIds: ApartmentId[];
  activeApartmentId: ApartmentId | null;
  spouseId: string | null;
  spouseNameAr: string | null;
  marriedDay: number | null;
  marriageElapsedSec: number;
  lifeStage: PlayerLifeStage;
  lifeStageLabelAr: string;
  childEligible: boolean;
  childWaitRemainingSec: number;
  children: ChildMember[];
  romanceStates: RomanceRuntimeState[];
  activeDialogue: ActiveDialogueSession | null;
  activeRole: CrewRoleId;
  roleLocked: boolean;
  activeJob: CareerJobId;
  activeTaxi: ActiveTaxiMission | null;
  activeRepair: ActiveRepairMission | null;
  activeStreetEvent: ActiveStreetEvent | null;
  householdFamily: HouseholdMemberState[];
  companionNameAr: string | null;
  companionCornicheDone: boolean;
  trafficSignal: TrafficSignalPhase;
  trafficFines: number;
  goldenSizzleActive: boolean;
  marketForecast: MarketPriceForecast;
  cityShops: CityShopRuntimeState[];
  activeShopOwnerId: string | null;
  density: DensitySettings;
  activePedestrianCount: number;
  activeTrafficCount: number;
  cameraMode: CameraMode;
  carCameraMode: CarCameraMode;
  activeHint: InteractableHint | null;
  customerBubble: CustomerBubbleHud | null;
  toastMessage: string | null;
  dailyStats: DailyStats;
  fpsEstimate: number;
  quality: GraphicsQuality;
  adaptiveQuality: boolean;
  playerZoneAr: string;
  currentStreetAr: string;
  currentDistrictAr: string;
  playerPos: { x: number; z: number };
  playerYaw: number;
  carPos: { x: number; z: number };
  multiplayer: MultiplayerStatus;
  crewSlots: OnlinePlayerSlotState[];
  remotePlayersCount: number;
  extraPrices: Record<PosExtraItemId, number>;
  cashierSettings: CashierControllerSettings;
  cashierReceipts: PosReceipt[];
  nextInvoiceSeq: number;
  cashierSummary: CashierAccountingSummary;
  customerInquiries: CustomerInquiry[];
  vipMembers: VipMember[];
  kitchenTickets: KitchenTicket[];
  shiftSettlements: ShiftSettlementRecord[];
  shiftSettlementPreview: ShiftSettlementPreview;
  canControlPricesAndSettings: boolean;
  canManageCity: boolean;
  canOperateCashier: boolean;
  canControlKitchen: boolean;
  // Expansion v2 Systems
  ownerUnlocked: boolean;
  playerNeeds: CharacterNeedsState;
  crewNeeds: Record<PlayerCharacterId, CharacterNeedsState>;
  adBoard: ElectronicAdBoardState;
  employeeWallets: Record<PlayerCharacterId, number>;
  instaPayTransfers: InstaPayTransferRecord[];
  latestInstaPayToast: string | null;
  inventoryConsumedToday: Record<IngredientId, number>;
  inventoryAuditLogs: InventoryAuditRecord[];
  ownedBuildingIds: OwnableBuildingId[];
  restaurantFloors: number;
  ownedBranchIds: RestaurantBranchId[];
  vehicleLockedByOwner: boolean;
  customProfiles: CustomProfilesMap;
  schoolEnrollment: SchoolEnrollmentState;
  accompanyingList: AccompanyingPersonHud[];
  holdingSonHand: boolean;
  cabSeatCount: number;
  flatbedSeatCount: number;
  // Expansion v3 Systems
  activeSeasonId: EgyptianSeasonId;
  deliveryOrders: DeliveryOrderItem[];
  activeDeliveryOrder: DeliveryOrderItem | null;
  wholesaleContracts: WholesaleContractId[];
  hygieneScore: number;
  qualityBadgeEarned: boolean;
  inspectionLogs: InspectionRecord[];
  ownedFurnitureIds: FurnitureItemId[];
  cornicheVillaOwned: boolean;
  schoolReport: SchoolReportCardState;
  crewLeaderboard: Record<PlayerCharacterId, CrewChallengeScore>;
  coopChatMessages: CoopChatMessage[];
}

export interface AABB2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  active?: boolean;
}

export interface SavePayload {
  version: number;
  selectedCharacterId: PlayerCharacterId;
  money: number;
  reputation: number;
  day: number;
  inventory: InventoryState;
  prices: Record<RecipeId, number>;
  extraPrices?: Record<PosExtraItemId, number>;
  cashierSettings?: CashierControllerSettings;
  cashierReceipts?: PosReceipt[];
  nextInvoiceSeq?: number;
  vipMembers?: VipMember[];
  kitchenTickets?: KitchenTicket[];
  shiftSettlements?: ShiftSettlementRecord[];
  upgrades: ShopUpgrades;
  carFuel: number;
  carCondition: number;
  activeVehicleId: OwnedVehicleId;
  ownedVehicleIds: OwnedVehicleId[];
  ownedApartmentIds: ApartmentId[];
  activeApartmentId: ApartmentId | null;
  spouseId: string | null;
  marriedDay?: number | null;
  marriageElapsedSec?: number;
  children: ChildMember[];
  romanceStates: RomanceRuntimeState[];
  activeRole: CrewRoleId;
  activeJob: CareerJobId;
  cityShops: CityShopRuntimeState[];
  density: DensitySettings;
  radioStation: RadioStationId;
  quality: GraphicsQuality;
  adaptiveQuality: boolean;
  // Expansion v2 Saved Fields
  ownerUnlocked?: boolean;
  playerNeeds?: CharacterNeedsState;
  crewNeeds?: Record<PlayerCharacterId, CharacterNeedsState>;
  adBoard?: ElectronicAdBoardState;
  employeeWallets?: Record<PlayerCharacterId, number>;
  instaPayTransfers?: InstaPayTransferRecord[];
  inventoryConsumedToday?: Record<IngredientId, number>;
  inventoryAuditLogs?: InventoryAuditRecord[];
  ownedBuildingIds?: OwnableBuildingId[];
  restaurantFloors?: number;
  ownedBranchIds?: RestaurantBranchId[];
  vehicleLockedByOwner?: boolean;
  customProfiles?: CustomProfilesMap;
  schoolEnrollment?: SchoolEnrollmentState;
  // Expansion v3 Saved Fields
  activeSeasonId?: EgyptianSeasonId;
  wholesaleContracts?: WholesaleContractId[];
  hygieneScore?: number;
  qualityBadgeEarned?: boolean;
  inspectionLogs?: InspectionRecord[];
  ownedFurnitureIds?: FurnitureItemId[];
  cornicheVillaOwned?: boolean;
  schoolReport?: SchoolReportCardState;
  crewLeaderboard?: Record<PlayerCharacterId, CrewChallengeScore>;
}
