import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, FileText, Mail, MapPin, Sparkles } from 'lucide-react';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import type { Bay } from '../three/corridorData';
import { skills, personal, about, experiences } from '../data/portfolio';
import ProjectGallery from './ProjectGallery';

type Props = { bay: Bay | null; onClose: () => void };

const easeFast = [0.2, 0.9, 0.3, 1] as const;

/** Full-content tactile overlay shown when entering an atelier chamber. */
export default function BayOverlay({ bay, onClose }: Props) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {bay && bay.kind === 'gallery' && <ProjectGallery key="gallery" onClose={onClose} />}

      {bay && bay.kind === 'room' && (
        <motion.div
          key="room"
          className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            aria-label="Close modal"
            className="absolute inset-0 bg-[#16120e]/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-paper-100 border-2 border-ink shadow-sketch p-6 sm:p-9 md:p-10"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.22, ease: easeFast } }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.16 } }}
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-ink/15">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">
                  FOLIO CHAMBER // {bay.title.toUpperCase()}
                </span>
              </div>
              <button
                aria-label="Close"
                onClick={onClose}
                className="w-8 h-8 border border-ink flex items-center justify-center hover:bg-ink hover:text-paper-50 transition shadow-sketch-sm"
              >
                <X size={16} />
              </button>
            </div>
            <RoomBody id={bay.id} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RoomBody({ id }: { id: string }) {
  if (id === 'about') {
    return (
      <article className="space-y-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
            ABOUT THE CRAFTSMAN
          </span>
          <h2 className="mt-1 font-serif text-4xl sm:text-5xl font-semibold text-ink">
            {personal.name}
          </h2>
          <p className="mt-1 font-serif text-lg text-accent italic">{personal.title}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-ink-faint">
            <MapPin size={13} />
            <span>{personal.location}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 items-center border border-ink/25 p-4 bg-paper-50 shadow-sketch-sm">
          <div className="sm:col-span-1">
            <div className="relative aspect-[3/4] overflow-hidden border-2 border-ink bg-paper-200 shadow-sketch">
              <img
                src="/images/profile_image.webp"
                alt={personal.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="mt-2 text-[10px] font-mono tracking-wider text-ink-faint text-center uppercase">
              PORTRAIT :: {personal.name.toUpperCase()}
            </div>
          </div>
          <div className="sm:col-span-2 space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent font-semibold">
              AUTOBIOGRAPHICAL FOLIO
            </span>
            <div className="space-y-3 font-serif text-base text-ink-soft leading-relaxed border-l-2 border-ink/20 pl-3">
              {about.bio.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {about.stats.map((s) => (
            <div key={s.label} className="p-3.5 bg-paper-50 border border-ink/25 text-center shadow-sketch-sm">
              <div className="font-serif text-3xl font-bold text-accent">{s.value}</div>
              <div className="text-[11px] font-mono text-ink-faint uppercase tracking-wider mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (id === 'skills') {
    return (
      <article className="space-y-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
            ENGINEERING DISCIPLINES
          </span>
          <h2 className="mt-1 font-serif text-4xl sm:text-5xl font-semibold text-ink">
            Technical Mastery
          </h2>
          <p className="mt-1 font-serif text-base text-ink-soft italic">
            Architected for production reliability, AI/ML scalability, and high-performance user interfaces.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {skills.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                className="p-4 bg-paper-50 border-2 border-ink shadow-sketch-sm"
              >
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-ink/15">
                  <div className="w-7 h-7 border border-ink bg-paper-100 flex items-center justify-center text-accent">
                    <Icon size={15} />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-ink">{cat.title}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 text-xs font-mono border border-ink/25 bg-paper-100 text-ink-soft"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </article>
    );
  }

  if (id === 'experience') {
    return (
      <article className="space-y-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
            CHRONOLOGY & MILESTONES
          </span>
          <h2 className="mt-1 font-serif text-4xl sm:text-5xl font-semibold text-ink">
            Professional Experience
          </h2>
          <p className="mt-1 font-serif text-base text-ink-soft italic">
            Proven track record of engineering scalable automation frameworks and shipping production web applications.
          </p>
        </div>

        <div className="space-y-5">
          {experiences.map((exp) => (
            <div
              key={exp.role}
              className="p-5 bg-paper-50 border-2 border-ink shadow-sketch-sm"
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-ink">{exp.role}</h3>
                  <div className="text-accent font-serif font-medium text-lg">{exp.company}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 text-[11px] font-mono border border-ink/30 bg-paper-100 text-ink">
                    {exp.period}
                  </span>
                  <div className="text-[11px] font-mono text-ink-faint mt-1">{exp.location}</div>
                </div>
              </div>

              <p className="mt-3 font-serif text-base text-ink-soft leading-relaxed">
                {exp.description}
              </p>

              {exp.achievements && exp.achievements.length > 0 && (
                <div className="mt-3 space-y-1.5 border-l-2 border-accent/40 pl-3">
                  {exp.achievements.map((ach, ai) => (
                    <p key={ai} className="font-serif text-sm text-ink-soft italic">
                      • {ach}
                    </p>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-1.5">
                {exp.tech.map((t) => (
                  <span key={t} className="chip text-[11px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>
    );
  }

  return (
    <article className="space-y-6 text-center max-w-xl mx-auto py-2">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
          DISPATCH & INQUIRY
        </span>
        <h2 className="mt-1 font-serif text-4xl sm:text-5xl font-semibold text-ink">
          Let's Build It.
        </h2>
        <p className="mt-2 font-serif text-lg text-ink-soft">
          {personal.subtitle}
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 border border-accent/40 bg-accent/5 text-accent text-xs font-mono">
        <Sparkles size={13} />
        <span>{personal.availability}</span>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={`mailto:${personal.email}`}
          className="w-full sm:w-auto btn-primary !py-2.5 !px-6 text-sm flex items-center justify-center gap-2"
        >
          <Mail size={16} /> Send a Dispatch <ArrowUpRight size={16} />
        </a>
        <a
          href={personal.resumeUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto btn-ghost !py-2.5 !px-5 text-sm flex items-center justify-center gap-2"
        >
          <FileText size={16} /> View Resume (PDF)
        </a>
      </div>

      <div className="pt-4 border-t border-ink/15 flex items-center justify-center gap-4">
        <a
          href={personal.linkedin}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-serif text-ink-soft hover:text-accent transition"
        >
          <FaLinkedin size={16} /> LinkedIn
        </a>
        <a
          href={personal.github}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-serif text-ink-soft hover:text-accent transition"
        >
          <FaGithub size={16} /> GitHub
        </a>
        <a
          href={personal.instagram}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-serif text-ink-soft hover:text-accent transition"
        >
          <FaInstagram size={16} /> Instagram
        </a>
      </div>
    </article>
  );
}
