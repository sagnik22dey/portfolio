import { useMemo, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeStoneWallPair, makeCavernCeilingPair, makeCaveFloorPair } from './sketchTextures';

const WIDTH = 6.4;
const HEIGHT = 4.6;
const DOOR_H = 3.0;
const APERTURE_W = 2.0;

type LampProps = {
  z: number;
  index: number;
  trimMat: THREE.Material;
};

/** A hanging mining lantern with procedural organic candle flicker and micro-pendulum sway. */
function HangingLamp({ z, index, trimMat }: LampProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const bulbRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime + index * 2.37;
    const flicker = Math.sin(t * 4.2) * 0.08 + Math.sin(t * 9.1 + 1.2) * 0.04 + Math.sin(t * 17.3) * 0.02;
    if (lightRef.current) {
      lightRef.current.intensity = 0.72 + flicker;
    }
    if (bulbRef.current) {
      bulbRef.current.emissiveIntensity = 1.85 + flicker * 0.95;
    }
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 0.65) * 0.015;
      groupRef.current.rotation.x = Math.cos(t * 0.55) * 0.008;
    }
  });

  return (
    <group ref={groupRef} position={[0, HEIGHT / 2 - 0.16, z]}>
      <mesh position={[0, -0.28, 0]} material={trimMat}>
        <cylinderGeometry args={[0.012, 0.012, 0.52, 6]} />
      </mesh>
      <mesh position={[0, -0.48, 0]} material={trimMat}>
        <cylinderGeometry args={[0.08, 0.16, 0.06, 8]} />
      </mesh>
      <mesh position={[0, -0.58, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial
          ref={bulbRef}
          color="#fff3d6"
          emissive="#ffcf8f"
          emissiveIntensity={1.85}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, -0.72, 0]} material={trimMat}>
        <coneGeometry args={[0.04, 0.08, 6]} />
      </mesh>
      <pointLight ref={lightRef} position={[0, -0.58, 0]} intensity={0.72} distance={9.5} color="#ffe2aa" />
    </group>
  );
}

