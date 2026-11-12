import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';
import { Blob } from 'buffer';

// Node.js environment polyfills for GLTFExporter binary writer
if (!global.Blob) global.Blob = Blob;
if (!global.FileReader) {
  class NodeFileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onloadend) this.onloadend();
        if (this.onload) this.onload();
      });
    }
  }
  global.FileReader = NodeFileReader;
}

console.log('Building Cinematic Shadow Knight 3D Model...');

const scene = new THREE.Scene();
const characterRoot = new THREE.Group();
characterRoot.name = 'ShadowKnightCharacter';

// -------------------------------------------------------------------
// 1. MATERIAL DEFINITIONS
// -------------------------------------------------------------------
const armorPlateMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#0D111A'),
  roughness: 0.18,
  metalness: 0.94,
  name: 'ArmorPlate_Mat',
});

const secondaryArmorMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#161C28'),
  roughness: 0.22,
  metalness: 0.90,
  name: 'SecondaryArmor_Mat',
});

const silverTrimMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#D8E2F0'),
  roughness: 0.12,
  metalness: 0.98,
  name: 'SilverTrim_Mat',
});

const crimsonEnergyMat = new THREE.MeshBasicMaterial({
  color: new THREE.Color('#D31027'),
  name: 'CrimsonEnergy_Mat',
});

const crimsonCoreMat = new THREE.MeshBasicMaterial({
  color: new THREE.Color('#FF2442'),
  name: 'CrimsonCoreGlow_Mat',
});

const swordBladeMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#141720'),
  roughness: 0.16,
  metalness: 0.94,
  name: 'SwordBlade_Mat',
});

const crimsonPlumeMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#FF2247'),
  emissive: new THREE.Color('#880018'),
  emissiveIntensity: 0.85,
  roughness: 0.45,
  metalness: 0.15,
  side: THREE.DoubleSide,
  name: 'CrimsonPlume_Mat',
});

const blackCapeMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#090A10'),
  roughness: 0.85,
  metalness: 0.15,
  side: THREE.DoubleSide,
  name: 'BlackCape_Mat',
});

const rockMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#12151E'),
  roughness: 0.65,
  metalness: 0.45,
  name: 'Rock_Mat',
});

// Helper: Create beveled polygon plate
function createPlate(points, depth = 0.04, bevel = 0.015) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1]);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
  });
}

// Helper: Create beveled energy line strip
function createEnergyLine(points, depth = 0.02) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1]);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
  });
}

// -------------------------------------------------------------------
// 2. PEDESTAL & ENERGY RING
// -------------------------------------------------------------------
const pedestalGroup = new THREE.Group();
pedestalGroup.name = 'PedestalGroup';

const pedestalGeo = new THREE.CylinderGeometry(1.65, 1.85, 0.16, 36);
const pedestalMesh = new THREE.Mesh(pedestalGeo, rockMat);
pedestalMesh.position.set(0, 0.08, 0);
pedestalGroup.add(pedestalMesh);

// Glowing blue runic ring on pedestal top
const runeRingGeo = new THREE.RingGeometry(1.35, 1.45, 48);
runeRingGeo.rotateX(-Math.PI / 2);
const runeRingMesh = new THREE.Mesh(runeRingGeo, crimsonEnergyMat);
runeRingMesh.position.set(0, 0.162, 0);
pedestalGroup.add(runeRingMesh);

// Outer silver rim
const rimTorusGeo = new THREE.TorusGeometry(1.65, 0.025, 8, 36);
rimTorusGeo.rotateX(Math.PI / 2);
const rimMesh = new THREE.Mesh(rimTorusGeo, silverTrimMat);
rimMesh.position.set(0, 0.16, 0);
pedestalGroup.add(rimMesh);

characterRoot.add(pedestalGroup);

// -------------------------------------------------------------------
// 3. LEGS & ARTICULATED SABATONS (BOOTS)
// -------------------------------------------------------------------
const legsGroup = new THREE.Group();
legsGroup.name = 'LegsGroup';

