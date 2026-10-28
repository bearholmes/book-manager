import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const tokens = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
const button = readFileSync(new URL('../ui/Button.module.css', import.meta.url), 'utf8');
const input = readFileSync(new URL('../ui/Input.module.css', import.meta.url), 'utf8');

test('reading room themes retain all category and chart slots', () => {
  const [light, dark] = tokens.split(':root[data-theme="dark"]');
  for (const [section, values] of [
    [
      light,
      [
        '--color-canvas-start: 246 243 237;',
        '--color-surface: 251 249 245;',
        '--color-nav-selected: 91 107 83;',
        '--color-action: 54 92 72;',
      ],
    ],
    [
      dark,
      [
        '--color-canvas-start: 32 35 31;',
        '--color-surface: 39 43 38;',
        '--color-nav-selected: 54 76 62;',
        '--color-action: 177 203 180;',
      ],
    ],
  ]) {
    for (const value of values) assert.ok(section.includes(value));
    for (let i = 1; i <= 14; i++) assert.match(section, new RegExp(`--color-category-${i}:`));
    for (let i = 1; i <= 10; i++) assert.match(section, new RegExp(`--color-chart-${i}:`));
  }
  assert.ok(tokens.includes('--font-book:'));
  assert.match(tokens, /--font-body:\s*"Pretendard Variable", -apple-system/);
  assert.ok(dark.includes('--color-toast: 48 54 47;'));
});

test('overlay does not blur content behind dialogs', () => {
  const overlay = readFileSync(new URL('../ui/Overlay.module.css', import.meta.url), 'utf8');
  assert.doesNotMatch(overlay, /backdrop-filter:\s*blur/);
});

test('controls retain focus, disabled, and distinct solid foreground roles', () => {
  assert.match(input, /\.field:focus-visible\s*\{[^}]*outline: var\(--focus-width\)/s);
  assert.match(input, /\.field:disabled\s*\{[^}]*--color-on-disabled/s);
  assert.doesNotMatch(input, /opacity: 0\.5/);
  assert.match(button, /\.button:disabled\s*\{[^}]*--color-on-disabled/s);
  assert.doesNotMatch(button, /opacity: 0\.5|filter: brightness/);
  assert.match(button, /data-variant="danger"\]:hover[^}]*--color-danger-solid-hover/s);
  assert.match(button, /data-variant="primary"[^}]*color: rgb\(var\(--color-on-action\)\)/s);
  assert.match(button, /data-variant="danger"[^}]*color: rgb\(var\(--color-on-danger\)\)/s);
  assert.ok(tokens.includes('--color-on-action: 28 48 35;'));
  assert.ok(tokens.includes('--color-on-danger: 255 255 255;'));
});
