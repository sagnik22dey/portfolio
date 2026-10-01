import { about, education, experiences, personal, projects, skills, type Project } from '../data/portfolio';

export type Section = 'about' | 'skills' | 'experience' | 'projects' | 'education' | 'contact';
export type NavTarget = { section: Section; project?: number };
export type Reply = {
  text: string;
  bullets?: string[];
  links?: { label: string; href: string }[];
  actions?: { label: string; nav: NavTarget }[];
  suggestions?: string[];
};

const NAME = personal.name.split(' ')[0];

const DEFAULT_SUGGESTIONS = ['Summarize Sagnik', 'Top projects', 'Tech stack', 'How to contact him'];

const PRIVATE: { re: RegExp; topic: string }[] = [
  { re: /\b(bank|ifsc|iban|swift|account (no|number|details)|a\/c|upi|paytm|gpay|credit card|debit card|card number|cvv)\b/, topic: 'banking or payment details' },
  { re: /\b(password|passcode|otp|pin|login|credentials?|api ?key|secret|token)\b/, topic: 'passwords, keys or credentials' },
  { re: /\b(aadhaa?r|pan( card| number)?|passport|ssn|social security|voter id|driving licen[cs]e|government id)\b/, topic: 'government ID numbers' },
  { re: /\b(phone|mobile|cell|whatsapp|contact) ?(no|number|num)\b|\bcall (him|sagnik)\b|\bhis number\b/, topic: 'a phone number' },
  { re: /\b(home|house|street|residential|exact|full|postal) address\b|\bwhere (exactly )?does he (live|stay)\b|\bpin ?code\b/, topic: 'a home address' },
  { re: /\b(salary|ctc|package|income|net ?worth|how much (does he|he) (earn|make)|earnings|pay ?slip)\b/, topic: 'salary or finances' },
  { re: /\b(date of birth|dob|birthday|how old|his age|age of)\b/, topic: 'his date of birth or age' },
  { re: /\b(girlfriend|wife|married|marital|relationship|dating|single|crush|family members?|parents|father|mother)\b/, topic: 'his personal relationships or family' },
  { re: /\b(religion|caste|political|politics|vote|medical|health condition|disease|blood group)\b/, topic: 'sensitive personal details' },
];

const TECH_ALIASES: Record<string, string> = {
  golang: 'Go',
  'go lang': 'Go',
  js: 'JavaScript',
  ts: 'TypeScript',
  node: 'Node.js',
  nodejs: 'Node.js',
  'node js': 'Node.js',
  postgres: 'PostgreSQL',
  nextjs: 'Next.js',
  'next js': 'Next.js',
  reactjs: 'React',
  'react js': 'React',
  rn: 'React Native',
  tailwindcss: 'Tailwind CSS',
  tailwind: 'Tailwind CSS',
  yolo: 'YOLOv5',
  llm: 'LLMs',
  llms: 'LLMs',
  'large language model': 'LLMs',
  openai: 'LLMs (OpenAI, Gemini)',
  gemini: 'LLMs (OpenAI, Gemini)',
  rag: 'RAG Pipelines',
  cv: 'Computer Vision',
  'computer vision': 'Computer Vision',
  s3: 'AWS S3',
  aws: 'AWS S3',
  wdio: 'WebDriverIO',
  webdriver: 'WebDriverIO',
  bdd: 'Cucumber (BDD)',
  cucumber: 'Cucumber (BDD)',
  ffmpeg: 'FFmpeg',
  odoo: 'Odoo 19',
  'ci cd': 'CI/CD',
  cicd: 'CI/CD',
  docker: 'Docker',
  mongo: 'MongoDB',
};

const PROJECT_ALIASES: Record<string, string[]> = {
  FROSTBITE: ['frostbyte', 'llm gateway', 'gateway'],
  'YouTube Shorts Automation': ['youtube', 'shorts', 'video pipeline'],
  'Korebi Coffee — Odoo ERP': ['korebi', 'odoo', 'erp', 'fship'],
  'BOL-LMS': ['bol lms', 'lms', 'learning management'],
  Surobahare: ['surobahare', 'academy'],
  'Saku Global': ['saku'],
  RoasGuy: ['roasguy', 'roas guy'],
  'Brands Out Loud': ['brands out loud', 'flipbook'],
  FitsMate: ['fitsmate', 'fitmates', 'fitness'],
  CMS: ['cms', 'client management'],
  Pricely: ['pricely', 'price comparison', 'quick commerce'],
  'The Blind Assist': ['blind assist', 'blind', 'currency detection', 'visually impaired'],
  DecisionAlgo: ['decisionalgo', 'decision algo', 'decision tree'],
  MedConscious: ['medconscious', 'med conscious', 'health tech'],
};

