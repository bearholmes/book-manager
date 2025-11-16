/**
 * JSON 데이터를 Supabase로 마이그레이션하는 스크립트
 *
 * 사용법:
 * 1. .env 파일에 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 설정
 * 2. node scripts/migrate-json-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// __dirname 설정 (ES 모듈)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 변수 로드
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
  console.error('   .env 파일을 확인해주세요.');
  process.exit(1);
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
    console.log('🚀 JSON → Supabase 마이그레이션 시작\n');

    // 1. JSON 파일 읽기
    const jsonPath = path.join(__dirname, '../src/assets/demoData.json');
    console.log(`📂 JSON 파일 읽기: ${jsonPath}`);

    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const books = JSON.parse(jsonData);

    console.log(`✅ ${books.length}개의 도서 데이터를 로드했습니다.\n`);

    // 2. 사용자 확인 (또는 테스트 사용자 생성)
    // 주의: 실제로는 마이그레이션할 사용자의 UUID를 지정해야 합니다.
    const USER_EMAIL = process.env.MIGRATION_USER_EMAIL || 'test@example.com';
    const USER_PASSWORD = process.env.MIGRATION_USER_PASSWORD || 'test123456';

    console.log(`👤 사용자 확인 중: ${USER_EMAIL}`);

    // 사용자 로그인 시도
    let userId;
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: USER_EMAIL,
      password: USER_PASSWORD,
    });

    if (signInError) {
      console.log('   사용자가 존재하지 않습니다. 새로 생성합니다...');

      // 사용자 생성 (Service Role Key로)
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: USER_EMAIL,
        password: USER_PASSWORD,
        email_confirm: true,
      });

      if (signUpError) {
        throw new Error(`사용자 생성 실패: ${signUpError.message}`);
      }

      userId = signUpData.user.id;
      console.log(`✅ 사용자 생성 완료: ${userId}\n`);
    } else {
      userId = signInData.user.id;
      console.log(`✅ 기존 사용자 로그인: ${userId}\n`);
    }

    // 3. 데이터 변환
    console.log('🔄 데이터 변환 중...');
    const transformedBooks = books.map(book => transformBook(book, userId));
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
    console.error('\n❌ 마이그레이션 중 오류 발생:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// 스크립트 실행
migrateData();
