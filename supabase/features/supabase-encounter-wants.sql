-- エンカしたい機能のデータベース設定
-- 参加者同士の「エンカしたい」意思表示を管理

-- ============================================================
-- 1. encounter_wants テーブル作成
-- ============================================================
CREATE TABLE IF NOT EXISTS encounter_wants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, target_user_id)
);

-- 自分自身にエンカしたいはできないようにする
ALTER TABLE encounter_wants
ADD CONSTRAINT encounter_wants_no_self CHECK (user_id != target_user_id);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_encounter_wants_user ON encounter_wants(user_id);
CREATE INDEX IF NOT EXISTS idx_encounter_wants_target ON encounter_wants(target_user_id);

-- ============================================================
-- 2. RLS ポリシー
-- ============================================================
ALTER TABLE encounter_wants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view encounter wants"
  ON encounter_wants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert encounter wants"
  ON encounter_wants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete encounter wants"
  ON encounter_wants FOR DELETE
  USING (true);

-- ============================================================
-- 3. RPC: 特定ユーザーのエンカしたいリストを取得
-- ============================================================
CREATE OR REPLACE FUNCTION get_encounter_wants(target_user TEXT)
RETURNS TABLE(target_user_id TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT ew.target_user_id
  FROM public.encounter_wants ew
  WHERE ew.user_id = target_user;
END;
$$;

GRANT EXECUTE ON FUNCTION get_encounter_wants(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_encounter_wants(TEXT) TO authenticated;

-- ============================================================
-- 4. RPC: 全ユーザーの「エンカしたい」された数を取得
-- ============================================================
CREATE OR REPLACE FUNCTION get_encounter_want_counts()
RETURNS TABLE(target_user_id TEXT, want_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT ew.target_user_id, COUNT(*) as want_count
  FROM public.encounter_wants ew
  GROUP BY ew.target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_encounter_want_counts() TO anon;
GRANT EXECUTE ON FUNCTION get_encounter_want_counts() TO authenticated;
