import { expect, test } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'test1@test.com';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Test1234!';
const DEFAULT_USER_PASSWORD = process.env.E2E_NEW_USER_PASSWORD ?? 'Test1234!';

test.describe('운영 콘솔 사용자 삭제 감사 로그', () => {
  test.setTimeout(120000);

  test('사용자 삭제 시 감사 로그 대상에 삭제된 사용자 이메일이 표시되어야 함', async ({
    page,
    browser,
  }) => {
    const nonce = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const newUserEmail = `pw-ops-${nonce}@test.com`;
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    try {
      await test.step('신규 사용자 회원가입', async () => {
        await page.goto('/signup');

        await page.locator('input[type="email"]').fill(newUserEmail);
        await page.locator('#password').fill(DEFAULT_USER_PASSWORD);
        await page.locator('#passwordConfirm').fill(DEFAULT_USER_PASSWORD);
        await page.getByRole('button', { name: '회원가입' }).click();

        await expect(page.getByText('회원가입이 완료되었습니다. 이메일을 확인해주세요.')).toBeVisible();
      });

      await test.step('관리자 계정 로그인 후 운영 콘솔 이동', async () => {
        await adminPage.goto('/login');

        await adminPage.getByLabel('이메일').fill(ADMIN_EMAIL);
        await adminPage.getByLabel('비밀번호').fill(ADMIN_PASSWORD);
        await adminPage.getByRole('button', { name: '로그인' }).click();

        await expect(adminPage.getByRole('button', { name: '관리' })).toBeVisible();
        await adminPage.getByRole('button', { name: '관리' }).click();
        await expect(adminPage).toHaveURL(/\/admin/);

        await expect(adminPage.getByRole('button', { name: '운영 콘솔' })).toBeVisible();
        await adminPage.getByRole('button', { name: '운영 콘솔' }).click();
        await expect(adminPage).toHaveURL(/\/ops/);
      });

      await test.step('운영 콘솔에서 신규 사용자 삭제', async () => {
        const searchInput = adminPage.getByPlaceholder('이메일 또는 사용자 ID 검색');
        await searchInput.fill(newUserEmail);

        const userRow = adminPage.locator('tbody tr').filter({ hasText: newUserEmail }).first();
        await expect(userRow).toBeVisible();

        adminPage.once('dialog', (dialog) => {
          dialog.accept();
        });

        await userRow.getByRole('button', { name: '삭제' }).click();
        await expect(userRow).toHaveCount(0);
      });

      await test.step('감사 로그 탭에서 삭제 대상 이메일 확인', async () => {
        await adminPage.getByRole('button', { name: '감사 로그' }).click();
        await expect(adminPage.getByRole('heading', { name: '감사 로그' })).toBeVisible();
        await adminPage.getByRole('button', { name: '새로고침' }).click();

        const auditRow = adminPage.locator('tbody tr').filter({ hasText: newUserEmail }).first();
        await expect(auditRow).toBeVisible({ timeout: 30000 });
        await expect(auditRow).toContainText('사용자 삭제');
        await expect(auditRow).toContainText(newUserEmail);
      });
    } finally {
      await adminContext.close().catch(() => undefined);
    }
  });
});
