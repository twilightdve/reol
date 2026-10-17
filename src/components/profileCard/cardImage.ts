/**
 * プロフィールカード(plan/48)を PNG にする。画面の見た目を写す方式は外部の画像やフォントで崩れやすいので、canvas に直接描く。
 * 画像には QR も入れる(画像を受け取った人も読み取れる)。
 */
import { reolTypes, TypeCode } from "../../data/reol-type/types";
import { CardPayload, SNS } from "../../utils/profileCard/codec";
import { cardAccent, cardInitial } from "./ProfileCardFace";

const W = 1080;
const PAD = 80;
const FONT = '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", system-ui, sans-serif';

/** 角丸の四角(roundRect の無い古いブラウザは角丸なし) */
const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
};

/** 1文字ずつ測って折り返す(日本語は単語の区切りが無いため) */
const wrap = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const lines: string[] = [];
  let line = "";
  for (const ch of Array.from(text)) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else line += ch;
  }
  if (line) lines.push(line);
  return lines;
};

export const renderCardImage = async (p: CardPayload, qr: HTMLCanvasElement): Promise<Blob> => {
  if (document.fonts?.ready) await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = 3000;
  const ctx = canvas.getContext("2d")!;
  const accent = cardAccent(p);
  const inner = W - PAD * 2;
  ctx.textBaseline = "top";

  ctx.fillStyle = "#101014";
  ctx.fillRect(0, 0, W, canvas.height);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 14);

  let y = 70;
  ctx.fillStyle = "rgba(255,255,255,.6)";
  ctx.font = `800 26px ${FONT}`;
  ctx.fillText("PROFILE CARD", PAD, y);
  if (p.e) {
    ctx.font = `700 28px ${FONT}`;
    const label = wrap(ctx, p.e, 560)[0];
    const w = ctx.measureText(label).width + 40;
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.lineWidth = 2;
    roundRect(ctx, W - PAD - w, y - 10, w, 50, 25);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fillText(label, W - PAD - w + 20, y + 1);
  }
  y += 80;

  // アイコン(頭文字)と名前
  const R = 80;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(PAD + R, y + R, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `800 76px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText(cardInitial(p.n), PAD + R, y + R - 40);
  ctx.textAlign = "left";
  ctx.font = `800 64px ${FONT}`;
  const nameLines = wrap(ctx, p.n, inner - R * 2 - 40);
  const nameTop = y + R - (nameLines.length * 78) / 2;
  nameLines.forEach((l, i) => ctx.fillText(l, PAD + R * 2 + 40, nameTop + i * 78));
  y += Math.max(R * 2, nameLines.length * 78) + 40;

  if (p.b) {
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.font = `400 38px ${FONT}`;
    for (const l of wrap(ctx, p.b, inner)) {
      ctx.fillText(l, PAD, y);
      y += 58;
    }
    y += 20;
  }

  const section = (label: string) => {
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.font = `800 24px ${FONT}`;
    ctx.fillText(label, PAD, y);
    y += 40;
  };
  const line = (text: string, size: number, weight: number, color = "#fff", indent = 0) => {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px ${FONT}`;
    for (const l of wrap(ctx, text, inner - indent)) {
      ctx.fillText(l, PAD + indent, y);
      y += Math.round(size * 1.45);
    }
  };

  const type = p.t ? reolTypes[p.t as TypeCode] : null;
  if (type) {
    section("REOL TYPE");
    line(`${type.emoji} ${type.name}  ${type.songLabel}`, 38, 700);
    y += 24;
  }
  if (p.s?.length) {
    section("FAVORITE SONGS");
    p.s.forEach((s) => line(s, 38, 700));
    y += 24;
  }
  if (p.a) {
    section("LIVE");
    line(`参戦 ${p.a.c} 公演`, 40, 700);
    if (p.a.f) line(`はじめて  ${p.a.f}`, 28, 400, "rgba(255,255,255,.75)");
    if (p.a.l && p.a.l !== p.a.f) line(`直近  ${p.a.l}`, 28, 400, "rgba(255,255,255,.75)");
    y += 24;
  }
  const sns = SNS.filter((s) => p.x?.[s.key]);
  if (sns.length) {
    section("SNS");
    sns.forEach((s) => line(`${s.label}  @${p.x![s.key]}`, 34, 700));
    y += 24;
  }

  // QR(白地に余白をつけて、読み取りやすく)
  y += 20;
  const Q = 420;
  ctx.fillStyle = "#fff";
  roundRect(ctx, (W - Q - 60) / 2, y, Q + 60, Q + 60, 24);
  ctx.fill();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qr, (W - Q) / 2, y + 30, Q, Q);
  y += Q + 60 + 24;
  ctx.fillStyle = "rgba(255,255,255,.6)";
  ctx.font = `400 26px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("読み取るとカードが開きます", W / 2, y);
  y += 70;
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.font = `700 22px ${FONT}`;
  ctx.fillText("!Legit — reol.twilightea.com", W / 2, y);
  y += 70;

  const out = document.createElement("canvas");
  out.width = W;
  out.height = y;
  out.getContext("2d")!.drawImage(canvas, 0, 0);
  return new Promise((resolve, reject) => out.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"));
};

/** iPhone などは共有シート(写真に保存・DM で送る)、使えない時はダウンロード */
export const shareOrDownload = async (blob: Blob, filename: string): Promise<"shared" | "downloaded" | "cancelled"> => {
  const file = new File([blob], filename, { type: "image/png" });
  if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return "shared";
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return "cancelled";
      // 共有できなかった時はダウンロードへ
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return "downloaded";
};
