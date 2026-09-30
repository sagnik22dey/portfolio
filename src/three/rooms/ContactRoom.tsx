import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { socialLinks, type SocialLink } from './roomData';
import { makeBarrelLabel, makeCloudSprite } from './roomTextures';
import { painted } from './useRoomInput';
import type { PaintReveal } from './usePaintReveal';

type BarrelProps = {
  link: SocialLink;
  position: [number, number, number];
  seed: number;
  paint: PaintReveal;
  onPick: (link: SocialLink) => void;
};

/** A wooden barrel bobbing on the waves with a paper label; click to follow its link. */
function Barrel({ link, position, seed, paint, onPick }: BarrelProps) {
  const ref = useRef<THREE.Group>(null);
  const hovered = useRef(false);

  const mats = useMemo(() => {
    const cb = paint.onBeforeCompile;
    return {
      wood: painted(new THREE.MeshBasicMaterial({ color: '#8b6a44' }), cb),
      band: painted(new THREE.MeshBasicMaterial({ color: '#3b2d1f' }), cb),
      label: painted(
        new THREE.MeshBasicMaterial({ map: makeBarrelLabel(link.label, link.accent), side: THREE.DoubleSide, toneMapped: false }),
        cb
      ),
    };
  }, [link, paint]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + seed;
    ref.current.position.y = position[1] + Math.sin(t * 1.1) * 0.12 + (hovered.current ? 0.2 : 0);
    ref.current.rotation.z = Math.sin(t * 0.8) * 0.08;
    ref.current.rotation.x = Math.cos(t * 0.7) * 0.05;
  });

  return (
    <group
      ref={ref}
      position={position}
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
        onPick(link);
      }}
    >
      <mesh material={mats.wood}>
        <cylinderGeometry args={[0.42, 0.42, 0.95, 18]} />
      </mesh>
      {[-0.3, 0.3].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={mats.band}>
          <cylinderGeometry args={[0.435, 0.435, 0.06, 18]} />
        </mesh>
      ))}
      <mesh position={[0, 0.95, 0]} material={mats.label}>
        <planeGeometry args={[1.1, 0.72]} />
      </mesh>
    </group>
  );
}

type Props = { paint: PaintReveal; onPick: (link: SocialLink) => void };

/** Contact room: a paper dock over layered painted waves with social barrels, a drifting ship and a lighthouse. */
export default function ContactRoom({ paint, onPick }: Props) {
  const group = useRef<THREE.Group>(null);
  const waves = useRef<(THREE.Mesh | null)[]>([]);
  const ship = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();
  const isMobile = size.width < 768;

  useEffect(() => {
    camera.position.set(0, 1.1, 6.2);
    camera.lookAt(0, 0, -2);
  }, [camera]);

  const mats = useMemo(() => {
    const cb = paint.onBeforeCompile;
    return {
      waves: [0, 1, 2, 3].map((i) =>
        painted(
          new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.53, 0.28, 0.5 + i * 0.06),
            side: THREE.DoubleSide,
          }),
          cb
        )
      ),
      foam: painted(new THREE.MeshBasicMaterial({ color: '#eef2ea', side: THREE.DoubleSide }), cb),
      plank: painted(new THREE.MeshBasicMaterial({ color: '#b89a72' }), cb),
      plankDark: painted(new THREE.MeshBasicMaterial({ color: '#6b5238' }), cb),
      tower: painted(new THREE.MeshBasicMaterial({ color: '#f3ecd9' }), cb),
      stripe: painted(new THREE.MeshBasicMaterial({ color: '#c2410c' }), cb),
      hull: painted(new THREE.MeshBasicMaterial({ color: '#3a2f24' }), cb),
      sail: painted(new THREE.MeshBasicMaterial({ color: '#faf6ec', side: THREE.DoubleSide }), cb),
    };
  }, [paint]);

  const cloud = useMemo(() => makeCloudSprite(), []);

  useFrame((state) => {
    paint.setOrigin(group.current);
    const t = state.clock.elapsedTime;
    waves.current.forEach((w, i) => {
      if (w) w.position.y = -0.9 - i * 0.08 + Math.sin(t * (0.8 + i * 0.15) + i * 0.6) * 0.1;
    });
    if (ship.current) {
      ship.current.position.x = Math.sin(t * 0.05) * 7;
      ship.current.position.y = -0.3 + Math.sin(t * 0.8) * 0.1;
      ship.current.rotation.z = Math.sin(t * 0.95) * 0.05;
    }
    if (beam.current) beam.current.rotation.y = t * 0.8;
  });

  const spread = isMobile ? 0.55 : 1;
  const positions: [number, number, number][] = [
    [-3.6 * spread, -0.35, -3.2],
    [-1.8 * spread, -0.45, -1.4],
    [0, -0.4, -2.6],
    [1.8 * spread, -0.45, -1.4],
    [3.6 * spread, -0.35, -3.2],
  ];

  return (
    <group ref={group}>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            waves.current[i] = el;
          }}
          position={[0, -0.9 - i * 0.08, -4 - i * 7]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={mats.waves[i]}
        >
          <planeGeometry args={[70, 9]} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -0.84 - i * 0.08, 0.4 - i * 7]} rotation={[-Math.PI / 2, 0, 0]} material={mats.foam}>
          <planeGeometry args={[70, 0.12]} />
        </mesh>
      ))}

      <group position={[0, -0.72, 3]}>
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[0, 0, -i * 0.42]} material={i % 2 ? mats.plank : mats.plankDark}>
            <boxGeometry args={[1.8, 0.08, 0.38]} />
          </mesh>
        ))}
        {[-0.85, 0.85].map((x) =>
          [0, -1.7, -3.4].map((z) => (
            <mesh key={`${x}${z}`} position={[x, -0.3, z]} material={mats.plankDark}>
              <cylinderGeometry args={[0.07, 0.07, 0.9, 8]} />
            </mesh>
          ))
        )}
      </group>

      {socialLinks.map((l, i) => (
        <Barrel key={l.label} link={l} position={positions[i]} seed={i * 1.7} paint={paint} onPick={onPick} />
      ))}

      <group position={[isMobile ? -4 : -8, -0.9, -16]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, 0.6 + i * 1.1, 0]} material={i % 2 ? mats.stripe : mats.tower}>
            <cylinderGeometry args={[0.55 - i * 0.05, 0.6 - i * 0.05, 1.1, 16]} />
          </mesh>
        ))}
        <mesh ref={beam} position={[0, 6.2, 0]}>
          <coneGeometry args={[1.4, 6, 16, 1, true]} />
          <meshBasicMaterial color="#fff2c4" transparent opacity={0.18} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <group ref={ship} position={[0, -0.3, -20]}>
        <mesh material={mats.hull}>
          <boxGeometry args={[3, 0.5, 0.8]} />
        </mesh>
        <mesh position={[0, 1.2, 0]} material={mats.hull}>
          <cylinderGeometry args={[0.05, 0.05, 2, 6]} />
        </mesh>
        <mesh position={[0.5, 1.2, 0]} rotation={[0, 0, 0]} material={mats.sail}>
          <planeGeometry args={[1, 1.6]} />
        </mesh>
      </group>

      {Array.from({ length: 10 }).map((_, i) => (
        <sprite key={i} position={[(i - 5) * 5, 3.5 + Math.sin(i * 1.9) * 1.1, -18 - (i % 3) * 4]} scale={[8, 3.6, 1]}>
          <spriteMaterial map={cloud} opacity={0.75} depthWrite={false} transparent />
        </sprite>
      ))}
    </group>
  );
}
