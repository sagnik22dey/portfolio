import { Suspense, useCallback, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { PerformanceMonitor } from '@react-three/drei';
import { AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import Scene from '../three/Scene';
import Preloader from './Preloader';
import CorridorHUD from './CorridorHUD';
import RoomExperience, { type RoomId } from './RoomExperience';
import type { Bay } from '../three/corridorData';
import { detectTier, settingsFor, lowerTier, type PerfTier } from '../three/performanceTier';

type Props = { onExit: () => void };

/** Full-screen 3D corridor experience with physical doorway walkthrough transitions and subterranean chambers. */
export default function CorridorExperience({ onExit }: Props) {
  const [entered, setEntered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [room, setRoom] = useState<RoomId | null>(null);
  const [tier, setTier] = useState<PerfTier>(() => detectTier());
  const [openingBayId, setOpeningBayId] = useState<string | null>(null);
  const [activeBay, setActiveBay] = useState<Bay | null>(null);
  const [phase, setPhase] = useState<'idle' | 'entering' | 'exiting'>('idle');
  const jumpRef = useRef<((z: number) => void) | null>(null);

  const settings = settingsFor(tier);

  const registerJump = useCallback((fn: (z: number) => void) => {
    jumpRef.current = fn;
  }, []);

  const downgrade = useCallback(() => {
    setTier((t) => lowerTier(t));
  }, []);

  const openBay = useCallback((bay: Bay) => {
    if (phase !== 'idle') return;
    setActiveBay(bay);
    setOpeningBayId(bay.id);
    setPhase('entering');
  }, [phase]);

  const handleEntered = useCallback(() => {
    if (activeBay) {
      setRoom(activeBay.roomId);
    }
  }, [activeBay]);

  const exitRoom = useCallback(() => {
    setRoom(null);
    setPhase('exiting');
  }, []);

  const handleExited = useCallback(() => {
    setPhase('idle');
    setOpeningBayId(null);
    setActiveBay(null);
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
            enabled={entered && !room && phase === 'idle'}
            onProgress={setProgress}
            onOpen={openBay}
            registerJump={registerJump}
            particleScale={settings.particleScale}
            openingBayId={openingBayId}
            activeBay={activeBay}
            phase={phase}
            onEntered={handleEntered}
            onExited={handleExited}
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

      {entered && !room && phase === 'idle' && (
        <CorridorHUD
          progress={progress}
          onJump={(z) => jumpRef.current?.(z)}
          onOpen={openBay}
          onExit={onExit}
        />
      )}

      <AnimatePresence>
        {room && <RoomExperience key={room} room={room} tier={tier} onBack={exitRoom} />}
      </AnimatePresence>

      {!entered && <Preloader onEnter={() => setEntered(true)} />}
    </div>
  );
}
