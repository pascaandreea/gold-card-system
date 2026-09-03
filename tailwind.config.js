/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdf8ed',
          100: '#f9edcc',
          200: '#f3d994',
          300: '#ecc25c',
          400: '#e6ad35',
          500: '#dd951d',
          600: '#c27316',
          700: '#a15316',
          800: '#834218',
          900: '#6c3717',
        },
      },
    },
  },
  plugins: [],
};
