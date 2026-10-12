/**
 * /articles/ — 読みものの一覧。plan/29・plan/33
 * gatsby-node.ts が記事が1件以上ある時だけ作る(公開記事0件のビルドではページ自体が無い)。
 *
 * 分類はシリーズ+タグ(2026-10-10 ユーザー決定)。
 * - /articles/ はシリーズごとに分けて並べる。/articles/series/<slug>/ はそのシリーズだけ(同じテンプレート)。
 * - タグは ?tag=<タグ> で絞り込む(記事のタグのリンクから)。静的HTMLは全件で、JSが動いた後に絞り込む(JSなしでも全件を読める)。
 *   一覧の上の「タグで絞り込む」ボタン群は置かない(2026-10-11 ユーザー指定)。
 * - 記事ごとのいいね数を表示し、「新着順」「いいねが多い順」で並べ替えられる(2026-10-12 ユーザー指定)。
 *   いいね数は JS が動いた後に Supabase からまとめて読む(静的HTMLは新着順・数なし)。読めない時は数を出さず、いいね順は選べない。
 *   並べ替えは ?sort=likes で共有できる(?tag= と併用可)。
 */
import React, { useEffect, useMemo, useState } from "react";
import { HeadFC, Link, PageProps } from "gatsby";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import { Kicker } from "../components/redesign";
import { buildBreadcrumbList } from "../utils/jsonLd";
import { trackEvent } from "../utils/analytics";
import { formatArticleDate } from "../utils/songArticles/format";
import { ArticleSeries, seriesPath, showSongKicker, tagFilterPath } from "../utils/songArticles/series";
import { fetchArticleLikeCounts } from "../services/articleLikeService";

type IndexEntry = {
  /** 記事ID(いいね数の問い合わせに使う) */
  id: string;
  slug: string;
  title: string;
  songTitle: string;
  versionLabel: string | null;
  summary: string | null;
  /** 表示する作成日 */
  createdAt: string | null;
  publishedAt: string | null;
  seriesSlug: string;
  tags: string[];
  preview: boolean;
};

interface SongArticlesIndexContext {
  articles: IndexEntry[];
  series: ArticleSeries[];
  /** シリーズのページなら、そのシリーズ。/articles/ なら null */
  seriesSlug: string | null;
  noindex: boolean;
}

const DESCRIPTION = "Reolの曲やライヴについての読みもの。";

