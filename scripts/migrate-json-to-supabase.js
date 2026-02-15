/**
 * JSON 데이터를 Supabase로 마이그레이션하는 스크립트
 *
 * 사용법:
 * 1. .env 파일에 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 설정
 * 2. node scripts/migrate-json-to-supabase.js --file <json-path> --user-id <uuid>
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline/promises';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIGRATION_USER_ID_ENV = process.env.MIGRATION_USER_ID;
const MIGRATION_SOURCE_FILE_ENV = process.env.MIGRATION_SOURCE_FILE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
  console.error('   .env 파일을 확인해주세요.');
  process.exit(1);
}

const DEFAULT_JSON_PATH = 'src/assets/demoData.json';
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'coverage',
  'storybook-static',
  'playwright-report',
  'test-results',
  '.idea',
  '.doc',
]);

function printUsage() {
  console.log(`
사용법:
  node scripts/migrate-json-to-supabase.js --file <json-path> --user-id <uuid>

옵션:
  -f, --file <path>          마이그레이션할 JSON 파일 경로
  -u, --user-id <uuid>       데이터 소유자(Supabase auth.users.id)
  --non-interactive          TTY 프롬프트 없이 실행 (값 없으면 실패)
  -h, --help                 도움말 출력

환경변수(선택):
  MIGRATION_SOURCE_FILE      --file 기본값
  MIGRATION_USER_ID          --user-id 기본값
`);
}

function parseArgs(argv) {
  const options = {
    file: null,
    userId: null,
    help: false,
    nonInteractive: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      options.help = true;
      continue;
    }
    if (arg === '--non-interactive') {
      options.nonInteractive = true;
      continue;
    }
    if (arg === '-f' || arg === '--file') {
      const value = argv[i + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('--file 옵션 값이 없습니다.');
      }
      options.file = value;
      i++;
      continue;
    }
    if (arg === '-u' || arg === '--user-id') {
      const value = argv[i + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('--user-id 옵션 값이 없습니다.');
      }
      options.userId = value;
      i++;
      continue;
    }

    throw new Error(`알 수 없는 옵션: ${arg}`);
  }

  return options;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectJsonCandidates(rootDir, maxDepth = 4, maxResults = 20) {
  const results = [];

  async function walk(currentDir, depth) {
    if (results.length >= maxResults || depth > maxDepth) return;

    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (results.length >= maxResults) return;

      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(process.cwd(), fullPath);

      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        await walk(fullPath, depth + 1);
        continue;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
        if (entry.name === 'package-lock.json' || entry.name === 'pnpm-lock.yaml') continue;
        results.push(relPath);
      }
    }
  }

  await walk(rootDir, 0);
  return results.sort();
}

async function promptWithDefault(rl, label, defaultValue) {
  const suffix = defaultValue ? ` [${defaultValue}]` : '';
  const answer = await rl.question(`${label}${suffix}: `);
  const trimmed = answer.trim();
  return trimmed || defaultValue;
}

async function resolveMigrationInputs() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    process.exit(0);
  }

  const interactive = !options.nonInteractive && process.stdin.isTTY && process.stdout.isTTY;

  let sourceFile = options.file || MIGRATION_SOURCE_FILE_ENV || null;
  let migrationUserId = options.userId || MIGRATION_USER_ID_ENV || null;

  if (!sourceFile && !interactive) {
    sourceFile = DEFAULT_JSON_PATH;
  }

  if (interactive && !sourceFile) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      const defaultExists = await fileExists(path.resolve(process.cwd(), DEFAULT_JSON_PATH));
      const candidates = await collectJsonCandidates(process.cwd());
      const defaults = [
        ...(defaultExists ? [DEFAULT_JSON_PATH] : []),
        ...candidates.filter((item) => item !== DEFAULT_JSON_PATH),
      ];

      if (defaults.length > 0) {
        console.log('\n📂 발견된 JSON 후보 파일:');
        defaults.slice(0, 10).forEach((item, idx) => {
          console.log(`  ${idx + 1}. ${item}`);
        });
      } else {
        console.log('\n📂 자동으로 찾은 JSON 후보 파일이 없습니다.');
      }

      const selected = await promptWithDefault(
        rl,
        '마이그레이션할 JSON 파일 경로(또는 번호)',
        defaults[0] || DEFAULT_JSON_PATH,
      );

      if (/^\d+$/.test(selected)) {
        const selectedIndex = Number.parseInt(selected, 10) - 1;
        sourceFile = defaults[selectedIndex];
      } else {
        sourceFile = selected;
      }

      if (!migrationUserId) {
        migrationUserId = await promptWithDefault(
          rl,
          'MIGRATION_USER_ID(auth.users.id)',
          '',
        );
      }
    } finally {
      rl.close();
    }
  }

  if (!sourceFile) {
    throw new Error(
      '마이그레이션 파일 경로가 없습니다. --file 옵션 또는 MIGRATION_SOURCE_FILE을 설정해주세요.',
    );
  }

  if (!migrationUserId) {
    throw new Error(
      'MIGRATION_USER_ID가 없습니다. --user-id 옵션 또는 MIGRATION_USER_ID 환경변수를 설정해주세요.',
    );
  }

  const resolvedSourceFile = path.resolve(process.cwd(), sourceFile);
  const exists = await fileExists(resolvedSourceFile);
  if (!exists) {
    throw new Error(`JSON 파일을 찾을 수 없습니다: ${resolvedSourceFile}`);
  }

  return {
    sourceFile: resolvedSourceFile,
    migrationUserId,
  };
}

// Supabase 클라이언트 (Service Role Key 사용 - RLS 우회)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * JSON 필드명을 Supabase 스키마에 맞게 변환
 */
