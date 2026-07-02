export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  text: string;
  textSecondary: string;
  accent: string;
}

export const defaultColorPalette: ColorPalette = {
  primary: "#8B5CF6",
  primaryLight: "#A78BFA",
  primaryDark: "#7C3AED",
  secondary: "#EC4899",
  background: "#F8FAFC",
  text: "#1F2937",
  textSecondary: "#6B7280",
  accent: "#F59E0B",
};

// グレースケールのデフォルトカラーパレット（DB指定色がない場合に使用）
export const grayscaleColorPalette: ColorPalette = {
  primary: "rgb(156, 163, 175)",     // gray-400
  primaryLight: "rgb(209, 213, 219)",  // gray-300
  primaryDark: "rgb(107, 114, 128)",      // gray-500
  secondary: "rgb(209, 213, 219)",     // gray-300
  background: "#F9FAFB",               // gray-50
  text: "#1F2937",                     // gray-800
  textSecondary: "#6B7280",            // gray-500
  accent: "rgb(156, 163, 175)",       // gray-400
};

// 楽曲/アルバムタイトルに基づくプリセットカラーパレット
const contentColorPresets: Record<string, ColorPalette> = {
  // REOL主要楽曲のカラーパレット
  "Ultra High": {
    primary: "#FF6B35",
    primaryLight: "#FF8C69",
    primaryDark: "#E55100",
    secondary: "#FFD54F",
    background: "#FFF8E1",
    text: "#BF360C",
    textSecondary: "#FF8F00",
    accent: "#FF5722",
  },
  シンコペーション: {
    primary: "#E91E63",
    primaryLight: "#F48FB1",
    primaryDark: "#AD1457",
    secondary: "#9C27B0",
    background: "#FCE4EC",
    text: "#880E4F",
    textSecondary: "#C2185B",
    accent: "#FF4081",
  },
  ニジイロストーリー: {
    primary: "#2196F3",
    primaryLight: "#64B5F6",
    primaryDark: "#1565D2",
    secondary: "#00BCD4",
    background: "#E3F2FD",
    text: "#FFFFFF",
    textSecondary: "#E3F2FD",
    accent: "#03A9F4",
  },
  MONSTER: {
    primary: "#795548",
    primaryLight: "#A1887F",
    primaryDark: "#5D4037",
    secondary: "#FF5722",
    background: "#EFEBE9",
    text: "#3E2723",
    textSecondary: "#6D4C41",
    accent: "#8D6E63",
  },
  ファクト: {
    primary: "#607D8B",
    primaryLight: "#90A4AE",
    primaryDark: "#455A64",
    secondary: "#00BCD4",
    background: "#ECEFF1",
    text: "#263238",
    textSecondary: "#546E7A",
    accent: "#26C6DA",
  },
};

/**
 * 画像から主要な色を抽出する
 */
export async function extractColorsFromImage(
  imageSrc: string
): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Canvas context not available");
        }

        // 画像を小さくリサイズして処理速度を向上
        const size = 50;
        canvas.width = size;
        canvas.height = size;

        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);

        const colors = extractDominantColors(imageData.data);
        const palette = generatePaletteFromColors(colors);

        resolve(palette);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageSrc}`));
    };

    img.src = imageSrc;
  });
}

/**
 * 画像データから主要な色を抽出
 */
function extractDominantColors(
  imageData: Uint8ClampedArray
): Array<[number, number, number]> {
  const colorMap = new Map<string, number>();

  // 4ピクセルおきにサンプリングして高速化
  for (let i = 0; i < imageData.length; i += 16) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const alpha = imageData[i + 3];

    // 透明度が低い、または白に近い色はスキップ
    if (alpha < 128 || (r > 240 && g > 240 && b > 240)) {
      continue;
    }

    // 色を量子化（8段階に分割）
    const qR = Math.floor(r / 32) * 32;
    const qG = Math.floor(g / 32) * 32;
    const qB = Math.floor(b / 32) * 32;

    const key = `${qR},${qG},${qB}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  // 出現頻度でソートして上位5色を取得
  const sortedColors = Array.from(colorMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([color]) => {
      const [r, g, b] = color.split(",").map(Number);
      return [r, g, b] as [number, number, number];
    });

  return sortedColors;
}

