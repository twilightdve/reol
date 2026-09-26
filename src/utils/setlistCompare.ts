/**
 * 2公演のセットリストを比較するための純粋関数群。
 *
 * 比較キーは songUuid を優先する(songMatcher によりビルド時に解決済みのため
 * ほぼ全曲でヒットする)。未解決の曲のみ正規化曲名にフォールバックする。
 */
import { normalizeSongName } from "./songMatcher";

export type SetlistSongInput = {
  liveItemSongUuid: string;
  liveItemSongName: string;
  songUuid: string | null;
  type?: string | null;
};

export type CompareStatus = "common" | "onlyA" | "onlyB";

export type ComparedSong = {
  key: string;
  songUuid: string | null;
  songName: string;
  aPosition: number | null;
  bPosition: number | null;
  status: CompareStatus;
  positionDiff: number | null;
  samePosition: boolean;
};

export type CompareSummary = {
  aCount: number;
  bCount: number;
  commonCount: number;
  onlyACount: number;
  onlyBCount: number;
  unionCount: number;
  /** Jaccard係数 (common / union) */
  jaccardSimilarity: number;
  /** common / min(A, B) */
  commonRate: number;
  /** 共通曲の中での曲順変動(|bPosition - aPosition|)の最大値 */
  maxPositionDiff: number;
};

export type CompareResult = {
  songs: ComparedSong[];
  summary: CompareSummary;
};

// 他のセトリ集計(gatsby-node.ts / live-item.tsx)と同じ基準: MC等の segment
// と、確定前セトリを表す "-" は比較対象から除外する。
const isComparable = (s: SetlistSongInput): boolean =>
  s.type !== "segment" && !!s.liveItemSongName?.trim() && s.liveItemSongName.trim() !== "-";

const compareKey = (s: SetlistSongInput): string =>
  s.songUuid ? `song:${s.songUuid}` : `name:${normalizeSongName(s.liveItemSongName)}`;

export type NormalizedEntry = SetlistSongInput & { key: string; position: number };

// 同一公演内で同じ曲が複数回演奏された場合(アンコール再演等)は、
// 初出の曲順を代表値として採用する(2回目以降は同一キーのため除外する)。
// position は除外後の並びで振り直す(除外分の欠番が出ると比較表の曲順表示が
// 分かりにくくなるため)。
// ツアーヒートマップ(tourHeatmap.ts)からも同じ基準・キー生成で再利用する。
export const normalizeSetlist = (songs: SetlistSongInput[]): NormalizedEntry[] => {
  const seen = new Set<string>();
  const deduped: (SetlistSongInput & { key: string })[] = [];
  songs.filter(isComparable).forEach((s) => {
    const key = compareKey(s);
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push({ ...s, key });
  });
  return deduped.map((s, i) => ({ ...s, position: i + 1 }));
};

export const compareSetlists = (
  a: SetlistSongInput[],
  b: SetlistSongInput[]
): CompareResult => {
  const na = normalizeSetlist(a);
  const nb = normalizeSetlist(b);
  const ma = new Map(na.map((s) => [s.key, s]));
  const mb = new Map(nb.map((s) => [s.key, s]));
  const keys = Array.from(new Set([...ma.keys(), ...mb.keys()]));

  const songs: ComparedSong[] = keys.map((key) => {
    const sa = ma.get(key);
    const sb = mb.get(key);
    if (sa && sb) {
      const diff = sb.position - sa.position;
      return {
        key,
        songUuid: sa.songUuid ?? sb.songUuid,
        songName: sa.liveItemSongName,
        aPosition: sa.position,
        bPosition: sb.position,
        status: "common",
        positionDiff: diff,
        samePosition: diff === 0,
      };
    }
    if (sa) {
      return {
        key,
        songUuid: sa.songUuid,
        songName: sa.liveItemSongName,
        aPosition: sa.position,
        bPosition: null,
        status: "onlyA",
        positionDiff: null,
        samePosition: false,
      };
    }
    const s = sb as NormalizedEntry;
    return {
      key,
      songUuid: s.songUuid,
      songName: s.liveItemSongName,
      aPosition: null,
      bPosition: s.position,
      status: "onlyB",
      positionDiff: null,
      samePosition: false,
    };
  });

  const common = songs.filter((s) => s.status === "common");
  const unionCount = songs.length;
  const minCount = Math.min(na.length, nb.length);

  const summary: CompareSummary = {
    aCount: na.length,
    bCount: nb.length,
    commonCount: common.length,
    onlyACount: songs.filter((s) => s.status === "onlyA").length,
    onlyBCount: songs.filter((s) => s.status === "onlyB").length,
    unionCount,
    jaccardSimilarity: unionCount === 0 ? 1 : common.length / unionCount,
    commonRate: minCount === 0 ? (na.length === nb.length ? 1 : 0) : common.length / minCount,
    maxPositionDiff: common.reduce((m, s) => Math.max(m, Math.abs(s.positionDiff ?? 0)), 0),
  };

  // 表示順: Aの曲順を優先し、Aに存在しない(Bのみの)曲はBの曲順で末尾に続ける
  songs.sort((x, y) => (x.aPosition ?? Infinity) - (y.aPosition ?? Infinity) || (x.bPosition ?? Infinity) - (y.bPosition ?? Infinity));

  return { songs, summary };
};

/**
 * 共通曲(anchor)を軸に、A/Bそれぞれの曲順を保ったまま1本の表示フローに
 * アラインメントする(gitのdiff表示のように、共通行を挟んで両側の差分を
 * 時系列順にまとめる)。
 *
 * 各セグメントは「直前の共通曲(または先頭)から次の共通曲までの間に、
 * Aのみ/Bのみで挟まっていた曲」+ そのanchorとなる共通曲、で構成される。
 * 最後の共通曲より後に残った曲は anchor が null の末尾セグメントに入る。
 */
export type CompareSegment = {
  onlyA: ComparedSong[];
  onlyB: ComparedSong[];
  anchor: ComparedSong | null;
};

export const buildCompareSegments = (songs: ComparedSong[]): CompareSegment[] => {
  const commonSorted = songs
    .filter((s) => s.status === "common")
    .sort((x, y) => (x.aPosition ?? 0) - (y.aPosition ?? 0));
  const onlyASorted = songs
    .filter((s) => s.status === "onlyA")
    .sort((x, y) => (x.aPosition ?? 0) - (y.aPosition ?? 0));
  const onlyBSorted = songs
    .filter((s) => s.status === "onlyB")
    .sort((x, y) => (x.bPosition ?? 0) - (y.bPosition ?? 0));

  const segments: CompareSegment[] = [];
  let aIdx = 0;
  let bIdx = 0;
  for (const anchor of commonSorted) {
    const onlyA: ComparedSong[] = [];
    while (aIdx < onlyASorted.length && (onlyASorted[aIdx].aPosition ?? 0) < (anchor.aPosition ?? 0)) {
      onlyA.push(onlyASorted[aIdx]);
      aIdx += 1;
    }
    const onlyB: ComparedSong[] = [];
    while (bIdx < onlyBSorted.length && (onlyBSorted[bIdx].bPosition ?? 0) < (anchor.bPosition ?? 0)) {
      onlyB.push(onlyBSorted[bIdx]);
      bIdx += 1;
    }
    segments.push({ onlyA, onlyB, anchor });
  }

  const tailA = onlyASorted.slice(aIdx);
  const tailB = onlyBSorted.slice(bIdx);
  if (tailA.length > 0 || tailB.length > 0 || segments.length === 0) {
    segments.push({ onlyA: tailA, onlyB: tailB, anchor: null });
  }
  return segments;
};
