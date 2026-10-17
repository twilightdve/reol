/**
 * 楽曲記事の表示回数(plan/46)。
 *
 * デプロイの前に scripts/fetch-article-pageviews.ts が GA4 から記事ごと・日ごとの表示回数を取り、
 * ビルドがそれを足し合わせて一覧に入れる。数が変わるのはデプロイの時だけ。
 * 公開日より前の日(限定公開での確認中)の表示は数えない。日付は GA のプロパティのタイムゾーン(日本時間)。
 */

export type PageViewsFile = {
  fetchedAt: string;
  /** slug → 日付(YYYY-MM-DD)→ 表示回数 */
  views: Record<string, Record<string, number>>;
};

/** 日本時間の日付(YYYY-MM-DD) */
const jstDay = (iso: string): string | null => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return new Date(t + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
};

/**
 * 記事の表示回数。公開日(日本時間)以降の日だけを足す。
 * ファイルが無い時・公開日時の無い記事(限定公開・プレビュー)は null(一覧に数を出さない)。
 */
export const articlePageViews = (file: PageViewsFile | null, slug: string, publishedAt: string | null): number | null => {
  if (!file || !publishedAt) return null;
  const from = jstDay(publishedAt);
  if (!from) return null;
  const days = file.views[slug] ?? {};
  return Object.entries(days).reduce((sum, [day, n]) => (day >= from ? sum + n : sum), 0);
};
