import { useMemo } from 'react';
import * as THREE from 'three';
import { foldGeometry, paperMat } from './paper';
import { seeded } from './data';

type RockProps = { radius: number; seed: number; top?: string; side?: string };

/** Floating folded-paper landmass: flat grassy top, crumpled cone of rock underneath. */
export function IslandRock({ radius, seed, top = '#a7c08a', side = '#e9dfc4' }: RockProps) {
  const { cap, base } = useMemo(() => {
    const cap = foldGeometry(new THREE.CylinderGeometry(radius, radius * 0.94, 0.45, 9, 1), radius * 0.05, seed, true);
    const base = foldGeometry(new THREE.ConeGeometry(radius * 0.92, radius * 1.5, 8, 3), radius * 0.16, seed + 9);
    base.rotateX(Math.PI);
    return { cap, base };
  }, [radius, seed]);

  return (
    <group>
      <mesh geometry={cap} material={paperMat(top)} position={[0, -0.22, 0]} />
      <mesh geometry={base} material={paperMat(side)} position={[0, -0.45 - radius * 0.75, 0]} />
    </group>
  );
}

/** A few low-poly paper trees scattered around the rim of an island. */
export function Trees({ radius, seed, count = 4 }: { radius: number; seed: number; count?: number }) {
  const items = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + r() * 0.8;
      const d = radius * (0.62 + r() * 0.25);
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, s: 0.55 + r() * 0.45, tone: r() > 0.5 ? '#6b7c5f' : '#86997a' };
    });
  }, [radius, seed, count]);

  return (
    <group>
      {items.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <mesh position={[0, 0.25, 0]} material={paperMat('#8a6a4a')}>
            <cylinderGeometry args={[0.06, 0.09, 0.5, 5]} />
          </mesh>
          <mesh position={[0, 0.85, 0]} material={paperMat(t.tone)}>
            <coneGeometry args={[0.42, 0.95, 6]} />
          </mesh>
          <mesh position={[0, 1.25, 0]} material={paperMat(t.tone)}>
            <coneGeometry args={[0.3, 0.65, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Small origami house with a pitched roof — the About island's landmark. */
export function PaperHouse() {
  return (
    <group position={[-0.5, 0, -0.3]}>
      <mesh position={[0, 0.6, 0]} material={paperMat('#fdfcf8')}>
        <boxGeometry args={[1.6, 1.2, 1.2]} />
      </mesh>
      <mesh position={[0, 1.55, 0]} rotation={[0, Math.PI / 4, 0]} material={paperMat('#c2410c')}>
        <coneGeometry args={[1.3, 0.8, 4]} />
      </mesh>
      <mesh position={[0.3, 0.45, 0.61]} material={paperMat('#2b2620')}>
        <planeGeometry args={[0.36, 0.6]} />
      </mesh>
      <mesh position={[-0.4, 0.7, 0.61]} material={paperMat('#f3c87a')}>
        <planeGeometry args={[0.3, 0.3]} />
      </mesh>
      <mesh position={[0.55, 1.75, -0.2]} material={paperMat('#a8563a')}>
        <boxGeometry args={[0.22, 0.5, 0.22]} />
      </mesh>
    </group>
  );
}

/** Flag on a pole, used as a waypoint marker on every island. */
export function Flag({ color = '#c2410c', position = [0, 0, 0] as [number, number, number] }) {
  const cloth = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.7, -0.18, 0, 0, -0.4, 0], 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} material={paperMat('#4a423a')}>
        <cylinderGeometry args={[0.025, 0.025, 1.8, 5]} />
      </mesh>
      <mesh geometry={cloth} position={[0.02, 1.78, 0]} material={paperMat(color, THREE.DoubleSide)} />
    </group>
  );
}

/** Stack of paper blocks of varying height — Studio island's skill towers. */
export function SkillTowers({ heights }: { heights: number[] }) {
  const tones = ['#c2410c', '#e8763f', '#6b7c5f', '#a8563a', '#d9cba6', '#86997a'];
  return (
    <group position={[0, 0, -0.2]}>
      {heights.map((h, i) => {
        const a = (i / heights.length) * Math.PI * 1.2 - Math.PI * 0.6;
        return (
          <mesh key={i} position={[Math.sin(a) * 1.4, h / 2, -Math.cos(a) * 0.9]} material={paperMat(tones[i % tones.length])}>
            <boxGeometry args={[0.5, h, 0.5]} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Striped paper lighthouse — Contact island's landmark. The lamp is unlit so it glows without a real light. */
export function Lighthouse() {
  return (
    <group position={[0.6, 0, -0.4]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.4 + i * 0.8, 0]} material={paperMat(i % 2 ? '#c2410c' : '#fdfcf8')}>
          <cylinderGeometry args={[0.42 - i * 0.07 - 0.07, 0.42 - i * 0.07, 0.8, 8]} />
        </mesh>
      ))}
      <mesh position={[0, 2.62, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.36, 8]} />
        <meshBasicMaterial color="#ffd37a" toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.0, 0]} material={paperMat('#2b2620')}>
        <coneGeometry args={[0.34, 0.42, 8]} />
      </mesh>
    </group>
  );
}

/** Paper mailbox with a raised flag, sitting next to the lighthouse. */
export function Mailbox() {
  return (
    <group position={[-1.1, 0, 0.6]}>
      <mesh position={[0, 0.35, 0]} material={paperMat('#8a6a4a')}>
        <boxGeometry args={[0.08, 0.7, 0.08]} />
      </mesh>
      <mesh position={[0, 0.82, 0]} rotation={[0, 0, Math.PI / 2]} material={paperMat('#6b7c5f')}>
        <cylinderGeometry args={[0.2, 0.2, 0.55, 8, 1, false, 0, Math.PI]} />
      </mesh>
      <mesh position={[0, 0.82, 0]} material={paperMat('#6b7c5f')}>
        <boxGeometry args={[0.55, 0.02, 0.4]} />
      </mesh>
      <mesh position={[0.2, 1.02, 0.22]} material={paperMat('#c2410c')}>
        <boxGeometry args={[0.04, 0.28, 0.02]} />
      </mesh>
    </group>
  );
}
