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
  linkedin: 'https://linkedin.com/in/sagnik-dey-712a4618b',
  github: 'https://github.com/sagnik22dey',
  resumeUrl: '/Sagnik_Dey_Resume.pdf',
  availability: 'Open to Full-Stack & AI Engineering roles',
};

export const about = {
  bio: `I'm a Software Engineer with 2+ years of experience shipping full-stack products and AI-integrated features. My journey began in SDET — designing scalable automation frameworks at Cognizant — which gave me a unique edge: I build features AND engineer the systems that guarantee their quality.

Today my focus is on the intersection of Full-Stack development and AI/ML — building React/TypeScript applications that integrate LLMs, computer vision models (YOLOv5), and data pipelines. I love turning messy problems (manual price comparison, accessibility for the visually impaired, fitness tracking) into elegant software.`,
  stats: [
    { label: 'Years of Experience', value: '2+' },
    { label: 'Projects Shipped', value: '3' },
    { label: 'AI/CV Integrations', value: '1' },
    { label: 'Test Cases Authored', value: '500+' },
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

export type Project = {
  title: string;
  tagline: string;
  period: string;
  description: string;
  highlights: string[];
  tech: string[];
  category: 'Full-Stack' | 'AI / Computer Vision' | 'Full-Stack Web';
  accent: string;
  link?: string;
  github?: string;
  image?: string;
};

export const projects: Project[] = [
  {
    title: 'Pricely',
    tagline: 'Quick-commerce price intelligence — mobile app',
    period: 'Feb 2024 — Apr 2024',
    category: 'Full-Stack',
    accent: 'from-violet-500 to-fuchsia-500',
    description:
      'React Native mobile app that eliminates manual price comparison across quick-commerce platforms (Zepto, Blinkit, Instamart) — scraping live prices, factoring in delivery fees, and routing users to the best cart in real time.',
    highlights: [
      'Built core front-end features in React Native + TypeScript with smooth, responsive UX.',
      'Engineered scraping + comparison logic that normalizes prices across heterogeneous sources.',
      'Integrated delivery-fee aware ranking so the "cheapest" option reflects true out-the-door cost.',
      'Owned full-stack quality — functional, UI, and API testing for backend communication paths.',
    ],
    tech: ['React Native', 'TypeScript', 'REST APIs', 'Web Scraping', 'Node.js'],
  },
  {
    title: 'The Blind Assist',
    tagline: 'AI-powered currency detection for the visually impaired',
    period: 'Jan 2023 — Jun 2023',
    category: 'AI / Computer Vision',
    accent: 'from-pink-500 to-rose-500',
    description:
      'Android application that uses a YOLOv5 computer vision model for real-time currency identification — designed to help visually impaired users confidently identify banknotes through their phone camera.',
    highlights: [
      'Integrated and validated a YOLOv5 computer-vision pipeline for real-time on-device inference.',
      'Designed specialized test cases to rigorously validate CV model accuracy under varied lighting and orientations.',
      'Stress-tested camera functionality and system reliability on a range of Android devices.',
      'Contributed to the feedback loop between model tuning and real-world usability.',
    ],
    tech: ['YOLOv5', 'Computer Vision', 'Android', 'Python', 'Model Evaluation'],
  },
  {
    title: 'FitsMate',
    tagline: 'Fitness brand portfolio — full-stack web app',
    period: 'Nov 2025 — Dec 2025',
    category: 'Full-Stack Web',
    accent: 'from-cyan-500 to-blue-500',
    description:
      'Comprehensive fitness-brand platform with distinct user and administrator interfaces — enabling progress tracking, personalized curricula, and brand-wide analytics.',
    highlights: [
      'Implemented secure authentication flows for both regular users and administrators.',
      'Built user-side features for tracking workouts, following personalized curricula, and viewing results.',
      'Created an admin dashboard for content management, user oversight, and brand-wide metrics.',
      'Led end-to-end quality — functional, UI, and API testing for all critical flows.',
    ],
    tech: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'PostgreSQL', 'Auth'],
  },
  {
    title: 'BOL-LMS',
    tagline: 'Modern Learning Management System',
    period: 'Mar 2026 — Apr 2026',
    category: 'Full-Stack Web',
    accent: 'from-blue-500 to-indigo-500',
    description: 'A comprehensive Learning Management System built for scale, enabling course management, student progress tracking, and interactive learning modules with a robust backend architecture.',
    highlights: [
      'Engineered interactive course modules and progress tracking systems.',
      'Designed a secure and scalable backend for handling user sessions and data.',
      'Ensured high accessibility and responsive design across all devices.'
    ],
    tech: ['JavaScript', 'Node.js', 'HTML/CSS', 'Full-Stack'],
    github: 'https://github.com/sagnik22dey/BOL-LMS',
    image: '/images/bol_lms.png'
  },
  {
    title: 'RoasGuy',
    tagline: 'High-performance marketing platform',
    period: 'Dec 2025 — Apr 2026',
    category: 'Full-Stack Web',
    accent: 'from-orange-500 to-red-500',
    description: 'Dynamic marketing and landing page application optimized for high conversion rates. Features sleek aesthetics, responsive layouts, and robust client-side routing.',
    highlights: [
      'Implemented responsive and high-fidelity UI components from design mockups.',
      'Optimized asset delivery and page performance for maximum speed.',
      'Integrated contact forms and call-to-action sections with seamless user experience.'
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'UI/UX Design'],
    github: 'https://github.com/sagnik22dey/RoasGuy',
    image: '/images/roasguy.png'
  },
  {
    title: 'DecisionAlgo',
    tagline: 'Algorithmic decision tree visualization',
    period: 'Aug 2025 — Oct 2025',
    category: 'AI / Computer Vision',
    accent: 'from-green-500 to-emerald-500',
    description: 'A redesigned platform to visualize and execute complex decision-making algorithms, providing a structured approach to solving programmatic and data-driven problems using Python.',
    highlights: [
      'Built efficient algorithmic pipelines for data processing and decision making.',
      'Redesigned the entire web interface for better clarity and visualization.',
      'Integrated Python logic seamlessly with the presentation layer.'
    ],
    tech: ['Python', 'Algorithms', 'Data Structures', 'Web Redesign'],
    github: 'https://github.com/sagnik22dey/DecisionAlgo',
    image: '/images/decision_algo.png'
  },
  {
    title: 'CMS',
    tagline: 'Project & Client Management System',
    period: 'Jul 2025 — Jul 2025',
    category: 'Full-Stack Web',
    accent: 'from-teal-500 to-cyan-500',
    description: 'A dedicated Customer Management System tailored for projects, clients, and developers. Streamlines the workflow of managing development tasks and client communication.',
    highlights: [
      'Developed a centralized dashboard for tracking project status and client details.',
      'Focused on clear, accessible UI design for administrative users.',
      'Architected a robust relational structure for managing developer and client interactions.'
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'Dashboard Design'],
    github: 'https://github.com/sagnik22dey/CMS',
    image: '/images/cms_project.png'
  },
  {
    title: 'MedConscious',
    tagline: 'Health-tech tracking & insights',
    period: 'Apr 2025 — May 2025',
    category: 'Full-Stack',
    accent: 'from-sky-500 to-blue-600',
    description: 'A modern web application aimed at medical consciousness and health tracking. Features data visualization, analytics, and abstract health metrics integration.',
    highlights: [
      'Utilized TypeScript to build a type-safe and reliable application architecture.',
      'Implemented complex data tracking for health and wellness metrics.',
      'Designed a soothing, user-friendly interface optimized for health-tech use cases.'
    ],
    tech: ['TypeScript', 'Frontend', 'Health Tech', 'Analytics'],
    github: 'https://github.com/sagnik22dey/MedConscious',
    image: '/images/medconscious.png'
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
