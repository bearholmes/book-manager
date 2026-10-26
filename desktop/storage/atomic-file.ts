import { randomUUID } from 'node:crypto';
import { closeSync, fsyncSync, openSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function atomicWrite(path: string, data: Uint8Array): void {
  const temporary = `${path}.${randomUUID()}.tmp`;
  let descriptor: number | undefined;
  try {
    descriptor = openSync(temporary, 'wx', 0o600);
    writeFileSync(descriptor, data);
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;
    renameSync(temporary, path);
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    try {
      unlinkSync(temporary);
    } catch {
      /* renamed or never created */
    }
  }
  // Directory fsync is supported on Unix. Once renamed, unsupported directory sync must not
  // report a failed write and roll back memory while leaving newer data on disk.
  if (process.platform !== 'win32') {
    let directory: number | undefined;
    try {
      directory = openSync(dirname(path), 'r');
      fsyncSync(directory);
    } catch {
      /* encrypted file was already synced and atomically installed */
    } finally {
      if (directory !== undefined) closeSync(directory);
    }
  }
}
