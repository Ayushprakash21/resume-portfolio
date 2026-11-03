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

    // 1. SCENE SETUP — CONTROLLED BLACK LUXURY ATMOSPHERE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050507');

    // Atmospheric fog: deep charcoal painterly depth
    scene.fog = new THREE.FogExp2('#07080B', 0.008);

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
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // --- 4. LUXURY OBSIDIAN & GRAPHITE SKY DOME ---
    // Smooth visible sky with distinct luminous gradient:
    // Top: pure luxury obsidian (#040406), Mid: dark charcoal graphite (#0C0D12), Horizon: subtle silver mist (#161820)
    const skyGeo = new THREE.SphereGeometry(250, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color('#030305') },
        midColor: { value: new THREE.Color('#0A0B10') },
        horizonColor: { value: new THREE.Color('#14161F') },
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

    // --- 5. CONTROLLED ENVIRONMENTAL LIGHTING SYSTEM ---
    // 5a. Soft ambient illumination (sky/ground hemisphere)
    const ambientLight = new THREE.HemisphereLight('#7A8090', '#07070A', 1.6);
    scene.add(ambientLight);

    // 5b. Key directional light (soft radiance from upper right, non-harsh speculars)
    const keyLight = new THREE.DirectionalLight('#D8DCE8', 1.8);
    keyLight.position.set(18, 28, -12);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // 5c. Foreground fill light (illuminates foreground rocks & water surface softly)
    const fillLight = new THREE.DirectionalLight('#606575', 1.1);
    fillLight.position.set(-14, 12, 14);
    scene.add(fillLight);

    // 5d. CRISP SILVER RIM LIGHTING BEHIND HUMAN FIGURE:
    // Highlight silhouette edge without causing glare on background
    const rimLight = new THREE.DirectionalLight('#FFFFFF', 4.0);
    rimLight.position.set(0, 3.8, -10);
    rimLight.target.position.set(0, 1.8, 2.6);
    scene.add(rimLight);
    scene.add(rimLight.target);

    // 5e. Subtle low-intensity liquid water reflections
    const waterReflectCenter = new THREE.PointLight('#C8C8CE', 1.2, 35);
    waterReflectCenter.position.set(0, 1.2, -16);
    scene.add(waterReflectCenter);

    // --- 6. NATURAL HILLSIDE BANK & DISTANT MOUNTAIN RIDGE ---
    // Grounded hillside rising behind the lake, obsidian topography
    const hillGeo = new THREE.PlaneGeometry(160, 42, 60, 30);
    hillGeo.rotateX(-Math.PI / 2);
    const hillPos = hillGeo.attributes.position;
    for (let i = 0; i < hillPos.count; i++) {
      const x = hillPos.getX(i);
      const z = hillPos.getZ(i);
      const ridge = Math.sin(x * 0.05) * 2.4 + Math.cos(x * 0.12) * 1.2;
      const slope = ((z + 21) / 42) * 5.2;
      hillPos.setY(i, Math.max(0.1, ridge + slope));
    }
    hillGeo.computeVertexNormals();

    const hillMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0A0B0E'),
      roughness: 0.94,
      metalness: 0.04,
      flatShading: true,
    });
    const hillMesh = new THREE.Mesh(hillGeo, hillMat);
    hillMesh.position.set(0, 0, -25);
    hillMesh.receiveShadow = true;
    scene.add(hillMesh);

    // Silhouette conifer tops along the crest of the hill (clean architectural horizon)
    const foliageGroup = new THREE.Group();
    const treeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#060608'),
      roughness: 0.96,
      flatShading: true,
    });
    const treeConeGeo = new THREE.ConeGeometry(0.65, 3.2, 5);

    for (let i = 0; i < 35; i++) {
      const tx = (Math.random() - 0.5) * 110;
      const tz = -30 - Math.random() * 12;
      const ridge = Math.sin(tx * 0.05) * 2.4 + Math.cos(tx * 0.12) * 1.2;
      const ty = Math.max(1.8, ridge + 4.2) + 1.0;
      const tree = new THREE.Mesh(treeConeGeo, treeMat);
      tree.position.set(tx, ty, tz);
      const ts = 0.75 + Math.random() * 0.7;
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
      const n = Math.sin(x * 0.03) * 6.5 + Math.cos(x * 0.07) * 3.5;
      farPos.setY(i, Math.max(0, n + 7.5));
    }
    farRidgeGeo.computeVertexNormals();
    const farRidgeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0E0F15'),
      roughness: 0.96,
      flatShading: true,
    });
    const farRidge = new THREE.Mesh(farRidgeGeo, farRidgeMat);
    farRidge.position.set(0, 0, -65);
    scene.add(farRidge);

    // --- 7. CALM REFLECTIVE LIQUID OBSIDIAN WATER PLANE ---
    // Smooth, deep liquid obsidian lake water reflecting the sky with gentle ripples
    const waterGeo = new THREE.PlaneGeometry(180, 50, 70, 40);
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#050507'),
      roughness: 0.12,
      metalness: 0.92,
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

    // --- 8. GROUNDED FOREGROUND ROCKS (CRAG TEXTURES, POSITIONED AWAY FROM TEXT) ---
    const rockMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#15161C'),
      roughness: 0.85,
      metalness: 0.15,
      flatShading: true,
    });

    const createCragRock = (radius: number, scaleX: number, scaleY: number, scaleZ: number) => {
      const geo = new THREE.DodecahedronGeometry(radius, 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const vz = pos.getZ(i);
        const n = Math.sin(vx * 2.2) * Math.cos(vy * 2.4) * Math.sin(vz * 2.0) * 0.16;
        pos.setXYZ(i, vx + vx * n, vy + vy * n, vz + vz * n);
      }
      geo.computeVertexNormals();
      geo.scale(scaleX, scaleY, scaleZ);
      return new THREE.Mesh(geo, rockMat);
    };

    const rockGroup = new THREE.Group();

    // Right Large Craggy Boulder (Grounded in right foreground)
    const rightBigRock = createCragRock(3.6, 1.2, 0.95, 1.15);
    rightBigRock.position.set(6.8, 0.15, 1.8);
    rightBigRock.rotation.set(0.12, -0.35, 0.08);
    rightBigRock.castShadow = true;
    rightBigRock.receiveShadow = true;
    rockGroup.add(rightBigRock);

    const rightBaseRock = createCragRock(2.2, 1.3, 0.6, 1.2);
    rightBaseRock.position.set(5.4, -0.5, 3.4);
    rockGroup.add(rightBaseRock);

    // Left Foreground Rock Shelf (Lowered significantly so it stays at the bottom and never obstructs the upper-left intro text)
    const leftRock = createCragRock(2.4, 1.1, 0.65, 1.1);
    leftRock.position.set(-7.2, -0.75, 1.8);
    leftRock.rotation.set(0.08, 0.35, -0.05);
    leftRock.castShadow = true;
    leftRock.receiveShadow = true;
    rockGroup.add(leftRock);

    const leftBaseRock = createCragRock(1.9, 1.3, 0.5, 1.15);
    leftBaseRock.position.set(-5.2, -0.7, 3.2);
    rockGroup.add(leftBaseRock);

    // Center Rocky Promontory (Platform where the figure stands looking at the water)
    const centerLedge = createCragRock(2.6, 1.7, 0.65, 1.5);
    centerLedge.position.set(0, -0.5, 2.5);
    centerLedge.rotation.set(0.05, 0.06, -0.02);
    centerLedge.castShadow = true;
    centerLedge.receiveShadow = true;
    rockGroup.add(centerLedge);

    scene.add(rockGroup);

    // --- 9. HUMAN FIGURE (PROMINENT, CRISPLY ILLUMINATED SILHOUETTE) ---
    // Standing centered on the rocky ledge, gazing out at the vast water and horizon
    const figureGroup = new THREE.Group();
    figureGroup.position.set(0, 0.25, 2.5);

    // Metallic cloak material: reflective obsidian chrome with crisp silver specular highlights
    const cloakMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0A0B0F'),
      roughness: 0.22,
      metalness: 0.88,
    });
    const headMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#101217'),
      roughness: 0.20,
      metalness: 0.90,
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
      targetParallaxX = normX * 0.35;
      targetParallaxY = normY * 0.18;
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
          const wave1 = Math.sin(x * 0.15 + elapsedTime * 0.45) * 0.02;
          const wave2 = Math.cos(z * 0.2 + elapsedTime * 0.35) * 0.015;
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
        camera.lookAt(currentParallaxX * 0.3, 2.2 + currentParallaxY * 0.12, -45);
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
          background: 'linear-gradient(180deg, #050507 0%, #0F1015 50%, #050507 100%)',
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
            backgroundColor: '#121216',
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
        zIndex: 1,
      }}
    />
  );
};
