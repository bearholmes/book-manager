// Grid covers display at most 320 × 400 CSS pixels; retain enough pixels for a 2× display.
export const MAX_COVER_WIDTH = 640;
export const MAX_COVER_HEIGHT = 800;
export const MAX_COVER_BYTES = 128 * 1024;
export const MAX_COVER_SOURCE_BYTES = 20 * 1024 * 1024;

/** Base64 is used only across the JSON bridge and inside password-encrypted backups. */
export interface CoverUpload {
  data: string;
  mimeType: 'image/webp' | 'image/jpeg';
}

export interface BackupCover extends CoverUpload {
  id: string;
}
