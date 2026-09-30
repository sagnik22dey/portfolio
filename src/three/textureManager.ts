import * as THREE from 'three';

const textureCache = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();

export type PreloadItem = {
  url: string;
  label: string;
};

export const ALL_PRELOAD_ITEMS: PreloadItem[] = [
  { url: '/images/profile_image.webp', label: 'Craftsman Portrait' },
  { url: '/images/sketches/gallery_corridor.webp', label: 'Subterranean Corridor Codex' },
  { url: '/images/sketches/frostbite.webp', label: 'Frostbite Vitruvian Engine' },
  { url: '/images/sketches/blind_assist.webp', label: 'Acoustic Blind Assist Study' },
  { url: '/images/sketches/shorts_automation.webp', label: 'Kinetic Video Automata' },
  { url: '/images/sketches/pricely.webp', label: 'Merchant Price Comparison Ledger' },
  { url: '/images/sketches/korebi_coffee.webp', label: 'Korebi Botanical Roastery' },
  { url: '/images/sketches/surobahare.webp', label: 'Surobahare Harmonic Resonance' },
  { url: '/images/sketches/saku_global.webp', label: 'Saku Global Overland Caravans' },
  { url: '/images/sketches/fitsmate.webp', label: 'Fitsmate Anthropometric Forge' },
  { url: '/images/sketches/bol_lms.webp', label: 'Renaissance Academy Library' },
  { url: '/images/sketches/roasguy.webp', label: 'Printing Press & Commerce Herald' },
  { url: '/images/sketches/cms.webp', label: 'Palace Facade Architectural Draught' },
  { url: '/images/sketches/decision_algo.webp', label: 'Binary Decision Gearwork Matrix' },
  { url: '/images/sketches/medconscious.webp', label: 'Cardiovascular Pulse Rhythm Study' },
];

/** Retrieve a cached texture or load it with optimal color space, 16x anisotropy, and crisp filtering. */
export function getCachedTexture(url: string): THREE.Texture {
  const cached = textureCache.get(url);
  if (cached) return cached;

  const tex = loader.load(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  textureCache.set(url, tex);
  return tex;
}

/** Preload all heavy 3D assets and report progress to the preloader. */
export function preloadAllThreeAssets(
  onProgress: (percentage: number, label: string) => void
): Promise<void> {
  return new Promise((resolve) => {
    let completed = 0;
    const total = ALL_PRELOAD_ITEMS.length + 1;

    const notify = (label: string) => {
      completed++;
      const pct = Math.round((completed / total) * 100);
      onProgress(pct, label);
      if (completed >= total) {
        resolve();
      }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready
        .then(() => notify('Typography & Calligraphic Fonts'))
        .catch(() => notify('Typography & Calligraphic Fonts'));
    } else {
      notify('Typography & Calligraphic Fonts');
    }

    ALL_PRELOAD_ITEMS.forEach((item) => {
      loader.load(
        item.url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4;
          textureCache.set(item.url, tex);
          notify(item.label);
        },
        undefined,
        () => {
          notify(item.label);
        }
      );
    });
  });
}
