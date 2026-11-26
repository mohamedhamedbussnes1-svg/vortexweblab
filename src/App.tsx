/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CashierModalTab, CashierPosModal } from './components/CashierPosModal';
import { GameHud } from './components/GameHud';
import { DaySummaryModal, PauseModal } from './components/GameModals';
import { IntroSplash } from './components/IntroSplash';
import { MobilePhoneModal, PhoneAppId } from './components/MobilePhoneModal';
import { ShopManagementDrawer } from './components/ShopManagementDrawer';
import { TitleScreen } from './components/TitleScreen';
import {
  computeAccountingSummary,
  computeShiftSettlementPreview,
  createDefaultCashierSettings,
  createInitialExtraPrices,
  createInitialVipMembers,
} from './game/cashier';
import { ElmoalemEngine } from './game/engine';
import {
  createDefaultSchoolReportCard,
  createInitialCrewLeaderboard,
  generateDeliveryDispatchBatch,
} from './game/expansionSystems';
import {
  buildInviteUrl,
  fetchRoomLobbyInfo,
  RoomLobbyInfo,
} from './game/multiplayer';
import {
  buildCrewSlotsSnapshot,
  createInitialSave,
  LIFE_STAGE_LABELS_AR,
} from './game/rules';
import {
  createDefaultAdBoard,
  createDefaultCustomProfiles,
  createDefaultSchoolEnrollment,
  createEmptyConsumedMap,
  createInitialCharacterNeeds,
  createInitialCrewNeeds,
  createInitialEmployeeWallets,
} from './game/phoneOs';
import { HudSnapshot, PlayerCharacterId } from './game/types';
import { createDefaultMarketForecast } from './game/worldSystems';