// Sabatons (Pointed Gothic Metal Boots)
function createSabaton(isLeft = true) {
  const group = new THREE.Group();
  const sign = isLeft ? -1 : 1;

  // Segmented instep plates
  const soleGeo = createPlate([
    [-0.12, -0.22],
    [0.12, -0.22],
    [0.10, 0.18],
    [0.0, 0.32], // Pointed toe
    [-0.10, 0.18],
  ], 0.08, 0.015);
  soleGeo.rotateX(Math.PI / 2);

  const soleMesh = new THREE.Mesh(soleGeo, armorPlateMat);
  soleMesh.position.set(0, 0.04, 0.02);
  group.add(soleMesh);

  // Instep layered plate
  const instepGeo = createPlate([
    [-0.10, -0.05],
    [0.10, -0.05],
    [0.08, 0.16],
    [0.0, 0.24],
    [-0.08, 0.16],
  ], 0.07, 0.012);
  instepGeo.rotateX(Math.PI / 2.3);
  const instepMesh = new THREE.Mesh(instepGeo, secondaryArmorMat);
  instepMesh.position.set(0, 0.08, 0.06);
  group.add(instepMesh);

  // Cyan energy line along the sole edge
  const energyStripGeo = createEnergyLine([
    [-0.11, -0.01],
    [0.11, -0.01],
    [0.09, 0.28],
    [0.0, 0.33],
    [-0.09, 0.28],
  ], 0.015);
  energyStripGeo.rotateX(Math.PI / 2);
  const energyStripMesh = new THREE.Mesh(energyStripGeo, crimsonEnergyMat);
  energyStripMesh.position.set(0, 0.02, 0.03);
  group.add(energyStripMesh);

  return group;
}

const leftSabaton = createSabaton(true);
leftSabaton.position.set(-0.36, 0.16, 0.05);
leftSabaton.rotation.y = 0.18;
legsGroup.add(leftSabaton);

const rightSabaton = createSabaton(false);
rightSabaton.position.set(0.36, 0.16, -0.05);
rightSabaton.rotation.y = -0.15;
legsGroup.add(rightSabaton);

// Greaves (Segmented Gothic Shin Plates with Chevron Energy Lines)
function createGreave(isLeft = true) {
  const group = new THREE.Group();

  // Core shin pillar
  const shinGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.72, 16);
  const shinMesh = new THREE.Mesh(shinGeo, armorPlateMat);
  shinMesh.position.set(0, 0.36, 0);
  group.add(shinMesh);

  // 3 Layered Chevron Front Plates
  for (let i = 0; i < 3; i++) {
    const yPos = 0.18 + i * 0.20;
    const scale = 1.0 - i * 0.06;

    // Chevron plate
    const chevronGeo = createPlate([
      [-0.13 * scale, 0.08],
      [0, -0.06],
      [0.13 * scale, 0.08],
      [0.12 * scale, 0.02],
      [0, -0.11],
      [-0.12 * scale, 0.02],
    ], 0.04, 0.012);
    const chevronMesh = new THREE.Mesh(chevronGeo, secondaryArmorMat);
    chevronMesh.position.set(0, yPos, 0.11);
    group.add(chevronMesh);

    // Glowing cyan line in chevron seam
    const blueLineGeo = createEnergyLine([
      [-0.12 * scale, 0.01],
      [0, -0.10],
      [0.12 * scale, 0.01],
      [0.10 * scale, -0.01],
      [0, -0.12],
      [-0.10 * scale, -0.01],
    ], 0.015);
    const blueLineMesh = new THREE.Mesh(blueLineGeo, crimsonEnergyMat);
    blueLineMesh.position.set(0, yPos, 0.13);
    group.add(blueLineMesh);
  }

  // Silver edge trim
  const silverTrimGeo = new THREE.CylinderGeometry(0.145, 0.115, 0.03, 16);
  const topTrimMesh = new THREE.Mesh(silverTrimGeo, silverTrimMat);
  topTrimMesh.position.set(0, 0.72, 0);
  group.add(topTrimMesh);

  return group;
}

const leftGreave = createGreave(true);
leftGreave.position.set(-0.36, 0.28, 0.05);
leftGreave.rotation.y = 0.18;
legsGroup.add(leftGreave);

const rightGreave = createGreave(false);
rightGreave.position.set(0.36, 0.28, -0.05);
rightGreave.rotation.y = -0.15;
legsGroup.add(rightGreave);

// Poleyns (Sharp Spiked Gothic Knee Cops)
function createPoleyn() {
  const group = new THREE.Group();

  // Spiked faceted knee cap
  const kneeGeo = createPlate([
    [-0.15, 0.12],
    [0.15, 0.12],
    [0.12, -0.08],
    [0, -0.16], // Spiked point
    [-0.12, -0.08],
  ], 0.08, 0.02);
  const kneeMesh = new THREE.Mesh(kneeGeo, armorPlateMat);
  kneeMesh.position.set(0, 0, 0.12);
  kneeMesh.rotation.x = -0.12;
  group.add(kneeMesh);

  // Central glowing chevron diamond
  const gemGeo = createEnergyLine([
    [0, 0.08],
    [0.08, 0],
    [0, -0.08],
    [-0.08, 0],
  ], 0.025);
  const gemMesh = new THREE.Mesh(gemGeo, crimsonEnergyMat);
  gemMesh.position.set(0, 0, 0.17);
  group.add(gemMesh);

  return group;
}

const leftPoleyn = createPoleyn();
leftPoleyn.position.set(-0.36, 1.06, 0.05);
legsGroup.add(leftPoleyn);

