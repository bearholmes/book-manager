-- 방구석 도서관리 - Supabase 데이터베이스 스키마
-- 작성일: 2025-11-16

-- ============================================
-- 1. books 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS books (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key (Supabase Auth Users)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 기본 도서 정보
  book_name TEXT NOT NULL,
  isbn13 TEXT,
  author TEXT,
  publisher TEXT,
  publication_date DATE,

  -- 구매 정보
  condition TEXT CHECK (condition IN ('신품', '중고', NULL)),
  purchase_price NUMERIC(10, 2),
  currency TEXT DEFAULT 'KRW',
  purchase_price_sec NUMERIC(10, 2),
  currency_sec TEXT,
  purchase_date DATE,
  purchase_place TEXT,

  -- 분류 및 메타데이터
  topic TEXT,
  image_url TEXT,
  duplicated BOOLEAN DEFAULT FALSE,
  comment TEXT,

  -- 시스템 필드
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 2. 인덱스 생성 (성능 최적화)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_topic ON books(topic);
CREATE INDEX IF NOT EXISTS idx_books_purchase_date ON books(purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_books_isbn13 ON books(isbn13);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);

-- ============================================
-- 3. updated_at 자동 업데이트 트리거
-- ============================================

-- updated_at 자동 업데이트 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- books 테이블에 트리거 적용
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. Row Level Security (RLS) 정책
-- ============================================

-- RLS 활성화
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (재실행 시)
DROP POLICY IF EXISTS "Users can view own books" ON books;
DROP POLICY IF EXISTS "Users can insert own books" ON books;
DROP POLICY IF EXISTS "Users can update own books" ON books;
DROP POLICY IF EXISTS "Users can delete own books" ON books;

-- SELECT: 사용자는 자신의 책만 조회 가능
CREATE POLICY "Users can view own books"
  ON books FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 사용자는 자신의 책만 추가 가능
CREATE POLICY "Users can insert own books"
  ON books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 사용자는 자신의 책만 수정 가능
CREATE POLICY "Users can update own books"
  ON books FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: 사용자는 자신의 책만 삭제 가능
CREATE POLICY "Users can delete own books"
  ON books FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. Storage 정책 (도서 표지 이미지)
-- ============================================

-- Storage 버킷은 Supabase 대시보드에서 수동으로 생성 필요
-- 버킷 이름: 'book-covers'
-- Public 설정: false (인증된 사용자만 접근)

-- Storage 정책 (버킷이 생성된 후 실행)
-- INSERT: 사용자는 자신의 이미지만 업로드 가능
DROP POLICY IF EXISTS "Users can upload own book covers" ON storage.objects;
CREATE POLICY "Users can upload own book covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'book-covers' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- SELECT: 사용자는 자신의 이미지만 조회 가능
DROP POLICY IF EXISTS "Users can view own book covers" ON storage.objects;
CREATE POLICY "Users can view own book covers"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'book-covers' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- UPDATE: 사용자는 자신의 이미지만 수정 가능
DROP POLICY IF EXISTS "Users can update own book covers" ON storage.objects;
CREATE POLICY "Users can update own book covers"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'book-covers' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- DELETE: 사용자는 자신의 이미지만 삭제 가능
DROP POLICY IF EXISTS "Users can delete own book covers" ON storage.objects;
CREATE POLICY "Users can delete own book covers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'book-covers' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- ============================================
-- 6. 유용한 뷰 (선택사항)
-- ============================================

-- 주제별 도서 수 집계 뷰
CREATE OR REPLACE VIEW book_stats_by_topic AS
SELECT
  user_id,
  topic,
  COUNT(*) as book_count,
  SUM(purchase_price) as total_spent
FROM books
WHERE topic IS NOT NULL
GROUP BY user_id, topic
ORDER BY book_count DESC;

-- 구매처별 도서 수 집계 뷰
CREATE OR REPLACE VIEW book_stats_by_place AS
SELECT
  user_id,
  purchase_place,
  COUNT(*) as book_count,
  SUM(purchase_price) as total_spent
FROM books
WHERE purchase_place IS NOT NULL
GROUP BY user_id, purchase_place
ORDER BY book_count DESC;

-- 연도별 구매 통계 뷰
CREATE OR REPLACE VIEW book_stats_by_year AS
SELECT
  user_id,
  EXTRACT(YEAR FROM purchase_date) as year,
  COUNT(*) as book_count,
  SUM(purchase_price) as total_spent
FROM books
WHERE purchase_date IS NOT NULL
GROUP BY user_id, year
ORDER BY year DESC;

-- ============================================
-- 완료
-- ============================================

-- 스키마 생성 완료
-- 다음 단계:
-- 1. Supabase 대시보드에서 'book-covers' Storage 버킷 생성
-- 2. 위 SQL을 Supabase SQL Editor에서 실행
-- 3. 마이그레이션 스크립트로 기존 JSON 데이터 임포트
