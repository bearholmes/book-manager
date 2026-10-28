import { expect, test } from './fixtures';

test('Codex settings persist and duplicate snackbar gates lookup and save; suggestions stay editable', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: /설정/ }).click();
  await page.getByLabel('AI 모델', { exact: true }).fill('gpt-6.1-terra');
  await page.getByLabel('추론 수준').selectOption('high');
  await page.getByRole('button', { name: '설정 저장' }).click();
  await expect(page.getByText('모델·추론 설정을 저장했습니다.', { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('추론 수준')).toHaveValue('high');
  await page.getByRole('link', { name: /서재/ }).click();
  await page.getByRole('button', { name: '도서 추가', exact: true }).click();
  await page.getByRole('textbox', { name: /도서명/ }).fill('기존 도서');
  await page.getByLabel('ISBN-13').fill('8966260950');
  await page.getByRole('button', { name: '추가', exact: true }).click();
  await expect(page.getByRole('button', { name: '기존 도서', exact: true })).toBeVisible();
  let starts = 0;
  const cover = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#326';
      ctx.fillRect(0, 0, 60, 80);
    }
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.route('**/rpc', async (route) => {
    const { command } = route.request().postDataJSON();
    let data: unknown;
    switch (command) {
      case 'lookupStart':
        starts++;
        data = { jobId: 'test-job' };
        break;
      case 'lookupStatus':
        data = {
          state: 'succeeded',
          searched: true,
          result: {
            candidates: [
              {
                title: '추천 도서',
                author: '추천 저자',
                publisher: '출판사',
                publicationDate: '2026-10-28',
                reportedIsbn: '9788966260959',
                sources: [],
                notes: [],
                covers: [
                  {
                    imageUrl: 'https://example.com/cover.png',
                    sourcePageUrl: 'https://example.com/book',
                  },
                ],
              },
            ],
          },
        };
        break;
      case 'lookupCoverStart':
        data = { transferId: 'test-cover' };
        break;
      case 'lookupCoverStatus':
        data = { state: 'succeeded', data: cover, mimeType: 'image/png' };
        break;
      case 'lookupCancel':
      case 'lookupCoverCancel':
        data = null;
        break;
      default:
        await route.fallback();
        return;
    }
    await route.fulfill({ json: { ok: true, data } });
  });
  await page.getByRole('button', { name: '도서 추가', exact: true }).click();
  await page.getByLabel('ISBN-13').fill('978-8966260959');
  await page.getByRole('button', { name: '정보 찾기' }).click();
  const snack = page.getByRole('alert').filter({ hasText: '동일한 책이 이미' });
  await expect(snack).toBeVisible();
  await snack.getByRole('button', { name: '취소', exact: true }).click();
  expect(starts).toBe(0);
  await page.getByRole('button', { name: '정보 찾기' }).click();
  await snack.getByRole('button', { name: '계속 입력' }).click();
  await expect(page.getByAltText('조사한 표지 후보')).toBeVisible();
  await expect(page.getByRole('textbox', { name: /도서명/ })).toHaveValue('');
  await page.getByRole('button', { name: '폼에 반영' }).click();
  await expect(page.getByRole('textbox', { name: /도서명/ })).toHaveValue('추천 도서');
  await expect(page.getByAltText('선택한 표지 미리보기')).toBeVisible();
  await page.getByRole('textbox', { name: /도서명/ }).fill('내가 수정한 도서');
  await page.getByLabel('출간일', { exact: true }).fill('2026-10-27');
  await page.getByRole('button', { name: '추가', exact: true }).click();
  await expect(page.getByRole('button', { name: '내가 수정한 도서', exact: true })).toBeVisible();
  expect(starts).toBe(1);
  await page.reload();
  await page.getByRole('button', { name: '내가 수정한 도서', exact: true }).click();
  await expect(page.getByText('2026-10-27', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '닫기', exact: true }).first().click();
  // Manual entry also asks before saving; dismissing the snackbar never saves.
  await page.getByRole('button', { name: '도서 추가', exact: true }).click();
  await page.getByRole('textbox', { name: /도서명/ }).fill('저장하면 안 되는 책');
  await page.getByLabel('ISBN-13').fill('9788966260959');
  await page.getByRole('button', { name: '추가', exact: true }).click();
  await expect(snack).toBeVisible();
  await snack.getByRole('button', { name: '닫기', exact: true }).click();
  await expect(page.getByRole('textbox', { name: /도서명/ })).toHaveValue('저장하면 안 되는 책');
});
