import * as THREE from 'three';
import { ProceduralTextureSet } from './textures';
import { OwnedVehicleId } from './types';

export interface VehiclePassengerVisual {
  shirtColor: number;
  skinColor: number;
  hijabColor?: number | null;
  isChild?: boolean;
}

export interface HeroCarRig {
  carGroup: THREE.Group;
  carChassisTilt: THREE.Group;
  carWheels: THREE.Group[];
  frontWheelSteerPivots: THREE.Group[];
  carSteeringWheel: THREE.Group;
  gearStickPivot: THREE.Group;
  driverDoorPivot: THREE.Group;
  passengerDoorPivot: THREE.Group;
  speedNeedlePivot: THREE.Group;
  rpmNeedlePivot: THREE.Group;
  fuelNeedlePivot: THREE.Group;
  wiperLeftPivot: THREE.Group;
  wiperRightPivot: THREE.Group;
  tasbeehPivot: THREE.Group;
  cockpitHandsGroup: THREE.Group;
  leftArmAnchor: THREE.Group;
  rightArmAnchor: THREE.Group;
  driverSleeveMat: THREE.MeshStandardMaterial;
  driverSkinMat: THREE.MeshStandardMaterial;
  carHeadlightsMat: THREE.MeshStandardMaterial;
  carTaillightsMat: THREE.MeshStandardMaterial;
  leftBlinkerMat: THREE.MeshStandardMaterial;
  rightBlinkerMat: THREE.MeshStandardMaterial;
  dashLeftIndMat: THREE.MeshStandardMaterial;
  dashRightIndMat: THREE.MeshStandardMaterial;
  radioGlowMat: THREE.MeshStandardMaterial;
  carBodyMat: THREE.MeshStandardMaterial;
  headlightSpot: THREE.SpotLight;
  heroSmokeMeshes: THREE.Mesh[];
  setCompanionVisible: (
    visible: boolean,
    dressColor?: number,
    skinColor?: number,
    hijabColor?: number | null,
  ) => void;
  setMultiPassengers: (passengers: VehiclePassengerVisual[]) => void;
  setOwnerLockVisual: (locked: boolean) => void;
  setVehiclePaint: (colorHex: number, isMetallic?: boolean) => void;
  setVehicleType: (vehicleId: OwnedVehicleId, colorHex: number, isMetallic?: boolean) => void;
  dispose: () => void;
}

export type TrafficVehicleKind =
  | 'taxi'
  | 'microbus'
  | 'sedan'
  | 'pickup'
  | 'tuktuk'
  | 'motorcycle';

export interface TrafficVehicleFactory {
  createVehicle: (kind: TrafficVehicleKind, colorOverride?: number) => THREE.Group;
  dispose: () => void;
}