const rightPoleyn = createPoleyn();
rightPoleyn.position.set(0.36, 1.06, -0.05);
legsGroup.add(rightPoleyn);

// Cuisses (Thigh Armor with Diagonal Glowing Lines)
function createCuisse() {
  const group = new THREE.Group();

  const thighGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.76, 16);
  const thighMesh = new THREE.Mesh(thighGeo, armorPlateMat);
  thighMesh.position.set(0, 0.38, 0);
  group.add(thighMesh);

  // Outer layered thigh plate
  const outerPlateGeo = createPlate([
    [-0.14, 0.32],
    [0.14, 0.32],
    [0.12, -0.28],
    [0, -0.36],
    [-0.12, -0.28],
  ], 0.05, 0.015);
  const outerPlateMesh = new THREE.Mesh(outerPlateGeo, secondaryArmorMat);
  outerPlateMesh.position.set(0, 0.38, 0.12);
  group.add(outerPlateMesh);

  // Diagonal energy lines (2 lines)
  for (let i = 0; i < 2; i++) {
    const yPos = 0.24 + i * 0.22;
    const diagGeo = createEnergyLine([
      [-0.11, 0.04],
      [0, -0.04],
      [0.11, 0.04],
      [0.09, 0.02],
      [0, -0.06],
      [-0.09, 0.02],
    ], 0.02);
    const diagMesh = new THREE.Mesh(diagGeo, crimsonEnergyMat);
    diagMesh.position.set(0, yPos, 0.15);
    group.add(diagMesh);
  }

  return group;
}

const leftCuisse = createCuisse();
leftCuisse.position.set(-0.33, 1.15, 0.04);
legsGroup.add(leftCuisse);

const rightCuisse = createCuisse();
rightCuisse.position.set(0.33, 1.15, -0.04);
legsGroup.add(rightCuisse);

characterRoot.add(legsGroup);

// -------------------------------------------------------------------
// 4. HIPS, FAULDS & TASSETS
// -------------------------------------------------------------------
const hipsGroup = new THREE.Group();
hipsGroup.position.set(0, 1.95, 0);
hipsGroup.name = 'HipsGroup';

// Pelvis girdle
const girdleGeo = new THREE.CylinderGeometry(0.38, 0.35, 0.22, 20);
girdleGeo.scale(1.15, 1.0, 0.85);
const girdleMesh = new THREE.Mesh(girdleGeo, armorPlateMat);
hipsGroup.add(girdleMesh);

// Center Gothic Belt Buckle with Glowing Blue Eye/Gem
const buckleGeo = createPlate([
  [0, 0.12],
  [0.14, 0.04],
  [0.11, -0.10],
  [0, -0.15],
  [-0.11, -0.10],
  [-0.14, 0.04],
], 0.06, 0.015);
const buckleMesh = new THREE.Mesh(buckleGeo, silverTrimMat);
buckleMesh.position.set(0, 0.02, 0.28);
hipsGroup.add(buckleMesh);

const buckleGemGeo = createEnergyLine([
  [0, 0.07],
  [0.08, 0],
  [0, -0.07],
  [-0.08, 0],
], 0.025);
const buckleGemMesh = new THREE.Mesh(buckleGemGeo, crimsonCoreMat);
buckleGemMesh.position.set(0, 0.02, 0.32);
hipsGroup.add(buckleGemMesh);

// Flared Tassets (Side/Thigh Armor Plates)
function createTasset(isLeft = true) {
  const group = new THREE.Group();
  const sign = isLeft ? -1 : 1;

  for (let i = 0; i < 2; i++) {
    const scale = 1.0 - i * 0.12;
    const yOffset = -i * 0.14;
    const tassetPlateGeo = createPlate([
      [-0.15 * scale, 0.12],
      [0.15 * scale, 0.12],
      [0.13 * scale, -0.12],
      [0, -0.22],
      [-0.13 * scale, -0.12],
    ], 0.04, 0.012);
    const tassetPlateMesh = new THREE.Mesh(tassetPlateGeo, secondaryArmorMat);
    tassetPlateMesh.position.set(0, yOffset, 0);
    group.add(tassetPlateMesh);

    // Glowing seam line
    const tassetLineGeo = createEnergyLine([
      [-0.12 * scale, 0.02],
      [0, -0.06],
      [0.12 * scale, 0.02],
      [0.10 * scale, 0.0],
      [0, -0.08],
      [-0.10 * scale, 0.0],
    ], 0.018);
    const tassetLineMesh = new THREE.Mesh(tassetLineGeo, crimsonEnergyMat);
    tassetLineMesh.position.set(0, yOffset - 0.06, 0.03);
    group.add(tassetLineMesh);
  }

  return group;
}

const leftTasset = createTasset(true);
leftTasset.position.set(-0.46, -0.08, 0.12);
leftTasset.rotation.set(0.15, -0.22, 0.18);
hipsGroup.add(leftTasset);

