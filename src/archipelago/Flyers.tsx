import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Model from './Model';

/** Galleon sailing a slow figure-eight loop through the sky between the islands. */
export function SkyShip({ night }: { night: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const a = state.clock.elapsedTime * 0.045;
    const x = 6 + Math.sin(a) * 14;
    const z = -26 + Math.sin(a * 2) * 9;
    const dx = Math.cos(a) * 14;
    const dz = Math.cos(a * 2) * 18;
    g.position.set(x, -3.2 + Math.sin(a * 6) * 0.35, z);
    g.rotation.set(Math.sin(a * 5) * 0.04, Math.atan2(dx, dz), Math.sin(a * 4) * 0.06);
  });
  return (
    <group ref={ref}>
      <Model url="/models/ship.glb" height={3.4} night={night} />
    </group>
  );
}

/** Hot-air balloon drifting gently near the About island. */
export function Balloon({ position, phase = 0, night }: { position: [number, number, number]; phase?: number; night: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime * 0.3 + phase;
    g.position.set(position[0] + Math.sin(t) * 1.2, position[1] + Math.sin(t * 1.7) * 0.6, position[2] + Math.cos(t * 0.8) * 0.8);
    g.rotation.y = t * 0.4;
  });
  return (
    <group ref={ref} position={position}>
      <Model url="/models/balloon.glb" height={2.8} night={night} />
    </group>
  );
}
