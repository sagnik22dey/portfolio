export type PerfTier = 'HIGH' | 'MEDIUM' | 'LOW';

export type TierSettings = {
  dpr: [number, number];
  antialias: boolean;
  clouds: number;
  planes: number;
  islets: number;
};

const SETTINGS: Record<PerfTier, TierSettings> = {
  HIGH: { dpr: [1, 1.75], antialias: true, clouds: 26, planes: 6, islets: 7 },
  MEDIUM: { dpr: [1, 1.4], antialias: true, clouds: 16, planes: 4, islets: 5 },
  LOW: { dpr: [0.8, 1], antialias: false, clouds: 9, planes: 2, islets: 3 },
};

/** True for phones and tablets, including iPadOS which reports a desktop user agent. */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod|Android|Mobile/i.test(ua)) return true;
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
}

/** Detect a starting performance tier from device capabilities. */
export function detectTier(): PerfTier {
  if (typeof navigator === 'undefined') return 'HIGH';
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const lowMem = typeof mem === 'number' && mem <= 4;
  if (isMobileDevice()) return lowMem || cores <= 4 ? 'LOW' : 'MEDIUM';
  return lowMem || cores <= 4 ? 'MEDIUM' : 'HIGH';
}

/** Return the render settings for a given tier. */
export function settingsFor(tier: PerfTier): TierSettings {
  return SETTINGS[tier];
}

/** One-step-lower tier, used for live FPS downgrades. */
export function lowerTier(tier: PerfTier): PerfTier {
  return tier === 'HIGH' ? 'MEDIUM' : 'LOW';
}

/** True when the browser can create a WebGL context at all. */
export function hasWebGL(): boolean {
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
