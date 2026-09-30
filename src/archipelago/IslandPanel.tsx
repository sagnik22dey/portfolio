import { useState } from 'react';
import { ArrowLeft, ArrowRight, Copy, ExternalLink, Mail } from 'lucide-react';
import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { about, experiences, personal, projects, skills } from '../data/portfolio';
import { thumbFor, type StopId } from './data';

type PanelProps = {
  stop: StopId;
  project: number;
  setProject: (i: number) => void;
  onNext: () => void;
};

/** Stop 0: the title card shown while the camera overlooks the whole archipelago. */
function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="isle-card max-w-lg">
      <p className="section-eyebrow">Hi there, I'm</p>
      <h2 className="font-serif text-5xl sm:text-6xl font-semibold leading-[0.95] text-ink">{personal.name}</h2>
      <p className="mt-3 font-serif text-xl sm:text-2xl italic text-accent-clay">{personal.title}</p>
      <p className="mt-4 text-sm sm:text-base text-ink-soft leading-relaxed">{personal.subtitle}</p>
      <button onClick={onNext} className="btn-primary mt-6">
        Fly to the first island <ArrowRight size={18} />
      </button>
      <p className="mt-4 font-hand text-lg text-ink-faint">scroll, swipe or use the arrow keys</p>
    </div>
  );
}

/** About island panel: short bio and headline stats. */
function AboutPanel() {
  const [lead] = about.bio.split('\n\n');
  return (
    <div className="isle-card max-w-md">
      <p className="section-eyebrow">About</p>
      <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink">Quality-first engineer</h2>
      <p data-scrollable className="mt-3 max-h-[28vh] overflow-y-auto text-sm text-ink-soft leading-relaxed pr-1">
        {lead}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-2">
        {about.stats.map((s) => (
          <div key={s.label} className="rounded-lg border-2 border-ink/80 bg-paper-50 px-3 py-2">
            <dt className="text-[11px] uppercase tracking-wider text-ink-faint">{s.label}</dt>
            <dd className="font-serif text-2xl font-semibold text-accent">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Projects island panel: detail for the selected card, with prev / next controls. */
function ProjectsPanel({ project, setProject }: { project: number; setProject: (i: number) => void }) {
  const p = projects[project];
  const n = projects.length;
  const thumb = thumbFor(p.image);
  return (
    <article className="isle-card max-w-md">
      <div className="flex items-center justify-between gap-3">
        <p className="section-eyebrow !mb-0">Project {String(project + 1).padStart(2, '0')} / {n}</p>
        <div className="flex gap-2">
          <button aria-label="Previous project" onClick={() => setProject((project - 1 + n) % n)} className="isle-icon-btn">
            <ArrowLeft size={16} />
          </button>
          <button aria-label="Next project" onClick={() => setProject((project + 1) % n)} className="isle-icon-btn">
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      {thumb && (
        <img
          src={thumb}
          alt={`Sketch illustration for ${p.title}`}
          width={512}
          height={286}
          loading="lazy"
          decoding="async"
          className="mt-3 aspect-[16/9] w-full rounded-lg border-2 border-ink/80 object-cover"
        />
      )}
      <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-semibold text-ink">{p.title}</h2>
      <p className="text-sm italic text-accent-clay">{p.tagline}</p>
      <p data-scrollable className="mt-2 max-h-[18vh] overflow-y-auto text-sm text-ink-soft leading-relaxed pr-1">
        {p.description}
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {p.tech.slice(0, 6).map((t) => (
          <li key={t} className="chip">{t}</li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        {p.github && (
          <a href={p.github} target="_blank" rel="noreferrer" className="btn-ghost !px-4 !py-2 text-sm">
            <FaGithub size={16} /> Source for {p.title}
          </a>
        )}
        {p.link && (
          <a href={p.link} target="_blank" rel="noreferrer" className="btn-primary !px-4 !py-2 text-sm">
            <ExternalLink size={16} /> Live site
          </a>
        )}
      </div>
    </article>
  );
}

/** Studio island panel: skills grouped by category and the experience timeline. */
function StudioPanel() {
  const [tab, setTab] = useState<'skills' | 'experience'>('skills');
  return (
    <div className="isle-card max-w-md">
      <p className="section-eyebrow">Studio</p>
      <div role="tablist" className="flex gap-2">
        {(['skills', 'experience'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-full border-2 border-ink px-4 py-1.5 text-sm font-medium capitalize transition ${tab === t ? 'bg-ink text-paper-50' : 'bg-paper-50 text-ink'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div data-scrollable className="mt-3 max-h-[46vh] overflow-y-auto pr-1">
        {tab === 'skills' ? (
          <ul className="space-y-3">
            {skills.map((s) => (
              <li key={s.title}>
                <h3 className="font-serif text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 flex flex-wrap gap-1.5">
                  {s.skills.map((k) => (
                    <span key={k} className="chip">{k}</span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <ol className="space-y-4 border-l-2 border-ink/30 pl-4">
            {experiences.map((e) => (
              <li key={e.role + e.period}>
                <h3 className="font-serif text-lg font-semibold text-ink">{e.role}</h3>
                <p className="text-xs uppercase tracking-wider text-accent">{e.company} · {e.period}</p>
                <p className="mt-1 text-sm text-ink-soft leading-relaxed">{e.description}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/** Contact island panel: email with copy, socials and résumé. */
function ContactPanel() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(personal.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${personal.email}`;
    }
  };
  return (
    <div className="isle-card max-w-md">
      <p className="section-eyebrow">Contact</p>
      <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink">Let's build something</h2>
      <p className="mt-2 text-sm text-ink-soft">{personal.availability}.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={`mailto:${personal.email}`} className="btn-primary !px-4 !py-2 text-sm">
          <Mail size={16} /> Email Sagnik
        </a>
        <button onClick={copy} className="btn-ghost !px-4 !py-2 text-sm">
          <Copy size={16} /> {copied ? 'Copied!' : 'Copy address'}
        </button>
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
        <li><a className="inline-flex items-center gap-2 hover:text-accent" href={personal.linkedin} target="_blank" rel="noreferrer"><FaLinkedin /> LinkedIn profile</a></li>
        <li><a className="inline-flex items-center gap-2 hover:text-accent" href={personal.github} target="_blank" rel="noreferrer"><FaGithub /> GitHub profile</a></li>
        <li><a className="inline-flex items-center gap-2 hover:text-accent" href={personal.instagram} target="_blank" rel="noreferrer"><FaInstagram /> Instagram</a></li>
        <li><a className="inline-flex items-center gap-2 hover:text-accent" href={personal.resumeUrl} download>Download résumé (PDF)</a></li>
      </ul>
    </div>
  );
}

/** DOM overlay for the island the camera is currently parked at. */
export default function IslandPanel({ stop, project, setProject, onNext }: PanelProps) {
  switch (stop) {
    case 'welcome':
      return <Welcome onNext={onNext} />;
    case 'about':
      return <AboutPanel />;
    case 'projects':
      return <ProjectsPanel project={project} setProject={setProject} />;
    case 'studio':
      return <StudioPanel />;
    case 'contact':
      return <ContactPanel />;
  }
}
