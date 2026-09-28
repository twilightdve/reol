/**
 * 「生で聴いた曲 N/M」のシェアカード(案K・plan/25 §6、plan/27 ステップ5)。
 *
 * 参戦済みにした公演のセットリストから集計した値を、ブラウザ内の canvas で1枚の画像にする。
 * サーバーには何も送らない(画像の保存・共有は閲覧者の端末で行う)。
 * カードはサイトのダーク配色に固定する(楽曲ソーターのシェアカードと同じ方針)。
 */
import React, { useState } from "react";
import { usePageDict, useSiteLang } from "../../../i18n/site/SiteLangContext";
import { heardShareDict } from "../../../i18n/site/pages/heardShare";
import { localizePath } from "../../../utils/i18nRoutes";
import { trackEvent } from "../../../utils/analytics";

type HeardShareDict = (typeof heardShareDict)["ja"];

export type HeardShareStats = {
  heard: number;
  total: number;
  shows: number;
  sinceYear: number | null;
  topSongs: { name: string; count: number }[];
};

const SITE_HOST = "reol.twilightea.com";
const W = 1200;
const H = 630;
const DPR = 2;
const COLORS = {
  bg: "#0b0b10",
  ink: "#f2f0eb",
  ink2: "#a5a4ac",
  ink3: "#8f8e96",
  line: "#26262e",
  yellow: "#e2bf57",
};

const font = (size: number, weight = "400") =>
  `${weight} ${size}px "Hiragino Sans", "Noto Sans JP", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif`;

/** 幅に収まるまでフォントを縮め、それでも収まらなければ末尾を…で切る */
const fitText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  size: number,
  weight: string,
  minSize: number
): { text: string; size: number } => {
  let s = size;
  ctx.font = font(s, weight);
  while (s > minSize && ctx.measureText(text).width > maxWidth) {
    s -= 2;
    ctx.font = font(s, weight);
  }
  if (ctx.measureText(text).width <= maxWidth) return { text, size: s };
  let cut = text;
  while (cut && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1);
  return { text: `${cut}…`, size: s };
};

export const drawCard = (stats: HeardShareStats, t: HeardShareDict, path: string): string => {
  const canvas = document.createElement("canvas");
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(DPR, DPR);

  // 背景(サイト既定OGと同じモチーフ)
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, -80, 0, W / 2, -80, 620);
  glow.addColorStop(0, "rgba(39, 72, 155, 0.45)");
  glow.addColorStop(1, "rgba(39, 72, 155, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = COLORS.yellow;
  ctx.fillRect(0, 0, 14, H);

  const left = 80;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = COLORS.ink3;
  ctx.font = font(24, "700");
  ctx.fillText(t.cardKicker, left, 96);

  ctx.fillStyle = COLORS.ink;
  ctx.font = font(40, "800");
  ctx.fillText(t.cardTitle, left, 156);

  // 大きな数字「N / M 曲」
  const rate = stats.total > 0 ? Math.round((stats.heard / stats.total) * 100) : 0;
  // 3桁の曲数や長い単位(英語の songs)でも右列に食い込まないよう、左列の幅に収まるまで縮める
  const heardText = String(stats.heard);
  const totalText = ` / ${stats.total} ${t.cardSongsUnit}`;
  const maxNumberWidth = 640;
  let bigSize = 150;
  let subSize = 48;
  const measure = () => {
    ctx.font = font(bigSize, "800");
    const w1 = ctx.measureText(heardText).width;
    ctx.font = font(subSize, "700");
    return w1 + ctx.measureText(totalText).width;
  };
  while (bigSize > 90 && measure() > maxNumberWidth) {
    bigSize -= 6;
    subSize = Math.round(bigSize * 0.32);
  }
  ctx.fillStyle = COLORS.yellow;
  ctx.font = font(bigSize, "800");
  ctx.fillText(heardText, left - 6, 318);
  const heardWidth = ctx.measureText(heardText).width;
  ctx.fillStyle = COLORS.ink2;
  ctx.font = font(subSize, "700");
  ctx.fillText(totalText, left + heardWidth, 318);

  // 達成率バー
  const barW = 540;
  ctx.fillStyle = COLORS.line;
  ctx.fillRect(left, 350, barW, 12);
  ctx.fillStyle = COLORS.yellow;
  ctx.fillRect(left, 350, (barW * rate) / 100, 12);
  ctx.fillStyle = COLORS.ink;
  ctx.font = font(28, "800");
  ctx.fillText(`${rate}%`, left + barW + 16, 364);

  // 参戦公演数・参戦開始年
  ctx.fillStyle = COLORS.ink;
  ctx.font = font(30, "700");
  const showsLine = [t.cardShows(stats.shows), stats.sinceYear ? t.cardSince(stats.sinceYear) : null]
    .filter(Boolean)
    .join("  ·  ");
  ctx.fillText(showsLine, left, 430);

  // 右列: よく聴いた曲 TOP3
  if (stats.topSongs.length > 0) {
    const col = 760;
    const colW = W - col - 70;
    ctx.fillStyle = COLORS.ink3;
    ctx.font = font(24, "700");
    ctx.fillText(t.cardTopHeading, col, 156);
    stats.topSongs.slice(0, 3).forEach((song, i) => {
      const y = 226 + i * 76;
      ctx.fillStyle = COLORS.yellow;
      ctx.font = font(34, "800");
      ctx.fillText(String(i + 1), col, y);
      ctx.fillStyle = COLORS.ink3;
      ctx.font = font(22, "700");
      ctx.textAlign = "right";
      const times = t.cardTimes(song.count);
      ctx.fillText(times, col + colW, y);
      const timesW = ctx.measureText(times).width;
      ctx.textAlign = "left";
      const fitted = fitText(ctx, song.name, colW - 44 - timesW - 12, 30, "700", 20);
      ctx.fillStyle = COLORS.ink;
      ctx.font = font(fitted.size, "700");
      ctx.fillText(fitted.text, col + 44, y);
    });
  }

  // フッター
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, 520);
  ctx.lineTo(W - 70, 520);
  ctx.stroke();
  ctx.fillStyle = COLORS.ink2;
  ctx.font = font(24, "600");
  ctx.fillText(t.cardFooter, left, 572);
  ctx.textAlign = "right";
  ctx.fillStyle = COLORS.ink3;
  ctx.font = font(22, "500");
  ctx.fillText(`${SITE_HOST}${path}`, W - 70, 572);

  return canvas.toDataURL("image/png");
};

