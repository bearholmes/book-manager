import { test, expect } from '@playwright/test';

test.describe('홈 페이지', () => {
  test('페이지가 로드되어야 함', async ({ page }) => {
    await page.goto('/');

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/방구석 도서관리/);
  });

  test('헤더가 표시되어야 함', async ({ page }) => {
    await page.goto('/');

    // 제목 확인
    const heading = page.locator('h1');
    await expect(heading).toContainText('방구석 도서관리');

    // 로그인 버튼 확인
    const loginButton = page.getByRole('button', { name: /로그인/ });
    await expect(loginButton).toBeVisible();
  });

  test('통계가 표시되어야 함', async ({ page }) => {
    await page.goto('/');

    // 전체 도서 통계 확인
    const statsText = page.getByText(/전체 도서/);
    await expect(statsText).toBeVisible();
  });

  test('도서가 없을 때 안내 메시지가 표시되어야 함', async ({ page }) => {
    await page.goto('/');

    // 도서가 없다는 메시지 또는 도서 목록이 있어야 함
    const noBooks = page.getByText(/도서가 없습니다/);
    const bookGrid = page.locator('[class*="grid"]');

    const hasNoBooks = await noBooks.isVisible().catch(() => false);
    const hasBooks = await bookGrid.isVisible().catch(() => false);

    expect(hasNoBooks || hasBooks).toBeTruthy();
  });

  test('로그인 페이지로 이동할 수 있어야 함', async ({ page }) => {
    await page.goto('/');

    // 로그인 버튼 클릭
    const loginButton = page.getByRole('button', { name: /로그인/ });
    await loginButton.click();

    // URL 확인
    await expect(page).toHaveURL(/\/login/);
  });
});
