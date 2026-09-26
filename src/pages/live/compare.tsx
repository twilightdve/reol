/**
 * /live/compare/ — セトリ比較
 *
 * 2公演のセットリストを比較し、共通曲・差分・曲順変動を可視化する。
 * plan/reol-setlist-compare-design の設計を、現行データモデル
 * (liveUuid/liveItemUuid ベース、songUuid はビルド時解決済み)に合わせて実装。
 *
 * 比較対象は liveItemSlug で URL に保持する(?from=<slug>&to=<slug>)。
 * データはビルド時に静的生成される(SSR不可)ため、URL解決はクライアント側で行う。
 */
import React, { useEffect, useMemo, useState } from "react";
import { graphql, HeadFC, Link, PageProps, navigate } from "gatsby";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import SEO from "../../components/SEO";
import {
  compareSetlists,
  buildCompareSegments,
  type ComparedSong,
  type SetlistSongInput,
} from "../../utils/setlistCompare";

type SetListSongQuery = {
  liveItemSongUuid: string;
  liveItemSongName: string;
  songUuid: string | null;
  type: string | null;
};

type LiveItemQuery = {
  liveItemUuid: string;
  slug: string;
  liveItemName: string | null;
  date: string;
  place: string | null;
  setList: SetListSongQuery[];
};

type LiveQuery = {
  liveUuid: string;
  title: string;
  date: string;
  items: LiveItemQuery[];
};

type SimilarPerformance = {
  liveItemUuid: string;
  liveItemSlug: string;
  liveTitle: string;
  liveItemName: string | null;
  date: string;
  place: string | null;
  sharedCount: number;
  score: number;
};

// gatsby-node.ts のビルド時集計(liveItem単位のJaccard類似度、上位5件)。
// related-lives.tsx と同じくモジュールスコープでキャッシュし、複数回描画されても
// fetchは1回だけにする。
let similarityCache: Record<string, SimilarPerformance[]> | null = null;
let similarityInflight: Promise<Record<string, SimilarPerformance[]>> | null = null;
const fetchLiveItemSimilarity = (): Promise<Record<string, SimilarPerformance[]>> => {
  if (similarityCache) return Promise.resolve(similarityCache);
  if (similarityInflight) return similarityInflight;
  similarityInflight = fetch("/static/data/liveItemSimilarity.json")
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<Record<string, SimilarPerformance[]>>;
    })
    .then((d) => {
      similarityCache = d;
      similarityInflight = null;
      return d;
    })
    .catch((e) => {
      similarityInflight = null;
      throw e;
    });
  return similarityInflight;
};

interface CompareQuery {
  live: {
    liveInfos: LiveQuery[];
  };
}

type LiveItemOption = {
  liveItemUuid: string;
  slug: string;
  liveTitle: string;
  liveItemName: string | null;
  date: string;
  place: string | null;
  setList: SetlistSongInput[];
};

type Side = "a" | "b";

type FilterKey = "all" | "common" | "diff" | "reorder";

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "common", label: "共通のみ" },
  { key: "diff", label: "差分のみ" },
  { key: "reorder", label: "曲順変更のみ" },
];

const matchesFilter = (song: ComparedSong, filter: FilterKey): boolean => {
  switch (filter) {
    case "common":
      return song.status === "common";
    case "diff":
      return song.status !== "common";
    case "reorder":
      return song.status === "common" && !song.samePosition;
    default:
      return true;
  }
};

