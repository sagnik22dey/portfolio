import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const links = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-[#09090f]/70 border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <a
          href="#top"
          className="font-mono text-sm font-semibold tracking-wider text-white flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-cyan animate-pulse" />
          sagnik.dev
        </a>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-full hover:bg-white/5 transition"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#contact" className="hidden md:inline-flex btn-primary !px-5 !py-2 text-sm">
          Let's talk
        </a>

        <button
          className="md:hidden p-2 text-white"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-white/10 bg-[#09090f]/95 backdrop-blur-xl"
          >
            <ul className="px-6 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="mt-2">
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full justify-center !py-2.5 text-sm"
                >
                  Let's talk
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
