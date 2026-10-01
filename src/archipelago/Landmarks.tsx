import { useContext, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { foldGeometry, geom, glowMat, inkHull, inkMat, paperMat } from './paper';
import { seeded } from './data';
import { OutlineContext } from './outline';

type V3 = [number, number, number];
type PartProps = {
  geo: THREE.BufferGeometry;
  color: string;
  position?: V3;
  rotation?: V3;
  scale?: number | V3;
  ink?: number;
  glow?: boolean;
  side?: THREE.Side;
};

/** One paper mesh with an optional inverted-hull ink outline so it reads clearly against the sky. */
export function Part({ geo, color, position, rotation, scale, ink = 0.03, glow = false, side }: PartProps) {
  const outline = useContext(OutlineContext);
  const hull = useMemo(() => (outline && ink > 0 ? inkHull(geo, ink) : null), [outline, geo, ink]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geo} material={glow ? glowMat(color) : paperMat(color, side)} />
      {hull && <mesh geometry={hull} material={inkMat()} />}
    </group>
  );
}

type RockProps = { radius: number; seed: number; top?: string; side?: string; decor?: boolean };

/** Floating folded-paper landmass: grassy cap, soil band, crumpled rock cone and a few drifting chunks. */
export function IslandRock({ radius, seed, top = '#7db35f', side = '#e3c9a0', decor = false }: RockProps) {
  const g = useMemo(() => {
    const cap = foldGeometry(new THREE.CylinderGeometry(radius, radius * 0.96, 0.5, 11, 1), radius * 0.05, seed, true);
    const soil = foldGeometry(new THREE.CylinderGeometry(radius * 0.97, radius * 0.84, 0.55, 11, 1), radius * 0.06, seed + 4);
    const base = foldGeometry(new THREE.ConeGeometry(radius * 0.86, radius * 1.7, 9, 3), radius * 0.18, seed + 9);
    base.rotateX(Math.PI);
    const r = seeded(seed + 31);
    const chunks = Array.from({ length: radius > 1.5 ? 3 : 1 }, (_, i) => {
      const a = (i / 3) * Math.PI * 2 + r();
      const d = radius * (0.95 + r() * 0.45);
      return { p: [Math.cos(a) * d, -radius * (0.7 + r() * 0.6), Math.sin(a) * d] as V3, s: radius * (0.1 + r() * 0.07) };
    });
    const bits = decor
      ? Array.from({ length: 9 }, (_, i) => {
          const a = r() * Math.PI * 2;
          const d = radius * (0.35 + r() * 0.55);
          return { p: [Math.cos(a) * d, 0, Math.sin(a) * d] as V3, stone: i % 3 === 0, tone: ['#f7b733', '#ef5b3a', '#f48fb1'][i % 3], s: 0.6 + r() * 0.6 };
        })
      : [];
    return { cap, soil, base, chunks, bits };
  }, [radius, seed, decor]);
  useEffect(() => () => {
    g.cap.dispose();
    g.soil.dispose();
    g.base.dispose();
  }, [g]);

  const ink = radius > 1.5 ? 0.06 : 0.035;
  return (
    <group>
      <Part geo={g.cap} color={top} position={[0, -0.25, 0]} ink={ink} />
      <Part geo={g.soil} color="#b9784a" position={[0, -0.77, 0]} ink={ink} />
      <Part geo={g.base} color={side} position={[0, -1.04 - radius * 0.85, 0]} ink={ink} />
      {g.chunks.map((c, i) => (
        <Part key={i} geo={geom('ico', 1, 0)} color={side} position={c.p} scale={c.s} ink={0.12} />
      ))}
      {g.bits.map((b, i) =>
        b.stone ? (
          <Part key={i} geo={geom('ico', 0.16, 0)} color="#d9cba6" position={[b.p[0], 0.05, b.p[2]]} scale={b.s} ink={0.03} />
        ) : (
          <group key={i} position={b.p} scale={b.s}>
            <mesh position={[0, 0.1, 0]} geometry={geom('cyl', 0.012, 0.012, 0.2, 4)} material={paperMat('#6b7c5f')} />
            <mesh position={[0, 0.22, 0]} geometry={geom('oct', 0.06)} material={paperMat(b.tone)} />
          </group>
        )
      )}
    </group>
  );
}

