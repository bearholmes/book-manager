import { randomBytes, scrypt } from 'node:crypto';
import { z } from 'zod';
import { decrypt, encrypt } from '../security/encryption';

export const MAX_BACKUP_BYTES = 32 * 1024 * 1024;
export const backupPassword = z
  .string()
  .min(12, '백업 비밀번호는 12자 이상 입력해주세요.')
  .max(256);

const archiveSchema = z
  .object({
    format: z.literal('reading-desk-backup'),
    version: z.literal(1),
    kdf: z.literal('scrypt-32768-8-1'),
    salt: z.string().regex(/^[a-f0-9]{32}$/),
    data: z.string().min(1).max(MAX_BACKUP_BYTES),
  })
  .strict();

async function backupKey(password: string, salt: Buffer): Promise<Buffer> {
  backupPassword.parse(password);
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 32, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function createBackup(data: unknown, password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await backupKey(password, salt);
  try {
    const archive = JSON.stringify({
      format: 'reading-desk-backup',
      version: 1,
      kdf: 'scrypt-32768-8-1',
      salt: salt.toString('hex'),
      data: encrypt(Buffer.from(JSON.stringify(data)), key, 'reading-desk-backup-v1').toString(
        'base64',
      ),
    });
    if (Buffer.byteLength(archive) > MAX_BACKUP_BYTES)
      throw new Error('백업은 최대 32MB까지 지원합니다.');
    return archive;
  } finally {
    key.fill(0);
  }
}

export async function readBackup(archive: string, password: string): Promise<unknown> {
  if (Buffer.byteLength(archive) > MAX_BACKUP_BYTES)
    throw new Error('32MB 이하 백업 파일을 선택해주세요.');
  let parsed: z.infer<typeof archiveSchema>;
  try {
    parsed = archiveSchema.parse(JSON.parse(archive));
  } catch {
    throw new Error('지원하지 않거나 손상된 백업 파일입니다.');
  }
  const key = await backupKey(password, Buffer.from(parsed.salt, 'hex'));
  try {
    const plaintext = decrypt(Buffer.from(parsed.data, 'base64'), key, 'reading-desk-backup-v1');
    try {
      return JSON.parse(plaintext.toString('utf8'));
    } finally {
      plaintext.fill(0);
    }
  } finally {
    key.fill(0);
  }
}
