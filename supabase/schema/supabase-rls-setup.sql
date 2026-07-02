-- =====================================================
-- Supabase Row Level Security (RLS) 設定
-- 美辞学ナビ用
-- =====================================================

-- profiles テーブル
-- ユーザープロフィール情報
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,  -- パスワードハッシュ（bcrypt）
  full_name TEXT,
  avatar_url TEXT,
  x_account_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 読み取りポリシー：すべてのユーザーが全プロフィールを閲覧可能
CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  USING (true);

-- 挿入ポリシー：自分のプロフィールのみ作成可能
CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  WITH CHECK (true);  -- 認証なしでも作成可能（簡易認証のため）

-- 更新ポリシー：自分のプロフィールのみ更新可能
CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  USING (true)  -- 認証なしでも更新可能（簡易認証のため）
  WITH CHECK (true);

-- 削除ポリシー：削除は不可
CREATE POLICY "profiles_delete_policy"
  ON profiles
  FOR DELETE
  USING (false);

-- =====================================================

-- venue_attendances テーブル
-- 会場への参加表明
CREATE TABLE IF NOT EXISTS venue_attendances (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  venue_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_venue_attendances_user_id ON venue_attendances(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_attendances_venue_id ON venue_attendances(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_attendances_created_at ON venue_attendances(created_at);

-- RLS有効化
ALTER TABLE venue_attendances ENABLE ROW LEVEL SECURITY;

-- 読み取りポリシー：すべてのユーザーが全参加情報を閲覧可能
CREATE POLICY "venue_attendances_select_policy"
  ON venue_attendances
  FOR SELECT
  USING (true);

-- 挿入ポリシー：認証済みユーザーのみ参加表明可能
CREATE POLICY "venue_attendances_insert_policy"
  ON venue_attendances
  FOR INSERT
  WITH CHECK (true);  -- 認証なしでも作成可能（簡易認証のため）

-- 更新ポリシー：更新は不可（削除して再作成）
CREATE POLICY "venue_attendances_update_policy"
  ON venue_attendances
  FOR UPDATE
  USING (false);

-- 削除ポリシー：自分の参加表明のみ削除可能
CREATE POLICY "venue_attendances_delete_policy"
  ON venue_attendances
  FOR DELETE
  USING (true);  -- 認証なしでも削除可能（簡易認証のため）

-- =====================================================

-- 全体の参加者数を取得する関数
-- ユニークユーザー数をカウント
CREATE OR REPLACE FUNCTION get_total_attendees_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER  -- 実行者の権限ではなく関数定義者の権限で実行
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM public.venue_attendances
  );
END;
$$;

-- 関数の実行権限を全ユーザーに付与
GRANT EXECUTE ON FUNCTION get_total_attendees_count() TO anon;
GRANT EXECUTE ON FUNCTION get_total_attendees_count() TO authenticated;

-- =====================================================

-- 会場別の参加者数を取得する関数
CREATE OR REPLACE FUNCTION get_venue_attendance_count(venue_id_param TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.venue_attendances
    WHERE venue_id = venue_id_param
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_venue_attendance_count(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_venue_attendance_count(TEXT) TO authenticated;

-- =====================================================

-- 会場別の参加者リストを取得する関数
-- プロフィール情報と結合して返す
-- 既存の関数を削除
DROP FUNCTION IF EXISTS get_venue_attendees(TEXT);

CREATE OR REPLACE FUNCTION get_venue_attendees(venue_id_param TEXT)
RETURNS TABLE(
  user_id TEXT,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  x_account_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.x_account_url,
    va.created_at
  FROM public.venue_attendances va
  JOIN public.profiles p ON va.user_id = p.id
  WHERE va.venue_id = venue_id_param
  ORDER BY va.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_venue_attendees(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_venue_attendees(TEXT) TO authenticated;

-- =====================================================

-- Rate Limiting テーブル
-- DDoS/F5アタック対策
CREATE TABLE IF NOT EXISTS rate_limits (
  ip_address TEXT PRIMARY KEY,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- サービスロールからのみアクセス可能（アプリケーション層で制御）
CREATE POLICY "Service role can manage rate limits"
ON rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 古いレコードを自動削除する関数（5分以上前のレコード）
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '5 minutes';
END;
$$;

-- 定期的にクリーンアップ（pg_cronなどで実行）
-- または以下のトリガーで実行回数に応じてクリーンアップ

-- =====================================================

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================

-- 匿名ユーザー（anon）に必要な最低限の権限を付与
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON venue_attendances TO anon;
GRANT INSERT ON profiles TO anon;
GRANT INSERT ON venue_attendances TO anon;
GRANT DELETE ON venue_attendances TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 認証済みユーザー（authenticated）にも同様の権限
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON venue_attendances TO authenticated;
GRANT INSERT ON profiles TO authenticated;
GRANT INSERT ON venue_attendances TO authenticated;
GRANT DELETE ON venue_attendances TO authenticated;
GRANT UPDATE ON profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 注意事項
-- =====================================================
-- 1. このSQLはSupabase SQLエディタで実行してください
-- 2. 本番環境では追加のセキュリティ対策が必要です：
--    - API rate limiting（Supabase Edgeレベル）
--    - Cloudflare等のWAF導入
--    - IP制限・Geo blocking
--    - リクエストログの監視
-- 3. profiles/venue_attendancesのINSERT/DELETE/UPDATEポリシーは
--    簡易認証のためtrue設定ですが、本格的な認証が必要な場合は
--    auth.uid()などを使用してください
-- =====================================================
