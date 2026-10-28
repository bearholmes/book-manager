import { useSyncExternalStore } from 'react';
import { STORAGE_KEYS } from '@/shared/lib/storage';

export type Theme = 'system' | 'dark' | 'light';
const changeEvent = 'book-manager-theme-change';

function getTheme(): Theme {
  const saved = window.localStorage.getItem(STORAGE_KEYS.THEME);
  return saved === 'dark' || saved === 'light' ? saved : 'system';
}

export function initializeTheme() {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const apply = () => {
    const theme = getTheme();
    document.documentElement.dataset.theme =
      theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.THEME || event.key === null) {
      apply();
      window.dispatchEvent(new Event(changeEvent));
    }
  };
  apply();
  media.addEventListener('change', apply);
  window.addEventListener(changeEvent, apply);
  window.addEventListener('storage', onStorage);
  return () => {
    media.removeEventListener('change', apply);
    window.removeEventListener(changeEvent, apply);
    window.removeEventListener('storage', onStorage);
  };
}

function subscribe(listener: () => void) {
  window.addEventListener(changeEvent, listener);
  return () => window.removeEventListener(changeEvent, listener);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme);
  const setTheme = (value: Theme) => {
    window.localStorage.setItem(STORAGE_KEYS.THEME, value);
    window.dispatchEvent(new Event(changeEvent));
  };
  return { theme, setTheme };
}
