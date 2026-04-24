import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Mail, Heart } from 'lucide-react';
import { personal } from '../data/portfolio';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-10">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          © {new Date().getFullYear()} {personal.name}. Crafted with
          <Heart size={12} className="text-pink-500 fill-pink-500" />
          using React + Tailwind.
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <a
            href={`mailto:${personal.email}`}
            className="hover:text-white transition"
            aria-label="Email"
          >
            <Mail size={18} />
          </a>
          <a
            href={personal.linkedin}
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={18} />
          </a>
          <a
            href={personal.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition"
            aria-label="GitHub"
          >
            <FaGithub size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
