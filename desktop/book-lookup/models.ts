import { spawn } from 'node:child_process';
import { delimiter, dirname } from 'node:path';
import { StringDecoder } from 'node:string_decoder';
import { z } from 'zod';
import { type CodexModel, REASONING_EFFORTS } from '../../contracts/book-lookup';

const pageSchema = z.object({
  data: z.array(
    z.object({
      model: z.string(),
      displayName: z.string(),
      hidden: z.boolean().optional(),
      supportedReasoningEfforts: z.array(z.object({ reasoningEffort: z.enum(REASONING_EFFORTS) })),
      defaultReasoningEffort: z.enum(REASONING_EFFORTS),
    }),
  ),
  nextCursor: z.string().nullable().optional(),
});

/** Query the CLI catalog without starting an inference turn or reading credentials. */
export function readModels(executable: string): Promise<CodexModel[]> {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, ['app-server', '--listen', 'stdio://'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: process.platform !== 'win32',
      env: {
        HOME: process.env.HOME,
        USER: process.env.USER,
        CODEX_HOME: process.env.CODEX_HOME,
        TMPDIR: process.env.TMPDIR,
        PATH: `${dirname(executable)}${delimiter}${process.env.PATH ?? '/usr/bin:/bin'}`,
      },
    });
    const decoder = new StringDecoder('utf8');
    let buffer = '';
    let size = 0;
    let settled = false;
    const models: CodexModel[] = [];
    const cursors = new Set<string>();
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        if (child.pid && process.platform !== 'win32') process.kill(-child.pid, 'SIGKILL');
        else child.kill('SIGKILL');
      } catch {
        /* Already exited. */
      }
      if (error) reject(error);
      else resolve(models);
    };
    const timer = setTimeout(
      () => finish(new Error('모델 목록을 가져오지 못했습니다. 다시 확인해주세요.')),
      15000,
    );
    const send = (message: unknown) => child.stdin.write(`${JSON.stringify(message)}\n`);
    child.on('error', () => finish(new Error('Codex가 설치되어 있지 않거나 실행할 수 없습니다.')));
    child.on('close', () => finish(new Error('모델 목록을 가져오지 못했습니다.')));
    child.stdin.on('error', () => finish(new Error('Codex에 연결할 수 없습니다.')));
    child.stderr.on('data', () => {});
    child.stdout.on('data', (chunk: Buffer) => {
      if (settled) return;
      size += chunk.length;
      if (size > 2 * 1024 * 1024) {
        finish(new Error('모델 목록이 너무 큽니다.'));
        return;
      }
      buffer += decoder.write(chunk);
      let newline = buffer.indexOf('\n');
      while (newline >= 0 && !settled) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        try {
          const message = JSON.parse(line);
          if (message.error) throw new Error('Codex 모델 목록을 읽을 수 없습니다.');
          if (message.id === 1) {
            send({ method: 'initialized' });
            send({ id: 2, method: 'model/list', params: { includeHidden: false, limit: 100 } });
          } else if (message.id === 2) {
            const page = pageSchema.parse(message.result);
            models.push(
              ...page.data
                .filter((m) => !m.hidden)
                .map((m) => ({
                  id: m.model,
                  name: m.displayName,
                  reasoningEfforts: m.supportedReasoningEfforts.map((e) => e.reasoningEffort),
                  defaultReasoningEffort: m.defaultReasoningEffort,
                })),
            );
            if (page.nextCursor) {
              if (cursors.has(page.nextCursor) || cursors.size > 20)
                throw new Error('모델 목록이 올바르지 않습니다.');
              cursors.add(page.nextCursor);
              send({
                id: 2,
                method: 'model/list',
                params: { cursor: page.nextCursor, includeHidden: false, limit: 100 },
              });
            } else finish();
          }
        } catch {
          finish(new Error('모델 목록을 읽지 못했습니다. Codex를 업데이트해주세요.'));
        }
        newline = buffer.indexOf('\n');
      }
    });
    send({
      id: 1,
      method: 'initialize',
      params: { clientInfo: { name: 'readingdesk', title: 'ReadingDesk', version: '3.0.0' } },
    });
  });
}
