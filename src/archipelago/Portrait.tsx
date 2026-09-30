import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { geom, paperMat } from './paper';
import { Part } from './Landmarks';

const loader = new THREE.TextureLoader();
const W = 1.12;
const H = 1.4;

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
uniform float uTime;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
void main() {
  vec4 s = texture2D(uSketch, vUv);
  vec4 c = texture2D(uColor, vUv);
  float n = noise(vUv * 6.0 + uTime * 0.05) * 0.6 + noise(vUv * 18.0) * 0.4;
  float d = distance(vUv, vec2(0.5, 0.62)) * 1.25 + n * 0.35;
  float edge = uProgress * 1.4 - 0.05;
  float m = smoothstep(edge, edge - 0.08, d);
  float ink = smoothstep(0.03, 0.0, abs(d - edge)) * step(0.01, uProgress) * step(uProgress, 0.99);
  vec3 col = mix(s.rgb, c.rgb, m);
  col = mix(col, vec3(0.76, 0.25, 0.05), ink * 0.85);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

/** Load a texture and dispose it on unmount. */
function useTex(url: string): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
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
  return tex;
}

/** Easel on the About island holding Sagnik's portrait, which paints itself from sketch to colour and tilts toward the pointer. */
export default function Portrait({ position = [1.7, 0, 0.3] as [number, number, number] }) {
  const sketch = useTex('/images/portrait_sketch.webp');
  const color = useTex('/images/portrait_color.webp');
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const frame = useRef<THREE.Group>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const [uniforms] = useState(() => ({
    uSketch: { value: null as THREE.Texture | null },
    uColor: { value: null as THREE.Texture | null },
    uProgress: { value: 0 },
    uTime: { value: 0 },
  }));

  useEffect(() => {
    if (!hover) return;
    document.body.style.cursor = 'pointer';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hover]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const m = mat.current;
    if (m) {
      m.uniforms.uSketch.value = sketch;
      m.uniforms.uColor.value = color;
      m.uniforms.uTime.value = t;
      const cycle = (t % 11) / 11;
      const auto = cycle < 0.3 ? 0 : cycle < 0.5 ? (cycle - 0.3) / 0.2 : cycle < 0.85 ? 1 : 1 - (cycle - 0.85) / 0.15;
      const want = hover || pinned ? 1 : auto;
      const cur = m.uniforms.uProgress.value as number;
      m.uniforms.uProgress.value = cur + (want - cur) * (1 - Math.pow(0.02, delta));
    }
    const g = frame.current;
    if (g) {
      const k = 1 - Math.pow(0.01, delta);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, -0.25 + state.pointer.x * 0.15, k);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.05 - state.pointer.y * 0.05, k);
      g.position.y = 1.55 + Math.sin(t * 0.9) * 0.05;
      const s = hover ? 1.06 : 1;
      g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, s, k));
    }
  });

  const ready = sketch && color;

  return (
    <group position={position}>
      <Part geo={geom('box', 0.06, 1.7, 0.06)} color="#8a6a4a" position={[-0.4, 0.85, -0.2]} rotation={[-0.1, 0, 0.12]} ink={0.015} />
      <Part geo={geom('box', 0.06, 1.7, 0.06)} color="#8a6a4a" position={[0.4, 0.85, -0.2]} rotation={[-0.1, 0, -0.12]} ink={0.015} />
      <Part geo={geom('box', 1.1, 0.07, 0.18)} color="#b8906a" position={[0, 0.6, 0.1]} ink={0.015} />
      <group
        ref={frame}
        position={[0, 1.55, 0.18]}
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
        <Part geo={geom('box', W + 0.34, H + 0.34, 0.06)} color="#c2410c" position={[0.05, -0.05, -0.08]} rotation={[0, 0, 0.04]} ink={0.02} />
        <Part geo={geom('box', W + 0.2, H + 0.2, 0.08)} color="#fdfcf8" ink={0.03} />
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[W, H]} />
          {ready ? (
            <shaderMaterial key="portrait" ref={mat} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} />
          ) : (
            <meshBasicMaterial key="blank" color="#e9dfc4" />
          )}
        </mesh>
        <mesh position={[0.4, H / 2 + 0.08, 0.06]} rotation={[0, 0, -0.2]} geometry={geom('box', 0.36, 0.11, 0.01)} material={paperMat('#e8763f')} />
        <mesh position={[-0.42, -H / 2 - 0.06, 0.06]} rotation={[0, 0, 0.15]} geometry={geom('box', 0.3, 0.1, 0.01)} material={paperMat('#e8763f')} />
      </group>
      <Part geo={geom('box', 0.5, 0.07, 0.36)} color="#fdfcf8" position={[0.75, 0.04, 0.5]} rotation={[0, 0.4, 0]} ink={0.015} />
      {['#c2410c', '#6b7c5f', '#f3c87a', '#3b6fb6'].map((c, i) => (
        <mesh key={c} position={[0.62 + (i % 2) * 0.18, 0.09, 0.42 + Math.floor(i / 2) * 0.14]} geometry={geom('cyl', 0.05, 0.05, 0.03, 8)} material={paperMat(c)} />
      ))}
    </group>
  );
}
