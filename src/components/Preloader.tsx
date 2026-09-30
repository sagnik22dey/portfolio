import { useEffect, useRef, useState } from 'react';
import { preloadAllThreeAssets } from '../three/textureManager';

type Props = { onEnter: () => void };

/** Leonardo codex asset preloader with real GPU texture preloading and live 3D stone cavern paper-tear reveal. */
export default function Preloader({ onEnter }: Props) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [currentLabel, setCurrentLabel] = useState('Gathering Renaissance Manuscripts into Memory...');
  const [allReady, setAllReady] = useState(false);
  const [tearing, setTearing] = useState(false);
  const [gone, setGone] = useState(false);

  const displayProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const pctTextRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hasHit100 = useRef(false);

  useEffect(() => {
    let mounted = true;

    preloadAllThreeAssets((pct, label) => {
      if (!mounted) return;
      targetProgressRef.current = pct;
      setCurrentLabel(`Inscribing: ${label}`);
      if (pct >= 100) {
        setAllReady(true);
      }
    }).catch(() => {
      if (mounted) {
        targetProgressRef.current = 100;
        setAllReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let animId: number;
    const tick = () => {
      const current = displayProgressRef.current;
      const target = targetProgressRef.current;
      if (current < target) {
        const step = Math.max(0.5, (target - current) * 0.14);
        const next = Math.min(target, current + step);
        displayProgressRef.current = next;

        const rounded = Math.round(next);
        if (pctTextRef.current) pctTextRef.current.textContent = String(rounded);
        if (barRef.current) barRef.current.style.width = `${next}%`;

        if (next >= 100 && !hasHit100.current) {
          hasHit100.current = true;
          setDisplayProgress(100);
        }
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    if (allReady && displayProgress >= 100 && !tearing) {
      setCurrentLabel('Codex illuminated. Tearing into the stone cavern...');
      const autoTimer = setTimeout(() => {
        setTearing(true);
      }, 350);
      return () => clearTimeout(autoTimer);
    }
  }, [allReady, displayProgress, tearing]);

  useEffect(() => {
    if (!tearing) return;
    const t = setTimeout(() => {
      setGone(true);
      onEnter();
    }, 980);
    return () => clearTimeout(t);
  }, [tearing, onEnter]);

  if (gone) return null;

  const leftClip =
    'polygon(0% 0%, 100% 0%, 98.2% 7%, 100% 14%, 97.5% 22%, 100% 30%, 98% 39%, 100% 47%, 97.2% 55%, 100% 64%, 98.1% 72%, 100% 80%, 97.5% 89%, 100% 96%, 98.2% 100%, 0% 100%)';
  const rightClip =
    'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 1.8% 96%, 0% 89%, 2.5% 80%, 0% 72%, 1.9% 64%, 0% 55%, 2.8% 47%, 0% 39%, 2% 30%, 0% 22%, 2.5% 14%, 0% 7%)';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto select-none bg-transparent">
      <div
        className="absolute inset-y-0 left-0 w-1/2 paper-texture border-r border-[#2b2620]/25 origin-left shadow-2xl"
        style={{
          clipPath: leftClip,
          ...(tearing ? { animation: 'tearLeft 1.05s cubic-bezier(.7,0,.25,1) forwards' } : {}),
        }}
      />

      <div
        className="absolute inset-y-0 right-0 w-1/2 paper-texture origin-right shadow-2xl"
        style={{
          clipPath: rightClip,
          ...(tearing ? { animation: 'tearRight 1.05s cubic-bezier(.7,0,.25,1) forwards' } : {}),
        }}
      />

      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6"
        style={tearing ? { animation: 'tearCard .45s ease-out forwards' } : undefined}
      >
        <div className="max-w-md w-full p-8 md:p-10 relative overflow-hidden shadow-2xl border-gold-glow hud-backdrop bg-[#161412]/95 text-stone-200">
          <div className="absolute top-2.5 left-2.5 text-amber-400/60 font-mono text-xs">┌</div>
          <div className="absolute top-2.5 right-2.5 text-amber-400/60 font-mono text-xs">┐</div>
          <div className="absolute bottom-2.5 left-2.5 text-amber-400/60 font-mono text-xs">└</div>
          <div className="absolute bottom-2.5 right-2.5 text-amber-400/60 font-mono text-xs">┘</div>

          <span className="font-hand text-2xl md:text-3xl text-amber-400 -rotate-2 inline-block">
            Illuminating the Cavern
          </span>

          <h1 className="font-serif text-4xl md:text-5xl font-medium text-cave-chalk mt-1 tracking-tight">
            Sagnik's Corridor
          </h1>

          <p className="mt-3 font-serif text-sm md:text-base text-stone-400 leading-relaxed">
            Preloading stone masonry strata, timber shoring bents &amp; subterranean acoustics.
          </p>

          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-baseline gap-1 font-serif">
              <span
                ref={pctTextRef}
                className="text-5xl md:text-6xl font-bold text-amber-300 tabular-nums tracking-tight"
              >
                {displayProgress}
              </span>
              <span className="text-2xl font-semibold text-amber-500">%</span>
            </div>

            <div className="w-full mt-4 h-2.5 bg-[#0f1012] border border-amber-900/50 p-0.5 overflow-hidden">
              <div
                ref={barRef}
                className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all duration-75 ease-out"
                style={{
                  width: `${displayProgress}%`,
                }}
              />
            </div>

            <div className="mt-3.5 flex items-center justify-center gap-2 text-xs md:text-sm font-mono text-stone-400 truncate max-w-full px-2">
              <span
                className="inline-block text-amber-400"
                style={{ animation: 'quillBob 1.2s ease-in-out infinite' }}
              >
                ✎
              </span>
              <span className="truncate">{currentLabel}</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-amber-900/30 flex flex-col items-center gap-2">
            {displayProgress >= 100 ? (
              <button
                onClick={() => setTearing(true)}
                className="w-full justify-center py-2.5 px-4 text-xs font-mono uppercase tracking-widest font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-[0_0_16px_rgba(245,158,11,0.35)] transition-all active:scale-95 animate-pulse"
              >
                Entering the Cavern...
              </button>
            ) : (
              <span className="text-xs font-serif italic text-stone-400">
                Please wait while subterranean assets are loaded...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
