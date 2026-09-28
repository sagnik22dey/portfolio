import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import type { Mesh } from 'three';

/** Slowly rotating hand-drawn-style wireframe torus knot. */
function SketchKnot() {
  const mesh = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.15;
      mesh.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.1}>
      <mesh ref={mesh} scale={1.6}>
        <torusKnotGeometry args={[1, 0.32, 160, 24]} />
        <meshBasicMaterial color="#2b2620" wireframe transparent opacity={0.85} />
      </mesh>
      <mesh scale={1.62}>
        <torusKnotGeometry args={[1, 0.34, 60, 8]} />
        <meshBasicMaterial color="#c2410c" wireframe transparent opacity={0.25} />
      </mesh>
    </Float>
  );
}

/** Lightweight WebGL accent: a floating sketch-wireframe knot. */
export default function SketchScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <SketchKnot />
      </Suspense>
    </Canvas>
  );
}
