import * as THREE from 'three';
import {
  animateHumanActor,
  CharacterRigFactory,
  CharacterStyleOptions,
  createCharacterRigFactory,
  NpcMeshActor,
  setActorExpression,
} from './characterRig';
import {
  CITY_SHOPS,
  DISTRICTS,
  EW_ROADS_Z,
  GAS_STATION_DEF,
  NS_ROADS_X,
  OWNABLE_BUILDINGS,
  REMOTE_CREW_APARTMENT,
  RESTAURANT_BRANCHES,
  SCHOOL_CAMPUSES,
  X_SPANS,
  Z_SPANS,
} from './cityLayout';
import { ROMANCE_NPCS } from './rules';
import { ProceduralTextureSet } from './textures';
import { AABB2D, ElectronicAdBoardState, HouseholdMemberState, WorldObjectChatKind } from './types';
import {
  buildHeroSedan,
  createTrafficVehicleFactory,
  HeroCarRig,
  TrafficVehicleKind,
} from './vehicles';

/**
 * Deterministic walkable floor Y elevation for exterior stairs & 2nd/3rd floors.
 */
export function getFloorElevationAt(
  x: number,
  z: number,
  restaurantFloors = 1,
  currentY = 0,
): number {
  // 1) Remote 2nd-Floor Apartment (-68.75, 58.5), floorY = 3.6
  // Exterior East Staircase: X in [-63.55, -61.35], Z in [54.3, 62.7]
  // Climbs from South (Z = 62.6 -> y = 0.14) up to North Terrace (Z = 54.4 -> y = 3.6)
  if (x >= -63.55 && x <= -61.35 && z >= 54.3 && z <= 62.7) {
    const t = Math.max(0, Math.min(1, (62.6 - z) / 8.2));
    return 0.14 + t * (REMOTE_CREW_APARTMENT.floorY - 0.14);
  }
  // 2nd Floor Terrace (North Z in [52.1, 54.45]) + Apartment Interior (Z in [54.3, 62.8])
  if (
    currentY >= 1.85 &&
    x >= -74.2 &&
    x <= -61.35 &&
    z >= 52.1 &&
    z <= 62.8
  ) {
    return REMOTE_CREW_APARTMENT.floorY;
  }

  // 2) Restaurant Floor 2 (y = 3.65) & Floor 3 (y = 7.15) above محل المعلم (-13.0, 0)
  if (restaurantFloors >= 2) {
    // South Exterior Staircase to Floor 2: X in [-17.0, -9.0], Z in [4.85, 6.45]
    // Climbs East (-9.2 -> y = 0.16) to West (-16.8 -> y = 3.65)
    if (x >= -17.0 && x <= -9.0 && z >= 4.85 && z <= 6.45) {
      const t = Math.max(0, Math.min(1, (-9.2 - x) / 7.6));
      return 0.16 + t * (3.65 - 0.16);
    }
    if (restaurantFloors >= 3) {
      // West Exterior Staircase from Floor 2 -> Floor 3: X in [-18.75, -17.1], Z in [-4.6, 4.6]
      // Climbs South (4.5 -> y = 3.65) to North (-4.5 -> y = 7.15)
      if (x >= -18.75 && x <= -17.1 && z >= -4.7 && z <= 4.7 && currentY >= 2.1) {
        const t = Math.max(0, Math.min(1, (4.5 - z) / 9.0));
        return 3.65 + t * (7.15 - 3.65);
      }
      if (
        currentY >= 5.3 &&
        x >= -18.75 &&
        x <= -8.6 &&
        z >= -4.9 &&
        z <= 4.9
      ) {
        return 7.15;
      }
    }
    if (
      currentY >= 1.9 &&
      x >= -18.75 &&
      x <= -8.6 &&
      z >= -4.9 &&
      z <= 6.45
    ) {
      return 3.65;
    }
  }

  return 0.14;
}

export interface WorldInteractableMesh {
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
    | 'home_kitchen'
    | 'home_drink'
    | 'talk_shop_owner'
    | 'talk_person'
    | 'talk_object'
    | 'school_enroll'
    | 'mechanic_repair'
    | 'bakery_bake'
    | 'ahwa_serve'
    | 'mediate_fight'
    | 'fix_broken_car'
    | 'encourage_vendor'
    | 'serve_wedding_feast'
    | 'open_cashier';
  labelAr: string;
  subLabelAr?: string;
  keyHint: string;
  position: THREE.Vector3;
  radius: number;
  mesh: THREE.Object3D;
  shopId?: string;
  doorId?: string;
  personId?: string;
  objectKind?: WorldObjectChatKind;
  objectId?: string;
  personKind?:
    | 'romance'
    | 'worker'
    | 'pedestrian'
    | 'spouse'
    | 'child'
    | 'household_wife'
    | 'household_daughter'
    | 'household_son'
    | 'school_staff'
    | 'student';
}

export interface DoorInstance {
  id: string;
  labelAr: string;
  pivot: THREE.Group;
  collider: AABB2D | null;
  isOpen: boolean;
  openAngle: number;
  progress: number;
  interactPos: THREE.Vector3;
}

export interface ShopOwnerInstance {
  shopId: string;
  actor: NpcMeshActor;
  x: number;
  z: number;
  facingYaw: number;
}

export interface ShopWorkerInstance {
  id: string;
  shopId: string;
  actor: NpcMeshActor;
  x: number;
  z: number;
  facingYaw: number;
}

export interface RomanceActorInstance {
  id: string;
  nameAr: string;
  actor: NpcMeshActor;
  homeX: number;
  homeZ: number;
  phaseOffset: number;
}

export interface HouseholdActorEntry {
  id: HouseholdMemberState['id'];
  actor: NpcMeshActor;
}

export interface StreetEventVisuals {
  fightGroup: THREE.Group;
  fightActorA: NpcMeshActor;
  fightActorB: NpcMeshActor;
  brokenCarGroup: THREE.Group;
  brokenCarHazardMats: THREE.MeshStandardMaterial[];
  brokenCarSmoke: THREE.Mesh[];
  vendorGroup: THREE.Group;
  vendorActor: NpcMeshActor;
  weddingGroup: THREE.Group;
  weddingActors: NpcMeshActor[];
  beacon: THREE.Group;
}

export interface DiningSeatAnchor {
  x: number;
  z: number;
  yaw: number;
}

export interface BuiltWorld {
  colliders: AABB2D[];
  cameraOccluders: THREE.Object3D[];
  interactables: WorldInteractableMesh[];
  doors: DoorInstance[];
  shopOwners: ShopOwnerInstance[];
  shopWorkers: ShopWorkerInstance[];
  romanceActors: RomanceActorInstance[];
  householdActors: HouseholdActorEntry[];
  benhaStudents: NpcMeshActor[];
  spouseActor: NpcMeshActor;
  childActors: NpcMeshActor[];
  fulCoworkers: NpcMeshActor[];
  flagMeshes: THREE.Mesh[];
  fryingPatties: THREE.Mesh[];
  cookHandsGroup: THREE.Group;
  shutterMesh: THREE.Mesh;
  shopLights: THREE.PointLight[];
  streetLampLights: THREE.PointLight[];
  streetLampBulbMat: THREE.MeshStandardMaterial;
  shopNeonMaterials: THREE.MeshStandardMaterial[];
  asphaltMaterials: THREE.MeshStandardMaterial[];
  heroCar: HeroCarRig;
  repairBayCar: THREE.Group;
  taxiPassengerActor: NpcMeshActor;
  taxiPickupBeacon: THREE.Group;
  taxiDropoffBeacon: THREE.Group;
  deliveryBeacon: THREE.Group;
  yellowArrowGroup: THREE.Group;
  propClutterGroup: THREE.Group;
  streetEventVisuals: StreetEventVisuals;
  diningSeats: DiningSeatAnchor[];
  cornicheFeluccas: Array<{ group: THREE.Group; baseZ: number; speed: number; dir: 1 | -1 }>;
  sizzleRingMesh: THREE.Mesh;
  upgradedFulPot2: THREE.Group;
  upgradedFryerAddons: THREE.Group;
  upgradedDecorAddons: THREE.Group;
  nsSignalMats: { red: THREE.MeshStandardMaterial; yellow: THREE.MeshStandardMaterial; green: THREE.MeshStandardMaterial };
  ewSignalMats: { red: THREE.MeshStandardMaterial; yellow: THREE.MeshStandardMaterial; green: THREE.MeshStandardMaterial };
  nileWaterMesh: THREE.Mesh;
  stringLightBulbs: THREE.MeshStandardMaterial[];
  rainInstanced: THREE.InstancedMesh;
  steamInstanced: THREE.InstancedMesh;
  burstInstanced: THREE.InstancedMesh;
  playerActor: NpcMeshActor;
  setPlayerAppearance: (shirtColor: number, skinColor: number) => void;
  setAdBoardDisplay: (board: ElectronicAdBoardState) => void;
  setRestaurantFloors: (floors: number) => void;
  setOwnedBuildings: (buildingIds: string[]) => void;
  setOwnedBranches: (branchIds: string[]) => void;
  createNpcActor: (opts: CharacterStyleOptions) => NpcMeshActor;
  createTrafficVehicle: (kind: TrafficVehicleKind, color?: number) => THREE.Group;
  dispose: () => void;
}

