import { z } from 'zod';
import type { CommandRequest, CommandResult } from '../../contracts/desktop';
import { BackupService, type ExportWriter } from '../backup/backup-service';
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
    switch (command) {
      case 'lock':
        return this.pin.lock();
      case 'setPin':
        return this.pin.setPin(payload);
      case 'info':
        return { databasePath: this.library.path };
      case 'list':
        return this.library.list(listSchema.parse(payload));
      case 'create':
        return this.library.create(payload);
      case 'update': {
        const { id, updates } = idSchema.extend({ updates: z.record(z.unknown()) }).parse(payload);
        return this.library.update(id, updates);
      }
      case 'delete':
        this.library.delete(idSchema.parse(payload).id);
        return null;
      case 'stats':
        objectSchema.parse(payload);
        return this.library.stats();
      case 'backupExport':
        return this.backups.export(payload);
      case 'backupInspect':
        return this.backups.inspect(payload);
      case 'backupRestore':
        return this.backups.restore(payload, (pin) => this.pin.requireCurrentPin(pin));
      case 'reset': {
        const { currentPin } = z
          .object({ currentPin: pinSchema.optional(), confirmation: z.literal('초기화') })
          .parse(payload);
        this.pin.requireCurrentPin(currentPin);
        this.library.reset();
        this.backups.invalidate();
        this.pin.reset();
        return this.status();
      }
      default:
        throw new Error('지원하지 않는 요청입니다.');
    }
  }
}
