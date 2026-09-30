import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { galleryItems } from '../three/rooms/roomData';

const pad = (n: number) => String(n).padStart(2, '0');
const EASE = [0.22, 1, 0.36, 1] as const;
const ring = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper-100';
const roundBtn = `grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/70 text-ink transition duration-200 hover:bg-ink hover:text-paper-50 active:scale-95 ${ring}`;

type NavProps = {
  active: number;
  hidden: boolean;
  onGo: (index: number) => void;
  onOpen: (index: number) => void;
};

/** Museum wall-label navigator: exhibit numeral, title, tick ruler and prev/next. */
export function GalleryNav({ active, hidden, onGo, onOpen }: NavProps) {
  const item = galleryItems[active];
  if (!item) return null;
  const total = galleryItems.length;
  return (
    <AnimatePresence>
      {!hidden && (
        <motion.nav
          aria-label="Project navigator"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-4 sm:pb-8"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.5, ease: EASE } }}
          exit={{ opacity: 0, y: 28, transition: { duration: 0.2 } }}
        >
          <div className="paper-texture pointer-events-auto relative flex w-full max-w-3xl items-stretch overflow-hidden rounded-md border border-ink/80 shadow-[0_24px_48px_-22px_rgba(74,52,30,0.6)]">
            <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] transition-colors duration-500" style={{ background: item.accent }} />

            <button
              type="button"
              onClick={() => onOpen(active)}
              aria-label={`Open exhibit ${pad(active + 1)}`}
              className="hidden w-28 shrink-0 flex-col items-center justify-center border-r border-ink/15 px-3 py-2 transition-colors hover:bg-paper-200/70 focus-visible:bg-paper-200 focus-visible:outline-none sm:flex"
            >
              <span className="font-hand text-lg leading-none text-ink-faint">exhibit</span>
              <span className="relative h-12 w-full overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.span
                    key={active}
                    className="absolute inset-0 text-center font-serif text-5xl font-semibold italic leading-[48px] tabular-nums"
                    style={{ color: item.accent }}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { duration: 0.4, ease: EASE } }}
                    exit={{ y: -30, opacity: 0, transition: { duration: 0.25 } }}
                  >
                    {pad(active + 1)}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="font-sans text-[10px] font-semibold tracking-[0.22em] text-ink-faint tabular-nums">OF {pad(total)}</span>
            </button>

            <div className="min-w-0 flex-1 px-4 py-3 sm:px-5">
              <p className="flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-faint">
                <span className="tabular-nums sm:hidden" style={{ color: item.accent }}>
                  {pad(active + 1)}/{pad(total)}
                </span>
                <span className="truncate">{item.category}</span>
                <span aria-hidden className="h-px w-5 shrink-0 bg-ink/25" />
                <span className="shrink-0 tabular-nums">{item.period}</span>
                {item.featured && <span className="shrink-0 font-hand text-base normal-case tracking-normal text-accent">flagship</span>}
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.button
                  key={active}
                  type="button"
                  onClick={() => onOpen(active)}
                  className="mt-0.5 block max-w-full truncate text-left font-serif text-2xl font-semibold leading-tight tracking-tight text-ink transition-colors hover:text-accent focus-visible:underline focus-visible:outline-none sm:text-[28px]"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.32, ease: EASE } }}
                  exit={{ opacity: 0, x: -14, transition: { duration: 0.15 } }}
                >
                  {item.title}
                </motion.button>
              </AnimatePresence>

              <div className="mt-1.5 hidden h-5 items-end md:flex" role="tablist" aria-label="Jump to project">
                {galleryItems.map((g, i) => {
                  const on = i === active;
                  return (
                    <button
                      key={g.title}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      aria-label={`Go to ${g.title}`}
                      title={g.title}
                      onClick={() => onGo(i)}
                      className="group flex h-full w-3.5 items-end justify-center focus-visible:outline-none"
                    >
                      <span
                        className={`block w-[2px] rounded-full transition-all duration-300 group-hover:h-4 group-hover:bg-ink group-focus-visible:bg-accent ${
                          on ? 'h-5 !bg-accent' : i % 5 === 0 ? 'h-3 bg-ink/50' : 'h-2 bg-ink/30'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 border-l border-ink/15 px-3 sm:px-4">
              <button type="button" aria-label="Previous project" onClick={() => onGo(active - 1)} className={roundBtn}>
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                data-gallery-open
                onClick={() => onOpen(active)}
                className={`hidden h-10 items-center gap-1.5 rounded-full bg-ink px-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-paper-50 transition duration-200 hover:bg-accent active:scale-95 sm:inline-flex ${ring}`}
              >
                View work <ArrowUpRight size={14} />
              </button>
              <button type="button" aria-label="Next project" onClick={() => onGo(active + 1)} className={roundBtn}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

type DossierProps = {
  index: number | null;
  onClose: () => void;
  onStep: (index: number) => void;
};

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.35 + i * 0.07, duration: 0.45, ease: EASE } }),
};

/** Catalogue-entry dossier that slides in beside the flipped card. */
export function GalleryDossier({ index, onClose, onStep }: DossierProps) {
  const p = index !== null ? galleryItems[index] : null;
  const total = galleryItems.length;
  const next = index !== null ? galleryItems[(index + 1) % total] : null;
  return (
    <AnimatePresence>
      {p && index !== null && (
        <motion.aside
          key={`proj-${index}`}
          aria-label={`${p.title} details`}
          className="absolute bottom-0 right-0 top-0 z-20 flex w-full items-end p-3 sm:w-[480px] sm:items-center sm:p-6"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.5, ease: EASE } }}
          exit={{ opacity: 0, x: 60, transition: { duration: 0.22 } }}
        >
          <article className="paper-texture relative flex max-h-[62vh] w-full flex-col overflow-hidden rounded-md border border-ink/80 text-ink shadow-[0_30px_60px_-24px_rgba(74,52,30,0.65)] sm:max-h-[88vh]">
            <header className="relative h-36 shrink-0 overflow-hidden border-b border-ink/70 sm:h-44" style={{ background: p.accent }}>
              {p.image && (
                <img
                  src={p.image}
                  alt={`Sketch of ${p.title}`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-90 mix-blend-multiply [filter:sepia(0.35)_contrast(1.05)]"
                />
              )}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" />
              <p className="absolute left-5 top-4 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-paper-50/90 sm:left-7">
                Catalogue · {pad(index + 1)} of {pad(total)}
              </p>
              <button
                type="button"
                aria-label="Close project details"
                onClick={onClose}
                className="absolute right-4 top-3 grid h-9 w-9 place-items-center rounded-full border border-paper-50/60 bg-ink/40 text-paper-50 backdrop-blur-sm transition hover:bg-paper-50 hover:text-ink active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper-50"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between gap-3 sm:left-7 sm:right-7">
                <h3 className="font-serif text-[34px] font-semibold leading-[0.95] tracking-tight text-paper-50 [text-wrap:balance] sm:text-[40px]">
                  {p.title}
                </h3>
                <span aria-hidden className="font-serif text-6xl font-semibold italic leading-[0.8] text-paper-50/35 tabular-nums">
                  {pad(index + 1)}
                </span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-5 sm:px-7">
              <motion.p custom={0} variants={rise} initial="hidden" animate="show" className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-faint">
                <span style={{ color: p.accent }}>{p.category}</span>
                <span aria-hidden className="h-px w-5 bg-ink/25" />
                <span className="tabular-nums">{p.period}</span>
                {p.featured && <span className="-rotate-2 font-hand text-lg normal-case tracking-normal text-accent">flagship piece</span>}
              </motion.p>

              <motion.p custom={1} variants={rise} initial="hidden" animate="show" className="mt-2 font-serif text-xl italic leading-snug text-ink-soft [text-wrap:pretty]">
                {p.tagline}
              </motion.p>

              <motion.p
                custom={2}
                variants={rise}
                initial="hidden"
                animate="show"
                className="mt-4 max-w-[62ch] font-serif text-[17px] leading-[1.65] text-ink-soft [text-wrap:pretty] first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-serif first-letter:text-[52px] first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-ink"
              >
                {p.description}
              </motion.p>

              {p.highlights.length > 0 && (
                <motion.section custom={3} variants={rise} initial="hidden" animate="show" className="mt-6">
                  <h4 className="flex items-center gap-3 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-faint">
                    Notable work <span aria-hidden className="h-px flex-1 bg-ink/15" />
                  </h4>
                  <ol className="mt-3 space-y-3">
                    {p.highlights.map((h, i) => (
                      <li key={h} className="grid grid-cols-[28px_1fr] gap-2 text-sm leading-relaxed text-ink-soft">
                        <span className="pt-px font-serif text-base font-semibold italic tabular-nums" style={{ color: p.accent }}>
                          {pad(i + 1)}
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ol>
                </motion.section>
              )}

              <motion.section custom={4} variants={rise} initial="hidden" animate="show" className="mt-6">
                <h4 className="flex items-center gap-3 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-faint">
                  Medium <span aria-hidden className="h-px flex-1 bg-ink/15" />
                </h4>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <li key={t} className="rounded-[4px] border border-ink/25 bg-paper-50/70 px-2 py-1 font-sans text-[11px] font-medium text-ink-soft">
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.section>
            </div>

            <footer className="flex shrink-0 items-center gap-3 border-t border-ink/15 bg-paper-200/60 px-5 py-3.5 sm:px-7">
              {p.live && (
                <a href={p.live} target="_blank" rel="noreferrer" className={`inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-paper-50 transition hover:bg-accent active:scale-95 ${ring}`}>
                  Visit live <ArrowUpRight size={14} />
                </a>
              )}
              {p.github && (
                <a
                  href={p.github}
                  target="_blank"
                  rel="noreferrer"
                  className={
                    p.live
                      ? `inline-flex items-center gap-1.5 rounded font-sans text-xs font-semibold uppercase tracking-[0.12em] text-ink underline-offset-4 transition hover:text-accent hover:underline ${ring}`
                      : `inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-paper-50 transition hover:bg-accent active:scale-95 ${ring}`
                  }
                >
                  <FaGithub size={14} /> Source
                </a>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button type="button" aria-label="Previous project" onClick={() => onStep(index - 1)} className={roundBtn}>
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  aria-label={next ? `Next project: ${next.title}` : 'Next project'}
                  onClick={() => onStep(index + 1)}
                  className={`group flex h-10 items-center gap-2 rounded-full border border-ink/70 pl-3 pr-1.5 text-ink transition hover:bg-ink hover:text-paper-50 active:scale-95 ${ring}`}
                >
                  <span className="hidden max-w-[110px] truncate font-serif text-sm italic sm:inline">{next?.title}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </footer>
          </article>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
