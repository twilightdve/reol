-- 美辞学ナビ - 最終版データベーススキーマ
-- 要件：閲覧はログイン不要、参加表明時にユーザー登録、XリンクはDB保存

-- 既存のX関連カラムがある場合は削除
ALTER TABLE profiles 
DROP COLUMN IF EXISTS x_username,
DROP COLUMN IF EXISTS x_user_id,
DROP COLUMN IF EXISTS x_display_name,
DROP COLUMN IF EXISTS x_verified;

-- X関連のインデックスを削除
DROP INDEX IF EXISTS profiles_x_username_unique;
DROP INDEX IF EXISTS profiles_x_user_id_unique;

-- X関連の関数を削除
DROP FUNCTION IF EXISTS public.link_x_account(text, text, text, boolean);
DROP FUNCTION IF EXISTS public.unlink_x_account();

-- profilesテーブルにXアカウントURL用のカラムを追加
-- 自動連携ではなく、ユーザーが自分でURLを入力する形式
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS x_account_url text;

-- X URLの形式チェック制約を追加（オプション）
ALTER TABLE profiles 
ADD CONSTRAINT check_x_url_format 
CHECK (x_account_url IS NULL OR x_account_url ~ '^https?://(www\.)?(x\.com|twitter\.com)/[A-Za-z0-9_]+/?$');

-- venue_attendancesテーブルに公開設定を追加
-- ユーザーが自分の参加を公開するかどうか選択可能
ALTER TABLE venue_attendances 
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- 公開されている参加者のみを取得するビューを作成
CREATE OR REPLACE VIEW public_venue_attendances
WITH (security_invoker = true) AS
SELECT 
  va.id,
  va.venue_id,
  va.created_at,
  p.username,
  p.full_name,
  p.x_account_url,
  p.avatar_url
FROM venue_attendances va
JOIN profiles p ON va.user_id = p.id
WHERE va.is_public = true;

-- RLS（Row Level Security）の設定
-- 公開ビューは誰でも閲覧可能
CREATE POLICY "Anyone can view public attendances"
  ON venue_attendances FOR SELECT
  USING (is_public = true);

-- プロフィールも基本情報は誰でも閲覧可能
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

-- venue_attendancesの既存ポリシーを更新
DROP POLICY IF EXISTS "Users can view all venue attendances." ON venue_attendances;
CREATE POLICY "Users can view public venue attendances."
  ON venue_attendances FOR SELECT
  USING (is_public = true);

-- 自分の参加記録は非公開でも見れる
CREATE POLICY "Users can view their own venue attendances."
  ON venue_attendances FOR SELECT
  USING (auth.uid() = user_id);

-- 参加表明用のポリシー（認証ユーザーのみ）
DROP POLICY IF EXISTS "Users can insert their own venue attendance." ON venue_attendances;
CREATE POLICY "Users can insert their own venue attendance."
  ON venue_attendances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分の参加記録の更新・削除
DROP POLICY IF EXISTS "Users can delete their own venue attendance." ON venue_attendances;
CREATE POLICY "Users can update their own venue attendance."
  ON venue_attendances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own venue attendance."
  ON venue_attendances FOR DELETE
  USING (auth.uid() = user_id);

-- 便利な関数：会場別の参加者数を取得
CREATE OR REPLACE FUNCTION get_venue_attendance_count(venue_id_param text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM venue_attendances
    WHERE venue_id = venue_id_param AND is_public = true
  );
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- 便利な関数：会場別の公開参加者リストを取得
CREATE OR REPLACE FUNCTION get_venue_attendees(venue_id_param text)
RETURNS TABLE (
  username text,
  full_name text,
  x_account_url text,
  avatar_url text,
  joined_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.username,
    p.full_name,
    p.x_account_url,
    p.avatar_url,
    va.created_at
  FROM venue_attendances va
  JOIN profiles p ON va.user_id = p.id
  WHERE va.venue_id = venue_id_param 
    AND va.is_public = true
  ORDER BY va.created_at;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- 便利な関数：全体の参加表明者数を取得（ユニークユーザー数）
CREATE OR REPLACE FUNCTION get_total_attendees_count()
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM venue_attendances
    WHERE is_public = true
  );
END;
$$ LANGUAGE plpgsql SECURITY definer;