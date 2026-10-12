-- 読みもの一覧のいいね数(2026-10-12)
--
-- 一覧ページで、記事ごとのいいね数をまとめて1回で返す(記事ごとに get_article_likes を呼ばないため)。
-- 返すのは数だけ(誰が押したかは返さない)。テーブル article_likes(supabase-article-likes.sql)が前提。
-- 何度実行しても同じ結果になる。

CREATE OR REPLACE FUNCTION public.get_article_like_counts(p_article_ids TEXT[])
RETURNS TABLE(article_id TEXT, like_count BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 一度に問い合わせられる記事は200本まで。記事IDの形も確かめる
  IF p_article_ids IS NULL OR cardinality(p_article_ids) > 200 THEN
    RAISE EXCEPTION 'invalid article id list';
  END IF;
  RETURN QUERY
  SELECT ids.id, COUNT(l.client_id)
  FROM unnest(p_article_ids) AS ids(id)
  LEFT JOIN public.article_likes l ON l.article_id = ids.id
  WHERE ids.id ~ '^[a-z0-9-]{1,64}$'
  GROUP BY ids.id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_article_like_counts(TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_article_like_counts(TEXT[]) TO anon, authenticated;
