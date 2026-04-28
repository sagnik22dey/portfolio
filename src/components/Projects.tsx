import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkle } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { projects } from '../data/portfolio';

export default function Projects() {
  return (
    <section id="projects" className="section relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <span className="section-eyebrow">// featured projects</span>
        <h2 className="section-title">
          Things I've <span className="gradient-text">built</span>.
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl">
          Selected work spanning full-stack mobile/web apps and AI-powered features.
        </p>
      </motion.div>

      <div className="grid gap-6">
        {projects.map((p, i) => (
          <motion.article
            key={p.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="glass glass-hover p-6 md:p-8 relative overflow-hidden group"
          >
            {/* Accent glow */}
            <div
              className={`pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-gradient-to-br ${p.accent} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`}
            />

            <div className="relative flex flex-col h-full">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-gradient-to-r ${p.accent} text-white shadow`}
                >
                  <Sparkle size={12} /> {p.category}
                </span>
                <span className="text-xs font-mono text-slate-500">{p.period}</span>
              </div>

              <h3 className="mt-4 text-2xl md:text-3xl font-bold text-white">
                {p.title}
              </h3>
              <p className="mt-1 text-sm text-brand-400 font-medium">{p.tagline}</p>

              <p className="mt-4 text-slate-300 leading-relaxed">{p.description}</p>

              <ul className="mt-5 space-y-2 mb-8 flex-grow">
                {p.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex gap-3 text-slate-300 text-sm leading-relaxed"
                  >
                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-brand-400 to-accent-cyan" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-white/5">
                <div className="flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>

                {(p.link || p.github) && (
                  <div className="flex items-center gap-3 shrink-0">
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary !py-2 !px-5 text-sm"
                      >
                        Live App <ArrowUpRight size={16} />
                      </a>
                    )}
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost !py-2 !px-5 text-sm"
                      >
                        <FaGithub size={18} /> GitHub
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
