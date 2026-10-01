import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { paperMat } from './paper';
import { seeded } from './data';

const PUFFS_PER_CLOUD = 4;

/** Every cloud puff in the sky as ONE instanced draw call; drifts slowly on the CPU. */
export function Clouds({ count, color = '#fdfcf8' }: { count: number; color?: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const clouds = useMemo(() => {
    const r = seeded(99);
    return Array.from({ length: count }, (_, i) => {
      const low = i % 3 === 0;
      return {
        x: -30 + r() * 70,
        y: low ? -9 - r() * 3 : -2 + r() * 12,
        z: 12 - r() * 80,
        s: low ? 2.4 + r() * 2 : 0.9 + r() * 1.3,
        speed: 0.15 + r() * 0.25,
        puffs: Array.from({ length: PUFFS_PER_CLOUD }, (_, k) => ({
          dx: (k - 1.5) * 0.9 + r() * 0.3,
          dy: (k === 1 || k === 2 ? 0.35 : 0) + r() * 0.15,
          dz: r() * 0.4,
          s: k === 1 || k === 2 ? 0.95 : 0.65,
        })),
      };
    });
  }, [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const write = (t: number) => {
    const mesh = ref.current;
    if (!mesh) return;
    let n = 0;
    for (const c of clouds) {
      const x = ((c.x + t * c.speed + 40) % 80) - 40;
      for (const p of c.puffs) {
        dummy.position.set(x + p.dx * c.s, c.y + p.dy * c.s, c.z + p.dz * c.s);
        dummy.scale.set(p.s * c.s, p.s * c.s * 0.62, p.s * c.s * 0.8);
        dummy.rotation.set(0, n * 0.7, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(n++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => write(0));

  const acc = useRef(0);
  useFrame((state, delta) => {
    acc.current += delta;
    if (acc.current < 1 / 20) return;
    acc.current = 0;
    write(state.clock.elapsedTime);
  });

  return (
    <instancedMesh
      ref={ref}
      args={[geo, paperMat(color), count * PUFFS_PER_CLOUD]}
      frustumCulled={false}
    />
  );
}

/** Folded paper-airplane geometry (two wings + keel), built once. */
function useAirplaneGeometry() {
  return useMemo(() => {
    const v = [
      0, 0, 0.6, -0.45, 0.05, -0.4, 0, 0, -0.3,
      0, 0, 0.6, 0, 0, -0.3, 0.45, 0.05, -0.4,
      0, 0, 0.6, 0, 0, -0.3, 0, -0.15, -0.4,
    ];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  }, []);
}

/** A handful of paper airplanes looping lazily between the islands. */
export function PaperPlanes({ count }: { count: number }) {
  const geo = useAirplaneGeometry();
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const paths = useMemo(() => {
    const r = seeded(7);
    return Array.from({ length: count }, () => ({
      cx: -4 + r() * 22,
      cy: 2 + r() * 4,
      cz: -r() * 52,
      rx: 5 + r() * 6,
      rz: 4 + r() * 6,
      speed: 0.18 + r() * 0.18,
      phase: r() * Math.PI * 2,
    }));
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    paths.forEach((p, i) => {
      const m = refs.current[i];
      if (!m) return;
      const a = t * p.speed + p.phase;
      m.position.set(p.cx + Math.cos(a) * p.rx, p.cy + Math.sin(a * 2) * 0.4, p.cz + Math.sin(a) * p.rz);
      m.rotation.set(0, -a + Math.PI, Math.sin(a) * 0.35);
    });
  });

  return (
    <group>
      {paths.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          geometry={geo}
          material={paperMat('#fdfcf8', THREE.DoubleSide)}
          scale={0.7}
        />
      ))}
    </group>
  );
}
