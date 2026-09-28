import { Briefcase, MapPin, Check } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import { experiences } from '../data/portfolio';

export default function Experience() {
  const scope = useReveal<HTMLElement>('#experience [data-reveal]');

  return (
    <section id="experience" ref={scope} className="section relative">
      <div data-reveal className="mb-12">
        <span className="section-eyebrow">experience</span>
        <h2 className="section-title">
          Where I've <span className="accent-text">engineered</span>.
        </h2>
      </div>

      <div className="relative">
        <div className="absolute left-4 md:left-6 top-2 bottom-2 w-0.5 bg-ink/25" />

        <div className="space-y-10">
          {experiences.map((exp) => (
            <div key={exp.role} data-reveal className="relative pl-14 md:pl-20">
              <div className="absolute left-0 md:left-2 top-1 w-9 h-9 rounded-full bg-ink flex items-center justify-center border-2 border-ink">
                <Briefcase size={16} className="text-paper-50" />
              </div>

              <div className="paper-card p-6 md:p-8">
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-ink">
                  {exp.role}
                </h3>
                <div className="mt-1 text-accent font-medium">{exp.company}</div>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-ink-faint font-medium">
                  <span>{exp.period}</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} /> {exp.location}
                  </span>
                </div>

                <p className="mt-4 text-ink-soft leading-relaxed font-serif text-lg">
                  {exp.description}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {exp.achievements.map((a) => (
                    <li key={a} className="flex gap-3 text-ink-soft text-sm leading-relaxed">
                      <Check size={18} className="shrink-0 mt-0.5 text-accent" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-2">
                  {exp.tech.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
