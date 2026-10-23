/**
 * 楽曲記事の表示回数(plan/46)。
 *
 * デプロイの前に scripts/fetch-article-pageviews.ts が GA4 から記事ごと・分ごとの表示回数を取り、
 * ビルドがそれを足し合わせて一覧に入れる。数が変わるのはデプロイの時だけ。
 * 公開日時より前(限定公開での確認中)の表示は数えない。日時は GA のプロパティのタイムゾーン(日本時間)。
 * 以前は日ごとだったため、公開した日の公開前の確認まで数えていた(2026-10-23 ユーザー指摘。生命線が公開直後に44回)。
 */

export type PageViewsFile = {
  fetchedAt: string;
  /** slug → 日本時間の日時(YYYY-MM-DDTHH:mm。古いファイルは日付 YYYY-MM-DD)→ 表示回数 */
  views: Record<string, Record<string, number>>;
};

/** 日本時間の日時(YYYY-MM-DDTHH:mm) */
const jstMinute = (iso: string): string | null => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return new Date(t + 9 * 60 * 60 * 1000).toISOString().slice(0, 16);
};

/**
 * 記事の表示回数。公開日時(日本時間・分単位)以降の表示だけを足す。
 * 日付だけの古い記録は、公開した日の分は公開前か後か分からないので、翌日以降だけを足す。
 * ファイルが無い時・公開日時の無い記事(限定公開・プレビュー)は null(一覧に数を出さない)。
 */
export const articlePageViews = (file: PageViewsFile | null, slug: string, publishedAt: string | null): number | null => {
  if (!file || !publishedAt) return null;
  const from = jstMinute(publishedAt);
  if (!from) return null;
  const fromDay = from.slice(0, 10);
  const days = file.views[slug] ?? {};
  return Object.entries(days).reduce((sum, [at, n]) => ((at.length === 10 ? at > fromDay : at >= from) ? sum + n : sum), 0);
};
