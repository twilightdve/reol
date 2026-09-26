-- セッショントークン方式への移行 フェーズA(既存クライアントと互換)
--
-- 目的: カスタム認証(ID+パスワード)のまま、サーバー側で「誰のリクエストか」を
-- 判定できるようにする。ログイン/新規登録の成功時にランダムなセッショントークンを
-- 発行し、クライアントはリクエストヘッダー x-session-token で毎回送る。
-- RLS ポリシーは request_session_user_id() でヘッダーのトークンからユーザーIDを引く。
--
-- フェーズAは追加のみで、既存クライアント(トークンを送らない)の動作を変えない。
-- 書き込みポリシーの切り替えは、新クライアントのデプロイ後にフェーズBで行う。

BEGIN;

-- ============================================================
-- 1. セッションテーブル(クライアントから直接は触れない)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON public.user_sessions (user_id);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
-- ポリシーは作らない(= anon/authenticated からは一切読めない・書けない)
REVOKE ALL ON public.user_sessions FROM anon, authenticated;

-- ============================================================
-- 2. リクエストヘッダーのトークン → ユーザーID
-- ============================================================
-- PostgREST は request.headers にリクエストヘッダーを JSON で入れる(名前は小文字)。
CREATE OR REPLACE FUNCTION public._request_token_hash()
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN nullif(current_setting('request.headers', true), '') IS NULL THEN NULL
    WHEN (current_setting('request.headers', true)::json ->> 'x-session-token') IS NULL THEN NULL
    ELSE encode(
      extensions.digest(current_setting('request.headers', true)::json ->> 'x-session-token', 'sha256'),
      'hex'
    )
  END;
$$;

-- RLS ポリシーから呼ぶため anon/authenticated に EXECUTE を与える。
-- user_sessions を読むので SECURITY DEFINER。返すのは「このリクエストのユーザーID」だけ。
CREATE OR REPLACE FUNCTION public.request_session_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT s.user_id
  FROM public.user_sessions s
  WHERE s.token_hash = public._request_token_hash()
    AND s.expires_at > now();
$$;

-- ============================================================
-- 3. セッション発行(内部用)
-- ============================================================
CREATE OR REPLACE FUNCTION public._issue_session(p_user_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_token TEXT;
BEGIN
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  INSERT INTO public.user_sessions (token_hash, user_id, expires_at)
  VALUES (encode(extensions.digest(v_token, 'sha256'), 'hex'), p_user_id, now() + interval '180 days');
  -- 期限切れのセッションはついでに掃除する
  DELETE FROM public.user_sessions WHERE user_id = p_user_id AND expires_at <= now();
  RETURN v_token;
END;
$$;

-- ============================================================
-- 4. ログイン: 試行回数制限 + セッション発行
-- ============================================================
-- rate_limits を「login:<ユーザーID>」をキーに使い、15分間に10回失敗したら拒否する。
CREATE OR REPLACE FUNCTION public.verify_user_login(p_user_id TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_profile RECORD;
  v_key TEXT := 'login:' || coalesce(p_user_id, '');
  v_count INTEGER;
  v_start TIMESTAMPTZ;
  v_token TEXT;
BEGIN
  SELECT request_count, window_start INTO v_count, v_start
  FROM public.rate_limits WHERE ip_address = v_key;
  IF FOUND AND v_start > now() - interval '15 minutes' AND v_count >= 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'ログインの試行回数が多すぎます。15分ほど待ってから再度お試しください');
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;

  IF NOT FOUND OR NOT public._verify_and_upgrade_password(p_user_id, p_password) THEN
    INSERT INTO public.rate_limits AS rl (ip_address, request_count, window_start)
    VALUES (v_key, 1, now())
    ON CONFLICT (ip_address) DO UPDATE SET
      request_count = CASE WHEN rl.window_start <= now() - interval '15 minutes'
                           THEN 1 ELSE rl.request_count + 1 END,
      window_start  = CASE WHEN rl.window_start <= now() - interval '15 minutes'
                           THEN now() ELSE rl.window_start END;
    RETURN jsonb_build_object('success', false, 'error', 'ユーザーIDまたはパスワードが正しくありません');
  END IF;

  DELETE FROM public.rate_limits WHERE ip_address = v_key;
  v_token := public._issue_session(p_user_id);

  RETURN jsonb_build_object(
    'success', true,
    'profile', to_jsonb(v_profile) - 'password_hash',
    'session_token', v_token
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================
-- 5. 新規登録(パスワードはサーバー側で bcrypt 化)+ セッション発行
-- ============================================================
CREATE OR REPLACE FUNCTION public.sign_up_user(p_user_id TEXT, p_username TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_username TEXT := nullif(btrim(coalesce(p_username, '')), '');
  v_token TEXT;
  v_profile JSONB;
BEGIN
  IF p_user_id IS NULL OR p_user_id !~ '^[^@[:space:]]{1,50}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'ユーザーIDは1〜50文字で入力してください(「@」と空白は使えません)');
  END IF;
  IF p_password IS NULL OR length(p_password) < 8 THEN
    RETURN jsonb_build_object('success', false, 'error', 'パスワードは8文字以上で入力してください');
  END IF;
  v_username := coalesce(v_username, p_user_id);

  INSERT INTO profiles (id, username, full_name, password_hash, created_at, updated_at)
  VALUES (p_user_id, v_username, v_username, crypt(p_password, gen_salt('bf')), now(), now());

  v_token := public._issue_session(p_user_id);
  SELECT to_jsonb(p) - 'password_hash' INTO v_profile FROM profiles p WHERE p.id = p_user_id;

  RETURN jsonb_build_object('success', true, 'profile', v_profile, 'session_token', v_token);

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'このユーザーIDは既に使用されています');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================
-- 6. ログアウト(このリクエストのトークンのセッションを消す)
-- ============================================================
CREATE OR REPLACE FUNCTION public.sign_out()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.user_sessions WHERE token_hash = public._request_token_hash();
$$;

-- ============================================================
-- 7. パスワード変更: 成功したら、このリクエスト以外のセッションを無効化する
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_user_password(p_user_id TEXT, p_old_password TEXT, p_new_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'ユーザーが見つかりません');
  END IF;

  IF NOT public._verify_and_upgrade_password(p_user_id, p_old_password) THEN
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

-- ============================================================
-- 8. ID変更: プロフィールの全列と、全関連テーブル・セッションを新IDへ引き継ぐ
-- ============================================================
-- 旧版は一部の列(公開設定・診断タイプ等)をコピーしておらず、チェックイン・
-- チェックリスト・エンカしたいを移していなかった(旧IDの削除で連鎖削除されていた)。
CREATE OR REPLACE FUNCTION public.change_user_id(p_old_id TEXT, p_new_id TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  IF NOT public._verify_and_upgrade_password(p_old_id, p_password) THEN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_old_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'ユーザーが見つかりません');
    END IF;
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

-- ============================================================
-- 9. 実行権限
-- ============================================================
-- PostgreSQL は関数の EXECUTE を既定で PUBLIC に与えるため、明示的に絞る。
REVOKE EXECUTE ON FUNCTION public._request_token_hash() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public._issue_session(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_session_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sign_up_user(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sign_out() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_user_login(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_password(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.change_user_id(TEXT, TEXT, TEXT) TO anon, authenticated;

-- クライアントが使わない管理用関数は anon/authenticated から外す
REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- search_path 未固定の関数を修正
ALTER FUNCTION public.get_venue_attendees(TEXT) SET search_path = public, pg_temp;

COMMIT;