/** Lowercases and strips punctuation so phrases can be matched on word boundaries. */
function norm(s: string): string {
  return ` ${s.toLowerCase().replace(/[—–]/g, ' ').replace(/[^a-z0-9+#./ ]+/g, ' ').replace(/[./](?=\s|$)/g, ' ').replace(/\s+/g, ' ').trim()} `;
}

/** True when the normalized query contains the phrase as whole words. */
function has(q: string, phrase: string): boolean {
  return q.includes(norm(phrase));
}

/** True when any of the regexes match the raw lowercase query. */
function any(q: string, ...res: RegExp[]): boolean {
  return res.some((r) => r.test(q));
}

const allTech: string[] = Array.from(
  new Set([
    ...skills.flatMap((s) => s.skills),
    ...projects.flatMap((p) => p.tech),
    ...experiences.flatMap((e) => e.tech),
  ]),
);

const AMBIGUOUS_TECH = new Set(['go', 'auth', 'frontend', 'algorithms', 'dashboards', 'analytics', 'health tech', 'html/css', 'model evaluation', 'web redesign', 'data structures', 'dashboard design']);

/** Finds canonical tech names mentioned in the question. */
function findTech(q: string): string[] {
  const found = new Set<string>();
  for (const [alias, canon] of Object.entries(TECH_ALIASES)) if (has(q, alias)) found.add(canon);
  for (const t of allTech) {
    const key = t.toLowerCase();
    if (AMBIGUOUS_TECH.has(key)) continue;
    const base = key.replace(/\s*\(.*\)/, '');
    if (has(q, base)) found.add(t);
  }
  const list = [...found];
  return list.filter((t) => !list.some((o) => o !== t && o.toLowerCase().includes(t.toLowerCase()) && has(q, o.replace(/\s*\(.*\)/, ''))));
}

/** Finds projects referenced by name or alias. */
function findProjects(q: string): number[] {
  const hits: number[] = [];
  projects.forEach((p, i) => {
    const names = [p.title, ...(PROJECT_ALIASES[p.title] ?? [])];
    if (names.some((n) => has(q, n))) hits.push(i);
  });
  return hits;
}

/** Case-insensitive check whether a project lists or describes a tech. */
function projectUses(p: Project, tech: string): boolean {
  const t = tech.toLowerCase().replace(/\s*\(.*\)/, '');
  return p.tech.some((x) => x.toLowerCase().includes(t) || t.includes(x.toLowerCase())) || norm(p.description).includes(norm(t));
}

/** Where a tech appears in the listed skills, by category title. */
function skillCategoryOf(tech: string): string | null {
  const t = tech.toLowerCase();
  const cat = skills.find((s) => s.skills.some((k) => k.toLowerCase() === t));
  return cat ? cat.title : null;
}

/** Resource links for one project. */
function projectLinks(p: Project): Reply['links'] {
  const out: NonNullable<Reply['links']> = [];
  if (p.link) out.push({ label: 'Live site', href: p.link });
  if (p.github) out.push({ label: `${p.title} on GitHub`, href: p.github });
  return out;
}

const contactLinks = [
  { label: `Email ${personal.email}`, href: `mailto:${personal.email}` },
  { label: 'LinkedIn', href: personal.linkedin },
  { label: 'GitHub', href: personal.github },
];

/** Builds a detailed answer about a single project. */
function projectReply(i: number): Reply {
  const p = projects[i];
  return {
    text: `${p.title}: ${p.tagline} (${p.period}, ${p.category}${p.team ? ', team project' : ''}). ${p.description}`,
    bullets: [...p.highlights.slice(0, 3), `Stack: ${p.tech.join(', ')}`],
    links: projectLinks(p),
    actions: [{ label: `Show ${p.title}`, nav: { section: 'projects', project: i } }],
    suggestions: ['Other flagship projects', 'Tech stack', 'How to contact him'],
  };
}

/** Answers "does he know X" / "projects with X" using only listed data. */
function techReply(tech: string[]): Reply {
  const lines: string[] = [];
  const used = new Set<number>();
  for (const t of tech) {
    const cat = skillCategoryOf(t);
    const ps = projects.map((p, i) => [p, i] as const).filter(([p]) => projectUses(p, t));
    ps.forEach(([, i]) => used.add(i));
    const jobs = experiences.filter((e) => e.tech.some((x) => x.toLowerCase() === t.toLowerCase()));
    const parts: string[] = [];
    if (cat) parts.push(`listed under ${cat} skills`);
    if (jobs.length) parts.push(`used at ${jobs[0].company}`);
    if (ps.length) parts.push(`used in ${ps.map(([p]) => p.title).join(', ')}`);
    lines.push(parts.length ? `${t}: ${parts.join('; ')}.` : `${t}: mentioned in his work, but no specific project is listed.`);
  }
  const first = [...used][0];
  return {
    text: `Yes, here's where that shows up in ${NAME}'s work:`,
    bullets: lines,
    links: [...used].slice(0, 3).flatMap((i) => projectLinks(projects[i]) ?? []),
    actions: first !== undefined ? [{ label: `Open ${projects[first].title}`, nav: { section: 'projects', project: first } }, { label: 'See all skills', nav: { section: 'skills' } }] : [{ label: 'See all skills', nav: { section: 'skills' } }],
    suggestions: ['Top projects', 'Work experience'],
  };
}

