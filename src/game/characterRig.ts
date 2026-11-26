import * as THREE from 'three';
import { FacialExpression } from './types';

export interface CharacterStyleOptions {
  shirtColor: number;
  pantsColor: number;
  skinColor?: number;
  shirtTexture?: THREE.CanvasTexture;
  pantsTexture?: THREE.CanvasTexture;
  isGalabiya?: boolean;
  isSkirt?: boolean;
  hasMustache?: boolean;
  hasBeard?: boolean;
  hasApron?: boolean;
  hasJacket?: boolean;
  hasOveralls?: boolean;
  hasHijab?: boolean;
  hijabColor?: number;
  hasHandbag?: boolean;
  hasBackpack?: boolean;
  hatType?: 'cap' | 'taqiyah' | 'hair';
  hatColor?: number;
  hairColor?: number;
  scale?: number;
}

export type HumanAnimPose =
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
  | 'use_tool'
  | 'open_door'
  | 'hold_hand';

export interface CharacterRigTextures {
  fabricBump?: THREE.CanvasTexture;
  skinMap?: THREE.CanvasTexture;
  contactShadow?: THREE.CanvasTexture;
}

export interface NpcMeshActor {
  group: THREE.Group;
  bodyRoot: THREE.Group;
  torsoGroup: THREE.Group;
  leftLeg: THREE.Group;
  leftKnee: THREE.Group;
  rightLeg: THREE.Group;
  rightKnee: THREE.Group;
  leftArm: THREE.Group;
  leftElbow: THREE.Group;
  rightArm: THREE.Group;
  rightElbow: THREE.Group;
  headGroup: THREE.Group;
  heldAnchor: THREE.Group;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  leftSclera: THREE.Mesh;
  rightSclera: THREE.Mesh;
  leftEyelid: THREE.Mesh;
  rightEyelid: THREE.Mesh;
  mouthMesh: THREE.Mesh;
  blinkOffset: number;
  hasLongGarment?: boolean;
  expression: FacialExpression;
  baseColor: number;
  shirtMaterial: THREE.MeshStandardMaterial;
  skinMaterial: THREE.MeshStandardMaterial;
}

export interface CharacterRigFactory {
  createActor: (opts: CharacterStyleOptions) => NpcMeshActor;
  dispose: () => void;
}

let actorCounter = 0;

