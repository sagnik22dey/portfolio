import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { studioScreens, type StudioScreen } from './roomData';
import { makeStudioScreen } from './roomTextures';
import { useRoomInput, painted } from './useRoomInput';
import type { PaintReveal } from './usePaintReveal';

const RADIUS = 2.6;
const PER_RING = 4;
const RING_GAP = 1.75;
const BASE_FALL = 0.22;

type Node = StudioScreen & { key: number; content: number; angle: number; baseY: number };

type MonitorProps = {
  node: Node;
  paint: PaintReveal;
  active: boolean;
  setRef: (key: number, g: THREE.Group | null) => void;
  onPick: (node: Node) => void;
};

/** A single monitor on the tower: dark bezel, glowing screen, small stand. */
function Monitor({ node, paint, active, setRef, onPick }: MonitorProps) {
  const inner = useRef<THREE.Group>(null);
  const hovered = useRef(false);

  const mats = useMemo(() => {
    const cb = paint.onBeforeCompile;
    return {
      bezel: painted(new THREE.MeshBasicMaterial({ color: '#15110c' }), cb),
      screen: painted(
        new THREE.MeshBasicMaterial({
          map: makeStudioScreen({ eyebrow: node.eyebrow, title: node.title, lines: node.lines, accent: node.accent }),
          toneMapped: false,
        }),
        cb
      ),
    };
  }, [node, paint]);

  useFrame(() => {
    if (!inner.current) return;
    const s = active ? 1.12 : hovered.current ? 1.06 : 1;
    inner.current.scale.setScalar(THREE.MathUtils.lerp(inner.current.scale.x, s, 0.12));
  });

  return (
    <group
      ref={(g) => setRef(node.key, g)}
      position={[Math.cos(node.angle) * RADIUS, node.baseY, Math.sin(node.angle) * RADIUS]}
      rotation={[0, Math.PI / 2 - node.angle, 0]}
    >
      <group
        ref={inner}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          hovered.current = false;
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPick(node);
        }}
      >
        <mesh position={[0, 0, -0.05]} material={mats.bezel}>
          <boxGeometry args={[1.8, 1.14, 0.12]} />
        </mesh>
        <mesh position={[0, 0, 0.012]} material={mats.screen}>
          <planeGeometry args={[1.66, 1.04]} />
        </mesh>
        <mesh position={[0, -0.7, -0.08]} material={mats.bezel}>
          <boxGeometry args={[0.12, 0.26, 0.1]} />
        </mesh>
      </group>
    </group>
  );
}

type Props = {
  paint: PaintReveal;
  focused: number | null;
  onFocus: (content: number | null) => void;
};

/** Studio room: a spinning, endlessly falling tower of monitors (skills + experience); drag, scroll, click to focus. */
export default function StudioRoom({ paint, focused, onFocus }: Props) {
  const group = useRef<THREE.Group>(null);
  const tower = useRef<THREE.Group>(null);
  const refs = useRef<Map<number, THREE.Group>>(new Map());
  const offsets = useRef<number[]>([]);
  const spin = useRef(0);
  const autoDir = useRef(1);
  const fall = useRef(BASE_FALL);
  const busy = useRef(false);
  const { camera, size } = useThree();

  const nodes = useMemo<Node[]>(() => {
    const list: Node[] = [];
    const copies = studioScreens.length < 12 ? 2 : 1;
    const step = (Math.PI * 2) / PER_RING;
    for (let c = 0; c < copies; c++) {
      studioScreens.forEach((s, i) => {
        const k = list.length;
        const ring = Math.floor(k / PER_RING);
        list.push({
          ...s,
          key: k,
          content: i,
          angle: (k % PER_RING) * step + (ring % 2 ? step / 2 : 0) + Math.PI / 2,
          baseY: ring * RING_GAP,
        });
      });
    }
    offsets.current = list.map(() => 0);
    return list;
  }, []);

  const height = Math.ceil(nodes.length / PER_RING) * RING_GAP;

  useEffect(() => {
    camera.position.set(0, 0.3, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  const { dragDist } = useRoomInput({
    onWheel: (dy) => {
      if (focused === null) fall.current += dy * 0.004;
    },
    onDrag: (dx, dy) => {
      if (focused !== null || !tower.current) return;
      spin.current = dx * 0.006;
      if (Math.abs(dx) > 1) autoDir.current = Math.sign(dx);
      tower.current.rotation.y += spin.current;
      fall.current += dy * 0.004;
    },
  });

  useFrame((_, delta) => {
    paint.setOrigin(group.current);
    if (!tower.current || focused !== null || busy.current) return;
    tower.current.rotation.y += autoDir.current * 0.12 * delta + spin.current;
    spin.current *= 0.95;
    const drift = fall.current >= 0 ? BASE_FALL : -BASE_FALL;
    fall.current = THREE.MathUtils.lerp(fall.current, drift, 0.02);
    nodes.forEach((n, i) => {
      offsets.current[i] -= fall.current * delta;
      let y = n.baseY + offsets.current[i];
      y = ((((y + height / 2) % height) + height) % height) - height / 2;
      const g = refs.current.get(n.key);
      if (g) g.position.y = y;
    });
  });

  const pick = (node: Node) => {
    if (dragDist.current > 6 || busy.current || !tower.current) return;
    if (focused === node.content) {
      onFocus(null);
      return;
    }
    busy.current = true;
    let delta = node.angle - Math.PI / 2 - tower.current.rotation.y;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    const g = refs.current.get(node.key);
    onFocus(node.content);
    gsap.to(tower.current.rotation, {
      y: tower.current.rotation.y + delta,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        busy.current = false;
      },
    });
    if (g) {
      const shift = -g.position.y;
      nodes.forEach((_, i) => {
        offsets.current[i] += shift;
      });
      refs.current.forEach((m, k) => {
        const n = nodes[k];
        let y = n.baseY + offsets.current[k];
        y = ((((y + height / 2) % height) + height) % height) - height / 2;
        gsap.to(m.position, { y, duration: 0.8, ease: 'power2.inOut' });
      });
    }
  };

  const isMobile = size.width < 768;
  const floorMat = useMemo(
    () => painted(new THREE.MeshBasicMaterial({ color: '#241b13' }), paint.onBeforeCompile),
    [paint]
  );
  const ringMat = useMemo(
    () => painted(new THREE.MeshBasicMaterial({ color: '#c2410c', transparent: true, opacity: 0.5 }), paint.onBeforeCompile),
    [paint]
  );

  return (
    <group ref={group} position={[isMobile ? 0 : focused !== null ? -1.6 : 0, 0, 0]} scale={isMobile ? 0.7 : 1}>
      <mesh position={[0, -height / 2 - 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} material={floorMat}>
        <circleGeometry args={[RADIUS + 1.4, 48]} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.39, 0]} rotation={[-Math.PI / 2, 0, 0]} material={ringMat}>
        <ringGeometry args={[RADIUS + 1.3, RADIUS + 1.4, 64]} />
      </mesh>
      <group ref={tower}>
        {nodes.map((n) => (
          <Monitor
            key={n.key}
            node={n}
            paint={paint}
            active={focused === n.content}
            setRef={(k, g) => {
              if (g) refs.current.set(k, g);
              else refs.current.delete(k);
            }}
            onPick={pick}
          />
        ))}
      </group>
    </group>
  );
}
