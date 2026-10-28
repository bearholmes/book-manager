import { access, constants } from 'node:fs/promises';
import { z } from 'zod';
import type {
  CodexAvailability,
  CodexSettings,
  CoverTransfer,
  LookupJob,
} from '../../contracts/book-lookup';
import { normalizeIsbn } from '../../contracts/isbn';
import { type LookupRunner, runCodex, runProcess } from './codex';
import { downloadCover } from './download-cover';
import { readModels } from './models';
import { settingsSchema } from './schema';

type Entry<T> = { controller: AbortController; value: T; expires: ReturnType<typeof setTimeout> };
export interface LookupDependencies {
  settings: { get(): Promise<CodexSettings>; set(value: unknown): Promise<CodexSettings> };
  openUrl: (url: string) => void | Promise<void>;
  runner?: LookupRunner;
  download?: typeof downloadCover;
}
const idSchema = z.string().min(1).max(100);
export class BookLookupService {
  private jobs = new Map<string, Entry<LookupJob>>();
  private transfers = new Map<string, Entry<CoverTransfer> & { parent: string }>();
  private requests = new Map<string, string>();
  constructor(private readonly deps: LookupDependencies) {}
  settings() {
    return this.deps.settings.get();
  }
  async saveSettings(input: unknown) {
    const saved = await this.deps.settings.set(settingsSchema.parse(input));
    if (!saved.enabled) this.dispose();
    return saved;
  }
  async availability(): Promise<CodexAvailability> {
    const settings = await this.settings();
    try {
      await access(settings.executable, constants.X_OK);
    } catch {
      return { state: 'missing', models: [] };
    }
    try {
      return { state: 'ready', models: await readModels(settings.executable) };
    } catch (error) {
      return { state: 'unavailable', models: [], message: this.message(error) };
    }
  }
  private entry<T>(value: T, expire: () => void): Entry<T> {
    const expires = setTimeout(expire, 600_000);
    expires.unref();
    return { value, controller: new AbortController(), expires };
  }
  async start(input: unknown) {
    const { isbn, requestId } = z
      .object({ isbn: z.string().max(100), requestId: idSchema })
      .parse(input);
    const canonical = normalizeIsbn(isbn);
    if (!canonical) throw new Error('유효한 ISBN 10자리 또는 13자리를 입력해주세요.');
    const previous = this.requests.get(requestId);
    if (previous && this.jobs.has(previous)) return { jobId: previous };
    if ([...this.jobs.values()].some((j) => j.value.state === 'running'))
      throw new Error('다른 조사가 진행 중입니다. 먼저 취소해주세요.');
    const settings = await this.settings();
    if (!settings.enabled) throw new Error('설정에서 AI 도우미를 켜주세요.');
    const jobId = crypto.randomUUID();
    const entry = this.entry<LookupJob>({ state: 'running' }, () => this.cancel({ jobId }));
    this.jobs.set(jobId, entry);
    this.requests.set(requestId, jobId);
    void (this.deps.runner ?? runCodex)(settings, canonical, entry.controller.signal)
      .then((value) => {
        if (!entry.controller.signal.aborted) entry.value = { state: 'succeeded', ...value };
      })
      .catch((error) => {
        if (!entry.controller.signal.aborted)
          entry.value = { state: 'failed', message: this.message(error) };
      });
    return { jobId };
  }
  private message(error: unknown) {
    return error instanceof Error && /[가-힣]/.test(error.message)
      ? error.message
      : '요청을 처리하지 못했습니다. 다시 시도해주세요.';
  }
  status(input: unknown): LookupJob {
    const { jobId } = z.object({ jobId: idSchema }).parse(input);
    return this.jobs.get(jobId)?.value ?? { state: 'cancelled' };
  }
  cancel(input: unknown) {
    const { jobId } = z.object({ jobId: idSchema }).parse(input);
    const entry = this.jobs.get(jobId);
    if (entry) {
      entry.controller.abort();
      clearTimeout(entry.expires);
      this.jobs.delete(jobId);
    }
    for (const [key, value] of this.requests) if (value === jobId) this.requests.delete(key);
    for (const [id, transfer] of this.transfers)
      if (transfer.parent === jobId) this.cancelCover({ transferId: id });
    return null;
  }
  coverStart(input: unknown) {
    const { jobId, candidateIndex, coverIndex } = z
      .object({
        jobId: idSchema,
        candidateIndex: z.number().int().min(0).max(2),
        coverIndex: z.number().int().min(0).max(2),
      })
      .parse(input);
    const job = this.jobs.get(jobId)?.value;
    const cover =
      job?.state === 'succeeded'
        ? job.result.candidates[candidateIndex]?.covers[coverIndex]
        : undefined;
    if (!cover) throw new Error('표지 후보가 만료되었습니다. 다시 조사해주세요.');
    for (const [id] of this.transfers) this.cancelCover({ transferId: id });
    const transferId = crypto.randomUUID();
    const entry = {
      ...this.entry<CoverTransfer>({ state: 'running' }, () => this.cancelCover({ transferId })),
      parent: jobId,
    };
    this.transfers.set(transferId, entry);
    void (this.deps.download ?? downloadCover)(cover.imageUrl, entry.controller.signal)
      .then((value) => {
        if (!entry.controller.signal.aborted) entry.value = value;
      })
      .catch((error) => {
        if (!entry.controller.signal.aborted)
          entry.value = { state: 'failed', message: this.message(error) };
      });
    return { transferId };
  }
  coverStatus(input: unknown): CoverTransfer {
    const { transferId } = z.object({ transferId: idSchema }).parse(input);
    return this.transfers.get(transferId)?.value ?? { state: 'cancelled' };
  }
  cancelCover(input: unknown) {
    const { transferId } = z.object({ transferId: idSchema }).parse(input);
    const entry = this.transfers.get(transferId);
    if (entry) {
      entry.controller.abort();
      clearTimeout(entry.expires);
      this.transfers.delete(transferId);
    }
    return null;
  }
  async openSource(input: unknown) {
    const { jobId, url } = z.object({ jobId: idSchema, url: z.string().max(4096) }).parse(input);
    const job = this.jobs.get(jobId)?.value;
    if (
      job?.state !== 'succeeded' ||
      !job.result.candidates.some(
        (c) =>
          c.sources.some((s) => s.url === url) || c.covers.some((s) => s.sourcePageUrl === url),
      )
    )
      throw new Error('출처가 만료되었습니다. 다시 조사해주세요.');
    await this.deps.openUrl(url);
    return null;
  }
  async probe() {
    const settings = await this.settings();
    const { output, code } = await runProcess(
      settings.executable,
      ['--version'],
      '',
      new AbortController().signal,
      5000,
    );
    const version = output.match(/codex-cli (\d+\.\d+\.\d+)/)?.[1];
    if (code !== 0 || !version) throw new Error('Codex CLI 실행 파일인지 확인해주세요.');
    const [major, minor] = version.split('.').map(Number);
    if (major === 0 && minor < 159) throw new Error('Codex CLI 0.159.0 이상으로 업데이트해주세요.');
    return { version };
  }
  dispose() {
    for (const [jobId] of this.jobs) this.cancel({ jobId });
  }
}
