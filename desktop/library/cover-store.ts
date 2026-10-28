import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import {
  type CoverUpload,
  MAX_COVER_BYTES,
  MAX_COVER_HEIGHT,
  MAX_COVER_WIDTH,
} from '../../contracts/cover';
import { atomicWrite } from '../storage/atomic-file';

export const coverIdSchema = z.string().regex(/^[a-f0-9]{64}$/);
export const coverUploadSchema = z
  .object({
    data: z
      .string()
      .min(1)
      .max(4 * Math.ceil(MAX_COVER_BYTES / 3)),
    mimeType: z.enum(['image/webp', 'image/jpeg']),
  })
  .strict();

function dimensions(data: Buffer, mimeType: CoverUpload['mimeType']): [number, number] {
  if (
    mimeType === 'image/webp' &&
    data.length >= 30 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP' &&
    data.readUInt32LE(4) === data.length - 8
  ) {
    const chunk = data.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return [1 + data.readUIntLE(24, 3), 1 + data.readUIntLE(27, 3)];
    if (chunk === 'VP8 ' && data.subarray(23, 26).equals(Buffer.from([0x9d, 0x01, 0x2a])))
      return [data.readUInt16LE(26) & 0x3fff, data.readUInt16LE(28) & 0x3fff];
    if (chunk === 'VP8L' && data[20] === 0x2f) {
      const bits = data.readUInt32LE(21);
      return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
  }
  if (
    mimeType === 'image/jpeg' &&
    data[0] === 0xff &&
    data[1] === 0xd8 &&
    data[data.length - 2] === 0xff &&
    data[data.length - 1] === 0xd9
  ) {
    let offset = 2;
    while (offset + 9 < data.length && data[offset] === 0xff) {
      const marker = data[offset + 1];
      const length = data.readUInt16BE(offset + 2);
      if (length < 2 || offset + 2 + length > data.length) break;
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2)
        return [data.readUInt16BE(offset + 7), data.readUInt16BE(offset + 5)];
      offset += 2 + length;
    }
  }
  throw new Error('지원하지 않거나 손상된 표지 이미지입니다. 파일을 다시 선택해주세요.');
}

export function decodeCover(input: unknown) {
  const upload = coverUploadSchema.parse(input);
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(upload.data))
    throw new Error('표지 이미지 데이터가 손상되었습니다.');
  const bytes = Buffer.from(upload.data, 'base64');
  if (!bytes.length || bytes.length > MAX_COVER_BYTES)
    throw new Error('표지 이미지는 압축 후 128KB 이하여야 합니다.');
  const [width, height] = dimensions(bytes, upload.mimeType);
  if (!width || !height || width > MAX_COVER_WIDTH || height > MAX_COVER_HEIGHT)
    throw new Error('표지 이미지는 640×800px 이하여야 합니다.');
  return { bytes, id: createHash('sha256').update(bytes).digest('hex'), ...upload };
}

/** Only encrypted binary files are persisted. Content IDs deduplicate identical covers. */
export class CoverStore {
  private readonly memory = new Map<string, Buffer>();

  constructor(
    private readonly directory: string | undefined,
    private readonly storage: CoverEncryption,
  ) {}

  write(input: unknown): string {
    const { bytes, id } = decodeCover(input);
    try {
      const ciphertext = this.storage.encrypt(bytes, `reading-desk-cover-v1:${id}`);
      if (this.directory) {
        mkdirSync(this.directory, { recursive: true, mode: 0o700 });
        atomicWrite(join(this.directory, `${id}.vault`), ciphertext);
      } else this.memory.set(id, ciphertext);
      return id;
    } finally {
      bytes.fill(0);
    }
  }

  read(id: string): CoverUpload {
    coverIdSchema.parse(id);
    const ciphertext = this.directory
      ? readFileSync(join(this.directory, `${id}.vault`))
      : this.memory.get(id);
    if (!ciphertext) throw new Error('표지 이미지 파일을 찾을 수 없습니다.');
    const bytes = this.storage.decrypt(ciphertext, `reading-desk-cover-v1:${id}`);
    try {
      if (createHash('sha256').update(bytes).digest('hex') !== id)
        throw new Error('표지 이미지 파일이 손상되었습니다.');
      return {
        data: bytes.toString('base64'),
        mimeType: bytes.toString('ascii', 0, 4) === 'RIFF' ? 'image/webp' : 'image/jpeg',
      };
    } finally {
      bytes.fill(0);
    }
  }

  collect(referenced: Set<string>) {
    if (!this.directory) {
      for (const id of this.memory.keys()) if (!referenced.has(id)) this.memory.delete(id);
      return;
    }
    if (!existsSync(this.directory)) return;
    let files: string[];
    try {
      files = readdirSync(this.directory);
    } catch {
      return;
    }
    for (const file of files) {
      if (!/^[a-f0-9]{64}\.vault$/.test(file) || referenced.has(file.slice(0, -6))) continue;
      try {
        unlinkSync(join(this.directory, file));
      } catch {
        // The saved library is authoritative; retry cleanup on the next mutation or launch.
      }
    }
  }

  close() {
    this.memory.clear();
  }
}

interface CoverEncryption {
  encrypt(bytes: Uint8Array, context: string): Buffer;
  decrypt(bytes: Buffer, context: string): Buffer;
}
