import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { build, type Plugin } from 'vite';

const assetName = 'licenses/open-source-notices.js';

function packageDirectory(id: string) {
  const path = id.replace(/\0/g, '').replaceAll('\\', '/').split('?')[0];
  const marker = '/node_modules/';
  const offset = path.lastIndexOf(marker);
  if (offset === -1) return undefined;
  const prefix = path.slice(0, offset + marker.length);
  const parts = path.slice(prefix.length).split('/');
  const directory = prefix + parts.slice(0, parts[0].startsWith('@') ? 2 : 1).join('/');
  return existsSync(join(directory, 'package.json')) ? directory : undefined;
}

function licenseFiles(directory: string) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^(licen[sc]e|copying|notice)([._-]|$)/i.test(entry.name))
    .map((entry) => join(directory, entry.name))
    .sort();
}

function collectNotices(root: string, packages: Set<string>) {
  packages.add(resolve(root, 'node_modules/electrobun'));
  const unique = new Map();
  for (const directory of packages) {
    const metadata = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
    const files = licenseFiles(directory);
    const vendors = join(directory, 'lib-vendor');
    if (existsSync(vendors)) {
      files.push(
        ...readdirSync(vendors, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .flatMap((entry) => licenseFiles(join(vendors, entry.name))),
      );
    }
    if (!files.length) throw new Error(`Missing license text for ${metadata.name}`);
    unique.set(`${metadata.name}@${metadata.version}`, {
      name: metadata.name,
      version: metadata.version,
      license: metadata.license,
      notices: files.map((file) => ({
        title: relative(directory, file).replaceAll('\\', '/'),
        text: readFileSync(file, 'utf8').trim(),
      })),
    });
  }
  const bun = JSON.parse(readFileSync(join(root, 'node_modules/bun/package.json'), 'utf8'));
  return [
    {
      title: '글꼴',
      items: [
        {
          name: '마루 부리 (MaruBuri)',
          version: 'Regular · SemiBold · Bold',
          license: 'SIL OFL 1.1',
          notices: [
            {
              title: '저작권 안내 및 라이선스 전문',
              text: readFileSync(
                join(root, 'src/shared/assets/fonts/maru-buri/LICENSE.txt'),
                'utf8',
              ).trim(),
            },
          ],
        },
      ],
    },
    {
      title: '실행 환경',
      items: [
        {
          name: 'Bun',
          version: bun.version,
          license: 'MIT 및 포함 구성요소별 라이선스',
          notices: [
            {
              title: 'Bun 및 포함 구성요소의 공식 라이선스 안내',
              text: readFileSync(
                join(root, `desktop/assets/licenses/Bun-${bun.version}.md`),
                'utf8',
              ).trim(),
            },
          ],
        },
      ],
    },
    {
      title: '앱에 포함된 라이브러리',
      items: [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, 'en')),
    },
  ];
}

/** Collect only modules that survived the renderer build, plus the bundled native runtimes. */
export function openSourceNotices(root: string): Plugin {
  return {
    name: 'open-source-notices',
    generateBundle(_options, bundle) {
      const packages = new Set<string>();
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue;
        for (const [id, module] of Object.entries(output.modules)) {
          if (module.renderedLength === 0) continue;
          const directory = packageDirectory(id);
          if (directory) packages.add(directory);
        }
      }
      this.emitFile({
        type: 'asset',
        fileName: assetName,
        source: `export default ${JSON.stringify(collectNotices(root, packages))};\n`,
      });
    },
    configureServer(server) {
      let pending: Promise<string> | undefined;
      server.watcher.on('change', () => {
        pending = undefined;
      });
      server.middlewares.use(async (request, response, next) => {
        if (request.url?.split('?')[0] !== `/${assetName}`) return next();
        pending ??= build({
          configFile: join(root, 'tooling/config/vite.config.ts'),
          logLevel: 'error',
          build: { write: false, sourcemap: false },
        }).then((result) => {
          if (Array.isArray(result) || !('output' in result))
            throw new Error('Unexpected renderer output.');
          const asset = result.output.find(
            (item) => item.type === 'asset' && item.fileName === assetName,
          );
          if (!asset || asset.type !== 'asset') throw new Error('License asset was not generated.');
          return typeof asset.source === 'string'
            ? asset.source
            : Buffer.from(asset.source).toString('utf8');
        });
        try {
          response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
          response.setHeader('Cache-Control', 'no-store');
          response.end(await pending);
        } catch (error) {
          pending = undefined;
          next(error);
        }
      });
    },
  };
}