/** Low-poly paper trees (pines and round crowns) scattered around the rim of an island. */
export function Trees({ radius, seed, count = 4 }: { radius: number; seed: number; count?: number }) {
  const items = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + r() * 0.8;
      const d = radius * (0.66 + r() * 0.22);
      return {
        x: Math.cos(a) * d,
        z: Math.sin(a) * d,
        s: 0.6 + r() * 0.5,
        round: r() > 0.6,
        tone: r() > 0.5 ? '#3f8a4a' : '#68aa52',
      };
    });
  }, [radius, seed, count]);

  return (
    <group>
      {items.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <Part geo={geom('cyl', 0.06, 0.1, 0.55, 5)} color="#8a6a4a" position={[0, 0.27, 0]} ink={0.02} />
          {t.round ? (
            <>
              <Part geo={geom('ico', 0.5, 0)} color={t.tone} position={[0, 0.95, 0]} ink={0.035} />
              <Part geo={geom('ico', 0.3, 0)} color="#8cc46a" position={[0.25, 1.2, 0.15]} ink={0.03} />
            </>
          ) : (
            <>
              <Part geo={geom('cone', 0.46, 0.95, 6)} color={t.tone} position={[0, 0.85, 0]} ink={0.035} />
              <Part geo={geom('cone', 0.33, 0.7, 6)} color={t.tone} position={[0, 1.3, 0]} ink={0.03} />
            </>
          )}
        </group>
      ))}
    </group>
  );
}

/** Origami cottage with glowing windows, chimney, porch and picket fence — the About island's landmark. */
export function PaperHouse() {
  const smoke = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = smoke.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((c, i) => {
      const k = (t * 0.35 + i / 3) % 1;
      c.position.set(Math.sin(k * 4 + i) * 0.12, k * 1.3, 0);
      c.scale.setScalar(0.12 + k * 0.22);
    });
  });
  return (
    <group position={[-0.5, 0, -0.4]}>
      <Part geo={geom('box', 0.4, 0.14, 2.2)} color="#d9cba6" position={[0, 0.07, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 1]} ink={0.02} />
      <Part geo={geom('box', 1.8, 1.3, 1.3)} color="#fdfcf8" position={[0, 0.79, 0]} ink={0.04} />
      <Part geo={geom('cone', 1.45, 0.95, 4)} color="#c2410c" position={[0, 1.9, 0]} rotation={[0, Math.PI / 4, 0]} ink={0.045} />
      <Part geo={geom('box', 0.26, 0.6, 0.26)} color="#a8563a" position={[0.6, 2.1, -0.25]} ink={0.03} />
      <group ref={smoke} position={[0.6, 2.5, -0.25]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} geometry={geom('ico', 1, 0)} material={paperMat('#fdfcf8')} />
        ))}
      </group>
      <mesh position={[0.35, 0.55, 0.66]} geometry={geom('box', 0.4, 0.66, 0.04)} material={paperMat('#6b4a32')} />
      <mesh position={[-0.45, 0.9, 0.66]} geometry={geom('box', 0.36, 0.34, 0.03)} material={glowMat('#ffcf7a')} />
      <mesh position={[0.91, 0.9, 0.1]} rotation={[0, Math.PI / 2, 0]} geometry={geom('box', 0.36, 0.34, 0.03)} material={glowMat('#ffcf7a')} />
      <Part geo={geom('box', 0.9, 0.06, 0.5)} color="#c9a27e" position={[0.35, 0.03, 0.95]} ink={0.02} />
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-1.1 + i * 0.3, 0.22, 1.5]} geometry={geom('box', 0.07, 0.44, 0.05)} material={paperMat('#fdfcf8')} />
      ))}
      <mesh position={[-0.2, 0.3, 1.5]} geometry={geom('box', 1.9, 0.05, 0.03)} material={paperMat('#e9dfc4')} />
    </group>
  );
}

