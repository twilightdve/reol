import type { ArticleBlock } from "../../../utils/songArticles/markdown";
import type { LeadMedia } from "../ArticleBody";

/** 楽曲記事ページ(/articles/<slug>/)の pageContext。gatsby-node.ts の createPage と対応 */
export interface SongArticlePageContext {
  id: string;
  slug: string;
  title: string;
  songTitle: string;
  versionLabel: string | null;
  description: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  bodyRevision: number;
  blocks: ArticleBlock[];
  leadMedia: LeadMedia | null;
  songPages: { slug: string; songName: string }[];
  /** サイトの確認済みデータ(作詞・作曲・収録作)。記事別デザインのクレジット等に使う */
  songFacts: {
    lyricMember: string | null;
    musicMember: string | null;
    releases: { title: string; format: string | null; releaseDate: string | null }[];
    /** サイトの演奏統計(対応する曲ページが1つの時だけ) */
    stats: { totalPlays: number; firstPlayedDate: string | null; lastPlayedDate: string | null } | null;
  };
  /** 記事別デザイン(plan/30)。本文の版と一致した時だけ記事IDが入る */
  designId: string | null;
  preview: boolean;
  noindex: boolean;
}

export type SongArticleDesign = React.FC<SongArticlePageContext>;
