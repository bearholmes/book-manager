import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('UI uses locally bundled variable Pretendard with system fallback and a packaged license', () => {
  const css = read('./fonts.css');
  const tokens = read('./tokens.css');
  assert.match(css, /font-family: "Pretendard Variable"/);
  assert.match(css, /PretendardVariable\.woff2/);
  assert.match(css, /font-weight: 45 930/);
  assert.match(tokens, /--font-body:\s*"Pretendard Variable", -apple-system/);
  assert.match(tokens, /--font-book: "MaruBuri"/);
  assert.ok(
    existsSync(new URL('../assets/fonts/pretendard/PretendardVariable.woff2', import.meta.url)),
  );
  assert.match(read('../assets/fonts/pretendard/LICENSE.txt'), /SIL OPEN FONT LICENSE/);
  assert.match(read('../../../tooling/packaging/licenses.ts'), /pretendard\/LICENSE\.txt/);
  assert.match(read('../../../electrobun.config.ts'), /views\/main\/licenses\/Pretendard\.txt/);
});
