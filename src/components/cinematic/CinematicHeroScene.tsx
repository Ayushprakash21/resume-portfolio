import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CinematicHeroSceneProps {
  reducedMotion?: boolean;
}

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

    // 1. SCENE SETUP
    // Luminous dawn/twilight slate-green atmosphere matching LE:MMA reference
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#4E5B53');

    // Atmospheric fog: soft painterly depth without obscuring the landscape
    scene.fog = new THREE.FogExp2('#4A574F', 0.0065);

    // 2. CAMERA SETUP
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 400);
    camera.position.set(0, 1.85, 8.8);
    camera.lookAt(0, 2.2, -45);

    // 3. RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // --- 4. NATURAL ATMOSPHERIC SKY DOME ---
    // Smooth visible sky with distinct luminous dawn/dusk gradient:
    // Top: muted deep sage (#3A473F), Mid: luminous slate-olive (#58675E), Horizon: soft mist horizon (#7A8B81)
    const skyGeo = new THREE.SphereGeometry(250, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color('#3A473F') },
        midColor: { value: new THREE.Color('#58675E') },
        horizonColor: { value: new THREE.Color('#7A8B81') },
        offset: { value: 18 },
        exponent: { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 horizonColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
          float factor = max(pow(max(h, 0.0), exponent), 0.0);
          vec3 sky = mix(horizonColor, midColor, smoothstep(0.0, 0.45, factor));
          sky = mix(sky, topColor, smoothstep(0.45, 1.0, factor));
          gl_FragColor = vec4(sky, 1.0);
        }
      `,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // --- 5. COMPREHENSIVE LIGHTING SYSTEM ---
    // 5a. Soft ambient illumination (sky/ground hemisphere)
    const ambientLight = new THREE.HemisphereLight('#A8B8AD', '#3A483F', 2.2);
    scene.add(ambientLight);

    // 5b. Key directional light (soft dawn radiance from upper right)
    const keyLight = new THREE.DirectionalLight('#D8E5DC', 2.0);
    keyLight.position.set(18, 30, -10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // 5c. Foreground fill light (illuminates foreground rocks & water surface)
    const fillLight = new THREE.DirectionalLight('#92A69A', 1.3);
    fillLight.position.set(-14, 14, 14);
    scene.add(fillLight);

    // 5d. SUBTLE RIM LIGHTING BEHIND HUMAN FIGURE:
    // Positioned behind the figure pointing toward camera, highlighting head, mantle & cloak edges
    const rimLight = new THREE.DirectionalLight('#E4EFE8', 3.2);
    rimLight.position.set(0, 3.8, -10);
    rimLight.target.position.set(0, 1.8, 2.6);
    scene.add(rimLight);
    scene.add(rimLight.target);

    // 5e. Golden glow point light reflecting the floral bank onto the water surface
    const floralWaterReflect = new THREE.PointLight('#E5C87E', 2.2, 35);
    floralWaterReflect.position.set(0, 1.5, -16);
    scene.add(floralWaterReflect);

    const floralWaterReflectLeft = new THREE.PointLight('#D4B565', 1.8, 30);
    floralWaterReflectLeft.position.set(-15, 1.8, -18);
    scene.add(floralWaterReflectLeft);

    const floralWaterReflectRight = new THREE.PointLight('#DFBF6E', 1.8, 30);
    floralWaterReflectRight.position.set(15, 1.8, -18);
    scene.add(floralWaterReflectRight);

    // --- 6. NATURAL FLORAL HILLSIDE BANK (Directly matching LE:MMA Reference) ---
    // Middle-ground hillside rising behind the lake, covered in dense dark foliage and golden wild blossoms
    const hillGeo = new THREE.PlaneGeometry(160, 42, 60, 30);
    hillGeo.rotateX(-Math.PI / 2);
    const hillPos = hillGeo.attributes.position;
    for (let i = 0; i < hillPos.count; i++) {
      const x = hillPos.getX(i);
      const z = hillPos.getZ(i);
      // Natural rolling hillside contour
      const ridge = Math.sin(x * 0.05) * 2.8 + Math.cos(x * 0.12) * 1.5;
      const slope = ((z + 21) / 42) * 5.8; // slopes upward toward the horizon
      hillPos.setY(i, Math.max(0.2, ridge + slope));
    }
    hillGeo.computeVertexNormals();

    const hillMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1F2A23'),
      roughness: 0.95,
      metalness: 0.02,
      flatShading: true,
    });
    const hillMesh = new THREE.Mesh(hillGeo, hillMat);
    hillMesh.position.set(0, 0, -25);
    hillMesh.receiveShadow = true;
    scene.add(hillMesh);

    // Instanced golden wildflower & shrub canopy across the hillside bank
    const blossomCount = 2800;
    const blossomGeo = new THREE.DodecahedronGeometry(0.18, 0);
    const blossomMat = new THREE.MeshStandardMaterial({
      roughness: 0.38,
      metalness: 0.15,
    });
    const blossomInstanced = new THREE.InstancedMesh(blossomGeo, blossomMat, blossomCount);
    blossomInstanced.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    const dummy = new THREE.Object3D();
    const blossomPalette = [
      new THREE.Color('#E8CE7D'), // Vibrant wild golden blossom
      new THREE.Color('#D8BA68'), // Warm golden ochre
      new THREE.Color('#C49E48'), // Deep amber gold
      new THREE.Color('#8AA8BA'), // Sage-blue alpine wildflower
      new THREE.Color('#F0EAD6'), // Soft ivory bud
      new THREE.Color('#5E7A6C'), // Silvery foliage leaf
    ];

    for (let i = 0; i < blossomCount; i++) {
      const bx = (Math.random() - 0.5) * 95;
      const bz = -14 - Math.random() * 20; // Spread across the middle-ground hillside
      const ridge = Math.sin(bx * 0.05) * 2.8 + Math.cos(bx * 0.12) * 1.5;
      const slope = ((bz + 25 + 21) / 42) * 5.8;
      const by = Math.max(0.4, ridge + slope) + (Math.random() * 0.45);

      dummy.position.set(bx, by, bz);
      const scale = 0.6 + Math.random() * 0.9;
      dummy.scale.set(scale, scale * 1.2, scale);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      blossomInstanced.setMatrixAt(i, dummy.matrix);

      // Distribute rich golden tones primarily in the dense center bank, matching LE:MMA
      const colorChoice = Math.random();
      let blossomCol: THREE.Color;
      if (colorChoice < 0.55) {
        blossomCol = blossomPalette[0]; // Golden yellow
      } else if (colorChoice < 0.75) {
        blossomCol = blossomPalette[1]; // Warm ochre
      } else if (colorChoice < 0.88) {
        blossomCol = blossomPalette[3]; // Soft blue
      } else {
        blossomCol = blossomPalette[4]; // Ivory bud
      }
      blossomInstanced.setColorAt(i, blossomCol);
    }
    blossomInstanced.instanceMatrix.needsUpdate = true;
    if (blossomInstanced.instanceColor) blossomInstanced.instanceColor.needsUpdate = true;
    scene.add(blossomInstanced);

    // Silhouette pine / conifer tops along the crest of the hill
    const foliageGroup = new THREE.Group();
    const treeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#19221C'),
      roughness: 0.92,
      flatShading: true,
    });
    const treeConeGeo = new THREE.ConeGeometry(0.7, 3.4, 5);

    for (let i = 0; i < 45; i++) {
      const tx = (Math.random() - 0.5) * 110;
      const tz = -30 - Math.random() * 12;
      const ridge = Math.sin(tx * 0.05) * 2.8 + Math.cos(tx * 0.12) * 1.5;
      const ty = Math.max(2.0, ridge + 4.5) + 1.2;
      const tree = new THREE.Mesh(treeConeGeo, treeMat);
      tree.position.set(tx, ty, tz);
      const ts = 0.8 + Math.random() * 0.8;
      tree.scale.set(ts, ts, ts);
      tree.rotation.y = Math.random() * Math.PI;
      foliageGroup.add(tree);
    }
    scene.add(foliageGroup);

    // Far background mountain ridge
    const farRidgeGeo = new THREE.PlaneGeometry(240, 60, 60, 20);
    farRidgeGeo.rotateX(-Math.PI / 2);
    const farPos = farRidgeGeo.attributes.position;
    for (let i = 0; i < farPos.count; i++) {
      const x = farPos.getX(i);
      const n = Math.sin(x * 0.03) * 7.0 + Math.cos(x * 0.07) * 4.0;
      farPos.setY(i, Math.max(0, n + 8.0));
    }
    farRidgeGeo.computeVertexNormals();
    const farRidgeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#323F37'),
      roughness: 0.95,
      flatShading: true,
    });
    const farRidge = new THREE.Mesh(farRidgeGeo, farRidgeMat);
    farRidge.position.set(0, 0, -65);
    scene.add(farRidge);

    // --- 7. REFLECTIVE WATER PLANE ---
    // Clear, dark reflective lake water reflecting the sky, mist, and the golden floral bank
    const waterGeo = new THREE.PlaneGeometry(180, 50, 70, 40);
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1B2621'),
      roughness: 0.14,
      metalness: 0.90,
      envMapIntensity: 2.0,
    });

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, -0.05, -10);
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);

    // Save initial water positions for gentle ripple animation
    const waterPos = waterGeo.attributes.position;
    const initialWaterY = new Float32Array(waterPos.count);
    for (let i = 0; i < waterPos.count; i++) {
      initialWaterY[i] = waterPos.getY(i);
    }

    // --- 8. FOREGROUND ROCKS (NATURAL CRAG TEXTURES, LE:MMA COMPOSITION) ---
    const rockMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#38453E'), // Naturally visible slate-granite tone
      roughness: 0.82,
      metalness: 0.10,
      flatShading: true,
    });

    const createCragRock = (radius: number, scaleX: number, scaleY: number, scaleZ: number) => {
      const geo = new THREE.DodecahedronGeometry(radius, 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const vz = pos.getZ(i);
        // Realistic crag facets
        const n = Math.sin(vx * 2.2) * Math.cos(vy * 2.4) * Math.sin(vz * 2.0) * 0.16;
        pos.setXYZ(i, vx + vx * n, vy + vy * n, vz + vz * n);
      }
      geo.computeVertexNormals();
      geo.scale(scaleX, scaleY, scaleZ);
      return new THREE.Mesh(geo, rockMat);
    };

    const rockGroup = new THREE.Group();

    // Right Large Craggy Boulder (Prominent right foreground rock matching LE:MMA)
    const rightBigRock = createCragRock(3.8, 1.25, 1.05, 1.2);
    rightBigRock.position.set(6.6, 0.5, 1.8);
    rightBigRock.rotation.set(0.12, -0.35, 0.08);
    rightBigRock.castShadow = true;
    rightBigRock.receiveShadow = true;
    rockGroup.add(rightBigRock);

    const rightBaseRock = createCragRock(2.4, 1.35, 0.65, 1.25);
    rightBaseRock.position.set(5.2, -0.35, 3.4);
    rockGroup.add(rightBaseRock);

    // Left Foreground Rock Shelf
    const leftRock = createCragRock(3.2, 1.2, 0.9, 1.15);
    leftRock.position.set(-6.2, 0.2, 1.6);
    leftRock.rotation.set(0.1, 0.4, -0.06);
    leftRock.castShadow = true;
    leftRock.receiveShadow = true;
    rockGroup.add(leftRock);

    const leftBaseRock = createCragRock(2.1, 1.4, 0.6, 1.2);
    leftBaseRock.position.set(-4.6, -0.4, 3.2);
    rockGroup.add(leftBaseRock);

    // Center Rocky Promontory (Platform where the figure stands looking at the water)
    const centerLedge = createCragRock(2.6, 1.7, 0.65, 1.5);
    centerLedge.position.set(0, -0.5, 2.5);
    centerLedge.rotation.set(0.05, 0.06, -0.02);
    centerLedge.castShadow = true;
    centerLedge.receiveShadow = true;
    rockGroup.add(centerLedge);

    scene.add(rockGroup);

    // --- 9. HUMAN FIGURE (LIQUID METALLIC HOODED CLOAK MATCHING LE:MMA REFERENCE) ---
    // Standing centered on the rocky ledge, gazing out at the vast water and golden floral bank
    const figureGroup = new THREE.Group();
    figureGroup.position.set(0, 0.25, 2.5);

    // Metallic cloak material: reflective dark chrome/silk with luminous specular highlights
    const cloakMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#222E27'),
      roughness: 0.26,
      metalness: 0.78,
    });
    const headMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2C3A32'),
      roughness: 0.24,
      metalness: 0.82,
    });

    // Cloak / Body drape
    const coatGeo = new THREE.CylinderGeometry(0.32, 0.54, 1.35, 16);
    coatGeo.scale(1.0, 1.0, 0.72);
    const coat = new THREE.Mesh(coatGeo, cloakMat);
    coat.position.set(0, 0.92, 0);
    coat.castShadow = true;
    coat.receiveShadow = true;
    figureGroup.add(coat);

    // Shoulders & Upper Mantle
    const shouldersGeo = new THREE.BoxGeometry(0.76, 0.24, 0.38);
    const shoulders = new THREE.Mesh(shouldersGeo, cloakMat);
    shoulders.position.set(0, 1.48, 0.01);
    shoulders.castShadow = true;
    shoulders.receiveShadow = true;
    figureGroup.add(shoulders);

    // Neck / Cowl
    const neckGeo = new THREE.CylinderGeometry(0.13, 0.16, 0.18, 12);
    const neck = new THREE.Mesh(neckGeo, cloakMat);
    neck.position.set(0, 1.64, -0.01);
    figureGroup.add(neck);

    // Hooded Head
    const headGeo = new THREE.SphereGeometry(0.20, 16, 14);
    headGeo.scale(0.88, 1.05, 0.94);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.82, -0.03);
    head.castShadow = true;
    head.receiveShadow = true;
    figureGroup.add(head);

    scene.add(figureGroup);

    // --- 10. MOUSE PARALLAX & SUBTLE NATURAL ANIMATION ---
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (reducedMotion) return;
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetParallaxX = normX * 0.45;
      targetParallaxY = normY * 0.22;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // Render loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle, natural water ripple
      if (!reducedMotion) {
        const pos = waterGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const z = pos.getZ(i);
          const wave1 = Math.sin(x * 0.15 + elapsedTime * 0.5) * 0.025;
          const wave2 = Math.cos(z * 0.2 + elapsedTime * 0.4) * 0.02;
          pos.setY(i, initialWaterY[i] + wave1 + wave2);
        }
        waterGeo.computeVertexNormals();
        pos.needsUpdate = true;
      }

      // Smooth camera parallax
      if (!reducedMotion) {
        currentParallaxX += (targetParallaxX - currentParallaxX) * 0.04;
        currentParallaxY += (targetParallaxY - currentParallaxY) * 0.04;

        camera.position.x = currentParallaxX;
        camera.position.y = 1.85 + currentParallaxY;
        camera.lookAt(currentParallaxX * 0.35, 2.2 + currentParallaxY * 0.15, -45);
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
      skyGeo.dispose();
      skyMat.dispose();
      hillGeo.dispose();
      hillMat.dispose();
      blossomGeo.dispose();
      blossomMat.dispose();
      treeConeGeo.dispose();
      treeMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      rockMat.dispose();
      cloakMat.dispose();
      headMat.dispose();
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
          background: 'linear-gradient(180deg, #1E2723 0%, #38463E 45%, #586A60 70%, #182522 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '22%',
            width: '28px',
            height: '75px',
            backgroundColor: '#2A352F',
            borderRadius: '14px 14px 0 0',
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
      }}
    />
  );
};