const rightTasset = createTasset(false);
rightTasset.position.set(0.46, -0.08, 0.12);
rightTasset.rotation.set(0.15, 0.22, -0.18);
hipsGroup.add(rightTasset);

characterRoot.add(hipsGroup);

// -------------------------------------------------------------------
// 5. TORSO, SEGMENTED CHEVRON CUIRASS & GLOWING CORE
// -------------------------------------------------------------------
const torsoGroup = new THREE.Group();
torsoGroup.position.set(0, 2.05, 0);
torsoGroup.name = 'TorsoGroup';

// Abdomen segment base
const abdoBaseGeo = new THREE.CylinderGeometry(0.39, 0.35, 0.48, 20);
abdoBaseGeo.scale(1.12, 1.0, 0.82);
const abdoBaseMesh = new THREE.Mesh(abdoBaseGeo, armorPlateMat);
abdoBaseMesh.position.set(0, 0.26, 0);
torsoGroup.add(abdoBaseMesh);

// 4 Overlapping Chevron Abdominal Plates with Glowing Cyan Seams
for (let i = 0; i < 4; i++) {
  const yPos = 0.12 + i * 0.11;
  const scale = 0.86 + i * 0.06;

  // Interlocking chevron plate
  const chevPlateGeo = createPlate([
    [-0.24 * scale, 0.08],
    [0, -0.05],
    [0.24 * scale, 0.08],
    [0.22 * scale, 0.01],
    [0, -0.11],
    [-0.22 * scale, 0.01],
  ], 0.04, 0.012);
  const chevPlateMesh = new THREE.Mesh(chevPlateGeo, secondaryArmorMat);
  chevPlateMesh.position.set(0, yPos, 0.22);
  torsoGroup.add(chevPlateMesh);

  // Bright electric-blue luminous channel in the seam
  const chevLineGeo = createEnergyLine([
    [-0.23 * scale, 0.02],
    [0, -0.09],
    [0.23 * scale, 0.02],
    [0.21 * scale, -0.01],
    [0, -0.12],
    [-0.21 * scale, -0.01],
  ], 0.02);
  const chevLineMesh = new THREE.Mesh(chevLineGeo, crimsonEnergyMat);
  chevLineMesh.position.set(0, yPos, 0.245);
  torsoGroup.add(chevLineMesh);
}

// Upper Pectoral Cuirass (Broad Gothic Chestplate)
const chestBaseGeo = new THREE.SphereGeometry(0.52, 24, 18);
chestBaseGeo.scale(1.05, 0.82, 0.72);
const chestBaseMesh = new THREE.Mesh(chestBaseGeo, armorPlateMat);
chestBaseMesh.position.set(0, 0.74, 0.06);
torsoGroup.add(chestBaseMesh);

// Left & Right Angular Pectoral Armor Plates
const leftPecGeo = createPlate([
  [-0.28, 0.18],
  [0, 0.14],
  [0, -0.16],
  [-0.24, -0.18],
], 0.05, 0.015);
const leftPecMesh = new THREE.Mesh(leftPecGeo, secondaryArmorMat);
leftPecMesh.position.set(-0.16, 0.74, 0.32);
leftPecMesh.rotation.set(-0.05, -0.20, 0.08);
torsoGroup.add(leftPecMesh);

const rightPecGeo = createPlate([
  [0, 0.14],
  [0.28, 0.18],
  [0.24, -0.18],
  [0, -0.16],
], 0.05, 0.015);
const rightPecMesh = new THREE.Mesh(rightPecGeo, secondaryArmorMat);
rightPecMesh.position.set(0.16, 0.74, 0.32);
rightPecMesh.rotation.set(-0.05, 0.20, -0.08);
torsoGroup.add(rightPecMesh);

// Glowing Electric-Blue Winged Chest Core Emblem (Sternum / Clavicle)
const chestCoreGeo = createEnergyLine([
  [0, 0.18],
  [0.15, 0.24],
  [0.28, 0.14],
  [0.14, 0.02],
  [0, -0.16],
  [-0.14, 0.02],
  [-0.28, 0.14],
  [-0.15, 0.24],
], 0.035);
const chestCoreMesh = new THREE.Mesh(chestCoreGeo, crimsonCoreMat);
chestCoreMesh.position.set(0, 0.82, 0.38);
torsoGroup.add(chestCoreMesh);

// Armored Gorget (Neck Collar) with Silver Polish
const gorgetGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.24, 18);
gorgetGeo.scale(1.08, 1.0, 0.90);
const gorgetMesh = new THREE.Mesh(gorgetGeo, silverTrimMat);
gorgetMesh.position.set(0, 1.12, 0.05);
torsoGroup.add(gorgetMesh);