/**
 * 抽出された色からカラーパレットを生成
 */
function generatePaletteFromColors(
  colors: Array<[number, number, number]>
): ColorPalette {
  if (colors.length === 0) {
    return defaultColorPalette;
  }

  // 最も彩度の高い色をプライマリカラーとして選択
  const primaryColor = colors.reduce((prev, current) => {
    const prevSaturation = calculateSaturation(prev);
    const currentSaturation = calculateSaturation(current);
    return currentSaturation > prevSaturation ? current : prev;
  });

  const [r, g, b] = primaryColor;
  const primary = `rgb(${r}, ${g}, ${b})`;

  // プライマリカラーを基に他の色を生成
  const primaryLight = lightenColor(r, g, b, 0.3);
  const primaryDark = darkenColor(r, g, b, 0.3);

  // 補色を計算
  const complementary = getComplementaryColor(r, g, b);
  const secondary = `rgb(${complementary[0]}, ${complementary[1]}, ${complementary[2]})`;

  // 明度に基づいて背景色とテキスト色を決定
  const brightness = calculateBrightness(r, g, b);
  const background = brightness > 128 ? "#FAFAFA" : "#1A1A1A";
  const text = brightness > 128 ? "#1F2937" : "#F9FAFB";
  const textSecondary = brightness > 128 ? "#6B7280" : "#9CA3AF";

  // アクセントカラーは2番目に彩度の高い色
  const accentColor = colors[1] || primaryColor;
  const accent = `rgb(${accentColor[0]}, ${accentColor[1]}, ${accentColor[2]})`;

  return {
    primary,
    primaryLight,
    primaryDark,
    secondary,
    background,
    text,
    textSecondary,
    accent,
  };
}

/**
 * 色の彩度を計算
 */
function calculateSaturation([r, g, b]: [number, number, number]): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (max === 0) return 0;
  return (delta / max) * 100;
}

/**
 * 色の明度を計算
 */
