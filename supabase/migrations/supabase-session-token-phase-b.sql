-- セッショントークン方式への移行 フェーズB(書き込みポリシーの切り替え)
--
-- 前提: フェーズA適用済み、かつトークンを送る新クライアントがデプロイ済みであること。
-- 適用すると、トークンを持たない旧クライアント(=再ログイン前のユーザー)からの
-- 書き込みは拒否される。
--
-- 方針:
-- - 書き込み(INSERT/UPDATE/DELETE)は「行の user_id = このリクエストのユーザー」のみ許可
-- - 個人用のデータ(コレクション台帳・遠征チェックリスト)は読み取りも本人のみ
-- - 参加者一覧・コメント等、サイト上で公開表示しているデータの読み取りは従来どおり
-- - プロフィールの新規作成は sign_up_user RPC のみ(直接 INSERT は不可)

BEGIN;

-- ============================================================
-- profiles
-- ============================================================
DROP POLICY IF EXISTS profiles_insert_policy ON public.profiles;
REVOKE INSERT ON public.profiles FROM anon, authenticated;

DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
CREATE POLICY profiles_update_policy ON public.profiles
  FOR UPDATE
  USING (id = (SELECT public.request_session_user_id()))
  WITH CHECK (id = (SELECT public.request_session_user_id()));

