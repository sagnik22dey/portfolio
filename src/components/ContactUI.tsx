import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, Copy, FileText, Mail, MapPin, Send, X } from 'lucide-react';
import { FaGithub, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { personal, socialLinks, type SocialLink } from '../three/rooms/roomData';

const EASE = [0.22, 1, 0.36, 1] as const;
const ring = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper-100';

const CHANNEL: Record<string, { icon: typeof Mail; name: string; note: string }> = {
  EMAIL: { icon: Mail, name: 'Write a letter', note: personal.email },
  LINKEDIN: { icon: FaLinkedinIn as typeof Mail, name: 'LinkedIn', note: 'Work history & recommendations' },
  GITHUB: { icon: FaGithub as typeof Mail, name: 'GitHub', note: 'Source for everything in the gallery' },
  INSTAGRAM: { icon: FaInstagram as typeof Mail, name: 'Instagram', note: 'Off-the-clock sketches' },
  RESUME: { icon: FileText, name: 'Résumé', note: 'One-page PDF' },
};

type CardProps = { hidden: boolean; onPick: (link: SocialLink) => void };

/** Postcard panel listing every contact channel as a real link, mirroring the barrels in the scene. */
export function ContactCard({ hidden, onPick }: CardProps) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(personal.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${personal.email}`;
    }
  };

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.aside
          aria-label="Contact channels"
          className="pointer-events-none absolute bottom-0 left-0 z-10 flex w-full p-3 sm:w-[400px] sm:p-6"
          initial={{ opacity: 0, y: 30, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -1, transition: { delay: 0.9, duration: 0.6, ease: EASE } }}
          exit={{ opacity: 0, y: 30, transition: { duration: 0.2 } }}
        >
          <div className="paper-texture pointer-events-auto relative w-full overflow-hidden rounded-md border border-ink/80 shadow-[0_26px_50px_-24px_rgba(30,58,72,0.55)]">
            <div aria-hidden className="h-2 w-full bg-[repeating-linear-gradient(135deg,#c2410c_0_12px,#faf6ec_12px_20px,#3f6b7d_20px_32px,#faf6ec_32px_40px)]" />
            <div className="px-5 pb-4 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="-rotate-2 font-hand text-2xl leading-none text-accent">say hello</p>
                  <h3 className="mt-1 font-serif text-[30px] font-semibold leading-none tracking-tight text-ink">Send word ashore</h3>
                  <p className="mt-2 flex items-center gap-1.5 font-sans text-xs text-ink-faint">
                    <MapPin size={13} /> {personal.location} · usually replies in a day
                  </p>
                </div>
                <div aria-hidden className="grid h-16 w-14 shrink-0 rotate-3 place-items-center rounded-[3px] border-2 border-dashed border-accent/70 bg-paper-50 font-serif text-[10px] font-semibold uppercase leading-tight tracking-widest text-accent">
                  <span className="text-center">
                    Post
                    <br />
                    <span className="text-xl italic tracking-normal">SD</span>
                  </span>
                </div>
              </div>

              <ul className="mt-4 divide-y divide-dashed divide-ink/20 border-y border-dashed border-ink/20">
                {socialLinks.map((l) => {
                  const c = CHANNEL[l.label] ?? { icon: ArrowUpRight, name: l.label, note: '' };
                  const Icon = c.icon;
                  const isMail = l.label === 'EMAIL';
                  return (
                    <li key={l.label} className="flex items-center gap-2">
                      <button
                        type="button"
                        data-contact={l.label}
                        onClick={() => onPick(l)}
                        className={`group flex min-w-0 flex-1 items-center gap-3 rounded-sm py-2.5 text-left transition ${ring}`}
                      >
                        <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-ink/60 text-ink transition duration-200 group-hover:border-transparent group-hover:text-paper-50">
                          <span className="absolute inset-0 scale-0 rounded-full transition duration-200 group-hover:scale-100" style={{ background: l.accent }} />
                          <Icon size={15} className="relative" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-serif text-lg font-semibold leading-tight text-ink transition-colors group-hover:text-accent">{c.name}</span>
                          <span className="block truncate font-sans text-[11px] text-ink-faint">{c.note}</span>
                        </span>
                        <ArrowUpRight size={15} className="ml-auto shrink-0 text-ink-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                      </button>
                      {isMail && (
                        <button
                          type="button"
                          onClick={copy}
                          aria-label={copied ? 'Email copied' : 'Copy email address'}
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint transition hover:bg-paper-200 hover:text-ink ${ring}`}
                        >
                          {copied ? <Check size={14} className="text-accent-sage" /> : <Copy size={14} />}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 font-hand text-lg leading-tight text-ink-faint">or click a barrel bobbing in the harbour</p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

type NoteProps = { onClose: () => void };

/** Ruled letter sheet that validates input and composes an email to the portfolio owner. */
export function MessageNote({ onClose }: NoteProps) {
  const [name, setName] = useState('');
  const [reply, setReply] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sealed, setSealed] = useState(false);
  const first = personal.name.split(' ')[0];

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (reply && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reply)) return setError('That email address looks incomplete.');
    if (message.trim().length < 10) return setError('Write at least a sentence so I know how to help.');
    setError(null);
    setSealed(true);
    const subject = encodeURIComponent(`Hello from ${name.trim() || 'your portfolio'}`);
    const body = encodeURIComponent(`${message.trim()}\n\n— ${name.trim() || 'A visitor'}${reply ? `\n${reply}` : ''}`);
    window.setTimeout(() => {
      window.location.href = `mailto:${personal.email}?subject=${subject}&body=${body}`;
    }, 650);
  };

  const field =
    'w-full border-0 border-b border-ink/30 bg-transparent px-0 py-1.5 font-serif text-lg text-ink placeholder:text-ink-faint/60 outline-none transition-colors focus:border-accent';

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center bg-[#1e2d35]/45 p-4 backdrop-blur-[6px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        onSubmit={send}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-title"
        noValidate
        className="paper-texture relative w-full max-w-lg overflow-hidden rounded-[3px] border border-ink/70 text-ink shadow-[0_40px_80px_-30px_rgba(20,30,36,0.7)]"
        initial={{ y: 80, rotate: -5, opacity: 0 }}
        animate={sealed ? { y: -40, rotate: 2, scale: 0.94, opacity: 0.0, transition: { duration: 0.6, ease: EASE } } : { y: 0, rotate: -1, opacity: 1, transition: { type: 'spring', stiffness: 150, damping: 18 } }}
        exit={{ y: 50, rotate: 3, opacity: 0, transition: { duration: 0.2 } }}
      >
        <div aria-hidden className="h-2 w-full bg-[repeating-linear-gradient(135deg,#c2410c_0_12px,#faf6ec_12px_20px,#3f6b7d_20px_32px,#faf6ec_32px_40px)]" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-12 top-2 w-px bg-accent/30" />
        <button
          type="button"
          aria-label="Close message"
          onClick={onClose}
          className={`absolute right-4 top-5 grid h-9 w-9 place-items-center rounded-full text-ink-faint transition hover:bg-paper-200 hover:text-ink ${ring}`}
        >
          <X size={18} />
        </button>

        <div className="py-7 pl-16 pr-7 sm:pr-9">
          <p className="-rotate-2 font-hand text-2xl leading-none text-accent">a message in a bottle</p>
          <h3 id="note-title" className="mt-1 font-serif text-4xl font-semibold leading-none tracking-tight">
            Dear {first},
          </h3>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-faint">Your name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ada Lovelace" className={field} />
            </label>
            <label className="block">
              <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-faint">Reply to (optional)</span>
              <input type="email" value={reply} onChange={(e) => setReply(e.target.value)} autoComplete="email" placeholder="you@studio.dev" className={field} />
            </label>
          </div>

          <label className="mt-5 block">
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-faint">Message</span>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="I'm building something and would love your help with…"
              className="mt-1 w-full resize-none border-0 bg-transparent bg-[linear-gradient(transparent_31px,rgba(43,38,32,0.18)_32px)] bg-[length:100%_32px] [background-attachment:local] px-0 font-serif text-lg leading-[32px] text-ink placeholder:text-ink-faint/60 outline-none"
            />
          </label>

          <p role="alert" aria-live="polite" className="min-h-[20px] font-sans text-xs text-accent">
            {error}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <a href={`mailto:${personal.email}`} className={`inline-flex items-center gap-1 rounded font-sans text-xs text-ink-faint underline-offset-4 transition hover:text-accent hover:underline ${ring}`}>
              {personal.email} <ArrowUpRight size={13} />
            </a>
            <button
              type="submit"
              className={`inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-paper-50 transition hover:bg-accent active:scale-95 ${ring}`}
            >
              <Send size={14} /> Seal &amp; send
            </button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
}
