import { useMemo } from 'react';
import { Sparkles, BookOpen } from 'lucide-react';
import { bays, bayZ, type Bay } from '../three/corridorData';

type Props = {
  progress: number;
  onJump: (z: number) => void;
  onOpen: (bay: Bay) => void;
  onExit: () => void;
};

const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/** Minimal floating parchment HUD for endless corridor exploration. */
export default function CorridorHUD({ progress, onJump, onOpen, onExit }: Props) {
  const activeBayIndex = useMemo(() => {
    const totalBays = bays.length;
    const est = Math.floor(progress * totalBays);
    return Math.max(0, Math.min(totalBays - 1, est));
  }, [progress]);

  const galleryBay = useMemo(() => bays.find((b) => b.kind === 'gallery'), []);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 sm:px-8 h-16 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <span className="font-serif font-semibold text-xl tracking-tight text-ink">
            Sagnik Dey
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono tracking-widest uppercase px-2 py-0.5 border border-ink/30 bg-paper-100/90 text-ink-soft">
            ATELIER // 3D CORRIDOR
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {galleryBay && (
            <button
              onClick={() => onOpen(galleryBay)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-medium border border-ink bg-paper-100 text-ink shadow-sketch-sm hover:bg-ink hover:text-paper-50 transition"
              title="Open Project Exhibition Gallery"
            >
              <BookOpen size={14} />
              <span className="hidden sm:inline">Exhibition</span> Gallery
            </button>
          )}
          <button
            onClick={onExit}
            className="px-3 py-1.5 text-xs font-serif font-medium border border-ink/40 bg-paper-50/80 text-ink hover:border-ink hover:bg-paper-100 transition shadow-sketch-sm"
          >
            Classic View
          </button>
        </div>
      </header>

      <div className="fixed left-1/2 -translate-x-1/2 bottom-4 sm:bottom-6 z-30 flex flex-col items-center gap-2 pointer-events-none w-full max-w-2xl px-3">
        <nav
          aria-label="Corridor navigation instrument"
          className="pointer-events-auto flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-2.5 bg-paper-100/95 border-2 border-ink shadow-sketch max-w-full backdrop-blur-sm"
        >
          {bays.map((bay, i) => {
            const isActive = activeBayIndex === i;
            const roman = romanNumerals[i] ?? `${i + 1}`;
            return (
              <button
                key={bay.id}
                onClick={() => onJump(bayZ(i) + 2)}
                onDoubleClick={() => onOpen(bay)}
                title={`Navigate to ${bay.title} — double click to enter`}
                className={`group relative flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-serif transition border ${
                  isActive
                    ? 'border-ink bg-ink text-paper-50 shadow-sketch-sm font-semibold'
                    : bay.kind === 'gallery'
                    ? 'border-accent text-accent font-semibold bg-paper-50 hover:bg-accent hover:text-paper-50'
                    : 'border-ink/20 text-ink-soft bg-paper-50/90 hover:border-ink hover:text-ink'
                }`}
              >
                <span className="font-mono text-[10px] opacity-60">{roman}.</span>
                <span>{bay.title}</span>
                {bay.kind === 'gallery' && <Sparkles size={11} className="text-accent group-hover:text-paper-50" />}
              </button>
            );
          })}
        </nav>

        <p className="font-mono text-[10px] tracking-widest text-ink-faint uppercase text-center">
          Scroll or W / S to traverse • Double-click door to enter
        </p>
      </div>
    </>
  );
}

export type { Bay };
