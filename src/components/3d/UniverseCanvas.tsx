import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface UniverseCanvasProps {
  onSelectZone: (zoneId: string) => void;
  activeZone: string | null;
}

interface StructureTarget {
  id: string;
  name: string;
  category: string;
  mesh: THREE.Group;
  cameraPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  color: string;
}

export const UniverseCanvas: React.FC<UniverseCanvasProps> = ({ onSelectZone, activeZone }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<{ name: string; category: string; x: number; y: number } | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // References across render lifecycle
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const structuresRef = useRef<StructureTarget[]>([]);

  // Smooth camera interpolation targets
  const currentCamPos = useRef(new THREE.Vector3(0, 32, 56));
  const targetCamPos = useRef(new THREE.Vector3(0, 32, 56));
  const currentLookAt = useRef(new THREE.Vector3(0, 2, 0));
  const targetLookAt = useRef(new THREE.Vector3(0, 2, 0));

  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Atmosphere Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x07090D);
    scene.fog = new THREE.FogExp2(0x07090D, 0.012);

    // 2. Camera Setup
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0, 32, 56);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer with High Precision & Tone Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Cinematic Spatial Lighting
    const ambientLight = new THREE.AmbientLight(0x0C1118, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x8AB4FF, 2.8);
    keyLight.position.set(25, 45, 30);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x777BFF, 1.8);
    rimLight.position.set(-30, 20, -25);
    scene.add(rimLight);

    // Cyan central interaction spotlight
    const centerSpot = new THREE.PointLight(0x45D6FF, 3.5, 60);
    centerSpot.position.set(0, 15, 0);
    scene.add(centerSpot);

    // 5. Environmental Spatial Ground & Coordinate Rings
    const gridHelper = new THREE.GridHelper(140, 48, 0x1B2836, 0x111923);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // Spatial coordinate concentric rings
    const ringGeo = new THREE.RingGeometry(18, 18.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x45D6FF, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.05;
    scene.add(ringMesh);

    const outerRingGeo = new THREE.RingGeometry(38, 38.3, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x8AB4FF, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
    const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRingMesh.rotation.x = Math.PI / 2;
    outerRingMesh.position.y = 0.05;
    scene.add(outerRingMesh);

    // 6. CREATING THE 7 INTERCONNECTED SPATIAL STRUCTURES
    const structures: StructureTarget[] = [];

    // Utility: Glowing Waypoint Plinth
    const createPlinth = (x: number, z: number, color: number) => {
      const plinthGroup = new THREE.Group();
      plinthGroup.position.set(x, 0, z);

      const baseGeo = new THREE.CylinderGeometry(3.2, 3.8, 0.6, 6);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x151E29,
        roughness: 0.4,
        metalness: 0.7,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.3;
      base.receiveShadow = true;
      plinthGroup.add(base);

      const lightRingGeo = new THREE.TorusGeometry(3.3, 0.08, 16, 32);
      const lightRingMat = new THREE.MeshBasicMaterial({ color });
      const lightRing = new THREE.Mesh(lightRingGeo, lightRingMat);
      lightRing.rotation.x = Math.PI / 2;
      lightRing.position.y = 0.62;
      plinthGroup.add(lightRing);

      return plinthGroup;
    };

    // STRUCTURE 1: PROFESSIONAL IDENTITY MONOLITH (Center / 0, 0, 0)
    const idGroup = createPlinth(0, 0, 0x45D6FF);
    const monolithGeo = new THREE.BoxGeometry(2.4, 7.2, 2.4);
    const monolithMat = new THREE.MeshStandardMaterial({
      color: 0x1B2836,
      roughness: 0.15,
      metalness: 0.85,
    });
    const monolith = new THREE.Mesh(monolithGeo, monolithMat);
    monolith.position.y = 4.2;
    monolith.castShadow = true;
    idGroup.add(monolith);

    // Holographic core cage
    const cageGeo = new THREE.OctahedronGeometry(2.2, 0);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x45D6FF,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    cage.position.y = 9.2;
    idGroup.add(cage);

    scene.add(idGroup);
    structures.push({
      id: 'overview',
      name: 'Professional Identity',
      category: 'BUSINESS OPERATIONS & ARCHITECTURE',
      mesh: idGroup,
      cameraPos: new THREE.Vector3(0, 10, 18),
      targetPos: new THREE.Vector3(0, 5, 0),
      color: '#45D6FF',
    });

    // STRUCTURE 2: CAREER JOURNEY PORTAL (-18, 0, 10)
    const expGroup = createPlinth(-18, 10, 0x8AB4FF);
    for (let i = 0; i < 3; i++) {
      const pylonGeo = new THREE.BoxGeometry(0.8, 3.5 + i * 1.8, 0.8);
      const pylonMat = new THREE.MeshStandardMaterial({ color: 0x1B2836, roughness: 0.2, metalness: 0.7 });
      const pylon = new THREE.Mesh(pylonGeo, pylonMat);
      pylon.position.set(-1.8 + i * 1.8, (3.5 + i * 1.8) / 2 + 0.6, 0);
      pylon.castShadow = true;
      expGroup.add(pylon);
    }
    scene.add(expGroup);
    structures.push({
      id: 'experience',
      name: 'Career Journey',
      category: 'OPERATIONS & SYSTEMS LEADERSHIP',
      mesh: expGroup,
      cameraPos: new THREE.Vector3(-18, 10, 26),
      targetPos: new THREE.Vector3(-18, 4, 10),
      color: '#8AB4FF',
    });

    // STRUCTURE 3: ENTERPRISE TECHNOLOGY CLUSTER (-22, 0, -12)
    const techGroup = createPlinth(-22, -12, 0x777BFF);
    const serverCoreGeo = new THREE.DodecahedronGeometry(2.2);
    const serverCoreMat = new THREE.MeshStandardMaterial({
      color: 0x151E29,
      roughness: 0.2,
      metalness: 0.9,
    });
    const serverCore = new THREE.Mesh(serverCoreGeo, serverCoreMat);
    serverCore.position.y = 4.2;
    serverCore.castShadow = true;
    techGroup.add(serverCore);

    // Orbiting data nodes
    const dataRingGeo = new THREE.TorusGeometry(3.2, 0.05, 16, 32);
    const dataRingMat = new THREE.MeshBasicMaterial({ color: 0x777BFF, wireframe: true });
    const dataRing = new THREE.Mesh(dataRingGeo, dataRingMat);
    dataRing.position.y = 4.2;
    dataRing.rotation.x = Math.PI / 3;
    techGroup.add(dataRing);

    scene.add(techGroup);
    structures.push({
      id: 'architecture',
      name: 'Enterprise Technology',
      category: 'DISTRIBUTED ARCHITECTURE & CLOUD',
      mesh: techGroup,
      cameraPos: new THREE.Vector3(-22, 10, 4),
      targetPos: new THREE.Vector3(-22, 4, -12),
      color: '#777BFF',
    });

    // STRUCTURE 4: ORION-9 SUPPLY CHAIN NODE (20, 0, 12)
    const orionGroup = createPlinth(20, 12, 0x42D6A4);
    const orionSphereGeo = new THREE.IcosahedronGeometry(2.2, 1);
    const orionSphereMat = new THREE.MeshStandardMaterial({
      color: 0x151E29,
      emissive: 0x113322,
      roughness: 0.25,
      metalness: 0.8,
    });
    const orionSphere = new THREE.Mesh(orionSphereGeo, orionSphereMat);
    orionSphere.position.y = 4.2;
    orionSphere.castShadow = true;
    orionGroup.add(orionSphere);

    // Planetary supply chain orbit ring
    const orionOrbitGeo = new THREE.TorusGeometry(3.6, 0.08, 16, 48);
    const orionOrbitMat = new THREE.MeshBasicMaterial({ color: 0x42D6A4 });
    const orionOrbit = new THREE.Mesh(orionOrbitGeo, orionOrbitMat);
    orionOrbit.position.y = 4.2;
    orionOrbit.rotation.x = Math.PI / 4;
    orionGroup.add(orionOrbit);

    scene.add(orionGroup);
    structures.push({
      id: 'orion9',
      name: 'Orion-9',
      category: 'SUPPLY CHAIN OPERATING SYSTEM',
      mesh: orionGroup,
      cameraPos: new THREE.Vector3(20, 10, 28),
      targetPos: new THREE.Vector3(20, 4, 12),
      color: '#42D6A4',
    });

    // STRUCTURE 5: APPLYVISE AI CORE (18, 0, -14)
    const applyGroup = createPlinth(18, -14, 0xA78BFA);
    const aiPolyGeo = new THREE.OctahedronGeometry(2.4, 0);
    const aiPolyMat = new THREE.MeshStandardMaterial({
      color: 0x1E1736,
      emissive: 0x2A1B4E,
      roughness: 0.2,
      metalness: 0.85,
    });
    const aiPoly = new THREE.Mesh(aiPolyGeo, aiPolyMat);
    aiPoly.position.y = 4.5;
    aiPoly.castShadow = true;
    applyGroup.add(aiPoly);

    // Dual nested orbital loops
    const loopGeo = new THREE.TorusGeometry(3.4, 0.06, 16, 48);
    const loopMat = new THREE.MeshBasicMaterial({ color: 0xA78BFA });
    const loop1 = new THREE.Mesh(loopGeo, loopMat);
    loop1.position.y = 4.5;
    loop1.rotation.y = Math.PI / 4;
    applyGroup.add(loop1);

    scene.add(applyGroup);
    structures.push({
      id: 'applywise',
      name: 'ApplyVise AI',
      category: 'AI CAREER INTELLIGENCE PLATFORM',
      mesh: applyGroup,
      cameraPos: new THREE.Vector3(18, 10, 2),
      targetPos: new THREE.Vector3(18, 4, -14),
      color: '#A78BFA',
    });

    // STRUCTURE 6: CERTIFICATIONS PAVILION (0, 0, -22)
    const certGroup = createPlinth(0, -22, 0xE5B94E);
    const obeliskGeo = new THREE.ConeGeometry(2.0, 6.2, 4);
    const obeliskMat = new THREE.MeshStandardMaterial({
      color: 0x2A2212,
      roughness: 0.2,
      metalness: 0.9,
    });
    const obelisk = new THREE.Mesh(obeliskGeo, obeliskMat);
    obelisk.position.y = 3.8;
    obelisk.rotation.y = Math.PI / 4;
    obelisk.castShadow = true;
    certGroup.add(obelisk);

    const sealRingGeo = new THREE.TorusGeometry(2.4, 0.08, 16, 32);
    const sealRingMat = new THREE.MeshBasicMaterial({ color: 0xE5B94E });
    const sealRing = new THREE.Mesh(sealRingGeo, sealRingMat);
    sealRing.position.y = 7.0;
    certGroup.add(sealRing);

    scene.add(certGroup);
    structures.push({
      id: 'certifications',
      name: 'Certifications',
      category: 'VERIFIED CREDENTIALS & HONORS',
      mesh: certGroup,
      cameraPos: new THREE.Vector3(0, 10, -6),
      targetPos: new THREE.Vector3(0, 4, -22),
      color: '#E5B94E',
    });

    // STRUCTURE 7: CONTACT RELAY BEACON (0, 0, 24)
    const contactGroup = createPlinth(0, 24, 0x45D6FF);
    const beaconTowerGeo = new THREE.CylinderGeometry(0.5, 1.4, 7.5, 6);
    const beaconTowerMat = new THREE.MeshStandardMaterial({
      color: 0x151E29,
      roughness: 0.2,
      metalness: 0.8,
    });
    const beaconTower = new THREE.Mesh(beaconTowerGeo, beaconTowerMat);
    beaconTower.position.y = 4.3;
    beaconTower.castShadow = true;
    contactGroup.add(beaconTower);

    const beaconLight = new THREE.PointLight(0x45D6FF, 2.5, 25);
    beaconLight.position.set(0, 8.2, 0);
    contactGroup.add(beaconLight);

    scene.add(contactGroup);
    structures.push({
      id: 'contact',
      name: 'Communications Relay',
      category: 'INITIATE DIRECT CONTACT',
      mesh: contactGroup,
      cameraPos: new THREE.Vector3(0, 10, 40),
      targetPos: new THREE.Vector3(0, 4, 24),
      color: '#45D6FF',
    });

    structuresRef.current = structures;

    // 7. Raycasting & Interactive Hover / Click
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      mouseVector.x = x;
      mouseVector.y = y;

      mousePos.current.targetX = x * 8;
      mousePos.current.targetY = y * 4;

      raycaster.setFromCamera(mouseVector, camera);

      // Check intersections with all structure plinths/objects
      let foundStructure: StructureTarget | null = null;
      for (const struct of structures) {
        const intersects = raycaster.intersectObjects(struct.mesh.children, true);
        if (intersects.length > 0) {
          foundStructure = struct;
          break;
        }
      }

      if (foundStructure) {
        container.style.cursor = 'pointer';
        setHoveredLabel({
          name: foundStructure.name,
          category: foundStructure.category,
          x: e.clientX,
          y: e.clientY - 20,
        });
      } else {
        container.style.cursor = 'default';
        setHoveredLabel(null);
      }
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouseVector, camera);
      for (const struct of structures) {
        const intersects = raycaster.intersectObjects(struct.mesh.children, true);
        if (intersects.length > 0) {
          // Focus camera on this structure
          targetCamPos.current.copy(struct.cameraPos);
          targetLookAt.current.copy(struct.targetPos);
          setIsFocused(true);
          onSelectZone(struct.id);
          break;
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // 8. Resize Listener
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse damping
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      // Animate 3D structures with gentle kinetic rotations
      cage.rotation.y = elapsed * 0.6;
      cage.rotation.x = elapsed * 0.3;

      dataRing.rotation.z = elapsed * 0.8;
      orionOrbit.rotation.z = elapsed * 0.7;
      loop1.rotation.x = elapsed * 0.8;
      obelisk.rotation.y = elapsed * 0.4;

      // Camera Position Interpolation (Lerp)
      const effectiveCamTarget = targetCamPos.current.clone();
      if (!isFocused) {
        effectiveCamTarget.x += mousePos.current.x;
        effectiveCamTarget.y += mousePos.current.y;
      }

      currentCamPos.current.lerp(effectiveCamTarget, 0.04);
      currentLookAt.current.lerp(targetLookAt.current, 0.04);

      camera.position.copy(currentCamPos.current);
      camera.lookAt(currentLookAt.current);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [onSelectZone]);

  // Synchronize when activeZone changes from external nav
  useEffect(() => {
    if (!activeZone) {
      targetCamPos.current.set(0, 32, 56);
      targetLookAt.current.set(0, 2, 0);
      setIsFocused(false);
      return;
    }

    const match = structuresRef.current.find((s) => s.id === activeZone);
    if (match) {
      targetCamPos.current.copy(match.cameraPos);
      targetLookAt.current.copy(match.targetPos);
      setIsFocused(true);
    }
  }, [activeZone]);

  const handleResetCamera = () => {
    targetCamPos.current.set(0, 32, 56);
    targetLookAt.current.set(0, 2, 0);
    setIsFocused(false);
    onSelectZone('overview');
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating 3D Hover Tooltip */}
      {hoveredLabel && (
        <div
          style={{
            position: 'fixed',
            left: hoveredLabel.x + 12,
            top: hoveredLabel.y - 12,
            pointerEvents: 'none',
            zIndex: 40,
            background: 'rgba(12, 17, 24, 0.92)',
            border: '1px solid var(--accent-primary)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
            {hoveredLabel.category}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
            {hoveredLabel.name} ❯ Click to Focus
          </div>
        </div>
      )}

      {/* Reset Camera to Spatial Universe HUD Button */}
      {isFocused && (
        <button
          onClick={handleResetCamera}
          style={{
            position: 'absolute',
            bottom: '36px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(21, 30, 41, 0.9)',
            border: '1px solid var(--accent-primary)',
            color: 'var(--accent-primary)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(69, 214, 255, 0.25)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span>✦ RESET TO GALAXY OVERVIEW</span>
        </button>
      )}

      {/* 3D Waypoint Spatial Navigation Bar at Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '24px',
          right: '24px',
          zIndex: 20,
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          pointerEvents: 'auto',
        }}
      >
        {structuresRef.current.map((struct) => (
          <button
            key={struct.id}
            onClick={() => {
              targetCamPos.current.copy(struct.cameraPos);
              targetLookAt.current.copy(struct.targetPos);
              setIsFocused(true);
              onSelectZone(struct.id);
            }}
            style={{
              background: activeZone === struct.id ? 'rgba(69, 214, 255, 0.2)' : 'rgba(12, 17, 24, 0.75)',
              border: `1px solid ${activeZone === struct.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              color: activeZone === struct.id ? '#FFFFFF' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer',
              backdropFilter: 'blur(6px)',
              transition: 'all var(--transition-fast)',
            }}
          >
            {struct.name}
          </button>
        ))}
      </div>
    </div>
  );
};
