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

export default function Navbar({ onEnter3D }: { onEnter3D?: (() => void) | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-paper-100/95 border-b-2 border-ink/15' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <a href="#top" className="font-hand text-3xl text-ink leading-none">
          Sagnik<span className="text-accent">.</span>
        </a>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="px-4 py-2 text-sm font-medium text-ink-soft hover:text-accent transition rounded-full"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          {onEnter3D && (
            <button onClick={onEnter3D} className="btn-ghost !px-4 !py-2 text-sm">
              Back to the clouds
            </button>
          )}
          <a href="#contact" className="btn-primary !px-5 !py-2 text-sm">
            Let's talk
          </a>
        </div>

        <button
          className="md:hidden p-2 text-ink"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t-2 border-ink/15 bg-paper-100"
          >
            <ul className="px-6 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-ink-soft hover:text-accent hover:bg-paper-200 rounded-lg transition"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              {onEnter3D && (
                <li className="mt-2">
                  <button
                    onClick={() => {
                      setOpen(false);
                      onEnter3D();
                    }}
                    className="btn-ghost w-full justify-center !py-2.5 text-sm"
                  >
                    Back to the clouds (3D islands)
                  </button>
                </li>
              )}
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
    </header>
  );
}
