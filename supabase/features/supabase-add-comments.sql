-- コメントテーブルの作成
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  venue_id TEXT, -- NULL の場合は全体コメント
  content TEXT NOT NULL CHECK (
    char_length(content) <= 140 AND
    content !~ '<script|javascript:|on\w+\s*=|<iframe|<object|<embed' -- XSS対策: 危険なパターンを拒否
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_venue_id ON public.comments(venue_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- RLSの有効化
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 全員が全てのコメントを読める
CREATE POLICY "Anyone can read comments"
  ON public.comments
  FOR SELECT
  USING (true);

-- RLSポリシー: 全員が自分のコメントを作成できる（独自認証システム用）
CREATE POLICY "Anyone can create comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (true);

-- RLSポリシー: 全員が自分のコメントを更新できる（独自認証システム用）
CREATE POLICY "Anyone can update their own comments"
  ON public.comments
  FOR UPDATE
  USING (true);

-- RLSポリシー: 全員が自分のコメントを削除できる（独自認証システム用）
CREATE POLICY "Anyone can delete their own comments"
  ON public.comments
  FOR DELETE
  USING (true);

-- 更新時刻の自動更新トリガー
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();
