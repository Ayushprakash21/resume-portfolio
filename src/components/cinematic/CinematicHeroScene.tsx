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
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1A201C');
    // Atmospheric fog matching the olive-charcoal moody sky
    scene.fog = new THREE.FogExp2('#222B26', 0.014);

    // 2. CAMERA SETUP
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 300);
    camera.position.set(0, 1.8, 8.5);
    camera.lookAt(0, 2.2, -40);

    // 3. RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // --- SKY DOME (MOODY OLIVE-CHARCOAL OVERCAST ATMOSPHERE) ---
    const skyGeo = new THREE.SphereGeometry(220, 32, 20);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color('#161C19') },      // Deep olive charcoal
        midColor: { value: new THREE.Color('#2C362F') },      // Muted moody olive
        horizonColor: { value: new THREE.Color('#465348') },  // Soft horizon haze
        offset: { value: 18 },
        exponent: { value: 0.7 },
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

    // --- LIGHTING ---
    const ambientLight = new THREE.HemisphereLight('#4A5A4E', '#111714', 1.5);
    scene.add(ambientLight);

    // Key directional light from above right, casting soft specular sheen on water and rocks
    const keyLight = new THREE.DirectionalLight('#9FB4A2', 1.4);
    keyLight.position.set(15, 25, -10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Soft frontal fill
    const fillLight = new THREE.DirectionalLight('#54695D', 0.8);
    fillLight.position.set(-15, 12, 12);
    scene.add(fillLight);

    // Subtle golden glow light over the flower bank
    const floralGlowLight = new THREE.PointLight('#E5BF72', 2.0, 50);
    floralGlowLight.position.set(0, 4.5, -28);
    scene.add(floralGlowLight);

    // --- DISTANT HILL / MOUNTAIN SILHOUETTES & FLORAL BANK ---
    const createMountainRidge = (zPos: number, heightScale: number, colorHex: string) => {
      const geo = new THREE.PlaneGeometry(160, 40, 60, 20);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const h1 = Math.sin(x * 0.05) * 4.5;
        const h2 = Math.cos(x * 0.12 + 1.0) * 2.2;
        const zRamp = Math.max(0, (z + 20) * 0.25);
        pos.setY(i, Math.max(0, (h1 + h2 + 4.0) * heightScale + zRamp));
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: 0.9,
        metalness: 0.05,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, zPos);
      mesh.receiveShadow = true;
      return mesh;
    };

    // Distant background ridge
    const distantRidge = createMountainRidge(-48, 0.85, '#121A16');
    scene.add(distantRidge);

    // Middleground lush floral bank
    const bankMesh = createMountainRidge(-32, 0.65, '#15201A');
    scene.add(bankMesh);

    // --- INSTANCED SHIMMERING FLOWERS (GOLDEN & PALE BLUE) ---
    // Creates that magical field of lights from LE:MMA Studio
    const flowerCount = 1400;
    const flowerGeo = new THREE.DodecahedronGeometry(0.18, 0);

    // Golden blossoms
    const goldFlowerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F2CE80'),
      emissive: new THREE.Color('#D8A447'),
      emissiveIntensity: 0.6,
      roughness: 0.4,
    });
    const goldInstanced = new THREE.InstancedMesh(flowerGeo, goldFlowerMat, flowerCount / 2);

    // Pale blue blossoms
    const blueFlowerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#94D2E6'),
      emissive: new THREE.Color('#4DA2BD'),
      emissiveIntensity: 0.5,
      roughness: 0.4,
    });
    const blueInstanced = new THREE.InstancedMesh(flowerGeo, blueFlowerMat, flowerCount / 2);

    const dummy = new THREE.Object3D();
    let gIdx = 0;
    let bIdx = 0;

    for (let i = 0; i < flowerCount; i++) {
      const x = (Math.random() - 0.5) * 110;
      const z = -22 - Math.random() * 22;
      // Calculate approximate height on bank
      const h1 = Math.sin(x * 0.05) * 4.5;
      const h2 = Math.cos(x * 0.12 + 1.0) * 2.2;
      const y = Math.max(0.4, (h1 + h2 + 4.0) * 0.65 * 0.8 + Math.random() * 0.8);

      dummy.position.set(x, y, z);
      const scale = 0.5 + Math.random() * 0.9;
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.updateMatrix();

      if (i % 2 === 0 && gIdx < flowerCount / 2) {
        goldInstanced.setMatrixAt(gIdx++, dummy.matrix);
      } else if (bIdx < flowerCount / 2) {
        blueInstanced.setMatrixAt(bIdx++, dummy.matrix);
      }
    }
    goldInstanced.instanceMatrix.needsUpdate = true;
    blueInstanced.instanceMatrix.needsUpdate = true;
    // Foliage container for all floral & shrubbery elements
    const foliageGroup = new THREE.Group();
    foliageGroup.add(goldInstanced);
    foliageGroup.add(blueInstanced);
    scene.add(foliageGroup);

    // --- REFLECTIVE WATER PLANE ---
    const waterGeo = new THREE.PlaneGeometry(160, 80, 60, 40);
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0D1513'),
      roughness: 0.14,
      metalness: 0.92,
      envMapIntensity: 1.4,
    });

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, -0.15, -16);
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);

    // Save initial water positions for ripple animation
    const waterPos = waterGeo.attributes.position;
    const initialWaterY = new Float32Array(waterPos.count);
    for (let i = 0; i < waterPos.count; i++) {
      initialWaterY[i] = waterPos.getY(i);
    }

    // --- FOREGROUND ROCKS & BOULDERS (EXACT COMPOSITION) ---
    // Right large rock boulder, Left outcrop, Center viewing rock
    const rockMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#222B27'),
      roughness: 0.88,
      metalness: 0.08,
      flatShading: true,
    });

    // Custom helper to generate craggy rock mesh
    const createCragRock = (radius: number, scaleX: number, scaleY: number, scaleZ: number) => {
      const geo = new THREE.DodecahedronGeometry(radius, 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const vz = pos.getZ(i);
        // Craggy noise displacement
        const n = Math.sin(vx * 2.2) * Math.cos(vy * 2.5) * Math.sin(vz * 2.1) * 0.16;
        pos.setXYZ(i, vx + vx * n, vy + vy * n, vz + vz * n);
      }
      geo.computeVertexNormals();
      geo.scale(scaleX, scaleY, scaleZ);
      return new THREE.Mesh(geo, rockMat);
    };

    const rockGroup = new THREE.Group();

    // 1. Right Large Prominent Rock Boulder (Iconic LE:MMA feature)
    const rightBigRock = createCragRock(3.8, 1.25, 0.95, 1.1);
    rightBigRock.position.set(6.6, 0.5, 2.2);
    rightBigRock.rotation.set(0.15, -0.4, 0.1);
    rightBigRock.castShadow = true;
    rightBigRock.receiveShadow = true;
    rockGroup.add(rightBigRock);

    // Secondary right rock base
    const rightBaseRock = createCragRock(2.4, 1.3, 0.6, 1.2);
    rightBaseRock.position.set(5.2, -0.4, 3.8);
    rightBaseRock.rotation.set(0.1, 0.2, -0.05);
    rockGroup.add(rightBaseRock);

    // 2. Left Foreground Outcrop
    const leftRock = createCragRock(3.2, 1.15, 0.8, 1.05);
    leftRock.position.set(-6.2, 0.1, 2.0);
    leftRock.rotation.set(0.1, 0.45, -0.08);
    leftRock.castShadow = true;
    leftRock.receiveShadow = true;
    rockGroup.add(leftRock);

    const leftBaseRock = createCragRock(2.1, 1.4, 0.6, 1.1);
    leftBaseRock.position.set(-4.5, -0.5, 3.6);
    rockGroup.add(leftBaseRock);

    // 3. Center Rocky Ledge (Where the figure stands)
    const centerLedge = createCragRock(2.6, 1.6, 0.55, 1.4);
    centerLedge.position.set(0, -0.6, 2.8);
    centerLedge.rotation.set(0.08, 0.1, -0.02);
    centerLedge.castShadow = true;
    centerLedge.receiveShadow = true;
    rockGroup.add(centerLedge);

    scene.add(rockGroup);

    // --- ART-DIRECTED SOLITARY FIGURE VIEWED FROM BEHIND ---
    // Positioned on the center rock (x: 0, z: 2.8), gazing over the water toward the glowing bank
    const figureGroup = new THREE.Group();
    figureGroup.position.set(0, 0.25, 2.8);

    // Figure cloak / sleek coat material with subtle specular sheen
    const cloakMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#161D1A'),
      roughness: 0.55,
      metalness: 0.35,
    });
    const headMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2A332E'),
      roughness: 0.6,
      metalness: 0.25,
    });

    // Flowing cloak torso
    const cloakGeo = new THREE.CylinderGeometry(0.36, 0.58, 1.35, 16);
    cloakGeo.scale(1.0, 1.0, 0.7);
    const cloak = new THREE.Mesh(cloakGeo, cloakMat);
    cloak.position.set(0, 0.95, 0);
    cloak.castShadow = true;
    figureGroup.add(cloak);

    // Sculpted mantle / draped shoulders
    const mantleGeo = new THREE.SphereGeometry(0.48, 14, 12);
    mantleGeo.scale(1.0, 0.5, 0.65);
    const mantle = new THREE.Mesh(mantleGeo, cloakMat);
    mantle.position.set(0, 1.55, 0.02);
    mantle.castShadow = true;
    figureGroup.add(mantle);

    // Figure Head (viewed from behind, serene posture)
    const headGeo = new THREE.SphereGeometry(0.2, 14, 12);
    headGeo.scale(0.85, 1.05, 0.92);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.88, -0.03);
    head.castShadow = true;
    figureGroup.add(head);

    scene.add(figureGroup);

    // --- MOUSE PARALLAX & ANIMATION LOOP ---
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (reducedMotion) return;
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetParallaxX = normX * 0.45;
      targetParallaxY = normY * 0.25;
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

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle water ripple
      if (!reducedMotion) {
        const pos = waterGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const z = pos.getZ(i);
          const wave1 = Math.sin(x * 0.18 + elapsedTime * 0.6) * 0.03;
          const wave2 = Math.cos(z * 0.22 + elapsedTime * 0.5) * 0.025;
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
        camera.position.y = 1.8 + currentParallaxY;
        camera.lookAt(currentParallaxX * 0.35, 2.2 + currentParallaxY * 0.15, -40);
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
      flowerGeo.dispose();
      goldFlowerMat.dispose();
      blueFlowerMat.dispose();
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
          background: 'linear-gradient(180deg, #161C19 0%, #2C362F 45%, #465348 70%, #0D1513 100%)',
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
            backgroundColor: '#161D1A',
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
