import React, { useState, useCallback, useEffect } from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import { Timeline } from "flowbite-react";
import { DiscographyWithSongs, Song } from "../../../types/discography";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { FaMusic } from "react-icons/fa6";
import { GoLinkExternal } from "react-icons/go";
import { useColorPalette } from "../../../hooks/useColorPalette";
import { useCollectionOwned } from "../../../hooks/useCollectionOwned";
import { addAlpha } from "../../../utils/colorExtractor";
import YouTube from "react-youtube";
import Tweets from "../../modules/tweets";
import {
  timelineItemTheme,
  timelinePointTheme,
  timelineContentTheme,
} from "./enhanced-discography";
import { trackEvent } from "../../../utils/analytics";

type Props = {
  item: DiscographyWithSongs;
};

// YouTubeのビデオIDを抽出する共通関数
const getYouTubeVideoId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // youtu.be形式
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  
  // youtube.com形式
  const longMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return longMatch[1];
  
  return null;
};

// 楽曲カードコンポーネント
type SongCardProps = {
  song: Song;
  index: number;
  songSlugByUuid: { byUuid: Map<string, string>; byName: Map<string, string> };
};

const SongCard: React.FC<SongCardProps> = ({ song, index, songSlugByUuid }) => {
  // song.slug はこの収録盤(ライブ映像作品等の副次的な収録リストを含む)内での
  // 生データのslugであり、楽曲詳細ページ(/songs/<slug>/)は代表曲にしか存在しない
  // ため、そのまま使うと非代表の重複収録で404になる。songStatsの代表slugへ解決する
  const detailSlug =
    songSlugByUuid.byUuid.get(song.songUuid) ??
    songSlugByUuid.byName.get(song.songName) ??
    null;
  return (
    <li
      className="rounded-lg overflow-hidden border border-bx-line bg-bx-surface/5"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 曲ヘッダー。クレジット/歌詞/配信リンクは楽曲詳細ページに集約済みなので
          ここではアコーディオン展開はせず「詳細」への導線に徹する */}
      <div className="flex items-center gap-3 text-sm p-3">
        <span
          className="font-bold min-w-[2rem] text-center px-2 py-1 rounded text-bx-ink2 bg-bx-surface/10"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex-1 font-medium text-bx-ink">{song.songName}</span>
        {detailSlug && (
          <Link
            to={`/songs/${detailSlug}/`}
            className="inline-flex items-center gap-1 text-xs font-extrabold flex-shrink-0 rounded-full px-2.5 py-1 border border-bx-yellow text-bx-yellow hover:bg-bx-yellow hover:text-bx-bg transition-colors"
            title="楽曲詳細ページ(演奏統計・MV・関連ポスト)を見る"
          >
            詳細
          </Link>
        )}
      </div>
    </li>
  );
};

SongCard.displayName = 'SongCard';

