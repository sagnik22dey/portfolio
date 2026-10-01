import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { projects } from '../data/portfolio';
import { thumbFor } from './data';
import { flightLock } from './useFlight';
import { anisotropy, geom, paperMat } from './paper';
import { Part } from './Landmarks';

const loader = new THREE.TextureLoader();
const W = 1.3;
const H = 0.84;

type CardProps = {
  index: number;
  angle: number;
  radius: number;
  active: boolean;
  onPick: (i: number) => void;
  dragged: React.MutableRefObject<boolean>;
};

/** One thick paper card with its sketch on the front and a numbered back, owning (and disposing) its texture. */
function Card({ index, angle, radius, active, onPick, dragged }: CardProps) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [hover, setHover] = useState(false);
  const ref = useRef<THREE.Group>(null);
  const url = thumbFor(projects[index].image);

  useEffect(() => {
    if (!url) return;
    let alive = true;
    let loaded: THREE.Texture | null = null;
    loader.load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = anisotropy();
      loaded = t;
      if (alive) setTex(t);
      else t.dispose();
    });
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, [url]);

  useEffect(() => {
    if (!hover) return;
    document.body.style.cursor = 'pointer';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hover]);

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const target = (active ? 1.22 : hover ? 1.08 : 0.92) * 0.85;
    const k = 1 - Math.pow(0.001, delta);
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, target, k));
    g.position.y = THREE.MathUtils.lerp(g.position.y, active ? 0.35 : Math.sin(state.clock.elapsedTime * 1.2 + index) * 0.08, k);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, active ? -0.08 : 0, k);
  });

  return (
    <group rotation={[0, angle, 0]}>
      <group
        ref={ref}
        position={[0, 0, radius]}
        onClick={(e) => {
          e.stopPropagation();
          if (!dragged.current) onPick(index);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <Part geo={geom('box', W + 0.1, H + 0.1, 0.08)} color={active ? '#c2410c' : '#fdfcf8'} ink={0.025} />
        <mesh position={[0, 0.03, 0.045]}>
          <planeGeometry args={[W - 0.08, H - 0.2]} />
          {tex ? (
            <meshBasicMaterial key="img" map={tex} toneMapped={false} />
          ) : (
            <meshBasicMaterial key="blank" color="#e9dfc4" />
          )}
        </mesh>
        <mesh position={[-W / 2 + 0.2, -H / 2 + 0.07, 0.045]} geometry={geom('box', 0.3, 0.04, 0.005)} material={paperMat('#2b2620')} />
        <mesh position={[0.35, H / 2 + 0.04, 0.03]} rotation={[0, 0, -0.12]} geometry={geom('box', 0.34, 0.1, 0.01)} material={paperMat('#e8763f')} />
        <mesh position={[0, 0, -0.045]} rotation={[0, Math.PI, 0]} geometry={geom('box', W - 0.3, H - 0.3, 0.005)} material={paperMat('#e9dfc4')} />
      </group>
    </group>
  );
}

type Props = { count: number; activeIndex: number | null; onPick: (i: number) => void };

/** Draggable carousel ring of 3D project cards around a paper pedestal; releasing a drag snaps to and opens the nearest card. */
export default function ProjectCards({ count, activeIndex, onPick }: Props) {
  const ring = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const shown = Math.min(count, projects.length);
  const radius = Math.max(2.7, shown * 0.31);
  const step = (Math.PI * 2) / shown;
  const drag = useRef({ on: false, x: 0, y: 0, vel: 0, offset: 0, axis: '' as '' | 'x' | 'y' });
  const dragged = useRef(false);
  const activeRef = useRef(activeIndex);
  const pickRef = useRef(onPick);
  useEffect(() => {
    activeRef.current = activeIndex;
    pickRef.current = onPick;
    flightLock.ring = activeIndex !== null;
    return () => {
      flightLock.ring = false;
    };
  }, [activeIndex, onPick]);

  useEffect(() => {
    const el = gl.domElement;
    const d = drag.current;
    const down = (e: PointerEvent) => {
      if (activeRef.current === null) return;
      d.on = true;
      d.x = e.clientX;
      d.y = e.clientY;
      d.vel = 0;
      d.axis = '';
      dragged.current = false;
    };
    const move = (e: PointerEvent) => {
      if (!d.on) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.axis && Math.hypot(dx, dy) > 6) d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (d.axis !== 'x') return;
      dragged.current = true;
      flightLock.dragging = true;
      const v = (dx / window.innerWidth) * Math.PI * 1.6;
      d.offset += v;
      d.vel = v;
      d.x = e.clientX;
      d.y = e.clientY;
    };
    const up = () => {
      if (!d.on) return;
      d.on = false;
      flightLock.dragging = false;
      if (d.axis === 'x' && ring.current) {
        flightLock.dragEnd = performance.now();
        const rot = ring.current.rotation.y + d.vel * 6;
        const idx = ((Math.round(-rot / step) % shown) + shown) % shown;
        d.offset = 0;
        pickRef.current(idx);
      }
      window.setTimeout(() => {
        dragged.current = false;
      }, 50);
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [gl, step, shown]);

  useFrame((_, delta) => {
    const g = ring.current;
    if (!g) return;
    const d = drag.current;
    if (d.offset) {
      g.rotation.y += d.offset;
      d.offset = 0;
      return;
    }
    if (d.on) return;
    if (activeIndex === null) {
      g.rotation.y += delta * 0.12;
      return;
    }
    const want = -activeIndex * step;
    const diff = Math.atan2(Math.sin(want - g.rotation.y), Math.cos(want - g.rotation.y));
    g.rotation.y += diff * (1 - Math.pow(0.02, delta));
  });

  return (
    <group position={[0, 1.9, 0]}>
      <group ref={ring}>
        {Array.from({ length: shown }, (_, i) => (
          <Card key={i} index={i} angle={i * step} radius={radius} active={activeIndex === i} onPick={onPick} dragged={dragged} />
        ))}
      </group>
    </group>
  );
}

/** Stepped paper pedestal with a slowly turning ring of bunting in the middle of the Projects island. */
export function ProjectPedestal() {
  const top = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (top.current) top.current.rotation.y -= d * 0.3;
  });
  return (
    <group>
      <Part geo={geom('cyl', 1.1, 1.25, 0.25, 10)} color="#d9cba6" position={[0, 0.12, 0]} ink={0.04} />
      <Part geo={geom('cyl', 0.8, 0.95, 0.25, 10)} color="#fdfcf8" position={[0, 0.37, 0]} ink={0.035} />
      <Part geo={geom('cyl', 0.32, 0.45, 1.3, 8)} color="#c2410c" position={[0, 1.15, 0]} ink={0.035} />
      <group ref={top} position={[0, 1.9, 0]}>
        <Part geo={geom('oct', 0.35)} color="#f3c87a" ink={0.03} />
        {Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2;
          return (
            <mesh
              key={k}
              position={[Math.cos(a) * 0.75, -0.25, Math.sin(a) * 0.75]}
              rotation={[0, -a, Math.PI]}
              geometry={geom('cone', 0.12, 0.24, 3)}
              material={paperMat(k % 2 ? '#e8763f' : '#6b7c5f')}
            />
          );
        })}
      </group>
    </group>
  );
}
