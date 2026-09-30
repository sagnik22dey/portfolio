import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Islands from './Islands';
import { Clouds, PaperPlanes } from './Sky';
import { useFlight, type FlightApi } from './useFlight';
import { disposePaper } from './paper';
import type { TierSettings } from './quality';

/** Huge inverted sphere with a vertex-colour gradient: cheap unlit sky, no textures. */
function SkyDome() {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(160, 24, 12);
    const top = new THREE.Color('#f6d9b8');
    const mid = new THREE.Color('#faf1e1');
    const low = new THREE.Color('#e9c9a8');
    const pos = g.attributes.position;
    const cols: number[] = [];
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const h = pos.getY(i) / 160;
      if (h > 0) c.copy(mid).lerp(top, h);
      else c.copy(mid).lerp(low, Math.min(1, -h * 1.6));
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} position={[6, 0, -24]} frustumCulled={false}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

type Props = {
  settings: TierSettings;
  enabled: boolean;
  activeProject: number | null;
  onStop: (i: number) => void;
  onPickProject: (i: number) => void;
  register: (api: FlightApi) => void;
  onProgress: (p: number) => void;
};

/** Whole archipelago scene. Lighting is one hemisphere + one directional light for every island. */
export default function World({ settings, enabled, activeProject, onStop, onPickProject, register, onProgress }: Props) {
  const { gl } = useThree();
  useFlight({ enabled, onStop, register, onProgress });

  useEffect(() => () => {
    disposePaper();
    gl.renderLists.dispose();
  }, [gl]);

  return (
    <>
      <hemisphereLight args={['#fff4e2', '#b88a64', 1.15]} />
      <directionalLight position={[8, 14, 10]} intensity={1.6} color="#fff1dc" />
      <SkyDome />
      <Islands
        isletCount={settings.islets}
        cardCount={14}
        activeProject={activeProject}
        onPickProject={onPickProject}
        onPickIsland={(i) => onStop(i)}
        outlines={settings.outlines}
      />
      <Clouds count={settings.clouds} />
      <PaperPlanes count={settings.planes} />
    </>
  );
}