export function buildHeroSedan(
  scene: THREE.Scene,
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean,
): HeroCarRig {
  const disposables: Array<{ dispose: () => void }> = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposables.push(m);
    return m;
  };

  const carGroup = new THREE.Group();
  carGroup.position.set(-3.6, 0, 5.6);
  scene.add(carGroup);

  const shadowMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  );
  const shadowDisc = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(2.35, 18)), shadowMat);
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.03;
  carGroup.add(shadowDisc);

  const carChassisTilt = new THREE.Group();
  carGroup.add(carChassisTilt);

  const carBodyMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xb81d24,
      roughness: 0.22,
      metalness: 0.55,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1,
    }),
  );
  const carGlassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x9bd1f2,
      roughness: 0.08,
      metalness: 0.2,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  const carInteriorMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.leatherDash,
      roughness: 0.78,
    }),
  );
  const carSeatMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x7c5338, roughness: 0.82 }),
  );
  const carTireMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.92, metalness: 0.04 }),
  );
  const matSteel = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xd8dde3, roughness: 0.22, metalness: 0.88 }),
  );
  const matDarkIron = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x202226, roughness: 0.5, metalness: 0.7 }),
  );
  const matBrass = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xe2b144, roughness: 0.24, metalness: 0.86 }),
  );

  const carHeadlightsMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff3c4,
      emissive: 0xffd166,
      emissiveIntensity: 0.45,
      roughness: 0.2,
    }),
  );
  const carTaillightsMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xd62828,
      emissive: 0xef233c,
      emissiveIntensity: 0.45,
      roughness: 0.25,
    }),
  );
  const leftBlinkerMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xff9f1c,
      emissiveIntensity: 0.05,
      roughness: 0.3,
    }),
  );
  const rightBlinkerMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xff9f1c,
      emissiveIntensity: 0.05,
      roughness: 0.3,
    }),
  );
  const dashLeftIndMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x166534,
      emissive: 0x22c55e,
      emissiveIntensity: 0.05,
    }),
  );
  const dashRightIndMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x166534,
      emissive: 0x22c55e,
      emissiveIntensity: 0.05,
    }),
  );

  // Switchable Exterior Shells inside carChassisTilt (Sedan / Pickup / TukTuk)
  const sedanShellGroup = new THREE.Group();
  carChassisTilt.add(sedanShellGroup);

  const floorPan = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.66, 0.14, 4.25)),
    carInteriorMat,
  );
  floorPan.position.set(0, 0.41, 0);
  sedanShellGroup.add(floorPan);

  const hoodMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.68, 0.42, 1.18)),
    carBodyMat,
  );
  hoodMesh.position.set(0, 0.64, -1.56);
  hoodMesh.rotation.x = 0.05;
  hoodMesh.castShadow = !isSoftwareGl;
  sedanShellGroup.add(hoodMesh);

  const trunkMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.68, 0.48, 1.04)),
    carBodyMat,
  );
  trunkMesh.position.set(0, 0.66, 1.63);
  trunkMesh.castShadow = !isSoftwareGl;
  sedanShellGroup.add(trunkMesh);

  // Rear quarters & rocker sills
  for (const sx of [-0.79, 0.79]) {
    const rocker = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.12, 0.2, 2.35)),
      carBodyMat,
    );
    rocker.position.set(sx, 0.42, -0.05);
    sedanShellGroup.add(rocker);

    const rearQuarter = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.12, 0.48, 0.92)),
      carBodyMat,
    );
    rearQuarter.position.set(sx, 0.68, 0.72);
    sedanShellGroup.add(rearQuarter);
  }

  // Roof, Headliner, Sun Visors & Pillars
  const carRoofMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x18191c,
      roughness: 0.28,
      metalness: 0.35,
      clearcoat: 0.75,
    }),
  );
  const roofCap = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.56, 0.06, 1.56)),
    carBodyMat,
  );
  roofCap.position.set(0, 1.56, 0.16);
  roofCap.castShadow = !isSoftwareGl;
  sedanShellGroup.add(roofCap);

  // Cairo Black-Top Roof Overlay + Glowing TAXI Sign (for taxi_verna)
  const taxiBlackTop = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.58, 0.075, 1.58)),
    carRoofMat,
  );
  taxiBlackTop.position.set(0, 1.57, 0.16);
  taxiBlackTop.visible = false;
  sedanShellGroup.add(taxiBlackTop);

  const taxiRoofSign = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.62, 0.18, 0.24)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.85,
      }),
    ),
  );
  taxiRoofSign.position.set(0, 1.69, -0.18);
  taxiRoofSign.visible = false;
  sedanShellGroup.add(taxiRoofSign);

  // Sport Coupe Rear Wing Spoiler (for sport_coupe)
  const sportSpoilerGroup = new THREE.Group();
  sportSpoilerGroup.position.set(0, 0.98, 1.98);
  const wingBlade = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.58, 0.05, 0.26)),
    carBodyMat,
  );
  wingBlade.position.y = 0.12;
  sportSpoilerGroup.add(wingBlade);
  for (const sx of [-0.52, 0.52]) {
    const strut = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.06, 0.16, 0.16)),
      matDarkIron,
    );
    strut.position.set(sx, 0.04, 0);
    sportSpoilerGroup.add(strut);
  }
  sportSpoilerGroup.visible = false;
  sedanShellGroup.add(sportSpoilerGroup);

  const headliner = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.48, 0.025, 1.48)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xcbc2b4, roughness: 0.9 })),
  );
  headliner.position.set(0, 1.522, 0.16);
  sedanShellGroup.add(headliner);

  const domeLight = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.16, 0.02, 0.09)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfffbeb,
        emissive: 0xfde68a,
        emissiveIntensity: 0.35,
      }),
    ),
  );
  domeLight.position.set(0, 1.505, 0.04);
  sedanShellGroup.add(domeLight);

  for (const vx of [-0.36, 0.36]) {
    const visor = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.32, 0.028, 0.02)),
      trackMat(new THREE.MeshStandardMaterial({ color: 0x3f3a36, roughness: 0.85 })),
    );
    visor.position.set(vx, 1.516, -0.66);
    visor.rotation.x = 0.14;
    sedanShellGroup.add(visor);
  }

  const pillarGeo = trackGeo(new THREE.BoxGeometry(0.075, 0.72, 0.085));
  for (const px of [-0.74, 0.74]) {
    const aPillar = new THREE.Mesh(pillarGeo, carBodyMat);
    aPillar.position.set(px, 1.24, -0.84);
    aPillar.rotation.x = 0.44;
    sedanShellGroup.add(aPillar);

    const bPillar = new THREE.Mesh(pillarGeo, carBodyMat);
    bPillar.position.set(px, 1.24, 0.22);
    sedanShellGroup.add(bPillar);

    const cPillar = new THREE.Mesh(pillarGeo, carBodyMat);
    cPillar.position.set(px, 1.24, 1.14);
    cPillar.rotation.x = -0.44;
    sedanShellGroup.add(cPillar);
  }

  // Windshield + Working Rain Wipers
  const frontGlass = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(1.44, 0.72)),
    carGlassMat,
  );
  frontGlass.position.set(0, 1.23, -0.84);
  frontGlass.rotation.x = -Math.PI / 2 + 0.44;
  carChassisTilt.add(frontGlass);

  const rearGlass = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(1.44, 0.72)),
    carGlassMat,
  );
  rearGlass.position.set(0, 1.23, 1.14);
  rearGlass.rotation.x = Math.PI / 2 - 0.44;
  carChassisTilt.add(rearGlass);

  const buildWiper = (wx: number): THREE.Group => {
    const pivot = new THREE.Group();
    pivot.position.set(wx, 0.94, -0.97);
    pivot.rotation.x = -0.46;
    const arm = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.018, 0.42, 0.016)),
      matDarkIron,
    );
    arm.position.set(0, 0.2, 0);
    pivot.add(arm);
    const blade = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.025, 0.36, 0.012)),
      carTireMat,
    );
    blade.position.set(0.04, 0.28, 0.008);
    blade.rotation.z = -0.25;
    pivot.add(blade);
    carChassisTilt.add(pivot);
    return pivot;
  };
  const wiperLeftPivot = buildWiper(-0.42);
  const wiperRightPivot = buildWiper(0.08);

  // Articulated Hinged Left Driver & Right Passenger Doors
  const buildCarDoor = (side: -1 | 1): THREE.Group => {
    // Hinge at A-pillar edge (Z = -0.92), extending backward to B-pillar (Z = +0.20 -> len 1.12m)
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.81, 0.46, -0.92);

    const doorSheet = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.09, 0.46, 1.12)),
      carBodyMat,
    );
    doorSheet.position.set(0, 0.23, 0.56);
    pivot.add(doorSheet);

    const doorCard = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.04, 0.38, 1.04)),
      carInteriorMat,
    );
    doorCard.position.set(-side * 0.038, 0.24, 0.56);
    pivot.add(doorCard);

    const armrest = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.075, 0.055, 0.44)),
      carSeatMat,
    );
    armrest.position.set(-side * 0.06, 0.29, 0.56);
    pivot.add(armrest);

    const handle = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.04, 0.035, 0.14)),
      matSteel,
    );
    handle.position.set(side * 0.05, 0.37, 0.88);
    pivot.add(handle);

    const sideMirror = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.18, 0.1, 0.12)),
      carBodyMat,
    );
    sideMirror.position.set(side * 0.13, 0.49, 0.12);
    pivot.add(sideMirror);

    const mirrorGlass = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(0.14, 0.08)),
      matSteel,
    );
    mirrorGlass.position.set(side * 0.13, 0.49, 0.185);
    pivot.add(mirrorGlass);

    const doorGlass = new THREE.Mesh(
      trackGeo(new THREE.PlaneGeometry(1.0, 0.42)),
      carGlassMat,
    );
    doorGlass.rotation.y = Math.PI / 2;
    doorGlass.position.set(0, 0.67, 0.56);
    pivot.add(doorGlass);

    carChassisTilt.add(pivot);
    return pivot;
  };
  const driverDoorPivot = buildCarDoor(-1);
  const passengerDoorPivot = buildCarDoor(1);

  // Dashboard + Live Needles + Radio Glow + Turn Signal Arrows
  const dashBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.48, 0.24, 0.44)),
    carInteriorMat,
  );
  dashBody.position.set(0, 0.96, -0.72);
  carChassisTilt.add(dashBody);

  const dashHood = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.68, 0.07, 0.22)),
    carInteriorMat,
  );
  dashHood.position.set(-0.36, 1.1, -0.62);
  carChassisTilt.add(dashHood);

  const dashFace = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(1.38, 0.2)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.carDashboard,
        emissiveMap: textures.carDashboard,
        emissive: 0xffffff,
        emissiveIntensity: 0.62,
        roughness: 0.26,
      }),
    ),
  );
  dashFace.position.set(0, 0.99, -0.498);
  carChassisTilt.add(dashFace);

  // Physical 3D Dashboard Needles protruding slightly from dashFace toward +Z
  const makeNeedle = (x: number, y: number, len: number, color: number): THREE.Group => {
    const piv = new THREE.Group();
    piv.position.set(x, y, -0.49);
    const blade = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.008, len, 0.006)),
      trackMat(new THREE.MeshBasicMaterial({ color })),
    );
    blade.position.y = len * 0.42;
    piv.add(blade);
    const cap = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.011, 0.011, 0.008, 8)),
      matDarkIron,
    );
    cap.rotation.x = Math.PI / 2;
    piv.add(cap);
    carChassisTilt.add(piv);
    return piv;
  };
  // Gauge coordinates mapped onto 1.38m-wide dashFace centered at x=0, y=0.99
  const speedNeedlePivot = makeNeedle(-0.48, 0.99, 0.056, 0xef4444);
  const rpmNeedlePivot = makeNeedle(-0.24, 0.99, 0.048, 0xf97316);
  const fuelNeedlePivot = makeNeedle(-0.08, 0.97, 0.03, 0x22c55e);

  const dashLeftInd = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.028, 0.016, 0.01)),
    dashLeftIndMat,
  );
  dashLeftInd.position.set(-0.41, 1.055, -0.492);
  carChassisTilt.add(dashLeftInd);
  const dashRightInd = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.028, 0.016, 0.01)),
    dashRightIndMat,
  );
  dashRightInd.position.set(-0.31, 1.055, -0.492);
  carChassisTilt.add(dashRightInd);

  const radioGlowMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.75,
    }),
  );
  const radioStrip = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.24, 0.012, 0.01)),
    radioGlowMat,
  );
  radioStrip.position.set(0.16, 0.915, -0.492);
  carChassisTilt.add(radioStrip);

  // Steering Column + 3-Spoke Wheel + Visible Driver Hands/Forearms
  const steerCol = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.032, 0.038, 0.24, 8)),
    carInteriorMat,
  );
  steerCol.rotation.x = Math.PI / 2 - 0.38;
  steerCol.position.set(-0.38, 0.99, -0.49);
  carChassisTilt.add(steerCol);

  const carSteeringWheel = new THREE.Group();
  carSteeringWheel.position.set(-0.38, 1.04, -0.35);
  carSteeringWheel.rotation.x = 0.42;
  const swRim = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.145, 0.022, 8, 24)),
    carInteriorMat,
  );
  carSteeringWheel.add(swRim);
  const swHub = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.044, 0.044, 0.03, 12)),
    matSteel,
  );
  swHub.rotation.x = Math.PI / 2;
  carSteeringWheel.add(swHub);
  const swSpokeH = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.27, 0.028, 0.018)),
    matSteel,
  );
  carSteeringWheel.add(swSpokeH);
  const swSpokeV = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.028, 0.14, 0.018)),
    matSteel,
  );
  swSpokeV.position.y = -0.07;
  carSteeringWheel.add(swSpokeV);
  carChassisTilt.add(carSteeringWheel);

  // Driver Visible Arms & Hands gripping wheel (only shown in cockpit!)
  const driverSleeveMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xa82424, roughness: 0.8 }),
  );
  const driverSkinMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xc99168, roughness: 0.72 }),
  );
  const cockpitHandsGroup = new THREE.Group();
  carSteeringWheel.add(cockpitHandsGroup);

  const makeDriverHand = (side: -1 | 1): THREE.Group => {
    const anchor = new THREE.Group();
    anchor.position.set(side * 0.145, 0.015, 0.008);

    // Sculpted palm wrapping around wheel rim
    const palm = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.029, 12, 10)),
      driverSkinMat,
    );
    palm.scale.set(0.78, 1.05, 0.92);
    palm.position.set(side * 0.004, 0, 0.012);
    anchor.add(palm);

    // Curled fingers gripping wheel rim front/back
    const fingers = new THREE.Mesh(
      trackGeo(new THREE.CapsuleGeometry(0.018, 0.038, 6, 10)),
      driverSkinMat,
    );
    fingers.rotation.z = side * 0.22;
    fingers.position.set(-side * 0.012, 0.004, -0.008);
    anchor.add(fingers);

    // Thumb resting inward on steering wheel spoke
    const thumb = new THREE.Mesh(
      trackGeo(new THREE.CapsuleGeometry(0.009, 0.022, 4, 8)),
      driverSkinMat,
    );
    thumb.rotation.z = side * 0.85;
    thumb.rotation.x = 0.35;
    thumb.position.set(-side * 0.018, 0.024, 0.012);
    anchor.add(thumb);

    // Classic silver wristwatch on left wrist
    if (side === -1) {
      const watch = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.031, 0.031, 0.016, 12)),
        matSteel,
      );
      watch.rotation.x = Math.PI / 2 - 0.35;
      watch.rotation.z = side * 0.28;
      watch.position.set(side * 0.016, -0.024, 0.056);
      anchor.add(watch);
    }

    const forearm = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.025, 0.035, 0.26, 12)),
      driverSkinMat,
    );
    forearm.position.set(side * 0.042, -0.062, 0.13);
    forearm.rotation.x = Math.PI / 2 - 0.35;
    forearm.rotation.z = side * 0.28;
    anchor.add(forearm);

    const sleeve = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.039, 0.048, 0.22, 12)),
      driverSleeveMat,
    );
    sleeve.position.set(side * 0.088, -0.138, 0.285);
    sleeve.rotation.x = Math.PI / 2 - 0.35;
    sleeve.rotation.z = side * 0.3;
    anchor.add(sleeve);

    cockpitHandsGroup.add(anchor);
    return anchor;
  };
  const leftArmAnchor = makeDriverHand(-1);
  const rightArmAnchor = makeDriverHand(1);

  // Center Console, Animated Gear Stick Pivot & Handbrake
  const centerConsole = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.24, 0.18, 1.15)),
    carInteriorMat,
  );
  centerConsole.position.set(0, 0.88, -0.1);
  carChassisTilt.add(centerConsole);

  const gearStickPivot = new THREE.Group();
  gearStickPivot.position.set(0, 0.94, -0.25);
  carChassisTilt.add(gearStickPivot);
  const gearStick = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.015, 0.018, 0.21, 8)),
    matSteel,
  );
  gearStick.position.y = 0.105;
  gearStickPivot.add(gearStick);
  const gearKnob = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.034, 10, 8)),
    matDarkIron,
  );
  gearKnob.position.y = 0.215;
  gearStickPivot.add(gearKnob);

  const handbrake = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.04, 0.04, 0.26)),
    matDarkIron,
  );
  handbrake.position.set(0.05, 0.99, 0.02);
  handbrake.rotation.x = -0.25;
  carChassisTilt.add(handbrake);

  // Seats & Headrests
  for (const sx of [-0.38, 0.38]) {
    const cushion = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.46, 0.12, 0.46)),
      carSeatMat,
    );
    cushion.position.set(sx, 0.86, 0.06);
    carChassisTilt.add(cushion);

    const backrest = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.44, 0.48, 0.1)),
      carSeatMat,
    );
    backrest.position.set(sx, 1.1, 0.28);
    backrest.rotation.x = -0.15;
    carChassisTilt.add(backrest);

    const headrest = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.22, 0.14, 0.08)),
      carSeatMat,
    );
    headrest.position.set(sx, 1.4, 0.31);
    carChassisTilt.add(headrest);
  }
  const rearBench = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.36, 0.42, 0.44)),
    carSeatMat,
  );
  rearBench.position.set(0, 1.02, 0.88);
  sedanShellGroup.add(rearBench);

  // Rear-View Mirror + Physics-Swinging Hanging Tasbeeh Pivot (compact realistic proportions)
  const rvStalk = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.008, 0.01, 0.045, 6)),
    carInteriorMat,
  );
  rvStalk.position.set(0, 1.515, -0.65);
  carChassisTilt.add(rvStalk);

  const rvMirror = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.18, 0.04, 0.026)),
    carInteriorMat,
  );
  rvMirror.position.set(0, 1.49, -0.64);
  carChassisTilt.add(rvMirror);

  const tasbeehPivot = new THREE.Group();
  tasbeehPivot.position.set(0, 1.472, -0.64);
  carChassisTilt.add(tasbeehPivot);
  const tasbeeh = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.016, 0.0035, 6, 12)),
    matBrass,
  );
  tasbeeh.position.y = -0.022;
  tasbeehPivot.add(tasbeeh);
  const tasbeehTassel = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.006, 0.02, 6)),
    matBrass,
  );
  tasbeehTassel.position.y = -0.046;
  tasbeehPivot.add(tasbeehTassel);

  // Exterior Grille, Bumpers, License Plates, Headlights, Taillights & Amber Blinkers
  const grille = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.95, 0.22, 0.08)),
    matSteel,
  );
  grille.position.set(0, 0.62, -2.14);
  sedanShellGroup.add(grille);

  for (const bz of [-2.19, 2.19]) {
    const bumper = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.78, 0.12, 0.1)),
      matSteel,
    );
    bumper.position.set(0, 0.38, bz);
    sedanShellGroup.add(bumper);
  }

  const plateMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xffffff, map: textures.licensePlate }),
  );
  const frontPlate = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.52, 0.18, 0.04)),
    plateMat,
  );
  frontPlate.position.set(0, 0.42, -2.18);
  sedanShellGroup.add(frontPlate);
  const rearPlate = frontPlate.clone();
  rearPlate.position.set(0, 0.56, 2.18);
  sedanShellGroup.add(rearPlate);

  for (const lx of [-0.66, 0.66]) {
    const hl = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.28, 0.15, 0.08)),
      carHeadlightsMat,
    );
    hl.position.set(lx, 0.68, -2.15);
    sedanShellGroup.add(hl);

    const tl = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.3, 0.14, 0.08)),
      carTaillightsMat,
    );
    tl.position.set(lx, 0.72, 2.16);
    sedanShellGroup.add(tl);

    const blinkMat = lx < 0 ? leftBlinkerMat : rightBlinkerMat;
    const fBlink = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.11, 0.14, 0.1)),
      blinkMat,
    );
    fBlink.position.set(lx * 1.18, 0.68, -2.13);
    sedanShellGroup.add(fBlink);
    const rBlink = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.11, 0.14, 0.1)),
      blinkMat,
    );
    rBlink.position.set(lx * 1.18, 0.72, 2.15);
    sedanShellGroup.add(rBlink);
  }

  // --- Egyptian 3-Wheeler TukTuk Shell (توك توك مصري أصفر وأسود) ---
  const tuktukShellGroup = new THREE.Group();
  tuktukShellGroup.visible = false;
  carChassisTilt.add(tuktukShellGroup);

  const ttMatYellow = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xeab308,
      roughness: 0.25,
      metalness: 0.35,
      clearcoat: 0.7,
    }),
  );
  const ttMatBlack = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x16171a, roughness: 0.72 }),
  );
  const ttFloor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.26, 0.1, 2.35)), ttMatBlack);
  ttFloor.position.set(0, 0.35, 0.05);
  tuktukShellGroup.add(ttFloor);

  const ttFrontNose = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.18, 0.68, 0.62)), ttMatBlack);
  ttFrontNose.position.set(0, 0.68, -1.02);
  ttFrontNose.rotation.x = 0.18;
  tuktukShellGroup.add(ttFrontNose);

  const ttFender = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 0.18, 0.56)), ttMatYellow);
  ttFender.position.set(0, 0.45, -1.16);
  tuktukShellGroup.add(ttFender);

  const ttWindshield = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(1.1, 0.62)), carGlassMat);
  ttWindshield.position.set(0, 1.32, -0.84);
  ttWindshield.rotation.x = -0.22;
  tuktukShellGroup.add(ttWindshield);

  const ttCanopy = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.32, 0.14, 2.08)), ttMatBlack);
  ttCanopy.position.set(0, 1.68, 0.12);
  tuktukShellGroup.add(ttCanopy);

  const ttRearBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.3, 0.76, 0.88)), ttMatYellow);
  ttRearBody.position.set(0, 0.74, 0.82);
  tuktukShellGroup.add(ttRearBody);

  for (const sx of [-0.62, 0.62]) {
    const ttPillarF = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 8)), ttMatBlack);
    ttPillarF.position.set(sx * 0.9, 1.3, -0.84);
    ttPillarF.rotation.x = 0.2;
    tuktukShellGroup.add(ttPillarF);
    const ttPillarR = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 8)), ttMatBlack);
    ttPillarR.position.set(sx, 1.3, 1.05);
    tuktukShellGroup.add(ttPillarR);
  }
  const ttHeadlight = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 12)), carHeadlightsMat);
  ttHeadlight.rotation.x = Math.PI / 2;
  ttHeadlight.position.set(0, 0.72, -1.34);
  tuktukShellGroup.add(ttHeadlight);

  // --- Pickup Truck Open Crew-Cab + Cargo Bed Shell (نصف نقل المعلم — ٤+ في الكابينة و٤ في الصندوق) ---
  const pickupShellGroup = new THREE.Group();
  pickupShellGroup.visible = false;
  carChassisTilt.add(pickupShellGroup);

  const puFloor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.86, 0.16, 4.75)), carInteriorMat);
  puFloor.position.set(0, 0.43, 0.08);
  pickupShellGroup.add(puFloor);
  const puHood = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.82, 0.48, 1.16)), carBodyMat);
  puHood.position.set(0, 0.72, -1.68);
  pickupShellGroup.add(puHood);
  const puCabRoof = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.74, 0.08, 1.62)), carBodyMat);
  puCabRoof.position.set(0, 1.68, -0.32);
  pickupShellGroup.add(puCabRoof);
  // 4-door crew cab pillars + back cab glass
  for (const sx of [-0.84, 0.84]) {
    for (const pz of [-1.06, -0.25, 0.46]) {
      const pil = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 0.72, 0.09)), carBodyMat);
      pil.position.set(sx, 1.32, pz);
      pickupShellGroup.add(pil);
    }
    const puBedWall = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.11, 0.62, 1.98)), carBodyMat);
    puBedWall.position.set(sx, 0.82, 1.48);
    pickupShellGroup.add(puBedWall);
    // Silver flatbed safety rail
    const rail = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.05, 0.16, 1.92)), matSteel);
    rail.position.set(sx, 1.2, 1.48);
    pickupShellGroup.add(rail);
  }
  const puTailgate = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.82, 0.62, 0.1)), carBodyMat);
  puTailgate.position.set(0, 0.82, 2.44);
  pickupShellGroup.add(puTailgate);
  const puBedFloor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.68, 0.12, 1.94)), matDarkIron);
  puBedFloor.position.set(0, 0.56, 1.46);
  pickupShellGroup.add(puBedFloor);
  // Crew cab rear bench seat for 3 extra cab passengers (+2 front = 5 in cab!)
  const puCrewBench = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.48, 0.42, 0.46)), carSeatMat);
  puCrewBench.position.set(0, 0.96, 0.28);
  pickupShellGroup.add(puCrewBench);
  const puGrille = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.22, 0.28, 0.08)), matSteel);
  puGrille.position.set(0, 0.68, -2.28);
  pickupShellGroup.add(puGrille);
  // Owner Lock Status Beacon on Pickup Roof
  const ownerLockMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 0.9,
    }),
  );
  const ownerLockBeacon = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.32, 0.09, 0.16)),
    ownerLockMat,
  );
  ownerLockBeacon.position.set(0, 1.76, -0.68);
  pickupShellGroup.add(ownerLockBeacon);
  for (const lx of [-0.72, 0.72]) {
    const hl = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.3, 0.18, 0.08)), carHeadlightsMat);
    hl.position.set(lx, 0.76, -2.28);
    pickupShellGroup.add(hl);
    const tl = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.28, 0.2, 0.08)), carTaillightsMat);
    tl.position.set(lx, 0.82, 2.49);
    pickupShellGroup.add(tl);
  }

  // --- Delivery Motorcycle Shell (موتوسيكل الدليفري السريع بصندوق حراري) ---
  const deliveryMotoShellGroup = new THREE.Group();
  deliveryMotoShellGroup.visible = false;
  carChassisTilt.add(deliveryMotoShellGroup);

  const motoFrame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.34, 1.48)), matDarkIron);
  motoFrame.position.set(0, 0.54, 0);
  deliveryMotoShellGroup.add(motoFrame);
  const motoTank = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.34, 0.24, 0.56)), carBodyMat);
  motoTank.position.set(0, 0.86, -0.34);
  deliveryMotoShellGroup.add(motoTank);
  const motoSeat = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 0.16, 0.68)), carSeatMat);
  motoSeat.position.set(0, 0.84, 0.24);
  deliveryMotoShellGroup.add(motoSeat);
  // Fork + Handlebar + Windscreen + Headlight
  const motoFork = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.04, 0.04, 0.78, 8)), matSteel);
  motoFork.position.set(0, 0.72, -0.76);
  motoFork.rotation.x = 0.26;
  deliveryMotoShellGroup.add(motoFork);
  const motoHandlebar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.76, 0.045, 0.06)), matDarkIron);
  motoHandlebar.position.set(0, 1.06, -0.62);
  deliveryMotoShellGroup.add(motoHandlebar);
  const motoWindshield = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(0.42, 0.34)), carGlassMat);
  motoWindshield.position.set(0, 1.18, -0.74);
  motoWindshield.rotation.x = -0.32;
  deliveryMotoShellGroup.add(motoWindshield);
  const motoHeadlight = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.11, 10, 8)), carHeadlightsMat);
  motoHeadlight.position.set(0, 0.88, -0.92);
  deliveryMotoShellGroup.add(motoHeadlight);
  const motoTaillight = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.16, 0.09, 0.06)), carTaillightsMat);
  motoTaillight.position.set(0, 0.78, 0.96);
  deliveryMotoShellGroup.add(motoTaillight);
  // Thermal Delivery Box mounted behind seat!
  const motoDeliveryBox = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.54, 0.44, 0.48)),
    carBodyMat,
  );
  motoDeliveryBox.position.set(0, 1.12, 0.78);
  deliveryMotoShellGroup.add(motoDeliveryBox);
  const motoBoxStripe = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.56, 0.09, 0.5)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.45 })),
  );
  motoBoxStripe.position.set(0, 1.14, 0.78);
  deliveryMotoShellGroup.add(motoBoxStripe);

  // Forward SpotLight cone for Night Driving
  const headlightSpot = new THREE.SpotLight(0xfff1c9, 0, 26, Math.PI / 5, 0.45, 1.4);
  headlightSpot.position.set(0, 0.8, -2.1);
  const spotTarget = new THREE.Object3D();
  spotTarget.position.set(0, 0.25, -14);
  carChassisTilt.add(headlightSpot);
  carChassisTilt.add(spotTarget);
  headlightSpot.target = spotTarget;

  // 4 Steerable Front & Spinning Wheels + Center Front TukTuk Wheel + 2 Delivery Moto Wheels
  const tireGeo = trackGeo(new THREE.CylinderGeometry(0.35, 0.35, 0.24, 20));
  tireGeo.rotateZ(Math.PI / 2);
  const rimGeo = trackGeo(new THREE.CylinderGeometry(0.21, 0.21, 0.26, 12));
  rimGeo.rotateZ(Math.PI / 2);

  const carWheels: THREE.Group[] = [];
  const frontWheelSteerPivots: THREE.Group[] = [];
  const wheelEntries: Array<{ pivot: THREE.Group; baseX: number; baseZ: number; isFront: boolean }> = [];
  for (const [wx, wz, isFront] of [
    [-0.92, -1.28, true],
    [0.92, -1.28, true],
    [-0.92, 1.28, false],
    [0.92, 1.28, false],
  ] as Array<[number, number, boolean]>) {
    const steerPivot = new THREE.Group();
    steerPivot.position.set(wx, 0.35, wz);
    carGroup.add(steerPivot);
    if (isFront) frontWheelSteerPivots.push(steerPivot);
    wheelEntries.push({ pivot: steerPivot, baseX: wx, baseZ: wz, isFront });

    const spinGroup = new THREE.Group();
    spinGroup.add(new THREE.Mesh(tireGeo, carTireMat));
    spinGroup.add(new THREE.Mesh(rimGeo, matSteel));
    steerPivot.add(spinGroup);
    carWheels.push(spinGroup);
  }

  // Center front wheel exclusively for TukTuk / Motorcycle front steering
  const ttFrontSteer = new THREE.Group();
  ttFrontSteer.position.set(0, 0.28, -1.05);
  ttFrontSteer.visible = false;
  carGroup.add(ttFrontSteer);
  frontWheelSteerPivots.push(ttFrontSteer);
  const ttFrontSpin = new THREE.Group();
  ttFrontSpin.scale.setScalar(0.8);
  ttFrontSpin.add(new THREE.Mesh(tireGeo, carTireMat));
  ttFrontSpin.add(new THREE.Mesh(rimGeo, matSteel));
  ttFrontSteer.add(ttFrontSpin);
  carWheels.push(ttFrontSpin);

  // Rear center wheel exclusively for Delivery Motorcycle
  const motoRearSteer = new THREE.Group();
  motoRearSteer.position.set(0, 0.31, 0.88);
  motoRearSteer.visible = false;
  carGroup.add(motoRearSteer);
  const motoRearSpin = new THREE.Group();
  motoRearSpin.scale.set(0.55, 0.88, 0.88);
  motoRearSpin.add(new THREE.Mesh(tireGeo, carTireMat));
  motoRearSpin.add(new THREE.Mesh(rimGeo, matSteel));
  motoRearSteer.add(motoRearSpin);
  carWheels.push(motoRearSpin);

  const applyPaint = (colorHex: number, isMetallic = false) => {
    carBodyMat.color.setHex(colorHex);
    carBodyMat.metalness = isMetallic ? 0.72 : 0.42;
    carBodyMat.roughness = isMetallic ? 0.18 : 0.28;
  };

  let currentVehicleId: OwnedVehicleId = 'fiat_128';

  const setVehicleType = (vehicleId: OwnedVehicleId, colorHex: number, isMetallic = false) => {
    currentVehicleId = vehicleId;
    applyPaint(colorHex, isMetallic);
    const isTuk = vehicleId === 'tuktuk';
    const isPickup = vehicleId === 'pickup';
    const isMoto = vehicleId === 'delivery_moto';
    const isTaxi = vehicleId === 'taxi_verna';
    const isSport = vehicleId === 'sport_coupe';

    sedanShellGroup.visible = !isTuk && !isPickup && !isMoto;
    tuktukShellGroup.visible = isTuk;
    pickupShellGroup.visible = isPickup;
    deliveryMotoShellGroup.visible = isMoto;

    // Hide sedan windshield/wipers/dash/interior doors when on motorcycle
    frontGlass.visible = !isMoto;
    rearGlass.visible = !isMoto && !isTuk;
    wiperLeftPivot.visible = !isMoto && !isTuk;
    wiperRightPivot.visible = !isMoto && !isTuk;
    dashBody.visible = !isMoto;
    dashHood.visible = !isMoto;
    dashFace.visible = !isMoto;
    carSteeringWheel.visible = !isMoto;
    steerCol.visible = !isMoto;
    centerConsole.visible = !isMoto;
    gearStickPivot.visible = !isMoto;
    handbrake.visible = !isMoto;
    rvMirror.visible = !isMoto;
    rvStalk.visible = !isMoto;
    tasbeehPivot.visible = !isMoto;

    driverDoorPivot.visible = !isTuk && !isMoto;
    passengerDoorPivot.visible = !isTuk && !isMoto;

    taxiBlackTop.visible = isTaxi;
    taxiRoofSign.visible = isTaxi;
    sportSpoilerGroup.visible = isSport;

    ttFrontSteer.visible = isTuk || isMoto;
    motoRearSteer.visible = isMoto;
    if (isMoto) {
      ttFrontSteer.position.set(0, 0.31, -0.84);
      ttFrontSteer.scale.set(0.55, 0.88, 0.88);
    } else {
      ttFrontSteer.position.set(0, 0.28, -1.05);
      ttFrontSteer.scale.setScalar(1.0);
    }

    for (const w of wheelEntries) {
      if (isMoto) {
        w.pivot.visible = false;
      } else if (isTuk) {
        w.pivot.visible = !w.isFront;
        w.pivot.position.set(Math.sign(w.baseX) * 0.62, 0.28, 0.92);
        w.pivot.scale.setScalar(0.8);
      } else if (isPickup) {
        w.pivot.visible = true;
        w.pivot.position.set(w.baseX * 1.03, 0.38, w.isFront ? -1.42 : 1.48);
        w.pivot.scale.setScalar(1.08);
      } else {
        w.pivot.visible = true;
        w.pivot.position.set(w.baseX, 0.35, w.baseZ);
        w.pivot.scale.setScalar(1.0);
      }
    }
  };

  // Multi-Passenger System:
  // Slot 0 = front passenger (cab), Slots 1..3 = rear cab bench (total 5 inside cab incl. driver!)
  // Slots 4..7 = 4 passengers in Pickup Flatbed (الصندوق الخلفي) OR pillion on motorcycle
  interface PassengerSlotRig {
    root: THREE.Group;
    torsoMat: THREE.MeshStandardMaterial;
    skinMat: THREE.MeshStandardMaterial;
    hijabMat: THREE.MeshStandardMaterial;
    hijab: THREE.Mesh;
    hair: THREE.Mesh;
  }

  const slotPositions: Array<[number, number, number]> = [
    [0.38, 0.56, 0.02], // 0: Cab front passenger
    [-0.44, 0.58, 0.44], // 1: Cab rear-left
    [0.0, 0.58, 0.44], // 2: Cab rear-center
    [0.44, 0.58, 0.44], // 3: Cab rear-right
    [-0.46, 0.72, 1.08], // 4: Pickup Flatbed front-left
    [0.46, 0.72, 1.08], // 5: Pickup Flatbed front-right
    [-0.46, 0.72, 1.88], // 6: Pickup Flatbed back-left
    [0.46, 0.72, 1.88], // 7: Pickup Flatbed back-right
  ];

  const passengerSlots: PassengerSlotRig[] = slotPositions.map(([sx, sy, sz], idx) => {
    const root = new THREE.Group();
    root.position.set(sx, sy, sz);
    root.visible = false;
    carChassisTilt.add(root);

    const torsoMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xbe185d, roughness: 0.78 }));
    const skinMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xd9a17c, roughness: 0.72 }));
    const hijabMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xfce7f3, roughness: 0.8 }));

    const torso = new THREE.Mesh(trackGeo(new THREE.CapsuleGeometry(0.15, 0.32, 6, 10)), torsoMat);
    torso.position.set(0, idx >= 4 ? 0.56 : 0.44, 0.02);
    root.add(torso);
    const head = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.115, 10, 8)), skinMat);
    head.position.set(0, idx >= 4 ? 0.92 : 0.78, 0.01);
    root.add(head);
    const hijab = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.128, 10, 8)), hijabMat);
    hijab.position.set(0, idx >= 4 ? 0.93 : 0.79, 0.04);
    hijab.scale.set(1.04, 1.05, 1.06);
    root.add(hijab);
    const hair = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.125, 10, 8)),
      trackMat(new THREE.MeshStandardMaterial({ color: 0x1e1815, roughness: 0.85 })),
    );
    hair.position.set(0, idx >= 4 ? 0.94 : 0.8, 0.04);
    hair.visible = false;
    root.add(hair);

    return { root, torsoMat, skinMat, hijabMat, hijab, hair };
  });

  const setCompanionVisible = (
    visible: boolean,
    dressColor = 0xbe185d,
    skinColor = 0xd9a17c,
    hijabColor: number | null = 0xfce7f3,
  ) => {
    const slot0 = passengerSlots[0];
    slot0.root.visible = visible;
    slot0.torsoMat.color.setHex(dressColor);
    slot0.skinMat.color.setHex(skinColor);
    if (hijabColor !== null) {
      slot0.hijab.visible = true;
      slot0.hair.visible = false;
      slot0.hijabMat.color.setHex(hijabColor);
    } else {
      slot0.hijab.visible = false;
      slot0.hair.visible = true;
    }
  };

  const setMultiPassengers = (passengers: VehiclePassengerVisual[]) => {
    const maxAllowed =
      currentVehicleId === 'pickup'
        ? 8
        : currentVehicleId === 'delivery_moto'
          ? 1
          : 4;
    for (let i = 0; i < passengerSlots.length; i++) {
      const slot = passengerSlots[i];
      const p = i < maxAllowed ? passengers[i] : undefined;
      if (!p) {
        slot.root.visible = false;
        continue;
      }
      slot.root.visible = true;
      slot.root.scale.setScalar(p.isChild ? 0.74 : 1.0);
      if (currentVehicleId === 'delivery_moto' && i === 0) {
        slot.root.position.set(0, 0.68, 0.42);
      } else {
        const [bx, by, bz] = slotPositions[i];
        slot.root.position.set(bx, by, bz);
      }
      slot.torsoMat.color.setHex(p.shirtColor);
      slot.skinMat.color.setHex(p.skinColor);
      if (p.hijabColor !== null && p.hijabColor !== undefined) {
        slot.hijab.visible = true;
        slot.hair.visible = false;
        slot.hijabMat.color.setHex(p.hijabColor);
      } else {
        slot.hijab.visible = false;
        slot.hair.visible = true;
      }
    }
  };

  const setOwnerLockVisual = (locked: boolean) => {
    ownerLockMat.color.setHex(locked ? 0xef4444 : 0x22c55e);
    ownerLockMat.emissive.setHex(locked ? 0xef4444 : 0x22c55e);
  };

  // Hood Smoke Puffs when Car Condition < 30%
  const heroSmokeMeshes: THREE.Mesh[] = [];
  const heroSmokeMat = trackMat(
    new THREE.MeshBasicMaterial({ color: 0xd6d3d1, transparent: true, opacity: 0.42, depthWrite: false }),
  );
  for (let i = 0; i < 4; i++) {
    const sm = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.16 + i * 0.03, 7, 6)), heroSmokeMat);
    sm.position.set((i % 2 === 0 ? -0.18 : 0.18), 0.95 + i * 0.3, -1.7);
    sm.visible = false;
    carChassisTilt.add(sm);
    heroSmokeMeshes.push(sm);
  }

  return {
    carGroup,
    carChassisTilt,
    carWheels,
    frontWheelSteerPivots,
    carSteeringWheel,
    gearStickPivot,
    driverDoorPivot,
    passengerDoorPivot,
    speedNeedlePivot,
    rpmNeedlePivot,
    fuelNeedlePivot,
    wiperLeftPivot,
    wiperRightPivot,
    tasbeehPivot,
    cockpitHandsGroup,
    leftArmAnchor,
    rightArmAnchor,
    driverSleeveMat,
    driverSkinMat,
    carHeadlightsMat,
    carTaillightsMat,
    leftBlinkerMat,
    rightBlinkerMat,
    dashLeftIndMat,
    dashRightIndMat,
    radioGlowMat,
    carBodyMat,
    headlightSpot,
    heroSmokeMeshes,
    setCompanionVisible,
    setMultiPassengers,
    setOwnerLockVisual,
    setVehiclePaint: applyPaint,
    setVehicleType,
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}

