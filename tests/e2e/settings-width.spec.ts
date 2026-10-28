import { expect, test } from './fixtures';

test('settings reading width is limited on desktop and remains usable on narrow screens', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto('/');
  await page.getByRole('link', { name: '설정', exact: true }).click();
  const section = page.getByRole('region', { name: 'PIN 잠금', exact: true });
  await expect(section).toBeVisible();
  const desktopWidth = await section.evaluate((element) => element.getBoundingClientRect().width);
  expect(desktopWidth).toBeLessThanOrEqual(880);
  expect(desktopWidth).toBeGreaterThan(800);

  await page.setViewportSize({ width: 360, height: 780 });
  await expect(section).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
  await page.getByRole('combobox', { name: '테마', exact: true }).selectOption('dark');
  await expect(page.getByRole('combobox', { name: '테마', exact: true })).toHaveValue('dark');
});
