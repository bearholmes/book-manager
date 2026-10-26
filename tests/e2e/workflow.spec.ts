import { expect, test } from './fixtures';

test('single-user SQLite desktop workflow', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '나의 서재', exact: true })).toBeVisible();
  await expect(page.getByText('등록된 도서가 없습니다')).toBeVisible();
  await expect(page.getByRole('link', { name: '로그인' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'JSON 가져오기' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '평문 JSON 내보내기' })).toHaveCount(0);
  await expect(page.getByText('이 컴퓨터에 저장', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '도서 추가', exact: true })).toHaveCount(1);

  await page.getByRole('button', { name: '도서 추가', exact: true }).first().click();
  await page.getByLabel('도서명').fill('SQLite 서재 테스트');
  await page.getByLabel('ISBN-13').fill('9781234567890');
  await page.getByLabel('저자', { exact: true }).fill('테스트 저자');
  await page.getByLabel('주제', { exact: true }).last().fill('개발');
  await page.getByRole('button', { name: '추가', exact: true }).click();
  await expect(page.getByRole('button', { name: 'SQLite 서재 테스트', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'SQLite 서재 테스트', exact: true })).toBeVisible();

  await page.getByRole('button', { name: '표지 보기', exact: true }).click();
  await expect(page.getByRole('button', { name: /SQLite 서재 테스트, 저자:/ })).toBeVisible();
  await page.setViewportSize({ width: 950, height: 800 });
  await expect(page.getByRole('button', { name: /SQLite 서재 테스트, 저자:/ })).toBeVisible();
  await page.getByRole('button', { name: '목록 보기', exact: true }).click();
  await page.setViewportSize({ width: 1360, height: 900 });

  await page.getByLabel('검색', { exact: true }).fill('9781234567890');
  await expect(page.getByRole('button', { name: 'SQLite 서재 테스트', exact: true })).toBeVisible();
  await page.getByLabel('검색', { exact: true }).fill('없는 도서');
  await expect(page.getByText('검색 결과가 없습니다', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '필터 초기화', exact: true }).first().click();

  await page.getByRole('button', { name: 'SQLite 서재 테스트', exact: true }).click();
  await page.getByRole('button', { name: '수정', exact: true }).click();
  await page.getByLabel('도서명').fill('수정한 도서');
  await page.getByRole('button', { name: '수정', exact: true }).click();
  await expect(page.getByRole('button', { name: '수정한 도서', exact: true })).toBeVisible();

  await page.getByRole('link', { name: '통계', exact: true }).click();
  await expect(page.getByRole('heading', { name: '통계', exact: true })).toBeVisible();
  await page.getByRole('link', { name: '설정', exact: true }).click();
  await page
    .getByRole('region', { name: 'PIN 잠금', exact: true })
    .getByRole('button', { name: '켜기', exact: true })
    .click();
  await page.getByLabel('PIN (숫자 4자리)', { exact: true }).fill('0123');
  await page.getByLabel('PIN 확인', { exact: true }).fill('0123');
  await page
    .getByRole('dialog', { name: 'PIN 설정', exact: true })
    .getByRole('button', { name: '켜기', exact: true })
    .click();
  await expect(
    page
      .getByRole('region', { name: 'PIN 잠금', exact: true })
      .getByRole('button', { name: '끄기', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '서재 잠금' }).click();
  await expect(page.getByRole('heading', { name: '서재가 잠겨 있습니다' })).toBeVisible();
  await expect(page.getByRole('navigation')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: '서재가 잠겨 있습니다' })).toBeVisible();
  await page.getByLabel('4자리 PIN').fill('9999');
  await page.getByRole('button', { name: '잠금 해제' }).click();
  await expect(page.getByRole('alert')).toContainText('PIN이 일치하지 않습니다');
  await page.getByLabel('4자리 PIN').fill('0123');
  await page.getByRole('button', { name: '잠금 해제' }).click();
  await expect(page.getByRole('heading', { name: '설정', exact: true })).toBeVisible();
  await page
    .getByRole('region', { name: 'PIN 잠금', exact: true })
    .getByRole('button', { name: '끄기', exact: true })
    .click();
  await page.getByLabel('현재 PIN').fill('0123');
  await page
    .getByRole('dialog', { name: 'PIN 잠금 끄기' })
    .getByRole('button', { name: '끄기', exact: true })
    .click();
  await expect(
    page
      .getByRole('region', { name: 'PIN 잠금', exact: true })
      .getByRole('button', { name: '켜기', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: '나의 서재', exact: true }).click();
  await expect(page.getByRole('button', { name: '수정한 도서', exact: true })).toBeVisible();

  await page.setViewportSize({ width: 1360, height: 900 });
  await page.screenshot({ path: testInfo.outputPath('desktop-library.png'), fullPage: true });
  await page.getByRole('button', { name: '수정한 도서', exact: true }).click();
  await page.getByRole('button', { name: '삭제', exact: true }).click();
  await page.getByRole('button', { name: '삭제', exact: true }).click();
  await expect(page.getByText('등록된 도서가 없습니다')).toBeVisible();
  expect(errors).toEqual([]);
});

