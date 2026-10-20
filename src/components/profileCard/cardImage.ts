/**
 * プロフィールカード(plan/48)を PNG にする。画面の見た目を写す方式は外部の画像やフォントで崩れやすいので、canvas に直接描く。
 * 画像には QR も入れる(画像を受け取った人も読み取れる)。
 */
import { reolTypes, TypeCode } from "../../data/reol-type/types";
import { CardPayload, SNS, liveSummary } from "../../utils/profileCard/codec";
import { cardAccent, cardInitial } from "./ProfileCardFace";
import { cardStyleOf } from "./cardStyles";

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
      lines.push(line.trimEnd());
      // 折り返した行の頭の空白は落とす
      line = ch.trim();
    } else line += ch;
  }
  if (line) lines.push(line);
  return lines;
};

/** icon: アイコン画像(この端末だけのもの。無ければ頭文字) */
export const renderCardImage = async (p: CardPayload, qr: HTMLCanvasElement, icon: HTMLImageElement | null = null): Promise<Blob> => {
  if (document.fonts?.ready) await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = 3000;
  const ctx = canvas.getContext("2d")!;
  const accent = cardAccent(p);
  const st = cardStyleOf(p.y);
  const inner = W - PAD * 2;
  ctx.textBaseline = "top";

  // 背景は、高さが決まった後に下の out へ描く(グラデーションを最後まで伸ばすため)。ここは文字だけ
  ctx.fillStyle = st.bar(accent);
  ctx.fillRect(0, 0, W, 14);

  let y = 70;
  ctx.fillStyle = st.muted;
  ctx.font = `800 26px ${FONT}`;
  ctx.fillText("PROFILE CARD", PAD, y);
  y += 80;

  // アイコン(頭文字)と名前
  const R = 80;
  ctx.fillStyle = st.avatarBg(accent);
  ctx.beginPath();
  ctx.arc(PAD + R, y + R, R, 0, Math.PI * 2);
  ctx.fill();
  if (icon) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(PAD + R, y + R, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(icon, PAD, y, R * 2, R * 2);
    ctx.restore();
  } else {
    ctx.fillStyle = st.avatarInk;
    ctx.font = `800 76px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(cardInitial(p.n), PAD + R, y + R - 40);
    ctx.textAlign = "left";
  }
  ctx.fillStyle = st.ink;
  ctx.font = `800 64px ${FONT}`;
  const nameLines = wrap(ctx, p.n, inner - R * 2 - 40);
  const nameTop = y + R - (nameLines.length * 78) / 2;
  nameLines.forEach((l, i) => ctx.fillText(l, PAD + R * 2 + 40, nameTop + i * 78));
  y += Math.max(R * 2, nameLines.length * 78) + 40;

  if (p.b) {
    ctx.fillStyle = st.ink2;
    ctx.font = `400 38px ${FONT}`;
    for (const l of wrap(ctx, p.b, inner)) {
      ctx.fillText(l, PAD, y);
      y += 58;
    }
    y += 20;
  }

  const section = (label: string) => {
    ctx.fillStyle = st.muted;
    ctx.font = `800 24px ${FONT}`;
    ctx.fillText(label, PAD, y);
    y += 40;
  };
  const line = (text: string, size: number, weight: number, color = st.ink, indent = 0) => {
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
  for (const [label, songs] of [
    ["FAVORITE SONGS", p.s],
    ["FAVORITE COVERS", p.c],
  ] as const) {
    if (!songs?.length) continue;
    section(label);
    songs.forEach((s) => line(s, 38, 700));
    y += 24;
  }
  if (p.e) {
    section("MEMORABLE LIVE");
    line(p.e, 36, 700);
    y += 24;
  }
  if (p.a) {
    section("LIVE参戦");
    line(liveSummary(p.a), 38, 700);
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
  ctx.fillStyle = st.muted;
  ctx.font = `400 26px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("読み取るとカードが開きます", W / 2, y);
  y += 70;
  ctx.fillStyle = st.faint;
  ctx.font = `700 22px ${FONT}`;
  ctx.fillText("!Legit — reol.twilightea.com", W / 2, y);
  y += 70;

  const out = document.createElement("canvas");
  out.width = W;
  out.height = y;
  const octx = out.getContext("2d")!;
  const [top, bottom] = st.bg(accent);
  const grad = octx.createLinearGradient(0, 0, 0, y);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  octx.fillStyle = grad;
  octx.fillRect(0, 0, W, y);
  octx.drawImage(canvas, 0, 0);
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
