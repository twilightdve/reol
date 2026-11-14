/**
 * /articles/<slug>/ — 記録(kind: "record")。ライヴ・遠征・聖地巡礼・イベントの、写真と動画の読みもの。plan/72
 *
 * 楽曲記事(song-article.tsx)と違い、記事ごとのデザインは持たない。どの記録もこの共通のテンプレートで描く。
 * 並びは 題名と出来事の日付 → 本文(文章と写真・動画)→ 関連するページ → いいね・その他の記事・シリーズとタグ。
 * 本文と写真は gatsby-node.ts がビルド時に作ったもの(pageContext.blocks・media)。日本語のみ。
 */
import React from "react";
import { HeadFC, Link, PageProps } from "gatsby";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import { Kicker } from "../components/redesign";
import LinkRows, { LinkRow } from "../components/redesign/LinkRows";
import ArticleDate from "../components/songArticles/ArticleDate";
import ArticleEnd from "../components/songArticles/ArticleEnd";
import RecordBody from "../components/songArticles/RecordBody";
import ScheduledNotice from "../components/songArticles/ScheduledNotice";
import { buildArticle, buildBreadcrumbList } from "../utils/jsonLd";
import { trackEvent } from "../utils/analytics";
import { ARTICLES_FEED_PATH, ARTICLES_FEED_TITLE } from "../utils/songArticles/feed";
import { formatEventDate } from "../utils/songArticles/format";
import type { RecordBlock } from "../utils/songArticles/markdown";
import { seriesPath } from "../utils/songArticles/series";
import type { RecordMediaAsset, RecordRelatedLink } from "../utils/songArticles/types";

/** 記録ページの pageContext。gatsby-node.ts の createPage と対応 */
export interface RecordArticlePageContext {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  series: { slug: string; name: string };
  tags: string[];
  /** 出来事の日付(YYYY-MM-DD)と、複数日にわたる時の最終日 */
  eventDate: string | null;
  eventDateEnd: string | null;
  createdAt: string | null;
  publishedAt: string | null;
  /** 公開後に中身を差し替えた日時(pageContext では updatedAt という名前を使えない) */
  modifiedAt: string | null;
  blocks: RecordBlock[];
  /** 本文の media ブロックが指す写真・動画(公開用の URL と大きさ) */
  media: Record<string, RecordMediaAsset>;
  relatedLinks: RecordRelatedLink[];
  related: { slug: string; title: string; songTitle: string; publishedAt?: string | null; cover?: string | null }[];
  /** 表紙の写真から作った OGP 画像。表紙が無ければ null */
  ogImage: string | null;
  preview: boolean;
  noindex: boolean;
  unlisted: boolean;
  scheduled: boolean;
  builtAt: number;
}

const RecordArticlePage: React.FC<PageProps<object, RecordArticlePageContext>> = ({ pageContext }) => {
  const { id, title, series, eventDate, eventDateEnd, publishedAt, modifiedAt, blocks, media, relatedLinks } = pageContext;
  const eventLabel = formatEventDate(eventDate, eventDateEnd);
  return (
    <Layout title={title}>
      <ScheduledNotice publishedAt={publishedAt} builtAt={pageContext.builtAt} unlisted={pageContext.unlisted} />
      <main lang="ja" className="container mx-auto px-4 sm:px-6 py-8 max-w-[42rem] text-bx-ink">
        <nav aria-label="パンくず" className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold tracking-wide text-bx-ink3">
          <Link to="/" className="hover:text-bx-blue transition-colors">
            HOME
          </Link>
          <span aria-hidden>/</span>
          <Link to="/articles/" className="hover:text-bx-blue transition-colors">
            読みもの
          </Link>
          <span aria-hidden>/</span>
          <Link to={seriesPath(series.slug)} className="hover:text-bx-blue transition-colors">
            {series.name}
          </Link>
        </nav>

        <header className="mt-6 mb-2">
          <Kicker color="text-bx-blue">{series.name}</Kicker>
          <h1 className="mt-3 text-[28px] sm:text-[36px] font-extrabold leading-[1.35] text-bx-ink [overflow-wrap:anywhere]">
            {title}
          </h1>
          {eventLabel && (
            <p className="mt-4 text-[14px] font-bold text-bx-ink2">
              <time dateTime={eventDate ?? undefined}>{eventLabel}</time>の記録
            </p>
          )}
          <p className={`${eventLabel ? "mt-1" : "mt-4"} text-[12px] text-bx-ink3`}>
            <ArticleDate publishedAt={publishedAt} updatedAt={modifiedAt} />
          </p>
        </header>

        <article>
          <RecordBody blocks={blocks} media={media} />
        </article>

        <footer className="mt-14 border-t border-bx-line pt-8">
          {relatedLinks.length > 0 && (
            <section aria-labelledby="record-links">
              <h2 id="record-links" className="text-[11px] font-extrabold tracking-[0.2em] text-bx-ink3">
                関連するページ
              </h2>
              <LinkRows twoColumns={false} className="mt-3">
                {relatedLinks.map((l) => (
                  <LinkRow
                    key={l.href}
                    {...(l.href.startsWith("/") ? { to: l.href } : { href: l.href })}
                    // 投稿の書き出し(quote)がある時は、それを題に1行で出し、誰のいつの投稿か(と、どの段の出典か)を下に添える
                    title={l.quote ?? l.label}
                    desc={l.quote ? [l.label, l.note].filter(Boolean).join("・") : l.note ?? undefined}
                    oneLine={Boolean(l.quote)}
                    onClick={() => trackEvent("article_related_link_click", { category: "navigation", label: `${id}->${l.href}` })}
                  />
                ))}
              </LinkRows>
            </section>
          )}
          <p className="mt-8 text-[13px]">
            <Link to="/articles/" className="text-bx-ink3 hover:text-bx-blue transition-colors">
              ← 読みもの一覧へ
            </Link>
          </p>
        </footer>
      </main>
      <ArticleEnd articleId={id} series={series} tags={pageContext.tags} related={pageContext.related ?? []} builtAt={pageContext.builtAt} />
    </Layout>
  );
};

export const Head: HeadFC<object, RecordArticlePageContext> = ({ pageContext }) => {
  const { slug, title, series, description, createdAt, publishedAt, modifiedAt, noindex } = pageContext;
  const path = `/articles/${slug}/`;
  const jsonLd: object[] = [
    buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "読みもの", path: "/articles/" },
      { name: series.name, path: seriesPath(series.slug) },
      { name: title },
    ]),
  ];
  // 構造化データは画面と同じ値で、公開日が確定した公開記事だけに出す
  if (!noindex && publishedAt) {
    jsonLd.push(
      buildArticle({
        headline: title,
        path,
        description,
        datePublished: publishedAt,
        dateModified: modifiedAt,
        dateCreated: createdAt,
        keywords: pageContext.tags,
      })
    );
  }
  return (
    <>
      <link rel="alternate" type="application/rss+xml" title={ARTICLES_FEED_TITLE} href={ARTICLES_FEED_PATH} />
      <SEO
        title={title}
        description={description ?? undefined}
        path={path}
        type="article"
        image={pageContext.ogImage ? `https://reol.twilightea.com${pageContext.ogImage}` : undefined}
        jsonLd={jsonLd}
      />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
    </>
  );
};

export default RecordArticlePage;
