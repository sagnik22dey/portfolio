import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { Mail, Heart } from 'lucide-react';
import { personal } from '../data/portfolio';

export default function Footer() {
  return (
    <footer className="border-t-2 border-ink/15 mt-10">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-ink-faint font-hand text-lg">
          © {new Date().getFullYear()} {personal.name}. Crafted with
          <Heart size={14} className="text-accent fill-accent" />
          in code.
        </div>
        <div className="flex items-center gap-4 text-ink-soft">
          <a
            href={`mailto:${personal.email}`}
            className="hover:text-accent transition"
            aria-label="Email"
          >
            <Mail size={18} />
          </a>
          <a
            href={personal.linkedin}
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent transition"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={18} />
          </a>
          <a
            href={personal.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent transition"
            aria-label="GitHub"
          >
            <FaGithub size={18} />
          </a>
          <a
            href={personal.instagram}
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent transition"
            aria-label="Instagram"
          >
            <FaInstagram size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
