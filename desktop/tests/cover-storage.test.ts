import { Database } from 'bun:sqlite';
import { afterEach, expect, test } from 'bun:test';
import { randomBytes } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DesktopService } from '../application/command-service';
import { createBackup, readBackup } from '../backup/archive';
import { LibraryDatabase } from '../library/repository';
import { decrypt, encrypt } from '../security/encryption';
import { jpegCover, webpCover } from './cover-fixture';

const resources: { directory: string; library: LibraryDatabase }[] = [];
function setup() {
  const directory = mkdtempSync(join(tmpdir(), 'reading-desk-covers-'));
  const path = join(directory, 'books.vault');
  const key = randomBytes(32);
  const library = new LibraryDatabase(path, key);
  resources.push({ directory, library });
  let archive = '';
  const service = new DesktopService(library, async (content) => {
    archive = content;
    return 'backup.rdbackup';
  });
  const files = () =>
    existsSync(join(directory, 'covers')) ? readdirSync(join(directory, 'covers')) : [];
  const coverPath = (id: string) => join(directory, 'covers', `${id}.vault`);
  return { directory, path, key, library, service, files, coverPath, archive: () => archive };
}
afterEach(() => {
  for (const { library, directory } of resources.splice(0)) {
    library.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test('stores encrypted binary covers outside SQLite, deduplicates them, and reopens offline', () => {
  const { library, key, path, files, coverPath } = setup();
  const first = library.create({ book_name: '로컬 표지', cover: webpCover });
  const second = library.create({ book_name: '동일 표지', cover: webpCover });
  const id = first.cover_id as string;
  expect(second.cover_id).toBe(id);
  expect(files()).toEqual([`${id}.vault`]);
  const ciphertext = readFileSync(coverPath(id));
  expect(ciphertext.includes(Buffer.from('WEBP'))).toBe(false);
  expect(ciphertext.includes(Buffer.from(webpCover.data))).toBe(false);
  const db = Database.deserialize(decrypt(readFileSync(path), key));
  expect(db.query('SELECT cover_id, image_url FROM books WHERE id = ?').get(first.id)).toEqual({
    cover_id: id,
    image_url: null,
  });
  expect(db.serialize().includes(Buffer.from(webpCover.data))).toBe(false);
  db.close();
  expect(library.readCover(id)).toEqual(webpCover);
  library.close();
  const reopened = new LibraryDatabase(path, key);
  try {
    expect(reopened.all()).toContainEqual(first);
    expect(reopened.readCover(id)).toEqual(webpCover);
  } finally {
    reopened.close();
  }
});

test('collects only unreferenced covers on replacement, removal, deletion and reset', () => {
  const { library, files } = setup();
  const first = library.create({ book_name: '첫 책', cover: webpCover });
  const second = library.create({ book_name: '공유한 책', cover: webpCover });
  library.update(first.id, { cover: jpegCover });
  expect(files()).toHaveLength(2);
  library.delete(second.id);
  expect(files()).toHaveLength(1);
  expect(() => library.readCover(second.cover_id as string)).toThrow();
  library.update(first.id, { cover: null });
  expect(files()).toEqual([]);
  expect(library.all()[0]?.cover_id).toBeNull();
  library.create({ book_name: '초기화할 책', cover: webpCover });
  library.reset();
  expect(files()).toEqual([]);
});

test('rolls back books and discards staged files when saving the vault fails', () => {
  const { library, path, files, coverPath } = setup();
  const book = library.create({ book_name: '보존할 책', cover: webpCover });
  const original = readFileSync(coverPath(book.cover_id as string));
  renameSync(path, `${path}.saved`);
  mkdirSync(path);
  for (const cover of [jpegCover, null]) {
    expect(() => library.update(book.id, { cover })).toThrow();
    expect(library.all()).toEqual([book]);
    expect(files()).toEqual([`${book.cover_id}.vault`]);
    expect(readFileSync(coverPath(book.cover_id as string))).toEqual(original);
  }
  rmSync(path, { recursive: true });
  renameSync(`${path}.saved`, path);
});

test('rejects invalid uploads, oversized images, external URLs and path injection without saving', async () => {
  const { library, service, files } = setup();
  const bytes = Buffer.from(webpCover.data, 'base64');
  // The synthetic WebP uses an extended header; reject a width beyond the display budget.
  expect(bytes.toString('ascii', 12, 16)).toBe('VP8X');
  bytes.writeUIntLE(640, 24, 3);
  for (const cover of [
    { data: 'invalid-base64', mimeType: 'image/webp' },
    { data: Buffer.from('<svg/>').toString('base64'), mimeType: 'image/jpeg' },
    { data: Buffer.alloc(128 * 1024 + 1).toString('base64'), mimeType: 'image/jpeg' },
    { data: bytes.toString('base64'), mimeType: 'image/webp' },
  ])
    expect(
      (await service.execute({ command: 'create', payload: { book_name: '거부', cover } })).ok,
    ).toBe(false);
  for (const payload of [
    { book_name: '거부', image_url: 'https://example.com/image.jpg' },
    { book_name: '거부', cover_id: '../secret' },
  ])
    expect((await service.execute({ command: 'create', payload })).ok).toBe(false);
  expect(
    (await service.execute({ command: 'coverRead', payload: { id: '../books.vault' } })).ok,
  ).toBe(false);
  expect(library.all()).toEqual([]);
  expect(files()).toEqual([]);
});

test('authenticates covers and blocks image reads while PIN locked', async () => {
  const { library, service, coverPath } = setup();
  const book = library.create({ book_name: '보호된 표지', cover: jpegCover });
  const payload = { id: book.cover_id as string };
  expect(await service.execute({ command: 'coverRead', payload })).toEqual({
    ok: true,
    data: jpegCover,
  });
  await service.execute({ command: 'setPin', payload: { newPin: '0123' } });
  await service.execute({ command: 'lock', payload: {} });
  expect(await service.execute({ command: 'coverRead', payload })).toMatchObject({
    ok: false,
    error: expect.stringContaining('잠겨'),
  });
  await service.execute({ command: 'unlock', payload: { pin: '0123' } });
  const bytes = readFileSync(coverPath(payload.id));
  bytes[bytes.length - 1] ^= 1;
  writeFileSync(coverPath(payload.id), bytes);
  expect(await service.execute({ command: 'coverRead', payload })).toMatchObject({
    ok: false,
    error: expect.stringContaining('손상'),
  });
});

test('backs up every cover and re-encrypts on another key, rejecting missing and modified attachments', async () => {
  const source = setup();
  const saved = source.library.create({ book_name: '백업 표지', cover: webpCover });
  const password = 'cover-backup-password';
  expect(
    (await source.service.execute({ command: 'backupExport', payload: { password } })).ok,
  ).toBe(true);
  const data = (await readBackup(source.archive(), password)) as {
    books: unknown[];
    covers: { id: string; data: string; mimeType: string }[];
  };
  expect(data.covers).toEqual([{ id: saved.cover_id as string, ...webpCover }]);
  expect(source.archive()).not.toContain(webpCover.data);
  const target = setup();
  const previous = target.library.create({ book_name: '대상 기존 책', cover: jpegCover });
  for (const covers of [
    [],
    [data.covers[0], data.covers[0]],
    [{ ...data.covers[0], ...jpegCover }],
  ]) {
    const invalid = await createBackup({ ...data, covers }, password);
    expect(
      (
        await target.service.execute({
          command: 'backupInspect',
          payload: { archive: invalid, password },
        })
      ).ok,
    ).toBe(false);
    expect(target.library.all()).toEqual([previous]);
    expect(target.files()).toHaveLength(1);
  }
  const result = await target.service.execute({
    command: 'backupInspect',
    payload: { archive: source.archive(), password },
  });
  if (!result.ok) throw new Error(result.error);
  const token = (result.data as { token: string }).token;
  expect(
    (
      await target.service.execute({
        command: 'backupRestore',
        payload: { token, confirmation: '복원' },
      })
    ).ok,
  ).toBe(true);
  expect(target.library.all()).toEqual([saved]);
  expect(target.library.readCover(saved.cover_id as string)).toEqual(webpCover);
  expect(target.files()).toEqual([`${saved.cover_id}.vault`]);
  expect(readFileSync(target.coverPath(saved.cover_id as string))).not.toEqual(
    readFileSync(source.coverPath(saved.cover_id as string)),
  );
});

test('migrates a version 1 library without discarding legacy URLs or other fields', () => {
  const { library, path, key } = setup();
  const book = library.create({ book_name: '이전 서재', image_url: 'https://example.com/old.jpg' });
  const db = Database.deserialize(decrypt(readFileSync(path), key));
  library.close();
  db.exec(
    'DROP INDEX books_cover; ALTER TABLE books DROP COLUMN cover_id; PRAGMA user_version = 1;',
  );
  writeFileSync(path, encrypt(db.serialize(), key));
  db.close();
  const migrated = new LibraryDatabase(path, key);
  try {
    expect(migrated.all()).toEqual([book]);
    expect(migrated.stats().missingImages).toBe(1);
  } finally {
    migrated.close();
  }
});
