import { fireEvent, render, screen } from '@testing-library/react';
import { Link, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { AppProviders } from './providers';

const nativeDescriptor = Object.getOwnPropertyDescriptor(window, '__electrobun');
afterEach(() => {
  vi.restoreAllMocks();
  if (nativeDescriptor) Object.defineProperty(window, '__electrobun', nativeDescriptor);
  else Reflect.deleteProperty(window, '__electrobun');
});

it('navigates native app routes without writing views:// WebView history', () => {
  Object.defineProperty(window, '__electrobun', { configurable: true, value: {} });
  const pushState = vi.spyOn(window.history, 'pushState').mockImplementation(() => {
    throw new Error('native WebView history is unavailable');
  });
  render(
    <AppProviders>
      <Link to="/settings">설정으로 이동</Link>
      <Routes>
        <Route path="/" element={<h1>서재 화면</h1>} />
        <Route path="/settings" element={<h1>설정 화면</h1>} />
      </Routes>
    </AppProviders>,
  );
  expect(screen.getByRole('heading', { name: '서재 화면' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: '설정으로 이동' }));
  expect(screen.getByRole('heading', { name: '설정 화면' })).toBeInTheDocument();
  expect(pushState).not.toHaveBeenCalled();
});
