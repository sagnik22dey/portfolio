import { GraduationCap, MapPin } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import { education } from '../data/portfolio';

export default function Education() {
  const scope = useReveal<HTMLElement>('#education [data-reveal]');

  return (
    <section id="education" ref={scope} className="section relative">
      <div data-reveal className="mb-10">
        <span className="section-eyebrow">education</span>
        <h2 className="section-title">
          Academic <span className="accent-text">foundation</span>.
        </h2>
      </div>

      <div className="grid gap-5">
        {education.map((e) => (
          <div
            key={e.degree}
            data-reveal
            className="paper-card paper-card-hover p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5"
          >
            <div className="w-12 h-12 shrink-0 rounded-xl bg-ink flex items-center justify-center">
              <GraduationCap size={22} className="text-paper-50" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-2xl font-semibold text-ink">{e.degree}</h3>
              <div className="text-accent font-medium mt-0.5">{e.institution}</div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-ink-faint font-medium">
                <span>{e.affiliation}</span>
                <span>·</span>
                <span>{e.period}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} /> {e.location}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
