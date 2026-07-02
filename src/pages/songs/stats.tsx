import React, { useCallback, useEffect, useMemo, useState } from "react";
import { graphql, HeadFC, Link, PageProps } from "gatsby";
import Layout from "../../components/modules/layout";
import SEO from "../../components/SEO";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import ErrorRetry from "../../components/common/ErrorRetry";

type Play = {
  liveUuid: string;
  liveSlug: string;
  liveItemUuid: string;
  liveItemSlug: string;
  liveItemSongUuid: string;
  date: string;
  place: string | null;
  liveItemName: string | null;
  liveTitle: string;
  rawName: string;
  type: string | null;
  matchSource: string;
};

// ページクエリで取得する一覧表示用の行データ（plays は含めない）
type SongStatRow = {
  songUuid: string;
  slug: string;
  songName: string;
  discographySlug: string | null;
  totalPlays: number;
  firstPlayedDate: string | null;
  lastPlayedDate: string | null;
};

type SongStatsPageData = {
  songStats: {
    songStats: SongStatRow[];
    summary: {
      matchedInstances: number;
      uniqueSongsPlayed: number;
    };
  };
};

// 遅延fetchする /static/data/songStats.json のペイロード（plays 取得用）
type SongStatsPayload = {
  songStats: { songUuid: string; plays: Play[] }[];
};

type SortKey = "plays" | "first" | "last" | "name";

type PlaysFetchStatus = "idle" | "loading" | "loaded" | "error";

type InitialSongTarget = {
  slug: string | null;
  uuid: string | null;
  hash: string | null;
};

export const query = graphql`
  query SongStatsPage {
    songStats {
      songStats {
        songUuid
        slug
        songName
        discographySlug
        totalPlays
        firstPlayedDate
        lastPlayedDate
      }
      summary {
        matchedInstances
        uniqueSongsPlayed
      }
    }
  }
`;

