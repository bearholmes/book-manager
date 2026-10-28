import { Database } from 'bun:sqlite';
import { afterEach, describe, expect, test } from 'bun:test';
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
import { decrypt } from '../security/encryption';

const resources: { directory: string; library: LibraryDatabase }[] = [];
function setup() {
  const directory = mkdtempSync(join(tmpdir(), 'reading-desk-security-'));
  const path = join(directory, 'books.vault');
  const key = randomBytes(32);
  const library = new LibraryDatabase(path, key);
  resources.push({ directory, library });
  let archive = '';
  const service = new DesktopService(library, async (content, extension) => {
    if (extension === 'rdbackup') archive = content;
    const target = join(directory, `backup.${extension}`);
    writeFileSync(target, content);
    return target;
  });
  return { directory, path, key, library, service, archive: () => archive };
}
afterEach(() => {
  for (const { directory, library } of resources.splice(0)) {
    library.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
const password = 'correct-backup-password';

describe('encrypted persistence', () => {
  test('keeps SQLite headers, book fields and PIN verifier out of persisted user data', () => {
    const { library, path, key, directory } = setup();
    library.create({
      book_name: 'SECRET_BOOK_NAME_112233',
      isbn13: '9781122334455',
      comment: 'PRIVATE_COMMENT',
    });
    library.setSetting('pin', 'PRIVATE_PIN_VERIFIER');
    const bytes = readFileSync(path);
    for (const value of [
      'SQLite format 3',
      'SECRET_BOOK_NAME_112233',
      'PRIVATE_COMMENT',
      'PRIVATE_PIN_VERIFIER',
    ])
      expect(bytes.includes(Buffer.from(value))).toBe(false);
    expect(existsSync(`${path}-wal`)).toBe(false);
    expect(readdirSync(directory).some((file) => file.endsWith('.tmp'))).toBe(false);
    const db = Database.deserialize(decrypt(bytes, key));
    expect(db.query('SELECT count(*) AS count FROM books').get()).toEqual({ count: 1 });
    db.close();
    library.close();
    expect(() => new LibraryDatabase(path, randomBytes(32))).toThrow();
    expect(readFileSync(path)).toEqual(bytes);
    const tampered = Buffer.from(bytes);
    tampered[tampered.length - 1] ^= 1;
    writeFileSync(path, tampered);
    expect(() => new LibraryDatabase(path, key)).toThrow('손상');
    expect(readFileSync(path)).toEqual(tampered);
  });

  test('rolls memory back if encrypted persistence fails, preserving the previous saved file', () => {
    const { library, path } = setup();
    const book = library.create({ book_name: '기존 도서' });
    const bytes = readFileSync(path);
    renameSync(path, `${path}.saved`);
    mkdirSync(path);
    expect(() => library.replaceBooks([{ ...book, book_name: '새 도서' }])).toThrow();
    expect(library.all()).toEqual([book]);
    expect(readFileSync(`${path}.saved`)).toEqual(bytes);
    rmSync(path, { recursive: true });
    renameSync(`${path}.saved`, path);
  });

  test('prevents a second writer and releases its OS lock after closing', () => {
    const { path, library, key } = setup();
    expect(() => new LibraryDatabase(path, key)).toThrow();
    library.close();
    const next = new LibraryDatabase(path, key);
    next.close();
  });

  test('converts the prior local SQLite file and removes plaintext only after encrypted save succeeds', () => {
    const { library, path, key, directory } = setup();
    const book = library.create({ book_name: '이전 로컬 도서' });
    const plaintext = decrypt(readFileSync(path), key);
    library.close();
    rmSync(path);
    const legacy = join(directory, 'books.sqlite');
    writeFileSync(legacy, plaintext);
    const encrypted = new LibraryDatabase(path, key, legacy);
    expect(encrypted.all()).toEqual([book]);
    expect(existsSync(legacy)).toBe(false);
    encrypted.close();
  });
});

describe('password-encrypted backup', () => {
  test('uses independent encryption, random salts/nonces and rejects a wrong password or modified file', async () => {
    const first = await createBackup({ title: 'BACKUP_SECRET' }, password);
    const second = await createBackup({ title: 'BACKUP_SECRET' }, password);
    expect(first).not.toBe(second);
    expect(first).not.toContain('BACKUP_SECRET');
    expect(await readBackup(first, password)).toEqual({ title: 'BACKUP_SECRET' });
    await expect(readBackup(first, 'wrong-password-1234')).rejects.toThrow('손상');
    const parsed = JSON.parse(first);
    const bytes = Buffer.from(parsed.data, 'base64');
    bytes[bytes.length - 1] ^= 1;
    parsed.data = bytes.toString('base64');
    await expect(readBackup(JSON.stringify(parsed), password)).rejects.toThrow('손상');
    await expect(readBackup('{"version":99}', password)).rejects.toThrow('지원하지');
    await expect(createBackup({}, '1234')).rejects.toThrow();
  });

  test('previews and replaces the entire library on another key, preserves the destination PIN and consumes the token', async () => {
    const source = setup();
    const saved = source.library.create({
      book_name: '백업 도서',
      isbn13: '9781122334455',
      comment: '메모',
      duplicated: true,
    });
    await source.service.execute({ command: 'setPin', payload: { newPin: '0123' } });
    expect(
      (await source.service.execute({ command: 'backupExport', payload: { password } })).ok,
    ).toBe(true);
    const target = setup();
    target.library.create({ book_name: '덮어쓸 도서' });
    await target.service.execute({ command: 'setPin', payload: { newPin: '4321' } });
    const pin = target.library.getSetting('pin');
    const preview = await target.service.execute({
      command: 'backupInspect',
      payload: { archive: source.archive(), password },
    });
    expect(preview).toMatchObject({ ok: true, data: { count: 1, currentCount: 1 } });
    if (!preview.ok) throw new Error('preview failed');
    const { token } = preview.data as { token: string };
    expect(
      (
        await target.service.execute({
          command: 'backupRestore',
          payload: { token, confirmation: '복원', currentPin: '9999' },
        })
      ).ok,
    ).toBe(false);
    expect(target.library.all()[0]?.book_name).toBe('덮어쓸 도서');
    expect(
      (
        await target.service.execute({
          command: 'backupRestore',
          payload: { token, confirmation: '복원', currentPin: '4321' },
        })
      ).ok,
    ).toBe(true);
    expect(target.library.all()).toEqual([saved]);
    expect(target.library.getSetting('pin')).toBe(pin);
    expect(
      (
        await target.service.execute({
          command: 'backupRestore',
          payload: { token, confirmation: '복원', currentPin: '4321' },
        })
      ).ok,
    ).toBe(false);
    target.library.close();
    const reopened = new LibraryDatabase(target.path, target.key);
    expect(reopened.all()).toEqual([saved]);
    reopened.close();
  });

  test('leaves current data unchanged on bad passwords, duplicate IDs, changed previews and missing confirmation', async () => {
    const { library, service } = setup();
    const book = library.create({ book_name: '보존' });
    const archive = await createBackup(
      {
        format: 'reading-desk-data',
        version: 1,
        createdAt: new Date().toISOString(),
        books: [book],
      },
      password,
    );
    expect(
      (
        await service.execute({
          command: 'backupInspect',
          payload: { archive, password: 'wrong-password-123' },
        })
      ).ok,
    ).toBe(false);
    const duplicate = await createBackup(
      {
        format: 'reading-desk-data',
        version: 1,
        createdAt: new Date().toISOString(),
        books: [book, book],
      },
      password,
    );
    expect(
      (
        await service.execute({
          command: 'backupInspect',
          payload: { archive: duplicate, password },
        })
      ).ok,
    ).toBe(false);
    const preview = await service.execute({
      command: 'backupInspect',
      payload: { archive, password },
    });
    if (!preview.ok) throw new Error('preview failed');
    const { token } = preview.data as { token: string };
    expect((await service.execute({ command: 'backupRestore', payload: { token } })).ok).toBe(
      false,
    );
    library.update(book.id, { comment: '변경' });
    expect(
      (
        await service.execute({
          command: 'backupRestore',
          payload: { token, confirmation: '복원' },
        })
      ).ok,
    ).toBe(false);
    expect(library.all()).toEqual([{ ...book, comment: '변경', updated_at: expect.any(String) }]);
  });

  test('reset requires confirmation and current PIN, clears books/PIN durably and leaves exported backups intact', async () => {
    const { library, service, directory, path, key } = setup();
    library.create({ book_name: '초기화 대상' });
    await service.execute({ command: 'setPin', payload: { newPin: '0123' } });
    await service.execute({ command: 'backupExport', payload: { password } });
    expect((await service.execute({ command: 'reset', payload: { currentPin: '0123' } })).ok).toBe(
      false,
    );
    expect(
      (
        await service.execute({
          command: 'reset',
          payload: { confirmation: '초기화', currentPin: '9999' },
        })
      ).ok,
    ).toBe(false);
    expect(library.stats().total).toBe(1);
    expect(
      await service.execute({
        command: 'reset',
        payload: { confirmation: '초기화', currentPin: '0123' },
      }),
    ).toMatchObject({ ok: true, data: { enabled: false, locked: false } });
    expect(library.all()).toEqual([]);
    expect(library.getSetting('pin')).toBeUndefined();
    expect(decrypt(readFileSync(path), key).includes(Buffer.from('초기화 대상'))).toBe(false);
    expect(existsSync(join(directory, 'backup.rdbackup'))).toBe(true);
    library.close();
    const reopened = new LibraryDatabase(path, key);
    expect(reopened.all()).toEqual([]);
    expect(reopened.getSetting('pin')).toBeUndefined();
    reopened.close();
  });
});
