-- パスワード検証をサーバー側に移すためのマイグレーション。
-- 旧方式はクライアント側でSHA-256ハッシュ化した値を送って比較していた。
--
-- 対応: パスワード検証を平文パスワードを受け取るRPCに一本化し、サーバー側で
-- pgcrypto(bcrypt)によるハッシュ比較・生成を行う。
-- 既存ユーザーは旧SHA-256ハッシュのままなので、ログイン成功時に
-- bcryptへ自動移行する(migrate-on-login)。

-- 内部ヘルパー: パスワード検証 + 旧形式ならbcryptへ自動移行
-- anon/authenticatedからは直接呼べないようにする(EXECUTE権限を与えない)
CREATE OR REPLACE FUNCTION public._verify_and_upgrade_password(
  p_user_id TEXT,
  p_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_hash TEXT;
  v_valid BOOLEAN;
BEGIN
  SELECT password_hash INTO v_hash FROM profiles WHERE id = p_user_id;

  IF v_hash IS NULL THEN
    RETURN false;
  END IF;

  IF v_hash LIKE '$2%' THEN
    -- 既にbcrypt移行済み
    v_valid := (v_hash = extensions.crypt(p_password, v_hash));
  ELSE
    -- 旧形式(クライアント側SHA-256の16進文字列)
    v_valid := (v_hash = encode(extensions.digest(p_password, 'sha256'), 'hex'));
    IF v_valid THEN
      UPDATE profiles
      SET password_hash = extensions.crypt(p_password, extensions.gen_salt('bf'))
      WHERE id = p_user_id;
    END IF;
  END IF;

  RETURN v_valid;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._verify_and_upgrade_password(TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- ログイン検証RPC(password_hashのSELECT公開を廃止するため、ログインもRPC経由にする)
CREATE OR REPLACE FUNCTION public.verify_user_login(
  p_user_id TEXT,
  p_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ユーザーIDまたはパスワードが正しくありません');
  END IF;

  IF NOT public._verify_and_upgrade_password(p_user_id, p_password) THEN
    RETURN jsonb_build_object('success', false, 'error', 'ユーザーIDまたはパスワードが正しくありません');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'profile', to_jsonb(v_profile) - 'password_hash'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- パスワード変更RPC(平文パスワードを受け取り、新パスワードはbcryptで保存)
-- 引数名が変わるためCREATE OR REPLACEでは置き換えられず、先にDROPが必要
DROP FUNCTION IF EXISTS public.update_user_password(TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.update_user_password(
  p_user_id TEXT,
  p_old_password TEXT,
  p_new_password TEXT
)
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

  UPDATE profiles
  SET password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
      updated_at = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ユーザーID変更RPC(引数を平文パスワードに変更。他の処理は既存のまま)
-- 引数名が変わるためCREATE OR REPLACEでは置き換えられず、先にDROPが必要
DROP FUNCTION IF EXISTS public.change_user_id(TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.change_user_id(
  p_old_id TEXT,
  p_new_id TEXT,
  p_password TEXT
)
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

  -- 検証で移行された可能性があるため、最新のハッシュを取り直す
  SELECT * INTO v_profile FROM profiles WHERE id = p_old_id;

  IF p_new_id !~ '^[A-Za-z0-9_]{1,30}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'IDは英数字とアンダースコアのみ、1〜30文字で入力してください');
  END IF;

  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_new_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'このIDは既に使用されています');
  END IF;

  INSERT INTO profiles (id, username, full_name, avatar_url, password_hash, created_at, updated_at)
  VALUES (
    p_new_id,
    v_profile.username,
    v_profile.full_name,
    v_profile.avatar_url,
    v_profile.password_hash,
    v_profile.created_at,
    now()
  );

  UPDATE venue_attendances SET user_id = p_new_id WHERE user_id = p_old_id;
  UPDATE comments SET user_id = p_new_id WHERE user_id = p_old_id;

  BEGIN
    UPDATE setlist_votes SET user_id = p_new_id WHERE user_id = p_old_id;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  BEGIN
    UPDATE checklist_progress SET user_id = p_new_id WHERE user_id = p_old_id;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  DELETE FROM profiles WHERE id = p_old_id;

  RETURN jsonb_build_object('success', true, 'new_id', p_new_id);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- アカウント削除RPC(引数を平文パスワードに変更。他の処理は既存のまま)
-- 引数名が変わるためCREATE OR REPLACEでは置き換えられず、先にDROPが必要
DROP FUNCTION IF EXISTS public.delete_account(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.delete_account(
  p_user_id TEXT,
  p_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF NOT public._verify_and_upgrade_password(p_user_id, p_password) THEN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'ユーザーが見つかりません');
    END IF;
    RETURN jsonb_build_object('success', false, 'error', 'パスワードが正しくありません');
  END IF;

  DELETE FROM venue_attendances WHERE user_id = p_user_id;
  DELETE FROM comments WHERE user_id = p_user_id;

  BEGIN
    DELETE FROM setlist_votes WHERE user_id = p_user_id;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  BEGIN
    DELETE FROM checklist_progress WHERE user_id = p_user_id;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  DELETE FROM profiles WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 注: signUpUser(新規登録)は今回変更していないため、新規登録直後は
-- 旧形式(クライアント側SHA-256)で保存され、初回ログイン時にbcryptへ移行される。

-- password_hashのSELECT公開を廃止(ログインをverify_user_login RPC経由にしたため直接読む必要がなくなった)
REVOKE SELECT (password_hash) ON public.profiles FROM anon, authenticated;
