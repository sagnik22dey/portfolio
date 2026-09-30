export type StopId = 'welcome' | 'about' | 'projects' | 'studio' | 'contact';

export type Stop = {
  id: StopId;
  label: string;
  focus: [number, number, number];
  offset: [number, number, number];
};

export const stops: Stop[] = [
  { id: 'welcome', label: 'Welcome', focus: [4, 0, -24], offset: [-6, 16, 40] },
  { id: 'about', label: 'About', focus: [0, 1, 0], offset: [0, 3.2, 10] },
  { id: 'projects', label: 'Projects', focus: [15, 2.2, -16], offset: [-1.5, 3, 10] },
  { id: 'studio', label: 'Studio', focus: [-3, 0.6, -33], offset: [1.5, 3.4, 10] },
  { id: 'contact', label: 'Contact', focus: [13, 1.6, -49], offset: [-1, 3.2, 10] },
];

export type IslandKind = 'about' | 'projects' | 'studio' | 'contact';

export type IslandDef = {
  kind: IslandKind;
  stopIndex: number;
  position: [number, number, number];
  radius: number;
  seed: number;
};

export const islands: IslandDef[] = [
  { kind: 'about', stopIndex: 1, position: [0, 0, 0], radius: 3, seed: 11 },
  { kind: 'projects', stopIndex: 2, position: [15, 1.2, -16], radius: 3.4, seed: 23 },
  { kind: 'studio', stopIndex: 3, position: [-3, -0.4, -33], radius: 3.1, seed: 37 },
  { kind: 'contact', stopIndex: 4, position: [13, 0.6, -49], radius: 3, seed: 51 },
];

export const islets: { position: [number, number, number]; radius: number; seed: number }[] = [
  { position: [-9, 3, -8], radius: 0.9, seed: 3 },
  { position: [7, -3.5, -6], radius: 0.6, seed: 5 },
  { position: [24, 4, -28], radius: 1.1, seed: 7 },
  { position: [5, -2, -26], radius: 0.7, seed: 9 },
  { position: [-12, 2.5, -42], radius: 1, seed: 13 },
  { position: [22, -2.5, -58], radius: 0.8, seed: 17 },
  { position: [2, 5, -56], radius: 0.6, seed: 19 },
];

/** Thumbnail path for a project's sketch (512px copy in /images/thumbs). */
export function thumbFor(image?: string): string | null {
  return image ? image.replace('/images/sketches/', '/images/thumbs/') : null;
}

/** Deterministic pseudo-random generator so the islands fold the same way on every load. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
