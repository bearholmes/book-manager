import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { clearLibraryPreferences, STORAGE_KEYS } from '@/shared/lib/storage';
import { initializeTheme, useTheme } from './theme';

let dispose: (() => void) | undefined;
afterEach(() => {
  dispose?.();
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
  vi.unstubAllGlobals();
});

function setup(dark = false) {
  const media = new EventTarget();
  Object.assign(media, { matches: dark });
  vi.stubGlobal('matchMedia', () => media);
  dispose = initializeTheme();
  return (matches: boolean) => {
    Object.assign(media, { matches });
    act(() => media.dispatchEvent(new Event('change')));
  };
}

function Picker() {
  const { theme, setTheme } = useTheme();
  return (
    <button type="button" onClick={() => setTheme('light')}>
      {theme}
    </button>
  );
}

it('follows system changes by default and restores saved explicit choices on startup', () => {
  const systemChange = setup(true);
  expect(document.documentElement.dataset.theme).toBe('dark');
  systemChange(false);
  expect(document.documentElement.dataset.theme).toBe('light');
  window.localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
  dispose?.();
  setup(false);
  expect(document.documentElement.dataset.theme).toBe('dark');
});

it('applies and saves a choice immediately, ignoring system changes for an explicit theme', () => {
  const systemChange = setup(true);
  render(<Picker />);
  fireEvent.click(screen.getByRole('button', { name: 'system' }));
  expect(screen.getByRole('button', { name: 'light' })).toBeInTheDocument();
  expect(window.localStorage.getItem(STORAGE_KEYS.THEME)).toBe('light');
  systemChange(true);
  expect(document.documentElement.dataset.theme).toBe('light');
  clearLibraryPreferences();
  expect(window.localStorage.getItem(STORAGE_KEYS.THEME)).toBe('light');
});

it('falls back to system for invalid preferences and syncs changes from another window', () => {
  window.localStorage.setItem(STORAGE_KEYS.THEME, 'invalid');
  setup(true);
  render(<Picker />);
  expect(screen.getByRole('button', { name: 'system' })).toBeInTheDocument();
  window.localStorage.setItem(STORAGE_KEYS.THEME, 'light');
  act(() => window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.THEME })));
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(screen.getByRole('button', { name: 'light' })).toBeInTheDocument();
});