const EnhancedTimelineItem: React.FC<Props> = React.memo(({ item }) => {
  const dispatch = useAppDispatch();
  const { isLoaded, currentVideoId, isShrinked, playerRef } = useAppSelector(
    (state) => state.player
  );

  const [isExpand, setIsExpand] = useState(false);

  // コレクション台帳(所有/視聴済み記録、localStorage完結)
  const { owned, mounted, toggle } = useCollectionOwned();
  const isOwned = mounted && owned.has(item.discographyUuid);
  const handleToggleOwned = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggle(item.discographyUuid);
    },
    [toggle, item.discographyUuid]
  );

  // 曲行の「詳細」リンク先を代表曲(songStats)のslugへ解決するためのマップ
  const songSlugData = useStaticQuery(graphql`
    query DiscographySongSlugMap {
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
    const byUuid = new Map<string, string>();
    const byName = new Map<string, string>();
    for (const s of songSlugData?.songStats?.songStats ?? []) {
      if (s?.songUuid && s?.slug) byUuid.set(s.songUuid, s.slug);
      if (s?.songName && s?.slug) byName.set(s.songName, s.slug);
    }
    return { byUuid, byName };
  }, [songSlugData]);

  // ディープリンク (#disc-<slug>) の対象カードを自動展開する。
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncExpandedByHash = () => {
      const raw = window.location.hash.replace("#", "");
      if (!raw) return;
      if (raw === `disc-${item.slug}`) {
        setIsExpand(true);
      }
    };

    syncExpandedByHash();
    window.addEventListener("hashchange", syncExpandedByHash);
    return () => {
      window.removeEventListener("hashchange", syncExpandedByHash);
    };
  }, [item.slug]);

  // カラーパレットフック（左アクセントバー・バッジ色にのみ使用。カード地色は固定のbxトークン）
  const { colorPalette, isLoading } = useColorPalette({
    title: item.title,
    autoApply: true,
    prefix: `disco-${item.discographyUuid}`,
    themeColorPrimary: item.themeColorPrimary,
    themeColorSecondary: item.themeColorSecondary,
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
    setIsExpand(!isExpand);
  }, [isExpand]);

  const handlePlayClick = useCallback(() => {
    // Play処理は将来実装予定
  }, [item.title]);

  const youtubeVideoId = getYouTubeVideoId(item.xfdUrl);

  // コレクション台帳の所有/視聴済みトグル(カード全体のクリック=展開と競合しないようstopPropagation)
  const ownedToggleButton = (
    <button
      type="button"
      onClick={handleToggleOwned}
      aria-pressed={isOwned}
      aria-label={isOwned ? "所有済みから外す" : "所有/視聴済みにする"}
      title={isOwned ? "所有済み" : "所有/視聴済みにする"}
      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
        isOwned
          ? "border-bx-blue bg-bx-blue text-bx-bg"
          : "border-bx-line text-transparent hover:border-bx-blue"
      }`}
    >
      ✓
    </button>
  );

  return (
    <div className="mb-4">
      {/* カード本体 */}
      <div
        className="relative overflow-hidden cursor-pointer p-4 sm:p-5 w-full rounded-lg border border-bx-line bg-bx-bg/60 hover:border-bx-blue transition-colors duration-300"
        style={{
          borderLeft: `3px solid ${colorPalette.primary || "#6b8ce0"}`,
        }}
        onClick={handleTitleClick}
      >
          {/* コンテンツ情報 */}
          <div className="w-full">
            {!isExpand ? (
              // 非展開時：コンパクトな2行レイアウト
              <div className="space-y-1">
                {/* 1行目：日付　タグ */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-bx-ink2">
                    {item.releaseDate?.replaceAll("-", "/")}
                  </span>
                  <div className="flex gap-1">
                    {item?.format && (
                      <span
                        className="px-2 py-0.5 text-xs font-semibold rounded-md border"
                        style={{
                          backgroundColor: addAlpha(colorPalette.secondary, 0.15),
                          color: colorPalette.secondary,
                          borderColor: addAlpha(colorPalette.secondary, 0.4),
                        }}
                      >
                        {item.format}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2行目：タイトル　所有トグル */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <FaMusic className="w-3 h-3 flex-shrink-0 text-bx-ink2" />
                    <h3 className="text-sm font-bold leading-tight hover:opacity-80 transition-opacity truncate text-bx-ink">
                      {item.title}
                    </h3>
                  </div>
                  {ownedToggleButton}
                </div>
              </div>
            ) : (
              // 展開時：従来のレイアウト
              <>
                <div className="mb-2 text-xs sm:text-sm font-medium leading-none tracking-wider text-bx-ink2">
                  {item.releaseDate?.replaceAll("-", "/")}
                </div>

                <div className="flex flex-col font-semibold">
                  <div className="flex items-center justify-between gap-2 mb-0">
                    <div className="flex items-center gap-1 min-w-0">
                      <FaMusic className="w-4 h-4 flex-shrink-0 text-bx-ink2" />
                      <h3 className="text-base sm:text-lg font-bold leading-tight text-bx-ink">
                        {item.title}
                      </h3>
                    </div>
                    {ownedToggleButton}
                  </div>

                  {/* メタデータ */}
                  <div className="flex flex-wrap gap-2 text-xs mt-3">
                    {item?.name && (
                      <span
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border"
                        style={{
                          backgroundColor: addAlpha(colorPalette.primary, 0.15),
                          color: colorPalette.primary,
                          borderColor: addAlpha(colorPalette.primary, 0.4),
                        }}
                      >
                        {item.name}
                      </span>
                    )}
                    {item?.format && (
                      <span
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border"
                        style={{
                          backgroundColor: addAlpha(colorPalette.secondary, 0.15),
                          color: colorPalette.secondary,
                          borderColor: addAlpha(colorPalette.secondary, 0.4),
                        }}
                      >
                        {item.format}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

              {/* 展開コンテンツ */}
              {isExpand && (
                <>
                  {youtubeVideoId && (
                    <div
                      className="mt-4 transition-all duration-300 rounded-lg border border-bx-line bg-bx-surface/5"
                      style={{
                        overflow: "hidden",
                        position: "relative",
                        paddingBottom: "56.25%", // 16:9アスペクト比
                        height: 0,
                      }}
                    >
                      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                        <YouTube
                          videoId={youtubeVideoId}
                          opts={{
                            width: "100%",
                            height: "100%",
                            playerVars: {
                              autoplay: 0,
                            },
                          }}
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    </div>
                  )}
                  {item.songs.length > 0 && (
                    <div className="mt-4 transition-all duration-300">
                      <ul className="space-y-2">
                        {item.songs.map((song, index) => (
                          <SongCard
                            key={song.songUuid}
                            song={song}
                            index={index}
                            songSlugByUuid={songSlugByUuid}
                          />
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* インタビュー・レポート */}
                  {item.reports && item.reports.length > 0 && (
                    <div className="mt-4 transition-all duration-300">
                      <h4 className="text-sm font-bold pb-3 text-bx-ink">
                        インタビュー
                      </h4>
                      <ul className="list-disc pl-5 text-xs space-y-1">
                        {item.reports.map((report) => (
                          <li
                            key={`report-${report.discographyUuid}-${report.discographyRepoUuid}`}
                            className="leading-relaxed"
                          >
                            <a
                              href={report.discographyReportUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                trackEvent("report_click", {
                                  category: "outbound",
                                  label: report.discographyReportName,
                                })
                              }
                              className="hover:opacity-80 transition-opacity inline-flex items-center gap-1 text-bx-ink"
                            >
                              {report.discographyReportName}
                              <GoLinkExternal className="w-3 h-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 関連ポスト */}
                  {item.posts && item.posts.length > 0 && (
                    <div className="mt-4 transition-all duration-300">
                      <h4 className="text-sm font-bold pb-3 text-bx-ink">
                        関連ポスト
                      </h4>
                      <Tweets
                        parentId={`${item.discographyUuid}`}
                        posts={item.posts.map((post) => ({
                          id: post.discographyPostId,
                          html: post.discographyPostHTML,
                        }))}
                      />
                    </div>
                  )}
                </>
              )}
          </div>
      </div>
    </div>
  );
});

export default EnhancedTimelineItem;
