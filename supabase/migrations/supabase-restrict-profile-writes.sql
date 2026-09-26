-- profiles の password_hash・id 列の直接 UPDATE を制限し、
-- パスワード変更を検証つきの RPC 経由に一本化する。
-- id の変更は既存の change_user_id RPC が担う。
--
-- 注: テーブル単位の UPDATE 権限が残っていると列単位の REVOKE は効かないため、
-- 実際の列単位の権限整理は supabase-profiles-column-grants.sql で行っている。

REVOKE UPDATE (password_hash, id) ON public.profiles FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_user_password(
  p_user_id TEXT,
  p_old_password_hash TEXT,
  p_new_password_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ユーザーが見つかりません');
  END IF;

  IF v_profile.password_hash IS NULL OR v_profile.password_hash != p_old_password_hash THEN
    RETURN jsonb_build_object('success', false, 'error', '現在のパスワードが正しくありません');
  END IF;

  UPDATE profiles
  SET password_hash = p_new_password_hash,
      updated_at = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
