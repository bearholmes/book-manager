import type { Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import '../src/styles/globals.css'; // Tailwind CSS 임포트

const storybookQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(
        MemoryRouter,
        { future: { v7_startTransition: true, v7_relativeSplatPath: true } },
        createElement(
          JotaiProvider,
          null,
          createElement(
            QueryClientProvider,
            { client: storybookQueryClient },
            createElement(Story),
          ),
        ),
      ),
  ],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        light: {
          name: 'light',
          value: '#f9fafb',
        },

        white: {
          name: 'white',
          value: '#ffffff',
        },

        dark: {
          name: 'dark',
          value: '#1f2937',
        }
      }
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'light'
    }
  }
};

export default preview;
