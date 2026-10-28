import { expect, test } from './fixtures';

test('local Pretendard supplies UI weights while headings retain MaruBuri', async ({ page }) => {
  const externalRequests: string[] = [];
  const fontResponses: { url: string; status: number }[] = [];
  page.on('request', (request) => {
    if (
      new URL(request.url()).origin !== 'http://127.0.0.1:4310' &&
      request.url() !== 'http://127.0.0.1:4311/rpc'
    ) {
      externalRequests.push(request.url());
    }
  });
  page.on('response', (response) => {
    if (response.request().resourceType() === 'font') {
      fontResponses.push({ url: response.url(), status: response.status() });
    }
  });
  await page.route('**/*', async (route) => {
    if (
      new URL(route.request().url()).origin !== 'http://127.0.0.1:4310' &&
      route.request().url() !== 'http://127.0.0.1:4311/rpc'
    ) {
      await route.abort();
    } else {
      await route.fallback();
    }
  });
  await page.goto('/');
  await expect(page.getByText('등록된 도서가 없습니다')).toBeVisible();
  const loaded = await page.evaluate(async () => {
    const results = [];
    for (const weight of [400, 500, 600, 700]) {
      const faces = await document.fonts.load(
        `${weight} 14px "Pretendard Variable"`,
        '한글 English 123',
      );
      results.push({
        weight,
        count: faces.length,
        statuses: faces.map((face) => face.status),
        ranges: faces.map((face) => face.weight),
      });
    }
    const heading = await document.fonts.load('600 24px MaruBuri', '나의 서재');
    await document.fonts.ready;
    return { results, heading: heading.map((face) => face.status) };
  });
  for (const result of loaded.results) {
    expect(result.count, `Pretendard ${result.weight} must resolve to a font face`).toBeGreaterThan(
      0,
    );
    expect(result.statuses.every((status) => status === 'loaded')).toBe(true);
    expect(
      result.ranges.some((range) => {
        const [min, max = min] = range.split(' ').map(Number);
        return result.weight >= min && result.weight <= max;
      }),
      `Pretendard face must cover weight ${result.weight}`,
    ).toBe(true);
  }
  expect(loaded.heading).toContain('loaded');
  await expect(page.locator('body')).toHaveCSS('font-family', /^"?Pretendard(?: Variable)?"?,/i);
  await expect(page.getByRole('heading', { name: '나의 서재', exact: true })).toHaveCSS(
    'font-family',
    /^"?MaruBuri"?,/i,
  );
  await expect(page.getByLabel('검색', { exact: true })).toHaveCSS(
    'font-family',
    /^"?Pretendard(?: Variable)?"?,/i,
  );
  await expect(page.locator('aside nav').getByRole('link', { name: '나의 서재' })).toHaveCSS(
    'font-weight',
    '600',
  );
  expect(fontResponses.length).toBeGreaterThan(0);
  expect(
    fontResponses.every(
      ({ url, status }) => new URL(url).origin === 'http://127.0.0.1:4310' && status === 200,
    ),
  ).toBe(true);
  expect(externalRequests).toEqual([]);
});

test('long Korean text remains usable on compact screens with the local font', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/');
  await page.getByRole('button', { name: '도서 추가', exact: true }).first().click();
  const title = '아주 긴 한국어 도서 제목을 입력하여 작은 화면에서도 표시되는지 확인합니다';
  await page.getByLabel('도서명').fill(title);
  await page.getByLabel('주제', { exact: true }).last().fill('긴 제목 테스트');
  await page
    .getByRole('dialog', { name: '도서 추가' })
    .getByRole('button', { name: '추가', exact: true })
    .click();
  await expect(page.getByRole('button', { name: title, exact: true })).toBeVisible();
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
});
