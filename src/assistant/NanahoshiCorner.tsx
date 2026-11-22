import { useEffect, useRef, useState } from 'react';
import Mascot from './Mascot';

type Props = {
  open: boolean;
  searching: boolean;
  onOpen: () => void;
  onFailed?: () => void;
  placement?: 'classic' | 'islands';
};

/** SVG pill shown when the corner launcher renders as a minimalist button. */
export function CornerFallback({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label="Ask AI assistant"
      aria-haspopup="dialog"
      className="hoshi-launcher group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 z-[60] flex items-center gap-2 rounded-full border-2 border-ink bg-paper-50 py-1 pl-1 pr-3 text-sm font-medium text-ink shadow-sketch transition hover:-translate-y-0.5 sm:left-5"
    >
      <Mascot className="h-10 w-10" />
      <span className="hidden sm:inline">Ask Assistant</span>
      <span className="sm:hidden">Ask</span>
    </button>
  );
}

/** 2D Friday/EDITH-inspired AI assistant corner avatar with responsive HUD aura. */
export default function NanahoshiCorner({ open, searching, onOpen, placement = 'classic' }: Props) {
  const [hint, setHint] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setHint(false), 8000);
    return () => window.clearTimeout(t);
  }, []);

  const hidden = open;
  const base =
    placement === 'islands'
      ? 'top-[4.5rem] right-2 sm:top-auto sm:bottom-[max(3.75rem,calc(env(safe-area-inset-bottom)+3.25rem))] sm:right-3'
      : 'bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-1 sm:bottom-2 sm:left-3';
  const size = placement === 'islands' ? 'h-[100px] w-[82px] sm:h-[136px] sm:w-[110px]' : 'h-[108px] w-[88px] sm:h-[140px] sm:w-[114px]';

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
        aria-label="Ask AI assistant"
        aria-haspopup="dialog"
        className={`group relative flex flex-col items-center justify-between cursor-pointer rounded-2xl border-2 border-ink bg-paper-50/95 p-1.5 shadow-sketch transition-all duration-300 hover:-translate-y-1 hover:shadow-sketch-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${size}`}
      >
        <span
          className={`hoshi-hint pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-paper-50 px-2.5 py-0.5 text-[11px] font-medium text-ink shadow-sketch-sm transition-opacity duration-300 sm:text-xs ${
            hint ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {searching ? 'Processing...' : 'Ask Assistant'}
        </span>

        <div className="flex w-full items-center justify-between px-1 pt-0.5">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4] animate-pulse" />
            <span className="text-[9px] font-mono font-bold tracking-wider text-cyan-600 sm:text-[10px]">
              {searching ? 'AI BUSY' : 'AI LIVE'}
            </span>
          </span>
          <span className="text-[9px] font-mono text-ink-faint">F.R.I</span>
        </div>

        <div className="relative flex h-full w-full items-center justify-center overflow-hidden py-1">
          <Mascot className="h-full w-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105" talking={searching} />
        </div>

        <div className="w-full pb-0.5 text-center">
          <span className="text-[10px] font-medium text-ink-soft sm:text-[11px]">Click to chat</span>
        </div>

        <span className="hoshi-ring pointer-events-none absolute inset-x-2 bottom-0 h-px bg-cyan-500/20" aria-hidden="true" />
      </button>
    </div>
  );
}
