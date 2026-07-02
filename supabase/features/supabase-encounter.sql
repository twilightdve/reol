-- エンカウント（エンカ）機能のデータベース追加
-- profiles テーブルにエンカウント基本方針カラムを追加
-- venue_attendances テーブルに会場別エンカウント設定カラムを追加

-- ============================================================
-- 1. profiles テーブル: エンカウント基本方針
-- ============================================================
-- encounter_policy: null = 未設定（初回モーダルを表示）, 'ok' = 基本エンカOK, 'ng' = 基本エンカNG
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS encounter_policy text DEFAULT NULL;

-- encounter_policy の値を制限
ALTER TABLE profiles
ADD CONSTRAINT check_encounter_policy
CHECK (encounter_policy IS NULL OR encounter_policy IN ('ok', 'ng'));

-- ============================================================
-- 2. venue_attendances テーブル: 会場別エンカウント設定
-- ============================================================
-- encounter_ok: null = 基本方針に従う, true = この会場はエンカOK, false = この会場はエンカNG
ALTER TABLE venue_attendances
ADD COLUMN IF NOT EXISTS encounter_ok boolean DEFAULT NULL;

-- ============================================================
-- 3. get_all_attendees RPC を更新: encounter_policy を含める
-- ============================================================
DROP FUNCTION IF EXISTS get_all_attendees();

CREATE OR REPLACE FUNCTION get_all_attendees()
RETURNS TABLE(
  user_id TEXT,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  venue_count BIGINT,
  encounter_policy TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    COUNT(DISTINCT va.venue_id) as venue_count,
    p.encounter_policy
  FROM public.profiles p
  JOIN public.venue_attendances va ON p.id = va.user_id
  GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.encounter_policy
  ORDER BY MIN(va.created_at) ASC;
END;
$$;

-- 権限付与
GRANT EXECUTE ON FUNCTION get_all_attendees() TO anon;
GRANT EXECUTE ON FUNCTION get_all_attendees() TO authenticated;

-- ============================================================
-- 4. ユーザーの会場別エンカウント設定を取得する関数
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_encounter_venues(target_user_id TEXT)
RETURNS TABLE(
  venue_id TEXT,
  encounter_ok BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    va.venue_id,
    va.encounter_ok
  FROM public.venue_attendances va
  WHERE va.user_id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_encounter_venues(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_user_encounter_venues(TEXT) TO authenticated;

-- ============================================================
-- 5. 会場別エンカウント設定を更新する関数（RLSバイパス）
-- ============================================================
-- venue_attendances の UPDATE が RLS で禁止されているため、
-- SECURITY DEFINER の RPC で更新する
CREATE OR REPLACE FUNCTION update_venue_encounter(
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
  UPDATE public.venue_attendances
  SET encounter_ok = new_encounter_ok
  WHERE user_id = target_user_id AND venue_id = target_venue_id;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION update_venue_encounter(TEXT, TEXT, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION update_venue_encounter(TEXT, TEXT, BOOLEAN) TO authenticated;

-- ============================================================
-- 6. 全会場のエンカウント設定をリセットする関数（RLSバイパス）
-- ============================================================
CREATE OR REPLACE FUNCTION reset_all_venue_encounters(target_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.venue_attendances
  SET encounter_ok = NULL
  WHERE user_id = target_user_id;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION reset_all_venue_encounters(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION reset_all_venue_encounters(TEXT) TO authenticated;