// -------------------------------------------------------------------
// 6. LAYERED ANGULAR PAULDRONS (SHOULDER PLATES)
// -------------------------------------------------------------------
function createPauldron(isLeft = true) {
  const group = new THREE.Group();
  const sign = isLeft ? -1 : 1;

  // 3 Tiered, upward and outward flaring angular gothic plates
  for (let tier = 0; tier < 3; tier++) {
    const scale = 1.0 - tier * 0.12;
    const yOffset = tier * 0.12;
    const zOffset = -tier * 0.04;
    const rotZ = sign * (0.35 + tier * 0.18);

    // Flared gothic plate
    const plateGeo = createPlate([
      [-0.24 * scale, 0.16],
      [0.0, 0.36 * scale], // Upward flare point
      [0.24 * scale, 0.16],
      [0.18 * scale, -0.14],
      [0.0, -0.22 * scale],
      [-0.18 * scale, -0.14],
    ], 0.05, 0.015);

    const plateMesh = new THREE.Mesh(plateGeo, tier === 1 ? secondaryArmorMat : armorPlateMat);
    plateMesh.position.set(sign * (0.05 + tier * 0.04), yOffset, zOffset);
    plateMesh.rotation.set(0.18, sign * -0.12, rotZ);
    group.add(plateMesh);

    // Glowing electric blue under-rim line
    const rimLineGeo = createEnergyLine([
      [-0.22 * scale, 0.14],
      [0.0, 0.33 * scale],
      [0.22 * scale, 0.14],
      [0.16 * scale, 0.11],
      [0.0, 0.29 * scale],
      [-0.16 * scale, 0.11],
    ], 0.02);
    const rimLineMesh = new THREE.Mesh(rimLineGeo, crimsonEnergyMat);
    rimLineMesh.position.set(sign * (0.05 + tier * 0.04), yOffset, zOffset + 0.04);
    rimLineMesh.rotation.set(0.18, sign * -0.12, rotZ);
    group.add(rimLineMesh);
  }

  // Polished silver outer edge crest
  const crestGeo = createPlate([
    [-0.04, 0.44],
    [0.04, 0.44],
    [0.03, -0.08],
    [-0.03, -0.08],
  ], 0.04, 0.01);
  const crestMesh = new THREE.Mesh(crestGeo, silverTrimMat);
  crestMesh.position.set(sign * 0.12, 0.18, 0.02);
  crestMesh.rotation.set(0.15, 0, sign * 0.42);
  group.add(crestMesh);

  return group;
}

const leftPauldron = createPauldron(true);
leftPauldron.position.set(-0.65, 0.98, 0.04);
torsoGroup.add(leftPauldron);

const rightPauldron = createPauldron(false);
rightPauldron.position.set(0.65, 0.98, 0.04);
torsoGroup.add(rightPauldron);

// -------------------------------------------------------------------
// 7. ARMS, VAMBRACES & GAUNTLETS (POSE: RIGHT ARM WITH SWORD, LEFT RELAXED)
// -------------------------------------------------------------------
// LEFT ARM (Relaxed at side, fist clenched with glowing knuckle joints)
const leftArmGroup = new THREE.Group();
leftArmGroup.position.set(-0.55, 0.85, 0.05);

const leftBicepGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.45, 14);
const leftBicepMesh = new THREE.Mesh(leftBicepGeo, armorPlateMat);
leftBicepMesh.position.set(0, -0.22, 0);
leftArmGroup.add(leftBicepMesh);

// Left Elbow Couter (Sharp Pointed Spiked Elbow Cop)
const couterGeo = createPlate([
  [-0.10, 0.10],
  [0.10, 0.10],
  [0.08, -0.08],
  [0, -0.16],
  [-0.08, -0.08],
], 0.05, 0.015);
const leftCouterMesh = new THREE.Mesh(couterGeo, secondaryArmorMat);
leftCouterMesh.position.set(-0.06, -0.46, -0.08);
leftCouterMesh.rotation.set(Math.PI / 1.8, 0, -0.2);
leftArmGroup.add(leftCouterMesh);

// Left Forearm Vambrace
const leftForearmGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.44, 14);
const leftForearmMesh = new THREE.Mesh(leftForearmGeo, secondaryArmorMat);
leftForearmMesh.position.set(0.04, -0.66, 0.05);
leftArmGroup.add(leftForearmMesh);

// Forearm Chevron Glowing Lines
for (let i = 0; i < 2; i++) {
  const lineGeo = createEnergyLine([
    [-0.08, 0.02],
    [0, -0.03],
    [0.08, 0.02],
    [0.07, 0],
    [0, -0.04],
    [-0.07, 0],
  ], 0.018);
  const lineMesh = new THREE.Mesh(lineGeo, crimsonEnergyMat);
  lineMesh.position.set(0.04, -0.58 - i * 0.12, 0.14);
  leftArmGroup.add(lineMesh);
}

