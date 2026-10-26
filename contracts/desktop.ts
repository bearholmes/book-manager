import type { Book, BookFilters, BookInsert, BookSort, BookUpdate } from './book';

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
