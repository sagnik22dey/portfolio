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
import type { NavTarget } from './assistant/engine';

const ArchipelagoExperience = lazy(() => import('./archipelago/ArchipelagoExperience'));
const Assistant = lazy(() => import('./assistant/Assistant'));

/** Smooth-scrolls the classic page to the section the assistant points at. */
function scrollToSection(t: NavTarget) {
  document.getElementById(t.section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const BOOT_FLAG = 'arch-booting';
const FAIL_FLAG = 'arch-failed';

/** True when the 3D view should not auto-start: reduced motion or a previous 3D boot crashed the tab. */
function prefersClassic(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  if (sessionStorage.getItem(FAIL_FLAG)) return true;
  if (localStorage.getItem(BOOT_FLAG)) {
    localStorage.removeItem(BOOT_FLAG);
    sessionStorage.setItem(FAIL_FLAG, '1');
    return true;
  }
  return false;
}

/** True when the browser can create a WebGL context at all. */
function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    return false;
  }
  return true;
}

function ClassicSite({ onEnter3D }: { onEnter3D: (() => void) | null }) {
  useSmoothScroll();
  return (
    <div className="relative min-h-screen">
      <BackgroundEffects />
      <Navbar onEnter3D={onEnter3D} />
      {onEnter3D && (
        <button
          onClick={onEnter3D}
          aria-label="Back to the clouds: open the 3D islands view"
          className="btn-primary fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-[60] !px-5 !py-2.5 text-sm shadow-sketch sm:right-5"
        >
          <span aria-hidden="true">☁</span> Back to the clouds
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
      <Suspense fallback={null}>
        <Assistant onNavigate={scrollToSection} />
      </Suspense>
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
  const webgl = supportsWebGL();
  const classic = !webgl || prefersClassic();
  const saved = localStorage.getItem('view-mode');
  return { mode: saved === 'classic' || classic ? 'classic' : 'corridor', canRun3D: webgl };
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
    sessionStorage.removeItem(FAIL_FLAG);
    window.scrollTo(0, 0);
    setMode('corridor');
  };
  const onFail = () => {
    sessionStorage.setItem(FAIL_FLAG, '1');
    localStorage.removeItem(BOOT_FLAG);
    setCanRun3D(supportsWebGL());
    setMode('classic');
  };

  useEffect(() => {
    if (mode !== 'corridor') return;
    localStorage.setItem(BOOT_FLAG, '1');
    const clear = () => localStorage.removeItem(BOOT_FLAG);
    const t = window.setTimeout(clear, 8000);
    window.addEventListener('pagehide', clear);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('pagehide', clear);
      clear();
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