const HeardSongsShare: React.FC<{ stats: HeardShareStats }> = ({ stats }) => {
  const t = usePageDict(heardShareDict);
  const lang = useSiteLang();
  const path = localizePath("/live/", lang);
  const [image, setImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const rate = stats.total > 0 ? Math.round((stats.heard / stats.total) * 100) : 0;
  const text = t.shareText(stats.heard, stats.total, rate, stats.shows);
  const url = `https://${SITE_HOST}${path}`;

  const create = () => {
    setImage(drawCard(stats, t, path));
    trackEvent("heard_share_card", { category: "engagement", label: "作成" });
  };

  const saveImage = async () => {
    if (!image) return;
    trackEvent("heard_share_card", { category: "engagement", label: "画像保存" });
    const blob = await (await fetch(image)).blob();
    const file = new File([blob], "reol-live-log.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: `${text}\n${url}` });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copyText = () => {
    navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    trackEvent("heard_share_card", { category: "engagement", label: "テキストコピー" });
  };

  const xIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  if (!image) {
    return (
      <button
        type="button"
        onClick={create}
        className="mt-2 px-3 py-1.5 text-[11px] font-bold rounded-full border border-bx-yellow text-bx-yellow hover:bg-bx-yellow hover:text-bx-bg transition-colors"
      >
        {t.create}
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <img src={image} alt={t.preview} className="w-full rounded-lg border border-bx-line" />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={saveImage}
          className="px-3 py-1.5 text-[11px] font-bold rounded-full border border-bx-yellow text-bx-yellow hover:bg-bx-yellow hover:text-bx-bg transition-colors"
        >
          {t.saveImage}
        </button>
        <a
          href={xIntent}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("heard_share_card", { category: "engagement", label: "Xでポスト" })}
          className="px-3 py-1.5 text-[11px] font-bold rounded-full border border-bx-blue text-bx-blue hover:bg-bx-blue hover:text-bx-bg transition-colors"
        >
          {t.postToX}
        </a>
        <button
          type="button"
          onClick={copyText}
          className="px-3 py-1.5 text-[11px] font-bold rounded-full border border-bx-line text-bx-ink2 hover:border-bx-blue transition-colors"
        >
          {copied ? t.copied : t.copyText}
        </button>
        <button
          type="button"
          onClick={() => setImage(null)}
          className="px-3 py-1.5 text-[11px] rounded-full text-bx-ink3 hover:text-bx-ink transition-colors"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};

export default HeardSongsShare;
