/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/index.html',
    './src/index.tsx',
    './src/App.tsx',
    './src/components/**/*.{ts,tsx}',
    './src/services/**/*.{ts,tsx}',
    './src/constants.ts',
    './src/types.ts'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
