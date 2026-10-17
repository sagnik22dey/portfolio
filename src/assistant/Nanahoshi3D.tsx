import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useRef, type RefObject } from 'react';
import * as THREE from 'three';

const DEG = Math.PI / 180;

const C = {
  skin: '#f5d3b5',
  skinShade: '#e3b995',
  hair: '#2e2a33',
  hairDark: '#211d27',
  dress: '#f4f1e8',
  dressTrim: '#5b7fc7',
  skirt: '#3d4f7c',
  skirtTrim: '#2e3c60',
  blush: '#f0a8b8',
  eye: '#4a7fd4',
  charcoal: '#2b2b31',
  chip: '#faf6ec',
  mouth: '#8c3540',
};

const CHIP_COUNT = 6;
const WALK_SPEED = 1.35;
const STATION_SPEED = 1.7;

function lerpAngle(a: number, b: number, t: number) {
  const d = ((((b - a + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
  return a + d * t;
}

type Props = {
  open: boolean;
  searching: boolean;
  hotspotRef: RefObject<HTMLButtonElement | null>;
};

/** Procedural anime assistant Nanahoshi: patrols the strip, gestures while the chat is open, floats result chips while searching. */
export default function Nanahoshi3D({ open, searching, hotspotRef }: Props) {
  const rig = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const foreL = useRef<THREE.Group>(null);
  const foreR = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const chips = useRef<(THREE.Mesh | null)[]>([]);

  const s = useRef({
    x: 0,
    dir: -1,
    mode: 'walk' as 'walk' | 'pause' | 'station',
    pause: 0,
    phase: 0,
    rotY: 0,
    blinkAt: 2.6,
    blink: 0,
    init: false,
  });

  useFrame((st, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = st.clock.elapsedTime;
    const k = s.current;

    const cam = st.camera as THREE.PerspectiveCamera;
    const hw = st.viewport.width / 2 || Math.tan(cam.fov * DEG * 0.5) * cam.position.z * cam.aspect;
    const bound = Math.max(hw * 0.8 - 0.6, 0.6);
    if (!k.init) {
      k.x = bound * 0.6;
      k.init = true;
    }

    const px = st.size.width;
    const stationFrac = px >= 640 ? (px - (24 * 16 + 150)) / px : 0.5;
    const stationX = (stationFrac * 2 - 1) * bound;

    let moving = false;
    if (open) {
      k.mode = 'station';
      const d = stationX - k.x;
      if (Math.abs(d) > 0.05) {
        k.x += Math.sign(d) * Math.min(Math.abs(d), STATION_SPEED * dt);
        k.dir = Math.sign(d);
        moving = true;
      }
    } else if (k.mode === 'station') {
      k.mode = 'pause';
      k.pause = 0.5;
    }

    if (!open) {
      if (k.mode === 'pause') {
        k.pause -= dt;
        if (k.pause <= 0) k.mode = 'walk';
      } else if (k.mode === 'walk') {
        k.x += k.dir * WALK_SPEED * dt;
        if (k.x >= bound) {
          k.x = bound;
          k.dir = -1;
          k.mode = 'pause';
          k.pause = 2.4;
        } else if (k.x <= -bound) {
          k.x = -bound;
          k.dir = 1;
          k.mode = 'pause';
          k.pause = 2.0;
        }
        moving = true;
      }
    }

    const faceTarget = moving ? k.dir * 0.65 : 0;
    k.rotY = lerpAngle(k.rotY, faceTarget, 1 - Math.exp(-7 * dt));

    if (rig.current) {
      rig.current.position.x = k.x;
      rig.current.rotation.y = k.rotY;
    }

    k.phase += dt * (moving ? 7.5 : 2.2);
    const swing = moving ? 1 : 0;
    const bob = moving ? Math.abs(Math.sin(k.phase)) * 0.045 : Math.sin(t * 1.7) * 0.012;
    if (body.current) {
      body.current.position.y = bob;
      body.current.rotation.x = moving ? 0.06 : Math.sin(t * 1.3) * 0.012;
      body.current.rotation.z = Math.sin(k.phase) * 0.02 * swing;
    }
    const legSwing = Math.sin(k.phase) * 0.5 * swing;
    if (legL.current) legL.current.rotation.x = legSwing;
    if (legR.current) legR.current.rotation.x = -legSwing;

    const gesture = open ? 1 : 0;
    const armSwing = Math.sin(k.phase) * 0.5 * swing;
    const sway = Math.sin(t * 1.4) * 0.05 * (moving ? 0.2 : 1);
    if (armL.current) armL.current.rotation.x = armSwing + gesture * 0.15;
    if (armR.current) armR.current.rotation.x = -armSwing - gesture * 0.15;
    if (foreL.current) foreL.current.rotation.x = -0.15 - gesture * 0.3 + sway;
    if (foreR.current) foreR.current.rotation.x = -0.15 - gesture * 0.3 - sway;

    if (head.current) {
      const scan = searching ? 0.1 + Math.sin(t * 3) * 0.03 : 0;
      head.current.rotation.x = lerpAngle(head.current.rotation.x, moving ? 0.04 : scan, 1 - Math.exp(-6 * dt));
      head.current.rotation.y = lerpAngle(head.current.rotation.y, moving ? k.dir * 0.15 : Math.sin(t * 0.6) * 0.1, 1 - Math.exp(-4 * dt));
    }

    k.blinkAt -= dt;
    if (k.blinkAt <= 0) {
      k.blink = 0.13;
      k.blinkAt = 2.4 + Math.random() * 2.6;
    }
    k.blink = Math.max(0, k.blink - dt);
    if (eyes.current) eyes.current.scale.y = k.blink > 0 ? 0.08 : 1;

    chips.current.forEach((m, i) => {
      if (!m) return;
      const prog = (t * 0.32 + i / CHIP_COUNT) % 1;
      const vis = (searching ? 1 : 0) * Math.sin(prog * Math.PI);
      m.visible = vis > 0.02;
      if (!m.visible) return;
      m.position.set(Math.sin(i * 2.1 + t * 0.8) * 0.36, 1.0 + prog * 0.9, 0.3 + Math.cos(i * 1.7) * 0.12);
      m.rotation.set(0.25, t * 0.9 + i, Math.sin(t + i) * 0.25);
      m.scale.setScalar(0.7 + vis * 0.45);
      (m.material as THREE.MeshBasicMaterial).opacity = vis * 0.95;
    });

    if (shadow.current) {
      const sq = 1 - bob * 4;
      shadow.current.scale.setScalar(Math.max(sq, 0.6));
      (shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.16 * Math.max(sq, 0.6);
    }

    const hs = hotspotRef.current;
    if (hs) {
      const frac = THREE.MathUtils.clamp((k.x / hw) * 0.5 + 0.5, 0.03, 0.97);
      hs.style.transform = `translate3d(${frac * st.size.width}px, 0, 0) translateX(-50%)`;
      hs.style.opacity = open ? '0' : '1';
      hs.style.pointerEvents = open ? 'none' : 'auto';
    }
  });

  return (
    <group ref={rig} position={[0, 0, 0]} scale={0.62}>
      <mesh ref={shadow} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 24]} />
        <meshBasicMaterial color="#2b2620" transparent opacity={0.16} depthWrite={false} />
      </mesh>

      {[1, -1].map((side) => (
        <group key={side} ref={side === 1 ? legL : legR} position={[side * 0.09, 0.74, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.052, 0.5, 4, 10]} />
            <meshLambertMaterial color={C.skin} />
          </mesh>
          <RoundedBox args={[0.11, 0.07, 0.2]} radius={0.025} smoothness={3} position={[0, -0.62, 0.04]}>
            <meshLambertMaterial color={C.charcoal} />
          </RoundedBox>
        </group>
      ))}

      <group ref={body}>
        <mesh position={[0, 0.88, 0]}>
          <cylinderGeometry args={[0.155, 0.3, 0.36, 18]} />
          <meshLambertMaterial color={C.skirt} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.035, 18]} />
          <meshLambertMaterial color={C.skirtTrim} />
        </mesh>
        <RoundedBox args={[0.36, 0.4, 0.22]} radius={0.09} smoothness={4} position={[0, 1.2, 0]}>
          <meshLambertMaterial color={C.dress} />
        </RoundedBox>
        <mesh position={[0, 1.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.085, 0.028, 8, 18]} />
          <meshLambertMaterial color={C.dressTrim} />
        </mesh>

        {[
          { ref: armL, fore: foreL, x: 0.21 },
          { ref: armR, fore: foreR, x: -0.21 },
        ].map((a) => (
          <group key={a.x} ref={a.ref} position={[a.x, 1.34, 0]}>
            <mesh position={[0, -0.13, 0]}>
              <capsuleGeometry args={[0.042, 0.2, 4, 10]} />
              <meshLambertMaterial color={C.dress} />
            </mesh>
            <group ref={a.fore} position={[0, -0.27, 0]}>
              <mesh position={[0, -0.11, 0]}>
                <capsuleGeometry args={[0.038, 0.18, 4, 10]} />
                <meshLambertMaterial color={C.skin} />
              </mesh>
              <mesh position={[0, -0.24, 0.02]}>
                <sphereGeometry args={[0.048, 12, 12]} />
                <meshLambertMaterial color={C.skin} />
              </mesh>
            </group>
          </group>
        ))}

        <mesh position={[0, 1.48, 0]}>
          <cylinderGeometry args={[0.055, 0.075, 0.18, 10]} />
          <meshLambertMaterial color={C.skin} />
        </mesh>

        <group ref={head} position={[0, 1.72, 0]}>
          <mesh scale={[0.94, 1, 0.92]}>
            <sphereGeometry args={[0.3, 24, 20]} />
            <meshLambertMaterial color={C.skin} />
          </mesh>
          <mesh position={[0, 0.05, -0.05]} scale={[1.02, 1.02, 1.0]}>
            <sphereGeometry args={[0.31, 24, 20]} />
            <meshLambertMaterial color={C.hair} />
          </mesh>
          <mesh position={[0, 0.2, 0.1]} scale={[0.9, 0.55, 0.75]}>
            <sphereGeometry args={[0.28, 20, 16]} />
            <meshLambertMaterial color={C.hair} />
          </mesh>
          <mesh position={[0, 0.28, -0.12]}>
            <sphereGeometry args={[0.11, 16, 14]} />
            <meshLambertMaterial color={C.hairDark} />
          </mesh>
          <mesh position={[0, -0.5, -0.22]} scale={[0.75, 1.7, 0.5]}>
            <sphereGeometry args={[0.26, 18, 16]} />
            <meshLambertMaterial color={C.hair} />
          </mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.26, -0.42, 0.08]} rotation={[0, 0, sd * 0.05]}>
              <capsuleGeometry args={[0.055, 0.6, 4, 8]} />
              <meshLambertMaterial color={C.hair} />
            </mesh>
          ))}
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.2, 0.16, 0.14]} rotation={[sd * 0.5, 0, sd * 0.35]}>
              <capsuleGeometry args={[0.035, 0.16, 4, 8]} />
              <meshLambertMaterial color={C.hair} />
            </mesh>
          ))}
          <group position={[0.24, 0.14, 0.06]} rotation={[0, 0, -0.45]}>
            {[-1, 1].map((sd) => (
              <mesh key={sd} position={[sd * 0.07, 0, 0]} rotation={[0, 0, sd * 0.45]} scale={[1.15, 0.6, 0.45]}>
                <sphereGeometry args={[0.07, 10, 8]} />
                <meshLambertMaterial color={C.dressTrim} />
              </mesh>
            ))}
            <mesh scale={[0.75, 0.75, 0.75]}>
              <sphereGeometry args={[0.04, 10, 8]} />
              <meshLambertMaterial color={C.dressTrim} />
            </mesh>
          </group>

          <group ref={eyes} position={[0, 0.02, 0]}>
            {[-1, 1].map((sd) => (
              <group key={sd} position={[sd * 0.11, 0, 0.26]}>
                <mesh>
                  <sphereGeometry args={[0.052, 14, 12]} />
                  <meshBasicMaterial color={C.eye} toneMapped={false} />
                </mesh>
                <mesh position={[0.014, 0.018, 0.042]}>
                  <sphereGeometry args={[0.016, 8, 8]} />
                  <meshBasicMaterial color="#ffffff" toneMapped={false} />
                </mesh>
              </group>
            ))}
          </group>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.17, -0.05, 0.23]} scale={[1, 0.6, 0.4]}>
              <sphereGeometry args={[0.042, 10, 10]} />
              <meshBasicMaterial color={C.blush} transparent opacity={0.5} toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, -0.09, 0.27]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.035, 0.012, 8, 14, Math.PI]} />
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
          <planeGeometry args={[0.14, 0.1]} />
          <meshBasicMaterial color={i % 2 === 0 ? C.chip : C.dressTrim} transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
