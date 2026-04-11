/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#080B14',
        'accent': '#5B5BD6',
        'accent-violet': '#7C3AED',
        'panel': 'rgba(255,255,255,0.03)',
        // Keep legacy colors for dashboard/other pages
        'space-black': '#0A0F1E',
        'accent-blue': '#00D4FF',
        'accent-purple': '#7C3AED',
        'accent-pink': '#EC4899',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
    },
  },
  plugins: [],
}

