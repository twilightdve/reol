-- セットリスト予想投票システム

-- 投票テーブル
CREATE TABLE IF NOT EXISTS setlist_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  song_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, song_name)
);

-- RLS有効化
ALTER TABLE setlist_votes ENABLE ROW LEVEL SECURITY;

-- 誰でも投票を閲覧可能
CREATE POLICY "Anyone can view votes"
ON setlist_votes
FOR SELECT
USING (true);

-- 誰でも投票可能（簡易認証のため）
CREATE POLICY "Anyone can insert votes"
ON setlist_votes
FOR INSERT
WITH CHECK (true);

-- 誰でも自分の投票を削除可能
CREATE POLICY "Anyone can delete their votes"
ON setlist_votes
FOR DELETE
USING (true);

-- 投票数を取得する関数
CREATE OR REPLACE FUNCTION get_setlist_vote_counts()
RETURNS TABLE(
  song_name TEXT,
  vote_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sv.song_name,
    COUNT(*) as vote_count
  FROM public.setlist_votes sv
  GROUP BY sv.song_name
  ORDER BY vote_count DESC, sv.song_name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_setlist_vote_counts() TO anon;
GRANT EXECUTE ON FUNCTION get_setlist_vote_counts() TO authenticated;

-- ユーザーの投票を取得する関数
CREATE OR REPLACE FUNCTION get_user_setlist_votes(user_id_param TEXT)
RETURNS TABLE(
  song_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sv.song_name,
    sv.created_at
  FROM public.setlist_votes sv
  WHERE sv.user_id = user_id_param
  ORDER BY sv.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_setlist_votes(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_user_setlist_votes(TEXT) TO authenticated;

-- updated_at自動更新用のトリガー関数
CREATE OR REPLACE FUNCTION update_setlist_votes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- トリガー作成
DROP TRIGGER IF EXISTS trigger_update_setlist_votes_updated_at ON setlist_votes;
CREATE TRIGGER trigger_update_setlist_votes_updated_at
  BEFORE UPDATE ON setlist_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_setlist_votes_updated_at();
