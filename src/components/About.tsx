import { useReveal } from '../hooks/useReveal';
import { about } from '../data/portfolio';

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

      <div className="mt-10 grid md:grid-cols-5 gap-8 items-start">
        <div
          data-reveal
          className="md:col-span-3 space-y-5 text-lg text-ink-soft leading-relaxed font-serif"
        >
          {about.bio.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="md:col-span-2 space-y-4">
          <div
            data-reveal
            className="paper-card p-3 border-2 border-ink shadow-sketch"
          >
            <div className="aspect-[4/3] overflow-hidden bg-paper-200 border border-ink/20 relative">
              <img
                src="/images/profile_image.webp"
                alt="Sagnik Dey"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="mt-2 text-center text-[10px] font-mono tracking-widest text-ink-faint uppercase">
              STUDIO PORTRAIT :: SAGNIK DEY
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {about.stats.map((s) => (
              <div
                key={s.label}
                data-reveal
                className="paper-card paper-card-hover p-5 flex flex-col justify-between min-h-[120px]"
              >
                <div className="font-serif text-4xl font-semibold text-accent">{s.value}</div>
                <div className="text-xs text-ink-faint uppercase tracking-wider mt-2 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