/** Waving paper pennant on a pole, used as a waypoint marker on the islands. */
export function Flag({ color = '#c2410c', position = [0, 0, 0] as V3 }) {
  const cloth = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.8, -0.2, 0, 0, -0.45, 0], 3));
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((state) => {
    if (cloth.current) cloth.current.rotation.y = Math.sin(state.clock.elapsedTime * 2.2 + position[0]) * 0.35;
  });
  return (
    <group position={position}>
      <Part geo={geom('cyl', 0.03, 0.03, 2, 5)} color="#4a423a" position={[0, 1, 0]} ink={0} />
      <mesh position={[0, 2.02, 0]} geometry={geom('ico', 0.07, 0)} material={paperMat('#f3c87a')} />
      <mesh ref={cloth} geometry={geo} position={[0.02, 1.96, 0]} material={paperMat(color, THREE.DoubleSide)} />
    </group>
  );
}

const TONES = ['#d9480f', '#f08c3a', '#3f8a4a', '#2f6fd6', '#f2b52c', '#8e44ad'];

/** Stacked-block skill towers, each crowned with a spinning paper gem — Studio island centrepiece. */
export function SkillTowers({ heights }: { heights: number[] }) {
  const gems = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = gems.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((c, i) => {
      c.rotation.y = t * 1.2 + i;
      c.position.y = heights[i] + 0.35 + Math.sin(t * 1.6 + i) * 0.08;
    });
  });
  const spots = heights.map((_, i) => {
    const a = (i / heights.length) * Math.PI * 1.3 - Math.PI * 0.65;
    return [Math.sin(a) * 1.55, -Math.cos(a) * 0.95] as [number, number];
  });
  return (
    <group position={[0, 0, -0.2]}>
      {heights.map((h, i) => {
        const blocks = Math.max(2, Math.round(h / 0.35));
        const bh = h / blocks;
        return (
          <group key={i} position={[spots[i][0], 0, spots[i][1]]}>
            {Array.from({ length: blocks }, (_, b) => (
              <Part
                key={b}
                geo={geom('box', 0.5 - b * 0.02, bh * 0.94, 0.5 - b * 0.02)}
                color={b % 2 ? '#fdfcf8' : TONES[i % TONES.length]}
                position={[0, bh * b + bh / 2, 0]}
                rotation={[0, b * 0.18, 0]}
                ink={0.025}
              />
            ))}
          </group>
        );
      })}
      <group ref={gems}>
        {spots.map((s, i) => (
          <group key={i} position={[s[0], heights[i] + 0.35, s[1]]}>
            <Part geo={geom('oct', 0.16)} color={TONES[(i + 2) % TONES.length]} ink={0.02} />
          </group>
        ))}
      </group>
    </group>
  );
}

/** Sawtooth-roof paper workshop with a glowing doorway — gives the Studio island a real building. */
export function Workshop() {
  return (
    <group position={[0, 0, -1.6]}>
      <Part geo={geom('box', 2.4, 1.1, 1.1)} color="#fdfcf8" position={[0, 0.55, 0]} ink={0.04} />
      {[-0.8, 0, 0.8].map((x) => (
        <group key={x} position={[x, 1.1, 0]}>
          <Part geo={geom('cyl', 0.01, 0.6, 1.14, 3)} color="#6b7c5f" rotation={[Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.2, 0]} scale={[1, 1, 0.8]} ink={0.03} />
        </group>
      ))}
      <mesh position={[0, 0.42, 0.56]} geometry={geom('box', 0.5, 0.8, 0.03)} material={glowMat('#ffcf7a')} />
      <mesh position={[-0.8, 0.65, 0.56]} geometry={geom('box', 0.4, 0.3, 0.03)} material={glowMat('#ffe2a8')} />
      <mesh position={[0.8, 0.65, 0.56]} geometry={geom('box', 0.4, 0.3, 0.03)} material={glowMat('#ffe2a8')} />
      <Part geo={geom('box', 1.1, 0.28, 0.04)} color="#2b2620" position={[0, 1.02, 0.58]} ink={0} />
    </group>
  );
}

