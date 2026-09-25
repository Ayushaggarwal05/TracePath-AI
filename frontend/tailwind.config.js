/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#102a43',
          900: '#0f172a',
          950: '#0a1128',
        },
        beige: {
          50: '#faf8f5',
          100: '#f7f5f0',
          200: '#efece4',
          300: '#e5e0d4',
          400: '#d5cdbc',
          500: '#b8ab94',
        },
        dark: {
          base: '#FAFAFA',
          card: '#FFFFFF',
          border: '#E2E8F0',
          hover: '#F8FAFC',
          muted: '#64748B',
        }
      },
      fontFamily: {
        brand: ['Outfit', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.25)',
        'glow-indigo': '0 0 20px -3px rgba(99, 102, 241, 0.25)',
      },
    },
  },
  plugins: [],
}
