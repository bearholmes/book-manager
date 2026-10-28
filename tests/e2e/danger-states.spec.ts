import { expect, test } from './fixtures';

test('dark danger button retains hover and keyboard focus through pointer press', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('link', { name: '설정', exact: true }).click();
  const button = page.getByRole('button', { name: '초기화', exact: true });
  await expect(button).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(button).toHaveCSS('background-color', 'rgb(150, 63, 55)');
  // Use real Tab navigation so Chromium's focus-visible heuristic is exercised.
  for (let i = 0; i < 30 && !(await button.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-width', '2px');
  await expect(button).toHaveCSS('outline-offset', '2px');
  await expect(button).toHaveCSS('outline-color', 'rgb(192, 217, 185)');
  await page.keyboard.down('Space');
  await expect(button).toHaveCSS('background-color', 'rgb(128, 53, 47)');
  await expect(button).toHaveCSS('outline-width', '2px');
  // Cancel the keyboard activation without opening reset.
  await page.keyboard.press('Tab');
  await page.keyboard.up('Space');
  await page.keyboard.press('Shift+Tab');
  await expect(button).toBeFocused();
  await button.hover();
  await expect(button).toHaveCSS('background-color', 'rgb(128, 53, 47)');
  await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(button).toHaveCSS('outline-width', '2px');
  await page.mouse.down();
  await expect(button).toHaveCSS('background-color', 'rgb(128, 53, 47)');
  await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(button).toHaveCSS('outline-width', '2px');
  // Release away from the button so this style test does not open reset.
  await page.mouse.move(0, 0);
  await page.mouse.up();
});
