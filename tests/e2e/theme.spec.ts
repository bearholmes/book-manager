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

  await page.evaluate(async () => {
    await document.fonts.load('400 14px MaruBuri', '나의 서재');
    await document.fonts.ready;
  });
  expect(await page.evaluate(() => document.fonts.check('400 14px MaruBuri'))).toBe(true);
  await expect(page.locator('body')).toHaveCSS('font-family', /^"?Pretendard(?: Variable)?"?,/i);
  await expect(page.getByRole('heading', { name: '나의 서재', exact: true })).toHaveCSS(
    'font-family',
    /MaruBuri/,
  );
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
  await expect(add).toHaveCSS('padding', '7px 12px');
  await expect(add).toHaveCSS('border-radius', '6px');
  await expect(add).toHaveCSS('background-color', 'rgb(54, 92, 72)');
  await page.evaluate(() =>
    document.documentElement.style.setProperty('--color-action', '10 20 30'),
  );
  await expect(add).toHaveCSS('background-color', 'rgb(10, 20, 30)');
  await page.evaluate(() => document.documentElement.style.removeProperty('--color-action'));
  await expect(add).toHaveCSS('background-color', 'rgb(54, 92, 72)');

  const search = page.getByLabel('검색', { exact: true });
  await expect(search).toHaveCSS('border-radius', '6px');
  await expect(search).toHaveCSS('padding-left', '32px');
  await page.keyboard.press('ControlOrMeta+f');
  await expect(search).toBeFocused();
  await expect(search).toHaveCSS('border-color', 'rgb(54, 92, 72)');
  await expect(search).toHaveCSS('outline-color', 'rgb(54, 92, 72)');
  await expect(search).toHaveCSS('outline-width', '2px');

  const libraryHeading = page.getByRole('heading', { name: '나의 서재', exact: true });
  await expect(libraryHeading).toHaveCSS('font-size', '24px');
  await expect(libraryHeading).toHaveCSS('line-height', '36px');
  await expect(page.getByRole('columnheader', { name: '도서', exact: true })).toHaveCSS(
    'font-size',
    '13px',
  );
  await expect(search).toHaveCSS('height', '38px');
  await expect(page.getByRole('button', { name: '목록 보기', exact: true })).toHaveCSS(
    'height',
    '36px',
  );
  await expect(page.getByLabel('주제', { exact: true })).toHaveCSS('height', '38px');

  const sidebar = page.locator('aside');
  const main = page.locator('main');
  await expect(sidebar).toHaveCSS('width', '208px');
  await expect(main).toHaveCSS('margin-left', '208px');
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
  await expect(page.getByLabel('도서명')).toHaveCSS('border-radius', '6px');
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
    'rgb(54, 92, 72)',
  );

  await expect(page.getByRole('heading', { name: '통계', exact: true })).toHaveCSS(
    'line-height',
    '36px',
  );
  await page.getByRole('link', { name: '설정', exact: true }).click();
  await expect(page.getByRole('heading', { name: '설정', exact: true })).toHaveCSS(
    'font-size',
    '24px',
  );
  const pinSection = page.getByRole('region', { name: 'PIN 잠금', exact: true });
  const settingsHeader = await page.locator('main header').boundingBox();
  const settingsRow = await pinSection.boundingBox();
  expect(settingsHeader).not.toBeNull();
  expect(settingsRow).not.toBeNull();
  expect(Math.abs((settingsRow?.width ?? 0) - (settingsHeader?.width ?? 0))).toBeLessThan(1);
  await expect(sidebar.getByText('방구석 도서관리', { exact: true })).toHaveCount(1);
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
        ((settingsRow?.y ?? 0) + (settingsRow?.height ?? 0) / 2),
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

test('theme selection persists and follows the system only when selected', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('link', { name: '설정', exact: true }).click();
  const theme = page.getByRole('combobox', { name: '테마', exact: true });
  await expect(theme).toHaveValue('system');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await expect(page.locator('main')).toHaveCSS('background-color', 'rgb(32, 35, 31)');
  await expect(theme).toHaveCSS('color', 'rgb(238, 237, 229)');
  await page.screenshot({ path: testInfo.outputPath('settings-dark.png'), fullPage: true });

  await theme.selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('main')).toHaveCSS('background-color', 'rgb(246, 243, 237)');
  await page.reload();
  await expect(theme).toHaveValue('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.emulateMedia({ colorScheme: 'light' });
  await theme.selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(theme).toHaveValue('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await theme.selectOption('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('link', { name: '나의 서재', exact: true }).click();
  await page.getByRole('button', { name: '도서 추가', exact: true }).first().click();
  await expect(page.getByLabel('도서명')).toHaveCSS('background-color', 'rgb(48, 54, 47)');
  await page.screenshot({ path: testInfo.outputPath('book-form-dark.png'), fullPage: true });
  await page.getByRole('button', { name: '패널 닫기', exact: true }).click();
  await page.getByRole('link', { name: '통계', exact: true }).click();
  await expect(page.getByRole('heading', { name: '통계', exact: true })).toHaveCSS(
    'color',
    'rgb(238, 237, 229)',
  );
});

test('navigation preserves selected, hover and keyboard focus states in both modes', async ({
  page,
}) => {
  for (const mode of [
    {
      scheme: 'light' as const,
      selected: 'rgb(91, 107, 83)',
      selectedHover: 'rgb(82, 98, 74)',
      foreground: 'rgb(251, 249, 245)',
      hover: 'rgb(227, 223, 213)',
      secondary: 'rgb(86, 91, 83)',
      focus: 'rgb(54, 92, 72)',
    },
    {
      scheme: 'dark' as const,
      selected: 'rgb(54, 76, 62)',
      selectedHover: 'rgb(54, 76, 62)',
      foreground: 'rgb(238, 237, 229)',
      hover: 'rgb(52, 59, 50)',
      secondary: 'rgb(197, 201, 190)',
      focus: 'rgb(192, 217, 185)',
    },
  ]) {
    await page.emulateMedia({ colorScheme: mode.scheme, reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', mode.scheme);
    const nav = page.locator('aside nav');
    const selected = nav.getByRole('link', { name: '나의 서재', exact: true });
    const other = nav.getByRole('link', { name: '통계', exact: true });
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(selected).toHaveAttribute('aria-current', 'page');
    await expect(selected).toHaveCSS('background-color', mode.selected);
    await expect(selected).toHaveCSS('color', mode.foreground);
    await expect(selected).toHaveCSS('font-weight', '600');
    await expect(other).toHaveCSS('color', mode.secondary);
    await selected.hover();
    await expect(selected).toHaveCSS('background-color', mode.selectedHover);
    await expect(selected).toHaveCSS('color', mode.foreground);
    await other.hover();
    await expect(other).toHaveCSS('background-color', mode.hover);
    await expect(selected).toHaveCSS('background-color', mode.selected);
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await selected.focus();
    await expect(selected).toBeFocused();
    await expect(selected).toHaveCSS('outline-color', mode.focus);
    await expect(selected).toHaveCSS('outline-width', '2px');
    await expect(selected).toHaveCSS('outline-offset', '2px');
    await expect(selected).toHaveCSS('background-color', mode.selected);
    await other.focus();
    await expect(other).toHaveCSS('outline-color', mode.focus);
    await expect(other).toHaveCSS('outline-width', '2px');
    await expect(other).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  }
});
