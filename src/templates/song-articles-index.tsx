/**
 * /articles/ — 読みものの一覧。plan/29・plan/33
 * gatsby-node.ts が記事が1件以上ある時だけ作る(公開記事0件のビルドではページ自体が無い)。
 *
 * 分類はシリーズ+タグ(2026-10-10 ユーザー決定)。
 * - /articles/ はシリーズごとに分けて並べる。/articles/series/<slug>/ はそのシリーズだけ(同じテンプレート)。
 * - タグは ?tag=<タグ> で絞り込む。静的HTMLは全件で、JSが動いた後に絞り込む(JSなしでも全件を読める)。
 */
import React, { useEffect, useMemo, useState } from "react";
import { HeadFC, Link, PageProps } from "gatsby";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import { Kicker } from "../components/redesign";
import { buildBreadcrumbList } from "../utils/jsonLd";
import { trackEvent } from "../utils/analytics";
import { formatArticleDate } from "../utils/songArticles/format";
import { ArticleSeries, seriesPath, tagFilterPath } from "../utils/songArticles/series";

type IndexEntry = {
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

const DESCRIPTION = "Reolの曲やライヴについての読みもの。シリーズごとに、またタグで絞り込んで読める。";

/** タグを記事数の多い順(同数なら名前順)に */
const tagCounts = (articles: IndexEntry[]): [string, number][] => {
  const m = new Map<string, number>();
  for (const a of articles) for (const t of a.tags) m.set(t, (m.get(t) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"));
};

const ArticleItem: React.FC<{ a: IndexEntry; activeTag: string | null }> = ({ a, activeTag }) => {
  const date = formatArticleDate(a.createdAt);
  return (
    <li>
      <Link
        to={`/articles/${a.slug}/`}
        onClick={() => trackEvent("article_list_click", { category: "navigation", label: a.slug })}
        className="group block pt-6 pb-3"
      >
        <p className="text-[11px] font-extrabold tracking-[0.2em] text-bx-blue [overflow-wrap:anywhere]">
          {a.songTitle}
          {a.versionLabel ? ` — ${a.versionLabel}` : ""}
        </p>
        <h3 className="mt-2 text-[19px] sm:text-[21px] font-extrabold leading-snug text-bx-ink group-hover:text-bx-blue transition-colors [overflow-wrap:anywhere]">
          {a.title}
        </h3>
        {a.summary && <p className="mt-2 text-[14px] leading-relaxed text-bx-ink2 line-clamp-3">{a.summary}</p>}
        <p className="mt-2 text-[12px] text-bx-ink3">
          {a.preview && "プレビュー(未公開)"}
          {a.preview && date && " ・ "}
          {date && (
            <>
              <time dateTime={a.createdAt ?? undefined}>{date}</time> 作成
            </>
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

  const visible = useMemo(
    () => (activeTag ? articles.filter((a) => a.tags.includes(activeTag)) : articles),
    [articles, activeTag]
  );
  const tags = useMemo(() => tagCounts(articles), [articles]);
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

        {tags.length > 0 && (
          <nav aria-label="タグで絞り込む" className="mb-8">
            <p className="text-[11px] font-extrabold tracking-[0.16em] text-bx-ink3">タグで絞り込む</p>
            <ul className="mt-2 flex flex-wrap gap-2 text-[13px]">
              <li>
                <Link
                  to={basePath}
                  aria-current={activeTag === null ? "true" : undefined}
                  className={`inline-block rounded-full border px-3 py-1 ${
                    activeTag === null ? "border-bx-ink bg-bx-ink text-bx-bg font-bold" : "border-bx-line text-bx-ink2 hover:border-bx-blue hover:text-bx-blue"
                  }`}
                >
                  すべて
                </Link>
              </li>
              {tags.map(([t, n]) => (
                <li key={t}>
                  <Link
                    to={`${basePath}?tag=${encodeURIComponent(t)}`}
                    aria-current={t === activeTag ? "true" : undefined}
                    onClick={() => trackEvent("article_tag_filter", { category: "navigation", label: t })}
                    className={`inline-block rounded-full border px-3 py-1 ${
                      t === activeTag ? "border-bx-ink bg-bx-ink text-bx-bg font-bold" : "border-bx-line text-bx-ink2 hover:border-bx-blue hover:text-bx-blue"
                    }`}
                  >
                    #{t}
                    <span className="ml-1 text-[11px] opacity-70">{n}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {activeTag && (
              <p className="mt-3 text-[13px] text-bx-ink2" role="status">
                「#{activeTag}」の記事 {visible.length}件
              </p>
            )}
          </nav>
        )}

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
                <ArticleItem key={a.slug} a={a} activeTag={activeTag} />
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
