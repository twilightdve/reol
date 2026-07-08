// サイト既定のOGP画像(1200x630)のビルド時生成スクリプト
//
// - generate-reol-type-og.ts と同じ node-canvas ベースの手法を踏襲する
// - 日本語フォントは macOS のシステムフォント (Hiragino Sans) を前提とする
// - gatsby-node.ts の sourceNodes から呼ばれるほか、単体実行も可能:
//   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/generate-site-og.ts

import { promises as fs } from "fs";
import path from "path";
import { createCanvas } from "canvas";

const WIDTH = 1200;
const HEIGHT = 630;

// B案(BLACKBOX / CHRONICLE)のbxトークンと同値(tailwind.config.js参照)
const BX_BG = "#0b0b10";
const BX_INK = "#f2f0eb";
const BX_INK3 = "#a5a4ac";
const BX_BLUE = "#6b8ce0";
const BX_BLUE_DEEP = "#27489b";
const BX_YELLOW = "#e2bf57";

const fontJp = (size: number, weight = "400") =>
  `${weight} ${size}px "Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif`;

const drawOgImage = (): Buffer => {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // === 背景: bx-bg 単色 ===
  ctx.fillStyle = BX_BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 上部の公式ブルーのラジアルグロー(body.tsxの固定背景と同モチーフ)
  const glow = ctx.createRadialGradient(
    WIDTH / 2, -80, 0,
    WIDTH / 2, -80, 620
  );
  glow.addColorStop(0, "rgba(39, 72, 155, 0.45)");
  glow.addColorStop(1, "rgba(39, 72, 155, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 装飾の水平ライン(reol-type OGと同モチーフ)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 90);
    ctx.lineTo(WIDTH, i * 90);
    ctx.stroke();
  }

  // 左端のイエローアクセントバー
  ctx.fillStyle = BX_YELLOW;
  ctx.fillRect(0, 0, 14, HEIGHT);

  ctx.textAlign = "left";

  // === メインロゴタイプ ===
  ctx.fillStyle = BX_YELLOW;
  ctx.font = fontJp(96, "800");
  ctx.fillText("Reol", 120, 220);

  ctx.fillStyle = BX_INK;
  ctx.font = fontJp(56, "500");
  ctx.fillText("Unofficial Fansite", 120, 320);

  ctx.fillStyle = BX_BLUE;
  ctx.font = fontJp(84, "800");
  ctx.fillText("!Legit", 120, 440);

  ctx.fillStyle = BX_INK3;
  ctx.font = fontJp(30, "400");
  ctx.fillText("(not Legit)", 120, 486);

  // === フッター ===
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.moveTo(120, 540);
  ctx.lineTo(WIDTH - 120, 540);
  ctx.stroke();
  const urlText = "reol.twilightea.com";
  ctx.font = fontJp(24, "400");
  const urlWidth = ctx.measureText(urlText).width;
  const footerMaxWidth = WIDTH - 120 * 2 - urlWidth - 32;

  let footerText = "楽曲・ライブ・セトリ・ロケ地を横断検索できる非公式ファンサイト";
  ctx.font = fontJp(26, "500");
  while (footerText.length > 3 && ctx.measureText(footerText).width > footerMaxWidth) {
    footerText = footerText.slice(0, -2) + "…";
  }
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.fillText(footerText, 120, 588);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = fontJp(24, "400");
  ctx.fillText(urlText, WIDTH - 120, 588);

  // 右下の控えめなブルーアクセント
  ctx.fillStyle = BX_BLUE_DEEP;
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.arc(WIDTH - 60, HEIGHT - 60, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  return canvas.toBuffer("image/png");
};

export interface GenerateSiteOgResult {
  generated: number;
  skipped: number;
  files: string[];
}

// サイト既定のOG画像を static / public の両方へ書き出す
export const generateSiteOgImage = async (
  options: { outputDir?: string; mirrorOutputDir?: string } = {}
): Promise<GenerateSiteOgResult> => {
  const outputDir = options.outputDir || "static";
  const mirrorOutputDir = options.mirrorOutputDir || "public";
  const result: GenerateSiteOgResult = { generated: 0, skipped: 0, files: [] };

  const png = drawOgImage();
  const fileName = "ogimage.png";

  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(mirrorOutputDir, { recursive: true });

  for (const dir of [outputDir, mirrorOutputDir]) {
    const target = path.join(dir, fileName);
    result.files.push(target);
    const existing = await fs.readFile(target).catch(() => null);
    if (existing && existing.equals(png)) {
      result.skipped++;
      continue;
    }
    await fs.writeFile(target, png);
    result.generated++;
  }

  return result;
};

// 単体実行用エントリポイント
if (require.main === module) {
  generateSiteOgImage()
    .then((result) => {
      console.log(
        `[site-og] generated=${result.generated}, skipped=${result.skipped}`
      );
    })
    .catch((error) => {
      console.error("[site-og] generation failed");
      console.error(error);
      process.exit(1);
    });
}
