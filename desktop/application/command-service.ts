import { z } from 'zod';
import type { CommandRequest, CommandResult } from '../../contracts/desktop';
import { BackupService, type ExportWriter } from '../backup/backup-service';
import type { BookLookupService } from '../book-lookup/service';
import { coverIdSchema } from '../library/cover-store';
import type { LibraryDatabase } from '../library/repository';
import { PinLock, pinSchema } from '../security/pin-lock';
import { idSchema, listSchema, objectSchema } from './command-schemas';

/** Single serialized gateway for native RPC and the development bridge. */
export class DesktopService {
  private queue = Promise.resolve();
  private readonly pin: PinLock;
  private readonly backups: BackupService;

  constructor(
    readonly library: LibraryDatabase,
    saveExport: ExportWriter,
    private readonly lookup?: BookLookupService,
  ) {
    this.pin = new PinLock(library);
    this.backups = new BackupService(library, saveExport);
  }

  status() {
    return this.pin.status();
  }

  async execute(request: CommandRequest): Promise<CommandResult> {
    const result = this.queue.then(() => this.executeRequest(request));
    this.queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async executeRequest(request: CommandRequest): Promise<CommandResult> {
    try {
      const data = await this.dispatch(request);
      return { ok: true, data };
    } catch (error) {
      const message =
        error instanceof z.ZodError
          ? error.issues[0]?.message
          : error instanceof Error
            ? error.message
            : '';
      return {
        ok: false,
        error:
          message && /[가-힣]/.test(message)
            ? message
            : '요청을 처리하지 못했습니다. 입력 내용을 확인해주세요.',
      };
    }
  }

  private async dispatch({ command, payload }: CommandRequest): Promise<unknown> {
    if (command === 'status') return this.status();
    if (command === 'unlock') return this.pin.unlock(payload);
    this.pin.assertUnlocked();
    if (command === 'findDuplicates') {
      const { isbn, excludeId } = z
        .object({ isbn: z.string().max(100), excludeId: z.string().optional() })
        .parse(payload);
      return this.library.findDuplicates(isbn, excludeId);
    }
    if (
      [
        'codexSettingsGet',
        'codexSettingsSet',
        'codexProbe',
        'codexAvailability',
        'lookupStart',
        'lookupStatus',
        'lookupCancel',
        'lookupCoverStart',
        'lookupCoverStatus',
        'lookupCoverCancel',
        'openLookupSource',
      ].includes(command)
    ) {
      if (!this.lookup) throw new Error('도서 조사 도우미를 사용할 수 없습니다.');
      switch (command) {
        case 'codexSettingsGet':
          return this.lookup.settings();
        case 'codexSettingsSet':
          return this.lookup.saveSettings(payload);
        case 'codexAvailability':
          return this.lookup.availability();
        case 'codexProbe':
          return this.lookup.probe();
        case 'lookupStart':
          return this.lookup.start(payload);
        case 'lookupStatus':
          return this.lookup.status(payload);
        case 'lookupCancel':
          return this.lookup.cancel(payload);
        case 'lookupCoverStart':
          return this.lookup.coverStart(payload);
        case 'lookupCoverStatus':
          return this.lookup.coverStatus(payload);
        case 'lookupCoverCancel':
          return this.lookup.cancelCover(payload);
        case 'openLookupSource':
          return this.lookup.openSource(payload);
      }
    }
    switch (command) {
      case 'lock':
        this.lookup?.dispose();
        return this.pin.lock();
      case 'setPin':
        return this.pin.setPin(payload);
      case 'info':
        return { databasePath: this.library.path };
      case 'list':
        return this.library.list(listSchema.parse(payload));
      case 'create':
        this.assertLocalCoverInput(payload);
        return this.library.create(payload);
      case 'update': {
        const { id, updates } = idSchema
          .extend({ updates: z.record(z.string(), z.unknown()) })
          .parse(payload);
        this.assertLocalCoverInput(updates);
        return this.library.update(id, updates);
      }
      case 'delete':
        this.library.delete(idSchema.parse(payload).id);
        return null;
      case 'stats':
        objectSchema.parse(payload);
        return this.library.stats();
      case 'coverRead':
        return this.library.readCover(z.object({ id: coverIdSchema }).parse(payload).id);
      case 'backupExport':
        return this.backups.export(payload);
      case 'backupInspect':
        return this.backups.inspect(payload);
      case 'backupRestore':
        this.lookup?.dispose();
        return this.backups.restore(payload, (pin) => this.pin.requireCurrentPin(pin));
      case 'reset': {
        const { currentPin } = z
          .object({ currentPin: pinSchema.optional(), confirmation: z.literal('초기화') })
          .parse(payload);
        this.pin.requireCurrentPin(currentPin);
        this.lookup?.dispose();
        this.library.reset();
        this.backups.invalidate();
        this.pin.reset();
        return this.status();
      }
      default:
        throw new Error('지원하지 않는 요청입니다.');
    }
  }

  private assertLocalCoverInput(payload: unknown) {
    const fields = z.record(z.string(), z.unknown()).parse(payload);
    if ('cover_id' in fields || 'image_url' in fields)
      throw new Error('표지 이미지는 파일을 첨부해주세요.');
  }
}
