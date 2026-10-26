import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import type { LockState } from '../../contracts/desktop';

export const pinSchema = z.string().regex(/^\d{4}$/, 'PIN은 숫자 4자리로 입력해주세요.');

interface PinSettings {
  getSetting(key: string): string | undefined;
  setSetting(key: string, value: string): unknown;
  deleteSetting(key: string): unknown;
}

export class PinLock {
  private locked: boolean;
  private failures = 0;
  private retryAt = 0;

  constructor(private readonly library: PinSettings) {
    this.locked = !!library.getSetting('pin');
  }

  status(): LockState {
    return { enabled: !!this.library.getSetting('pin'), locked: this.locked };
  }

  assertUnlocked() {
    if (this.locked) throw new Error('서재가 잠겨 있습니다. PIN을 입력해주세요.');
  }

  requireCurrentPin(pin?: string) {
    if (this.status().enabled) this.verify(pin ?? '');
  }

  unlock(payload: unknown): LockState {
    const { pin } = z.object({ pin: pinSchema }).parse(payload);
    this.verify(pin);
    this.locked = false;
    return this.status();
  }

  lock(): LockState {
    this.locked = this.status().enabled;
    return this.status();
  }

  setPin(payload: unknown): LockState {
    const { currentPin, newPin } = z
      .object({ currentPin: pinSchema.optional(), newPin: pinSchema.nullable() })
      .parse(payload);
    if (this.status().enabled) this.verify(currentPin ?? '');
    if (newPin) {
      const salt = randomBytes(16).toString('hex');
      this.library.setSetting(
        'pin',
        JSON.stringify({ salt, hash: scryptSync(newPin, salt, 32).toString('hex') }),
      );
    } else {
      this.library.deleteSetting('pin');
    }
    return this.status();
  }

  reset() {
    this.locked = false;
    this.failures = 0;
    this.retryAt = 0;
  }

  private verify(pin: string) {
    if (Date.now() < this.retryAt)
      throw new Error('PIN 입력을 여러 번 실패했습니다. 30초 후 다시 시도해주세요.');
    const record = this.library.getSetting('pin');
    if (!record) return;
    const { salt, hash } = JSON.parse(record) as { salt: string; hash: string };
    const valid = timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(pin, salt, 32));
    if (!valid) {
      this.failures += 1;
      if (this.failures >= 5) {
        this.retryAt = Date.now() + 30000;
        this.failures = 0;
      }
      throw new Error('PIN이 일치하지 않습니다.');
    }
    this.failures = 0;
    this.retryAt = 0;
  }
}
