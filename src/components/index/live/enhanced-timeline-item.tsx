import React, { useState, useCallback, useEffect } from "react";
import { Timeline } from "flowbite-react";
import { Link, useStaticQuery, graphql } from "gatsby";
import { LiveInfo, MergedLiveItem } from "../../../types/live";
import { FaCalendarAlt } from "react-icons/fa";
import { GoChevronUp, GoListUnordered, GoLinkExternal } from "react-icons/go";
import { useColorPalette } from "../../../hooks/useColorPalette";
import Tweets from "../../modules/tweets";
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
  liveSpotifyPlaylistId?: string;
  songSlugByUuid: Map<string, string>;
  onToggleExpand: (e: React.MouseEvent) => void;
};

const SetCard: React.FC<SetCardProps> = ({ setlist, index, isSetExpanded, liveSpotifyPlaylistId, songSlugByUuid, onToggleExpand }) => {
  return (
    <li
      id={`live-item-${setlist.slug}`}
      className="rounded-lg transition-all duration-200 overflow-hidden scroll-mt-24 bg-white/5 border border-bx-line"
      onClick={(e) => e.stopPropagation()}
    >
      {/* セットリストヘッダー */}
      <div
        className="flex items-start gap-3 text-sm p-3 cursor-pointer group"
        onClick={onToggleExpand}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div className="flex items-center gap-3">
          <span className="font-bold px-3 py-1.5 rounded-lg border border-bx-line text-bx-ink">
            Set {index + 1}
          </span>
          <span className="text-sm font-semibold text-bx-ink group-hover:text-opacity-90 transition-opacity">
            {setlist.liveItemName || `Set ${index + 1}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {setlist.setList && setlist.setList.length > 0 && (
            <span className="text-xs font-medium flex items-center gap-1 text-bx-ink2">
              {isSetExpanded ? (
                <GoChevronUp className="w-4 h-4" />
              ) : (
                <>
                  <GoListUnordered className="w-4 h-4" />
                  {setlist.setList.length}曲
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Set 内容（展開時） */}
      {isSetExpanded && (
        <div
          className="px-4 pb-4 pt-2 bg-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Google Maps */}
          {setlist.googleMapsUrl && (
            <div className="mb-3">
              <iframe
                src={setlist.googleMapsUrl}
                className="w-full rounded-lg"
                height="200"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="text-xs mt-2 space-y-1 text-bx-ink">
                {setlist.address && <p>{setlist.address}</p>}
                {setlist.placeSite && (
                  <a
                    className="flex items-center gap-1 hover:opacity-80 text-bx-blue"
                    href={setlist.placeSite}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {setlist.placeSite}
                    <GoLinkExternal className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Spotify Playlist */}
          {(setlist.spotifyPlaylistId || liveSpotifyPlaylistId) && (
            <div className="mb-3">
              <iframe
                className="rounded-lg w-full"
                src={`https://open.spotify.com/embed/playlist/${setlist.spotifyPlaylistId || liveSpotifyPlaylistId}?utm_source=generator`}
                height="400"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          )}

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
                  const slug = song.songUuid
                    ? songSlugByUuid.get(song.songUuid)
                    : undefined;
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
            {setlist.setList && setlist.setList.length > 0 && (
              <div className="mt-3">
                <Link
                  to={`/relive/?setlistId=${setlist.liveItemUuid}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "rgba(199, 43, 40, 0.85)",
                    color: "#FFF4CE",
                    border: "1px solid rgba(255, 244, 206, 0.4)",
                  }}
                  title="Relive Player (β) — このセットリストをローカル音源で再生します"
                >
                  Relive Playerで聴く (β)
                  <GoLinkExternal className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* セット別関連ポスト */}
          {setlist.posts && setlist.posts.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-semibold mb-2 pb-1 border-b border-bx-line text-bx-ink">
                関連ポスト
              </h5>
              <Tweets
                parentId={`${setlist.liveItemUuid}`}
                posts={setlist.posts.reverse().map((post) => ({
                  id: post.liveItemPostId,
                  html: post.liveItemPostHTML,
                }))}
              />
            </div>
          )}
        </div>
      )}
    </li>
  );
};

SetCard.displayName = 'SetCard';

const EnhancedLiveTimelineItem: React.FC<Props> = React.memo(({ live }) => {
  const [isExpand, setIsExpand] = useState(false);
  const [expandedSets, setExpandedSets] = useState<Set<number>>(new Set());

  // セットリスト曲から楽曲詳細ページ(/songs/<slug>/)へリンクするための songUuid → slug 解決マップ
  const songSlugData = useStaticQuery(graphql`
    query LiveItemSongSlugMap {
      discography {
        discographyWithSongs {
          songs {
            songUuid
            slug
          }
        }
      }
    }
  `);
  const songSlugByUuid = React.useMemo(() => {
    const map = new Map<string, string>();
    const discographies =
      songSlugData?.discography?.discographyWithSongs ?? [];
    for (const disc of discographies) {
      for (const song of disc.songs ?? []) {
        if (song?.songUuid && song?.slug) {
          map.set(song.songUuid, song.slug);
        }
      }
    }
    return map;
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
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.location.hash.replace("#", "");
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
  }, [live.slug, live.items]);

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
    <div className="mb-4">
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
                    {live.items.map((setlist, index) => {
                      const isSetExpanded = expandedSets.has(index);
                      return (
                        <SetCard
                          key={index}
                          setlist={setlist}
                          index={index}
                          isSetExpanded={isSetExpanded}
                          songSlugByUuid={songSlugByUuid}
                          liveSpotifyPlaylistId={live.spotifyPlaylistId || undefined}
                          onToggleExpand={(e) => {
                            e.stopPropagation();
                            setExpandedSets((prev) => {
                              const newSet = new Set(prev);
                              if (newSet.has(index)) {
                                newSet.delete(index);
                              } else {
                                newSet.add(index);
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
                  posts={live.posts.reverse().map((post) => ({
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
