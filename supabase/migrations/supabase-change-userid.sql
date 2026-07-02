-- ユーザーID変更用のストアドプロシージャ
-- profiles.id が主キー（text型）なので、関連テーブルすべてを更新する必要がある
-- トランザクション内で実行されるため、途中で失敗した場合はロールバックされる

CREATE OR REPLACE FUNCTION public.change_user_id(
  p_old_id TEXT,
  p_new_id TEXT,
  p_password_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
  v_result JSONB;
BEGIN
  -- 1. 旧IDのプロフィールを取得し、パスワード検証
  SELECT * INTO v_profile FROM profiles WHERE id = p_old_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ユーザーが見つかりません');
  END IF;
  
  IF v_profile.password_hash IS NULL OR v_profile.password_hash != p_password_hash THEN
    RETURN jsonb_build_object('success', false, 'error', 'パスワードが正しくありません');
  END IF;

  -- 2. 新IDの形式チェック（英数字とアンダースコアのみ、1-30文字）
  IF p_new_id !~ '^[A-Za-z0-9_]{1,30}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'IDは英数字とアンダースコアのみ、1〜30文字で入力してください');
  END IF;

  -- 3. 新IDが既に存在しないか確認
  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_new_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'このIDは既に使用されています');
  END IF;

  -- 4. 新プロフィールを作成（旧プロフィールのデータをコピー）
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

  -- 5. venue_attendances の user_id を更新
  UPDATE venue_attendances SET user_id = p_new_id WHERE user_id = p_old_id;

  -- 6. comments の user_id を更新
  UPDATE comments SET user_id = p_new_id WHERE user_id = p_old_id;

  -- 7. setlist_votes の user_id を更新（テーブルが存在する場合）
  BEGIN
    UPDATE setlist_votes SET user_id = p_new_id WHERE user_id = p_old_id;
  EXCEPTION WHEN undefined_table THEN
    -- テーブルが存在しない場合はスキップ
    NULL;
  END;

  -- 8. checklist_progress の user_id を更新（テーブルが存在する場合）
  BEGIN
    UPDATE checklist_progress SET user_id = p_new_id WHERE user_id = p_old_id;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  -- 9. 旧プロフィールを削除（CASCADE で残りの参照も削除）
  DELETE FROM profiles WHERE id = p_old_id;

  RETURN jsonb_build_object('success', true, 'new_id', p_new_id);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
