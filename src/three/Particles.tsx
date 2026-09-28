import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CORRIDOR_START_Z, corridorEndZ } from './corridorData';

const BASE_COUNT = 340;

/** Slow-drifting dust motes catching the corridor light for atmosphere. */
export default function Particles({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Points>(null);
  const length = CORRIDOR_START_Z - corridorEndZ;
  const COUNT = useMemo(() => Math.max(40, Math.round(BASE_COUNT * scale)), [scale]);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = corridorEndZ + Math.random() * length;
      speeds[i] = 0.05 + Math.random() * 0.12;
    }
    return { positions, speeds };
  }, [length]);

  const sprite = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,240,210,0.95)');
    g.addColorStop(0.4, 'rgba(255,225,175,0.4)');
    g.addColorStop(1, 'rgba(255,225,175,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += speeds[i] * 0.01;
      arr[i * 3] += Math.sin(t * 0.3 + i) * 0.0015;
      if (arr[i * 3 + 1] > 2.2) arr[i * 3 + 1] = -2.2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.08}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.7}
      />
    </points>
  );
}
