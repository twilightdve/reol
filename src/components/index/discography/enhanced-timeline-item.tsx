import React, { useState, useCallback, useEffect } from "react";
import { useStaticQuery, graphql } from "gatsby";
import { Timeline } from "flowbite-react";
import { DiscographyWithSongs, Song } from "../../../types/discography";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { FaMusic } from "react-icons/fa6";
import { GoLinkExternal } from "react-icons/go";
import { FiCopy, FiCheck } from "react-icons/fi";
import { useColorPalette } from "../../../hooks/useColorPalette";
import { useCollectionOwned } from "../../../hooks/useCollectionOwned";
import { supabase } from "../../../lib/supabase";
import { addAlpha } from "../../../utils/colorExtractor";
import YouTube from "react-youtube";
import Tweets from "../../modules/tweets";
import {
  timelineItemTheme,
  timelinePointTheme,
  timelineContentTheme,
} from "./enhanced-discography";
import { trackEvent } from "../../../utils/analytics";
import { LangLink, useDict } from "../../../i18n/site/SiteLangContext";
import { formatLabel } from "../../../i18n/site/dict";

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
  const t = useDict().discography;
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
          <LangLink
            to={`/songs/${detailSlug}/`}
            className="inline-flex items-center gap-1 text-xs font-extrabold flex-shrink-0 rounded-full px-2.5 py-1 border border-bx-yellow text-bx-yellow hover:bg-bx-yellow hover:text-bx-bg transition-colors"
            title={t.detailTitle}
          >
            {t.detail}
          </LangLink>
        )}
      </div>
    </li>
  );
};

SongCard.displayName = 'SongCard';

const EnhancedTimelineItem: React.FC<Props> = React.memo(({ item }) => {
  const dict = useDict();
  const t = dict.discography;
  const dispatch = useAppDispatch();
  const { isLoaded, currentVideoId, isShrinked, playerRef } = useAppSelector(
    (state) => state.player
  );

  const [isExpand, setIsExpand] = useState(false);

  // 収録曲一覧のクリップボードコピー
  const [songsCopied, setSongsCopied] = useState(false);
  const handleCopySongs = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const lines = item.songs.map(
        (song, i) => `${i + 1}. ${song.songName}`
      );
      const text = [
        item.title,
        ...lines,
        "",
        `https://reol.twilightea.com/discography/#disc-${item.slug}`,
      ].join("\n");
      navigator.clipboard.writeText(text).then(() => {
        setSongsCopied(true);
        setTimeout(() => setSongsCopied(false), 2000);
      });
    },
    [item.songs, item.title, item.slug]
  );

  // コレクション台帳(所有/視聴済み記録。未ログインはlocalStorageのみ、ログイン時はDBにも保存)
  const { owned, mounted, toggle } = useCollectionOwned();
  const isOwned = mounted && owned.has(item.discographyUuid);
  const handleToggleOwned = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggle(item.discographyUuid);
    },
    [toggle, item.discographyUuid]
  );

  // 「N人が所有/視聴済み」の集計表示。カードを展開した時だけ取得する(94件全カード分を
  // 常時取得すると無駄なリクエストが大量発生するため)。個人の特定はできない集計値のみ。
  const [ownedCount, setOwnedCount] = useState<number | null>(null);
  useEffect(() => {
    if (!isExpand || ownedCount !== null || !supabase) return;
    supabase
      .rpc("get_collection_count", { p_namespace: "owned", p_item_uuid: item.discographyUuid })
      .then(({ data, error }: { data: number | null; error: unknown }) => {
        if (!error && typeof data === "number") setOwnedCount(data);
      });
  }, [isExpand, ownedCount, item.discographyUuid]);

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
      aria-label={isOwned ? t.unmarkOwned : t.markOwned}
      title={isOwned ? t.owned : t.markOwned}
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
              // 非展開時：左にサムネイル(48px)＋右にコンパクトな2行レイアウト
              <div className="flex items-center gap-3">
                {youtubeVideoId ? (
                  <img
                    src={`https://i.ytimg.com/vi/${youtubeVideoId}/mqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="w-12 h-12 flex-shrink-0 object-cover rounded bg-bx-surface/5"
                  />
                ) : (
                  <div className="w-12 h-12 flex-shrink-0 rounded bg-bx-surface/5 flex items-center justify-center text-bx-ink3">
                    <FaMusic className="text-lg" aria-hidden="true" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
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
                          {formatLabel(dict, item.format)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2行目：タイトル　所有トグル */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="flex-1 min-w-0 text-sm font-bold leading-tight hover:opacity-80 transition-opacity truncate text-bx-ink">
                      {item.title}
                    </h3>
                    {ownedToggleButton}
                  </div>
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

                  {ownedCount !== null && ownedCount > 0 && (
                    <p className="text-xs text-bx-ink3 mt-1">{t.ownedCount(ownedCount)}</p>
                  )}

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
                      <div className="flex items-center justify-between pb-3">
                        <h4 className="text-sm font-bold text-bx-ink">{t.tracks}</h4>
                        <button
                          type="button"
                          onClick={handleCopySongs}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-bx-ink2 hover:text-bx-blue transition-colors"
                        >
                          {songsCopied ? (
                            <>
                              <FiCheck className="w-3.5 h-3.5" />
                              {t.copied}
                            </>
                          ) : (
                            <>
                              <FiCopy className="w-3.5 h-3.5" />
                              {t.copyTitles}
                            </>
                          )}
                        </button>
                      </div>
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
                        {t.interview}
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
                        {t.relatedPosts}
                      </h4>
                      <Tweets
                        parentId={`${item.discographyUuid}`}
                        reference={{ kind: "release", date: item.releaseDate ?? null }}
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