export function createCharacterRigFactory(
  scene: THREE.Scene,
  isSoftwareGl: boolean,
  texOpts?: CharacterRigTextures,
): CharacterRigFactory {
  const disposables: Array<{ dispose: () => void }> = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposables.push(m);
    return m;
  };

  // Shared sculpted anatomical geometries (reused across all 70+ pedestrians & owners!)
  const torsoProfile = [
    new THREE.Vector2(0.01, -0.26),
    new THREE.Vector2(0.155, -0.24), // waist
    new THREE.Vector2(0.168, -0.10), // lower ribs
    new THREE.Vector2(0.215, 0.08),  // chest / pecs
    new THREE.Vector2(0.222, 0.20),  // rounded shoulders
    new THREE.Vector2(0.105, 0.27),  // trapezius
    new THREE.Vector2(0.01, 0.28),
  ];
  const torsoGeo = trackGeo(new THREE.LatheGeometry(torsoProfile, 16));

  const jacketGeo = trackGeo(new THREE.CylinderGeometry(0.23, 0.19, 0.52, 14));
  const pelvisGeo = trackGeo(new THREE.CylinderGeometry(0.165, 0.155, 0.18, 14));
  const robeGeo = trackGeo(new THREE.CylinderGeometry(0.19, 0.295, 0.68, 16));
  const apronGeo = trackGeo(new THREE.CylinderGeometry(0.205, 0.22, 0.6, 12, 1, true, -0.95, 1.9));
  const neckGeo = trackGeo(new THREE.CylinderGeometry(0.056, 0.068, 0.13, 12));
  const collarGeo = trackGeo(new THREE.TorusGeometry(0.072, 0.014, 6, 14));

  // Sculpted Cranium + Tapered Jawline + Anatomical Facial Features
  const headProfile = [
    new THREE.Vector2(0.01, -0.135),
    new THREE.Vector2(0.082, -0.112), // chin
    new THREE.Vector2(0.116, -0.04),  // jaw/cheeks
    new THREE.Vector2(0.132, 0.04),   // brow ridge
    new THREE.Vector2(0.126, 0.105),  // crown
    new THREE.Vector2(0.01, 0.15),
  ];
  const craniumGeo = trackGeo(new THREE.LatheGeometry(headProfile, 16));
  const earGeo = trackGeo(new THREE.SphereGeometry(0.022, 8, 6));
  const scleraGeo = trackGeo(new THREE.SphereGeometry(0.02, 10, 8));
  const irisGeo = trackGeo(new THREE.SphereGeometry(0.0115, 8, 8));
  const eyelidGeo = trackGeo(
    new THREE.SphereGeometry(0.0218, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.52),
  );
  const browGeo = trackGeo(new THREE.CapsuleGeometry(0.0055, 0.026, 4, 8));
  const noseBridgeGeo = trackGeo(new THREE.CylinderGeometry(0.0065, 0.0125, 0.044, 8));
  const noseTipGeo = trackGeo(new THREE.SphereGeometry(0.0125, 8, 6));
  const mouthGeo = trackGeo(new THREE.CapsuleGeometry(0.0055, 0.036, 4, 8));
  const stacheGeo = trackGeo(new THREE.CapsuleGeometry(0.0075, 0.054, 4, 8));
  const beardGeo = trackGeo(new THREE.CylinderGeometry(0.094, 0.068, 0.088, 12, 1, false, -1.25, 2.5));

  const hairProfile = [
    new THREE.Vector2(0.140, 0.056),
    new THREE.Vector2(0.143, 0.092),
    new THREE.Vector2(0.136, 0.124),
    new THREE.Vector2(0.096, 0.156),
    new THREE.Vector2(0.01, 0.168),
  ];
  const hairCrownGeo = trackGeo(new THREE.LatheGeometry(hairProfile, 16));
  const hairBackGeo = trackGeo(
    new THREE.CylinderGeometry(0.143, 0.125, 0.185, 14, 1, false, Math.PI * 0.36, Math.PI * 1.28),
  );
  const taqiyahProfile = [
    new THREE.Vector2(0.143, 0.054),
    new THREE.Vector2(0.142, 0.112),
    new THREE.Vector2(0.096, 0.156),
    new THREE.Vector2(0.01, 0.168),
  ];
  const taqiyahGeo = trackGeo(new THREE.LatheGeometry(taqiyahProfile, 16));
  const capVisorGeo = trackGeo(new THREE.CylinderGeometry(0.12, 0.142, 0.016, 12, 1, false, -0.95, 1.9));
  const hijabWrapGeo = trackGeo(
    new THREE.CylinderGeometry(0.142, 0.168, 0.34, 14, 1, false, Math.PI * 0.34, Math.PI * 1.32),
  );

  // Two-Segment Arm & Anatomical Hand Geometries
  const shoulderGeo = trackGeo(new THREE.SphereGeometry(0.068, 10, 8));
  const upperArmGeo = trackGeo(new THREE.CylinderGeometry(0.058, 0.048, 0.25, 10));
  const forearmGeo = trackGeo(new THREE.CylinderGeometry(0.046, 0.036, 0.24, 10));
  const palmGeo = trackGeo(new THREE.CapsuleGeometry(0.028, 0.044, 4, 8));
  const thumbGeo = trackGeo(new THREE.CapsuleGeometry(0.01, 0.024, 4, 6));

  const skirtGeo = trackGeo(new THREE.CylinderGeometry(0.185, 0.28, 0.68, 16));
  const handbagBodyGeo = trackGeo(new THREE.BoxGeometry(0.09, 0.17, 0.22));
  const handbagHandleGeo = trackGeo(new THREE.TorusGeometry(0.055, 0.011, 6, 12, Math.PI));
  const backpackGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.3, 0.13));

  const thighGeo = trackGeo(new THREE.CylinderGeometry(0.082, 0.066, 0.38, 12));
  const calfGeo = trackGeo(new THREE.CylinderGeometry(0.064, 0.048, 0.36, 12));
  const shoeUpperGeo = trackGeo(new THREE.CapsuleGeometry(0.044, 0.11, 4, 10));
  const shoeSoleGeo = trackGeo(new THREE.BoxGeometry(0.096, 0.024, 0.215));
  const shadowDiscGeo = trackGeo(new THREE.CircleGeometry(0.55, 16));

  // Shared materials palette
  const eyeWhiteMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness: 0.28 }),
  );
  const eyeIrisMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x241a14, roughness: 0.22 }),
  );
  const lipMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x864438, roughness: 0.58 }),
  );
  const shoeMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x232220, roughness: 0.62 }),
  );
  const soleMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xd6d1c8, roughness: 0.85 }),
  );
  const apronMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xeee9df,
      bumpMap: texOpts?.fabricBump ?? null,
      bumpScale: 0.012,
      roughness: 0.88,
    }),
  );
  const handbagMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x784421, roughness: 0.55 }),
  );
  const backpackMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      bumpMap: texOpts?.fabricBump ?? null,
      bumpScale: 0.014,
      roughness: 0.82,
    }),
  );
  const shadowMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: texOpts?.contactShadow ? 0xffffff : 0x090807,
      map: texOpts?.contactShadow ?? null,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
  );

  // Cache material instances by color key to keep draw calls & memory low
  const matCache = new Map<string, THREE.MeshStandardMaterial>();
  const getColorMat = (
    color: number,
    roughness = 0.84,
    withFabric = false,
  ): THREE.MeshStandardMaterial => {
    const key = `${color}_${roughness}_${withFabric ? 1 : 0}`;
    let m = matCache.get(key);
    if (!m) {
      m = trackMat(
        new THREE.MeshStandardMaterial({
          color,
          roughness,
          bumpMap: withFabric ? texOpts?.fabricBump ?? null : null,
          bumpScale: withFabric ? 0.016 : 0,
        }),
      );
      matCache.set(key, m);
    }
    return m;
  };

  const createActor = (opts: CharacterStyleOptions): NpcMeshActor => {
    const grp = new THREE.Group();
    if (opts.scale) grp.scale.setScalar(opts.scale);

    const bodyRoot = new THREE.Group();
    grp.add(bodyRoot);

    const skinColor = opts.skinColor ?? 0xc69066;
    const skinMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: skinColor,
        map: texOpts?.skinMap ?? null,
        roughness: 0.66,
        metalness: 0.02,
      }),
    );
    const shirtMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: opts.shirtTexture ? 0xffffff : opts.shirtColor,
        map: opts.shirtTexture ?? null,
        bumpMap: texOpts?.fabricBump ?? null,
        bumpScale: 0.016,
        roughness: 0.86,
      }),
    );
    const pantsMat = opts.pantsTexture
      ? trackMat(
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: opts.pantsTexture,
            bumpMap: texOpts?.fabricBump ?? null,
            bumpScale: 0.014,
            roughness: 0.88,
          }),
        )
      : getColorMat(opts.pantsColor, 0.88, true);
    const hairMat = getColorMat(opts.hairColor ?? 0x1e1916, 0.88, false);

    // Contact ground shadow disc
    const sDisc = new THREE.Mesh(shadowDiscGeo, shadowMat);
    sDisc.rotation.x = -Math.PI / 2;
    sDisc.position.y = 0.025;
    grp.add(sDisc);

    // Pelvis / Hips
    const pelvis = new THREE.Mesh(pelvisGeo, opts.isGalabiya ? shirtMat : pantsMat);
    pelvis.scale.set(1.1, 1.0, 0.76);
    pelvis.position.y = 0.82;
    bodyRoot.add(pelvis);

    // Torso / Chest Group
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 1.13;
    bodyRoot.add(torsoGroup);

    const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
    torsoMesh.scale.set(1.06, 1.0, 0.72);
    torsoMesh.castShadow = !isSoftwareGl;
    torsoGroup.add(torsoMesh);

    const collar = new THREE.Mesh(collarGeo, shirtMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.26, 0.01);
    torsoGroup.add(collar);

    if (opts.hasJacket) {
      const jacket = new THREE.Mesh(
        jacketGeo,
        getColorMat(opts.shirtColor, 0.68, true),
      );
      jacket.scale.set(1.08, 1.0, 0.78);
      torsoGroup.add(jacket);
    }

    if (opts.hasOveralls) {
      const bib = new THREE.Mesh(apronGeo, pantsMat);
      bib.position.set(0, -0.02, 0.02);
      torsoGroup.add(bib);
    }

    if (opts.isGalabiya) {
      const robe = new THREE.Mesh(robeGeo, shirtMat);
      robe.scale.set(1.06, 1.0, 0.94);
      robe.position.y = -0.46;
      torsoGroup.add(robe);
    } else if (opts.isSkirt) {
      const skirt = new THREE.Mesh(skirtGeo, pantsMat);
      skirt.scale.set(1.04, 1.0, 0.92);
      skirt.position.y = -0.49;
      torsoGroup.add(skirt);
    }

    if (opts.hasBackpack) {
      const pack = new THREE.Mesh(backpackGeo, backpackMat);
      pack.position.set(0, 0.02, -0.18);
      torsoGroup.add(pack);
    }

    if (opts.hasApron) {
      const apron = new THREE.Mesh(apronGeo, apronMat);
      apron.position.set(0, -0.12, 0.025);
      torsoGroup.add(apron);
    }

    // Neck attached to torso top
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.31;
    torsoGroup.add(neck);

    // Sculpted GTA-style Anatomical Head
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.45;
    torsoGroup.add(headGroup);

    const cranium = new THREE.Mesh(craniumGeo, skinMat);
    cranium.scale.set(0.95, 1.04, 1.04);
    headGroup.add(cranium);

    let leftBrow!: THREE.Mesh;
    let rightBrow!: THREE.Mesh;
    let leftSclera!: THREE.Mesh;
    let rightSclera!: THREE.Mesh;
    let leftEyelid!: THREE.Mesh;
    let rightEyelid!: THREE.Mesh;

    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(earGeo, skinMat);
      ear.scale.set(0.58, 1.28, 0.85);
      ear.position.set(side * 0.122, -0.01, -0.005);
      headGroup.add(ear);

      const sclera = new THREE.Mesh(scleraGeo, eyeWhiteMat);
      sclera.position.set(side * 0.044, 0.022, 0.106);
      headGroup.add(sclera);
      if (side === -1) leftSclera = sclera;
      else rightSclera = sclera;

      const iris = new THREE.Mesh(irisGeo, eyeIrisMat);
      iris.position.set(side * 0.044, 0.022, 0.118);
      headGroup.add(iris);

      const eyelid = new THREE.Mesh(eyelidGeo, skinMat);
      eyelid.position.set(side * 0.044, 0.024, 0.107);
      eyelid.scale.set(1.04, 0.28, 1.05);
      headGroup.add(eyelid);
      if (side === -1) leftEyelid = eyelid;
      else rightEyelid = eyelid;

      const brow = new THREE.Mesh(browGeo, hairMat);
      brow.position.set(side * 0.044, 0.052, 0.120);
      brow.rotation.z = Math.PI / 2 + side * -0.08;
      headGroup.add(brow);
      if (side === -1) leftBrow = brow;
      else rightBrow = brow;
    }

    const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMat);
    noseBridge.position.set(0, 0.004, 0.124);
    noseBridge.rotation.x = -0.26;
    headGroup.add(noseBridge);
    const noseTip = new THREE.Mesh(noseTipGeo, skinMat);
    noseTip.position.set(0, -0.018, 0.136);
    headGroup.add(noseTip);

    const mouth = new THREE.Mesh(mouthGeo, lipMat);
    mouth.position.set(0, -0.068, 0.113);
    mouth.rotation.z = Math.PI / 2;
    headGroup.add(mouth);

    if (opts.hasMustache) {
      const stache = new THREE.Mesh(stacheGeo, hairMat);
      stache.position.set(0, -0.045, 0.120);
      stache.rotation.z = Math.PI / 2;
      headGroup.add(stache);
    }
    if (opts.hasBeard) {
      const beard = new THREE.Mesh(beardGeo, hairMat);
      beard.position.set(0, -0.085, 0.04);
      headGroup.add(beard);
    }

    // Hair / Hijab / Hat
    const hatMat = opts.hatColor ? getColorMat(opts.hatColor, 0.84, true) : hairMat;
    if (opts.hasHijab) {
      const hijabMat = getColorMat(opts.hijabColor ?? 0x475569, 0.85, true);
      const crown = new THREE.Mesh(hairCrownGeo, hijabMat);
      crown.scale.set(1.02, 1.04, 1.08);
      crown.position.set(0, 0.0, -0.006);
      headGroup.add(crown);
      const wrap = new THREE.Mesh(hijabWrapGeo, hijabMat);
      wrap.position.set(0, -0.1, -0.02);
      headGroup.add(wrap);
    } else if (opts.hatType === 'taqiyah') {
      const taq = new THREE.Mesh(taqiyahGeo, hatMat);
      taq.position.set(0, 0.0, -0.004);
      taq.scale.set(0.98, 1.04, 1.06);
      headGroup.add(taq);
    } else if (opts.hatType === 'cap') {
      const cap = new THREE.Mesh(taqiyahGeo, hatMat);
      cap.position.set(0, 0.0, -0.002);
      cap.scale.set(0.98, 1.04, 1.06);
      headGroup.add(cap);
      const visor = new THREE.Mesh(capVisorGeo, hatMat);
      visor.position.set(0, 0.044, 0.085);
      visor.rotation.x = 0.12;
      headGroup.add(visor);
    } else {
      const hair = new THREE.Mesh(hairCrownGeo, hairMat);
      hair.position.set(0, 0.002, -0.012);
      hair.scale.set(0.97, 1.04, 1.05);
      headGroup.add(hair);
      const hairBack = new THREE.Mesh(hairBackGeo, hairMat);
      hairBack.position.set(0, -0.022, -0.014);
      hairBack.scale.set(0.97, 1.0, 1.04);
      headGroup.add(hairBack);
    }

    // Articulated 2-segment Arms (Shoulder -> Elbow -> Hand with Thumb)
    const buildArm = (side: -1 | 1): { shoulder: THREE.Group; elbow: THREE.Group } => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.232, 0.205, 0);

      const deltoid = new THREE.Mesh(shoulderGeo, shirtMat);
      shoulder.add(deltoid);

      const upperArm = new THREE.Mesh(upperArmGeo, shirtMat);
      upperArm.position.y = -0.125;
      shoulder.add(upperArm);

      const elbow = new THREE.Group();
      elbow.position.set(0, -0.25, 0);
      shoulder.add(elbow);

      const forearm = new THREE.Mesh(
        forearmGeo,
        opts.isGalabiya || opts.hasHijab ? shirtMat : skinMat,
      );
      forearm.position.y = -0.12;
      elbow.add(forearm);

      const hand = new THREE.Mesh(palmGeo, skinMat);
      hand.position.y = -0.265;
      hand.scale.set(0.85, 1.0, 1.15);
      elbow.add(hand);

      const thumb = new THREE.Mesh(thumbGeo, skinMat);
      thumb.position.set(-side * 0.026, -0.25, 0.032);
      thumb.rotation.x = -0.45;
      elbow.add(thumb);

      torsoGroup.add(shoulder);
      return { shoulder, elbow };
    };

    const leftArmParts = buildArm(-1);
    const rightArmParts = buildArm(1);

    if (opts.hasHandbag) {
      const bagGroup = new THREE.Group();
      bagGroup.position.set(-0.02, -0.34, 0.03);
      const bagBody = new THREE.Mesh(handbagBodyGeo, handbagMat);
      bagGroup.add(bagBody);
      const bagHandle = new THREE.Mesh(handbagHandleGeo, handbagMat);
      bagHandle.position.y = 0.09;
      bagHandle.rotation.y = Math.PI / 2;
      bagGroup.add(bagHandle);
      leftArmParts.elbow.add(bagGroup);
    }

    const heldAnchor = new THREE.Group();
    heldAnchor.position.set(0, -0.28, 0.08);
    rightArmParts.elbow.add(heldAnchor);

    // Articulated 2-segment Legs (Hip -> Knee -> Sculpted Shoe)
    const buildLeg = (side: -1 | 1): { hip: THREE.Group; knee: THREE.Group } => {
      const hip = new THREE.Group();
      hip.position.set(side * 0.105, 0.78, 0);

      const legMat = opts.isGalabiya ? shirtMat : pantsMat;
      const thigh = new THREE.Mesh(thighGeo, legMat);
      thigh.position.y = -0.19;
      hip.add(thigh);

      const knee = new THREE.Group();
      knee.position.set(0, -0.38, 0);
      hip.add(knee);

      const calf = new THREE.Mesh(calfGeo, legMat);
      calf.position.y = -0.18;
      knee.add(calf);

      const shoeUpper = new THREE.Mesh(shoeUpperGeo, shoeMat);
      shoeUpper.rotation.x = Math.PI / 2;
      shoeUpper.position.set(0, -0.365, 0.045);
      knee.add(shoeUpper);

      const shoeSole = new THREE.Mesh(shoeSoleGeo, soleMat);
      shoeSole.position.set(0, -0.398, 0.045);
      knee.add(shoeSole);

      bodyRoot.add(hip);
      return { hip, knee };
    };

    const leftLegParts = buildLeg(-1);
    const rightLegParts = buildLeg(1);

    scene.add(grp);

    return {
      group: grp,
      bodyRoot,
      torsoGroup,
      leftLeg: leftLegParts.hip,
      leftKnee: leftLegParts.knee,
      rightLeg: rightLegParts.hip,
      rightKnee: rightLegParts.knee,
      leftArm: leftArmParts.shoulder,
      leftElbow: leftArmParts.elbow,
      rightArm: rightArmParts.shoulder,
      rightElbow: rightArmParts.elbow,
      headGroup,
      heldAnchor,
      leftBrow,
      rightBrow,
      leftSclera,
      rightSclera,
      leftEyelid,
      rightEyelid,
      mouthMesh: mouth,
      blinkOffset: (actorCounter++ * 1.37) % 4.2,
      hasLongGarment: Boolean(opts.isGalabiya || opts.isSkirt),
      expression: 'neutral',
      baseColor: opts.shirtColor,
      shirtMaterial: shirtMat,
      skinMaterial: skinMat,
    };
  };

  return {
    createActor,
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}

