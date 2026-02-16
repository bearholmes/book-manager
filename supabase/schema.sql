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
-- 5. 운영 권한 테이블/정책
-- ============================================

DO $$
BEGIN
  CREATE TYPE app_role AS ENUM ('user', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id ON audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'super_admin'
      AND ur.is_active = TRUE
  );
$$;

REVOKE ALL ON FUNCTION is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated, service_role;

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Super admins can insert audit logs" ON audit_logs;

CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id OR is_super_admin());

CREATE POLICY "Super admins can manage roles"
  ON user_roles FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (is_super_admin());

CREATE POLICY "Super admins can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (is_super_admin() AND actor_user_id = auth.uid());

GRANT SELECT ON TABLE user_roles TO authenticated;
GRANT SELECT, INSERT ON TABLE audit_logs TO authenticated;
GRANT ALL ON TABLE user_roles, audit_logs TO service_role;

CREATE OR REPLACE FUNCTION ops_list_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  role app_role,
  is_active BOOLEAN,
  book_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::TEXT,
    u.created_at,
    u.last_sign_in_at,
    COALESCE(ur.role, 'user'::app_role) AS role,
    COALESCE(ur.is_active, TRUE) AS is_active,
    COUNT(b.id)::BIGINT AS book_count
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  LEFT JOIN public.books b ON b.user_id = u.id
  GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at, ur.role, ur.is_active
  ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION ops_set_user_role(
  p_user_id UUID,
  p_role app_role,
  p_is_active BOOLEAN DEFAULT TRUE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF p_user_id = auth.uid() AND p_role <> 'super_admin' THEN
    RAISE EXCEPTION 'cannot downgrade self';
  END IF;

  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (p_user_id, p_role, p_is_active)
  ON CONFLICT (user_id)
  DO UPDATE
    SET role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();

  INSERT INTO public.audit_logs (actor_user_id, action, target_user_id, metadata)
  VALUES (auth.uid(), 'set_user_role', p_user_id, jsonb_build_object('role', p_role, 'is_active', p_is_active));
END;
$$;

CREATE OR REPLACE FUNCTION ops_delete_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_storage_deleted_count INTEGER := 0;
  v_storage_cleanup_error TEXT := NULL;
BEGIN
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'cannot delete self';
  END IF;

  BEGIN
    WITH deleted_objects AS (
      DELETE FROM storage.objects
      WHERE bucket_id = 'book-covers'
        AND split_part(name, '/', 1) = p_user_id::TEXT
      RETURNING 1
    )
    SELECT COUNT(*)::INTEGER
      INTO v_storage_deleted_count
    FROM deleted_objects;
  EXCEPTION
    WHEN OTHERS THEN
      v_storage_cleanup_error := SQLERRM;
  END;

  INSERT INTO public.audit_logs (actor_user_id, action, target_user_id, metadata)
  VALUES (
    auth.uid(),
    'delete_user',
    p_user_id,
    jsonb_build_object(
      'source',
      'ops_console',
      'target_user_id',
      p_user_id,
      'storage_deleted_count',
      v_storage_deleted_count,
      'storage_cleanup_error',
      v_storage_cleanup_error
    )
  );

  DELETE FROM auth.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION ops_list_users() FROM PUBLIC;
REVOKE ALL ON FUNCTION ops_set_user_role(UUID, app_role, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops_delete_user(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION ops_list_users() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION ops_set_user_role(UUID, app_role, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION ops_delete_user(UUID) TO authenticated, service_role;

-- ============================================
-- 6. Storage 정책 (도서 표지 이미지)
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
-- 7. 유용한 뷰 (선택사항)
-- ============================================

-- 주제별 도서 수 집계 뷰
-- security_invoker + auth.uid() 필터로 사용자 데이터 격리 보장
CREATE OR REPLACE VIEW book_stats_by_topic
WITH (security_invoker = true) AS
SELECT
  user_id,
  topic,
  COUNT(*) as book_count,
  SUM(purchase_price) as total_spent
FROM books
WHERE topic IS NOT NULL
  AND user_id = auth.uid()
GROUP BY user_id, topic
ORDER BY book_count DESC;

-- 구매처별 도서 수 집계 뷰
CREATE OR REPLACE VIEW book_stats_by_place
WITH (security_invoker = true) AS
SELECT
  user_id,
  purchase_place,
  COUNT(*) as book_count,
  SUM(purchase_price) as total_spent
FROM books
WHERE purchase_place IS NOT NULL
  AND user_id = auth.uid()
GROUP BY user_id, purchase_place
ORDER BY book_count DESC;

-- 연도별 구매 통계 뷰
CREATE OR REPLACE VIEW book_stats_by_year
WITH (security_invoker = true) AS
SELECT
  user_id,
  EXTRACT(YEAR FROM purchase_date) as year,
  COUNT(*) as book_count,
  SUM(purchase_price) as total_spent
FROM books
WHERE purchase_date IS NOT NULL
  AND user_id = auth.uid()
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