// Left Gauntlet (Clenched Fist at Side)
const leftGauntletGeo = new THREE.BoxGeometry(0.13, 0.18, 0.15);
const leftGauntletMesh = new THREE.Mesh(leftGauntletGeo, armorPlateMat);
leftGauntletMesh.position.set(0.06, -0.92, 0.08);
leftArmGroup.add(leftGauntletMesh);

// Glowing Knuckle Seam Line
const knuckleLineGeo = createEnergyLine([
  [-0.06, 0.02],
  [0.06, 0.02],
  [0.06, -0.02],
  [-0.06, -0.02],
], 0.02);
const knuckleLineMesh = new THREE.Mesh(knuckleLineGeo, crimsonCoreMat);
knuckleLineMesh.position.set(0.06, -0.92, 0.16);
leftArmGroup.add(knuckleLineMesh);

torsoGroup.add(leftArmGroup);

// RIGHT ARM (Holding Greatsword pointing diagonally down-left)
const rightArmGroup = new THREE.Group();
rightArmGroup.position.set(0.55, 0.85, 0.05);

const rightBicepMesh = new THREE.Mesh(leftBicepGeo, armorPlateMat);
rightBicepMesh.position.set(0.05, -0.18, 0.12);
rightBicepMesh.rotation.set(0.42, -0.15, 0.18);
rightArmGroup.add(rightBicepMesh);

// Right Elbow Couter
const rightCouterMesh = new THREE.Mesh(couterGeo, secondaryArmorMat);
rightCouterMesh.position.set(0.12, -0.38, 0.28);
rightCouterMesh.rotation.set(0.65, 0.3, 0);
rightArmGroup.add(rightCouterMesh);

// Right Forearm angled forward & in to grip sword hilt
const rightForearmMesh = new THREE.Mesh(leftForearmGeo, secondaryArmorMat);
rightForearmMesh.position.set(-0.12, -0.48, 0.44);
rightForearmMesh.rotation.set(0.85, 0.24, -0.45);
rightArmGroup.add(rightForearmMesh);

// Forearm Glowing Lines
for (let i = 0; i < 2; i++) {
  const lineGeo = createEnergyLine([
    [-0.08, 0.02],
    [0, -0.03],
    [0.08, 0.02],
    [0.07, 0],
    [0, -0.04],
    [-0.07, 0],
  ], 0.018);
  const lineMesh = new THREE.Mesh(lineGeo, crimsonEnergyMat);
  lineMesh.position.set(-0.12, -0.42 - i * 0.10, 0.52);
  lineMesh.rotation.set(0.85, 0.24, -0.45);
  rightArmGroup.add(lineMesh);
}

// Right Gauntlet gripping the sword hilt
const rightGauntletGeo = new THREE.BoxGeometry(0.14, 0.16, 0.16);
const rightGauntletMesh = new THREE.Mesh(rightGauntletGeo, armorPlateMat);
rightGauntletMesh.position.set(-0.25, -0.58, 0.62);
rightGauntletMesh.rotation.set(0.85, 0.24, -0.45);
rightArmGroup.add(rightGauntletMesh);

// Glowing Knuckle Line
const rightKnuckleMesh = new THREE.Mesh(knuckleLineGeo, crimsonCoreMat);
rightKnuckleMesh.position.set(-0.25, -0.58, 0.71);
rightKnuckleMesh.rotation.set(0.85, 0.24, -0.45);
rightArmGroup.add(rightKnuckleMesh);

torsoGroup.add(rightArmGroup);

// -------------------------------------------------------------------
// 8. THE LUMINOUS ELECTRIC-BLUE GREATSWORD
// -------------------------------------------------------------------
// Held firmly in right hand, angled diagonally down-left toward the floor
const swordGroup = new THREE.Group();
swordGroup.name = 'GreatswordGroup';
swordGroup.position.set(-0.25, 1.47, 0.67);
swordGroup.rotation.set(0.35, -0.22, 0.62); // Angled down-left toward floor

// Sword Grip / Hilt
const hiltGeo = new THREE.CylinderGeometry(0.032, 0.035, 0.55, 14);
const hiltMesh = new THREE.Mesh(hiltGeo, secondaryArmorMat);
hiltMesh.position.set(0, 0.15, 0);
swordGroup.add(hiltMesh);

// Pommel (Faceted Gothic Skull / Diamond)
const pommelGeo = createPlate([
  [0, 0.07],
  [0.06, 0.02],
  [0.04, -0.06],
  [0, -0.08],
  [-0.04, -0.06],
  [-0.06, 0.02],
], 0.06, 0.015);
const pommelMesh = new THREE.Mesh(pommelGeo, silverTrimMat);
pommelMesh.position.set(0, 0.44, 0);
swordGroup.add(pommelMesh);

