import { expect, test } from './fixtures';

test('keyboard work stays in one overlay and search opens in a compact window', async ({
  page,
}) => {
  await page.goto('/');
  const add = page.getByRole('button', { name: '도서 추가', exact: true }).first();
  await add.click();
  const panel = page.getByRole('dialog', { name: '도서 추가' });
  await expect(panel.getByRole('button', { name: '패널 닫기', exact: true })).toBeFocused();
  await page.getByLabel('도서명').fill('키보드 회귀 도서');
  await page.keyboard.press('ControlOrMeta+n');
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(page.getByLabel('도서명')).toHaveValue('키보드 회귀 도서');
  await page.keyboard.press('ControlOrMeta+f');
  await expect(panel).toContainText('도서 기본 정보');
  expect(
    await page.evaluate(() =>
      document.querySelector('[role="dialog"]')?.contains(document.activeElement),
    ),
  ).toBe(true);
  await page.getByRole('button', { name: '추가', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(panel.getByRole('button', { name: '패널 닫기', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(panel.getByRole('button', { name: '추가', exact: true })).toBeFocused();
  let failCreate = true;
  await page.route('**/rpc', async (route) => {
    if (failCreate && route.request().postDataJSON()?.command === 'create') {
      failCreate = false;
      await route.fulfill({ json: { ok: false, error: '가상 저장 실패' } });
    } else {
      await route.fallback();
    }
  });
  await panel.getByRole('button', { name: '추가', exact: true }).click();
  await expect(panel.getByRole('alert')).toContainText('가상 저장 실패');
  await panel.getByRole('alert').getByRole('button', { name: '닫기', exact: true }).click();
  await page.getByRole('button', { name: '추가', exact: true }).click();
  const book = page.getByRole('button', { name: '키보드 회귀 도서', exact: true });
  await expect(book).toBeVisible();
  await book.click();
  await page.getByRole('button', { name: '수정', exact: true }).click();
  await page.getByLabel('도서명').fill('수정 중 보존');
  await page.keyboard.press('ControlOrMeta+n');
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(page.getByRole('dialog', { name: '도서 수정' })).toBeVisible();
  await expect(page.getByLabel('도서명')).toHaveValue('수정 중 보존');
  await page.keyboard.press('Escape');
  await book.click();
  await page.keyboard.press('Escape');
  await expect(book).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.setViewportSize({ width: 800, height: 800 });
  await page.keyboard.press('ControlOrMeta+f');
  await expect(page.getByLabel('검색', { exact: true })).toBeVisible();
  await expect(page.getByLabel('검색', { exact: true })).toBeFocused();
});

test('statistics retry after a read failure without claiming the library is empty', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '도서 추가', exact: true }).first().click();
  await page.getByLabel('도서명').fill('보존할 도서');
  await page.getByRole('button', { name: '추가', exact: true }).click();
  await expect(page.getByRole('button', { name: '보존할 도서', exact: true })).toBeVisible();
  // A fresh renderer has no successful cached stats; fail only stats, then allow a retry.
  let failStats = true;
  await page.route('**/rpc', async (route) => {
    if (failStats && route.request().postDataJSON()?.command === 'stats') {
      await route.fulfill({ json: { ok: false, error: '가상 통계 조회 오류' } });
    } else {
      await route.fallback();
    }
  });
  await page.goto('/#/stats');
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('통계를 불러오지 못했습니다');
  await expect(page.getByText('통계 데이터가 없습니다. 도서를 추가해주세요.')).toHaveCount(0);
  failStats = false;
  await page.getByRole('button', { name: '다시 시도' }).click();
  await expect(page.getByRole('heading', { name: '주제별 도서 통계' })).toBeVisible();
});
