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
            className="absolute inset-0 bg-[#0c0d0f]/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-[#161412] border-gold-glow shadow-hud p-6 sm:p-9 md:p-10 text-stone-200"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.22, ease: easeFast } }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.16 } }}
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-amber-900/30">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
                  FOLIO CHAMBER // {bay.title.toUpperCase()}
                </span>
              </div>
              <button
                aria-label="Close"
                onClick={onClose}
                className="w-8 h-8 border border-amber-900/50 bg-[#18191e]/80 flex items-center justify-center text-stone-400 hover:text-amber-200 hover:border-amber-400 hover:bg-[#25201b] transition-all"
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
          <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-medium">
            ABOUT THE CRAFTSMAN
          </span>
          <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-normal text-cave-chalk tracking-wide">
            {personal.name}
          </h2>
          <p className="mt-1 font-serif text-lg text-amber-400/90 italic">{personal.title}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-cave-dust">
            <MapPin size={13} />
            <span>{personal.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {about.stats.map((s) => (
            <div key={s.label} className="p-3.5 bg-[#18191e] border-bronze-hairline text-center">
              <div className="font-serif text-3xl font-normal text-amber-300">{s.value}</div>
              <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-bronze-hairline p-5 bg-[#18191e] shadow-lg">
          <div className="space-y-3 font-serif text-base text-stone-300 leading-relaxed border-l-2 border-amber-500/40 pl-3">
            {about.bio.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </article>
    );
  }

  if (id === 'skills') {
    return (
      <article className="space-y-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-medium">
            ENGINEERING DISCIPLINES
          </span>
          <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-normal text-cave-chalk tracking-wide">
            Technical Mastery
          </h2>
          <p className="mt-1 font-serif text-base text-stone-400 italic">
            Architected for production reliability, AI/ML scalability, and high-performance user interfaces.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {skills.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                className="p-4 bg-[#18191e] border-bronze-hairline"
              >
                <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-amber-900/30">
                  <div className="w-7 h-7 border border-amber-500/40 bg-[#25201b] flex items-center justify-center text-amber-300">
                    <Icon size={15} />
                  </div>
                  <h3 className="font-serif text-xl font-normal text-cave-chalk">{cat.title}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 text-xs font-mono border border-amber-900/30 bg-[#121316] text-amber-200/90"
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
          <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-medium">
            CHRONOLOGY & MILESTONES
          </span>
          <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-normal text-cave-chalk tracking-wide">
            Professional Experience
          </h2>
          <p className="mt-1 font-serif text-base text-stone-400 italic">
            Proven track record of engineering scalable automation frameworks and shipping production web applications.
          </p>
        </div>

        <div className="space-y-5">
          {experiences.map((exp) => (
            <div
              key={exp.role}
              className="p-5 bg-[#18191e] border-bronze-hairline"
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-serif text-2xl font-normal text-cave-chalk">{exp.role}</h3>
                  <div className="text-amber-400 font-serif text-lg">{exp.company}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 text-[10px] font-mono border border-amber-500/30 bg-[#25201b] text-amber-200">
                    {exp.period}
                  </span>
                  <div className="text-[10px] font-mono text-stone-400 mt-1">{exp.location}</div>
                </div>
              </div>

              <p className="mt-3 font-serif text-base text-stone-300 leading-relaxed">
                {exp.description}
              </p>

              {exp.achievements && exp.achievements.length > 0 && (
                <div className="mt-3.5 space-y-1.5 border-l-2 border-amber-500/40 pl-3">
                  {exp.achievements.map((ach, ai) => (
                    <p key={ai} className="font-serif text-sm text-stone-400 italic">
                      • {ach}
                    </p>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-1.5">
                {exp.tech.map((t) => (
                  <span
                    key={t}
                    className="border border-amber-900/30 bg-[#121316] text-amber-200/90 text-xs px-2.5 py-0.5 font-mono"
                  >
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
        <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-medium">
          DISPATCH & INQUIRY
        </span>
        <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-normal text-cave-chalk tracking-wide">
          Let's Build It.
        </h2>
        <p className="mt-2 font-serif text-lg text-stone-300">
          {personal.subtitle}
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-mono">
        <Sparkles size={13} />
        <span>{personal.availability}</span>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={`mailto:${personal.email}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs uppercase tracking-widest font-semibold transition-all shadow-[0_0_14px_rgba(245,158,11,0.3)] active:scale-95"
        >
          <Mail size={15} /> Send a Dispatch <ArrowUpRight size={15} />
        </a>
        <a
          href={personal.resumeUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-amber-500/40 hover:border-amber-400 hover:text-amber-200 bg-[#1e2026] text-stone-300 font-mono text-xs uppercase tracking-widest font-medium transition-all active:scale-95"
        >
          <FileText size={15} /> View Resume (PDF)
        </a>
      </div>

      <div className="pt-4 border-t border-amber-900/30 flex items-center justify-center gap-4">
        <a
          href={personal.linkedin}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-mono text-stone-400 hover:text-amber-300 transition"
        >
          <FaLinkedin size={15} /> LinkedIn
        </a>
        <a
          href={personal.github}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-mono text-stone-400 hover:text-amber-300 transition"
        >
          <FaGithub size={15} /> GitHub
        </a>
        <a
          href={personal.instagram}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-mono text-stone-400 hover:text-amber-300 transition"
        >
          <FaInstagram size={15} /> Instagram
        </a>
      </div>
    </article>
  );
}
