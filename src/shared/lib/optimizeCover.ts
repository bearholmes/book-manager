import {
  type CoverUpload,
  MAX_COVER_BYTES,
  MAX_COVER_HEIGHT,
  MAX_COVER_SOURCE_BYTES,
  MAX_COVER_WIDTH,
} from '@contracts/cover';

export interface OptimizedCover {
  upload: CoverUpload;
  blob: Blob;
  width: number;
  height: number;
}

function encode(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('표지 이미지를 압축하지 못했습니다.'))),
      mimeType,
      quality,
    );
  });
}

/** Discard the original and metadata; store only a display-sized, compressed cover. */
export async function optimizeCover(file: File): Promise<OptimizedCover> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new Error('JPG, PNG, WebP 이미지 파일을 선택해주세요.');
  if (!file.size || file.size > MAX_COVER_SOURCE_BYTES)
    throw new Error('20MB 이하 이미지 파일을 선택해주세요.');
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('이미지를 열 수 없습니다. 다른 파일을 선택해주세요.');
  }
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 40_000_000)
      throw new Error('4천만 화소 이하 이미지 파일을 선택해주세요.');
    const scale = Math.min(1, MAX_COVER_WIDTH / bitmap.width, MAX_COVER_HEIGHT / bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('이미지를 처리할 수 없습니다. 앱을 다시 실행해주세요.');
    context.imageSmoothingQuality = 'high';
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    let blob = await encode(canvas, 'image/webp', 0.82);
    // Native WebKit versions without WebP encoding return PNG; JPEG is the portable fallback.
    const mimeType = blob.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
    if (blob.type !== mimeType) blob = await encode(canvas, mimeType, 0.82);
    for (const quality of [0.72, 0.62]) {
      if (blob.size <= MAX_COVER_BYTES) break;
      blob = await encode(canvas, mimeType, quality);
    }
    while (blob.size > MAX_COVER_BYTES && Math.max(canvas.width, canvas.height) > 160) {
      canvas.width = Math.max(1, Math.floor(canvas.width * 0.8));
      canvas.height = Math.max(1, Math.floor(canvas.height * 0.8));
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      blob = await encode(canvas, mimeType, 0.72);
    }
    if (blob.size > MAX_COVER_BYTES || blob.type !== mimeType)
      throw new Error('표지 이미지를 압축하지 못했습니다. 다른 파일을 선택해주세요.');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 8192)
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
    return {
      blob,
      width: canvas.width,
      height: canvas.height,
      upload: { data: btoa(binary), mimeType },
    };
  } finally {
    bitmap.close();
  }
}