/** Paper windmill whose sails turn continuously. */
export function Windmill({ position = [0, 0, 0] as V3 }) {
  const sails = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (sails.current) sails.current.rotation.z += d * 0.9;
  });
  return (
    <group position={position}>
      <Part geo={geom('cyl', 0.28, 0.45, 1.8, 8)} color="#fdfcf8" position={[0, 0.9, 0]} ink={0.035} />
      <Part geo={geom('cone', 0.4, 0.5, 8)} color="#a8563a" position={[0, 2.05, 0]} ink={0.035} />
      <group ref={sails} position={[0, 1.75, 0.42]}>
        <mesh geometry={geom('ico', 0.09, 0)} material={paperMat('#2b2620')} />
        {[0, 1, 2, 3].map((k) => (
          <group key={k} rotation={[0, 0, (k * Math.PI) / 2]}>
            <Part geo={geom('box', 0.2, 0.9, 0.02)} color={k % 2 ? '#e8763f' : '#fdfcf8'} position={[0.06, 0.52, 0]} ink={0.02} />
          </group>
        ))}
      </group>
    </group>
  );
}

/** Drafting desk with a glowing monitor, stool and floating code gear — the "maker" corner. */
export function Desk({ position = [0, 0, 0] as V3 }) {
  const gear = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = gear.current;
    if (!g) return;
    g.rotation.z = state.clock.elapsedTime * 0.8;
    g.position.y = 1.75 + Math.sin(state.clock.elapsedTime * 1.3) * 0.08;
  });
  return (
    <group position={position} rotation={[0, -0.5, 0]}>
      <Part geo={geom('box', 1.2, 0.07, 0.6)} color="#c9a27e" position={[0, 0.7, 0]} ink={0.025} />
      {[-0.52, 0.52].map((x) => (
        <Part key={x} geo={geom('box', 0.06, 0.7, 0.5)} color="#8a6a4a" position={[x, 0.35, 0]} ink={0.015} />
      ))}
      <Part geo={geom('box', 0.7, 0.45, 0.05)} color="#2b2620" position={[0, 1.05, -0.12]} ink={0.02} />
      <mesh position={[0, 1.05, -0.09]} geometry={geom('box', 0.62, 0.37, 0.01)} material={glowMat('#9fd8c4')} />
      {[0.12, 0.02, -0.08].map((y, i) => (
        <mesh key={y} position={[-0.12 + i * 0.05, 1.05 + y, -0.08]} geometry={geom('box', 0.3 - i * 0.06, 0.03, 0.005)} material={glowMat(i === 1 ? '#e8763f' : '#2b2620')} />
      ))}
      <Part geo={geom('cyl', 0.03, 0.03, 0.2, 5)} color="#2b2620" position={[0, 0.83, -0.12]} ink={0} />
      <Part geo={geom('cyl', 0.2, 0.2, 0.06, 8)} color="#c2410c" position={[0.1, 0.45, 0.55]} ink={0.02} />
      <Part geo={geom('cyl', 0.03, 0.03, 0.45, 5)} color="#4a423a" position={[0.1, 0.22, 0.55]} ink={0} />
      <group ref={gear} position={[0.5, 1.75, 0]}>
        <Part geo={geom('torus', 0.2, 0.07, 4, 10)} color="#f3c87a" ink={0.02} />
        {Array.from({ length: 8 }, (_, k) => (
          <mesh key={k} rotation={[0, 0, (k * Math.PI) / 4]} position={[Math.cos((k * Math.PI) / 4) * 0.28, Math.sin((k * Math.PI) / 4) * 0.28, 0]} geometry={geom('box', 0.1, 0.08, 0.1)} material={paperMat('#f3c87a')} />
        ))}
      </group>
    </group>
  );
}

