import { execFileSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';

// Electrobun 2.0.4 pins Bun 1.4.0 internally and rejects a per-project Bun version.
// Replace the app-owned runtime through official hooks, before release signing/packaging.
const version = '1.4.4';
const buildDirectory = process.env.ELECTROBUN_BUILD_DIR;
const wrapper = process.env.ELECTROBUN_WRAPPER_BUNDLE_PATH;
const platform = { darwin: 'macos', linux: 'linux', win32: 'win' }[process.platform];
if (
  !buildDirectory ||
  platform !== process.env.ELECTROBUN_OS ||
  process.arch !== process.env.ELECTROBUN_ARCH
) {
  throw new Error('Bun security hook requires a build for the current host platform.');
}
const source = resolve('node_modules/bun/bin/bun.exe');
const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
if (
  packageJson.devDependencies.bun !== version ||
  execFileSync(source, ['--version'], { encoding: 'utf8' }).trim() !== version
) {
  throw new Error(`Install the pinned Bun ${version} package before building.`);
}

function findFiles(directory, name, depth = 0) {
  if (depth > 10) throw new Error('Unexpected Electrobun bundle layout.');
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findFiles(path, name, depth + 1);
    return entry.isFile() && entry.name === name ? [path] : [];
  });
}

const root = wrapper ?? buildDirectory;
if (!wrapper) {
  const entries = findFiles(root, 'index.html').filter((path) =>
    /[\\/]views[\\/]main[\\/]index\.html$/.test(path),
  );
  if (!entries.length) throw new Error('Packaged renderer was not found.');
  function verifyRenderer(sourceDirectory, targetDirectory) {
    for (const entry of readdirSync(sourceDirectory, { withFileTypes: true })) {
      const sourcePath = join(sourceDirectory, entry.name);
      const targetPath = join(targetDirectory, entry.name);
      if (entry.isDirectory()) verifyRenderer(sourcePath, targetPath);
      else if (
        !existsSync(targetPath) ||
        !readFileSync(sourcePath).equals(readFileSync(targetPath))
      )
        throw new Error(`Packaged renderer does not match the build: ${entry.name}`);
    }
  }
  for (const entry of entries) verifyRenderer(resolve('build/renderer'), dirname(entry));
  console.log('[renderer] Verified packaged files match build/renderer.');
}
const runtimes = findFiles(root, process.platform === 'win32' ? 'bun.exe' : 'bun');
if (runtimes.length === 0 && !wrapper)
  throw new Error('Packaged Bun runtime was not found. Refusing to produce an unpatched app.');
for (const target of runtimes) {
  const temporary = `${target}.security-update`;
  try {
    copyFileSync(source, temporary);
    chmodSync(temporary, 0o755);
    if (execFileSync(temporary, ['--version'], { encoding: 'utf8' }).trim() !== version)
      throw new Error('Copied Bun runtime did not pass version verification.');
    renameSync(temporary, target);
    if (execFileSync(target, ['--version'], { encoding: 'utf8' }).trim() !== version)
      throw new Error('Packaged Bun runtime version mismatch.');
  } finally {
    if (existsSync(temporary)) rmSync(temporary);
  }
}
for (const path of findFiles(root, 'build.json')) {
  const metadata = JSON.parse(readFileSync(path, 'utf8'));
  if (metadata.mainProcess === 'bun' && metadata.runtimeVersions?.bun) {
    metadata.runtimeVersions.bun = version;
    writeFileSync(path, JSON.stringify(metadata));
  }
}
console.log(
  `[security] Packaged Bun ${version}: verified ${runtimes.length} runtime(s) in ${root}`,
);
