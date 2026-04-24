import { motion } from 'framer-motion';
import { about } from '../data/portfolio';

export default function About() {
  return (
    <section id="about" className="section relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-eyebrow">// about</span>
        <h2 className="section-title">
          Engineer at the seam of <span className="gradient-text">Full-Stack</span> and{' '}
          <span className="gradient-text">AI</span>.
        </h2>
      </motion.div>

      <div className="mt-10 grid md:grid-cols-5 gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:col-span-3 space-y-5 text-slate-300 leading-relaxed"
        >
          {about.bio.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-2 grid grid-cols-2 gap-4"
        >
          {about.stats.map((s) => (
            <div
              key={s.label}
              className="glass glass-hover p-5 flex flex-col justify-between min-h-[120px]"
            >
              <div className="text-3xl font-extrabold gradient-text">{s.value}</div>
              <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-2">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
