// サイト既定のOGP画像(1200x630)のビルド時生成スクリプト
//
// - generate-reol-type-og.ts と同じ node-canvas ベースの手法を踏襲する
// - 日本語フォントは macOS のシステムフォント (Hiragino Sans) を前提とする
// - gatsby-node.ts の sourceNodes から呼ばれるほか、単体実行も可能:
//   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/generate-site-og.ts

import { promises as fs } from "fs";
import path from "path";
import { createCanvas, registerFont } from "canvas";

const WIDTH = 1200;
const HEIGHT = 630;

// B案(BLACKBOX / CHRONICLE)のbxトークンと同値(tailwind.config.js参照)
const BX_BG = "#0b0b10";
const BX_INK = "#f2f0eb";
const BX_INK3 = "#a5a4ac";
const BX_BLUE = "#6b8ce0";
const BX_YELLOW = "#e2bf57";

// ヘッダーのロゴ(!Legit)と同じ Cormorant 500。サイトは Google Fonts から読むが、ここではパッケージの woff を使う
const LOGO_FAMILY = "Cormorant OG";
registerFont(require.resolve("@fontsource/cormorant/files/cormorant-latin-500-normal.woff"), {
  family: LOGO_FAMILY,
  weight: "500",
});

const fontJp = (size: number, weight = "400") =>
  `${weight} ${size}px "Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif`;

/** トップのヒーローと同じ数字(楽曲数・公演数・演奏数)。gatsby-node の SiteStats の値を受け取る */
export interface SiteOgStats {
  songCount: number;
  liveItemCount: number;
  performanceCount: number;
}

// 字間を空けた英字ラベル(サイトの tracking-[0.3em] 相当)。canvas の letterSpacing は環境差があるので1字ずつ置く
const drawTracked = (
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  text: string,
  x: number,
  y: number,
  spacing: number
): number => {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
  return cx - spacing;
};

const drawOgImage = (stats?: SiteOgStats): Buffer => {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");
  const LEFT = 88;
  const RIGHT = WIDTH - 88;

  // === 背景: bx-bg に、上部の公式ブルーのラジアルグロー(body.tsxの固定背景と同モチーフ) ===
  ctx.fillStyle = BX_BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const glow = ctx.createRadialGradient(WIDTH * 0.62, -120, 0, WIDTH * 0.62, -120, 760);
  glow.addColorStop(0, "rgba(39, 72, 155, 0.5)");
  glow.addColorStop(1, "rgba(39, 72, 155, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // === ヘッダー: ロゴ + REOL UNOFFICIAL FANSITE(サイトのヘッダーと同じ並び) ===
  ctx.fillStyle = BX_INK;
  ctx.font = `500 64px "${LOGO_FAMILY}"`;
  ctx.fillText("!Legit", LEFT, 104);
  const logoWidth = ctx.measureText("!Legit").width;
  ctx.fillStyle = BX_INK3;
  ctx.font = fontJp(17, "700");
  drawTracked(ctx, "REOL UNOFFICIAL FANSITE", LEFT + logoWidth + 22, 70, 4.5);

  // === 見出し: トップのヒーローと同じ2行(「これまで」は青、「これから」は黄) ===
  ctx.fillStyle = BX_BLUE;
  ctx.font = fontJp(17, "800");
  const eyebrowEnd = drawTracked(ctx, "UNBOXED — SINCE 2012", LEFT, 194, 5);
  ctx.strokeStyle = BX_BLUE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(eyebrowEnd + 18, 188);
  ctx.lineTo(eyebrowEnd + 98, 188);
  ctx.stroke();

  const HEAD = 84;
  ctx.font = fontJp(HEAD, "800");
  const parts1: Array<[string, string]> = [
    ["Reolの", BX_INK],
    ["これまで", BX_BLUE],
    ["と、", BX_INK],
  ];
  let x = LEFT;
  const line1Y = 296;
  for (const [text, color] of parts1) {
    ctx.fillStyle = color;
    ctx.fillText(text, x, line1Y);
    x += ctx.measureText(text).width;
  }
  // 2行目は「これまで」の頭に揃える(サイトの heroLine2Indent と同じ)
  x = LEFT + ctx.measureText("Reolの").width;
  const line2Y = line1Y + 104;
  for (const [text, color] of [
    ["これから", BX_YELLOW],
    ["を知る。", BX_INK],
  ] as Array<[string, string]>) {
    ctx.fillStyle = color;
    ctx.fillText(text, x, line2Y);
    x += ctx.measureText(text).width;
  }

  // === 数字: トップと同じ3つ。値が無いときは説明文に置き換える ===
  const rowTop = 470;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(LEFT, rowTop);
  ctx.lineTo(RIGHT, rowTop);
  ctx.stroke();

  if (stats) {
    const cells: Array<[number, string]> = [
      [stats.songCount, "SONGS"],
      [stats.liveItemCount, "LIVES"],
      [stats.performanceCount, "PERFORMANCES"],
    ];
    const cellWidth = 250;
    cells.forEach(([value, label], i) => {
      const cx = LEFT + i * cellWidth;
      if (i > 0) {
        ctx.beginPath();
        ctx.moveTo(cx - 28, rowTop + 26);
        ctx.lineTo(cx - 28, rowTop + 116);
        ctx.stroke();
      }
      ctx.fillStyle = BX_INK;
      ctx.font = fontJp(54, "800");
      ctx.fillText(value.toLocaleString("en-US"), cx, rowTop + 76);
      ctx.fillStyle = BX_INK3;
      ctx.font = fontJp(15, "700");
      drawTracked(ctx, label, cx, rowTop + 108, 4);
    });
  } else {
    ctx.fillStyle = BX_INK3;
    ctx.font = fontJp(26, "500");
    ctx.fillText("楽曲・ライブ・セトリ・ロケ地の非公式アーカイブ", LEFT, rowTop + 80);
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.font = fontJp(22, "400");
  ctx.fillText("reol.twilightea.com", RIGHT, rowTop + 108);

  return canvas.toBuffer("image/png");
};

export interface GenerateSiteOgResult {
  generated: number;
  skipped: number;
  files: string[];
}

// サイト既定のOG画像を static / public の両方へ書き出す
export const generateSiteOgImage = async (
  options: { outputDir?: string; mirrorOutputDir?: string; stats?: SiteOgStats } = {}
): Promise<GenerateSiteOgResult> => {
  const outputDir = options.outputDir || "static";
  const mirrorOutputDir = options.mirrorOutputDir || "public";
  const result: GenerateSiteOgResult = { generated: 0, skipped: 0, files: [] };

  const png = drawOgImage(options.stats);
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
