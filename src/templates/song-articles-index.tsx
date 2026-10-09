/**
 * /articles/ — 楽曲記事(読みもの)の一覧。plan/29
 * gatsby-node.ts が記事が1件以上ある時だけ作る(公開記事0件のビルドではページ自体が無い)。
 * 初期は新着順のみ。検索・絞り込み・ページ分割は記事数が増えてから(plan/29 6章)。
 */
import React from "react";
import { HeadFC, Link, PageProps } from "gatsby";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import { Kicker } from "../components/redesign";
import { buildBreadcrumbList } from "../utils/jsonLd";
import { trackEvent } from "../utils/analytics";
import { formatArticleDate } from "../utils/songArticles/format";

type IndexEntry = {
  slug: string;
  title: string;
  songTitle: string;
  versionLabel: string | null;
  summary: string | null;
  publishedAt: string | null;
  preview: boolean;
};

interface SongArticlesIndexContext {
  articles: IndexEntry[];
  noindex: boolean;
}

const DESCRIPTION = "Reolの曲を一曲ずつ、聴きどころやライヴでの体験とあわせて読む短い記事。";

const SongArticlesIndexPage: React.FC<PageProps<object, SongArticlesIndexContext>> = ({
  pageContext,
}) => {
  const { articles } = pageContext;
  return (
    <Layout title="読みもの">
      <main lang="ja" className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl text-bx-ink">
        <nav aria-label="パンくず" className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-bx-ink3">
          <Link to="/" className="hover:text-bx-blue transition-colors">
            HOME
          </Link>
          <span aria-hidden>/</span>
          <span className="text-bx-ink">読みもの</span>
        </nav>
        <header className="mt-6 mb-8">
          <Kicker color="text-bx-blue">READING</Kicker>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight">読みもの</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-bx-ink2">{DESCRIPTION}</p>
        </header>

        <ul className="divide-y divide-bx-line border-t border-b border-bx-line">
          {articles.map((a) => {
            const date = formatArticleDate(a.publishedAt);
            return (
              <li key={a.slug}>
                <Link
                  to={`/articles/${a.slug}/`}
                  onClick={() =>
                    trackEvent("article_list_click", { category: "navigation", label: a.slug })
                  }
                  className="group block py-6"
                >
                  <p className="text-[11px] font-extrabold tracking-[0.2em] text-bx-blue [overflow-wrap:anywhere]">
                    {a.songTitle}
                    {a.versionLabel ? ` — ${a.versionLabel}` : ""}
                  </p>
                  <h2 className="mt-2 text-[19px] sm:text-[21px] font-extrabold leading-snug text-bx-ink group-hover:text-bx-blue transition-colors [overflow-wrap:anywhere]">
                    {a.title}
                  </h2>
                  {a.summary && (
                    <p className="mt-2 text-[14px] leading-relaxed text-bx-ink2 line-clamp-3">{a.summary}</p>
                  )}
                  <p className="mt-2 text-[12px] text-bx-ink3">
                    {a.preview ? "プレビュー(未公開)" : date ? <time dateTime={a.publishedAt ?? undefined}>{date}</time> : null}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </Layout>
  );
};

export const Head: HeadFC<object, SongArticlesIndexContext> = ({ pageContext }) => (
  <>
    <SEO
      title="読みもの"
      description={DESCRIPTION}
      path="/articles/"
      jsonLd={buildBreadcrumbList([{ name: "ホーム", path: "/" }, { name: "読みもの" }])}
    />
    {pageContext.noindex && <meta name="robots" content="noindex,nofollow" />}
  </>
);

export default SongArticlesIndexPage;
