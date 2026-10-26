import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, realpathSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

export async function loadDataKey(path: string, secrets = Bun.secrets): Promise<Buffer> {
  try {
    mkdirSync(dirname(resolve(path)), { recursive: true, mode: 0o700 });
    const canonical = join(realpathSync(dirname(resolve(path))), basename(path));
    const name = createHash('sha256').update(canonical).digest('hex');
    const entry = { service: 'app.readingdesk.books.encryption.v1', name };
    const stored = await secrets.get(entry);
    if (stored) {
      if (!/^[a-f0-9]{64}$/.test(stored))
        throw new Error('보안 저장소의 암호화 키 형식이 잘못되었습니다.');
      return Buffer.from(stored, 'hex');
    }
    if (existsSync(path))
      throw new Error(
        '암호화 키를 찾을 수 없습니다. 보안 저장소를 확인하거나 새 저장소에서 백업을 복원해주세요.',
      );
    const key = randomBytes(32);
    await secrets.set({ ...entry, value: key.toString('hex'), persist: 'local' });
    if ((await secrets.get(entry)) !== key.toString('hex'))
      throw new Error('암호화 키를 보관하지 못했습니다.');
    return key;
  } catch (error) {
    if (error instanceof Error && /[가-힣]/.test(error.message)) throw error;
    throw new Error(
      '운영체제 보안 저장소에 접근하지 못했습니다. 접근을 허용한 뒤 다시 실행해주세요.',
    );
  }
}
