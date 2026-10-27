import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from './fixtures';

test('local cover attachment is resized, compressed, encrypted and usable offline after reload', async ({
  page,
  libraryDirectory,
}, testInfo) => {
  const errors: string[] = [];
  const externalImages: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (
      request.resourceType() === 'image' &&
      /^https?:/.test(request.url()) &&
      !request.url().startsWith('http://127.0.0.1:4310/')
    )
      externalImages.push(request.url());
  });
  await page.goto('/');
  const source = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1800;
    canvas.height = 2400;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const gradient = context.createLinearGradient(0, 0, 1800, 2400);
    gradient.addColorStop(0, '#f67748');
    gradient.addColorStop(1, '#fdf9f4');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1800, 2400);
    context.fillStyle = '#2d2f34';
    context.font = 'bold 140px sans-serif';
    context.fillText('LOCAL LIBRARY', 120, 500);
    for (let i = 0; i < 300; i++) {
      context.fillStyle = `hsl(${(i * 31) % 360} 35% 45%)`;
      context.fillRect((i * 43) % 1700, 700 + ((i * 37) % 1600), 50, 30);
    }
    return canvas.toDataURL('image/png').split(',')[1] as string;
  });
  await page.getByRole('button', { name: '도서 추가', exact: true }).click();
  await page.getByLabel('도서명').fill('로컬 표지 검증');
  await expect(page.getByLabel('표지 이미지', { exact: true })).toHaveAttribute('type', 'file');
  await expect(page.getByLabel('표지 이미지 URL')).toHaveCount(0);
  const fileInput = page.getByLabel('표지 이미지', { exact: true });
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '이미지 첨부', exact: true }).click();
  await (await chooser).setFiles({
    name: 'synthetic-cover.png',
    mimeType: 'image/png',
    buffer: Buffer.from(source, 'base64'),
  });
  const preview = page.getByAltText('선택한 표지 미리보기');
  await expect(preview).toBeVisible();
  const optimized = await preview.evaluate(async (element) => {
    const image = element as HTMLImageElement;
    await image.decode();
    const blob = await (await fetch(image.src)).blob();
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      bytes: blob.size,
      type: blob.type,
    };
  });
  expect(optimized).toMatchObject({ width: 600, height: 800, type: 'image/webp' });
  expect(optimized.bytes).toBeLessThan(Buffer.from(source, 'base64').length);
  expect(optimized.bytes).toBeLessThanOrEqual(128 * 1024);
  // Selecting an unsupported or corrupt file must preserve the already selected cover.
  await fileInput.setInputFiles({
    name: 'broken.png',
    mimeType: 'image/png',
    buffer: Buffer.from('not an image'),
  });
  await expect(page.getByRole('alert')).toContainText('이미지를 열 수 없습니다');
  await expect(preview).toBeVisible();
  await page.getByRole('button', { name: '추가', exact: true }).click();
  await expect(page.getByRole('button', { name: '로컬 표지 검증', exact: true })).toBeVisible();
  const files = readdirSync(join(libraryDirectory, 'covers'));
  expect(files).toHaveLength(1);
  expect(files[0]).toMatch(/^[a-f0-9]{64}\.vault$/);
  const ciphertext = readFileSync(join(libraryDirectory, 'covers', files[0] as string));
  expect(ciphertext.includes(Buffer.from('RIFF'))).toBe(false);
  expect(ciphertext.length).toBeLessThan(128 * 1024 + 100);
  await page.reload();
  await page.getByRole('button', { name: '표지 보기', exact: true }).click();
  const cover = page.getByAltText('로컬 표지 검증', { exact: true });
  await expect(cover).toBeVisible();
  await expect(cover).toHaveJSProperty('naturalHeight', 800);
  const bounds = await cover.boundingBox();
  expect(bounds?.width).toBeLessThanOrEqual(320);
  expect(bounds?.height).toBeLessThanOrEqual(400);
  await page.getByRole('button', { name: '로컬 표지 검증', exact: true }).click();
  const detail = page.getByRole('dialog', { name: '로컬 표지 검증' });
  await expect(detail.getByAltText('로컬 표지 검증')).toBeVisible();
  await detail.getByRole('button', { name: '수정', exact: true }).click();
  await expect(page.getByAltText('선택한 표지 미리보기')).toBeVisible();
  await page.getByAltText('선택한 표지 미리보기').scrollIntoViewIfNeeded();
  await page.getByRole('region', { name: '표지 이미지 첨부' }).screenshot({
    path: testInfo.outputPath('cover-actions.png'),
    animations: 'disabled',
  });
  await page.screenshot({
    path: testInfo.outputPath('local-cover-attachment.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: '이미지 삭제', exact: true }).click();
  await expect(page.getByText('저장하면 이미지만 삭제됩니다.')).toBeVisible();
  await expect(page.getByAltText('선택한 표지 미리보기')).toHaveCount(0);
  await page.getByRole('button', { name: '취소', exact: true }).click();
  await expect(page.getByAltText('로컬 표지 검증')).toBeVisible();
  expect(readdirSync(join(libraryDirectory, 'covers'))).toEqual(files);
  await page.getByRole('button', { name: '로컬 표지 검증', exact: true }).click();
  await page
    .getByRole('dialog', { name: '로컬 표지 검증' })
    .getByRole('button', { name: '수정', exact: true })
    .click();
  await page.getByRole('button', { name: '이미지 삭제', exact: true }).click();
  await page.getByRole('button', { name: '수정', exact: true }).click();
  await expect(page.getByAltText('로컬 표지 검증')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '로컬 표지 검증', exact: true })).toBeVisible();
  expect(readdirSync(join(libraryDirectory, 'covers'))).toEqual([]);
  await page.reload();
  await page.getByRole('button', { name: '로컬 표지 검증', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: '로컬 표지 검증' }).getByAltText('로컬 표지 검증'),
  ).toHaveCount(0);
  expect(externalImages).toEqual([]);
  expect(errors).toEqual([]);
});

