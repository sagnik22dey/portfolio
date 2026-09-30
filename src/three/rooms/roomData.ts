import { projects, skills, experiences, personal, about } from '../../data/portfolio';

export type GalleryItem = {
  title: string;
  tagline: string;
  category: string;
  period: string;
  description: string;
  tech: string[];
  accent: string;
  link?: string;
  live?: string;
  github?: string;
  highlights: string[];
  featured?: boolean;
  image?: string;
};

const GALLERY_ACCENTS = ['#c2410c', '#a8563a', '#6b7c5f', '#b08b3e'];

export const galleryItems: GalleryItem[] = projects.map((p, i) => ({
  title: p.title,
  tagline: p.tagline,
  category: p.category,
  period: p.period,
  description: p.description,
  tech: p.tech,
  accent: GALLERY_ACCENTS[i % GALLERY_ACCENTS.length],
  link: p.link ?? p.github,
  live: p.link,
  github: p.github,
  highlights: p.highlights,
  featured: p.featured,
  image: p.image,
}));

export type StudioScreen = {
  kind: 'skill' | 'experience';
  eyebrow: string;
  title: string;
  lines: string[];
  accent: string;
  link?: string;
};

const STUDIO_ACCENTS = ['#c2410c', '#6b7c5f', '#a8563a', '#b08b3e'];

/** Studio = Skills + Experience, each surfaced as a glowing monitor screen. */
export const studioScreens: StudioScreen[] = [
  ...experiences.map((e, i) => ({
    kind: 'experience' as const,
    eyebrow: `${e.period}`,
    title: `${e.role} · ${e.company}`,
    lines: e.achievements.slice(0, 4),
    accent: STUDIO_ACCENTS[i % STUDIO_ACCENTS.length],
  })),
  ...skills.map((s, i) => ({
    kind: 'skill' as const,
    eyebrow: `${s.skills.length} tools`,
    title: s.title,
    lines: s.skills,
    accent: STUDIO_ACCENTS[(i + 1) % STUDIO_ACCENTS.length],
  })),
];

export type SkyMilestone = {
  tag: string;
  title: string;
  body: string;
  accent: string;
};

export const skyMilestones: SkyMilestone[] = [
  { tag: 'Who', title: personal.name, body: personal.title + ' — ' + personal.location, accent: '#c2410c' },
  { tag: 'Story', title: 'From SDET to AI-Full-Stack', body: about.bio.split('\n\n')[0], accent: '#6b7c5f' },
  { tag: 'Craft', title: 'Full-stack × AI/ML', body: about.bio.split('\n\n')[1] ?? '', accent: '#a8563a' },
  ...about.stats.map((s) => ({
    tag: 'By the numbers',
    title: `${s.value} ${s.label}`,
    body: '',
    accent: '#b08b3e',
  })),
  { tag: 'Off the clock', title: 'Ambivert · anime lover', body: about.bio.split('\n\n')[2] ?? '', accent: '#c2410c' },
];

export type SocialLink = {
  label: string;
  url: string;
  accent: string;
};

export const socialLinks: SocialLink[] = [
  { label: 'EMAIL', url: `mailto:${personal.email}`, accent: '#c2410c' },
  { label: 'LINKEDIN', url: personal.linkedin, accent: '#6b7c5f' },
  { label: 'GITHUB', url: personal.github, accent: '#a8563a' },
  { label: 'INSTAGRAM', url: personal.instagram, accent: '#b08b3e' },
  { label: 'RESUME', url: personal.resumeUrl, accent: '#c2410c' },
];

export { personal, about };
