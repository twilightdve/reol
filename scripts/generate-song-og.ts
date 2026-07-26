// 楽曲詳細ページ(/songs/<slug>/)ごとのOGP画像(1200x630)のビルド時生成スクリプト
//
// - generate-site-og.ts / generate-reol-type-og.ts と同じ node-canvas ベースの手法を踏襲する
// - 演奏回数・初披露日はビルド時に確定している songStats から描画するだけで、新規執筆は不要
// - gatsby-node.ts の sourceNodes(createSongStatsNodes)から呼ばれる

import { promises as fs } from "fs";
import path from "path";
import { createCanvas } from "canvas";

const WIDTH = 1200;
const HEIGHT = 630;
const MARGIN_X = 96;

// B案(BLACKBOX / CHRONICLE)のbxトークンと同値(tailwind.config.js参照)
const BX_BG = "#0b0b10";
const BX_YELLOW = "#e2bf57";
const BX_BLUE_DEEP = "#27489b";

const fontJp = (size: number, weight = "400") =>
  `${weight} ${size}px "Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif`;

export interface SongOgInput {
  slug: string;
  songName: string;
  totalPlays: number;
  firstPlayedDate: string | null;
}

const drawOgImage = (song: SongOgInput): Buffer => {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // === 背景: サイト既定OGと同モチーフ(bx-bg + 上部ブルーグロー) ===
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

  ctx.fillStyle = BX_YELLOW;
  ctx.fillRect(0, 0, 14, HEIGHT);

  const maxWidth = WIDTH - MARGIN_X * 2;
  ctx.textAlign = "left";

  // === ヘッダー: サービス名ラベル ===
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = fontJp(28, "500");
  ctx.fillText("SONG ARCHIVE", MARGIN_X, 128);

  // === メイン: 曲名(幅に収まるまで縮小) ===
  let titleSize = 88;
  ctx.font = fontJp(titleSize, "800");
  while (titleSize > 40 && ctx.measureText(song.songName).width > maxWidth) {
    titleSize -= 4;
    ctx.font = fontJp(titleSize, "800");
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillText(song.songName, MARGIN_X, 296);

  // === 演奏統計 ===
  ctx.fillStyle = BX_YELLOW;
  ctx.font = fontJp(44, "700");
  const statLine =
    song.totalPlays > 0
      ? `演奏 ${song.totalPlays.toLocaleString()}回 ・ 初披露 ${song.firstPlayedDate ?? "不明"}`
      : "ライブでの演奏記録は確認されていません";
  ctx.fillText(statLine, MARGIN_X, 380);

  // === フッター ===
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.moveTo(MARGIN_X, 516);
  ctx.lineTo(WIDTH - MARGIN_X, 516);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.font = fontJp(28, "500");
  ctx.fillText("!Legit(非公式ファンサイト)", MARGIN_X, 568);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = fontJp(24, "400");
  ctx.fillText("reol.twilightea.com", WIDTH - MARGIN_X, 568);

  ctx.fillStyle = BX_BLUE_DEEP;
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.arc(WIDTH - 60, HEIGHT - 60, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  return canvas.toBuffer("image/png");
};

export interface GenerateSongOgResult {
  generated: number;
  skipped: number;
  files: string[];
}

// 楽曲ごとのOG画像を static / public の両方へ書き出す
export const generateSongOgImages = async (
  songs: SongOgInput[],
  options: { outputDir?: string; mirrorOutputDir?: string } = {}
): Promise<GenerateSongOgResult> => {
  const outputDir = options.outputDir || "static/og/songs";
  const mirrorOutputDir = options.mirrorOutputDir || "public/og/songs";
  const result: GenerateSongOgResult = { generated: 0, skipped: 0, files: [] };

  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(mirrorOutputDir, { recursive: true });

  for (const song of songs) {
    if (!song.slug) continue;
    const png = drawOgImage(song);
    const fileName = `${song.slug}.png`;
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
  }

  return result;
};
