/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src-react/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Apple SD Gothic Neo', 'NotoSans', 'Pretendard', 'sans-serif'],
      },
      colors: {
        // 주제별 색상 팔레트
        topic: {
          1: '#FFEB99',
          2: '#B3CDFF',
          3: '#8AA8E5',
          4: '#CFE4E6',
          5: '#A3CCB8',
          6: '#AF99BF',
          7: '#E6B8A1',
          8: '#FFFAE5',
          9: '#E5EEFF',
          10: '#CCDDFF',
          11: '#E4EFF0',
          12: '#CFE5DA',
          13: '#D0C3D9',
          14: '#FFEEE6',
        },
        // 브랜드 색상
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
