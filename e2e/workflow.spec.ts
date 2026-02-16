import { expect, test } from '@playwright/test';

const SEARCH_TERM = process.env.WORKFLOW_SEARCH_TERM ?? '테스트 자동화';

test.describe('브라우저 워크플로우 자동화', () => {
  test('홈 진입 -> 필터 상호작용(가능 시) -> 로그인 화면 진입', async ({ page }) => {
    await test.step('홈 페이지 진입 및 기본 로드 확인', async () => {
      await page.goto('/');
      await expect(page).toHaveTitle(/방구석 도서관리/);
    });

    const searchInput = page.getByPlaceholder('도서명, 저자, 출판사로 검색');
    const clearFiltersButton = page.getByRole('button', { name: /필터 초기화/ });

    const hasFilterPanel = await searchInput.isVisible().catch(() => false);

    if (hasFilterPanel) {
      await test.step('검색 필터 입력 및 초기화 확인', async () => {
        await searchInput.fill(SEARCH_TERM);
        await expect(searchInput).toHaveValue(SEARCH_TERM);
        await expect(clearFiltersButton).toBeEnabled();
        await clearFiltersButton.click();
        await expect(searchInput).toHaveValue('');
      });
    }

    await test.step('로그인 페이지로 이동', async () => {
      const loginButton = page.getByRole('button', { name: /로그인|로그인하러 가기/ }).first();
      const canClickLogin = await loginButton.isVisible().catch(() => false);

      if (canClickLogin) {
        await loginButton.click();
      } else {
        await page.goto('/login');
      }

      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });
  });
});
