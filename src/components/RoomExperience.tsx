import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import GalleryRoom, { type GalleryCommand } from '../three/rooms/GalleryRoom';
import { GalleryDossier, GalleryNav } from './GalleryUI';
import { ContactCard, MessageNote } from './ContactUI';
import StudioRoom from '../three/rooms/StudioRoom';
import AboutRoom from '../three/rooms/AboutRoom';
import ContactRoom from '../three/rooms/ContactRoom';
import { usePaintReveal } from '../three/rooms/usePaintReveal';
import { galleryItems, studioScreens, skyMilestones, type SocialLink } from '../three/rooms/roomData';
import { settingsFor, type PerfTier } from '../three/performanceTier';
import type { RoomId } from '../three/corridorData';

export type { RoomId };

const META: Record<RoomId, { name: string; hint: string; bg: string; dark?: boolean }> = {
  gallery: { name: 'The Gallery', hint: 'Scroll, drag or ← → to browse · click a sheet to open it', bg: '#ede9df', dark: false },
  studio: { name: 'The Studio', hint: 'Drag to spin · scroll to speed up · click a screen', bg: '#17120d', dark: true },
  about: { name: 'About', hint: 'Scroll to fly through the story', bg: '#c6dde9' },
  contact: { name: 'Contact', hint: 'Click a barrel or pick a channel below', bg: '#dce8ee' },
};

const PAINT = {
  gallery: { dirX: 1, dirY: 0, dirZ: 0.1, startDist: -14, endDist: 40 },
  studio: { dirX: 0, dirY: -1, dirZ: 0, startDist: -8, endDist: 10, noiseAxes: 'xz' as const },
  about: { dirX: 0, dirY: 0, dirZ: -1, startDist: -6, endDist: 140, noiseAxes: 'xy' as const },
  contact: { dirX: 0, dirY: 0, dirZ: -1, startDist: -6, endDist: 40, noiseAxes: 'xy' as const },
};

type Props = { room: RoomId; tier: PerfTier; onBack: () => void };