function transformBook(jsonBook, userId) {
  return {
    user_id: userId,
    book_name: jsonBook.bookName || '',
    isbn13: jsonBook.ISBN13?.toString() || null,
    author: jsonBook.author || null,
    publisher: jsonBook.publisher || null,
    publication_date: jsonBook.publicationDate || null,
    condition: jsonBook.condition || null,
    purchase_price: jsonBook.purchasePrice ? parseFloat(jsonBook.purchasePrice) : null,
    currency: jsonBook.currency || 'KRW',
    purchase_price_sec: jsonBook.purchasePriceSec ? parseFloat(jsonBook.purchasePriceSec) : null,
    currency_sec: jsonBook.currencySec || null,
    purchase_date: jsonBook.purchaseDate || null,
    purchase_place: jsonBook.purchasePlace || null,
    topic: jsonBook.topic || null,
    image_url: jsonBook.imageUrl || null,
    duplicated: jsonBook.duplicated || false,
    comment: jsonBook.comment || null,
  };
}

/**
 * 메인 마이그레이션 함수
 */
async function migrateData() {
  try {
    const { sourceFile, migrationUserId } = await resolveMigrationInputs();
    console.log('🚀 JSON → Supabase 마이그레이션 시작\n');

    // 1. JSON 파일 읽기
    console.log(`📂 JSON 파일 읽기: ${sourceFile}`);

    const jsonData = await fs.readFile(sourceFile, 'utf-8');
    const books = JSON.parse(jsonData);
    if (!Array.isArray(books)) {
      throw new Error('JSON 루트 데이터는 배열이어야 합니다.');
    }

    console.log(`✅ ${books.length}개의 도서 데이터를 로드했습니다.\n`);

    // 2. 사용자 확인 (명시된 사용자 UUID 사용)
    console.log(`👤 사용자 확인 중: ${migrationUserId}`);
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      migrationUserId,
    );

    if (userError || !userData.user) {
      throw new Error(
        `MIGRATION_USER_ID(${migrationUserId}) 사용자 확인 실패: ${userError?.message || '사용자를 찾을 수 없습니다.'}`,
      );
    }
    const userId = userData.user.id;
    console.log(`✅ 사용자 확인 완료: ${userId}\n`);

    // 3. 데이터 변환
    console.log('🔄 데이터 변환 중...');
    const transformedBooks = books.map((book) => transformBook(book, userId));
    console.log(`✅ ${transformedBooks.length}개 도서 데이터 변환 완료\n`);

    // 4. Supabase에 삽입 (배치 처리)
    console.log('💾 Supabase에 데이터 삽입 중...');

    const BATCH_SIZE = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < transformedBooks.length; i += BATCH_SIZE) {
      const batch = transformedBooks.slice(i, i + BATCH_SIZE);

      const { data, error } = await supabase
        .from('books')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 삽입 실패:`, error.message);
        errorCount += batch.length;
      } else {
        successCount += data.length;
        console.log(`✅ 배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${data.length}개 삽입 완료`);
      }
    }

    // 5. 결과 요약
    console.log('\n' + '='.repeat(50));
    console.log('📊 마이그레이션 완료 요약');
    console.log('='.repeat(50));
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    console.log(`📁 전체: ${books.length}개`);
    console.log('='.repeat(50) + '\n');

    // 6. 검증 (총 개수 확인)
    const { count, error: countError } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('❌ 검증 실패:', countError.message);
    } else {
      console.log(`🔍 Supabase에 저장된 도서 수: ${count}개\n`);
    }

    console.log('🎉 마이그레이션 완료!\n');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n❌ 마이그레이션 중 오류 발생:', errorMessage);
    console.error(error);
    console.error('\n도움말: node scripts/migrate-json-to-supabase.js --help');
    process.exit(1);
  }
}

// 스크립트 실행
migrateData();
