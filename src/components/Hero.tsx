import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Download, MapPin } from 'lucide-react';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { personal } from '../data/portfolio';

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set('[data-hero]', { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('[data-tear]', {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1,
        ease: 'power3.inOut',
      }).from('[data-hero]', { opacity: 0, y: 30, duration: 0.8, stagger: 0.12 }, '-=0.4');
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="top"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div className="relative section w-full grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div data-tear className="inline-block">
            <span data-hero className="section-eyebrow text-3xl">
              Hi there — I'm
            </span>
          </div>

          <h1
            data-hero
            className="font-serif text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tight leading-[0.95] text-ink"
          >
            {personal.name}.
          </h1>

          <p data-hero className="mt-5 font-serif text-2xl md:text-3xl italic text-accent-clay">
            {personal.title}
          </p>

          <p data-hero className="mt-5 max-w-xl text-base md:text-lg text-ink-soft leading-relaxed">
            {personal.subtitle}
          </p>

          <div data-hero className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" className="btn-primary">
              View my work <ArrowRight size={18} />
            </a>
            <a href={personal.resumeUrl} download className="btn-ghost">
              <Download size={18} /> Résumé
            </a>
          </div>

          <div
            data-hero
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-faint"
          >
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} className="text-accent" /> {personal.location}
            </span>
            <a
              href={personal.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-ink transition"
            >
              <FaLinkedin size={16} /> LinkedIn
            </a>
            <a
              href={personal.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-ink transition"
            >
              <FaGithub size={16} /> GitHub
            </a>
            <a
              href={personal.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-ink transition"
            >
              <FaInstagram size={16} /> Instagram
            </a>
          </div>
        </div>

        <div data-hero className="lg:col-span-5 relative">
          <figure className="relative mx-auto max-w-sm">
            <div className="absolute inset-0 translate-x-3 translate-y-3 border-2 border-ink rounded-[14px]" aria-hidden="true" />
            <div className="relative paper-card p-2.5 overflow-hidden">
              <div className="overflow-hidden rounded-[8px] bg-paper-200 aspect-[4/5]">
                <img
                  src="/images/profile_image.webp"
                  alt={`Portrait of ${personal.name}, ${personal.title}`}
                  width={640}
                  height={800}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <figcaption className="mt-2 flex items-center justify-between px-1">
                <span className="font-hand text-xl text-accent -rotate-2">{personal.name}</span>
                <span className="font-mono text-[10px] tracking-wider text-ink-faint uppercase">
                  {personal.location}
                </span>
              </figcaption>
            </div>
          </figure>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 font-hand text-lg text-ink-faint">
        <span>scroll</span>
        <span className="text-accent text-xl">↓</span>
      </div>
    </section>
  );
}

