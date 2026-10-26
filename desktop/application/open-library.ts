import { join } from 'node:path';
import { LibraryDatabase } from '../library/repository';
import { loadDataKey } from '../security/key-store';
import { acquireStoreGuard } from '../storage/store-guard';

/** Lock before loading/creating keys so concurrent first launches cannot replace each other's key. */
export async function openLibrary(
  directory: string,
  readKey: (path: string) => Promise<Buffer> = loadDataKey,
) {
  const path = join(directory, 'books.vault');
  const guard = acquireStoreGuard(path);
  let key: Buffer | undefined;
  try {
    key = await readKey(path);
    return new LibraryDatabase(path, key, join(directory, 'books.sqlite'), guard);
  } catch (error) {
    try {
      guard.close();
    } catch {
      /* The constructor may already have released it. */
    }
    throw error;
  } finally {
    key?.fill(0);
  }
}
