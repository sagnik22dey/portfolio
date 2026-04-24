import { motion } from 'framer-motion';
import { skills } from '../data/portfolio';

export default function Skills() {
  return (
    <section id="skills" className="section relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="text-center md:text-left mb-12"
      >
        <span className="section-eyebrow">// tech stack</span>
        <h2 className="section-title">
          Tools I use to <span className="gradient-text">build & ship</span>.
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl">
          A polyglot stack spanning product engineering, AI integrations, and quality automation.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {skills.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass glass-hover p-6 group"
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}
              >
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">{cat.title}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
