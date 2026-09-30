import { FileText, Mail } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import { about, personal } from '../data/portfolio';

export default function About() {
  const scope = useReveal<HTMLElement>('#about [data-reveal]');

  return (
    <section id="about" ref={scope} className="section relative">
      <div data-reveal>
        <span className="section-eyebrow">about me</span>
        <h2 className="section-title">
          Engineer at the seam of <span className="accent-text">full-stack</span> and{' '}
          <span className="accent-text">AI</span>.
        </h2>
      </div>

      <div data-reveal className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {about.stats.map((s) => (
          <div
            key={s.label}
            className="paper-card paper-card-hover p-5 flex flex-col justify-between min-h-[110px]"
          >
            <div className="font-serif text-4xl font-semibold text-accent">{s.value}</div>
            <div className="text-xs text-ink-faint uppercase tracking-wider mt-2 font-medium">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid md:grid-cols-5 gap-8 items-start">
        <div
          data-reveal
          className="md:col-span-3 space-y-5 text-lg text-ink-soft leading-relaxed font-serif"
        >
          {about.bio.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <aside data-reveal className="md:col-span-2 paper-card p-6" aria-label="At a glance">
          <h3 className="font-hand text-3xl text-accent -rotate-1">at a glance</h3>
          <dl className="mt-4 divide-y-2 divide-dashed divide-ink/15">
            {[
              ['Role', personal.title],
              ['Based in', personal.location],
              ['Focus', 'Full-stack · AI/ML · Quality engineering'],
              ['Open to', personal.availability.replace(/^Open to /, '')],
            ].map(([k, v]) => (
              <div key={k} className="py-3 grid grid-cols-[88px_1fr] gap-3">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-ink-faint font-semibold pt-1">{k}</dt>
                <dd className="font-serif text-lg text-ink leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={personal.resumeUrl} target="_blank" rel="noreferrer" className="btn-primary !py-2 !px-5 text-sm">
              <FileText size={15} /> Résumé
            </a>
            <a href={`mailto:${personal.email}`} className="btn-ghost !py-2 !px-5 text-sm">
              <Mail size={15} /> Email me
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
