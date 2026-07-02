-- チェックイン機能のデータベース追加
-- 当日会場にいることを示すチェックイン機能

-- ============================================================
-- 1. venue_checkins テーブルの作成
-- ============================================================
CREATE TABLE IF NOT EXISTS venue_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  venue_id TEXT NOT NULL,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);

-- RLS 有効化
ALTER TABLE venue_checkins ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "venue_checkins_select_all" ON venue_checkins
  FOR SELECT USING (true);

-- 挿入可能（簡易認証のため）
CREATE POLICY "venue_checkins_insert_own" ON venue_checkins
  FOR INSERT WITH CHECK (true);

-- 削除可能（簡易認証のため）
CREATE POLICY "venue_checkins_delete_own" ON venue_checkins
  FOR DELETE USING (true);

-- ============================================================
-- 2. チェックインユーザー取得 RPC
-- ============================================================
CREATE OR REPLACE FUNCTION get_venue_checkins(target_venue_id TEXT)
RETURNS TABLE(
  user_id TEXT,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  checked_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vc.user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    vc.checked_in_at
  FROM public.venue_checkins vc
  JOIN public.profiles p ON vc.user_id = p.id
  WHERE vc.venue_id = target_venue_id
  ORDER BY vc.checked_in_at ASC;
END;
$$;

-- 権限付与
GRANT EXECUTE ON FUNCTION get_venue_checkins(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_venue_checkins(TEXT) TO authenticated;
