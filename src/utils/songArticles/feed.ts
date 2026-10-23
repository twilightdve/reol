/**
 * 読みもの(楽曲記事)の RSS 2.0 フィード。ビルド時に /articles/feed.xml として書き出す(gatsby-node)。
 *
 * - 載せるのは全体公開の記事だけ。限定公開・プレビュー・予約公開(公開日時がビルド時刻より後)は載せない。
 *   予約公開の記事は、公開日時を過ぎた後のビルドで載る(サイトは静的配信のため)。
 * - 新しい順(公開日時の降順)。本文は載せず、一覧と同じ要約を description にする。
 */
import { isReleased } from "./schedule";

export const ARTICLES_FEED_PATH = "/articles/feed.xml";
export const ARTICLES_FEED_TITLE = "読みもの｜!Legit — Reol 非公式ファンサイト";

export type FeedArticle = {
  slug: string;
  title: string;
  summary: string | null;
  publishedAt: string | null;
  tags: string[];
  preview: boolean;
  unlisted: boolean;
};

const escapeXml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c] as string);

/** フィードに載せる記事(全体公開で、公開日時を過ぎたもの)を新しい順に */
export const feedArticles = (articles: FeedArticle[], builtAt: number): FeedArticle[] =>
  articles
    .filter((a) => !a.preview && !a.unlisted && a.publishedAt && isReleased(a.publishedAt, builtAt))
    .sort((a, b) => (b.publishedAt as string).localeCompare(a.publishedAt as string));

export const buildArticlesFeed = (opts: {
  siteUrl: string;
  description: string;
  articles: FeedArticle[];
  builtAt: number;
}): string => {
  const { siteUrl, description, builtAt } = opts;
  const items = feedArticles(opts.articles, builtAt);
  const lastBuild = items[0]?.publishedAt ?? new Date(builtAt).toISOString();
  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
    `<channel>`,
    `<title>${escapeXml(ARTICLES_FEED_TITLE)}</title>`,
    `<link>${siteUrl}/articles/</link>`,
    `<description>${escapeXml(description)}</description>`,
    `<language>ja</language>`,
    `<lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>`,
    `<atom:link href="${siteUrl}${ARTICLES_FEED_PATH}" rel="self" type="application/rss+xml"/>`,
    ...items.map((a) => {
      const url = `${siteUrl}/articles/${a.slug}/`;
      return [
        `<item>`,
        `<title>${escapeXml(a.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${new Date(a.publishedAt as string).toUTCString()}</pubDate>`,
        a.summary ? `<description>${escapeXml(a.summary)}</description>` : null,
        ...a.tags.map((t) => `<category>${escapeXml(t)}</category>`),
        `</item>`,
      ]
        .filter((l): l is string => l !== null)
        .join("\n");
    }),
    `</channel>`,
    `</rss>`,
    ``,
  ];
  return lines.join("\n");
};
