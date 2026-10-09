/**
 * 読みものの分類(2026-10-10 ユーザー決定: シリーズ+タグ)。React を含まない純データ・純関数。
 *
 * - シリーズ: 1記事に1つ(必須)。一覧はシリーズで分け、シリーズごとのページ(/articles/series/<slug>/)を作る。
 * - タグ: 1記事に複数(任意)。一覧で絞り込む(/articles/?tag=<タグ>)。
 *   楽曲記事はサイトの確認済みデータ(曲名・初出の作品・初出の年)から自動で付け、editorial.json の tags を足す。
 */

export type ArticleSeries = {
  slug: string;
  name: string;
  /** シリーズの説明(一覧とシリーズのページに出す) */
  description: string;
};

/** シリーズの登録表。並びは一覧での表示順 */
export const ARTICLE_SERIES: ArticleSeries[] = [
  {
    slug: "kyoku-wo-yomu",
    name: "曲を読む",
    description: "Reolの曲を一曲ずつ、聴きどころやライヴでの体験とあわせて読む短い記事。",
  },
];

/** 楽曲記事(kind: song)のシリーズ */
export const SONG_ARTICLE_SERIES = "kyoku-wo-yomu";

export const seriesBySlug = (slug: string): ArticleSeries | undefined =>
  ARTICLE_SERIES.find((s) => s.slug === slug);

/**
 * 楽曲記事のタグ。曲名、初出の作品名、初出の年(「2015年」)に、編集で足したタグを加える。
 * 重複と空文字は除き、順序は 曲名 → 作品 → 年 → 編集タグ。
 */
export const songArticleTags = (input: {
  songTitle: string;
  releases: { title: string; releaseDate: string | null }[];
  extra?: string[] | null;
}): string[] => {
  const first = input.releases[0] ?? null;
  const year = first?.releaseDate?.slice(0, 4);
  const tags = [
    input.songTitle,
    first?.title ?? null,
    year && /^\d{4}$/.test(year) ? `${year}年` : null,
    ...(input.extra ?? []),
  ]
    .map((t) => (t ?? "").trim())
    .filter((t) => t !== "");
  return [...new Set(tags)];
};

/** 一覧の絞り込み URL(タグは日本語を含むのでエンコードする) */
export const tagFilterPath = (tag: string): string => `/articles/?tag=${encodeURIComponent(tag)}`;
export const seriesPath = (slug: string): string => `/articles/series/${slug}/`;
