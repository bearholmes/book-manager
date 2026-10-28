import type { CoverUpload } from './cover';

export const REASONING_EFFORTS = [
  'none',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
  'ultra',
] as const;
export interface CodexSettings {
  enabled: boolean;
  executable: string;
  model: string;
  reasoningEffort: (typeof REASONING_EFFORTS)[number];
}
export interface LookupCandidate {
  title: string;
  author: string | null;
  publisher: string | null;
  publicationDate: string | null;
  reportedIsbn: string | null;
  sources: { label: string; url: string }[];
  covers: { imageUrl: string; sourcePageUrl: string }[];
  notes: string[];
}
export interface LookupResult {
  candidates: LookupCandidate[];
}
export type LookupJob =
  | { state: 'running' | 'cancelled' }
  | { state: 'failed'; message: string }
  | { state: 'succeeded'; result: LookupResult; searched: boolean };
export type CoverTransfer =
  | { state: 'running' | 'cancelled' }
  | { state: 'failed'; message: string }
  | { state: 'succeeded'; data: string; mimeType: 'image/png' | 'image/jpeg' | 'image/webp' };
export type BibliographicFields = {
  book_name: string;
  author: string;
  publisher: string;
  publication_date: string;
};
export interface BookHelperContext {
  isbn: string;
  bookId?: string;
  fields: BibliographicFields;
  coverVersion: number;
  hasCover: boolean;
  apply: (patch: Partial<BibliographicFields>, cover?: CoverUpload) => void;
}

export interface CodexModel {
  id: string;
  name: string;
  reasoningEfforts: CodexSettings['reasoningEffort'][];
  defaultReasoningEffort: CodexSettings['reasoningEffort'];
}
export interface CodexAvailability {
  state: 'ready' | 'missing' | 'unavailable';
  models: CodexModel[];
  message?: string;
}
