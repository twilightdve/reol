-- profilesテーブルにpassword_hash列を追加

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 既存ユーザーには仮パスワードを設定（初回ログイン時に変更を促す）
-- 注意: 実際の運用では既存ユーザーに通知が必要
UPDATE profiles 
SET password_hash = '37268335dd6931045bdcdf92623ff819a64244b53d0e746d438797349d4da578' -- "testtest" のSHA-256ハッシュ
WHERE password_hash IS NULL;

-- password_hashをNOT NULLに変更
ALTER TABLE profiles 
ALTER COLUMN password_hash SET NOT NULL;
