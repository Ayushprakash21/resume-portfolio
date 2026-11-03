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

    // Scene setup with atmospheric fog matching LE:MMA palette (#18211D to #2B3738)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#141C1A');
    scene.fog = new THREE.FogExp2('#162220', 0.012);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 400);
    camera.position.set(0, 2.2, 12);
    camera.lookAt(0, 3.2, -60);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // --- ATMOSPHERIC SKY DOME ---
    // Smooth vertical hemisphere with subtle dusk / twilight gradation
    const skyGeo = new THREE.SphereGeometry(250, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color('#0F1514') },
        midColor: { value: new THREE.Color('#22312F') },
        horizonColor: { value: new THREE.Color('#38494A') },
        offset: { value: 30 },
        exponent: { value: 0.65 },
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
          vec3 sky = mix(horizonColor, midColor, smoothstep(0.0, 0.4, factor));
          sky = mix(sky, topColor, smoothstep(0.4, 1.0, factor));
          gl_FragColor = vec4(sky, 1.0);
        }
      `,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // --- CINEMATIC LIGHTING ---
    const ambientLight = new THREE.HemisphereLight('#4A5F63', '#111615', 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#8FA6A0', 1.6);
    dirLight.position.set(-25, 30, -35);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 5;
    dirLight.shadow.camera.far = 120;
    scene.add(dirLight);

    const softFillLight = new THREE.DirectionalLight('#546E7A', 0.8);
    softFillLight.position.set(30, 15, 10);
    scene.add(softFillLight);

    // --- MOUNTAINS / DISTANT HILLS ---
    // Mountain ridges sculpted with multiple natural octaves
    const createMountainRidge = (
      zPos: number,
      heightScale: number,
      colorHex: string,
      roughnessVal: number
    ) => {
      const segmentsX = 90;
      const segmentsY = 24;
      const widthM = 220;
      const depthM = 40;
      const mGeo = new THREE.PlaneGeometry(widthM, depthM, segmentsX, segmentsY);
      mGeo.rotateX(-Math.PI / 2);

      const pos = mGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);

        // Natural mountain noise: major ridges + jagged peaks + smooth valleys
        const n1 = Math.sin(x * 0.045) * Math.cos(z * 0.05);
        const n2 = Math.sin(x * 0.09 + 1.2) * 0.5 * Math.cos(z * 0.08);
        const n3 = Math.cos(x * 0.18 + 2.5) * 0.25;
        const peakEnvelope = Math.max(0, 1 - Math.pow(x / (widthM * 0.48), 2));
        const zEnvelope = Math.sin(((z + depthM / 2) / depthM) * Math.PI);

        const elevation = (n1 + n2 + n3) * heightScale * peakEnvelope * zEnvelope;
        pos.setY(i, Math.max(0, elevation));
      }
      mGeo.computeVertexNormals();

      const mMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: roughnessVal,
        metalness: 0.05,
        flatShading: true,
      });

      const mesh = new THREE.Mesh(mGeo, mMat);
      mesh.position.set(0, -0.5, zPos);
      mesh.receiveShadow = true;
      return mesh;
    };

    // Far mountain silhouettes (atmospheric deep slate)
    const farMountains = createMountainRidge(-110, 34, '#1B2728', 0.95);
    scene.add(farMountains);

    // Mid-distance rugged hills (muted dark forest)
    const midMountains = createMountainRidge(-65, 20, '#162320', 0.9);
    scene.add(midMountains);

    // Near lake hills (flanking sides to create a natural bay)
    const nearHillsLeft = createMountainRidge(-35, 12, '#141E1C', 0.92);
    nearHillsLeft.position.set(-45, -0.2, -40);
    nearHillsLeft.rotation.y = 0.35;
    scene.add(nearHillsLeft);

    const nearHillsRight = createMountainRidge(-35, 14, '#141E1C', 0.92);
    nearHillsRight.position.set(50, -0.2, -42);
    nearHillsRight.rotation.y = -0.3;
    scene.add(nearHillsRight);

    // --- REFLECTIVE WATER PLANE ---
    // Smooth natural water with gentle rippling shader
    const waterGeo = new THREE.PlaneGeometry(260, 150, 80, 80);
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0F1716'),
      roughness: 0.18,
      metalness: 0.85,
      envMapIntensity: 1.2,
    });

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, -0.15, -45);
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);

    // Save initial water vertex positions for wave animation
    const waterPos = waterGeo.attributes.position;
    const initialWaterY = new Float32Array(waterPos.count);
    for (let i = 0; i < waterPos.count; i++) {
      initialWaterY[i] = waterPos.getY(i);
    }

    // --- FOREGROUND ROCKS & SHORELINE (DARK BASALT / NATURAL STONE) ---
    const rockGroup = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#19211F'),
      roughness: 0.88,
      metalness: 0.08,
      flatShading: true,
    });

    // Central viewing ledge where the human figure stands
    const centerLedgeGeo = new THREE.DodecahedronGeometry(3.6, 1);
    centerLedgeGeo.scale(2.2, 0.65, 1.6);
    const centerLedge = new THREE.Mesh(centerLedgeGeo, rockMat);
    centerLedge.position.set(0, -0.65, 1.2);
    centerLedge.rotation.set(0.1, 0.2, -0.05);
    centerLedge.receiveShadow = true;
    centerLedge.castShadow = true;
    rockGroup.add(centerLedge);

    // Flanking natural rocks along the water edge
    const rockCoords = [
      { x: -3.8, y: -0.4, z: 2.5, s: 1.8, rx: 0.2, ry: 0.5 },
      { x: -6.5, y: -0.3, z: 0.5, s: 2.6, rx: 0.1, ry: 1.2 },
      { x: -9.5, y: 0.1, z: -2.0, s: 3.2, rx: -0.2, ry: 0.8 },
      { x: 3.6, y: -0.4, z: 2.2, s: 1.9, rx: 0.15, ry: -0.4 },
      { x: 6.8, y: -0.2, z: 0.2, s: 2.8, rx: 0.2, ry: -1.0 },
      { x: 10.2, y: 0.2, z: -2.5, s: 3.4, rx: -0.1, ry: 0.6 },
      // Foreground low stones
      { x: -1.6, y: -0.7, z: 3.8, s: 1.2, rx: 0.3, ry: 0.2 },
      { x: 1.8, y: -0.7, z: 3.6, s: 1.3, rx: 0.1, ry: 0.7 },
    ];

    rockCoords.forEach((c) => {
      const rGeo = new THREE.DodecahedronGeometry(c.s, 1);
      rGeo.scale(1.2, 0.7, 1.0);
      const rMesh = new THREE.Mesh(rGeo, rockMat);
      rMesh.position.set(c.x, c.y, c.z);
      rMesh.rotation.set(c.rx, c.ry, 0);
      rMesh.receiveShadow = true;
      rMesh.castShadow = true;
      rockGroup.add(rMesh);
    });

    scene.add(rockGroup);

    // --- SHORELINE VEGETATION & NATURAL FOLIAGE ---
    // Dark forest clusters and shoreline grasses
    const foliageGroup = new THREE.Group();
    const foliageMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1B2621'),
      roughness: 0.92,
      metalness: 0.02,
      flatShading: true,
    });

    // Create stylized conifer trees along the slopes
    const treeGeo = new THREE.ConeGeometry(1.2, 4.2, 5);
    const treeCoords = [
      { x: -14, y: 1.2, z: -8, s: 1.4 },
      { x: -17, y: 1.8, z: -11, s: 1.8 },
      { x: -12, y: 0.8, z: -6, s: 1.1 },
      { x: -21, y: 2.4, z: -15, s: 2.2 },
      { x: 15, y: 1.4, z: -9, s: 1.5 },
      { x: 18, y: 2.0, z: -12, s: 1.9 },
      { x: 13, y: 0.9, z: -7, s: 1.2 },
      { x: 23, y: 2.8, z: -16, s: 2.4 },
    ];

    treeCoords.forEach((tc) => {
      const tree = new THREE.Mesh(treeGeo, foliageMat);
      tree.position.set(tc.x, tc.y + (4.2 * tc.s) / 2 - 0.2, tc.z);
      tree.scale.set(tc.s, tc.s, tc.s);
      tree.rotation.y = Math.random() * Math.PI * 2;
      tree.castShadow = true;
      tree.receiveShadow = true;
      foliageGroup.add(tree);
    });

    // Natural reed / shoreline grass stalks
    const grassBladeGeo = new THREE.ConeGeometry(0.08, 1.4, 3);
    for (let i = 0; i < 48; i++) {
      const grass = new THREE.Mesh(grassBladeGeo, foliageMat);
      const angle = Math.random() * Math.PI * 2;
      const dist = 3.5 + Math.random() * 5.0;
      const side = Math.random() > 0.5 ? 1 : -1;
      grass.position.set(
        side * (2.8 + Math.random() * 4.5),
        -0.2 + Math.random() * 0.3,
        1.0 + Math.random() * 2.5
      );
      grass.rotation.set(
        (Math.random() - 0.5) * 0.3,
        angle,
        (Math.random() - 0.5) * 0.3
      );
      grass.scale.set(0.8 + Math.random() * 0.6, 0.7 + Math.random() * 0.6, 0.8 + Math.random() * 0.6);
      foliageGroup.add(grass);
    }

    scene.add(foliageGroup);

    // --- ART-DIRECTED HUMAN FIGURE VIEWED FROM BEHIND ---
    // Positioned near lower-middle (x: 0, z: 1.8), standing on the rock ledge
    // Minimalist tailored dark silhouette, natural proportions, viewing the landscape
    const figureGroup = new THREE.Group();
    figureGroup.position.set(0, 0.15, 1.8);

    const coatMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#141817'),
      roughness: 0.85,
      metalness: 0.05,
    });
    const trousersMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#101413'),
      roughness: 0.9,
      metalness: 0.04,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0A0C0C'),
      roughness: 0.95,
      metalness: 0.02,
    });

    // Torso / Overcoat (viewed from back)
    const coatGeo = new THREE.CylinderGeometry(0.34, 0.44, 1.15, 12);
    coatGeo.scale(1.0, 1.0, 0.75); // Flatter depth
    const coat = new THREE.Mesh(coatGeo, coatMat);
    coat.position.set(0, 0.85, 0);
    coat.castShadow = true;
    figureGroup.add(coat);

    // Shoulders & Collar
    const shoulderGeo = new THREE.BoxGeometry(0.78, 0.22, 0.34);
    const shoulders = new THREE.Mesh(shoulderGeo, coatMat);
    shoulders.position.set(0, 1.38, 0);
    shoulders.castShadow = true;
    figureGroup.add(shoulders);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.18, 8);
    const neck = new THREE.Mesh(neckGeo, coatMat);
    neck.position.set(0, 1.54, 0);
    figureGroup.add(neck);

    // Head / Hair (viewed from behind)
    const headGeo = new THREE.SphereGeometry(0.19, 14, 12);
    headGeo.scale(0.85, 1.05, 0.92);
    const head = new THREE.Mesh(headGeo, hairMat);
    head.position.set(0, 1.72, -0.02);
    head.castShadow = true;
    figureGroup.add(head);

    // Arms resting naturally by the sides
    const leftArmGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.95, 8);
    const leftArm = new THREE.Mesh(leftArmGeo, coatMat);
    leftArm.position.set(-0.44, 0.95, 0.02);
    leftArm.rotation.z = 0.08;
    leftArm.castShadow = true;
    figureGroup.add(leftArm);

    const rightArmGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.95, 8);
    const rightArm = new THREE.Mesh(rightArmGeo, coatMat);
    rightArm.position.set(0.44, 0.95, 0.02);
    rightArm.rotation.z = -0.08;
    rightArm.castShadow = true;
    figureGroup.add(rightArm);

    // Legs / Trousers
    const leftLegGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.85, 8);
    const leftLeg = new THREE.Mesh(leftLegGeo, trousersMat);
    leftLeg.position.set(-0.17, 0.15, 0);
    leftLeg.castShadow = true;
    figureGroup.add(leftLeg);

    const rightLegGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.85, 8);
    const rightLeg = new THREE.Mesh(rightLegGeo, trousersMat);
    rightLeg.position.set(0.17, 0.15, 0);
    rightLeg.castShadow = true;
    figureGroup.add(rightLeg);

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
      targetParallaxX = normX * 0.55;
      targetParallaxY = normY * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    };

    window.addEventListener('resize', handleResize);

    // Render loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle water ripple animation
      if (!reducedMotion) {
        const pos = waterGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const z = pos.getZ(i);
          const wave1 = Math.sin(x * 0.12 + elapsedTime * 0.5) * 0.04;
          const wave2 = Math.cos(z * 0.16 + elapsedTime * 0.4) * 0.03;
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
        camera.position.y = 2.2 + currentParallaxY;
        camera.lookAt(currentParallaxX * 0.4, 3.2 + currentParallaxY * 0.2, -60);
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
      waterGeo.dispose();
      waterMat.dispose();
      rockMat.dispose();
      foliageMat.dispose();
    };
  }, [reducedMotion]);

  if (webGLFailed) {
    // Elegant Art-Directed Fallback
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'linear-gradient(180deg, #0F1514 0%, #1A2624 45%, #253533 70%, #111716 100%)',
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
            backgroundColor: '#111514',
            borderRadius: '14px 14px 0 0',
            opacity: 0.85,
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
