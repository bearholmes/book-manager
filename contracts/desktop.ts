import type { Book, BookFilters, BookInsert, BookSort, BookUpdate } from './book';
import type { CodexSettings, CoverTransfer, LookupJob } from './book-lookup';
import type { CoverUpload } from './cover';

export interface LockState {
  enabled: boolean;
  locked: boolean;
}

export interface BookPage {
  books: Book[];
  totalCount: number;
  nextOffset: number;
  hasMore: boolean;
}

export interface LibraryStats {
  total: number;
  missingImages: number;
  topics: { topic: string; count: number }[];
  places: { purchase_place: string; count: number }[];
  years: { year: number; count: number }[];
}

export interface BackupPreview {
  token: string;
  count: number;
  currentCount: number;
  createdAt: string;
}

export interface Commands {
  findDuplicates: {
    params: { isbn: string; excludeId?: string };
    result: { id: string; book_name: string }[];
  };
  codexSettingsGet: { params: Record<string, never>; result: CodexSettings };
  codexSettingsSet: { params: CodexSettings; result: CodexSettings };
  codexProbe: { params: Record<string, never>; result: { version: string } };
  lookupStart: { params: { isbn: string; requestId: string }; result: { jobId: string } };
  lookupStatus: { params: { jobId: string }; result: LookupJob };
  lookupCancel: { params: { jobId: string }; result: null };
  lookupCoverStart: {
    params: { jobId: string; candidateIndex: number; coverIndex: number };
    result: { transferId: string };
  };
  lookupCoverStatus: { params: { transferId: string }; result: CoverTransfer };
  lookupCoverCancel: { params: { transferId: string }; result: null };
  openLookupSource: { params: { jobId: string; url: string }; result: null };
  status: { params: Record<string, never>; result: LockState };
  unlock: { params: { pin: string }; result: LockState };
  lock: { params: Record<string, never>; result: LockState };
  setPin: { params: { currentPin?: string; newPin: string | null }; result: LockState };
  info: { params: Record<string, never>; result: { databasePath: string } };
  list: {
    params: { filters?: BookFilters; sort?: BookSort; offset?: number; limit?: number };
    result: BookPage;
  };
  create: { params: BookInsert; result: Book };
  update: { params: { id: string; updates: BookUpdate }; result: Book };
  delete: { params: { id: string }; result: null };
  stats: { params: Record<string, never>; result: LibraryStats };
  coverRead: { params: { id: string }; result: CoverUpload };
  backupExport: { params: { password: string }; result: { path: string | null; count: number } };
  backupInspect: { params: { archive: string; password: string }; result: BackupPreview };
  backupRestore: {
    params: { token: string; currentPin?: string; confirmation: '복원' };
    result: { count: number };
  };
  reset: { params: { currentPin?: string; confirmation: '초기화' }; result: LockState };
}

export type CommandName = keyof Commands;
export type CommandRequest = { command: CommandName; payload: unknown };
export type CommandResult = { ok: true; data: unknown } | { ok: false; error: string };

export type DesktopRPC = {
  bun: {
    requests: { execute: { params: CommandRequest; response: CommandResult } };
    messages: Record<string, never>;
  };
  webview: {
    requests: Record<string, never>;
    messages: Record<string, never>;
  };
};
