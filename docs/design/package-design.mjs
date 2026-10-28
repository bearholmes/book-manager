import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Build an offline review artifact; never changes renderer or desktop sources.
const root = new URL('../../', import.meta.url);
const directory = new URL('.', import.meta.url);
const output = new URL('build/design-review/', root);
mkdirSync(output, { recursive: true });
let html = readFileSync(new URL('reading-room.html', directory), 'utf8');
const css = readFileSync(new URL('reading-room.tokens.css', directory), 'utf8');
const stylesheet = '<link rel="stylesheet" href="reading-room.tokens.css">';
assert.ok(html.includes(stylesheet), 'Expected token stylesheet link');
html = html.replace(stylesheet, `<style>${css}</style>`);
for (const [name, type] of [
  ['fonts/maru-buri/MaruBuri-Regular.woff2', 'font/woff2'],
  ['fonts/maru-buri/MaruBuri-SemiBold.woff2', 'font/woff2'],
  ['branding/library-logo-32.png', 'image/png'],
  ['branding/library-logo-64.png', 'image/png'],
]) {
  const source = `../../src/shared/assets/${name}`;
  assert.ok(html.includes(source), `Expected asset: ${source}`);
  const base64 = readFileSync(new URL(`src/shared/assets/${name}`, root)).toString('base64');
  html = html.replaceAll(source, `data:${type};base64,${base64}`);
}
for (const [link, file, label] of [
  ['../../DESIGN.md', new URL('DESIGN.md', root), 'DESIGN.md'],
  ['contrast-report.md', new URL('contrast-report.md', directory), 'contrast-report.md'],
]) {
  const data = readFileSync(file).toString('base64');
  html = html.replace(
    `href="${link}"`,
    `download="${label}" href="data:text/plain;base64,${data}"`,
  );
}
const license = readFileSync(
  new URL('src/shared/assets/fonts/maru-buri/LICENSE.txt', root),
).toString('base64');
html = html.replace(
  '</footer>',
  `<a download="MaruBuri-LICENSE.txt" href="data:text/plain;base64,${license}">마루부리 · SIL OFL 1.1</a></footer>`,
);
assert.ok(!html.includes('../../src/'), 'All local assets must be embedded');
assert.ok(!html.includes('href="reading-room.tokens.css"'), 'Styles must be embedded');
const path = new URL('방구석 도서관리-디자인제안.html', output);
writeFileSync(path, html);
console.log(JSON.stringify({ path: fileURLToPath(path), bytes: Buffer.byteLength(html) }, null, 2));
