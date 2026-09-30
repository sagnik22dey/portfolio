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
  const [isPortrait, setIsPortrait] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const [collapsed, setCollapsed] = useState(false);
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

  useEffect(() => {
    const onResize = () => setIsPortrait(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const current = stops[stop];

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
          2D classic view
        </button>
      </header>

      <main className="pointer-events-none fixed inset-0 z-10 flex items-end px-3 pb-20 sm:items-center sm:px-10 sm:pb-0">
        <section
          key={current.id}
          aria-label={current.label}
          data-scrollable={isPortrait && !collapsed ? '' : undefined}
          className="isle-enter pointer-events-auto w-full sm:w-auto"
        >
          {isPortrait && (
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-expanded={!collapsed}
              className="mx-auto mb-2 flex items-center gap-2 rounded-full border-2 border-ink bg-paper-50 px-4 py-1.5 text-xs font-medium text-ink shadow-sketch"
            >
              {collapsed ? `Show ${current.label} details` : 'Hide panel · view the island'}
            </button>
          )}
          <div className={collapsed && isPortrait ? 'hidden' : ''}>
            <IslandPanel
              stop={current.id}
              project={project}
              setProject={pickProject}
              onNext={() => api.current?.step(1)}
            />
          </div>
        </section>
      </main>

      <nav aria-label="Islands" className="fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 flex justify-center px-2">
        <div className="relative overflow-hidden rounded-full border-2 border-ink bg-paper-50 shadow-sketch">
          <ul className="no-scrollbar flex max-w-[calc(100vw-1rem)] items-center gap-0.5 overflow-x-auto overflow-y-hidden p-1">
            {stops.map((s, i) => (
              <li key={s.id} className="shrink-0">
                <button
                  onClick={() => onStop(i)}
                  aria-current={i === stop ? 'true' : undefined}
                  className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm ${i === stop ? 'bg-ink text-paper-50' : 'text-ink-soft hover:text-accent'}`}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="pointer-events-none absolute inset-x-5 bottom-0 h-[3px] overflow-hidden rounded-full">
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
