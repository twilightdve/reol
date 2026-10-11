-- 楽曲記事(読みもの)のいいね(2026-10-11)
--
-- ログイン不要で誰でも押せる(ユーザー決定)。1つのブラウザにつき1記事1回で、押した人は取り消せる。
-- ブラウザごとの ID はクライアントが作る無作為な UUID(localStorage に保存)。
-- テーブルへの直接の読み書きは許さず(RLS 有効・ポリシーなし)、読み書きはすべて下の関数を通す。
-- 誰がいつ押したかは外から読めない(関数が返すのは、いいね数と「このブラウザが押したか」だけ)。

CREATE TABLE IF NOT EXISTS public.article_likes (
  article_id TEXT NOT NULL CHECK (article_id ~ '^[a-z0-9-]{1,64}$'),
  client_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (article_id, client_id)
);

-- 同じブラウザの短時間の連打を数えるため
CREATE INDEX IF NOT EXISTS article_likes_client_created_idx
  ON public.article_likes (client_id, created_at);

ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.article_likes FROM anon, authenticated;

-- いいね数と、このブラウザが押したか
CREATE OR REPLACE FUNCTION public.get_article_likes(p_article_id TEXT, p_client_id UUID DEFAULT NULL)
RETURNS TABLE(like_count BIGINT, liked BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    (SELECT COUNT(*) FROM public.article_likes l WHERE l.article_id = p_article_id),
    (p_client_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.article_likes l WHERE l.article_id = p_article_id AND l.client_id = p_client_id
    ));
$$;

-- いいねする(p_like = true)/取り消す(false)。結果のいいね数と状態を返す。
-- 同じブラウザからは 10 分間に 30 件まで(連打の抑止。ブラウザの ID を作り直せば回避できるので、厳密な不正防止ではない)
CREATE OR REPLACE FUNCTION public.set_article_like(p_article_id TEXT, p_client_id UUID, p_like BOOLEAN)
RETURNS TABLE(like_count BIGINT, liked BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  recent INTEGER;
BEGIN
  IF p_article_id IS NULL OR p_article_id !~ '^[a-z0-9-]{1,64}$' OR p_client_id IS NULL THEN
    RAISE EXCEPTION 'invalid article like request';
  END IF;

  IF p_like THEN
    SELECT COUNT(*) INTO recent
      FROM public.article_likes l
     WHERE l.client_id = p_client_id
       AND l.created_at > NOW() - INTERVAL '10 minutes';
    IF recent >= 30 THEN
      RAISE EXCEPTION 'too many likes';
    END IF;
    INSERT INTO public.article_likes (article_id, client_id)
    VALUES (p_article_id, p_client_id)
    ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.article_likes l
     WHERE l.article_id = p_article_id AND l.client_id = p_client_id;
  END IF;

  RETURN QUERY SELECT * FROM public.get_article_likes(p_article_id, p_client_id);
END;
$$;

REVOKE ALL ON FUNCTION public.get_article_likes(TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_article_like(TEXT, UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_article_likes(TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_article_like(TEXT, UUID, BOOLEAN) TO anon, authenticated;
