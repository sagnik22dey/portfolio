import { motion } from 'framer-motion';
import { ArrowRight, Download, Mail, MapPin, Sparkles } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { personal } from '../data/portfolio';

export default function Hero() {
  return (
    <section id="top" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Grid backdrop */}
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
      {/* Floating orbs */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-brand-600/30 blur-3xl animate-float" />
      <div className="absolute top-1/3 -right-24 w-[380px] h-[380px] rounded-full bg-accent-cyan/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative section w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-6"
        >
          <Sparkles size={14} className="text-accent-cyan" />
          <span className="text-xs font-mono text-slate-300">{personal.availability}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]"
        >
          <span className="block text-white">Hi, I'm</span>
          <span className="block gradient-text">{personal.name}.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-xl md:text-2xl font-medium text-white/90"
        >
          {personal.title}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-4 max-w-2xl text-base md:text-lg text-slate-400 leading-relaxed"
        >
          {personal.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <a href="#projects" className="btn-primary">
            View my work <ArrowRight size={18} />
          </a>
          <a href={personal.resumeUrl} download className="btn-ghost">
            <Download size={18} /> Download Resume
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center gap-5 text-slate-400"
        >
          <span className="inline-flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-brand-400" /> {personal.location}
          </span>
          <a
            href={`mailto:${personal.email}`}
            className="inline-flex items-center gap-2 text-sm hover:text-white transition"
          >
            <Mail size={16} /> {personal.email}
          </a>
          <a
            href={personal.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm hover:text-white transition"
          >
            <FaLinkedin size={16} /> LinkedIn
          </a>
          <a
            href={personal.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm hover:text-white transition"
          >
            <FaGithub size={16} /> GitHub
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-xs text-slate-500 font-mono"
        >
          <span>SCROLL</span>
          <div className="w-px h-10 bg-gradient-to-b from-slate-500 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
