import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';

const C = {
  skin: '#f7d6ba',
  hair: '#2f2a35',
  hairLight: '#3d3646',
  sweater: '#f3efe4',
  sweaterShade: '#e6dfcd',
  trim: '#5b7fc7',
  skirt: '#3d4f7c',
  blush: '#f2a9b9',
  eye: '#4a7fd4',
  eyeDeep: '#2f5aa8',
  mouth: '#8c3540',
  chip: '#faf6ec',
};

const CHIP_COUNT = 5;
const WAVE_EVERY = 11;

/** Shared matte material props so every surface reads as the same clay. */
const matte = { roughness: 0.92, metalness: 0 } as const;

type Props = {
  open: boolean;
  searching: boolean;
};

/** Waist-up idle Nanahoshi: breathes, blinks, tracks the cursor and waves now and then. */
export default function NanahoshiIdle({ open, searching }: Props) {
  const rig = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const foreR = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const chips = useRef<(THREE.Mesh | null)[]>([]);
  const look = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      look.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      look.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const s = useRef({ blinkAt: 2.4, blink: 0, waveAt: WAVE_EVERY * 0.55, wave: 0, turn: 0 });

  useFrame((st, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = st.clock.elapsedTime;
    const k = s.current;

    const breathe = Math.sin(t * 1.5);
    if (body.current) {
      body.current.position.y = breathe * 0.012;
      body.current.scale.set(1 + breathe * 0.006, 1 - breathe * 0.008, 1);
      body.current.rotation.z = Math.sin(t * 0.7) * 0.012;
    }

    if (rig.current) {
      const target = open ? 0.22 : look.current.x * 0.16;
      k.turn += (target - k.turn) * (1 - Math.exp(-3 * dt));
      rig.current.rotation.y = k.turn;
      rig.current.position.x = open ? -0.06 : 0;
    }

    k.waveAt -= dt;
    if (k.waveAt <= 0) {
      k.wave = 1.6;
      k.waveAt = WAVE_EVERY + Math.random() * 4;
    }
    k.wave = Math.max(0, k.wave - dt);

    const waving = k.wave > 0 ? Math.sin(Math.min(k.wave, 1.6) * 1.96) : 0;
    const idleSway = Math.sin(t * 1.1) * 0.05;
    if (armL.current) armL.current.rotation.z = 0.14 + idleSway;
    if (armR.current) armR.current.rotation.z = -0.14 - idleSway - waving * 1.9;
    if (foreR.current) foreR.current.rotation.z = -waving * 0.55 + Math.sin(t * 9) * 0.22 * waving;

    if (head.current) {
      const tilt = searching ? -0.12 + Math.sin(t * 2.4) * 0.04 : look.current.y * 0.1;
      const yaw = searching ? Math.sin(t * 1.6) * 0.12 : look.current.x * 0.28;
      head.current.rotation.x += (tilt - head.current.rotation.x) * (1 - Math.exp(-5 * dt));
      head.current.rotation.y += (yaw - head.current.rotation.y) * (1 - Math.exp(-5 * dt));
      head.current.rotation.z += (Math.sin(t * 0.8) * 0.03 - head.current.rotation.z) * (1 - Math.exp(-3 * dt));
      head.current.position.y = 1.58 + breathe * 0.008;
    }

    k.blinkAt -= dt;
    if (k.blinkAt <= 0) {
      k.blink = 0.12;
      k.blinkAt = 2.6 + Math.random() * 3;
    }
    k.blink = Math.max(0, k.blink - dt);
    if (eyes.current) eyes.current.scale.y = k.blink > 0 ? 0.1 : 1;
    if (mouth.current) mouth.current.scale.setScalar(open ? 1.15 + Math.sin(t * 6) * 0.12 : 1);

    if (glow.current) {
      const pulse = searching ? 0.5 + Math.sin(t * 3) * 0.12 : 0.34 + Math.sin(t * 1.4) * 0.05;
      (glow.current.material as THREE.MeshBasicMaterial).opacity = pulse;
      glow.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.03);
    }

    chips.current.forEach((m, i) => {
      if (!m) return;
      const prog = (t * 0.3 + i / CHIP_COUNT) % 1;
      const vis = (searching ? 1 : 0) * Math.sin(prog * Math.PI);
      m.visible = vis > 0.02;
      if (!m.visible) return;
      m.position.set(Math.sin(i * 2.1 + t * 0.7) * 0.34, 1.55 + prog * 0.75, 0.34 + Math.cos(i * 1.7) * 0.1);
      m.rotation.set(0.2, t * 0.8 + i, Math.sin(t + i) * 0.2);
      m.scale.setScalar(0.6 + vis * 0.4);
      (m.material as THREE.MeshBasicMaterial).opacity = vis * 0.9;
    });
  });

  return (
    <group ref={rig} position={[0, -0.45, 0]}>
      <mesh ref={glow} position={[0, 1.05, -0.35]}>
        <circleGeometry args={[0.95, 32]} />
        <meshBasicMaterial color="#f6d7a8" transparent opacity={0.34} depthWrite={false} toneMapped={false} />
      </mesh>

      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 28]} />
        <meshBasicMaterial color="#2b2620" transparent opacity={0.1} depthWrite={false} />
      </mesh>

      <group ref={body}>
        <mesh position={[0, 0.88, 0]} scale={[0.37, 0.35, 0.25]}>
          <sphereGeometry args={[1, 32, 26]} />
          <meshStandardMaterial color={C.sweater} {...matte} />
        </mesh>
        <mesh position={[0, 0.6, 0]} scale={[0.3, 0.14, 0.22]}>
          <sphereGeometry args={[1, 24, 18]} />
          <meshStandardMaterial color={C.sweaterShade} {...matte} />
        </mesh>
        <mesh position={[0, 1.16, 0.01]} rotation={[Math.PI / 2 - 0.1, 0, 0]}>
          <torusGeometry args={[0.1, 0.026, 10, 24]} />
          <meshStandardMaterial color={C.trim} {...matte} />
        </mesh>

        {[
          { ref: armL, x: 0.4, fore: null as null | RefObject<THREE.Group | null> },
          { ref: armR, x: -0.4, fore: foreR },
        ].map((a) => (
          <group key={a.x} ref={a.ref} position={[a.x, 1.0, 0]}>
            <mesh>
              <sphereGeometry args={[0.115, 18, 16]} />
              <meshStandardMaterial color={C.sweater} {...matte} />
            </mesh>
            <mesh position={[0, -0.17, 0]}>
              <capsuleGeometry args={[0.085, 0.2, 6, 16]} />
              <meshStandardMaterial color={C.sweater} {...matte} />
            </mesh>
            <group ref={a.fore} position={[0, -0.32, 0]}>
              <mesh position={[0, -0.08, 0]}>
                <capsuleGeometry args={[0.056, 0.12, 6, 12]} />
                <meshStandardMaterial color={C.skin} {...matte} />
              </mesh>
              <mesh position={[0, -0.19, 0.01]}>
                <sphereGeometry args={[0.068, 16, 14]} />
                <meshStandardMaterial color={C.skin} {...matte} />
              </mesh>
            </group>
          </group>
        ))}

        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.075, 0.095, 0.16, 14]} />
          <meshStandardMaterial color={C.skin} {...matte} />
        </mesh>

        <group ref={head} position={[0, 1.58, 0]}>
          <mesh scale={[0.95, 1, 0.94]}>
            <sphereGeometry args={[0.33, 32, 26]} />
            <meshStandardMaterial color={C.skin} {...matte} />
          </mesh>

          <mesh position={[0, 0.05, -0.03]} scale={[1.03, 1.03, 1.01]}>
            <sphereGeometry args={[0.34, 32, 26]} />
            <meshStandardMaterial color={C.hair} {...matte} />
          </mesh>
          <mesh position={[0, 0.27, 0.07]} scale={[0.93, 0.52, 0.82]}>
            <sphereGeometry args={[0.31, 28, 20]} />
            <meshStandardMaterial color={C.hair} {...matte} />
          </mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.22, 0.12, 0.19]} rotation={[0.1, sd * 0.4, sd * 0.55]}>
              <capsuleGeometry args={[0.055, 0.16, 6, 12]} />
              <meshStandardMaterial color={C.hairLight} {...matte} />
            </mesh>
          ))}
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.29, -0.3, 0.06]} rotation={[0, 0, sd * 0.06]}>
              <capsuleGeometry args={[0.058, 0.42, 6, 12]} />
              <meshStandardMaterial color={C.hair} {...matte} />
            </mesh>
          ))}
          <mesh position={[0, 0.36, -0.08]} rotation={[0.4, 0, 0.2]}>
            <coneGeometry args={[0.06, 0.22, 10]} />
            <meshStandardMaterial color={C.hair} {...matte} />
          </mesh>

          <group ref={eyes} position={[0, 0.02, 0]}>
            {[-1, 1].map((sd) => (
              <group key={sd} position={[sd * 0.125, 0, 0.28]}>
                <mesh scale={[1, 1.12, 0.5]}>
                  <sphereGeometry args={[0.062, 18, 16]} />
                  <meshBasicMaterial color={C.eyeDeep} toneMapped={false} />
                </mesh>
                <mesh position={[0, -0.006, 0.022]} scale={[1, 1.05, 0.4]}>
                  <sphereGeometry args={[0.05, 18, 16]} />
                  <meshBasicMaterial color={C.eye} toneMapped={false} />
                </mesh>
                <mesh position={[0.018, 0.024, 0.04]}>
                  <sphereGeometry args={[0.019, 10, 10]} />
                  <meshBasicMaterial color="#ffffff" toneMapped={false} />
                </mesh>
                <mesh position={[-0.016, -0.026, 0.038]}>
                  <sphereGeometry args={[0.01, 8, 8]} />
                  <meshBasicMaterial color="#ffffff" transparent opacity={0.85} toneMapped={false} />
                </mesh>
              </group>
            ))}
          </group>

          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.19, -0.07, 0.25]} scale={[1, 0.62, 0.35]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshBasicMaterial color={C.blush} transparent opacity={0.45} toneMapped={false} />
            </mesh>
          ))}

          <mesh ref={mouth} position={[0, -0.11, 0.29]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.032, 0.011, 8, 16, Math.PI]} />
            <meshBasicMaterial color={C.mouth} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {Array.from({ length: CHIP_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            chips.current[i] = el;
          }}
          visible={false}
        >
          <planeGeometry args={[0.13, 0.09]} />
          <meshBasicMaterial color={i % 2 === 0 ? C.chip : C.trim} transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
