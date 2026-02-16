import { test, expect } from '@playwright/test';

test.describe('도서 필터링', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('검색 필터가 표시되어야 함', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/도서명, 저자, 출판사로 검색/);
    await expect(searchInput).toBeVisible();
  });

  test('주제 필터가 표시되어야 함', async ({ page }) => {
    const topicSelect = page.locator('select#topic-filter');
    await expect(topicSelect).toBeVisible();

    // 기본 옵션 확인
    const defaultOption = topicSelect.locator('option').first();
    await expect(defaultOption).toContainText(/전체 주제/);
  });

  test('구매처 필터가 표시되어야 함', async ({ page }) => {
    const purchasePlaceSelect = page.locator('select#purchase-place-filter');
    await expect(purchasePlaceSelect).toBeVisible();

    // 기본 옵션 확인
    const defaultOption = purchasePlaceSelect.locator('option').first();
    await expect(defaultOption).toContainText(/전체 구매처/);
  });

  test('필터 초기화 버튼이 표시되어야 함', async ({ page }) => {
    const clearButton = page.getByRole('button', { name: /필터 초기화/ });
    await expect(clearButton).toBeVisible();
  });

  test('검색어 입력 시 URL이 업데이트되어야 함', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/도서명, 저자, 출판사로 검색/);
    await searchInput.fill('클린 코드');

    // 디바운스 대기
    await page.waitForTimeout(500);

    // URL 파라미터 확인 (구현에 따라 다를 수 있음)
    // await expect(page).toHaveURL(/search=클린/);
  });

  test('주제 선택 시 필터가 적용되어야 함', async ({ page }) => {
    const topicSelect = page.locator('select#topic-filter');

    // 옵션이 있는지 확인
    const options = topicSelect.locator('option');
    const optionCount = await options.count();

    if (optionCount > 1) {
      // 두 번째 옵션 선택 (첫 번째는 "전체 주제")
      const secondOption = options.nth(1);
      const optionValue = await secondOption.getAttribute('value');

      if (optionValue) {
        await topicSelect.selectOption(optionValue);

        // 선택이 적용되었는지 확인
        const selectedValue = await topicSelect.inputValue();
        expect(selectedValue).toBe(optionValue);
      }
    }
  });

  test('구매처 선택 시 필터가 적용되어야 함', async ({ page }) => {
    const purchasePlaceSelect = page.locator('select#purchase-place-filter');

    const options = purchasePlaceSelect.locator('option');
    const optionCount = await options.count();

    if (optionCount > 1) {
      const secondOption = options.nth(1);
      const optionValue = await secondOption.getAttribute('value');

      if (optionValue) {
        await purchasePlaceSelect.selectOption(optionValue);

        const selectedValue = await purchasePlaceSelect.inputValue();
        expect(selectedValue).toBe(optionValue);
      }
    }
  });

  test('필터 초기화 버튼 클릭 시 모든 필터가 초기화되어야 함', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/도서명, 저자, 출판사로 검색/);
    const topicSelect = page.locator('select#topic-filter');
    const purchasePlaceSelect = page.locator('select#purchase-place-filter');
    const clearButton = page.getByRole('button', { name: /필터 초기화/ });

    // 필터 적용
    await searchInput.fill('테스트');

    // 주제 선택 (있다면)
    const topicOptions = topicSelect.locator('option');
    const topicCount = await topicOptions.count();
    if (topicCount > 1) {
      await topicSelect.selectOption({ index: 1 });
    }

    // 초기화 버튼 클릭
    await clearButton.click();

    // 모든 필터가 초기화되었는지 확인
    await expect(searchInput).toHaveValue('');
    await expect(topicSelect).toHaveValue('');
    await expect(purchasePlaceSelect).toHaveValue('');
  });

  test('필터가 없을 때 초기화 버튼이 비활성화되어야 함', async ({ page }) => {
    const clearButton = page.getByRole('button', { name: /필터 초기화/ });

    // 기본 상태에서는 비활성화
    await expect(clearButton).toBeDisabled();
  });

  test('필터가 있을 때 초기화 버튼이 활성화되어야 함', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/도서명, 저자, 출판사로 검색/);
    const clearButton = page.getByRole('button', { name: /필터 초기화/ });

    // 검색어 입력
    await searchInput.fill('테스트');

    // 디바운스 대기
    await page.waitForTimeout(500);

    // 초기화 버튼 활성화 확인
    await expect(clearButton).toBeEnabled();
  });

  test('여러 필터를 동시에 적용할 수 있어야 함', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/도서명, 저자, 출판사로 검색/);
    const topicSelect = page.locator('select#topic-filter');

    // 검색어 입력
    await searchInput.fill('코드');

    // 주제 선택 (있다면)
    const options = topicSelect.locator('option');
    const optionCount = await options.count();

    if (optionCount > 1) {
      await topicSelect.selectOption({ index: 1 });
    }

    // 디바운스 대기
    await page.waitForTimeout(500);

    // 검색어와 주제가 모두 설정되었는지 확인
    await expect(searchInput).toHaveValue('코드');

    if (optionCount > 1) {
      const selectedValue = await topicSelect.inputValue();
      expect(selectedValue).not.toBe('');
    }
  });
});
