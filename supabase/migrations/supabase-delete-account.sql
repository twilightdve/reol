-- アカウント削除用のストアドプロシージャ
-- パスワード検証後、関連する全データを削除する
-- トランザクション内で実行されるため、途中で失敗した場合はロールバックされる

CREATE OR REPLACE FUNCTION public.delete_account(
  p_user_id TEXT,
  p_password_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  -- 1. プロフィールを取得し、パスワード検証
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'ユーザーが見つかりません');
  END IF;
  
  IF v_profile.password_hash IS NULL OR v_profile.password_hash != p_password_hash THEN
    RETURN jsonb_build_object('success', false, 'error', 'パスワードが正しくありません');
  END IF;

  -- 2. venue_attendances を削除
  DELETE FROM venue_attendances WHERE user_id = p_user_id;

  -- 3. comments を削除
  DELETE FROM comments WHERE user_id = p_user_id;

  -- 4. setlist_votes を削除（テーブルが存在する場合）
  BEGIN
    DELETE FROM setlist_votes WHERE user_id = p_user_id;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  -- 5. checklist_progress を削除（テーブルが存在する場合）
  BEGIN
    DELETE FROM checklist_progress WHERE user_id = p_user_id;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  -- 6. プロフィールを削除
  DELETE FROM profiles WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
