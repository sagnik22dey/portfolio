import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Islands from './Islands';
import { Clouds, PaperPlanes } from './Sky';
import { useFlight, type FlightApi } from './useFlight';
import { disposePaper } from './paper';
import type { TierSettings } from './quality';
import { sceneColors, type SceneColors } from './sceneTheme';
import { useTheme } from '../theme';

/** Huge inverted sphere with a vertex-colour gradient: cheap unlit sky, no textures. */
function SkyDome({ c: sc }: { c: SceneColors }) {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(160, 24, 12);
    const top = new THREE.Color(sc.skyTop);
    const mid = new THREE.Color(sc.skyMid);
    const low = new THREE.Color(sc.skyLow);
    const pos = g.attributes.position;
    const cols: number[] = [];
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const h = pos.getY(i) / 160;
      if (h > 0) c.copy(mid).lerp(top, Math.pow(h, 0.7));
      else c.copy(mid).lerp(low, Math.min(1, -h * 1.6));
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    return g;
  }, [sc]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} position={[6, 0, -24]} frustumCulled={false}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

/** One Points draw call of twinkle-free stars scattered on the upper sky dome (night only). */
function Stars({ count }: { count: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    let s = 77;
    const r = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2;
      const y = 0.12 + r() * 0.88;
      const k = Math.sqrt(1 - y * y);
      p.set([Math.cos(a) * k * 150 + 6, y * 150, Math.sin(a) * k * 150 - 24], i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, [count]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial color="#fff6dc" size={1.6} sizeAttenuation fog={false} depthWrite={false} />
    </points>
  );
}

/** Keeps the renderer background and fog in sync with the theme. */
function Atmosphere({ c }: { c: SceneColors }) {
  return (
    <>
      <color attach="background" args={[c.bg]} />
      <fog attach="fog" args={[c.fog, c.fogNear, c.fogFar]} />
    </>
  );
}

type Props = {
  settings: TierSettings;
  enabled: boolean;
  activeProject: number | null;
  onStop: (i: number) => void;
  onGoTo: (i: number) => void;
  onPickProject: (i: number) => void;
  register: (api: FlightApi) => void;
  onProgress: (p: number) => void;
};

/** Whole archipelago scene. Lighting is one hemisphere + one directional light for every island. */
export default function World({ settings, enabled, activeProject, onStop, onGoTo, onPickProject, register, onProgress }: Props) {
  const { gl } = useThree();
  const { theme } = useTheme();
  const c = sceneColors(theme);
  useFlight({ enabled, onStop, register, onProgress });

  useEffect(() => () => {
    disposePaper();
    gl.renderLists.dispose();
  }, [gl]);

  return (
    <>
      <Atmosphere c={c} />
      <hemisphereLight args={[c.hemiSky, c.hemiGround, c.hemi]} />
      <directionalLight position={c.sunPos} intensity={c.sunIntensity} color={c.sun} />
      <SkyDome c={c} />
      {c.stars && <Stars count={settings.islets > 4 ? 420 : 220} />}
      <Islands
        isletCount={settings.islets}
        cardCount={14}
        activeProject={activeProject}
        onPickProject={onPickProject}
        onPickIsland={(i) => onGoTo(i)}
        outlines={settings.outlines}
        models={settings.models}
        night={theme === 'dark'}
      />
      <Clouds count={settings.clouds} color={c.cloud} />
      <PaperPlanes count={settings.planes} />
    </>
  );
}
