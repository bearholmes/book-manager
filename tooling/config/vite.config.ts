import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { openSourceNotices } from '../packaging/licenses.ts';

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
  plugins: [react(), tailwindcss(), openSourceNotices(projectRoot)],
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
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return;
          if (/\/(react|react-dom|react-router|react-router-dom)\//.test(id)) return 'react-vendor';
          if (/\/(@tanstack|jotai)\//.test(id)) return 'query-vendor';
          if (/\/(react-hook-form|@hookform|zod)\//.test(id)) return 'form-vendor';
          if (/\/(date-fns|clsx)\//.test(id)) return 'utils-vendor';
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
