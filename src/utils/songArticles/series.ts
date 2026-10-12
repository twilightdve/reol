/**
 * 読みものの分類(2026-10-10 ユーザー決定: シリーズ+タグ)。React を含まない純データ・純関数。
 *
 * - シリーズ: 1記事に1つ(必須)。一覧はシリーズで分け、シリーズごとのページ(/articles/series/<slug>/)を作る。
 * - タグ: 1記事に複数(任意)。一覧で絞り込む(/articles/?tag=<タグ>)。
 *   楽曲記事はサイトの確認済みデータ(初出の作品・初出の年)から自動で付け、editorial.json の tags を足す。
 *   曲名はタグにしない(記事が曲ごとに1本で、一覧の曲名表示と重なるため。2026-10-10 ユーザー決定)。
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
 * 楽曲記事のタグ。初出の作品名、初出の年(「2015年」)に、編集で足したタグを加える。
 * 重複と空文字は除き、順序は 作品 → 年 → 編集タグ。
 */
export const songArticleTags = (input: {
  releases: { title: string; releaseDate: string | null }[];
  extra?: string[] | null;
}): string[] => {
  const first = input.releases[0] ?? null;
  const year = first?.releaseDate?.slice(0, 4);
  const tags = [
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

/**
 * HOME の「読みもの」欄に出す記事と順番(記事ID)。2026-10-12 ユーザー指定: No title → drop pop candy → 1LDK
 * (2026-10-11 は No title → 1LDK → Boy)。
 * まだ公開されていない記事(通常ビルド)や未完成(draft)の記事は飛ばす。1本も無ければ欄を出さない。
 */
export const HOME_ARTICLE_IDS = ["reol-song-006", "reol-song-004", "reol-song-076"];

/**
 * カードの上に小さく曲名を出すか。題名にもう曲名が入っている時(「MONSTER 欲しがる…」「…読み直すNo title」)は出さない
 * (同じ語が続いて見えるため。2026-10-12 ユーザー指定)。大文字小文字は区別しない
 */
export const showSongKicker = (title: string, songTitle: string): boolean => {
  // 曲名の末尾の括弧書き(「drop pop candy (feat. ギガ)」の「(feat. ギガ)」など)は外して比べる
  const core = songTitle.replace(/\s*[(（][^()（）]*[)）]\s*$/, "").trim() || songTitle;
  return !title.toLowerCase().includes(core.toLowerCase());
};

export type RelatedCandidate = {
  id: string;
  slug: string;
  title: string;
  songTitle: string;
  seriesSlug: string;
  tags: string[];
  createdAt: string | null;
};

/**
 * 記事ページの下部に出す関連記事(2026-10-11)。最大 limit 本。
 * 編集で指定した関連記事(relatedArticleIds)を先に、残りは
 * 共通のタグの数(作品・年)→ 同じシリーズ → 作成日の新しい順 で選ぶ。自分自身は除く。
 */
export const pickRelatedArticles = (
  self: { id: string; seriesSlug: string; tags: string[]; relatedArticleIds?: string[] | null },
  all: RelatedCandidate[],
  limit = 3
): RelatedCandidate[] => {
  const others = all.filter((a) => a.id !== self.id);
  const chosen: RelatedCandidate[] = [];
  for (const id of self.relatedArticleIds ?? []) {
    const hit = others.find((a) => a.id === id);
    if (hit && !chosen.includes(hit)) chosen.push(hit);
  }
  const score = (a: RelatedCandidate) =>
    a.tags.filter((t) => self.tags.includes(t)).length * 2 + (a.seriesSlug === self.seriesSlug ? 1 : 0);
  const rest = others
    .filter((a) => !chosen.includes(a))
    .sort((a, b) => score(b) - score(a) || (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return [...chosen, ...rest].slice(0, limit);
};
