import type {
  PlaybackQueue,
  PlaybackQueueItem,
  Setlist,
  SetlistReadinessReport,
} from "../types/relive";

const makeId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const buildPlaybackQueue = (
  setlist: Setlist,
  readinessReport: SetlistReadinessReport,
  title = "残響キュー"
): PlaybackQueue => {
  const entriesById = new Map(setlist.entries.map((entry) => [entry.entryId, entry]));
  const items: PlaybackQueueItem[] = [];

  readinessReport.entries.forEach((match) => {
    const entry = entriesById.get(match.entryId);
    if (!entry) {
      return;
    }

    if (match.status === "matched" && match.matchedFileKey) {
      items.push({
        schemaVersion: 1,
        queueItemId: makeId("queue_track"),
        kind: "track",
        setlistId: setlist.setlistId,
        entryId: entry.entryId,
        trackId: entry.trackId,
        fileKey: match.matchedFileKey,
        title: entry.displayTitle,
        durationSec: entry.expectedDurationSec,
        afterglowTailSec: entry.afterglowTailSec,
      });
    } else if (match.status === "special") {
      items.push({
        schemaVersion: 1,
        queueItemId: makeId("queue_special"),
        kind: entry.policy === "se" ? "gap" : "special",
        setlistId: setlist.setlistId,
        entryId: entry.entryId,
        trackId: entry.trackId,
        title: entry.displayTitle,
        durationSec: entry.afterglowTailSec || 5,
        afterglowTailSec: entry.afterglowTailSec,
        note: entry.note || entry.policy,
      });
    }

    // afterglow (曲間の余韻) アイテムは挿入しない。
    // 旧仕様では各曲の後ろに `afterglow` を 1 個挟んでいたためキュー総数がセトリ曲数の
    // 2 倍になり、Next ボタンで曲の間に「残光」フェーズを踏む UX 上の違和感があった。
    // ビジュアル側の残響演出 (visualBias.afterglowDecay や aftertaste 設定) は
    // 曲再生中の rAF ループで効くため、ここを削っても余韻表現は失われない。
  });

  return {
    schemaVersion: 1,
    queueId: makeId("queue"),
    title,
    setlistId: setlist.setlistId,
    items,
    createdAt: new Date().toISOString(),
  };
};

export const playableFileKeysFromQueue = (queue: PlaybackQueue) =>
  queue.items
    .filter((item) => item.kind === "track" && item.fileKey)
    .map((item) => item.fileKey as string);
