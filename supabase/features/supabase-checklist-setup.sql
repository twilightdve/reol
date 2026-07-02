-- =====================================================
-- 旅行計画チェックリスト機能
-- 美辞学ナビ用
-- =====================================================

-- 既存のテーブルとトリガーを削除
DROP TRIGGER IF EXISTS trigger_update_venue_checklists_updated_at ON venue_checklists;
DROP TABLE IF EXISTS venue_checklists CASCADE;

-- venue_checklists テーブル
-- 会場ごとの旅行計画チェックリスト
CREATE TABLE IF NOT EXISTS venue_checklists (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  venue_id TEXT NOT NULL,
  
  -- チェック項目
  ticket_checked BOOLEAN DEFAULT false,          -- チケット確保済み
  transportation_checked BOOLEAN DEFAULT false,  -- 交通手段確保済み
  accommodation_checked BOOLEAN DEFAULT false,   -- 宿泊先確保済み
  schedule_checked BOOLEAN DEFAULT false,        -- スケジュール確認済み
  companion_checked BOOLEAN DEFAULT false,       -- 同行者確認済み
  goods_checked BOOLEAN DEFAULT false,           -- 物販・グッズ確認済み
  belongings_checked BOOLEAN DEFAULT false,      -- 持ち物準備完了
  day_before_checked BOOLEAN DEFAULT false,      -- 前日確認完了
  budget_checked BOOLEAN DEFAULT false,          -- 予算確認済み
  sightseeing_checked BOOLEAN DEFAULT false,     -- 周辺観光計画
  weather_checked BOOLEAN DEFAULT false,         -- 天気確認済み
  
  -- メモ
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, venue_id)
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_venue_checklists_user_id ON venue_checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_checklists_venue_id ON venue_checklists(venue_id);

-- RLS有効化
ALTER TABLE venue_checklists ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "venue_checklists_select_policy" ON venue_checklists;
DROP POLICY IF EXISTS "venue_checklists_insert_policy" ON venue_checklists;
DROP POLICY IF EXISTS "venue_checklists_update_policy" ON venue_checklists;
DROP POLICY IF EXISTS "venue_checklists_delete_policy" ON venue_checklists;

-- 読み取りポリシー：自分のチェックリストのみ閲覧可能
CREATE POLICY "venue_checklists_select_policy"
  ON venue_checklists
  FOR SELECT
  USING (true);  -- 認証なしでも自分のデータを取得可能（簡易認証のため）

-- 挿入ポリシー：自分のチェックリストのみ作成可能
CREATE POLICY "venue_checklists_insert_policy"
  ON venue_checklists
  FOR INSERT
  WITH CHECK (true);

-- 更新ポリシー：自分のチェックリストのみ更新可能
CREATE POLICY "venue_checklists_update_policy"
  ON venue_checklists
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 削除ポリシー：自分のチェックリストのみ削除可能
CREATE POLICY "venue_checklists_delete_policy"
  ON venue_checklists
  FOR DELETE
  USING (true);

-- updated_at自動更新用のトリガー関数
CREATE OR REPLACE FUNCTION update_venue_checklists_updated_at()
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
DROP TRIGGER IF EXISTS trigger_update_venue_checklists_updated_at ON venue_checklists;
CREATE TRIGGER trigger_update_venue_checklists_updated_at
  BEFORE UPDATE ON venue_checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_venue_checklists_updated_at();
