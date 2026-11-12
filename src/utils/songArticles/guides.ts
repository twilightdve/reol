/**
 * 読みもののうち、原稿(content/articles)からではなく、手で書いたページ(src/pages/articles/<slug>.tsx)で出すもの。
 * React を含まない純データ(gatsby-node とページの両方から読む)。
 *
 * - 一覧(/articles/)・シリーズのページ・RSS・HOME の「読みもの」には、楽曲記事と同じ形で並ぶ。
 * - ページのファイル名は slug と同じにする(/articles/<slug>/ になる)。楽曲記事の slug と重なるとビルドで止まる。
 * - 表紙の画像(一覧のカード・OGP)は楽曲記事と同じく npm run articles:og で撮る(ページの data-og-cover の要素)。
 * - いいね・関連記事・曲ページからの逆引きは無い。
 */
import { GUIDE_ARTICLE_SERIES } from "./series";

export type GuideArticle = {
  /** 一覧の key。楽曲記事の ID(reol-song-XXX)と重ならない名前にする */
  id: string;
  slug: string;
  title: string;
  /** 一覧のカードと RSS に出す要約 */
  summary: string;
  seriesSlug: string;
  tags: string[];
  /** 最初に公開した日時 */
  publishedAt: string;
  /** 公開後に中身を直した日時(同じ日なら画面には出ない) */
  updatedAt: string | null;
};

/** 聖地巡礼ガイド 渋谷編。2026-11-12 に /place/shibuya/ で公開し、11-13 に読みものへ移した(plan/70) */
export const SHIBUYA_GUIDE: GuideArticle = {
  id: "guide-shibuya",
  slug: "shibuya-guide",
  title: "Reol聖地巡礼ガイド 渋谷編",
  summary:
    "Reolにゆかりのある渋谷の場所を、MVのロケ地、ライヴ会場、歌詞に出てくる地名、本人が訪れた店に分けてまとめたガイド。渋谷駅のまわりを歩いて回る順の地図つき。",
  seriesSlug: GUIDE_ARTICLE_SERIES,
  tags: ["渋谷", "聖地巡礼"],
  publishedAt: "2026-11-12T10:06:00.000Z",
  updatedAt: "2026-11-13T03:00:00.000Z",
};

export const GUIDE_ARTICLES: GuideArticle[] = [SHIBUYA_GUIDE];

export const guidePath = (g: GuideArticle): string => `/articles/${g.slug}/`;
