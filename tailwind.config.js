import aspectRatio from '@tailwindcss/aspect-ratio';
import forms from '@tailwindcss/forms';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: ['Pretendard Variable', 'SUIT Variable', 'Noto Sans KR', 'sans-serif'],
      serif: ['MaruBuri', 'Nanum Myeongjo', 'serif'],
    },
    extend: {
      colors: {
        primary: {
          50: '#f2f6fb',
          100: '#dde7f2',
          200: '#bfd1e5',
          300: '#99b6d0',
          400: '#6f8fb2',
          500: '#4f7094',
          600: '#355575',
          700: '#26435f',
          800: '#1c3249',
          900: '#172a3c',
          950: '#0f1b2a',
        },
        accent: {
          50: '#fff4ef',
          100: '#ffe3d5',
          200: '#ffcab0',
          300: '#ffa883',
          400: '#ff8458',
          500: '#f86b3b',
          600: '#dd4f23',
          700: '#b53d1c',
          800: '#8f311c',
          900: '#742b1b',
        },
        paper: {
          50: '#fcfaf4',
          100: '#f4efe3',
          200: '#e7dfcf',
          300: '#d6c9b2',
        },
      },
      boxShadow: {
        panel: '0 18px 36px -24px rgba(23, 42, 60, 0.48)',
        soft: '0 10px 24px -18px rgba(23, 42, 60, 0.4)',
      },
    },
  },
  plugins: [aspectRatio, forms],
};
