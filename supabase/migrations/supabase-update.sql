-- 美辞学ナビ - データベース更新SQL
-- 既存のprofilesテーブルがある場合の更新用

-- 1. profilesテーブルにusernameをNOT NULLに変更
-- 既存データにusernameがNULLの場合はデフォルト値を設定
UPDATE profiles 
SET username = 'user_' || substring(id::text, 1, 8)
WHERE username IS NULL;

-- usernameカラムをNOT NULLに変更
ALTER TABLE profiles 
ALTER COLUMN username SET NOT NULL;

-- 2. Xアカウント情報のカラムを追加
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS x_username text,
ADD COLUMN IF NOT EXISTS x_user_id text,
ADD COLUMN IF NOT EXISTS x_display_name text,
ADD COLUMN IF NOT EXISTS x_verified boolean default false;

-- 3. Xアカウントのユニーク制約を追加
CREATE UNIQUE INDEX IF NOT EXISTS profiles_x_username_unique 
ON profiles (x_username) 
WHERE x_username IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_x_user_id_unique 
ON profiles (x_user_id) 
WHERE x_user_id IS NOT NULL;

-- 4. プロフィール更新用のポリシーを更新（X情報も含む）
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. 新規ユーザー登録時の関数を更新
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substring(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- 6. X連携用の関数を作成
CREATE OR REPLACE FUNCTION public.link_x_account(
  p_x_username text,
  p_x_user_id text,
  p_x_display_name text,
  p_x_verified boolean DEFAULT false
)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    x_username = p_x_username,
    x_user_id = p_x_user_id,
    x_display_name = p_x_display_name,
    x_verified = p_x_verified,
    updated_at = now()
  WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- 7. X連携解除用の関数を作成
CREATE OR REPLACE FUNCTION public.unlink_x_account()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    x_username = NULL,
    x_user_id = NULL,
    x_display_name = NULL,
    x_verified = false,
    updated_at = now()
  WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY definer;