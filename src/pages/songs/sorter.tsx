/**
 * /songs/sorter/ — 新規コンテンツ案F「楽曲ソーター」(plan/legit-improvement-plan.md 5章)
 *
 * 2曲ずつ勝ち抜き戦を選び続ける、真のシングルエリミネーション方式トーナメント。
 * MusicCup(https://musiccup.app/)のような「1試合ごとの対戦ノード + 優勝までの
 * ハイライト経路」を持つブラケット共有カードを作るため、全曲の完全順位を出す
 * マージソート方式(旧実装)から切り替えた。トレードオフとして全曲ランキング表示は
 * 出せなくなる(1位=優勝曲のみが確定し、2位以下の細かい順位は決まらない)。
 *
 * 左右2ブロックに分けて別々に勝ち上がらせ、両ブロックの優勝者同士を決勝で当てる
 * 構成。対戦の一時停止/再開は src/utils/bracketSorter.ts の BracketSorter が担う。
 * 集計は現状この端末のみ(localStorage)。
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { graphql, HeadFC, Link, PageProps } from "gatsby";
import Layout from "../../components/modules/layout";
import SEO from "../../components/SEO";
import { Kicker } from "../../components/redesign";
import { BracketSorter, BracketMatch, shuffle } from "../../utils/bracketSorter";
import { buildBreadcrumbList } from "../../utils/jsonLd";

type SongRow = {
  songUuid: string;
  slug: string;
  songName: string;
};

type SongDataRow = SongRow & {
  artworkUrl: string | null;
};

type SorterPageData = {
  songStats: {
    songStats: SongDataRow[];
  };
};

type Phase = "select" | "sorting" | "result";

const SIZE_OPTIONS = [16, 32, 64] as const;

const STORAGE_KEY = "reol-song-sorter-bracket-result";

type FinishedBracket = {
  leftRounds: BracketMatch<SongRow>[][];
  rightRounds: BracketMatch<SongRow>[][];
  finalMatch: BracketMatch<SongRow>;
  champion: SongRow;
};

type SavedMatch = {
  p1: string | null;
  p2: string | null;
  winner: string | null;
};

type SavedResult = {
  size: number;
  leftRounds: SavedMatch[][];
  rightRounds: SavedMatch[][];
  finalMatch: SavedMatch;
  savedAt: string;
};

const toSavedMatch = (m: BracketMatch<SongRow>): SavedMatch => ({
  p1: m.p1?.songUuid ?? null,
  p2: m.p2?.songUuid ?? null,
  winner: m.winner?.songUuid ?? null,
});

const fromSavedMatch = (
  m: SavedMatch,
  byUuid: Map<string, SongRow>
): BracketMatch<SongRow> | null => {
  const p1 = m.p1 ? byUuid.get(m.p1) ?? null : null;
  const p2 = m.p2 ? byUuid.get(m.p2) ?? null : null;
  const winner = m.winner ? byUuid.get(m.winner) ?? null : null;
  // 保存後に曲データが変わっていた場合は復元不能として扱う
  if ((m.p1 && !p1) || (m.p2 && !p2) || (m.winner && !winner)) return null;
  return { side: "left", round: 0, p1, p2, winner };
};

const loadSaved = (): SavedResult | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveResult = (r: SavedResult) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
  } catch {
    // ignore
  }
};

// シェアカードはサイトのダーク配色(bx-*)に固定。ライト/ダーク切替の影響を受けない
// 画像として保存・投稿されるため、CSS変数ではなく src/styles/global.scss の
// ダークテーマ値をそのまま使う。
const CARD_COLORS = {
  bg: "#0b0b10",
  ink: "#f2f0eb",
  ink2: "#8f8e96",
  ink3: "#a5a4ac",
  line: "#26262e",
  blueDeep: "rgba(39, 72, 155, 0.35)",
  yellow: "#e2bf57",
};

// 曲のジャケット画像。URLはビルド時にSpotify oEmbedで解決済みで、画像そのものは
// 自サイトに保存せずSpotifyの画像CDNから直接読み込む。Canvasに描いた後もtoBlobできるよう
// crossOrigin="anonymous"で読み込む(CDNはAccess-Control-Allow-Origin: *を返す)。
// URLが無い曲・読み込みに失敗した曲はnullにフォールバックし、プレースホルダータイルを描く。
const loadImage = (src: string | null | undefined): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

// MusicCup(https://musiccup.app/)を参考にした、左右2ブロックが中央の優勝者へ
// 収束するトーナメントブラケットをCanvasで描く。1試合ごとに実際の対戦相手・勝敗が
// 記録されているため(BracketSorterの実データ)、優勝までの経路をハイライトできる。
const generateBracketShareCard = async (
  finished: FinishedBracket,
  totalCount: number,
  artworkUrlBySlug: Map<string, string | null>
): Promise<string> => {
  const { leftRounds, rightRounds, finalMatch, champion } = finished;
  const roundsInSide = leftRounds.length;
  const half = leftRounds[0].length * 2;

  const slugs = new Set<string>();
  for (const rounds of [leftRounds, rightRounds]) {
    for (const round of rounds) {
      for (const m of round) {
        if (m.p1) slugs.add(m.p1.slug);
        if (m.p2) slugs.add(m.p2.slug);
      }
    }
  }
  const images = new Map<string, HTMLImageElement | null>();
  await Promise.all(
    Array.from(slugs).map(async (slug) => {
      images.set(slug, await loadImage(artworkUrlBySlug.get(slug)));
    })
  );

  // SNSのストーリー/リール向けに、出力は常に9:16固定(1080×1920)。曲数に関わらず
  // 中身がこのフレームを埋めるよう、行の高さ・列の間隔を毎回このサイズから逆算する
  // (固定フレームに後から縮小コピーして余白を作るのではなく、最初から埋める)。
  const W = 1080;
  const H = 1920;
  const MARGIN = 36;
  const HEADER_H = 122;
  const FOOTER_H = 84;
  const PODIUM = 150;
  const CENTER_W = PODIUM + 110;

  const bodyH = H - HEADER_H - FOOTER_H;
  const ROW_H = bodyH / half; // 1回戦の人数(half)が多いほど1行は薄くなる

  // ピルの高さ(可読性)はROW_Hに比例させつつ上下限で抑える。ROW_Hより大きくすると
  // 同じ列内で隣のピルと重なるため、ROW_H-4を上限として常に隙間を確保する。
  const PILL_H = Math.max(22, Math.min(90, Math.min(ROW_H - 4, ROW_H * 0.55)));
  // サムネイルはピルの高さに対してやや小さめに収める(ピルいっぱいまで
  // 大きくすると窮屈に見えるため)。
  const THUMB = Math.max(16, (PILL_H - 14) * 0.88);
  // ピルの幅は曲名の実際の長さに合わせて伸縮させる(短い曲名で余白が余りすぎない
  // ように)。PILL_W_MAXは「これ以上は広げない」上限、PILL_W_MINは見た目が崩れない
  // ための下限。
  const PILL_W_MAX = Math.max(120, Math.min(220, PILL_H * 2.5));
  // ピルは丸みの強いカプセル型(角の半径=高さの半分)。サムネイルはほぼ直角の
  // 四角形なので、左端からの余白が浅いとカプセルの曲線からサムネイルの角が
  // はみ出す。半径R・サムネイル半高hから、はみ出さない最小余白を逆算する。
  const capR = PILL_H / 2;
  const thumbHalfH = THUMB / 2;
  const capInset = thumbHalfH < capR ? capR - Math.sqrt(capR * capR - thumbHalfH * thumbHalfH) : capR;
  const PILL_PAD_LEFT = Math.ceil(capInset) + 4;
  const PILL_TEXT_GAP = 8;
  const PILL_PAD_RIGHT = 14;
  const PILL_W_MIN = Math.max(90, PILL_PAD_LEFT + THUMB + PILL_TEXT_GAP + PILL_PAD_RIGHT + 20);
  // 曲名のフォントサイズはこの対戦規模での理想値(ENTRY_FONT)を基準に、
  // 最大幅(PILL_W_MAX)に収まる範囲で決める。読みやすさの下限は必ず守り、省略はしない。
  const ENTRY_FONT = Math.max(12, Math.min(18, PILL_H * 0.3));

  // 列の間隔(横方向の詰め具合)は、片側に使える幅ちょうどに収まるよう、
  // ピルの最大幅を基準に逆算する(実際のピルはこれより狭くなることが多い)。
  const sideBudget = (W - MARGIN * 2 - CENTER_W) / 2;
  const STRIDE = Math.max(24, (sideBudget - PILL_W_MAX) / Math.max(1, roundsInSide));

  const centerX = W / 2;
  const finalY = HEADER_H + bodyH / 2;

  const DPR = W * H > 2_400_000 ? 1 : 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(DPR, DPR);

  const font = (size: number, weight = "400") =>
    `${weight} ${size}px -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif`;

  // 曲名は省略しない。理想サイズ(baseSize)から始めて、収まるまでフォントサイズを
  // 下限(minSize)まで縮める(短い曲名はbaseSizeのまま、可読性の下限は必ず守る)。
  const fitFontSize = (text: string, maxWidth: number, baseSize: number, weight: string, minSize: number): number => {
    let size = baseSize;
    ctx.font = font(size, weight);
    while (size > minSize && ctx.measureText(text).width > maxWidth) {
      size -= 0.5;
      ctx.font = font(size, weight);
    }
    return size;
  };

  // 曲名(スペース区切りが無い日本語主体)を最大2行まで折り返す。1文字ずつ幅を
  // 測りながら、maxWidthを超える直前の位置で1行目/2行目に分割する。
  const wrapToLines = (text: string, maxWidth: number, fontSize: number, weight: string): string[] => {
    ctx.font = font(fontSize, weight);
    if (ctx.measureText(text).width <= maxWidth) return [text];
    let splitIdx = 1;
    for (let i = 1; i < text.length; i++) {
      if (ctx.measureText(text.slice(0, i)).width > maxWidth) break;
      splitIdx = i;
    }
    return [text.slice(0, splitIdx), text.slice(splitIdx)];
  };

  // 2行に折り返す時のフォントサイズ。ピルの高さ(PILL_H)は常に固定のままにする
  // (隣のラウンドのピルは自分の対戦2つの中間の高さに来るため、ピルの高さを
  // ラウンドごとに変えると、勝ち上がった曲の次ラウンドのピルが前ラウンドの
  // ピルと縦に衝突しうる)。そのため2行になる時は枠を広げず、2行分の行送りが
  // PILL_H に収まるところまでフォント側を縮める。
  const TWO_LINE_FONT = Math.min(ENTRY_FONT, (PILL_H - 6) / (2 * 1.2));
  const TWO_LINE_LINE_H = TWO_LINE_FONT * 1.2;

  // 対戦ノード(ピル)のレイアウトを曲名の実際の長さから決める。
  // 1) 理想フォントサイズで1行に収まればそのまま1行。
  // 2) 収まらず、2行分のフォントサイズ(TWO_LINE_FONT)が読める下限(9px)以上
  //    なら2行に折り返す(タイトルを省略しない)。
  // 3) それ以外(2行にする余地が無いほどピルが薄い)は、1行のままフォント
  //    サイズを最小まで縮めるフォールバックを使う。
  const layoutEntry = (song: SongRow, weight: string): { lines: string[]; fontSize: number; width: number } => {
    const maxTextW = PILL_W_MAX - PILL_PAD_LEFT - THUMB - PILL_TEXT_GAP - PILL_PAD_RIGHT;
    ctx.font = font(ENTRY_FONT, weight);
    const singleLineWidth = ctx.measureText(song.songName).width;

    // PILL_W_MAXは「これ以上は広げたくない」という理想の上限であり、絶対上限では
    // ない。縮小・折り返しを尽くしてもテキストがこれより広い場合は、ピルをその
    // テキスト幅に合わせて広げる(はみ出し・省略よりは、ピルが少し大きくなる方を
    // 優先する)。
    const widthFor = (textWidth: number) =>
      Math.max(PILL_W_MIN, PILL_PAD_LEFT + THUMB + PILL_TEXT_GAP + textWidth + PILL_PAD_RIGHT);

    if (singleLineWidth <= maxTextW) {
      return { lines: [song.songName], fontSize: ENTRY_FONT, width: widthFor(singleLineWidth) };
    }

    if (TWO_LINE_FONT >= 9) {
      const lines = wrapToLines(song.songName, maxTextW, TWO_LINE_FONT, weight);
      if (lines.length > 1) {
        ctx.font = font(TWO_LINE_FONT, weight);
        const lineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
        return { lines, fontSize: TWO_LINE_FONT, width: widthFor(lineWidth) };
      }
    }

    // 折り返しでも収まらない(2行にする縦の余地が無い、または区切り位置が無い
    // 1単語)場合は、1行のままフォントサイズを最小まで縮める。それでも収まら
    // なければピル幅を実際のテキスト幅に合わせて広げる。
    const fontSize = fitFontSize(song.songName, maxTextW, ENTRY_FONT, weight, 9);
    const shrunkWidth = ctx.measureText(song.songName).width;
    return { lines: [song.songName], fontSize, width: widthFor(shrunkWidth) };
  };

  ctx.fillStyle = CARD_COLORS.bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(centerX, finalY, 0, centerX, finalY, Math.max(W, H) * 0.6);
  glow.addColorStop(0, CARD_COLORS.blueDeep);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.fillStyle = CARD_COLORS.yellow;
  ctx.font = font(15, "800");
  ctx.fillText("SONG SORTER", centerX, 38);
  ctx.fillStyle = CARD_COLORS.ink;
  ctx.font = font(32, "800");
  ctx.fillText("楽曲トーナメント", centerX, 78);
  ctx.fillStyle = CARD_COLORS.ink2;
  ctx.font = font(14, "600");
  ctx.fillText(`Reol ・ 全${totalCount}曲`, centerX, 102);

  const rowCenterY = (roundIdx: number, entryIdx: number) => {
    const rh = ROW_H * 2 ** roundIdx;
    return HEADER_H + (entryIdx + 0.5) * rh;
  };

  const drawThumb = (song: SongRow | null, leftX: number, y: number, size: number, radius: number) => {
    const img = song ? images.get(song.slug) : null;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(leftX, y - size / 2, size, size, radius);
    ctx.clip();
    if (img) {
      ctx.drawImage(img, leftX, y - size / 2, size, size);
    } else {
      ctx.fillStyle = CARD_COLORS.line;
      ctx.fillRect(leftX, y - size / 2, size, size);
      ctx.fillStyle = CARD_COLORS.ink3;
      ctx.font = font(size * 0.5, "700");
      ctx.textAlign = "center";
      ctx.fillText("♪", leftX + size / 2, y + size * 0.18);
    }
    ctx.restore();
  };

  const drawEntry = (
    song: SongRow | null,
    x: number,
    y: number,
    dir: 1 | -1,
    isChampionLine: boolean,
    isWinner: boolean
  ) => {
    if (!song) return;
    const weight = isChampionLine ? "800" : isWinner ? "600" : "400";
    const { lines, width: pillW, fontSize } = layoutEntry(song, weight);
    const pillLeft = dir === 1 ? x : x - pillW;

    // 半透明の塗りだけだと下に描いた接続線が透けて見えてしまうため、まず不透明な
    // 背景色を敷いて線を完全に隠してから、色付きの薄い塗りを重ねる。
    ctx.beginPath();
    ctx.roundRect(pillLeft, y - PILL_H / 2, pillW, PILL_H, PILL_H / 2);
    ctx.fillStyle = CARD_COLORS.bg;
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(pillLeft, y - PILL_H / 2, pillW, PILL_H, PILL_H / 2);
    ctx.fillStyle = isChampionLine
      ? "rgba(226, 191, 87, 0.16)"
      : isWinner
      ? "rgba(255, 255, 255, 0.07)"
      : "rgba(255, 255, 255, 0.025)";
    ctx.fill();
    if (isChampionLine || isWinner) {
      ctx.strokeStyle = isChampionLine ? CARD_COLORS.yellow : "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = isChampionLine ? 1.5 : 1;
      ctx.stroke();
    }

    const thumbX = dir === 1 ? pillLeft + PILL_PAD_LEFT : pillLeft + pillW - PILL_PAD_LEFT - THUMB;
    drawThumb(song, thumbX, y, THUMB, 5);

    ctx.textAlign = dir === 1 ? "left" : "right";
    ctx.fillStyle = isChampionLine ? CARD_COLORS.yellow : isWinner ? CARD_COLORS.ink : CARD_COLORS.ink3;
    ctx.font = font(fontSize, weight);
    const textX = dir === 1 ? thumbX + THUMB + PILL_TEXT_GAP : thumbX - PILL_TEXT_GAP;
    if (lines.length === 1) {
      ctx.fillText(lines[0], textX, y + 5);
    } else {
      const totalH = TWO_LINE_LINE_H * (lines.length - 1);
      lines.forEach((line, i) => {
        ctx.fillText(line, textX, y - totalH / 2 + i * TWO_LINE_LINE_H + 5);
      });
    }
  };

  // 列の間隔(STRIDE)をピル幅より狭くして詰めているため、後のラウンドの接続線が
  // 前のラウンドの位置まで伸びてテキストと重なることがある。そのため両サイド・
  // 全ラウンド分の接続線を先にまとめて描き切ってから、最後に全ピルをまとめて
  // 描く(ピル=不透明な曲名テキストが必ず一番上に来て線を隠す)。
  const sides: { rounds: BracketMatch<SongRow>[][]; dir: 1 | -1 }[] = [
    { rounds: leftRounds, dir: 1 },
    { rounds: rightRounds, dir: -1 },
  ];

  const colXFor = (dir: 1 | -1, r: number) => (dir === 1 ? MARGIN + r * STRIDE : W - MARGIN - r * STRIDE);
  const nextColXFor = (dir: 1 | -1, r: number) =>
    r < roundsInSide - 1
      ? colXFor(dir, r + 1)
      : dir === 1
      ? centerX - CENTER_W / 2 + PODIUM / 2
      : centerX + CENTER_W / 2 - PODIUM / 2;

  for (const { rounds, dir } of sides) {
    rounds.forEach((round, r) => {
      const colX = colXFor(dir, r);
      const nextColX = nextColXFor(dir, r);
      round.forEach((match, mi) => {
        const y1 = rowCenterY(r, mi * 2);
        const y2 = rowCenterY(r, mi * 2 + 1);
        const isChampionMatch = match.winner?.songUuid === champion.songUuid;
        const p1IsChampion = isChampionMatch && match.p1?.songUuid === champion.songUuid;
        const p2IsChampion = isChampionMatch && match.p2?.songUuid === champion.songUuid;
        const w1 = match.p1 ? layoutEntry(match.p1, p1IsChampion ? "800" : "400").width : 0;
        const w2 = match.p2 ? layoutEntry(match.p2, p2IsChampion ? "800" : "400").width : 0;
        // ピル幅が曲名ごとに違うため、各ノードの接続線は自分自身の実際の右端
        // (dir=-1なら左端)から始める。ノードは中央寄りの方(=より遠くまで
        // 伸びている方)に合わせて接続する。
        const stubX1 = dir === 1 ? colX + w1 : colX - w1;
        const stubX2 = dir === 1 ? colX + w2 : colX - w2;
        const farStub = dir === 1 ? Math.max(stubX1, stubX2) : Math.min(stubX1, stubX2);
        const elbowX = (farStub + nextColX) / 2;
        const midY = (y1 + y2) / 2;

        ctx.strokeStyle = isChampionMatch ? CARD_COLORS.yellow : "rgba(107, 140, 224, 0.4)";
        ctx.lineWidth = isChampionMatch ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(stubX1, y1);
        ctx.lineTo(elbowX, y1);
        ctx.lineTo(elbowX, y2);
        ctx.lineTo(stubX2, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(elbowX, midY);
        ctx.lineTo(nextColX, midY);
        ctx.stroke();
      });
    });
  }

  for (const { rounds, dir } of sides) {
    rounds.forEach((round, r) => {
      const colX = colXFor(dir, r);
      round.forEach((match, mi) => {
        const y1 = rowCenterY(r, mi * 2);
        const y2 = rowCenterY(r, mi * 2 + 1);
        const isChampionMatch = match.winner?.songUuid === champion.songUuid;
        const p1IsChampion = isChampionMatch && match.p1?.songUuid === champion.songUuid;
        const p2IsChampion = isChampionMatch && match.p2?.songUuid === champion.songUuid;
        drawEntry(match.p1, colX, y1, dir, p1IsChampion, !!match.p1 && match.winner?.songUuid === match.p1.songUuid);
        drawEntry(match.p2, colX, y2, dir, p2IsChampion, !!match.p2 && match.winner?.songUuid === match.p2.songUuid);
      });
    });
  }

  // 中央: 優勝者ポディウム(両サイドの最終ラウンドの接続線は drawSide 内で
  // 既にここまで届いている)
  const podiumX = centerX - PODIUM / 2;
  ctx.save();
  ctx.shadowColor = "rgba(226, 191, 87, 0.55)";
  ctx.shadowBlur = 24;
  drawThumb(champion, podiumX, finalY, PODIUM, 14);
  ctx.restore();
  ctx.strokeStyle = CARD_COLORS.yellow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(podiumX - 3, finalY - PODIUM / 2 - 3, PODIUM + 6, PODIUM + 6, 16);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.font = font(Math.round(PODIUM * 0.26));
  ctx.fillText("👑", centerX, finalY - PODIUM / 2 - 12);

  const badgeW = Math.min(CENTER_W - 24, 168);
  const badgeH = 28;
  const badgeY = finalY + PODIUM / 2 + 16;
  ctx.beginPath();
  ctx.roundRect(centerX - badgeW / 2, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fillStyle = CARD_COLORS.yellow;
  ctx.fill();
  ctx.fillStyle = CARD_COLORS.bg;
  ctx.font = font(13, "800");
  ctx.fillText("🏆 優勝 CHAMPION", centerX, badgeY + badgeH / 2 + 5);

  ctx.fillStyle = CARD_COLORS.ink;
  fitFontSize(champion.songName, CENTER_W - 20, Math.min(22, Math.round(PODIUM * 0.16)), "800", 11);
  ctx.fillText(champion.songName, centerX, badgeY + badgeH + 32);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN, H - FOOTER_H + 24);
  ctx.lineTo(W - MARGIN, H - FOOTER_H + 24);
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.fillStyle = CARD_COLORS.ink3;
  ctx.font = font(13, "600");
  ctx.fillText("!Legit(非公式ファンサイト)", MARGIN, H - 30);
  ctx.textAlign = "right";
  ctx.font = font(12, "500");
  ctx.fillText("reol.twilightea.com/songs/sorter/", W - MARGIN, H - 30);

  return canvas.toDataURL("image/png");
};

const SongSorterPage: React.FC<PageProps<SorterPageData>> = ({ data }) => {
  const allSongs = data.songStats.songStats;
  const artworkUrlBySlug = useMemo(
    () => new Map(allSongs.map((s) => [s.slug, s.artworkUrl])),
    [allSongs]
  );

  // SSRのHTMLとクライアント初回描画を一致させるため、localStorageの読み込みは
  // useStateの初期値ではなくマウント後のuseEffectで行う(hydration mismatch回避)。
  const [phase, setPhase] = useState<Phase>("select");
  const [size, setSize] = useState<number>(32);
  const sorterRef = useRef<BracketSorter<SongRow> | null>(null);
  const [, forceRerender] = useState(0);
  const [finished, setFinished] = useState<FinishedBracket | null>(null);
  const [shareImage, setShareImage] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadSaved();
    if (!saved) return;
    const byUuid = new Map(allSongs.map((s) => [s.songUuid, s]));
    const leftRounds = saved.leftRounds.map((round) =>
      round.map((m) => fromSavedMatch(m, byUuid))
    );
    const rightRounds = saved.rightRounds.map((round) =>
      round.map((m) => fromSavedMatch(m, byUuid))
    );
    const finalMatch = fromSavedMatch(saved.finalMatch, byUuid);
    const allValid =
      finalMatch &&
      finalMatch.winner &&
      leftRounds.every((r) => r.every((m) => !!m)) &&
      rightRounds.every((r) => r.every((m) => !!m));
    if (allValid && finalMatch) {
      setFinished({
        leftRounds: leftRounds as BracketMatch<SongRow>[][],
        rightRounds: rightRounds as BracketMatch<SongRow>[][],
        finalMatch,
        champion: finalMatch.winner as SongRow,
      });
      setSize(saved.size);
      setPhase("result");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 結果が確定したらシェアカードを生成する(初回作成時・localStorage復元時の両方)
  useEffect(() => {
    if (phase !== "result" || !finished) return;
    generateBracketShareCard(finished, size, artworkUrlBySlug).then(setShareImage);
  }, [phase, finished, size, artworkUrlBySlug]);

  const start = (n: number) => {
    const pool = allSongs.filter((s) => s.songName);
    const sample = shuffle(pool).slice(0, Math.min(n, pool.length));
    sorterRef.current = new BracketSorter(sample);
    setSize(sample.length);
    setShareImage(null);
    setFinished(null);
    setPhase("sorting");
    forceRerender((v) => v + 1);
  };

  const choose = (pickFirst: boolean) => {
    const sorter = sorterRef.current;
    if (!sorter) return;
    sorter.choose(pickFirst);
    if (sorter.isDone() && sorter.result && sorter.finalMatch) {
      const result: FinishedBracket = {
        leftRounds: sorter.leftRounds,
        rightRounds: sorter.rightRounds,
        finalMatch: sorter.finalMatch,
        champion: sorter.result,
      };
      setFinished(result);
      saveResult({
        size,
        leftRounds: sorter.leftRounds.map((round) => round.map(toSavedMatch)),
        rightRounds: sorter.rightRounds.map((round) => round.map(toSavedMatch)),
        finalMatch: toSavedMatch(sorter.finalMatch),
        savedAt: new Date().toISOString(),
      });
      setPhase("result");
    } else {
      forceRerender((v) => v + 1);
    }
  };

  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    if (!finished) return;
    const runnerUp =
      finished.finalMatch.p1?.songUuid === finished.champion.songUuid
        ? finished.finalMatch.p2
        : finished.finalMatch.p1;
    const text = `楽曲トーナメント(全${size}曲)で「${finished.champion.songName}」が優勝しました${
      runnerUp ? `\n準優勝: ${runnerUp.songName}` : ""
    }\n\nhttps://reol.twilightea.com/songs/sorter/`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadImage = async () => {
    if (!shareImage || !finished) return;
    const res = await fetch(shareImage);
    const blob = await res.blob();
    const file = new File([blob], `reol-song-tournament-${finished.champion.slug}.png`, {
      type: "image/png",
    });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
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

  const restart = () => {
    sorterRef.current = null;
    setFinished(null);
    setShareImage(null);
    setPhase("select");
  };

  const sorter = sorterRef.current;
  const pair = sorter?.getCurrentMatch() ?? null;
  const comparisons = sorter?.comparisons ?? 0;
  const totalDecisions = sorter?.totalDecisions() ?? 0;
  const roundLabel = sorter?.currentRoundLabel() ?? "";
  const roundNumber = sorter?.currentRoundNumber() ?? 1;
  const totalRoundsCount = sorter?.totalRounds ?? 1;

  return (
    <Layout title="楽曲ソーター">
      <main className="container mx-auto px-3 sm:px-4 py-4 max-w-2xl text-bx-ink">
        <header className="mb-6">
          <Kicker color="text-bx-blue">SONG SORTER</Kicker>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-bx-ink">
            楽曲ソーター
          </h1>
          <p className="text-xs text-bx-ink3">
            2曲ずつ勝ち抜き戦。あなたの一番好きな曲を決めるトーナメントです。
          </p>
        </header>

        {phase === "select" && (
          <section className="space-y-2">
            {SIZE_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => start(n)}
                className="w-full text-left rounded-lg border border-bx-line bg-bx-surface/5 hover:border-bx-blue transition-colors p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-bx-ink">
                    {n}曲トーナメント
                  </span>
                  <span className="text-xs text-bx-ink3 tabular-nums">
                    対戦 {n - 1}回
                  </span>
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => start(allSongs.length)}
              className="w-full text-left rounded-lg border border-bx-line bg-bx-surface/5 hover:border-bx-blue transition-colors p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-bx-ink">
                  全{allSongs.length}曲トーナメント
                </span>
                <span className="text-xs text-bx-ink3 tabular-nums">
                  対戦 {allSongs.length - 1}回(かなり長丁場です)
                </span>
              </div>
            </button>
          </section>
        )}

        {phase === "sorting" && pair && (
          <section>
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-bold text-bx-yellow tracking-wide">
                {roundLabel}({roundNumber} / {totalRoundsCount})
              </span>
              <span className="text-bx-ink3 tabular-nums">
                {comparisons} / {totalDecisions}回
              </span>
            </div>
            <div className="h-1 rounded-full bg-bx-line overflow-hidden mb-4">
              <div
                className="h-full bg-bx-blue transition-all duration-300"
                style={{
                  width: `${Math.min(100, (comparisons / Math.max(1, totalDecisions)) * 100)}%`,
                }}
              />
            </div>
            <p className="text-center text-xs text-bx-ink3 mb-3">好きな方をタップ</p>
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              {[pair[0], pair[1]].map((song, i) => (
                <React.Fragment key={song.songUuid}>
                  {i === 1 && (
                    <div className="flex items-center justify-center shrink-0">
                      <span className="w-9 h-9 rounded-full bg-bx-bg border-2 border-bx-yellow text-bx-yellow text-[11px] font-black flex items-center justify-center">
                        VS
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => choose(i === 0)}
                    className="flex-1 rounded-lg border border-bx-line bg-bx-surface/5 hover:border-bx-blue transition-colors p-6 text-center"
                  >
                    <p className="text-lg font-bold text-bx-ink">
                      {song.songName}
                    </p>
                  </button>
                </React.Fragment>
              ))}
            </div>
          </section>
        )}

        {phase === "result" && finished && (
          <section className="space-y-4">
            <div className="rounded-lg border border-bx-yellow bg-bx-yellow/5 p-4 text-center">
              <p className="text-xs text-bx-ink2 mb-1">🏆 優勝・全{size}曲中</p>
              <p className="text-xl font-bold text-bx-ink">{finished.champion.songName}</p>
            </div>

            {shareImage ? (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-bx-ink2">トーナメントブラケット</h3>
                <div className="rounded-lg border border-bx-line bg-bx-bg">
                  <img
                    src={shareImage}
                    alt="トーナメントブラケット"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <p className="text-[10px] text-bx-ink3">
                  プレビューは縮小表示です。保存すると全曲分の高解像度画像になります。
                </p>
              </div>
            ) : (
              <p className="text-xs text-bx-ink3 text-center py-8">
                ブラケット画像を生成中…
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={!shareImage}
                className="px-4 py-2 text-sm font-bold rounded-lg border border-bx-yellow text-bx-yellow hover:bg-bx-yellow hover:text-bx-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                画像を保存/共有
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="px-4 py-2 text-sm font-bold rounded-lg border border-bx-blue text-bx-blue hover:bg-bx-blue hover:text-bx-bg transition-colors"
              >
                {copied ? "コピーしました！" : "テキストで共有"}
              </button>
            </div>

            <button
              type="button"
              onClick={restart}
              className="w-full px-4 py-2 text-sm font-bold rounded-lg border border-bx-line hover:border-bx-blue transition-colors"
            >
              もう一度作る
            </button>
          </section>
        )}

        <p className="mt-6 text-xs text-bx-ink2">
          <Link
            to="/songs/stats/"
            className="underline underline-offset-2 hover:text-bx-blue"
          >
            楽曲統計(演奏回数)を見る →
          </Link>
        </p>
      </main>
    </Layout>
  );
};

export default SongSorterPage;

export const query = graphql`
  query SongSorterData {
    songStats {
      songStats {
        songUuid
        slug
        songName
        artworkUrl
      }
    }
  }
`;

export const Head: HeadFC = () => (
  <SEO
    title="楽曲ソーター"
    description="2曲ずつ勝ち抜き戦で、あなたの一番好きな曲を決めるトーナメント。優勝までのブラケットを画像でシェアできます。"
    path="/songs/sorter/"
    jsonLd={buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "楽曲ソーター", path: "/songs/sorter/" },
    ])}
  />
);
