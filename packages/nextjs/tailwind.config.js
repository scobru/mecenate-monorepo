/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [require('daisyui')],
  darkTheme: 'dark',
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: '#F9F9F9', // Più vicino al bianco pulito
          secondary: '#EFEFEF', // Grigio molto chiaro
          accent: '#00A3FF', // Accento blu
          neutral: '#A9A9A9', // Grigio neutro
          'base-100': '#F4F4F7', // Base per background, ecc.
          info: '#007BFF', // Blu per informazioni
          success: '#28A745', // Verde per successo
          warning: '#FFC107', // Giallo per avvisi
          error: '#DC3545', // Rosso per errori
        },
        dark: {
          primary: '#1F1F1F', // Quasi nero
          secondary: '#000000', // Grigio scuro
          accent: '#00A3FF', // Accento blu
          neutral: '#767676', // Grigio neutro
          'base-100': '#353535', // Base per background, ecc.
          info: '#007BFF', // Blu per informazioni
          success: '#28A745', // Verde per successo
          warning: '#FFC107', // Giallo per avvisi
          error: '#DC3545', // Rosso per errori
        },
      },
    ],
  },
  theme: {
    // Extend Tailwind classes (e.g. font-bai-jamjuree, animate-grow)
    extend: {
      fontFamily: {
        'bai-jamjuree': ['Bai Jamjuree', 'sans-serif'],
        ui: ['Inter', 'sans-serif'],
        number: ['Roboto Mono'],
      },
      boxShadow: {
        center: '0 0 12px -2px rgb(0 0 0 / 0.05)',
      },
      keyframes: {
        grow: {
          '0%': {
            width: '0%',
          },
          '100%': {
            width: '100%',
          },
        },
        zoom: {
          '0%, 100%': { transform: 'scale(1, 1)' },
          '50%': { transform: 'scale(1.1, 1.1)' },
        },
      },
      animation: {
        grow: 'grow 5s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        zoom: 'zoom 1s ease infinite',
      },
      backgroundImage: {
        bazaar: "url('/assets/bazaar.png')",
        sharding: "url('/assets/sharding.png')",
        dev: "url('/assets/dev.png')",
        cyborg: "url('/assets/cyborg.png')",
        doors: "url('/assets/doors.png')",
        landing: "url('/assets/landing.jpg')",
        city: "url('/assets/city.png')",
        union: "url('/assets/union.png')",
      },
    },
  },
  variants: {
    // ...
    scrollbar: ['dark'],
  },
};
