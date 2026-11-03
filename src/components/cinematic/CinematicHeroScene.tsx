import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CinematicHeroSceneProps {
  reducedMotion?: boolean;
}

/**
 * CINEMATIC SHADOW KNIGHT 3D HERO EXPERIENCE (HIGH-END REFINEMENT)
 * 
 * Features an original dark-fantasy knight guardian inspired by the presence
 * of high-tier shadow commanders (commanding stance, sculpted black & deep-crimson armor,
 * polished metallic silver filigree, glowing crimson visor slit, grand greatsword,
 * billowing velvet cape, grand gothic cathedral hall, reflective flagstone floor,
 * volumetric backlighting, and an engraved AP monogram emblem).
 */
export const CinematicHeroScene: React.FC<CinematicHeroSceneProps> = ({ reducedMotion = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLFailed, setWebGLFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect WebGL capability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLFailed(true);
        return;
      }
    } catch {
      setWebGLFailed(true);
      return;
    }

    let animationFrameId: number;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // ========================================================
    // 1. SCENE SETUP & ATMOSPHERIC FOG
    // ========================================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050508');

    // Atmospheric fog: deep charcoal & moonlight mist
    scene.fog = new THREE.FogExp2('#07080D', 0.012);

    // ========================================================
    // 2. CAMERA SETUP (DESKTOP & MOBILE ADAPTIVE)
    // ========================================================
    let baseCameraZ = 8.5;
    let baseCameraY = 1.65;
    let baseCameraX = 0;
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 300);

    const adjustCameraForViewport = (w: number, h: number) => {
      const aspect = w / h;
      camera.aspect = aspect;
      if (aspect < 0.75) {
        // Mobile portrait (320px - 430px)
        camera.fov = 52;
        baseCameraX = 0.5;
        baseCameraY = 1.95;
        baseCameraZ = 10.6;
      } else if (aspect < 1.1) {
        // Tablet (600px - 820px)
        camera.fov = 48;
        baseCameraX = 0.4;
        baseCameraY = 1.70;
        baseCameraZ = 9.2;
      } else {
        // Desktop (1024px+)
        camera.fov = 44;
        baseCameraX = 0;
        baseCameraY = 1.65;
        baseCameraZ = 8.5;
      }
      camera.position.set(baseCameraX, baseCameraY, baseCameraZ);
      camera.lookAt(0.9, 1.8, -10);
      camera.updateProjectionMatrix();
    };

    adjustCameraForViewport(width, height);

    // ========================================================
    // 3. RENDERER SETUP (ACES FILMIC & SOFT SHADOWS)
    // ========================================================
    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.55; // Crisp, readable exposure
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // ========================================================
    // 4. LIGHTING ARCHITECTURE (CINEMATIC CONTRAST & VISIBILITY)
    // ========================================================
    // 4a. Ambient Fill Light: Prevents shadow crushing
    const ambientLight = new THREE.AmbientLight('#202432', 1.8);
    scene.add(ambientLight);

    // 4b. Primary Key Directional Light: Cool silver-white key illuminating armor plates
    const keyLight = new THREE.DirectionalLight('#F0F4FA', 4.2);
    keyLight.position.set(3.8, 4.5, 4.8);
    keyLight.target.position.set(2.3, 1.8, 1.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);
    scene.add(keyLight.target);

    // 4c. Powerful Silver Rim Light: Razor-sharp silver contour behind the knight
    const rimLight = new THREE.DirectionalLight('#FFFFFF', 6.5);
    rimLight.position.set(2.3, 3.2, -1.8);
    rimLight.target.position.set(2.3, 1.8, 1.0);
    scene.add(rimLight);
    scene.add(rimLight.target);

    // 4d. Left Fill Light: Soft slate fill for the left hall
    const fillLight = new THREE.DirectionalLight('#455168', 1.8);
    fillLight.position.set(-6.0, 4.0, 4.0);
    scene.add(fillLight);

    // 4e. Cathedral Arch Volumetric Spotlight: Beaming through the distant arch
    const archSpot = new THREE.SpotLight('#CBD5E1', 4.8, 60, Math.PI / 4, 0.65, 1.2);
    archSpot.position.set(1.5, 12, -32);
    archSpot.target.position.set(1.8, 0, 0);
    archSpot.castShadow = true;
    scene.add(archSpot);
    scene.add(archSpot.target);

    // 4f. Crimson Visor Point Light: Menacing eye slit illumination
    const crimsonEyeLight = new THREE.PointLight('#FF1E38', 3.0, 3.5);
    crimsonEyeLight.position.set(2.3, 2.72, 1.28);
    scene.add(crimsonEyeLight);

    // 4g. Sword Runic Core Light
    const swordGlowLight = new THREE.PointLight('#FF2A42', 2.4, 4.0);
    swordGlowLight.position.set(2.3, 1.4, 1.45);
    scene.add(swordGlowLight);

    // ========================================================
    // 5. MATERIALS PALETTE (SHADOW KNIGHT & CATHEDRAL)
    // ========================================================
    // Obsidian Black Iron Armor (high specular reflection, clear facets)
    const armorPlateMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#141620'),
      roughness: 0.20,
      metalness: 0.95,
      envMapIntensity: 2.5,
    });

    // Dark Crimson Secondary Steel Plates
    const crimsonSteelMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#480A12'),
      roughness: 0.25,
      metalness: 0.88,
    });

    // Gleaming Silver Filigree Trim & Bevels
    const silverTrimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E8EDF5'),
      roughness: 0.12,
      metalness: 0.98,
    });

    // Self-Illuminated Crimson Visor Slit
    const crimsonGlowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF1E38'),
    });

    // Flowing Crimson Velvet Cape Material (Double-sided)
    const capeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#580A15'),
      roughness: 0.72,
      metalness: 0.28,
      side: THREE.DoubleSide,
    });

    // Greatsword Steel Blade Material
    const swordBladeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1E222D'),
      roughness: 0.15,
      metalness: 0.96,
    });

    // Cathedral Stone / Pillar Material
    const rockMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#15161F'),
      roughness: 0.80,
      metalness: 0.22,
      flatShading: true,
    });

    // Reflective Polished Obsidian Stone Floor
    const stoneFloorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#08090E'),
      roughness: 0.14,
      metalness: 0.90,
      envMapIntensity: 2.2,
    });

    // ========================================================
    // 6. GRAND MEDIEVAL CATHEDRAL ENVIRONMENT
    // ========================================================
    const environmentGroup = new THREE.Group();

    // 6a. Reflective Flagstone Floor Plane
    const waterGeo = new THREE.PlaneGeometry(160, 100, 64, 40);
    waterGeo.rotateX(-Math.PI / 2);
    const floorMesh = new THREE.Mesh(waterGeo, stoneFloorMat);
    floorMesh.position.set(0, -0.01, -12);
    floorMesh.receiveShadow = true;
    environmentGroup.add(floorMesh);

    // 6b. Flagstone Tile Grid Seams
    const tileGrid = new THREE.GridHelper(120, 40, '#242A3A', '#12141E');
    tileGrid.position.set(0, 0.005, -12);
    environmentGroup.add(tileGrid);

    // 6c. Monumental Fluted Gothic Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.85, 0.95, 18, 16);
    const pillarBaseGeo = new THREE.BoxGeometry(2.4, 0.9, 2.4);
    const pillarCapitalGeo = new THREE.BoxGeometry(2.6, 0.8, 2.6);

    const pillarPositions = [
      // Left Colonnade
      { x: -5.5, z: 4 },
      { x: -6.2, z: -4 },
      { x: -6.8, z: -12 },
      { x: -7.5, z: -20 },
      { x: -8.2, z: -28 },
      // Right Colonnade
      { x: 7.2, z: 4 },
      { x: 7.6, z: -4 },
      { x: 8.0, z: -12 },
      { x: 8.5, z: -20 },
      { x: 9.0, z: -28 },
    ];

    pillarPositions.forEach((pos, idx) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(pos.x, 9, pos.z);

      const shaft = new THREE.Mesh(pillarGeo, rockMat);
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      pGroup.add(shaft);

      const base = new THREE.Mesh(pillarBaseGeo, rockMat);
      base.position.set(0, -8.5, 0);
      base.receiveShadow = true;
      pGroup.add(base);

      const cap = new THREE.Mesh(pillarCapitalGeo, rockMat);
      cap.position.set(0, 8.6, 0);
      pGroup.add(cap);

      if (idx % 2 === 0) {
        const sconce = new THREE.PointLight('#E59844', 1.3, 10);
        sconce.position.set(pos.x > 0 ? -1.0 : 1.0, 3.2, 0);
        pGroup.add(sconce);

        const flameGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const flameMat = new THREE.MeshBasicMaterial({ color: '#FFAA33' });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.copy(sconce.position);
        pGroup.add(flame);
      }

      environmentGroup.add(pGroup);
    });

    // 6d. Grounded Left Architectural Pediment (Safely below text zone)
    const leftRock = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 3.2), rockMat);
    leftRock.position.set(-7.2, -0.75, 1.8);
    leftRock.receiveShadow = true;
    environmentGroup.add(leftRock);

    // 6e. Distant Grand Cathedral Archway
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, -36);

    const archPillarGeo = new THREE.CylinderGeometry(1.6, 1.8, 24, 20);
    const leftArchPillar = new THREE.Mesh(archPillarGeo, rockMat);
    leftArchPillar.position.set(-6.5, 12, 0);
    archGroup.add(leftArchPillar);

    const rightArchPillar = new THREE.Mesh(archPillarGeo, rockMat);
    rightArchPillar.position.set(6.5, 12, 0);
    archGroup.add(rightArchPillar);

    const archTorusGeo = new THREE.TorusGeometry(6.5, 1.6, 16, 32, Math.PI);
    const archTorus = new THREE.Mesh(archTorusGeo, rockMat);
    archTorus.position.set(0, 22, 0);
    archGroup.add(archTorus);

    const portalGeo = new THREE.PlaneGeometry(12, 24);
    const portalMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#3A455C'),
      transparent: true,
      opacity: 0.75,
    });
    const portal = new THREE.Mesh(portalGeo, portalMat);
    portal.position.set(0, 12, -0.5);
    archGroup.add(portal);

    // 6f. Central Altar Dais with Engraved AP Metallic Emblem
    const daisGeo = new THREE.CylinderGeometry(4.2, 4.6, 0.6, 32);
    const dais = new THREE.Mesh(daisGeo, rockMat);
    dais.position.set(0, 0.3, -26);
    dais.receiveShadow = true;
    archGroup.add(dais);

    // Engraved AP Monogram in the Dais Wall
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/brand/ap-transparent.png', (apTexture) => {
      apTexture.generateMipmaps = true;
      const apEmblemGeo = new THREE.PlaneGeometry(5.2, 3.32);
      const apEmblemMat = new THREE.MeshStandardMaterial({
        map: apTexture,
        transparent: true,
        roughness: 0.15,
        metalness: 0.95,
        emissive: new THREE.Color('#94A3B8'),
        emissiveIntensity: 0.35,
      });
      const apEmblem = new THREE.Mesh(apEmblemGeo, apEmblemMat);
      apEmblem.position.set(0, 4.5, -34.8);
      scene.add(apEmblem);
    });

    environmentGroup.add(archGroup);
    scene.add(environmentGroup);

    // ========================================================
    // 7. THE SHADOW KNIGHT GUARDIAN MODEL (CURVED ARTICULATED GOTHIC ARMOR)
    // ========================================================
    const figureGroup = new THREE.Group();
    figureGroup.position.set(2.3, 0, 1.0); // Center-right position leaves left zone 100% readable

    // 7a. Base Knight Dias / Ground Contact
    const knightPedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.16, 32);
    const knightPedestal = new THREE.Mesh(knightPedestalGeo, rockMat);
    knightPedestal.position.set(0, 0.08, 0);
    knightPedestal.receiveShadow = true;
    figureGroup.add(knightPedestal);

    // Pedestal Silver Ring
    const pedRingGeo = new THREE.TorusGeometry(1.6, 0.03, 8, 32);
    pedRingGeo.rotateX(Math.PI / 2);
    const pedRing = new THREE.Mesh(pedRingGeo, silverTrimMat);
    pedRing.position.set(0, 0.16, 0);
    figureGroup.add(pedRing);

    // 7b. Articulated Gothic Sabatons (Boots)
    const sabatonGeo = new THREE.BoxGeometry(0.28, 0.18, 0.58);
    sabatonGeo.translate(0, 0.09, 0.1);

    const leftSabaton = new THREE.Mesh(sabatonGeo, armorPlateMat);
    leftSabaton.position.set(-0.35, 0.16, 0);
    leftSabaton.rotation.y = 0.14;
    leftSabaton.castShadow = true;
    figureGroup.add(leftSabaton);

    const rightSabaton = new THREE.Mesh(sabatonGeo, armorPlateMat);
    rightSabaton.position.set(0.35, 0.16, 0);
    rightSabaton.rotation.y = -0.14;
    rightSabaton.castShadow = true;
    figureGroup.add(rightSabaton);

    // 7c. Greaves & Shin Armor with Silver Bevels
    const greaveGeo = new THREE.CylinderGeometry(0.18, 0.13, 0.88, 16);
    const leftGreave = new THREE.Mesh(greaveGeo, armorPlateMat);
    leftGreave.position.set(-0.35, 0.65, 0);
    leftGreave.castShadow = true;
    figureGroup.add(leftGreave);

    const rightGreave = new THREE.Mesh(greaveGeo, armorPlateMat);
    rightGreave.position.set(0.35, 0.65, 0);
    rightGreave.castShadow = true;
    figureGroup.add(rightGreave);

    // Silver Greave Trim
    const trimGreaveGeo = new THREE.TorusGeometry(0.18, 0.02, 8, 16);
    const leftGreaveTrim = new THREE.Mesh(trimGreaveGeo, silverTrimMat);
    leftGreaveTrim.rotation.x = Math.PI / 2;
    leftGreaveTrim.position.set(-0.35, 0.95, 0);
    figureGroup.add(leftGreaveTrim);

    const rightGreaveTrim = new THREE.Mesh(trimGreaveGeo, silverTrimMat);
    rightGreaveTrim.rotation.x = Math.PI / 2;
    rightGreaveTrim.position.set(0.35, 0.95, 0);
    figureGroup.add(rightGreaveTrim);

    // 7d. Poleyns (Spiked Knee Cops)
    const poleynGeo = new THREE.SphereGeometry(0.16, 16, 12);
    poleynGeo.scale(1.0, 1.2, 1.4);

    const leftPoleyn = new THREE.Mesh(poleynGeo, crimsonSteelMat);
    leftPoleyn.position.set(-0.35, 1.15, 0.12);
    figureGroup.add(leftPoleyn);

    const rightPoleyn = new THREE.Mesh(poleynGeo, crimsonSteelMat);
    rightPoleyn.position.set(0.35, 1.15, 0.12);
    figureGroup.add(rightPoleyn);

    // 7e. Cuisses (Thigh Armor)
    const cuisseGeo = new THREE.CylinderGeometry(0.24, 0.19, 0.85, 16);
    const leftCuisse = new THREE.Mesh(cuisseGeo, armorPlateMat);
    leftCuisse.position.set(-0.32, 1.6, 0);
    leftCuisse.castShadow = true;
    figureGroup.add(leftCuisse);

    const rightCuisse = new THREE.Mesh(cuisseGeo, armorPlateMat);
    rightCuisse.position.set(0.32, 1.6, 0);
    rightCuisse.castShadow = true;
    figureGroup.add(rightCuisse);

    // 7f. Faulds & Tassets (Layered Hip & Thigh Guards)
    const tassetGeo = new THREE.BoxGeometry(0.32, 0.45, 0.06);
    const leftTasset = new THREE.Mesh(tassetGeo, crimsonSteelMat);
    leftTasset.position.set(-0.44, 1.95, 0.14);
    leftTasset.rotation.set(0.12, -0.18, 0.12);
    figureGroup.add(leftTasset);

    const rightTasset = new THREE.Mesh(tassetGeo, crimsonSteelMat);
    rightTasset.position.set(0.44, 1.95, 0.14);
    rightTasset.rotation.set(0.12, 0.18, -0.12);
    figureGroup.add(rightTasset);

    // Belt Buckle / Center Inset
    const beltBuckleGeo = new THREE.OctahedronGeometry(0.15, 0);
    const beltBuckle = new THREE.Mesh(beltBuckleGeo, silverTrimMat);
    beltBuckle.position.set(0, 2.05, 0.25);
    figureGroup.add(beltBuckle);

    // 7g. Articulated Breastplate & Torso Group (Breathing Animation Anchor)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 2.0, 0);

    // Segmented Abdomen Cuirass
    const abdomenGeo = new THREE.CylinderGeometry(0.42, 0.38, 0.52, 20);
    abdomenGeo.scale(1.15, 1.0, 0.84);
    const abdomen = new THREE.Mesh(abdomenGeo, armorPlateMat);
    abdomen.position.set(0, 0.3, 0);
    abdomen.castShadow = true;
    torsoGroup.add(abdomen);

    // Upper Muscled Gothic Cuirass (Chestplate with anatomical curves)
    const chestGeo = new THREE.SphereGeometry(0.55, 24, 18);
    chestGeo.scale(1.0, 0.85, 0.75);
    const chest = new THREE.Mesh(chestGeo, armorPlateMat);
    chest.position.set(0, 0.80, 0.06);
    chest.castShadow = true;
    torsoGroup.add(chest);

    // Center Ridge / Fluting (Silver spine line)
    const ridgeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8);
    const ridge = new THREE.Mesh(ridgeGeo, silverTrimMat);
    ridge.position.set(0, 0.80, 0.44);
    torsoGroup.add(ridge);

    // Crimson Inset Pectoral Plates
    const pecGeo = new THREE.BoxGeometry(0.28, 0.28, 0.05);
    const leftPec = new THREE.Mesh(pecGeo, crimsonSteelMat);
    leftPec.position.set(-0.22, 0.85, 0.40);
    leftPec.rotation.set(0, -0.22, 0.05);
    torsoGroup.add(leftPec);

    const rightPec = new THREE.Mesh(pecGeo, crimsonSteelMat);
    rightPec.position.set(0.22, 0.85, 0.40);
    rightPec.rotation.set(0, 0.22, -0.05);
    torsoGroup.add(rightPec);

    // Gorget (Armored Neck Collar)
    const gorgetGeo = new THREE.CylinderGeometry(0.26, 0.35, 0.26, 16);
    const gorget = new THREE.Mesh(gorgetGeo, silverTrimMat);
    gorget.position.set(0, 1.22, 0.04);
    torsoGroup.add(gorget);

    // 7h. Grand Flared Gothic Pauldrons (Shoulder Armor with Silver Bevels)
    const pauldronGeo = new THREE.SphereGeometry(0.38, 16, 12, 0, Math.PI);
    pauldronGeo.scale(1.2, 0.9, 0.9);

    const leftPauldron = new THREE.Mesh(pauldronGeo, armorPlateMat);
    leftPauldron.position.set(-0.66, 1.15, 0);
    leftPauldron.rotation.set(0.2, 0, -Math.PI / 2.3);
    leftPauldron.castShadow = true;
    torsoGroup.add(leftPauldron);

    const leftPauldronRim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.025, 8, 16, Math.PI), silverTrimMat);
    leftPauldronRim.position.copy(leftPauldron.position);
    leftPauldronRim.rotation.copy(leftPauldron.rotation);
    torsoGroup.add(leftPauldronRim);

    const rightPauldron = new THREE.Mesh(pauldronGeo, armorPlateMat);
    rightPauldron.position.set(0.66, 1.15, 0);
    rightPauldron.rotation.set(0.2, 0, Math.PI / 2.3);
    rightPauldron.castShadow = true;
    torsoGroup.add(rightPauldron);

    const rightPauldronRim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.025, 8, 16, Math.PI), silverTrimMat);
    rightPauldronRim.position.copy(rightPauldron.position);
    rightPauldronRim.rotation.copy(rightPauldron.rotation);
    torsoGroup.add(rightPauldronRim);

    // 7i. Articulated Arms, Vambraces & Gauntlets Gripping the Greatsword
    const armGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.65, 12);

    // Left Arm holding sword hilt
    const leftArm = new THREE.Mesh(armGeo, armorPlateMat);
    leftArm.position.set(-0.54, 0.75, 0.22);
    leftArm.rotation.set(0.55, 0.22, -0.32);
    torsoGroup.add(leftArm);

    const leftForearm = new THREE.Mesh(armGeo, crimsonSteelMat);
    leftForearm.position.set(-0.38, 0.32, 0.48);
    leftForearm.rotation.set(0.95, -0.28, 0.18);
    torsoGroup.add(leftForearm);

    // Right Arm holding sword hilt
    const rightArm = new THREE.Mesh(armGeo, armorPlateMat);
    rightArm.position.set(0.54, 0.75, 0.22);
    rightArm.rotation.set(0.55, -0.22, 0.32);
    torsoGroup.add(rightArm);

    const rightForearm = new THREE.Mesh(armGeo, crimsonSteelMat);
    rightForearm.position.set(0.38, 0.32, 0.48);
    rightForearm.rotation.set(0.95, 0.28, -0.18);
    torsoGroup.add(rightForearm);

    // Gauntlets (Armored Hands meeting at the sword grip)
    const gauntletGeo = new THREE.BoxGeometry(0.16, 0.16, 0.22);
    const leftGauntlet = new THREE.Mesh(gauntletGeo, silverTrimMat);
    leftGauntlet.position.set(-0.10, 0.26, 0.64);
    leftGauntlet.rotation.set(0.35, 0.2, -0.15);
    torsoGroup.add(leftGauntlet);

    const rightGauntlet = new THREE.Mesh(gauntletGeo, silverTrimMat);
    rightGauntlet.position.set(0.10, 0.38, 0.64);
    rightGauntlet.rotation.set(0.35, -0.2, 0.15);
    torsoGroup.add(rightGauntlet);

    // 7j. Imposing Gothic Knight Helm (Sleek curved helmet with glowing visor)
    const helmetGroup = new THREE.Group();
    helmetGroup.position.set(0, 1.45, 0.05);

    // Curved Helm Dome
    const helmDomeGeo = new THREE.SphereGeometry(0.27, 24, 20);
    helmDomeGeo.scale(0.85, 1.15, 1.0);
    const helmDome = new THREE.Mesh(helmDomeGeo, armorPlateMat);
    helmDome.castShadow = true;
    helmetGroup.add(helmDome);

    // Silver Crown Fin / Crest
    const finGeo = new THREE.BoxGeometry(0.04, 0.55, 0.45);
    const helmFin = new THREE.Mesh(finGeo, silverTrimMat);
    helmFin.position.set(0, 0.30, -0.05);
    helmFin.rotation.x = -0.35;
    helmetGroup.add(helmFin);

    // Swept-Back Horn Accents (Winged Crest)
    const hornGeo = new THREE.ConeGeometry(0.07, 0.75, 8);
    const leftHorn = new THREE.Mesh(hornGeo, crimsonSteelMat);
    leftHorn.position.set(-0.28, 0.35, -0.12);
    leftHorn.rotation.set(-0.45, 0.15, -0.55);
    helmetGroup.add(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeo, crimsonSteelMat);
    rightHorn.position.set(0.28, 0.35, -0.12);
    rightHorn.rotation.set(-0.45, -0.15, 0.55);
    helmetGroup.add(rightHorn);

    // Curved Gothic Visor Mask
    const visorMaskGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.32, 16, 1, false, 0, Math.PI);
    const visorMask = new THREE.Mesh(visorMaskGeo, armorPlateMat);
    visorMask.position.set(0, -0.04, 0.10);
    visorMask.rotation.y = Math.PI / 2;
    helmetGroup.add(visorMask);

    // Luminous Crimson Eye Visor Slit
    const visorSlitGeo = new THREE.BoxGeometry(0.30, 0.035, 0.06);
    const visorSlit = new THREE.Mesh(visorSlitGeo, crimsonGlowMat);
    visorSlit.position.set(0, 0.02, 0.28);
    helmetGroup.add(visorSlit);

    torsoGroup.add(helmetGroup);
    figureGroup.add(torsoGroup);

    // 7k. Monumental Medieval Greatsword (Planted Firmly Point-Down in Front)
    const swordGroup = new THREE.Group();
    swordGroup.position.set(0, 0.16, 0.65);

    // Double-Edged Blade (1.75m long)
    const bladeGeo = new THREE.BoxGeometry(0.16, 1.65, 0.035);
    const blade = new THREE.Mesh(bladeGeo, swordBladeMat);
    blade.position.set(0, 0.82, 0);
    blade.castShadow = true;
    swordGroup.add(blade);

    // Tapered Point (Tip resting on pedestal)
    const tipGeo = new THREE.ConeGeometry(0.08, 0.22, 4);
    tipGeo.rotateY(Math.PI / 4);
    const tip = new THREE.Mesh(tipGeo, swordBladeMat);
    tip.position.set(0, 0.05, 0);
    swordGroup.add(tip);

    // Glowing Crimson Runic Core Line
    const fullerGeo = new THREE.BoxGeometry(0.035, 1.45, 0.045);
    const fuller = new THREE.Mesh(fullerGeo, crimsonGlowMat);
    fuller.position.set(0, 0.90, 0);
    swordGroup.add(fuller);

    // Intricate Silver Crossguard
    const crossguardGeo = new THREE.BoxGeometry(0.74, 0.07, 0.11);
    const crossguard = new THREE.Mesh(crossguardGeo, silverTrimMat);
    crossguard.position.set(0, 1.68, 0);
    swordGroup.add(crossguard);

    // Hilt / Wire-Wrapped Grip
    const hiltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12);
    const hilt = new THREE.Mesh(hiltGeo, crimsonSteelMat);
    hilt.position.set(0, 1.94, 0);
    swordGroup.add(hilt);

    // Faceted Silver Pommel
    const pommelGeo = new THREE.OctahedronGeometry(0.075, 0);
    const pommel = new THREE.Mesh(pommelGeo, silverTrimMat);
    pommel.position.set(0, 2.20, 0);
    swordGroup.add(pommel);

    figureGroup.add(swordGroup);

    // 7l. Flowing Crimson Velvet Cape (Dynamic Vertex Simulation)
    const capeGeo = new THREE.PlaneGeometry(1.55, 2.40, 24, 24);
    const capePos = capeGeo.attributes.position;
    const initialCapeZ = new Float32Array(capePos.count);
    const initialCapeX = new Float32Array(capePos.count);

    for (let i = 0; i < capePos.count; i++) {
      initialCapeZ[i] = capePos.getZ(i);
      initialCapeX[i] = capePos.getX(i);
    }

    const cape = new THREE.Mesh(capeGeo, capeMat);
    cape.position.set(0, 1.42, -0.22);
    cape.castShadow = true;
    figureGroup.add(cape);

    scene.add(figureGroup);

    // ========================================================
    // 8. VOLUMETRIC ATMOSPHERIC PARTICLES & RISING EMBERS
    // ========================================================
    const emberCount = 40;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberSpeeds = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 16;
      emberPositions[i * 3 + 1] = Math.random() * 8;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      emberSpeeds[i] = 0.2 + Math.random() * 0.4;
    }

    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

    const emberMat = new THREE.PointsMaterial({
      color: new THREE.Color('#FF4D4D'),
      size: 0.075,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // ========================================================
    // 9. MOUSE PARALLAX & CINEMATIC TRACKING
    // ========================================================
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (reducedMotion) return;
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetParallaxX = normX * 0.40;
      targetParallaxY = normY * 0.22;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      adjustCameraForViewport(width, height);
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // ========================================================
    // 10. ANIMATION LOOP (NATURAL IDLE BREATHING, CAPE & EMBERS)
    // ========================================================
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!reducedMotion) {
        // Natural Knight Idle Breathing
        const breath = Math.sin(elapsedTime * 1.5) * 0.012;
        torsoGroup.position.y = 2.0 + breath;
        helmetGroup.rotation.y = Math.sin(elapsedTime * 0.7) * 0.035;

        // Visor & Sword Core Luminous Pulse
        const glowPulse = 2.6 + Math.sin(elapsedTime * 3.0) * 0.5;
        crimsonEyeLight.intensity = glowPulse;
        swordGlowLight.intensity = 2.0 + Math.sin(elapsedTime * 2.6) * 0.4;

        // Flowing Velvet Cape Wave Simulation
        const cPos = capeGeo.attributes.position;
        for (let i = 0; i < cPos.count; i++) {
          const y = cPos.getY(i);
          const factor = Math.max(0, -y);
          const waveZ = Math.sin(y * 1.8 + elapsedTime * 2.2) * 0.07 * factor;
          const waveX = Math.cos(y * 1.5 + elapsedTime * 1.8) * 0.035 * factor;
          cPos.setZ(i, initialCapeZ[i] + waveZ);
          cPos.setX(i, initialCapeX[i] + waveX);
        }
        capeGeo.computeVertexNormals();
        cPos.needsUpdate = true;

        // Rising Atmospheric Embers
        const ePos = emberGeo.attributes.position;
        for (let i = 0; i < emberCount; i++) {
          let ey = ePos.getY(i);
          ey += emberSpeeds[i] * 0.018;
          if (ey > 8.0) ey = 0.1;
          ePos.setY(i, ey);
        }
        ePos.needsUpdate = true;

        // Smooth Cinematic Parallax
        currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
        currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;

        camera.position.x = baseCameraX + currentParallaxX;
        camera.position.y = baseCameraY + currentParallaxY;
        camera.position.z = baseCameraZ;
        camera.lookAt(0.9 + currentParallaxX * 0.2, 1.8 + currentParallaxY * 0.1, -10);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      waterGeo.dispose();
      pillarGeo.dispose();
      pillarBaseGeo.dispose();
      pillarCapitalGeo.dispose();
      archPillarGeo.dispose();
      archTorusGeo.dispose();
      daisGeo.dispose();
      pedRingGeo.dispose();
      sabatonGeo.translate(0, 0, 0);
      sabatonGeo.dispose();
      greaveGeo.dispose();
      trimGreaveGeo.dispose();
      poleynGeo.dispose();
      cuisseGeo.dispose();
      tassetGeo.dispose();
      beltBuckleGeo.dispose();
      abdomenGeo.dispose();
      chestGeo.dispose();
      ridgeGeo.dispose();
      pecGeo.dispose();
      gorgetGeo.dispose();
      pauldronGeo.dispose();
      armGeo.dispose();
      gauntletGeo.dispose();
      helmDomeGeo.dispose();
      finGeo.dispose();
      hornGeo.dispose();
      visorMaskGeo.dispose();
      visorSlitGeo.dispose();
      bladeGeo.dispose();
      tipGeo.dispose();
      fullerGeo.dispose();
      crossguardGeo.dispose();
      hiltGeo.dispose();
      pommelGeo.dispose();
      capeGeo.dispose();
      emberGeo.dispose();

      armorPlateMat.dispose();
      crimsonSteelMat.dispose();
      silverTrimMat.dispose();
      crimsonGlowMat.dispose();
      capeMat.dispose();
      swordBladeMat.dispose();
      rockMat.dispose();
      stoneFloorMat.dispose();
      portalMat.dispose();
      emberMat.dispose();
    };
  }, [reducedMotion]);

  if (webGLFailed) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'linear-gradient(180deg, #040406 0%, #12131C 50%, #040406 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '22%',
            width: '32px',
            height: '85px',
            backgroundColor: '#161822',
            borderRadius: '16px 16px 0 0',
            opacity: 0.9,
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
};
