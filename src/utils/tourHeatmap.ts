/**
 * 1ツアー(同一liveUuid配下の複数公演)のセットリストを横断し、
 * 楽曲 × 公演のヒートマップ用データを組み立てる純粋関数群。
 *
 * plan/reol-setlist-compare-design の Phase 2「ツアー全公演ヒートマップ」に対応。
 * 曲の同一判定・除外基準は setlistCompare.ts の compareSetlists と揃える。
 */
import { normalizeSetlist, type SetlistSongInput } from "./setlistCompare";

export type TourPerformance = {
  liveItemUuid: string;
  slug: string;
  date: string;
  liveItemName: string | null;
  place: string | null;
  address: string | null;
  setList: SetlistSongInput[];
};

export type TourHeatmapRow = {
  key: string;
  songUuid: string | null;
  songName: string;
  /** performances と同じ並び順。演奏していない公演は null */
  positions: (number | null)[];
  playCount: number;
  /** 2公演以上で演奏された曲のみ: 演奏順位置の最大-最小(定位置感の逆指標) */
  positionRange: number | null;
};

export type TourHeatmapSummary = {
  performanceCount: number;
  songCount: number;
  /** 全公演で演奏された曲 */
  fullHouseSongs: TourHeatmapRow[];
  /** 1公演でしか演奏されなかった曲 */
  oneOffSongs: TourHeatmapRow[];
  /** 演奏順の振れ幅(positionRange)が大きい上位曲 */
  mostVolatileSongs: TourHeatmapRow[];
};

export type TourHeatmapResult = {
  performances: TourPerformance[];
  rows: TourHeatmapRow[];
  summary: TourHeatmapSummary;
};

const MOST_VOLATILE_LIMIT = 5;

export const buildTourHeatmap = (
  performancesInput: TourPerformance[]
): TourHeatmapResult => {
  const performances = [...performancesInput].sort((a, b) => a.date.localeCompare(b.date));
  const normalizedByItem = performances.map((p) => normalizeSetlist(p.setList));

  const rowByKey = new Map<string, TourHeatmapRow>();
  normalizedByItem.forEach((entries, colIndex) => {
    entries.forEach((entry) => {
      let row = rowByKey.get(entry.key);
      if (!row) {
        row = {
          key: entry.key,
          songUuid: entry.songUuid,
          songName: entry.liveItemSongName,
          positions: performances.map(() => null),
          playCount: 0,
          positionRange: null,
        };
        rowByKey.set(entry.key, row);
      }
      row.positions[colIndex] = entry.position;
      row.playCount += 1;
    });
  });

  const rows = Array.from(rowByKey.values()).map((row) => {
    const played = row.positions.filter((p): p is number => p !== null);
    const positionRange = played.length >= 2 ? Math.max(...played) - Math.min(...played) : null;
    return { ...row, positionRange };
  });

  // 表示順: 演奏回数が多い曲(=定番曲)から、同数なら初出が早い順
  rows.sort((a, b) => {
    if (b.playCount !== a.playCount) return b.playCount - a.playCount;
    const firstA = a.positions.findIndex((p) => p !== null);
    const firstB = b.positions.findIndex((p) => p !== null);
    return firstA - firstB;
  });

  const performanceCount = performances.length;
  const fullHouseSongs = rows.filter((r) => r.playCount === performanceCount);
  const oneOffSongs = rows.filter((r) => r.playCount === 1);
  const mostVolatileSongs = rows
    .filter((r) => r.positionRange !== null)
    .sort((a, b) => (b.positionRange ?? 0) - (a.positionRange ?? 0))
    .slice(0, MOST_VOLATILE_LIMIT);

  return {
    performances,
    rows,
    summary: {
      performanceCount,
      songCount: rows.length,
      fullHouseSongs,
      oneOffSongs,
      mostVolatileSongs,
    },
  };
};
