import { useReveal } from '../hooks/useReveal';
import { skills } from '../data/portfolio';

export default function Skills() {
  const scope = useReveal<HTMLElement>('#skills [data-reveal]');

  return (
    <section id="skills" ref={scope} className="section relative">
      <div data-reveal className="mb-12">
        <span className="section-eyebrow">tech stack</span>
        <h2 className="section-title">
          Tools I use to <span className="accent-text">build &amp; ship</span>.
        </h2>
        <p className="mt-4 text-lg text-ink-soft max-w-2xl font-serif">
          A polyglot stack spanning product engineering, AI integrations, and quality automation.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {skills.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.title}
              data-reveal
              className="paper-card paper-card-hover p-6 group"
            >
              <div className="w-11 h-11 rounded-xl bg-ink flex items-center justify-center mb-4 group-hover:rotate-[-6deg] transition-transform">
                <Icon size={22} className="text-paper-50" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-ink mb-3">{cat.title}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
