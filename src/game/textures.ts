import * as THREE from 'three';

export interface ProceduralTextureSet {
  asphalt: THREE.CanvasTexture;
  asphaltPlain: THREE.CanvasTexture;
  rollerShutter: THREE.CanvasTexture;
  sidewalk: THREE.CanvasTexture;
  curbStripes: THREE.CanvasTexture;
  buildingPlasterA: THREE.CanvasTexture;
  buildingPlasterB: THREE.CanvasTexture;
  windowLouver: THREE.CanvasTexture;
  mashrabiya: THREE.CanvasTexture;
  shopTile: THREE.CanvasTexture;
  woodCounter: THREE.CanvasTexture;
  bumpNoise: THREE.CanvasTexture;
  brickBump: THREE.CanvasTexture;
  tileBump: THREE.CanvasTexture;
  woodGrainBump: THREE.CanvasTexture;
  fabricWeave: THREE.CanvasTexture;
  skinMicro: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  awningStripes: THREE.CanvasTexture;
  signShop: THREE.CanvasTexture;
  signMarket: THREE.CanvasTexture;
  signHome: THREE.CanvasTexture;
  signFuel: THREE.CanvasTexture;
  signCoffee: THREE.CanvasTexture;
  signBakery: THREE.CanvasTexture;
  signGrocery: THREE.CanvasTexture;
  signWorkshop: THREE.CanvasTexture;
  menuBoard: THREE.CanvasTexture;
  licensePlate: THREE.CanvasTexture;
  carDashboard: THREE.CanvasTexture;
  fridgeFront: THREE.CanvasTexture;
  orientalRug: THREE.CanvasTexture;
  sofaFabric: THREE.CanvasTexture;
  tvScene: THREE.CanvasTexture;
  wallClock: THREE.CanvasTexture;
  spiceShelf: THREE.CanvasTexture;
  woodDoorPanel: THREE.CanvasTexture;
  nileWater: THREE.CanvasTexture;
  leatherDash: THREE.CanvasTexture;
  kitchenWallTiles: THREE.CanvasTexture;
  stainlessOilSheen: THREE.CanvasTexture;
  hammeredBrass: THREE.CanvasTexture;
  schoolChalkboard: THREE.CanvasTexture;
  egyptianFlag: THREE.CanvasTexture;
  dressPurpleFloral: THREE.CanvasTexture;
  sweaterPinkBunny: THREE.CanvasTexture;
  jerseyYellowSoccer: THREE.CanvasTexture;
  denimBlue: THREE.CanvasTexture;
  floralSofaFabric: THREE.CanvasTexture;
  tileBathroom: THREE.CanvasTexture;
  vendorBanner: THREE.CanvasTexture;
  drinksFridge: THREE.CanvasTexture;
  adBoardScreen: THREE.CanvasTexture;
  gasPricePylon: THREE.CanvasTexture;
  updateAdBoardTexture: (
    headlineAr: string,
    promoTextAr: string,
    discountPct: number,
    active: boolean,
  ) => void;
  makeStreetSignTexture: (streetNameAr: string, districtNameAr: string) => THREE.CanvasTexture;
  makeCustomShopSign: (
    titleAr: string,
    subtitleAr: string,
    bgHex: string,
    borderHex: string,
    textHex?: string,
  ) => THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  return [c, ctx];
}

function finalizeColorTex(
  canvas: HTMLCanvasElement,
  anisotropy: number,
  repeatX = 1,
  repeatY = 1,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  return tex;
}

function makeArabicSignTexture(
  titleAr: string,
  subtitleAr: string,
  bgHex: string,
  borderHex: string,
  textHex: string,
  anisotropy: number,
  accentGlowHex?: string,
): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(512, 192);
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 512, 192);

  // Subtle metallic/backlit lightbox gradient sheen
  const grad = ctx.createRadialGradient(256, 96, 18, 256, 96, 270);
  grad.addColorStop(0, accentGlowHex ?? 'rgba(255,235,175,0.22)');
  grad.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 192);

  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 492, 172);
  ctx.lineWidth = 3;
  ctx.strokeRect(22, 22, 468, 148);

  const corners = [
    [22, 22],
    [490, 22],
    [22, 170],
    [490, 170],
  ];
  ctx.fillStyle = borderHex;
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = textHex;
  ctx.font = 'bold 46px "Cairo", "Tajawal", sans-serif';
  ctx.fillText(titleAr, 256, 74);

  ctx.shadowBlur = 0;
  ctx.fillStyle = borderHex;
  ctx.font = 'bold 25px "Tajawal", sans-serif';
  ctx.fillText(subtitleAr, 256, 134);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

