import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CinematicHeroSceneProps {
  reducedMotion?: boolean;
}

/**
 * CINEMATIC SHADOW KNIGHT 3D HERO EXPERIENCE (RED-AND-BLACK IDENTITY RESTORATION)
 *
 * Implements a high-end luxury dark fantasy armored warrior:
 * - Imposing, athletic silhouette in obsidian black & dark metallic silver plate armor
 * - Multi-tiered flared angular gothic pauldrons with polished silver trim
 * - Segmented chevron cuirass with restrained crimson energy seams
 * - Piercing crimson slit eyes beneath an aggressive visor
 * - Flowing crimson/red helmet plume streaming backward
 * - TAPERED, SUPPORTING BLACK FABRIC CAPE kept behind the shoulders & body (arms, legs & sword visible)
 * - Monumental greatsword in dark obsidian steel with subtle crimson fuller line
 * - Reflective dark flagstone floor with subtle ambient crimson reflections
 * - Dramatic celestial overhead spotlight and razor-sharp silver rim lighting
 * - Unobstructed left hero composition preserving AP monogram, AYUSH PRAKASH text, and intro
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

    // Disposables registry for comprehensive WebGL cleanup
    const disposables: { dispose: () => void }[] = [];
    const trackDisposable = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // ========================================================
    // 1. SCENE SETUP & INFERNAL VOLCANIC ATMOSPHERE
    // ========================================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#060407');

    // Volcanic atmospheric mist: deep charcoal & infernal crimson haze
    scene.fog = new THREE.FogExp2('#080407', 0.015);

    // ========================================================
    // 2. CAMERA SETUP (DESKTOP, TABLET & MOBILE ADAPTIVE)
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
        baseCameraX = 1.1;
        baseCameraY = 1.95;
        baseCameraZ = 10.6;
      } else if (aspect < 1.1) {
        // Tablet (600px - 820px)
        camera.fov = 48;
        baseCameraX = 0.5;
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
      camera.lookAt(baseCameraX * 0.4 + 0.9, 1.8, -10);
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
    renderer.toneMappingExposure = 1.55;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // ========================================================
    // 4. LIGHTING ARCHITECTURE (RESTORING RED-AND-BLACK IDENTITY)
    // ========================================================
    // 4a. Ambient Fill Light: Deep charcoal/crimson to prevent shadow crushing
    const ambientLight = new THREE.AmbientLight('#121016', 1.6);
    scene.add(ambientLight);

    // 4b. Primary Key Directional Light: Cool silver-white key illuminating armor plates
    const keyLight = new THREE.DirectionalLight('#F0F4FA', 4.2);
    keyLight.position.set(4.2, 5.0, 4.5);
    keyLight.target.position.set(2.4, 1.8, 0.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);
    scene.add(keyLight.target);

    // 4c. Powerful Silver Rim Light: Razor-sharp silver contour behind the warrior
    const rimLight = new THREE.DirectionalLight('#FFFFFF', 6.8);
    rimLight.position.set(2.4, 3.5, -2.2);
    rimLight.target.position.set(2.4, 1.8, 0.8);
    scene.add(rimLight);
    scene.add(rimLight.target);

    // 4d. Overhead Celestial Spotlight: Neutral moonlight silver beam from above
    const overheadSpot = new THREE.SpotLight('#E8EEF8', 5.5, 45, Math.PI / 4.5, 0.7, 1.1);
    overheadSpot.position.set(2.4, 11.5, 0.8);
    overheadSpot.target.position.set(2.4, 1.6, 0.8);
    overheadSpot.castShadow = true;
    scene.add(overheadSpot);
    scene.add(overheadSpot.target);

    // 4e. Left Fill Light: Soft slate fill for the left horizon
    const fillLight = new THREE.DirectionalLight('#2A2028', 1.2);
    fillLight.position.set(-6.0, 4.0, 4.0);
    scene.add(fillLight);

    // 4f. Volumetric Distant Crimson Horizon Light
    const horizonSpot = new THREE.SpotLight('#9E1B2D', 3.2, 70, Math.PI / 3.5, 0.7, 1.3);
    horizonSpot.position.set(0, 16, -42);
    horizonSpot.target.position.set(0, 0, -20);
    scene.add(horizonSpot);
    scene.add(horizonSpot.target);

    // 4g. WARM LAVA BOUNCE LIGHT FROM BELOW (Under knight platform, boots, greaves, underside of greatsword)
    const lavaBounceLight = new THREE.PointLight('#FF3812', 1.4, 6.2, 1.8);
    lavaBounceLight.position.set(2.4, -0.3, 1.2);
    scene.add(lavaBounceLight);

    // 4h. DISTANT MOLTEN LAVA POOL ILLUMINATION
    const lavaPoolLight1 = new THREE.PointLight('#FF2800', 2.8, 32, 1.6);
    lavaPoolLight1.position.set(8.5, 0.8, -26);
    scene.add(lavaPoolLight1);

    const lavaPoolLight2 = new THREE.PointLight('#D61E00', 2.2, 40, 1.5);
    lavaPoolLight2.position.set(-14.0, 0.8, -40);
    scene.add(lavaPoolLight2);

    // 4i. RESTRAINED CRIMSON RIM LIGHT (Cinematic silhouette contour on knight's shoulders & cape)
    const crimsonRimLight = new THREE.DirectionalLight('#B31224', 3.2);
    crimsonRimLight.position.set(2.0, 3.4, -2.8);
    crimsonRimLight.target.position.set(2.4, 1.8, 0.8);
    scene.add(crimsonRimLight);
    scene.add(crimsonRimLight.target);

    // 4j. RESTRAINED CRIMSON SWORD LIGHT: Subtle warm crimson accent near blade and hilt
    const swordGlowLight = new THREE.PointLight('#FF2A42', 2.2, 3.8, 1.8);
    swordGlowLight.position.set(1.85, 0.85, 1.35);
    scene.add(swordGlowLight);

    // 4k. RESTRAINED CRIMSON CHEST CORE LIGHT
    const chestCoreLight = new THREE.PointLight('#FF1E38', 1.8, 2.5, 2.0);
    chestCoreLight.position.set(2.4, 2.85, 1.35);
    scene.add(chestCoreLight);

    // 4l. PIERCING CRIMSON VISOR SLIT LIGHT
    const visorEyeLight = new THREE.PointLight('#FF1E38', 2.2, 2.2, 2.0);
    visorEyeLight.position.set(2.4, 3.42, 1.35);
    scene.add(visorEyeLight);

    // 4m. FRONT METALLIC ARMOR KEY LIGHT: Illuminating chevron cuirass facets & silver bevels
    const armorKeyLight = new THREE.DirectionalLight('#D8E2F0', 2.5);
    armorKeyLight.position.set(2.4, 2.6, 4.5);
    armorKeyLight.target.position.set(2.4, 1.8, 0.8);
    scene.add(armorKeyLight);
    scene.add(armorKeyLight.target);

    // 4n. RADIANT HELMET PLUME TOP LIGHT
    const plumeLight = new THREE.PointLight('#FF1E42', 2.8, 3.5, 1.5);
    plumeLight.position.set(2.4, 3.8, 0.6);
    scene.add(plumeLight);

    // ========================================================
    // 5. MATERIALS PALETTE (BLACK LUXURY, POLISHED SILVER & CRIMSON)
    // ========================================================
    // Obsidian Black Iron Armor (high specular reflection, clear facets)
    const armorPlateMat = trackDisposable(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0D111A'),
        roughness: 0.18,
        metalness: 0.94,
        envMapIntensity: 2.5,
      })
    );

    // Secondary Midnight Steel Plates
    const secondaryArmorMat = trackDisposable(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#161C28'),
        roughness: 0.22,
        metalness: 0.90,
      })
    );

    // Gleaming Silver Filigree Trim & Bevels
    const silverTrimMat = trackDisposable(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#D8E2F0'),
        roughness: 0.12,
        metalness: 0.98,
      })
    );

    // Restrained Crimson Energy Channels (Replacing electric blue)
    const crimsonEnergyMat = trackDisposable(
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#D31027'),
      })
    );

    // Concentrated Crimson Visor & Core Glow
    const crimsonCoreMat = trackDisposable(
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#FF2442'),
      })
    );

    // Greatsword Dark Obsidian Steel Blade Material
    const swordBladeMat = trackDisposable(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#141720'),
        roughness: 0.16,
        metalness: 0.94,
        envMapIntensity: 2.2,
      })
    );

    // Radiant Crimson Velvet / Flame Helmet Plume Material
    const crimsonPlumeMat = trackDisposable(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FF0033'),
        emissive: new THREE.Color('#A8001E'),
        emissiveIntensity: 1.25,
        roughness: 0.40,
        metalness: 0.18,
        side: THREE.DoubleSide,
      })
    );

    // Flowing Black Velvet Cape Material (Double-sided)
    const blackCapeMat = trackDisposable(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#08090E'),
        roughness: 0.85,
        metalness: 0.15,
        side: THREE.DoubleSide,
      })
    );

    // Volcanic Basalt Stone & Spire Material
    const rockMat = trackDisposable(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0A0C12'),
        roughness: 0.72,
        metalness: 0.40,
      })
    );

    // Volcanic Battlefield Ground Material
    const volcanicGroundMat = trackDisposable(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#07080B'),
        roughness: 0.84,
        metalness: 0.28,
      })
    );

    // Glowing Molten Lava Fissure Material
    const moltenLavaMat = trackDisposable(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#E63914'),
        emissive: new THREE.Color('#FF2600'),
        emissiveIntensity: 2.8,
        roughness: 0.35,
        metalness: 0.15,
      })
    );

    // Distant Volcanic Mountains Silhouette Material
    const mountainMat = trackDisposable(
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#050508'),
      })
    );

    // Helpers for beveled polygon plates
    const createPlateGeo = (points: [number, number][], depth = 0.04, bevel = 0.015) => {
      const shape = new THREE.Shape();
      shape.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i][0], points[i][1]);
      }
      shape.closePath();
      return trackDisposable(
        new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelThickness: bevel,
          bevelSize: bevel,
          bevelSegments: 2,
        })
      );
    };

    const createEnergyLineGeo = (points: [number, number][], depth = 0.02) => {
      const shape = new THREE.Shape();
      shape.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i][0], points[i][1]);
      }
      shape.closePath();
      return trackDisposable(
        new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: false,
        })
      );
    };

    // ========================================================
    // 6. CINEMATIC INFERNAL VOLCANIC BATTLEFIELD ENVIRONMENT
    // ========================================================
    const environmentGroup = new THREE.Group();

    // 6a. Vast Volcanic Battlefield Ground Plane
    const waterGeo = trackDisposable(new THREE.PlaneGeometry(120, 140, 24, 24));
    waterGeo.rotateX(-Math.PI / 2);
    const terrainMesh = new THREE.Mesh(waterGeo, volcanicGroundMat);
    terrainMesh.position.set(0, -0.01, -22);
    terrainMesh.receiveShadow = true;
    environmentGroup.add(terrainMesh);

    // 6b. Glowing Molten Lava Fissures (Snaking Magma Veins Across Battlefield)
    const createLavaFissure = (pts: [number, number][], width = 0.24) => {
      const curvePts = pts.map(([x, z]) => new THREE.Vector3(x, 0.02, z));
      const curve = new THREE.CatmullRomCurve3(curvePts);
      const tubeGeo = trackDisposable(new THREE.TubeGeometry(curve, 36, width, 6, false));
      return new THREE.Mesh(tubeGeo, moltenLavaMat);
    };

    const fissure1 = createLavaFissure([
      [-16, -46],
      [-10, -34],
      [-2, -24],
      [6, -16],
      [14, -8],
    ], 0.26);
    environmentGroup.add(fissure1);

    const fissure2 = createLavaFissure([
      [4, -50],
      [8, -38],
      [2, -28],
      [-6, -18],
    ], 0.20);
    environmentGroup.add(fissure2);

    const fissure3 = createLavaFissure([
      [-26, -32],
      [-18, -22],
      [-12, -14],
    ], 0.18);
    environmentGroup.add(fissure3);

    // Distant Molten Lava Pools
    const lavaPoolGeo1 = trackDisposable(new THREE.CircleGeometry(5.2, 28));
    lavaPoolGeo1.rotateX(-Math.PI / 2);
    const lavaPool1 = new THREE.Mesh(lavaPoolGeo1, moltenLavaMat);
    lavaPool1.position.set(8.5, 0.025, -26);
    environmentGroup.add(lavaPool1);

    const lavaPoolGeo2 = trackDisposable(new THREE.CircleGeometry(6.8, 32));
    lavaPoolGeo2.rotateX(-Math.PI / 2);
    const lavaPool2 = new THREE.Mesh(lavaPoolGeo2, moltenLavaMat);
    lavaPool2.position.set(-14.0, 0.025, -40);
    environmentGroup.add(lavaPool2);

    // 6c. Black Volcanic Basalt Columns & Crags (Replacing Greek Colonnade)
    const spires = [
      { x: -11.5, z: -4, h: 14, r: 1.4 },
      { x: -14.2, z: -14, h: 22, r: 1.9 },
      { x: -10.8, z: -22, h: 17, r: 1.6 },
      { x: -16.5, z: -32, h: 26, r: 2.2 },
      { x: -9.2, z: -38, h: 18, r: 1.5 },
      { x: 10.5, z: -6, h: 13, r: 1.3 },
      { x: 13.8, z: -16, h: 23, r: 1.9 },
      { x: 11.4, z: -26, h: 18, r: 1.6 },
      { x: 15.8, z: -36, h: 25, r: 2.1 },
    ];

    spires.forEach((spire, idx) => {
      const spireGeo = trackDisposable(new THREE.CylinderGeometry(spire.r * 0.72, spire.r, spire.h, 5));
      const spireMesh = new THREE.Mesh(spireGeo, rockMat);
      spireMesh.position.set(spire.x, spire.h / 2 - 0.4, spire.z);
      spireMesh.rotation.y = idx * 0.75;
      spireMesh.rotation.z = (idx % 2 === 0 ? 1 : -1) * 0.035;
      spireMesh.castShadow = true;
      spireMesh.receiveShadow = true;
      environmentGroup.add(spireMesh);
    });

    // 6d. Foreground Left Rock Grounded Below Hero Text Zone (Preserving acceptance test 21)
    const leftRockGeo = trackDisposable(new THREE.BoxGeometry(3.6, 0.8, 3.2));
    const leftRock = new THREE.Mesh(leftRockGeo, rockMat);
    leftRock.position.set(-7.2, -0.75, 1.8);
    leftRock.receiveShadow = true;
    environmentGroup.add(leftRock);

    // 6e. Distant Jagged Volcanic Mountain Silhouette on Horizon (z = -55 to -75)
    const mountains = [
      { x: -34, z: -65, h: 28, r: 18 },
      { x: -16, z: -58, h: 24, r: 15 },
      { x: 2, z: -70, h: 34, r: 22 },
      { x: 22, z: -62, h: 26, r: 17 },
      { x: 38, z: -72, h: 30, r: 20 },
    ];

    mountains.forEach((m, idx) => {
      const mGeo = trackDisposable(new THREE.ConeGeometry(m.r, m.h, 5));
      const mMesh = new THREE.Mesh(mGeo, mountainMat);
      mMesh.position.set(m.x, m.h / 2 - 2, m.z);
      mMesh.rotation.y = idx * 1.1;
      environmentGroup.add(mMesh);
    });

    // 6f. Distant Ancient Obsidian Monolith (Bearing the subtle AP Brand Monogram)
    const obeliskGeo = trackDisposable(new THREE.BoxGeometry(3.2, 18, 3.2));
    const obeliskMesh = new THREE.Mesh(obeliskGeo, rockMat);
    obeliskMesh.position.set(0, 8.5, -36);
    obeliskMesh.rotation.y = 0.25;
    obeliskMesh.rotation.z = -0.05;
    environmentGroup.add(obeliskMesh);

    // Engraved AP Monogram in the Distant Obsidian Monolith
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/brand/ap-transparent.png', (apTexture) => {
      apTexture.generateMipmaps = true;
      const apEmblemGeo = trackDisposable(new THREE.PlaneGeometry(4.8, 3.06));
      const apEmblemMat = trackDisposable(
        new THREE.MeshStandardMaterial({
          map: apTexture,
          transparent: true,
          roughness: 0.18,
          metalness: 0.95,
          emissive: new THREE.Color('#94A3B8'),
          emissiveIntensity: 0.35,
        })
      );
      const apEmblem = new THREE.Mesh(apEmblemGeo, apEmblemMat);
      apEmblem.position.set(0, 6.2, -34.3);
      apEmblem.rotation.y = 0.25;
      apEmblem.rotation.z = -0.05;
      scene.add(apEmblem);
    });

    scene.add(environmentGroup);

    // ========================================================
    // 7. THE SHADOW KNIGHT GUARDIAN MODEL (HIGH-FIDELITY REBUILD)
    // ========================================================
    const figureGroup = new THREE.Group();
    figureGroup.position.set(2.4, 0, 0.8); // Center-right position leaves left zone 100% readable

    // 7a. Base Knight Dais / Ground Contact with Engraved Crimson Runic Ring
    const pedestalGeo = trackDisposable(new THREE.CylinderGeometry(1.65, 1.85, 0.16, 36));
    const pedestalMesh = new THREE.Mesh(pedestalGeo, rockMat);
    pedestalMesh.position.set(0, 0.08, 0);
    pedestalMesh.receiveShadow = true;
    figureGroup.add(pedestalMesh);

    const runeRingGeo = trackDisposable(new THREE.RingGeometry(1.35, 1.45, 48));
    runeRingGeo.rotateX(-Math.PI / 2);
    const runeRingMesh = new THREE.Mesh(
      runeRingGeo,
      trackDisposable(
        new THREE.MeshBasicMaterial({
          color: new THREE.Color('#8B0014'),
          transparent: true,
          opacity: 0.75,
        })
      )
    );
    runeRingMesh.position.set(0, 0.162, 0);
    figureGroup.add(runeRingMesh);

    const rimTorusGeo = trackDisposable(new THREE.TorusGeometry(1.65, 0.025, 8, 36));
    rimTorusGeo.rotateX(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimTorusGeo, silverTrimMat);
    rimMesh.position.set(0, 0.16, 0);
    figureGroup.add(rimMesh);

    // 7b. Legs & Gothic Sabatons (Boots)
    const legsGroup = new THREE.Group();

    // Sabatons
    const createSabatonMesh = () => {
      const g = new THREE.Group();
      const soleGeo = createPlateGeo([
        [-0.12, -0.22],
        [0.12, -0.22],
        [0.10, 0.18],
        [0.0, 0.32],
        [-0.10, 0.18],
      ], 0.08, 0.015);
      soleGeo.rotateX(Math.PI / 2);
      const sMesh = new THREE.Mesh(soleGeo, armorPlateMat);
      sMesh.position.set(0, 0.04, 0.02);
      sMesh.castShadow = true;
      g.add(sMesh);

      const instepGeo = createPlateGeo([
        [-0.10, -0.05],
        [0.10, -0.05],
        [0.08, 0.16],
        [0.0, 0.24],
        [-0.08, 0.16],
      ], 0.07, 0.012);
      instepGeo.rotateX(Math.PI / 2.3);
      const iMesh = new THREE.Mesh(instepGeo, secondaryArmorMat);
      iMesh.position.set(0, 0.08, 0.06);
      g.add(iMesh);

      const stripGeo = createEnergyLineGeo([
        [-0.11, -0.01],
        [0.11, -0.01],
        [0.09, 0.28],
        [0.0, 0.33],
        [-0.09, 0.28],
      ], 0.015);
      stripGeo.rotateX(Math.PI / 2);
      const stripMesh = new THREE.Mesh(stripGeo, crimsonEnergyMat);
      stripMesh.position.set(0, 0.02, 0.03);
      g.add(stripMesh);

      return g;
    };

    const leftSabaton = createSabatonMesh();
    leftSabaton.position.set(-0.36, 0.16, 0.05);
    leftSabaton.rotation.y = 0.18;
    legsGroup.add(leftSabaton);

    const rightSabaton = createSabatonMesh();
    rightSabaton.position.set(0.36, 0.16, -0.05);
    rightSabaton.rotation.y = -0.15;
    legsGroup.add(rightSabaton);

    // Greaves (Gothic Shin Plates with 3 Chevron Crimson Energy Lines)
    const createGreaveMesh = () => {
      const g = new THREE.Group();
      const shinGeo = trackDisposable(new THREE.CylinderGeometry(0.14, 0.11, 0.72, 16));
      const sMesh = new THREE.Mesh(shinGeo, armorPlateMat);
      sMesh.position.set(0, 0.36, 0);
      sMesh.castShadow = true;
      g.add(sMesh);

      for (let i = 0; i < 3; i++) {
        const yPos = 0.18 + i * 0.20;
        const scale = 1.0 - i * 0.06;

        const chevGeo = createPlateGeo([
          [-0.13 * scale, 0.08],
          [0, -0.06],
          [0.13 * scale, 0.08],
          [0.12 * scale, 0.02],
          [0, -0.11],
          [-0.12 * scale, 0.02],
        ], 0.04, 0.012);
        const cMesh = new THREE.Mesh(chevGeo, secondaryArmorMat);
        cMesh.position.set(0, yPos, 0.11);
        g.add(cMesh);

        const lineGeo = createEnergyLineGeo([
          [-0.12 * scale, 0.01],
          [0, -0.10],
          [0.12 * scale, 0.01],
          [0.10 * scale, -0.01],
          [0, -0.12],
          [-0.10 * scale, -0.01],
        ], 0.015);
        const lMesh = new THREE.Mesh(lineGeo, crimsonEnergyMat);
        lMesh.position.set(0, yPos, 0.13);
        g.add(lMesh);
      }

      const trimGeo = trackDisposable(new THREE.CylinderGeometry(0.145, 0.115, 0.03, 16));
      const tMesh = new THREE.Mesh(trimGeo, silverTrimMat);
      tMesh.position.set(0, 0.72, 0);
      g.add(tMesh);

      return g;
    };

    const leftGreave = createGreaveMesh();
    leftGreave.position.set(-0.36, 0.28, 0.05);
    leftGreave.rotation.y = 0.18;
    legsGroup.add(leftGreave);

    const rightGreave = createGreaveMesh();
    rightGreave.position.set(0.36, 0.28, -0.05);
    rightGreave.rotation.y = -0.15;
    legsGroup.add(rightGreave);

    // Poleyns (Spiked Knee Cops)
    const createPoleynMesh = () => {
      const g = new THREE.Group();
      const kneeGeo = createPlateGeo([
        [-0.15, 0.12],
        [0.15, 0.12],
        [0.12, -0.08],
        [0, -0.16],
        [-0.12, -0.08],
      ], 0.08, 0.02);
      const kMesh = new THREE.Mesh(kneeGeo, armorPlateMat);
      kMesh.position.set(0, 0, 0.12);
      kMesh.rotation.x = -0.12;
      g.add(kMesh);

      const gemGeo = createEnergyLineGeo([
        [0, 0.08],
        [0.08, 0],
        [0, -0.08],
        [-0.08, 0],
      ], 0.025);
      const gemMesh = new THREE.Mesh(gemGeo, crimsonEnergyMat);
      gemMesh.position.set(0, 0, 0.17);
      g.add(gemMesh);

      return g;
    };

    const leftPoleyn = createPoleynMesh();
    leftPoleyn.position.set(-0.36, 1.06, 0.05);
    legsGroup.add(leftPoleyn);

    const rightPoleyn = createPoleynMesh();
    rightPoleyn.position.set(0.36, 1.06, -0.05);
    legsGroup.add(rightPoleyn);

    // Cuisses (Thigh Armor with Diagonal Crimson Energy Lines)
    const createCuisseMesh = () => {
      const g = new THREE.Group();
      const thighGeo = trackDisposable(new THREE.CylinderGeometry(0.22, 0.16, 0.76, 16));
      const tMesh = new THREE.Mesh(thighGeo, armorPlateMat);
      tMesh.position.set(0, 0.38, 0);
      tMesh.castShadow = true;
      g.add(tMesh);

      const outerGeo = createPlateGeo([
        [-0.14, 0.32],
        [0.14, 0.32],
        [0.12, -0.28],
        [0, -0.36],
        [-0.12, -0.28],
      ], 0.05, 0.015);
      const oMesh = new THREE.Mesh(outerGeo, secondaryArmorMat);
      oMesh.position.set(0, 0.38, 0.12);
      g.add(oMesh);

      for (let i = 0; i < 2; i++) {
        const yPos = 0.24 + i * 0.22;
        const diagGeo = createEnergyLineGeo([
          [-0.11, 0.04],
          [0, -0.04],
          [0.11, 0.04],
          [0.09, 0.02],
          [0, -0.06],
          [-0.09, 0.02],
        ], 0.02);
        const dMesh = new THREE.Mesh(diagGeo, crimsonEnergyMat);
        dMesh.position.set(0, yPos, 0.15);
        g.add(dMesh);
      }

      return g;
    };

    const leftCuisse = createCuisseMesh();
    leftCuisse.position.set(-0.33, 1.15, 0.04);
    legsGroup.add(leftCuisse);

    const rightCuisse = createCuisseMesh();
    rightCuisse.position.set(0.33, 1.15, -0.04);
    legsGroup.add(rightCuisse);

    figureGroup.add(legsGroup);

    // 7c. Hips, Belt Buckle & Flared Tassets
    const hipsGroup = new THREE.Group();
    hipsGroup.position.set(0, 1.95, 0);

    const girdleGeo = trackDisposable(new THREE.CylinderGeometry(0.38, 0.35, 0.22, 20));
    girdleGeo.scale(1.15, 1.0, 0.85);
    const girdleMesh = new THREE.Mesh(girdleGeo, armorPlateMat);
    hipsGroup.add(girdleMesh);

    const buckleGeo = createPlateGeo([
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

    const buckleGemGeo = createEnergyLineGeo([
      [0, 0.07],
      [0.08, 0],
      [0, -0.07],
      [-0.08, 0],
    ], 0.025);
    const buckleGemMesh = new THREE.Mesh(buckleGemGeo, crimsonCoreMat);
    buckleGemMesh.position.set(0, 0.02, 0.32);
    hipsGroup.add(buckleGemMesh);

    const createTassetMesh = (isLeft: boolean) => {
      const g = new THREE.Group();
      for (let i = 0; i < 2; i++) {
        const scale = 1.0 - i * 0.12;
        const yOffset = -i * 0.14;
        const tGeo = createPlateGeo([
          [-0.15 * scale, 0.12],
          [0.15 * scale, 0.12],
          [0.13 * scale, -0.12],
          [0, -0.22],
          [-0.13 * scale, -0.12],
        ], 0.04, 0.012);
        const tMesh = new THREE.Mesh(tGeo, secondaryArmorMat);
        tMesh.position.set(0, yOffset, 0);
        g.add(tMesh);

        const lGeo = createEnergyLineGeo([
          [-0.12 * scale, 0.02],
          [0, -0.06],
          [0.12 * scale, 0.02],
          [0.10 * scale, 0.0],
          [0, -0.08],
          [-0.10 * scale, 0.0],
        ], 0.018);
        const lMesh = new THREE.Mesh(lGeo, crimsonEnergyMat);
        lMesh.position.set(0, yOffset - 0.06, 0.03);
        g.add(lMesh);
      }
      return g;
    };

    const leftTasset = createTassetMesh(true);
    leftTasset.position.set(-0.46, -0.08, 0.12);
    leftTasset.rotation.set(0.15, -0.22, 0.18);
    hipsGroup.add(leftTasset);

    const rightTasset = createTassetMesh(false);
    rightTasset.position.set(0.46, -0.08, 0.12);
    rightTasset.rotation.set(0.15, 0.22, -0.18);
    hipsGroup.add(rightTasset);

    figureGroup.add(hipsGroup);

    // 7d. Torso Group (Breathing Anchor) with Chevron Cuirass & Restrained Crimson Core
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 2.05, 0);

    const abdoBaseGeo = trackDisposable(new THREE.CylinderGeometry(0.39, 0.35, 0.48, 20));
    abdoBaseGeo.scale(1.12, 1.0, 0.82);
    const abdoBaseMesh = new THREE.Mesh(abdoBaseGeo, armorPlateMat);
    abdoBaseMesh.position.set(0, 0.26, 0);
    abdoBaseMesh.castShadow = true;
    torsoGroup.add(abdoBaseMesh);

    // 4 Interlocking Chevron Abdominal Plates with Restrained Crimson Seams
    for (let i = 0; i < 4; i++) {
      const yPos = 0.12 + i * 0.11;
      const scale = 0.86 + i * 0.06;

      const chevPlateGeo = createPlateGeo([
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

      const chevLineGeo = createEnergyLineGeo([
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

    // Upper Pectoral Gothic Cuirass
    const chestBaseGeo = trackDisposable(new THREE.SphereGeometry(0.52, 24, 18));
    chestBaseGeo.scale(1.05, 0.82, 0.72);
    const chestBaseMesh = new THREE.Mesh(chestBaseGeo, armorPlateMat);
    chestBaseMesh.position.set(0, 0.74, 0.06);
    chestBaseMesh.castShadow = true;
    torsoGroup.add(chestBaseMesh);

    // Angular Pectoral Plates
    const leftPecGeo = createPlateGeo([
      [-0.28, 0.18],
      [0, 0.14],
      [0, -0.16],
      [-0.24, -0.18],
    ], 0.05, 0.015);
    const leftPecMesh = new THREE.Mesh(leftPecGeo, secondaryArmorMat);
    leftPecMesh.position.set(-0.16, 0.74, 0.32);
    leftPecMesh.rotation.set(-0.05, -0.20, 0.08);
    torsoGroup.add(leftPecMesh);

    const rightPecGeo = createPlateGeo([
      [0, 0.14],
      [0.28, 0.18],
      [0.24, -0.18],
      [0, -0.16],
    ], 0.05, 0.015);
    const rightPecMesh = new THREE.Mesh(rightPecGeo, secondaryArmorMat);
    rightPecMesh.position.set(0.16, 0.74, 0.32);
    rightPecMesh.rotation.set(-0.05, 0.20, -0.08);
    torsoGroup.add(rightPecMesh);

    // Restrained Crimson Winged Sternum Emblem (Chest Core)
    const chestCoreGeo = createEnergyLineGeo([
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

    // Gorget (Neck Collar) with Polished Silver
    const gorgetGeo = trackDisposable(new THREE.CylinderGeometry(0.24, 0.32, 0.24, 18));
    gorgetGeo.scale(1.08, 1.0, 0.90);
    const gorgetMesh = new THREE.Mesh(gorgetGeo, silverTrimMat);
    gorgetMesh.position.set(0, 1.12, 0.05);
    torsoGroup.add(gorgetMesh);

    // 7e. Multi-Tiered Flared Angular Pauldrons (Shoulder Plates)
    const createPauldronMesh = (isLeft: boolean) => {
      const g = new THREE.Group();
      const sign = isLeft ? -1 : 1;

      for (let tier = 0; tier < 3; tier++) {
        const scale = 1.0 - tier * 0.12;
        const yOffset = tier * 0.12;
        const zOffset = -tier * 0.04;
        const rotZ = sign * (0.35 + tier * 0.18);

        const pGeo = createPlateGeo([
          [-0.24 * scale, 0.16],
          [0.0, 0.36 * scale],
          [0.24 * scale, 0.16],
          [0.18 * scale, -0.14],
          [0.0, -0.22 * scale],
          [-0.18 * scale, -0.14],
        ], 0.05, 0.015);

        const pMesh = new THREE.Mesh(pGeo, tier === 1 ? secondaryArmorMat : armorPlateMat);
        pMesh.position.set(sign * (0.05 + tier * 0.04), yOffset, zOffset);
        pMesh.rotation.set(0.18, sign * -0.12, rotZ);
        pMesh.castShadow = true;
        g.add(pMesh);

        const rGeo = createEnergyLineGeo([
          [-0.22 * scale, 0.14],
          [0.0, 0.33 * scale],
          [0.22 * scale, 0.14],
          [0.16 * scale, 0.11],
          [0.0, 0.29 * scale],
          [-0.16 * scale, 0.11],
        ], 0.02);
        const rMesh = new THREE.Mesh(rGeo, crimsonEnergyMat);
        rMesh.position.set(sign * (0.05 + tier * 0.04), yOffset, zOffset + 0.04);
        rMesh.rotation.set(0.18, sign * -0.12, rotZ);
        g.add(rMesh);
      }

      const crestGeo = createPlateGeo([
        [-0.04, 0.44],
        [0.04, 0.44],
        [0.03, -0.08],
        [-0.03, -0.08],
      ], 0.04, 0.01);
      const crestMesh = new THREE.Mesh(crestGeo, silverTrimMat);
      crestMesh.position.set(sign * 0.12, 0.18, 0.02);
      crestMesh.rotation.set(0.15, 0, sign * 0.42);
      g.add(crestMesh);

      return g;
    };

    const leftPauldron = createPauldronMesh(true);
    leftPauldron.position.set(-0.65, 0.98, 0.04);
    torsoGroup.add(leftPauldron);

    const rightPauldron = createPauldronMesh(false);
    rightPauldron.position.set(0.65, 0.98, 0.04);
    torsoGroup.add(rightPauldron);

    // 7f. Arms, Forearms & Gauntlets (Left Relaxed at Side, Right Gripping Greatsword)
    const bicepGeo = trackDisposable(new THREE.CylinderGeometry(0.13, 0.11, 0.45, 14));
    const couterGeo = createPlateGeo([
      [-0.10, 0.10],
      [0.10, 0.10],
      [0.08, -0.08],
      [0, -0.16],
      [-0.08, -0.08],
    ], 0.05, 0.015);
    const forearmGeo = trackDisposable(new THREE.CylinderGeometry(0.12, 0.09, 0.44, 14));
    const gauntletGeo = trackDisposable(new THREE.BoxGeometry(0.13, 0.18, 0.15));

    // Left Arm (Relaxed at side)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.55, 0.85, 0.05);

    const leftBicepMesh = new THREE.Mesh(bicepGeo, armorPlateMat);
    leftBicepMesh.position.set(0, -0.22, 0);
    leftArmGroup.add(leftBicepMesh);

    const leftCouterMesh = new THREE.Mesh(couterGeo, secondaryArmorMat);
    leftCouterMesh.position.set(-0.06, -0.46, -0.08);
    leftCouterMesh.rotation.set(Math.PI / 1.8, 0, -0.2);
    leftArmGroup.add(leftCouterMesh);

    const leftForearmMesh = new THREE.Mesh(forearmGeo, secondaryArmorMat);
    leftForearmMesh.position.set(0.04, -0.66, 0.05);
    leftArmGroup.add(leftForearmMesh);

    for (let i = 0; i < 2; i++) {
      const lineGeo = createEnergyLineGeo([
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

    const leftGauntletMesh = new THREE.Mesh(gauntletGeo, armorPlateMat);
    leftGauntletMesh.position.set(0.06, -0.92, 0.08);
    leftArmGroup.add(leftGauntletMesh);

    const knuckleLineGeo = createEnergyLineGeo([
      [-0.06, 0.02],
      [0.06, 0.02],
      [0.06, -0.02],
      [-0.06, -0.02],
    ], 0.02);
    const leftKnuckleMesh = new THREE.Mesh(knuckleLineGeo, crimsonCoreMat);
    leftKnuckleMesh.position.set(0.06, -0.92, 0.16);
    leftArmGroup.add(leftKnuckleMesh);

    torsoGroup.add(leftArmGroup);

    // Right Arm (Angled forward-downward to firmly grip Greatsword)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.55, 0.85, 0.05);

    const rightBicepMesh = new THREE.Mesh(bicepGeo, armorPlateMat);
    rightBicepMesh.position.set(0.05, -0.18, 0.12);
    rightBicepMesh.rotation.set(0.42, -0.15, 0.18);
    rightArmGroup.add(rightBicepMesh);

    const rightCouterMesh = new THREE.Mesh(couterGeo, secondaryArmorMat);
    rightCouterMesh.position.set(0.12, -0.38, 0.28);
    rightCouterMesh.rotation.set(0.65, 0.3, 0);
    rightArmGroup.add(rightCouterMesh);

    const rightForearmMesh = new THREE.Mesh(forearmGeo, secondaryArmorMat);
    rightForearmMesh.position.set(-0.12, -0.48, 0.44);
    rightForearmMesh.rotation.set(0.85, 0.24, -0.45);
    rightArmGroup.add(rightForearmMesh);

    for (let i = 0; i < 2; i++) {
      const lineGeo = createEnergyLineGeo([
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

    const rightGauntletGeo = trackDisposable(new THREE.BoxGeometry(0.14, 0.16, 0.16));
    const rightGauntletMesh = new THREE.Mesh(rightGauntletGeo, armorPlateMat);
    rightGauntletMesh.position.set(-0.25, -0.58, 0.62);
    rightGauntletMesh.rotation.set(0.85, 0.24, -0.45);
    rightArmGroup.add(rightGauntletMesh);

    const rightKnuckleMesh = new THREE.Mesh(knuckleLineGeo, crimsonCoreMat);
    rightKnuckleMesh.position.set(-0.25, -0.58, 0.71);
    rightKnuckleMesh.rotation.set(0.85, 0.24, -0.45);
    rightArmGroup.add(rightKnuckleMesh);

    torsoGroup.add(rightArmGroup);

    // 7g. MONUMENTAL DARK STEEL GREATSWORD WITH RESTRAINED CRIMSON FULLER LINE
    const swordGroup = new THREE.Group();
    swordGroup.position.set(-0.25, 1.47, 0.67);
    swordGroup.rotation.set(0.35, -0.22, 0.62); // Angled down-left toward floor

    const hiltGeo = trackDisposable(new THREE.CylinderGeometry(0.032, 0.035, 0.55, 14));
    const hiltMesh = new THREE.Mesh(hiltGeo, secondaryArmorMat);
    hiltMesh.position.set(0, 0.15, 0);
    swordGroup.add(hiltMesh);

    const pommelGeo = createPlateGeo([
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

    const crossguardGeo = createPlateGeo([
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

    // Subtle Crimson Crossguard Accent Line
    const guardGlowGeo = createEnergyLineGeo([
      [-0.32, 0.02],
      [0, 0.04],
      [0.32, 0.02],
      [0.30, 0.0],
      [0, 0.02],
      [-0.30, 0.0],
    ], 0.025);
    const guardGlowMesh = new THREE.Mesh(guardGlowGeo, crimsonEnergyMat);
    guardGlowMesh.position.set(0, -0.14, 0.05);
    swordGroup.add(guardGlowMesh);

    // Dark Metallic Steel Blade (Black luxury steel with sharp specular edge highlights)
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.lineTo(0.12, 0.35);
    bladeShape.lineTo(0.14, 1.85);
    bladeShape.lineTo(-0.14, 1.85);
    bladeShape.lineTo(-0.12, 0.35);
    bladeShape.closePath();

    const bladeGeo = trackDisposable(
      new THREE.ExtrudeGeometry(bladeShape, {
        depth: 0.045,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.02,
        bevelSegments: 2,
      })
    );
    bladeGeo.center();

    const bladeMesh = new THREE.Mesh(bladeGeo, swordBladeMat);
    bladeMesh.position.set(0, -1.15, 0);
    bladeMesh.castShadow = true;
    swordGroup.add(bladeMesh);

    // Subtle Crimson Fuller Line in Blade Center Spine
    const fullerGeo = createEnergyLineGeo([
      [0, 0.2],
      [0.028, 0.35],
      [0.032, 1.75],
      [-0.032, 1.75],
      [-0.028, 0.35],
    ], 0.06);
    fullerGeo.center();
    const fullerMesh = new THREE.Mesh(fullerGeo, crimsonEnergyMat);
    fullerMesh.position.set(0, -1.12, 0.005);
    swordGroup.add(fullerMesh);

    figureGroup.add(swordGroup);

    // Subtle Restrained Crimson Ground Contact Sheen Beneath Sword
    const swordGroundPoolGeo = trackDisposable(new THREE.RingGeometry(0.05, 0.55, 32));
    swordGroundPoolGeo.rotateX(-Math.PI / 2);
    const swordGroundPoolMesh = new THREE.Mesh(
      swordGroundPoolGeo,
      trackDisposable(
        new THREE.MeshBasicMaterial({
          color: new THREE.Color('#66000E'),
          transparent: true,
          opacity: 0.30,
          side: THREE.DoubleSide,
        })
      )
    );
    swordGroundPoolMesh.position.set(-1.18, 0.025, 0.65);
    figureGroup.add(swordGroundPoolMesh);

    // 7h. Helmet, Piercing Crimson Visor Slit Eyes & Horn Accents
    const helmetGroup = new THREE.Group();
    helmetGroup.position.set(0, 1.34, 0.06);

    const helmDomeGeo = trackDisposable(new THREE.SphereGeometry(0.25, 24, 20));
    helmDomeGeo.scale(0.88, 1.18, 1.05);
    const helmDomeMesh = new THREE.Mesh(helmDomeGeo, armorPlateMat);
    helmDomeMesh.castShadow = true;
    helmetGroup.add(helmDomeMesh);

    const visorFaceGeo = createPlateGeo([
      [-0.18, 0.16],
      [0.18, 0.16],
      [0.15, -0.06],
      [0, -0.22],
      [-0.15, -0.06],
    ], 0.14, 0.02);
    const visorFaceMesh = new THREE.Mesh(visorFaceGeo, secondaryArmorMat);
    visorFaceMesh.position.set(0, -0.04, 0.16);
    helmetGroup.add(visorFaceMesh);

    const helmCrestGeo = createPlateGeo([
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

    // Dual Piercing Crimson Visor Slit Eyes
    const leftEyeGeo = createEnergyLineGeo([
      [-0.14, 0.035],
      [-0.02, 0.01],
      [-0.02, -0.015],
      [-0.14, 0.005],
    ], 0.04);
    const leftEyeMesh = new THREE.Mesh(leftEyeGeo, crimsonCoreMat);
    leftEyeMesh.position.set(0, 0.04, 0.25);
    helmetGroup.add(leftEyeMesh);

    const rightEyeGeo = createEnergyLineGeo([
      [0.02, 0.01],
      [0.14, 0.035],
      [0.14, 0.005],
      [0.02, -0.015],
    ], 0.04);
    const rightEyeMesh = new THREE.Mesh(rightEyeGeo, crimsonCoreMat);
    rightEyeMesh.position.set(0, 0.04, 0.25);
    helmetGroup.add(rightEyeMesh);

    for (let isLeft of [true, false]) {
      const sign = isLeft ? -1 : 1;
      const hornGeo = createPlateGeo([
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

    // 7i. Crimson Helmet Plume / Hair (High-Arched Dynamic Flame Ponytail)
    const plumeGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const strandSpread = (i - 2.5) * 0.05;
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, 0.28, -0.02),
        new THREE.Vector3(strandSpread, 0.68 + (i % 2) * 0.08, -0.18),
        new THREE.Vector3(strandSpread * 1.5, 0.42, -0.55 - i * 0.07),
        new THREE.Vector3(strandSpread * 2.0, -0.12 - i * 0.08, -0.85 - i * 0.09)
      );
      const tubeGeo = trackDisposable(new THREE.TubeGeometry(curve, 28, 0.052 - i * 0.004, 8, false));
      const plumeMesh = new THREE.Mesh(tubeGeo, crimsonPlumeMat);
      plumeMesh.castShadow = true;
      plumeGroup.add(plumeMesh);
    }
    helmetGroup.add(plumeGroup);

    torsoGroup.add(helmetGroup);

    // ========================================================
    // 7j. CORRECTED TAPERED BLACK VELVET CAPE
    // - Substantially reduced width (kept behind shoulders and body)
    // - Reduced length (ends near lower legs/ankles, above pedestal)
    // - Both arms, legs, boots, and greatsword completely visible
    // - Natural vertical folds and subtle fabric movement
    // ========================================================
    const capeWidth = 1.05;
    const capeHeight = 1.75;
    const capeGeo = trackDisposable(new THREE.PlaneGeometry(capeWidth, capeHeight, 20, 24));
    capeGeo.translate(0, -0.82, 0);

    const cPos = capeGeo.attributes.position;
    const initialCapeZ = new Float32Array(cPos.count);
    const initialCapeX = new Float32Array(cPos.count);

    for (let i = 0; i < cPos.count; i++) {
      const y = cPos.getY(i);
      const factor = Math.max(0, -y / 1.6);
      const currentX = cPos.getX(i);

      // Natural gentle taper: narrow at shoulders (1.05m), widening slightly to ~1.25m at lower legs
      const taper = 1.0 + factor * 0.20;
      // Realistic vertical cloth folds
      const fold = Math.sin(currentX * 9.0) * 0.035;

      cPos.setX(i, currentX * taper);
      cPos.setZ(i, -0.22 + fold - factor * 0.06);

      initialCapeZ[i] = cPos.getZ(i);
      initialCapeX[i] = cPos.getX(i);
    }
    capeGeo.computeVertexNormals();

    const capeMesh = new THREE.Mesh(capeGeo, blackCapeMat);
    capeMesh.position.set(0, 1.05, -0.05);
    capeMesh.castShadow = true;
    torsoGroup.add(capeMesh);

    figureGroup.add(torsoGroup);

    // ========================================================
    // 7k. SOFT ATMOSPHERIC CRIMSON ENERGY RING (8-12% TRANSLUCENT AURA)
    // - Feathered radial gradient canvas texture (zero sharp edges)
    // - Translucent deep crimson illumination (~10-12% visual opacity)
    // - Substantially soft outer glow fading into volcanic atmosphere
    // - Kept safely behind shoulders, torso, and cape
    // ========================================================
    const auraGroup = new THREE.Group();
    auraGroup.position.set(0, 1.85, -1.25);

    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 512;
    haloCanvas.height = 512;
    const hCtx = haloCanvas.getContext('2d');
    if (hCtx) {
      const grad = hCtx.createRadialGradient(256, 256, 110, 256, 256, 248);
      grad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.50, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.70, 'rgba(125, 14, 26, 0.12)'); // Peak ~12% subtle deep crimson
      grad.addColorStop(0.84, 'rgba(75, 8, 16, 0.05)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      hCtx.fillStyle = grad;
      hCtx.fillRect(0, 0, 512, 512);
    }

    const haloTexture = trackDisposable(new THREE.CanvasTexture(haloCanvas));
    haloTexture.generateMipmaps = true;

    const haloPlaneGeo = trackDisposable(new THREE.PlaneGeometry(5.4, 5.4));
    const haloPlaneMat = trackDisposable(
      new THREE.MeshBasicMaterial({
        map: haloTexture,
        transparent: true,
        opacity: 0.90, // Combined with texture alpha yields 10-11% peak visual opacity
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    const haloMesh = new THREE.Mesh(haloPlaneGeo, haloPlaneMat);
    auraGroup.add(haloMesh);

    figureGroup.add(auraGroup);

    scene.add(figureGroup);

    // ========================================================
    // 8. RESTORED CRIMSON & AMBER ATMOSPHERIC EMBERS + VOLCANIC ASH
    // ========================================================
    const emberCount = 42;
    const emberGeo = trackDisposable(new THREE.BufferGeometry());
    const emberPositions = new Float32Array(emberCount * 3);
    const emberSpeeds = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 18;
      emberPositions[i * 3 + 1] = Math.random() * 8.5;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 22;
      emberSpeeds[i] = 0.2 + Math.random() * 0.4;
    }

    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

    const emberMat = trackDisposable(
      new THREE.PointsMaterial({
        color: new THREE.Color('#FF2A3D'),
        size: 0.065,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      })
    );

    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // Slow-drifting dark atmospheric ash particles
    const ashCount = 28;
    const ashGeo = trackDisposable(new THREE.BufferGeometry());
    const ashPositions = new Float32Array(ashCount * 3);
    const ashSpeeds = new Float32Array(ashCount);

    for (let i = 0; i < ashCount; i++) {
      ashPositions[i * 3] = (Math.random() - 0.5) * 20;
      ashPositions[i * 3 + 1] = Math.random() * 9;
      ashPositions[i * 3 + 2] = (Math.random() - 0.5) * 24;
      ashSpeeds[i] = 0.12 + Math.random() * 0.20;
    }

    ashGeo.setAttribute('position', new THREE.BufferAttribute(ashPositions, 3));
    const ashMat = trackDisposable(
      new THREE.PointsMaterial({
        color: new THREE.Color('#442226'),
        size: 0.05,
        transparent: true,
        opacity: 0.40,
      })
    );
    const ashParticles = new THREE.Points(ashGeo, ashMat);
    scene.add(ashParticles);

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
    // 10. ANIMATION LOOP (BREATHING, CAPE WAVE, CRIMSON PULSE)
    // ========================================================
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!reducedMotion) {
        // Natural Knight Idle Breathing
        const breath = Math.sin(elapsedTime * 1.6) * 0.015;
        torsoGroup.position.y = 2.05 + breath;
        helmetGroup.rotation.y = Math.sin(elapsedTime * 0.7) * 0.035;

        // Subtle Crimson Visor, Core & Infernal Lava Light Pulse
        swordGlowLight.intensity = 2.2 + Math.sin(elapsedTime * 2.5) * 0.35;
        visorEyeLight.intensity = 2.2 + Math.sin(elapsedTime * 2.8) * 0.35;
        chestCoreLight.intensity = 1.8 + Math.sin(elapsedTime * 2.0) * 0.25;
        lavaBounceLight.intensity = 1.4 + Math.sin(elapsedTime * 2.2) * 0.25;
        lavaPoolLight1.intensity = 2.8 + Math.sin(elapsedTime * 1.8 + 1.0) * 0.35;
        lavaPoolLight2.intensity = 2.2 + Math.sin(elapsedTime * 1.5 + 2.0) * 0.30;

        // Corrected Tapered Velvet Cape Wave Simulation
        const pos = capeGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const y = pos.getY(i);
          const factor = Math.max(0, -y / 1.6);
          const waveZ = Math.sin(y * 2.2 + elapsedTime * 1.8) * 0.025 * factor;
          const waveX = Math.cos(y * 1.6 + elapsedTime * 1.5) * 0.012 * factor;
          pos.setZ(i, initialCapeZ[i] + waveZ);
          pos.setX(i, initialCapeX[i] + waveX);
        }
        capeGeo.computeVertexNormals();
        pos.needsUpdate = true;

        // Rising Crimson Embers
        const ePos = emberGeo.attributes.position;
        for (let i = 0; i < emberCount; i++) {
          let ey = ePos.getY(i);
          ey += emberSpeeds[i] * 0.018;
          if (ey > 8.5) ey = 0.1;
          ePos.setY(i, ey);
        }
        ePos.needsUpdate = true;

        // Slow Drifting Volcanic Ash Flakes
        const aPos = ashGeo.attributes.position;
        for (let i = 0; i < ashCount; i++) {
          let ay = aPos.getY(i);
          ay += ashSpeeds[i] * 0.012;
          if (ay > 9.0) ay = 0.1;
          aPos.setY(i, ay);
        }
        aPos.needsUpdate = true;

        // Smooth Parallax
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
      disposables.forEach((item) => {
        try {
          item.dispose();
        } catch {}
      });
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
