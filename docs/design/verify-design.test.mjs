import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const sourceDirectory = new URL('.', import.meta.url);
const design = readFileSync(new URL('../../DESIGN.md', import.meta.url), 'utf8');
const exported = JSON.parse(
  readFileSync(new URL('reading-room.tokens.json', sourceDirectory), 'utf8'),
);
const script = readFileSync(new URL('verify-design.mjs', sourceDirectory), 'utf8');

function scenario(change, valid, reason) {
  const root = mkdtempSync(join(tmpdir(), 'book-design-verifier-'));
  const directory = join(root, 'docs/design');
  mkdirSync(directory, { recursive: true });
  try {
    const data = structuredClone(exported);
    const source = change(data, design);
    writeFileSync(join(root, 'DESIGN.md'), source);
    writeFileSync(join(directory, 'reading-room.tokens.json'), JSON.stringify(data));
    writeFileSync(join(directory, 'verify-design.mjs'), script);
    for (const filename of ['reading-room.tokens.css', 'contrast-report.md']) {
      writeFileSync(join(directory, filename), 'existing output');
    }
    const result = spawnSync(process.execPath, [join(directory, 'verify-design.mjs')], {
      encoding: 'utf8',
    });
    if (valid) {
      assert.equal(result.status, 0, result.stderr);
      assert.match(readFileSync(join(directory, 'contrast-report.md'), 'utf8'), /실패: 0개/);
    } else {
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, reason);
      for (const filename of ['reading-room.tokens.css', 'contrast-report.md']) {
        assert.equal(readFileSync(join(directory, filename), 'utf8'), 'existing output');
      }
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('valid source/export produces passing output', () => {
  scenario((_data, source) => source, true);
});

test('missing untested role in both exported modes is rejected before writes', () => {
  scenario(
    (data, source) => {
      delete data.color['light-overlay'];
      delete data.color['dark-overlay'];
      return source;
    },
    false,
    /Color token sets differ/,
  );
});

test('extra export color is rejected before writes', () => {
  scenario(
    (data, source) => {
      data.color['light-unknown'] = structuredClone(data.color['light-ink']);
      return source;
    },
    false,
    /Color token sets differ/,
  );
});

test('matching source/export with failed contrast preserves previous files', () => {
  scenario(
    (data, source) => {
      data.color['light-action'].$value.hex = '#ffffff';
      return source.replace('  light-action: "#365C48"', '  light-action: "#FFFFFF"');
    },
    false,
    /Contrast failures/,
  );
});

test('topic palette preserves all 14 existing light and dark slots', () => {
  const runtime = readFileSync(
    new URL('../../src/shared/theme/tokens.css', import.meta.url),
    'utf8',
  );
  const sections = runtime.split(':root[data-theme="dark"]');
  for (const [index, mode] of ['light', 'dark'].entries()) {
    const entries = [...sections[index].matchAll(/--color-category-(\d+): (\d+) (\d+) (\d+);/g)];
    assert.equal(entries.length, 14);
    for (const [, slot, ...rgb] of entries) {
      const hex = `#${rgb.map((channel) => Number(channel).toString(16).padStart(2, '0')).join('')}`;
      assert.equal(exported.color[`${mode}-category-${slot}`].$value.hex, hex);
    }
  }
});

test('prototype topic mapping matches the existing NFC/FNV rule', () => {
  const prototype = readFileSync(new URL('reading-room.html', sourceDirectory), 'utf8');
  const runtime = readFileSync(
    new URL('../../src/features/books/model/topic-colors.ts', import.meta.url),
    'utf8',
  );
  const proposedBody = prototype.match(
    /function topicColorIndex\(topic\) \{([\s\S]*?)\n {4}\}/,
  )?.[1];
  const existingBody = runtime.match(
    /function topicColor\(topic: string\): string \{([\s\S]*?)\n\}/,
  )?.[1];
  assert.ok(proposedBody);
  assert.ok(existingBody);
  const proposed = runInNewContext(`(function(topic) {${proposedBody}})`);
  const existing = runInNewContext(`(function(topic) {${existingBody}})`, {
    categoryColors: Array.from({ length: 14 }, (_, index) => index + 1),
  });
  for (const topic of [
    '프로그래밍',
    '소설',
    '자기계발',
    '개발',
    'constructor',
    '__proto__',
    'é',
    'e\u0301',
    '📚',
  ]) {
    assert.equal(proposed(topic), existing(topic), topic);
  }
  assert.equal(proposed('é'), proposed('e\u0301'));
});
