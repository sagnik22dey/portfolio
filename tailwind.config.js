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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          900: '#4c1d95',
        },
        accent: {
          cyan: '#22d3ee',
          violet: '#a78bfa',
          pink: '#f472b6',
        },
      },
      backgroundImage: {
        'grid-dark': "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        'radial-fade': 'radial-gradient(circle at 50% 0%, rgba(139,92,246,0.25), transparent 60%)',
      },
      animation: {
        'gradient-x': 'gradient-x 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 20px rgba(139,92,246,0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(34,211,238,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
