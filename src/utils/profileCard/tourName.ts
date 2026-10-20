/**
 * プロフィールカード(plan/48)の「LIVE参戦」に載せる、ツアー・ライヴの短い名前。
 * Reol / れをる のライヴ(名前がそれで始まるもの)だけ短くする:
 * - 「」『』"" の中があればそれ(例: Reol Oneman Live 2020「ハーメルンの大号令」→ ハーメルンの大号令)。
 * - 無ければ年の後ろ(例: Reol Oneman Live 2026 美辞学 → 美辞学)。
 * フェス・イベント・対バンは、カッコの中だけだと誰のライヴか分からなくなるので、そのまま。
 */
export const tourShortName = (title: string): string => {
  const t = title.trim();
  if (!/^(?:Reol|REOL|れをる)/.test(t)) return t;
  const quoted = /[「『"“]([^」』"”]+)[」』"”]/.exec(t);
  if (quoted) return quoted[1].trim();
  const afterYear = /^(?:Reol|REOL|れをる)\b.*?\d{4}(?:\/\d{2})?\s+(.+)$/.exec(t);
  if (afterYear) return afterYear[1].trim();
  return t;
};
