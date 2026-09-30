import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { skyMilestones, type SkyMilestone } from './roomData';
import { makeSkyNote, makeCloudSprite } from './roomTextures';
import { useRoomInput, painted } from './useRoomInput';
import type { PaintReveal } from './usePaintReveal';

const STEP = 9;
const LEAD = 10;

/** Folded paper airplane mesh that banks and pitches with the flight. */
function PaperAirplane({ bank, pitch }: { bank: React.MutableRefObject<number>; pitch: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const v = new Float32Array([
      0, 0, -0.9, -0.62, 0.02, 0.5, 0, 0.02, 0.5,
      0, 0, -0.9, 0, 0.02, 0.5, 0.62, 0.02, 0.5,
      0, 0, -0.9, 0, 0.02, 0.5, 0, -0.16, 0.5,
    ]);
    g.setAttribute('position', new THREE.BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.z = -bank.current * 2.4;
    ref.current.rotation.x = 0.08 + pitch.current * 2.5 + Math.sin(t * 1.4) * 0.02;
    ref.current.position.y = -0.55 + Math.sin(t * 1.1) * 0.05;
    ref.current.position.x = bank.current * 2;
  });

  return (
    <group ref={ref} position={[0, -0.55, 3.4]} scale={0.55}>
      <mesh geometry={geo}>
        <meshBasicMaterial color="#fbf8f1" side={THREE.DoubleSide} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[geo]} />
        <lineBasicMaterial color="#8a7c68" />
      </lineSegments>
    </group>
  );
}

type NoteProps = { note: SkyMilestone; index: number; paint: PaintReveal };

/** A paper milestone card suspended in the sky along the flight path. */
function SkyNote({ note, index, paint }: NoteProps) {
  const ref = useRef<THREE.Group>(null);
  const side = index % 2 === 0 ? -1 : 1;
  const mat = useMemo(
    () =>
      painted(
        new THREE.MeshBasicMaterial({ map: makeSkyNote(note), side: THREE.DoubleSide, toneMapped: false }),
        paint.onBeforeCompile
      ),
    [note, paint]
  );

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + index;
    ref.current.position.y = 0.35 + Math.sin(t * 0.6) * 0.15;
    ref.current.rotation.z = Math.sin(t * 0.45) * 0.03;
  });

  return (
    <group ref={ref} position={[side * 1.9, 0.35, -index * STEP]} rotation={[0, -side * 0.3, 0]}>
      <mesh material={mat}>
        <planeGeometry args={[3.3, 2.1]} />
      </mesh>
    </group>
  );
}

type Props = { paint: PaintReveal; onProgress: (i: number) => void };

/** About room: an endless paper-airplane flight through clouds past story milestones, driven by scroll/drag. */
export default function AboutRoom({ paint, onProgress }: Props) {
  const group = useRef<THREE.Group>(null);
  const world = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const pos = useRef(0);
  const vel = useRef(0);
  const bank = useRef(0);
  const pitch = useRef(0);
  const lastIdx = useRef(-1);
  const loopLen = skyMilestones.length * STEP;

  useRoomInput({
    onWheel: (dy) => {
      vel.current += dy * 0.0025;
    },
    onDrag: (_, dy) => {
      vel.current -= dy * 0.006;
    },
  });

  useEffect(() => {
    camera.position.set(0, 0.2, 6);
    camera.rotation.set(0, 0, 0);
    return () => {
      camera.rotation.set(0, 0, 0);
    };
  }, [camera]);

  const clouds = useMemo(
    () =>
      Array.from({ length: 34 }).map((_, i) => ({
        x: (i % 2 ? 1 : -1) * (3 + Math.random() * 9),
        y: (Math.random() - 0.4) * 7,
        z: -Math.random() * loopLen,
        s: 3 + Math.random() * 5,
      })),
    [loopLen]
  );
  const cloudTex = useMemo(() => makeCloudSprite(), []);

  useFrame((_, delta) => {
    paint.setOrigin(group.current);
    pos.current += vel.current * delta * 60;
    vel.current *= Math.pow(0.95, delta * 60);
    if (Math.abs(vel.current) < 0.0004) vel.current = 0;

    const wrapped = ((pos.current % loopLen) + loopLen) % loopLen;
    if (world.current) world.current.position.z = wrapped;

    const phase = (wrapped / STEP) * Math.PI;
    const k = Math.min(1, Math.abs(vel.current) * 12);
    bank.current = THREE.MathUtils.lerp(bank.current, Math.sin(phase) * 0.12 * k, 0.06);
    pitch.current = THREE.MathUtils.lerp(pitch.current, Math.sin(phase * 2) * 0.04 * k, 0.06);
    camera.rotation.z = bank.current;
    camera.rotation.x = pitch.current;

    const idx = Math.floor((wrapped + LEAD - 4) / STEP) % skyMilestones.length;
    if (idx !== lastIdx.current) {
      lastIdx.current = idx;
      onProgress(idx);
    }
  });

  return (
    <group ref={group}>
      <PaperAirplane bank={bank} pitch={pitch} />
      <group ref={world}>
        {[0, -loopLen].map((off) => (
          <group key={off} position={[0, 0, off]}>
            {skyMilestones.map((note, i) => (
              <SkyNote key={i} note={note} index={i} paint={paint} />
            ))}
            {clouds.map((c, i) => (
              <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.s * 2, c.s, 1]}>
                <spriteMaterial map={cloudTex} opacity={0.8} depthWrite={false} transparent />
              </sprite>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}
