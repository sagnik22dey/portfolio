import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play, Users } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useReveal } from '../hooks/useReveal';
import { projects, type Project } from '../data/portfolio';

/** Live App / GitHub buttons for a project when present. */
function ProjectLinks({ p }: { p: Project }) {
  if (!p.link && !p.github) return null;
  return (
    <div className="flex items-center gap-3">
      {p.link && (
        <a href={p.link} target="_blank" rel="noreferrer" className="btn-primary !py-2 !px-5 text-sm">
          Live App <ArrowUpRight size={16} />
        </a>
      )}
      {p.github && (
        <a href={p.github} target="_blank" rel="noreferrer" className="btn-ghost !py-2 !px-5 text-sm">
          <FaGithub size={18} /> GitHub
        </a>
      )}
    </div>
  );
}

/** Category chip, optional team tag, and period line for a project. */
function MetaRow({ p }: { p: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="chip !bg-ink !text-paper-50 !border-ink uppercase tracking-wide">
        {p.category}
      </span>
      {p.team && (
        <span className="chip !border-accent/60 !text-accent">
          <Users size={12} /> Team
        </span>
      )}
      <span className="text-xs text-ink-faint font-medium">{p.period}</span>
    </div>
  );
}

/** Large, wide card used for the flagship featured projects. */
function FeaturedCard({ p }: { p: Project }) {
  return (
    <article data-reveal className="paper-card paper-card-hover p-7 md:p-9 flex flex-col">
      <MetaRow p={p} />
      <h3 className="mt-4 font-serif text-4xl font-semibold text-ink">{p.title}</h3>
      <p className="mt-1 text-base text-accent font-medium italic">{p.tagline}</p>
      <p className="mt-4 text-ink-soft leading-relaxed font-serif text-lg max-w-3xl">
        {p.description}
      </p>
      <ul className="mt-5 grid md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
        {p.highlights.map((h) => (
          <li key={h} className="flex gap-3 text-ink-soft text-sm leading-relaxed">
            <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
            <span>{h}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-5 border-t-2 border-ink/15">
        <div className="flex flex-wrap gap-2">
          {p.tech.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
        <ProjectLinks p={p} />
      </div>
    </article>
  );
}

/** Standard grid card for non-featured projects. */
function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="paper-card paper-card-hover overflow-hidden flex flex-col w-full">
      {p.image && (
        <div className="aspect-[16/10] overflow-hidden border-b-2 border-ink bg-paper-200">
          <img
            src={p.image}
            alt={`Screenshot of the ${p.title} project — ${p.tagline}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6 md:p-7 flex flex-col flex-grow">
        <MetaRow p={p} />
        <h3 className="mt-4 font-serif text-3xl font-semibold text-ink">{p.title}</h3>
        <p className="mt-1 text-sm text-accent font-medium italic">{p.tagline}</p>
        <p className="mt-4 text-ink-soft leading-relaxed font-serif text-lg">{p.description}</p>
        <ul className="mt-5 space-y-2 mb-6 flex-grow">
          {p.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-ink-soft text-sm leading-relaxed">
              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-4 pt-5 border-t-2 border-ink/15">
          <div className="flex flex-wrap gap-2">
            {p.tech.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
          <ProjectLinks p={p} />
        </div>
      </div>
    </article>
  );
}

/** Auto-advancing, snap-scrolling carousel for the non-flagship projects, with manual controls. */
function ProjectCarousel({ items }: { items: Project[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const n = (i + items.length) % items.length;
      const card = el.children[n] as HTMLElement | undefined;
      if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
    },
    [items.length]
  );

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const kids = Array.from(el.children) as HTMLElement[];
      let best = 0;
      let bestDist = Infinity;
      kids.forEach((k, i) => {
        const d = Math.abs(k.offsetLeft - el.offsetLeft - el.scrollLeft);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      const el = track.current;
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      goTo(atEnd ? 0 : active + 1);
    }, 4500);
    return () => window.clearInterval(id);
  }, [paused, active, goTo]);

  return (
    <div
      data-reveal
      role="region"
      aria-roledescription="carousel"
      aria-label="More projects"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div className="flex items-end justify-between gap-4 mb-5">
        <h3 className="font-hand text-3xl text-ink">More builds</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-[0.2em] text-ink-faint tabular-nums mr-1">
            {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            aria-label={paused ? 'Resume auto-play' : 'Pause auto-play'}
            onClick={() => setPaused((p) => !p)}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-paper-50 shadow-sketch-sm transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => goTo(active - 1)}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-paper-50 shadow-sketch-sm transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => goTo(active + 1)}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-ink text-paper-50 shadow-sketch-sm transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={track}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((p, i) => (
          <div
            key={p.title}
            className="snap-start shrink-0 basis-[88%] sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)] flex"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}: ${p.title}`}
          >
            <ProjectCard p={p} />
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Choose project">
        {items.map((p, i) => (
          <button
            key={p.title}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Show ${p.title}`}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'w-7 bg-accent' : 'w-2 bg-ink/25 hover:bg-ink/50'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Projects() {
  const scope = useReveal<HTMLElement>('#projects [data-reveal]');

  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section id="projects" ref={scope} className="section relative">
      <div data-reveal className="mb-12">
        <span className="section-eyebrow">selected work</span>
        <h2 className="section-title">
          Things I've <span className="accent-text">built</span>.
        </h2>
        <p className="mt-4 text-lg text-ink-soft max-w-2xl font-serif">
          Full-stack apps, AI pipelines, and backend infrastructure — ordered by scope, from flagship
          systems to focused builds.
        </p>
      </div>

      {featured.length > 0 && (
        <div className="mb-14">
          <h3 data-reveal className="font-hand text-3xl text-accent mb-5">
            ★ Flagship projects
          </h3>
          <div className="grid gap-6">
            {featured.map((p) => (
              <FeaturedCard key={p.title} p={p} />
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && <ProjectCarousel items={rest} />}
    </section>
  );
}
