import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeSignTexture, makeDoorTexture } from './sketchTextures';
import { bays, bayZ, type Bay } from './corridorData';
import { CORRIDOR_WIDTH, CORRIDOR_HEIGHT } from './Corridor';
import { getCachedTexture } from './textureManager';

const DOOR_W = 1.8;
const DOOR_H = 3.0;
const JAMB = 0.18;
const CYCLES = [0, -40];

type BayMeshProps = {
  bay: Bay;
  index: number;
  zOffset: number;
  onOpen: (bay: Bay) => void;
};

const BAY_POSTER_MAP: Record<string, string> = {
  about: '/images/profile_image.webp',
  projects: '/images/sketches/gallery_corridor.webp',
  skills: '/images/sketches/decision_algo.webp',
  experience: '/images/sketches/cms.webp',
  contact: '/images/sketches/roasguy.webp',
};

/** A cavern stone-arched portal with a swinging timber door and an illuminated deep 3D room chamber. */
function DoorBay({ bay, index, zOffset, onOpen }: BayMeshProps) {
  const [hovered, setHovered] = useState(false);
  const doorRef = useRef<THREE.Group>(null);
  const signRef = useRef<THREE.Group>(null);

  const doorTex = useMemo(
    () => makeDoorTexture({ subtitle: bay.subtitle, accent: bay.accent }),
    [bay]
  );
  const signTex = useMemo(() => makeSignTexture(bay.title, bay.accent), [bay]);

  const posterPath = BAY_POSTER_MAP[bay.id] || '/images/sketches/gallery_corridor.webp';
  const posterTex = useMemo(() => getCachedTexture(posterPath), [posterPath]);

  const isGallery = bay.kind === 'gallery';
  const z = bayZ(index) + zOffset;
  const s = bay.side === 'left' ? -1 : 1;
  const x = (s * CORRIDOR_WIDTH) / 2;
  const rotY = s < 0 ? Math.PI / 2 : -Math.PI / 2;
  const floorY = -CORRIDOR_HEIGHT / 2;
  const doorCenterY = floorY + DOOR_H / 2;

  const archMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#261c14', roughness: 0.95 }),
    []
  );

  const chamberWallMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#3d3023', roughness: 0.92 }),
    []
  );

  const chamberFloorMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#261c14', roughness: 0.88 }),
    []
  );

  const ironMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#161311', metalness: 0.5, roughness: 0.5 }),
    []
  );

  useFrame((state) => {
    if (doorRef.current) {
      const target = hovered ? -1.45 : 0;
      doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, target, 0.08);
    }
    if (signRef.current) {
      signRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.1 + index) * 0.04;
    }
  });

  return (
    <group
      position={[x, 0, z]}
      rotation={[0, rotY, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(bay);
      }}
    >
      <group>
        <mesh position={[0, doorCenterY, -3.2]}>
          <planeGeometry args={[3.8, 3.4]} />
          <meshStandardMaterial color="#423528" roughness={0.92} />
        </mesh>

        <mesh position={[0, doorCenterY + 0.15, -3.17]} material={archMat}>
          <boxGeometry args={[1.72, 2.12, 0.04]} />
        </mesh>
        <mesh position={[0, doorCenterY + 0.15, -3.15]}>
          <planeGeometry args={[1.6, 2.0]} />
          <meshStandardMaterial map={posterTex} roughness={0.82} />
        </mesh>

        <mesh position={[-1.9, doorCenterY, -1.6]} rotation={[0, Math.PI / 2, 0]} material={chamberWallMat}>
          <planeGeometry args={[3.2, 3.4]} />
        </mesh>
        <mesh position={[1.9, doorCenterY, -1.6]} rotation={[0, -Math.PI / 2, 0]} material={chamberWallMat}>
          <planeGeometry args={[3.2, 3.4]} />
        </mesh>

        <mesh position={[0, floorY + 0.01, -1.6]} rotation={[-Math.PI / 2, 0, 0]} material={chamberFloorMat}>
          <planeGeometry args={[3.8, 3.2]} />
        </mesh>

        <mesh position={[0, floorY + 3.4, -1.6]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.8, 3.2]} />
          <meshStandardMaterial color="#221810" roughness={0.95} />
        </mesh>

        <mesh position={[0, floorY + 0.45, -2.4]} material={archMat}>
          <boxGeometry args={[1.5, 0.08, 0.7]} />
        </mesh>
        <mesh position={[-0.65, floorY + 0.22, -2.4]} material={archMat}>
          <boxGeometry args={[0.08, 0.44, 0.55]} />
        </mesh>
        <mesh position={[0.65, floorY + 0.22, -2.4]} material={archMat}>
          <boxGeometry args={[0.08, 0.44, 0.55]} />
        </mesh>

        <pointLight
          position={[0, doorCenterY + 0.6, -1.8]}
          intensity={hovered ? 2.6 : 1.1}
          distance={7.5}
          color={bay.accent === '#6b7c5f' ? '#e2edcf' : '#ffd9a0'}
        />
      </group>

      <mesh position={[-(DOOR_W / 2 + JAMB / 2), doorCenterY, 0.04]} material={archMat}>
        <boxGeometry args={[JAMB, DOOR_H + JAMB, 0.35]} />
      </mesh>
      <mesh position={[DOOR_W / 2 + JAMB / 2, doorCenterY, 0.04]} material={archMat}>
        <boxGeometry args={[JAMB, DOOR_H + JAMB, 0.35]} />
      </mesh>
      <mesh position={[0, floorY + DOOR_H + JAMB / 2, 0.04]} material={archMat}>
        <boxGeometry args={[DOOR_W + JAMB * 2 + 0.12, JAMB, 0.38]} />
      </mesh>

      <mesh position={[0, floorY + 0.02, 0.1]} material={archMat}>
        <boxGeometry args={[DOOR_W + JAMB * 2, 0.04, 0.4]} />
      </mesh>

      <group ref={doorRef} position={[-DOOR_W / 2, doorCenterY, 0.05]}>
        <mesh position={[DOOR_W / 2, 0, 0]}>
          <boxGeometry args={[DOOR_W, DOOR_H, 0.09]} />
          <meshStandardMaterial map={doorTex} roughness={0.88} />
        </mesh>
        <mesh position={[DOOR_W - 0.22, 0, 0.08]} material={ironMat}>
          <torusGeometry args={[0.08, 0.016, 8, 16]} />
        </mesh>
        <mesh position={[0.2, 0.8, 0.06]} material={ironMat}>
          <boxGeometry args={[0.3, 0.05, 0.02]} />
        </mesh>
        <mesh position={[0.2, -0.8, 0.06]} material={ironMat}>
          <boxGeometry args={[0.3, 0.05, 0.02]} />
        </mesh>
      </group>

      <group ref={signRef} position={[0, floorY + DOOR_H + JAMB * 2 + 0.45, 0.12]}>
        <mesh position={[-0.45, 0.28, 0]} material={ironMat}>
          <cylinderGeometry args={[0.01, 0.01, 0.55, 6]} />
        </mesh>
        <mesh position={[0.45, 0.28, 0]} material={ironMat}>
          <cylinderGeometry args={[0.01, 0.01, 0.55, 6]} />
        </mesh>
        <mesh>
          <planeGeometry args={[1.5, 0.62]} />
          <meshStandardMaterial map={signTex} roughness={1} transparent />
        </mesh>
      </group>

      {isGallery && (
        <mesh position={[0, doorCenterY + DOOR_H / 2 - 0.3, 0.1]}>
          <circleGeometry args={[0.16, 6]} />
          <meshStandardMaterial color={bay.accent} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

type BaysProps = { onOpen: (bay: Bay) => void };

/** All corridor portal bays rendered across repeating cycles for the infinite loop. */
export default function Bays({ onOpen }: BaysProps) {
  return (
    <group>
      {CYCLES.map((cycleOffset) =>
        bays.map((bay, i) => (
          <DoorBay
            key={`${bay.id}-${cycleOffset}`}
            bay={bay}
            index={i}
            zOffset={cycleOffset}
            onOpen={onOpen}
          />
        ))
      )}
    </group>
  );
}
