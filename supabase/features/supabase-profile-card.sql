-- プロフィールカード(plan/48): 会員のカードの入力内容をアカウントに保存する(2026-10-18)
--
-- - profiles に card 列(jsonb)を足す。
--   profiles の SELECT は列単位で付けている(supabase-profiles-select-grants.sql)ので、新しい列は anon / authenticated から読めない。
--   本人も、下の関数を通してだけ読み書きする(他の会員のカードは読めない)。
-- - get_my_card() / set_my_card(p_card): ログイン中の本人(request_session_user_id())のカードだけ。
--   ログインしていない時は、読むと null、書くと false。中身は JSON のオブジェクトで 4KB まで。
-- - change_user_id: ID を変えた時にカードが消えないよう、新しい行に card も写す(それ以外は今の定義のまま)。
--
-- 何度実行しても同じ結果になる。

BEGIN;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS card jsonb;

CREATE OR REPLACE FUNCTION public.get_my_card()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.card FROM public.profiles p WHERE p.id = public.request_session_user_id();
$$;

CREATE OR REPLACE FUNCTION public.set_my_card(p_card jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user TEXT := public.request_session_user_id();
BEGIN
  IF v_user IS NULL THEN
    RETURN false;
  END IF;
  IF p_card IS NULL OR jsonb_typeof(p_card) <> 'object' OR octet_length(p_card::text) > 4096 THEN
    RAISE EXCEPTION 'invalid card';
  END IF;
  UPDATE public.profiles SET card = p_card WHERE id = v_user;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_card() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_my_card(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_card() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_my_card(jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.change_user_id(p_old_id text, p_new_id text, p_password text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE
  v_profile RECORD;
  v_result TEXT;
BEGIN
  -- 本人のセッションからのリクエストのみ受け付ける
  IF p_old_id IS DISTINCT FROM public.request_session_user_id() THEN
    RETURN jsonb_build_object('success', false, 'error', 'ログインの有効期限が切れています。再度ログインしてください');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_old_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'ユーザーが見つかりません');
  END IF;
  v_result := public._verify_password_with_limit(p_old_id, p_password);
  IF v_result = 'locked' THEN
    RETURN jsonb_build_object('success', false, 'error', 'パスワードの試行回数が多すぎます。15分ほど待ってから再度お試しください');
  ELSIF v_result <> 'ok' THEN
    RETURN jsonb_build_object('success', false, 'error', 'パスワードが正しくありません');
  END IF;

  IF p_new_id !~ '^[A-Za-z0-9_]{1,30}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'IDは英数字とアンダースコアのみ、1〜30文字で入力してください');
  END IF;

  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_new_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'このIDは既に使用されています');
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE id = p_old_id;

  INSERT INTO profiles (
    id, username, full_name, avatar_url, password_hash, created_at, updated_at,
    is_public, encounter_policy, reol_type, meta_tags, favorite_song, card
  ) VALUES (
    p_new_id, v_profile.username, v_profile.full_name, v_profile.avatar_url, v_profile.password_hash,
    v_profile.created_at, now(),
    v_profile.is_public, v_profile.encounter_policy, v_profile.reol_type, v_profile.meta_tags, v_profile.favorite_song, v_profile.card
  );

  UPDATE venue_attendances SET user_id = p_new_id WHERE user_id = p_old_id;
  UPDATE comments          SET user_id = p_new_id WHERE user_id = p_old_id;
  UPDATE user_collections  SET user_id = p_new_id WHERE user_id = p_old_id;
  UPDATE setlist_votes     SET user_id = p_new_id WHERE user_id = p_old_id;
  UPDATE venue_checkins    SET user_id = p_new_id WHERE user_id = p_old_id;
  UPDATE venue_checklists  SET user_id = p_new_id WHERE user_id = p_old_id;
  UPDATE encounter_wants   SET user_id = p_new_id WHERE user_id = p_old_id;
  UPDATE encounter_wants   SET target_user_id = p_new_id WHERE target_user_id = p_old_id;
  UPDATE public.user_sessions SET user_id = p_new_id WHERE user_id = p_old_id;

  DELETE FROM profiles WHERE id = p_old_id;

  RETURN jsonb_build_object('success', true, 'new_id', p_new_id);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

COMMIT;
