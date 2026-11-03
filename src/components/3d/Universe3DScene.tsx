import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  Compass,
  Eye,
  RotateCcw,
  Sparkles,
  ArrowDown,
  Volume2,
  VolumeX,
  Keyboard,
  MousePointer,
} from 'lucide-react';

interface LandmarkData {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  position: THREE.Vector3;
  cameraOffset: THREE.Vector3;
  lookAt: THREE.Vector3;
  color: string;
  accentHex: number;
}

interface Universe3DSceneProps {
  onSelectLandmark: (id: string) => void;
  activeLandmarkId: string | null;
  onSkipToEditorial: () => void;
  reducedMotion: boolean;
}

export const Universe3DScene: React.FC<Universe3DSceneProps> = ({
  onSelectLandmark,
  activeLandmarkId,
  onSkipToEditorial,
  reducedMotion,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredLandmark, setHoveredLandmark] = useState<LandmarkData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const [keyboardNavActive, setKeyboardNavActive] = useState(false);

  // References across lifecycle
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const landmarkMeshes = useRef<Map<string, THREE.Group>>(new Map());
  const animationFrameId = useRef<number | null>(null);

  // Key tracking for WASD flight
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const cameraPos = useRef(new THREE.Vector3(0, 36, 62));
  const cameraTarget = useRef(new THREE.Vector3(0, 4, 0));

  // Definition of the 6 Handcrafted Architectural Landmarks
  const landmarks: LandmarkData[] = [
    {
      id: 'overview',
      name: 'Identity Sanctum',
      subtitle: 'Ayush Prakash • Operations & Systems',
      category: 'PROFESSIONAL IDENTITY',
      position: new THREE.Vector3(0, 0, 0),
      cameraOffset: new THREE.Vector3(0, 12, 22),
      lookAt: new THREE.Vector3(0, 6, 0),
      color: '#45D6FF',
      accentHex: 0x45D6FF,
    },
    {
      id: 'experience',
      name: 'Career Amphitheater',
      subtitle: 'Chronological Operations Milestones',
      category: 'CAREER TIMELINE',
      position: new THREE.Vector3(-24, 0, 10),
      cameraOffset: new THREE.Vector3(-24, 14, 28),
      lookAt: new THREE.Vector3(-24, 5, 10),
      color: '#8AB4FF',
      accentHex: 0x8AB4FF,
    },
    {
      id: 'orion9',
      name: 'Orion-9 Logistics Nexus',
      subtitle: 'Supply Chain Operating System',
      category: 'FLAGSHIP ENTERPRISE OS',
      position: new THREE.Vector3(26, 0, 14),
      cameraOffset: new THREE.Vector3(26, 14, 32),
      lookAt: new THREE.Vector3(26, 6, 14),
      color: '#42D6A4',
      accentHex: 0x42D6A4,
    },
    {
      id: 'applywise',
      name: 'ApplyVise AI Core',
      subtitle: 'Grounded Career Intelligence Platform',
      category: 'FLAGSHIP AI PRODUCT',
      position: new THREE.Vector3(22, 0, -18),
      cameraOffset: new THREE.Vector3(22, 14, -2),
      lookAt: new THREE.Vector3(22, 5, -18),
      color: '#A78BFA',
      accentHex: 0xA78BFA,
    },
    {
      id: 'certifications',
      name: 'Accreditation Vault',
      subtitle: 'Verified Industry Credentials',
      category: 'CERTIFICATIONS & HONORS',
      position: new THREE.Vector3(-22, 0, -16),
      cameraOffset: new THREE.Vector3(-22, 12, 0),
      lookAt: new THREE.Vector3(-22, 5, -16),
      color: '#E5B94E',
      accentHex: 0xE5B94E,
    },
    {
      id: 'contact',
      name: 'Transmission Relay',
      subtitle: 'Direct Communications Dispatch',
      category: 'COMMUNICATIONS RELAY',
      position: new THREE.Vector3(0, 0, 28),
      cameraOffset: new THREE.Vector3(0, 12, 44),
      lookAt: new THREE.Vector3(0, 6, 28),
      color: '#45D6FF',
      accentHex: 0x45D6FF,
    },
  ];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Simulate progressive asset preparation
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 25;
      setLoadingProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(progressInterval);
        setIsLoaded(true);
      }
    }, 120);

    // 1. Scene Setup with Deep Tone Atmospheric Fog
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x07090D);
    scene.fog = new THREE.FogExp2(0x07090D, 0.009);

    // 2. Camera Setup
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 1000);
    camera.position.copy(cameraPos.current);
    camera.lookAt(cameraTarget.current);
    cameraRef.current = camera;

    // 3. Renderer with ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0x0C1118, 2.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x8AB4FF, 3.2);
    sunLight.position.set(35, 55, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x777BFF, 1.8);
    fillLight.position.set(-40, 25, -30);
    scene.add(fillLight);

    // 5. Environmental Ground Plane with Spatial Grid & Coordinate Rings
    const grid = new THREE.GridHelper(160, 60, 0x1B2836, 0x101620);
    grid.position.y = -0.05;
    scene.add(grid);

    // Circular coordinate rings
    [16, 32, 48].forEach((radius, i) => {
      const ringGeo = new THREE.RingGeometry(radius, radius + 0.18, 72);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x45D6FF : 0x8AB4FF,
        transparent: true,
        opacity: 0.16 - i * 0.04,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.02;
      scene.add(ring);
    });

    // 6. BUILD MEANINGFUL HANDCRAFTED ARCHITECTURAL LANDMARKS

    // LANDMARK 1: IDENTITY SANCTUM (0, 0, 0)
    const idGroup = new THREE.Group();
    idGroup.position.set(0, 0, 0);

    // Tiered obsidian base
    const idBaseGeo = new THREE.CylinderGeometry(4.2, 5.0, 1.0, 8);
    const idBaseMat = new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.2, metalness: 0.85 });
    const idBase = new THREE.Mesh(idBaseGeo, idBaseMat);
    idBase.position.y = 0.5;
    idGroup.add(idBase);

    // Monumental Central Prism
    const idPrismGeo = new THREE.BoxGeometry(2.2, 9.0, 2.2);
    const idPrismMat = new THREE.MeshStandardMaterial({
      color: 0x151E29,
      emissive: 0x051824,
      roughness: 0.1,
      metalness: 0.9,
    });
    const idPrism = new THREE.Mesh(idPrismGeo, idPrismMat);
    idPrism.position.y = 5.5;
    idPrism.castShadow = true;
    idGroup.add(idPrism);

    // Rotating wireframe hypercage
    const idCageGeo = new THREE.OctahedronGeometry(2.6, 0);
    const idCageMat = new THREE.MeshBasicMaterial({ color: 0x45D6FF, wireframe: true });
    const idCage = new THREE.Mesh(idCageGeo, idCageMat);
    idCage.position.y = 11.2;
    idGroup.add(idCage);

    scene.add(idGroup);
    landmarkMeshes.current.set('overview', idGroup);

    // LANDMARK 2: CAREER AMPHITHEATER (-24, 0, 10)
    const expGroup = new THREE.Group();
    expGroup.position.set(-24, 0, 10);

    const expBaseGeo = new THREE.CylinderGeometry(4.8, 5.5, 0.8, 32, 1, false, 0, Math.PI * 1.5);
    const expBaseMat = new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.3, metalness: 0.8 });
    const expBase = new THREE.Mesh(expBaseGeo, expBaseMat);
    expBase.position.y = 0.4;
    expGroup.add(expBase);

    // Ascending milestone pillars
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 1.2;
      const x = Math.cos(angle) * 3.4;
      const z = Math.sin(angle) * 3.4;
      const height = 3.0 + i * 1.6;
      const pillarGeo = new THREE.BoxGeometry(0.9, height, 0.9);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1B2836, roughness: 0.2, metalness: 0.7 });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x, height / 2 + 0.8, z);
      pillar.castShadow = true;
      expGroup.add(pillar);
    }

    scene.add(expGroup);
    landmarkMeshes.current.set('experience', expGroup);

    // LANDMARK 3: ORION-9 LOGISTICS NEXUS (26, 0, 14)
    const orionGroup = new THREE.Group();
    orionGroup.position.set(26, 0, 14);

    const orionBaseGeo = new THREE.CylinderGeometry(4.4, 5.2, 0.8, 6);
    const orionBaseMat = new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.3, metalness: 0.8 });
    const orionBase = new THREE.Mesh(orionBaseGeo, orionBaseMat);
    orionBase.position.y = 0.4;
    orionGroup.add(orionBase);

    // Core Planetary Geodesic Sphere
    const orionCoreGeo = new THREE.IcosahedronGeometry(2.4, 2);
    const orionCoreMat = new THREE.MeshStandardMaterial({
      color: 0x112A1F,
      emissive: 0x0E3825,
      roughness: 0.2,
      metalness: 0.8,
    });
    const orionCore = new THREE.Mesh(orionCoreGeo, orionCoreMat);
    orionCore.position.y = 5.2;
    orionCore.castShadow = true;
    orionGroup.add(orionCore);

    // Concentric revolving supply chain orbits
    const orbit1Geo = new THREE.TorusGeometry(3.8, 0.08, 16, 64);
    const orbit1Mat = new THREE.MeshBasicMaterial({ color: 0x42D6A4 });
    const orbit1 = new THREE.Mesh(orbit1Geo, orbit1Mat);
    orbit1.position.y = 5.2;
    orbit1.rotation.x = Math.PI / 3;
    orionGroup.add(orbit1);

    const orbit2Geo = new THREE.TorusGeometry(4.5, 0.06, 16, 64);
    const orbit2Mat = new THREE.MeshBasicMaterial({ color: 0x8AB4FF, transparent: true, opacity: 0.7 });
    const orbit2 = new THREE.Mesh(orbit2Geo, orbit2Mat);
    orbit2.position.y = 5.2;
    orbit2.rotation.y = Math.PI / 4;
    orionGroup.add(orbit2);

    scene.add(orionGroup);
    landmarkMeshes.current.set('orion9', orionGroup);

    // LANDMARK 4: APPLYVISE AI CORE (22, 0, -18)
    const applyGroup = new THREE.Group();
    applyGroup.position.set(22, 0, -18);

    const applyBaseGeo = new THREE.CylinderGeometry(4.2, 5.0, 0.8, 8);
    const applyBaseMat = new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.3, metalness: 0.8 });
    const applyBase = new THREE.Mesh(applyBaseGeo, applyBaseMat);
    applyBase.position.y = 0.4;
    applyGroup.add(applyBase);

    // Prismatic Polyhedron Core
    const aiCoreGeo = new THREE.OctahedronGeometry(2.6, 0);
    const aiCoreMat = new THREE.MeshStandardMaterial({
      color: 0x221838,
      emissive: 0x2B1854,
      roughness: 0.15,
      metalness: 0.9,
    });
    const aiCore = new THREE.Mesh(aiCoreGeo, aiCoreMat);
    aiCore.position.y = 5.4;
    aiCore.castShadow = true;
    applyGroup.add(aiCore);

    // Neural connector wireframe shell
    const aiShellGeo = new THREE.DodecahedronGeometry(3.6, 0);
    const aiShellMat = new THREE.MeshBasicMaterial({ color: 0xA78BFA, wireframe: true, transparent: true, opacity: 0.6 });
    const aiShell = new THREE.Mesh(aiShellGeo, aiShellMat);
    aiShell.position.y = 5.4;
    applyGroup.add(aiShell);

    scene.add(applyGroup);
    landmarkMeshes.current.set('applywise', applyGroup);

    // LANDMARK 5: ACCREDITATION VAULT (-22, 0, -16)
    const certGroup = new THREE.Group();
    certGroup.position.set(-22, 0, -16);

    const certBaseGeo = new THREE.CylinderGeometry(4.2, 5.0, 0.8, 8);
    const certBaseMat = new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.3, metalness: 0.8 });
    const certBase = new THREE.Mesh(certBaseGeo, certBaseMat);
    certBase.position.y = 0.4;
    certGroup.add(certBase);

    // Gold crystalline obelisk
    const obeliskGeo = new THREE.ConeGeometry(2.0, 7.5, 4);
    const obeliskMat = new THREE.MeshStandardMaterial({
      color: 0x261E0F,
      emissive: 0x36290E,
      roughness: 0.15,
      metalness: 0.95,
    });
    const obelisk = new THREE.Mesh(obeliskGeo, obeliskMat);
    obelisk.position.y = 4.8;
    obelisk.rotation.y = Math.PI / 4;
    obelisk.castShadow = true;
    certGroup.add(obelisk);

    const sealRingGeo = new THREE.TorusGeometry(2.6, 0.08, 16, 48);
    const sealRingMat = new THREE.MeshBasicMaterial({ color: 0xE5B94E });
    const sealRing = new THREE.Mesh(sealRingGeo, sealRingMat);
    sealRing.position.y = 8.2;
    certGroup.add(sealRing);

    scene.add(certGroup);
    landmarkMeshes.current.set('certifications', certGroup);

    // LANDMARK 6: TRANSMISSION RELAY (0, 0, 28)
    const relayGroup = new THREE.Group();
    relayGroup.position.set(0, 0, 28);

    const relayBaseGeo = new THREE.CylinderGeometry(3.6, 4.4, 0.8, 6);
    const relayBaseMat = new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.3, metalness: 0.8 });
    const relayBase = new THREE.Mesh(relayBaseGeo, relayBaseMat);
    relayBase.position.y = 0.4;
    relayGroup.add(relayBase);

    // Broadcast Tower Column
    const towerGeo = new THREE.CylinderGeometry(0.4, 1.2, 9.0, 6);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x151E29, roughness: 0.2, metalness: 0.85 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 5.2;
    tower.castShadow = true;
    relayGroup.add(tower);

    const pulseLight = new THREE.PointLight(0x45D6FF, 3.5, 30);
    pulseLight.position.set(0, 9.8, 0);
    relayGroup.add(pulseLight);

    scene.add(relayGroup);
    landmarkMeshes.current.set('contact', relayGroup);

    // 7. Raycasting & Hover / Click Interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      let found: LandmarkData | null = null;
      for (const lm of landmarks) {
        const group = landmarkMeshes.current.get(lm.id);
        if (group) {
          const hits = raycaster.intersectObjects(group.children, true);
          if (hits.length > 0) {
            found = lm;
            break;
          }
        }
      }

      if (found) {
        container.style.cursor = 'pointer';
        setHoveredLandmark(found);
        setTooltipPos({ x: e.clientX, y: e.clientY });
      } else {
        container.style.cursor = 'default';
        setHoveredLandmark(null);
      }
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      for (const lm of landmarks) {
        const group = landmarkMeshes.current.get(lm.id);
        if (group) {
          const hits = raycaster.intersectObjects(group.children, true);
          if (hits.length > 0) {
            flyCameraToLandmark(lm);
            onSelectLandmark(lm.id);
            break;
          }
        }
      }
    };

    // 8. Keyboard Controls for WASD Spatial Flight
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      setKeyboardNavActive(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // 9. Resize Listener
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. GSAP Camera Fly Helper
    const flyCameraToLandmark = (lm: LandmarkData) => {
      setIsFocused(true);
      const targetPos = lm.position.clone().add(lm.cameraOffset);

      if (reducedMotion) {
        camera.position.copy(targetPos);
        camera.lookAt(lm.lookAt);
      } else {
        gsap.to(camera.position, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 1.8,
          ease: 'power3.inOut',
        });
        gsap.to(cameraTarget.current, {
          x: lm.lookAt.x,
          y: lm.lookAt.y,
          z: lm.lookAt.z,
          duration: 1.8,
          ease: 'power3.inOut',
          onUpdate: () => camera.lookAt(cameraTarget.current),
        });
      }
    };

    // 11. Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Keyboard drone movement if active
      if (!isFocused) {
        const speed = 18 * delta;
        if (keysPressed.current['w'] || keysPressed.current['arrowup']) camera.position.z -= speed;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) camera.position.z += speed;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) camera.position.x -= speed;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) camera.position.x += speed;
      }

      // Kinetic architectural animations
      idCage.rotation.y = elapsed * 0.5;
      idCage.rotation.x = elapsed * 0.25;

      orbit1.rotation.z = elapsed * 0.7;
      orbit2.rotation.z = -elapsed * 0.5;

      aiCore.rotation.y = elapsed * 0.6;
      aiShell.rotation.y = -elapsed * 0.4;
      aiShell.rotation.x = elapsed * 0.3;

      obelisk.rotation.y = elapsed * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      clearInterval(progressInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      renderer.dispose();
    };
  }, [reducedMotion]);

  // Synchronize camera flight when activeLandmarkId changes externally
  useEffect(() => {
    if (!activeLandmarkId) {
      resetToGalaxyOverview();
      return;
    }
    const match = landmarks.find((l) => l.id === activeLandmarkId);
    if (match && cameraRef.current) {
      setIsFocused(true);
      const targetPos = match.position.clone().add(match.cameraOffset);
      if (reducedMotion) {
        cameraRef.current.position.copy(targetPos);
        cameraRef.current.lookAt(match.lookAt);
      } else {
        gsap.to(cameraRef.current.position, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 1.6,
          ease: 'power3.inOut',
        });
        gsap.to(cameraTarget.current, {
          x: match.lookAt.x,
          y: match.lookAt.y,
          z: match.lookAt.z,
          duration: 1.6,
          ease: 'power3.inOut',
          onUpdate: () => cameraRef.current?.lookAt(cameraTarget.current),
        });
      }
    }
  }, [activeLandmarkId, reducedMotion]);

  const resetToGalaxyOverview = () => {
    setIsFocused(false);
    onSelectLandmark('overview');
    if (!cameraRef.current) return;
    if (reducedMotion) {
      cameraRef.current.position.set(0, 36, 62);
      cameraRef.current.lookAt(0, 4, 0);
    } else {
      gsap.to(cameraRef.current.position, {
        x: 0,
        y: 36,
        z: 62,
        duration: 1.8,
        ease: 'power3.inOut',
      });
      gsap.to(cameraTarget.current, {
        x: 0,
        y: 4,
        z: 0,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => cameraRef.current?.lookAt(cameraTarget.current),
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* 3D Canvas Mounting Point */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Loading Experience with Progress Indicator */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#07090D',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
          }}
        >
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: '#F5F7FA', marginBottom: '16px' }}>
            INITIALIZING DIGITAL UNIVERSE
          </div>
          <div
            style={{
              width: '240px',
              height: '3px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: `${loadingProgress}%`,
                height: '100%',
                backgroundColor: 'var(--accent-primary)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            LOADING SPATIAL MESHES & SHADERS // {loadingProgress}%
          </div>
        </div>
      )}

      {/* Floating 3D Hover Tooltip */}
      {hoveredLandmark && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPos.x + 14,
            top: tooltipPos.y - 14,
            pointerEvents: 'none',
            zIndex: 40,
            backgroundColor: 'rgba(12, 17, 24, 0.95)',
            border: `1px solid ${hoveredLandmark.color}`,
            borderRadius: 'var(--radius-sm)',
            padding: '10px 16px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: hoveredLandmark.color, textTransform: 'uppercase', marginBottom: '2px' }}>
            {hoveredLandmark.category}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
            {hoveredLandmark.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {hoveredLandmark.subtitle} ❯ Click to Enter
          </div>
        </div>
      )}

      {/* Top Right Quick Skip to Editorial Controls */}
      <div
        style={{
          position: 'absolute',
          top: '84px',
          right: '24px',
          zIndex: 30,
          display: 'flex',
          gap: '10px',
        }}
      >
        <button
          onClick={onSkipToEditorial}
          style={{
            background: 'rgba(21, 30, 41, 0.85)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <ArrowDown size={12} />
          <span>SKIP TO EDITORIAL VIEW</span>
        </button>
      </div>

      {/* Navigation HUD Hint Badge */}
      <div
        style={{
          position: 'absolute',
          top: '84px',
          left: '24px',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(21, 30, 41, 0.65)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          backdropFilter: 'blur(8px)',
        }}
        className="flight-hint-hud"
      >
        <Keyboard size={12} color="var(--accent-primary)" />
        <span>WASD / ARROWS TO EXPLORE • CLICK LANDMARK TO FOCUS</span>
      </div>

      {/* Reset to Galaxy Overview Center Button */}
      {isFocused && (
        <button
          onClick={resetToGalaxyOverview}
          style={{
            position: 'absolute',
            bottom: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 35,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(12, 17, 24, 0.95)',
            border: '1px solid var(--accent-primary)',
            color: 'var(--accent-primary)',
            padding: '10px 22px',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 0 24px rgba(69, 214, 255, 0.25)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <RotateCcw size={14} />
          <span>RETURN TO GALAXY OVERVIEW</span>
        </button>
      )}

      {/* Interactive Landmark Dock at Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '24px',
          right: '24px',
          zIndex: 30,
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {landmarks.map((lm) => {
          const isSelected = activeLandmarkId === lm.id;
          return (
            <button
              key={lm.id}
              onClick={() => {
                onSelectLandmark(lm.id);
              }}
              style={{
                background: isSelected ? 'rgba(69, 214, 255, 0.2)' : 'rgba(12, 17, 24, 0.85)',
                border: `1px solid ${isSelected ? lm.color : 'var(--border-subtle)'}`,
                color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s ease',
              }}
            >
              {lm.name}
            </button>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .flight-hint-hud {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
