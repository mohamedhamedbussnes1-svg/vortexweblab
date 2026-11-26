import {
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
  MultiplayerStatus,
  OnlineRoomMember,
  OwnableBuildingId,
  OwnedVehicleId,
  PlayerAnimSyncState,
  PlayerCharacterId,
  PosExtraItemId,
  PosReceipt,
  RecipeId,
  RemotePlayerPose,
  RestaurantBranchId,
  SchoolEnrollmentState,
  SchoolReportCardState,
  ShiftSettlementRecord,
  ShopUpgrades,
  VipMember,
  WholesaleContractId,
} from './types';

export interface SharedRoomStatePayload {
  day: number;
  money: number;
  reputation: number;
  shopOpen: boolean;
  shopLightsOn: boolean;
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
  cityShops: CityShopRuntimeState[];
  activeVehicleId: OwnedVehicleId;
  ownedVehicleIds: OwnedVehicleId[];
  carFuel: number;
  carCondition: number;
  adBoard?: ElectronicAdBoardState;
  employeeWallets?: Record<PlayerCharacterId, number>;
  instaPayTransfers?: InstaPayTransferRecord[];
  ownedBuildingIds?: OwnableBuildingId[];
  restaurantFloors?: number;
  ownedBranchIds?: RestaurantBranchId[];
  vehicleLockedByOwner?: boolean;
  customProfiles?: CustomProfilesMap;
  schoolEnrollment?: SchoolEnrollmentState;
  crewNeeds?: Record<PlayerCharacterId, CharacterNeedsState>;
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

export interface RoomLobbyInfo {
  ok: boolean;
  exists?: boolean;
  roomId: string;
  members: OnlineRoomMember[];
  occupiedCharacters: PlayerCharacterId[];
  maxPlayers?: number;
  errorAr?: string;
}

export interface MultiplayerCallbacks {
  onStatusChange: (status: MultiplayerStatus) => void;
  onSharedState: (shared: SharedRoomStatePayload, actorClientId?: string, toastAr?: string) => void;
  onRemotePose: (pose: RemotePlayerPose) => void;
  onMemberDisconnected: (clientId: string) => void;
  onChatMessage?: (message: CoopChatMessage, isHistory?: boolean) => void;
  onToast: (msg: string) => void;
}

export async function createOnlineRoomRequest(
  initialState?: Partial<SharedRoomStatePayload>,
): Promise<{ roomId: string; invitePath: string } | null> {
  try {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initialState }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; roomId?: string; invitePath?: string };
    if (!data.ok || !data.roomId) return null;
    return {
      roomId: data.roomId,
      invitePath: data.invitePath ?? `/?room=${data.roomId}`,
    };
  } catch {
    return null;
  }
}