const beamMat = new THREE.MeshBasicMaterial({ color: '#ffcf70', transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, blending: THREE.AdditiveBlending, fog: false });

/** Rotating translucent double beam + lamp halo, sized to sit on top of the GLB lighthouse. */
export function LighthouseBeam({ position = [0, 0, 0] as V3, night = false }: { position?: V3; night?: boolean }) {
  const beam = useRef<THREE.Group>(null);
  const beamGeo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.9, 6, 16, 1, true);
    g.translate(0, -3, 0);
    g.rotateZ(Math.PI / 2);
    return g;
  }, []);
  useEffect(() => () => beamGeo.dispose(), [beamGeo]);
  useFrame((_, d) => {
    if (beam.current) beam.current.rotation.y += d * 0.8;
  });
  return (
    <group position={position}>
      <mesh geometry={geom('ico', 0.32, 1)} material={glowMat('#ffd37a')} />
      <group ref={beam} scale={night ? 1.25 : 1}>
        <mesh geometry={beamGeo} material={beamMat} />
        <mesh geometry={beamGeo} material={beamMat} rotation={[0, Math.PI, 0]} />
      </group>
    </group>
  );
}

/** Striped lighthouse on a rocky plinth with a gallery rail and a sweeping translucent beam. */
export function Lighthouse() {
  const beam = useRef<THREE.Group>(null);
  const beamGeo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.9, 5, 16, 1, true);
    g.translate(0, -2.5, 0);
    g.rotateZ(Math.PI / 2);
    return g;
  }, []);
  useEffect(() => () => beamGeo.dispose(), [beamGeo]);
  useFrame((_, d) => {
    if (beam.current) beam.current.rotation.y += d * 0.8;
  });
  return (
    <group position={[0.6, 0, -0.4]}>
      <Part geo={geom('ico', 0.8, 0)} color="#d9cba6" position={[0, 0.15, 0]} scale={[1, 0.45, 1]} ink={0.05} />
      {[0, 1, 2, 3].map((i) => (
        <Part
          key={i}
          geo={geom('cyl', 0.5 - (i + 1) * 0.06, 0.5 - i * 0.06, 0.8, 10)}
          color={i % 2 ? '#c2410c' : '#fdfcf8'}
          position={[0, 0.7 + i * 0.8, 0]}
          ink={0.035}
        />
      ))}
      <Part geo={geom('cyl', 0.42, 0.42, 0.08, 12)} color="#2b2620" position={[0, 3.34, 0]} ink={0} />
      {Array.from({ length: 10 }, (_, k) => {
        const a = (k / 10) * Math.PI * 2;
        return <mesh key={k} position={[Math.cos(a) * 0.4, 3.5, Math.sin(a) * 0.4]} geometry={geom('box', 0.03, 0.26, 0.03)} material={paperMat('#2b2620')} />;
      })}
      <mesh position={[0, 3.62, 0]} geometry={geom('torus', 0.4, 0.02, 4, 20)} rotation={[Math.PI / 2, 0, 0]} material={paperMat('#2b2620')} />
      <mesh position={[0, 3.6, 0]} geometry={geom('cyl', 0.26, 0.26, 0.45, 10)} material={glowMat('#ffd37a')} />
      <mesh position={[0, 3.6, 0]} geometry={geom('ico', 0.5, 1)} material={beamMat} />
      <Part geo={geom('cone', 0.38, 0.5, 10)} color="#2b2620" position={[0, 4.07, 0]} ink={0} />
      <mesh position={[0, 4.36, 0]} geometry={geom('ico', 0.06, 0)} material={glowMat('#e8763f')} />
      <group ref={beam} position={[0, 3.6, 0]}>
        <mesh geometry={beamGeo} material={beamMat} />
        <mesh geometry={beamGeo} material={beamMat} rotation={[0, Math.PI, 0]} />
      </group>
      <mesh position={[0.3, 1.7, 0.42]} geometry={geom('box', 0.14, 0.24, 0.02)} material={glowMat('#ffe2a8')} />
      <mesh position={[-0.25, 2.5, 0.36]} geometry={geom('box', 0.12, 0.2, 0.02)} material={glowMat('#ffe2a8')} />
    </group>
  );
}

