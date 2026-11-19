/**
 * LIVE(ツアー・連続公演)まわりで、LIVE 一覧とツアーのページが共有する決まり。
 *
 * - tourTitleColor: ワンマンの題名に使う公演の色(シートの themeColorPrimary / Secondary)
 * - isOngoing: 始まっていて終わっていない(ネタバレの注意を出す)かどうか
 */

export type ThemeName = "light" | "dark";

// 地色(global.scss の --bx-bg と揃える)
const BG_RGB: Record<ThemeName, readonly number[]> = { light: [250, 249, 247], dark: [11, 11, 16] };
const TEXT_CONTRAST = 4.5;
/** 鮮やかさ(RGB の最大と最小の差)がこれ未満だと、ふつうの題名(無彩色)と見分けられない */
const MIN_CHROMA = 40;

const luminance = ([r, g, b]: readonly number[]) => {
  const c = [r, g, b].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const hexToRgb = (hex: string): number[] | null => {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const contrast = (a: readonly number[], b: readonly number[]) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const toward = (rgb: readonly number[], to: number, k: number) => rgb.map((v) => Math.round(v + (to - v) * k));
const chroma = (rgb: readonly number[]) => Math.max(...rgb) - Math.min(...rgb);

/** 色を、地色に対して文字として読める濃さ(コントラスト 4.5)まで黒(ライト)か白(ダーク)へ寄せる */
const readable = (rgb: readonly number[], theme: ThemeName): number[] => {
  const bg = BG_RGB[theme];
  const to = theme === "light" ? 0 : 255;
  for (let k = 0; k <= 1; k += 0.05) {
    const c = toward(rgb, to, k);
    if (contrast(c, bg) >= TEXT_CONTRAST) return c;
  }
  return toward(rgb, to, 1);
};

/**
 * 題名の色。主の色を読める濃さに寄せ、まだ鮮やかならそれ。白・黒・灰に近くなる時は 2 色目、
 * それも近い時は null(呼ぶ側で公式の青にする)
 */
export const tourTitleColor = (
  primary: string | null | undefined,
  secondary: string | null | undefined,
  theme: ThemeName
): string | null => {
  for (const c of [primary, secondary]) {
    const rgb = c ? hexToRgb(c) : null;
    if (!rgb) continue;
    const ink = readable(rgb, theme);
    if (chroma(ink) >= MIN_CHROMA) return `rgb(${ink[0]} ${ink[1]} ${ink[2]})`;
  }
  return null;
};

/**
 * 始まっていて終わっていない(今日以前の公演と、今日以降の公演が両方ある)か。
 * 日付は "YYYY-MM-DD" のほか、複数日にまたがる表記("YYYY-MM-DD〜YYYY-MM-DD" 等)がある。
 * すべて先の日付だけのツアーはネタバレが無いので対象外。
 */
export const isOngoing = (dates: (string | null | undefined)[], now: Date = new Date()): boolean => {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  let hasPastOrToday = false;
  let hasTodayOrFuture = false;
  for (const s of dates) {
    for (const m of s?.match(/\d{4}-\d{2}-\d{2}/g) ?? []) {
      const d = new Date(m);
      if (isNaN(d.getTime())) continue;
      if (d.getTime() <= today.getTime()) hasPastOrToday = true;
      if (d.getTime() >= today.getTime()) hasTodayOrFuture = true;
    }
  }
  return hasPastOrToday && hasTodayOrFuture;
};

/** ネタバレの注意に同意したことを覚える sessionStorage のキー(LIVE 一覧とツアーのページで共有) */
export const spoilerStorageKey = (liveUuid: string) => `spoiler-ack-${liveUuid}`;
