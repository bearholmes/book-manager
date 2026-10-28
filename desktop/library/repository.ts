import type { Database } from 'bun:sqlite';
import { dirname, join } from 'node:path';
import { z } from 'zod';
import type { Book, BookFilters, BookSort } from '../../contracts/book';
import type { BackupCover } from '../../contracts/cover';
import type { BookPage, LibraryStats } from '../../contracts/desktop';
import { normalizeIsbn } from '../../contracts/isbn';
import { EncryptedStore } from '../storage/encrypted-store';
import { storedBookSchema } from './book-schema';
import { CoverStore, coverUploadSchema, decodeCover } from './cover-store';

type StoredRow = Omit<Book, 'duplicated'> & { duplicated: number };
const toBook = (row: StoredRow): Book => ({ ...row, duplicated: row.duplicated === 1 });
const coverInputSchema = z.object({ cover: coverUploadSchema.nullable().optional() });

/** Library queries and mutations; encryption and connection lifetime belong to EncryptedStore. */
export class LibraryDatabase {
  private readonly store: EncryptedStore;
  private readonly covers: CoverStore;

  constructor(
    readonly path: string,
    key: Buffer,
    legacyPath?: string,
    guard?: Database,
  ) {
    this.store = new EncryptedStore(path, key, legacyPath, guard);
    this.covers = new CoverStore(
      path === ':memory:' ? undefined : join(dirname(path), 'covers'),
      this.store,
    );
    this.collectCovers();
  }

  get revision() {
    return this.store.revision;
  }
  private get db() {
    return this.store.db;
  }
  private mutate<T>(operation: () => T): T {
    try {
      return this.store.mutate(operation);
    } finally {
      if (!this.db.inTransaction) this.collectCovers();
    }
  }

  private coverIds() {
    return new Set(
      this.db
        .query<{ cover_id: string }, []>(
          'SELECT DISTINCT cover_id FROM books WHERE cover_id IS NOT NULL',
        )
        .all()
        .map(({ cover_id }) => cover_id),
    );
  }

  private collectCovers() {
    this.covers.collect(this.coverIds());
  }

  readCover(id: string) {
    if (!this.db.query('SELECT 1 FROM books WHERE cover_id = ? LIMIT 1').get(id))
      throw new Error('표지 이미지를 찾을 수 없습니다.');
    return this.covers.read(id);
  }

  backupCovers(): BackupCover[] {
    return [...this.coverIds()].map((id) => ({ id, ...this.covers.read(id) }));
  }

  getSetting(key: string) {
    return this.db
      .query<{ value: string }, [string]>('SELECT value FROM settings WHERE key = ?')
      .get(key)?.value;
  }

  setSetting(key: string, value: string) {
    this.mutate(() =>
      this.db
        .query(
          'INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
        )
        .run(key, value),
    );
  }

  deleteSetting(key: string) {
    this.mutate(() => this.db.query('DELETE FROM settings WHERE key = ?').run(key));
  }

  replaceBooks(books: Book[], covers: BackupCover[] = []) {
    this.mutate(() => {
      for (const cover of covers) {
        if (decodeCover({ data: cover.data, mimeType: cover.mimeType }).id !== cover.id)
          throw new Error('백업 표지 이미지가 손상되었습니다.');
        this.covers.write({ data: cover.data, mimeType: cover.mimeType });
      }
      this.db.query('DELETE FROM books').run();
      for (const book of books) this.create(book);
    });
  }

  reset() {
    this.mutate(() => {
      this.db.query('DELETE FROM books').run();
      this.db.query('DELETE FROM settings').run();
    });
  }