-- ============================================================
-- user_collections(個人用: 読み取りも本人のみ。集計は get_collection_count RPC)
-- ============================================================
DROP POLICY IF EXISTS user_collections_select_policy ON public.user_collections;
DROP POLICY IF EXISTS user_collections_insert_policy ON public.user_collections;
DROP POLICY IF EXISTS user_collections_delete_policy ON public.user_collections;
CREATE POLICY user_collections_select_policy ON public.user_collections
  FOR SELECT USING (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY user_collections_insert_policy ON public.user_collections
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY user_collections_delete_policy ON public.user_collections
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- venue_checklists(個人用: 読み取りも本人のみ)
-- ============================================================
DROP POLICY IF EXISTS venue_checklists_select_policy ON public.venue_checklists;
DROP POLICY IF EXISTS venue_checklists_insert_policy ON public.venue_checklists;
DROP POLICY IF EXISTS venue_checklists_update_policy ON public.venue_checklists;
DROP POLICY IF EXISTS venue_checklists_delete_policy ON public.venue_checklists;
CREATE POLICY venue_checklists_select_policy ON public.venue_checklists
  FOR SELECT USING (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY venue_checklists_insert_policy ON public.venue_checklists
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY venue_checklists_update_policy ON public.venue_checklists
  FOR UPDATE
  USING (user_id = (SELECT public.request_session_user_id()))
  WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY venue_checklists_delete_policy ON public.venue_checklists
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- venue_attendances(参加者一覧として公開表示: 読み取りは従来どおり)
-- UPDATE は従来どおり不可(encounter_ok の更新は RPC 経由)
-- ============================================================
DROP POLICY IF EXISTS venue_attendances_insert_policy ON public.venue_attendances;
DROP POLICY IF EXISTS venue_attendances_delete_policy ON public.venue_attendances;
CREATE POLICY venue_attendances_insert_policy ON public.venue_attendances
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY venue_attendances_delete_policy ON public.venue_attendances
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- venue_checkins(会場ごとのチェックイン一覧として公開表示)
-- ============================================================
DROP POLICY IF EXISTS venue_checkins_insert_own ON public.venue_checkins;
DROP POLICY IF EXISTS venue_checkins_delete_own ON public.venue_checkins;
CREATE POLICY venue_checkins_insert_own ON public.venue_checkins
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY venue_checkins_delete_own ON public.venue_checkins
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- comments(公開表示)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can delete their own comments" ON public.comments;
CREATE POLICY comments_insert_own ON public.comments
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY comments_update_own ON public.comments
  FOR UPDATE
  USING (user_id = (SELECT public.request_session_user_id()))
  WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY comments_delete_own ON public.comments
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- encounter_wants(「自分をエンカしたい人」の表示のため読み取りは従来どおり)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert encounter wants" ON public.encounter_wants;
DROP POLICY IF EXISTS "Anyone can delete encounter wants" ON public.encounter_wants;
CREATE POLICY encounter_wants_insert_own ON public.encounter_wants
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY encounter_wants_delete_own ON public.encounter_wants
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- setlist_votes(集計表示)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert votes" ON public.setlist_votes;
DROP POLICY IF EXISTS "Anyone can delete their votes" ON public.setlist_votes;
CREATE POLICY setlist_votes_insert_own ON public.setlist_votes
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY setlist_votes_delete_own ON public.setlist_votes
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- エンカウント設定の RPC: 本人のリクエストのみ更新する
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_venue_encounter(
  target_user_id TEXT,
  target_venue_id TEXT,
  new_encounter_ok BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF target_user_id IS DISTINCT FROM public.request_session_user_id() THEN
    RETURN FALSE;
  END IF;

  UPDATE public.venue_attendances
  SET encounter_ok = new_encounter_ok
  WHERE user_id = target_user_id AND venue_id = target_venue_id;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_all_venue_encounters(target_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF target_user_id IS DISTINCT FROM public.request_session_user_id() THEN
    RETURN FALSE;
  END IF;

  UPDATE public.venue_attendances
  SET encounter_ok = NULL
  WHERE user_id = target_user_id;

  RETURN FOUND;
END;
$$;

-- ============================================================
-- パスワード変更・ID変更・退会: 本人のセッションからのリクエストのみ受け付ける
-- (フェーズAの定義に本人確認を足したもの。パスワード照合と試行回数制限は従来どおり)
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_user_password(p_user_id TEXT, p_old_password TEXT, p_new_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_result TEXT;
BEGIN
  -- 本人のセッションからのリクエストのみ受け付ける
  IF p_user_id IS DISTINCT FROM public.request_session_user_id() THEN
    RETURN jsonb_build_object('success', false, 'error', 'ログインの有効期限が切れています。再度ログインしてください');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'ユーザーが見つかりません');
  END IF;

  v_result := public._verify_password_with_limit(p_user_id, p_old_password);
  IF v_result = 'locked' THEN
    RETURN jsonb_build_object('success', false, 'error', 'パスワードの試行回数が多すぎます。15分ほど待ってから再度お試しください');
  ELSIF v_result <> 'ok' THEN
    RETURN jsonb_build_object('success', false, 'error', '現在のパスワードが正しくありません');
  END IF;

  IF p_new_password IS NULL OR length(p_new_password) < 8 THEN
    RETURN jsonb_build_object('success', false, 'error', 'パスワードは8文字以上で入力してください');
  END IF;

  UPDATE profiles
  SET password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = p_user_id;

  DELETE FROM public.user_sessions
  WHERE user_id = p_user_id
    AND token_hash IS DISTINCT FROM public._request_token_hash();

  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.change_user_id(p_old_id TEXT, p_new_id TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
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
    is_public, encounter_policy, reol_type, meta_tags, favorite_song
  ) VALUES (
    p_new_id, v_profile.username, v_profile.full_name, v_profile.avatar_url, v_profile.password_hash,
    v_profile.created_at, now(),
    v_profile.is_public, v_profile.encounter_policy, v_profile.reol_type, v_profile.meta_tags, v_profile.favorite_song
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
$$;

CREATE OR REPLACE FUNCTION public.delete_account(p_user_id TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_result TEXT;
BEGIN
  -- 本人のセッションからのリクエストのみ受け付ける
  IF p_user_id IS DISTINCT FROM public.request_session_user_id() THEN
    RETURN jsonb_build_object('success', false, 'error', 'ログインの有効期限が切れています。再度ログインしてください');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'ユーザーが見つかりません');
  END IF;
  v_result := public._verify_password_with_limit(p_user_id, p_password);
  IF v_result = 'locked' THEN
    RETURN jsonb_build_object('success', false, 'error', 'パスワードの試行回数が多すぎます。15分ほど待ってから再度お試しください');
  ELSIF v_result <> 'ok' THEN
    RETURN jsonb_build_object('success', false, 'error', 'パスワードが正しくありません');
  END IF;

  DELETE FROM venue_attendances WHERE user_id = p_user_id;
  DELETE FROM comments WHERE user_id = p_user_id;
  DELETE FROM setlist_votes WHERE user_id = p_user_id;
  -- user_collections / venue_checkins / venue_checklists / encounter_wants /
  -- user_sessions は profiles への外部キー(ON DELETE CASCADE)で削除される
  DELETE FROM profiles WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

COMMIT;
