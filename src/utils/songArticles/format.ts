/** 記事の公開日・更新日(ISO日時)を日本時間の「2026年10月9日」形式にする */
export const formatArticleDate = (iso: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};

/**
 * 読点「、」の直後で文字列を区切る(区切った後も連結すれば元の文字列に戻る)。
 * 記事別デザインで、結び等を句ごとにまとめて折り返すのに使う(plan/30)。
 */
export const splitAfterComma = (text: string): string[] =>
  text
    .split("、")
    .map((part, i, all) => (i < all.length - 1 ? `${part}、` : part))
    .filter((part) => part !== "");
