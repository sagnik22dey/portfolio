import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import World from './World';
import IslandPanel from './IslandPanel';
import { stops } from './data';
import { detectTier, lowerTier, settingsFor, type PerfTier } from './quality';
import type { FlightApi } from './useFlight';

type Props = { onExit: () => void; onFail: () => void };

/** Origami Archipelago: one canvas, camera flies between floating paper islands, DOM panels carry the content. */
export default function ArchipelagoExperience({ onExit, onFail }: Props) {
  const [tier, setTier] = useState<PerfTier>(() => detectTier());
  const [stop, setStop] = useState(0);
  const [project, setProject] = useState(0);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const api = useRef<FlightApi | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const settings = settingsFor(tier);

  const register = useCallback((a: FlightApi) => {
    api.current = a;
  }, []);
  const onProgress = useCallback((p: number) => {
    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
  }, []);
  const onStop = useCallback((i: number) => {
    setStop((s) => (s === i ? s : i));
    api.current?.goTo(i);
  }, []);
  const pickProject = useCallback((i: number) => {
    setProject(i);
    const idx = stops.findIndex((s) => s.id === 'projects');
    setStop(idx);
    api.current?.goTo(idx);
  }, []);
  const downgrade = useCallback(() => setTier((t) => lowerTier(t)), []);

  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const current = stops[stop];
  const isPortrait = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#faf1e1]">
      <Canvas
        className="!fixed inset-0"
        dpr={settings.dpr}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [-2, 16, 16], fov: 50, near: 0.1, far: 400 }}
        gl={{ antialias: settings.antialias, powerPreference: 'default', alpha: false, stencil: false, depth: true }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.NoToneMapping;
          scene.fog = new THREE.Fog('#f7e6cf', 30, 110);
          const el = gl.domElement;
          el.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            onFail();
          }, { once: true });
          requestAnimationFrame(() => setReady(true));
        }}
      >
        <color attach="background" args={['#faf1e1']} />
        <PerformanceMonitor onDecline={downgrade} onFallback={downgrade} flipflops={2} />
        <Suspense fallback={null}>
          <World
            settings={settings}
            enabled
            activeProject={current.id === 'projects' ? project : null}
            onStop={onStop}
            onPickProject={pickProject}
            register={register}
            onProgress={onProgress}
          />
        </Suspense>
      </Canvas>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <a href="#top" className="pointer-events-auto font-hand text-3xl leading-none text-ink">
          Sagnik<span className="text-accent">.</span>
        </a>
        <button onClick={onExit} className="pointer-events-auto btn-ghost !px-4 !py-2 text-xs sm:text-sm">
          Classic view
        </button>
      </header>

      <main className="pointer-events-none fixed inset-0 z-10 flex items-end px-3 pb-24 sm:items-center sm:px-10 sm:pb-0">
        <section
          key={current.id}
          aria-label={current.label}
          data-scrollable={isPortrait ? '' : undefined}
          className="isle-enter pointer-events-auto w-full sm:w-auto"
        >
          <IslandPanel
            stop={current.id}
            project={project}
            setProject={pickProject}
            onNext={() => api.current?.step(1)}
          />
        </section>
      </main>

      <nav aria-label="Islands" className="fixed inset-x-0 bottom-3 z-20 flex justify-center px-3">
        <div className="relative flex max-w-full items-center gap-1 overflow-x-auto rounded-full border-2 border-ink bg-paper-50 p-1 shadow-sketch">
          {stops.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onStop(i)}
              aria-current={i === stop ? 'true' : undefined}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm ${i === stop ? 'bg-ink text-paper-50' : 'text-ink-soft hover:text-accent'}`}
            >
              {s.label}
            </button>
          ))}
          <div className="pointer-events-none absolute inset-x-4 -bottom-[3px] h-[3px] overflow-hidden rounded-full">
            <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-accent" />
          </div>
        </div>
      </nav>

      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-30 grid place-items-center bg-paper-100 transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
      >
        <p className="font-hand text-3xl text-ink-soft">folding the islands…</p>
      </div>
    </div>
  );
}
