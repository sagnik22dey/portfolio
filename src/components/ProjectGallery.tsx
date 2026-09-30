import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { projects } from '../data/portfolio';

type Props = { onClose: () => void };

const easeFast = [0.2, 0.9, 0.3, 1] as const;

/** Full-screen architectural exhibition gallery walkthrough with snappy transitions. */
export default function ProjectGallery({ onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const total = projects.length;

  const go = useCallback(
    (d: number) => {
      setDir(d);
      setIndex((i) => (i + d + total) % total);
    },
    [total]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1);
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  const p = projects[index];

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden bg-[#121316] hearth-radial text-stone-200"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.22, ease: easeFast }}
    >
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 md:px-10 h-14 hud-backdrop border-b border-amber-900/30">
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl md:text-2xl text-amber-400 tracking-wide">
            The Exhibition Gallery
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest text-amber-300/80 uppercase px-2.5 py-0.5 border border-amber-500/30 bg-[#18191e]">
            PLATE {String(index + 1).padStart(2, '0')} OF {String(total).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-block text-[10px] font-mono tracking-wider text-cave-dust">
            [ARROW KEYS TO BROWSE]
          </span>
          <button
            aria-label="Close gallery"
            onClick={onClose}
            className="w-8 h-8 border border-amber-900/50 bg-[#18191e]/80 flex items-center justify-center text-stone-400 hover:text-amber-200 hover:border-amber-400 hover:bg-[#25201b] transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="relative z-10 h-full flex items-center pt-14 pb-16 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto px-6 md:px-12 py-6">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.article
              key={p.title}
              className="grid md:grid-cols-12 gap-8 items-center"
              initial={{ opacity: 0, x: dir * 35 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.25, ease: easeFast } }}
              exit={{ opacity: 0, x: dir * -35, transition: { duration: 0.18 } }}
            >
              <div className="md:col-span-5">
                <div className="relative border-bronze-hairline bg-[#18191e] p-2.5 specimen-card-glow shadow-2xl">
                  <div className="absolute top-1 left-1 text-amber-400/50 font-mono text-[9px]">┌</div>
                  <div className="absolute top-1 right-1 text-amber-400/50 font-mono text-[9px]">┐</div>
                  <div className="absolute bottom-1 left-1 text-amber-400/50 font-mono text-[9px]">└</div>
                  <div className="absolute bottom-1 right-1 text-amber-400/50 font-mono text-[9px]">┘</div>

                  <div className="border border-amber-900/30 bg-[#0c0d0f] p-1">
                    <div className="overflow-hidden aspect-[16/11] bg-[#141518] flex items-center justify-center">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={`${p.title} — ${p.tagline}`}
                          className="w-full h-full object-cover filter brightness-95 hover:scale-105 transition-transform duration-500"
                          loading="eager"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#141518]">
                          <span className="font-serif text-3xl text-amber-400">{p.title}</span>
                          <span className="mt-2 font-mono text-xs text-stone-500 uppercase tracking-wider">
                            {p.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between px-1 text-[10px] font-mono tracking-wider text-amber-300/70 uppercase">
                    <span>FIG. {String(index + 1).padStart(2, '0')} // LITHO STUDY</span>
                    <span className="text-stone-400">{p.period}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="border border-amber-500/40 bg-amber-500/15 text-amber-300 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest">
                    {p.category}
                  </span>
                  {p.team && (
                    <span className="border border-stone-700/60 bg-[#1e2026] text-stone-300 text-[10px] font-mono px-2 py-0.5">
                      Team Collaboration
                    </span>
                  )}
                  <span className="text-xs text-stone-500 font-mono">{p.period}</span>
                </div>

                <h2 className="mt-3 font-serif text-3xl md:text-4xl lg:text-5xl font-normal text-cave-chalk leading-tight tracking-wide">
                  {p.title}
                </h2>

                <p className="mt-1 text-amber-400 italic text-base md:text-lg">{p.tagline}</p>

                <p className="mt-3 font-serif text-base md:text-lg text-stone-300 leading-relaxed max-w-xl">
                  {p.description}
                </p>

                {p.highlights && p.highlights.length > 0 && (
                  <div className="mt-3.5 space-y-1.5 border-l-2 border-amber-500/50 pl-3">
                    {p.highlights.slice(0, 2).map((highlight, hi) => (
                      <p key={hi} className="font-serif text-sm text-stone-400 italic">
                        • {highlight}
                      </p>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tech.slice(0, 8).map((t) => (
                    <span
                      key={t}
                      className="border border-amber-900/40 bg-[#18191e] text-amber-200/90 text-xs px-2.5 py-1 font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {(p.link || p.github) && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs uppercase tracking-widest font-semibold transition-all duration-150 shadow-[0_0_14px_rgba(245,158,11,0.3)] active:scale-95"
                      >
                        Live Application <ArrowUpRight size={15} />
                      </a>
                    )}
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 border border-amber-500/40 hover:border-amber-400 hover:text-amber-200 bg-[#1e2026]/90 text-stone-300 font-mono text-xs uppercase tracking-widest font-medium transition-all duration-150 active:scale-95"
                      >
                        <FaGithub size={16} /> Repository
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>

      <nav
        aria-label="Gallery pagination"
        className="absolute bottom-0 inset-x-0 z-20 flex items-center justify-between px-5 md:px-10 h-14 hud-backdrop border-t border-amber-900/30"
      >
        <button
          onClick={() => go(-1)}
          aria-label="Previous project"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-900/50 bg-[#18191e]/80 text-xs font-mono text-stone-300 hover:border-amber-500/50 hover:text-amber-200 hover:bg-[#25201b] transition-all"
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Previous Folio</span>
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[60vw] py-1">
          {projects.map((proj, i) => (
            <button
              key={proj.title}
              aria-label={`Go to ${proj.title}`}
              title={proj.title}
              onClick={() => {
                setDir(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`h-1.5 transition-all ${
                i === index
                  ? 'w-6 bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                  : 'w-2 bg-stone-700/60 hover:bg-amber-400/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => go(1)}
          aria-label="Next project"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-900/50 bg-[#18191e]/80 text-xs font-mono text-stone-300 hover:border-amber-500/50 hover:text-amber-200 hover:bg-[#25201b] transition-all"
        >
          <span className="hidden sm:inline">Next Folio</span>
          <ChevronRight size={15} />
        </button>
      </nav>
    </motion.div>
  );
}
