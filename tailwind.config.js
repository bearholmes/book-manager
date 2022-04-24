module.exports = {
  content: [
    // "./components/**/*.{js,vue,ts}",
    // "./layouts/**/*.vue",
    './pages/**/*.vue',
    // "./plugins/**/*.{js,ts}",
    // "./nuxt.config.{js,ts}",
  ],
  theme: {
    fontFamily: {
      sans: ['Apple SD Gothic Neo', 'NotoSans', 'sans-serif'],
      // roboto: ['Roboto', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [require('@tailwindcss/aspect-ratio'), require('@tailwindcss/forms')],
};
