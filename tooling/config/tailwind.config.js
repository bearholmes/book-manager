import { fileURLToPath } from 'node:url';
import forms from '@tailwindcss/forms';

const color = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const palette = (name, shades) =>
  Object.fromEntries(shades.map((shade) => [shade, color(`palette-${name}-${shade}`)]));

export default {
  content: [fileURLToPath(new URL('../../src/**/*.{js,ts,jsx,tsx,html}', import.meta.url))],
  theme: {
    fontFamily: { sans: ['var(--font-body)'], serif: ['var(--font-heading)'] },
    extend: {
      colors: {
        primary: palette('primary', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        accent: palette('accent', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        paper: palette('paper', [50, 100, 200, 300]),
        surface: {
          DEFAULT: color('color-surface'),
          muted: color('color-surface-muted'),
          subtle: color('color-surface-subtle'),
          selected: color('color-surface-selected'),
        },
        copy: {
          DEFAULT: color('color-text'),
          heading: color('color-text-heading'),
          emphasis: color('color-text-emphasis'),
          secondary: color('color-text-secondary'),
          muted: color('color-text-muted'),
          subtle: color('color-text-subtle'),
          faint: color('color-text-faint'),
        },
        line: {
          DEFAULT: color('color-border'),
          subtle: color('color-border-subtle'),
          hover: color('color-border-hover'),
        },
        action: { DEFAULT: color('color-action'), hover: color('color-action-hover') },
        focus: color('color-focus'),
        danger: {
          DEFAULT: color('color-danger'),
          hover: color('color-danger-hover'),
          text: color('color-danger-text'),
          indicator: color('color-danger-indicator'),
        },
        'on-solid': color('color-text-on-solid'),
      },
      zIndex: {
        footer: 'var(--layer-footer)',
        overlay: 'var(--layer-overlay)',
        toast: 'var(--layer-toast)',
      },
      ringWidth: { 2: 'var(--focus-width)' },
      ringOffsetWidth: { 2: 'var(--focus-offset)' },
      boxShadow: { panel: 'var(--shadow-panel)', soft: 'var(--shadow-soft)' },
      borderRadius: {
        xl: 'var(--radius-control)',
        '2xl': 'var(--radius-panel)',
        lg: 'var(--radius-small)',
      },
      transitionDuration: {
        DEFAULT: 'var(--motion-duration-fast)',
        150: 'var(--motion-duration-fast)',
        200: 'var(--motion-duration-hover)',
        300: 'var(--motion-duration-transform)',
      },
      transitionTimingFunction: { DEFAULT: 'var(--motion-ease)', 'in-out': 'var(--motion-ease)' },
    },
  },
  plugins: [forms],
};