/** Paper mailbox with a waving flag, sitting next to the lighthouse. */
export function Mailbox() {
  const flag = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (flag.current) flag.current.rotation.z = -0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.25;
  });
  return (
    <group position={[-1.2, 0, 0.7]} rotation={[0, 0.4, 0]}>
      <Part geo={geom('box', 0.1, 0.8, 0.1)} color="#8a6a4a" position={[0, 0.4, 0]} ink={0.02} />
      <Part geo={geom('cyl', 0.24, 0.24, 0.62, 10, 0, Math.PI)} color="#6b7c5f" position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]} ink={0.025} />
      <Part geo={geom('box', 0.62, 0.03, 0.48)} color="#6b7c5f" position={[0, 0.9, 0]} ink={0.02} />
      <group ref={flag} position={[0.24, 0.95, 0.25]}>
        <mesh position={[0, 0.15, 0]} geometry={geom('box', 0.04, 0.32, 0.02)} material={paperMat('#c2410c')} />
        <mesh position={[0.07, 0.27, 0]} geometry={geom('box', 0.14, 0.09, 0.02)} material={paperMat('#c2410c')} />
      </group>
    </group>
  );
}

/** Wooden jetty sticking off the island rim with a bobbing origami boat. */
export function Dock() {
  const boat = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = boat.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.position.y = -0.55 + Math.sin(t * 1.4) * 0.07;
    g.rotation.z = Math.sin(t * 1.1) * 0.08;
  });
  return (
    <group position={[-1.6, 0, 1.9]} rotation={[0, -0.7, 0]}>
      {Array.from({ length: 6 }, (_, i) => (
        <Part key={i} geo={geom('box', 0.7, 0.06, 0.2)} color={i % 2 ? '#c9a27e' : '#b8906a'} position={[0, 0.02, 0.4 + i * 0.22]} ink={0.015} />
      ))}
      {[0.35, 1.45].map((z) =>
        [-0.32, 0.32].map((x) => (
          <Part key={`${x}${z}`} geo={geom('cyl', 0.05, 0.05, 1, 5)} color="#8a6a4a" position={[x, -0.4, z]} ink={0.015} />
        ))
      )}
      <group ref={boat} position={[0.9, -0.55, 1.2]}>
        <Part geo={geom('cyl', 0.01, 0.35, 1.1, 4)} color="#fdfcf8" rotation={[0, Math.PI / 4, Math.PI / 2]} scale={[1, 1, 0.55]} ink={0.03} />
        <Part geo={geom('cone', 0.3, 0.8, 3)} color="#e8763f" position={[0, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} scale={[0.15, 1, 1]} ink={0.02} />
      </group>
    </group>
  );
}

/** Paper envelopes orbiting the lighthouse like messages heading out. */
export function Envelopes({ count = 4 }: { count?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((c, i) => {
      const a = t * 0.5 + (i / count) * Math.PI * 2;
      c.position.set(Math.cos(a) * 2.3, 2.4 + Math.sin(a * 2 + i) * 0.4, Math.sin(a) * 2.3);
      c.rotation.set(Math.sin(a * 3) * 0.3, -a, Math.sin(a) * 0.2);
    });
  });
  return (
    <group ref={ref} position={[0.6, 0, -0.4]}>
      {Array.from({ length: count }, (_, i) => (
        <group key={i}>
          <Part geo={geom('box', 0.44, 0.28, 0.02)} color="#fdfcf8" ink={0.015} />
          <mesh position={[0, 0.04, 0.012]} rotation={[0, 0, Math.PI / 4]} geometry={geom('box', 0.24, 0.24, 0.005)} material={paperMat('#e9dfc4')} />
          <mesh position={[0, -0.02, 0.018]} geometry={geom('ico', 0.035, 0)} material={paperMat('#c2410c')} />
        </group>
      ))}
    </group>
  );
}
