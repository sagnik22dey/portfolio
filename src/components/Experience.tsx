import { motion } from 'framer-motion';
import { Briefcase, MapPin, CheckCircle2 } from 'lucide-react';
import { experiences } from '../data/portfolio';

export default function Experience() {
  return (
    <section id="experience" className="section relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <span className="section-eyebrow">// experience</span>
        <h2 className="section-title">
          Where I've <span className="gradient-text">engineered</span>.
        </h2>
      </motion.div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-brand-500/60 via-white/10 to-transparent" />

        <div className="space-y-10">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.role}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative pl-14 md:pl-20"
            >
              {/* Dot */}
              <div className="absolute left-0 md:left-2 top-1 w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Briefcase size={16} className="text-white" />
              </div>

              <div className="glass p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      {exp.role}
                    </h3>
                    <div className="mt-1 text-brand-400 font-semibold">
                      {exp.company}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono text-slate-400">
                      <span>{exp.period}</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} /> {exp.location}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-slate-300 leading-relaxed">{exp.description}</p>

                <ul className="mt-5 space-y-2.5">
                  {exp.achievements.map((a) => (
                    <li key={a} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                      <CheckCircle2
                        size={18}
                        className="shrink-0 mt-0.5 text-accent-cyan"
                      />
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
