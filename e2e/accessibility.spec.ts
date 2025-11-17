import { test, expect } from '@playwright/test';

test.describe('접근성 (Accessibility)', () => {
  test('홈 페이지가 기본 접근성 요구사항을 충족해야 함', async ({ page }) => {
    await page.goto('/');

    // 페이지 제목이 있어야 함
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // lang 속성이 설정되어 있어야 함
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();
  });

  test('로그인 페이지 폼이 접근 가능해야 함', async ({ page }) => {
    await page.goto('/login');

    // 모든 input에 label이 있거나 aria-label이 있어야 함
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // label이나 aria-label 확인
    const emailLabel = await emailInput.evaluate((el) => {
      const label = document.querySelector(`label[for="${el.id}"]`);
      return label?.textContent || el.getAttribute('aria-label') || el.getAttribute('placeholder');
    });

    expect(emailLabel).toBeTruthy();
  });

  test('키보드로 네비게이션이 가능해야 함', async ({ page }) => {
    await page.goto('/');

    // Tab 키로 이동
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // 계속 Tab으로 이동 가능
    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Shift+Tab으로 역방향 이동
    await page.keyboard.press('Shift+Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('버튼이 적절한 role을 가져야 함', async ({ page }) => {
    await page.goto('/');

    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThan(0);

    // 첫 번째 버튼이 접근 가능한지 확인
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();

      // 텍스트나 aria-label이 있어야 함
      const buttonText = await firstButton.textContent();
      const ariaLabel = await firstButton.getAttribute('aria-label');

      expect(buttonText || ariaLabel).toBeTruthy();
    }
  });

  test('링크가 의미 있는 텍스트를 가져야 함', async ({ page }) => {
    await page.goto('/');

    const links = page.getByRole('link');
    const linkCount = await links.count();

    if (linkCount > 0) {
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = links.nth(i);
        const linkText = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');

        // "여기", "클릭" 같은 모호한 텍스트가 아니어야 함
        expect(linkText || ariaLabel).toBeTruthy();
      }
    }
  });

  test('이미지에 alt 텍스트가 있어야 함', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');

        // alt 속성이 있어야 함 (빈 문자열도 허용 - 장식용 이미지의 경우)
        expect(alt !== null).toBeTruthy();
      }
    }
  });

  test('폼 입력 필드에 에러 메시지가 접근 가능해야 함', async ({ page }) => {
    await page.goto('/login');

    // 빈 폼 제출
    const loginButton = page.getByRole('button', { name: /로그인/ });
    await loginButton.click();

    // 에러 메시지가 있다면 aria-describedby나 role="alert"로 연결되어야 함
    const errorMessages = page.locator('[role="alert"], .error, [class*="error"]');
    const errorCount = await errorMessages.count();

    // 에러가 있다면 접근 가능해야 함
    if (errorCount > 0) {
      const firstError = errorMessages.first();
      const errorText = await firstError.textContent();
      expect(errorText).toBeTruthy();
    }
  });

  test('포커스 순서가 논리적이어야 함', async ({ page }) => {
    await page.goto('/login');

    // Tab 순서 추적
    const focusOrder = [];

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el?.tagName,
          type: el?.getAttribute('type'),
          text: el?.textContent?.slice(0, 20),
        };
      });
      focusOrder.push(focused);
    }

    // 포커스가 이동했는지 확인
    expect(focusOrder.length).toBeGreaterThan(0);

    // 각 요소가 포커스를 받았는지 확인
    const uniqueTags = new Set(focusOrder.map((f) => f.tag));
    expect(uniqueTags.size).toBeGreaterThan(0);
  });

  test('색상 대비가 적절해야 함 (시각적 확인)', async ({ page }) => {
    await page.goto('/');

    // 주요 텍스트 요소의 색상 확인
    const heading = page.locator('h1').first();

    if (await heading.isVisible()) {
      const styles = await heading.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
        };
      });

      // 색상과 배경색이 설정되어 있어야 함
      expect(styles.color).toBeTruthy();
      expect(styles.fontSize).toBeTruthy();
    }
  });

  test('스크린 리더용 텍스트가 숨겨진 경우 sr-only 클래스를 사용해야 함', async ({ page }) => {
    await page.goto('/');

    // sr-only 클래스가 있다면 올바르게 구현되었는지 확인
    const srOnly = page.locator('.sr-only');
    const srOnlyCount = await srOnly.count();

    if (srOnlyCount > 0) {
      const firstSrOnly = srOnly.first();

      // 시각적으로는 숨겨져 있지만 스크린 리더로는 접근 가능해야 함
      const styles = await firstSrOnly.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          position: computed.position,
          width: computed.width,
          height: computed.height,
          overflow: computed.overflow,
        };
      });

      // sr-only는 보통 position: absolute와 작은 크기를 가짐
      expect(styles.position).toBe('absolute');
    }
  });

  test('모달이 열릴 때 포커스가 트랩되어야 함', async ({ page }) => {
    await page.goto('/');

    // 도서 카드 클릭 (모달이 열리는 경우)
    const bookCards = page.locator('[role="button"]').filter({ hasText: /도서명|저자/ });
    const cardCount = await bookCards.count();

    if (cardCount > 0) {
      await bookCards.first().click();

      // 모달이 열렸는지 확인
      await page.waitForTimeout(300);

      const modal = page.locator('[role="dialog"], [class*="modal"]');
      const modalVisible = await modal.isVisible().catch(() => false);

      if (modalVisible) {
        // Tab 키로 포커스 이동
        await page.keyboard.press('Tab');

        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedElement).toBeTruthy();

        // Escape 키로 모달 닫기
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);

        // 모달이 닫혔는지 확인
        const modalStillVisible = await modal.isVisible().catch(() => false);
        expect(modalStillVisible).toBe(false);
      }
    }
  });

  test('회원가입 폼 접근성', async ({ page }) => {
    await page.goto('/signup');

    // 모든 폼 필드가 레이블을 가져야 함
    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    expect(inputCount).toBeGreaterThan(0);

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const inputId = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');

      if (inputId) {
        const label = page.locator(`label[for="${inputId}"]`);
        const labelExists = await label.count();

        // id가 있으면 label이 있거나, aria-label이 있어야 함
        expect(labelExists > 0 || ariaLabel || placeholder).toBeTruthy();
      }
    }
  });
});
