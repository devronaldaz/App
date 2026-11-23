/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF6EE',
        sand: '#F4EADC',
        linen: '#EFE2D0',
        ink: '#3A2E28',
        muted: '#8C7B6D',
        sun: {
          50: '#FFF8E7',
          100: '#FDEFC8',
          200: '#F8DC8E',
          300: '#F5C95A',
          400: '#F0B530',
          500: '#DE9A16',
          600: '#BC7A0F',
          700: '#8F5A10',
        },
        seed: '#5A3A1F',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(90, 58, 31, 0.18)',
        card: '0 2px 24px -8px rgba(90, 58, 31, 0.14)',
        glow: '0 10px 30px -8px rgba(222, 154, 22, 0.55)',
      },
    },
  },
  plugins: [],
}