/**
 * Sets facial expression on any character rig (zero per-frame allocations).
 * Note: mouthMesh is rotated PI/2 on Z so X=height(lip thickness), Y=width.
 */
export function setActorExpression(actor: NpcMeshActor, expr: FacialExpression): void {
  if (actor.expression === expr) return;
  actor.expression = expr;

  if (expr === 'happy') {
    actor.leftBrow.position.y = 0.056;
    actor.rightBrow.position.y = 0.056;
    actor.leftBrow.rotation.z = Math.PI / 2 + 0.08;
    actor.rightBrow.rotation.z = Math.PI / 2 - 0.08;
    actor.leftSclera.scale.y = 0.88;
    actor.rightSclera.scale.y = 0.88;
    actor.mouthMesh.scale.set(1.45, 1.24, 1.0);
    actor.mouthMesh.position.y = -0.066;
  } else if (expr === 'angry') {
    actor.leftBrow.position.y = 0.047;
    actor.rightBrow.position.y = 0.047;
    actor.leftBrow.rotation.z = Math.PI / 2 - 0.34;
    actor.rightBrow.rotation.z = Math.PI / 2 + 0.34;
    actor.leftSclera.scale.y = 0.82;
    actor.rightSclera.scale.y = 0.82;
    actor.mouthMesh.scale.set(1.8, 1.15, 1.0);
    actor.mouthMesh.position.y = -0.072;
  } else if (expr === 'surprised') {
    actor.leftBrow.position.y = 0.064;
    actor.rightBrow.position.y = 0.064;
    actor.leftBrow.rotation.z = Math.PI / 2 + 0.14;
    actor.rightBrow.rotation.z = Math.PI / 2 - 0.14;
    actor.leftSclera.scale.y = 1.2;
    actor.rightSclera.scale.y = 1.2;
    actor.mouthMesh.scale.set(2.8, 0.85, 1.2);
    actor.mouthMesh.position.y = -0.072;
  } else if (expr === 'talking') {
    actor.leftBrow.position.y = 0.055;
    actor.rightBrow.position.y = 0.055;
    actor.leftBrow.rotation.z = Math.PI / 2 + 0.06;
    actor.rightBrow.rotation.z = Math.PI / 2 - 0.06;
    actor.leftSclera.scale.y = 1.0;
    actor.rightSclera.scale.y = 1.0;
    actor.mouthMesh.scale.set(1.7, 1.05, 1.0);
    actor.mouthMesh.position.y = -0.068;
  } else {
    actor.leftBrow.position.y = 0.052;
    actor.rightBrow.position.y = 0.052;
    actor.leftBrow.rotation.z = Math.PI / 2 + 0.06;
    actor.rightBrow.rotation.z = Math.PI / 2 - 0.06;
    actor.leftSclera.scale.y = 1.0;
    actor.rightSclera.scale.y = 1.0;
    actor.mouthMesh.scale.set(1.0, 1.0, 1.0);
    actor.mouthMesh.position.y = -0.068;
  }
}

