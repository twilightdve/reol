-- 美辞学ナビ - カスタムユーザーID対応版データベーススキーマ
-- 要件：メールアドレス不要、カスタムユーザーIDのみ

-- 既存の関数を削除（型変更のため）
DROP FUNCTION IF EXISTS get_venue_attendance_count(text);
DROP FUNCTION IF EXISTS get_venue_attendees(text);
DROP FUNCTION IF EXISTS get_total_attendees_count();
DROP FUNCTION IF EXISTS upsert_profile(text, text, text, text, text);

-- 既存テーブルの削除（もし存在する場合）
DROP TABLE IF EXISTS venue_attendances CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- カスタムユーザー用のprofilesテーブル作成
CREATE TABLE profiles (
  id text PRIMARY KEY,  -- カスタムユーザーID（UUID不要）
  username text NOT NULL,
  full_name text,
  avatar_url text,
  x_account_url text,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- X URLの形式チェック制約を追加（オプション）
ALTER TABLE profiles 
ADD CONSTRAINT check_x_url_format 
CHECK (x_account_url IS NULL OR x_account_url ~ '^https?://(www\.)?(x\.com|twitter\.com)/[A-Za-z0-9_]+/?$');

-- venue_attendancesテーブル作成
CREATE TABLE venue_attendances (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  venue_id text NOT NULL,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_venue_attendances_user_id ON venue_attendances(user_id);
CREATE INDEX idx_venue_attendances_venue_id ON venue_attendances(venue_id);
CREATE INDEX idx_venue_attendances_public ON venue_attendances(is_public);

-- 重複防止（同じユーザーが同じ会場に複数回参加表明できないように）
CREATE UNIQUE INDEX idx_venue_attendances_unique ON venue_attendances(user_id, venue_id);

-- 公開されている参加者のみを取得するビューを作成
CREATE OR REPLACE VIEW public_venue_attendances
WITH (security_invoker = true) AS
SELECT 
  va.id,
  va.venue_id,
  va.created_at,
  p.id as user_id,
  p.username,
  p.full_name,
  p.x_account_url,
  p.avatar_url
FROM venue_attendances va
JOIN profiles p ON va.user_id = p.id
WHERE va.is_public = true;

-- RLS（Row Level Security）の設定を無効化（カスタム認証のため）
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE venue_attendances DISABLE ROW LEVEL SECURITY;

-- 便利な関数：会場別の参加者数を取得
CREATE OR REPLACE FUNCTION get_venue_attendance_count(venue_id_param text)
RETURNS integer
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.venue_attendances
    WHERE venue_id = venue_id_param AND is_public = true
  );
END;
$$;

-- 便利な関数：会場別の公開参加者リストを取得
CREATE OR REPLACE FUNCTION get_venue_attendees(venue_id_param text)
RETURNS TABLE (
  user_id text,
  username text,
  full_name text,
  x_account_url text,
  avatar_url text,
  joined_at timestamp with time zone
)
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.x_account_url,
    p.avatar_url,
    va.created_at
  FROM public.venue_attendances va
  JOIN public.profiles p ON va.user_id = p.id
  WHERE va.venue_id = venue_id_param 
    AND va.is_public = true
  ORDER BY va.created_at;
END;
$$;

-- 便利な関数：全体の参加表明者数を取得（ユニークユーザー数）
CREATE OR REPLACE FUNCTION get_total_attendees_count()
RETURNS integer
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM public.venue_attendances
    WHERE is_public = true
  );
END;
$$;

-- プロフィール自動作成/更新関数
CREATE OR REPLACE FUNCTION upsert_profile(
  user_id_param text,
  username_param text,
  full_name_param text DEFAULT NULL,
  avatar_url_param text DEFAULT NULL,
  x_account_url_param text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, x_account_url)
  VALUES (user_id_param, username_param, full_name_param, avatar_url_param, x_account_url_param)
  ON CONFLICT (id) 
  DO UPDATE SET
    username = EXCLUDED.username,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    x_account_url = COALESCE(EXCLUDED.x_account_url, public.profiles.x_account_url),
    updated_at = NOW();
END;
$$;