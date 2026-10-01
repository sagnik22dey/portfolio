import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { anisotropy, geom, paperMat } from './paper';
import { Part } from './Landmarks';

const loader = new THREE.TextureLoader();
const W = 1.2;
const H = 1.5;
const ROWS = 7;
const PAINT_SECONDS = 4.2;
const WIPE_SECONDS = 0.9;

const vert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const frag = /* glsl */ `
uniform sampler2D uSketch;
uniform sampler2D uColor;
uniform float uProgress;
uniform float uWipe;
varying vec2 vUv;
const float ROWS = ${ROWS}.0;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
void main() {
  vec4 s = texture2D(uSketch, vUv);
  vec4 c = texture2D(uColor, vUv);
  float y = (1.0 - vUv.y) * ROWS + (noise(vec2(vUv.x * 5.0, 3.0)) - 0.5) * 0.35;
  float row = clamp(floor(y), 0.0, ROWS - 1.0);
  float total = uProgress * ROWS;
  float local = clamp(total - row, 0.0, 1.0);
  float dir = mod(row, 2.0);
  float x = mix(vUv.x, 1.0 - vUv.x, dir);
  float bristle = noise(vec2(x * 4.0, y * 38.0)) * 0.16 + noise(vec2(x * 30.0, y * 90.0)) * 0.05;
  float head = local * 1.22 - 0.11;
  float paint = smoothstep(head + 0.015, head - 0.015, x + bristle);
  float prev = step(row + 1.0, total + 0.0001);
  paint = max(paint, prev);
  float wet = paint * (1.0 - prev) * smoothstep(head - 0.18, head, x + bristle);
  float streak = 0.94 + noise(vec2(x * 3.0, y * 60.0)) * 0.12;
  vec3 painted = c.rgb * streak;
  painted = mix(painted, painted * vec3(1.06, 0.98, 0.94), wet * 0.6);
  vec3 col = mix(s.rgb, painted, paint);
  col = mix(col, s.rgb, uWipe);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

/** Load a texture with mipmaps + anisotropy and dispose it on unmount. */
function useTex(url: string): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    let loaded: THREE.Texture | null = null;
    loader.load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = anisotropy();
      t.minFilter = THREE.LinearMipmapLinearFilter;
      loaded = t;
      if (alive) setTex(t);
      else t.dispose();
    });
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, [url]);
  return tex;
}

/** Round thumbtack: domed head + short needle, used to pin the canvas to the board. */
function Pin({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh position={[0, 0.035, 0]} geometry={geom('sphere', 0.055, 12, 8, Math.PI / 2)} material={paperMat(color)} />
      <mesh position={[0, 0.025, 0]} geometry={geom('cyl', 0.06, 0.06, 0.02, 12)} material={paperMat(color)} />
      <mesh position={[0, 0.005, 0]} geometry={geom('cyl', 0.008, 0.008, 0.04, 5)} material={paperMat('#c9c2b4')} />
    </group>
  );
}

type PaintState = { p: number; wipe: number; mode: 'idle' | 'paint' | 'hold' | 'wipe'; t: number };

/** Advance the paint state machine: idle → paint (constant speed) → hold → wipe back to sketch; hover/tap keeps it painted. */
function stepPaint(s: PaintState, dt: number, keep: boolean) {
  s.t += dt;
  if (s.mode === 'idle' && (keep || s.t > 1.6)) {
    s.mode = 'paint';
    s.t = 0;
  } else if (s.mode === 'paint') {
    s.p = Math.min(1, s.p + dt / PAINT_SECONDS);
    if (s.p >= 1) {
      s.mode = 'hold';
      s.t = 0;
    }
  } else if (s.mode === 'hold' && !keep && s.t > 5) {
    s.mode = 'wipe';
    s.t = 0;
  } else if (s.mode === 'wipe') {
    if (keep) {
      s.wipe = Math.max(0, s.wipe - dt * 3);
      if (s.wipe === 0) s.mode = 'hold';
    } else {
      s.wipe = Math.min(1, s.wipe + dt / WIPE_SECONDS);
      if (s.wipe >= 1) {
        s.p = 0;
        s.wipe = 0;
        s.mode = 'idle';
        s.t = 0;
      }
    }
  }
}

/** Easel on the About island: the portrait is painted stroke-by-stroke from sketch to colour by a moving brush (auto-loops; hover/tap keeps it painted). */
export default function Portrait({ position = [1.7, 0, 0.3] as [number, number, number] }) {
  const sketch = useTex('/images/portrait_sketch.webp');
  const color = useTex('/images/portrait_color.webp');
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const frame = useRef<THREE.Group>(null);
  const brush = useRef<THREE.Group>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const paint = useRef<PaintState>({ p: 0, wipe: 0, mode: 'idle', t: 0 });
  const [uniforms] = useState(() => ({
    uSketch: { value: null as THREE.Texture | null },
    uColor: { value: null as THREE.Texture | null },
    uProgress: { value: 0 },
    uWipe: { value: 0 },
  }));

  useEffect(() => {
    if (!hover) return;
    document.body.style.cursor = 'pointer';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hover]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = paint.current;
    if (sketch && color) stepPaint(s, dt, hover || pinned);

    const m = mat.current;
    if (m) {
      m.uniforms.uSketch.value = sketch;
      m.uniforms.uColor.value = color;
      m.uniforms.uProgress.value = s.p;
      m.uniforms.uWipe.value = s.wipe;
    }

    const b = brush.current;
    if (b) {
      const total = s.p * ROWS;
      const row = Math.min(ROWS - 1, Math.floor(total));
      const local = total - row;
      const along = row % 2 ? 1 - local : local;
      const tx = (along - 0.5) * W * 1.05;
      const ty = (0.5 - (row + 0.5) / ROWS) * H;
      const k = 1 - Math.pow(0.0005, dt);
      b.position.x = THREE.MathUtils.lerp(b.position.x, tx, k);
      b.position.y = THREE.MathUtils.lerp(b.position.y, ty + Math.sin(t * 22) * 0.012, k);
      b.rotation.z = (row % 2 ? 0.5 : -0.5) + Math.sin(t * 11) * 0.08;
      b.scale.setScalar(THREE.MathUtils.lerp(b.scale.x, s.mode === 'paint' ? 1 : 0, 1 - Math.pow(0.002, dt)));
      b.visible = b.scale.x > 0.02;
    }

    const g = frame.current;
    if (g) {
      const k = 1 - Math.pow(0.01, dt);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, -0.22 + state.pointer.x * 0.12, k);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.06 - state.pointer.y * 0.04, k);
      g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, hover ? 1.05 : 1, k));
    }
  });

  const ready = sketch && color;

  return (
    <group position={position}>
      <Part geo={geom('box', 0.07, 2.1, 0.07)} color="#7a5634" position={[-0.5, 1.05, -0.22]} rotation={[-0.08, 0, 0.1]} ink={0.015} />
      <Part geo={geom('box', 0.07, 2.1, 0.07)} color="#7a5634" position={[0.5, 1.05, -0.22]} rotation={[-0.08, 0, -0.1]} ink={0.015} />
      <Part geo={geom('box', 0.06, 1.9, 0.06)} color="#6a4a2c" position={[0, 0.9, -0.62]} rotation={[0.38, 0, 0]} ink={0.015} />
      <Part geo={geom('box', 1.3, 0.08, 0.2)} color="#a67c52" position={[0, 0.7, 0.02]} ink={0.015} />
      <group
        ref={frame}
        position={[0, 1.56, 0.08]}
        onClick={(e) => {
          e.stopPropagation();
          setPinned((v) => !v);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <Part geo={geom('box', W + 0.24, H + 0.24, 0.07)} color="#8a5a2e" position={[0, 0, -0.06]} ink={0.02} />
        <Part geo={geom('box', W + 0.08, H + 0.08, 0.04)} color="#fdfcf8" position={[0, 0, -0.01]} ink={0} />
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[W, H]} />
          {ready ? (
            <shaderMaterial key="portrait" ref={mat} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} />
          ) : (
            <meshBasicMaterial key="blank" color="#e9dfc4" />
          )}
        </mesh>
        <Pin position={[-W / 2 + 0.03, H / 2 - 0.03, 0.02]} color="#d4380d" />
        <Pin position={[W / 2 - 0.03, H / 2 - 0.03, 0.02]} color="#2f6fd6" />
        <Pin position={[-W / 2 + 0.03, -H / 2 + 0.03, 0.02]} color="#f2b52c" />
        <Pin position={[W / 2 - 0.03, -H / 2 + 0.03, 0.02]} color="#2e8b57" />
        <group ref={brush} position={[0, 0, 0.1]} scale={0}>
          <group position={[0.02, 0.32, 0.04]}>
            <mesh geometry={geom('cyl', 0.018, 0.028, 0.5, 8)} material={paperMat('#b5651d')} />
            <mesh position={[0, -0.28, 0]} geometry={geom('cyl', 0.03, 0.022, 0.08, 8)} material={paperMat('#c9c2b4')} />
            <mesh position={[0, -0.36, 0]} rotation={[Math.PI, 0, 0]} geometry={geom('cone', 0.03, 0.1, 8)} material={paperMat('#c2410c')} />
          </group>
        </group>
      </group>
      <Part geo={geom('box', 0.56, 0.06, 0.4)} color="#fdfcf8" position={[0.95, 0.04, 0.55]} rotation={[0, 0.4, 0]} ink={0.015} />
      {['#d4380d', '#2e8b57', '#f2b52c', '#2f6fd6', '#7b3fa0'].map((c, i) => (
        <mesh key={c} position={[0.78 + (i % 3) * 0.15, 0.09, 0.47 + Math.floor(i / 3) * 0.15]} geometry={geom('cyl', 0.055, 0.055, 0.03, 10)} material={paperMat(c)} />
      ))}
    </group>
  );
}