// Crossguard (Angular Gothic Guard with Glowing Blue Insets)
const crossguardGeo = createPlate([
  [-0.38, 0.05],
  [0, 0.08],
  [0.38, 0.05],
  [0.42, -0.03],
  [0, -0.06],
  [-0.42, -0.03],
], 0.08, 0.018);
const crossguardMesh = new THREE.Mesh(crossguardGeo, armorPlateMat);
crossguardMesh.position.set(0, -0.14, 0);
swordGroup.add(crossguardMesh);

// Glowing Blue Crossguard Inset Lines
const guardGlowGeo = createEnergyLine([
  [-0.32, 0.02],
  [0, 0.04],
  [0.32, 0.02],
  [0.30, 0.0],
  [0, 0.02],
  [-0.30, 0.0],
], 0.025);
const guardGlowMesh = new THREE.Mesh(guardGlowGeo, crimsonCoreMat);
guardGlowMesh.position.set(0, -0.14, 0.05);
swordGroup.add(guardGlowMesh);

// THE MASSIVE ENERGY BLADE (Luminous Translucent Blue with Diamond Profile)
const bladeShape = new THREE.Shape();
bladeShape.moveTo(0, 0); // Tip
bladeShape.lineTo(0.12, 0.35); // Lower flare
bladeShape.lineTo(0.14, 1.85); // Base width
bladeShape.lineTo(-0.14, 1.85);
bladeShape.lineTo(-0.12, 0.35);
bladeShape.closePath();

const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, {
  depth: 0.045,
  bevelEnabled: true,
  bevelThickness: 0.025,
  bevelSize: 0.02,
  bevelSegments: 2,
});
bladeGeo.center();

const bladeMesh = new THREE.Mesh(bladeGeo, swordBladeMat);
bladeMesh.position.set(0, -1.15, 0);
swordGroup.add(bladeMesh);

// Glowing Core Fuller Line (Running down the blade spine)
const fullerGeo = createEnergyLine([
  [0, 0.2],
  [0.03, 0.35],
  [0.035, 1.75],
  [-0.035, 1.75],
  [-0.03, 0.35],
], 0.06);
fullerGeo.center();
const fullerMesh = new THREE.Mesh(fullerGeo, crimsonCoreMat);
fullerMesh.position.set(0, -1.12, 0.005);
swordGroup.add(fullerMesh);

characterRoot.add(swordGroup);

// -------------------------------------------------------------------
// 9. HELMET, VISOR & RADIANT BLUE SLIT EYES
// -------------------------------------------------------------------
const helmetGroup = new THREE.Group();
helmetGroup.position.set(0, 1.34, 0.06);
helmetGroup.name = 'HelmetGroup';

// Curved Gothic Helm Dome
const helmDomeGeo = new THREE.SphereGeometry(0.25, 24, 20);
helmDomeGeo.scale(0.88, 1.18, 1.05);
const helmDomeMesh = new THREE.Mesh(helmDomeGeo, armorPlateMat);
helmetGroup.add(helmDomeMesh);

// Angular Cheek Guards & Sharp Gothic Chin
const visorFaceGeo = createPlate([
  [-0.18, 0.16],
  [0.18, 0.16],
  [0.15, -0.06],
  [0, -0.22], // Sharp pointed chin
  [-0.15, -0.06],
], 0.14, 0.02);
const visorFaceMesh = new THREE.Mesh(visorFaceGeo, secondaryArmorMat);
visorFaceMesh.position.set(0, -0.04, 0.16);
helmetGroup.add(visorFaceMesh);

// Silver Forehead Crest & Temples
const helmCrestGeo = createPlate([
  [0, 0.28],
  [0.05, 0.08],
  [0.04, -0.12],
  [-0.04, -0.12],
  [-0.05, 0.08],
], 0.06, 0.015);
const helmCrestMesh = new THREE.Mesh(helmCrestGeo, silverTrimMat);
helmCrestMesh.position.set(0, 0.12, 0.20);
helmCrestMesh.rotation.x = -0.18;
helmetGroup.add(helmCrestMesh);

// PIERCING ELECTRIC-BLUE GLOWING SLIT EYES (Beneath the Visor)
const eyeSlitGeo = createEnergyLine([
  [-0.14, 0.02],
  [-0.03, -0.01],
  [0, 0.01],
  [0.03, -0.01],
  [0.14, 0.02],
  [0.12, 0.0],
  [0, -0.02],
  [-0.12, 0.0],
], 0.04);
const eyeSlitMesh = new THREE.Mesh(eyeSlitGeo, crimsonCoreMat);
eyeSlitMesh.position.set(0, 0.04, 0.25);
helmetGroup.add(eyeSlitMesh);

