import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import Hoshi3D from './Hoshi3D';
import Mascot from './Mascot';

type Props = {
  open: boolean;
  searching: boolean;
  paused?: boolean;
  onOpen: () => void;
  onFailed?: () => void;
};

/** SVG fallback launcher when WebGL is unavailable or the strip's context dies. */
export function DockFallback({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label="Ask Hoshi, the portfolio assistant"
      aria-haspopup="dialog"
      className="hoshi-launcher group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-[60] flex items-center gap-2 rounded-full border-2 border-ink bg-paper-50 py-1 pl-1 pr-3 text-sm font-medium text-ink shadow-sketch transition hover:-translate-y-0.5 sm:right-5"
    >
      <Mascot className="h-10 w-10" />
      <span className="hidden sm:inline">Ask Hoshi</span>
      <span className="sm:hidden">Ask</span>
    </button>
  );
}

/** Bottom-strip 3D Hoshi: patrols right-to-left, opens the chat when clicked. */
export default function HoshiDock({ open, searching, paused = false, onOpen, onFailed }: Props) {
  const hotspotRef = useRef<HTMLButtonElement>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(true);
  const [narrow, setNarrow] = useState(() => (typeof window === 'undefined' ? false : window.innerWidth < 640));

  useEffect(() => {
    const onVis = () => setActive(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    const mq = window.matchMedia('(max-width: 639px)');
    const onMq = () => setNarrow(mq.matches);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      mq.removeEventListener('change', onMq);
    };
  }, []);

  const dimmed = paused || (open && narrow);
  const run = active && !dimmed && !failed;

  if (failed) return <DockFallback onOpen={onOpen} />;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-[15] h-[150px] transition-opacity duration-500 sm:h-[230px] ${dimmed ? 'opacity-0' : 'opacity-100'}`}
      aria-hidden={dimmed || undefined}
    >
      <div className="hoshi-dock absolute inset-0">
        <Canvas
          className="!absolute inset-0"
          dpr={[1, 1.5]}
          frameloop={run ? 'always' : 'never'}
          camera={{ position: [0, 0.95, 3.6], fov: 32 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power', stencil: false }}
          onCreated={({ gl, camera }) => {
            camera.lookAt(0, 0.88, 0);
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
          <hemisphereLight args={['#fff4e2', '#e0b896', 1.15]} />
          <directionalLight position={[3, 5, 4]} intensity={1.35} color="#fff0d6" />
          <Hoshi3D open={open} searching={searching} hotspotRef={hotspotRef} />
        </Canvas>
      </div>
      <button
        ref={hotspotRef}
        onClick={onOpen}
        aria-label="Ask Hoshi, the portfolio assistant"
        aria-haspopup="dialog"
        className={`group absolute bottom-1 left-0 h-[120px] w-[100px] cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:h-[190px] sm:w-[140px] ${dimmed ? 'pointer-events-none' : ''}`}
      >
        <span className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-paper-50 px-2.5 py-0.5 text-xs font-medium text-ink opacity-0 shadow-sketch-sm transition group-hover:opacity-100">
          Ask Hoshi ✦
        </span>
      </button>
    </div>
  );
}