export async function fetchRoomLobbyInfo(roomId: string): Promise<RoomLobbyInfo | null> {
  const cleaned = roomId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length < 4) return null;
  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(cleaned)}`);
    if (!res.ok) return null;
    return (await res.json()) as RoomLobbyInfo;
  } catch {
    return null;
  }
}

export function buildInviteUrl(roomId: string): string {
  if (typeof window === 'undefined') return `/?room=${roomId}`;
  const url = new URL(window.location.href);
  url.searchParams.set('room', roomId);
  url.searchParams.delete('autostart');
  return url.toString();
}

export class MultiplayerClient {
  private ws: WebSocket | null = null;
  private status: MultiplayerStatus = {
    mode: 'solo',
    roomId: null,
    inviteUrl: null,
    clientId: null,
    lockedCharacterId: null,
    members: [],
    errorAr: null,
  };
  private callbacks: MultiplayerCallbacks;
  private lastPoseSentAt = 0;

  constructor(callbacks: MultiplayerCallbacks) {
    this.callbacks = callbacks;
  }

  public getStatus(): MultiplayerStatus {
    return {
      ...this.status,
      members: this.status.members.map((m) => ({ ...m })),
    };
  }

  public connect(params: {
    roomId: string;
    characterId: PlayerCharacterId;
    displayNameAr: string;
    initialState?: Partial<SharedRoomStatePayload>;
  }): void {
    this.disconnect(false);
    const cleanedRoom = params.roomId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanedRoom.length < 4) {
      this.updateStatus({
        mode: 'error',
        roomId: null,
        inviteUrl: null,
        clientId: null,
        lockedCharacterId: null,
        members: [],
        errorAr: 'رمز الغرفة لازم يكون من ٤ حروف أو أرقام على الأقل.',
      });
      return;
    }

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${proto}//${window.location.host}/ws?room=${encodeURIComponent(cleanedRoom)}`;

    this.updateStatus({
      mode: 'connecting',
      roomId: cleanedRoom,
      inviteUrl: buildInviteUrl(cleanedRoom),
      clientId: null,
      lockedCharacterId: null,
      members: [],
      errorAr: null,
    });

    try {
      const ws = new WebSocket(wsUrl);
      this.ws = ws;

      ws.addEventListener('open', () => {
        ws.send(
          JSON.stringify({
            type: 'join',
            roomId: cleanedRoom,
            characterId: params.characterId,
            displayNameAr: params.displayNameAr,
            initialState: params.initialState,
          }),
        );
      });

      ws.addEventListener('message', (ev) => {
        let msg: Record<string, unknown>;
        try {
          msg = JSON.parse(String(ev.data)) as Record<string, unknown>;
        } catch {
          return;
        }

        if (msg.type === 'room:welcome') {
          const roomId = String(msg.roomId ?? cleanedRoom);
          const clientId = String(msg.clientId ?? '');
          const charId = msg.characterId as PlayerCharacterId;
          const members = (msg.members as OnlineRoomMember[]) ?? [];
          this.updateStatus({
            mode: 'online',
            roomId,
            inviteUrl: buildInviteUrl(roomId),
            clientId,
            lockedCharacterId: charId,
            members,
            errorAr: null,
          });
          if (msg.sharedState) {
            this.callbacks.onSharedState(msg.sharedState as SharedRoomStatePayload);
          }
          if (Array.isArray(msg.chatHistory) && this.callbacks.onChatMessage) {
            for (const cm of msg.chatHistory as CoopChatMessage[]) {
              this.callbacks.onChatMessage(cm, true);
            }
          }
          this.callbacks.onToast(`متصل أونلاين في غرفة ${roomId} · رابط الدعوة جاهز!`);
          return;
        }

        if (msg.type === 'room:members') {
          const members = (msg.members as OnlineRoomMember[]) ?? [];
          if (typeof msg.disconnectedClientId === 'string') {
            this.callbacks.onMemberDisconnected(msg.disconnectedClientId);
          }
          this.updateStatus({
            ...this.status,
            members,
          });
          if (typeof msg.toastAr === 'string' && msg.toastAr) {
            this.callbacks.onToast(msg.toastAr);
          }
          return;
        }

        if (msg.type === 'room:state' && msg.sharedState) {
          this.callbacks.onSharedState(
            msg.sharedState as SharedRoomStatePayload,
            typeof msg.actorClientId === 'string' ? msg.actorClientId : undefined,
            typeof msg.toastAr === 'string' ? msg.toastAr : undefined,
          );
          return;
        }

        if (msg.type === 'chat:message' && msg.message && this.callbacks.onChatMessage) {
          this.callbacks.onChatMessage(msg.message as CoopChatMessage, false);
          return;
        }

        if (msg.type === 'player:pose') {
          const pose: RemotePlayerPose = {
            clientId: String(msg.clientId ?? ''),
            characterId: msg.characterId as PlayerCharacterId,
            roleId: msg.roleId as CrewRoleId,
            displayNameAr: String(msg.displayNameAr ?? ''),
            x: Number(msg.x ?? 0),
            y: Number(msg.y ?? 1.68),
            z: Number(msg.z ?? 0),
            yaw: Number(msg.yaw ?? 0),
            inCar: Boolean(msg.inCar),
            moving: Boolean(msg.moving),
            sprinting: Boolean(msg.sprinting),
            holding: Boolean(msg.holding),
            animState:
              typeof msg.animState === 'string'
                ? (msg.animState as PlayerAnimSyncState)
                : undefined,
            speechText:
              typeof msg.speechText === 'string' ? msg.speechText : undefined,
            zoneAr: String(msg.zoneAr ?? 'الحارة'),
            streetAr: typeof msg.streetAr === 'string' ? msg.streetAr : undefined,
          };
          // Keep member list zone synced even when HUD snapshots are built directly from status.members
          this.status = {
            ...this.status,
            members: this.status.members.map((m) =>
              m.clientId === pose.clientId
                ? {
                    ...m,
                    zoneAr: pose.zoneAr,
                    streetAr: pose.streetAr,
                    inCar: pose.inCar,
                    x: pose.x,
                    z: pose.z,
                  }
                : m,
            ),
          };
          this.callbacks.onRemotePose(pose);
          return;
        }

        if (msg.type === 'room:error') {
          const messageAr = String(msg.messageAr ?? 'تعذر الاتصال بالغرفة.');
          this.updateStatus({
            ...this.status,
            mode: msg.code === 'CHARACTER_TAKEN' || msg.code === 'INVALID_JOIN' ? 'error' : this.status.mode,
            errorAr: messageAr,
          });
          this.callbacks.onToast(messageAr);
        }
      });

      ws.addEventListener('close', () => {
        if (this.ws === ws) {
          this.ws = null;
          if (this.status.mode === 'online' || this.status.mode === 'connecting') {
            this.updateStatus({
              mode: 'solo',
              roomId: null,
              inviteUrl: null,
              clientId: null,
              lockedCharacterId: null,
              members: [],
              errorAr: this.status.errorAr,
            });
          }
        }
      });

      ws.addEventListener('error', () => {
        this.updateStatus({
          mode: 'error',
          roomId: cleanedRoom,
          inviteUrl: buildInviteUrl(cleanedRoom),
          clientId: null,
          lockedCharacterId: null,
          members: [],
          errorAr: 'تعذر الاتصال بسيرفر الغرفة — تأكد من الإنترنت وجرب تاني.',
        });
      });
    } catch {
      this.updateStatus({
        mode: 'error',
        roomId: null,
        inviteUrl: null,
        clientId: null,
        lockedCharacterId: null,
        members: [],
        errorAr: 'المتصفح لا يدعم WebSocket أونلاين.',
      });
    }
  }

  public disconnect(notify = true): void {
    if (this.ws) {
      const old = this.ws;
      this.ws = null;
      try {
        old.close();
      } catch {
        // ignore
      }
    }
    this.status = {
      mode: 'solo',
      roomId: null,
      inviteUrl: null,
      clientId: null,
      lockedCharacterId: null,
      members: [],
      errorAr: null,
    };
    if (notify) {
      this.callbacks.onStatusChange(this.getStatus());
    }
  }

  public sendPose(pose: {
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
  }): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.status.mode !== 'online') return;
    const now = performance.now();
    if (now - this.lastPoseSentAt < 75) return; // ~13 Hz
    this.lastPoseSentAt = now;
    this.ws.send(
      JSON.stringify({
        type: 'player:pose',
        ...pose,
      }),
    );
  }

  public sendAction(
    action: string,
    stateDelta: Partial<SharedRoomStatePayload>,
    toastAr?: string,
  ): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.status.mode !== 'online') return;
    this.ws.send(
      JSON.stringify({
        type: 'room:action',
        action,
        stateDelta,
        toastAr,
      }),
    );
  }

  public sendChatMessage(text: string): void {
    const clean = text.trim().slice(0, 120);
    if (!clean) return;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.status.mode !== 'online') return;
    this.ws.send(
      JSON.stringify({
        type: 'chat:message',
        text: clean,
      }),
    );
  }

  private updateStatus(next: MultiplayerStatus): void {
    this.status = next;
    this.callbacks.onStatusChange(this.getStatus());
  }
}
