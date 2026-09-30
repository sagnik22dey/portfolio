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
      <header className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 sm:px-8 h-12 pointer-events-none hud-backdrop border-b border-amber-900/30">
        <div className="flex items-center gap-3 pointer-events-auto">
          <span className="font-serif font-medium text-lg tracking-wide text-cave-chalk">
            Sagnik Dey
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {galleryBay && (
            <button
              onClick={() => onOpen(galleryBay)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-medium border border-amber-500/50 bg-[#25201b]/80 text-amber-200 hover:bg-amber-500 hover:text-cave-void transition-all duration-150 shadow-[0_0_12px_rgba(217,119,6,0.18)] active:scale-95"
              title="Open Project Exhibition Gallery"
            >
              <BookOpen size={13} />
              <span className="hidden sm:inline">Exhibition</span> Gallery
            </button>
          )}
          <button
            onClick={onExit}
            className="px-3 py-1.5 text-xs font-serif font-medium border border-stone-700/60 bg-[#18191e]/80 text-stone-300 hover:border-amber-500/50 hover:text-amber-200 hover:bg-[#25201b] transition-all duration-150 active:scale-95"
          >
            Classic View
          </button>
        </div>
      </header>

      <div className="fixed left-1/2 -translate-x-1/2 bottom-4 sm:bottom-6 z-30 flex flex-col items-center gap-2 pointer-events-none w-full max-w-2xl px-3">
        <nav
          aria-label="Corridor navigation instrument"
          className="pointer-events-auto flex items-center justify-center gap-1 sm:gap-2 p-1.5 sm:p-2 hud-backdrop border-gold-glow max-w-full shadow-hud"
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
                    ? 'border-amber-400/80 bg-gradient-to-b from-[#3a2818] to-[#251a10] text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-semibold'
                    : bay.kind === 'gallery'
                    ? 'border-amber-500/50 text-amber-300 bg-[#1e1c18]/90 hover:bg-amber-600 hover:text-cave-void'
                    : 'border-amber-900/30 text-stone-400 bg-[#161412]/70 hover:border-amber-600/50 hover:text-amber-200 hover:bg-[#231e18]'
                }`}
              >
                <span className="font-mono text-[10px] opacity-60">{roman}.</span>
                <span>{bay.title}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                )}
                {bay.kind === 'gallery' && !isActive && (
                  <Sparkles size={11} className="text-amber-400 group-hover:text-cave-void" />
                )}
              </button>
            );
          })}
        </nav>

        <p className="font-mono text-[10px] tracking-widest text-amber-200/50 uppercase text-center drop-shadow-sm">
          Scroll or W / S to traverse • Double-click door to enter
        </p>
      </div>
    </>
  );
}

export type { Bay };
