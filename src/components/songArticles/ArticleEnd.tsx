import React, { useEffect, useState } from "react";
import { Link } from "gatsby";
import { trackEvent } from "../../utils/analytics";
import { seriesPath, showSongKicker, tagFilterPath } from "../../utils/songArticles/series";
import { ArticleLikeState, fetchArticleLikes, setArticleLike } from "../../services/articleLikeService";

/**
 * 記事ページの末尾(記事別デザインの外・下に、サイト共通の配色で置く)。
 * いいねボタン → その他の記事(最大3本)→ シリーズとタグ。2026-10-11
 * 見出しは「関連記事」ではなく「その他の記事」(2026-10-11 ユーザー指定: 何が関連か分かりにくく、記事数も少ないため)
 */

/** いいねボタン。数は Supabase から読む(読み込めない時は数を出さず、押せない) */
const LikeButton: React.FC<{ articleId: string }> = ({ articleId }) => {
  const [state, setState] = useState<ArticleLikeState | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchArticleLikes(articleId)
      .then((s) => alive && setState(s))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [articleId]);

  const toggle = async () => {
    if (!state || busy) return;
    const next = !state.liked;
    // 先に画面を変え、失敗したら戻す
    const before = state;
    setState({ liked: next, count: Math.max(0, state.count + (next ? 1 : -1)) });
    setBusy(true);
    try {
      const s = await setArticleLike(articleId, next);
      if (s) setState(s);
      setFailed(false);
      trackEvent(next ? "article_like" : "article_unlike", { category: "engagement", label: articleId });
    } catch {
      setState(before);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const liked = state?.liked ?? false;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={!state || busy}
        aria-pressed={liked}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[14px] font-bold transition-colors disabled:opacity-60 ${
          liked
            ? "border-bx-yellow bg-bx-yellow text-bx-bg"
            : "border-bx-line text-bx-ink hover:border-bx-yellow hover:text-bx-yellow"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.6 5c2.1 0 3.6 1.2 4.4 2.6h2c.8-1.4 2.3-2.6 4.4-2.6C21 5 23 8.6 21.6 11.8 19.5 16.4 12 21 12 21z"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        {liked ? "いいね済み" : "いいね"}
        {state && <span className="tabular-nums">{state.count}</span>}
      </button>
      {failed && (
        <p className="text-[12px] text-bx-ink3" role="status">
          いいねを読み込めませんでした。時間をおいてもう一度お試しください。
        </p>
      )}
    </div>
  );
};

const ArticleEnd: React.FC<{
  articleId: string;
  series: { slug: string; name: string };
  tags: string[];
  related: { slug: string; title: string; songTitle: string }[];
}> = ({ articleId, series, tags, related }) => (
  <div className="border-t border-bx-line bg-bx-bg text-bx-ink">
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <LikeButton articleId={articleId} />

      {related.length > 0 && (
        <section aria-labelledby="article-others" className="mt-10">
          <h2 id="article-others" className="text-[11px] font-extrabold tracking-[0.2em] text-bx-ink3">
            その他の記事
          </h2>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  to={`/articles/${r.slug}/`}
                  onClick={() => trackEvent("article_related_click", { category: "navigation", label: `${articleId}->${r.slug}` })}
                  className="group block h-full rounded-lg border border-bx-line p-4 hover:border-bx-yellow transition-colors"
                >
                  {showSongKicker(r.title, r.songTitle) && (
                    <p className="mb-2 text-[10px] font-extrabold tracking-[0.2em] text-bx-yellow [overflow-wrap:anywhere]">{r.songTitle}</p>
                  )}
                  <p className="text-[14px] font-bold leading-snug text-bx-ink group-hover:text-bx-yellow [overflow-wrap:anywhere]">
                    {r.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="この記事の分類" className="mt-10 text-[13px]">
        <p>
          <span className="mr-2 text-[11px] font-extrabold tracking-[0.16em] text-bx-ink3">シリーズ</span>
          <Link
            to={seriesPath(series.slug)}
            onClick={() => trackEvent("article_series_click", { category: "navigation", label: articleId })}
            className="font-bold underline underline-offset-4 hover:text-bx-blue"
          >
            {series.name}
          </Link>
        </p>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[11px] font-extrabold tracking-[0.16em] text-bx-ink3">タグ</span>
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {tags.map((t) => (
                <li key={t}>
                  <Link
                    to={tagFilterPath(t)}
                    onClick={() => trackEvent("article_tag_click", { category: "navigation", label: t })}
                    className="text-bx-ink2 underline underline-offset-4 hover:text-bx-blue"
                  >
                    #{t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </div>
  </div>
);

export default ArticleEnd;
