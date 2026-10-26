import { afterEach, expect, test } from 'bun:test';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadDataKey } from './key-store';

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});
function setup() {
  const directory = mkdtempSync(join(tmpdir(), 'reading-desk-key-test-'));
  directories.push(directory);
  const path = join(directory, 'books.vault');
  const records = new Map<string, string>();
  let sets = 0;
  const fake = {
    get: async ({ name }: { name: string }) => records.get(name) ?? null,
    set: async ({ name, value }: { name: string; value: string }) => {
      sets++;
      records.set(name, value);
    },
  } as unknown as typeof Bun.secrets;
  return { path, fake, records, sets: () => sets };
}

test('stores a random key in the OS credential provider and reuses it without a key file', async () => {
  const { path, fake, sets } = setup();
  const first = await loadDataKey(path, fake);
  const second = await loadDataKey(path, fake);
  expect(first.length).toBe(32);
  expect(first).toEqual(second);
  expect(sets()).toBe(1);
});

test('does not replace a missing or malformed key for an existing encrypted library', async () => {
  const { path, fake, records, sets } = setup();
  writeFileSync(path, 'existing ciphertext');
  await expect(loadDataKey(path, fake)).rejects.toThrow('찾을 수 없습니다');
  expect(sets()).toBe(0);
  fake.get = async () => 'malformed';
  await expect(loadDataKey(path, fake)).rejects.toThrow('형식');
  expect(records.size).toBe(0);
});

test('fails closed when the credential provider is unavailable, never writes a plaintext fallback', async () => {
  const { path, fake, sets } = setup();
  fake.get = async () => {
    throw new Error('keychain unavailable');
  };
  await expect(loadDataKey(path, fake)).rejects.toThrow('보안 저장소');
  expect(sets()).toBe(0);
});

test('uses the same key identity for a symlinked data directory', async () => {
  const { path, fake, sets } = setup();
  const directory = join(path, '..');
  const alias = `${directory}-alias`;
  symlinkSync(directory, alias);
  try {
    expect(await loadDataKey(join(alias, 'books.vault'), fake)).toEqual(
      await loadDataKey(path, fake),
    );
    expect(sets()).toBe(1);
  } finally {
    rmSync(alias);
  }
});
