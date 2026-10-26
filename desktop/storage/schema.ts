import type { Database } from 'bun:sqlite';

export function initializeSchema(db: Database) {
  const version = db.query<{ user_version: number }, []>('PRAGMA user_version').get();
  if ((version?.user_version ?? 0) > 1)
    throw new Error('새 버전 앱에서 만든 데이터베이스입니다. 앱을 업데이트해주세요.');
  db.transaction(() => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS books (
          id TEXT PRIMARY KEY, book_name TEXT NOT NULL CHECK(length(book_name) > 0),
          isbn13 TEXT, author TEXT, publisher TEXT, publication_date TEXT, condition TEXT,
          purchase_price REAL CHECK(purchase_price >= 0), currency TEXT NOT NULL DEFAULT 'KRW',
          purchase_price_sec REAL CHECK(purchase_price_sec >= 0), currency_sec TEXT,
          purchase_date TEXT, purchase_place TEXT, topic TEXT, image_url TEXT,
          duplicated INTEGER NOT NULL DEFAULT 0 CHECK(duplicated IN (0,1)), comment TEXT,
          created_at TEXT NOT NULL, updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS books_created ON books(created_at, id);
        CREATE INDEX IF NOT EXISTS books_topic ON books(topic);
        CREATE INDEX IF NOT EXISTS books_isbn ON books(isbn13);
        CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
        PRAGMA user_version = 1;
      `);
  })();
}
