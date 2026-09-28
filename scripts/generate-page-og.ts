// 公演詳細(/live/<slug>/)と On This Day(/on-this-day/MM-DD/)の OGP 画像(1200x630)をビルド時に生成する
// (plan/27 ステップ5)。
//
// - generate-song-og.ts と同じ node-canvas ベースの見た目(bx トークン)にそろえる
// - 件数が多い(公演約200・On This Day 約190日)ため、リポジトリには置かず public/og にだけ書き出す。
//   ビルドのたびに作り直す(曲の OG のように static/ にコミットすると数十MB増えるため)
// - 容量を抑えるため JPEG で書き出す

import { promises as fs } from "fs";
import path from "path";
import { createCanvas, type CanvasRenderingContext2D } from "canvas";

const WIDTH = 1200;
const HEIGHT = 630;
const MARGIN_X = 96;

// B案(BLACKBOX / CHRONICLE)の bx トークンと同値(tailwind.config.js 参照)
const BX_BG = "#0b0b10";
const BX_YELLOW = "#e2bf57";
const BX_BLUE_DEEP = "#27489b";

const fontJp = (size: number, weight = "400") =>
  `${weight} ${size}px "Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif`;

export interface PageOgInput {
  /** public/og からの相対パス(例: "live/unbox-tokyo.jpg") */
  file: string;
  /** 上部の小さなラベル(例: "LIVE ARCHIVE") */
  kicker: string;
  title: string;
  /** タイトルの下に並べる行(最大3行) */
  lines: string[];
}

/** 幅に収まるよう文字単位で折り返す(最大 maxLines 行。あふれたら末尾を…にする) */
const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] => {
  const lines: string[] = [];
  let current = "";
  for (const ch of Array.from(text)) {
    if (ctx.measureText(current + ch).width > maxWidth && current) {
      lines.push(current);
      current = ch;
      if (lines.length === maxLines) break;
    } else {
      current += ch;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  const consumed = lines.join("").length;
  if (consumed < Array.from(text).length) {
    let last = lines[lines.length - 1];
    while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
};

const drawOgImage = (input: PageOgInput): Buffer => {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // 背景: サイト既定OG・曲OGと同じモチーフ(bx-bg + 上部ブルーグロー + 横罫)
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

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = fontJp(28, "500");
  ctx.fillText(input.kicker, MARGIN_X, 118);

  // タイトル: まず縮小し、それでも収まらなければ2行に折り返す
  let titleSize = 76;
  ctx.font = fontJp(titleSize, "800");
  while (titleSize > 56 && ctx.measureText(input.title).width > maxWidth) {
    titleSize -= 4;
    ctx.font = fontJp(titleSize, "800");
  }
  const titleLines = wrapText(ctx, input.title, maxWidth, 2);
  ctx.fillStyle = "#ffffff";
  let y = titleLines.length === 1 ? 250 : 214;
  for (const line of titleLines) {
    ctx.fillText(line, MARGIN_X, y);
    y += titleSize * 1.18;
  }

  // 詳細行
  ctx.fillStyle = BX_YELLOW;
  ctx.font = fontJp(34, "700");
  let lineY = Math.max(y + 14, 330);
  for (const line of input.lines.slice(0, 3)) {
    const [fitted] = wrapText(ctx, line, maxWidth, 1);
    ctx.fillText(fitted, MARGIN_X, lineY);
    lineY += 50;
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.font = fontJp(30, "500");
  }

  // フッター
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

  return canvas.toBuffer("image/jpeg", { quality: 0.86 });
};

export const generatePageOgImages = async (
  inputs: PageOgInput[],
  options: { outputDir?: string } = {}
): Promise<{ generated: number; bytes: number }> => {
  const outputDir = options.outputDir || "public/og";
  let bytes = 0;
  for (const input of inputs) {
    const target = path.join(outputDir, input.file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    const jpg = drawOgImage(input);
    bytes += jpg.length;
    await fs.writeFile(target, jpg);
  }
  return { generated: inputs.length, bytes };
};