export function createTrafficVehicleFactory(
  scene: THREE.Scene,
  textures: ProceduralTextureSet,
): TrafficVehicleFactory {
  const disposables: Array<{ dispose: () => void }> = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposables.push(m);
    return m;
  };

  // Shared Geometries
  const sedanBodyGeo = trackGeo(new THREE.BoxGeometry(1.74, 0.52, 4.1));
  const sedanCabinGeo = trackGeo(new THREE.BoxGeometry(1.52, 0.46, 2.0));
  const busBodyGeo = trackGeo(new THREE.BoxGeometry(1.88, 1.28, 4.45));
  const pickupCabGeo = trackGeo(new THREE.BoxGeometry(1.78, 0.72, 1.55));
  const pickupBedGeo = trackGeo(new THREE.BoxGeometry(1.74, 0.48, 2.25));
  const tuktukBodyGeo = trackGeo(new THREE.BoxGeometry(1.22, 0.8, 1.9));
  const tuktukCanopyGeo = trackGeo(new THREE.BoxGeometry(1.24, 0.14, 1.8));
  const taxiRoofGeo = trackGeo(new THREE.BoxGeometry(0.56, 0.18, 0.24));
  const wheelGeo = trackGeo(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 14));
  wheelGeo.rotateZ(Math.PI / 2);
  const shadowGeo = trackGeo(new THREE.CircleGeometry(1.85, 14));

  const glassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x263849,
      roughness: 0.15,
      metalness: 0.55,
    }),
  );
  const tireMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x161618, roughness: 0.9 }),
  );
  const whiteMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.38, metalness: 0.2 }),
  );
  const blackMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x191a1d, roughness: 0.38, metalness: 0.35 }),
  );
  const taxiSignMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.75,
    }),
  );
  const headMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff3c4,
      emissive: 0xffd166,
      emissiveIntensity: 0.6,
    }),
  );
  const tailMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xd62828,
      emissive: 0xef233c,
      emissiveIntensity: 0.5,
    }),
  );
  const shadowMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
    }),
  );

  const colorMats = new Map<number, THREE.MeshStandardMaterial>();
  const getBodyMat = (hex: number) => {
    let m = colorMats.get(hex);
    if (!m) {
      m = trackMat(
        new THREE.MeshStandardMaterial({ color: hex, roughness: 0.36, metalness: 0.35 }),
      );
      colorMats.set(hex, m);
    }
    return m;
  };

  const createVehicle = (
    kind: TrafficVehicleKind,
    colorOverride?: number,
  ): THREE.Group => {
    const grp = new THREE.Group();
    const sDisc = new THREE.Mesh(shadowGeo, shadowMat);
    sDisc.rotation.x = -Math.PI / 2;
    sDisc.position.y = 0.03;
    grp.add(sDisc);

    if (kind === 'motorcycle') {
      const mat = getBodyMat(colorOverride ?? 0xc22727);
      const motoWheelGeo = trackGeo(new THREE.TorusGeometry(0.28, 0.075, 8, 16));
      motoWheelGeo.rotateY(Math.PI / 2);
      for (const mz of [-0.72, 0.72]) {
        const mw = new THREE.Mesh(motoWheelGeo, tireMat);
        mw.position.set(0, 0.34, mz);
        grp.add(mw);
      }
      const frame = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 0.28, 1.15)), blackMat);
      frame.position.set(0, 0.56, 0);
      grp.add(frame);
      const tank = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.26, 0.2, 0.46)), mat);
      tank.position.set(0, 0.82, -0.25);
      grp.add(tank);
      const seat = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.14, 0.56)), blackMat);
      seat.position.set(0, 0.78, 0.26);
      grp.add(seat);
      const fork = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.035, 0.035, 0.68, 8)), whiteMat);
      fork.position.set(0, 0.66, -0.62);
      fork.rotation.x = 0.28;
      grp.add(fork);
      const bars = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.68, 0.04, 0.06)), blackMat);
      bars.position.set(0, 0.96, -0.5);
      grp.add(bars);
      const mHead = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.085, 8, 8)), headMat);
      mHead.position.set(0, 0.84, -0.72);
      grp.add(mHead);
      const mTail = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.12, 0.08, 0.05)), tailMat);
      mTail.position.set(0, 0.74, 0.84);
      grp.add(mTail);
      // Seated rider silhouette
      const riderBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 0.52, 0.24)), getBodyMat(0x1f2937));
      riderBody.position.set(0, 1.12, 0.14);
      riderBody.rotation.x = 0.22;
      grp.add(riderBody);
      const helmet = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.14, 10, 8)), mat);
      helmet.position.set(0, 1.5, 0.02);
      grp.add(helmet);
    } else if (kind === 'tuktuk') {
      const mat = getBodyMat(colorOverride ?? 0xeab308);
      const body = new THREE.Mesh(tuktukBodyGeo, mat);
      body.position.y = 0.62;
      grp.add(body);
      const shield = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.08, 0.56, 0.06)), glassMat);
      shield.position.set(0, 1.22, -0.76);
      shield.rotation.x = 0.24;
      grp.add(shield);
      const roof = new THREE.Mesh(tuktukCanopyGeo, blackMat);
      roof.position.set(0, 1.56, 0.1);
      grp.add(roof);
      for (const [wx, wz] of [
        [0, -0.78],
        [-0.56, 0.7],
        [0.56, 0.7],
      ]) {
        const w = new THREE.Mesh(wheelGeo, tireMat);
        w.scale.setScalar(0.75);
        w.position.set(wx, 0.24, wz);
        grp.add(w);
      }
    } else if (kind === 'microbus') {
      const bus = new THREE.Mesh(busBodyGeo, whiteMat);
      bus.position.y = 0.96;
      grp.add(bus);
      const stripe = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.91, 0.22, 4.46)),
        getBodyMat(colorOverride ?? 0x1d4ed8),
      );
      stripe.position.y = 0.78;
      grp.add(stripe);
      const winBand = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.9, 0.44, 4.05)),
        glassMat,
      );
      winBand.position.set(0, 1.24, -0.08);
      grp.add(winBand);
    } else if (kind === 'pickup') {
      const mat = getBodyMat(colorOverride ?? 0x0f766e);
      const cab = new THREE.Mesh(pickupCabGeo, mat);
      cab.position.set(0, 0.94, -0.95);
      grp.add(cab);
      const bed = new THREE.Mesh(pickupBedGeo, mat);
      bed.position.set(0, 0.62, 0.98);
      grp.add(bed);
      const win = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.56, 0.38, 1.15)),
        glassMat,
      );
      win.position.set(0, 1.14, -0.95);
      grp.add(win);
    } else {
      // Cairo Black & White Taxi OR Civilian Sedan
      const isTaxi = kind === 'taxi';
      const lowerMat = isTaxi ? whiteMat : getBodyMat(colorOverride ?? 0x1e4d7b);
      const upperMat = isTaxi ? blackMat : lowerMat;

      const body = new THREE.Mesh(sedanBodyGeo, lowerMat);
      body.position.y = 0.58;
      grp.add(body);

      const cabin = new THREE.Mesh(sedanCabinGeo, upperMat);
      cabin.position.set(0, 1.06, 0.1);
      grp.add(cabin);

      const win = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.55, 0.34, 1.82)),
        glassMat,
      );
      win.position.set(0, 1.08, 0.1);
      grp.add(win);

      if (isTaxi) {
        const roofBox = new THREE.Mesh(taxiRoofGeo, taxiSignMat);
        roofBox.position.set(0, 1.38, -0.1);
        grp.add(roofBox);
      }
    }

    if (kind !== 'tuktuk' && kind !== 'motorcycle') {
      for (const [wx, wz] of [
        [-0.86, -1.25],
        [0.86, -1.25],
        [-0.86, 1.25],
        [0.86, 1.25],
      ]) {
        const w = new THREE.Mesh(wheelGeo, tireMat);
        w.position.set(wx, 0.32, wz);
        grp.add(w);
      }
      for (const lx of [-0.62, 0.62]) {
        const hl = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.12, 0.06)), headMat);
        hl.position.set(lx, 0.62, -2.06);
        grp.add(hl);
        const tl = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.26, 0.12, 0.06)), tailMat);
        tl.position.set(lx, 0.64, 2.06);
        grp.add(tl);
      }
    }

    scene.add(grp);
    return grp;
  };

  return {
    createVehicle,
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}