function calculateBrightness(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/**
 * 色を明るくする
 */
function lightenColor(r: number, g: number, b: number, amount: number): string {
  const nr = Math.min(255, Math.floor(r + (255 - r) * amount));
  const ng = Math.min(255, Math.floor(g + (255 - g) * amount));
  const nb = Math.min(255, Math.floor(b + (255 - b) * amount));
  return `rgb(${nr}, ${ng}, ${nb})`;
}

/**
 * 色を暗くする
 */
function darkenColor(r: number, g: number, b: number, amount: number): string {
  const nr = Math.floor(r * (1 - amount));
  const ng = Math.floor(g * (1 - amount));
  const nb = Math.floor(b * (1 - amount));
  return `rgb(${nr}, ${ng}, ${nb})`;
}

/**
 * 補色を取得
 */
function getComplementaryColor(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  return [255 - r, 255 - g, 255 - b];
}

/**
 * 文字列から決定論的にハッシュ値を生成
 */
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * ハッシュ値から色を生成（HSL方式で鮮やかな色を保証）
 */
function hashToColor(hash: number): [number, number, number] {
  // ハッシュ値から色相（0-360度）を決定
  const hue = hash % 360;
  
  // 彩度を70-90%の範囲に設定（鮮やかな色）
  const saturation = 70 + (hash % 20);
  
  // 明度を45-65%の範囲に設定（暗すぎず明るすぎない）
  const lightness = 45 + (hash % 20);
  
  // HSLをRGBに変換
  return hslToRgb(hue, saturation, lightness);
}

/**
 * HSLをRGBに変換
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s = s / 100;
  l = l / 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

/**
 * タイトルに基づいてカラーパレットを取得
 * プリセットがない場合は、タイトル文字列から動的に生成
 * @param title - コンテンツタイトル
 * @param themeColorPrimary - DB指定のプライマリカラー（オプション）。指定がない場合はグレースケール
 * @param themeColorSecondary - DB指定のセカンダリカラー（オプション）。指定がない場合はグレー
 */
export function getColorPaletteForContent(title: string, themeColorPrimary?: string | null, themeColorSecondary?: string | null): ColorPalette {
  // DB指定色がない場合はグレースケールを返す
  if (!themeColorPrimary) {
    return grayscaleColorPalette;
  }
  
  // 完全一致を最初に試す
  if (contentColorPresets[title]) {
    return contentColorPresets[title];
  }

  // 部分一致を試す
  const normalizedTitle = title.toLowerCase();
  for (const [key, palette] of Object.entries(contentColorPresets)) {
    if (
      normalizedTitle.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalizedTitle)
    ) {
      return palette;
    }
  }

  // プリセットにない場合は、DB指定色またはタイトル文字列から動的に色を生成
  // Primary色: DB指定色を使用
  const primary = themeColorPrimary;
  
  // Secondary色: 指定があればそれを使用、なければグレー
  const secondary = themeColorSecondary || "rgb(156, 163, 175)"; // gray-400
  
  // primary色をrgb形式からパース（#HEXまたはrgb()両方対応）
  let r: number, g: number, b: number;
  if (primary.startsWith('#')) {
    // HEX形式からRGBに変換
    const hex = primary.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (primary.startsWith('rgb')) {
    // rgb(r, g, b)形式からパース
    const match = primary.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    } else {
      // パース失敗時はグレースケールにフォールバック
      return grayscaleColorPalette;
    }
  } else {
    // 不正な形式の場合はグレースケールにフォールバック
    return grayscaleColorPalette;
  }
  
  // プライマリカラーを基に他の色を生成
  const primaryLight = lightenColor(r, g, b, 0.3);
  const primaryDark = darkenColor(r, g, b, 0.3);
  
  // 明度に基づいて背景色とテキスト色を決定
  const brightness = calculateBrightness(r, g, b);
  const background = brightness > 128 ? "#FAFAFA" : "#1A1A1A";
  const text = brightness > 128 ? "#1F2937" : "#F9FAFB";
  const textSecondary = brightness > 128 ? "#6B7280" : "#9CA3AF";
  
  // アクセントカラー（primary色の明度を調整）
  const accent = lightenColor(r, g, b, 0.2);

  const result = {
    primary,
    primaryLight,
    primaryDark,
    secondary,
    background,
    text,
    textSecondary,
    accent,
  };
  
  return result;
}

/**
 * カラーパレットをCSS変数として適用
 */
export function applyColorPalette(
  palette: ColorPalette,
  prefix: string = ""
): void {
  const root = document.documentElement;
  const cssPrefix = prefix ? `--${prefix}` : "--color";

  root.style.setProperty(`${cssPrefix}-primary`, palette.primary);
  root.style.setProperty(`${cssPrefix}-primary-light`, palette.primaryLight);
  root.style.setProperty(`${cssPrefix}-primary-dark`, palette.primaryDark);
  root.style.setProperty(`${cssPrefix}-secondary`, palette.secondary);
  root.style.setProperty(`${cssPrefix}-background`, palette.background);
  root.style.setProperty(`${cssPrefix}-text`, palette.text);
  root.style.setProperty(`${cssPrefix}-text-secondary`, palette.textSecondary);
  root.style.setProperty(`${cssPrefix}-accent`, palette.accent);
}

/**
 * カラーパレットをリセット
 */
export function resetColorPalette(prefix: string = ""): void {
  applyColorPalette(defaultColorPalette, prefix);
}

/**
 * 16進数カラーコードをRGB値に変換
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

/**
 * RGB値あ16進数カラーコードに変換
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * rgb()または#hex形式の色にrgba()形式で透明度を追加
 */
export function addAlpha(color: string, alpha: number): string {
  // rgb(r, g, b)形式の場合
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // #hex形式の場合
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color);
    if (rgb) {
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    }
  }
  
  // その他の場合はそのまま返す
  return color;
}
