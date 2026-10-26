import { afterEach, expect, test } from 'bun:test';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { LibraryDatabase } from '../library/repository';
import { acquireStoreGuard } from '../storage/store-guard';
import { openLibrary } from './open-library';

const directories: string[] = [];
const libraries: LibraryDatabase[] = [];
afterEach(() => {
  for (const library of libraries.splice(0)) library.close();
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});
function directory() {
  const result = mkdtempSync(join(tmpdir(), 'reading-desk-open-test-'));
  directories.push(result);
  return result;
}

test('acquires the process lock before reading keys and wipes the temporary key after opening', async () => {
  const key = randomBytes(32);
  const library = await openLibrary(directory(), async (path) => {
    expect(() => acquireStoreGuard(path)).toThrow('이미 실행 중');
    return key;
  });
  libraries.push(library);
  expect(key.equals(Buffer.alloc(32))).toBe(true);
  const created = library.create({ book_name: '키 수명 확인' });
  expect(library.all()[0]).toEqual(created);
});

test('releases the process lock if the credential provider fails so initialization can retry', async () => {
  const path = directory();
  await expect(
    openLibrary(path, async () => {
      throw new Error('credential provider unavailable');
    }),
  ).rejects.toThrow('credential provider unavailable');
  const library = await openLibrary(path, async () => randomBytes(32));
  libraries.push(library);
  expect(library.stats().total).toBe(0);
});

test('wipes a malformed key and releases the guard if the repository constructor rejects it', async () => {
  const path = directory();
  const key = Buffer.from('invalid key');
  await expect(openLibrary(path, async () => key)).rejects.toThrow('암호화 키 형식');
  expect(key.equals(Buffer.alloc(key.length))).toBe(true);
  const guard = acquireStoreGuard(join(path, 'books.vault'));
  guard.close();
});
