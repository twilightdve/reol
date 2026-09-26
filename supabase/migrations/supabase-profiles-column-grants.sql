-- profiles の UPDATE 権限をテーブル単位から列単位に切り替える。
-- PostgreSQL ではテーブル単位の権限を保持していると列単位の REVOKE は効かないため、
-- テーブル単位の UPDATE を剥奪してから、クライアントが更新してよい列だけを再付与する。
-- password_hash の更新は検証つき RPC(SECURITY DEFINER)経由のみとする。

BEGIN;

REVOKE UPDATE ON public.profiles FROM anon, authenticated;

GRANT UPDATE (
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
