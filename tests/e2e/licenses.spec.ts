import { expect, test } from './fixtures';

test('license layer keeps its header fixed and scrolls at the inner edge', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto('/');
  await page.getByRole('link', { name: '설정', exact: true }).click();
  const trigger = page.getByRole('button', { name: '오픈소스 저작권 정보', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: '오픈소스 저작권 정보', exact: true });
  const heading = dialog.getByRole('heading', { name: '오픈소스 저작권 정보' });
  const close = dialog.getByRole('button', { name: 'Close', exact: true });
  const entries = dialog.locator('summary');
  await expect(entries.filter({ hasText: '마루 부리 (MaruBuri)' })).toBeVisible();
  await expect(entries.filter({ has: page.getByText('react', { exact: true }) })).toHaveCount(1);
  await expect(
    entries.filter({ hasText: /@babel\/|@types\/|caniuse-lite|browserslist|^vite\s|^vitest\s/ }),
  ).toHaveCount(0);
  await entries.filter({ hasText: '마루 부리 (MaruBuri)' }).click();

  const readLayout = () =>
    dialog.evaluate((root) => {
      const bodies = Array.from(root.querySelectorAll<HTMLElement>('*')).filter(
        (element) =>
          getComputedStyle(element).overflowY === 'auto' &&
          element.scrollHeight > element.clientHeight,
      );
      const body = bodies[0];
      const panel = body?.parentElement;
      if (!body || !panel) throw new Error('Scrollable license body was not found.');
      const bounds = panel.getBoundingClientRect();
      return {
        scrollAreas: bodies.length,
        rightGap: bounds.right - body.getBoundingClientRect().right,
        centerX: bounds.x + bounds.width / 2,
        centerY: bounds.y + bounds.height / 2,
        bodyX: body.getBoundingClientRect().x + body.clientWidth / 2,
        bodyY: body.getBoundingClientRect().y + body.clientHeight / 2,
      };
    });
  for (const viewport of [
    { width: 1360, height: 900 },
    { width: 600, height: 700 },
  ]) {
    await page.setViewportSize(viewport);
    await expect
      .poll(async () => {
        const layout = await readLayout();
        return Math.max(
          Math.abs(layout.centerX - viewport.width / 2),
          Math.abs(layout.centerY - viewport.height / 2),
        );
      })
      .toBeLessThan(1);
    const layout = await readLayout();
    expect(layout.scrollAreas).toBe(1);
    expect(layout.rightGap).toBeLessThanOrEqual(1);
    const before = await heading.boundingBox();
    const backgroundScroll = await page.evaluate(() => document.documentElement.scrollTop);
    await page.mouse.move(layout.bodyX, layout.bodyY);
    await page.mouse.wheel(0, 900);
    await expect
      .poll(() =>
        dialog.evaluate((root) =>
          Array.from(root.querySelectorAll<HTMLElement>('*')).some(
            (element) => element.scrollTop > 0,
          ),
        ),
      )
      .toBe(true);
    expect(await heading.boundingBox()).toEqual(before);
    await expect(close).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(backgroundScroll);
  }

  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
