import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Utils } from 'electrobun/main';
import type { ExportWriter } from '../backup/backup-service';

export const writeNativeExport: ExportWriter = async (content, extension) => {
  const [directory] = await Utils.openFileDialog({
    canChooseFiles: false,
    canChooseDirectory: true,
    allowsMultipleSelection: false,
  });
  if (!directory) return null;
  const path = join(
    directory,
    `books-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`,
  );
  await writeFile(path, content, { flag: 'wx', mode: 0o600 });
  return path;
};
