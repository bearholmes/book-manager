import { test, expect } from '@playwright/test';

test.describe('회원가입 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('페이지가 로드되어야 함', async ({ page }) => {
    await expect(page).toHaveTitle(/방구석 도서관리/);

    const heading = page.getByRole('heading', { name: /회원가입/ });
    await expect(heading).toBeVisible();
  });

  test('회원가입 폼이 표시되어야 함', async ({ page }) => {
    // 이메일 입력 필드
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // 비밀번호 입력 필드
    const passwordInputs = page.locator('input[type="password"]');
    await expect(passwordInputs).toHaveCount(2); // 비밀번호 + 비밀번호 확인

    // 회원가입 버튼
    const signupButton = page.getByRole('button', { name: /가입하기/ });
    await expect(signupButton).toBeVisible();
  });

  test('빈 폼 제출 시 유효성 검사 에러가 표시되어야 함', async ({ page }) => {
    const signupButton = page.getByRole('button', { name: /가입하기/ });
    await signupButton.click();

    // HTML5 기본 유효성 검사 확인
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);

    expect(isInvalid).toBeTruthy();
  });

  test('잘못된 이메일 형식 시 에러가 표시되어야 함', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');

    const signupButton = page.getByRole('button', { name: /가입하기/ });
    await signupButton.click();

    // 에러 메시지 또는 HTML5 유효성 검사 확인
    const hasError = await page.locator('text=/올바른 이메일/').isVisible().catch(() => false);
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);

    expect(hasError || isInvalid).toBeTruthy();
  });

  test('짧은 비밀번호 시 에러가 표시되어야 함', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill('12345'); // 6자 미만

    const signupButton = page.getByRole('button', { name: /가입하기/ });
    await signupButton.click();

    // 에러 메시지 확인
    const errorMessage = page.locator('text=/최소 6자/');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('비밀번호 불일치 시 에러가 표시되어야 함', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill('password123');
    await passwordInputs.last().fill('password456'); // 다른 비밀번호

    const signupButton = page.getByRole('button', { name: /가입하기/ });
    await signupButton.click();

    // 에러 메시지 확인
    const errorMessage = page.locator('text=/비밀번호가 일치하지/');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('로그인 페이지로 돌아가는 링크가 동작해야 함', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /로그인/ });
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('모든 필드를 올바르게 입력하면 제출 가능해야 함', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('newuser@example.com');

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill('password123');
    await passwordInputs.last().fill('password123');

    const signupButton = page.getByRole('button', { name: /가입하기/ });
    await expect(signupButton).toBeEnabled();

    // 제출 시도 (실제 계정 생성은 Supabase 모킹 필요)
    await signupButton.click();

    // 로딩 상태나 에러 메시지가 표시되어야 함
    // 실제 환경에서는 성공 시 리다이렉트되거나 에러 메시지가 표시됨
    await page.waitForTimeout(1000);
  });
});
