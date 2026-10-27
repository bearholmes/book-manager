import { z } from 'zod';
import type { Book } from '../../contracts/book';
import type { BackupCover } from '../../contracts/cover';
import type { BackupPreview } from '../../contracts/desktop';
import { storedBookSchema } from '../library/book-schema';
import { coverIdSchema, coverUploadSchema, decodeCover } from '../library/cover-store';
import type { LibraryDatabase } from '../library/repository';
import { pinSchema } from '../security/pin-lock';
import { backupPassword, createBackup, readBackup } from './archive';

export type ExportWriter = (content: string, extension: 'rdbackup') => Promise<string | null>;

export class BackupService {
  private staged?: {
    token: string;
    books: Book[];
    covers: BackupCover[];
    expires: number;
    revision: number;
  };

  constructor(
    private readonly library: LibraryDatabase,
    private readonly saveExport: ExportWriter,
  ) {}

  async export(payload: unknown) {
    const { password } = z.object({ password: backupPassword }).parse(payload);
    const books = this.library.all();
    const archive = await createBackup(
      {
        format: 'reading-desk-data',
        version: 2,
        createdAt: new Date().toISOString(),
        books,
        covers: this.library.backupCovers(),
      },
      password,
    );
    const path = await this.saveExport(archive, 'rdbackup');
    return { path, count: books.length };
  }

  async inspect(payload: unknown): Promise<BackupPreview> {
    this.staged = undefined;
    const { archive, password } = z
      .object({ archive: z.string(), password: backupPassword })
      .parse(payload);
    const data = z
      .object({
        format: z.literal('reading-desk-data'),
        version: z.union([z.literal(1), z.literal(2)]),
        createdAt: z.string().datetime({ offset: true }),
        books: z
          .array(
            storedBookSchema.extend({
              id: z.string().min(1).max(200),
              created_at: z.string().datetime({ offset: true }),
              updated_at: z.string().datetime({ offset: true }),
            }),
          )
          .max(100000),
        covers: z
          .array(coverUploadSchema.extend({ id: coverIdSchema }))
          .max(100000)
          .optional(),
      })
      .strict()
      .parse(await readBackup(archive, password));
    if (new Set(data.books.map((book) => book.id)).size !== data.books.length)
      throw new Error('백업에 중복 도서 ID가 있습니다. 현재 데이터는 변경하지 않았습니다.');
    const covers = data.covers ?? [];
    const referenced = new Set(
      data.books.flatMap((book) => (book.cover_id ? [book.cover_id] : [])),
    );
    const supplied = new Set(covers.map((cover) => cover.id));
    if (
      (data.version === 1 && (referenced.size || covers.length)) ||
      supplied.size !== covers.length ||
      supplied.size !== referenced.size ||
      [...referenced].some((id) => !supplied.has(id))
    )
      throw new Error(
        '백업 표지 이미지가 누락되었거나 중복되었습니다. 현재 데이터는 변경하지 않았습니다.',
      );
    for (const cover of covers) {
      const decoded = decodeCover({ data: cover.data, mimeType: cover.mimeType });
      decoded.bytes.fill(0);
      if (decoded.id !== cover.id)
        throw new Error('백업 표지 이미지가 손상되었습니다. 현재 데이터는 변경하지 않았습니다.');
    }
    const token = crypto.randomUUID();
    this.staged = {
      token,
      books: data.books,
      covers,
      expires: Date.now() + 5 * 60 * 1000,
      revision: this.library.revision,
    };
    return {
      token,
      count: data.books.length,
      currentCount: this.library.stats().total,
      createdAt: data.createdAt,
    };
  }

  restore(payload: unknown, verifyPin: (pin?: string) => void) {
    const { token, currentPin } = z
      .object({
        token: z.string().uuid(),
        currentPin: pinSchema.optional(),
        confirmation: z.literal('복원'),
      })
      .parse(payload);
    const staged = this.staged;
    if (
      !staged ||
      staged.token !== token ||
      staged.expires < Date.now() ||
      staged.revision !== this.library.revision
    )
      throw new Error(
        '복원 미리보기가 만료되었거나 서재가 변경되었습니다. 백업 파일을 다시 확인해주세요.',
      );
    verifyPin(currentPin);
    this.library.replaceBooks(staged.books, staged.covers);
    this.staged = undefined;
    return { count: staged.books.length };
  }

  invalidate() {
    this.staged = undefined;
  }
}
