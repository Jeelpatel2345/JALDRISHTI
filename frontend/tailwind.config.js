/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jal: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#0ea5e9',
          600: '#0265D2', // Logo "JAL" Royal Blue
          700: '#0052a8',
          800: '#003e80',
          900: '#002956',
        },
        drishti: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#0E8A42', // Logo "DRISHTI" Emerald Green
          800: '#0b6e36',
          900: '#064e26',
        },
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          600: '#16a34a',
          700: '#0E8A42',
          800: '#0b6e36',
          900: '#08482A',
          950: '#042817',
        },
        water: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0ea5e9',
          600: '#0265D2',
          700: '#0052a8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