/** The cavern mining tunnel with stone masonry walls, real hollow doorway apertures, timber shoring bents, rails, and lanterns. */
export default function Corridor() {
  const length = 120;
  const midZ = -35;
  const zStart = 25;
  const zEnd = -95;

  const { map: wallMap, bumpMap: wallBump } = useMemo(() => makeStoneWallPair(512), []);
  const { map: ceilMap, bumpMap: ceilBump } = useMemo(() => makeCavernCeilingPair(512), []);
  const { map: floorMap, bumpMap: floorBump } = useMemo(() => makeCaveFloorPair(512), []);

  const floorMat = useMemo(() => {
    const m = floorMap.clone();
    m.needsUpdate = true;
    m.repeat.set(4, length / 4);

    const b = floorBump.clone();
    b.needsUpdate = true;
    b.repeat.set(4, length / 4);

    return new THREE.MeshStandardMaterial({
      map: m,
      bumpMap: b,
      bumpScale: 0.12,
      roughness: 0.92,
      metalness: 0.04,
    });
  }, [floorMap, floorBump, length]);

  const ceilMat = useMemo(() => {
    const m = ceilMap.clone();
    m.needsUpdate = true;
    m.repeat.set(3, length / 6);

    const b = ceilBump.clone();
    b.needsUpdate = true;
    b.repeat.set(3, length / 6);

    return new THREE.MeshStandardMaterial({
      map: m,
      bumpMap: b,
      bumpScale: 0.18,
      roughness: 0.95,
      metalness: 0.02,
    });
  }, [ceilMap, ceilBump, length]);

  const wallMat = useMemo(() => {
    const m = wallMap.clone();
    m.needsUpdate = true;
    m.repeat.set(4, 2.2);

    const b = wallBump.clone();
    b.needsUpdate = true;
    b.repeat.set(4, 2.2);

    return new THREE.MeshStandardMaterial({
      map: m,
      bumpMap: b,
      bumpScale: 0.15,
      roughness: 0.88,
      metalness: 0.05,
    });
  }, [wallMap, wallBump]);

  const timberMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2b1f15', roughness: 0.95 }),
    []
  );

  const ironMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1a1714', metalness: 0.65, roughness: 0.45 }),
    []
  );

  const leftDoorZs = useMemo(() => [-2, -18, -34, -42, -58, -74], []);
  const rightDoorZs = useMemo(() => [-10, -26, -50, -66], []);

  const lintelH = HEIGHT - DOOR_H;
  const lintelCenterY = -HEIGHT / 2 + DOOR_H + lintelH / 2;

  const buildWallSegments = useCallback((doors: number[]) => {
    const panels: { z: number; len: number }[] = [];
    const lintels: number[] = [];
    let curZ = zStart;

    for (const dz of doors) {
      const topEdge = dz + APERTURE_W / 2;
      if (curZ > topEdge) {
        const len = curZ - topEdge;
        panels.push({ z: curZ - len / 2, len });
      }
      lintels.push(dz);
      curZ = dz - APERTURE_W / 2;
    }

    if (curZ > zEnd) {
      const len = curZ - zEnd;
      panels.push({ z: curZ - len / 2, len });
    }

    return { panels, lintels };
  }, [zStart, zEnd]);

  const leftWall = useMemo(() => buildWallSegments(leftDoorZs), [buildWallSegments, leftDoorZs]);
  const rightWall = useMemo(() => buildWallSegments(rightDoorZs), [buildWallSegments, rightDoorZs]);

  const bentZs = useMemo(() => {
    const arr: number[] = [];
    for (let z = 24; z > -90; z -= 4) arr.push(z);
    return arr;
  }, []);

  const sleeperZs = useMemo(() => {
    const arr: number[] = [];
    for (let z = 24; z > -90; z -= 1.6) arr.push(z);
    return arr;
  }, []);

  const lampZs = useMemo(() => {
    const arr: number[] = [];
    for (let z = 20; z > -86; z -= 8) arr.push(z);
    return arr;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -HEIGHT / 2, midZ]} material={floorMat}>
        <planeGeometry args={[WIDTH, length]} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, HEIGHT / 2, midZ]} material={ceilMat}>
        <planeGeometry args={[WIDTH, length]} />
      </mesh>

      {leftWall.panels.map((p, i) => (
        <mesh
          key={`l-panel-${i}`}
          rotation={[0, Math.PI / 2, 0]}
          position={[-WIDTH / 2, 0, p.z]}
          material={wallMat}
        >
          <planeGeometry args={[p.len, HEIGHT]} />
        </mesh>
      ))}

      {leftWall.lintels.map((dz, i) => (
        <mesh
          key={`l-lintel-${i}`}
          rotation={[0, Math.PI / 2, 0]}
          position={[-WIDTH / 2, lintelCenterY, dz]}
          material={wallMat}
        >
          <planeGeometry args={[APERTURE_W, lintelH]} />
        </mesh>
      ))}

      {rightWall.panels.map((p, i) => (
        <mesh
          key={`r-panel-${i}`}
          rotation={[0, -Math.PI / 2, 0]}
          position={[WIDTH / 2, 0, p.z]}
          material={wallMat}
        >
          <planeGeometry args={[p.len, HEIGHT]} />
        </mesh>
      ))}

      {rightWall.lintels.map((dz, i) => (
        <mesh
          key={`r-lintel-${i}`}
          rotation={[0, -Math.PI / 2, 0]}
          position={[WIDTH / 2, lintelCenterY, dz]}
          material={wallMat}
        >
          <planeGeometry args={[APERTURE_W, lintelH]} />
        </mesh>
      ))}

      {sleeperZs.map((z) => (
        <mesh
          key={`sleeper-${z}`}
          position={[0, -HEIGHT / 2 + 0.02, z]}
          material={timberMat}
        >
          <boxGeometry args={[2.1, 0.04, 0.22]} />
        </mesh>
      ))}

      <mesh position={[-0.85, -HEIGHT / 2 + 0.06, midZ]} material={ironMat}>
        <boxGeometry args={[0.05, 0.06, length]} />
      </mesh>
      <mesh position={[0.85, -HEIGHT / 2 + 0.06, midZ]} material={ironMat}>
        <boxGeometry args={[0.05, 0.06, length]} />
      </mesh>

      {bentZs.map((z) => (
        <group key={`bent-${z}`}>
          <mesh position={[-WIDTH / 2 + 0.12, 0, z]} material={timberMat}>
            <boxGeometry args={[0.22, HEIGHT, 0.22]} />
          </mesh>
          <mesh position={[WIDTH / 2 - 0.12, 0, z]} material={timberMat}>
            <boxGeometry args={[0.22, HEIGHT, 0.22]} />
          </mesh>
          <mesh position={[0, HEIGHT / 2 - 0.12, z]} material={timberMat}>
            <boxGeometry args={[WIDTH, 0.24, 0.24]} />
          </mesh>
          <mesh
            position={[-WIDTH / 2 + 0.42, HEIGHT / 2 - 0.42, z]}
            rotation={[0, 0, -Math.PI / 4]}
            material={timberMat}
          >
            <boxGeometry args={[0.12, 0.6, 0.12]} />
          </mesh>
          <mesh
            position={[WIDTH / 2 - 0.42, HEIGHT / 2 - 0.42, z]}
            rotation={[0, 0, Math.PI / 4]}
            material={timberMat}
          >
            <boxGeometry args={[0.12, 0.6, 0.12]} />
          </mesh>
        </group>
      ))}

      {lampZs.map((z, i) => (
        <HangingLamp key={`lamp-${i}`} z={z} index={i} trimMat={timberMat} />
      ))}
    </group>
  );
}

export { WIDTH as CORRIDOR_WIDTH, HEIGHT as CORRIDOR_HEIGHT };