/** Full-canvas host for one 3D room: paint-reveal entry, room-specific DOM layer, back-to-corridor HUD. */
export default function RoomExperience({ room, tier, onBack }: Props) {
  const settings = settingsFor(tier);
  const paint = usePaintReveal(PAINT[room]);
  const meta = META[room];

  const [flipped, setFlipped] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [milestone, setMilestone] = useState(0);
  const [writing, setWriting] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const [galleryCmd, setGalleryCmd] = useState<GalleryCommand | null>(null);
  const sendGallery = useCallback(
    (type: GalleryCommand['type'], index: number) =>
      setGalleryCmd({ type, index: (index + galleryItems.length) % galleryItems.length, nonce: Date.now() }),
    []
  );

  useEffect(() => {
    paint.reset();
    paint.play(0.25, 2.4);
  }, [paint]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (writing) setWriting(false);
      else if (focused !== null) setFocused(null);
      else if (selectedProject !== null) {
        setSelectedProject(null);
        setFlipped(null);
      } else if (flipped !== null) setFlipped(null);
      else onBack();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onBack, writing, focused, selectedProject, flipped]);

  const pickSocial = useCallback((link: SocialLink) => {
    if (link.label === 'EMAIL') setWriting(true);
    else window.open(link.url, '_blank', 'noopener');
  }, []);

  const scene = useMemo(() => {
    switch (room) {
      case 'gallery':
        return (
          <GalleryRoom
            paint={paint}
            flipped={flipped}
            onFlip={setFlipped}
            onSelect={setSelectedProject}
            onActive={setActiveProject}
            command={galleryCmd}
          />
        );
      case 'studio':
        return <StudioRoom paint={paint} focused={focused} onFocus={setFocused} />;
      case 'about':
        return <AboutRoom paint={paint} onProgress={setMilestone} />;
      case 'contact':
        return <ContactRoom paint={paint} onPick={pickSocial} />;
    }
  }, [room, paint, flipped, focused, pickSocial, galleryCmd]);

  const screen = focused !== null ? studioScreens[focused] : null;

  return (
    <motion.section
      aria-label={meta.name}
      className="fixed inset-0 z-50"
      style={{ background: meta.bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Canvas
        camera={{
          position: room === 'gallery' ? [0, 0.25, 1.2] : [0, 0.3, 6],
          fov: 55,
          near: 0.1,
          far: 200,
        }}
        dpr={settings.dpr}
        gl={{ antialias: settings.antialias, powerPreference: 'high-performance' }}
        onCreated={({ scene: s }) => {
          s.fog = new THREE.Fog(
            meta.bg,
            room === 'gallery' ? 35 : room === 'about' ? 60 : 14,
            room === 'gallery' ? 95 : room === 'about' ? 140 : 40
          );
        }}
      >
        <color attach="background" args={[meta.bg]} />
        <Suspense fallback={null}>{scene}</Suspense>
      </Canvas>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-4 sm:p-6">
        <button
          onClick={onBack}
          className={
            meta.dark
              ? 'pointer-events-auto flex items-center gap-2 border border-amber-900/50 bg-[#161412]/90 px-4 py-2 font-mono text-xs uppercase tracking-wider text-stone-200 backdrop-blur-md shadow-lg transition hover:border-amber-500/60 hover:text-amber-300 hover:bg-[#25201b]'
              : 'pointer-events-auto btn-ghost !px-4 !py-2 text-sm'
          }
        >
          <ArrowLeft size={15} /> Back to corridor
        </button>
        <div className={`text-right transition-opacity duration-300 ${selectedProject !== null || writing ? 'opacity-0' : 'opacity-100'}`}>
          {!meta.dark && <p className="-rotate-2 font-hand text-xl leading-none text-accent">{room === 'gallery' ? 'selected works' : room === 'contact' ? 'the harbour' : 'the story'}</p>}
          <h2 className={`font-serif text-3xl sm:text-5xl font-semibold tracking-tight ${meta.dark ? 'text-amber-400' : 'text-ink'}`}>{meta.name}</h2>
          <p className={`mt-1.5 hidden text-xs font-medium tracking-wide sm:block ${meta.dark ? 'font-mono uppercase text-amber-200/60' : 'font-sans text-ink-soft'}`}>
            {meta.hint}
          </p>
        </div>
      </header>

      {room === 'about' && (
        <nav aria-label="Story progress" className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {skyMilestones.map((m, i) => (
            <span
              key={m.title}
              title={m.title}
              className={`h-1.5 transition-all duration-300 ${i === milestone ? 'w-7 bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'w-2 bg-stone-700/60'}`}
            />
          ))}
        </nav>
      )}

      <AnimatePresence>
        {screen && (
          <motion.aside
            key={focused}
            className="absolute bottom-0 right-0 top-0 z-20 flex w-full items-end p-4 sm:w-[420px] sm:items-center sm:p-8"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.35 } }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
          >
            <article className="max-h-[70vh] w-full overflow-y-auto border-gold-glow hud-backdrop bg-[#161412]/95 p-6 shadow-hud text-stone-200">
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
                  {screen.kind === 'experience' ? 'Experience' : 'Discipline'} · {screen.eyebrow}
                </p>
                <button
                  aria-label="Close details"
                  onClick={() => setFocused(null)}
                  className="w-7 h-7 border border-amber-900/50 bg-[#18191e]/80 flex items-center justify-center text-stone-400 hover:text-amber-200 hover:border-amber-400 transition"
                >
                  <X size={14} />
                </button>
              </div>
              <h3 className="mt-2 font-serif text-3xl font-normal leading-tight text-cave-chalk">{screen.title}</h3>
              {screen.kind === 'experience' ? (
                <ul className="mt-4 space-y-2 border-l-2 border-amber-500/40 pl-3">
                  {screen.lines.map((l) => (
                    <li key={l} className="font-serif text-sm leading-relaxed text-stone-300">{l}</li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {screen.lines.map((l) => (
                    <li key={l} className="border border-amber-900/40 bg-[#18191e] text-amber-200/90 text-xs px-2.5 py-1 font-mono">{l}</li>
                  ))}
                </ul>
              )}
            </article>
          </motion.aside>
        )}
      </AnimatePresence>

      {room === 'gallery' && (
        <>
          <GalleryNav
            active={activeProject}
            hidden={selectedProject !== null}
            onGo={(i) => sendGallery('go', i)}
            onOpen={(i) => sendGallery('open', i)}
          />
          <GalleryDossier
            index={selectedProject}
            onClose={() => {
              setSelectedProject(null);
              setFlipped(null);
            }}
            onStep={(i) => sendGallery('open', i)}
          />
        </>
      )}

      {room === 'contact' && <ContactCard hidden={writing} onPick={pickSocial} />}

      <AnimatePresence>
        {writing && <MessageNote onClose={() => setWriting(false)} />}
      </AnimatePresence>
    </motion.section>
  );
}
