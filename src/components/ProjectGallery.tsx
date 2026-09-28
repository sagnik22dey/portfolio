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
      className="fixed inset-0 z-50 overflow-hidden bg-paper-100 paper-texture"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.22, ease: easeFast }}
    >
      <div className="absolute inset-0 bg-paper-fade pointer-events-none" />

      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 md:px-10 h-16 border-b border-ink/10 bg-paper-100/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="font-hand text-2xl md:text-3xl text-accent -rotate-1">The Gallery</span>
          <span className="hidden sm:inline-block text-[11px] font-mono tracking-widest text-ink-faint uppercase px-2 py-0.5 border border-ink/20">
            PLATE {String(index + 1).padStart(2, '0')} OF {String(total).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-block text-[11px] font-mono text-ink-faint">
            [ARROW KEYS TO BROWSE]
          </span>
          <button
            aria-label="Close gallery"
            onClick={onClose}
            className="w-9 h-9 rounded-none border-2 border-ink flex items-center justify-center hover:bg-ink hover:text-paper-50 transition shadow-sketch-sm"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="relative z-10 h-full flex items-center pt-16 pb-20 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto px-6 md:px-12 py-4">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.article
              key={p.title}
              className="grid md:grid-cols-12 gap-8 items-center"
              initial={{ opacity: 0, x: dir * 35 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.25, ease: easeFast } }}
              exit={{ opacity: 0, x: dir * -35, transition: { duration: 0.18 } }}
            >
              <div className="md:col-span-5">
                <div className="border-2 border-ink p-2 bg-paper-50 shadow-sketch">
                  <div className="border border-ink/30 p-1 bg-paper-100">
                    <div className="overflow-hidden aspect-[16/11] bg-paper-200 flex items-center justify-center">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={`${p.title} — ${p.tagline}`}
                          className="w-full h-full object-cover"
                          loading="eager"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-paper-200">
                          <span className="font-hand text-4xl text-accent">{p.title}</span>
                          <span className="mt-2 font-serif text-xs text-ink-faint italic">
                            {p.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between px-1 text-[10px] font-mono tracking-wider text-ink-faint uppercase">
                    <span>FIG. {String(index + 1).padStart(2, '0')} // SCHEMATIC STUDY</span>
                    <span>{p.period}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip !bg-ink !text-paper-50 !border-ink uppercase text-[11px]">
                    {p.category}
                  </span>
                  {p.team && <span className="chip !border-accent/60 !text-accent text-[11px]">Team Collaboration</span>}
                  <span className="text-xs text-ink-faint font-mono">{p.period}</span>
                </div>

                <h2 className="mt-3 font-serif text-4xl md:text-5xl font-semibold text-ink leading-tight">
                  {p.title}
                </h2>

                <p className="mt-1 text-accent italic text-base md:text-lg">{p.tagline}</p>

                <p className="mt-3 font-serif text-base md:text-lg text-ink-soft leading-relaxed max-w-xl">
                  {p.description}
                </p>

                {p.highlights && p.highlights.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-l-2 border-accent/40 pl-3">
                    {p.highlights.slice(0, 2).map((highlight, hi) => (
                      <p key={hi} className="font-serif text-sm text-ink-soft italic">
                        • {highlight}
                      </p>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tech.slice(0, 8).map((t) => (
                    <span key={t} className="chip text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>

                {(p.link || p.github) && (
                  <div className="mt-5 flex gap-3">
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="btn-primary !py-2 !px-5 text-sm">
                        Live Application <ArrowUpRight size={16} />
                      </a>
                    )}
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noreferrer" className="btn-ghost !py-2 !px-5 text-sm">
                        <FaGithub size={18} /> Repository
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
        className="absolute bottom-0 inset-x-0 z-20 flex items-center justify-between px-5 md:px-10 h-16 border-t border-ink/10 bg-paper-100/90 backdrop-blur-sm"
      >
        <button
          onClick={() => go(-1)}
          aria-label="Previous project"
          className="flex items-center gap-1 px-3 py-1.5 border border-ink text-xs font-serif bg-paper-50 shadow-sketch-sm hover:bg-ink hover:text-paper-50 transition"
        >
          <ChevronLeft size={16} />
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
              className={`h-2 transition-all border border-ink/50 ${
                i === index ? 'w-6 bg-accent' : 'w-2 bg-paper-200 hover:bg-ink/30'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => go(1)}
          aria-label="Next project"
          className="flex items-center gap-1 px-3 py-1.5 border border-ink text-xs font-serif bg-paper-50 shadow-sketch-sm hover:bg-ink hover:text-paper-50 transition"
        >
          <span className="hidden sm:inline">Next Folio</span>
          <ChevronRight size={16} />
        </button>
      </nav>
    </motion.div>
  );
}
