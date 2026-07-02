-- profilesテーブルにreol_typeカラムを追加
-- Reolファンタイプ診断の結果を保存する（例: 'FGSA', 'BEQI' など）

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reol_type TEXT DEFAULT NULL;

-- 既存のget_all_attendees関数を更新してreol_typeを返すようにする
DROP FUNCTION IF EXISTS get_all_attendees();

CREATE OR REPLACE FUNCTION get_all_attendees()
RETURNS TABLE(
  user_id TEXT,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  venue_count BIGINT,
  encounter_policy TEXT,
  reol_type TEXT
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
    p.encounter_policy,
    p.reol_type
  FROM public.profiles p
  JOIN public.venue_attendances va ON p.id = va.user_id
  GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.encounter_policy, p.reol_type
  ORDER BY MIN(va.created_at) ASC;
END;
$$;

-- 匿名ユーザーと認証済みユーザーに実行権限を付与
GRANT EXECUTE ON FUNCTION get_all_attendees() TO anon;
GRANT EXECUTE ON FUNCTION get_all_attendees() TO authenticated;