const featured = projects.map((p, i) => [p, i] as const).filter(([p]) => p.featured);

const intents: { test: (q: string, raw: string) => boolean; reply: () => Reply }[] = [
  {
    test: (_q, raw) => any(raw, /\b(who|what) are you\b|\byour name\b|\bare you (a )?(bot|ai|human|real)\b|\bwhat can you do\b|\bhelp\b/),
    reply: () => ({
      text: `I'm Hoshi, ${NAME}'s little star-spirit guide. I can only answer from what's published on this portfolio: his background, skills, projects, experience, education and how to reach him. If something isn't on record, I'll say so instead of guessing.`,
      suggestions: DEFAULT_SUGGESTIONS,
    }),
  },
  {
    test: (_q, raw) => any(raw, /\b(contact|reach|email|mail|connect|get in touch|message him|talk to him|linkedin|socials?|instagram)\b/),
    reply: () => ({
      text: `The best way to reach ${NAME} is email: ${personal.email}. He's also on LinkedIn, GitHub and Instagram.`,
      links: [...contactLinks, { label: 'Instagram', href: personal.instagram }],
      actions: [{ label: 'Go to Contact', nav: { section: 'contact' } }],
      suggestions: ['Is he available for work?', 'Download resume'],
    }),
  },
  {
    test: (_q, raw) => any(raw, /\b(hire|hiring|available|availability|open to|freelanc\w*|job|role|opportunit\w*|recruit\w*|work with him|collaborat\w*)\b/),
    reply: () => ({
      text: `${personal.availability}. He also takes freelance work. Email is the quickest way to start a conversation.`,
      links: [contactLinks[0], contactLinks[1], { label: 'Resume (PDF)', href: personal.resumeUrl }],
      actions: [{ label: 'Go to Contact', nav: { section: 'contact' } }],
      suggestions: ['Summarize Sagnik', 'Top projects'],
    }),
  },
  {
    test: (_q, raw) => any(raw, /\b(resume|cv|curriculum vitae)\b/),
    reply: () => ({
      text: `You can download ${NAME}'s resume as a PDF.`,
      links: [{ label: 'Resume (PDF)', href: personal.resumeUrl }],
      suggestions: ['Work experience', 'Education'],
    }),
  },
  {
    test: (_q, raw) => any(raw, /\b(experience|work(ed|s|ing)? (at|for)|job history|career|company|employer|cognizant|sdet|current(ly)? (job|role|work)|where does he work|years)\b/),
    reply: () => ({
      text: `${NAME} has ${about.stats[0].value} years of experience. ${experiences[0].description}`,
      bullets: experiences.map((e) => `${e.role}, ${e.company} (${e.period})`).concat(experiences[0].achievements.slice(0, 2)),
      actions: [{ label: 'See experience', nav: { section: 'experience' } }],
      suggestions: ['Tech stack', 'Top projects'],
    }),
  },
  {
    test: (_q, raw) => any(raw, /\b(education|degree|college|university|study|studied|b\.?tech|mba|qualification)\b/),
    reply: () => ({
      text: `${NAME}'s education:`,
      bullets: education.map((e) => `${e.degree}, ${e.institution} (${e.affiliation}), ${e.period}`),
      actions: [{ label: 'See education', nav: { section: 'education' } }],
      suggestions: ['Work experience', 'Summarize Sagnik'],
    }),
  },
  {
    test: (_q, raw) => any(raw, /\b(skills?|stack|tech(nolog\w*)?|languages?|frameworks?|tools?|good at|expertise|strengths?)\b/),
    reply: () => ({
      text: `${NAME}'s listed skills by area:`,
      bullets: skills.map((s) => `${s.title}: ${s.skills.join(', ')}`),
      actions: [{ label: 'See skills', nav: { section: 'skills' } }],
      suggestions: ['Does he know Rust?', 'Projects using FastAPI'],
    }),
  },
  {
    test: (_q, raw) => any(raw, /\b(projects?|portfolio|built|build|made|work samples?|apps?|flagship|best work|github)\b/),
    reply: () => ({
      text: `${NAME} has ${projects.length} projects listed. The flagship ones:`,
      bullets: featured.map(([p]) => `${p.title}: ${p.tagline}`),
      links: [...featured.flatMap(([p]) => projectLinks(p) ?? []), { label: 'All repos on GitHub', href: personal.github }],
      actions: [{ label: 'Browse projects', nav: { section: 'projects' } }],
      suggestions: featured.map(([p]) => `Tell me about ${p.title}`).slice(0, 3),
    }),
  },
  {
    test: (_q, raw) => any(raw, /\b(where|location|based|city|country|from)\b/),
    reply: () => ({
      text: `${NAME} is based in ${personal.location}. That's all the location info that's public.`,
      suggestions: ['How to contact him', 'Is he available for work?'],
    }),
  },
  {
    test: (_q, raw) => any(raw, /\b(hobb\w*|fun|free time|interests?|anime|personality|outside work|like to do)\b/),
    reply: () => ({
      text: `Off the clock, ${NAME} describes himself as an ambivert and an unapologetic anime lover who codes for the joy of building things that feel alive.`,
      suggestions: ['Summarize Sagnik', 'Top projects'],
    }),
  },
  {
    test: (_q, raw) => any(raw, /\b(summar\w*|about|who is|tell me about (him|sagnik)|introduce|overview|bio|background|profile)\b/),
    reply: () => ({
      text: `${personal.name} is an ${personal.title} in ${personal.location}. ${personal.subtitle}`,
      bullets: about.stats.map((s) => `${s.value} ${s.label.toLowerCase()}`),
      links: [{ label: 'Resume (PDF)', href: personal.resumeUrl }, contactLinks[1]],
      actions: [{ label: 'Read About', nav: { section: 'about' } }],
      suggestions: ['Top projects', 'Work experience', 'Tech stack'],
    }),
  },
];

