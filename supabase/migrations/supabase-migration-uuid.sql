-- =====================================================
-- Reol サイト：整数ID → UUIDv7 移行用 Supabase マイグレーション
-- =====================================================
-- このスクリプトは「クリーンに切り替える」前提で、
-- setlist_votes テーブルの song_name (TEXT) を song_uuid (TEXT, UUIDv7) に
-- 置き換えます。
--
-- 注意: 既存の投票データはユニーク制約のキーが変わるため、
-- スプレッドシート側で UUID が確定したあと、必要なら別途
-- 「song_name → song_uuid」の bulk update を行ってください
-- （末尾に bulk update のテンプレートを記載）。
--
-- 実行手順:
--   1. スプレッドシートに UUID 列を付与（GAS スクリプト実行）
--   2. このマイグレーションを Supabase SQL Editor で実行
--   3. 必要なら 末尾のデータ移行ブロックを編集して実行
-- =====================================================

BEGIN;

-- ---------- 既存の RPC を破棄 ----------
DROP FUNCTION IF EXISTS get_setlist_vote_counts();
DROP FUNCTION IF EXISTS get_user_setlist_votes(TEXT);

-- ---------- 既存トリガー削除（カラム入れ替えのため）----------
DROP TRIGGER IF EXISTS trigger_update_setlist_votes_updated_at ON setlist_votes;

-- ---------- 列追加: song_uuid ----------
ALTER TABLE setlist_votes
  ADD COLUMN IF NOT EXISTS song_uuid TEXT;

-- ---------- データ移行ブロック（手動編集）----------
-- スプレッドシートで song.uuid を確定したあと、以下のテンプレートを
-- 編集して実行してください。例:
--
-- UPDATE setlist_votes SET song_uuid = '0192aabb-...' WHERE song_name = '第六感';
-- UPDATE setlist_votes SET song_uuid = '0192aabc-...' WHERE song_name = 'No title';
--
-- もしくは song_name → song_uuid のマッピングテーブルを一時作成して JOIN UPDATE:
--   CREATE TEMP TABLE _name_to_uuid (song_name TEXT PRIMARY KEY, song_uuid TEXT);
--   INSERT INTO _name_to_uuid VALUES ('第六感', '0192aabb-...'), ...;
--   UPDATE setlist_votes sv SET song_uuid = m.song_uuid
--     FROM _name_to_uuid m WHERE sv.song_name = m.song_name;
--
-- ---------- マッピングできなかった行の削除 ----------
-- （UUIDが解決できなかった古い song_name は捨てる方針の場合）
DELETE FROM setlist_votes WHERE song_uuid IS NULL;

-- ---------- 制約・列入れ替え ----------
ALTER TABLE setlist_votes
  ALTER COLUMN song_uuid SET NOT NULL;

ALTER TABLE setlist_votes
  DROP CONSTRAINT IF EXISTS setlist_votes_user_id_song_name_key;

ALTER TABLE setlist_votes
  ADD CONSTRAINT setlist_votes_user_id_song_uuid_key UNIQUE (user_id, song_uuid);

ALTER TABLE setlist_votes
  DROP COLUMN IF EXISTS song_name;

-- ---------- 新 RPC: 投票数集計 ----------
CREATE OR REPLACE FUNCTION get_setlist_vote_counts()
RETURNS TABLE(
  song_uuid TEXT,
  vote_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sv.song_uuid,
    COUNT(*) AS vote_count
  FROM public.setlist_votes sv
  GROUP BY sv.song_uuid
  ORDER BY vote_count DESC, sv.song_uuid ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_setlist_vote_counts() TO anon;
GRANT EXECUTE ON FUNCTION get_setlist_vote_counts() TO authenticated;

-- ---------- 新 RPC: ユーザーの投票 ----------
CREATE OR REPLACE FUNCTION get_user_setlist_votes(user_id_param TEXT)
RETURNS TABLE(
  song_uuid TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sv.song_uuid,
    sv.created_at
  FROM public.setlist_votes sv
  WHERE sv.user_id = user_id_param
  ORDER BY sv.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_setlist_votes(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_user_setlist_votes(TEXT) TO authenticated;

-- ---------- updated_at トリガー再作成 ----------
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

CREATE TRIGGER trigger_update_setlist_votes_updated_at
  BEFORE UPDATE ON setlist_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_setlist_votes_updated_at();

COMMIT;
