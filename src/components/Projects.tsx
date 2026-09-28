import { ArrowUpRight, Users } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useReveal } from '../hooks/useReveal';
import { projects, type Project } from '../data/portfolio';

const categoryOrder = [
  'Backend / Infra',
  'AI / ML',
  'AI / Computer Vision',
  'Full-Stack Web',
  'Full-Stack',
  'Frontend / UI',
] as const;

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
    <article data-reveal className="paper-card paper-card-hover overflow-hidden flex flex-col">
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

export default function Projects() {
  const scope = useReveal<HTMLElement>('#projects [data-reveal]');

  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const groups = categoryOrder
    .map((cat) => ({ cat, items: rest.filter((p) => p.category === cat) }))
    .filter((g) => g.items.length > 0);

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

      {groups.map((g) => (
        <div key={g.cat} className="mb-12">
          <h3 data-reveal className="font-hand text-3xl text-ink mb-5">
            {g.cat}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {g.items.map((p) => (
              <ProjectCard key={p.title} p={p} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