// Swept-Back Horned Side Accents (Aggressive Gothic Crest)
for (let isLeft of [true, false]) {
  const sign = isLeft ? -1 : 1;
  const hornGeo = createPlate([
    [0, 0],
    [sign * 0.18, 0.35],
    [sign * 0.12, 0.38],
    [0, 0.08],
  ], 0.04, 0.01);
  const hornMesh = new THREE.Mesh(hornGeo, secondaryArmorMat);
  hornMesh.position.set(sign * 0.14, 0.12, -0.05);
  hornMesh.rotation.set(-0.25, sign * 0.15, sign * -0.2);
  helmetGroup.add(hornMesh);
}

// -------------------------------------------------------------------
// 10. HELMET PLUME (CRIMSON FLOWING HAIR/PLUME STREAMING BACK)
// -------------------------------------------------------------------
const plumeGroup = new THREE.Group();
plumeGroup.name = 'CrimsonPlumeGroup';

// Multi-strand sculpted crimson plume arching up and cascading backwards
for (let i = 0; i < 5; i++) {
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.24, -0.05),
    new THREE.Vector3((i - 2) * 0.04, 0.55 + i * 0.03, -0.15),
    new THREE.Vector3((i - 2) * 0.07, 0.35, -0.45 - i * 0.06),
    new THREE.Vector3((i - 2) * 0.09, -0.05 - i * 0.08, -0.65 - i * 0.08)
  );

  const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.045 - i * 0.005, 8, false);
  const plumeMesh = new THREE.Mesh(tubeGeo, crimsonPlumeMat);
  plumeGroup.add(plumeMesh);
}

helmetGroup.add(plumeGroup);
torsoGroup.add(helmetGroup);

// -------------------------------------------------------------------
// 11. TAPERED SUPPORTING BLACK VELVET CAPE
// - Substantially reduced width (kept behind shoulders and body)
// - Reduced length (ends near lower legs/ankles, above pedestal)
// - Both arms, legs, boots, and greatsword completely visible
// - Natural vertical folds and subtle fabric movement
// -------------------------------------------------------------------
const capeWidth = 1.05;
const capeHeight = 1.75;
const capeGeo = new THREE.PlaneGeometry(capeWidth, capeHeight, 20, 24);
capeGeo.translate(0, -0.82, 0);

const cPos = capeGeo.attributes.position;
for (let i = 0; i < cPos.count; i++) {
  const y = cPos.getY(i);
  const factor = Math.max(0, -y / 1.6);
  const currentX = cPos.getX(i);
  const fold = Math.sin(currentX * 9.0) * 0.035 * (0.3 + factor * 0.7);
  const taper = 1.0 + factor * 0.20;

  cPos.setX(i, currentX * taper);
  cPos.setZ(i, -0.22 + fold - factor * 0.06);
}
capeGeo.computeVertexNormals();

const capeMesh = new THREE.Mesh(capeGeo, blackCapeMat);
capeMesh.name = 'BlackCapeMesh';
capeMesh.position.set(0, 1.05, -0.05);
torsoGroup.add(capeMesh);

characterRoot.add(torsoGroup);

// -------------------------------------------------------------------
// 12. SHADOW AURA RING / CELESTIAL ECLIPSE DISC (CRIMSON/BLACK IDENTITY)
// -------------------------------------------------------------------
const auraGroup = new THREE.Group();
auraGroup.name = 'ShadowAuraGroup';
auraGroup.position.set(0, 1.85, -0.95);

// Outer subtle crimson rim
const haloRingGeo = new THREE.RingGeometry(2.35, 2.45, 64);
const haloRingMesh = new THREE.Mesh(haloRingGeo, new THREE.MeshBasicMaterial({
  color: new THREE.Color('#4A060E'),
  transparent: true,
  opacity: 0.35,
  side: THREE.DoubleSide,
}));
auraGroup.add(haloRingMesh);

// Inner dark eclipse disc
const eclipseDiscGeo = new THREE.CircleGeometry(2.35, 48);
const eclipseDiscMesh = new THREE.Mesh(eclipseDiscGeo, new THREE.MeshBasicMaterial({
  color: new THREE.Color('#030408'),
  transparent: true,
  opacity: 0.85,
  side: THREE.DoubleSide,
}));
auraGroup.add(eclipseDiscMesh);

characterRoot.add(auraGroup);

scene.add(characterRoot);

// -------------------------------------------------------------------
// 13. EXPORT TO GLB
// -------------------------------------------------------------------
const exporter = new GLTFExporter();
exporter.parse(
  characterRoot,
  (gltf) => {
    const outputPath = path.resolve('public/models/shadow_knight.glb');
    fs.writeFileSync(outputPath, Buffer.from(gltf));
    const stats = fs.statSync(outputPath);
    console.log(`SUCCESS! Exported shadow_knight.glb (${(stats.size / 1024).toFixed(1)} KB) to: ${outputPath}`);
  },
  (error) => {
    console.error('Error exporting GLB:', error);
  },
  { binary: true }
);
