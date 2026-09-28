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

const CorridorExperience = lazy(() => import('./components/CorridorExperience'));

/** True on touch / low-core / small-screen / reduced-motion devices where the 3D corridor is skipped. */
function prefersClassic(): boolean {
  if (typeof window === 'undefined') return true;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smallScreen = window.innerWidth < 820;
  const weakCPU =
    typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
  return reduced || smallScreen || weakCPU;
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
          className="fixed bottom-5 right-5 z-40 btn-primary !py-2.5 !px-5 text-sm shadow-sketch"
        >
          Enter 3D corridor
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

function App() {
  const [mode, setMode] = useState<'loading' | 'corridor' | 'classic'>('loading');
  const [canRun3D, setCanRun3D] = useState(false);

  useEffect(() => {
    const classic = prefersClassic();
    setCanRun3D(!classic);
    const saved = localStorage.getItem('view-mode');
    if (saved === 'classic' || classic) setMode('classic');
    else setMode('corridor');
  }, []);

  const toClassic = () => {
    localStorage.setItem('view-mode', 'classic');
    setMode('classic');
  };
  const toCorridor = () => {
    localStorage.setItem('view-mode', 'corridor');
    setMode('corridor');
  };

  if (mode === 'loading') {
    return <div className="fixed inset-0 bg-paper-100" aria-hidden="true" />;
  }

  if (mode === 'corridor') {
    return (
      <Suspense fallback={<div className="fixed inset-0 bg-paper-100" />}>
        <CorridorExperience onExit={toClassic} />
        <ClassicSiteSeo />
      </Suspense>
    );
  }

  return <ClassicSite onEnter3D={canRun3D ? toCorridor : null} />;
}

export default App;