const PositionDiffBadge: React.FC<{ song: ComparedSong }> = ({ song }) => {
  if (song.status !== "common" || song.positionDiff === null) return null;
  if (song.samePosition) {
    return (
      <span className="inline-flex items-center gap-0.5 text-bx-ink3 text-[11px]">
        <Minus className="w-3 h-3" />
        同位置
      </span>
    );
  }
  const movedLater = song.positionDiff > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-mono ${
        movedLater ? "text-bx-yellow" : "text-bx-blueLight"
      }`}
    >
      {movedLater ? (
        <ArrowDownRight className="w-3 h-3" />
      ) : (
        <ArrowUpRight className="w-3 h-3" />
      )}
      {Math.abs(song.positionDiff)}
    </span>
  );
};

const SetlistComparePage: React.FC<PageProps<CompareQuery>> = ({ data, location }) => {
  const options = useMemo<LiveItemOption[]>(() => {
    const out: LiveItemOption[] = [];
    for (const live of data.live.liveInfos) {
      for (const item of live.items) {
        out.push({
          liveItemUuid: item.liveItemUuid,
          slug: item.slug,
          liveTitle: live.title,
          liveItemName: item.liveItemName,
          date: item.date,
          place: item.place,
          setList: item.setList,
        });
      }
    }
    return out.sort((x, y) => y.date.localeCompare(x.date));
  }, [data]);

  const bySlug = useMemo(
    () => new Map(options.map((o) => [o.slug, o])),
    [options]
  );
  const byUuid = useMemo(
    () => new Map(options.map((o) => [o.liveItemUuid, o])),
    [options]
  );

  const [fromUuid, setFromUuid] = useState<string | null>(null);
  const [toUuid, setToUuid] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [initialized, setInitialized] = useState(false);

  // URL(source of truth)から初期選択を復元。無ければ直近2公演をデフォルト表示する。
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const fromSlug = sp.get("from");
    const toSlug = sp.get("to");
    const filterParam = sp.get("filter");
    const fromOpt = fromSlug ? bySlug.get(fromSlug) : undefined;
    const toOpt = toSlug ? bySlug.get(toSlug) : undefined;
    if (fromOpt && toOpt) {
      setFromUuid(fromOpt.liveItemUuid);
      setToUuid(toOpt.liveItemUuid);
    } else if (options.length >= 2) {
      setFromUuid(options[1].liveItemUuid);
      setToUuid(options[0].liveItemUuid);
    } else if (options.length === 1) {
      setFromUuid(options[0].liveItemUuid);
    }
    if (filterParam && FILTER_OPTIONS.some((f) => f.key === filterParam)) {
      setFilter(filterParam as FilterKey);
    }
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bySlug, options]);

  // 選択変更をURLへ反映(共有・ブックマーク・リロード対応)
  useEffect(() => {
    if (!initialized) return;
    const fromSlug = fromUuid ? byUuid.get(fromUuid)?.slug : undefined;
    const toSlug = toUuid ? byUuid.get(toUuid)?.slug : undefined;
    const sp = new URLSearchParams();
    if (fromSlug) sp.set("from", fromSlug);
    if (toSlug) sp.set("to", toSlug);
    if (filter !== "all") sp.set("filter", filter);
    const next = sp.toString() ? `/live/compare/?${sp.toString()}` : "/live/compare/";
    if (next !== `${location.pathname}${location.search}`) {
      navigate(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromUuid, toUuid, filter, initialized, byUuid]);

  const fromItem = fromUuid ? byUuid.get(fromUuid) : undefined;
  const toItem = toUuid ? byUuid.get(toUuid) : undefined;

  // 公演Aに似ている公演(ビルド時集計)を提案として表示する
  const [similarityMap, setSimilarityMap] = useState<Record<string, SimilarPerformance[]> | null>(
    null
  );
  useEffect(() => {
    let cancelled = false;
    fetchLiveItemSimilarity()
      .then((m) => !cancelled && setSimilarityMap(m))
      .catch(() => !cancelled && setSimilarityMap({}));
    return () => {
      cancelled = true;
    };
  }, []);
  const similarSuggestions = (fromUuid && similarityMap?.[fromUuid]) || [];

  const result = useMemo(() => {
    if (!fromItem || !toItem) return null;
    return compareSetlists(fromItem.setList, toItem.setList);
  }, [fromItem, toItem]);

  const filteredSongs = useMemo(
    () => result?.songs.filter((s) => matchesFilter(s, filter)) ?? [],
    [result, filter]
  );

  // 表示レイアウト: 共通曲(anchor)を挟んでAのみ/Bのみを時系列順に1本の
  // フローへアラインメントする(共通曲は横断=全幅、Aのみ/Bのみは左右半分)。
  const segments = useMemo(() => buildCompareSegments(filteredSongs), [filteredSongs]);

  const handleSelect = (side: Side, uuid: string) => {
    if (side === "a") setFromUuid(uuid || null);
    else setToUuid(uuid || null);
  };

  const renderSelect = (side: Side, current: LiveItemOption | undefined) => (
    <select
      value={current?.liveItemUuid ?? ""}
      onChange={(e) => handleSelect(side, e.target.value)}
      className="w-full bg-bx-bg border border-bx-line rounded-lg px-3 py-2 text-sm text-bx-ink"
    >
      <option value="">公演を選択</option>
      {Array.from(
        options.reduce((groups, o) => {
          const list = groups.get(o.liveTitle) ?? [];
          list.push(o);
          groups.set(o.liveTitle, list);
          return groups;
        }, new Map<string, LiveItemOption[]>())
      ).map(([liveTitle, items]) => (
        <optgroup key={liveTitle} label={liveTitle}>
          {items.map((o) => (
            <option key={o.liveItemUuid} value={o.liveItemUuid}>
              {o.date}
              {o.liveItemName ? ` ${o.liveItemName}` : ""}
              {o.place ? ` @ ${o.place}` : ""}
              {o.setList.length === 0 ? "(セトリ未定)" : ""}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-bx-bg">
      <header className="bg-bx-bg shadow-sm border-b border-bx-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-bx-blueLight hover:text-bx-blue font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            HOMEへ戻る
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-bx-ink">セトリ比較</h1>
          <p className="mt-1 text-sm text-bx-ink3">
            2公演のセットリストを比較して、共通曲・差分・曲順の変化を確認できます。
            同一ツアーの全公演を横断したい場合は
            <Link to="/live/tour-heatmap/" className="text-bx-blueLight hover:underline">
              ツアーヒートマップ
            </Link>
            、全公演の中で特に似ているペアを探すなら
            <Link to="/live/similarity-ranking/" className="text-bx-blueLight hover:underline">
              セトリ類似度ランキング
            </Link>
            もどうぞ。
          </p>
        </div>

        {/* 公演選択 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-bx-blueLight mb-1">
              公演 A
            </label>
            {renderSelect("a", fromItem)}
          </div>
          <div>
            <label className="block text-xs font-bold text-bx-yellow mb-1">
              公演 B
            </label>
            {renderSelect("b", toItem)}
          </div>
        </div>

        {/* 公演Aに似ている公演の提案(ビルド時集計) */}
        {fromItem && similarSuggestions.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-bx-ink3 mb-1.5">公演Aに似ている公演:</p>
            <div className="flex flex-wrap gap-1.5">
              {similarSuggestions.map((s) => (
                <button
                  key={s.liveItemUuid}
                  onClick={() => setToUuid(s.liveItemUuid)}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-bx-surface/10 text-bx-ink2 border border-bx-line hover:border-bx-blueLight hover:text-bx-ink transition"
                >
                  {s.liveTitle}
                  {s.liveItemName ? ` ${s.liveItemName}` : ""} ({s.date}) ・ 類似度{" "}
                  {Math.round(s.score * 100)}%
                </button>
              ))}
            </div>
          </div>
        )}

        {!fromItem || !toItem ? (
          <p className="text-sm text-bx-ink3 py-8 text-center">
            比較する公演を2つ選択してください。
          </p>
        ) : !result || (fromItem.setList.length === 0 && toItem.setList.length === 0) ? (
          <p className="text-sm text-bx-ink3 py-8 text-center">
            どちらの公演もまだセットリストが登録されていません。
          </p>
        ) : (
          <>
            {/* サマリー */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs mb-4">
              <div className="bg-bx-bg border border-bx-line rounded p-2">
                <div className="text-bx-ink3">A曲数</div>
                <div className="text-lg font-bold text-bx-blueLight">{result.summary.aCount}</div>
              </div>
              <div className="bg-bx-bg border border-bx-line rounded p-2">
                <div className="text-bx-ink3">B曲数</div>
                <div className="text-lg font-bold text-bx-yellow">{result.summary.bCount}</div>
              </div>
              <div className="bg-bx-bg border border-bx-line rounded p-2">
                <div className="text-bx-ink3">共通曲</div>
                <div className="text-lg font-bold text-emerald-400">{result.summary.commonCount}</div>
              </div>
              <div className="bg-bx-bg border border-bx-line rounded p-2">
                <div className="text-bx-ink3">セトリ類似度</div>
                <div className="text-lg font-bold text-bx-ink">
                  {Math.round(result.summary.jaccardSimilarity * 100)}%
                </div>
              </div>
              <div className="bg-bx-bg border border-bx-line rounded p-2">
                <div className="text-bx-ink3">Aのみ</div>
                <div className="text-lg font-bold text-bx-blueLight">{result.summary.onlyACount}</div>
              </div>
              <div className="bg-bx-bg border border-bx-line rounded p-2">
                <div className="text-bx-ink3">Bのみ</div>
                <div className="text-lg font-bold text-bx-yellow">{result.summary.onlyBCount}</div>
              </div>
              <div className="bg-bx-bg border border-bx-line rounded p-2">
                <div className="text-bx-ink3">共通率</div>
                <div className="text-lg font-bold text-bx-ink">
                  {Math.round(result.summary.commonRate * 100)}%
                </div>
              </div>
              <div className="bg-bx-bg border border-bx-line rounded p-2">
                <div className="text-bx-ink3">最大曲順変動</div>
                <div className="text-lg font-bold text-bx-ink">{result.summary.maxPositionDiff}</div>
              </div>
            </div>

            {/* フィルタ */}
            <div className="flex flex-wrap gap-2 mb-3">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    filter === f.key
                      ? "bg-bx-blue text-white shadow"
                      : "bg-bx-bg text-bx-ink3 border border-bx-line hover:bg-bx-surface/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredSongs.length === 0 ? (
              <p className="text-sm text-bx-ink3 py-8 text-center">
                この条件に一致する曲はありません。
              </p>
            ) : (
              <div>
                {/* 列見出し(Aのみ/Bのみ)。共通曲を挟んで下に何度も現れる左右分割の
                    見出しとして、最初に1回だけ表示する */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-1.5">
                  <h2 className="text-[11px] sm:text-xs font-bold text-bx-blueLight">Aのみ</h2>
                  <h2 className="text-[11px] sm:text-xs font-bold text-bx-yellow text-right">Bのみ</h2>
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  {segments.map((seg, i) => (
                    <React.Fragment key={i}>
                      {(seg.onlyA.length > 0 || seg.onlyB.length > 0) && (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div className="space-y-1 sm:space-y-1.5">
                            {seg.onlyA.map((song) => (
                              <div
                                key={song.key}
                                className="bg-bx-bg border border-bx-line rounded-lg px-1.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2"
                              >
                                <span className="w-5 sm:w-6 shrink-0 text-right font-mono text-[10px] sm:text-xs text-bx-ink3">
                                  {song.aPosition}
                                </span>
                                <span className="flex-1 min-w-0 text-xs sm:text-sm text-bx-ink truncate">
                                  {song.songName}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-1 sm:space-y-1.5">
                            {seg.onlyB.map((song) => (
                              <div
                                key={song.key}
                                className="bg-bx-bg border border-bx-line rounded-lg px-1.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 flex-row-reverse"
                              >
                                <span className="w-5 sm:w-6 shrink-0 text-left font-mono text-[10px] sm:text-xs text-bx-ink3">
                                  {song.bPosition}
                                </span>
                                <span className="flex-1 min-w-0 text-xs sm:text-sm text-bx-ink truncate text-right">
                                  {song.songName}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {seg.anchor && (
                        <div className="bg-bx-bg border border-emerald-500/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3">
                          <span className="w-6 sm:w-7 shrink-0 text-right font-mono text-[10px] sm:text-xs text-bx-ink3">
                            {seg.anchor.aPosition}
                          </span>
                          <span className="flex-1 min-w-0 text-xs sm:text-sm text-bx-ink truncate">
                            {seg.anchor.songName}
                          </span>
                          <PositionDiffBadge song={seg.anchor} />
                          <span className="w-6 sm:w-7 shrink-0 text-left font-mono text-[10px] sm:text-xs text-bx-ink3">
                            {seg.anchor.bPosition}
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export const query = graphql`
  query SetlistCompareQuery {
    live {
      liveInfos {
        liveUuid
        title
        date
        items {
          liveItemUuid
          slug
          liveItemName
          date
          place
          setList {
            liveItemSongUuid
            liveItemSongName
            songUuid
            type
          }
        }
      }
    }
  }
`;

export default SetlistComparePage;

export const Head: HeadFC = () => (
  <SEO
    title="セトリ比較"
    description="Reolの2公演のセットリストを比較して、共通曲・差分・曲順の変化を確認できます。"
    path="/live/compare/"
  />
);
