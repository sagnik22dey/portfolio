import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import NanahoshiIdle from './NanahoshiIdle';
import Mascot from './Mascot';

type Props = {
  open: boolean;
  searching: boolean;
  onOpen: () => void;
  onFailed?: () => void;
  placement?: 'classic' | 'islands';
};

/** SVG pill shown when WebGL is unavailable or the corner canvas loses its context. */
export function CornerFallback({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label="Ask Nanahoshi, the portfolio assistant"
      aria-haspopup="dialog"
      className="hoshi-launcher group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 z-[60] flex items-center gap-2 rounded-full border-2 border-ink bg-paper-50 py-1 pl-1 pr-3 text-sm font-medium text-ink shadow-sketch transition hover:-translate-y-0.5 sm:left-5"
    >
      <Mascot className="h-10 w-10" />
      <span className="hidden sm:inline">Ask Nanahoshi</span>
      <span className="sm:hidden">Ask</span>
    </button>
  );
}

/** Corner 3D Nanahoshi: idle, cursor-aware, opens the chat on click. Never covers page controls. */
export default function NanahoshiCorner({ open, searching, onOpen, onFailed, placement = 'classic' }: Props) {
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(true);
  const [hint, setHint] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onVis = () => setActive(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    const t = window.setTimeout(() => setHint(false), 9000);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.clearTimeout(t);
    };
  }, []);

  if (failed) return <CornerFallback onOpen={onOpen} />;

  const hidden = open;
  const base =
    placement === 'islands'
      ? 'top-[4.5rem] right-2 sm:top-auto sm:bottom-[max(3.75rem,calc(env(safe-area-inset-bottom)+3.25rem))] sm:right-3'
      : 'bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-1 sm:bottom-2 sm:left-3';
  const size = placement === 'islands' ? 'h-[108px] w-[86px] sm:h-[188px] sm:w-[150px]' : 'h-[132px] w-[104px] sm:h-[188px] sm:w-[150px]';

  return (
    <div
      ref={wrapRef}
      className={`fixed z-[55] transition-all duration-500 ${base} ${
        hidden ? 'pointer-events-none translate-y-2 opacity-0' : 'opacity-100'
      }`}
      aria-hidden={hidden || undefined}
    >
      <button
        onClick={onOpen}
        aria-label="Ask Nanahoshi, the portfolio assistant"
        aria-haspopup="dialog"
        className={`group relative block cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${size}`}
      >
        <span
          className={`hoshi-hint pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-paper-50 px-2.5 py-0.5 text-[11px] font-medium text-ink shadow-sketch-sm transition-opacity duration-300 sm:text-xs ${
            hint ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {searching ? 'Looking that up…' : 'Need a hand?'}
        </span>

        <span className="absolute inset-0 overflow-hidden rounded-2xl">
          <Canvas
            className="!absolute inset-0"
            style={{ pointerEvents: 'none' }}
            dpr={[1, 1.75]}
            frameloop={active ? 'always' : 'never'}
            camera={{ position: [0, 0.75, 4.6], fov: 30 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'low-power', stencil: false }}
            onCreated={({ gl, camera }) => {
              camera.lookAt(0, 0.75, 0);
              gl.domElement.addEventListener(
                'webglcontextlost',
                (e) => {
                  e.preventDefault();
                  setFailed(true);
                  onFailed?.();
                },
                { once: true },
              );
            }}
          >
            <hemisphereLight args={['#fff6ea', '#e8c9a6', 1.5]} />
            <directionalLight position={[2.4, 3.4, 3.2]} intensity={1.5} color="#fff1da" />
            <directionalLight position={[-2.6, 1.2, 1.4]} intensity={0.45} color="#cfe0ff" />
            <NanahoshiIdle open={open} searching={searching} />
          </Canvas>
        </span>

        <span className="hoshi-ring pointer-events-none absolute inset-x-3 bottom-0 h-px bg-ink/15" aria-hidden="true" />
      </button>
    </div>
  );
}
