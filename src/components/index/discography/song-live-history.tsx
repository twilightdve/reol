import React, { useEffect, useState } from "react";
import { Link } from "gatsby";

type Play = {
  liveUuid: string;
  liveSlug: string;
  liveItemUuid: string;
  liveItemSongUuid: string;
  date: string;
  place: string | null;
  liveItemName: string | null;
  liveTitle: string;
  rawName: string;
  type: string | null;
  matchSource: string;
};

type SongStatEntry = {
  songUuid: string;
  slug: string;
  songName: string;
  discographyUuid: string | null;
  totalPlays: number;
  firstPlayedDate: string | null;
  lastPlayedDate: string | null;
  plays: Play[];
};

type SongStatsPayload = {
  summary: {
    totalSetlistInstances: number;
    matchedInstances: number;
    unmatchedInstances: number;
    uniqueSongsPlayed: number;
    uniqueUnmatched: number;
  };
  songStats: SongStatEntry[];
};

// シンプルなモジュール内キャッシュ（ダイアログ複数開閉でも fetch は1回）
let cachedSongStats: SongStatsPayload | null = null;
let inflight: Promise<SongStatsPayload> | null = null;

const fetchSongStats = (): Promise<SongStatsPayload> => {
  if (cachedSongStats) return Promise.resolve(cachedSongStats);
  if (inflight) return inflight;
  inflight = fetch("/static/data/songStats.json")
    .then((r) => {
      if (!r.ok) throw new Error(`failed to fetch songStats: ${r.status}`);
      return r.json() as Promise<SongStatsPayload>;
    })
    .then((data) => {
      cachedSongStats = data;
      inflight = null;
      return data;
    })
    .catch((e) => {
      inflight = null;
      throw e;
    });
  return inflight;
};

type Props = {
  songUuid: string;
};

const SongLiveHistory: React.FC<Props> = ({ songUuid }) => {
  const [entry, setEntry] = useState<SongStatEntry | null | undefined>(undefined);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSongStats()
      .then((data) => {
        if (cancelled) return;
        const found = data.songStats.find((s) => s.songUuid === songUuid) ?? null;
        setEntry(found);
      })
      .catch(() => {
        if (!cancelled) setEntry(null);
      });
    return () => {
      cancelled = true;
    };
  }, [songUuid]);

  if (entry === undefined) {
    return (
      <div className="mx-4 my-3 text-xs text-gray-400">
        演奏履歴を読み込み中…
      </div>
    );
  }

  if (entry === null || entry.totalPlays === 0) {
    return (
      <div className="mx-4 my-3 text-xs text-gray-400">
        LIVEでの演奏履歴は記録されていません
      </div>
    );
  }

  // 同日同公演で複数アイテムがあっても、表示は新しい順
  const playsDesc = [...entry.plays].sort((a, b) => b.date.localeCompare(a.date));
  const visible = expanded ? playsDesc : playsDesc.slice(0, 8);

  return (
    <div className="mx-4 my-4 text-xs">
      <h4 className="mb-2 text-sm font-semibold tracking-wide">
        LIVE演奏履歴
      </h4>
      <div className="mb-2 text-gray-300">
        通算&nbsp;<span className="font-semibold text-white">{entry.totalPlays}</span>
        &nbsp;回 / 初演奏&nbsp;{entry.firstPlayedDate ?? "?"} / 最新&nbsp;
        {entry.lastPlayedDate ?? "?"}
      </div>
      <ul className="list-none border-l border-gray-700 pl-3">
        {visible.map((p) => (
          <li
            key={p.liveItemSongUuid}
            className="my-1 leading-snug"
          >
            <span className="text-gray-400 mr-2">{p.date}</span>
            <Link
              to={`/?liveSlug=${p.liveSlug}#live-${p.liveSlug}`}
              className="underline underline-offset-2 hover:opacity-80"
            >
              {p.liveTitle}
            </Link>
            {p.liveItemName && (
              <span className="text-gray-400 ml-1">／{p.liveItemName}</span>
            )}
            {p.place && (
              <span className="text-gray-500 ml-1">＠{p.place}</span>
            )}
          </li>
        ))}
      </ul>
      {playsDesc.length > 8 && (
        <button
          type="button"
          className="mt-2 text-xs underline underline-offset-2 text-gray-300 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? "閉じる" : `他 ${playsDesc.length - 8} 件を表示`}
        </button>
      )}
    </div>
  );
};

export default SongLiveHistory;