/** Answers a visitor question strictly from portfolio data; never fabricates. */
export function answer(input: string): Reply {
  const raw = input.toLowerCase().trim();
  const q = norm(input);
  if (!raw) return { text: 'Ask me anything about Sagnik: his work, skills or how to reach him.', suggestions: DEFAULT_SUGGESTIONS };

  const priv = PRIVATE.find((p) => p.re.test(raw));
  if (priv) {
    return {
      text: `Sorry, I don't share ${priv.topic}. I don't have that information, and I won't guess or make it up. For anything legitimate, please email ${NAME} directly.`,
      links: [contactLinks[0]],
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  if (/^(hi+|hey+|hello+|yo|hola|namaste|sup|good (morning|afternoon|evening))\b[\s!.?]*$/.test(raw)) {
    return { text: `Hey there! I'm Hoshi. Ask me about ${NAME}'s projects, skills, experience or how to contact him.`, suggestions: DEFAULT_SUGGESTIONS };
  }
  if (/^(thanks|thank you|thx|ty|cool|great|nice|awesome|ok(ay)?)\b/.test(raw)) {
    return { text: 'Happy to help! Anything else you want to know?', suggestions: DEFAULT_SUGGESTIONS };
  }

  const ps = findProjects(q);
  if (ps.length === 1) return projectReply(ps[0]);
  if (ps.length > 1) {
    return {
      text: 'I found a few matching projects:',
      bullets: ps.map((i) => `${projects[i].title}: ${projects[i].tagline}`),
      suggestions: ps.slice(0, 3).map((i) => `Tell me about ${projects[i].title}`),
    };
  }

  const tech = findTech(q);
  if (tech.length) return techReply(tech);

  const unknownTech = raw.match(/\b(?:know|knows|use|uses|used|worked with|work with|experience (?:in|with)|familiar with|skilled in|proficient in|projects? (?:in|with|using))\s+([a-z0-9.+# -]{2,30}?)\s*\??$/);
  if (unknownTech) {
    const term = unknownTech[1].trim();
    const exact = allTech.find((t) => t.toLowerCase() === term);
    if (exact) return techReply([exact]);
    return {
      text: `I don't see "${term}" in ${NAME}'s listed skills or projects, so I can't confirm it. I'd rather not guess. You can ask him directly.`,
      links: [contactLinks[0]],
      actions: [{ label: 'See listed skills', nav: { section: 'skills' } }],
      suggestions: ['Tech stack', 'Top projects'],
    };
  }

  const hit = intents.find((i) => i.test(q, raw));
  if (hit) return hit.reply();

  return {
    text: `I don't have information on that. I only know what's on ${NAME}'s portfolio (background, skills, projects, experience, education, contact), and I won't make things up. Try one of these, or email him directly:`,
    links: [contactLinks[0]],
    suggestions: DEFAULT_SUGGESTIONS,
  };
}

export const greeting: Reply = {
  text: `Hi! I'm Hoshi, ${NAME}'s portfolio guide. I can summarize his work, point you to projects and share his public links.`,
  suggestions: DEFAULT_SUGGESTIONS,
};
