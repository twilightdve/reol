/**
 * カラーコントラストユーティリティ
 * 背景色に対して適切なテキストカラーを自動選択
 */

/**
 * HEX色から明度を計算（0-255）
 */
export function getLuminance(hexColor: string): number {
  // HEX色をRGBに変換
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 相対輝度の計算（WCAG 2.0準拠）
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear =
    rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear =
    gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear =
    bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * 背景色に対して適切なテキスト色を返す
 * @param bgColor - 背景色（HEX形式）
 * @returns テキスト色（white または dark）
 */
export function getContrastTextColor(bgColor: string): {
  primary: string;
  secondary: string;
  muted: string;
} {
  const luminance = getLuminance(bgColor);

  // 明度が0.5以上（明るい背景）なら暗いテキスト
  // 明度が0.5未満（暗い背景）なら明るいテキスト
  if (luminance > 0.5) {
    return {
      primary: "rgb(17, 24, 39)", // gray-900
      secondary: "rgb(55, 65, 81)", // gray-700
      muted: "rgb(107, 114, 128)", // gray-500
    };
  } else {
    return {
      primary: "rgb(255, 255, 255)", // white
      secondary: "rgba(255, 255, 255, 0.9)", // white/90
      muted: "rgba(255, 255, 255, 0.7)", // white/70
    };
  }
}

/**
 * 2色のコントラスト比を計算（WCAG 2.0準拠）
 * @returns コントラスト比（1-21）
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG AAレベル（4.5:1）を満たすか判定
 */
export function meetsWCAGAA(bgColor: string, textColor: string): boolean {
  return getContrastRatio(bgColor, textColor) >= 4.5;
}

/**
 * WCAG AAAレベル（7:1）を満たすか判定
 */
export function meetsWCAGAAA(bgColor: string, textColor: string): boolean {
  return getContrastRatio(bgColor, textColor) >= 7;
}

/**
 * 背景色を少し暗くする/明るくする
 */
export function adjustColorBrightness(
  hexColor: string,
  percent: number
): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const adjust = (val: number) => {
    const adjusted = Math.round(val * (1 + percent / 100));
    return Math.max(0, Math.min(255, adjusted));
  };

  const newR = adjust(r).toString(16).padStart(2, "0");
  const newG = adjust(g).toString(16).padStart(2, "0");
  const newB = adjust(b).toString(16).padStart(2, "0");

  return `#${newR}${newG}${newB}`;
}