export function buildEgyptianHaraWorld(
  scene: THREE.Scene,
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean,
): BuiltWorld {
  const disposables: Array<{ dispose: () => void }> = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposables.push(m);
    return m;
  };

  const colliders: AABB2D[] = [];
  const cameraOccluders: THREE.Object3D[] = [];
  const interactables: WorldInteractableMesh[] = [];
  const doors: DoorInstance[] = [];
  const shopOwners: ShopOwnerInstance[] = [];
  const shopWorkers: ShopWorkerInstance[] = [];
  const romanceActors: RomanceActorInstance[] = [];
  const fulCoworkers: NpcMeshActor[] = [];
  const flagMeshes: THREE.Mesh[] = [];
  const fryingPatties: THREE.Mesh[] = [];
  const shopNeonMaterials: THREE.MeshStandardMaterial[] = [];

  const rigFactory: CharacterRigFactory = createCharacterRigFactory(
    scene,
    isSoftwareGl,
    {
      fabricBump: textures.fabricWeave,
      skinMap: textures.skinMicro,
      contactShadow: textures.contactShadow,
    },
  );
  const trafficFactory = createTrafficVehicleFactory(scene, textures);

  const benhaStudents: NpcMeshActor[] = [];

  const registerInteractable = (
    id: string,
    actionType: WorldInteractableMesh['actionType'],
    labelAr: string,
    subLabelAr: string | undefined,
    keyHint: string,
    pos: THREE.Vector3,
    radius: number,
    mesh: THREE.Object3D,
    extra?: {
      shopId?: string;
      doorId?: string;
      personId?: string;
      personKind?: WorldInteractableMesh['personKind'];
      objectKind?: WorldObjectChatKind;
      objectId?: string;
    },
  ) => {
    interactables.push({
      id,
      actionType,
      labelAr,
      subLabelAr,
      keyHint,
      position: pos,
      radius,
      mesh,
      shopId: extra?.shopId,
      doorId: extra?.doorId,
      personId: extra?.personId,
      personKind: extra?.personKind,
      objectKind: extra?.objectKind,
      objectId: extra?.objectId,
    });
  };

  // Shared PBR Materials
  const matGround = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xb19573,
      bumpMap: textures.bumpNoise,
      bumpScale: 0.04,
      roughness: 0.94,
      metalness: 0.0,
    }),
  );
  const matAsphalt = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.asphalt,
      bumpMap: textures.bumpNoise,
      bumpScale: 0.032,
      roughness: 0.88,
      metalness: 0.02,
    }),
  );
  const matSidewalk = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.sidewalk,
      bumpMap: textures.tileBump,
      bumpScale: 0.024,
      roughness: 0.86,
      metalness: 0.02,
    }),
  );
  const matCurb = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.curbStripes,
      bumpMap: textures.bumpNoise,
      bumpScale: 0.018,
      roughness: 0.84,
      metalness: 0.02,
    }),
  );
  const matConcrete = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x8a8278,
      bumpMap: textures.bumpNoise,
      bumpScale: 0.025,
      roughness: 0.9,
      metalness: 0.02,
    }),
  );
  const matPlasterA = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.buildingPlasterA,
      bumpMap: textures.brickBump,
      bumpScale: 0.035,
      roughness: 0.88,
    }),
  );
  const matPlasterB = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.buildingPlasterB,
      bumpMap: textures.brickBump,
      bumpScale: 0.048,
      roughness: 0.9,
    }),
  );
  const matMashrabiya = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.mashrabiya,
      bumpMap: textures.woodGrainBump,
      bumpScale: 0.02,
      roughness: 0.78,
      metalness: 0.04,
    }),
  );
  const matShopTile = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.shopTile,
      bumpMap: textures.tileBump,
      bumpScale: 0.018,
      roughness: 0.44,
      metalness: 0.05,
    }),
  );
  const matWood = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.woodCounter,
      bumpMap: textures.woodGrainBump,
      bumpScale: 0.025,
      roughness: 0.78,
      metalness: 0.04,
    }),
  );
  const matWoodDoor = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.woodDoorPanel,
      bumpMap: textures.woodGrainBump,
      bumpScale: 0.022,
      roughness: 0.62,
      metalness: 0.06,
    }),
  );
  const matCopper = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xd47e36, roughness: 0.22, metalness: 0.88 }),
  );
  const matBrass = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xe2b144, roughness: 0.24, metalness: 0.86 }),
  );
  const matSteel = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xd8dde3, roughness: 0.24, metalness: 0.88 }),
  );
  const matDarkIron = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x26292e, roughness: 0.52, metalness: 0.68 }),
  );
  const matAwning = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.awningStripes,
      roughness: 0.86,
      side: THREE.DoubleSide,
    }),
  );
  const matContactShadow = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
  );
  const shadowDiscGeo = trackGeo(new THREE.CircleGeometry(0.65, 16));
  const addContactShadow = (parent: THREE.Object3D, radius = 0.65, y = 0.025) => {
    const disc = new THREE.Mesh(shadowDiscGeo, matContactShadow);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = y;
    disc.scale.setScalar(radius / 0.65);
    parent.add(disc);
  };

  // Helper: Framed Illuminated Shop Sign
  const createIlluminatedSign = (
    w: number,
    h: number,
    tex: THREE.CanvasTexture,
    emissiveHex: number,
  ): THREE.Group => {
    const grp = new THREE.Group();
    const housing = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.14)),
      matDarkIron,
    );
    housing.position.z = -0.04;
    grp.add(housing);

    const faceMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: tex,
        emissiveMap: tex,
        emissive: emissiveHex,
        emissiveIntensity: 0.5,
        roughness: 0.28,
      }),
    );
    shopNeonMaterials.push(faceMat);
    const face = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(w, h)), faceMat);
    face.position.z = 0.036;
    grp.add(face);
    return grp;
  };

  // Helper: Articulated Hinged Door with Frame, Brass Handle & Active Collider Toggle
  const createHingedDoor = (
    id: string,
    labelAr: string,
    hingeX: number,
    hingeZ: number,
    baseYaw: number,
    doorW: number,
    doorH: number,
    openAngle: number,
    colliderBox: AABB2D | null,
    isGlassDoor = false,
  ): DoorInstance => {
    const frameGrp = new THREE.Group();
    frameGrp.position.set(hingeX, 0.14, hingeZ);
    frameGrp.rotation.y = baseYaw;

    // Jamb posts + lintel
    const jambGeo = trackGeo(new THREE.BoxGeometry(0.1, doorH + 0.08, 0.14));
    const leftJ = new THREE.Mesh(jambGeo, matDarkIron);
    leftJ.position.set(-0.04, doorH / 2, 0);
    frameGrp.add(leftJ);
    const rightJ = new THREE.Mesh(jambGeo, matDarkIron);
    rightJ.position.set(doorW + 0.04, doorH / 2, 0);
    frameGrp.add(rightJ);
    const lintel = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(doorW + 0.18, 0.12, 0.16)),
      matDarkIron,
    );
    lintel.position.set(doorW / 2, doorH + 0.06, 0);
    frameGrp.add(lintel);

    // Rotating Pivot at hingeX
    const pivot = new THREE.Group();
    frameGrp.add(pivot);

    const leafMat = isGlassDoor
      ? trackMat(
          new THREE.MeshStandardMaterial({
            color: 0x7dd3fc,
            roughness: 0.18,
            metalness: 0.25,
            transparent: true,
            opacity: 0.55,
          }),
        )
      : matWoodDoor;
    const leaf = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(doorW, doorH, 0.07)),
      leafMat,
    );
    leaf.position.set(doorW / 2, doorH / 2, 0);
    pivot.add(leaf);

    if (isGlassDoor) {
      // Aluminum stile border
      const bar = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(doorW, 0.12, 0.085)),
        matSteel,
      );
      bar.position.set(doorW / 2, doorH * 0.48, 0);
      pivot.add(bar);
    }

    // Brass handles on both sides
    const handle = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.14, 0.04, 0.15)),
      matBrass,
    );
    handle.position.set(doorW - 0.16, 1.02, 0);
    pivot.add(handle);

    scene.add(frameGrp);

    // World position of door center for prompt
    const centerLocal = new THREE.Vector3(doorW / 2, 1.2, 0)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), baseYaw)
      .add(new THREE.Vector3(hingeX, 0.14, hingeZ));

    if (colliderBox) {
      colliderBox.active = true;
      colliders.push(colliderBox);
    }

    const inst: DoorInstance = {
      id,
      labelAr,
      pivot,
      collider: colliderBox,
      isOpen: false,
      openAngle,
      progress: 0,
      interactPos: centerLocal,
    };
    doors.push(inst);

    registerInteractable(
      `interact-${id}`,
      'toggle_door',
      labelAr,
      'باب قابل للفتح والغلق [E]',
      'E',
      centerLocal,
      2.5,
      pivot,
      { doorId: id },
    );

    return inst;
  };

  // =========================================================================
  // 1. 98-STREET CAIRO CITY GRID, NILE CORNICHE & INSTANCED PROPS
  // =========================================================================
  const ground = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(420, 420)),
    matGround,
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = !isSoftwareGl;
  scene.add(ground);

  // Shimmering Nile River Strip at Northern Corniche Edge (Z = -112 .. -158)
  const nileWaterMesh = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(360, 50)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.nileWater,
        roughness: 0.18,
        metalness: 0.35,
      }),
    ),
  );
  nileWaterMesh.rotation.x = -Math.PI / 2;
  nileWaterMesh.position.set(0, 0.03, -133);
  scene.add(nileWaterMesh);

  // Stone Nile Corniche Parapet Wall + River Promenade (Z = -108)
  const cornicheWalk = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(220, 0.18, 5.5)),
    matSidewalk,
  );
  cornicheWalk.position.set(0, 0.09, -107.0);
  scene.add(cornicheWalk);
  const cornicheWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(220, 0.95, 0.42)),
    matPlasterA,
  );
  cornicheWall.position.set(0, 0.52, -109.5);
  scene.add(cornicheWall);

  // Moving Nile Felucca Sailboats + Corniche Promenade Benches
  const cornicheFeluccas: Array<{ group: THREE.Group; baseZ: number; speed: number; dir: 1 | -1 }> = [];
  const matSail = trackMat(new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.72, side: THREE.DoubleSide }));
  const matHull = trackMat(new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.8 }));
  const matLantern = trackMat(new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 1.1 }));
  (
    [
      [-32, -121, 2.8, 1],
      [18, -133, 2.2, -1],
      [-5, -144, 3.1, 1],
    ] as Array<[number, number, number, 1 | -1]>
  ).forEach(([fx, fz, spd, dir]) => {
    const fel = new THREE.Group();
    fel.position.set(fx, 0.14, fz);
    if (dir < 0) fel.rotation.y = Math.PI;
    const hull = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(6.8, 0.75, 2.2)), matHull);
    hull.position.y = 0.28;
    fel.add(hull);
    const mast = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.08, 0.1, 6.4, 8)), matHull);
    mast.position.set(0.3, 3.3, 0);
    fel.add(mast);
    const sailGeo = trackGeo(new THREE.ConeGeometry(2.3, 5.2, 3));
    const sail = new THREE.Mesh(sailGeo, matSail);
    sail.position.set(-0.3, 3.6, 0);
    sail.rotation.z = 0.22;
    sail.scale.set(0.14, 1, 1.45);
    fel.add(sail);
    const lantern = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.18, 8, 6)), matLantern);
    lantern.position.set(-2.9, 1.05, 0);
    fel.add(lantern);
    scene.add(fel);
    cornicheFeluccas.push({ group: fel, baseZ: fz, speed: spd, dir });
  });

  // Corniche balustrade pillars, benches, docked sightseeing felucca & collider along Nile wall
  colliders.push({ minX: -110, maxX: 110, minZ: -110.1, maxZ: -108.9 });
  for (let bx = -72; bx <= 72; bx += 18) {
    const cBench = new THREE.Group();
    cBench.position.set(bx, 0.18, -108.3);
    const bSeat = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.8, 0.1, 0.55)), matWood);
    bSeat.position.y = 0.44;
    cBench.add(bSeat);
    const bBack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.8, 0.48, 0.08)), matWood);
    bBack.position.set(0, 0.72, -0.24);
    cBench.add(bBack);
    for (const lx of [-0.75, 0.75]) {
      const bLeg = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.1, 0.44, 0.5)), matDarkIron);
      bLeg.position.set(lx, 0.22, 0);
      cBench.add(bLeg);
    }
    scene.add(cBench);
    colliders.push({ minX: bx - 0.95, maxX: bx + 0.95, minZ: -108.65, maxZ: -107.95 });
    if (bx === 0 || bx === -36) {
      registerInteractable(
        `obj-bench-${bx}`,
        'talk_object',
        'دكة كورنيش النيل — استراحة وحديث',
        'اضغط [E] للكلام أو الاستراحة على النيل',
        'E',
        new THREE.Vector3(bx, 0.85, -108.0),
        2.8,
        cBench,
        { objectKind: 'bench', objectId: `obj-bench-${bx}` },
      );
    }
  }
  // Docked Felucca at Nile Promenade Pier (Z = -111) so player can walk up and talk to it!
  const dockedFelucca = new THREE.Group();
  dockedFelucca.position.set(0, 0.2, -112.2);
  const dHull = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(7.2, 0.8, 2.3)), matHull);
  dHull.position.y = 0.28;
  dockedFelucca.add(dHull);
  const dMast = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.08, 0.1, 6.2, 8)), matHull);
  dMast.position.set(0.3, 3.2, 0);
  dockedFelucca.add(dMast);
  const dSail = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(2.2, 4.9, 3)), matSail);
  dSail.position.set(-0.25, 3.5, 0);
  dSail.rotation.z = 0.2;
  dSail.scale.set(0.14, 1, 1.4);
  dockedFelucca.add(dSail);
  scene.add(dockedFelucca);
  registerInteractable(
    'obj-felucca-dock',
    'talk_object',
    'فلوكة النيل الذهبية',
    'اضغط [E] للكلام مع مراكبي النيل',
    'E',
    new THREE.Vector3(0, 1.1, -108.5),
    3.8,
    dockedFelucca,
    { objectKind: 'felucca', objectId: 'obj-felucca-dock' },
  );

  // 7 Continuous North-South Avenues (49 named segments)
  const nsAsphaltTex = textures.asphalt.clone();
  nsAsphaltTex.repeat.set(1, 24);
  nsAsphaltTex.needsUpdate = true;
  disposables.push(nsAsphaltTex);
  const matNsAsphalt = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: nsAsphaltTex,
      bumpMap: textures.bumpNoise,
      bumpScale: 0.026,
      roughness: 0.88,
      metalness: 0.02,
    }),
  );
  const ewAsphaltTex = textures.asphalt.clone();
  ewAsphaltTex.repeat.set(1, 24);
  ewAsphaltTex.needsUpdate = true;
  disposables.push(ewAsphaltTex);
  const matEwAsphalt = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: ewAsphaltTex,
      bumpMap: textures.bumpNoise,
      bumpScale: 0.026,
      roughness: 0.88,
      metalness: 0.02,
    }),
  );
  const matAsphaltPlain = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.asphaltPlain,
      bumpMap: textures.bumpNoise,
      bumpScale: 0.026,
      roughness: 0.88,
      metalness: 0.02,
    }),
  );
  const asphaltMaterials: THREE.MeshStandardMaterial[] = [
    matAsphalt,
    matNsAsphalt,
    matEwAsphalt,
    matAsphaltPlain,
  ];
  for (const rx of NS_ROADS_X) {
    const w = rx === 0 ? 10.6 : 9.4;
    const road = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(w, 200)),
      rx === 0 ? matAsphalt : matNsAsphalt,
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(rx, 0.021, -10);
    road.receiveShadow = !isSoftwareGl;
    scene.add(road);
  }

  // 7 Continuous East-West Streets (49 named segments -> 98 total!)
  // Oriented with rotation.z = PI/2 so dashes align crisply along X without stretching
  for (const rz of EW_ROADS_Z) {
    const w = rz === -11.5 || rz === 16.5 || rz === 44.5 ? 10.4 : 9.4;
    const ewRoad = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(w, 204)),
      matEwAsphalt,
    );
    ewRoad.rotation.x = -Math.PI / 2;
    ewRoad.rotation.z = Math.PI / 2;
    ewRoad.position.set(0, 0.023, rz);
    ewRoad.receiveShadow = !isSoftwareGl;
    scene.add(ewRoad);
  }

  // Clean Intersection Asphalt Pads so yellow dashes stop neatly before crosswalks
  const interPadGeo = trackGeo(new THREE.PlaneGeometry(1, 1));
  const interPadInst = new THREE.InstancedMesh(interPadGeo, matAsphaltPlain, 49);
  interPadInst.receiveShadow = !isSoftwareGl;
  const interDummy = new THREE.Object3D();
  let ipIdx = 0;
  for (const rx of NS_ROADS_X) {
    const wNs = rx === 0 ? 10.6 : 9.4;
    for (const rz of EW_ROADS_Z) {
      const wEw = rz === -11.5 || rz === 16.5 || rz === 44.5 ? 10.4 : 9.4;
      interDummy.position.set(rx, 0.025, rz);
      interDummy.rotation.set(-Math.PI / 2, 0, 0);
      interDummy.scale.set(wNs, wEw, 1);
      interDummy.updateMatrix();
      interPadInst.setMatrixAt(ipIdx++, interDummy.matrix);
    }
  }
  interPadInst.count = ipIdx;
  scene.add(interPadInst);

  // Painted Speed Bumps (مطبات صناعية) aligned cleanly ACROSS Main Avenue matching SPEED_BUMPS
  const bumpStripeTex = textures.curbStripes.clone();
  bumpStripeTex.repeat.set(5, 1);
  bumpStripeTex.needsUpdate = true;
  disposables.push(bumpStripeTex);
  const bumpStripeMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xffffff, map: bumpStripeTex, roughness: 0.72 }),
  );
  for (const bz of [-5.5, 10.5]) {
    const bumpMesh = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.24, 0.24, 9.4, 12, 1, false, 0, Math.PI)),
      bumpStripeMat,
    );
    bumpMesh.rotation.z = Math.PI / 2;
    bumpMesh.scale.set(0.45, 1, 1.45);
    bumpMesh.position.set(0, 0.02, bz);
    scene.add(bumpMesh);
  }

  const nsSignalMats = {
    red: trackMat(new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.15 })),
    yellow: trackMat(new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.15 })),
    green: trackMat(new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.4 })),
  };
  const ewSignalMats = {
    red: trackMat(new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.4 })),
    yellow: trackMat(new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.15 })),
    green: trackMat(new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.15 })),
  };
  const matPoleDark = trackMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55, metalness: 0.35 }));
  const buildTrafficPole = (px: number, pz: number, mats: typeof nsSignalMats, rotY: number) => {
    const grp = new THREE.Group();
    grp.position.set(px, 0, pz);
    grp.rotation.y = rotY;
    const post = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.11, 0.14, 4.6, 8)), matPoleDark);
    post.position.y = 2.3;
    grp.add(post);
    const arm = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.1, 0.12, 0.12)), matPoleDark);
    arm.position.set(-1.0, 4.45, 0);
    grp.add(arm);
    const box = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.42, 1.18, 0.36)), matPoleDark);
    box.position.set(-1.85, 4.05, 0);
    grp.add(box);
    [
      [4.42, mats.red],
      [4.05, mats.yellow],
      [3.68, mats.green],
    ].forEach(([ly, m]) => {
      const bulb = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.12, 8, 8)), m as THREE.MeshStandardMaterial);
      bulb.position.set(-1.85, ly as number, 0.19);
      grp.add(bulb);
      const bulbBack = bulb.clone();
      bulbBack.position.z = -0.19;
      grp.add(bulbBack);
    });
    scene.add(grp);
  };
  buildTrafficPole(5.3, -15.8, nsSignalMats, 0);
  buildTrafficPole(-5.3, 12.2, nsSignalMats, Math.PI);
  buildTrafficPole(-5.8, -16.2, ewSignalMats, Math.PI / 2);
  buildTrafficPole(5.8, 12.2, ewSignalMats, -Math.PI / 2);

  // 49 City Sidewalk Blocks (7 X-spans x 7 Z-spans) with Instanced Curbstones
  const sidewalkBlockGeo = trackGeo(new THREE.BoxGeometry(1, 0.14, 1));
  const sidewalkBlockInst = new THREE.InstancedMesh(sidewalkBlockGeo, matSidewalk, 64);
  sidewalkBlockInst.receiveShadow = !isSoftwareGl;
  const curbGeo = trackGeo(new THREE.BoxGeometry(1, 0.17, 0.24));
  const curbInst = new THREE.InstancedMesh(curbGeo, matCurb, 256);
  const dummy = new THREE.Object3D();

  let sbIdx = 0;
  let cbIdx = 0;
  const blockBoundsList: Array<{
    ix: number;
    iz: number;
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  }> = [];

  for (let ix = 0; ix < X_SPANS.length; ix++) {
    const xs = X_SPANS[ix];
    const roadGapW = ix === 0 || ix === X_SPANS.length - 1 ? 0.2 : 4.8;
    const minX = xs.min + (ix === 0 ? 0.5 : roadGapW);
    const maxX = xs.max - (ix === X_SPANS.length - 1 ? 0.5 : roadGapW);
    const w = Math.max(4, maxX - minX);
    const cx = (minX + maxX) / 2;

    for (let iz = 0; iz < Z_SPANS.length; iz++) {
      const zs = Z_SPANS[iz];
      const minZ = zs.min + (iz === 0 ? 1.0 : 5.0);
      const maxZ = zs.max - (iz === Z_SPANS.length - 1 ? 1.0 : 5.0);
      const d = Math.max(4, maxZ - minZ);
      const cz = (minZ + maxZ) / 2;

      blockBoundsList.push({ ix, iz, minX, maxX, minZ, maxZ });

      dummy.position.set(cx, 0.07, cz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(w, 1, d);
      dummy.updateMatrix();
      sidewalkBlockInst.setMatrixAt(sbIdx++, dummy.matrix);

      // 4 painted curbstones per block
      dummy.position.set(cx, 0.085, minZ);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(w, 1, 1);
      dummy.updateMatrix();
      curbInst.setMatrixAt(cbIdx++, dummy.matrix);

      dummy.position.set(cx, 0.085, maxZ);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(w, 1, 1);
      dummy.updateMatrix();
      curbInst.setMatrixAt(cbIdx++, dummy.matrix);

      dummy.position.set(minX, 0.085, cz);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.scale.set(d, 1, 1);
      dummy.updateMatrix();
      curbInst.setMatrixAt(cbIdx++, dummy.matrix);

      dummy.position.set(maxX, 0.085, cz);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.scale.set(d, 1, 1);
      dummy.updateMatrix();
      curbInst.setMatrixAt(cbIdx++, dummy.matrix);
    }
  }
  sidewalkBlockInst.count = sbIdx;
  curbInst.count = cbIdx;
  scene.add(sidewalkBlockInst);
  scene.add(curbInst);

  // Instanced Zebra Crosswalk Stripes around major intersections
  const stripeGeo = trackGeo(new THREE.PlaneGeometry(0.62, 2.0));
  const stripeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xe5e0d5, roughness: 0.88 }));
  const stripeInst = new THREE.InstancedMesh(stripeGeo, stripeMat, 360);
  let stIdx = 0;
  for (const ix of [-55, -27.5, 0, 27.5, 55]) {
    for (const iz of [-67.5, -39.5, -11.5, 16.5, 44.5]) {
      for (let sx = -3.4; sx <= 3.4; sx += 1.7) {
        if (stIdx + 2 <= 360) {
          dummy.position.set(ix + sx, 0.032, iz - 5.4);
          dummy.rotation.set(-Math.PI / 2, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          stripeInst.setMatrixAt(stIdx++, dummy.matrix);

          dummy.position.set(ix + sx, 0.032, iz + 5.4);
          dummy.updateMatrix();
          stripeInst.setMatrixAt(stIdx++, dummy.matrix);
        }
      }
    }
  }
  stripeInst.count = stIdx;
  scene.add(stripeInst);

  // Instanced Street Lamps across all 60 streets + PointLights near central Hara
  const lampPostGeo = trackGeo(new THREE.CylinderGeometry(0.08, 0.13, 5.4, 8));
  const lampArmGeo = trackGeo(new THREE.BoxGeometry(1.1, 0.08, 0.08));
  const lampHeadGeo = trackGeo(new THREE.CylinderGeometry(0.18, 0.12, 0.28, 8));
  const streetLampBulbMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffe8a3,
      emissive: 0xffb703,
      emissiveIntensity: 0.25,
    }),
  );

  const lampCoords: Array<[number, number, number]> = [];
  for (const rx of NS_ROADS_X) {
    for (const zs of Z_SPANS) {
      lampCoords.push([rx + (rx <= 0 ? 5.2 : -5.2), zs.mid, rx <= 0 ? -1 : 1]);
    }
  }
  const lampPostInst = new THREE.InstancedMesh(lampPostGeo, matDarkIron, lampCoords.length);
  const lampArmInst = new THREE.InstancedMesh(lampArmGeo, matDarkIron, lampCoords.length);
  const lampHeadInst = new THREE.InstancedMesh(lampHeadGeo, streetLampBulbMat, lampCoords.length);
  const streetLampLights: THREE.PointLight[] = [];

  lampCoords.forEach(([lx, lz, armDir], i) => {
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.position.set(lx, 2.7, lz);
    dummy.updateMatrix();
    lampPostInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lx + armDir * 0.5, 5.35, lz);
    dummy.updateMatrix();
    lampArmInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lx + armDir * 0.95, 5.2, lz);
    dummy.updateMatrix();
    lampHeadInst.setMatrixAt(i, dummy.matrix);

    // Real point lights for the hero Hara & Corniche streets to keep shader cost crisp
    if (Math.abs(lx) < 34 && Math.abs(lz) < 42 && streetLampLights.length < 6) {
      const pt = new THREE.PointLight(0xffcb69, 0, 19, 1.6);
      pt.position.set(lx + armDir * 0.95, 5.05, lz);
      scene.add(pt);
      streetLampLights.push(pt);
    }
  });
  lampPostInst.instanceMatrix.needsUpdate = true;
  lampArmInst.instanceMatrix.needsUpdate = true;
  lampHeadInst.instanceMatrix.needsUpdate = true;
  scene.add(lampPostInst, lampArmInst, lampHeadInst);

  // Reserved AABB footprints so procedural towers & trees NEVER intersect bespoke buildings/shops/schools/gas
  const reservedBoxes: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }> = [
    // Hero central block & avenue core
    { minX: -24, maxX: 24, minZ: -32, maxZ: 38 },
    // Hero corner apartments
    { minX: -45, maxX: -32, minZ: -31, maxZ: -16 },
    { minX: 32, maxX: 45, minZ: -31, maxZ: -16 },
    // Gas station & market blocks
    { minX: GAS_STATION_DEF.x - 9, maxX: GAS_STATION_DEF.x + 9, minZ: GAS_STATION_DEF.z - 8, maxZ: GAS_STATION_DEF.z + 8 },
    // Corniche Penthouse
    { minX: 7, maxX: 21, minZ: -108, maxZ: -98 },
    // Remote 2nd-floor crew apartment
    {
      minX: REMOTE_CREW_APARTMENT.x - 8,
      maxX: REMOTE_CREW_APARTMENT.x + 9.5,
      minZ: REMOTE_CREW_APARTMENT.z - 8,
      maxZ: REMOTE_CREW_APARTMENT.z + 7.5,
    },
  ];
  SCHOOL_CAMPUSES.forEach((sch, si) => {
    const rx = si === 0 ? 11.5 : 10.5;
    const rz = si === 0 ? 11.5 : 10.0;
    reservedBoxes.push({ minX: sch.x - rx, maxX: sch.x + rx, minZ: sch.z - rz, maxZ: sch.z + rz });
  });
  CITY_SHOPS.forEach((s) => {
    reservedBoxes.push({ minX: s.x - 5.2, maxX: s.x + 5.2, minZ: s.z - 6.2, maxZ: s.z + 6.2 });
  });
  OWNABLE_BUILDINGS.forEach((b) => {
    reservedBoxes.push({ minX: b.x - 7.5, maxX: b.x + 7.5, minZ: b.z - 7.5, maxZ: b.z + 7.5 });
  });
  RESTAURANT_BRANCHES.forEach((br) => {
    reservedBoxes.push({ minX: br.x - 6.5, maxX: br.x + 6.5, minZ: br.z - 6.5, maxZ: br.z + 6.5 });
  });

  const overlapsReserved = (minX: number, maxX: number, minZ: number, maxZ: number, pad = 0.8): boolean =>
    reservedBoxes.some(
      (r) =>
        maxX + pad > r.minX &&
        minX - pad < r.maxX &&
        maxZ + pad > r.minZ &&
        minZ - pad < r.maxZ,
    );

  // Add lamppost colliders + 3D Arabic Street Sign Posts across major intersections
  lampCoords.forEach(([lx, lz]) => {
    colliders.push({ minX: lx - 0.25, maxX: lx + 0.25, minZ: lz - 0.25, maxZ: lz + 0.25 });
  });

  const streetSignAnchors: Array<{ x: number; z: number; nameAr: string; distAr: string; rotY: number }> = [
    { x: -5.4, z: -5.4, nameAr: 'شارع المعلم الرئيسي', distAr: 'حارة المعلم', rotY: Math.PI / 4 },
    { x: 5.4, z: -17.5, nameAr: 'شارع السوق وبنزين المعلم', distAr: 'بنزينة وسوق', rotY: -Math.PI / 4 },
    { x: -5.4, z: -61.8, nameAr: 'كورنيش وسط البلد', distAr: 'النيل والكورنيش', rotY: 0 },
    { x: 5.4, z: -90.0, nameAr: 'ممشى أهل مصر الأوسط', distAr: 'كورنيش النيل', rotY: 0 },
    { x: -33.0, z: -17.5, nameAr: 'شارع بقالة البركة', distAr: 'سوق الوكالة', rotY: Math.PI / 4 },
    { x: 33.0, z: -17.5, nameAr: 'شارع ورشة الأسطى بليغ', distAr: 'حي الورش', rotY: -Math.PI / 4 },
    { x: -33.0, z: 49.5, nameAr: 'شارع النهضة التعليمية', distAr: 'مدرسة بنها الخاصة', rotY: 0 },
    { x: -60.5, z: 49.5, nameAr: 'شارع الزهور والمدارس', distAr: 'سكن الدور التاني', rotY: 0 },
    { x: 33.0, z: 49.5, nameAr: 'شارع مدرسة المعلم', distAr: 'الحي السكني', rotY: 0 },
    { x: 60.5, z: -72.8, nameAr: 'كورنيش النزهة', distAr: 'الكورنيش الشرقي', rotY: 0 },
    { x: -60.5, z: -17.5, nameAr: 'شارع البقالين', distAr: 'سوق الغرب', rotY: 0 },
    { x: 60.5, z: -17.5, nameAr: 'شارع الأوتوستراد', distAr: 'الورش والعمائر', rotY: 0 },
  ];
  streetSignAnchors.forEach((st) => {
    const sg = new THREE.Group();
    sg.position.set(st.x, 0.14, st.z);
    sg.rotation.y = st.rotY;
    const pole = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.055, 0.07, 3.1, 8)), matDarkIron);
    pole.position.y = 1.55;
    sg.add(pole);
    const boardTex = textures.makeStreetSignTexture(st.nameAr, st.distAr);
    const boardMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, map: boardTex, roughness: 0.42 }));
    const plate = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.75, 0.62, 0.08)), boardMat);
    plate.position.y = 2.95;
    sg.add(plate);
    scene.add(sg);
    colliders.push({ minX: st.x - 0.18, maxX: st.x + 0.18, minZ: st.z - 0.18, maxZ: st.z + 0.18 });
  });

  // Instanced Trees & Nile Palms (multi-cluster organic foliage + textured bark + colliders + zero building overlaps!)
  const treeTrunkGeo = trackGeo(new THREE.CylinderGeometry(0.13, 0.24, 2.7, 10));
  const treeCrownGeo = trackGeo(new THREE.DodecahedronGeometry(1.18, 1));
  const treeCrownSubGeo = trackGeo(new THREE.DodecahedronGeometry(0.84, 1));
  const matTrunk = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x543824,
      bumpMap: textures.woodGrainBump,
      bumpScale: 0.04,
      roughness: 0.93,
    }),
  );
  const matFoliage = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x3f6834,
      bumpMap: textures.bumpNoise,
      bumpScale: 0.035,
      roughness: 0.86,
    }),
  );
  const matFoliageSub = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x4b773c,
      bumpMap: textures.bumpNoise,
      bumpScale: 0.03,
      roughness: 0.88,
    }),
  );

  const treeCoords: Array<[number, number, number]> = [];
  // Corniche Palm Trees along Z = -80.2
  for (let px = -70; px <= 70; px += 14) {
    if (!overlapsReserved(px - 0.8, px + 0.8, -81.0, -79.4, 0.5)) {
      treeCoords.push([px, -80.2, 1.35]);
    }
  }
  // District corner & sidewalk trees (strictly checked against RESERVED_BOXES)
  for (const blk of blockBoundsList) {
    const tx = (blk.minX + blk.maxX) / 2 + (blk.ix % 2 === 0 ? -7.5 : 7.5);
    const tz = blk.minZ + 1.4;
    if (overlapsReserved(tx - 1.2, tx + 1.2, tz - 1.2, tz + 1.2, 0.6)) continue;
    treeCoords.push([tx, tz, 0.95 + ((blk.ix + blk.iz) % 3) * 0.12]);
  }
  const trunkInst = new THREE.InstancedMesh(treeTrunkGeo, matTrunk, treeCoords.length);
  const crownInst = new THREE.InstancedMesh(treeCrownGeo, matFoliage, treeCoords.length);
  const crownSubInst = new THREE.InstancedMesh(treeCrownSubGeo, matFoliageSub, treeCoords.length * 2);
  treeCoords.forEach(([tx, tz, sc], i) => {
    const yaw = (i * 1.17) % (Math.PI * 2);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(sc, sc, sc);
    dummy.position.set(tx, 1.35 * sc, tz);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(i, dummy.matrix);

    colliders.push({ minX: tx - 0.32 * sc, maxX: tx + 0.32 * sc, minZ: tz - 0.32 * sc, maxZ: tz + 0.32 * sc });

    dummy.position.set(tx, 3.05 * sc, tz);
    dummy.scale.set(sc * 1.05, sc * 0.96, sc * 1.05);
    dummy.updateMatrix();
    crownInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(tx + Math.cos(yaw) * 0.62 * sc, 2.75 * sc, tz + Math.sin(yaw) * 0.62 * sc);
    dummy.scale.set(sc, sc * 0.88, sc);
    dummy.updateMatrix();
    crownSubInst.setMatrixAt(i * 2, dummy.matrix);

    dummy.position.set(tx - Math.cos(yaw) * 0.55 * sc, 3.35 * sc, tz - Math.sin(yaw) * 0.45 * sc);
    dummy.scale.set(sc * 0.92, sc * 0.85, sc * 0.92);
    dummy.updateMatrix();
    crownSubInst.setMatrixAt(i * 2 + 1, dummy.matrix);
  });
  scene.add(trunkInst);
  scene.add(crownInst);
  scene.add(crownSubInst);

  // Register interactive talking tree near Hara / Corniche
  if (treeCoords.length > 0) {
    const [firstTx, firstTz] = treeCoords[0];
    registerInteractable(
      'obj-tree-talk',
      'talk_object',
      'شجرة الجميز والنخيل',
      'اضغط [E] للكلام مع الشجرة',
      'E',
      new THREE.Vector3(firstTx, 1.2, firstTz),
      3.0,
      trunkInst,
      { objectKind: 'tree', objectId: 'obj-tree-talk' },
    );
  }

  // Prop Clutter Group (controlled by propDensity slider!)
  const propClutterGroup = new THREE.Group();
  scene.add(propClutterGroup);

  const bollardGeo = trackGeo(new THREE.CylinderGeometry(0.08, 0.1, 0.72, 8));
  const bollardInst = new THREE.InstancedMesh(bollardGeo, matDarkIron, 64);
  let blIdx = 0;
  for (const rx of [-27.5, 0, 27.5]) {
    for (const rz of [-39.5, -11.5, 16.5]) {
      for (const [ox, oz] of [
        [-5.6, -5.6],
        [5.6, -5.6],
        [-5.6, 5.6],
        [5.6, 5.6],
      ]) {
        if (blIdx < 64) {
          dummy.position.set(rx + ox, 0.45, rz + oz);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          bollardInst.setMatrixAt(blIdx++, dummy.matrix);
          colliders.push({
            minX: rx + ox - 0.16,
            maxX: rx + ox + 0.16,
            minZ: rz + oz - 0.16,
            maxZ: rz + oz + 0.16,
          });
        }
      }
    }
  }
  bollardInst.count = blIdx;
  propClutterGroup.add(bollardInst);

  // Daily-life Egyptian sidewalk props (wooden benches, green bins, red drinks fridge, vendor cart)
  const matBinGreen = trackMat(new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.55 }));
  const matDrinksFridge = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.drinksFridge,
      emissive: 0xef4444,
      emissiveIntensity: 0.18,
      roughness: 0.28,
    }),
  );
  const matVendorSign = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xffffff, map: textures.vendorBanner, roughness: 0.65 }),
  );

  const buildFruitCart = (includeSign: boolean): THREE.Group => {
    const cart = new THREE.Group();
    const bed = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.75, 0.14, 0.98)), matWood);
    bed.position.y = 0.74;
    cart.add(bed);
    const frame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.65, 0.34, 0.9)), matWoodDoor);
    frame.position.y = 0.94;
    cart.add(frame);
    const crateColorsLocal = [0xdc2626, 0x16a34a, 0xf59e0b, 0xea580c];
    for (let ci = 0; ci < 4; ci++) {
      const box = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.36, 0.22, 0.74)),
        trackMat(new THREE.MeshStandardMaterial({ color: crateColorsLocal[ci], roughness: 0.72 })),
      );
      box.position.set(-0.56 + ci * 0.38, 1.14, 0);
      cart.add(box);
    }
    for (const px of [-0.78, 0.78]) {
      for (const pz of [-0.42, 0.42]) {
        const post = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 1.45, 6)), matDarkIron);
        post.position.set(px, 1.45, pz);
        cart.add(post);
      }
    }
    const canopy = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.98, 0.12, 1.24)), matAwning);
    canopy.position.set(0, 2.2, 0);
    canopy.rotation.x = 0.1;
    cart.add(canopy);
    for (const wx of [-0.62, 0.62]) {
      for (const wz of [-0.52, 0.52]) {
        const wheel = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 14)), matWoodDoor);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(wx, 0.34, wz);
        cart.add(wheel);
      }
    }
    if (includeSign) {
      const aSign = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.68, 0.92, 0.08)), matVendorSign);
      aSign.position.set(1.22, 0.52, 0.32);
      aSign.rotation.y = -0.35;
      cart.add(aSign);
    }
    return cart;
  };

  const addSidewalkVignette = (vx: number, vz: number, yaw: number, withCart: boolean) => {
    const vig = new THREE.Group();
    vig.position.set(vx, 0.14, vz);
    vig.rotation.y = yaw;

    // Wooden park bench
    const seat = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.35, 0.08, 0.48)), matWood);
    seat.position.set(-1.1, 0.46, 0);
    vig.add(seat);
    const back = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.35, 0.42, 0.07)), matWood);
    back.position.set(-1.1, 0.72, -0.2);
    back.rotation.x = -0.15;
    vig.add(back);
    for (const lx of [-1.65, -0.55]) {
      const leg = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 0.46, 0.44)), matDarkIron);
      leg.position.set(lx, 0.23, 0);
      vig.add(leg);
    }

    // Green municipal trash bin
    const bin = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.46, 0.84, 0.46)), matBinGreen);
    bin.position.set(0.12, 0.42, -0.1);
    vig.add(bin);
    const lid = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.5, 0.1, 0.5)), matDarkIron);
    lid.position.set(0.12, 0.88, -0.1);
    vig.add(lid);

    // Red illuminated beverage cooler ("مشروبات")
    const cooler = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.68, 1.72, 0.62)), matDrinksFridge);
    cooler.position.set(1.0, 0.86, -0.12);
    vig.add(cooler);

    if (withCart) {
      const cart = buildFruitCart(true);
      cart.position.set(0.1, 0, 1.35);
      vig.add(cart);
    }
    propClutterGroup.add(vig);
  };

  addSidewalkVignette(-7.3, 7.6, Math.PI / 2, true);
  addSidewalkVignette(7.3, 7.2, -Math.PI / 2, false);
  addSidewalkVignette(-7.3, 25.0, Math.PI / 2, false);
  addSidewalkVignette(7.3, -22.5, -Math.PI / 2, true);

  // =========================================================================
  // 2. HIGH-DETAIL EGYPTIAN APARTMENT FACTORY & CITY SKYLINE BLOCKS
  // =========================================================================
  const matBalconyRail = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x2d241f, roughness: 0.55, metalness: 0.55 }),
  );
  const matWindowShutter = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x355c4a, roughness: 0.72, metalness: 0.05 }),
  );
  const matWindowFace = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.windowLouver,
      roughness: 0.35,
      metalness: 0.15,
      emissive: 0x543c1a,
      emissiveIntensity: 0.3,
    }),
  );
  const matAcUnit = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xdedad2, roughness: 0.55, metalness: 0.15 }),
  );
  const matWaterTank = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.42, metalness: 0.1 }),
  );

  function createEgyptianApartment(
    x: number,
    z: number,
    w: number,
    d: number,
    floors: number,
    facingDir: 1 | -1,
    useAltPlaster = false,
    yBase = 0,
    rotateY = 0,
  ): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, yBase, z);
    group.rotation.y = rotateY;
    const floorH = 3.4;
    const totalH = floors * floorH;

    const body = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(w, totalH, d)),
      useAltPlaster ? matPlasterB : matPlasterA,
    );
    body.position.y = totalH / 2;
    body.castShadow = !isSoftwareGl;
    body.receiveShadow = !isSoftwareGl;
    group.add(body);
    cameraOccluders.push(body);

    if (yBase === 0) {
      const plinth = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(w + 0.16, 0.75, d + 0.16)),
        matConcrete,
      );
      plinth.position.y = 0.38;
      group.add(plinth);
    }

    for (let f = 1; f <= floors; f++) {
      const belt = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(w + 0.22, 0.22, d + 0.22)),
        useAltPlaster ? matPlasterA : matPlasterB,
      );
      belt.position.y = f * floorH;
      group.add(belt);
    }

    const parapet = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(w + 0.32, 0.6, d + 0.32)),
      matPlasterB,
    );
    parapet.position.y = totalH + 0.3;
    group.add(parapet);

    const tank = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.62, 0.62, 1.25, 10)),
      matWaterTank,
    );
    tank.position.set(-facingDir * (w * 0.22), totalH + 0.92, d * 0.22);
    group.add(tank);

    const spindleGeo = trackGeo(new THREE.CylinderGeometry(0.025, 0.025, 0.78, 6));
    const balconyWidth = d * 0.52;
    for (let f = 1; f < floors; f++) {
      const fy = f * floorH + 1.1;
      const faceX = facingDir * (w / 2 + 0.05);

      const slab = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.98, 0.18, balconyWidth)),
        matPlasterA,
      );
      slab.position.set(facingDir * (w / 2 + 0.46), fy - 0.65, 0);
      group.add(slab);

      if (f === 2) {
        const mashFront = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.08, 0.88, balconyWidth)),
          matMashrabiya,
        );
        mashFront.position.set(facingDir * (w / 2 + 0.9), fy - 0.14, 0);
        group.add(mashFront);
      } else {
        const topRail = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.08, 0.06, balconyWidth)),
          matBalconyRail,
        );
        topRail.position.set(facingDir * (w / 2 + 0.9), fy + 0.15, 0);
        group.add(topRail);

        for (let s = -4; s <= 4; s += 2) {
          const sp = new THREE.Mesh(spindleGeo, matBalconyRail);
          sp.position.set(
            facingDir * (w / 2 + 0.9),
            fy - 0.22,
            (s / 4) * (balconyWidth * 0.46),
          );
          group.add(sp);
        }
      }

      for (const zOff of [-d * 0.28, d * 0.28]) {
        const win = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.12, 1.45, 1.15)),
          matWindowFace,
        );
        win.position.set(faceX, fy + 0.15, zOff);
        group.add(win);

        for (const sSide of [-0.7, 0.7]) {
          const shutter = new THREE.Mesh(
            trackGeo(new THREE.BoxGeometry(0.12, 1.42, 0.28)),
            matWindowShutter,
          );
          shutter.position.set(faceX + facingDir * 0.02, fy + 0.15, zOff + sSide);
          group.add(shutter);
        }
      }

      if (f % 2 === 1) {
        const ac = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.42, 0.55, 0.78)),
          matAcUnit,
        );
        ac.position.set(facingDir * (w / 2 + 0.24), fy + 0.1, d * 0.42);
        group.add(ac);
      }
    }

    scene.add(group);
    return group;
  }

  // Instanced City-Wide Apartment Towers across all 49 blocks (ultra-low draw calls!)
  const cityTowerGeo = trackGeo(new THREE.BoxGeometry(1, 1, 1));
  const towerPlasterA = new THREE.InstancedMesh(cityTowerGeo, matPlasterA, 64);
  const towerPlasterB = new THREE.InstancedMesh(cityTowerGeo, matPlasterB, 64);
  const towerWinBand = new THREE.InstancedMesh(cityTowerGeo, matWindowFace, 64);
  let tAIdx = 0;
  let tBIdx = 0;
  let tWIdx = 0;

  for (const blk of blockBoundsList) {
    // Check block center and safe quadrant against RESERVED_BOXES so zero overlaps occur
    let cx = (blk.minX + blk.maxX) / 2;
    let cz = (blk.minZ + blk.maxZ) / 2;
    let bw = Math.min(9.4, (blk.maxX - blk.minX) * 0.54);
    let bd = Math.min(8.2, (blk.maxZ - blk.minZ) * 0.5);

    if (overlapsReserved(cx - bw / 2, cx + bw / 2, cz - bd / 2, cz + bd / 2, 1.0)) {
      // Try shifting to clear rear corner of block if a shop occupies front
      bw = Math.min(6.4, (blk.maxX - blk.minX) * 0.36);
      bd = Math.min(6.0, (blk.maxZ - blk.minZ) * 0.34);
      const candidates: Array<[number, number]> = [
        [blk.maxX - bw / 2 - 1.2, blk.maxZ - bd / 2 - 1.2],
        [blk.minX + bw / 2 + 1.2, blk.maxZ - bd / 2 - 1.2],
        [blk.maxX - bw / 2 - 1.2, blk.minZ + bd / 2 + 1.2],
        [blk.minX + bw / 2 + 1.2, blk.minZ + bd / 2 + 1.2],
      ];
      const freeSlot = candidates.find(
        ([kx, kz]) => !overlapsReserved(kx - bw / 2, kx + bw / 2, kz - bd / 2, kz + bd / 2, 1.1),
      );
      if (!freeSlot) continue;
      cx = freeSlot[0];
      cz = freeSlot[1];
    }

    const isCorniche = blk.iz <= 1;
    const bh = isCorniche ? 19 + (blk.ix % 2) * 5 : 11 + ((blk.ix + blk.iz) % 3) * 3.5;

    dummy.rotation.set(0, 0, 0);
    dummy.position.set(cx, bh / 2, cz);
    dummy.scale.set(bw, bh, bd);
    dummy.updateMatrix();
    if ((blk.ix + blk.iz) % 2 === 0 && tAIdx < 64) {
      towerPlasterA.setMatrixAt(tAIdx++, dummy.matrix);
    } else if (tBIdx < 64) {
      towerPlasterB.setMatrixAt(tBIdx++, dummy.matrix);
    }

    if (tWIdx < 64) {
      dummy.position.set(cx, bh * 0.54, cz);
      dummy.scale.set(bw + 0.14, bh * 0.62, bd + 0.14);
      dummy.updateMatrix();
      towerWinBand.setMatrixAt(tWIdx++, dummy.matrix);
    }

    colliders.push({
      minX: cx - bw / 2 - 0.15,
      maxX: cx + bw / 2 + 0.15,
      minZ: cz - bd / 2 - 0.15,
      maxZ: cz + bd / 2 + 0.15,
    });
  }
  towerPlasterA.count = tAIdx;
  towerPlasterB.count = tBIdx;
  towerWinBand.count = tWIdx;
  scene.add(towerPlasterA);
  scene.add(towerPlasterB);
  scene.add(towerWinBand);

  // =========================================================================
  // 3. PHOTOREALISTIC FUL & TAAMEYA KITCHEN (محل المعلم) + HINGED BACK DOOR
  // =========================================================================
  const matKitchenWall = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.kitchenWallTiles,
      bumpMap: textures.tileBump,
      bumpScale: 0.02,
      roughness: 0.52,
      metalness: 0.08,
    }),
  );
  const matStainlessOil = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.stainlessOilSheen,
      roughness: 0.22,
      metalness: 0.78,
    }),
  );
  const matHammeredBrass = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.hammeredBrass,
      roughness: 0.28,
      metalness: 0.85,
    }),
  );

  const shopGroup = new THREE.Group();
  shopGroup.position.set(-13.0, 0, 0);
  scene.add(shopGroup);

  const shopFloor = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(8.4, 0.16, 9.6)),
    matShopTile,
  );
  shopFloor.position.set(0, 0.08, 0);
  shopFloor.receiveShadow = !isSoftwareGl;
  shopGroup.add(shopFloor);

  // Exterior shell + weathered ceramic tiled inner wall cladding
  const backWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.35, 4.0, 9.6)),
    matPlasterA,
  );
  backWall.position.set(-4.0, 2.0, 0);
  backWall.castShadow = !isSoftwareGl;
  shopGroup.add(backWall);
  cameraOccluders.push(backWall);
  colliders.push({ minX: -17.3, maxX: -16.7, minZ: -5.0, maxZ: 5.0 });

  const backWallTiles = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(9.2, 3.6)),
    matKitchenWall,
  );
  backWallTiles.rotation.y = Math.PI / 2;
  backWallTiles.position.set(-3.81, 1.9, 0);
  shopGroup.add(backWallTiles);

  // North wall with doorway cutout at X = -13.6..-12.45 so back hinged door opens!
  const northWallW = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.5, 4.0, 0.35)),
    matPlasterA,
  );
  northWallW.position.set(-2.4, 2.0, -4.65);
  shopGroup.add(northWallW);
  colliders.push({ minX: -17.2, maxX: -13.65, minZ: -5.0, maxZ: -4.4 });

  const northWallE = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(3.7, 4.0, 0.35)),
    matPlasterA,
  );
  northWallE.position.set(2.35, 2.0, -4.65);
  shopGroup.add(northWallE);
  colliders.push({ minX: -12.45, maxX: -8.6, minZ: -5.0, maxZ: -4.4 });

  const northTileStrip = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(3.3, 3.4)),
    matKitchenWall,
  );
  northTileStrip.position.set(-2.4, 1.85, -4.46);
  shopGroup.add(northTileStrip);

  createHingedDoor(
    'door-shop-side',
    'فتح / غلق الباب الجانبي للمحل',
    -13.6,
    -4.65,
    0,
    1.15,
    2.45,
    -Math.PI * 0.54,
    { minX: -13.65, maxX: -12.45, minZ: -4.95, maxZ: -4.35, active: true },
  );

  // South wall with sunlit shuttered kitchen window on left side (reference photo vibe!)
  const southWall = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(8.4, 4.0, 0.35)),
    matPlasterA,
  );
  southWall.position.set(0, 2.0, 4.65);
  shopGroup.add(southWall);
  cameraOccluders.push(southWall);
  colliders.push({ minX: -17.2, maxX: -8.6, minZ: 4.4, maxZ: 5.0 });

  const southTiles = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(8.0, 3.6)),
    matKitchenWall,
  );
  southTiles.rotation.y = Math.PI;
  southTiles.position.set(0, 1.9, 4.46);
  shopGroup.add(southTiles);

  // Sunlit glowing shutter window inside south kitchen wall
  const sunlitWinFrame = new THREE.Group();
  sunlitWinFrame.position.set(-1.3, 2.35, 4.44);
  const winGlow = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(1.75, 1.45)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfff3d1,
        emissive: 0xffd27d,
        emissiveIntensity: 0.72,
        roughness: 0.25,
      }),
    ),
  );
  winGlow.rotation.y = Math.PI;
  sunlitWinFrame.add(winGlow);
  for (const sx of [-0.9, 0, 0.9]) {
    const mullion = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 1.5, 0.08)), matWood);
    mullion.position.x = sx;
    sunlitWinFrame.add(mullion);
  }
  shopGroup.add(sunlitWinFrame);

  const frontJambN = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.4, 4.0, 1.85)),
    matPlasterB,
  );
  frontJambN.position.set(4.1, 2.0, -3.72);
  shopGroup.add(frontJambN);
  cameraOccluders.push(frontJambN);
  colliders.push({ minX: -9.2, maxX: -8.6, minZ: -4.8, maxZ: -2.8 });

  const frontJambS = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.4, 4.0, 1.85)),
    matPlasterB,
  );
  frontJambS.position.set(4.1, 2.0, 3.72);
  shopGroup.add(frontJambS);
  cameraOccluders.push(frontJambS);
  colliders.push({ minX: -9.2, maxX: -8.6, minZ: 2.8, maxZ: 4.8 });

  const frontLintel = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.45, 0.9, 9.6)),
    matPlasterB,
  );
  frontLintel.position.set(4.1, 3.6, 0);
  shopGroup.add(frontLintel);

  const upperAptOverShop = createEgyptianApartment(-13.0, 0, 8.2, 9.4, 3, 1, false, 4.0);

  // =========================================================================
  // 3B. RESTAURANT FLOORS 2 & 3 (أدوار المطعم الإضافية + سلالم خارجية)
  // =========================================================================
  const restaurantFloor2Group = new THREE.Group();
  restaurantFloor2Group.visible = false;
  scene.add(restaurantFloor2Group);

  // Exterior South Staircase climbing X = -9.2 -> -16.8, Z = 5.65
  for (let si = 0; si < 14; si++) {
    const t = si / 13;
    const step = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.62, 0.22, 1.45)), matConcrete);
    step.position.set(THREE.MathUtils.lerp(-9.4, -16.6, t), 0.16 + t * 3.45, 5.65);
    restaurantFloor2Group.add(step);
  }
  const f2Rail = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(7.8, 0.08, 0.08)), matBalconyRail);
  f2Rail.position.set(-13.0, 2.7, 6.4);
  f2Rail.rotation.z = -0.43;
  restaurantFloor2Group.add(f2Rail);

  const f2Deck = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.6, 0.24, 9.6)), matShopTile);
  f2Deck.position.set(-13.0, 3.55, 0);
  restaurantFloor2Group.add(f2Deck);
  const f2Roof = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.6, 0.24, 9.6)), matPlasterA);
  f2Roof.position.set(-13.0, 7.02, 0);
  restaurantFloor2Group.add(f2Roof);
  const f2Back = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 3.4, 9.4)), matPlasterA);
  f2Back.position.set(-17.0, 5.3, 0);
  restaurantFloor2Group.add(f2Back);
  const f2North = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.4, 3.4, 0.32)), matPlasterA);
  f2North.position.set(-13.0, 5.3, -4.65);
  restaurantFloor2Group.add(f2North);
  const f2FrontGlass = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.14, 2.4, 9.0)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.32, roughness: 0.15 })),
  );
  f2FrontGlass.position.set(-8.85, 5.2, 0);
  restaurantFloor2Group.add(f2FrontGlass);
  const f2SignTex = textures.makeCustomShopSign('صالة العائلات — الدور التاني', 'مطعم المعلم — جلسة مكيفة', '#0f172a', '#fbbf24', '#fffbeb');
  const f2Sign = createIlluminatedSign(5.0, 1.05, f2SignTex, 0xfbbf24);
  f2Sign.rotation.y = Math.PI / 2;
  f2Sign.position.set(-8.65, 6.85, 0);
  restaurantFloor2Group.add(f2Sign);
  for (const dz of [-2.4, 0, 2.4]) {
    const tTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.1, 0.08, 1.1)), matWood);
    tTop.position.set(-11.4, 4.45, dz);
    restaurantFloor2Group.add(tTop);
    const tLeg = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.08, 0.78, 8)), matDarkIron);
    tLeg.position.set(-11.4, 4.05, dz);
    restaurantFloor2Group.add(tLeg);
  }

  const restaurantFloor3Group = new THREE.Group();
  restaurantFloor3Group.visible = false;
  scene.add(restaurantFloor3Group);
  // Exterior West Staircase climbing Z = 4.4 -> -4.4 at X = -17.9
  for (let si = 0; si < 14; si++) {
    const t = si / 13;
    const step = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.45, 0.22, 0.62)), matConcrete);
    step.position.set(-17.9, 3.65 + t * 3.45, THREE.MathUtils.lerp(4.2, -4.2, t));
    restaurantFloor3Group.add(step);
  }
  const f3Deck = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.6, 0.24, 9.6)), matShopTile);
  f3Deck.position.set(-13.0, 7.05, 0);
  restaurantFloor3Group.add(f3Deck);
  const f3Pergola = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.4, 0.2, 9.4)), matWood);
  f3Pergola.position.set(-13.0, 10.35, 0);
  restaurantFloor3Group.add(f3Pergola);
  for (const px of [-17.0, -9.0]) {
    for (const pz of [-4.4, 4.4]) {
      const col = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.28, 3.3, 0.28)), matPlasterB);
      col.position.set(px, 8.7, pz);
      restaurantFloor3Group.add(col);
    }
  }
  const f3SignTex = textures.makeCustomShopSign('روف المعلم VIP — الدور التالت', 'جلسة مفتوحة وإطلالة الحارة', '#31102f', '#f472b6', '#fdf2f8');
  const f3Sign = createIlluminatedSign(5.2, 1.05, f3SignTex, 0xf472b6);
  f3Sign.rotation.y = Math.PI / 2;
  f3Sign.position.set(-8.65, 10.1, 0);
  restaurantFloor3Group.add(f3Sign);

  const setRestaurantFloors = (floors: number) => {
    upperAptOverShop.visible = floors <= 1;
    restaurantFloor2Group.visible = floors >= 2;
    restaurantFloor3Group.visible = floors >= 3;
  };

  // =========================================================================
  // 3C. ELECTRONIC LED AD BOARD INSIDE SHOP (لوحة إعلانات إلكترونية تفاعلية)
  // =========================================================================
  const adBoardGroup = new THREE.Group();
  adBoardGroup.position.set(-9.4, 2.58, -1.85);
  adBoardGroup.rotation.y = Math.PI / 2;
  const adFrame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.35, 1.02, 0.14)), matDarkIron);
  adBoardGroup.add(adFrame);
  const adScreenMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.adBoardScreen,
      emissiveMap: textures.adBoardScreen,
      emissive: 0xffffff,
      emissiveIntensity: 0.78,
      roughness: 0.2,
    }),
  );
  const adScreenMesh = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(2.2, 0.88)), adScreenMat);
  adScreenMesh.position.z = 0.08;
  adBoardGroup.add(adScreenMesh);
  // Dual-sided screen visible from outside sidewalk too!
  const adScreenBack = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(2.2, 0.88)), adScreenMat);
  adScreenBack.position.z = -0.08;
  adScreenBack.rotation.y = Math.PI;
  adBoardGroup.add(adScreenBack);
  scene.add(adBoardGroup);
  registerInteractable(
    'obj-ad-board',
    'talk_object',
    'شاشة الإعلانات الإلكترونية بالمحل',
    'اضغط [E] للتفاعل والكلام مع شاشة العروض أو عدّلها من الموبايل',
    'E',
    new THREE.Vector3(-9.4, 1.8, -1.85),
    3.2,
    adBoardGroup,
    { objectKind: 'ad_board', objectId: 'obj-ad-board' },
  );

  const setAdBoardDisplay = (board: ElectronicAdBoardState) => {
    textures.updateAdBoardTexture(
      board.headlineAr,
      board.promoTextAr,
      board.discountPct,
      board.active,
    );
    adScreenMat.emissiveIntensity = board.active ? 0.82 : 0.12;
  };

  const shutterMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.rollerShutter,
      roughness: 0.44,
      metalness: 0.68,
    }),
  );
  const shutterMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.14, 3.0, 5.65)),
    shutterMat,
  );
  shutterMesh.position.set(-8.85, 3.25, 0);
  scene.add(shutterMesh);

  const shopSignGroup = createIlluminatedSign(5.2, 1.45, textures.signShop, 0xf5b400);
  shopSignGroup.rotation.y = Math.PI / 2;
  shopSignGroup.position.set(-8.55, 4.35, 0);
  scene.add(shopSignGroup);

  const awning = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.2, 0.12, 6.2)),
    matAwning,
  );
  awning.position.set(-7.75, 3.25, 0);
  awning.rotation.z = -0.28;
  scene.add(awning);

  // Stainless steel exhaust hood + wall spice racks + pendant tungsten bulbs
  const exhaustHood = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.65, 1.35, 0.78, 4)),
    matSteel,
  );
  exhaustHood.rotation.y = Math.PI / 4;
  exhaustHood.position.set(-15.8, 3.42, 1.2);
  scene.add(exhaustHood);

  const exhaustDuct = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.55, 0.9, 0.55)),
    matSteel,
  );
  exhaustDuct.position.set(-15.8, 3.85, 1.2);
  scene.add(exhaustDuct);

  for (const bz of [-1.2, 1.5]) {
    const cord = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.015, 0.015, 0.95, 6)), matDarkIron);
    cord.position.set(-13.4, 3.55, bz);
    scene.add(cord);
    const bulb = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.085, 10, 8)),
      trackMat(new THREE.MeshStandardMaterial({ color: 0xfff8dc, emissive: 0xffd166, emissiveIntensity: 1.4 })),
    );
    bulb.position.set(-13.4, 3.05, bz);
    scene.add(bulb);
  }

  const fridge = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.78, 2.1, 1.12)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.fridgeFront,
        roughness: 0.22,
        metalness: 0.35,
        emissive: 0x2563eb,
        emissiveIntensity: 0.32,
      }),
    ),
  );
  fridge.position.set(-16.2, 1.2, -3.5);
  scene.add(fridge);

  const spiceRack = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.18, 1.35, 2.4)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, map: textures.spiceShelf, roughness: 0.55 })),
  );
  spiceRack.position.set(-16.65, 2.35, -1.5);
  scene.add(spiceRack);

  const spiceRack2 = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.24, 0.06, 2.6)),
    matSteel,
  );
  spiceRack2.position.set(-16.58, 2.15, 2.1);
  scene.add(spiceRack2);

  const shopTv = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.1, 0.65, 1.05)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.tvScene,
        emissive: 0x3b82f6,
        emissiveIntensity: 0.28,
        roughness: 0.2,
      }),
    ),
  );
  shopTv.position.set(-16.65, 3.05, 3.2);
  scene.add(shopTv);

  const menuMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.08, 1.75, 1.45)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, map: textures.menuBoard, roughness: 0.42 })),
  );
  menuMesh.position.set(-16.68, 2.35, 0.5);
  scene.add(menuMesh);

  for (const tz of [-3.6, 3.6]) {
    const tblGroup = new THREE.Group();
    tblGroup.position.set(-7.1, 0.14, tz);
    const tTop = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 14)), matWood);
    tTop.position.y = 0.72;
    tblGroup.add(tTop);
    const tLeg = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.08, 0.72, 8)), matDarkIron);
    tLeg.position.y = 0.36;
    tblGroup.add(tLeg);
    scene.add(tblGroup);
  }

  const shopLightMain = new THREE.PointLight(0xffcf87, 3.8, 15, 1.5);
  shopLightMain.position.set(-13.2, 3.1, 0);
  scene.add(shopLightMain);
  const shopLightSign = new THREE.PointLight(0xffe4a8, 1.9, 9, 1.6);
  shopLightSign.position.set(-7.6, 3.6, 0);
  scene.add(shopLightSign);

  // Prep Counter & Back Table with realistic stainless oil-sheen tops + knives + kettle + mortar
  const prepCounterGroup = new THREE.Group();
  prepCounterGroup.position.set(-12.2, 0.16, 0);
  const counterBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.18, 0.88, 5.0)), matDarkIron);
  counterBase.position.y = 0.44;
  prepCounterGroup.add(counterBase);
  const counterTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.32, 0.08, 5.14)), matStainlessOil);
  counterTop.position.y = 0.92;
  prepCounterGroup.add(counterTop);
  scene.add(prepCounterGroup);
  colliders.push({ minX: -12.85, maxX: -11.55, minZ: -2.55, maxZ: 2.55 });

  // Kitchen Knives + Tea Kettle + Stone Mortar & Pestle
  for (const kz of [1.55, 1.78]) {
    const blade = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.28, 0.01, 0.045)), matSteel);
    blade.position.set(-11.78, 1.13, kz);
    blade.rotation.y = 0.25;
    scene.add(blade);
    const grip = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.12, 0.025, 0.032)), matDarkIron);
    grip.position.set(-11.6, 1.13, kz + 0.045);
    grip.rotation.y = 0.25;
    scene.add(grip);
  }
  const teaKettle = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.11, 0.14, 0.22, 12)), matSteel);
  teaKettle.position.set(-12.45, 1.24, -2.05);
  scene.add(teaKettle);
  const stoneMortar = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.13, 0.1, 0.16, 12)), matConcrete);
  stoneMortar.position.set(-11.82, 1.2, -1.9);
  scene.add(stoneMortar);

  const backTable = new THREE.Group();
  backTable.position.set(-15.5, 0.16, 0);
  const btBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.1, 0.88, 5.4)), matDarkIron);
  btBase.position.y = 0.44;
  backTable.add(btBase);
  const btTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.2, 0.08, 5.5)), matStainlessOil);
  btTop.position.y = 0.92;
  backTable.add(btTop);
  scene.add(backTable);
  colliders.push({ minX: -16.15, maxX: -14.85, minZ: -2.75, maxZ: 2.75 });

  // Two animated co-workers inside the kitchen (matches reference photo!)
  const coworkerStyles: CharacterStyleOptions[] = [
    { shirtColor: 0x4b5563, pantsColor: 0x1f2937, skinColor: 0xc99168, hasApron: true, hasMustache: true, hatType: 'hair' },
    { shirtColor: 0x374151, pantsColor: 0x111827, skinColor: 0xc2875e, hasApron: true, hasBeard: true, hatType: 'hair' },
  ];
  const coworkerCoords: Array<[number, number, number]> = [
    [-14.3, -1.45, Math.PI / 2],
    [-14.3, 1.45, Math.PI / 2],
  ];
  coworkerCoords.forEach(([wx, wz, wyaw], ci) => {
    const cw = rigFactory.createActor(coworkerStyles[ci]);
    cw.group.position.set(wx, 0.16, wz);
    cw.group.rotation.y = wyaw;
    animateHumanActor(cw, 'idle', ci * 1.4, 0.016);
    fulCoworkers.push(cw);
  });

  // Stations
  const breadGroup = new THREE.Group();
  breadGroup.position.set(-12.2, 1.12, 2.2);
  breadGroup.add(new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.38, 0.28, 0.22, 14)), matWood));
  const matBread = trackMat(new THREE.MeshStandardMaterial({ color: 0xd9b37c, roughness: 0.92 }));
  for (let i = 0; i < 6; i++) {
    const loaf = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.042, 14)), matBread);
    loaf.position.set((i % 2) * 0.025, 0.06 + i * 0.044, 0);
    breadGroup.add(loaf);
  }
  scene.add(breadGroup);
  registerInteractable('station-bread', 'pick_bread', 'التقاط رغيف عيش بلدي', 'ابدأ تجهيز السندوتش', 'E', new THREE.Vector3(-12.2, 1.15, 2.2), 2.4, breadGroup);

  // Hammered Brass Ful Qidra Pot + Blue Gas Burner Ring
  const fulPotGroup = new THREE.Group();
  fulPotGroup.position.set(-12.2, 1.12, 1.0);
  const burnerBox = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.72, 0.12, 0.72)), matStainlessOil);
  burnerBox.position.y = 0.05;
  fulPotGroup.add(burnerBox);
  const blueFlameRing = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.19, 0.028, 8, 20)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.6, roughness: 0.2 })),
  );
  blueFlameRing.rotation.x = Math.PI / 2;
  blueFlameRing.position.y = 0.13;
  fulPotGroup.add(blueFlameRing);
  const idraProfile = [
    new THREE.Vector2(0.0, 0.13),
    new THREE.Vector2(0.25, 0.15),
    new THREE.Vector2(0.36, 0.29),
    new THREE.Vector2(0.34, 0.46),
    new THREE.Vector2(0.18, 0.65),
    new THREE.Vector2(0.16, 0.75),
    new THREE.Vector2(0.22, 0.81),
    new THREE.Vector2(0.14, 0.73),
  ];
  fulPotGroup.add(new THREE.Mesh(trackGeo(new THREE.LatheGeometry(idraProfile, 22)), matHammeredBrass));
  const ladle = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 8)), matSteel);
  ladle.position.set(0.08, 0.85, 0);
  ladle.rotation.z = -0.35;
  fulPotGroup.add(ladle);
  scene.add(fulPotGroup);
  registerInteractable('station-ful', 'add_ful', 'إضافة فول مدمس', 'من القدرة النحاس على النار', 'E', new THREE.Vector3(-12.2, 1.4, 1.0), 2.4, fulPotGroup);

  // Commercial Stainless Deep Fryer + Golden Oil + Wire Skimmer Ladle
  const fryerGroup = new THREE.Group();
  fryerGroup.position.set(-12.2, 1.12, -0.35);
  const fryerHousing = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.86, 0.24, 0.96)), matStainlessOil);
  fryerHousing.position.y = 0.12;
  fryerGroup.add(fryerHousing);
  const oilSurface = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.7, 0.04, 0.8)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xe3a830, roughness: 0.1, emissive: 0x6b3a00, emissiveIntensity: 0.38 })),
  );
  oilSurface.position.y = 0.23;
  fryerGroup.add(oilSurface);
  const matTaameya = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xb0752a,
      bumpMap: textures.bumpNoise,
      bumpScale: 0.03,
      roughness: 0.76,
    }),
  );
  for (let i = 0; i < 8; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const patty = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.072, 0.072, 0.04, 12)), matTaameya);
    patty.position.set(-0.14 + col * 0.28, 0.25, -0.26 + row * 0.17);
    fryerGroup.add(patty);
    fryingPatties.push(patty);
  }
  const bubbleMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.25, emissive: 0xd97706, emissiveIntensity: 0.35 }),
  );
  for (let b = 0; b < 6; b++) {
    const bub = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.018, 6, 6)), bubbleMat);
    bub.position.set(-0.2 + (b % 3) * 0.2, 0.252, -0.22 + Math.floor(b / 3) * 0.42);
    fryerGroup.add(bub);
    fryingPatties.push(bub);
  }
  // Wire-mesh skimmer ladle resting over the fryer
  const skimmerMesh = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.11, 0.012, 8, 16)), matSteel);
  skimmerMesh.rotation.x = Math.PI / 2;
  skimmerMesh.position.set(0.06, 0.34, 0.05);
  fryerGroup.add(skimmerMesh);
  const skimmerHandle = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 6)), matDarkIron);
  skimmerHandle.rotation.z = Math.PI / 2 - 0.18;
  skimmerHandle.position.set(0.32, 0.39, 0.05);
  fryerGroup.add(skimmerHandle);
  scene.add(fryerGroup);
  registerInteractable('station-taameya', 'add_taameya', 'إضافة طعمية مقلية', 'سخنة ومقرمشة من القلاية', 'E', new THREE.Vector3(-12.2, 1.35, -0.35), 2.4, fryerGroup);

  // Golden Sizzle Ring Indicator above Deep Fryer
  const sizzleRingMesh = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.48, 0.035, 8, 22)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.5,
      }),
    ),
  );
  sizzleRingMesh.rotation.x = Math.PI / 2;
  sizzleRingMesh.position.set(-12.2, 1.42, -0.35);
  sizzleRingMesh.visible = false;
  scene.add(sizzleRingMesh);

  // Visible 3D Shop Upgrade Meshes (revealed dynamically as fryerLevel/fulPotLevel/decorLevel >= 2!)
  const upgradedFulPot2 = new THREE.Group();
  upgradedFulPot2.position.set(-12.2, 1.12, 1.65);
  upgradedFulPot2.add(new THREE.Mesh(trackGeo(new THREE.LatheGeometry(idraProfile, 18)), matHammeredBrass));
  upgradedFulPot2.visible = false;
  scene.add(upgradedFulPot2);

  const upgradedFryerAddons = new THREE.Group();
  const extraBasket = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 0.16, 0.36)), matSteel);
  extraBasket.position.set(-12.2, 1.42, -0.58);
  upgradedFryerAddons.add(extraBasket);
  const extraBasket2 = extraBasket.clone();
  extraBasket2.position.z = -0.12;
  upgradedFryerAddons.add(extraBasket2);
  upgradedFryerAddons.visible = false;
  scene.add(upgradedFryerAddons);

  const upgradedDecorAddons = new THREE.Group();
  for (const pz of [-3.3, 3.3]) {
    const planter = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.28, 0.22, 0.45, 10)), matConcrete);
    planter.position.set(-8.2, 0.36, pz);
    upgradedDecorAddons.add(planter);
    const foliage = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.38, 8, 8)),
      trackMat(new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })),
    );
    foliage.position.set(-8.2, 0.85, pz);
    upgradedDecorAddons.add(foliage);
  }
  const acUnit = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.24, 0.38, 1.25)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 })),
  );
  acUnit.position.set(-16.65, 3.3, -1.8);
  upgradedDecorAddons.add(acUnit);
  upgradedDecorAddons.visible = false;
  scene.add(upgradedDecorAddons);

  const makeIngredientBowl = (x: number, y: number, z: number, fillColor: number, accentColor?: number): THREE.Group => {
    const grp = new THREE.Group();
    grp.position.set(x, y, z);
    const pan = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.24, 0.18, 0.14, 14)), matSteel);
    pan.position.y = 0.07;
    grp.add(pan);
    const contents = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.21, 0.19, 0.06, 12)),
      trackMat(new THREE.MeshStandardMaterial({ color: fillColor, roughness: 0.65 })),
    );
    contents.position.y = 0.12;
    grp.add(contents);
    if (accentColor !== undefined) {
      const garnishMat = trackMat(new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.65 }));
      for (let g = 0; g < 4; g++) {
        const chunk = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.06, 0.04, 0.06)), garnishMat);
        chunk.position.set(Math.cos(g * 1.57) * 0.08, 0.15, Math.sin(g * 1.57) * 0.08);
        grp.add(chunk);
      }
    }
    scene.add(grp);
    return grp;
  };
  const saladBowl = makeIngredientBowl(-12.2, 1.12, -1.55, 0x4ca65c, 0xef4444);
  registerInteractable('station-salad', 'add_salad', 'إضافة سلطة خضراء', 'طماطم وخيار وبصل', 'E', new THREE.Vector3(-12.2, 1.25, -1.55), 2.4, saladBowl);
  const tahinaBowl = makeIngredientBowl(-12.2, 1.12, -2.45, 0xefe2be);
  registerInteractable('station-tahina', 'add_tahina', 'إضافة طحينة', 'صلصة طحينة بالكمون', 'E', new THREE.Vector3(-12.2, 1.25, -2.45), 2.4, tahinaBowl);
  const picklesBowl = makeIngredientBowl(-15.4, 1.12, -1.3, 0xdb2777, 0xfacc15);
  registerInteractable('station-pickles', 'add_pickles', 'إضافة مخلل بلدي', 'مخلل لفت وجزر وفلفل', 'E', new THREE.Vector3(-15.4, 1.25, -1.3), 2.4, picklesBowl);
  const friesBowl = makeIngredientBowl(-15.4, 1.12, 1.3, 0xfacc15, 0xeab308);
  registerInteractable('station-fries', 'add_fries', 'إضافة بطاطس محمرة', 'مقرمشة من القلاية', 'E', new THREE.Vector3(-15.4, 1.25, 1.3), 2.4, friesBowl);

  const discardBin = new THREE.Group();
  discardBin.position.set(-15.4, 1.12, 0);
  discardBin.add(new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.45, 0.08, 0.55)), matDarkIron));
  scene.add(discardBin);
  registerInteractable('station-discard', 'discard_sandwich', 'تفريغ السندوتش الحالي', 'إعادة التجهيز من البداية', 'E', new THREE.Vector3(-15.4, 1.2, 0), 2.2, discardBin);

  const serveCounter = new THREE.Group();
  serveCounter.position.set(-9.9, 0.16, 0);
  const scBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.85, 0.9, 2.0)), matWood);
  scBase.position.y = 0.45;
  serveCounter.add(scBase);
  const scPlinth = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.89, 0.09, 2.04)), matDarkIron);
  scPlinth.position.y = 0.045;
  serveCounter.add(scPlinth);
  const scTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.95, 0.08, 2.1)), matStainlessOil);
  scTop.position.y = 0.94;
  serveCounter.add(scTop);
  // Glass sneeze-guard display shelf (like the Egyptian shop reference photo!)
  const matDisplayGlass = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      roughness: 0.08,
      transmission: 0.55,
      transparent: true,
      opacity: 0.42,
    }),
  );
  for (const gz of [-0.62, 0.28]) {
    const post = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 8)), matSteel);
    post.position.set(0.36, 1.18, gz);
    serveCounter.add(post);
  }
  const glassFront = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.025, 0.36, 0.96)), matDisplayGlass);
  glassFront.position.set(0.38, 1.16, -0.17);
  serveCounter.add(glassFront);
  const glassTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.36, 0.022, 0.96)), matDisplayGlass);
  glassTop.position.set(0.22, 1.36, -0.17);
  serveCounter.add(glassTop);

  const regBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.42, 0.24, 0.48)), matDarkIron);
  regBody.position.set(0, 1.10, 0.65);
  serveCounter.add(regBody);

  // Cashier LED POS Display & Dual Customer Numeric Screen + Thermal Receipt Printer
  const matPosScreen = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      emissive: 0x10b981,
      emissiveIntensity: 0.95,
      roughness: 0.22,
    }),
  );
  const matPosBezel = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.45,
      metalness: 0.3,
    }),
  );
  const matReceiptPaper = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0xf1f5f9,
      emissiveIntensity: 0.2,
      roughness: 0.9,
    }),
  );

  // Main angled cashier touch monitor (facing kitchen/cashier at -X)
  const posMonitorGroup = new THREE.Group();
  posMonitorGroup.position.set(-0.04, 1.33, 0.63);
  const posNeck = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.025, 0.032, 0.16, 8)), matPosBezel);
  posNeck.position.y = -0.08;
  posMonitorGroup.add(posNeck);
  const posFrame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.05, 0.25, 0.36)), matPosBezel);
  posFrame.rotation.z = -0.25;
  posMonitorGroup.add(posFrame);
  const posFace = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.015, 0.21, 0.32)), matPosScreen);
  posFace.position.set(-0.024, 0.004, 0);
  posFace.rotation.z = -0.25;
  posMonitorGroup.add(posFace);
  serveCounter.add(posMonitorGroup);

  // Customer-facing 7-segment LED total pole display (facing +X)
  const custPole = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.016, 0.016, 0.28, 8)), matSteel);
  custPole.position.set(0.16, 1.34, 0.52);
  serveCounter.add(custPole);
  const custDisplayBox = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.05, 0.09, 0.22)), matPosBezel);
  custDisplayBox.position.set(0.16, 1.49, 0.52);
  serveCounter.add(custDisplayBox);
  const custDisplayLed = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.012, 0.06, 0.19)), matPosScreen);
  custDisplayLed.position.set(0.184, 1.49, 0.52);
  serveCounter.add(custDisplayLed);

  // Thermal Receipt Printer + emerging receipt slip
  const printerBox = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.16, 0.11, 0.15)), matPosBezel);
  printerBox.position.set(-0.06, 1.03, 0.94);
  serveCounter.add(printerBox);
  const receiptSlip = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 0.09, 0.008)), matReceiptPaper);
  receiptSlip.position.set(-0.06, 1.11, 0.94);
  receiptSlip.rotation.x = 0.22;
  serveCounter.add(receiptSlip);

  scene.add(serveCounter);
  colliders.push({ minX: -10.4, maxX: -9.4, minZ: -1.05, maxZ: 1.05 });
  registerInteractable('station-serve', 'serve_customer', 'تسليم الطلب للزبون', 'استلام الحساب والبقشيش', 'E', new THREE.Vector3(-9.9, 1.2, -0.15), 2.8, serveCounter);
  registerInteractable('station-pos', 'open_cashier', 'فتح شاشة الكاشير والفواتير', 'المنيو الكامل · الآلة الحاسبة · استفسارات الزبائن [K]', 'K', new THREE.Vector3(-9.9, 1.34, 0.78), 2.35, posMonitorGroup);

  // First-Person Kitchen Cook Hands + Sculpted Sleeves + Ladle + Skimmer (visible inside kitchen in FP mode!)
  const cookHandsGroup = new THREE.Group();
  cookHandsGroup.visible = false;
  const handSkinMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xc99168,
      map: textures.skinMicro,
      roughness: 0.66,
    }),
  );
  const apronSleeveMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      bumpMap: textures.fabricWeave,
      bumpScale: 0.015,
      roughness: 0.84,
    }),
  );
  // Right arm & hand holding wire-mesh skimmer
  const rSleeve = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.046, 0.054, 0.14, 12)), apronSleeveMat);
  rSleeve.position.set(0.27, -0.27, -0.25);
  rSleeve.rotation.set(Math.PI * 0.42, 0, -0.2);
  cookHandsGroup.add(rSleeve);
  const rForearm = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.034, 0.043, 0.22, 12)), handSkinMat);
  rForearm.position.set(0.23, -0.20, -0.37);
  rForearm.rotation.set(Math.PI * 0.42, 0, -0.2);
  cookHandsGroup.add(rForearm);
  const rPalm = new THREE.Mesh(trackGeo(new THREE.CapsuleGeometry(0.028, 0.044, 4, 8)), handSkinMat);
  rPalm.position.set(0.195, -0.14, -0.47);
  rPalm.rotation.set(Math.PI * 0.42, 0, -0.2);
  cookHandsGroup.add(rPalm);
  const rThumb = new THREE.Mesh(trackGeo(new THREE.CapsuleGeometry(0.011, 0.024, 4, 6)), handSkinMat);
  rThumb.position.set(0.165, -0.125, -0.46);
  rThumb.rotation.z = 0.5;
  cookHandsGroup.add(rThumb);
  const rHandle = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.01, 0.01, 0.36, 8)), matDarkIron);
  rHandle.rotation.x = Math.PI * 0.46;
  rHandle.rotation.z = 0.42;
  rHandle.position.set(0.11, -0.13, -0.58);
  cookHandsGroup.add(rHandle);
  const rBasket = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.065, 0.008, 8, 18)), matSteel);
  rBasket.rotation.x = Math.PI / 2;
  rBasket.position.set(0.0, -0.14, -0.73);
  cookHandsGroup.add(rBasket);
  // Left arm & hand holding hammered brass ladle scoop
  const lSleeve = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.045, 0.052, 0.16, 12)), apronSleeveMat);
  lSleeve.position.set(-0.25, -0.27, -0.24);
  lSleeve.rotation.set(Math.PI * 0.44, 0, 0.22);
  cookHandsGroup.add(lSleeve);
  const lForearm = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.034, 0.041, 0.22, 12)), handSkinMat);
  lForearm.position.set(-0.20, -0.21, -0.36);
  lForearm.rotation.set(Math.PI * 0.44, 0, 0.22);
  cookHandsGroup.add(lForearm);
  const lPalm = new THREE.Mesh(trackGeo(new THREE.CapsuleGeometry(0.028, 0.042, 4, 8)), handSkinMat);
  lPalm.position.set(-0.165, -0.16, -0.45);
  lPalm.rotation.set(Math.PI * 0.44, 0, 0.22);
  cookHandsGroup.add(lPalm);
  const lThumb = new THREE.Mesh(trackGeo(new THREE.CapsuleGeometry(0.011, 0.024, 4, 6)), handSkinMat);
  lThumb.position.set(-0.135, -0.145, -0.44);
  lThumb.rotation.z = -0.5;
  cookHandsGroup.add(lThumb);
  const lScoop = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.048, 0.034, 0.06, 14)), matHammeredBrass);
  lScoop.position.set(-0.095, -0.15, -0.55);
  cookHandsGroup.add(lScoop);

  const shutterSwitch = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.22, 0.35, 0.22)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xd62828, roughness: 0.4 })),
  );
  shutterSwitch.position.set(-8.65, 1.45, 2.95);
  scene.add(shutterSwitch);
  registerInteractable('station-shutter', 'toggle_shop', 'فتح / غلق المحل', 'التحكم في باب الشاتر واستقبال الزبائن', 'E', new THREE.Vector3(-8.5, 1.5, 1.2), 4.6, shutterSwitch);

  const lightSwitch = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.18, 0.28, 0.18)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf4c430, roughness: 0.4 })),
  );
  lightSwitch.position.set(-8.65, 1.45, -2.95);
  scene.add(lightSwitch);
  registerInteractable('station-lights', 'toggle_lights', 'تشغيل / إطفاء أنوار المحل', 'الإضاءة الداخلية واللافتة', 'E', new THREE.Vector3(-8.65, 1.45, -2.95), 2.4, lightSwitch);

  // =========================================================================
  // 4. EXPANDED 4-ROOM SHARED HOME (الصالة + المطبخ + غرفة النوم + الحمام) + FAMILY AI
  // =========================================================================
  const homeGroup = new THREE.Group();
  homeGroup.position.set(15.85, 0, 0);
  scene.add(homeGroup);

  const homeFloor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(13.0, 0.16, 10.6)), matWood);
  homeFloor.position.y = 0.08;
  homeGroup.add(homeFloor);

  // Back East Wall (X = 22.25)
  const homeBack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.35, 4.0, 10.6)), matPlasterB);
  homeBack.position.set(6.35, 2.0, 0);
  homeGroup.add(homeBack);
  cameraOccluders.push(homeBack);
  colliders.push({ minX: 22.0, maxX: 22.55, minZ: -5.4, maxZ: 5.4 });

  // North & South Outer Walls (Z = -5.15 and Z = +5.15)
  const homeN = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(13.0, 4.0, 0.35)), matPlasterB);
  homeN.position.set(0, 2.0, -5.15);
  homeGroup.add(homeN);
  cameraOccluders.push(homeN);
  colliders.push({ minX: 9.2, maxX: 22.4, minZ: -5.45, maxZ: -4.9 });

  const homeS = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(13.0, 4.0, 0.35)), matPlasterB);
  homeS.position.set(0, 2.0, 5.15);
  homeGroup.add(homeS);
  cameraOccluders.push(homeS);
  colliders.push({ minX: 9.2, maxX: 22.4, minZ: 4.9, maxZ: 5.45 });

  // Front West Wall Jambs at X = 9.35 leaving Z = -1.15..+1.15 Entrance
  const homeJambN = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.4, 4.0, 4.0)), matPlasterA);
  homeJambN.position.set(-6.45, 2.0, -3.15);
  homeGroup.add(homeJambN);
  colliders.push({ minX: 9.0, maxX: 9.6, minZ: -5.3, maxZ: -1.15 });

  const homeJambS = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.4, 4.0, 4.0)), matPlasterA);
  homeJambS.position.set(-6.45, 2.0, 3.15);
  homeGroup.add(homeJambS);
  colliders.push({ minX: 9.0, maxX: 9.6, minZ: 1.15, maxZ: 5.3 });

  const homeLintel = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.45, 0.9, 10.6)), matPlasterA);
  homeLintel.position.set(-6.45, 3.6, 0);
  homeGroup.add(homeLintel);

  // Home Front Entrance Hinged Door (X = 9.35, Z = -1.15..+1.15)
  createHingedDoor(
    'door-home-front',
    'فتح / غلق باب المنزل المشترك',
    9.35,
    -1.15,
    -Math.PI / 2,
    2.2,
    2.55,
    Math.PI * 0.54,
    { minX: 9.0, maxX: 9.65, minZ: -1.15, maxZ: 1.15, active: true },
  );

  // Interior E-W Wall at Z = -0.65 (with Bedroom door X=10.2..11.9 & Bathroom door X=18.2..20.0)
  const partMid = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(6.3, 3.5, 0.22)), matPlasterA);
  partMid.position.set(-0.8, 1.75, -0.65);
  homeGroup.add(partMid);
  colliders.push({ minX: 11.9, maxX: 18.2, minZ: -0.82, maxZ: -0.48 });

  const partEast = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.2, 3.5, 0.22)), matPlasterA);
  partEast.position.set(5.25, 1.75, -0.65);
  homeGroup.add(partEast);
  colliders.push({ minX: 20.0, maxX: 22.3, minZ: -0.82, maxZ: -0.48 });

  createHingedDoor(
    'door-home-bedroom',
    'فتح / غلق باب غرفة النوم',
    10.2,
    -0.65,
    0,
    1.7,
    2.45,
    -Math.PI * 0.55,
    { minX: 10.2, maxX: 11.9, minZ: -0.85, maxZ: -0.45, active: true },
  );

  createHingedDoor(
    'door-home-bathroom',
    'فتح / غلق باب الحمام',
    18.2,
    -0.65,
    0,
    1.75,
    2.45,
    -Math.PI * 0.55,
    { minX: 18.2, maxX: 19.95, minZ: -0.85, maxZ: -0.45, active: true },
  );

  // Interior N-S Wall at X = 16.2 separating Bedroom/Bathroom & Living Room/Kitchen (open 2.2m archway Z=0.4..2.6)
  const nsWallNorth = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 3.5, 4.55)), matPlasterA);
  nsWallNorth.position.set(0.35, 1.75, -2.92);
  homeGroup.add(nsWallNorth);
  colliders.push({ minX: 16.05, maxX: 16.35, minZ: -5.2, maxZ: -0.65 });

  const nsArchN = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 3.5, 1.05)), matPlasterA);
  nsArchN.position.set(0.35, 1.75, -0.12);
  homeGroup.add(nsArchN);
  colliders.push({ minX: 16.05, maxX: 16.35, minZ: -0.65, maxZ: 0.4 });

  const nsArchS = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 3.5, 2.55)), matPlasterA);
  nsArchS.position.set(0.35, 1.75, 3.88);
  homeGroup.add(nsArchS);
  colliders.push({ minX: 16.05, maxX: 16.35, minZ: 2.6, maxZ: 5.2 });

  const nsArchLintel = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.9, 2.2)), matPlasterA);
  nsArchLintel.position.set(0.35, 3.05, 1.5);
  homeGroup.add(nsArchLintel);

  // Upper Apartment Shell above expanded Home
  createEgyptianApartment(15.85, 0, 12.6, 10.4, 3, -1, true, 4.0);
  const homeSignGroup = createIlluminatedSign(4.6, 1.35, textures.signHome, 0xf5b400);
  homeSignGroup.rotation.y = -Math.PI / 2;
  homeSignGroup.position.set(9.05, 4.3, 0);
  scene.add(homeSignGroup);

  // 1) Living Room (الصالة): Rug, Floral Sofa, Armchair, Coffee Table with Lace Cloth, Wall TV
  const rugMesh = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(4.2, 4.6)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, map: textures.orientalRug, roughness: 0.92 })),
  );
  rugMesh.rotation.x = -Math.PI / 2;
  rugMesh.position.set(12.5, 0.17, 2.3);
  scene.add(rugMesh);

  const sofaMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xffffff, map: textures.floralSofaFabric, roughness: 0.85 }),
  );
  const sofa = new THREE.Group();
  sofa.position.set(13.8, 0.16, 2.35);
  const sofaSeat = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.05, 0.44, 2.65)), sofaMat);
  sofaSeat.position.y = 0.24;
  sofa.add(sofaSeat);
  const sofaBack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.28, 0.88, 2.65)), sofaMat);
  sofaBack.position.set(0.42, 0.56, 0);
  sofa.add(sofaBack);
  scene.add(sofa);
  colliders.push({ minX: 13.75, maxX: 14.55, minZ: 1.0, maxZ: 3.7 });
  registerInteractable('home-sofa', 'home_sofa', 'الجلوس على الكنبة والراحة', 'استرجاع النشاط في جو البيت المصري', 'E', new THREE.Vector3(12.9, 0.7, 2.35), 2.5, sofa);

  const armchair = new THREE.Group();
  armchair.position.set(12.1, 0.16, 4.15);
  const acSeat = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.95, 0.44, 0.88)), sofaMat);
  acSeat.position.y = 0.24;
  armchair.add(acSeat);
  const acBack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.95, 0.86, 0.24)), sofaMat);
  acBack.position.set(0, 0.54, 0.34);
  armchair.add(acBack);
  scene.add(armchair);
  colliders.push({ minX: 11.6, maxX: 12.6, minZ: 3.7, maxZ: 4.6 });

  const coffeeTable = new THREE.Group();
  coffeeTable.position.set(12.15, 0.16, 2.75);
  const ctTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.82, 0.07, 1.25)), matWood);
  ctTop.position.y = 0.46;
  coffeeTable.add(ctTop);
  const laceCloth = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.66, 0.95)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.9 })),
  );
  laceCloth.rotation.x = -Math.PI / 2;
  laceCloth.position.y = 0.502;
  coffeeTable.add(laceCloth);
  const teaTray = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.18, 0.16, 0.04, 12)), matBrass);
  teaTray.position.y = 0.52;
  coffeeTable.add(teaTray);
  scene.add(coffeeTable);

  const tvStand = new THREE.Group();
  tvStand.position.set(10.25, 0.16, 2.35);
  const tvBox = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.45, 0.52, 1.5)), matWood);
  tvBox.position.y = 0.26;
  tvStand.add(tvBox);
  const tvScreen = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.08, 0.84, 1.48)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, map: textures.tvScene, emissive: 0x3b82f6, emissiveIntensity: 0.48, roughness: 0.18 })),
  );
  tvScreen.position.y = 0.98;
  tvStand.add(tvScreen);
  scene.add(tvStand);
  registerInteractable('home-tv', 'home_tv', 'مشاهدة التلفزيون', 'رفع المعنويات في المنزل المشترك', 'E', new THREE.Vector3(10.9, 0.9, 2.35), 2.5, tvStand);

  // 2) Kitchen & Dining Area (المطبخ وسفرة العائلة): Tiled Walls, L-Counter, Stove, Fridge, Dining Table
  const homeKitchenTiles = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(5.6, 3.4)), matKitchenWall);
  homeKitchenTiles.rotation.y = -Math.PI / 2;
  homeKitchenTiles.position.set(22.05, 1.85, 2.2);
  scene.add(homeKitchenTiles);

  const kCounterEast = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.85, 0.9, 3.6)), matWoodDoor);
  kCounterEast.position.set(21.55, 0.61, 2.95);
  scene.add(kCounterEast);
  const kCounterEastTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.92, 0.08, 3.68)), matStainlessOil);
  kCounterEastTop.position.set(21.55, 1.1, 2.95);
  scene.add(kCounterEastTop);
  colliders.push({ minX: 21.05, maxX: 22.1, minZ: 1.1, maxZ: 4.9 });

  const homeStove = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.75, 0.12, 0.82)), matSteel);
  homeStove.position.set(21.52, 1.19, 2.6);
  scene.add(homeStove);
  const homeKettle = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.11, 0.14, 0.24, 12)), matBrass);
  homeKettle.position.set(21.52, 1.37, 2.6);
  scene.add(homeKettle);
  registerInteractable('home-kitchen', 'home_kitchen', 'تحضير شاي وأكل في المطبخ', 'الطبخ في مطبخ البيت (+٢ سمعة)', 'E', new THREE.Vector3(20.6, 1.0, 2.6), 2.4, homeStove);

  const kCounterSouth = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.2, 0.9, 0.85)), matWoodDoor);
  kCounterSouth.position.set(19.5, 0.61, 4.55);
  scene.add(kCounterSouth);
  const homeFridge = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.82, 2.15, 0.85)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.4 })),
  );
  homeFridge.position.set(17.2, 1.24, 4.5);
  scene.add(homeFridge);
  colliders.push({ minX: 16.6, maxX: 22.1, minZ: 4.0, maxZ: 5.0 });

  const diningTable = new THREE.Group();
  diningTable.position.set(18.55, 0.16, 1.5);
  const dtTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.95, 0.08, 1.35)), matWood);
  dtTop.position.y = 0.76;
  diningTable.add(dtTop);
  const dtLeg = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.74, 0.4)), matDarkIron);
  dtLeg.position.y = 0.37;
  diningTable.add(dtLeg);
  for (const pz of [-0.35, 0.35]) {
    const plate = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.16, 0.12, 0.03, 12)), matSteel);
    plate.position.set(0, 0.82, pz);
    diningTable.add(plate);
  }
  scene.add(diningTable);
  colliders.push({ minX: 18.0, maxX: 19.0, minZ: 0.85, maxZ: 2.15 });
  registerInteractable('home-eat', 'home_eat', 'الأكل على سفرة العائلة', 'وجبة بيتية دافية ترفع المعنويات', 'E', new THREE.Vector3(19.1, 1.0, 1.5), 2.4, diningTable);

  // 3) Bedroom (غرفة النوم): Double Bed, Wardrobe, Nightstand & Lamp
  const bedGroup = new THREE.Group();
  bedGroup.position.set(14.6, 0.16, -3.7);
  const bedFrame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.25, 0.38, 1.6)), matWood);
  bedFrame.position.y = 0.19;
  bedGroup.add(bedFrame);
  const mattress = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.1, 0.22, 1.48)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.9 })),
  );
  mattress.position.y = 0.48;
  bedGroup.add(mattress);
  const blanket = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.3, 0.24, 1.5)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x2b5c6b, roughness: 0.85 })),
  );
  blanket.position.set(-0.35, 0.5, 0);
  bedGroup.add(blanket);
  scene.add(bedGroup);
  colliders.push({ minX: 13.4, maxX: 15.8, minZ: -4.6, maxZ: -2.85 });
  registerInteractable('home-bed', 'home_sleep', 'النوم وإنهاء اليوم', 'حساب الأرباح وبداية يوم عمل جديد', 'E', new THREE.Vector3(14.2, 0.8, -2.5), 2.8, bedGroup);

  const wardrobe = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.5, 2.25, 0.72)), matWoodDoor);
  wardrobe.position.set(10.35, 1.28, -4.5);
  scene.add(wardrobe);
  colliders.push({ minX: 9.55, maxX: 11.15, minZ: -4.9, maxZ: -4.05 });

  const nightStand = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.55, 0.55, 0.55)), matWood);
  nightStand.position.set(12.85, 0.44, -4.5);
  scene.add(nightStand);

  // 4) Bathroom (الحمام): Ceramic Tiles, Bathtub Stall, Sink Vanity + Mirror, Toilet
  const matBathTile = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xffffff, map: textures.tileBathroom, roughness: 0.32, metalness: 0.08 }),
  );
  const bathFloor = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(5.6, 4.2)), matBathTile);
  bathFloor.rotation.x = -Math.PI / 2;
  bathFloor.position.set(19.2, 0.17, -2.9);
  scene.add(bathFloor);
  const bathBackWall = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(5.6, 3.4)), matBathTile);
  bathBackWall.position.set(19.2, 1.85, -4.95);
  scene.add(bathBackWall);

  const tubMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.85, 0.62, 0.95)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.22 })),
  );
  tubMesh.position.set(20.95, 0.47, -4.2);
  scene.add(tubMesh);
  colliders.push({ minX: 19.95, maxX: 22.0, minZ: -4.85, maxZ: -3.6 });

  const vanitySink = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.65, 0.85, 1.15)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 })),
  );
  vanitySink.position.set(16.7, 0.58, -3.1);
  scene.add(vanitySink);
  const bathMirror = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.06, 0.95, 0.85)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.1, metalness: 0.75 })),
  );
  bathMirror.position.set(16.38, 1.62, -3.1);
  scene.add(bathMirror);
  colliders.push({ minX: 16.3, maxX: 17.15, minZ: -3.75, maxZ: -2.45 });

  const toiletSeat = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.24, 0.2, 0.46, 12)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })),
  );
  toiletSeat.position.set(17.1, 0.39, -4.45);
  scene.add(toiletSeat);
  colliders.push({ minX: 16.75, maxX: 17.45, minZ: -4.85, maxZ: -4.1 });

  // Warm Indoor Ceiling Lights across all 4 Rooms
  const homeLight = new THREE.PointLight(0xffd79a, 2.5, 13, 1.6);
  homeLight.position.set(12.6, 3.2, 1.8);
  scene.add(homeLight);
  const homeKitchenLight = new THREE.PointLight(0xffe4b5, 2.3, 12, 1.6);
  homeKitchenLight.position.set(19.2, 3.2, 2.1);
  scene.add(homeKitchenLight);
  const homeBedLight = new THREE.PointLight(0xffcf87, 1.9, 11, 1.6);
  homeBedLight.position.set(13.2, 3.2, -2.8);
  scene.add(homeBedLight);

  // 5) Autonomous Household Family AI Actors (أمينة، نور الصغيرة، كريم)
  const householdActors: HouseholdActorEntry[] = [];
  const wifeActor = rigFactory.createActor({
    shirtColor: 0xffffff,
    shirtTexture: textures.dressPurpleFloral,
    pantsColor: 0x3b0764,
    skinColor: 0xd9a17c,
    isGalabiya: true,
    hasHijab: true,
    hijabColor: 0x18181b,
    hatType: 'hair',
  });
  wifeActor.group.position.set(20.6, 0.16, 2.6);
  setActorExpression(wifeActor, 'happy');
  householdActors.push({ id: 'home-wife', actor: wifeActor });
  registerInteractable(
    'household-wife',
    'talk_person',
    'التحدث مع أمينة (ست البيت)',
    'اضغط [E] للكلام والاطمئنان على الأسرة',
    'E',
    wifeActor.group.position,
    2.8,
    wifeActor.group,
    { personId: 'home-wife', personKind: 'household_wife' },
  );

  const daughterActor = rigFactory.createActor({
    shirtColor: 0xffffff,
    shirtTexture: textures.sweaterPinkBunny,
    pantsColor: 0xffffff,
    pantsTexture: textures.denimBlue,
    isSkirt: true,
    skinColor: 0xdcb08e,
    hasHijab: true,
    hijabColor: 0xf8fafc,
    hasHandbag: true,
    hatType: 'hair',
  });
  daughterActor.group.scale.setScalar(0.86);
  daughterActor.group.position.set(13.45, 0.16, 2.35);
  setActorExpression(daughterActor, 'happy');
  householdActors.push({ id: 'home-daughter', actor: daughterActor });
  registerInteractable(
    'household-daughter',
    'talk_person',
    'التحدث مع نور الصغيرة',
    'اضغط [E] للكلام مع ابنتك',
    'E',
    daughterActor.group.position,
    2.8,
    daughterActor.group,
    { personId: 'home-daughter', personKind: 'household_daughter' },
  );

  const sonActor = rigFactory.createActor({
    shirtColor: 0xffffff,
    shirtTexture: textures.jerseyYellowSoccer,
    pantsColor: 0x1e293b,
    skinColor: 0xd69f78,
    hatType: 'hair',
  });
  sonActor.group.scale.setScalar(0.74);
  sonActor.group.position.set(12.1, 0.16, 1.1);
  setActorExpression(sonActor, 'happy');
  householdActors.push({ id: 'home-son', actor: sonActor });
  registerInteractable(
    'household-son',
    'talk_person',
    'التحدث مع كريم',
    'اضغط [E] للعب والكلام مع ابنك',
    'E',
    sonActor.group.position,
    2.8,
    sonActor.group,
    { personId: 'home-son', personKind: 'household_son' },
  );

  // =========================================================================
  // 5. MARKET STALL, FUEL STATION & BESPOKE DISTRICT JOB LANDMARKS
  // =========================================================================
  const marketGroup = new THREE.Group();
  marketGroup.position.set(12.5, 0, -21.2);
  scene.add(marketGroup);
  const marketDeck = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(7.2, 0.18, 6.4)), matSidewalk);
  marketDeck.position.y = 0.09;
  marketGroup.add(marketDeck);
  const marketRoof = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(7.4, 0.14, 6.6)), matAwning);
  marketRoof.position.y = 3.25;
  marketGroup.add(marketRoof);
  const marketSign = createIlluminatedSign(4.4, 1.15, textures.signMarket, 0xf59e0b);
  marketSign.position.set(0, 3.88, 3.22);
  marketGroup.add(marketSign);
  const crateColors = [0xbc4749, 0x6a994e, 0xf4a261, 0xd8b482];
  for (let i = 0; i < 4; i++) {
    const crate = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.1, 0.85, 1.1)),
      trackMat(new THREE.MeshStandardMaterial({ color: crateColors[i], roughness: 0.8 })),
    );
    crate.position.set(-2.1 + i * 1.4, 0.6, 0.6);
    marketGroup.add(crate);
  }
  colliders.push({ minX: 9.2, maxX: 15.8, minZ: -24.2, maxZ: -18.2 });
  registerInteractable('market-stall', 'open_market', 'سوق الحارة — شراء المستلزمات', 'تعبئة الفول والطعمية والعيش والزيت', 'E', new THREE.Vector3(12.5, 1.2, -17.5), 3.6, marketGroup);

  // =========================================================================
  // 5A. BESPOKE LANDMARK GAS STATION (محطة بنزين المعلم — طلمبات وبانر أسعار وعامل)
  // =========================================================================
  const fuelGroup = new THREE.Group();
  fuelGroup.position.set(GAS_STATION_DEF.x, 0, GAS_STATION_DEF.z);
  scene.add(fuelGroup);

  const fuelPad = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(11.6, 0.16, 8.6)), matConcrete);
  fuelPad.position.y = 0.08;
  fuelGroup.add(fuelPad);

  // Red & Amber Canopy supported by 4 steel pillars
  const fuelCanopy = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(10.8, 0.48, 7.2)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.42, metalness: 0.25 })),
  );
  fuelCanopy.position.y = 4.05;
  fuelGroup.add(fuelCanopy);
  const canopyTrim = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(11.0, 0.16, 7.4)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.35 })),
  );
  canopyTrim.position.y = 3.8;
  fuelGroup.add(canopyTrim);

  for (const [px, pz] of [
    [-4.4, -2.6],
    [4.4, -2.6],
    [-4.4, 2.6],
    [4.4, 2.6],
  ]) {
    const pillar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 3.85, 0.32)), matSteel);
    pillar.position.set(px, 2.0, pz);
    fuelGroup.add(pillar);
    colliders.push({
      minX: GAS_STATION_DEF.x + px - 0.25,
      maxX: GAS_STATION_DEF.x + px + 0.25,
      minZ: GAS_STATION_DEF.z + pz - 0.25,
      maxZ: GAS_STATION_DEF.z + pz + 0.25,
    });
  }

  // Two Double-Sided Fuel Dispenser Islands (92 / 95 / سولار)
  const matPumpBody = trackMat(new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35, metalness: 0.3 }));
  const matPumpScreen = trackMat(new THREE.MeshStandardMaterial({ color: 0x064e3b, emissive: 0x10b981, emissiveIntensity: 0.85 }));
  for (const ix of [-2.1, 2.1]) {
    const island = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.4, 0.24, 2.4)), matConcrete);
    island.position.set(ix, 0.22, 0.4);
    fuelGroup.add(island);
    const pump = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.75, 1.85, 0.85)), matPumpBody);
    pump.position.set(ix, 1.15, 0.4);
    fuelGroup.add(pump);
    const meter = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.78, 0.48, 0.62)), matPumpScreen);
    meter.position.set(ix, 1.55, 0.4);
    fuelGroup.add(meter);
    colliders.push({
      minX: GAS_STATION_DEF.x + ix - 0.72,
      maxX: GAS_STATION_DEF.x + ix + 0.72,
      minZ: GAS_STATION_DEF.z - 0.8,
      maxZ: GAS_STATION_DEF.z + 1.6,
    });
  }

  // Station Attendant Kiosk & Lubricant Rack + Illuminated Price Pylon
  const gasKiosk = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.2, 2.6, 2.1)), matPlasterA);
  gasKiosk.position.set(-3.4, 1.4, -2.9);
  fuelGroup.add(gasKiosk);
  colliders.push({
    minX: GAS_STATION_DEF.x - 5.1,
    maxX: GAS_STATION_DEF.x - 1.7,
    minZ: GAS_STATION_DEF.z - 4.0,
    maxZ: GAS_STATION_DEF.z - 1.8,
  });

  const pylonPost = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.5, 4.4, 0.32)), matDarkIron);
  pylonPost.position.set(5.4, 2.3, 3.2);
  fuelGroup.add(pylonPost);
  const pylonFaceMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.gasPricePylon,
      emissiveMap: textures.gasPricePylon,
      emissive: 0xffffff,
      emissiveIntensity: 0.45,
      roughness: 0.3,
    }),
  );
  const pylonFace = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.36, 3.9)), pylonFaceMat);
  pylonFace.position.set(5.4, 2.4, 3.38);
  fuelGroup.add(pylonFace);

  const fuelSign = createIlluminatedSign(5.6, 1.2, textures.signFuel, 0xfb923c);
  fuelSign.position.set(0, 4.7, 3.72);
  fuelGroup.add(fuelSign);

  // Live Gas Station Attendant (الأسطى فتحي عامل البنزينة)
  const fuelAttendant = rigFactory.createActor({
    shirtColor: 0xea580c,
    pantsColor: 0x1e293b,
    skinColor: 0xc99168,
    hasOveralls: true,
    hasMustache: true,
    hatType: 'cap',
    hatColor: 0xdc2626,
  });
  fuelAttendant.group.position.set(GAS_STATION_DEF.x + 0.1, 0.16, GAS_STATION_DEF.z + 2.2);
  fuelAttendant.group.rotation.y = 0;
  animateHumanActor(fuelAttendant, 'idle', 0.5, 0.016);
  shopWorkers.push({
    id: 'worker-gas-station',
    shopId: 'gas-station',
    actor: fuelAttendant,
    x: GAS_STATION_DEF.x + 0.1,
    z: GAS_STATION_DEF.z + 2.2,
    facingYaw: 0,
  });
  registerInteractable(
    'worker-gas-station',
    'talk_person',
    `التحدث مع ${GAS_STATION_DEF.attendantNameAr}`,
    'عامل محطة بنزين المعلم · [E]',
    'E',
    new THREE.Vector3(GAS_STATION_DEF.x + 0.1, 1.2, GAS_STATION_DEF.z + 2.2),
    2.6,
    fuelAttendant.group,
    { personId: 'worker-gas-station', personKind: 'worker' },
  );

  registerInteractable(
    'fuel-pump',
    'refuel_car',
    'تموين وصيانة السيارة والموتوسيكل',
    'تعبئة بنزين ٩٢/٩٥ + إصلاح كامل (٢٥ جنيه)',
    'E',
    new THREE.Vector3(GAS_STATION_DEF.x - 2.1, 1.2, GAS_STATION_DEF.z + 2.1),
    3.6,
    fuelGroup,
  );
  registerInteractable(
    'obj-fuel-pump',
    'talk_object',
    'طلمبة بنزين ٩٥ و٩٢ الرقمية',
    'اضغط [E] للكلام مع طلمبة البنزين',
    'E',
    new THREE.Vector3(GAS_STATION_DEF.x + 2.5, 1.2, GAS_STATION_DEF.z + 1.8),
    2.6,
    fuelGroup,
    { objectKind: 'fuel_pump', objectId: 'obj-fuel-pump' },
  );

  // Hero neighborhood apartments framing Main Avenue
  createEgyptianApartment(-14.5, 29.0, 9.6, 10.6, 4, 1, true, 0, -Math.PI / 2);
  colliders.push({ minX: -19.8, maxX: -9.2, minZ: 23.8, maxZ: 34.4 });
  createEgyptianApartment(14.5, 29.0, 9.6, 10.6, 4, -1, false, 0, Math.PI / 2);
  colliders.push({ minX: 9.2, maxX: 19.8, minZ: 23.8, maxZ: 34.4 });
  createEgyptianApartment(38.5, -23.5, 9.6, 10.6, 4, -1, false, 0, 0);
  colliders.push({ minX: 33.8, maxX: 43.6, minZ: -29.0, maxZ: -18.0 });
  createEgyptianApartment(-38.5, -23.5, 9.6, 10.6, 4, 1, true, 0, 0);
  colliders.push({ minX: -43.6, maxX: -33.8, minZ: -29.0, maxZ: -18.0 });

  // Ahwa Tea Counter & Outdoor Wicker Seating + Dining Seats
  const ahwaKettle = new THREE.Group();
  ahwaKettle.position.set(16.6, 0.14, 22.0);
  const ahwaTable = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.4, 0.9, 0.8)), matWood);
  ahwaTable.position.y = 0.45;
  ahwaKettle.add(ahwaTable);
  const samovar = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.18, 0.24, 0.65, 12)), matBrass);
  samovar.position.y = 1.2;
  ahwaKettle.add(samovar);
  scene.add(ahwaKettle);
  registerInteractable('job-ahwa', 'ahwa_serve', 'تجهيز وتقديم شاي وقهوة للزباين', 'شغلانة القهوجي (+٢٥ جنيه)', 'E', new THREE.Vector3(16.6, 1.1, 22.0), 3.0, ahwaKettle);

  const diningSeats: DiningSeatAnchor[] = [
    { x: -6.2, z: -3.6, yaw: -Math.PI / 2 },
    { x: -6.2, z: 3.6, yaw: -Math.PI / 2 },
    { x: 13.6, z: 19.6, yaw: 0 },
    { x: 16.0, z: 19.6, yaw: Math.PI },
  ];
  for (const ax of [14.8, 17.2]) {
    const ahwaRound = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 12)), matWood);
    ahwaRound.position.set(ax, 0.78, 19.6);
    scene.add(ahwaRound);
    const ahwaStand = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.08, 0.68, 8)), matDarkIron);
    ahwaStand.position.set(ax, 0.42, 19.6);
    scene.add(ahwaStand);
  }

  // Bakery Brick Oven (مخبز الأمانة)
  const ovenGroup = new THREE.Group();
  ovenGroup.position.set(-16.6, 0.14, 22.0);
  const ovenBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.6, 1.5, 1.0)), matPlasterB);
  ovenBody.position.y = 0.75;
  ovenGroup.add(ovenBody);
  const ovenFire = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.8, 0.55, 0.15)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 0.9 })),
  );
  ovenFire.position.set(0, 0.7, -0.48);
  ovenGroup.add(ovenFire);
  scene.add(ovenGroup);
  registerInteractable('job-bakery', 'bakery_bake', 'خبز طاولة عيش بلدي طازة', 'شغلانة الخباز (+٢٢ جنيه و١٠ أرغفة)', 'E', new THREE.Vector3(-16.6, 1.1, 22.0), 3.0, ovenGroup);

  // Mechanic Repair Bay (ورشة الأسطى بليغ) + Customer Car + Garage Tire Stack & Oil Drum
  const repairBayCar = trafficFactory.createVehicle('sedan', 0x2563eb);
  repairBayCar.position.set(31.2, 0.12, -20.5);
  repairBayCar.rotation.y = Math.PI / 2;
  registerInteractable('job-mechanic', 'mechanic_repair', 'فحص وإصلاح سيارة الزبون', 'شغلانة الميكانيكي (+٦٠ جنيه)', 'E', new THREE.Vector3(31.2, 1.1, -20.5), 3.6, repairBayCar);

  const matTireProp = trackMat(new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.9 }));
  for (let ti = 0; ti < 3; ti++) {
    const tire = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.28, 0.11, 8, 16)), matTireProp);
    tire.rotation.x = Math.PI / 2;
    tire.position.set(29.8, 0.24 + ti * 0.22, -23.0);
    scene.add(tire);
  }
  const oilDrum = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.32, 0.32, 0.88, 12)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })),
  );
  oilDrum.position.set(30.6, 0.54, -23.2);
  scene.add(oilDrum);

  // =========================================================================
  // 5B. TWO ENTERABLE EGYPTIAN SCHOOLS (مدارس الحي) + FLAGS & TEACHERS
  // =========================================================================
  const matChalkboard = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xffffff, map: textures.schoolChalkboard, roughness: 0.72 }),
  );
  const matFlag = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.egyptianFlag,
      roughness: 0.78,
      side: THREE.DoubleSide,
    }),
  );

  SCHOOL_CAMPUSES.forEach((sch, sIdx) => {
    const schGrp = new THREE.Group();
    schGrp.position.set(sch.x, 0, sch.z);
    scene.add(schGrp);

    if (sIdx === 0) {
      // =====================================================================
      // EXPANDED مدرسة بنها الخاصة: 3 BUILDINGS x 4 FLOORS + GATE + COURTYARD + COURTS + STUDENTS
      // Campus spans local X [-8.8..+8.8], Z [-8.8..+8.8] -> Gate opens North toward Z=44.5
      // =====================================================================
      const campusFloor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(17.6, 0.16, 17.6)), matSidewalk);
      campusFloor.position.y = 0.08;
      schGrp.add(campusFloor);

      // Front Perimeter Fence & Arched Gate at Z = -8.6 (world Z = 49.9)
      const gateWallL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(6.3, 2.4, 0.4)), matPlasterA);
      gateWallL.position.set(-5.65, 1.2, -8.6);
      schGrp.add(gateWallL);
      colliders.push({ minX: sch.x - 8.9, maxX: sch.x - 2.4, minZ: sch.z - 8.9, maxZ: sch.z - 8.3 });

      const gateWallR = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(6.3, 2.4, 0.4)), matPlasterA);
      gateWallR.position.set(5.65, 1.2, -8.6);
      schGrp.add(gateWallR);
      colliders.push({ minX: sch.x + 2.4, maxX: sch.x + 8.9, minZ: sch.z - 8.9, maxZ: sch.z - 8.3 });

      for (const gx of [-2.4, 2.4]) {
        const gPillar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.65, 4.2, 0.65)), matPlasterB);
        gPillar.position.set(gx, 2.1, -8.6);
        schGrp.add(gPillar);
        // Open swung wrought-iron gates
        const ironGate = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.1, 2.3, 1.7)), matDarkIron);
        ironGate.position.set(gx + (gx < 0 ? 0.25 : -0.25), 1.2, -7.65);
        schGrp.add(ironGate);
      }
      const gateArch = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(5.6, 0.85, 0.65)), matPlasterB);
      gateArch.position.set(0, 4.1, -8.6);
      schGrp.add(gateArch);

      const gateSignTex = textures.makeCustomShopSign(sch.nameAr, sch.subtitleAr, '#0f172a', '#38bdf8', '#ffffff');
      const gateSign = createIlluminatedSign(5.3, 1.25, gateSignTex, sch.accentColor);
      gateSign.position.set(0, 4.2, -8.98);
      gateSign.rotation.y = Math.PI;
      schGrp.add(gateSign);

      // Security Booth at Gate
      const guardKiosk = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.6, 2.4, 1.6)), matPlasterA);
      guardKiosk.position.set(-3.4, 1.25, -7.4);
      schGrp.add(guardKiosk);
      colliders.push({ minX: sch.x - 4.3, maxX: sch.x - 2.5, minZ: sch.z - 8.3, maxZ: sch.z - 6.5 });

      registerInteractable(
        'obj-benha-gate',
        'talk_object',
        'بوابة مدرسة بنها الخاصة',
        'اضغط [E] للكلام مع بوابة المدرسة أو الاستفسار عن التقديم',
        'E',
        new THREE.Vector3(sch.x, 1.4, sch.z - 8.9),
        3.2,
        gateArch,
        { objectKind: 'school_gate', objectId: 'obj-benha-gate' },
      );

      // 3 Separate 4-Story School Buildings (West Wing, East Wing, South Main Wing)
      const matSchoolTrim = trackMat(new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.55 }));
      const build4StoryWing = (
        lx: number,
        lz: number,
        bw: number,
        bd: number,
        openSide: 'east' | 'west' | 'north',
      ) => {
        const wingH = 12.2; // 4 floors x 3.05m
        // Upper 3 floors solid block with window bands
        const upperBlock = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(bw, 9.0, bd)), matPlasterA);
        upperBlock.position.set(lx, 7.65, lz);
        schGrp.add(upperBlock);
        for (let fl = 1; fl < 4; fl++) {
          const band = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(bw + 0.16, 1.4, bd + 0.16)), matWindowFace);
          band.position.set(lx, fl * 3.05 + 1.5, lz);
          schGrp.add(band);
          const belt = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(bw + 0.22, 0.22, bd + 0.22)), matSchoolTrim);
          belt.position.set(lx, fl * 3.05, lz);
          schGrp.add(belt);
        }
        const roofTrim = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(bw + 0.3, 0.45, bd + 0.3)), matSchoolTrim);
        roofTrim.position.set(lx, wingH + 0.2, lz);
        schGrp.add(roofTrim);

        // Ground-floor open walk-in classroom!
        const cFloor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(bw - 0.1, 0.14, bd - 0.1)), matShopTile);
        cFloor.position.set(lx, 0.18, lz);
        schGrp.add(cFloor);
        if (openSide !== 'west') {
          const wW = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.28, 3.1, bd)), matPlasterB);
          wW.position.set(lx - bw / 2 + 0.14, 1.65, lz);
          schGrp.add(wW);
        }
        if (openSide !== 'east') {
          const wE = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.28, 3.1, bd)), matPlasterB);
          wE.position.set(lx + bw / 2 - 0.14, 1.65, lz);
          schGrp.add(wE);
        }
        if (openSide !== 'north') {
          const wN = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(bw, 3.1, 0.28)), matPlasterB);
          wN.position.set(lx, 1.65, lz - bd / 2 + 0.14);
          schGrp.add(wN);
        }
        const wS = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(bw, 3.1, 0.28)), matPlasterB);
        wS.position.set(lx, 1.65, lz + bd / 2 - 0.14);
        schGrp.add(wS);

        colliders.push({
          minX: sch.x + lx - bw / 2,
          maxX: sch.x + lx + bw / 2,
          minZ: sch.z + lz - bd / 2,
          maxZ: sch.z + lz + bd / 2,
        });
      };

      // Building 1: West Wing (4 floors, ground classroom opens East toward courtyard)
      build4StoryWing(-6.4, -1.6, 4.4, 9.4, 'east');
      // Building 2: East Wing (4 floors, ground classroom/office opens West toward courtyard)
      build4StoryWing(6.4, -1.6, 4.4, 9.4, 'west');
      // Building 3: South Main 4-Floor Wing (17.2 x 4.4m)
      build4StoryWing(0, 6.2, 17.2, 4.4, 'north');

      // Open Walk-In Classroom Desks & Chalkboard in Courtyard/West Wing Front
      const board = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.12, 1.65, 4.0)), matChalkboard);
      board.position.set(-4.35, 1.95, -1.6);
      schGrp.add(board);
      registerInteractable(
        'obj-benha-board',
        'talk_object',
        'سبورة فصل مدرسة بنها الخاصة',
        'اضغط [E] للكلام مع السبورة أو شرح درس',
        'E',
        new THREE.Vector3(sch.x - 4.1, 1.5, sch.z - 1.6),
        2.8,
        board,
        { objectKind: 'classroom_board', objectId: 'obj-benha-board' },
      );

      for (const dz of [-3.4, -1.2, 1.0]) {
        const desk = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.65, 0.72, 1.45)), matWood);
        desk.position.set(-5.6, 0.56, dz);
        schGrp.add(desk);
      }

      // Courtyard Sports Courts (ملعب كرة قدم عشبي + مرمى + كرة سلة)
      const turfMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.88 }));
      const pitch = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(5.6, 0.06, 8.2)), turfMat);
      pitch.position.set(0, 0.19, -0.8);
      schGrp.add(pitch);
      const lineMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }));
      const centerLine = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(5.2, 0.02, 0.1)), lineMat);
      centerLine.position.set(0, 0.23, -0.8);
      schGrp.add(centerLine);
      for (const gz of [-4.6, 3.0]) {
        const crossbar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.1, 0.09, 0.09)), matSteel);
        crossbar.position.set(0, 1.45, gz);
        schGrp.add(crossbar);
        for (const gx of [-1.0, 1.0]) {
          const gPost = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.05, 0.05, 1.45, 6)), matSteel);
          gPost.position.set(gx, 0.74, gz);
          schGrp.add(gPost);
        }
      }
      const ballMesh = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(0.2, 12, 10)),
        trackMat(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })),
      );
      ballMesh.position.set(0.2, 0.42, -0.8);
      schGrp.add(ballMesh);

      // Flagpole + Basketball Hoop inside Courtyard
      const pole = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.08, 6.2, 8)), matSteel);
      pole.position.set(-3.2, 3.2, 3.4);
      schGrp.add(pole);
      const flagMesh = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.85, 1.15, 6, 2)), matFlag);
      flagMesh.position.set(-2.25, 5.7, 3.4);
      schGrp.add(flagMesh);
      flagMeshes.push(flagMesh);

      const hoopPost = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 3.2, 0.18)), matDarkIron);
      hoopPost.position.set(3.5, 1.7, 2.2);
      schGrp.add(hoopPost);
      const hoopBoard = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.1, 0.9, 1.3)), matSteel);
      hoopBoard.position.set(3.3, 3.1, 2.2);
      schGrp.add(hoopBoard);

      // Principal أستاذة هناء at Courtyard Reception
      const teacherPos = new THREE.Vector3(sch.x + 2.4, 0.18, sch.z - 5.8);
      const teacher = rigFactory.createActor({
        shirtColor: sch.accentColor,
        pantsColor: 0x1e293b,
        skinColor: 0xd29c74,
        hasHijab: true,
        hijabColor: 0xfef3c7,
        hatType: 'hair',
      });
      teacher.group.position.copy(teacherPos);
      teacher.group.rotation.y = Math.PI;
      animateHumanActor(teacher, 'idle', 0.4, 0.016);
      shopOwners.push({ shopId: sch.id, actor: teacher, x: teacherPos.x, z: teacherPos.z, facingYaw: Math.PI });

      registerInteractable(
        `teacher-${sch.id}`,
        'talk_person',
        `${sch.teacherNameAr}`,
        'اضغط [E] للتقديم لابني وابنتي أو التحدث مع المديرة',
        'E',
        new THREE.Vector3(teacherPos.x, 1.3, teacherPos.z),
        3.4,
        teacher.group,
        { personId: sch.id, personKind: 'school_staff' },
      );

      registerInteractable(
        'benha-school-enroll',
        'school_enroll',
        'تقديم ابني وابنتي في مدرسة بنها الخاصة',
        'تسجيل كريم ونور في الفصول الدراسية [E]',
        'E',
        new THREE.Vector3(sch.x - 1.2, 1.3, sch.z - 6.6),
        3.0,
        gateArch,
      );

      // 8 Animated Playing & Studying Students inside Benha School Courtyard & Classrooms!
      const studentSpots: Array<[number, number, number, boolean]> = [
        [-1.8, -2.6, 0.4, false],
        [1.5, -2.2, -0.7, true],
        [-1.4, 0.4, 1.2, true],
        [1.6, 0.6, -1.8, false],
        [-0.4, 2.1, 2.4, true],
        [2.2, 2.4, -2.2, false],
        [-5.2, -2.5, 1.5, true],
        [-5.2, -0.1, 1.5, false],
      ];
      studentSpots.forEach(([sx, sz, syaw, isGirl], stIdx) => {
        const student = rigFactory.createActor({
          shirtColor: stIdx % 2 === 0 ? 0xf8fafc : 0x38bdf8,
          pantsColor: 0x1e293b,
          skinColor: stIdx % 2 === 0 ? 0xc99168 : 0xd69f78,
          hasHijab: isGirl,
          hijabColor: 0xffffff,
          hasBackpack: true,
          hatType: 'hair',
        });
        student.group.scale.setScalar(0.8);
        student.group.position.set(sch.x + sx, 0.2, sch.z + sz);
        student.group.rotation.y = syaw;
        animateHumanActor(student, 'idle', stIdx * 0.9, 0.016);
        benhaStudents.push(student);

        if (stIdx < 3) {
          const stuNames = ['زياد طالب بنها', 'مريم طالبة بنها', 'يوسف كابتن الملعب'];
          registerInteractable(
            `benha-student-${stIdx}`,
            'talk_person',
            `التحدث مع ${stuNames[stIdx]}`,
            'طالب في مدرسة بنها الخاصة · [E]',
            'E',
            student.group.position,
            2.6,
            student.group,
            { personId: `benha-student-${stIdx}`, personKind: 'student' },
          );
        }
      });

      if (sch.hasBus) {
        const schoolBus = trafficFactory.createVehicle('microbus', 0xfacc15);
        schoolBus.position.set(sch.x + 8.5, 0.12, sch.z - 11.4);
        schoolBus.rotation.y = Math.PI / 2;
      }
    } else {
      // Standard School #2: مدرسة المعلم الحديثة
      schGrp.rotation.y = sch.facingYaw;
      const yardFloor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(16, 0.16, 14)), matSidewalk);
      yardFloor.position.y = 0.08;
      schGrp.add(yardFloor);

      const classFloor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(12, 0.22, 6.2)), matShopTile);
      classFloor.position.set(0, 0.14, -3.5);
      schGrp.add(classFloor);

      const cBackWall = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(12, 3.8, 0.35)), matPlasterB);
      cBackWall.position.set(0, 1.9, -6.5);
      schGrp.add(cBackWall);
      colliders.push({ minX: sch.x - 6.1, maxX: sch.x + 6.1, minZ: sch.z + 6.1, maxZ: sch.z + 6.8 });

      const cSideL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.35, 3.8, 6.2)), matPlasterA);
      cSideL.position.set(-5.85, 1.9, -3.5);
      schGrp.add(cSideL);
      const cSideR = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.35, 3.8, 6.2)), matPlasterA);
      cSideR.position.set(5.85, 1.9, -3.5);
      schGrp.add(cSideR);
      const cRoof = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(12.6, 0.35, 6.8)), matPlasterA);
      cRoof.position.set(0, 3.9, -3.5);
      schGrp.add(cRoof);

      const board = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(4.2, 1.65, 0.1)), matChalkboard);
      board.position.set(0, 2.05, -6.22);
      schGrp.add(board);

      const wallL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(5.6, 2.0, 0.35)), matPlasterA);
      wallL.position.set(-5.2, 1.0, 6.8);
      schGrp.add(wallL);
      const wallR = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(5.6, 2.0, 0.35)), matPlasterA);
      wallR.position.set(5.2, 1.0, 6.8);
      schGrp.add(wallR);

      const schSignTex = textures.makeCustomShopSign(sch.nameAr, sch.subtitleAr, '#0f172a', '#fbbf24', '#ffffff');
      const schSign = createIlluminatedSign(5.4, 1.25, schSignTex, sch.accentColor);
      schSign.position.set(0, 3.2, 6.85);
      schGrp.add(schSign);

      const pole = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.08, 6.2, 8)), matSteel);
      pole.position.set(-4.5, 3.2, 2.2);
      schGrp.add(pole);
      const flagMesh = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.85, 1.15, 6, 2)), matFlag);
      flagMesh.position.set(-3.55, 5.7, 2.2);
      schGrp.add(flagMesh);
      flagMeshes.push(flagMesh);

      const teacherPos = new THREE.Vector3(1.8, 0.16, 4.2)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), sch.facingYaw)
        .add(new THREE.Vector3(sch.x, 0, sch.z));
      const teacher = rigFactory.createActor({
        shirtColor: sch.accentColor,
        pantsColor: 0x1e293b,
        skinColor: 0xd29c74,
        hasMustache: true,
        hatType: 'hair',
      });
      teacher.group.position.copy(teacherPos);
      teacher.group.rotation.y = sch.facingYaw;
      animateHumanActor(teacher, 'idle', sIdx * 1.1, 0.016);
      shopOwners.push({ shopId: sch.id, actor: teacher, x: teacherPos.x, z: teacherPos.z, facingYaw: sch.facingYaw });

      registerInteractable(
        `teacher-${sch.id}`,
        'talk_person',
        `${sch.teacherNameAr} — ${sch.nameAr}`,
        'اضغط [E] للحديث مع معلم المدرسة',
        'E',
        new THREE.Vector3(teacherPos.x, 1.3, teacherPos.z),
        3.4,
        teacher.group,
        { personId: sch.id, personKind: 'school_staff' },
      );

      if (sch.hasBus) {
        const schoolBus = trafficFactory.createVehicle('microbus', 0xfacc15);
        schoolBus.position.set(sch.x + 11.5, 0.12, sch.z - 12.2);
        schoolBus.rotation.y = Math.PI / 2;
      }
    }
  });

  // =========================================================================
  // 5B-2. REMOTE 2ND-FLOOR APARTMENT FOR MOHAMED & 3 EMPLOYEES (-68.75, 58.5)
  // =========================================================================
  const remoteAptGroup = new THREE.Group();
  remoteAptGroup.position.set(REMOTE_CREW_APARTMENT.x, 0, REMOTE_CREW_APARTMENT.z);
  scene.add(remoteAptGroup);

  // Ground masonry base (X: -5.3..+5.3, Z: -4.2..+4.2)
  const rGroundBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(10.6, 3.45, 8.4)), matPlasterB);
  rGroundBase.position.y = 1.72;
  remoteAptGroup.add(rGroundBase);
  colliders.push({
    minX: REMOTE_CREW_APARTMENT.x - 5.4,
    maxX: REMOTE_CREW_APARTMENT.x + 5.4,
    minZ: REMOTE_CREW_APARTMENT.z - 4.3,
    maxZ: REMOTE_CREW_APARTMENT.z + 4.3,
  });

  // Exterior East Walkable Staircase: world X in [-63.45..-61.45], Z in [54.3..62.7]
  for (let si = 0; si < 16; si++) {
    const t = si / 15;
    const step = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.9, 0.24, 0.56)), matConcrete);
    step.position.set(6.25, 0.18 + t * (REMOTE_CREW_APARTMENT.floorY - 0.18), 4.05 - t * 8.1);
    remoteAptGroup.add(step);
  }
  const stairHandrail = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 0.1, 8.8)), matBalconyRail);
  stairHandrail.position.set(7.2, 2.75, 0);
  stairHandrail.rotation.x = 0.4;
  remoteAptGroup.add(stairHandrail);

  // 2nd Floor Terrace & Walk-In Apartment Floor (y = 3.6)
  const rTerraceFloor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(12.6, 0.22, 2.2)), matSidewalk);
  rTerraceFloor.position.set(1.0, REMOTE_CREW_APARTMENT.floorY - 0.1, -5.3);
  remoteAptGroup.add(rTerraceFloor);
  const rTerraceRail = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(12.6, 0.9, 0.12)), matBalconyRail);
  rTerraceRail.position.set(1.0, REMOTE_CREW_APARTMENT.floorY + 0.45, -6.35);
  remoteAptGroup.add(rTerraceRail);

  const rFloor2Deck = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(10.6, 0.22, 8.4)), matWood);
  rFloor2Deck.position.set(0, REMOTE_CREW_APARTMENT.floorY - 0.1, 0);
  remoteAptGroup.add(rFloor2Deck);
  const rWallBack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(10.6, 3.2, 0.3)), matPlasterA);
  rWallBack.position.set(0, REMOTE_CREW_APARTMENT.floorY + 1.6, 4.05);
  remoteAptGroup.add(rWallBack);
  const rWallW = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.3, 3.2, 8.4)), matPlasterA);
  rWallW.position.set(-5.15, REMOTE_CREW_APARTMENT.floorY + 1.6, 0);
  remoteAptGroup.add(rWallW);
  const rWallE = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.3, 3.2, 8.4)), matPlasterA);
  rWallE.position.set(5.15, REMOTE_CREW_APARTMENT.floorY + 1.6, 0);
  remoteAptGroup.add(rWallE);
  const rWallFrontL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(4.2, 3.2, 0.3)), matPlasterA);
  rWallFrontL.position.set(-3.2, REMOTE_CREW_APARTMENT.floorY + 1.6, -4.05);
  remoteAptGroup.add(rWallFrontL);
  const rWallFrontR = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(4.2, 3.2, 0.3)), matPlasterA);
  rWallFrontR.position.set(3.2, REMOTE_CREW_APARTMENT.floorY + 1.6, -4.05);
  remoteAptGroup.add(rWallFrontR);
  const rCeiling2 = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(10.8, 0.28, 8.6)), matPlasterB);
  rCeiling2.position.set(0, REMOTE_CREW_APARTMENT.floorY + 3.25, 0);
  remoteAptGroup.add(rCeiling2);

  const rAptSignTex = textures.makeCustomShopSign('شقة الدور التاني', 'سكن المعلم محمد حامد وموظفيه الثلاثة', '#1e1b4b', '#fbbf24', '#fffbeb');
  const rAptSign = createIlluminatedSign(5.6, 1.2, rAptSignTex, 0xfbbf24);
  rAptSign.position.set(0, REMOTE_CREW_APARTMENT.floorY + 3.1, -4.25);
  rAptSign.rotation.y = Math.PI;
  remoteAptGroup.add(rAptSign);

  // 4 Beds inside 2nd-floor apartment (Mohamed + 3 employees)
  const crewBedColors = [0xa82424, 0x0e7490, 0xb45309, 0x15803d];
  for (let bi = 0; bi < 4; bi++) {
    const bx = -3.6 + bi * 2.4;
    const bFrame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.35, 0.45, 2.0)), matWood);
    bFrame.position.set(bx, REMOTE_CREW_APARTMENT.floorY + 0.24, 2.4);
    remoteAptGroup.add(bFrame);
    const bBlanket = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.25, 0.16, 1.35)),
      trackMat(new THREE.MeshStandardMaterial({ color: crewBedColors[bi], roughness: 0.85 })),
    );
    bBlanket.position.set(bx, REMOTE_CREW_APARTMENT.floorY + 0.5, 2.65);
    remoteAptGroup.add(bBlanket);
  }
  // 2nd Floor Kitchen Counter + Drinks Fridge + Lounge Sofa
  const rKitchen = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.6, 0.9, 0.85)), matWoodDoor);
  rKitchen.position.set(-3.4, REMOTE_CREW_APARTMENT.floorY + 0.45, -2.1);
  remoteAptGroup.add(rKitchen);
  const rFridge = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.78, 2.0, 0.78)), matDrinksFridge);
  rFridge.position.set(-4.35, REMOTE_CREW_APARTMENT.floorY + 1.0, -0.7);
  remoteAptGroup.add(rFridge);
  const rSofa = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.8, 0.75, 1.0)), matPlasterB);
  rSofa.position.set(2.8, REMOTE_CREW_APARTMENT.floorY + 0.4, -1.6);
  remoteAptGroup.add(rSofa);

  registerInteractable(
    'obj-remote-apt-door',
    'talk_object',
    'باب شقة الدور التاني (سكن الموظفين)',
    'اضغط [E] للكلام أو تفقد شقة السكن البعيدة',
    'E',
    new THREE.Vector3(REMOTE_CREW_APARTMENT.x, REMOTE_CREW_APARTMENT.floorY + 1.1, REMOTE_CREW_APARTMENT.z - 4.2),
    2.6,
    rWallFrontL,
    { objectKind: 'apartment_door', objectId: 'obj-remote-apt-door' },
  );
  registerInteractable(
    'remote-apt-sleep',
    'home_sleep',
    'النوم في شقة الدور التاني (٤ سراير)',
    'نوم واسترجاع طاقة المعلم والموظفين وإنهاء اليوم',
    'E',
    new THREE.Vector3(REMOTE_CREW_APARTMENT.x, REMOTE_CREW_APARTMENT.floorY + 0.8, REMOTE_CREW_APARTMENT.z + 1.6),
    2.8,
    rFloor2Deck,
  );
  registerInteractable(
    'remote-apt-eat',
    'home_eat',
    'أكل في مطبخ شقة الدور التاني',
    'وجبة تشبع الجوع وترفع النشاط',
    'E',
    new THREE.Vector3(REMOTE_CREW_APARTMENT.x - 3.2, REMOTE_CREW_APARTMENT.floorY + 0.9, REMOTE_CREW_APARTMENT.z - 2.0),
    2.5,
    rKitchen,
  );
  registerInteractable(
    'remote-apt-drink',
    'home_drink',
    'شرب مياه وعصير بارد (شقة الدور التاني)',
    'إزالة العطش بنسبة ١٠٠٪',
    'E',
    new THREE.Vector3(REMOTE_CREW_APARTMENT.x - 4.0, REMOTE_CREW_APARTMENT.floorY + 1.0, REMOTE_CREW_APARTMENT.z - 0.7),
    2.4,
    rFridge,
  );

  // =========================================================================
  // 5C. OWNABLE PRIVATE APARTMENT SUITE (شقتك الخاصة للزواج والأولاد)
  // =========================================================================
  const aptGroup = new THREE.Group();
  aptGroup.position.set(13.5, 0, 11.4);
  scene.add(aptGroup);

  const aptFloor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.2, 0.16, 6.8)), matWood);
  aptFloor.position.y = 0.08;
  aptGroup.add(aptFloor);
  const aptBack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.35, 3.6, 6.8)), matPlasterA);
  aptBack.position.set(3.95, 1.8, 0);
  aptGroup.add(aptBack);
  colliders.push({ minX: 17.2, maxX: 17.8, minZ: 7.9, maxZ: 14.9 });
  const aptN = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.2, 3.6, 0.35)), matPlasterA);
  aptN.position.set(0, 1.8, -3.25);
  aptGroup.add(aptN);
  colliders.push({ minX: 9.2, maxX: 17.6, minZ: 7.9, maxZ: 8.4 });
  const aptS = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(8.2, 3.6, 0.35)), matPlasterA);
  aptS.position.set(0, 1.8, 3.25);
  aptGroup.add(aptS);
  colliders.push({ minX: 9.2, maxX: 17.6, minZ: 14.4, maxZ: 14.9 });

  const aptJambN = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.35, 3.6, 2.2)), matPlasterB);
  aptJambN.position.set(-3.95, 1.8, -2.15);
  aptGroup.add(aptJambN);
  colliders.push({ minX: 9.2, maxX: 9.8, minZ: 7.9, maxZ: 10.35 });
  const aptJambS = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.35, 3.6, 2.2)), matPlasterB);
  aptJambS.position.set(-3.95, 1.8, 2.15);
  aptGroup.add(aptJambS);
  colliders.push({ minX: 9.2, maxX: 9.8, minZ: 12.45, maxZ: 14.9 });
  const aptLintel = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.4, 0.85, 6.8)), matPlasterB);
  aptLintel.position.set(-3.95, 3.25, 0);
  aptGroup.add(aptLintel);

  createHingedDoor(
    'door-private-apt',
    'فتح / غلق باب شقتك الخاصة',
    9.55,
    10.45,
    -Math.PI / 2,
    1.95,
    2.45,
    Math.PI * 0.55,
    { minX: 9.25, maxX: 9.85, minZ: 10.45, maxZ: 12.45, active: true },
  );

  createEgyptianApartment(13.5, 11.4, 8.0, 6.6, 3, -1, false, 3.6);
  const aptSignTex = textures.makeCustomShopSign('شقة التمليك والأسرة', 'بيت الزوجية والراحة', '#1e1b4b', '#fbbf24', '#fffbeb');
  const aptSign = createIlluminatedSign(4.2, 1.15, aptSignTex, 0xfbbf24);
  aptSign.rotation.y = -Math.PI / 2;
  aptSign.position.set(9.18, 3.9, 11.4);
  scene.add(aptSign);

  const aptRug = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(3.8, 4.2)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, map: textures.orientalRug, roughness: 0.9 })),
  );
  aptRug.rotation.x = -Math.PI / 2;
  aptRug.position.set(13.1, 0.17, 11.4);
  scene.add(aptRug);
  const aptSofa = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.1, 0.72, 2.4)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, map: textures.sofaFabric, roughness: 0.85 })),
  );
  aptSofa.position.set(14.5, 0.52, 12.6);
  scene.add(aptSofa);
  const aptBed = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.1, 0.55, 1.5)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.85 })),
  );
  aptBed.position.set(15.6, 0.44, 9.6);
  scene.add(aptBed);
  registerInteractable('apt-sleep', 'home_sleep', 'النوم في شقتك الخاصة', 'مع زوجتك وأولادك + مكافأة السعادة', 'E', new THREE.Vector3(14.8, 0.9, 9.6), 2.8, aptBed);
  const aptLight = new THREE.PointLight(0xffdfb0, 2.8, 12, 1.5);
  aptLight.position.set(13.5, 3.0, 11.4);
  scene.add(aptLight);

  // Enterable Corniche Nile Penthouse (بنتهاوس الكورنيش النيلي - X=9..19, Z=-106.5..-101.0)
  const phGroup = new THREE.Group();
  phGroup.position.set(14.0, 0, -103.75);
  scene.add(phGroup);
  const phFloor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(10.0, 0.16, 5.4)), matWood);
  phFloor.position.y = 0.08;
  phGroup.add(phFloor);
  const phWallW = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 3.6, 5.4)), matPlasterA);
  phWallW.position.set(-4.84, 1.8, 0);
  phGroup.add(phWallW);
  colliders.push({ minX: 8.95, maxX: 9.45, minZ: -106.45, maxZ: -101.05 });
  const phWallE = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 3.6, 5.4)), matPlasterA);
  phWallE.position.set(4.84, 1.8, 0);
  phGroup.add(phWallE);
  colliders.push({ minX: 18.55, maxX: 19.05, minZ: -106.45, maxZ: -101.05 });
  // North panoramic glass overlooking Nile Feluccas
  const phGlassN = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(9.6, 2.6, 0.16)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.15, transparent: true, opacity: 0.28 })),
  );
  phGlassN.position.set(0, 2.1, -2.6);
  phGroup.add(phGlassN);
  const phRailN = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(10.0, 0.85, 0.24)), matPlasterB);
  phRailN.position.set(0, 0.45, -2.6);
  phGroup.add(phRailN);
  colliders.push({ minX: 8.95, maxX: 19.05, minZ: -106.5, maxZ: -106.0 });
  const phSouthW = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.8, 3.6, 0.32)), matPlasterA);
  phSouthW.position.set(-2.9, 1.8, 2.55);
  phGroup.add(phSouthW);
  colliders.push({ minX: 8.95, maxX: 13.0, minZ: -101.4, maxZ: -101.0 });
  const phSouthE = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.8, 3.6, 0.32)), matPlasterA);
  phSouthE.position.set(2.9, 1.8, 2.55);
  phGroup.add(phSouthE);
  colliders.push({ minX: 15.0, maxX: 19.05, minZ: -101.4, maxZ: -101.0 });
  const phRoof = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(10.2, 0.25, 5.6)), matPlasterB);
  phRoof.position.set(0, 3.6, 0);
  phGroup.add(phRoof);
  createHingedDoor(
    'door-corniche-apt',
    'فتح / غلق باب بنتهاوس الكورنيش',
    13.0,
    -101.2,
    0,
    1.95,
    2.5,
    Math.PI * 0.55,
    { minX: 13.0, maxX: 15.0, minZ: -101.4, maxZ: -101.0, active: true },
  );
  const phSignTex = textures.makeCustomShopSign('بنتهاوس الكورنيش النيلي', 'إطلالة مباشرة على النيل', '#0c4a6e', '#38bdf8', '#f0f9ff');
  const phSign = createIlluminatedSign(4.6, 1.1, phSignTex, 0x38bdf8);
  phSign.position.set(14.0, 4.1, -100.9);
  scene.add(phSign);
  const phBed = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.1, 0.55, 1.5)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.8 })),
  );
  phBed.position.set(16.8, 0.44, -104.2);
  scene.add(phBed);
  registerInteractable('corniche-sleep', 'home_sleep', 'النوم في بنتهاوس الكورنيش', 'راحة فاخرة وإطلالة النيل', 'E', new THREE.Vector3(16.2, 0.9, -104.0), 2.8, phBed);
  const phSofa = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.4, 0.72, 1.0)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.8 })),
  );
  phSofa.position.set(11.4, 0.52, -104.5);
  scene.add(phSofa);
  registerInteractable('corniche-view', 'home_tv', 'الاستمتاع بإطلالة الكورنيش والنيل', 'ترفع الروح المعنوية والسمعة', 'E', new THREE.Vector3(11.4, 0.9, -104.5), 2.8, phSofa);

  const spouseActor = rigFactory.createActor({
    shirtColor: 0xbe185d,
    pantsColor: 0x1e293b,
    skinColor: 0xd9a17c,
    hasHijab: true,
    hijabColor: 0xfce7f3,
    hatType: 'hair',
  });
  spouseActor.group.position.set(12.8, 0.16, 11.6);
  spouseActor.group.rotation.y = -Math.PI / 2;
  spouseActor.group.visible = false;
  registerInteractable('family-spouse', 'talk_person', 'التحدث مع زوجتك ❤️', 'اضغط [E] للكلام أو الهدايا أو الخلفة', 'E', new THREE.Vector3(12.8, 1.2, 11.6), 3.0, spouseActor.group, {
    personId: 'spouse',
    personKind: 'spouse',
  });

  const childActors: NpcMeshActor[] = [];
  for (let c = 0; c < 3; c++) {
    const childAct = rigFactory.createActor({
      shirtColor: c % 2 === 0 ? 0x3b82f6 : 0xec4899,
      pantsColor: 0x1e293b,
      skinColor: 0xd69f78,
      hatType: 'hair',
    });
    childAct.group.scale.setScalar(0.62);
    childAct.group.position.set(12.2 + c * 0.95, 0.16, 10.3 + (c % 2) * 1.1);
    childAct.group.visible = false;
    childActors.push(childAct);
    registerInteractable(
      `family-child-${c + 1}`,
      'talk_person',
      'اللعب والحديث مع ابنك/ابنتك',
      'اضغط [E] للعب أو إعطاء مصروف',
      'E',
      childAct.group.position,
      2.8,
      childAct.group,
      { personId: `child-${c + 1}`, personKind: 'child' },
    );
  }

  // =========================================================================
  // 6. ALL 15 OPEN WALK-IN SHOPS + INTERIOR SHELVES + LIVE WORKERS + OWNERS
  // =========================================================================
  const ownerStyles: Array<Omit<CharacterStyleOptions, 'shirtColor' | 'pantsColor'>> = [
    { hasApron: true, hasMustache: true, hatType: 'taqiyah', hatColor: 0xf4f1ea },
    { isGalabiya: true, hasMustache: true, hatType: 'taqiyah', hatColor: 0xe2c07d },
    { hasOveralls: true, hasMustache: true, hatType: 'cap', hatColor: 0xc2410c },
    { isGalabiya: true, hasBeard: true, hatType: 'taqiyah', hatColor: 0xffffff },
    { isGalabiya: true, hasMustache: true, hatType: 'hair' },
    { hasApron: true, hasMustache: true, hatType: 'hair' },
    { hasApron: true, hatType: 'hair' },
    { hatType: 'cap', hatColor: 0x15803d },
    { isGalabiya: true, hasBeard: true, hatType: 'taqiyah', hatColor: 0xf5f5f4 },
    { hasApron: true, hasMustache: true, hatType: 'hair' },
    { hasOveralls: true, hatType: 'cap', hatColor: 0x1d4ed8 },
    { hasApron: true, hasMustache: true, hatType: 'taqiyah', hatColor: 0xfef3c7 },
    { hasHijab: true, hasApron: true }, // د. سمر
    { hasMustache: true, hatType: 'hair' },
    { hasJacket: true, hasMustache: true, hatType: 'hair' },
  ];

  const shelfItemColors = [0xef4444, 0xf59e0b, 0x10b981, 0x3b82f6, 0xec4899];

  CITY_SHOPS.forEach((shop, idx) => {
    const facadeGrp = new THREE.Group();
    facadeGrp.position.set(shop.x, 0, shop.z);
    facadeGrp.rotation.y = shop.facingYaw;

    // Open Walk-In U-Shaped Shop Interior with brighter display + stocked shelves & products!
    const sFloor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(6.8, 0.14, 5.6)), matShopTile);
    sFloor.position.set(0, 0.08, -2.7);
    facadeGrp.add(sFloor);

    const sBack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(6.8, 3.9, 0.3)), idx % 2 === 0 ? matPlasterA : matPlasterB);
    sBack.position.set(0, 1.95, -5.4);
    facadeGrp.add(sBack);
    cameraOccluders.push(sBack);

    const sLeft = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.3, 3.9, 5.6)), idx % 2 === 0 ? matPlasterA : matPlasterB);
    sLeft.position.set(-3.25, 1.95, -2.7);
    facadeGrp.add(sLeft);

    const sRight = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.3, 3.9, 5.6)), idx % 2 === 0 ? matPlasterA : matPlasterB);
    sRight.position.set(3.25, 1.95, -2.7);
    facadeGrp.add(sRight);

    const sRoof = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(7.0, 0.3, 5.8)), matPlasterB);
    sRoof.position.set(0, 3.95, -2.7);
    facadeGrp.add(sRoof);

    // Side showcase glass + wide 4.2m walk-in portal (open for clear visibility of worker & products!)
    const glassWin = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.9, 2.5, 0.12)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xe0f2fe,
          emissive: shop.glowHex,
          emissiveIntensity: 0.18,
          transparent: true,
          opacity: 0.25,
          roughness: 0.15,
        }),
      ),
    );
    glassWin.position.set(-2.15, 1.4, 0);
    facadeGrp.add(glassWin);

    const intCounter = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.4, 0.92, 0.75)), matWood);
    intCounter.position.set(0, 0.56, -2.5);
    facadeGrp.add(intCounter);
    const intCounterTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.5, 0.08, 0.82)), matSteel);
    intCounterTop.position.set(0, 1.04, -2.5);
    facadeGrp.add(intCounterTop);

    // Multi-tier back shelves + stacked colorful products + side chilled cooler
    const backShelf = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(4.8, 2.4, 0.48)), matWood);
    backShelf.position.set(0, 1.3, -4.95);
    facadeGrp.add(backShelf);
    for (let tier = 0; tier < 2; tier++) {
      for (let si = 0; si < 6; si++) {
        const boxItem = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.45, 0.34, 0.34)),
          trackMat(
            new THREE.MeshStandardMaterial({
              color: shelfItemColors[(idx + si + tier) % shelfItemColors.length],
              roughness: 0.5,
            }),
          ),
        );
        boxItem.position.set(-1.9 + si * 0.76, 1.15 + tier * 0.68, -4.78);
        facadeGrp.add(boxItem);
      }
    }
    const sideCooler = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.75, 2.05, 0.85)), matDrinksFridge);
    sideCooler.position.set(2.55, 1.12, -4.4);
    facadeGrp.add(sideCooler);
    if (shop.id === 'shop-grocery' || shop.id === 'shop-supermarket' || shop.id === 'shop-ahwa') {
      const coolerWorld = new THREE.Vector3(2.4, 1.1, -3.8)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), shop.facingYaw)
        .add(new THREE.Vector3(shop.x, 0, shop.z));
      registerInteractable(
        `drink-${shop.id}`,
        'home_drink',
        `شرب مياه وعصير بارد (${shop.nameAr})`,
        'يروي العطش فوراً (٥ جنيه)',
        'E',
        coolerWorld,
        2.6,
        sideCooler,
      );
    }

    // Bright illuminated ceiling LED panel so interior is unmistakably bright & visible
    const ceilingPanel = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(3.6, 0.08, 2.2)),
      trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff8dc, emissiveIntensity: 1.15 })),
    );
    ceilingPanel.position.set(0, 3.74, -2.7);
    facadeGrp.add(ceilingPanel);

    const sAwning = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(6.6, 0.12, 1.9)), matAwning);
    sAwning.position.set(0, 3.1, 0.9);
    sAwning.rotation.x = 0.25;
    facadeGrp.add(sAwning);

    const signTex = textures.makeCustomShopSign(
      shop.nameAr,
      `${shop.categoryAr} · ${shop.ownerNameAr}`,
      '#1a1d24',
      shop.signColorHex,
      '#fffbeb',
    );
    const signBox = createIlluminatedSign(5.2, 1.25, signTex, shop.glowHex);
    signBox.position.set(0, 3.95, 0.18);
    facadeGrp.add(signBox);
    scene.add(facadeGrp);

    const doorOffset = new THREE.Vector3(1.15, 0, 0.08)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), shop.facingYaw)
      .add(new THREE.Vector3(shop.x, 0, shop.z));
    const shopDoor = createHingedDoor(
      `door-${shop.id}`,
      `فتح / غلق باب ${shop.nameAr}`,
      doorOffset.x,
      doorOffset.z,
      shop.facingYaw,
      1.25,
      2.4,
      -Math.PI * 0.56,
      null,
      true,
    );
    shopDoor.isOpen = true;
    shopDoor.progress = 1;
    shopDoor.pivot.rotation.y = shopDoor.openAngle;

    // Live animated Shop Worker standing behind the interior counter INSIDE every store!
    const workerWorldPos = new THREE.Vector3(0, 0.15, -3.55)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), shop.facingYaw)
      .add(new THREE.Vector3(shop.x, 0, shop.z));
    const workerActor = rigFactory.createActor({
      shirtColor: shop.glowHex,
      pantsColor: 0x1e293b,
      skinColor: idx % 2 === 0 ? 0xc99168 : 0xd49b72,
      hasApron: true,
      hasMustache: idx % 3 === 0,
      hatType: 'hair',
    });
    workerActor.group.position.set(workerWorldPos.x, 0.15, workerWorldPos.z);
    workerActor.group.rotation.y = shop.facingYaw;
    animateHumanActor(workerActor, 'idle', idx * 0.9, 0.016);
    shopWorkers.push({
      id: `worker-${shop.id}`,
      shopId: shop.id,
      actor: workerActor,
      x: workerWorldPos.x,
      z: workerWorldPos.z,
      facingYaw: shop.facingYaw,
    });
    registerInteractable(
      `worker-${shop.id}`,
      'talk_person',
      `التحدث مع ${shop.workerNameAr} (${shop.nameAr})`,
      `${shop.workerRoleAr} داخل المحل · [E]`,
      'E',
      new THREE.Vector3(workerWorldPos.x, 1.3, workerWorldPos.z),
      3.1,
      workerActor.group,
      { personId: shop.id, personKind: 'worker', shopId: shop.id },
    );

    const npcOffset = new THREE.Vector3(-1.4, 0, 1.25)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), shop.facingYaw)
      .add(new THREE.Vector3(shop.x, 0.14, shop.z));

    const st = ownerStyles[idx % ownerStyles.length];
    const ownerActor = rigFactory.createActor({
      shirtColor: shop.facadeColor,
      pantsColor: 0x22262c,
      skinColor: idx % 3 === 0 ? 0xd29c74 : idx % 3 === 1 ? 0xc2875e : 0xb87a52,
      hijabColor: 0xe2e8f0,
      ...st,
    });
    ownerActor.group.position.set(npcOffset.x, 0.14, npcOffset.z);
    ownerActor.group.rotation.y = shop.facingYaw;
    animateHumanActor(ownerActor, 'idle', idx * 0.7, 0.016);

    shopOwners.push({
      shopId: shop.id,
      actor: ownerActor,
      x: npcOffset.x,
      z: npcOffset.z,
      facingYaw: shop.facingYaw,
    });

    registerInteractable(
      `owner-${shop.id}`,
      'talk_shop_owner',
      `${shop.nameAr} — التحدث مع ${shop.ownerNameAr}`,
      `شراء بضاعة أو تملك المحل (${shop.purchasePrice} ج.م)`,
      'E',
      new THREE.Vector3(npcOffset.x, 1.3, npcOffset.z),
      3.4,
      ownerActor.group,
      { shopId: shop.id },
    );
  });

  // =========================================================================
  // 6B. ROMANCE NPCs (بنات المدينة والحي للحوار والمعاكسة والزواج)
  // =========================================================================
  ROMANCE_NPCS.forEach((girl, gi) => {
    const actor = rigFactory.createActor({
      shirtColor: girl.dressColor,
      pantsColor: 0x1e293b,
      skinColor: girl.skinColor,
      hasHijab: girl.hijabColor !== null,
      hijabColor: girl.hijabColor ?? 0xfef3c7,
      hatType: 'hair',
    });
    actor.group.position.set(girl.homeX, 0.14, girl.homeZ);
    actor.group.rotation.y = gi * 1.1;
    animateHumanActor(actor, 'idle', gi * 1.3, 0.016);

    romanceActors.push({
      id: girl.id,
      nameAr: girl.nameAr,
      actor,
      homeX: girl.homeX,
      homeZ: girl.homeZ,
      phaseOffset: gi * 1.3,
    });

    registerInteractable(
      `romance-${girl.id}`,
      'talk_person',
      `التحدث مع ${girl.nameAr} (${girl.jobAr})`,
      'كلام، هزار، معاكسة، أو خطوبة [E]',
      'E',
      actor.group.position,
      3.2,
      actor.group,
      { personId: girl.id, personKind: 'romance' },
    );
  });

  // =========================================================================
  // 6C. OWNABLE BUILDINGS (عمائر للبيع) & RESTAURANT BRANCHES (فروع المطعم)
  // =========================================================================
  const buildingOwnerBadges = new Map<string, THREE.Group>();
  OWNABLE_BUILDINGS.forEach((bld, bi) => {
    const bGrp = createEgyptianApartment(bld.x, bld.z, 10.2, 9.2, bld.floors, bi % 2 === 0 ? 1 : -1, bi % 2 === 1, 0);
    colliders.push({ minX: bld.x - 5.3, maxX: bld.x + 5.3, minZ: bld.z - 4.8, maxZ: bld.z + 4.8 });
    const ownerSignTex = textures.makeCustomShopSign(
      bld.nameAr,
      'ملك المعلم محمد حامد',
      '#78350f',
      '#fde047',
      '#ffffff',
    );
    const ownerBadge = createIlluminatedSign(5.6, 1.35, ownerSignTex, 0xfbbf24);
    ownerBadge.position.set(0, bld.floors * 3.4 + 1.2, 4.75);
    ownerBadge.visible = false;
    bGrp.add(ownerBadge);
    buildingOwnerBadges.set(bld.id, ownerBadge);

    registerInteractable(
      `obj-bld-${bld.id}`,
      'talk_object',
      `${bld.nameAr} (${bld.streetAr})`,
      'اضغط [E] للكلام أو الاستفسار عن العمارة',
      'E',
      new THREE.Vector3(bld.x, 1.3, bld.z + 5.2),
      3.4,
      bGrp,
      { objectKind: 'building', objectId: `obj-bld-${bld.id}` },
    );
  });
  const setOwnedBuildings = (buildingIds: string[]) => {
    const set = new Set(buildingIds);
    buildingOwnerBadges.forEach((badge, id) => {
      badge.visible = set.has(id);
    });
  };

  const branchGroups = new Map<string, THREE.Group>();
  RESTAURANT_BRANCHES.forEach((br) => {
    const brGrp = new THREE.Group();
    brGrp.position.set(br.x, 0, br.z);
    brGrp.rotation.y = br.facingYaw;
    brGrp.visible = false;
    scene.add(brGrp);

    const floor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(7.2, 0.16, 6.0)), matShopTile);
    floor.position.set(0, 0.08, 0);
    brGrp.add(floor);
    const back = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(7.2, 3.6, 0.3)), matPlasterA);
    back.position.set(0, 1.8, -2.85);
    brGrp.add(back);
    const sideL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.3, 3.6, 6.0)), matPlasterB);
    sideL.position.set(-3.45, 1.8, 0);
    brGrp.add(sideL);
    const sideR = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.3, 3.6, 6.0)), matPlasterB);
    sideR.position.set(3.45, 1.8, 0);
    brGrp.add(sideR);
    const roof = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(7.4, 0.3, 6.2)), matPlasterB);
    roof.position.set(0, 3.7, 0);
    brGrp.add(roof);
    const counter = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.8, 0.96, 0.8)), matWood);
    counter.position.set(0, 0.56, -0.8);
    brGrp.add(counter);
    const brSignTex = textures.makeCustomShopSign(br.nameAr, 'فرع رسمي مفتوح ٢٤ ساعة', '#0f172a', '#fbbf24', '#fffbeb');
    const brSign = createIlluminatedSign(5.4, 1.25, brSignTex, 0xfbbf24);
    brSign.position.set(0, 3.85, 3.1);
    brGrp.add(brSign);
    const brWorker = rigFactory.createActor({
      shirtColor: 0xa82424,
      pantsColor: 0x1e293b,
      skinColor: 0xc99168,
      hasApron: true,
      hatType: 'hair',
    });
    brWorker.group.position.set(0, 0.16, -1.75);
    brGrp.add(brWorker.group);
    branchGroups.set(br.id, brGrp);
  });
  const setOwnedBranches = (branchIds: string[]) => {
    const set = new Set(branchIds);
    branchGroups.forEach((grp, id) => {
      grp.visible = set.has(id);
    });
  };

  // =========================================================================
  // 7. HERO VEHICLE (SEDAN / PICKUP / DELIVERY MOTO + MULTI-PASSENGER CAB/BED)
  // =========================================================================
  const heroCar = buildHeroSedan(scene, textures, isSoftwareGl);
  registerInteractable(
    'shared-car',
    'enter_car',
    'ركوب وقيادة المركبة المشتركة',
    'تفتح الباب وترجع تغلق تلقائياً',
    'F',
    heroCar.carGroup.position,
    3.8,
    heroCar.carGroup,
  );

  // =========================================================================
  // 8. SKYLINE MINARET, UTILITY CABLES, FESTIVE LIGHTS & MISSION BEACONS
  // =========================================================================
  const minaretGroup = new THREE.Group();
  minaretGroup.position.set(-14, 0, -47);
  const mBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.2, 9.0, 3.2)), matPlasterA);
  mBase.position.y = 4.5;
  minaretGroup.add(mBase);
  const mShaft = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(1.15, 1.35, 9.5, 10)), matPlasterA);
  mShaft.position.y = 13.5;
  minaretGroup.add(mShaft);
  const mDome = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(1.1, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6)), matBrass);
  mDome.position.y = 18.2;
  minaretGroup.add(mDome);
  const mSpire = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(0.18, 2.2, 8)), matBrass);
  mSpire.position.y = 20.1;
  minaretGroup.add(mSpire);
  scene.add(minaretGroup);

  const cableMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x161618, roughness: 0.8 }));
  const addCatenaryCable = (p1: THREE.Vector3, p2: THREE.Vector3, sag = 1.0) => {
    const mid = p1.clone().lerp(p2, 0.5);
    mid.y -= sag;
    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    propClutterGroup.add(new THREE.Mesh(trackGeo(new THREE.TubeGeometry(curve, 10, 0.022, 5, false)), cableMat));
  };
  for (const [x1, z1, x2, z2] of [
    [-5.8, -5.2, 5.8, -5.2],
    [-5.8, 10.6, 5.8, 10.6],
    [-22.2, -5.2, -5.8, -5.2],
    [5.8, -5.2, 22.2, -5.2],
  ]) {
    addCatenaryCable(new THREE.Vector3(x1, 7.6, z1), new THREE.Vector3(x2, 7.6, z2), 0.78);
  }

  const stringLightBulbs: THREE.MeshStandardMaterial[] = [];
  const festoonPalette = [0xffbe0b, 0xfb5607, 0x06d6a0, 0xef476f];
  const wireMat = trackMat(new THREE.LineBasicMaterial({ color: 0x1b1917 }));
  for (const fz of [-4.2, 4.2, 16.5]) {
    const wirePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const fx = THREE.MathUtils.lerp(-8.8, 9.0, t);
      const fy = 5.65 - Math.sin(t * Math.PI) * 1.1;
      wirePoints.push(new THREE.Vector3(fx, fy, fz));
      if (i % 2 === 1) {
        const bMat = trackMat(
          new THREE.MeshStandardMaterial({
            color: festoonPalette[i % festoonPalette.length],
            emissive: festoonPalette[i % festoonPalette.length],
            emissiveIntensity: 0.45,
          }),
        );
        const bMesh = new THREE.Mesh(trackGeo(new THREE.OctahedronGeometry(0.085, 0)), bMat);
        bMesh.position.set(fx, fy - 0.09, fz);
        propClutterGroup.add(bMesh);
        stringLightBulbs.push(bMat);
      }
    }
    propClutterGroup.add(new THREE.Line(trackGeo(new THREE.BufferGeometry().setFromPoints(wirePoints)), wireMat));
  }

  const makeBeacon = (colorHex: number): THREE.Group => {
    const g = new THREE.Group();
    g.visible = false;
    const ring = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(1.3, 0.1, 10, 24)),
      trackMat(new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 0.9 })),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.2;
    g.add(ring);
    const pillar = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.32, 0.32, 6.0, 10)),
      trackMat(new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.24, depthWrite: false })),
    );
    pillar.position.y = 3.0;
    g.add(pillar);
    scene.add(g);
    return g;
  };
  const deliveryBeacon = makeBeacon(0x06d6a0);
  const taxiPickupBeacon = makeBeacon(0xfbbf24);
  const taxiDropoffBeacon = makeBeacon(0x38bdf8);

  // Random Street Event 3D Visual Pools (مشاجرة / سيارة معطلة / بائع متجول)
  const fightGroup = new THREE.Group();
  fightGroup.visible = false;
  scene.add(fightGroup);
  const fightActorA = rigFactory.createActor({
    shirtColor: 0xb91c1c,
    pantsColor: 0x1f2937,
    skinColor: 0xc99168,
    hasMustache: true,
    hatType: 'hair',
  });
  fightActorA.group.position.set(-0.75, 0.14, 0);
  fightActorA.group.rotation.y = Math.PI / 2;
  setActorExpression(fightActorA, 'angry');
  fightGroup.add(fightActorA.group);
  const fightActorB = rigFactory.createActor({
    shirtColor: 0x334155,
    pantsColor: 0x292524,
    skinColor: 0xc2875e,
    isGalabiya: true,
    hasBeard: true,
    hatType: 'taqiyah',
    hatColor: 0xf4f1ea,
  });
  fightActorB.group.position.set(0.75, 0.14, 0);
  fightActorB.group.rotation.y = -Math.PI / 2;
  setActorExpression(fightActorB, 'angry');
  fightGroup.add(fightActorB.group);

  const brokenCarGroup = new THREE.Group();
  brokenCarGroup.visible = false;
  scene.add(brokenCarGroup);
  const brokenCarBody = trafficFactory.createVehicle('sedan', 0x475569);
  brokenCarGroup.add(brokenCarBody);
  const openHood = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.52, 0.07, 1.15)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.45 })),
  );
  openHood.position.set(0, 1.24, -1.45);
  openHood.rotation.x = 0.62;
  brokenCarGroup.add(openHood);
  const hazardMatL = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.5 }),
  );
  const hazardMatR = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.5 }),
  );
  for (const [hx, hm] of [
    [-0.68, hazardMatL],
    [0.68, hazardMatR],
  ] as const) {
    const hz = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.11, 8, 8)), hm);
    hz.position.set(hx, 0.68, 2.05);
    brokenCarGroup.add(hz);
  }
  const brokenCarSmoke: THREE.Mesh[] = [];
  const smokeMat = trackMat(
    new THREE.MeshBasicMaterial({ color: 0xd6d3d1, transparent: true, opacity: 0.45, depthWrite: false }),
  );
  for (let si = 0; si < 6; si++) {
    const sm = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.18 + si * 0.03, 8, 6)), smokeMat);
    sm.position.set((si % 2 === 0 ? -1 : 1) * 0.14, 1.1 + si * 0.35, -1.65);
    brokenCarGroup.add(sm);
    brokenCarSmoke.push(sm);
  }

  const vendorGroup = new THREE.Group();
  vendorGroup.visible = false;
  scene.add(vendorGroup);
  vendorGroup.add(buildFruitCart(true));
  const vendorActor = rigFactory.createActor({
    shirtColor: 0xe2e8f0,
    pantsColor: 0x334155,
    skinColor: 0xc2875e,
    isGalabiya: true,
    hasMustache: true,
    hatType: 'taqiyah',
    hatColor: 0xf8fafc,
  });
  vendorActor.group.position.set(-1.35, 0.14, 0.35);
  setActorExpression(vendorActor, 'happy');
  vendorGroup.add(vendorActor.group);

  const weddingGroup = new THREE.Group();
  weddingGroup.visible = false;
  scene.add(weddingGroup);
  const matGoldTrim = trackMat(new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.55 }));
  const matArchRed = trackMat(new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.55 }));
  for (const wx of [-1.4, 1.4]) {
    const pole = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8)), matGoldTrim);
    pole.position.set(wx, 1.6, 0);
    weddingGroup.add(pole);
  }
  const archTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.2, 0.35, 0.25)), matArchRed);
  archTop.position.set(0, 3.25, 0);
  weddingGroup.add(archTop);
  const banquetTable = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.2, 0.85, 0.9)), matWood);
  banquetTable.position.set(0, 0.42, 0.25);
  weddingGroup.add(banquetTable);
  const weddingActorA = rigFactory.createActor({
    shirtColor: 0x1e293b,
    pantsColor: 0x0f172a,
    skinColor: 0xc99168,
    hasMustache: true,
    hatType: 'hair',
  });
  weddingActorA.group.position.set(-1.15, 0.14, 0.75);
  setActorExpression(weddingActorA, 'happy');
  weddingGroup.add(weddingActorA.group);
  const weddingActorB = rigFactory.createActor({
    shirtColor: 0xdb2777,
    pantsColor: 0x3b0764,
    skinColor: 0xd49b72,
    hasHijab: true,
    hijabColor: 0xfce7f3,
    isSkirt: true,
  });
  weddingActorB.group.position.set(1.15, 0.14, 0.75);
  setActorExpression(weddingActorB, 'happy');
  weddingGroup.add(weddingActorB.group);

  const eventBeacon = makeBeacon(0xf97316);
  const streetEventVisuals: StreetEventVisuals = {
    fightGroup,
    fightActorA,
    fightActorB,
    brokenCarGroup,
    brokenCarHazardMats: [hazardMatL, hazardMatR],
    brokenCarSmoke,
    vendorGroup,
    vendorActor,
    weddingGroup,
    weddingActors: [weddingActorA, weddingActorB],
    beacon: eventBeacon,
  };

  const taxiPassengerActor = rigFactory.createActor({
    shirtColor: 0x0284c7,
    pantsColor: 0x1e293b,
    skinColor: 0xc99168,
    hatType: 'hair',
  });
  taxiPassengerActor.group.visible = false;

  const yellowArrowGroup = new THREE.Group();
  yellowArrowGroup.visible = false;
  const arrowMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.65, roughness: 0.25 }),
  );
  const arrowHead = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(0.18, 0.28, 10)), arrowMat);
  arrowHead.rotation.x = Math.PI;
  arrowHead.position.y = 0.14;
  yellowArrowGroup.add(arrowHead);
  const arrowShaft = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.24, 8)), arrowMat);
  arrowShaft.position.y = 0.36;
  yellowArrowGroup.add(arrowShaft);
  scene.add(yellowArrowGroup);

  const steamGeo = trackGeo(new THREE.SphereGeometry(0.11, 6, 6));
  const steamMat = trackMat(new THREE.MeshBasicMaterial({ color: 0xf8f4ec, transparent: true, opacity: 0.35, depthWrite: false }));
  const steamInstanced = new THREE.InstancedMesh(steamGeo, steamMat, 24);
  steamInstanced.frustumCulled = false;
  scene.add(steamInstanced);

  const rainGeo = trackGeo(new THREE.BoxGeometry(0.03, 0.55, 0.03));
  const rainMat = trackMat(new THREE.MeshBasicMaterial({ color: 0xaecae8, transparent: true, opacity: 0.5 }));
  const rainInstanced = new THREE.InstancedMesh(rainGeo, rainMat, 140);
  rainInstanced.frustumCulled = false;
  rainInstanced.visible = false;
  scene.add(rainInstanced);

  const burstGeo = trackGeo(new THREE.OctahedronGeometry(0.09, 0));
  const burstMat = trackMat(new THREE.MeshBasicMaterial({ color: 0xffd166 }));
  const burstInstanced = new THREE.InstancedMesh(burstGeo, burstMat, 32);
  burstInstanced.frustumCulled = false;
  scene.add(burstInstanced);

  // =========================================================================
  // 9. PLAYER ACTOR (GTA ANATOMICAL RIG)
  // =========================================================================
  const playerActor = rigFactory.createActor({
    shirtColor: 0xa82424,
    pantsColor: 0x22262b,
    skinColor: 0xc99168,
    hasJacket: true,
    hasMustache: true,
    hatType: 'hair',
  });
  playerActor.group.visible = false;

  const setPlayerAppearance = (shirtColor: number, skinColor: number) => {
    playerActor.shirtMaterial.color.setHex(shirtColor);
    playerActor.skinMaterial.color.setHex(skinColor);
    heroCar.driverSleeveMat.color.setHex(shirtColor);
    heroCar.driverSkinMat.color.setHex(skinColor);
    apronSleeveMat.color.setHex(shirtColor);
    handSkinMat.color.setHex(skinColor);
  };

  return {
    colliders,
    cameraOccluders,
    interactables,
    doors,
    shopOwners,
    shopWorkers,
    romanceActors,
    householdActors,
    benhaStudents,
    spouseActor,
    childActors,
    fulCoworkers,
    flagMeshes,
    fryingPatties,
    cookHandsGroup,
    shutterMesh,
    shopLights: [shopLightMain, shopLightSign],
    streetLampLights,
    streetLampBulbMat,
    shopNeonMaterials,
    asphaltMaterials,
    heroCar,
    repairBayCar,
    taxiPassengerActor,
    taxiPickupBeacon,
    taxiDropoffBeacon,
    deliveryBeacon,
    yellowArrowGroup,
    propClutterGroup,
    streetEventVisuals,
    diningSeats,
    cornicheFeluccas,
    sizzleRingMesh,
    upgradedFulPot2,
    upgradedFryerAddons,
    upgradedDecorAddons,
    nsSignalMats,
    ewSignalMats,
    nileWaterMesh,
    stringLightBulbs,
    rainInstanced,
    steamInstanced,
    burstInstanced,
    playerActor,
    setPlayerAppearance,
    setAdBoardDisplay,
    setRestaurantFloors,
    setOwnedBuildings,
    setOwnedBranches,
    createNpcActor: rigFactory.createActor,
    createTrafficVehicle: trafficFactory.createVehicle,
    dispose: () => {
      rigFactory.dispose();
      trafficFactory.dispose();
      heroCar.dispose();
      for (const d of disposables) d.dispose();
    },
  };
}
