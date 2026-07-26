import React, { useState, useCallback, useEffect } from "react";
import { Timeline } from "flowbite-react";
import { Link, useStaticQuery, graphql } from "gatsby";
import { LiveInfo, MergedLiveItem } from "../../../types/live";
import { FaCalendarAlt } from "react-icons/fa";
import { GoChevronUp, GoListUnordered, GoLinkExternal } from "react-icons/go";
import { useColorPalette } from "../../../hooks/useColorPalette";
import Tweets from "../../modules/tweets";
import { trackEvent } from "../../../utils/analytics";
import {
  timelineItemTheme,
  timelinePointTheme,
  timelineContentTheme,
} from "./enhanced-live";

type Props = {
  live: LiveInfo;
};

// セットカードコンポーネント
type SetCardProps = {
  setlist: MergedLiveItem;
  index: number;
  isSetExpanded: boolean;
  songSlugByUuid: { byUuid: Map<string, string>; byName: Map<string, string> };
  onToggleExpand: (e: React.MouseEvent) => void;
};

const SetCard: React.FC<SetCardProps> = ({ setlist, index, isSetExpanded, songSlugByUuid, onToggleExpand }) => {
  return (
    <li
      id={`live-item-${setlist.slug}`}
      className="rounded-lg transition-all duration-200 overflow-hidden scroll-mt-24 bg-white/5 border border-bx-line"
      onClick={(e) => e.stopPropagation()}
    >
      {/* セットリストヘッダー */}
      <div
        className="flex items-start justify-between gap-3 text-sm p-3 cursor-pointer group"
        onClick={onToggleExpand}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="font-bold px-3 py-1.5 rounded-lg border border-bx-line text-bx-ink flex-shrink-0">
            Set {index + 1}
            {setlist.date && (
              <span className="font-normal text-bx-ink2">
                {" "}({setlist.date.split("-").slice(1).join("/")})
              </span>
            )}
          </span>
          <span className="text-sm font-semibold text-bx-ink group-hover:text-opacity-90 transition-opacity truncate">
            {setlist.liveItemName || setlist.place || `Set ${index + 1}`}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {setlist.setList && setlist.setList.length > 0 && (
            <span className="text-xs font-medium flex items-center gap-1 text-bx-ink2">
              {isSetExpanded ? (
                <GoChevronUp className="w-4 h-4" />
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1">
                  <GoListUnordered className="w-4 h-4" />
                  {setlist.setList.length}曲
                </span>
              )}
            </span>
          )}
          <Link
            to={`/live/${setlist.slug}/`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-extrabold flex-shrink-0 rounded-full px-2.5 py-1 border border-bx-yellow text-bx-yellow hover:bg-bx-yellow hover:text-bx-bg transition-colors"
            title="この公演の詳細ページ(セットリスト・会場・関連ポスト)を見る"
          >
            詳細
          </Link>
        </div>
      </div>

      {/* Set 内容（展開時） */}
      {isSetExpanded && (
        <div
          className="px-4 pb-4 pt-2 bg-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Setlist */}
          <div className="mb-3">
            <h5 className="text-sm font-semibold mb-2 pb-1 border-b border-bx-line text-bx-ink">
              セットリスト
            </h5>
            {setlist.setList && setlist.setList.length > 0 ? (
              <ol className="space-y-1 text-xs list-decimal list-inside text-bx-ink" style={{ whiteSpace: "pre-line" }}>
                {setlist.setList.map((song, songIndex) => {
                  const text = song.liveItemSongName
                    ?.replace(/<br\s*\/?>/gi, '\n')
                    .replace(/\n\n+/g, '\n');
                  const slug =
                    (song.songUuid
                      ? songSlugByUuid.byUuid.get(song.songUuid)
                      : undefined) ??
                    (song.liveItemSongName
                      ? songSlugByUuid.byName.get(song.liveItemSongName)
                      : undefined);
                  const linkable =
                    song.songUuid !== undefined && song.songUuid !== null;
                  return (
                    <li key={song.liveItemSongUuid ?? songIndex} className="leading-relaxed">
                      {linkable ? (
                        <Link
                          to={
                            slug
                              ? `/songs/${slug}/`
                              : `/songs/stats/?songUuid=${song.songUuid}#song-${song.songUuid}`
                          }
                          className="underline underline-offset-2 decoration-dotted hover:opacity-80"
                          title={slug ? "楽曲詳細ページを見る" : "楽曲統計ページで演奏履歴を見る"}
                        >
                          {text}
                        </Link>
                      ) : (
                        text
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-xs text-bx-ink2">
                セットリスト情報は現在登録されていません
              </p>
            )}
            <div className="mt-3">
              <Link
                to={`/live/${setlist.slug}/`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-bx-yellow text-bx-bg transition-opacity hover:opacity-90"
              >
                公演詳細ページを見る
                <GoLinkExternal className="text-[10px]" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

SetCard.displayName = 'SetCard';

const EnhancedLiveTimelineItem: React.FC<Props> = React.memo(({ live }) => {
  const [isExpand, setIsExpand] = useState(false);
  const [expandedSets, setExpandedSets] = useState<Set<number>>(new Set());

  // セットリスト曲から楽曲詳細ページ(/songs/<slug>/)へリンクするための songUuid → slug 解決マップ。
  // ページは songStats(代表曲のみ)にしか存在しないため、discographyの全曲(重複あり)
  // ではなく songStats から解決する。songUuid が代表曲と一致しない重複データの場合に
  // 備えて曲名でのフォールバックも用意する(gatsby-node.tsのページ生成側と同じ方針)。
  const songSlugData = useStaticQuery(graphql`
    query LiveItemSongSlugMap {
      songStats {
        songStats {
          songUuid
          slug
          songName
        }
      }
    }
  `);
  const songSlugByUuid = React.useMemo(() => {
    const map = new Map<string, string>();
    const byName = new Map<string, string>();
    const stats = songSlugData?.songStats?.songStats ?? [];
    for (const song of stats) {
      if (song?.songUuid && song?.slug) {
        map.set(song.songUuid, song.slug);
      }
      if (song?.songName && song?.slug) {
        byName.set(song.songName, song.slug);
      }
    }
    return { byUuid: map, byName };
  }, [songSlugData]);

  // カラーパレットフック（左アクセントバー・バッジ色にのみ使用。カード地色は固定のbxトークン）
  const { colorPalette, isLoading } = useColorPalette({
    title: live.title,
    autoApply: true,
    prefix: `live-${live.liveUuid}`,
    themeColorPrimary: live.themeColorPrimary,
    themeColorSecondary: live.themeColorSecondary,
  });

  // 動的なテーマ（メモ化）
  const dynamicTimelineItemTheme = React.useMemo(
    () => ({
      root: {
        horizontal: "relative mb-1 sm:mb-0",
        vertical: "mb-1 ml-6",
      },
      content: {
        root: timelineContentTheme.root,
        body: timelineContentTheme.body,
        time: timelineContentTheme.time,
        title: timelineContentTheme.title,
      },
      point: timelinePointTheme,
    }),
    []
  );

  const handleTitleClick = useCallback(() => {
    setIsExpand((prev) => !prev);
  }, []);

  // 開催中ツアー判定: 既に開始済み（過去/当日に公演あり）かつ未完了（今日以降にも公演あり）の場合のみ
  // ネタバレ警告対象とする。すべての公演が未来日のみのツアーはネタバレ要素が無いので対象外。
  const isOngoingTour = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates: string[] = [];
    if (live.date) dates.push(live.date);
    for (const it of live.items ?? []) {
      if (it.date) dates.push(it.date);
    }
    // 日付文字列は "YYYY-MM-DD" もしくは "YYYY-MM-DD-YYYY-MM-DD" など複数日にまたがる場合あり
    const pickDates = (s: string): Date[] => {
      const matches = s.match(/\d{4}-\d{2}-\d{2}/g) ?? [];
      return matches
        .map((m) => new Date(m))
        .filter((d) => !isNaN(d.getTime()));
    };
    let hasPastOrToday = false;
    let hasTodayOrFuture = false;
    for (const d of dates) {
      for (const dt of pickDates(d)) {
        if (dt.getTime() <= today.getTime()) hasPastOrToday = true;
        if (dt.getTime() >= today.getTime()) hasTodayOrFuture = true;
      }
    }
    return hasPastOrToday && hasTodayOrFuture;
  }, [live.date, live.items]);

  const spoilerStorageKey = `spoiler-ack-${live.liveUuid}`;
  const [spoilerAck, setSpoilerAck] = useState(false);
  // 初期マウント時に sessionStorage から同意状態を復元
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem(spoilerStorageKey) === "1") {
        setSpoilerAck(true);
      }
    } catch {
      // ignore
    }
  }, [spoilerStorageKey]);

  const acceptSpoiler = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSpoilerAck(true);
      try {
        window.sessionStorage.setItem(spoilerStorageKey, "1");
      } catch {
        // ignore
      }
    },
    [spoilerStorageKey]
  );

  // ディープリンク: location.hash が このライブ/セットを指していれば自動展開
  const applyDeepLink = useCallback(
    (raw: string) => {
      if (!raw) return;
      // live-{slug}
      if (raw === `live-${live.slug}`) {
        setIsExpand(true);
        return;
      }
      // live-item-{liveItem.slug}
      const m = raw.match(/^live-item-([a-z0-9-]+)$/);
      if (m) {
        const slug = m[1];
        const idx = (live.items ?? []).findIndex((it) => it.slug === slug);
        if (idx >= 0) {
          setIsExpand(true);
          setExpandedSets((prev) => {
            const ns = new Set(prev);
            ns.add(idx);
            return ns;
          });
        }
      }
    },
    [live.slug, live.items]
  );

  // 初回マウント時(他ページからの遷移・直リンク)は location.hash から判定
  useEffect(() => {
    if (typeof window === "undefined") return;
    applyDeepLink(window.location.hash.replace("#", ""));
  }, [applyDeepLink]);

  // 同一ページ内でのハッシュリンク(例: /live/ 上部の「直近の開催予定」バナー)は
  // client-side router がこのコンポーネントを再マウントしないため、上のuseEffectが
  // 発火しない。そのケースは "live-deep-link" カスタムイベントで直接通知してもらう。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) applyDeepLink(detail);
    };
    window.addEventListener("live-deep-link", handler);
    return () => window.removeEventListener("live-deep-link", handler);
  }, [applyDeepLink]);

  if (isLoading) {
    return (
      <Timeline.Item theme={dynamicTimelineItemTheme}>
        <Timeline.Point theme={timelinePointTheme} />
        <Timeline.Content>
          <div className="p-4 text-bx-ink3">Loading...</div>
        </Timeline.Content>
      </Timeline.Item>
    );
  }

  return (
    <div id={`live-${live.slug}`} className="mb-4 scroll-mt-24">
      <div
        className="relative overflow-hidden cursor-pointer p-4 sm:p-5 w-full rounded-lg border border-bx-line bg-bx-bg/60 hover:border-bx-blue transition-colors duration-300"
        style={{
          borderLeft: `3px solid ${colorPalette.primary || "#6b8ce0"}`,
        }}
          onClick={handleTitleClick}
        >
          <div className="w-full">
            {!isExpand ? (
              // 折りたたみ時：コンパクトなレイアウト
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium text-bx-ink2">
                      {live.date?.replaceAll("-", "/")}
                    </span>
                    {isOngoingTour && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: "#FEF3C7",
                          color: "#92400E",
                          border: "1px solid #F59E0B",
                        }}
                        title="開催中のツアー。セットリストはネタバレ注意"
                      >
                        ⚠ ネタバレ注意
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold leading-tight text-bx-ink">
                    {live.title}
                  </h3>
                </div>

                {/* 展開ボタン */}
                <button
                  onClick={handleTitleClick}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:scale-110 transition-all duration-200 border border-bx-line bg-white/5"
                  aria-label="展開"
                >
                  <GoChevronUp
                    className={`w-4 h-4 text-bx-ink transition-transform duration-300 ${
                      isExpand ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            ) : (
              // 展開時：従来のレイアウト
              <>
                <Timeline.Time
                  theme={{
                    time: "mb-2 text-xs sm:text-sm font-medium leading-none tracking-wider text-bx-ink2",
                  }}
                >
                  {live.date?.replaceAll("-", "/")}
                </Timeline.Time>

                <Timeline.Title
                  theme={{
                    title: `flex flex-col font-semibold`,
                  }}
                >
                  <div className="flex items-center gap-1 mb-0">
                    <FaCalendarAlt className="w-4 h-4 flex-shrink-0 text-bx-ink2" />
                    <h3 className="text-base sm:text-lg font-bold leading-tight text-bx-ink">
                      {live.title}
                    </h3>
                  </div>
                </Timeline.Title>
              </>
            )}
          </div>

          {/* 展開コンテンツ */}
          {isExpand && (
            <>
              {live.items && live.items.length > 0 && (
                <div
                className="mt-4 transition-all duration-300 w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {isOngoingTour && !spoilerAck ? (
                  <div
                    className="rounded-lg p-4 text-center"
                    style={{
                      backgroundColor: "rgba(254, 243, 199, 0.95)",
                      border: "1px solid #F59E0B",
                      color: "#7C2D12",
                    }}
                  >
                    <p className="text-sm font-bold mb-1">⚠ ネタバレ注意</p>
                    <p className="text-xs leading-relaxed mb-3">
                      このツアーは現在開催中です。<br />
                      セットリストや関連投稿にはネタバレが含まれます。<br />
                      内容を確認した上でご覧ください。
                    </p>
                    <button
                      type="button"
                      onClick={acceptSpoiler}
                      className="px-4 py-2 text-xs font-bold rounded-md transition-colors"
                      style={{
                        backgroundColor: "#92400E",
                        color: "#FFFBEB",
                      }}
                    >
                      ネタバレを承知の上で表示する
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {live.items
                      .map((setlist, originalIndex) => ({ setlist, originalIndex }))
                      .sort((a, b) => a.setlist.date.localeCompare(b.setlist.date))
                      .map(({ setlist, originalIndex }, sortedIndex) => {
                        const isSetExpanded = expandedSets.has(originalIndex);
                        return (
                          <SetCard
                            key={originalIndex}
                            setlist={setlist}
                            index={sortedIndex}
                            isSetExpanded={isSetExpanded}
                            songSlugByUuid={songSlugByUuid}
                            onToggleExpand={(e) => {
                              e.stopPropagation();
                              setExpandedSets((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(originalIndex)) {
                                  newSet.delete(originalIndex);
                                } else {
                                  newSet.add(originalIndex);
                                }
                                return newSet;
                              });
                            }}
                          />
                        );
                      })}
                  </ul>
                )}
              </div>
            )}

            {/* LIVEレポート */}
            {live.reports && live.reports.length > 0 && (
              <div className="mt-4 transition-all duration-300">
                <h4 className="text-sm font-bold pb-3 text-bx-ink">
                  LIVE REPORT
                </h4>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  {live.reports.map((report) => (
                    <li
                      key={`report-${report.liveUuid}-${report.liveReportUuid}`}
                      className="leading-relaxed"
                    >
                      <a
                        href={report.liveReportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackEvent("report_click", {
                            category: "outbound",
                            label: report.liveReportName,
                          })
                        }
                        className="hover:opacity-80 transition-opacity inline-flex items-center gap-1 text-bx-ink"
                      >
                        {report.liveReportName}
                        <GoLinkExternal className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 関連ポスト */}
            {live.posts && live.posts.length > 0 && (
              <div className="mt-4 transition-all duration-300">
                <h4 className="text-sm font-bold pb-3 text-bx-ink">
                  関連ポスト
                </h4>
                <Tweets
                  parentId={`${live.liveUuid}`}
                  posts={live.posts.map((post) => ({
                    id: post.livePostId,
                    html: post.livePostHTML,
                  }))}
                />
              </div>
            )}
            </>
          )}
      </div>
    </div>
  );
});

export default EnhancedLiveTimelineItem;