function makeInitialHud(): HudSnapshot {
  const save = createInitialSave();
  return {
    phase: 'title',
    selectedCharacterId: save.selectedCharacterId,
    money: save.money,
    reputation: save.reputation,
    day: save.day,
    timeOfDay: 0.32,
    dayPeriod: 'morning',
    weather: 'sunny',
    shopOpen: false,
    shopLightsOn: true,
    heldIngredients: [],
    heldReadyPack: null,
    orders: [],
    inventory: save.inventory,
    prices: save.prices,
    upgrades: save.upgrades,
    inCar: false,
    carSpeedKmh: 0,
    carGearLabel: 'N',
    carFuel: save.carFuel,
    carCondition: save.carCondition,
    carHeadlightsOn: false,
    carLeftBlinker: false,
    carRightBlinker: false,
    radioStation: save.radioStation,
    hamoTrackIndex: 0,
    musicPaused: false,
    activeVehicleId: save.activeVehicleId,
    ownedVehicleIds: save.ownedVehicleIds,
    ownedApartmentIds: save.ownedApartmentIds,
    activeApartmentId: save.activeApartmentId,
    spouseId: save.spouseId,
    spouseNameAr: null,
    marriedDay: save.marriedDay ?? null,
    marriageElapsedSec: save.marriageElapsedSec ?? 0,
    lifeStage: 'single',
    lifeStageLabelAr: LIFE_STAGE_LABELS_AR.single,
    childEligible: false,
    childWaitRemainingSec: 0,
    children: save.children,
    romanceStates: save.romanceStates,
    activeDialogue: null,
    activeRole: save.activeRole,
    roleLocked: false,
    activeJob: save.activeJob,
    activeTaxi: null,
    activeRepair: null,
    activeStreetEvent: null,
    householdFamily: [],
    companionNameAr: null,
    companionCornicheDone: false,
    trafficSignal: 'ns_green',
    trafficFines: 0,
    goldenSizzleActive: false,
    marketForecast: createDefaultMarketForecast(),
    cityShops: save.cityShops,
    activeShopOwnerId: null,
    density: save.density,
    activePedestrianCount: 0,
    activeTrafficCount: 0,
    activeHint: null,
    customerBubble: null,
    toastMessage: null,
    dailyStats: {
      day: save.day,
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
    },
    fpsEstimate: 60,
    quality: save.quality,
    adaptiveQuality: save.adaptiveQuality,
    cameraMode: 'first_person',
    carCameraMode: 'chase',
    playerZoneAr: 'الحارة المصرية',
    currentStreetAr: 'شارع المعلم الرئيسي',
    currentDistrictAr: 'حارة المعلم الشعبية',
    playerPos: { x: -4.2, z: 1.4 },
    playerYaw: Math.PI / 2,
    carPos: { x: -3.6, z: 5.6 },
    multiplayer: {
      mode: 'solo',
      roomId: null,
      inviteUrl: null,
      clientId: null,
      lockedCharacterId: null,
      members: [],
      errorAr: null,
    },
    crewSlots: buildCrewSlotsSnapshot({
      selfCharacterId: save.selectedCharacterId,
      selfPos: { x: -4.2, z: 1.4 },
      selfZoneAr: 'الحارة المصرية',
      selfStreetAr: 'شارع المعلم الرئيسي',
      selfInCar: false,
      onlineMode: false,
      members: [],
      remotePoses: [],
    }),
    remotePlayersCount: 0,
    extraPrices: save.extraPrices ?? createInitialExtraPrices(),
    cashierSettings: save.cashierSettings ?? createDefaultCashierSettings(),
    cashierReceipts: save.cashierReceipts ?? [],
    nextInvoiceSeq: save.nextInvoiceSeq ?? 1,
    cashierSummary: computeAccountingSummary(
      save.cashierReceipts ?? [],
      save.cashierSettings ?? createDefaultCashierSettings(),
    ),
    customerInquiries: [],
    vipMembers: save.vipMembers ?? createInitialVipMembers(),
    kitchenTickets: save.kitchenTickets ?? [],
    shiftSettlements: save.shiftSettlements ?? [],
    shiftSettlementPreview: computeShiftSettlementPreview({
      day: save.day,
      summary: computeAccountingSummary(
        save.cashierReceipts ?? [],
        save.cashierSettings ?? createDefaultCashierSettings(),
      ),
      dailyStats: {
        day: save.day,
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
      },
    }),
    canControlPricesAndSettings: true,
    canManageCity: save.selectedCharacterId === 'mohamed',
    canOperateCashier: true,
    canControlKitchen: true,
    ownerUnlocked: save.ownerUnlocked ?? false,
    playerNeeds: save.playerNeeds ?? createInitialCharacterNeeds(),
    crewNeeds: save.crewNeeds ?? createInitialCrewNeeds(),
    adBoard: save.adBoard ?? createDefaultAdBoard(),
    employeeWallets: save.employeeWallets ?? createInitialEmployeeWallets(),
    instaPayTransfers: save.instaPayTransfers ?? [],
    latestInstaPayToast: null,
    inventoryConsumedToday: save.inventoryConsumedToday ?? createEmptyConsumedMap(),
    inventoryAuditLogs: save.inventoryAuditLogs ?? [],
    ownedBuildingIds: save.ownedBuildingIds ?? [],
    restaurantFloors: save.restaurantFloors ?? 1,
    ownedBranchIds: save.ownedBranchIds ?? [],
    vehicleLockedByOwner: save.vehicleLockedByOwner ?? false,
    customProfiles: save.customProfiles ?? createDefaultCustomProfiles(),
    schoolEnrollment: save.schoolEnrollment ?? createDefaultSchoolEnrollment(),
    accompanyingList: [],
    holdingSonHand: false,
    cabSeatCount: 0,
    flatbedSeatCount: 0,
    activeSeasonId: save.activeSeasonId ?? 'normal',
    deliveryOrders: generateDeliveryDispatchBatch(3, 1),
    activeDeliveryOrder: null,
    wholesaleContracts: save.wholesaleContracts ?? [],
    hygieneScore: save.hygieneScore ?? 92,
    qualityBadgeEarned: save.qualityBadgeEarned ?? false,
    inspectionLogs: save.inspectionLogs ?? [],
    ownedFurnitureIds: save.ownedFurnitureIds ?? [],
    cornicheVillaOwned: save.cornicheVillaOwned ?? false,
    schoolReport: save.schoolReport ?? createDefaultSchoolReportCard(),
    crewLeaderboard: save.crewLeaderboard ?? createInitialCrewLeaderboard(),
    coopChatMessages: [],
  };
}

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<ElmoalemEngine | null>(null);

  const [hud, setHud] = useState<HudSnapshot>(() => makeInitialHud());
  const [introDone, setIntroDone] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneInitialApp, setPhoneInitialApp] = useState<PhoneAppId>('home');
  const [cashierOpen, setCashierOpen] = useState(false);
  const [cashierInitialTab, setCashierInitialTab] = useState<CashierModalTab>('pos');
  const [muted, setMuted] = useState(false);
  const [touchControls, setTouchControls] = useState(() =>
    typeof window !== 'undefined'
      ? 'ontouchstart' in window && window.innerWidth < 1024
      : false,
  );
  const [webglLost, setWebglLost] = useState(false);
  const [initialRoomCode] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const raw = new URLSearchParams(window.location.search).get('room') ?? '';
    return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  });
  const [lobbyInfo, setLobbyInfo] = useState<RoomLobbyInfo | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const refreshRoomLobby = useCallback(async (roomId: string) => {
    const info = await fetchRoomLobbyInfo(roomId);
    setLobbyInfo(info);
    return info;
  }, []);

  useEffect(() => {
    if (initialRoomCode.length >= 4) {
      void refreshRoomLobby(initialRoomCode);
    }
  }, [initialRoomCode, refreshRoomLobby]);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const engine = new ElmoalemEngine(mount, (snapshot) => {
      setHud(snapshot);
    });
    engineRef.current = engine;

    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      engine.startGame();
    }

    const canvas = mount.querySelector('canvas');
    const onLost = (e: Event) => {
      e.preventDefault();
      setWebglLost(true);
    };
    const onRestored = () => setWebglLost(false);
    canvas?.addEventListener('webglcontextlost', onLost);
    canvas?.addEventListener('webglcontextrestored', onRestored);

    const onOpenMarket = () => {
      document.exitPointerLock?.();
      if (engineRef.current && !engineRef.current.getSnapshot().canManageCity) {
        engineRef.current.notifyCityManagementLocked();
        return;
      }
      setPhoneOpen(false);
      setCashierOpen(false);
      setManagementOpen(true);
    };
    const onTogglePhone = () => {
      document.exitPointerLock?.();
      setManagementOpen(false);
      setCashierOpen(false);
      setPhoneInitialApp('home');
      setPhoneOpen((prev) => !prev);
    };
    const onToggleCashier = () => {
      document.exitPointerLock?.();
      setManagementOpen(false);
      setPhoneOpen(false);
      setCashierInitialTab('pos');
      setCashierOpen((prev) => !prev);
    };
    const onCloseModals = () => {
      setPhoneOpen(false);
      setManagementOpen(false);
      setCashierOpen(false);
    };
    window.addEventListener('elmoalem:open-market', onOpenMarket);
    window.addEventListener('elmoalem:toggle-phone', onTogglePhone);
    window.addEventListener('elmoalem:toggle-cashier', onToggleCashier);
    window.addEventListener('elmoalem:close-modals', onCloseModals);

    return () => {
      window.removeEventListener('elmoalem:open-market', onOpenMarket);
      window.removeEventListener('elmoalem:toggle-phone', onTogglePhone);
      window.removeEventListener('elmoalem:toggle-cashier', onToggleCashier);
      window.removeEventListener('elmoalem:close-modals', onCloseModals);
      canvas?.removeEventListener('webglcontextlost', onLost);
      canvas?.removeEventListener('webglcontextrestored', onRestored);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setPhoneModalOpen(phoneOpen || managementOpen || cashierOpen);
  }, [phoneOpen, managementOpen, cashierOpen]);

  useEffect(() => {
    if (!hud.canManageCity && managementOpen) {
      setManagementOpen(false);
    }
  }, [hud.canManageCity, managementOpen]);

  useEffect(() => {
    const onTabKey = (e: KeyboardEvent) => {
      if (e.code === 'Tab' && hud.phase === 'playing') {
        e.preventDefault();
        document.exitPointerLock?.();
        if (!hud.canManageCity) {
          engineRef.current?.notifyCityManagementLocked();
          return;
        }
        setPhoneOpen(false);
        setCashierOpen(false);
        setManagementOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onTabKey);
    return () => window.removeEventListener('keydown', onTabKey);
  }, [hud.phase, hud.canManageCity]);

  const handleCopyInviteLink = useCallback(async (roomId?: string | null) => {
    const targetRoom = roomId || hud.multiplayer.roomId;
    if (!targetRoom) return;
    const url = buildInviteUrl(targetRoom);
    try {
      await navigator.clipboard?.writeText(url);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2600);
    } catch {
      setInviteCopied(false);
    }
  }, [hud.multiplayer.roomId]);

  const handleCreateRoom = useCallback(
    async (characterId: PlayerCharacterId, displayNameAr?: string) => {
      if (!engineRef.current) return null;
      const roomId = await engineRef.current.createAndJoinOnlineRoom(
        characterId,
        displayNameAr,
      );
      if (roomId && typeof window !== 'undefined') {
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('room', roomId);
        window.history.replaceState({}, '', nextUrl.toString());
        await refreshRoomLobby(roomId);
      }
      return roomId;
    },
    [refreshRoomLobby],
  );

  const handleJoinRoom = useCallback(
    (roomId: string, characterId: PlayerCharacterId, displayNameAr?: string) => {
      if (!engineRef.current) return;
      engineRef.current.joinOnlineRoom(roomId, characterId, displayNameAr);
      if (typeof window !== 'undefined') {
        const cleaned = roomId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (cleaned.length >= 4) {
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.set('room', cleaned);
          window.history.replaceState({}, '', nextUrl.toString());
        }
      }
    },
    [],
  );

  const handleLeaveRoom = useCallback(() => {
    engineRef.current?.leaveOnlineRoom();
    if (typeof window !== 'undefined') {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete('room');
      window.history.replaceState({}, '', nextUrl.toString());
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#16120e]">
      {/* Isolated WebGL Viewport Container */}
      <div
        ref={canvasMountRef}
        data-testid="game-canvas-mount"
        className="fixed inset-0 w-full h-full"
      />

      {webglLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16120e] text-amber-200 p-6 text-center">
          <div>
            <h2 className="font-display text-2xl font-bold mb-2">
              تعذر تشغيل العرض ثلاثي الأبعاد
            </h2>
            <p className="text-sm text-stone-400">
              يرجى إعادة تحميل الصفحة لاستعادة سياق WebGL.
            </p>
          </div>
        </div>
      )}

      {/* VORTEXweblab Cinematic Intro Splash */}
      {!introDone && (
        <IntroSplash onComplete={() => setIntroDone(true)} />
      )}

      {/* Title Screen */}
      {hud.phase === 'title' && (
        <TitleScreen
          day={hud.day}
          money={hud.money}
          reputation={hud.reputation}
          selectedCharacterId={hud.selectedCharacterId}
          ownerUnlocked={hud.ownerUnlocked}
          customProfiles={hud.customProfiles}
          multiplayer={hud.multiplayer}
          initialRoomCode={initialRoomCode}
          lobbyInfo={lobbyInfo}
          inviteCopied={inviteCopied}
          onSelectCharacter={(id) => engineRef.current?.selectCharacter(id)}
          onVerifyOwnerPin={(pin) =>
            engineRef.current?.verifyAndUnlockOwner(pin) ?? Promise.resolve(false)
          }
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onLeaveRoom={handleLeaveRoom}
          onRefreshRoom={refreshRoomLobby}
          onCopyInviteLink={() => handleCopyInviteLink()}
          onStart={() => engineRef.current?.startGame()}
        />
      )}

      {/* Playing HUD */}
      {hud.phase === 'playing' && (
        <GameHud
          hud={hud}
          muted={muted}
          inviteCopied={inviteCopied}
          touchControlsEnabled={touchControls}
          onCopyInviteLink={() => handleCopyInviteLink()}
          onToggleMute={() => {
            if (!engineRef.current) return;
            setMuted(engineRef.current.sound.toggleMute());
          }}
          onToggleTouchControls={() => setTouchControls((v) => !v)}
          onPause={() => {
            setManagementOpen(false);
            setPhoneOpen(false);
            setCashierOpen(false);
            engineRef.current?.pauseGame();
          }}
          onOpenCashier={(tab) => {
            document.exitPointerLock?.();
            setManagementOpen(false);
            setPhoneOpen(false);
            setCashierInitialTab(tab ?? 'pos');
            setCashierOpen(true);
          }}
          onOpenManagement={() => {
            document.exitPointerLock?.();
            if (!hud.canManageCity) {
              engineRef.current?.notifyCityManagementLocked();
              return;
            }
            setPhoneOpen(false);
            setCashierOpen(false);
            setManagementOpen(true);
          }}
          onOpenPhone={() => {
            document.exitPointerLock?.();
            setManagementOpen(false);
            setCashierOpen(false);
            setPhoneInitialApp('home');
            setPhoneOpen(true);
          }}
          onOpenDeliveryPhone={() => {
            document.exitPointerLock?.();
            setManagementOpen(false);
            setCashierOpen(false);
            setPhoneInitialApp('delivery');
            setPhoneOpen(true);
          }}
          onSendCoopChat={(text) => engineRef.current?.sendCoopChatMessage(text)}
          onCycleCamera={() => engineRef.current?.cycleCamera()}
          onInteract={() => engineRef.current?.triggerInteract()}
          onToggleCar={() => engineRef.current?.toggleCarMode()}
          onToggleHeadlights={() => engineRef.current?.toggleCarHeadlights()}
          onCycleRadio={() => engineRef.current?.cycleRadioStation()}
          onToggleMusicPause={() => engineRef.current?.toggleMusicPaused()}
          onNextHamoTrack={() => engineRef.current?.nextHamoTrack()}
          onPrevHamoTrack={() => engineRef.current?.prevHamoTrack()}
          onSelectHamoTrack={(idx) => engineRef.current?.setHamoTrack(idx)}
          onSelectRadioStation={(st) => engineRef.current?.setRadioStation(st)}
          onToggleYoutubeStream={(active) =>
            engineRef.current?.setYoutubeMusicActive(active)
          }
          onToggleBlinker={(side) => engineRef.current?.toggleCarBlinker(side)}
          onEatFood={() => engineRef.current?.eatFood()}
          onDrinkWater={() => engineRef.current?.drinkWater()}
          onCloseShopOwner={() => engineRef.current?.closeShopOwnerModal()}
          onBuyFromShopOwner={(shopId, goodId) =>
            engineRef.current?.buyFromShopOwner(shopId, goodId)
          }
          onBuyCityShop={(shopId) => engineRef.current?.buyCityShopById(shopId)}
          onHireShopManager={(shopId) =>
            engineRef.current?.hireCityShopManager(shopId)
          }
          onSelectDialogueChoice={(choiceId) =>
            engineRef.current?.selectDialogueChoice(choiceId)
          }
          onSendDialogueKeyboardMessage={(text) =>
            engineRef.current?.sendDialogueKeyboardMessage(text)
          }
          onToggleAccompany={(holdHand) =>
            engineRef.current?.toggleAccompanyFromCurrentDialogue(Boolean(holdHand))
          }
          onBoardCarWithCompanions={() =>
            engineRef.current?.boardVehicleWithCompanions()
          }
          onCloseDialogue={() => engineRef.current?.closeDialogue()}
          onMobileMove={(x, y) => engineRef.current?.setMobileMove(x, y)}
          onTouchLookDelta={(dx, dy) =>
            engineRef.current?.applyTouchLookDelta(dx, dy)
          }
          onMobileSprint={(active) => engineRef.current?.setMobileSprint(active)}
        />
      )}

      {/* Market, Prices, City Shops, Vehicles, Apartments & Family, Jobs, Crew & 98-Street Map Drawer */}
      {hud.phase === 'playing' && managementOpen && (
        <ShopManagementDrawer
          hud={hud}
          onClose={() => setManagementOpen(false)}
          onBuyIngredient={(id) => engineRef.current?.buyIngredientPack(id)}
          onSetPrice={(id, p) => engineRef.current?.setRecipePrice(id, p)}
          onSetExtraPrice={(id, p) => engineRef.current?.setExtraItemPrice(id, p)}
          onOpenCashier={() => setCashierOpen(true)}
          onBuyUpgrade={(k) => engineRef.current?.buyUpgrade(k)}
          onSelectRole={(r) => engineRef.current?.setCrewRole(r)}
          onSelectJob={(jobId) => engineRef.current?.setCareerJob(jobId)}
          onBuyCityShop={(shopId) => engineRef.current?.buyCityShopById(shopId)}
          onHireShopManager={(shopId) =>
            engineRef.current?.hireCityShopManager(shopId)
          }
          onCollectShopProfits={() =>
            engineRef.current?.collectShopDividends()
          }
          onBuyVehicle={(vid) => engineRef.current?.buyVehicleById(vid)}
          onSelectVehicle={(vid) => engineRef.current?.selectActiveVehicle(vid)}
          onBuyApartment={(aid) => engineRef.current?.buyApartmentById(aid)}
          onSelectApartment={(aid) => engineRef.current?.selectActiveApartment(aid)}
          onMarryGirl={(gid) => engineRef.current?.marryRomanceNpcById(gid)}
          onHaveChild={() => engineRef.current?.haveFamilyChild()}
        />
      )}

      {/* Full Cashier POS, KDS, VIP, Accounting & El-Moalem Master Control */}
      {hud.phase === 'playing' && cashierOpen && (
        <CashierPosModal
          hud={hud}
          initialTab={cashierInitialTab}
          onClose={() => setCashierOpen(false)}
          onCheckoutPos={(params) =>
            engineRef.current?.checkoutPosOrder(params) ?? null
          }
          onRegisterVip={(nameAr, phone) =>
            engineRef.current?.registerVipCustomer(nameAr, phone) ?? null
          }
          onAdvanceKitchenTicket={(ticketId, nextStatus) =>
            engineRef.current?.advanceKitchenTicket(ticketId, nextStatus)
          }
          onRequestRefund={(receiptId, reasonAr) =>
            engineRef.current?.requestOrExecuteRefund(receiptId, reasonAr)
          }
          onResolveRefund={(receiptId, approve) =>
            engineRef.current?.resolvePendingRefund(receiptId, approve)
          }
          onSettleShift={() => engineRef.current?.settleDailyShift() ?? null}
          onAnswerInquiry={(id, mode) =>
            engineRef.current?.answerCustomerInquiry(id, mode) ?? null
          }
          onSpawnInquiry={() => engineRef.current?.spawnCustomerInquiryManual()}
          onSetRecipePrice={(id, p) => engineRef.current?.setRecipePrice(id, p)}
          onSetExtraPrice={(id, p) => engineRef.current?.setExtraItemPrice(id, p)}
          onUpdateCashierSettings={(partial) =>
            engineRef.current?.updateCashierSettings(partial)
          }
        />
      )}

      {/* Elmoalem In-Pocket Smartphone OS */}
      {hud.phase === 'playing' && phoneOpen && (
        <MobilePhoneModal
          hud={hud}
          initialApp={phoneInitialApp}
          onClose={() => setPhoneOpen(false)}
          onCallFamily={(id) => engineRef.current?.callFamilyMember(id)}
          onInviteCompanion={() => engineRef.current?.inviteCompanionFromPhone()}
          onQuickTaxi={() => engineRef.current?.triggerQuickTaxiOrDelivery()}
          onCollectShopProfits={() => engineRef.current?.collectShopDividends()}
          onBuyIngredient={(id) => engineRef.current?.buyIngredientPack(id)}
          onUpdateAdBoard={(patch) => engineRef.current?.updateAdBoardOffer(patch)}
          onSendInstaPaySalary={(toId, amt, note) =>
            engineRef.current?.sendInstaPaySalary(toId, amt, note) ?? false
          }
          onPerformInventoryAudit={() => {
            engineRef.current?.performInventoryAudit();
          }}
          onBuyBuilding={(id) => engineRef.current?.buyBuildingById(id)}
          onUpgradeRestaurantFloor={() =>
            engineRef.current?.upgradeRestaurantFloorLevel()
          }
          onBuyBranch={(id) => engineRef.current?.buyRestaurantBranchById(id)}
          onToggleVehicleLock={() => engineRef.current?.toggleVehicleOwnerLock()}
          onBuyVehicle={(vid) => engineRef.current?.buyVehicleById(vid)}
          onSelectVehicle={(vid) => engineRef.current?.selectActiveVehicle(vid)}
          onUpdateCustomProfiles={(patch) =>
            engineRef.current?.updateCustomProfileSettings(patch)
          }
          onEnrollBenhaSchool={(target) =>
            engineRef.current?.enrollBenhaSchool(target)
          }
          onEatFood={() => engineRef.current?.eatFood()}
          onDrinkWater={() => engineRef.current?.drinkWater()}
          onStartObjectDialogue={(kind) =>
            engineRef.current?.startObjectDialogue(kind)
          }
          onBoardCarWithCompanions={() =>
            engineRef.current?.boardVehicleWithCompanions()
          }
          onSetSeason={(sid) => engineRef.current?.setEgyptianSeason(sid)}
          onRefreshDeliveryDispatch={() =>
            engineRef.current?.refreshDeliveryDispatch()
          }
          onAcceptDelivery={(id) => engineRef.current?.acceptDeliveryDispatch(id)}
          onCompleteDelivery={() => engineRef.current?.completeActiveDeliveryNow()}
          onSignWholesale={(cid) => engineRef.current?.signWholesaleContractById(cid)}
          onSanitizeShop={() => engineRef.current?.sanitizeShopNow()}
          onRunInspection={() => engineRef.current?.runInspectionNow()}
          onBuyFurniture={(fid) => engineRef.current?.buyFurnitureItem(fid)}
          onBuyCornicheVilla={() => engineRef.current?.buyCornicheVillaProperty()}
          onAttendSchoolCeremony={() => engineRef.current?.attendSchoolCeremony()}
        />
      )}

      {/* Pause Modal */}
      {hud.phase === 'paused' && (
        <PauseModal
          hud={hud}
          touchControlsEnabled={touchControls}
          onResume={() => engineRef.current?.resumeGame()}
          onRestart={() => engineRef.current?.restartCurrentShift()}
          onTitle={() => engineRef.current?.returnToTitle()}
          onResetSave={() => engineRef.current?.resetProgress()}
          onSetQuality={(q) => engineRef.current?.setQuality(q)}
          onToggleAdaptive={() =>
            engineRef.current?.setAdaptiveQuality(!hud.adaptiveQuality)
          }
          onSetDensity={(partial) =>
            engineRef.current?.setDensitySettings(partial)
          }
          onToggleTouch={() => setTouchControls((v) => !v)}
        />
      )}

      {/* End of Day Summary Modal */}
      {hud.phase === 'gameover' && (
        <DaySummaryModal
          hud={hud}
          onNextDay={() => engineRef.current?.startNextDay()}
          onTitle={() => engineRef.current?.returnToTitle()}
        />
      )}
    </div>
  );
}
