import type { ElectrobunConfig } from 'electrobun';

export default {
  app: {
    name: '방구석 도서관리',
    identifier: 'app.readingdesk.books',
    version: '3.0.0',
  },
  build: {
    mainProcess: 'bun',
    bun: { entrypoint: 'desktop/index.ts' },
    copy: {
      'build/renderer': 'views/main',
      'src/shared/assets/fonts/maru-buri/LICENSE.txt': 'views/main/licenses/MaruBuri.txt',
    },
    buildFolder: 'build/desktop',
    artifactFolder: 'build/releases',
    mac: { bundleCEF: false, icons: 'desktop/assets/app.iconset' },
    win: { bundleCEF: false, icon: 'desktop/assets/app-icon.ico' },
    linux: { bundleCEF: false, icon: 'desktop/assets/app-icon.png' },
  },
  runtime: { exitOnLastWindowClosed: true },
  scripts: {
    postBuild: './tooling/scripts/patch-bun-runtime.mjs',
    postWrap: './tooling/scripts/patch-bun-runtime.mjs',
  },
} satisfies ElectrobunConfig;
