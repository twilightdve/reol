// Reolファンタイプ診断 — 16タイプ別OG画像(1200x630)のビルド時生成スクリプト
//
// - node-canvas のカラー絵文字描画は不安定なため、絵文字グリフには依存せず
//   タイプカラー×タイポグラフィのみで構成する
// - 日本語フォントは macOS のシステムフォント (Hiragino Sans) を前提とする
// - gatsby-node.ts の sourceNodes から呼ばれるほか、単体実行も可能:
//   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/generate-reol-type-og.ts

import { promises as fs } from "fs";
import path from "path";
import { createCanvas } from "canvas";
import { reolTypes, typeGroups, ReolType } from "../src/data/reol-type/types";

const WIDTH = 1200;
const HEIGHT = 630;
const MARGIN_X = 96;

// フォント指定ヘルパー (macOSシステムフォント頼み)
const fontJp = (size: number, weight = "400") =>
  `${weight} ${size}px "Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif`;

const hexToRgb = (hex: string) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

// 暗色背景上でも読めるよう、タイプカラーを一定の輝度まで白寄りに補正する
const lightenForText = (hex: string): string => {
  let { r, g, b } = hexToRgb(hex);
  for (let i = 0; i < 50; i++) {
    // YIQ輝度 (0-255) が閾値を超えたら十分読める
    if ((r * 299 + g * 587 + b * 114) / 1000 >= 170) break;
    r = Math.min(255, Math.round(r + (255 - r) * 0.18));
    g = Math.min(255, Math.round(g + (255 - g) * 0.18));
    b = Math.min(255, Math.round(b + (255 - b) * 0.18));
  }
  return `rgb(${r}, ${g}, ${b})`;
};

// 1枚分のOG画像PNGバッファを描画する
const drawOgImage = (typeInfo: ReolType): Buffer => {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");
  const { r, g, b } = hexToRgb(typeInfo.color);

  // === 背景: タイプカラーを基調にした暗色グラデーション ===
  // サイト側 (getTypeBgStyle) より少し係数を強め、サムネイルでもタイプ差が出るようにする
  const darkFrom = `rgb(${Math.round(r * 0.1 + 8)}, ${Math.round(g * 0.1 + 8)}, ${Math.round(b * 0.1 + 12)})`;
  const darkVia = `rgb(${Math.round(r * 0.3 + 12)}, ${Math.round(g * 0.3 + 12)}, ${Math.round(b * 0.3 + 18)})`;
  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bg.addColorStop(0, darkFrom);
  bg.addColorStop(0.5, darkVia);
  bg.addColorStop(1, darkFrom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 装飾の水平ライン (シェアカードと同モチーフ)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 90);
    ctx.lineTo(WIDTH, i * 90);
    ctx.stroke();
  }

  // 右上のカラーアクセント (放射グラデーション)
  const accent = ctx.createRadialGradient(WIDTH * 0.82, HEIGHT * 0.22, 0, WIDTH * 0.82, HEIGHT * 0.22, 460);
  accent.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.35)`);
  accent.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 左端のタイプカラーバー
  ctx.fillStyle = typeInfo.color;
  ctx.fillRect(0, 0, 14, HEIGHT);

  const textColor = lightenForText(typeInfo.color);
  const maxWidth = WIDTH - MARGIN_X * 2;
  ctx.textAlign = "left";

  // === ヘッダー: サービス名 + タイプコード ===
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = fontJp(28, "500");
  ctx.fillText("REOL FAN TYPE", MARGIN_X, 128);
  const headerWidth = ctx.measureText("REOL FAN TYPE").width;
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = fontJp(28, "700");
  ctx.fillText(typeInfo.code, MARGIN_X + headerWidth + 24, 128);

  // === メイン: タイプ名「○○型」(幅に収まるまで縮小) ===
  const title = `${typeInfo.name}「${typeInfo.songLabel}」`;
  let titleSize = 92;
  ctx.font = fontJp(titleSize, "800");
  while (titleSize > 48 && ctx.measureText(title).width > maxWidth) {
    titleSize -= 4;
    ctx.font = fontJp(titleSize, "800");
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillText(title, MARGIN_X, 296);

  // === 代表曲ラベル ===
  ctx.fillStyle = textColor;
  ctx.font = fontJp(42, "600");
  ctx.fillText(`♪ ${typeInfo.song}`, MARGIN_X, 376);

  // === 歌詞引用 (1行に収まらない場合は末尾を省略) ===
  let quote = `「${typeInfo.quote}」— ${typeGroups[typeInfo.group].name}`;
  ctx.font = fontJp(28, "400");
  while (quote.length > 3 && ctx.measureText(quote).width > maxWidth) {
    quote = quote.slice(0, -2) + "…";
  }
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.fillText(quote, MARGIN_X, 442);

  // === フッター ===
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.moveTo(MARGIN_X, 516);
  ctx.lineTo(WIDTH - MARGIN_X, 516);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.font = fontJp(28, "500");
  ctx.fillText("Reolファンタイプ診断 | !Legit(非公式ファンサイト)", MARGIN_X, 568);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = fontJp(24, "400");
  ctx.fillText("reol.twilightea.com", WIDTH - MARGIN_X, 568);

  return canvas.toBuffer("image/png");
};

export interface GenerateReolTypeOgResult {
  generated: number; // 書き込んだファイル数
  skipped: number;   // 既に同内容で書き込みを省略した数
  files: string[];   // 対象ファイルパス一覧
}

// 16タイプ分のOG画像を static / public の両方へ書き出す
export const generateReolTypeOgImages = async (
  options: { outputDir?: string; mirrorOutputDir?: string } = {}
): Promise<GenerateReolTypeOgResult> => {
  const outputDir = options.outputDir || "static/reol-type-og";
  const mirrorOutputDir = options.mirrorOutputDir || "public/reol-type-og";
  const result: GenerateReolTypeOgResult = { generated: 0, skipped: 0, files: [] };

  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(mirrorOutputDir, { recursive: true });

  for (const typeInfo of Object.values(reolTypes)) {
    const png = drawOgImage(typeInfo);
    const fileName = `${typeInfo.code.toLowerCase()}.png`;
    for (const dir of [outputDir, mirrorOutputDir]) {
      const target = path.join(dir, fileName);
      result.files.push(target);
      // 既に同内容のファイルがあれば再生成をスキップ
      const existing = await fs.readFile(target).catch(() => null);
      if (existing && existing.equals(png)) {
        result.skipped++;
        continue;
      }
      await fs.writeFile(target, png);
      result.generated++;
    }
  }

  return result;
};

// 単体実行用エントリポイント
if (require.main === module) {
  generateReolTypeOgImages()
    .then((result) => {
      console.log(
        `[reol-type-og] generated=${result.generated}, skipped=${result.skipped} (types=${Object.keys(reolTypes).length})`
      );
    })
    .catch((error) => {
      console.error("[reol-type-og] generation failed");
      console.error(error);
      process.exit(1);
    });
}
