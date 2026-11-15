// Reolファンタイプ診断のシェアカード(ブラウザの canvas で描く画像)。
// 見た目はサイトの OGP 画像(scripts/generate-page-og.ts)と同じモチーフにそろえる(plan/75):
// bx-bg の黒 + 上部の公式ブルーのグロー + 横罫。左端の帯だけタイプの色。絵文字は描かない。
import { getQuizAxisLabels, getQuizGroup, getQuizType } from "../../data/reol-type/i18n";
import type { TypeCode } from "../../data/reol-type/types";
import type { SiteLang } from "../../i18n/site/langs";
import { localizePath } from "../../utils/i18nRoutes";

// B案の bx トークンと同値(tailwind.config.js 参照)
const BX_BG = "#0b0b10";
const BX_INK = "#f2f0eb";
const BX_YELLOW = "#e2bf57";

const DPR = 2;
const BAR_W = 7;

const font = (size: number, weight = "400") =>
  `${weight} ${size}px -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif`;

const createCard = (width: number, height: number, color: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = width * DPR;
  canvas.height = height * DPR;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(DPR, DPR);

  ctx.fillStyle = BX_BG;
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(width / 2, -40, 0, width / 2, -40, width * 0.52);
  glow.addColorStop(0, "rgba(39, 72, 155, 0.45)");
  glow.addColorStop(1, "rgba(39, 72, 155, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let y = 45; y < height; y += 45) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, BAR_W, height);

  return { canvas, ctx };
};

/** 幅に収まるよう文字単位で折り返す(最大 maxLines 行。あふれたら末尾を…にする) */
const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] => {
  const lines: string[] = [];
  let line = "";
  for (const ch of Array.from(text)) {
    if (ctx.measureText(line + ch).width > maxWidth && line !== "") {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  lines.push(line);
  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    shown[maxLines - 1] = `${shown[maxLines - 1].slice(0, -1)}…`;
  }
  return shown;
};

/** 見出し(ラベル・コード・型名・曲名の型・グループ)。型名は幅に収まるまで縮める */
const drawHeading = (
  ctx: CanvasRenderingContext2D,
  typeCode: TypeCode,
  lang: SiteLang,
  o: { x: number; maxWidth: number; label: string; labelY: number; nameSize: number; nameY: number; songSize: number; songY: number; groupY: number }
) => {
  const typeInfo = getQuizType(typeCode, lang);
  const group = getQuizGroup(typeInfo.group, lang);
  ctx.textAlign = "left";

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = font(11, "700");
  ctx.fillText(o.label, o.x, o.labelY);
  const labelWidth = ctx.measureText(o.label).width;
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(typeCode, o.x + labelWidth + 10, o.labelY);

  let nameSize = o.nameSize;
  ctx.font = font(nameSize, "800");
  while (nameSize > 22 && ctx.measureText(typeInfo.name).width > o.maxWidth) {
    nameSize -= 2;
    ctx.font = font(nameSize, "800");
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillText(typeInfo.name, o.x, o.nameY);

  ctx.fillStyle = BX_YELLOW;
  ctx.font = font(o.songSize, "700");
  ctx.fillText(wrapText(ctx, typeInfo.songLabel, o.maxWidth, 1)[0], o.x, o.songY);

  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.font = font(12);
  ctx.fillText(group.name, o.x, o.groupY);
};

const drawFooter = (ctx: CanvasRenderingContext2D, width: number, height: number, margin: number, path: string) => {
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = font(10);
  ctx.textAlign = "right";
  ctx.fillText(`reol.twilightea.com${path}`, width - margin, height - 14);
};

/** 診断結果のシェアカード(600x315)。4つの軸の割合を入れる */
export const generateResultShareCard = (
  typeCode: TypeCode,
  percentages: { FB: number; GE: number; SQ: number; AI: number },
  lang: SiteLang = "ja"
): string => {
  const W = 600;
  const H = 315;
  const X = 32;
  const typeInfo = getQuizType(typeCode, lang);
  const { canvas, ctx } = createCard(W, H, typeInfo.color);
  const barW = W - X * 2;

  drawHeading(ctx, typeCode, lang, {
    x: X,
    maxWidth: barW,
    label: "REOL FAN TYPE",
    labelY: 36,
    nameSize: 38,
    nameY: 84,
    songSize: 16,
    songY: 112,
    groupY: 134,
  });

  const axes = getQuizAxisLabels(lang);
  let y = 172;
  for (const key of ["FB", "GE", "SQ", "AI"] as const) {
    const pct = percentages[key];
    const leftWins = pct >= 50;
    ctx.font = font(10, leftWins ? "700" : "400");
    ctx.fillStyle = leftWins ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "left";
    ctx.fillText(`${axes[key].left.label} ${pct}%`, X, y - 5);
    ctx.font = font(10, leftWins ? "400" : "700");
    ctx.fillStyle = leftWins ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.9)";
    ctx.textAlign = "right";
    ctx.fillText(`${100 - pct}% ${axes[key].right.label}`, X + barW, y - 5);

    // 割合の大きい側を濃くする(結果の画面の線と同じ)
    const leftW = barW * (pct / 100);
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(X, y, barW, 4);
    ctx.fillStyle = BX_INK;
    if (leftWins) ctx.fillRect(X, y, leftW, 4);
    else ctx.fillRect(X + leftW, y, barW - leftW, 4);
    y += 28;
  }

  drawFooter(ctx, W, H, X, localizePath("/quiz/reol-type/", lang));
  return canvas.toDataURL("image/png");
};

/** タイプ詳細のシェアカード(600x360)。歌詞の一節と概要を入れる */
export const generateTypeShareCard = (typeCode: TypeCode, lang: SiteLang = "ja"): string => {
  const W = 600;
  const H = 360;
  const X = 28;
  const typeInfo = getQuizType(typeCode, lang);
  const { canvas, ctx } = createCard(W, H, typeInfo.color);
  const maxWidth = W - X * 2;

  drawHeading(ctx, typeCode, lang, {
    x: X,
    maxWidth,
    label: "REOL FAN TYPE",
    labelY: 36,
    nameSize: 42,
    nameY: 88,
    songSize: 18,
    songY: 118,
    groupY: 141,
  });

  // 歌詞の一節(左に細い線)
  ctx.textAlign = "left";
  ctx.font = font(15);
  const quoteLines = wrapText(ctx, `「${typeInfo.quote}」`, maxWidth - 14, 2);
  const lineHeight = 22;
  let y = 164;
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(X, y - 2, 2, quoteLines.length * lineHeight + 4);
  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  for (const line of quoteLines) {
    ctx.fillText(line, X + 14, y + 14);
    y += lineHeight;
  }
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.font = font(12);
  ctx.fillText(`— ${typeInfo.song}`, X + 14, y + 12);
  y += 30;

  // 概要
  ctx.font = font(15);
  ctx.fillStyle = "rgba(255, 255, 255, 0.62)";
  for (const line of wrapText(ctx, typeInfo.summary, maxWidth, 3)) {
    ctx.fillText(line, X, y + 14);
    y += 22;
  }

  drawFooter(ctx, W, H, X, localizePath(`/quiz/reol-type/types/${typeCode.toLowerCase()}/`, lang));
  return canvas.toDataURL("image/png");
};

/** シェアカードを渡す。共有シートが使える端末(iOS Safari など)では共有、ほかはダウンロード */
export const saveShareImage = async (dataUrl: string, typeCode: TypeCode): Promise<void> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const fileName = `reol-type-${typeCode}.png`;
  const file = new File([blob], fileName, { type: "image/png" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (e) {
      // ユーザーキャンセルは無視
      if ((e as Error).name === "AbortError") return;
    }
  }

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
};
