import { expect, test } from './fixtures';

test('focus rings follow keyboard navigation through panels, modals and book cards', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const add = page.getByRole('button', { name: '도서 추가', exact: true }).first();
  await add.click();
  const panel = page.getByRole('dialog', { name: '도서 추가', exact: true });
  const panelClose = panel.getByRole('button', { name: '패널 닫기', exact: true });
  await expect(panelClose).toBeFocused();
  await expect(panelClose).toHaveCSS('box-shadow', 'none');

  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(panelClose).toBeFocused();
  await expect(panelClose).toHaveCSS('box-shadow', /rgb\(111, 117, 126\)/);
  await panel.getByRole('heading', { name: '도서 추가', exact: true }).click();
  await panelClose.click();
  await expect(add).toBeFocused();
  await expect(add).toHaveCSS('outline-style', 'none');

  await page.keyboard.press('Enter');
  await expect(panelClose).toBeFocused();
  await expect(panelClose).toHaveCSS('box-shadow', /rgb\(111, 117, 126\)/);
  await page.getByLabel('도서명').fill('포커스 확인 도서');
  await panel.getByRole('button', { name: '추가', exact: true }).click();
  const notification = page.getByRole('status').filter({ hasText: '추가' });
  const toastClose = notification.getByRole('button', { name: '닫기', exact: true });
  await expect(notification).toBeVisible();
  await toastClose.hover();
  await page.mouse.down();
  await expect(toastClose).toHaveCSS('box-shadow', 'none');
  await page.mouse.up();

  await page.getByRole('button', { name: '포커스 확인 도서', exact: true }).click();
  const modal = page.getByRole('dialog', { name: '포커스 확인 도서', exact: true });
  const modalClose = modal.getByRole('button', { name: 'Close', exact: true });
  await expect(modalClose).toBeFocused();
  await expect(modalClose).toHaveCSS('box-shadow', 'none');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(modalClose).toBeFocused();
  await expect(modalClose).toHaveCSS('box-shadow', /rgb\(111, 117, 126\)/);
  await modalClose.click();
  await page.getByRole('button', { name: '표지 보기', exact: true }).click();
  const card = page.getByRole('button', { name: /^포커스 확인 도서/ });
  await card.click();
  await expect(modalClose).toHaveCSS('box-shadow', 'none');
  await modalClose.click();
  await expect(card).toBeFocused();
  await expect(card).toHaveCSS('box-shadow', 'none');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(card).toBeFocused();
  await expect(card).toHaveCSS('box-shadow', /rgb\(111, 117, 126\)/);
  await page.keyboard.press('Enter');
  await expect(modalClose).toBeFocused();
  await expect(modalClose).toHaveCSS('box-shadow', /rgb\(111, 117, 126\)/);
  await page.keyboard.press('Escape');
  await expect(card).toBeFocused();
  await expect(card).toHaveCSS('box-shadow', /rgb\(111, 117, 126\)/);
});
