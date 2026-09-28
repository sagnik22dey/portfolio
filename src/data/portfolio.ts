import type { LucideIcon } from 'lucide-react';
import {
  Code2,
  Server,
  Brain,
  TestTube2,
  Wrench,
  Database,
} from 'lucide-react';

export const personal = {
  name: 'Sagnik Dey',
  title: 'AI-Augmented Full-Stack Engineer',
  subtitle:
    'Building intelligent, production-grade web apps — React · TypeScript · Python · LLMs · Computer Vision — backed by SDET-grade quality engineering.',
  location: 'Kolkata, India',
  email: 'sagnik22dey@gmail.com',
  linkedin: 'https://www.linkedin.com/in/sagnik-dey-712a4618b',
  github: 'https://github.com/sagnik22dey',
  instagram: 'https://www.instagram.com/sagnikdey007/',
  resumeUrl: '/Sagnik_Dey_Resume.pdf',
  availability: 'Open to Full-Stack, SDET & AI/ML Engineering roles',
};

export const about = {
  bio: `I'm a Software Engineer with 3+ years of experience across the full spectrum of building software — and guaranteeing it works. My roots are in SDET at Cognizant, where I architected scalable WebDriverIO/Selenium automation frameworks. That quality-first foundation is my edge: I ship features AND engineer the systems that prove they're reliable.

Today I work at the intersection of full-stack development and AI/ML — building React/TypeScript apps backed by Python services, wiring in LLMs and computer-vision models (YOLOv5), and turning messy problems (manual price comparison, currency accessibility for the visually impaired, multilingual CMS platforms) into elegant, well-tested software.

Off the clock: an ambivert and unapologetic anime lover who codes for the joy of building things that feel alive.`,
  stats: [
    { label: 'Years of Experience', value: '3+' },
    { label: 'Projects Shipped', value: '10+' },
    { label: 'GitHub Repositories', value: '21' },
    { label: 'Automated Test Cases', value: '2000+' },
  ],
};

export type SkillCategory = {
  title: string;
  icon: LucideIcon;
  color: string;
  skills: string[];
};

export const skills: SkillCategory[] = [
  {
    title: 'Frontend',
    icon: Code2,
    color: 'from-violet-500 to-fuchsia-500',
    skills: ['React', 'React Native', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS'],
  },
  {
    title: 'Backend',
    icon: Server,
    color: 'from-cyan-500 to-blue-500',
    skills: ['Node.js', 'Python', 'Java', 'REST APIs', 'Express', 'Web Scraping'],
  },
  {
    title: 'AI / ML',
    icon: Brain,
    color: 'from-pink-500 to-rose-500',
    skills: [
      'LLMs (OpenAI, Gemini)',
      'LangChain',
      'RAG Pipelines',
      'Computer Vision',
      'YOLOv5',
      'Prompt Engineering',
      'Vector Databases',
    ],
  },
  {
    title: 'Databases',
    icon: Database,
    color: 'from-emerald-500 to-teal-500',
    skills: ['PostgreSQL', 'SQL', 'MongoDB'],
  },
  {
    title: 'Quality Engineering',
    icon: TestTube2,
    color: 'from-amber-500 to-orange-500',
    skills: [
      'Selenium',
      'WebDriverIO',
      'Cucumber (BDD)',
      'TestNG',
      'JUnit',
      'Postman',
      'API Testing',
    ],
  },
  {
    title: 'Tools & Methods',
    icon: Wrench,
    color: 'from-slate-400 to-slate-600',
    skills: ['Git', 'Agile', 'CI/CD', 'VS Code', 'Jira'],
  },
];

export type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  achievements: string[];
  tech: string[];
};

