/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ebay: {
          blue: '#0064d2',
          'blue-light': '#007cba',
          dark: '#0F1111',
        },
      },
    },
  },
  plugins: [],
};
