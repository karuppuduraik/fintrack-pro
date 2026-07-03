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
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#85a4ff',
          500: '#4d77ff', // Premium Blue Accent
          600: '#2b52ff',
          700: '#1a3cff',
          800: '#0022cc',
          900: '#001499',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.45)',
          dark: 'rgba(15, 23, 42, 0.45)',
          borderLight: 'rgba(255, 255, 255, 0.15)',
          borderDark: 'rgba(255, 255, 255, 0.05)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'glass': '16px',
      }
    },
  },
  plugins: [],
}
