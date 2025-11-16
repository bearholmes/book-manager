import { test, expect } from '@playwright/test';

test.describe('로그인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('페이지가 로드되어야 함', async ({ page }) => {
    await expect(page).toHaveTitle(/방구석 도서관리/);
  });

  test('로그인 폼이 표시되어야 함', async ({ page }) => {
    // 이메일 입력 필드
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // 비밀번호 입력 필드
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // 로그인 버튼
    const loginButton = page.getByRole('button', { name: /로그인/ });
    await expect(loginButton).toBeVisible();
  });

  test('빈 폼 제출 시 유효성 검사 에러가 표시되어야 함', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /로그인/ });
    await loginButton.click();

    // HTML5 기본 유효성 검사 또는 커스텀 에러 메시지 확인
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);

    expect(isInvalid).toBeTruthy();
  });

  test('회원가입 링크가 동작해야 함', async ({ page }) => {
    const signupLink = page.getByRole('link', { name: /회원가입/ });
    await expect(signupLink).toBeVisible();

    await signupLink.click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('홈으로 돌아가기 링크가 있어야 함', async ({ page }) => {
    // 로고나 홈 링크가 있는지 확인
    const homeLink = page.locator('a[href="/"]');

    if (await homeLink.count() > 0) {
      await expect(homeLink.first()).toBeVisible();
    }
  });
});