export function createProceduralTextures(
  renderer: THREE.WebGLRenderer,
): ProceduralTextureSet {
  const anisotropy = renderer.capabilities.getMaxAnisotropy();

  // 1. High-Detail Asphalt with aggregate, worn tire lanes, hairline cracks & yellow dashes
  const [asphC, asphCtx] = makeCanvas(512, 512);
  asphCtx.fillStyle = '#27292e';
  asphCtx.fillRect(0, 0, 512, 512);
  asphCtx.fillStyle = 'rgba(14,15,18,0.42)';
  asphCtx.fillRect(106, 0, 74, 512);
  asphCtx.fillRect(332, 0, 74, 512);
  // Subtle patched tar repair
  asphCtx.fillStyle = 'rgba(20,21,24,0.55)';
  asphCtx.fillRect(176, 120, 96, 64);
  for (let i = 0; i < 8500; i++) {
    const v = 28 + Math.floor(Math.random() * 38);
    asphCtx.fillStyle = `rgb(${v},${v},${v + 2})`;
    asphCtx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  // Hairline asphalt cracks
  asphCtx.strokeStyle = 'rgba(12,12,14,0.65)';
  asphCtx.lineWidth = 1.6;
  for (let k = 0; k < 5; k++) {
    asphCtx.beginPath();
    let cx = 60 + Math.random() * 390;
    let cy = Math.random() * 512;
    asphCtx.moveTo(cx, cy);
    for (let s = 0; s < 7; s++) {
      cx += (Math.random() - 0.5) * 28;
      cy += 18 + Math.random() * 20;
      asphCtx.lineTo(cx, cy);
    }
    asphCtx.stroke();
  }
  // White road edge lines + crisp Cairo yellow center dashes
  asphCtx.fillStyle = 'rgba(235,235,230,0.45)';
  asphCtx.fillRect(14, 0, 7, 512);
  asphCtx.fillRect(491, 0, 7, 512);
  asphCtx.fillStyle = '#e8ba42';
  asphCtx.fillRect(250, 28, 12, 188);
  asphCtx.fillRect(250, 284, 12, 188);
  const asphalt = finalizeColorTex(asphC, anisotropy, 1, 22);

  // 1b. Clean Intersection Asphalt (aggregate + subtle tire sheen, NO dashes across crosswalks)
  const [apC, apCtx] = makeCanvas(256, 256);
  apCtx.fillStyle = '#26282d';
  apCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3200; i++) {
    const v = 28 + Math.floor(Math.random() * 34);
    apCtx.fillStyle = `rgb(${v},${v},${v + 2})`;
    apCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  apCtx.fillStyle = 'rgba(14,15,18,0.28)';
  apCtx.fillRect(58, 0, 38, 256);
  apCtx.fillRect(160, 0, 38, 256);
  apCtx.fillRect(0, 58, 256, 38);
  apCtx.fillRect(0, 160, 256, 38);
  const asphaltPlain = finalizeColorTex(apC, anisotropy, 2, 2);

  // 1c. Corrugated Steel Shop Roller Shutter (صاج محل المعلم المضلع)
  const [shC, shCtx] = makeCanvas(512, 512);
  shCtx.fillStyle = '#475569';
  shCtx.fillRect(0, 0, 512, 512);
  const slatCount = 26;
  const slatH = 512 / slatCount;
  for (let s = 0; s < slatCount; s++) {
    const y = s * slatH;
    const g = shCtx.createLinearGradient(0, y, 0, y + slatH);
    g.addColorStop(0, '#64748b');
    g.addColorStop(0.28, '#94a3b8');
    g.addColorStop(0.65, '#475569');
    g.addColorStop(1, '#1e293b');
    shCtx.fillStyle = g;
    shCtx.fillRect(0, y, 512, slatH);
    shCtx.fillStyle = 'rgba(15,23,42,0.75)';
    shCtx.fillRect(0, y + slatH - 2, 512, 2);
  }
  // Vertical side guide tracks & subtle weathered Cairo dust at bottom
  shCtx.fillStyle = '#1e293b';
  shCtx.fillRect(0, 0, 18, 512);
  shCtx.fillRect(494, 0, 18, 512);
  const dustGrad = shCtx.createLinearGradient(0, 380, 0, 512);
  dustGrad.addColorStop(0, 'rgba(120,95,70,0)');
  dustGrad.addColorStop(1, 'rgba(120,95,70,0.34)');
  shCtx.fillStyle = dustGrad;
  shCtx.fillRect(0, 380, 512, 132);
  // Bottom reinforced steel T-bar + dual brass padlocks & lift handles
  shCtx.fillStyle = '#334155';
  shCtx.fillRect(0, 482, 512, 30);
  shCtx.fillStyle = '#94a3b8';
  shCtx.fillRect(92, 464, 56, 12);
  shCtx.fillRect(364, 464, 56, 12);
  shCtx.fillStyle = '#d97706';
  shCtx.fillRect(244, 476, 24, 22);
  shCtx.fillStyle = '#fef08a';
  shCtx.fillRect(252, 483, 8, 8);
  const rollerShutter = finalizeColorTex(shC, anisotropy, 1, 1);

  // 2. Realistic Egyptian Interlock Sidewalk Paving (brickwork + worn mortar + dust)
  const [swC, swCtx] = makeCanvas(256, 256);
  swCtx.fillStyle = '#7e6e5c';
  swCtx.fillRect(0, 0, 256, 256);
  const paverShades = ['#c6b197', '#b9a388', '#ae977c', '#ccb89f'];
  for (let row = 0; row < 16; row++) {
    const y = row * 16;
    const off = (row % 2) * 16;
    for (let col = -1; col < 9; col++) {
      const x = col * 32 + off;
      swCtx.fillStyle = paverShades[(row * 3 + Math.abs(col)) % paverShades.length];
      swCtx.fillRect(x + 1.5, y + 1.5, 29, 13);
      swCtx.fillStyle = 'rgba(255,248,236,0.14)';
      swCtx.fillRect(x + 1.5, y + 1.5, 29, 2.5);
    }
  }
  for (let i = 0; i < 2400; i++) {
    swCtx.fillStyle = Math.random() > 0.5 ? 'rgba(48,36,24,0.12)' : 'rgba(255,250,240,0.08)';
    swCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  // Subtle dirt/wear streaks along paver joints
  swCtx.fillStyle = 'rgba(46,35,24,0.16)';
  for (let row = 0; row < 16; row++) {
    swCtx.fillRect(0, row * 16, 256, 1.5);
  }
  const sidewalk = finalizeColorTex(swC, anisotropy, 4, 8);

  // 2b. Egyptian Painted Curbstone Texture (أصفر وأسود متناوب)
  const [cbC, cbCtx] = makeCanvas(256, 64);
  for (let x = 0; x < 256; x += 64) {
    cbCtx.fillStyle = (x / 64) % 2 === 0 ? '#c89624' : '#26282c';
    cbCtx.fillRect(x, 0, 64, 64);
  }
  // Scuff / concrete wear over paint
  for (let i = 0; i < 1100; i++) {
    cbCtx.fillStyle = 'rgba(138,126,112,0.28)';
    cbCtx.fillRect(Math.random() * 256, Math.random() * 64, 3, 2);
  }
  const curbStripes = finalizeColorTex(cbC, anisotropy, 12, 1);

  // 3. Building Plaster A (Warm Cairo Limestone with weathered stone courses & base grime)
  const [pAC, pACtx] = makeCanvas(256, 256);
  pACtx.fillStyle = '#c89d72';
  pACtx.fillRect(0, 0, 256, 256);
  const baseGrimeA = pACtx.createLinearGradient(0, 0, 0, 256);
  baseGrimeA.addColorStop(0, 'rgba(45,30,18,0.04)');
  baseGrimeA.addColorStop(0.75, 'rgba(45,30,18,0.08)');
  baseGrimeA.addColorStop(1, 'rgba(38,24,12,0.28)');
  pACtx.fillStyle = baseGrimeA;
  pACtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64) {
    pACtx.fillStyle = 'rgba(85,52,24,0.22)';
    pACtx.fillRect(0, y, 256, 3);
    pACtx.fillStyle = 'rgba(255,244,225,0.12)';
    pACtx.fillRect(0, y + 3, 256, 2);
  }
  for (let i = 0; i < 4800; i++) {
    pACtx.fillStyle =
      Math.random() > 0.5 ? 'rgba(255,245,230,0.10)' : 'rgba(65,38,16,0.14)';
    pACtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  const buildingPlasterA = finalizeColorTex(pAC, anisotropy, 2, 3);

  // 4. Building Plaster B (Traditional Cairo Weathered Red-Clay Brick & Mortar)
  const [pBC, pBCtx] = makeCanvas(256, 256);
  pBCtx.fillStyle = '#8b7b6c';
  pBCtx.fillRect(0, 0, 256, 256);
  const brickPalette = ['#a35e43', '#945137', '#ae694c', '#88472e', '#9c5a3f'];
  for (let row = 0; row < 16; row++) {
    const y = row * 16;
    const offset = row % 2 === 0 ? 0 : 20;
    for (let x = -20; x < 256; x += 40) {
      pBCtx.fillStyle = brickPalette[(row * 5 + Math.abs(x)) % brickPalette.length];
      pBCtx.fillRect(x + offset + 2, y + 2, 36, 12);
      pBCtx.fillStyle = 'rgba(255,230,210,0.08)';
      pBCtx.fillRect(x + offset + 2, y + 2, 36, 2);
      pBCtx.fillStyle = 'rgba(30,15,8,0.14)';
      pBCtx.fillRect(x + offset + 2, y + 12, 36, 2);
    }
  }
  for (let i = 0; i < 2600; i++) {
    pBCtx.fillStyle = Math.random() > 0.5 ? 'rgba(38,24,14,0.14)' : 'rgba(235,210,185,0.08)';
    pBCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  const buildingPlasterB = finalizeColorTex(pBC, anisotropy, 3, 4);

  // 5. Detailed Egyptian Wooden Louvered Window Shutter (شيش) + Warm Curtain Glow
  const [wC, wCtx] = makeCanvas(128, 160);
  wCtx.fillStyle = '#1f2e3a';
  wCtx.fillRect(0, 0, 128, 160);
  const wGrad = wCtx.createLinearGradient(0, 0, 0, 160);
  wGrad.addColorStop(0, '#5a6f7f');
  wGrad.addColorStop(0.65, '#3b4e5e');
  wGrad.addColorStop(1, '#70583a');
  wCtx.fillStyle = wGrad;
  wCtx.fillRect(10, 10, 108, 140);
  // Subtle curtain drape folds
  wCtx.fillStyle = 'rgba(255,220,160,0.16)';
  wCtx.fillRect(14, 14, 24, 132);
  wCtx.fillRect(90, 14, 24, 132);
  wCtx.strokeStyle = '#5c4028';
  wCtx.lineWidth = 8;
  wCtx.strokeRect(4, 4, 120, 152);
  wCtx.beginPath();
  wCtx.moveTo(64, 4);
  wCtx.lineTo(64, 156);
  wCtx.moveTo(4, 80);
  wCtx.lineTo(124, 80);
  wCtx.stroke();
  const windowLouver = finalizeColorTex(wC, anisotropy, 1, 1);

  // 5b. Traditional Carved Wood Mashrabiya Latticework (مشربية)
  const [msC, msCtx] = makeCanvas(128, 128);
  msCtx.fillStyle = '#3b2413';
  msCtx.fillRect(0, 0, 128, 128);
  msCtx.strokeStyle = '#754925';
  msCtx.lineWidth = 4;
  for (let i = -128; i < 256; i += 16) {
    msCtx.beginPath();
    msCtx.moveTo(i, 0);
    msCtx.lineTo(i + 128, 128);
    msCtx.moveTo(i + 128, 0);
    msCtx.lineTo(i, 128);
    msCtx.stroke();
  }
  msCtx.strokeStyle = '#4e2e16';
  msCtx.lineWidth = 10;
  msCtx.strokeRect(5, 5, 118, 118);
  const mashrabiya = finalizeColorTex(msC, anisotropy, 2, 1);

  // 6. Shop Ceramic Tile Floor (subtle grout wear)
  const [tileC, tileCtx] = makeCanvas(256, 256);
  tileCtx.fillStyle = '#cfc7b8';
  tileCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64) {
    for (let x = 0; x < 256; x += 64) {
      const alt = ((x + y) / 64) % 2 === 0;
      tileCtx.fillStyle = alt ? '#e4dccd' : '#becac3';
      tileCtx.fillRect(x + 2, y + 2, 60, 60);
    }
  }
  for (let i = 0; i < 1600; i++) {
    tileCtx.fillStyle = Math.random() > 0.5 ? 'rgba(65,52,36,0.08)' : 'rgba(255,250,242,0.07)';
    tileCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  const shopTile = finalizeColorTex(tileC, anisotropy, 3, 3);

  // 7. Wood Counter (rich walnut grain with edge wear)
  const [woodC, woodCtx] = makeCanvas(256, 256);
  woodCtx.fillStyle = '#683c1c';
  woodCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 4) {
    woodCtx.fillStyle =
      y % 12 === 0
        ? 'rgba(28,14,4,0.32)'
        : y % 8 === 0
          ? 'rgba(182,125,68,0.16)'
          : 'rgba(92,50,22,0.22)';
    woodCtx.fillRect(0, y, 256, 2.5);
  }
  for (let i = 0; i < 1200; i++) {
    woodCtx.fillStyle = 'rgba(36,18,6,0.12)';
    woodCtx.fillRect(Math.random() * 256, Math.random() * 256, 12, 1.5);
  }
  const woodCounter = finalizeColorTex(woodC, anisotropy, 2, 1);

  // 8. Grayscale Micro-Bump
  const [bmpC, bmpCtx] = makeCanvas(256, 256);
  const imgData = bmpCtx.createImageData(256, 256);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const g = 104 + Math.floor(Math.random() * 54);
    imgData.data[i] = g;
    imgData.data[i + 1] = g;
    imgData.data[i + 2] = g;
    imgData.data[i + 3] = 255;
  }
  bmpCtx.putImageData(imgData, 0, 0);
  const bumpNoise = new THREE.CanvasTexture(bmpC);
  bumpNoise.wrapS = THREE.RepeatWrapping;
  bumpNoise.wrapT = THREE.RepeatWrapping;
  bumpNoise.repeat.set(4, 4);

  // 8b. Brick Mortar Relief Bump Map
  const [bbC, bbCtx] = makeCanvas(256, 256);
  bbCtx.fillStyle = '#505050';
  bbCtx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 16; row++) {
    const y = row * 16;
    const offset = row % 2 === 0 ? 0 : 20;
    for (let x = -20; x < 256; x += 40) {
      const shade = 185 + ((row * 17 + Math.abs(x)) % 45);
      bbCtx.fillStyle = `rgb(${shade},${shade},${shade})`;
      bbCtx.fillRect(x + offset + 2, y + 2, 36, 12);
    }
  }
  const brickBump = new THREE.CanvasTexture(bbC);
  brickBump.wrapS = THREE.RepeatWrapping;
  brickBump.wrapT = THREE.RepeatWrapping;
  brickBump.repeat.set(3, 4);

  // 8c. Ceramic & Paver Tile Grout Bump Map
  const [tileBumpC, tileBumpCtx] = makeCanvas(256, 256);
  tileBumpCtx.fillStyle = '#5e5e5e';
  tileBumpCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64) {
    for (let x = 0; x < 256; x += 64) {
      tileBumpCtx.fillStyle = '#dcdcdc';
      tileBumpCtx.fillRect(x + 2, y + 2, 60, 60);
    }
  }
  const tileBump = new THREE.CanvasTexture(tileBumpC);
  tileBump.wrapS = THREE.RepeatWrapping;
  tileBump.wrapT = THREE.RepeatWrapping;
  tileBump.repeat.set(3, 3);

  // 8d. Directional Wood Grain Bump Map
  const [wbC, wbCtx] = makeCanvas(128, 128);
  wbCtx.fillStyle = '#9a9a9a';
  wbCtx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 3) {
    const g = 115 + Math.floor(Math.sin(y * 0.45) * 28 + Math.random() * 24);
    wbCtx.fillStyle = `rgb(${g},${g},${g})`;
    wbCtx.fillRect(0, y, 128, 2);
  }
  const woodGrainBump = new THREE.CanvasTexture(wbC);
  woodGrainBump.wrapS = THREE.RepeatWrapping;
  woodGrainBump.wrapT = THREE.RepeatWrapping;
  woodGrainBump.repeat.set(2, 2);

  // 8e. Fabric Cotton/Linen Weave Bump Map (for NPC & Player clothing realism)
  const [fbC, fbCtx] = makeCanvas(128, 128);
  fbCtx.fillStyle = '#888888';
  fbCtx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 4) {
    fbCtx.fillStyle = y % 8 === 0 ? '#a8a8a8' : '#707070';
    fbCtx.fillRect(0, y, 128, 1.5);
  }
  for (let x = 0; x < 128; x += 4) {
    fbCtx.fillStyle = x % 8 === 0 ? 'rgba(200,200,200,0.35)' : 'rgba(60,60,60,0.35)';
    fbCtx.fillRect(x, 0, 1.5, 128);
  }
  const fabricWeave = new THREE.CanvasTexture(fbC);
  fabricWeave.wrapS = THREE.RepeatWrapping;
  fabricWeave.wrapT = THREE.RepeatWrapping;
  fabricWeave.repeat.set(4, 4);

  // 8f. Natural Warm Skin Micro-Grain Texture
  const [skC, skCtx] = makeCanvas(128, 128);
  skCtx.fillStyle = '#f5ede6';
  skCtx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 1600; i++) {
    skCtx.fillStyle = Math.random() > 0.5 ? 'rgba(180,115,85,0.06)' : 'rgba(255,245,238,0.05)';
    skCtx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const skinMicro = finalizeColorTex(skC, anisotropy, 1, 1);

  // 9. Soft Contact Shadow
  const [csC, csCtx] = makeCanvas(128, 128);
  const grad = csCtx.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, 'rgba(0,0,0,0.72)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.32)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  csCtx.fillStyle = grad;
  csCtx.fillRect(0, 0, 128, 128);
  const contactShadow = new THREE.CanvasTexture(csC);

  // 10. Egyptian Awning Stripes
  const [awnC, awnCtx] = makeCanvas(256, 256);
  for (let x = 0; x < 256; x += 32) {
    awnCtx.fillStyle = (x / 32) % 2 === 0 ? '#a82c24' : '#f4ead5';
    awnCtx.fillRect(x, 0, 32, 256);
  }
  const awningStripes = finalizeColorTex(awnC, anisotropy, 2, 1);

  // 11. Illuminated Arabic Shop Signs (لافتات المحلات المضيئة)
  const signShop = makeArabicSignTexture(
    'محل المعلم',
    'فول وطعمية · عيش بلدي سخن',
    '#163628',
    '#f5c443',
    '#fffbeb',
    anisotropy,
    'rgba(255,215,90,0.28)',
  );
  const signMarket = makeArabicSignTexture(
    'سوق الحارة',
    'خضار طازة · بقالة · مستلزمات',
    '#5e2c1c',
    '#f4c45d',
    '#fff6e5',
    anisotropy,
    'rgba(255,190,85,0.24)',
  );
  const signHome = makeArabicSignTexture(
    'منزل المعلم',
    'البيت المشترك · راحة واستعداد لبكرة',
    '#243647',
    '#e3af46',
    '#f8f4ec',
    anisotropy,
    'rgba(180,215,255,0.18)',
  );
  const signFuel = makeArabicSignTexture(
    'بنزين وورشة',
    'تموين السيارة المشتركة وصيانة',
    '#24262b',
    '#fb923c',
    '#ffffff',
    anisotropy,
    'rgba(251,146,60,0.26)',
  );
  const signCoffee = makeArabicSignTexture(
    'قهوة الحارة',
    'شاي مظبوط · قهوة عربي · طاولة',
    '#0f3d2e',
    '#f5c443',
    '#fef3c7',
    anisotropy,
    'rgba(16,185,129,0.28)',
  );
  const signBakery = makeArabicSignTexture(
    'مخبز الأمانة',
    'عيش بلدي طازة طول اليوم',
    '#662b14',
    '#fbbf24',
    '#fff8eb',
    anisotropy,
    'rgba(245,158,11,0.30)',
  );
  const signGrocery = makeArabicSignTexture(
    'بقالة البركة',
    'مشروبات ساقعة · أجبان · تموين',
    '#17335c',
    '#fde047',
    '#ffffff',
    anisotropy,
    'rgba(59,130,246,0.28)',
  );
  const signWorkshop = makeArabicSignTexture(
    'ورشة الأسطى بليغ',
    'ميكانيكا · عفشة · كهرباء سيارات',
    '#292524',
    '#f97316',
    '#ffedd5',
    anisotropy,
    'rgba(249,115,22,0.32)',
  );

  // 12. Arabic Menu Board inside shop
  const [mC, mCtx] = makeCanvas(280, 340);
  mCtx.fillStyle = '#1b1d1c';
  mCtx.fillRect(0, 0, 280, 340);
  mCtx.strokeStyle = '#734824';
  mCtx.lineWidth = 14;
  mCtx.strokeRect(7, 7, 266, 326);
  mCtx.strokeStyle = '#d4a64a';
  mCtx.lineWidth = 2;
  mCtx.strokeRect(18, 18, 244, 304);
  mCtx.textAlign = 'center';
  mCtx.fillStyle = '#f5c451';
  mCtx.font = 'bold 28px "Cairo", sans-serif';
  mCtx.fillText('قائمة الأسعار', 140, 50);
  mCtx.strokeStyle = 'rgba(245,196,81,0.45)';
  mCtx.beginPath();
  mCtx.moveTo(40, 70);
  mCtx.lineTo(240, 70);
  mCtx.stroke();
  mCtx.fillStyle = '#f8f3e6';
  mCtx.font = 'bold 19px "Tajawal", sans-serif';
  const items = [
    'فول سادة ........ ١٢ ج',
    'فول بالطحينة .... ١٥ ج',
    'طعمية سخنة ...... ١٢ ج',
    'طعمية بالسلطة ... ١٨ ج',
    'بطاطس بالمخلل ... ١٦ ج',
    'مشكل المعلم ..... ٢٤ ج',
  ];
  items.forEach((line, idx) => {
    mCtx.fillText(line, 140, 108 + idx * 36);
  });
  const menuBoard = new THREE.CanvasTexture(mC);
  menuBoard.colorSpace = THREE.SRGBColorSpace;
  menuBoard.anisotropy = anisotropy;

  // 13. Egyptian License Plate
  const [lpC, lpCtx] = makeCanvas(256, 96);
  lpCtx.fillStyle = '#f4f4f0';
  lpCtx.fillRect(0, 0, 256, 96);
  lpCtx.fillStyle = '#1d63b8';
  lpCtx.fillRect(0, 0, 256, 28);
  lpCtx.fillStyle = '#ffffff';
  lpCtx.font = 'bold 18px "Cairo", sans-serif';
  lpCtx.textAlign = 'center';
  lpCtx.fillText('مـصـر   EGYPT', 128, 20);
  lpCtx.fillStyle = '#141414';
  lpCtx.font = 'bold 36px "Cairo", sans-serif';
  lpCtx.fillText('م ع ل  ٤٨٢', 128, 72);
  const licensePlate = new THREE.CanvasTexture(lpC);
  licensePlate.colorSpace = THREE.SRGBColorSpace;
  licensePlate.anisotropy = anisotropy;

  // 13b. Ultra-Realistic Car Dashboard Cluster + Digital Trip Computer + Stitched Fascia
  const [dbC, dbCtx] = makeCanvas(512, 128);
  dbCtx.fillStyle = '#121317';
  dbCtx.fillRect(0, 0, 512, 128);
  // Stitched leather border line across top of dash
  dbCtx.strokeStyle = '#6b4c35';
  dbCtx.lineWidth = 1.5;
  dbCtx.setLineDash([5, 4]);
  dbCtx.beginPath();
  dbCtx.moveTo(12, 8);
  dbCtx.lineTo(500, 8);
  dbCtx.stroke();
  dbCtx.setLineDash([]);

  // Left Instrument Cluster Binnacle: Big Speedometer, Tachometer, Fuel Gauge
  const drawGaugeFace = (cx: number, cy: number, r: number, label: string, color: string) => {
    dbCtx.fillStyle = '#07080b';
    dbCtx.beginPath();
    dbCtx.arc(cx, cy, r, 0, Math.PI * 2);
    dbCtx.fill();
    dbCtx.strokeStyle = '#64748b';
    dbCtx.lineWidth = 2.5;
    dbCtx.stroke();
    dbCtx.strokeStyle = color;
    dbCtx.lineWidth = 2;
    for (let a = -2.25; a <= 2.25; a += 0.45) {
      dbCtx.beginPath();
      dbCtx.moveTo(cx + Math.cos(a - Math.PI / 2) * (r - 9), cy + Math.sin(a - Math.PI / 2) * (r - 9));
      dbCtx.lineTo(cx + Math.cos(a - Math.PI / 2) * (r - 3), cy + Math.sin(a - Math.PI / 2) * (r - 3));
      dbCtx.stroke();
    }
    dbCtx.fillStyle = '#cbd5e1';
    dbCtx.font = 'bold 9px monospace';
    dbCtx.textAlign = 'center';
    dbCtx.fillText(label, cx, cy + r * 0.45);
  };
  drawGaugeFace(78, 66, 40, 'KM/H', '#f59e0b');
  drawGaugeFace(164, 66, 36, 'RPM', '#38bdf8');
  drawGaugeFace(224, 78, 20, 'FUEL', '#10b981');

  // Center Infotainment & Radio LCD + AC Vent Louvers
  dbCtx.fillStyle = '#1f232b';
  dbCtx.fillRect(266, 16, 98, 28);
  for (let vy = 22; vy <= 38; vy += 6) {
    dbCtx.fillStyle = '#0f1217';
    dbCtx.fillRect(272, vy, 86, 2);
  }
  dbCtx.fillStyle = '#0a2238';
  dbCtx.fillRect(268, 52, 94, 54);
  dbCtx.strokeStyle = '#38bdf8';
  dbCtx.lineWidth = 2;
  dbCtx.strokeRect(268, 52, 94, 54);
  dbCtx.fillStyle = '#bae6fd';
  dbCtx.font = 'bold 13px monospace';
  dbCtx.textAlign = 'center';
  dbCtx.fillText('CAIRO FM', 315, 74);
  dbCtx.fillStyle = '#fbbf24';
  dbCtx.font = 'bold 11px monospace';
  dbCtx.fillText('98.2 · 100.6', 315, 93);

  // Passenger woodgrain trim & glovebox latch
  dbCtx.fillStyle = '#3b2416';
  dbCtx.fillRect(382, 26, 114, 18);
  dbCtx.strokeStyle = '#333740';
  dbCtx.lineWidth = 2;
  dbCtx.strokeRect(384, 52, 110, 56);
  dbCtx.fillStyle = '#94a3b8';
  dbCtx.fillRect(426, 58, 26, 6);

  const carDashboard = new THREE.CanvasTexture(dbC);
  carDashboard.colorSpace = THREE.SRGBColorSpace;
  carDashboard.anisotropy = anisotropy;

  // 14. Beverage Fridge Front
  const [fC, fCtx] = makeCanvas(192, 320);
  fCtx.fillStyle = '#162834';
  fCtx.fillRect(0, 0, 192, 320);
  fCtx.strokeStyle = '#c8d0d6';
  fCtx.lineWidth = 10;
  fCtx.strokeRect(5, 5, 182, 310);
  const canColors = ['#d62828', '#2a9d8f', '#f77f00', '#3a86ff'];
  for (let row = 0; row < 4; row++) {
    const sy = 56 + row * 64;
    fCtx.fillStyle = '#8d99ae';
    fCtx.fillRect(14, sy + 26, 164, 6);
    for (let col = 0; col < 5; col++) {
      fCtx.fillStyle = canColors[(row + col) % canColors.length];
      fCtx.fillRect(22 + col * 30, sy - 6, 20, 32);
    }
  }
  const fridgeFront = new THREE.CanvasTexture(fC);
  fridgeFront.colorSpace = THREE.SRGBColorSpace;
  fridgeFront.anisotropy = anisotropy;

  // 15. Oriental Patterned Egyptian Carpet
  const [rugC, rugCtx] = makeCanvas(512, 512);
  rugCtx.fillStyle = '#781d18';
  rugCtx.fillRect(0, 0, 512, 512);
  rugCtx.strokeStyle = '#d6a44b';
  rugCtx.lineWidth = 18;
  rugCtx.strokeRect(20, 20, 472, 472);
  rugCtx.strokeStyle = '#1b2c3b';
  rugCtx.lineWidth = 28;
  rugCtx.strokeRect(48, 48, 416, 416);
  rugCtx.strokeStyle = '#e8c476';
  rugCtx.lineWidth = 4;
  rugCtx.strokeRect(72, 72, 368, 368);
  rugCtx.fillStyle = '#d6a44b';
  for (const [rx, ry] of [
    [98, 98],
    [414, 98],
    [98, 414],
    [414, 414],
  ]) {
    rugCtx.beginPath();
    rugCtx.arc(rx, ry, 22, 0, Math.PI * 2);
    rugCtx.fill();
  }
  rugCtx.fillStyle = '#1b2c3b';
  rugCtx.beginPath();
  rugCtx.ellipse(256, 256, 105, 138, 0, 0, Math.PI * 2);
  rugCtx.fill();
  rugCtx.strokeStyle = '#e8c476';
  rugCtx.lineWidth = 5;
  rugCtx.stroke();
  rugCtx.fillStyle = '#9c2d23';
  rugCtx.beginPath();
  rugCtx.ellipse(256, 256, 62, 86, 0, 0, Math.PI * 2);
  rugCtx.fill();
  rugCtx.fillStyle = '#e8c476';
  rugCtx.beginPath();
  rugCtx.arc(256, 256, 24, 0, Math.PI * 2);
  rugCtx.fill();
  const orientalRug = finalizeColorTex(rugC, anisotropy, 1, 1);

  // 16. Traditional Sofa Woven Fabric
  const [sfC, sfCtx] = makeCanvas(256, 256);
  sfCtx.fillStyle = '#2d455e';
  sfCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 32) {
    for (let x = 0; x < 256; x += 32) {
      sfCtx.fillStyle = (x + y) % 64 === 0 ? '#a84732' : '#d19c4b';
      sfCtx.beginPath();
      sfCtx.arc(x + 16, y + 16, 6, 0, Math.PI * 2);
      sfCtx.fill();
    }
  }
  const sofaFabric = finalizeColorTex(sfC, anisotropy, 3, 2);

  // 17. TV Broadcast Screen Texture
  const [tvC, tvCtx] = makeCanvas(256, 144);
  const tvGrad = tvCtx.createLinearGradient(0, 0, 256, 144);
  tvGrad.addColorStop(0, '#0f294a');
  tvGrad.addColorStop(0.55, '#2b6cb0');
  tvGrad.addColorStop(1, '#ed8936');
  tvCtx.fillStyle = tvGrad;
  tvCtx.fillRect(0, 0, 256, 144);
  tvCtx.fillStyle = 'rgba(255,245,215,0.22)';
  tvCtx.beginPath();
  tvCtx.arc(128, 66, 36, 0, Math.PI * 2);
  tvCtx.fill();
  tvCtx.fillStyle = '#141a22';
  tvCtx.fillRect(0, 108, 256, 36);
  tvCtx.fillStyle = '#f6ad55';
  tvCtx.fillRect(14, 118, 86, 10);
  const tvScene = new THREE.CanvasTexture(tvC);
  tvScene.colorSpace = THREE.SRGBColorSpace;
  tvScene.anisotropy = anisotropy;

  // 18. Wall Clock Face
  const [wcC, wcCtx] = makeCanvas(128, 128);
  wcCtx.fillStyle = '#f8f2e4';
  wcCtx.beginPath();
  wcCtx.arc(64, 64, 60, 0, Math.PI * 2);
  wcCtx.fill();
  wcCtx.strokeStyle = '#5a361a';
  wcCtx.lineWidth = 8;
  wcCtx.stroke();
  wcCtx.strokeStyle = '#1c1917';
  wcCtx.lineWidth = 4;
  wcCtx.beginPath();
  wcCtx.moveTo(64, 64);
  wcCtx.lineTo(64, 28);
  wcCtx.moveTo(64, 64);
  wcCtx.lineTo(90, 70);
  wcCtx.stroke();
  const wallClock = new THREE.CanvasTexture(wcC);
  wallClock.colorSpace = THREE.SRGBColorSpace;

  // 19. Spice Shelf Backdrop
  const [spC, spCtx] = makeCanvas(256, 192);
  spCtx.fillStyle = '#3d2817';
  spCtx.fillRect(0, 0, 256, 192);
  const jarColors = ['#d97706', '#b91c1c', '#15803d', '#eab308', '#a16207'];
  for (const sy of [58, 126, 182]) {
    spCtx.fillStyle = '#754621';
    spCtx.fillRect(0, sy, 256, 10);
    for (let jx = 18; jx < 235; jx += 36) {
      spCtx.fillStyle = jarColors[(jx + sy) % jarColors.length];
      spCtx.fillRect(jx, sy - 34, 22, 34);
      spCtx.fillStyle = '#e5e7eb';
      spCtx.fillRect(jx + 2, sy - 40, 18, 6);
    }
  }
  const spiceShelf = new THREE.CanvasTexture(spC);
  spiceShelf.colorSpace = THREE.SRGBColorSpace;
  spiceShelf.anisotropy = anisotropy;

  // 20. Carved Wood Door Panel (باب خشب حفر بلدي)
  const [wdC, wdCtx] = makeCanvas(192, 384);
  wdCtx.fillStyle = '#5c3419';
  wdCtx.fillRect(0, 0, 192, 384);
  wdCtx.strokeStyle = '#3a1f0e';
  wdCtx.lineWidth = 10;
  wdCtx.strokeRect(8, 8, 176, 368);
  for (const py of [28, 200]) {
    wdCtx.fillStyle = '#6c3e20';
    wdCtx.fillRect(26, py, 140, 148);
    wdCtx.strokeStyle = '#40210e';
    wdCtx.lineWidth = 5;
    wdCtx.strokeRect(26, py, 140, 148);
    wdCtx.strokeStyle = '#8b572d';
    wdCtx.lineWidth = 2;
    wdCtx.strokeRect(36, py + 10, 120, 128);
  }
  const woodDoorPanel = new THREE.CanvasTexture(wdC);
  woodDoorPanel.colorSpace = THREE.SRGBColorSpace;
  woodDoorPanel.anisotropy = anisotropy;

  // 21. Nile River Shimmering Water Texture
  const [nwC, nwCtx] = makeCanvas(256, 256);
  const nwGrad = nwCtx.createLinearGradient(0, 0, 256, 256);
  nwGrad.addColorStop(0, '#0c4a6e');
  nwGrad.addColorStop(0.5, '#0e7490');
  nwGrad.addColorStop(1, '#155e75');
  nwCtx.fillStyle = nwGrad;
  nwCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 420; i++) {
    nwCtx.fillStyle = i % 3 === 0 ? 'rgba(186,230,253,0.18)' : 'rgba(8,47,73,0.22)';
    nwCtx.fillRect(Math.random() * 256, Math.random() * 256, 12 + Math.random() * 18, 2);
  }
  const nileWater = finalizeColorTex(nwC, anisotropy, 6, 2);

  // 22. Stitched Dark Leather Dash & Trim Texture
  const [ldC, ldCtx] = makeCanvas(128, 128);
  ldCtx.fillStyle = '#201e20';
  ldCtx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 1200; i++) {
    const g = 24 + Math.floor(Math.random() * 22);
    ldCtx.fillStyle = `rgb(${g},${g - 1},${g})`;
    ldCtx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const leatherDash = finalizeColorTex(ldC, anisotropy, 2, 2);

  // 23. Weathered Egyptian Kitchen Ceramic Wall Tiles (blue & cream traditional pattern + aged patina)
  const [kwC, kwCtx] = makeCanvas(256, 256);
  kwCtx.fillStyle = '#c9beaa';
  kwCtx.fillRect(0, 0, 256, 256);
  for (let ty = 0; ty < 4; ty++) {
    for (let tx = 0; tx < 4; tx++) {
      const px = tx * 64;
      const py = ty * 64;
      kwCtx.fillStyle = (tx + ty) % 2 === 0 ? '#dbd3c2' : '#cfd7d9';
      kwCtx.fillRect(px + 2, py + 2, 60, 60);
      // Decorative blue Moroccan/Egyptian star diamond inside each tile
      kwCtx.strokeStyle = 'rgba(58, 96, 128, 0.55)';
      kwCtx.lineWidth = 2.5;
      kwCtx.strokeRect(px + 9, py + 9, 46, 46);
      kwCtx.beginPath();
      kwCtx.moveTo(px + 32, py + 12);
      kwCtx.lineTo(px + 52, py + 32);
      kwCtx.lineTo(px + 32, py + 52);
      kwCtx.lineTo(px + 12, py + 32);
      kwCtx.closePath();
      kwCtx.stroke();
      // Grout & patina
      kwCtx.strokeStyle = '#6c6255';
      kwCtx.lineWidth = 2;
      kwCtx.strokeRect(px + 1, py + 1, 62, 62);
    }
  }
  for (let i = 0; i < 2000; i++) {
    kwCtx.fillStyle = Math.random() > 0.4 ? 'rgba(72, 54, 34, 0.16)' : 'rgba(255, 248, 232, 0.09)';
    kwCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  const kitchenSteamPatina = kwCtx.createLinearGradient(0, 0, 0, 256);
  kitchenSteamPatina.addColorStop(0, 'rgba(60,44,24,0.18)');
  kitchenSteamPatina.addColorStop(0.55, 'rgba(0,0,0,0)');
  kitchenSteamPatina.addColorStop(1, 'rgba(48,34,18,0.24)');
  kwCtx.fillStyle = kitchenSteamPatina;
  kwCtx.fillRect(0, 0, 256, 256);
  const kitchenWallTiles = finalizeColorTex(kwC, anisotropy, 3, 2);

  // 24. Brushed Stainless Steel Prep Counter with Warm Oil Sheen
  const [ssC, ssCtx] = makeCanvas(256, 256);
  ssCtx.fillStyle = '#adb4bc';
  ssCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) {
    const shade = 152 + Math.floor(Math.random() * 34);
    ssCtx.fillStyle = `rgb(${shade},${shade + 3},${shade + 7})`;
    ssCtx.fillRect(0, y, 256, 1.5);
  }
  // Subtle cooking oil droplets & sheen near fryer/stove
  for (let i = 0; i < 24; i++) {
    ssCtx.fillStyle = 'rgba(196, 134, 32, 0.24)';
    ssCtx.beginPath();
    ssCtx.arc(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 7, 0, Math.PI * 2);
    ssCtx.fill();
  }
  const stainlessOilSheen = finalizeColorTex(ssC, anisotropy, 2, 4);

  // 25. Hammered Antique Brass / Copper Pot Texture (لـ قدرة الفول النحاسية)
  const [hbC, hbCtx] = makeCanvas(128, 128);
  hbCtx.fillStyle = '#c48d36';
  hbCtx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 280; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    hbCtx.fillStyle = i % 2 === 0 ? 'rgba(255,222,135,0.22)' : 'rgba(84,52,14,0.26)';
    hbCtx.beginPath();
    hbCtx.arc(x, y, 3 + Math.random() * 4, 0, Math.PI * 2);
    hbCtx.fill();
  }
  const hammeredBrass = finalizeColorTex(hbC, anisotropy, 2, 2);

  // 26. Egyptian Classroom Chalkboard
  const [scC, scCtx] = makeCanvas(256, 128);
  scCtx.fillStyle = '#183a2b';
  scCtx.fillRect(0, 0, 256, 128);
  scCtx.strokeStyle = '#6b4226';
  scCtx.lineWidth = 8;
  scCtx.strokeRect(4, 4, 248, 120);
  scCtx.fillStyle = '#f8fafc';
  scCtx.textAlign = 'center';
  scCtx.font = 'bold 22px "Cairo", sans-serif';
  scCtx.fillText('بسم الله الرحمن الرحيم', 128, 42);
  scCtx.font = 'bold 16px "Tajawal", sans-serif';
  scCtx.fillStyle = '#fde047';
  scCtx.fillText('العلم نور · أهلاً بكم في المدرسة', 128, 82);
  const schoolChalkboard = new THREE.CanvasTexture(scC);
  schoolChalkboard.colorSpace = THREE.SRGBColorSpace;
  schoolChalkboard.anisotropy = anisotropy;

  // 27. Egyptian Flag (علم مصر)
  const [efC, efCtx] = makeCanvas(192, 128);
  efCtx.fillStyle = '#ce1126';
  efCtx.fillRect(0, 0, 192, 43);
  efCtx.fillStyle = '#ffffff';
  efCtx.fillRect(0, 43, 192, 42);
  efCtx.fillStyle = '#111111';
  efCtx.fillRect(0, 85, 192, 43);
  efCtx.fillStyle = '#c09300';
  efCtx.beginPath();
  efCtx.arc(96, 64, 11, 0, Math.PI * 2);
  efCtx.fill();
  const egyptianFlag = new THREE.CanvasTexture(efC);
  egyptianFlag.colorSpace = THREE.SRGBColorSpace;
  egyptianFlag.anisotropy = anisotropy;

  // 28. Wife Purple Embroidered Floral Abaya/Dress (جلابية/عباية موف مطرزة بالورود)
  const [dpC, dpCtx] = makeCanvas(256, 256);
  dpCtx.fillStyle = '#5b2a6e';
  dpCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 8) {
    dpCtx.fillStyle = y % 16 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(25,10,35,0.08)';
    dpCtx.fillRect(0, y, 256, 4);
  }
  // Center vertical floral embroidery vine
  dpCtx.strokeStyle = '#d8b4fe';
  dpCtx.lineWidth = 3;
  dpCtx.beginPath();
  dpCtx.moveTo(128, 12);
  dpCtx.lineTo(128, 244);
  dpCtx.stroke();
  const flowerColors = ['#f472b6', '#fbbf24', '#fbcfe8', '#e879f9'];
  for (let fy = 28; fy <= 228; fy += 34) {
    const fc = flowerColors[(fy / 34) % flowerColors.length];
    dpCtx.fillStyle = '#4ade80';
    dpCtx.beginPath();
    dpCtx.ellipse(115, fy + 6, 8, 3, -0.5, 0, Math.PI * 2);
    dpCtx.ellipse(141, fy - 6, 8, 3, 0.5, 0, Math.PI * 2);
    dpCtx.fill();
    dpCtx.fillStyle = fc;
    dpCtx.beginPath();
    dpCtx.arc(128, fy, 7, 0, Math.PI * 2);
    dpCtx.fill();
    dpCtx.fillStyle = '#fef08a';
    dpCtx.beginPath();
    dpCtx.arc(128, fy, 2.5, 0, Math.PI * 2);
    dpCtx.fill();
  }
  const dressPurpleFloral = finalizeColorTex(dpC, anisotropy, 1, 1);

  // 29. Daughter Pink Knit Sweater with Bunny Motif (بلوفر وردي برسمة أرنب)
  const [pbC, pbCtx] = makeCanvas(256, 256);
  pbCtx.fillStyle = '#f49ac1';
  pbCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 6) {
    pbCtx.fillStyle = 'rgba(255,255,255,0.08)';
    pbCtx.fillRect(0, y, 256, 2);
  }
  // Cute white bunny head on chest front
  pbCtx.fillStyle = '#fff5f8';
  pbCtx.strokeStyle = '#9d174d';
  pbCtx.lineWidth = 3;
  pbCtx.beginPath();
  pbCtx.ellipse(114, 78, 9, 26, -0.14, 0, Math.PI * 2);
  pbCtx.fill();
  pbCtx.stroke();
  pbCtx.beginPath();
  pbCtx.ellipse(142, 78, 9, 26, 0.14, 0, Math.PI * 2);
  pbCtx.fill();
  pbCtx.stroke();
  pbCtx.beginPath();
  pbCtx.arc(128, 122, 28, 0, Math.PI * 2);
  pbCtx.fill();
  pbCtx.stroke();
  pbCtx.fillStyle = '#1f2937';
  pbCtx.beginPath();
  pbCtx.arc(118, 118, 3.5, 0, Math.PI * 2);
  pbCtx.arc(138, 118, 3.5, 0, Math.PI * 2);
  pbCtx.fill();
  pbCtx.fillStyle = '#ec4899';
  pbCtx.beginPath();
  pbCtx.arc(128, 127, 4, 0, Math.PI * 2);
  pbCtx.fill();
  const sweaterPinkBunny = finalizeColorTex(pbC, anisotropy, 1, 1);

  // 30. Son Yellow Soccer Ball T-Shirt (تيشيرت أصفر عليه كرة قدم)
  const [jsC, jsCtx] = makeCanvas(256, 256);
  jsCtx.fillStyle = '#facc15';
  jsCtx.fillRect(0, 0, 256, 256);
  jsCtx.fillStyle = '#ca8a04';
  jsCtx.fillRect(0, 0, 256, 18);
  // Soccer ball emblem
  jsCtx.fillStyle = '#ffffff';
  jsCtx.strokeStyle = '#111827';
  jsCtx.lineWidth = 4;
  jsCtx.beginPath();
  jsCtx.arc(128, 118, 34, 0, Math.PI * 2);
  jsCtx.fill();
  jsCtx.stroke();
  jsCtx.fillStyle = '#111827';
  jsCtx.beginPath();
  jsCtx.arc(128, 118, 11, 0, Math.PI * 2);
  jsCtx.fill();
  for (let a = 0; a < 5; a++) {
    const ang = (a / 5) * Math.PI * 2 - Math.PI / 2;
    jsCtx.beginPath();
    jsCtx.arc(128 + Math.cos(ang) * 24, 118 + Math.sin(ang) * 24, 6, 0, Math.PI * 2);
    jsCtx.fill();
  }
  const jerseyYellowSoccer = finalizeColorTex(jsC, anisotropy, 1, 1);

  // 31. Blue Denim Fabric (قماش جينز أزرق)
  const [dnC, dnCtx] = makeCanvas(256, 256);
  dnCtx.fillStyle = '#3b648f';
  dnCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3600; i++) {
    dnCtx.fillStyle = i % 2 === 0 ? 'rgba(220,235,255,0.12)' : 'rgba(18,32,54,0.16)';
    dnCtx.fillRect(Math.random() * 256, Math.random() * 256, 3, 1.5);
  }
  dnCtx.strokeStyle = '#d97706';
  dnCtx.lineWidth = 2;
  dnCtx.setLineDash([6, 4]);
  dnCtx.strokeRect(12, 6, 232, 244);
  const denimBlue = finalizeColorTex(dnC, anisotropy, 1, 1);

  // 32. Crimson Floral Living Room Sofa Brocade (قماش أنتريه نبيتي مشجر)
  const [fsC, fsCtx] = makeCanvas(256, 256);
  fsCtx.fillStyle = '#6f1d24';
  fsCtx.fillRect(0, 0, 256, 256);
  for (let y = 16; y < 256; y += 44) {
    for (let x = 16; x < 256; x += 44) {
      fsCtx.fillStyle = '#d4a359';
      fsCtx.beginPath();
      fsCtx.arc(x, y, 9, 0, Math.PI * 2);
      fsCtx.fill();
      fsCtx.fillStyle = '#b93842';
      fsCtx.beginPath();
      fsCtx.arc(x, y, 5, 0, Math.PI * 2);
      fsCtx.fill();
      fsCtx.fillStyle = '#3e6b48';
      fsCtx.beginPath();
      fsCtx.ellipse(x + 12, y + 8, 6, 3, 0.4, 0, Math.PI * 2);
      fsCtx.fill();
    }
  }
  const floralSofaFabric = finalizeColorTex(fsC, anisotropy, 3, 2);

  // 33. Egyptian Home Bathroom Ceramic Tiles (سيراميك حمام أبيض وسماوي)
  const [tbC, tbCtx] = makeCanvas(256, 256);
  tbCtx.fillStyle = '#dcebf0';
  tbCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64) {
    for (let x = 0; x < 256; x += 64) {
      tbCtx.fillStyle = (x + y) % 128 === 0 ? '#eef7fa' : '#cce2eb';
      tbCtx.fillRect(x + 2, y + 2, 60, 60);
      tbCtx.strokeStyle = '#94b5c4';
      tbCtx.lineWidth = 2;
      tbCtx.strokeRect(x + 1, y + 1, 62, 62);
    }
  }
  const tileBathroom = finalizeColorTex(tbC, anisotropy, 3, 2);

  // 34. Street Vendor A-Frame Sign ("بائع متجول")
  const [vbC, vbCtx] = makeCanvas(256, 320);
  vbCtx.fillStyle = '#92400e';
  vbCtx.fillRect(0, 0, 256, 320);
  vbCtx.fillStyle = '#fef3c7';
  vbCtx.fillRect(16, 16, 224, 288);
  vbCtx.strokeStyle = '#d97706';
  vbCtx.lineWidth = 6;
  vbCtx.strokeRect(24, 24, 208, 272);
  vbCtx.textAlign = 'center';
  vbCtx.textBaseline = 'middle';
  vbCtx.fillStyle = '#b91c1c';
  vbCtx.font = 'bold 54px "Cairo", sans-serif';
  vbCtx.fillText('بائع', 128, 118);
  vbCtx.fillStyle = '#1f2937';
  vbCtx.font = 'bold 46px "Cairo", sans-serif';
  vbCtx.fillText('متجول', 128, 196);
  const vendorBanner = new THREE.CanvasTexture(vbC);
  vendorBanner.colorSpace = THREE.SRGBColorSpace;
  vendorBanner.anisotropy = anisotropy;

  // 35. Red Street Beverage Fridge ("مشروبات")
  const [drC, drCtx] = makeCanvas(192, 320);
  drCtx.fillStyle = '#b91c1c';
  drCtx.fillRect(0, 0, 192, 320);
  drCtx.fillStyle = '#991b1b';
  drCtx.fillRect(10, 8, 172, 46);
  drCtx.fillStyle = '#ffffff';
  drCtx.textAlign = 'center';
  drCtx.font = 'bold 28px "Cairo", sans-serif';
  drCtx.fillText('مشروبات', 96, 40);
  drCtx.fillStyle = '#0f2940';
  drCtx.fillRect(14, 62, 164, 244);
  const bevPalette = ['#ef4444', '#22c55e', '#f59e0b', '#38bdf8', '#a855f7'];
  for (let row = 0; row < 4; row++) {
    const sy = 104 + row * 54;
    drCtx.fillStyle = '#cbd5e1';
    drCtx.fillRect(18, sy + 14, 156, 5);
    for (let col = 0; col < 5; col++) {
      drCtx.fillStyle = bevPalette[(row + col) % bevPalette.length];
      drCtx.fillRect(24 + col * 29, sy - 14, 19, 28);
    }
  }
  const drinksFridge = new THREE.CanvasTexture(drC);
  drinksFridge.colorSpace = THREE.SRGBColorSpace;
  drinksFridge.anisotropy = anisotropy;

  const customSigns: THREE.CanvasTexture[] = [];
  // Dynamic Electronic LED Ad Board Texture inside Shop
  const [adCanvas, adCtx] = makeCanvas(512, 224);
  const adBoardScreen = new THREE.CanvasTexture(adCanvas);
  adBoardScreen.colorSpace = THREE.SRGBColorSpace;
  adBoardScreen.anisotropy = anisotropy;

  const updateAdBoardTexture = (
    headlineAr: string,
    promoTextAr: string,
    discountPct: number,
    active: boolean,
  ) => {
    adCtx.fillStyle = active ? '#07101f' : '#18181b';
    adCtx.fillRect(0, 0, 512, 224);

    if (!active) {
      adCtx.strokeStyle = '#3f3f46';
      adCtx.lineWidth = 6;
      adCtx.strokeRect(8, 8, 496, 208);
      adCtx.fillStyle = '#71717a';
      adCtx.textAlign = 'center';
      adCtx.textBaseline = 'middle';
      adCtx.font = 'bold 28px "Cairo", sans-serif';
      adCtx.fillText('شاشة العروض مطفأة حالياً', 256, 112);
      adBoardScreen.needsUpdate = true;
      return;
    }

    const grad = adCtx.createLinearGradient(0, 0, 512, 224);
    grad.addColorStop(0, '#09152b');
    grad.addColorStop(0.5, '#13274d');
    grad.addColorStop(1, '#09152b');
    adCtx.fillStyle = grad;
    adCtx.fillRect(0, 0, 512, 224);

    // Subtle LED pixel scanlines
    adCtx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let y = 0; y < 224; y += 6) {
      adCtx.fillRect(0, y, 512, 2);
    }

    adCtx.strokeStyle = '#fbbf24';
    adCtx.lineWidth = 7;
    adCtx.strokeRect(8, 8, 496, 208);

    // Top badge
    adCtx.fillStyle = '#dc2626';
    adCtx.fillRect(18, 18, 134, 42);
    adCtx.fillStyle = '#fffbeb';
    adCtx.textAlign = 'center';
    adCtx.textBaseline = 'middle';
    adCtx.font = 'bold 24px "Cairo", sans-serif';
    adCtx.fillText(discountPct > 0 ? `خصم ${discountPct}%` : 'عرض خاص', 85, 39);

    adCtx.fillStyle = '#fbbf24';
    adCtx.font = 'bold 22px "Cairo", sans-serif';
    adCtx.fillText('شاشة عروض محل المعلم اليوم', 326, 39);

    adCtx.fillStyle = '#ffffff';
    adCtx.font = 'bold 29px "Cairo", sans-serif';
    adCtx.fillText(headlineAr.slice(0, 38), 256, 110);

    adCtx.fillStyle = '#67e8f9';
    adCtx.font = 'bold 20px "Tajawal", sans-serif';
    adCtx.fillText(promoTextAr.slice(0, 54), 256, 168);

    adBoardScreen.needsUpdate = true;
  };
  updateAdBoardTexture(
    'عرض المعلم اليوم — فطار سخن لكل الحارة!',
    'خصم ١٥٪ على السندوتشات المشكلة والطلبات العائلية',
    15,
    true,
  );

  // Gas Station Price Pylon Texture
  const [gasC, gasCtx] = makeCanvas(256, 384);
  gasCtx.fillStyle = '#0f172a';
  gasCtx.fillRect(0, 0, 256, 384);
  gasCtx.strokeStyle = '#f59e0b';
  gasCtx.lineWidth = 8;
  gasCtx.strokeRect(8, 8, 240, 368);
  gasCtx.fillStyle = '#f59e0b';
  gasCtx.fillRect(14, 14, 228, 72);
  gasCtx.fillStyle = '#0f172a';
  gasCtx.textAlign = 'center';
  gasCtx.font = 'bold 28px "Cairo", sans-serif';
  gasCtx.fillText('بنزين المعلم', 128, 58);
  const fuels = [
    ['بنزين ٩٢', '١٣.٧٥ ج'],
    ['بنزين ٩٥', '١٥.٠٠ ج'],
    ['سولار', '١١.٥٠ ج'],
    ['زيت وتشحيم', 'متاح ٢٤س'],
  ];
  fuels.forEach(([label, price], idx) => {
    const y = 128 + idx * 60;
    gasCtx.fillStyle = '#1e293b';
    gasCtx.fillRect(20, y - 24, 216, 46);
    gasCtx.fillStyle = '#22c55e';
    gasCtx.textAlign = 'left';
    gasCtx.font = 'bold 20px "Cairo", sans-serif';
    gasCtx.fillText(price, 30, y + 6);
    gasCtx.fillStyle = '#f8fafc';
    gasCtx.textAlign = 'right';
    gasCtx.fillText(label, 226, y + 6);
  });
  const gasPricePylon = new THREE.CanvasTexture(gasC);
  gasPricePylon.colorSpace = THREE.SRGBColorSpace;
  gasPricePylon.anisotropy = anisotropy;

  const makeStreetSignTexture = (streetNameAr: string, districtNameAr: string) => {
    const t = makeArabicSignTexture(
      streetNameAr,
      districtNameAr,
      '#0f3460',
      '#f8fafc',
      '#ffffff',
      anisotropy,
      'rgba(56,189,248,0.18)',
    );
    customSigns.push(t);
    return t;
  };

  const makeCustomShopSign = (
    titleAr: string,
    subtitleAr: string,
    bgHex: string,
    borderHex: string,
    textHex = '#fffbeb',
  ) => {
    const t = makeArabicSignTexture(
      titleAr,
      subtitleAr,
      bgHex,
      borderHex,
      textHex,
      anisotropy,
      'rgba(255,220,120,0.25)',
    );
    customSigns.push(t);
    return t;
  };

  const all = [
    asphalt,
    asphaltPlain,
    rollerShutter,
    sidewalk,
    curbStripes,
    buildingPlasterA,
    buildingPlasterB,
    windowLouver,
    mashrabiya,
    shopTile,
    woodCounter,
    bumpNoise,
    brickBump,
    tileBump,
    woodGrainBump,
    fabricWeave,
    skinMicro,
    contactShadow,
    awningStripes,
    signShop,
    signMarket,
    signHome,
    signFuel,
    signCoffee,
    signBakery,
    signGrocery,
    signWorkshop,
    menuBoard,
    licensePlate,
    carDashboard,
    fridgeFront,
    orientalRug,
    sofaFabric,
    tvScene,
    wallClock,
    spiceShelf,
    woodDoorPanel,
    nileWater,
    leatherDash,
    kitchenWallTiles,
    stainlessOilSheen,
    hammeredBrass,
    schoolChalkboard,
    egyptianFlag,
    dressPurpleFloral,
    sweaterPinkBunny,
    jerseyYellowSoccer,
    denimBlue,
    floralSofaFabric,
    tileBathroom,
    vendorBanner,
    drinksFridge,
    adBoardScreen,
    gasPricePylon,
  ];

  return {
    asphalt,
    asphaltPlain,
    rollerShutter,
    sidewalk,
    curbStripes,
    buildingPlasterA,
    buildingPlasterB,
    windowLouver,
    mashrabiya,
    shopTile,
    woodCounter,
    bumpNoise,
    brickBump,
    tileBump,
    woodGrainBump,
    fabricWeave,
    skinMicro,
    contactShadow,
    awningStripes,
    signShop,
    signMarket,
    signHome,
    signFuel,
    signCoffee,
    signBakery,
    signGrocery,
    signWorkshop,
    menuBoard,
    licensePlate,
    carDashboard,
    fridgeFront,
    orientalRug,
    sofaFabric,
    tvScene,
    wallClock,
    spiceShelf,
    woodDoorPanel,
    nileWater,
    leatherDash,
    kitchenWallTiles,
    stainlessOilSheen,
    hammeredBrass,
    schoolChalkboard,
    egyptianFlag,
    dressPurpleFloral,
    sweaterPinkBunny,
    jerseyYellowSoccer,
    denimBlue,
    floralSofaFabric,
    tileBathroom,
    vendorBanner,
    drinksFridge,
    adBoardScreen,
    gasPricePylon,
    updateAdBoardTexture,
    makeStreetSignTexture,
    makeCustomShopSign,
    dispose: () => {
      for (const t of all) t.dispose();
      for (const t of customSigns) t.dispose();
    },
  };
}
