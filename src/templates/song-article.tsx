/**
 * /articles/<slug>/ — 楽曲記事(読みもの)。plan/29
 *
 * 本文は gatsby-node.ts がビルド時に掲載用Markdownから作った描画用ツリー(pageContext.blocks)。
 * 記事は日本語のみ(多言語ページは作らない)。プレビュー記事(ARTICLES_PREVIEW=1)は noindex。
 * 楽曲記事は記事ごとの独自デザインが要件(plan/29 9章)。登録された記事別デザイン(designs/)が
 * 本文の版と一致していればそれで描き、無ければ共通の骨格(このファイルの既定の組版)で描く。
 */
import React from "react";
import { HeadFC, Link, PageProps } from "gatsby";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import { Kicker } from "../components/redesign";
import ArticleDate from "../components/songArticles/ArticleDate";
import ArticleTaxonomy from "../components/songArticles/ArticleTaxonomy";
import ArticleBody from "../components/songArticles/ArticleBody";
import { buildArticle, buildBreadcrumbList } from "../utils/jsonLd";
import { trackEvent } from "../utils/analytics";
import type { SongArticlePageContext } from "../components/songArticles/designs/types";
import { SONG_ARTICLE_DESIGNS } from "../components/songArticles/designs";

export type { SongArticlePageContext };

const SongArticlePage: React.FC<PageProps<object, SongArticlePageContext>> = ({ pageContext }) => {
  const {
    id,
    title,
    songTitle,
    versionLabel,
    createdAt,
    updatedAt,
    blocks,
    leadMedia,
    songPages,
    preview,
  } = pageContext;
  const Design = pageContext.designId ? SONG_ARTICLE_DESIGNS[pageContext.designId] : undefined;
  if (Design) {
    return (
      <Layout title={title}>
        <Design {...pageContext} />
        <ArticleTaxonomy articleId={id} series={pageContext.series} tags={pageContext.tags} />
      </Layout>
    );
  }

  return (
    <Layout title={title}>
      <main lang="ja" className="container mx-auto px-4 sm:px-6 py-8 max-w-[42rem] text-bx-ink">
        {preview && (
          <p
            role="status"
            className="mb-6 rounded-md border border-bx-yellow/60 px-3 py-2 text-[13px] font-bold text-bx-yellow"
          >
            プレビュー(未公開)— このページは公開ビルドには含まれません
          </p>
        )}

        <nav aria-label="パンくず" className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold tracking-wide text-bx-ink3">
          <Link to="/" className="hover:text-bx-blue transition-colors">
            HOME
          </Link>
          <span aria-hidden>/</span>
          <Link to="/articles/" className="hover:text-bx-blue transition-colors">
            読みもの
          </Link>
          <span aria-hidden>/</span>
          <span className="text-bx-ink">{songTitle}</span>
        </nav>

        <header className="mt-6 mb-2">
          <Kicker color="text-bx-blue">
            {songTitle}
            {versionLabel ? ` — ${versionLabel}` : ""}
          </Kicker>
          <h1 className="mt-3 text-[28px] sm:text-[36px] font-extrabold leading-[1.35] text-bx-ink [overflow-wrap:anywhere]">
            {title}
          </h1>
          <p className="mt-4 text-[12px] text-bx-ink3">
            <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
          </p>
        </header>

        <article>
          <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} />
        </article>

        <footer className="mt-14 border-t border-bx-line pt-8">
          {songPages.length > 0 && (
            <section>
              <h2 className="text-[11px] font-extrabold tracking-[0.2em] text-bx-ink3">この曲のページ</h2>
              <ul className="mt-3 space-y-2">
                {songPages.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to={`/songs/${p.slug}/`}
                      onClick={() =>
                        trackEvent("article_song_page_click", { category: "navigation", label: id })
                      }
                      className="text-[15px] font-bold text-bx-blue underline underline-offset-4 hover:text-bx-blueLight"
                    >
                      {p.songName} — 演奏統計・MV・配信リンク
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className="mt-8 text-[13px]">
            <Link to="/articles/" className="text-bx-ink3 hover:text-bx-blue transition-colors">
              ← 読みもの一覧へ
            </Link>
          </p>
        </footer>
      </main>
      <ArticleTaxonomy articleId={id} series={pageContext.series} tags={pageContext.tags} />
    </Layout>
  );
};

export const Head: HeadFC<object, SongArticlePageContext> = ({ pageContext }) => {
  const { slug, title, songTitle, description, createdAt, publishedAt, updatedAt, noindex } = pageContext;
  const path = `/articles/${slug}/`;
  const jsonLd: object[] = [
    buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "読みもの", path: "/articles/" },
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
        dateModified: updatedAt,
        dateCreated: createdAt,
        keywords: pageContext.tags,
        songName: songTitle,
      })
    );
  }
  return (
    <>
      <SEO title={title} description={description ?? undefined} path={path} type="article" jsonLd={jsonLd} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
    </>
  );
};

export default SongArticlePage;
