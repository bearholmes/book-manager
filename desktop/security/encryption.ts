import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const MAGIC = Buffer.from('READING-DESK-VAULT-1\n');
export function encrypt(data: Uint8Array, key: Buffer, context = 'reading-desk-store-v1'): Buffer {
  if (key.length !== 32) throw new Error('암호화 키 형식이 잘못되었습니다.');
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  cipher.setAAD(Buffer.from(context));
  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([MAGIC, nonce, cipher.getAuthTag(), ciphertext]);
}

export function decrypt(data: Buffer, key: Buffer, context = 'reading-desk-store-v1'): Buffer {
  if (
    key.length !== 32 ||
    data.length < MAGIC.length + 28 ||
    !data.subarray(0, MAGIC.length).equals(MAGIC)
  ) {
    throw new Error('암호화된 데이터 형식이 아닙니다.');
  }
  const offset = MAGIC.length;
  const decipher = createDecipheriv('aes-256-gcm', key, data.subarray(offset, offset + 12));
  decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(data.subarray(offset + 12, offset + 28));
  try {
    return Buffer.concat([decipher.update(data.subarray(offset + 28)), decipher.final()]);
  } catch {
    throw new Error('비밀번호 또는 암호화 키가 다르거나 파일이 손상되었습니다.');
  }
}
