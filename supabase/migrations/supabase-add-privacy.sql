-- profilesテーブルにis_public列を追加

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 既存ユーザーのis_publicをtrueに設定
UPDATE profiles 
SET is_public = true
WHERE is_public IS NULL;

-- is_publicをNOT NULLに変更
ALTER TABLE profiles 
ALTER COLUMN is_public SET NOT NULL;
