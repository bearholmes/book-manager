import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import type { ReactNode } from 'react';
import { HashRouter, MemoryRouter } from 'react-router-dom';
import { queryClient } from './queryClient';

export function AppProviders({ children }: { children: ReactNode }) {
  // Native views:// navigation stays inside React; browser development keeps hash URLs.
  const Router = window.__electrobun ? MemoryRouter : HashRouter;
  return (
    <Router>
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </JotaiProvider>
    </Router>
  );
}
