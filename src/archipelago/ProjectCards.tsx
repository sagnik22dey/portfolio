import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { projects } from '../data/portfolio';
import { thumbFor } from './data';

const loader = new THREE.TextureLoader();

type CardProps = {
  index: number;
  angle: number;
  radius: number;
  active: boolean;
  onPick: (i: number) => void;
};

/** One project card: a paper sheet with its sketch, owning (and disposing) its own texture. */
function Card({ index, angle, radius, active, onPick }: CardProps) {
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
      t.anisotropy = 2;
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

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const target = (active ? 1.18 : hover ? 1.08 : 1) * 0.82;
    const k = 1 - Math.pow(0.001, delta);
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, target, k));
  });

  return (
    <group
      ref={ref}
      position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
      rotation={[0, angle, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onPick(index);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
    >
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.36, 0.86]} />
        <meshBasicMaterial color={active ? '#c2410c' : '#2b2620'} />
      </mesh>
      <mesh>
        <planeGeometry args={[1.28, 0.78]} />
        <meshBasicMaterial color="#fdfcf8" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.03, 0.005]}>
        <planeGeometry args={[1.18, 0.66]} />
        {tex ? (
          <meshBasicMaterial key="img" map={tex} toneMapped={false} />
        ) : (
          <meshBasicMaterial key="blank" color="#e9dfc4" />
        )}
      </mesh>
    </group>
  );
}

type Props = { count: number; activeIndex: number | null; onPick: (i: number) => void };

/** Slow carousel ring of project cards floating above the Projects island. */
export default function ProjectCards({ count, activeIndex, onPick }: Props) {
  const ring = useRef<THREE.Group>(null);
  const shown = Math.min(count, projects.length);
  const radius = Math.max(2.6, shown * 0.3);

  useFrame((_, delta) => {
    const g = ring.current;
    if (!g) return;
    if (activeIndex === null) {
      g.rotation.y += delta * 0.12;
      return;
    }
    const step = (Math.PI * 2) / shown;
    const want = -activeIndex * step;
    const diff = Math.atan2(Math.sin(want - g.rotation.y), Math.cos(want - g.rotation.y));
    g.rotation.y += diff * (1 - Math.pow(0.02, delta));
  });

  return (
    <group ref={ring} position={[0, 1.9, 0]}>
      {Array.from({ length: shown }, (_, i) => (
        <Card
          key={i}
          index={i}
          angle={(i / shown) * Math.PI * 2}
          radius={radius}
          active={activeIndex === i}
          onPick={onPick}
        />
      ))}
    </group>
  );
}