const SongStatsPage: React.FC<PageProps<SongStatsPageData>> = ({ data }) => {
  const songStats = data.songStats.songStats;
  const summary = data.songStats.summary;

  const [keyword, setKeyword] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("plays");
  const [openSongSlug, setOpenSongSlug] = useState<string | null>(null);

  // 演奏履歴（plays）は初回展開時に一度だけ遅延fetchしてキャッシュする
  const [playsMap, setPlaysMap] = useState<Map<string, Play[]> | null>(null);
  const [playsStatus, setPlaysStatus] = useState<PlaysFetchStatus>("idle");
  const [playsError, setPlaysError] = useState<string | null>(null);

  const loadPlays = useCallback(() => {
    setPlaysStatus("loading");
    setPlaysError(null);
    fetch("/static/data/songStats.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<SongStatsPayload>;
      })
      .then((payload) => {
        setPlaysMap(new Map(payload.songStats.map((s) => [s.songUuid, s.plays])));
        setPlaysStatus("loaded");
      })
      .catch((e) => {
        setPlaysError(String(e));
        setPlaysStatus("error");
      });
  }, []);

  // 行が開かれたタイミングで一度だけ取得（エラー時は再試行ボタンから）
  useEffect(() => {
    if (openSongSlug && playsStatus === "idle") loadPlays();
  }, [openSongSlug, playsStatus, loadPlays]);

  // オープニングが付与したスクロールロックを解除（クライアントナビ時の保険）
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.remove("overflow-hidden");
    document.documentElement.style.overflow = "";
  }, []);

  // URL の ?songSlug=xxx / ?songUuid=xxx / #song-xxx で初期オープン
  const initialSongTargetRef = React.useRef<InitialSongTarget>({
    slug: null,
    uuid: null,
    hash: null,
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const hashValue = window.location.hash.startsWith("#song-")
      ? decodeURIComponent(window.location.hash.slice(6))
      : null;
    initialSongTargetRef.current = {
      slug: sp.get("songSlug"),
      uuid: sp.get("songUuid"),
      hash: hashValue,
    };

    // データはビルド時に焼き込み済みのため、マウント直後に解決できる
    const initialTarget = initialSongTargetRef.current;
    if (!initialTarget.slug && !initialTarget.uuid && !initialTarget.hash) return;

    // 優先順位: songSlug -> songUuid -> hash(songSlug/songoUuid どちらでも解決)
    let targetSlug: string | null = initialTarget.slug;
    if (!targetSlug && initialTarget.uuid) {
      targetSlug =
        songStats.find((s) => s.songUuid === initialTarget.uuid)?.slug ?? null;
    }
    if (!targetSlug && initialTarget.hash) {
      const bySlug = songStats.find((s) => s.slug === initialTarget.hash);
      if (bySlug) {
        targetSlug = bySlug.slug;
      } else {
        targetSlug =
          songStats.find((s) => s.songUuid === initialTarget.hash)?.slug ?? null;
      }
    }
    initialSongTargetRef.current = { slug: null, uuid: null, hash: null };
    if (!targetSlug) return;

    // URL 由来の初期オープンのみ自動スクロール（クリックでの展開時はスクロールしない）
    setOpenSongSlug(targetSlug);
    const el = document.getElementById(`song-${targetSlug}`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSorted = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const list = q
      ? songStats.filter((s) => s.songName.toLowerCase().includes(q))
      : [...songStats];
    const cmp: Record<SortKey, (a: SongStatRow, b: SongStatRow) => number> = {
      plays: (a, b) => b.totalPlays - a.totalPlays,
      first: (a, b) =>
        (a.firstPlayedDate ?? "").localeCompare(b.firstPlayedDate ?? ""),
      last: (a, b) =>
        (b.lastPlayedDate ?? "").localeCompare(a.lastPlayedDate ?? ""),
      name: (a, b) => a.songName.localeCompare(b.songName, "ja"),
    };
    return list.sort(cmp[sortKey]);
  }, [songStats, keyword, sortKey]);

  const maxPlays = Math.max(1, ...filteredSorted.map((s) => s.totalPlays));

  const rankBadge = (rank: number): { bg: string; text: string; label: string } | null => {
    if (sortKey !== "plays" || keyword) return null;
    if (rank === 0) return { bg: "bg-yellow-400", text: "text-yellow-900", label: "1" };
    if (rank === 1) return { bg: "bg-gray-300", text: "text-gray-800", label: "2" };
    if (rank === 2) return { bg: "bg-amber-700", text: "text-amber-50", label: "3" };
    return null;
  };

  return (
    <Layout title="楽曲統計">
      <main className="container mx-auto px-3 sm:px-4 py-4 text-gray-800 max-w-4xl">
        <header className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-gray-900">
            楽曲統計
          </h1>
          <p className="text-xs text-gray-600">
            LIVEで演奏された楽曲の通算演奏回数・初出 / 最終演奏日を一覧します。
          </p>
        </header>

        <section className="mb-5 grid grid-cols-2 gap-2 sm:gap-3">
          <Card
            label="演奏数 (述べ)"
            value={summary.matchedInstances.toLocaleString()}
            accent="emerald"
          />
          <Card
            label="ユニーク楽曲"
            value={summary.uniqueSongsPlayed.toLocaleString()}
            accent="sky"
          />
        </section>

        <section className="mb-4 sticky top-0 z-30 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 border-b border-gray-300 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="🔍 曲名で検索"
              className="flex-1 min-w-[160px] px-3 py-1.5 text-base sm:text-sm rounded-md bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-300"
            />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="px-2 py-1.5 text-base sm:text-sm rounded-md bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-amber-500"
            >
              <option value="plays">演奏回数 (多)</option>
              <option value="last">最終演奏 (新)</option>
              <option value="first">初演奏 (古)</option>
              <option value="name">曲名 (あいうえお)</option>
            </select>
            <span className="text-xs font-medium text-gray-700 ml-auto whitespace-nowrap">
              {filteredSorted.length.toLocaleString()} 曲
            </span>
          </div>
        </section>

        <ul className="space-y-2">
          {filteredSorted.map((s, idx) => {
            const isOpen = openSongSlug === s.slug;
            const badge = rankBadge(idx);
            const barPct = Math.max(4, Math.round((s.totalPlays / maxPlays) * 100));
            return (
              <li
                key={s.songUuid}
                id={`song-${s.slug}`}
                className={`rounded-lg border transition-all ${
                  isOpen
                    ? "border-amber-500 bg-white shadow-md ring-1 ring-amber-200"
                    : "border-gray-300 bg-white shadow-sm hover:shadow-md hover:border-gray-400"
                }`}
              >
                <button
                  type="button"
                  className="w-full px-3 sm:px-4 py-3 text-left"
                  onClick={() => setOpenSongSlug(isOpen ? null : s.slug)}
                >
                  <div className="flex items-center gap-3">
                    {badge ? (
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${badge.bg} ${badge.text} shadow`}
                      >
                        {badge.label}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-[11px] font-semibold border border-gray-200">
                        {sortKey === "plays" && !keyword ? idx + 1 : "♪"}
                      </span>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {s.songName}
                        </span>
                        {s.firstPlayedDate && (
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">
                            {s.firstPlayedDate}
                            {s.lastPlayedDate && s.lastPlayedDate !== s.firstPlayedDate
                              ? ` 〜 ${s.lastPlayedDate}`
                              : ""}
                          </span>
                        )}
                      </div>
                      {/* progress bar */}
                      <div className="mt-1.5 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xl sm:text-2xl font-bold text-amber-700 tabular-nums leading-none">
                        {s.totalPlays}
                      </span>
                      <span className="text-[9px] text-gray-500 mt-0.5">回</span>
                    </div>

                    <span
                      className={`text-gray-400 text-sm transition-transform ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    >
                      ▶
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3 sm:px-4 pb-4 border-t border-gray-200 pt-3 text-xs">
                    <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-gray-700">
                      <span>
                        <span className="text-gray-500">初演奏</span>{" "}
                        <span className="font-medium">{s.firstPlayedDate ?? "?"}</span>
                      </span>
                      <span>
                        <span className="text-gray-500">最新</span>{" "}
                        <span className="font-medium">{s.lastPlayedDate ?? "?"}</span>
                      </span>
                      {s.discographySlug !== null && (
                        <Link
                          to={`/discography/#disc-${s.discographySlug}`}
                          className="text-amber-700 hover:text-amber-900 underline"
                        >
                          収録アルバムを見る →
                        </Link>
                      )}
                    </div>
                    <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="inline-block w-1 h-4 bg-amber-500 rounded" />
                      演奏履歴
                      <span className="text-[10px] font-normal text-gray-500">
                        ({s.totalPlays}件)
                      </span>
                    </div>
                    <PlayHistory
                      songUuid={s.songUuid}
                      status={playsStatus}
                      playsMap={playsMap}
                      error={playsError}
                      onRetry={loadPlays}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {filteredSorted.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">該当する楽曲が見つかりません</p>
        )}

        <div className="mt-6 text-xs text-gray-600">
          <Link to="/" className="underline hover:text-gray-900">
            ← トップに戻る
          </Link>
        </div>
      </main>
    </Layout>
  );
};

/**
 * 行展開時の演奏履歴表示。
 * plays は遅延fetchのため、取得状況に応じてスケルトン / 再試行 / 履歴リストを出し分ける。
 */
const PlayHistory: React.FC<{
  songUuid: string;
  status: PlaysFetchStatus;
  playsMap: Map<string, Play[]> | null;
  error: string | null;
  onRetry: () => void;
}> = ({ songUuid, status, playsMap, error, onRetry }) => {
  if (status === "error") {
    return (
      <ErrorRetry
        title="演奏履歴の読み込みに失敗しました"
        description={error ?? undefined}
        onRetry={onRetry}
      />
    );
  }
  if (status !== "loaded" || !playsMap) {
    return (
      <LoadingSkeleton rows={3} rowHeightClassName="h-14" label="演奏履歴を読み込み中..." />
    );
  }

  const plays = playsMap.get(songUuid) ?? [];
  if (plays.length === 0) {
    return <p className="text-gray-500">演奏履歴がありません</p>;
  }

  return (
    <ol className="space-y-2">
      {[...plays]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((p) => {
          const dateParts = p.date.split("-");
          const yyyy = dateParts[0] ?? "";
          const mmdd =
            dateParts.length >= 3 ? `${dateParts[1]}/${dateParts[2]}` : p.date;
          return (
            <li key={p.liveItemSongUuid}>
              <Link
                to={`/live/#live-item-${p.liveItemSlug}`}
                className="group flex items-stretch gap-2 sm:gap-3 rounded-md border border-gray-200 bg-white/90 hover:bg-amber-50 hover:border-amber-400 hover:shadow-sm transition-all overflow-hidden"
              >
                {/* 日付ブロック */}
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100 px-2 sm:px-3 py-2 min-w-[58px] sm:min-w-[68px] border-r border-amber-200">
                  <span className="text-[10px] text-amber-700 font-medium leading-none">
                    {yyyy}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-amber-800 font-mono leading-tight mt-0.5">
                    {mmdd}
                  </span>
                </div>
                {/* 情報ブロック */}
                <div className="flex-1 min-w-0 py-2 pr-2 sm:pr-3">
                  <div className="text-sm font-medium text-gray-900 truncate group-hover:text-amber-900">
                    {p.liveTitle}
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                    {p.liveItemName && (
                      <span className="inline-flex items-center text-[11px] text-gray-700">
                        <span className="text-gray-400 mr-0.5">／</span>
                        {p.liveItemName}
                      </span>
                    )}
                    {p.place && (
                      <span className="inline-flex items-center text-[11px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                        <span className="mr-0.5">📍</span>
                        {p.place}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center pr-2 text-gray-300 group-hover:text-amber-500">
                  →
                </div>
              </Link>
            </li>
          );
        })}
    </ol>
  );
};

const accentColors: Record<string, { bg: string; bar: string; text: string }> = {
  emerald: { bg: "bg-emerald-50", bar: "bg-emerald-500", text: "text-emerald-700" },
  sky: { bg: "bg-sky-50", bar: "bg-sky-500", text: "text-sky-700" },
  amber: { bg: "bg-amber-50", bar: "bg-amber-500", text: "text-amber-700" },
  rose: { bg: "bg-rose-50", bar: "bg-rose-500", text: "text-rose-700" },
};

const Card: React.FC<{ label: string; value: string; accent?: string }> = ({
  label,
  value,
  accent = "amber",
}) => {
  const c = accentColors[accent] ?? accentColors.amber;
  return (
    <div className="rounded-lg bg-white border border-gray-300 shadow-sm overflow-hidden">
      <div className={`h-1 ${c.bar}`} />
      <div className="px-3 py-2">
        <div className="text-[10px] sm:text-xs text-gray-600">{label}</div>
        <div className={`text-lg sm:text-xl font-bold ${c.text} tabular-nums`}>{value}</div>
      </div>
    </div>
  );
};

export default SongStatsPage;

export const Head: HeadFC = () => (
  <SEO
    title="楽曲統計"
    description="Reolの全楽曲のライブ演奏統計。通算演奏回数・初披露日・最終演奏日を一覧できます。"
    path="/songs/stats/"
  />
);
