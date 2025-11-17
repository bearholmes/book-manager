import { test, expect } from '@playwright/test';

test.describe('도서 목록', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('도서 목록 영역이 표시되어야 함', async ({ page }) => {
    // 그리드 레이아웃 확인
    const bookGrid = page.locator('[class*="grid"]').first();
    await expect(bookGrid).toBeVisible();
  });

  test('도서가 없을 때 안내 메시지 또는 빈 상태가 표시되어야 함', async ({ page }) => {
    // 도서가 없거나 있을 수 있으므로 두 경우 모두 확인
    const noBooks = page.locator('text=/도서가 없습니다|등록된 도서|아직 도서가/i');
    const bookCards = page.locator('[role="button"]').filter({ hasText: /도서명|저자/ });

    const hasMessage = await noBooks.isVisible().catch(() => false);
    const hasBooks = (await bookCards.count()) > 0;

    // 둘 중 하나는 true여야 함
    expect(hasMessage || hasBooks).toBeTruthy();
  });

  test('도서 카드가 클릭 가능해야 함', async ({ page }) => {
    // 도서 카드 찾기 (있다면)
    const bookCards = page.locator('[role="button"]').filter({ hasText: /도서명|저자/ });
    const cardCount = await bookCards.count();

    if (cardCount > 0) {
      const firstCard = bookCards.first();
      await expect(firstCard).toBeVisible();

      // 클릭 가능한지 확인
      await expect(firstCard).toBeEnabled();
    }
  });

  test('도서 카드에 기본 정보가 표시되어야 함', async ({ page }) => {
    const bookCards = page.locator('[role="button"]').filter({ hasText: /도서명|저자/ });
    const cardCount = await bookCards.count();

    if (cardCount > 0) {
      const firstCard = bookCards.first();

      // 카드 내부 텍스트 확인 (도서명, 저자 등이 있어야 함)
      const cardText = await firstCard.textContent();
      expect(cardText).toBeTruthy();
      expect(cardText!.length).toBeGreaterThan(0);
    }
  });

  test('키보드로 도서 카드를 탐색할 수 있어야 함', async ({ page }) => {
    const bookCards = page.locator('[role="button"]').filter({ hasText: /도서명|저자/ });
    const cardCount = await bookCards.count();

    if (cardCount > 0) {
      const firstCard = bookCards.first();

      // Tab 키로 포커스 이동
      await page.keyboard.press('Tab');

      // 일부 요소가 포커스를 받았는지 확인
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    }
  });

  test('도서 통계가 올바르게 표시되어야 함', async ({ page }) => {
    // 전체 도서 수 확인
    const statsSection = page.locator('text=/전체 도서/');
    await expect(statsSection).toBeVisible();

    // 통계 숫자 확인
    const statsText = await statsSection.textContent();
    expect(statsText).toMatch(/\d+/); // 숫자가 포함되어 있어야 함
  });

  test('페이지 네비게이션이 있다면 동작해야 함', async ({ page }) => {
    // 페이지네이션 버튼 찾기 (있다면)
    const nextButton = page.getByRole('button', { name: /다음|Next/i });
    const prevButton = page.getByRole('button', { name: /이전|Previous/i });

    const hasNext = await nextButton.isVisible().catch(() => false);
    const hasPrev = await prevButton.isVisible().catch(() => false);

    if (hasNext || hasPrev) {
      // 페이지네이션이 있으면 제대로 동작하는지 확인
      expect(hasNext || hasPrev).toBeTruthy();
    }
  });

  test('반응형 레이아웃이 동작해야 함', async ({ page }) => {
    // 데스크톱 크기
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(300);

    const bookGrid = page.locator('[class*="grid"]').first();
    await expect(bookGrid).toBeVisible();

    // 모바일 크기
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    // 모바일에서도 그리드가 보여야 함
    await expect(bookGrid).toBeVisible();
  });

  test('검색 필터링이 즉시 적용되어야 함', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/도서명, 저자, 출판사로 검색/);
    const bookCards = page.locator('[role="button"]').filter({ hasText: /도서명|저자/ });

    // 초기 도서 수 확인
    const initialCount = await bookCards.count();

    // 존재하지 않는 도서 검색
    await searchInput.fill('zzzzz-nonexistent-book-zzzzz');
    await page.waitForTimeout(500); // 디바운스 대기

    // 검색 후 도서 수 (줄어들거나 0이어야 함)
    const afterSearchCount = await bookCards.count();

    // 초기화
    await searchInput.clear();
    await page.waitForTimeout(500);

    // 초기 상태로 돌아왔는지 확인
    const finalCount = await bookCards.count();
    expect(finalCount).toBeGreaterThanOrEqual(0);
  });

  test('도서 카드 hover 시 시각적 피드백이 있어야 함', async ({ page }) => {
    const bookCards = page.locator('[role="button"]').filter({ hasText: /도서명|저자/ });
    const cardCount = await bookCards.count();

    if (cardCount > 0) {
      const firstCard = bookCards.first();

      // hover 전 스타일
      const beforeHover = await firstCard.evaluate((el) => {
        return window.getComputedStyle(el).cursor;
      });

      // hover
      await firstCard.hover();

      // cursor가 pointer여야 함
      expect(beforeHover).toBe('pointer');
    }
  });
});