test('keeps small covers at their original size and falls back to JPEG when WebP encoding is unavailable', async ({
  page,
  libraryDirectory,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
      return original.call(this, callback, type === 'image/webp' ? 'image/png' : type, quality);
    };
  });
  await page.goto('/');
  const source = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 20;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.fillStyle = '#f67748';
    context.fillRect(0, 0, 16, 20);
    return canvas.toDataURL('image/png').split(',')[1] as string;
  });
  await page.getByRole('button', { name: '도서 추가', exact: true }).click();
  await page.getByLabel('도서명').fill('작은 표지');
  const fileInput = page.getByLabel('표지 이미지', { exact: true });
  await fileInput.setInputFiles({
    name: 'small.png',
    mimeType: 'image/png',
    buffer: Buffer.from(source, 'base64'),
  });
  const preview = page.getByAltText('선택한 표지 미리보기');
  await expect(preview).toBeVisible();
  expect(
    await preview.evaluate(async (element) => {
      const image = element as HTMLImageElement;
      await image.decode();
      return {
        width: image.naturalWidth,
        height: image.naturalHeight,
        type: (await (await fetch(image.src)).blob()).type,
      };
    }),
  ).toEqual({ width: 16, height: 20, type: 'image/jpeg' });
  await page.getByRole('button', { name: '추가', exact: true }).click();
  await expect(page.getByRole('button', { name: '작은 표지', exact: true })).toBeVisible();
  expect(readdirSync(join(libraryDirectory, 'covers'))).toHaveLength(1);
  await page.reload();
  await page.getByRole('button', { name: '작은 표지', exact: true }).click();
  await expect(page.getByAltText('작은 표지')).toHaveJSProperty('naturalHeight', 20);
});