export const experiences: Experience[] = [
  {
    role: 'Software Engineer in Test (SDET)',
    company: 'Cognizant',
    location: 'Kolkata, India',
    period: 'Sep 2023 — Present',
    description:
      'Engineer quality into full-stack products through automation, framework design, and hybrid testing strategies in a fast-paced Agile environment.',
    achievements: [
      'Architected and deployed JavaScript-based WebDriverIO frameworks that automate E2E UI validation across browsers, improving regression coverage significantly.',
      'Designed comprehensive test suites that stabilize releases through consistent regression and sanity cycles.',
      'Combined automated coverage with exploratory testing to surface subtle usability and edge-case defects.',
      'Collaborate cross-functionally with developers to shift quality left, integrating tests directly into CI pipelines.',
    ],
    tech: ['JavaScript', 'WebDriverIO', 'Selenium', 'Java', 'Cucumber', 'REST APIs', 'Git'],
  },
  {
    role: 'SDET Intern',
    company: 'Cognizant',
    location: 'Kolkata, India',
    period: 'May 2023 — Sep 2023',
    description:
      'Intensive hands-on internship focused on modern software testing principles, automation frameworks, and CI-driven development cycles.',
    achievements: [
      'Mastered test case design, execution, and defect reporting workflows within CI environments.',
      'Built foundational automation skills on Selenium + Java with a focus on maintainable, scalable scripts.',
    ],
    tech: ['Selenium', 'Java', 'JUnit', 'TestNG'],
  },
];

export type ProjectCategory =
  | 'AI / ML'
  | 'AI / Computer Vision'
  | 'Backend / Infra'
  | 'Full-Stack Web'
  | 'Full-Stack'
  | 'Frontend / UI';

export type Project = {
  title: string;
  tagline: string;
  period: string;
  description: string;
  highlights: string[];
  tech: string[];
  category: ProjectCategory;
  accent: string;
  featured?: boolean;
  team?: boolean;
  link?: string;
  github?: string;
  image?: string;
};

