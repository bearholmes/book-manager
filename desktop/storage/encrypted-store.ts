import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, readFileSync, unlinkSync } from 'node:fs';
import { dirname } from 'node:path';
import { decrypt, encrypt } from '../security/encryption';
import { atomicWrite } from './atomic-file';
import { initializeSchema } from './schema';
import { acquireStoreGuard } from './store-guard';

/** Owns the SQLite connection, process lock, encrypted snapshots, and durable transactions. */
export class EncryptedStore {
  readonly db: Database;
  private readonly guard?: Database;
  private readonly key: Buffer;
  private closed = false;
  revision = 0;

  constructor(
    readonly path: string,
    key: Buffer,
    legacyPath?: string,
    guard?: Database,
  ) {
    if (key.length !== 32) throw new Error('암호화 키 형식이 잘못되었습니다.');
    this.key = Buffer.from(key);
    let legacy: Database | undefined;
    let opened: Database | undefined;
    try {
      if (path !== ':memory:') {
        mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
        // This auxiliary database contains no user data. SQLite's OS lock prevents two
        // processes from replacing independent in-memory snapshots and releases on crashes.
        this.guard = guard ?? acquireStoreGuard(path);
      }
      if (legacyPath && existsSync(legacyPath)) {
        legacy = new Database(legacyPath);
        legacy.exec(
          'PRAGMA busy_timeout = 0; PRAGMA wal_checkpoint(TRUNCATE); PRAGMA journal_mode = DELETE; BEGIN EXCLUSIVE;',
        );
      }
      this.db = opened =
        path !== ':memory:' && existsSync(path)
          ? Database.deserialize(decrypt(readFileSync(path), this.key), { strict: true })
          : legacy
            ? Database.deserialize(legacy.serialize(), { strict: true })
            : new Database(':memory:', { strict: true });
      this.db.exec(
        'PRAGMA journal_mode = MEMORY; PRAGMA temp_store = MEMORY; PRAGMA secure_delete = ON; PRAGMA foreign_keys = ON;',
      );
      initializeSchema(this.db);
      if (legacy) {
        for (const [table, order] of [
          ['books', 'id'],
          ['settings', 'key'],
        ]) {
          const sql = `SELECT * FROM ${table} ORDER BY ${order}`;
          if (
            JSON.stringify(legacy.query(sql).all()) !== JSON.stringify(this.db.query(sql).all())
          ) {
            throw new Error('기존 저장소와 암호화 저장소의 내용이 다릅니다. 원본은 보존했습니다.');
          }
        }
      }
      this.persist();
      if (legacy && legacyPath) {
        legacy.close();
        legacy = undefined;
        for (const file of [legacyPath, `${legacyPath}-wal`, `${legacyPath}-shm`]) {
          if (existsSync(file)) unlinkSync(file);
        }
      }
    } catch (error) {
      legacy?.close();
      opened?.close();
      this.guard?.close();
      this.key.fill(0);
      throw error;
    }
  }

  private persist() {
    if (this.path === ':memory:') return;
    const plaintext = this.db.serialize();
    try {
      atomicWrite(this.path, encrypt(plaintext, this.key));
    } finally {
      plaintext.fill(0);
    }
  }

  mutate<T>(operation: () => T): T {
    if (this.db.inTransaction) return operation();
    const result = this.db.transaction(() => {
      const result = operation();
      this.persist();
      return result;
    })();
    this.revision += 1;
    return result;
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.db.close();
    this.guard?.close();
    this.key.fill(0);
  }
}
