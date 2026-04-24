import { motion } from 'framer-motion';
import { Mail, MapPin, ArrowRight } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { personal } from '../data/portfolio';

export default function Contact() {
  return (
    <section id="contact" className="section relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="glass p-8 md:p-14 relative overflow-hidden text-center"
      >
        {/* Decorative glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-600/30 to-accent-cyan/30 blur-3xl pointer-events-none" />

        <span className="relative section-eyebrow">// let's connect</span>
        <h2 className="relative section-title mt-1">
          Got a cool idea? <span className="gradient-text">Let's build it.</span>
        </h2>
        <p className="relative mt-4 text-slate-400 max-w-xl mx-auto">
          I'm currently open to Full-Stack and AI Engineering opportunities. The inbox is always
          open — whether it's a role, a collab, or just to say hi.
        </p>

        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <a href={`mailto:${personal.email}`} className="btn-primary">
            <Mail size={18} /> Say hello <ArrowRight size={16} />
          </a>
          <a
            href={personal.linkedin}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            <FaLinkedin size={18} /> LinkedIn
          </a>
          <a
            href={personal.github}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            <FaGithub size={18} /> GitHub
          </a>
        </div>

        <div className="relative mt-10 flex flex-wrap justify-center items-center gap-5 text-sm text-slate-400">
          <a
            href={`mailto:${personal.email}`}
            className="inline-flex items-center gap-2 hover:text-white transition"
          >
            <Mail size={14} /> {personal.email}
          </a>
          <span className="inline-flex items-center gap-2">
            <MapPin size={14} /> {personal.location}
          </span>
        </div>
      </motion.div>
    </section>
  );
}
