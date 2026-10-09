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

/** シートの盤の形態の略記を、読者向けの言葉にする(知らない略記はそのまま) */
const FORMAT_LABEL: Record<string, string> = {
  配信SG: "配信シングル",
  SG: "シングル",
  miniAL: "ミニアルバム",
  AL: "アルバム",
  fullAL: "フルアルバム",
  LP: "アナログ盤",
};
export const formatLabel = (format: string | null): string | null =>
  format ? FORMAT_LABEL[format] ?? format : null;

/** 日付(YYYY-MM-DD)を「YYYY.MM.DD」にする */
export const dotDate = (d: string | null): string | null => (d ? d.replace(/-/g, ".") : null);
