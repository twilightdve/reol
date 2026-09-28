/**
 * 関連ポスト(X埋め込み)のメタ情報。gatsby-node(関連ポスト一覧の生成)と
 * 各ページの関連ポスト表示(日付差分ラベル: plan/27 ステップ5)の両方で使う。
 *
 * 投稿者の分類(本人/公式/メディア/その他)はハンドル名のヒューリスティック。
 * 「本人」以外は確認が取れたハンドルのみ手動でリストに追加する運用とし、
 * 未確認のアカウントを推測で「公式」「メディア」に分類しない
 * (reol-official-links 相当の確認方針を踏襲)。
 */
const HERSELF_HANDLES = new Set(["rrreol"]);
// 確認済みの公式関連アカウント(本人以外)。ハンドル名は小文字・@なしで追加。
const OFFICIAL_HANDLES = new Set<string>([
  "reol_info", // Reol公式インフォメーションアカウント
  "rrreol_official", // Reol OFFICIAL
]);
// 確認済みのメディア・ニュースアカウント。
const MEDIA_HANDLES = new Set<string>([
  "natalie_mu", // 音楽ナタリー
  "rockinon_com", // rockin'on
  "the_firsttimesn", // THE FIRST TIMES
]);

export type PostCategory = "本人" | "公式" | "メディア" | "その他";

export const classifyPostHandle = (handle: string | null): PostCategory => {
  if (!handle) return "その他";
  const h = handle.toLowerCase();
  if (HERSELF_HANDLES.has(h)) return "本人";
  if (OFFICIAL_HANDLES.has(h)) return "公式";
  if (MEDIA_HANDLES.has(h)) return "メディア";
  return "その他";
};

// Twitter/Xの標準的な埋め込みHTML
// (`&mdash; 表示名 (@handle) <a href=".../status/...">日付</a>`)から
// ハンドル・表示名・投稿日を抜き出す。パース不可の場合はnullのまま返す。
export const parsePostEmbedHtml = (
  html: string
): { handle: string | null; displayName: string | null; postedAt: string | null } => {
  const handleMatch = html.match(/\(@(\w+)\)/);
  const nameMatch = html.match(/&mdash;\s*([^(]+?)\s*\(@/);
  const dateMatch = html.match(/status\/\d+[^>]*>([^<]+)<\/a>/);
  let postedAt: string | null = null;
  if (dateMatch) {
    // "August 15, 2024" はローカル時刻として解釈されるので、日付もローカルの年月日で取り出す。
    // (toISOString だと UTC に換算され、日本時間のビルドでは前日になっていた)
    const d = new Date(dateMatch[1]);
    if (!isNaN(d.getTime())) {
      postedAt = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
    }
  }
  return {
    handle: handleMatch ? handleMatch[1] : null,
    displayName: nameMatch ? nameMatch[1].trim() : null,
    postedAt,
  };
};

export type RelativeDate =
  | { unit: "same" }
  | { unit: "day" | "month" | "year"; amount: number; direction: "before" | "after" };

/**
 * 投稿日と基準日(公演日・リリース日)の差を「N日前 / 当日 / Nヶ月後」などの単位にする。
 * 60日未満は日、1年未満は月、それ以上は年で表す。日付が不正なら null。
 */
export const relativeDate = (postedAt: string | null, reference: string | null): RelativeDate | null => {
  const p = postedAt?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const r = reference?.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!p || !r) return null;
  const pd = Date.UTC(+p[1], +p[2] - 1, +p[3]);
  const rd = Date.UTC(+r[1], +r[2] - 1, +r[3]);
  const days = Math.round((pd - rd) / 86400000);
  if (days === 0) return { unit: "same" };
  const direction = days < 0 ? "before" : "after";
  const abs = Math.abs(days);
  if (abs < 60) return { unit: "day", amount: abs, direction };
  if (abs < 365) return { unit: "month", amount: Math.round(abs / 30), direction };
  return { unit: "year", amount: Math.round(abs / 365), direction };
};
