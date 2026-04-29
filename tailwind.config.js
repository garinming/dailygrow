/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdeccd',
          200: '#fad89a',
          300: '#f6be5e',
          400: '#f29e2e',
          500: '#ed7d12',
          600: '#de6008',
          700: '#b74906',
          800: '#913a08',
          900: '#75310b',
        },
      },
    },
  },
  plugins: [],
}