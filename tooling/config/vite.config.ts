import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import tailwindConfig from './tailwind.config.js';

const projectRoot = fileURLToPath(new URL('../..', import.meta.url));

const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')) as {
  version: string;
};

// https://vitejs.dev/config/
export default defineConfig({
  root: path.join(projectRoot, 'src'),
  envDir: projectRoot,
  cacheDir: path.join(projectRoot, 'node_modules/.cache/vite'),
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [react()],
  css: {
    postcss: { plugins: [tailwindcss(tailwindConfig), autoprefixer()] },
  },
  resolve: {
    alias: {
      '@': path.join(projectRoot, 'src'),
      '@contracts': path.join(projectRoot, 'contracts'),
      'electrobun/view': path.join(projectRoot, '.hutch/devkit/api/browser/index.ts'),
    },
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
    open: false,
  },
  build: {
    outDir: path.join(projectRoot, 'build/renderer'),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query', 'jotai'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'utils-vendor': ['date-fns', 'clsx'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
