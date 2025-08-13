/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
    colors: {
      primary: '#2563eb', // Custom blue
    },
  },d
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode support

  }