# Sagnik Dey — Portfolio

A premium, AI-forward portfolio website for **Sagnik Dey**, an AI-Augmented Full-Stack Engineer.

**Live:** _Deploy to see it!_
**Stack:** React · TypeScript · Vite · Tailwind CSS · Framer Motion · Lucide Icons

---

## ✨ Highlights

- ⚡ **Vite + React 18 + TypeScript** — fast dev + tiny prod bundle
- 🎨 **Tailwind CSS** with a custom dark theme, gradient accents, glassmorphism cards
- 🎬 **Framer Motion** for smooth scroll-triggered reveals and micro-interactions
- 📱 **Fully responsive** — mobile-first, accessible
- 🔍 **SEO-ready** — OpenGraph, Twitter cards, proper meta tags
- 🚀 **Netlify-ready** — `netlify.toml` + `_redirects` included (SPA fallback, security headers, asset caching)
- 📄 **Resume download** — PDF served from `/public`

---

## 📁 Project Structure

```
portfolio/
├── public/
│   ├── _redirects              # Netlify SPA fallback
│   ├── favicon.svg             # Custom gradient SD favicon
│   └── Sagnik_Dey_Resume.pdf   # Downloadable resume
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Skills.tsx
│   │   ├── Experience.tsx
│   │   ├── Projects.tsx
│   │   ├── Education.tsx
│   │   ├── Contact.tsx
│   │   └── Footer.tsx
│   ├── data/
│   │   └── portfolio.ts        # Single source of truth — edit here!
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html                  # SEO meta + OG tags
├── netlify.toml                # Netlify build + headers config
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js ≥ 20**

### Install & run locally

```bash
cd portfolio
npm install
npm run dev
```

Open http://localhost:5173

### Production build

```bash
npm run build      # outputs static site to /dist
npm run preview    # preview the prod build locally
```

---

## 🌐 Deploying to Netlify

### Option A — Connect your Git repo (recommended)

1. Push the `portfolio/` folder to GitHub.
2. On [Netlify](https://app.netlify.com), click **Add new site → Import from Git**.
3. Pick the repo. Netlify will auto-detect the settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 20
4. Click **Deploy**. Done. 🎉

### Option B — Drag-and-drop

```bash
npm run build
```
Then drag the `dist/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop).

### Option C — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init         # link to a new Netlify site
netlify deploy --prod
```

---

## ✏️ Customizing Content

All copy — name, bio, skills, experience, projects — lives in **one file**:

```
src/data/portfolio.ts
```

Edit that file and everything updates across the site. No component surgery needed.

### To change color accents
Edit `tailwind.config.js` → `theme.extend.colors`. The whole site is driven by the `brand` and `accent` palettes.

### To replace the resume PDF
Drop your PDF at `public/Sagnik_Dey_Resume.pdf` (or update the filename in `personal.resumeUrl`).

---

## 🧱 Adding a new project

Open `src/data/portfolio.ts` and add a new object to the `projects` array:

```ts
{
  title: 'My New Project',
  tagline: 'One-line summary',
  period: 'Jan 2026 — Mar 2026',
  category: 'Full-Stack',          // or 'AI / Computer Vision' | 'Full-Stack Web'
  accent: 'from-emerald-500 to-teal-500',
  description: 'Longer description.',
  highlights: ['Bullet one', 'Bullet two'],
  tech: ['React', 'Node.js'],
  link: 'https://example.com',     // optional
  github: 'https://github.com/...' // optional
}
```

---

## 📜 License

Personal project — feel free to fork for your own portfolio. Attribution appreciated but not required.

---

Built with ❤️ by Sagnik Dey.
