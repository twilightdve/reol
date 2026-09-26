-- !Legit側の「コレクション台帳」(DISCOGRAPHY所有/視聴済み・LIVE参戦済み・
-- PLACE巡礼済み)を、未ログイン時はこれまで通りlocalStorageのみで完結させつつ、
-- ログインユーザーはDBにも永続化できるようにするためのテーブル。
--
-- 行 = (ユーザー, namespace, アイテムUUID) の存在で「チェック済み」を表す
-- (JSON配列で1ユーザー1行にはしない。将来「この曲を持っている人N人」等の
-- 集計機能を作る際にSQLで集計できるようにするため)。
--
-- 注意: このサイトは実セッション(auth.uid())の無いカスタム認証のため、
-- RLSポリシーは他のテーブルと同じ形になっている。認可の見直しは別途行う。
-- 他人のコレクションを閲覧できるUI(公開プロフィール等)は作らない方針。

CREATE TABLE public.user_collections (
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  namespace TEXT NOT NULL CHECK (namespace IN ('owned', 'attended', 'visited')),
  item_uuid TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, namespace, item_uuid)
);

ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_collections_select_policy ON public.user_collections
  FOR SELECT USING (true);

CREATE POLICY user_collections_insert_policy ON public.user_collections
  FOR INSERT WITH CHECK (true);

CREATE POLICY user_collections_delete_policy ON public.user_collections
  FOR DELETE USING (true);

GRANT SELECT, INSERT, DELETE ON public.user_collections TO anon, authenticated;

-- change_user_id は他テーブルのuser_idを新IDへ引き継いでいるため、
-- user_collectionsも同様に引き継ぐよう追加する(処理内容はそれ以外同一)。
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
  UPDATE user_collections SET user_id = p_new_id WHERE user_id = p_old_id;

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
