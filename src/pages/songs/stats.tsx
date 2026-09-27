import React, { useCallback, useEffect, useMemo, useState } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import Layout from "../../components/modules/layout";
import SEO from "../../components/SEO";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import ErrorRetry from "../../components/common/ErrorRetry";
import { Kicker } from "../../components/redesign";
import { trackOfficialLinkClick } from "../../utils/analytics";
import { LangLink, useDict, useSiteLang } from "../../i18n/site/SiteLangContext";
import { getDict } from "../../i18n/site/dict";
import { DEFAULT_LANG, INTL_LOCALE, isSiteLang } from "../../i18n/site/langs";

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
  musicVideoUrl: string | null;
  downloadUrl: string | null;
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
        musicVideoUrl
        downloadUrl
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
  const dict = useDict();
  const locale = INTL_LOCALE[useSiteLang()];

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

  return (
    <Layout title={dict.stats.title}>
      <main className="container mx-auto px-3 sm:px-4 py-4 text-bx-ink max-w-4xl">
        <header className="mb-5">
          <Kicker color="text-bx-blue" className="mb-2">
            DATA
          </Kicker>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-bx-ink">
            {dict.stats.title}
          </h1>
          <p className="text-xs text-bx-ink3">{dict.stats.lead}</p>
          <LangLink
            to="/about/data/"
            className="inline-block mt-1.5 text-xs text-bx-blue hover:text-bx-blueLight underline underline-offset-2"
          >
            {dict.stats.rulesLink}
          </LangLink>
        </header>

        <section className="mb-5 grid grid-cols-2 gap-2 sm:gap-3">
          <Card
            label={dict.stats.totalPlays}
            value={summary.matchedInstances.toLocaleString(locale)}
            accent="blue"
          />
          <Card
            label={dict.stats.uniqueSongs}
            value={summary.uniqueSongsPlayed.toLocaleString(locale)}
            accent="yellow"
          />
        </section>

        <section className="mb-4 sticky top-0 z-30 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 bg-bx-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bx-bg/85 border-b border-bx-line">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={dict.stats.searchPlaceholder}
              className="flex-1 min-w-[160px] px-3 py-1.5 text-base sm:text-sm rounded-md bg-bx-surface/5 border border-bx-line text-bx-ink placeholder:text-bx-ink2 focus:outline-none focus:border-bx-blue focus:ring-1 focus:ring-bx-blue/40"
            />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="px-2 py-1.5 text-base sm:text-sm rounded-md bg-bx-surface/5 border border-bx-line text-bx-ink focus:outline-none focus:border-bx-blue"
            >
              <option value="plays">{dict.stats.sortPlays}</option>
              <option value="last">{dict.stats.sortLast}</option>
              <option value="first">{dict.stats.sortFirst}</option>
              <option value="name">{dict.stats.sortName}</option>
            </select>
            <span className="text-xs font-medium text-bx-ink2 ml-auto whitespace-nowrap">
              {dict.stats.songCount(filteredSorted.length.toLocaleString(locale))}
            </span>
          </div>
        </section>

        <div className="overflow-x-auto rounded-xl border border-bx-line">
          <table className="w-full min-w-[620px] text-sm border-collapse">
            <thead>
              <tr className="border-b border-bx-line">
                <th className="text-left font-extrabold text-[10px] tracking-[0.2em] px-4 py-3 text-bx-ink3">
                  RANK
                </th>
                <th className="text-left font-extrabold text-[10px] tracking-[0.2em] px-4 py-3 text-bx-ink3">
                  SONG
                </th>
                <th className="text-right font-extrabold text-[10px] tracking-[0.2em] px-4 py-3 text-bx-ink3">
                  PLAYS
                </th>
                <th className="text-left font-extrabold text-[10px] tracking-[0.2em] px-4 py-3 text-bx-ink3">
                  FIRST
                </th>
                <th className="text-left font-extrabold text-[10px] tracking-[0.2em] px-4 py-3 text-bx-ink3">
                  LAST
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map((s, idx) => {
                const isOpen = openSongSlug === s.slug;
                // 「上位」表記は演奏回数ソート・キーワード未入力時のみ意味を持つ（元のバッジ表示条件と同一）
                const isRankedByPlays = sortKey === "plays" && !keyword;
                const rankLabel = isRankedByPlays ? String(idx + 1) : "♪";
                const isTopRank = isRankedByPlays && idx < 3;

                return (
                  <React.Fragment key={s.songUuid}>
                    <tr
                      id={`song-${s.slug}`}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isOpen}
                      onClick={() => setOpenSongSlug(isOpen ? null : s.slug)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOpenSongSlug(isOpen ? null : s.slug);
                        }
                      }}
                      className={`group cursor-pointer transition-colors border-b border-bx-line hover:bg-bx-surface/5 ${
                        isOpen ? "bg-bx-surface/5" : ""
                      }`}
                    >
                      <td
                        className={`px-4 py-3 font-extrabold tabular-nums ${
                          isTopRank ? "text-bx-yellow" : "text-bx-ink"
                        }`}
                      >
                        {rankLabel}
                      </td>
                      <td className="px-4 py-3 font-bold text-bx-ink whitespace-nowrap">
                        <LangLink
                          to={`/songs/${s.slug}/`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-bx-blue hover:underline underline-offset-2"
                          title={dict.stats.toSongPageTitle}
                        >
                          {s.songName}
                        </LangLink>
                        <span
                          aria-hidden
                          className={`ml-2 inline-block text-[10px] text-bx-ink3 transition-transform group-hover:text-bx-blue ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        >
                          ▶
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold tabular-nums text-bx-ink">
                        {s.totalPlays}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums text-bx-ink3">
                        {s.firstPlayedDate ?? "?"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums text-bx-ink3">
                        {s.lastPlayedDate ?? "?"}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="border-b border-bx-line bg-bx-surface/5">
                        <td colSpan={5} className="px-4 pt-3 pb-4 text-xs">
                          <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-bx-ink3">
                            <span>
                              <span className="text-bx-ink3">{dict.stats.firstPlayed}</span>{" "}
                              <span className="font-medium text-bx-ink">
                                {s.firstPlayedDate ?? "?"}
                              </span>
                            </span>
                            <span>
                              <span className="text-bx-ink3">{dict.stats.lastPlayed}</span>{" "}
                              <span className="font-medium text-bx-ink">
                                {s.lastPlayedDate ?? "?"}
                              </span>
                            </span>
                            {s.discographySlug !== null && (
                              <LangLink
                                to={`/discography/#disc-${s.discographySlug}`}
                                className="text-bx-blue hover:text-bx-blueLight underline"
                              >
                                {dict.stats.toAlbum}
                              </LangLink>
                            )}
                            <LangLink
                              to={`/songs/${s.slug}/`}
                              className="text-bx-blue hover:text-bx-blueLight underline"
                            >
                              {dict.stats.toSongPage}
                            </LangLink>
                          </div>
                          {/* 公式送客: 統計から「聴く」への導線(公式MV/公式配信リンクのみ) */}
                          {(s.musicVideoUrl || s.downloadUrl) && (
                            <div className="mb-3 flex flex-wrap gap-2">
                              {s.musicVideoUrl && (
                                <a
                                  href={s.musicVideoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => trackOfficialLinkClick("youtube_mv")}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-bx-line text-bx-ink text-[11px] font-bold hover:border-bx-blue transition-colors"
                                >
                                  {dict.stats.watchMv}
                                </a>
                              )}
                              {s.downloadUrl && (
                                <a
                                  href={s.downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => trackOfficialLinkClick("streaming")}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-bx-yellow text-bx-bg text-[11px] font-extrabold hover:opacity-90 transition-opacity"
                                >
                                  {dict.stats.stream}
                                </a>
                              )}
                            </div>
                          )}
                          <div className="font-semibold text-bx-ink2 mb-2 flex items-center gap-2">
                            <span className="inline-block w-1 h-4 bg-bx-yellow rounded" />
                            {dict.stats.history}
                            <span className="text-[10px] font-normal text-bx-ink3">
                              {dict.stats.historyCount(s.totalPlays)}
                            </span>
                          </div>
                          <PlayHistory
                            songUuid={s.songUuid}
                            status={playsStatus}
                            playsMap={playsMap}
                            error={playsError}
                            onRetry={loadPlays}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSorted.length === 0 && (
          <p className="text-center text-bx-ink3 text-sm py-8">{dict.stats.noMatch}</p>
        )}

        <div className="mt-6 text-xs text-bx-ink3">
          <LangLink to="/" className="underline hover:text-bx-ink">
            {dict.stats.backToTop}
          </LangLink>
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
  const dict = useDict();
  if (status === "error") {
    return (
      <ErrorRetry
        title={dict.stats.historyLoadError}
        description={error ?? undefined}
        onRetry={onRetry}
        tone="dark"
      />
    );
  }
  if (status !== "loaded" || !playsMap) {
    return (
      <LoadingSkeleton
        rows={3}
        rowHeightClassName="h-14"
        rowClassName="border border-bx-line bg-bx-surface/5"
        label={dict.stats.historyLoading}
      />
    );
  }

  const plays = playsMap.get(songUuid) ?? [];
  if (plays.length === 0) {
    return <p className="text-bx-ink3">{dict.stats.historyEmpty}</p>;
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
              <LangLink
                to={`/live/#live-item-${p.liveItemSlug}`}
                className="group flex items-stretch gap-2 sm:gap-3 rounded-md border border-bx-line bg-bx-surface/5 hover:border-bx-blue hover:bg-bx-surface/[0.08] transition-all overflow-hidden"
              >
                {/* 日付ブロック */}
                <div className="flex flex-col items-center justify-center px-2 sm:px-3 py-2 min-w-[58px] sm:min-w-[68px] border-r border-bx-line">
                  <span className="text-[10px] text-bx-ink3 font-medium leading-none">
                    {yyyy}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-bx-yellow font-mono leading-tight mt-0.5">
                    {mmdd}
                  </span>
                </div>
                {/* 情報ブロック */}
                <div className="flex-1 min-w-0 py-2 pr-2 sm:pr-3">
                  <div className="text-sm font-medium text-bx-ink truncate group-hover:text-bx-blueLight">
                    {p.liveTitle}
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                    {p.liveItemName && (
                      <span className="inline-flex items-center text-[11px] text-bx-ink3">
                        <span className="mr-0.5">／</span>
                        {p.liveItemName}
                      </span>
                    )}
                    {p.place && (
                      <span className="inline-flex items-center text-[11px] text-bx-ink3 border border-bx-line px-1.5 py-0.5 rounded">
                        <span className="mr-0.5">📍</span>
                        {p.place}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center pr-2 text-bx-ink3 group-hover:text-bx-blue">
                  →
                </div>
              </LangLink>
            </li>
          );
        })}
    </ol>
  );
};

const accentColors: Record<string, { bar: string; text: string }> = {
  blue: { bar: "bg-bx-blue", text: "text-bx-blue" },
  yellow: { bar: "bg-bx-yellow", text: "text-bx-yellow" },
};

const Card: React.FC<{ label: string; value: string; accent?: "blue" | "yellow" }> = ({
  label,
  value,
  accent = "blue",
}) => {
  const c = accentColors[accent] ?? accentColors.blue;
  return (
    <div className="rounded-lg bg-bx-surface/5 border border-bx-line overflow-hidden">
      <div className={`h-1 ${c.bar}`} />
      <div className="px-3 py-2">
        <div className="text-[10px] sm:text-xs text-bx-ink3">{label}</div>
        <div className={`text-lg sm:text-xl font-bold ${c.text} tabular-nums`}>{value}</div>
      </div>
    </div>
  );
};

export default SongStatsPage;

export const Head: HeadFC<SongStatsPageData, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const dict = getDict(lang);
  return (
    <SEO
      title={dict.stats.title}
      description={dict.stats.metaDescription}
      path="/songs/stats/"
      lang={lang}
    />
  );
};
