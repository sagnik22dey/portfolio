import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useRef, type RefObject } from 'react';
import * as THREE from 'three';

const DEG = Math.PI / 180;

const C = {
  skin: '#f2c49b',
  skinShade: '#e0ab84',
  hair: '#8a4a32',
  hairDark: '#733c28',
  sweater: '#e58fb1',
  sweaterLight: '#f3b6cd',
  plum: '#5a4a6b',
  charcoal: '#2b2b31',
  charcoalSoft: '#3a3a44',
  laptop: '#b9a3e3',
  laptopDark: '#9b82cc',
  screen: '#8f78c9',
  screenGlow: '#ffe9a8',
  chip: '#faf6ec',
  mouth: '#8c3540',
};

const SCREEN_GLOW_COLOR = new THREE.Color(C.screenGlow);
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

/** Procedural chibi Hoshi: patrols the strip, types on her laptop, floats result chips while searching. */
export default function Hoshi3D({ open, searching, hotspotRef }: Props) {
  const rig = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const foreL = useRef<THREE.Group>(null);
  const foreR = useRef<THREE.Group>(null);
  const handL = useRef<THREE.Mesh>(null);
  const handR = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const laptop = useRef<THREE.Group>(null);
  const screenMat = useRef<THREE.MeshBasicMaterial>(null);
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

    const typingAmt = open ? 1 : moving ? 0.12 : 0.75;
    const tap = Math.sin(t * 13) * 0.035 * typingAmt;
    if (armL.current) armL.current.rotation.x = -0.35 + tap * 0.5 + Math.sin(k.phase) * 0.06 * swing;
    if (armR.current) armR.current.rotation.x = -0.35 - tap * 0.5 - Math.sin(k.phase) * 0.06 * swing;
    if (foreL.current) foreL.current.rotation.x = -1.5 + tap;
    if (foreR.current) foreR.current.rotation.x = -1.5 - tap;
    if (handL.current) handL.current.position.z = 0.06 + Math.sin(t * 13) * 0.016 * typingAmt;
    if (handR.current) handR.current.position.z = 0.06 + Math.sin(t * 13 + Math.PI) * 0.016 * typingAmt;

    if (laptop.current) {
      laptop.current.rotation.z = Math.sin(k.phase) * 0.015 * swing;
      laptop.current.rotation.x = -0.22 + Math.sin(t * 2) * 0.01;
    }

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

    if (screenMat.current) {
      const glow = searching ? 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 7)) : typingAmt * 0.3;
      screenMat.current.color.set(C.screen).lerp(SCREEN_GLOW_COLOR, glow);
    }

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
    <group ref={rig} position={[0, 0, 0]} scale={0.9}>
      <mesh ref={shadow} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 24]} />
        <meshBasicMaterial color="#2b2620" transparent opacity={0.16} depthWrite={false} />
      </mesh>

      {[1, -1].map((side) => (
        <group key={side} ref={side === 1 ? legL : legR} position={[side * 0.13, 0.36, 0]}>
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.075, 0.22, 4, 10]} />
            <meshLambertMaterial color={C.plum} />
          </mesh>
          <RoundedBox args={[0.15, 0.09, 0.24]} radius={0.03} smoothness={3} position={[0, -0.31, 0.04]}>
            <meshLambertMaterial color={C.charcoal} />
          </RoundedBox>
        </group>
      ))}

      <group ref={body}>
        <RoundedBox args={[0.54, 0.62, 0.34]} radius={0.14} smoothness={4} position={[0, 0.66, 0]}>
          <meshLambertMaterial color={C.sweater} />
        </RoundedBox>
        <mesh position={[0, 0.97, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.11, 0.035, 8, 18]} />
          <meshLambertMaterial color={C.sweaterLight} />
        </mesh>

        {[
          { ref: armL, fore: foreL, hand: handL, x: 0.33 },
          { ref: armR, fore: foreR, hand: handR, x: -0.33 },
        ].map((a) => (
          <group key={a.x} ref={a.ref} position={[a.x, 0.94, 0.04]}>
            <mesh position={[0, -0.11, 0]}>
              <capsuleGeometry args={[0.07, 0.16, 4, 10]} />
              <meshLambertMaterial color={C.sweater} />
            </mesh>
            <group ref={a.fore} position={[0, -0.21, 0]}>
              <mesh position={[0, 0, 0.08]}>
                <capsuleGeometry args={[0.062, 0.14, 4, 10]} />
                <meshLambertMaterial color={C.sweaterLight} />
              </mesh>
              <mesh ref={a.hand} position={[0, -0.02, 0.2]}>
                <sphereGeometry args={[0.062, 12, 12]} />
                <meshLambertMaterial color={C.skin} />
              </mesh>
            </group>
          </group>
        ))}

        <group ref={laptop} position={[0, 0.84, 0.3]}>
          <RoundedBox args={[0.58, 0.03, 0.38]} radius={0.012} smoothness={3}>
            <meshLambertMaterial color={C.laptopDark} />
          </RoundedBox>
          <group position={[0, 0.02, -0.17]} rotation={[-1.22, 0, 0]}>
            <RoundedBox args={[0.58, 0.4, 0.025]} radius={0.012} smoothness={3} position={[0, 0.19, 0]}>
              <meshLambertMaterial color={C.laptop} />
            </RoundedBox>
            <mesh position={[0, 0.19, 0.016]}>
              <planeGeometry args={[0.5, 0.32]} />
              <meshBasicMaterial ref={screenMat} color={C.screen} toneMapped={false} />
            </mesh>
          </group>
        </group>

        <group ref={head} position={[0, 1.08, 0]}>
          <mesh scale={[1, 0.96, 0.94]}>
            <sphereGeometry args={[0.42, 24, 20]} />
            <meshLambertMaterial color={C.skin} />
          </mesh>
          <mesh position={[0, 0.06, -0.06]} scale={[1.04, 1.0, 1.0]}>
            <sphereGeometry args={[0.43, 24, 20]} />
            <meshLambertMaterial color={C.hair} />
          </mesh>
          <mesh position={[0, 0.26, 0.16]} scale={[0.92, 0.5, 0.7]}>
            <sphereGeometry args={[0.4, 20, 16]} />
            <meshLambertMaterial color={C.hair} />
          </mesh>
          <mesh position={[0, 0.4, -0.14]}>
            <sphereGeometry args={[0.16, 16, 14]} />
            <meshLambertMaterial color={C.hairDark} />
          </mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.36, -0.12, -0.02]} scale={[0.55, 1.15, 0.7]}>
              <sphereGeometry args={[0.2, 14, 12]} />
              <meshLambertMaterial color={C.hair} />
            </mesh>
          ))}

          <group ref={eyes} position={[0, -0.02, 0]}>
            {[-1, 1].map((sd) => (
              <mesh key={sd} position={[sd * 0.155, 0, 0.37]}>
                <sphereGeometry args={[0.055, 12, 12]} />
                <meshBasicMaterial color={C.charcoal} toneMapped={false} />
              </mesh>
            ))}
          </group>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.23, -0.09, 0.32]} scale={[1, 0.6, 0.4]}>
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshBasicMaterial color={C.sweater} transparent opacity={0.5} toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, -0.13, 0.385]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.05, 0.016, 8, 14, Math.PI]} />
            <meshBasicMaterial color={C.mouth} toneMapped={false} />
          </mesh>

          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.155, 0.01, 0.385]}>
              <torusGeometry args={[0.115, 0.014, 8, 20]} />
              <meshLambertMaterial color={C.charcoal} />
            </mesh>
          ))}
          <mesh position={[0, 0.01, 0.385]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.1, 8]} />
            <meshLambertMaterial color={C.charcoal} />
          </mesh>

          <mesh position={[0, 0.08, -0.02]} rotation={[0.12, 0, 0]}>
            <torusGeometry args={[0.46, 0.042, 8, 22, Math.PI]} />
            <meshLambertMaterial color={C.charcoal} />
          </mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.45, 0.0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.11, 0.11, 0.09, 14]} />
              <meshLambertMaterial color={C.charcoalSoft} />
            </mesh>
          ))}
          <mesh position={[-0.28, -0.12, 0.2]} rotation={[-0.5, -0.75, 0.4]}>
            <cylinderGeometry args={[0.013, 0.013, 0.4, 8]} />
            <meshLambertMaterial color={C.charcoal} />
          </mesh>
          <mesh position={[-0.11, -0.21, 0.36]}>
            <sphereGeometry args={[0.028, 10, 10]} />
            <meshLambertMaterial color={C.charcoalSoft} />
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
          <meshBasicMaterial color={i % 2 === 0 ? C.chip : C.sweaterLight} transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
