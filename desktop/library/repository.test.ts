import { afterEach, describe, expect, test } from 'bun:test';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DesktopService } from '../application/command-service';
import { LibraryDatabase } from './repository';

const directories: string[] = [];
const databases: LibraryDatabase[] = [];
function setup() {
  const directory = mkdtempSync(join(tmpdir(), 'reading-desk-test-'));
  directories.push(directory);
  const path = join(directory, 'books.vault');
  const key = randomBytes(32);
  const library = new LibraryDatabase(path, key);
  databases.push(library);
  const service = new DesktopService(library, async () => null);
  return { directory, path, key, library, service };
}
afterEach(() => {
  for (const db of databases.splice(0)) {
    try {
      db.close();
    } catch {
      /* already closed in restart test */
    }
  }
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

describe('SQLite library', () => {
  test('normalizes empty optional form fields without rejecting a new book', () => {
    const { library } = setup();
    expect(
      library.create({
        book_name: '제목만 있는 책',
        condition: '',
        author: '',
        image_url: '',
        purchase_price: null,
      }),
    ).toMatchObject({ condition: null, author: null, image_url: null, purchase_price: null });
  });
  test('CRUD, literal search, ISBN, stable pagination and grouped statistics', () => {
    const { library } = setup();
    const first = library.create({
      book_name: "O'Reilly 100%_",
      isbn13: '9781234567890',
      topic: '개발',
      purchase_place: '서점',
      purchase_date: '2025-03-01',
      purchase_price: 20000,
      duplicated: true,
    });
    library.create({
      book_name: '다른 책',
      topic: '개발',
      purchase_date: '2024-01-01',
      image_url: 'https://example.com/book.jpg',
    });
    expect(library.list({ filters: { search: "O'Reilly 100%_" } }).books).toEqual([first]);
    expect(library.list({ filters: { search: '9781234567890' } }).totalCount).toBe(1);
    const page = library.list({ limit: 1 });
    const next = library.list({ limit: 1, offset: page.nextOffset });
    expect(page.hasMore).toBe(true);
    expect(next.hasMore).toBe(false);
    expect(next.books[0]?.id).not.toBe(page.books[0]?.id);
    expect(library.stats()).toMatchObject({
      total: 2,
      missingImages: 1,
      topics: [{ topic: '개발', count: 2 }],
      years: [
        { year: 2024, count: 1 },
        { year: 2025, count: 1 },
      ],
    });
    expect(library.update(first.id, { comment: '메모' })).toMatchObject({
      book_name: first.book_name,
      isbn13: first.isbn13,
      purchase_price: 20000,
      duplicated: true,
      comment: '메모',
    });
    library.delete(first.id);
    expect(library.stats().total).toBe(1);
  });

  test('persists all fields across process-style reopen', () => {
    const { library, path, key } = setup();
    const book = library.create({
      book_name: '보존할 책',
      currency: 'USD',
      purchase_price_sec: 5000,
      currency_sec: 'KRW',
      publication_date: '2020-01-01',
      duplicated: true,
    });
    library.close();
    const reopened = new LibraryDatabase(path, key);
    databases.push(reopened);
    expect(reopened.all()).toEqual([book]);
  });

  test('replaces atomically and rejects invalid data or duplicate IDs without partial writes', () => {
    const { library } = setup();
    const book = library.create({ book_name: '기존 도서' });
    expect(() =>
      library.replaceBooks([
        { ...book, id: 'new', book_name: '유효한 책' },
        { ...book, id: 'invalid', book_name: '' },
      ]),
    ).toThrow();
    expect(library.all()).toEqual([book]);
    expect(() => library.replaceBooks([book, book])).toThrow();
    expect(library.all()).toEqual([book]);
    expect(() => library.create({ book_name: '도서', purchase_price: -1 })).toThrow();
  });
});

describe('optional PIN lock', () => {
  test('defaults to unlocked, hashes PIN, protects every data command and starts locked after restart', async () => {
    const { library, service } = setup();
    expect(service.status()).toEqual({ enabled: false, locked: false });
    expect((await service.execute({ command: 'setPin', payload: { newPin: '0123' } })).ok).toBe(
      true,
    );
    const record = JSON.parse(library.getSetting('pin') ?? '{}');
    expect(record.hash).not.toBe('0123');
    expect(record.salt).toHaveLength(32);
    const restarted = new DesktopService(library, async () => null);
    expect(restarted.status()).toEqual({ enabled: true, locked: true });
    for (const command of [
      'list',
      'stats',
      'create',
      'update',
      'delete',
      'info',
      'setPin',
      'backupExport',
      'backupInspect',
      'backupRestore',
      'reset',
    ] as const) {
      expect(await restarted.execute({ command, payload: {} })).toMatchObject({
        ok: false,
        error: expect.stringContaining('잠겨'),
      });
    }
    expect((await restarted.execute({ command: 'unlock', payload: { pin: '9999' } })).ok).toBe(
      false,
    );
    expect((await restarted.execute({ command: 'unlock', payload: { pin: '0123' } })).ok).toBe(
      true,
    );
    expect(
      (
        await restarted.execute({
          command: 'setPin',
          payload: { currentPin: '9999', newPin: null },
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await restarted.execute({
          command: 'setPin',
          payload: { currentPin: '0123', newPin: '4321' },
        })
      ).ok,
    ).toBe(true);
    await restarted.execute({ command: 'lock', payload: {} });
    expect((await restarted.execute({ command: 'unlock', payload: { pin: '0123' } })).ok).toBe(
      false,
    );
    expect((await restarted.execute({ command: 'unlock', payload: { pin: '4321' } })).ok).toBe(
      true,
    );
    expect(
      (
        await restarted.execute({
          command: 'setPin',
          payload: { currentPin: '4321', newPin: null },
        })
      ).ok,
    ).toBe(true);
    expect(new DesktopService(library, async () => null).status()).toEqual({
      enabled: false,
      locked: false,
    });
  });

  test('rejects malformed commands, PINs, sort injection and throttles repeated PIN failures', async () => {
    const { service } = setup();
    expect((await service.execute({ command: 'setPin', payload: { newPin: '12x4' } })).ok).toBe(
      false,
    );
    expect(
      (
        await service.execute({
          command: 'list',
          payload: { sort: { field: 'id; DROP TABLE books;', order: 'desc' } },
        })
      ).ok,
    ).toBe(false);
    await service.execute({ command: 'setPin', payload: { newPin: '0123' } });
    await service.execute({ command: 'lock', payload: {} });
    for (let attempt = 0; attempt < 5; attempt++)
      await service.execute({ command: 'unlock', payload: { pin: '9999' } });
    expect(await service.execute({ command: 'unlock', payload: { pin: '0123' } })).toMatchObject({
      ok: false,
      error: expect.stringContaining('30초'),
    });
  });
});
