import { afterEach, expect, test } from 'bun:test';
import { randomBytes } from 'node:crypto';
import type { CodexSettings, LookupResult } from '../../contracts/book-lookup';
import { normalizeIsbn } from '../../contracts/isbn';
import { DesktopService } from '../application/command-service';
import { LibraryDatabase } from '../library/repository';
import { codexArgs } from './codex';
import { imageMime, isPublicAddress } from './download-cover';
import { parseResult } from './schema';
import { BookLookupService } from './service';

const settings: CodexSettings = {
  enabled: true,
  executable: '/bin/codex',
  model: 'gpt-6.1-terra',
  reasoningEffort: 'medium',
};
const empty: LookupResult = { candidates: [] };
const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const fn of cleanup.splice(0)) fn();
});
test('canonical ISBN handles ISBN10, hyphens and invalid checksums', () => {
  expect(normalizeIsbn('89-6626-095-0')).toBe('9788966260959');
  expect(normalizeIsbn('978-89-6626-095-9')).toBe('9788966260959');
  expect(normalizeIsbn('9788966260958')).toBeNull();
  expect(normalizeIsbn('not an ISBN')).toBeNull();
});
test('duplicate lookup searches all books and excludes the edited book', () => {
  const db = new LibraryDatabase(':memory:', randomBytes(32));
  cleanup.push(() => db.close());
  const first = db.create({ book_name: '기존 책', isbn13: '8966260950' });
  db.create({ book_name: '다른 책', isbn13: '9788966260958' });
  expect(db.findDuplicates('978-8966260959')).toEqual([{ id: first.id, book_name: '기존 책' }]);
  expect(db.findDuplicates('9788966260959', first.id)).toEqual([]);
});
test('lookup does not block commands; locking discards late results and cancels process', async () => {
  let finish!: (value: { result: LookupResult; searched: boolean }) => void;
  let signal!: AbortSignal;
  const lookup = new BookLookupService({
    settings: { get: async () => settings, set: async () => settings },
    openUrl: () => {},
    runner: async (_settings, _isbn, abort) => {
      signal = abort;
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
  });
  const db = new LibraryDatabase(':memory:', randomBytes(32));
  cleanup.push(() => {
    lookup.dispose();
    db.close();
  });
  const service = new DesktopService(db, async () => null, lookup);
  await service.execute({ command: 'setPin', payload: { newPin: '1234' } });
  const started = await service.execute({
    command: 'lookupStart',
    payload: { isbn: '9788966260959', requestId: 'request' },
  });
  expect(started.ok).toBe(true);
  const { jobId } = (started as { data: { jobId: string } }).data;
  expect(await lookup.start({ isbn: '9788966260959', requestId: 'request' })).toEqual({ jobId });
  expect((await service.execute({ command: 'list', payload: {} })).ok).toBe(true);
  await service.execute({ command: 'lock', payload: {} });
  expect(signal.aborted).toBe(true);
  finish({ result: empty, searched: true });
  await Promise.resolve();
  await Promise.resolve();
  expect(lookup.status({ jobId }).state).toBe('cancelled');
  expect((await service.execute({ command: 'lookupStatus', payload: { jobId } })).ok).toBe(false);
});
test('model/effort are separate arguments and malformed dates do not enter the form', () => {
  const args = codexArgs({ ...settings, reasoningEffort: 'high' }, '/tmp/lookup');
  expect(args).toContain('gpt-6.1-terra');
  expect(args).toContain('model_reasoning_effort="high"');
  const result = parseResult({
    candidates: [
      {
        title: '책',
        author: null,
        publisher: null,
        publicationDate: '2026-10',
        reportedIsbn: null,
        sources: [{ label: 'bad', url: 'javascript:alert(1)' }],
        covers: [],
        notes: [],
      },
    ],
  });
  expect(result.candidates[0]?.publicationDate).toBeNull();
  expect(result.candidates[0]?.sources).toEqual([]);
});
test('image download boundaries reject private and mapped addresses and non-images', () => {
  for (const ip of [
    '127.0.0.1',
    '10.0.0.1',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.169.254',
    '::1',
    '::ffff:127.0.0.1',
    'fc00::1',
  ])
    expect(isPublicAddress(ip)).toBe(false);
  expect(isPublicAddress('8.8.8.8')).toBe(true);
  expect(imageMime(Buffer.from('<html>not an image</html>'))).toBeNull();
});

test('disabled helper rejects lookup and switching off cancels existing jobs', async () => {
  let saved = { ...settings };
  let aborted = false;
  const service = new BookLookupService({
    settings: {
      get: async () => saved,
      set: async (value) => {
        saved = value as CodexSettings;
        return saved;
      },
    },
    openUrl: () => {},
    runner: async (_settings, _isbn, signal) => {
      signal.addEventListener('abort', () => {
        aborted = true;
      });
      return new Promise(() => {});
    },
  });
  const job = await service.start({ isbn: '9788966260959', requestId: 'enabled-test' });
  await service.saveSettings({ ...settings, enabled: false });
  expect(aborted).toBe(true);
  expect(service.status(job).state).toBe('cancelled');
  expect(service.start({ isbn: '9788966260959', requestId: 'disabled-test' })).rejects.toThrow(
    'AI 도우미를 켜주세요',
  );
});
