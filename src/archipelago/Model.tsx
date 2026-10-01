import { Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { modelMaterials } from './paper';

type V3 = [number, number, number];
type ModelProps = {
  url: string;
  height: number;
  position?: V3;
  rotation?: V3;
  tint?: Record<string, string>;
  night?: boolean;
  glow?: string[];
  lift?: number;
};

const lambert = modelMaterials;
const NIGHT_GLOW = new THREE.Color('#ffc46b');

/** Cheap flat Lambert copy of a glTF material (keeps colour, map and vertex colours) so models match the paper look and stay fast on phones. */
function toLambert(src: THREE.Material, key: string, tint?: string, glow = false, lift = 1.25): THREE.Material {
  const hit = lambert.get(key);
  if (hit) return hit;
  const s = src as THREE.MeshStandardMaterial;
  const m = new THREE.MeshLambertMaterial({
    color: (tint ? new THREE.Color(tint) : s.color?.clone() ?? new THREE.Color('#ffffff')).multiplyScalar(lift),
    map: tint ? null : s.map ?? null,
    vertexColors: tint ? false : s.vertexColors,
    transparent: s.transparent,
    opacity: s.opacity,
    side: s.side,
    flatShading: true,
  });
  if (s.emissive && (s.emissive.r + s.emissive.g + s.emissive.b > 0.01 || s.emissiveMap)) {
    m.emissive = s.emissive.clone();
    m.emissiveMap = s.emissiveMap ?? null;
    m.emissiveIntensity = glow ? 2.2 : 0.6;
  } else if (glow) {
    m.emissive = NIGHT_GLOW.clone();
  }
  lambert.set(key, m);
  return m;
}

/** A meshopt-compressed GLB scaled to a target height, centred on x/z and seated on y = 0. */
function ModelInner({ url, height, position, rotation, tint, night = false, glow, lift = 1.25 }: ModelProps) {
  const { scene } = useGLTF(url, false, true);
  const { object, scale, offset } = useMemo(() => {
    const obj = scene.clone(true);
    obj.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const next = mats.map((m) => {
        const name = m.name || 'mat';
        const emits = (m as THREE.MeshStandardMaterial).emissive?.getHex() > 0;
        const lit = night && (emits || !!glow?.some((g) => name.toLowerCase().includes(g)));
        return toLambert(m, `${url}|${name}|${m.uuid}|${lit}|${lift}`, tint?.[name] ?? tint?.['*'], lit, lift);
      });
      mesh.material = Array.isArray(mesh.material) ? next : next[0];
    });
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const k = size.y > 0 ? height / size.y : 1;
    return { object: obj, scale: k, offset: [-center.x * k, -box.min.y * k, -center.z * k] as V3 };
  }, [scene, url, height, tint, night, glow, lift]);

  return (
    <group position={position} rotation={rotation}>
      <primitive object={object} position={offset} scale={scale} />
    </group>
  );
}

/** Suspense-wrapped model so a slow download never blocks the rest of the island. */
export default function Model(props: ModelProps) {
  return (
    <Suspense fallback={null}>
      <ModelInner {...props} />
    </Suspense>
  );
}