export const projects: Project[] = [
  {
    title: 'FROSTBITE',
    tagline: 'Self-hosted LLM gateway & governance platform — in Rust',
    period: '2026',
    category: 'Backend / Infra',
    accent: 'from-sky-500 to-indigo-600',
    featured: true,
    description:
      'A production-grade, OpenAI-compatible LLM gateway built from scratch in Rust — a single-image control plane that proxies, governs, and meters traffic across Anthropic, OpenAI, Gemini and OpenRouter (400+ models) behind one unified API.',
    highlights: [
      'Built the proxy in Axum + SQLx over PostgreSQL with a Next.js 15 admin console served from the same Rust binary.',
      'Implemented virtual API keys, per-key model scoping, and a hierarchical budget system across global → business-unit → team → key.',
      'Engineered a governance rules engine (deny-overrides, priority routing) plus fallback chains with exponential-backoff retries.',
      'Added cost tracking, request logging with a filterable viewer, encrypted provider keys with key-rotation, and a full OpenAPI 3.1 spec.',
    ],
    tech: ['Rust', 'Axum', 'SQLx', 'PostgreSQL', 'Next.js', 'Tailwind', 'Docker', 'Railway'],
    github: 'https://github.com/sagnik22dey/FROSTBYTE',
    image: '/images/sketches/frostbite.webp',
  },
  {
    title: 'YouTube Shorts Automation',
    tagline: 'End-to-end AI video pipeline — story to published Short',
    period: '2026',
    category: 'AI / ML',
    accent: 'from-red-500 to-rose-600',
    featured: true,
    description:
      'A fully automated 6-stage pipeline that turns a trending Reddit post into a finished, captioned YouTube Short — fetching, rewriting with an LLM, narrating, rendering and uploading with zero manual steps.',
    highlights: [
      'Chained Reddit (PRAW) → Cerebras GLM story generation → multi-provider TTS (Groq → ElevenLabs → gTTS fallback).',
      'Rendered 9:16 video from Pexels stock with FFmpeg GPU acceleration (NVENC/QSV auto-detect) and word-synced captions.',
      'Uploaded via the YouTube Data API with an APScheduler auto-scheduler, approval workflow, and resume-on-failure state.',
      'Exposed the whole pipeline through a FastAPI backend + dashboard with real-time progress tracking.',
    ],
    tech: ['Python', 'FastAPI', 'LLMs', 'FFmpeg', 'YouTube API', 'APScheduler', 'Railway'],
    github: 'https://github.com/sagnik22dey/youtubeAutomation',
    image: '/images/sketches/shorts_automation.webp',
  },
  {
    title: 'Korebi Coffee — Odoo ERP',
    tagline: 'Odoo 19 ERP + custom shipping-carrier integration',
    period: '2026',
    category: 'Backend / Infra',
    accent: 'from-amber-600 to-orange-700',
    featured: true,
    team: true,
    description:
      'A freelance Odoo 19 Enterprise deployment for a gourmet coffee brand, centered on a custom-built Fship (FSIB) shipping-carrier module that brings rate, ship, track, cancel and return flows natively into Odoo.',
    highlights: [
      'Authored a custom Odoo delivery-carrier addon integrating 12+ Fship REST endpoints (rate, book, pickup, label, track, cancel, RTO).',
      'Built a kanban shipment pipeline (New → Packed → Ready → Dispatched → Returns) with one-click packing, labeling and dispatch.',
      'Added COD + prepaid support, automatic BlueDart fallback on non-serviceable pincodes, and async label/invoice handling.',
      'Deployed Odoo + PostgreSQL on Railway with persistent filestore; authored 28 mocked tests passing green against the live DB.',
    ],
    tech: ['Odoo 19', 'Python', 'PostgreSQL', 'REST APIs', 'Docker', 'Railway'],
    github: 'https://github.com/avijitbhuin21/korebi_coffee_oodo',
    image: '/images/sketches/korebi_coffee.webp',
  },
  {
    title: 'BOL-LMS',
    tagline: 'Full-stack Learning Management System',
    period: 'Mar 2026 — Apr 2026',
    category: 'Full-Stack Web',
    accent: 'from-blue-500 to-indigo-500',
    description:
      'A scalable Learning Management System with a JavaScript client and a Go backend — supporting course modules, student progress tracking, third-party integrations, notifications and a comments system.',
    highlights: [
      'Built a client/server architecture pairing a JavaScript frontend with a performant Go backend.',
      'Engineered interactive course modules with progress tracking and "mark as completed" flows.',
      'Added third-party integrations, in-app notifications, and a per-lesson comments section.',
      'Deployed on Railway with a documented deploy workflow and accessible, responsive UI.',
    ],
    tech: ['Go', 'JavaScript', 'Node.js', 'REST APIs', 'Railway'],
    github: 'https://github.com/sagnik22dey/BOL-LMS',
    image: '/images/sketches/bol_lms.webp',
  },
  {
    title: 'Surobahare',
    tagline: 'Multilingual academy platform with headless CMS',
    period: '2026',
    category: 'Full-Stack Web',
    accent: 'from-amber-500 to-orange-500',
    description:
      'A full-stack, multilingual platform for a music/arts academy — with a dynamic, database-driven CMS, S3-backed media storage, secure admin authentication, and an end-to-end enrollment flow. Deployed on Railway.',
    highlights: [
      'Built a FastAPI backend with a database-driven content system so the site is fully editable from an admin panel.',
      'Integrated S3 media storage and dynamic site-content management for images, testimonials, and pages.',
      'Implemented session-based admin authentication plus a WhatsApp-integrated enrollment/enquiry flow.',
      'Delivered multilingual frontend templates under a cohesive "heritage luxury" design system.',
    ],
    tech: ['Python', 'FastAPI', 'JavaScript', 'AWS S3', 'HTML/CSS', 'Railway'],
    github: 'https://github.com/sagnik22dey/surobahare',
    image: '/images/sketches/surobahare.webp',
  },
  {
    title: 'Saku Global',
    tagline: 'Application-submission platform with admin console',
    period: '2026',
    category: 'Full-Stack Web',
    accent: 'from-rose-500 to-red-500',
    description:
      'A full-stack application-submission platform with a form-driven intake API, an administrative console for reviewing and managing submissions, CSV export, and automated email confirmation flows. Deployed on Railway.',
    highlights: [
      'Engineered a FastAPI submission API backing a multi-step application form.',
      'Built an admin UI and API endpoints to review, manage, and delete submissions.',
      'Added CSV export for submitted applications and an automated email confirmation flow.',
      'Configured Railway deployment with cache-busting for reliable static asset delivery.',
    ],
    tech: ['Python', 'FastAPI', 'HTML/CSS', 'Email/SMTP', 'Railway'],
    github: 'https://github.com/sagnik22dey/Saku_Global',
    image: '/images/sketches/saku_global.webp',
  },
  {
    title: 'RoasGuy',
    tagline: 'High-conversion marketing site — Dockerized & deployed',
    period: 'Dec 2025 — Apr 2026',
    category: 'Full-Stack Web',
    accent: 'from-orange-500 to-red-500',
    team: true,
    description:
      'A dynamic, high-conversion marketing and landing-page application with a Python backend, multi-page routing, a student curriculum funnel and an integrated payment flow — built pixel-accurate from Figma references.',
    highlights: [
      'Implemented high-fidelity, responsive UI across desktop and mobile directly from Figma mockups.',
      'Built multi-route pages (landing, curriculum, cart, thank-you) with an updated payment/pricing flow.',
      'Containerized with Docker and deployed on Railway across 130+ commits with a 3-person team.',
      'Optimized asset delivery and page performance for fast load and conversion.',
    ],
    tech: ['Python', 'Flask', 'HTML', 'CSS', 'Docker', 'Railway'],
    github: 'https://github.com/sagnik22dey/RoasGuy',
    image: '/images/sketches/roasguy.webp',
  },
  {
    title: 'Brands Out Loud',
    tagline: 'Content & branding web platform with admin CMS',
    period: '2025',
    category: 'Full-Stack Web',
    accent: 'from-fuchsia-500 to-purple-600',
    team: true,
    description:
      'A Flask-based branding and content platform featuring an interactive flipbook experience and an admin-managed blog/content system, taken through to a production release with a collaborating team.',
    highlights: [
      'Contributed to a Flask application backing dynamic, template-driven marketing pages.',
      'Worked on an interactive flipbook feature and admin-managed blog content.',
      'Collaborated across branches through to a first production release (80+ commits).',
    ],
    tech: ['Python', 'Flask', 'HTML/CSS', 'JavaScript', 'Railway'],
    github: 'https://github.com/smedam1/Brands_out_loud',
    image: '/images/sketches/roasguy.webp',
  },
  {
    title: 'FitsMate',
    tagline: 'Fitness brand portfolio — full-stack web app',
    period: 'Nov 2025 — Dec 2025',
    category: 'Full-Stack Web',
    accent: 'from-cyan-500 to-blue-500',
    description:
      'A comprehensive portfolio platform for a fitness brand, featuring distinct user and administrator interfaces for progress tracking, personalized curricula, and brand-wide performance analytics.',
    highlights: [
      'Implemented secure authentication flows for both regular users and administrators.',
      'Built user-side features for tracking progress, following personalized curricula, and viewing results.',
      'Created an admin dashboard for content management, user oversight, and brand-wide metrics.',
      'Led end-to-end quality — functional, UI, and API testing across all critical flows.',
    ],
    tech: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'Auth', 'Dashboards'],
    github: 'https://github.com/sagnik22dey/FitMates-V2',
    image: '/images/sketches/fitsmate.webp',
  },
  {
    title: 'CMS',
    tagline: 'Project & client management system',
    period: 'Jul 2025',
    category: 'Full-Stack Web',
    accent: 'from-teal-500 to-cyan-500',
    description:
      'A management system tailored for projects, clients, and developers — streamlining the workflow of tracking development tasks and client communication from a centralized dashboard.',
    highlights: [
      'Developed a centralized dashboard for tracking project status and client details.',
      'Focused on clear, accessible UI design for administrative users.',
      'Architected a relational structure for managing developer and client interactions.',
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'Dashboard Design'],
    github: 'https://github.com/sagnik22dey/CMS',
    image: '/images/sketches/cms.webp',
  },
  {
    title: 'Pricely',
    tagline: 'Quick-commerce price intelligence — mobile app',
    period: 'Feb 2024 — Apr 2024',
    category: 'Full-Stack',
    accent: 'from-violet-500 to-fuchsia-500',
    description:
      'A React Native mobile app that eliminates manual price comparison across quick-commerce platforms (Zepto, Blinkit, Instamart) — scraping live prices, factoring in delivery fees, and routing users to the best cart in real time.',
    highlights: [
      'Built core front-end features in React Native + TypeScript with smooth, responsive UX.',
      'Engineered scraping + comparison logic that normalizes prices across heterogeneous sources.',
      'Integrated delivery-fee aware ranking so the "cheapest" option reflects true out-the-door cost.',
      'Owned full-stack quality — functional, UI, and API testing for backend communication paths.',
    ],
    tech: ['React Native', 'TypeScript', 'REST APIs', 'Web Scraping', 'Node.js'],
    github: 'https://github.com/sagnik22dey/pricely',
    image: '/images/sketches/pricely.webp',
  },
  {
    title: 'The Blind Assist',
    tagline: 'AI-powered currency detection for the visually impaired',
    period: 'Jan 2023 — Jun 2023',
    category: 'AI / Computer Vision',
    accent: 'from-pink-500 to-rose-500',
    description:
      'An Android application that uses a YOLOv5 computer vision model for real-time currency identification — designed to help visually impaired users confidently identify banknotes through their phone camera.',
    highlights: [
      'Integrated and validated a YOLOv5 computer-vision pipeline for real-time on-device inference.',
      'Designed specialized test cases to validate CV model accuracy under varied lighting and orientations.',
      'Stress-tested camera functionality and system reliability across a range of Android devices.',
      'Contributed to the feedback loop between model tuning and real-world usability.',
    ],
    tech: ['YOLOv5', 'Computer Vision', 'Android', 'Python', 'Model Evaluation'],
    image: '/images/sketches/blind_assist.webp',
  },
  {
    title: 'DecisionAlgo',
    tagline: 'Algorithmic decision-tree visualization',
    period: 'Aug 2025 — Oct 2025',
    category: 'AI / ML',
    accent: 'from-green-500 to-emerald-500',
    description:
      'A redesigned platform to visualize and execute complex decision-making algorithms, providing a structured approach to solving programmatic and data-driven problems using Python.',
    highlights: [
      'Built efficient algorithmic pipelines for data processing and decision making.',
      'Redesigned the entire web interface for better clarity and visualization.',
      'Integrated Python logic seamlessly with the presentation layer.',
    ],
    tech: ['Python', 'Algorithms', 'Data Structures', 'Web Redesign'],
    github: 'https://github.com/sagnik22dey/DecisionAlgo',
    image: '/images/sketches/decision_algo.webp',
  },
  {
    title: 'MedConscious',
    tagline: 'Health-tech tracking & insights',
    period: 'Apr 2025 — May 2025',
    category: 'Frontend / UI',
    accent: 'from-sky-500 to-blue-600',
    description:
      'A modern web application for health tracking and medical awareness, featuring data visualization, analytics, and health-metrics integration in a type-safe architecture.',
    highlights: [
      'Utilized TypeScript to build a type-safe and reliable application architecture.',
      'Implemented data tracking for health and wellness metrics.',
      'Designed a soothing, user-friendly interface optimized for health-tech use cases.',
    ],
    tech: ['TypeScript', 'Frontend', 'Health Tech', 'Analytics'],
    github: 'https://github.com/sagnik22dey/MedConscious',
    image: '/images/sketches/medconscious.webp',
  }
];

export const education = [
  {
    degree: 'Bachelor of Technology (B.Tech)',
    institution: 'B.P. Poddar Institute of Management & Technology',
    affiliation: 'MAKAUT',
    location: 'Kolkata, India',
    period: 'Aug 2019 — May 2023',
  },
];