const ArticleItem: React.FC<{ a: IndexEntry; activeTag: string | null; likes: number | null }> = ({ a, activeTag, likes }) => {
  const date = formatArticleDate(a.createdAt);
  const kicker = [showSongKicker(a.title, a.songTitle) ? a.songTitle : null, a.versionLabel].filter(Boolean).join(" — ");
  return (
    <li>
      <Link
        to={`/articles/${a.slug}/`}
        onClick={() => trackEvent("article_list_click", { category: "navigation", label: a.slug })}
        className="group block pt-6 pb-3"
      >
        {/* 題名にもう曲名が入っている時は曲名を出さない(版の名前だけは残す) */}
        {kicker && (
          <p className="mb-2 text-[11px] font-extrabold tracking-[0.2em] text-bx-blue [overflow-wrap:anywhere]">{kicker}</p>
        )}
        <h3 className="text-[19px] sm:text-[21px] font-extrabold leading-snug text-bx-ink group-hover:text-bx-blue transition-colors [overflow-wrap:anywhere]">
          {a.title}
        </h3>
        {a.summary && <p className="mt-2 text-[14px] leading-relaxed text-bx-ink2 line-clamp-3">{a.summary}</p>}
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-bx-ink3">
          {date && (
            <span>
              <time dateTime={a.createdAt ?? undefined}>{date}</time> 作成
            </span>
          )}
          {likes !== null && (
            <span className="inline-flex items-center gap-1" aria-label={`いいね ${likes}`}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
                <path
                  d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.6 5c2.1 0 3.6 1.2 4.4 2.6h2c.8-1.4 2.3-2.6 4.4-2.6C21 5 23 8.6 21.6 11.8 19.5 16.4 12 21 12 21z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="tabular-nums">{likes}</span>
            </span>
          )}
        </p>
      </Link>
      {a.tags.length > 0 && (
        <ul className="flex flex-wrap gap-x-3 gap-y-1 pb-6 text-[12px]" aria-label="タグ">
          {a.tags.map((t) => (
            <li key={t}>
              <Link
                to={tagFilterPath(t)}
                className={`underline underline-offset-4 ${t === activeTag ? "text-bx-ink font-bold" : "text-bx-ink2 hover:text-bx-blue"}`}
              >
                #{t}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const SongArticlesIndexPage: React.FC<PageProps<object, SongArticlesIndexContext>> = ({
  pageContext,
  location,
}) => {
  const { articles, series, seriesSlug } = pageContext;
  const current = seriesSlug ? series.find((s) => s.slug === seriesSlug) ?? null : null;

  // タグの絞り込みは JS が動いた後だけ(静的HTMLとの食い違いを避ける)
  const [activeTag, setActiveTag] = useState<string | null>(null);
  useEffect(() => {
    const tag = new URLSearchParams(location.search).get("tag");
    setActiveTag(tag && articles.some((a) => a.tags.includes(tag)) ? tag : null);
  }, [location.search, articles]);

  // いいね数(JS が動いた後にまとめて読む)。読めない時は null のまま
  const [likeCounts, setLikeCounts] = useState<Map<string, number> | null>(null);
  useEffect(() => {
    let alive = true;
    fetchArticleLikeCounts(articles.map((a) => a.id))
      .then((m) => alive && setLikeCounts(m))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [articles]);

  // 並べ替え: 新着順(既定。静的HTMLと同じ)/ いいねが多い順(同数なら新着順)
  const [sort, setSort] = useState<"new" | "likes">("new");
  useEffect(() => {
    setSort(new URLSearchParams(location.search).get("sort") === "likes" ? "likes" : "new");
  }, [location.search]);
  const chooseSort = (next: "new" | "likes") => {
    setSort(next);
    trackEvent("article_list_sort", { category: "navigation", label: next });
    // ?sort= を URL に残す(共有・戻る用)。?tag= はそのまま
    const params = new URLSearchParams(window.location.search);
    if (next === "likes") params.set("sort", "likes");
    else params.delete("sort");
    const q = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${q ? `?${q}` : ""}`);
  };
  const sortByLikes = sort === "likes" && likeCounts !== null;

  const visible = useMemo(() => {
    const filtered = activeTag ? articles.filter((a) => a.tags.includes(activeTag)) : articles;
    if (!sortByLikes || !likeCounts) return filtered;
    // Array.prototype.sort は安定なので、同数は元の新着順のまま
    return [...filtered].sort((x, y) => (likeCounts.get(y.id) ?? 0) - (likeCounts.get(x.id) ?? 0));
  }, [articles, activeTag, sortByLikes, likeCounts]);
  const basePath = current ? seriesPath(current.slug) : "/articles/";
  const groups = (current ? [current] : series)
    .map((s) => ({ s, items: visible.filter((a) => a.seriesSlug === s.slug) }))
    .filter((g) => g.items.length > 0);

  return (
    <Layout title={current ? `${current.name}|読みもの` : "読みもの"}>
      <main lang="ja" className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl text-bx-ink">
        <nav aria-label="パンくず" className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-bx-ink3">
          <Link to="/" className="hover:text-bx-blue transition-colors">
            HOME
          </Link>
          <span aria-hidden>/</span>
          {current ? (
            <>
              <Link to="/articles/" className="hover:text-bx-blue transition-colors">
                読みもの
              </Link>
              <span aria-hidden>/</span>
              <span className="text-bx-ink">{current.name}</span>
            </>
          ) : (
            <span className="text-bx-ink">読みもの</span>
          )}
        </nav>
        <header className="mt-6 mb-6">
          <Kicker color="text-bx-blue">{current ? "SERIES" : "READING"}</Kicker>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight">{current ? current.name : "読みもの"}</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-bx-ink2">{current ? current.description : DESCRIPTION}</p>
        </header>

        {/* タグの絞り込み(記事のタグのリンクから ?tag= で来た時だけ)。絞り込みのボタン群は置かない(2026-10-11 ユーザー「タグで絞り込むは不要になった」) */}
        {activeTag && (
          <p className="mb-8 text-[13px] text-bx-ink2" role="status">
            「#{activeTag}」の記事 {visible.length}件
            <Link to={basePath} className="ml-3 underline underline-offset-4 hover:text-bx-blue">
              すべて表示
            </Link>
          </p>
        )}

        {/* 並べ替え。いいね数が読めない時は、いいね順を選べない */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-[12px]" role="group" aria-label="並べ替え">
          <span className="mr-1 font-extrabold tracking-[0.16em] text-bx-ink3">並べ替え</span>
          {(
            [
              ["new", "新着順"],
              ["likes", "いいねが多い順"],
            ] as const
          ).map(([key, label]) => {
            const active = key === "new" ? !sortByLikes : sortByLikes;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                disabled={key === "likes" && likeCounts === null}
                onClick={() => chooseSort(key)}
                className={`rounded-full border px-3 py-1 font-bold transition-colors disabled:opacity-50 ${
                  active ? "border-bx-blue bg-bx-blue text-bx-bg" : "border-bx-line text-bx-ink2 hover:border-bx-blue hover:text-bx-blue"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {groups.map(({ s, items }) => (
          <section key={s.slug} className="mb-12" aria-labelledby={`series-${s.slug}`}>
            {!current && (
              <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`series-${s.slug}`} className="text-[13px] font-extrabold tracking-[0.16em] text-bx-ink">
                  シリーズ「{s.name}」
                </h2>
                <Link to={seriesPath(s.slug)} className="text-[12px] text-bx-ink2 underline underline-offset-4 hover:text-bx-blue">
                  このシリーズだけを見る
                </Link>
              </header>
            )}
            {current && <h2 id={`series-${s.slug}`} className="sr-only">{s.name}の記事</h2>}
            <ul className="divide-y divide-bx-line border-t border-b border-bx-line">
              {items.map((a) => (
                <ArticleItem key={a.slug} a={a} activeTag={activeTag} likes={likeCounts ? likeCounts.get(a.id) ?? 0 : null} />
              ))}
            </ul>
          </section>
        ))}
      </main>
    </Layout>
  );
};

export const Head: HeadFC<object, SongArticlesIndexContext> = ({ pageContext }) => {
  const current = pageContext.seriesSlug ? pageContext.series.find((s) => s.slug === pageContext.seriesSlug) ?? null : null;
  const path = current ? seriesPath(current.slug) : "/articles/";
  return (
    <>
      <SEO
        title={current ? `${current.name}|読みもの` : "読みもの"}
        description={current ? current.description : DESCRIPTION}
        path={path}
        jsonLd={buildBreadcrumbList(
          current
            ? [{ name: "ホーム", path: "/" }, { name: "読みもの", path: "/articles/" }, { name: current.name }]
            : [{ name: "ホーム", path: "/" }, { name: "読みもの" }]
        )}
      />
      {pageContext.noindex && <meta name="robots" content="noindex,nofollow" />}
    </>
  );
};

export default SongArticlesIndexPage;
