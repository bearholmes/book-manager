import { expect, test } from './fixtures';

test('tokens, native-sized controls, compact layout and reduced motion retain usable styles', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1360, height: 900 });
  let releaseList = () => {};
  const listReady = new Promise<void>((resolve) => {
    releaseList = resolve;
  });
  await page.route('**/rpc', async (route) => {
    if (route.request().postDataJSON()?.command === 'list') await listReady;
    await route.fallback();
  });
  await page.goto('/');
  const spinner = page.locator('output[aria-label="loading"][data-size="md"]');
  try {
    await expect(spinner).toBeVisible();
    await expect(spinner).toHaveCSS('border-top-width', '3px');
    await expect(spinner).toHaveCSS('width', '32px');
    await expect
      .poll(() =>
        spinner.evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).animationDuration),
        ),
      )
      .toBeLessThan(0.001);
  } finally {
    releaseList();
  }
  await expect(page.getByText('등록된 도서가 없습니다')).toBeVisible();

  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('400 14px MaruBuri'))).toBe(true);
  await expect(page.locator('body')).toHaveCSS('font-family', /MaruBuri/);
  const fontUrls = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((url) => /\.woff2/.test(url)),
  );
  expect(fontUrls.length).toBeGreaterThan(0);
  expect(fontUrls.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true);

  const add = page.getByRole('button', { name: '도서 추가', exact: true }).first();
  await expect(add).toHaveCSS('height', '36px');
  await expect(add).toHaveCSS('padding', '5px 11px');
  await expect(add).toHaveCSS('border-radius', '8px');
  await expect(add).toHaveCSS('background-color', 'rgb(45, 47, 52)');
  await page.evaluate(() =>
    document.documentElement.style.setProperty('--color-action', '10 20 30'),
  );
  await expect(add).toHaveCSS('background-color', 'rgb(10, 20, 30)');
  await page.evaluate(() => document.documentElement.style.removeProperty('--color-action'));
  await expect(add).toHaveCSS('background-color', 'rgb(45, 47, 52)');

  const search = page.getByLabel('검색', { exact: true });
  await expect(search).toHaveCSS('border-radius', '8px');
  await expect(search).toHaveCSS('padding-left', '32px');
  await page.keyboard.press('ControlOrMeta+f');
  await expect(search).toBeFocused();
  await expect(search).toHaveCSS('border-color', 'rgb(111, 117, 126)');
  await expect(search).toHaveCSS('box-shadow', /rgb\(111, 117, 126\)/);

  const libraryHeading = page.getByRole('heading', { name: '나의 서재', exact: true });
  await expect(libraryHeading).toHaveCSS('font-size', '20px');
  await expect(libraryHeading).toHaveCSS('line-height', '32px');
  await expect(page.getByRole('columnheader', { name: '도서', exact: true })).toHaveCSS(
    'font-size',
    '14px',
  );
  await expect(search).toHaveCSS('height', '36px');
  await expect(page.getByRole('button', { name: '목록 보기', exact: true })).toHaveCSS(
    'height',
    '36px',
  );
  await expect(page.getByLabel('주제', { exact: true })).toHaveCSS('height', '36px');

  const sidebar = page.locator('aside');
  const main = page.locator('main');
  await expect(sidebar).toHaveCSS('width', '256px');
  await expect(main).toHaveCSS('margin-left', '256px');
  await page.setViewportSize({ width: 800, height: 800 });
  await expect(sidebar).toHaveCSS('width', '176px');
  await expect(main).toHaveCSS('margin-left', '176px');
  await page.setViewportSize({ width: 640, height: 800 });
  await expect(sidebar).toHaveCSS('position', 'static');
  await expect(main).toHaveCSS('margin-left', '0px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(640);
  await page.setViewportSize({ width: 1360, height: 900 });

  await add.click();
  const panel = page.getByRole('dialog', { name: '도서 추가' });
  await expect(panel).toHaveCSS('z-index', '50');
  await expect(page.getByLabel('도서명')).toHaveCSS('border-radius', '8px');
  const animation = await panel
    .locator('div')
    .evaluateAll(
      (elements) =>
        elements
          .map((element) => getComputedStyle(element))
          .find((style) => style.animationName === 'reading-desk-slide-right')?.animationDuration,
    );
  expect(animation).toBeDefined();
  expect(Number.parseFloat(animation ?? '1')).toBeLessThan(0.001);
  await panel.getByRole('button', { name: '추가', exact: true }).click();
  await expect(page.getByLabel('도서명')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('도서명')).toHaveAttribute('aria-describedby', 'book_name-error');
  await expect(panel.getByRole('alert')).toBeVisible();
  await page.getByLabel('도서명').fill('스타일 회귀 확인 도서');
  await page.getByLabel('주제', { exact: true }).last().fill('토큰');
  await page.getByRole('button', { name: '추가', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '스타일 회귀 확인 도서', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  await page.getByRole('button', { name: '표지 보기', exact: true }).click();
  const card = page.getByRole('button', { name: /스타일 회귀 확인 도서, 주제:/ });
  const category = card.locator('[style*="background-color"]').first();
  const token = await category.evaluate(
    (element) => element.getAttribute('style')?.match(/--color-category-\d+/)?.[0],
  );
  expect(token).toBeDefined();
  await page.evaluate(
    (name) => document.documentElement.style.setProperty(name ?? '', '10 20 30'),
    token,
  );
  await expect(category).toHaveCSS('background-color', 'rgb(10, 20, 30)');
  await page.evaluate((name) => document.documentElement.style.removeProperty(name ?? ''), token);
  await page.getByRole('link', { name: '통계', exact: true }).click();
  await expect(page.getByRole('heading', { name: '통계', exact: true })).toBeVisible();
  await expect(page.locator('svg [fill="rgb(var(--color-chart-1))"]').first()).toHaveCSS(
    'fill',
    'rgb(87, 93, 103)',
  );

  await expect(page.getByRole('heading', { name: '통계', exact: true })).toHaveCSS(
    'line-height',
    '32px',
  );
  await page.getByRole('link', { name: '설정', exact: true }).click();
  await expect(page.getByRole('heading', { name: '설정', exact: true })).toHaveCSS(
    'font-size',
    '20px',
  );
  const pinSection = page.getByRole('region', { name: 'PIN 잠금', exact: true });
  const sectionTitle = await pinSection.getByRole('heading', { name: 'PIN 잠금' }).boundingBox();
  const firstAction = await pinSection
    .getByRole('button', { name: '켜기', exact: true })
    .boundingBox();
  expect(sectionTitle).not.toBeNull();
  expect(firstAction).not.toBeNull();
  expect(firstAction?.x ?? 0).toBeGreaterThan((sectionTitle?.x ?? 0) + 200);
  expect(
    Math.abs(
      (firstAction?.y ?? 0) +
        (firstAction?.height ?? 0) / 2 -
        ((sectionTitle?.y ?? 0) + (sectionTitle?.height ?? 0) / 2),
    ),
  ).toBeLessThan(1);
  await expect(pinSection.locator('input')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '파일 선택', exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('settings-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 400, height: 800 });
  await expect
    .poll(async () => {
      const action = await pinSection
        .getByRole('button', { name: '켜기', exact: true })
        .boundingBox();
      return action ? action.x + action.width : Number.POSITIVE_INFINITY;
    })
    .toBeLessThanOrEqual(400);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(400);
  await page.screenshot({ path: testInfo.outputPath('settings-compact.png'), fullPage: true });
  await page.setViewportSize({ width: 1360, height: 900 });

  await page.getByRole('link', { name: '나의 서재', exact: true }).click();
  await page.getByRole('button', { name: '스타일 회귀 확인 도서', exact: true }).click();
  const detail = page.getByRole('dialog');
  await expect(detail).toHaveCSS('z-index', '50');
  await detail.getByRole('button', { name: '삭제', exact: true }).click();
  await page
    .getByRole('dialog', { name: '도서 삭제', exact: true })
    .getByRole('button', { name: '삭제', exact: true })
    .click();
  await expect(page.getByText('등록된 도서가 없습니다')).toBeVisible();
});
