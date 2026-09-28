/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hand: ['"Caveat"', 'cursive'],
      },
      colors: {
        paper: {
          50: '#fdfcf8',
          100: '#faf6ec',
          200: '#f3ecd9',
          300: '#e9dfc4',
          400: '#d9cba6',
        },
        ink: {
          DEFAULT: '#2b2620',
          soft: '#4a423a',
          faint: '#7a6f62',
        },
        accent: {
          DEFAULT: '#c2410c',
          soft: '#e8763f',
          sage: '#6b7c5f',
          clay: '#a8563a',
        },
      },
      backgroundImage: {
        'paper-fade': 'radial-gradient(circle at 50% 0%, rgba(194,65,12,0.08), transparent 55%)',
      },
      boxShadow: {
        sketch: '3px 3px 0 0 rgba(43,38,32,0.9)',
        'sketch-sm': '2px 2px 0 0 rgba(43,38,32,0.85)',
        paper: '0 12px 40px -12px rgba(43,38,32,0.25)',
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
