/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        crimson: '#C41E3A',
        'dark-red': '#8B0000',
        gold: '#D4AF37',
        cream: '#FFF8F0',
        parchment: '#F5ECD7',
        ink: '#1A0A00',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        italic: ['"Crimson Pro"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
