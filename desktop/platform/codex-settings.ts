import { constants, accessSync, readdirSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import type { CodexSettings } from '../../contracts/book-lookup';
import { settingsSchema } from '../book-lookup/schema';

export class CodexSettingsFile {
  constructor(private readonly path: string) {}
  async get(): Promise<CodexSettings> {
    let saved: CodexSettings | undefined;
    try {
      saved = settingsSchema.parse(JSON.parse(await readFile(this.path, 'utf8')));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT')
        throw new Error('도우미 설정을 읽지 못했습니다. 설정 파일을 확인해주세요.');
    }
    let nvm: string[] = [];
    const nvmRoot = join(homedir(), '.nvm', 'versions', 'node');
    try {
      nvm = readdirSync(nvmRoot)
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
        .map((v) => join(nvmRoot, v, 'bin', 'codex'));
    } catch {
      /* nvm is optional. */
    }
    const candidates = [
      ...(saved ? [saved.executable] : []),
      join(homedir(), '.local', 'bin', 'codex'),
      join(homedir(), '.bun', 'bin', 'codex'),
      ...(process.env.PATH ?? '').split(delimiter).map((p) => join(p, 'codex')),
      '/opt/homebrew/bin/codex',
      '/usr/local/bin/codex',
      ...nvm,
    ];
    const executable =
      candidates.find((p) => {
        try {
          accessSync(p, constants.X_OK);
          return true;
        } catch {
          return false;
        }
      }) ?? '/usr/local/bin/codex';
    return {
      enabled: false,
      model: 'gpt-6.1-terra',
      reasoningEffort: 'medium',
      ...saved,
      executable,
    };
  }
  async set(value: unknown) {
    const settings = settingsSchema.parse(value);
    await mkdir(dirname(this.path), { recursive: true });
    const tmp = `${this.path}.tmp`;
    await writeFile(tmp, JSON.stringify(settings), { mode: 0o600 });
    await rename(tmp, this.path);
    return settings;
  }
}