/**
 * Updates realistic multi-jointed GTA-style skeletal animation + blinking + lip-sync + head look-at.
 */
export function animateHumanActor(
  actor: NpcMeshActor,
  pose: HumanAnimPose,
  phase: number,
  dt: number,
  lookYaw = 0,
): void {
  const dampRate = 12;
  const clampedLook = THREE.MathUtils.clamp(lookYaw, -0.52, 0.52);

  // Natural periodic eye blinking (staggered per actor)
  const blinkCycle = (phase + actor.blinkOffset) % 4.1;
  const blinkClose = blinkCycle < 0.14 ? Math.sin((blinkCycle / 0.14) * Math.PI) : 0;
  const lidScaleY = 0.28 + blinkClose * 0.88;
  actor.leftEyelid.scale.y = lidScaleY;
  actor.rightEyelid.scale.y = lidScaleY;

  // Dynamic lip-sync mouth movement during speech or heated argument
  if (actor.expression === 'talking' || pose === 'talk' || pose === 'argue') {
    const speakOpen = 1.0 + Math.abs(Math.sin(phase * 9.5) * Math.cos(phase * 6.2)) * 1.45;
    actor.mouthMesh.scale.x = speakOpen;
  }

  if (pose === 'walk' || pose === 'run') {
    const isRun = pose === 'run';
    const rawLegAmp = isRun ? 0.68 : 0.48;
    const legAmp = actor.hasLongGarment ? rawLegAmp * 0.56 : rawLegAmp;
    const armAmp = isRun ? 0.6 : 0.38;
    const swing = Math.sin(phase);
    const bob = Math.abs(Math.cos(phase)) * (isRun ? 0.055 : 0.028);

    actor.bodyRoot.position.y = bob;
    actor.torsoGroup.rotation.y = -swing * (isRun ? 0.14 : 0.08);
    actor.torsoGroup.rotation.x = isRun ? 0.13 : 0.035;
    actor.torsoGroup.rotation.z = swing * 0.025;

    actor.leftLeg.rotation.x = swing * legAmp;
    actor.rightLeg.rotation.x = -swing * legAmp;
    const kneeAmp = actor.hasLongGarment ? 0.3 : isRun ? 0.88 : 0.48;
    actor.leftKnee.rotation.x = Math.max(0, -swing) * kneeAmp;
    actor.rightKnee.rotation.x = Math.max(0, swing) * kneeAmp;

    actor.leftArm.rotation.x = -swing * armAmp;
    actor.rightArm.rotation.x = swing * armAmp;
    actor.rightArm.rotation.z = THREE.MathUtils.damp(actor.rightArm.rotation.z, 0, dampRate, dt);
    actor.leftElbow.rotation.x = isRun ? -0.95 : -0.25 - Math.max(0, -swing) * 0.25;
    actor.rightElbow.rotation.x = isRun ? -0.95 : -0.25 - Math.max(0, swing) * 0.25;
    actor.headGroup.rotation.y = THREE.MathUtils.damp(actor.headGroup.rotation.y, clampedLook * 0.65, 8, dt);
    actor.headGroup.rotation.x = THREE.MathUtils.damp(actor.headGroup.rotation.x, 0, 8, dt);
    return;
  }

  if (pose === 'sit' || pose === 'drive' || pose === 'eat') {
    actor.bodyRoot.position.y = THREE.MathUtils.damp(actor.bodyRoot.position.y, -0.34, dampRate, dt);
    actor.leftLeg.rotation.x = THREE.MathUtils.damp(actor.leftLeg.rotation.x, -1.42, dampRate, dt);
    actor.rightLeg.rotation.x = THREE.MathUtils.damp(actor.rightLeg.rotation.x, -1.42, dampRate, dt);
    actor.leftKnee.rotation.x = THREE.MathUtils.damp(actor.leftKnee.rotation.x, 1.38, dampRate, dt);
    actor.rightKnee.rotation.x = THREE.MathUtils.damp(actor.rightKnee.rotation.x, 1.38, dampRate, dt);
    actor.rightArm.rotation.z = THREE.MathUtils.damp(actor.rightArm.rotation.z, 0, dampRate, dt);
    actor.torsoGroup.rotation.z = 0;

    if (pose === 'drive') {
      actor.torsoGroup.rotation.x = 0.08;
      actor.leftArm.rotation.x = -0.95;
      actor.rightArm.rotation.x = -0.95;
      actor.leftElbow.rotation.x = -0.45;
      actor.rightElbow.rotation.x = -0.45;
      actor.headGroup.rotation.y = Math.sin(phase * 0.7) * 0.08;
    } else if (pose === 'eat') {
      const bite = Math.sin(phase * 3.0) * 0.28;
      actor.torsoGroup.rotation.x = 0.08;
      actor.rightArm.rotation.x = -0.65 + bite;
      actor.rightElbow.rotation.x = -1.15 - bite * 0.4;
      actor.leftArm.rotation.x = -0.45;
      actor.leftElbow.rotation.x = -0.5;
      actor.headGroup.rotation.x = Math.sin(phase * 3.0) * 0.06;
      actor.headGroup.rotation.y = THREE.MathUtils.damp(actor.headGroup.rotation.y, clampedLook * 0.6, 8, dt);
    } else {
      actor.torsoGroup.rotation.x = -0.05;
      actor.torsoGroup.rotation.y = Math.sin(phase * 0.5) * 0.05;
      actor.leftArm.rotation.x = -0.32;
      actor.rightArm.rotation.x = -0.32;
      actor.leftElbow.rotation.x = -0.55;
      actor.rightElbow.rotation.x = -0.55;
      actor.headGroup.rotation.y = clampedLook !== 0 ? clampedLook : Math.sin(phase * 0.8) * 0.14;
    }
    return;
  }

  // Standing / Interactive poses
  actor.bodyRoot.position.y = THREE.MathUtils.damp(actor.bodyRoot.position.y, 0, dampRate, dt);
  actor.leftLeg.rotation.x = THREE.MathUtils.damp(actor.leftLeg.rotation.x, 0, dampRate, dt);
  actor.rightLeg.rotation.x = THREE.MathUtils.damp(actor.rightLeg.rotation.x, 0, dampRate, dt);
  actor.leftKnee.rotation.x = THREE.MathUtils.damp(actor.leftKnee.rotation.x, 0, dampRate, dt);
  actor.rightKnee.rotation.x = THREE.MathUtils.damp(actor.rightKnee.rotation.x, 0, dampRate, dt);
  actor.torsoGroup.rotation.z = THREE.MathUtils.damp(actor.torsoGroup.rotation.z, 0, dampRate, dt);

  if (pose === 'hold_hand') {
    const step = Math.abs(Math.sin(phase)) > 0.05 ? Math.sin(phase) : 0;
    const isStepping = phase !== 0 && Math.abs(lookYaw) <= 0.52;
    actor.torsoGroup.rotation.y = THREE.MathUtils.damp(actor.torsoGroup.rotation.y, 0, dampRate, dt);
    actor.torsoGroup.rotation.x = 0.03;
    actor.leftLeg.rotation.x = isStepping ? step * 0.34 : THREE.MathUtils.damp(actor.leftLeg.rotation.x, 0, dampRate, dt);
    actor.rightLeg.rotation.x = isStepping ? -step * 0.34 : THREE.MathUtils.damp(actor.rightLeg.rotation.x, 0, dampRate, dt);
    actor.leftArm.rotation.x = THREE.MathUtils.damp(actor.leftArm.rotation.x, -0.45, dampRate, dt);
    actor.leftElbow.rotation.x = -0.35;
    // Reach hand sideways & slightly forward to hold player's/parent's hand
    actor.rightArm.rotation.x = THREE.MathUtils.damp(actor.rightArm.rotation.x, -0.58, dampRate, dt);
    actor.rightArm.rotation.z = THREE.MathUtils.damp(actor.rightArm.rotation.z, -0.34, dampRate, dt);
    actor.rightElbow.rotation.x = -0.22;
    actor.headGroup.rotation.y = THREE.MathUtils.damp(actor.headGroup.rotation.y, clampedLook, 8, dt);
  } else if (pose === 'hold') {
    actor.torsoGroup.rotation.y = THREE.MathUtils.damp(actor.torsoGroup.rotation.y, 0, dampRate, dt);
    actor.torsoGroup.rotation.x = 0.02;
    actor.leftArm.rotation.x = THREE.MathUtils.damp(actor.leftArm.rotation.x, 0.05, dampRate, dt);
    actor.leftElbow.rotation.x = -0.15;
    actor.rightArm.rotation.x = THREE.MathUtils.damp(actor.rightArm.rotation.x, -0.55, dampRate, dt);
    actor.rightArm.rotation.z = THREE.MathUtils.damp(actor.rightArm.rotation.z, 0, dampRate, dt);
    actor.rightElbow.rotation.x = -0.55;
    actor.headGroup.rotation.y = THREE.MathUtils.damp(actor.headGroup.rotation.y, clampedLook, 8, dt);
  } else if (pose === 'wave') {
    actor.torsoGroup.rotation.y = Math.sin(phase * 0.5) * 0.06;
    actor.rightArm.rotation.x = -2.4;
    actor.rightArm.rotation.z = -0.35 - Math.sin(phase * 3.5) * 0.28;
    actor.rightElbow.rotation.x = -0.35;
    actor.leftArm.rotation.x = 0.05;
    actor.leftElbow.rotation.x = -0.15;
    actor.headGroup.rotation.y = THREE.MathUtils.damp(actor.headGroup.rotation.y, clampedLook, 8, dt);
  } else if (pose === 'argue') {
    const wave = Math.sin(phase * 4.5);
    actor.torsoGroup.rotation.y = wave * 0.16;
    actor.torsoGroup.rotation.x = 0.08;
    actor.rightArm.rotation.x = -1.25 + wave * 0.42;
    actor.rightArm.rotation.z = -0.18;
    actor.rightElbow.rotation.x = -0.45;
    actor.leftArm.rotation.x = -0.95 - wave * 0.35;
    actor.leftElbow.rotation.x = -0.55;
    actor.headGroup.rotation.y = clampedLook * 0.5 + Math.cos(phase * 4.0) * 0.22;
  } else if (pose === 'use_tool' || pose === 'open_door') {
    const reach = pose === 'open_door' ? -0.95 : -0.75 + Math.sin(phase * 5.0) * 0.3;
    actor.torsoGroup.rotation.x = 0.12;
    actor.rightArm.rotation.x = reach;
    actor.rightArm.rotation.z = 0;
    actor.rightElbow.rotation.x = -0.55;
    actor.leftArm.rotation.x = -0.35;
    actor.leftElbow.rotation.x = -0.45;
    actor.headGroup.rotation.y = THREE.MathUtils.damp(actor.headGroup.rotation.y, clampedLook, 8, dt);
  } else if (pose === 'talk' || pose === 'work') {
    const gesture = Math.sin(phase * 2.4) * 0.25;
    actor.torsoGroup.rotation.y = Math.sin(phase * 0.8) * 0.08;
    actor.torsoGroup.rotation.x = pose === 'work' ? 0.09 : 0.02;
    actor.rightArm.rotation.x = -0.45 + gesture;
    actor.rightArm.rotation.z = THREE.MathUtils.damp(actor.rightArm.rotation.z, 0, dampRate, dt);
    actor.rightElbow.rotation.x = -0.75 + gesture * 0.5;
    actor.leftArm.rotation.x = -0.25 - gesture * 0.6;
    actor.leftElbow.rotation.x = -0.45;
    actor.headGroup.rotation.y = THREE.MathUtils.damp(
      actor.headGroup.rotation.y,
      clampedLook !== 0 ? clampedLook : Math.sin(phase * 1.1) * 0.14,
      8,
      dt,
    );
  } else {
    // Natural idle breathing + slight look-around or look-at player
    const breath = Math.sin(phase * 1.6) * 0.018;
    actor.torsoGroup.rotation.x = breath;
    actor.torsoGroup.rotation.y = THREE.MathUtils.damp(actor.torsoGroup.rotation.y, 0, 8, dt);
    actor.leftArm.rotation.x = THREE.MathUtils.damp(actor.leftArm.rotation.x, 0.04, dampRate, dt);
    actor.rightArm.rotation.x = THREE.MathUtils.damp(actor.rightArm.rotation.x, 0.04, dampRate, dt);
    actor.rightArm.rotation.z = THREE.MathUtils.damp(actor.rightArm.rotation.z, 0, dampRate, dt);
    actor.leftElbow.rotation.x = -0.14;
    actor.rightElbow.rotation.x = -0.14;
    const idleLook = clampedLook !== 0 ? clampedLook : Math.sin(phase * 0.6) * 0.1;
    actor.headGroup.rotation.y = THREE.MathUtils.damp(actor.headGroup.rotation.y, idleLook, 6, dt);
  }
}
