import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const root = process.cwd();
const packageManager = process.env.npm_execpath;
if (!packageManager) throw new Error('Run this script with pnpm licenses:generate.');
const tree = JSON.parse(
  execFileSync(
    process.execPath,
    [packageManager, 'list', '--prod', '--depth', 'Infinity', '--json'],
    {
      encoding: 'utf8',
    },
  ),
)[0];
const packages = new Set();
function collect(dependencies) {
  for (const dependency of Object.values(dependencies ?? {})) {
    if (packages.has(dependency.path)) continue;
    packages.add(dependency.path);
    collect(dependency.dependencies);
  }
}
collect(tree.dependencies);
packages.add(resolve('node_modules/electrobun'));

function licenseFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^(licen[sc]e|copying|notice)([._-]|$)/i.test(entry.name))
    .map((entry) => join(directory, entry.name))
    .sort();
}

const libraries = [...packages].map((directory) => {
  const metadata = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
  let files = licenseFiles(directory);
  // victory-vendor publishes the original licenses alongside its vendored D3 modules.
  const vendors = join(directory, 'lib-vendor');
  if (existsSync(vendors)) {
    files = files.concat(
      readdirSync(vendors, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((entry) => licenseFiles(join(vendors, entry.name))),
    );
  }
  if (!files.length) throw new Error(`Missing license text for ${metadata.name}`);
  return {
    name: metadata.name,
    version: metadata.version,
    license: metadata.license,
    notices: files.map((file) => ({
      title: relative(directory, file).split('\\').join('/'),
      text: readFileSync(file, 'utf8').trim(),
    })),
  };
});
libraries.sort((a, b) => a.name.localeCompare(b.name, 'en') || a.version.localeCompare(b.version));

const bun = JSON.parse(readFileSync('node_modules/bun/package.json', 'utf8'));
const notices = [
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
            text: readFileSync('src/shared/assets/fonts/maru-buri/LICENSE.txt', 'utf8').trim(),
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
            text: readFileSync(`desktop/assets/licenses/Bun-${bun.version}.md`, 'utf8').trim(),
          },
        ],
      },
    ],
  },
  { title: '라이브러리 및 의존성', items: libraries },
];
const output = join(root, 'src/pages/settings/data/open-source-notices.json');
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(notices, null, 2)}\n`);
console.log(`Generated open-source notices: ${libraries.length} packages, MaruBuri and Bun.`);
