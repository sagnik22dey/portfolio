import { Mail, MapPin, ArrowRight } from 'lucide-react';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { useReveal } from '../hooks/useReveal';
import { personal } from '../data/portfolio';

export default function Contact() {
  const scope = useReveal<HTMLElement>('#contact [data-reveal]');

  return (
    <section id="contact" ref={scope} className="section relative">
      <div data-reveal className="paper-card p-8 md:p-14 relative overflow-hidden text-center">
        <span className="section-eyebrow">let's connect</span>
        <h2 className="section-title mt-1">
          Got a cool idea? <span className="accent-text">Let's build it.</span>
        </h2>
        <p className="mt-5 text-lg text-ink-soft max-w-xl mx-auto font-serif">
          I'm currently open to Full-Stack and AI Engineering opportunities. The inbox is always
          open — whether it's a role, a collab, or just to say hi.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={`mailto:${personal.email}`} className="btn-primary">
            <Mail size={18} /> Say hello <ArrowRight size={16} />
          </a>
          <a href={personal.linkedin} target="_blank" rel="noreferrer" className="btn-ghost">
            <FaLinkedin size={18} /> LinkedIn
          </a>
          <a href={personal.github} target="_blank" rel="noreferrer" className="btn-ghost">
            <FaGithub size={18} /> GitHub
          </a>
          <a href={personal.instagram} target="_blank" rel="noreferrer" className="btn-ghost">
            <FaInstagram size={18} /> Instagram
          </a>
        </div>

        <div className="mt-10 flex flex-wrap justify-center items-center gap-5 text-sm text-ink-faint">
          <a
            href={`mailto:${personal.email}`}
            className="inline-flex items-center gap-2 hover:text-accent transition"
          >
            <Mail size={14} /> {personal.email}
          </a>
          <span className="inline-flex items-center gap-2">
            <MapPin size={14} /> {personal.location}
          </span>
        </div>
      </div>
    </section>
  );
}
