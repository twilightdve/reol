// Reolファンタイプ診断 — 16タイプ別OG画像(1200x630)のビルド時生成スクリプト
//
// - 見た目はサイトの OGP 画像(generate-page-og.ts)と同じモチーフ。絵文字は描かない
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

// B案の bx トークンと同値(tailwind.config.js 参照)
const BX_BG = "#0b0b10";
const BX_YELLOW = "#e2bf57";

// 1枚分のOG画像PNGバッファを描画する
const drawOgImage = (typeInfo: ReolType): Buffer => {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // === 背景: サイト既定OG・曲OG・公演OGと同じモチーフ(bx-bg + 上部ブルーグロー + 横罫) ===
  // タイプの色は左端の帯にだけ使う(plan/75)
  ctx.fillStyle = BX_BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const glow = ctx.createRadialGradient(WIDTH / 2, -80, 0, WIDTH / 2, -80, 620);
  glow.addColorStop(0, "rgba(39, 72, 155, 0.45)");
  glow.addColorStop(1, "rgba(39, 72, 155, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 90);
    ctx.lineTo(WIDTH, i * 90);
    ctx.stroke();
  }

  // 左端のタイプカラーバー
  ctx.fillStyle = typeInfo.color;
  ctx.fillRect(0, 0, 14, HEIGHT);

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
  ctx.fillStyle = BX_YELLOW;
  ctx.font = fontJp(42, "700");
  ctx.fillText(typeInfo.song, MARGIN_X, 376);

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
