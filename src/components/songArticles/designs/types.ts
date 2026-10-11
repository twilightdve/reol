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
  /** 読みもののシリーズ(1記事に1つ)とタグ(src/utils/songArticles/series.ts) */
  series: { slug: string; name: string };
  tags: string[];
  /** 関連記事(記事ページの下部。最大3本。src/utils/songArticles/series.ts の pickRelatedArticles) */
  related: { slug: string; title: string; songTitle: string }[];
  /** 記事に表示する作成日(原稿の作成日) */
  createdAt: string | null;
  /** 表紙を撮った OGP 画像のサイト内パス(?v=ハッシュ付き)。無ければ null */
  ogImage?: string | null;
  /** 初回公開日時(表示しない。構造化データ用) */
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
    /** タイアップ(曲データの tieupDescription。無ければ null) */
    tieup: string | null;
    releases: { title: string; format: string | null; releaseDate: string | null }[];
    /** サイトの演奏統計(対応する曲ページが1つの時だけ) */
    stats: { totalPlays: number; firstPlayedDate: string | null; lastPlayedDate: string | null } | null;
  };
  /** 記事別デザインが登録表で指定した公演(plan/31)。見つからない公演は含まない */
  liveRefs: {
    liveItemUuid: string;
    liveTitle: string;
    liveItemName: string | null;
    date: string;
    place: string | null;
    /** 公演ページ(/live/<slug>/) */
    path: string;
    setList: { name: string; type: string | null }[];
  }[];
  /** 記事別デザイン(plan/30)。本文の版と一致した時だけ記事IDが入る */
  designId: string | null;
  preview: boolean;
  noindex: boolean;
}

export type SongArticleDesign = React.FC<SongArticlePageContext>;
