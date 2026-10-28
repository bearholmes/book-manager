import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppErrorBoundary } from './AppErrorBoundary';
import { AppProviders } from './providers';
import '@/app/styles/globals.css';
import { STORAGE_KEYS } from '@/shared/lib/storage';
import { initializeTheme } from '@/shared/theme/theme';

initializeTheme();

// Retire the previous plaintext search cache, including when the app starts locked.
window.localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
window.localStorage.removeItem(STORAGE_KEYS.FILTER_PRESET);

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AppProviders>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </AppProviders>
  </React.StrictMode>,
);
