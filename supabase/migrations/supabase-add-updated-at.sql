-- get_all_attendees RPC に updated_at を追加
-- ソート用にプロフィール更新日時を返す

DROP FUNCTION IF EXISTS get_all_attendees();

CREATE OR REPLACE FUNCTION get_all_attendees()
RETURNS TABLE(
  user_id TEXT,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  venue_count BIGINT,
  encounter_policy TEXT,
  reol_type TEXT,
  meta_tags TEXT[],
  favorite_song TEXT,
  updated_at TIMESTAMPTZ
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
    p.reol_type,
    COALESCE(p.meta_tags, '{}') as meta_tags,
    p.favorite_song,
    p.updated_at
  FROM public.profiles p
  JOIN public.venue_attendances va ON p.id = va.user_id
  GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.encounter_policy, p.reol_type, p.meta_tags, p.favorite_song, p.updated_at
  ORDER BY MIN(va.created_at) ASC;
END;
$$;

-- 権限付与
GRANT EXECUTE ON FUNCTION get_all_attendees() TO anon;
GRANT EXECUTE ON FUNCTION get_all_attendees() TO authenticated;
