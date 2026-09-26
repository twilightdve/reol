-- profiles の SELECT 権限をテーブル単位から列単位に切り替える。
-- テーブル単位の SELECT を剥奪してから、クライアントが読んでよい列だけを再付与する
-- (password_hash は含めない。パスワード検証は SECURITY DEFINER の RPC で行う)。
-- 前提: クライアントの profiles 取得は全箇所で列を明示している(insert 後の読み返しを含む)。

BEGIN;

REVOKE SELECT ON public.profiles FROM anon, authenticated;

GRANT SELECT (
  id,
  username,
  full_name,
  avatar_url,
  created_at,
  updated_at,
  is_public,
  encounter_policy,
  reol_type,
  meta_tags,
  favorite_song
) ON public.profiles TO anon, authenticated;

COMMIT;
