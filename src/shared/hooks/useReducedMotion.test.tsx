import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useReducedMotion } from './useReducedMotion';

afterEach(() => vi.unstubAllGlobals());

it('updates chart motion when the OS preference changes and unsubscribes on unmount', () => {
  let matches = false;
  const listeners = new Set<() => void>();
  const media = {
    get matches() {
      return matches;
    },
    addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media),
  );
  const { result, unmount } = renderHook(() => useReducedMotion());
  expect(result.current).toBe(false);
  act(() => {
    matches = true;
    for (const listener of listeners) listener();
  });
  expect(result.current).toBe(true);
  act(() => {
    matches = false;
    for (const listener of listeners) listener();
  });
  expect(result.current).toBe(false);
  unmount();
  expect(listeners.size).toBe(0);
});