  list(
    options: { filters?: BookFilters; sort?: BookSort; offset?: number; limit?: number } = {},
  ): BookPage {
    const filters = options.filters ?? {};
    const conditions: string[] = [];
    const values: string[] = [];
    for (const field of ['topic', 'purchase_place', 'condition'] as const) {
      if (filters[field]) {
        conditions.push(`${field} = ?`);
        values.push(filters[field]);
      }
    }
    if (filters.search?.trim()) {
      conditions.push(
        "(instr(lower(book_name), lower(?)) > 0 OR instr(lower(COALESCE(author,'')), lower(?)) > 0 OR instr(lower(COALESCE(publisher,'')), lower(?)) > 0 OR instr(COALESCE(isbn13,''), ?) > 0)",
      );
      values.push(...Array<string>(4).fill(filters.search.trim()));
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const field = options.sort?.field ?? 'created_at';
    if (!['created_at', 'book_name', 'purchase_date'].includes(field))
      throw new Error('잘못된 정렬 기준입니다.');
    const direction = options.sort?.order === 'asc' ? 'ASC' : 'DESC';
    const offset = options.offset ?? 0;
    const limit = options.limit ?? 60;
    const totalCount =
      this.db
        .query<{ count: number }, string[]>(`SELECT count(*) as count FROM books ${where}`)
        .get(...values)?.count ?? 0;
    const books = this.db
      .query<StoredRow, (string | number)[]>(
        `SELECT * FROM books ${where} ORDER BY ${field} ${direction}, id ASC LIMIT ? OFFSET ?`,
      )
      .all(...values, limit, offset)
      .map(toBook);
    const nextOffset = offset + books.length;
    return { books, totalCount, nextOffset, hasMore: nextOffset < totalCount };
  }

  findDuplicates(isbn: string, excludeId?: string) {
    const canonical = normalizeIsbn(isbn);
    if (!canonical) return [];
    return this.db
      .query<{ id: string; book_name: string; isbn13: string }, []>(
        'SELECT id, book_name, isbn13 FROM books WHERE isbn13 IS NOT NULL',
      )
      .all()
      .filter((book) => book.id !== excludeId && normalizeIsbn(book.isbn13) === canonical)
      .map(({ id, book_name }) => ({ id, book_name }));
  }

  all(): Book[] {
    return this.db
      .query<StoredRow, []>('SELECT * FROM books ORDER BY created_at DESC, id ASC')
      .all()
      .map(toBook);
  }

  create(input: unknown): Book {
    return this.mutate(() => {
      const parsed = storedBookSchema.parse(input);
      const { cover } = coverInputSchema.parse(input);
      if (cover) {
        parsed.cover_id = this.covers.write(cover);
        parsed.image_url = null;
      }
      if (parsed.cover_id) this.covers.read(parsed.cover_id);
      const now = new Date().toISOString();
      const book: Book = {
        ...parsed,
        id: parsed.id ?? crypto.randomUUID(),
        created_at: parsed.created_at ?? now,
        updated_at: parsed.updated_at ?? now,
      };
      const fields = Object.keys(book);
      this.db
        .query(
          `INSERT INTO books (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`,
        )
        .run(...Object.values(book).map((v) => (typeof v === 'boolean' ? Number(v) : v)));
      return book;
    });
  }

  update(id: string, input: unknown): Book {
    return this.mutate(() => {
      const existing = this.db
        .query<StoredRow, [string]>('SELECT * FROM books WHERE id = ?')
        .get(id);
      if (!existing) throw new Error('도서를 찾을 수 없습니다.');
      const updates = storedBookSchema
        .omit({ id: true, created_at: true, updated_at: true })
        .partial()
        // Zod 4 applies defaults inside optional fields; partial edits must preserve stored values.
        .extend({
          currency: storedBookSchema.shape.currency.removeDefault().optional(),
          cover_id: storedBookSchema.shape.cover_id.removeDefault().optional(),
          duplicated: storedBookSchema.shape.duplicated.removeDefault().optional(),
        })
        .parse(input);
      const { cover } = coverInputSchema.parse(input);
      if (cover !== undefined) {
        updates.cover_id = cover ? this.covers.write(cover) : null;
        updates.image_url = null;
      }
      if (updates.cover_id) this.covers.read(updates.cover_id);
      const book: Book = { ...toBook(existing), ...updates, updated_at: new Date().toISOString() };
      const { id: _id, ...fields } = book;
      this.db
        .query(
          `UPDATE books SET ${Object.keys(fields)
            .map((field) => `${field} = ?`)
            .join(',')} WHERE id = ?`,
        )
        .run(...Object.values(fields).map((v) => (typeof v === 'boolean' ? Number(v) : v)), id);
      return book;
    });
  }

  delete(id: string) {
    return this.mutate(() => {
      const result = this.db.query('DELETE FROM books WHERE id = ?').run(id);
      if (!result.changes) throw new Error('도서를 찾을 수 없습니다.');
    });
  }

  stats(): LibraryStats {
    return {
      total:
        this.db.query<{ count: number }, []>('SELECT count(*) AS count FROM books').get()?.count ??
        0,
      missingImages:
        this.db
          .query<{ count: number }, []>(
            'SELECT count(*) AS count FROM books WHERE cover_id IS NULL',
          )
          .get()?.count ?? 0,
      topics: this.db
        .query<{ topic: string; count: number }, []>(
          "SELECT COALESCE(NULLIF(topic,''),'미분류') AS topic, count(*) AS count FROM books GROUP BY 1 ORDER BY count DESC, topic",
        )
        .all(),
      places: this.db
        .query<{ purchase_place: string; count: number }, []>(
          "SELECT COALESCE(NULLIF(purchase_place,''),'미분류') AS purchase_place, count(*) AS count FROM books GROUP BY 1 ORDER BY count DESC, purchase_place",
        )
        .all(),
      years: this.db
        .query<{ year: number; count: number }, []>(
          "SELECT CAST(substr(purchase_date,1,4) AS INTEGER) AS year, count(*) AS count FROM books WHERE purchase_date GLOB '[0-9][0-9][0-9][0-9]-??-??' GROUP BY 1 ORDER BY year",
        )
        .all(),
    };
  }

  close() {
    this.covers.close();
    this.store.close();
  }
}
