import { lazy, Suspense, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Education from './components/Education';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackgroundEffects from './components/BackgroundEffects';
import { useSmoothScroll } from './hooks/useSmoothScroll';

const ArchipelagoExperience = lazy(() => import('./archipelago/ArchipelagoExperience'));

const BOOT_FLAG = 'arch-booting';
const FAIL_FLAG = 'arch-failed';

/** True when the 3D view must be skipped: reduced motion, no WebGL, or a previous 3D boot crashed the tab. */
function prefersClassic(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  if (sessionStorage.getItem(FAIL_FLAG)) return true;
  if (localStorage.getItem(BOOT_FLAG)) {
    localStorage.removeItem(BOOT_FLAG);
    sessionStorage.setItem(FAIL_FLAG, '1');
    return true;
  }
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return true;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    return true;
  }
  return false;
}

function ClassicSite({ onEnter3D }: { onEnter3D: (() => void) | null }) {
  useSmoothScroll();
  return (
    <div className="relative min-h-screen">
      <BackgroundEffects />
      <Navbar />
      {onEnter3D && (
        <button
          onClick={onEnter3D}
          className="btn-primary fixed bottom-5 right-5 z-40 !px-5 !py-2.5 text-sm"
        >
          Fly to the islands
        </button>
      )}
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

/** Visually hidden but crawlable copy of the site content for SEO while the corridor is active. */
function ClassicSiteSeo() {
  return (
    <div className="sr-only">
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Education />
      <Contact />
    </div>
  );
}

function initialView(): { mode: 'corridor' | 'classic'; canRun3D: boolean } {
  const classic = prefersClassic();
  const saved = localStorage.getItem('view-mode');
  return { mode: saved === 'classic' || classic ? 'classic' : 'corridor', canRun3D: !classic };
}

function App() {
  const [initial] = useState(initialView);
  const [mode, setMode] = useState<'loading' | 'corridor' | 'classic'>(initial.mode);
  const [canRun3D, setCanRun3D] = useState(initial.canRun3D);

  const toClassic = () => {
    localStorage.setItem('view-mode', 'classic');
    setMode('classic');
  };
  const toCorridor = () => {
    localStorage.setItem('view-mode', 'corridor');
    setMode('corridor');
  };
  const onFail = () => {
    sessionStorage.setItem(FAIL_FLAG, '1');
    localStorage.removeItem(BOOT_FLAG);
    setCanRun3D(false);
    setMode('classic');
  };

  useEffect(() => {
    if (mode !== 'corridor') return;
    localStorage.setItem(BOOT_FLAG, '1');
    const t = window.setTimeout(() => localStorage.removeItem(BOOT_FLAG), 8000);
    return () => {
      window.clearTimeout(t);
      localStorage.removeItem(BOOT_FLAG);
    };
  }, [mode]);

  if (mode === 'loading') {
    return <div className="fixed inset-0 bg-paper-100" aria-hidden="true" />;
  }

  if (mode === 'corridor') {
    return (
      <Suspense fallback={<div className="fixed inset-0 bg-paper-100" />}>
        <ArchipelagoExperience onExit={toClassic} onFail={onFail} />
        <ClassicSiteSeo />
      </Suspense>
    );
  }

  return <ClassicSite onEnter3D={canRun3D ? toCorridor : null} />;
}

export default App;
