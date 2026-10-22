/**
 * リンクから計測用のパラメータ(utm_*)を外す。サイトのリンクには付けない(ユーザー、2026-10-23)。
 * URL として読めない文字列はそのまま返す
 */
export const stripTrackingParams = (url: string): string => {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return url;
  }
  const keys = [...u.searchParams.keys()].filter((k) => /^utm_/i.test(k));
  if (keys.length === 0) return url;
  keys.forEach((k) => u.searchParams.delete(k));
  return u.toString();
};
