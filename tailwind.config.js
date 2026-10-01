/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hand: ['"Caveat"', 'cursive'],
      },
      colors: {
        paper: {
          50: 'rgb(var(--paper-50) / <alpha-value>)',
          100: 'rgb(var(--paper-100) / <alpha-value>)',
          200: 'rgb(var(--paper-200) / <alpha-value>)',
          300: 'rgb(var(--paper-300) / <alpha-value>)',
          400: 'rgb(var(--paper-400) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft) / <alpha-value>)',
          faint: 'rgb(var(--ink-faint) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          soft: 'rgb(var(--accent-soft) / <alpha-value>)',
          sage: '#6b7c5f',
          clay: 'rgb(var(--accent-clay) / <alpha-value>)',
        },
        cave: {
          void: '#0c0d0f',
          base: '#121316',
          plate: '#18191e',
          surface: '#1e2026',
          raised: '#252830',
          chalk: '#f3f4f6',
          mortar: '#9ca3af',
          dust: '#6b7280',
        },
      },
      backgroundImage: {
        'paper-fade': 'radial-gradient(circle at 50% 0%, rgba(194,65,12,0.08), transparent 55%)',
        'cavern-hearth': 'radial-gradient(circle at 50% 30%, rgba(217,119,6,0.12) 0%, rgba(18,19,22,0.85) 60%, #121316 100%)',
      },
      boxShadow: {
        sketch: '3px 3px 0 0 rgb(var(--shadow) / 0.9)',
        'sketch-sm': '2px 2px 0 0 rgb(var(--shadow) / 0.85)',
        paper: '0 12px 40px -12px rgb(var(--shadow) / 0.25)',
        hearth: '0 0 24px -2px rgba(245,158,11,0.22)',
        'hearth-sm': '0 0 12px -1px rgba(217,119,6,0.2)',
        hud: '0 8px 32px -4px rgba(0,0,0,0.6), 0 0 14px rgba(217,119,6,0.18)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0) rotate(-1deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' },
        },
      },
    },
  },
  plugins: [],
}
