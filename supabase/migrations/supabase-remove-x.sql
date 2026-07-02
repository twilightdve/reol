-- X連携機能削除用SQL
-- 美辞学ナビ シンプル化

-- 1. X関連のカラムを削除
ALTER TABLE profiles 
DROP COLUMN IF EXISTS x_username,
DROP COLUMN IF EXISTS x_user_id,
DROP COLUMN IF EXISTS x_display_name,
DROP COLUMN IF EXISTS x_verified;

-- 2. X関連のインデックスを削除
DROP INDEX IF EXISTS profiles_x_username_unique;
DROP INDEX IF EXISTS profiles_x_user_id_unique;

-- 3. X関連の関数を削除
DROP FUNCTION IF EXISTS public.link_x_account(text, text, text, boolean);
DROP FUNCTION IF EXISTS public.unlink_x_account();

-- 4. プロフィールテーブルの構造確認（参考）
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND table_schema = 'public';