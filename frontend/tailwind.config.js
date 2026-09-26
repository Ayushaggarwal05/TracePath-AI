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
          50: '#fdf2f4',
          100: '#fbe6e9',
          200: '#f6ced4',
          300: '#efa6b3',
          400: '#e37388',
          500: '#d34863',
          600: '#ba2b48',
          700: '#a8203a',
          800: '#841d32',
          900: '#701d2f',
          950: '#400a15',
        },
        crimson: {
          50: '#fdf2f4',
          100: '#fbe6e9',
          200: '#f6ced4',
          300: '#efa6b3',
          400: '#e37388',
          500: '#d34863',
          600: '#ba2b48',
          700: '#a8203a',
          800: '#841d32',
          900: '#701d2f',
          950: '#400a15',
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
          900: '#0f2742',
          950: '#0b111f',
        },
        ivory: {
          50: '#faf8f5',
          100: '#f7f5f0',
          200: '#eee6dc',
          300: '#e2d8cb',
          400: '#cfc0ad',
          500: '#b8a690',
        },
        softgray: '#eef2f5',
        status: {
          green: '#088f68',
          yellow: '#d99a18',
          red: '#c7374d',
        },
        dark: {
          base: '#F7F5F0',
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
