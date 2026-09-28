export type PerfTier = 'HIGH' | 'MEDIUM' | 'LOW';

export type TierSettings = {
  dpr: [number, number];
  antialias: boolean;
  postFx: boolean;
  particleScale: number;
};

const SETTINGS: Record<PerfTier, TierSettings> = {
  HIGH: { dpr: [1, 1.5], antialias: true, postFx: true, particleScale: 0.8 },
  MEDIUM: { dpr: [1, 1.25], antialias: true, postFx: true, particleScale: 0.5 },
  LOW: { dpr: [0.85, 1], antialias: false, postFx: false, particleScale: 0.2 },
};

/** Detect a starting performance tier from device capabilities. */
export function detectTier(): PerfTier {
  if (typeof navigator === 'undefined') return 'HIGH';

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;

  let tier: PerfTier = 'HIGH';
  if (isMobile) tier = 'MEDIUM';
  if (cores <= 4) tier = isMobile ? 'LOW' : 'MEDIUM';
  if (typeof mem === 'number' && mem <= 4) tier = 'LOW';
  return tier;
}

/** Return the render settings for a given tier. */
export function settingsFor(tier: PerfTier): TierSettings {
  return SETTINGS[tier];
}

/** One-step-lower tier, used for live FPS downgrades. */
export function lowerTier(tier: PerfTier): PerfTier {
  if (tier === 'HIGH') return 'MEDIUM';
  return 'LOW';
}
