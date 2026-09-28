import { Suspense, useCallback, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import Scene from '../three/Scene';
import Preloader from './Preloader';
import CorridorHUD from './CorridorHUD';
import BayOverlay from './BayOverlay';
import type { Bay } from '../three/corridorData';
import { detectTier, settingsFor, lowerTier, type PerfTier } from '../three/performanceTier';

type Props = { onExit: () => void };

/** Full-screen 3D corridor experience with optimized rendering, preloader, HUD, and chamber overlays. */
export default function CorridorExperience({ onExit }: Props) {
  const [entered, setEntered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [openBay, setOpenBay] = useState<Bay | null>(null);
  const [tier, setTier] = useState<PerfTier>(() => detectTier());
  const jumpRef = useRef<((z: number) => void) | null>(null);

  const settings = settingsFor(tier);

  const registerJump = useCallback((fn: (z: number) => void) => {
    jumpRef.current = fn;
  }, []);

  const downgrade = useCallback(() => {
    setTier((t) => lowerTier(t));
  }, []);

  return (
    <div className="fixed inset-0 bg-[#231a13] noise">
      <Canvas
        camera={{ position: [0, 0.25, 6], fov: 62, near: 0.1, far: 120 }}
        dpr={settings.dpr}
        gl={{ antialias: settings.antialias, powerPreference: 'high-performance' }}
        onCreated={({ scene }) => {
          scene.fog = new THREE.Fog('#231a13', 9, 52);
        }}
      >
        <color attach="background" args={['#231a13']} />
        <PerformanceMonitor onDecline={downgrade} flipflops={3} onFallback={downgrade} />
        <Suspense fallback={null}>
          <Scene
            enabled={entered && !openBay}
            onProgress={setProgress}
            onOpen={setOpenBay}
            registerJump={registerJump}
            particleScale={settings.particleScale}
          />
        </Suspense>
        {settings.postFx && (
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.45}
              luminanceThreshold={0.7}
              luminanceSmoothing={0.3}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.25} darkness={0.65} />
          </EffectComposer>
        )}
      </Canvas>

      {entered && (
        <CorridorHUD
          progress={progress}
          onJump={(z) => jumpRef.current?.(z)}
          onOpen={setOpenBay}
          onExit={onExit}
        />
      )}

      <BayOverlay bay={openBay} onClose={() => setOpenBay(null)} />

      {!entered && <Preloader onEnter={() => setEntered(true)} />}
    </div>
  );
}
