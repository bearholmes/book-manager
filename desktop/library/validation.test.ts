import { afterEach, expect, test } from 'bun:test';
import { randomBytes } from 'node:crypto';
import type { CommandRequest } from '../../contracts/desktop';
import { DesktopService } from '../application/command-service';
import { LibraryDatabase } from './repository';

const libraries: LibraryDatabase[] = [];
function memoryLibrary() {
  const library = new LibraryDatabase(':memory:', randomBytes(32));
  libraries.push(library);
  return library;
}
afterEach(() => {
  for (const library of libraries.splice(0)) library.close();
});

test('invalid dates cannot create, update or partially replace books', () => {
  const library = memoryLibrary();
  const book = library.create({
    book_name: '기존 도서',
    publication_date: '2000-02-29',
    purchase_date: '',
  });
  expect(book.purchase_date).toBeNull();
  for (const invalid of ['not-a-date', '2026-02-29', '1900-02-29', '2026-04-31', '2026-01']) {
    expect(() => library.create({ book_name: '거부할 도서', publication_date: invalid })).toThrow(
      '날짜',
    );
    expect(() => library.update(book.id, { purchase_date: invalid })).toThrow('날짜');
    expect(() =>
      library.replaceBooks([
        { ...book, id: 'valid' },
        { ...book, id: 'invalid', purchase_date: invalid },
      ]),
    ).toThrow('날짜');
    expect(library.all()).toEqual([book]);
  }
});

test('retired plaintext commands cannot read or replace library data', async () => {
  const library = memoryLibrary();
  const book = library.create({ book_name: '보존할 도서' });
  let writes = 0;
  const service = new DesktopService(library, async () => {
    writes += 1;
    return null;
  });
  for (const command of ['import', 'export']) {
    const request = { command, payload: { json: '[]' } } as unknown as CommandRequest;
    expect(await service.execute(request)).toMatchObject({
      ok: false,
      error: '지원하지 않는 요청입니다.',
    });
  }
  expect(writes).toBe(0);
  expect(library.all()).toEqual([book]);
});
