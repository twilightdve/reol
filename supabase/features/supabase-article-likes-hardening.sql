-- 楽曲記事のいいね: 書き込みの上限を強める(2026-10-12。plan/36 の追記)
--
-- いいねはログイン不要で、ブラウザごとの ID はクライアントが作るため、ID を作り替え続ければいくらでも書き込める。
-- 件数の水増しは完全には防げない(仕様として受け入れ済み)が、DB の容量を食いつぶされないよう、全体の書き込み量に上限を設ける。
--   - 記事 ID の形を、今の記事 ID の形(reol-<種類>-<番号>)に絞る(存在しない ID の行を作りにくくする)
--   - 全体で 1分あたり 60件・1日あたり 2000件まで(ふだんの規模より十分に多い。超えたら一時的に押せなくなる)
--   - ブラウザごとの 10分あたり 30件の制限はそのまま
-- 取り消し(削除)は制限しない。supabase-article-likes.sql(と supabase-article-like-counts.sql)の後に実行する。何度実行しても同じ結果になる。

BEGIN;

-- 全体の書き込み量を数えるための索引
CREATE INDEX IF NOT EXISTS article_likes_created_idx ON public.article_likes (created_at);

CREATE OR REPLACE FUNCTION public.set_article_like(p_article_id TEXT, p_client_id UUID, p_like BOOLEAN)
RETURNS TABLE(like_count BIGINT, liked BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  recent INTEGER;
BEGIN
  IF p_article_id IS NULL OR p_article_id !~ '^reol-[a-z]{1,16}-[0-9]{1,4}$' OR p_client_id IS NULL OR p_like IS NULL THEN
    RAISE EXCEPTION 'invalid article like request';
  END IF;

  IF p_like THEN
    -- 同じブラウザからは 10分間に 30件まで
    SELECT COUNT(*) INTO recent
      FROM public.article_likes l
     WHERE l.client_id = p_client_id
       AND l.created_at > NOW() - INTERVAL '10 minutes';
    IF recent >= 30 THEN
      RAISE EXCEPTION 'too many likes';
    END IF;
    -- 全体で 1分間に 60件まで
    SELECT COUNT(*) INTO recent
      FROM public.article_likes l
     WHERE l.created_at > NOW() - INTERVAL '1 minute';
    IF recent >= 60 THEN
      RAISE EXCEPTION 'too many likes';
    END IF;
    -- 全体で 1日に 2000件まで
    SELECT COUNT(*) INTO recent
      FROM public.article_likes l
     WHERE l.created_at > NOW() - INTERVAL '1 day';
    IF recent >= 2000 THEN
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

COMMIT;
