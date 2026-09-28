import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { bays, type Bay } from './corridorData';
import { getCachedTexture } from './textureManager';

type FrameItem = {
  id: string;
  title: string;
  plate: string;
  image: string;
  side: 'left' | 'right';
  z: number;
};

const frameItems: FrameItem[] = [
  {
    id: 'gallery-study',
    title: 'Corridor Perspective',
    plate: 'STUDY 00 // GALLERIA',
    image: '/images/sketches/gallery_corridor.webp',
    side: 'right',
    z: 2.2,
  },
  {
    id: 'surobahare',
    title: 'Surobahare Academy',
    plate: 'STUDY 01 // ACOUSTIC RAGAS',
    image: '/images/sketches/surobahare.webp',
    side: 'left',
    z: 2.2,
  },
  {
    id: 'frostbite',
    title: 'FROSTBITE Gateway',
    plate: 'PLATE 01 // RUST ARCHITECTURE',
    image: '/images/sketches/frostbite.webp',
    side: 'right',
    z: -2,
  },
  {
    id: 'korebi-coffee',
    title: 'Korebi Coffee ERP',
    plate: 'PLATE 02 // LOGISTICS SCHEMATIC',
    image: '/images/sketches/korebi_coffee.webp',
    side: 'left',
    z: -6,
  },
  {
    id: 'blind-assist',
    title: 'The Blind Assist',
    plate: 'PLATE 03 // COMPUTER VISION',
    image: '/images/sketches/blind_assist.webp',
    side: 'left',
    z: -10,
  },
  {
    id: 'saku-global',
    title: 'Saku Global Registry',
    plate: 'PLATE 04 // INTAKE APPARATUS',
    image: '/images/sketches/saku_global.webp',
    side: 'right',
    z: -14,
  },
  {
    id: 'shorts-automation',
    title: 'Automated Pipeline',
    plate: 'PLATE 05 // CINEMATOGRAPHY',
    image: '/images/sketches/shorts_automation.webp',
    side: 'right',
    z: -18,
  },
  {
    id: 'fitsmate',
    title: 'FitsMate Analytics',
    plate: 'PLATE 06 // ATHLETIC STUDY',
    image: '/images/sketches/fitsmate.webp',
    side: 'left',
    z: -22,
  },
  {
    id: 'pricely',
    title: 'Pricely Intelligence',
    plate: 'PLATE 07 // ALGORITHMIC SCALE',
    image: '/images/sketches/pricely.webp',
    side: 'left',
    z: -26,
  },
  {
    id: 'bol-lms',
    title: 'BOL-LMS Academy',
    plate: 'PLATE 08 // ACADEMY CODEX',
    image: '/images/sketches/bol_lms.webp',
    side: 'right',
    z: -30,
  },
  {
    id: 'roasguy',
    title: 'RoasGuy Engine',
    plate: 'PLATE 09 // COMMERCE PRESS',
    image: '/images/sketches/roasguy.webp',
    side: 'left',
    z: -30,
  },
  {
    id: 'cms',
    title: 'CMS Atelier',
    plate: 'PLATE 10 // BUILDER LEDGER',
    image: '/images/sketches/cms.webp',
    side: 'right',
    z: -36,
  },
  {
    id: 'decision-algo',
    title: 'DecisionAlgo Flow',
    plate: 'PLATE 11 // ALGORITHMIC TREE',
    image: '/images/sketches/decision_algo.webp',
    side: 'left',
    z: -36,
  },
];

const FRAME_W = 1.6;
const FRAME_H = 1.0;
const FRAME_THICK = 0.05;
const CANVAS_W = 1.42;
const CANVAS_H = 0.82;
const CORRIDOR_WIDTH = 6.4;
const WALL_Y = 0.15;
const CYCLES = [0, -40];

type WallFrameProps = {
  item: FrameItem;
  zOffset: number;
  onOpenGallery: () => void;
};

/** A wall-mounted picture frame exhibiting a Renaissance project sketch with brass picture light. */
function WallFrame({ item, zOffset, onOpenGallery }: WallFrameProps) {
  const [hovered, setHovered] = useState(false);

  const texture = useMemo(() => {
    return getCachedTexture(item.image);
  }, [item.image]);

  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2b2620', roughness: 0.65 }),
    []
  );

  const matMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#faf6ec', roughness: 0.95 }),
    []
  );

  const brassMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#a68241', metalness: 0.75, roughness: 0.35 }),
    []
  );

  const s = item.side === 'left' ? -1 : 1;
  const x = (s * CORRIDOR_WIDTH) / 2 - s * 0.04;
  const rotY = s < 0 ? Math.PI / 2 : -Math.PI / 2;
  const actualZ = item.z + zOffset;

  return (
    <group
      position={[x, WALL_Y, actualZ]}
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
        onOpenGallery();
      }}
    >
      <mesh position={[0, 0, 0]} material={frameMat}>
        <boxGeometry args={[FRAME_W, FRAME_H, FRAME_THICK]} />
      </mesh>

      <mesh position={[0, 0, 0.027]} material={matMat}>
        <planeGeometry args={[FRAME_W - 0.06, FRAME_H - 0.06]} />
      </mesh>

      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[CANVAS_W, CANVAS_H]} />
        <meshStandardMaterial map={texture} roughness={0.8} />
      </mesh>

      <mesh position={[0, -FRAME_H / 2 - 0.06, 0.02]} material={brassMat}>
        <boxGeometry args={[0.45, 0.07, 0.015]} />
      </mesh>

      <group position={[0, FRAME_H / 2 + 0.12, 0.02]}>
        <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]} material={brassMat}>
          <cylinderGeometry args={[0.008, 0.008, 0.2, 8]} />
        </mesh>
        <mesh position={[0, 0.01, 0.2]} rotation={[0, 0, Math.PI / 2]} material={brassMat}>
          <cylinderGeometry args={[0.018, 0.018, 0.6, 12]} />
        </mesh>
        <pointLight
          position={[0, -0.05, 0.22]}
          intensity={hovered ? 0.9 : 0.42}
          distance={3.2}
          color="#ffe7ba"
        />
      </group>

      {hovered && (
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[FRAME_W + 0.15, FRAME_H + 0.15]} />
          <meshBasicMaterial color="#c2410c" transparent opacity={0.15} />
        </mesh>
      )}
    </group>
  );
}

type Props = { onOpen: (bay: Bay) => void };

/** All wall-mounted project sketch frames exhibited along the corridor halls across loop cycles. */
export default function WallFrames({ onOpen }: Props) {
  const galleryBay = useMemo(() => bays.find((b) => b.kind === 'gallery') ?? bays[1], []);

  return (
    <group>
      {CYCLES.map((cycleOffset) =>
        frameItems.map((item) => (
          <WallFrame
            key={`${item.id}-${cycleOffset}`}
            item={item}
            zOffset={cycleOffset}
            onOpenGallery={() => onOpen(galleryBay)}
          />
        ))
      )}
    </group>
  );
}
