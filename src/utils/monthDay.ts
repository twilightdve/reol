// On This Day(/on-this-day/MM-DD/)で使う「月日」文字列("MM-DD")のユーティリティ。
// テンプレートと gatsby-node(近い日の出来事の算出)の両方から使う。

const DAY_MS = 86400000;

/** "MM-DD" を閏年の影響を受けない基準年(2001年)での通日に変換して前後にずらし、"MM-DD" へ戻す。 */
export const shiftMonthDay = (monthDay: string, deltaDays: number): string => {
  const [mo, d] = monthDay.split("-").map((v) => parseInt(v, 10));
  const base = Date.UTC(2001, mo - 1, d);
  const shifted = new Date(base + deltaDays * DAY_MS);
  const nextMo = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const nextD = String(shifted.getUTCDate()).padStart(2, "0");
  return `${nextMo}-${nextD}`;
};

export const formatMonthDayLabel = (monthDay: string): string => {
  const [mo, d] = monthDay.split("-").map((v) => parseInt(v, 10));
  return `${mo}月${d}日`;
};
