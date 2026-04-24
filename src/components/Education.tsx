import { motion } from 'framer-motion';
import { GraduationCap, MapPin } from 'lucide-react';
import { education } from '../data/portfolio';

export default function Education() {
  return (
    <section id="education" className="section relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <span className="section-eyebrow">// education</span>
        <h2 className="section-title">
          Academic <span className="gradient-text">foundation</span>.
        </h2>
      </motion.div>

      <div className="grid gap-5">
        {education.map((e, i) => (
          <motion.div
            key={e.degree}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass glass-hover p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5"
          >
            <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center shadow-lg">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-white">{e.degree}</h3>
              <div className="text-brand-400 font-medium mt-0.5">{e.institution}</div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-mono text-slate-400">
                <span>{e.affiliation}</span>
                <span>·</span>
                <span>{e.period}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} /> {e.location}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