test('encrypted backup, overwrite restore and reset preserve their stated boundaries', async ({
  page,
}, testInfo) => {
  const { existsSync, readFileSync } = await import('node:fs');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const password = 'test-backup-password-2026';
  await page.goto('/');
  await page.getByRole('button', { name: '도서 추가', exact: true }).first().click();
  await page.getByLabel('도서명').fill('암호화 백업 원본 도서');
  await page.getByRole('button', { name: '추가', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '암호화 백업 원본 도서', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: '설정', exact: true }).click();
  await page
    .getByRole('region', { name: 'PIN 잠금', exact: true })
    .getByRole('button', { name: '켜기', exact: true })
    .click();
  await page.getByLabel('PIN (숫자 4자리)', { exact: true }).fill('0123');
  await page.getByLabel('PIN 확인', { exact: true }).fill('0123');
  await page
    .getByRole('dialog', { name: 'PIN 설정', exact: true })
    .getByRole('button', { name: '켜기', exact: true })
    .click();
  await expect(
    page
      .getByRole('region', { name: 'PIN 잠금', exact: true })
      .getByRole('button', { name: '끄기', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('region', { name: '백업', exact: true })
    .getByRole('button', { name: '내보내기', exact: true })
    .click();
  await page.getByLabel('비밀번호 (12자 이상)', { exact: true }).fill(password);
  await page.getByLabel('비밀번호 확인', { exact: true }).fill(password);
  await page
    .getByRole('dialog', { name: '백업 내보내기' })
    .getByRole('button', { name: '내보내기', exact: true })
    .click();
  const notice = page.getByText(/^1권을 백업했습니다/);
  await expect(notice).toBeVisible();
  const path = (await notice.textContent())?.split('저장 위치: ')[1];
  if (!path) throw new Error('Missing backup path');
  expect(readFileSync(path, 'utf8')).not.toContain('암호화 백업 원본 도서');

  await page.getByRole('link', { name: '나의 서재', exact: true }).click();
  await page.getByRole('button', { name: '도서 추가', exact: true }).first().click();
  await page.getByLabel('도서명').fill('복원 시 없어질 도서');
  await page.getByRole('button', { name: '추가', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '복원 시 없어질 도서', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: '설정', exact: true }).click();
  const fileChooser = page.waitForEvent('filechooser');
  await page
    .getByRole('region', { name: '복원', exact: true })
    .getByRole('button', { name: '파일 선택', exact: true })
    .click();
  await (await fileChooser).setFiles(path);
  await page.getByLabel('백업 비밀번호', { exact: true }).fill('wrong-backup-password');
  await page
    .getByRole('dialog', { name: '복원', exact: true })
    .getByRole('button', { name: '다음', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText('손상');
  await page.getByLabel('백업 비밀번호', { exact: true }).fill(password);
  await page
    .getByRole('dialog', { name: '복원', exact: true })
    .getByRole('button', { name: '다음', exact: true })
    .click();
  const restore = page.getByRole('dialog', { name: '복원 확인' });
  await expect(restore).toContainText('현재 도서 2권');
  await expect(restore).toContainText('백업 도서 1권');
  await expect(restore.getByRole('button', { name: '복원', exact: true })).toBeDisabled();
  await restore.getByLabel('현재 PIN 확인').fill('9999');
  await restore.getByLabel('확인 문구: 복원').fill('복원');
  await restore.getByRole('button', { name: '복원', exact: true }).click();
  await expect(restore.getByRole('alert')).toContainText('PIN이 일치하지 않습니다');
  await restore.getByLabel('현재 PIN 확인').fill('0123');
  await restore.getByRole('button', { name: '복원', exact: true }).click();
  await expect(page.getByText('1권으로 서재를 복원했습니다.')).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: 'PIN 잠금', exact: true })
      .getByRole('button', { name: '끄기', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: '나의 서재', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '암호화 백업 원본 도서', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: '복원 시 없어질 도서', exact: true })).toHaveCount(
    0,
  );
  await page.getByRole('link', { name: '설정', exact: true }).click();
  await page.setViewportSize({ width: 1360, height: 1000 });
  await page.screenshot({ path: testInfo.outputPath('encrypted-settings.png'), fullPage: true });

  await page
    .getByRole('region', { name: '데이터 초기화', exact: true })
    .getByRole('button', { name: '초기화', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: '데이터 초기화', exact: true })
    .getByRole('button', { name: '취소' })
    .click();
  await page
    .getByRole('region', { name: '데이터 초기화', exact: true })
    .getByRole('button', { name: '초기화', exact: true })
    .click();
  const reset = page.getByRole('dialog', { name: '데이터 초기화', exact: true });
  await expect(reset.getByRole('button', { name: '초기화', exact: true })).toBeDisabled();
  await reset.getByLabel('현재 PIN 확인').fill('0123');
  await reset.getByLabel('확인 문구: 초기화').fill('초기화');
  await reset.getByRole('button', { name: '초기화', exact: true }).click();
  await expect(page.getByText('도서와 PIN 설정을 초기화했습니다.')).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: 'PIN 잠금', exact: true })
      .getByRole('button', { name: '켜기', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page
      .getByRole('region', { name: 'PIN 잠금', exact: true })
      .getByRole('button', { name: '켜기', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: '나의 서재', exact: true }).click();
  await expect(page.getByText('등록된 도서가 없습니다')).toBeVisible();
  expect(existsSync(path)).toBe(true);
  expect(errors).toEqual([]);
});
