import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import Mascot from './Mascot';
import { answer, greeting, type NavTarget, type Reply } from './engine';

const HoshiDock = lazy(() => import('./HoshiDock'));

const SEARCH_STEPS = ["Opening Sagnik's notes", 'Searching projects, skills & experience', 'Writing your answer'];

/** True when the 3D dock can run: WebGL available and motion allowed. */
function canUseDock(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

type Msg = { id: number; from: 'bot' | 'user'; text: string; reply?: Reply };
type Props = { onNavigate: (t: NavTarget) => void; placement?: 'classic' | 'islands' };

let nextId = 1;

/** Floating "Hoshi" assistant: answers questions about Sagnik strictly from portfolio data. */
export default function Assistant({ onNavigate, placement = 'classic' }: Props) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ id: 0, from: 'bot', text: greeting.text, reply: greeting }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [dock, setDock] = useState(canUseDock);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const stepTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing, open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearInterval(stepTimer.current);
    },
    [],
  );

  const ask = (question: string) => {
    const q = question.trim().slice(0, 300);
    if (!q || typing) return;
    setMsgs((m) => [...m, { id: nextId++, from: 'user', text: q }]);
    setInput('');
    setTyping(true);
    setStep(0);
    window.clearInterval(stepTimer.current);
    stepTimer.current = window.setInterval(() => setStep((s) => Math.min(s + 1, SEARCH_STEPS.length - 1)), 520);
    timer.current = window.setTimeout(() => {
      window.clearInterval(stepTimer.current);
      const reply = answer(q);
      setMsgs((m) => [...m, { id: nextId++, from: 'bot', text: reply.text, reply }]);
      setTyping(false);
    }, 1500);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const go = (t: NavTarget) => {
    onNavigate(t);
    if (window.innerWidth < 640) setOpen(false);
  };

  const last = msgs[msgs.length - 1];
  const launcherPos =
    placement === 'islands'
      ? 'right-3 top-16 sm:right-5 sm:top-auto sm:bottom-[max(1.25rem,env(safe-area-inset-bottom))]'
      : 'right-4 bottom-[max(4.75rem,calc(env(safe-area-inset-bottom)+3.5rem))] sm:right-5';
  const openPanel = () => setOpen(true);

  return (
    <>
      {dock && (
        <Suspense fallback={null}>
          <HoshiDock open={open} searching={typing} onOpen={openPanel} onFailed={() => setDock(false)} />
        </Suspense>
      )}

      {!open && !dock && (
        <button
          onClick={openPanel}
          aria-label="Ask Hoshi, the portfolio assistant"
          aria-haspopup="dialog"
          className={`hoshi-launcher group fixed z-[60] flex items-center gap-2 rounded-full border-2 border-ink bg-paper-50 py-1 pl-1 pr-3 text-sm font-medium text-ink shadow-sketch transition hover:-translate-y-0.5 ${launcherPos}`}
        >
          <Mascot className="h-10 w-10" />
          <span className="hidden sm:inline">Ask Hoshi</span>
          <span className="sm:hidden">Ask</span>
        </button>
      )}

      {open && (
        <section
          role="dialog"
          data-scrollable=""
          data-lenis-prevent=""
          aria-label="Hoshi portfolio assistant"
          className="hoshi-panel fixed inset-x-2 bottom-2 z-[70] flex max-h-[min(78dvh,640px)] flex-col overflow-hidden rounded-[22px] border-2 border-ink bg-paper-50 shadow-sketch sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[24rem]"
        >
          <header className="flex items-center gap-3 border-b-2 border-ink bg-paper-200 px-3 py-2">
            <Mascot className="h-12 w-12 shrink-0" talking={typing} />
            <div className="min-w-0 flex-1">
              <h2 className="font-hand text-2xl leading-none text-ink">Hoshi</h2>
              <p className="truncate text-xs text-ink-soft">Sagnik's portfolio guide · answers from this site only</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="isle-icon-btn shrink-0 text-lg leading-none">
              ×
            </button>
          </header>

          <div ref={logRef} data-scrollable="" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3">
            {msgs.map((m) =>
              m.from === 'user' ? (
                <p key={m.id} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-3 py-2 text-sm text-paper-50">
                  {m.text}
                </p>
              ) : (
                <article key={m.id} className="bot-msg-in max-w-[92%] rounded-2xl rounded-bl-sm border-2 border-ink/80 bg-paper-100 px-3 py-2 text-sm text-ink">
                  <p className="leading-relaxed">{m.text}</p>
                  {m.reply?.bullets && (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-ink-soft">
                      {m.reply.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  )}
                  {(m.reply?.links?.length || m.reply?.actions?.length) ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.reply?.actions?.map((a) => (
                        <button key={a.label} onClick={() => go(a.nav)} className="rounded-full border-2 border-ink bg-accent px-2.5 py-0.5 text-xs font-medium text-paper-50 transition hover:-translate-y-0.5">
                          {a.label} →
                        </button>
                      ))}
                      {m.reply?.links?.map((l) => {
                        const external = /^https?:/.test(l.href);
                        return (
                          <a
                            key={l.href}
                            href={l.href}
                            target={l.href.startsWith('mailto:') ? undefined : '_blank'}
                            rel={external ? 'noopener noreferrer' : undefined}
                            className="rounded-full border-2 border-ink bg-paper-50 px-2.5 py-0.5 text-xs font-medium text-ink underline-offset-2 transition hover:text-accent hover:underline"
                          >
                            {l.label} ↗
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                </article>
              ),
            )}
            {typing && (
              <div className="hoshi-search w-[min(92%,18rem)] overflow-hidden rounded-2xl rounded-bl-sm border-2 border-ink/80 bg-paper-100 px-3 py-2 text-sm text-ink" role="status" aria-label="Hoshi is searching">
                <p className="flex items-center gap-2 font-medium">
                  <span className="hoshi-spin inline-block h-3.5 w-3.5 rounded-full border-2 border-accent border-t-transparent" aria-hidden="true" />
                  Hoshi is on her laptop…
                </p>
                <ol className="mt-2 space-y-1 text-xs">
                  {SEARCH_STEPS.map((label, i) => (
                    <li key={label} className={`flex items-center gap-2 transition-opacity ${i <= step ? 'opacity-100' : 'opacity-35'}`}>
                      <span aria-hidden="true" className={i < step ? 'text-accent' : 'text-ink-faint'}>
                        {i < step ? '✓' : '○'}
                      </span>
                      <span className={i === step ? 'text-ink' : 'text-ink-soft'}>{label}</span>
                    </li>
                  ))}
                </ol>
                <span className="hoshi-scan mt-2 block h-1 rounded-full bg-paper-300" aria-hidden="true" />
              </div>
            )}
          </div>

          {!typing && last.from === 'bot' && last.reply?.suggestions && (
            <div className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto border-t border-ink/20 px-3 py-2" data-scrollable="">
              {last.reply.suggestions.map((s) => (
                <button key={s} onClick={() => ask(s)} className="chip shrink-0 whitespace-nowrap transition hover:border-ink hover:text-ink">
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex shrink-0 items-center gap-2 border-t-2 border-ink px-3 py-2">
            <label htmlFor="hoshi-input" className="sr-only">
              Ask a question about Sagnik
            </label>
            <input
              id="hoshi-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={300}
              autoComplete="off"
              placeholder="Ask about projects, skills, contact…"
              className="min-w-0 flex-1 rounded-full border-2 border-ink bg-paper-50 px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button type="submit" disabled={!input.trim() || typing} className="btn-primary !px-4 !py-1.5 text-sm disabled:opacity-50">
              Ask
            </button>
          </form>
        </section>
      )}
    </>
  );
}
