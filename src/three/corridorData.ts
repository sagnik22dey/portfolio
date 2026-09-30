import { projects, skills, personal, about, experiences } from '../data/portfolio';

export type RoomId = 'about' | 'gallery' | 'studio' | 'contact';

export type Bay = {
  id: string;
  side: 'left' | 'right';
  kind: 'room' | 'gallery';
  title: string;
  subtitle: string;
  accent: string;
  roomId: RoomId;
};

export const bays: Bay[] = [
  {
    id: 'about',
    side: 'left',
    kind: 'room',
    title: 'About',
    subtitle: personal.title,
    accent: '#c2410c',
    roomId: 'about',
  },
  {
    id: 'projects',
    side: 'right',
    kind: 'gallery',
    title: 'The Gallery',
    subtitle: `${projects.length} projects`,
    accent: '#a8563a',
    roomId: 'gallery',
  },
  {
    id: 'studio',
    side: 'left',
    kind: 'room',
    title: 'The Studio',
    subtitle: `${skills.length} disciplines · ${experiences.length} roles`,
    accent: '#6b7c5f',
    roomId: 'studio',
  },
  {
    id: 'contact',
    side: 'right',
    kind: 'room',
    title: 'Contact',
    subtitle: "Let's build",
    accent: '#c2410c',
    roomId: 'contact',
  },
];

export const BAY_SPACING = 8;
export const CORRIDOR_START_Z = 6;
export const corridorEndZ = CORRIDOR_START_Z - (bays.length + 1) * BAY_SPACING;

/** Absolute Z position of a bay by its index in the corridor. */
export function bayZ(index: number): number {
  return CORRIDOR_START_Z - (index + 1) * BAY_SPACING;
}

export { projects, skills, personal, about, experiences };
