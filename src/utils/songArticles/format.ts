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
 * 出来事の日付(YYYY-MM-DD)を「2025年2月16日」形式にする。日付だけの値なので、時刻やタイムゾーンは通さない。
 * 最終日があれば「2025年2月15日〜16日」(月や年が違えば、違う所から書く)。読めなければ null
 */
export const formatEventDate = (start: string | null | undefined, end?: string | null): string | null => {
  const parse = (v: string | null | undefined) => {
    const m = (v ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : null;
  };
  const a = parse(start);
  if (!a) return null;
  const head = `${a.y}年${a.m}月${a.d}日`;
  const b = parse(end);
  if (!b || (b.y === a.y && b.m === a.m && b.d === a.d)) return head;
  const tail = b.y !== a.y ? `${b.y}年${b.m}月${b.d}日` : b.m !== a.m ? `${b.m}月${b.d}日` : `${b.d}日`;
  return `${head}〜${tail}`;
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

/**
 * 日本語の文を句(文節に近いまとまり)に分ける簡易な規則。文字列は変えず、つなげると元に戻る。
 * 区切るのは「ひらがな・句読点・閉じ括弧」の直後に「漢字・カタカナ・英数字・開き括弧」が来る位置。
 * 例: 「1LDKが自分の歌になるとき」→ ["1LDKが", "自分の", "歌になるとき"]
 */
export const splitPhrases = (text: string): string[] => {
  const tail = /[\p{Script=Hiragana}ー、。,.!?！？」』）)]/u;
  const head = /[\p{Script=Han}\p{Script=Katakana}A-Za-z0-9「『（(]/u;
  const out: string[] = [];
  let cur = "";
  for (const ch of text) {
    if (cur && tail.test(cur[cur.length - 1]) && head.test(ch)) {
      out.push(cur);
      cur = "";
    }
    cur += ch;
  }
  if (cur) out.push(cur);
  return out;
};
