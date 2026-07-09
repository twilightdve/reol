import React, { useState, useCallback, useEffect } from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import { Timeline } from "flowbite-react";
import { DiscographyWithSongs, Song } from "../../../types/discography";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { FaMusic } from "react-icons/fa6";
import { GoChevronUp, GoListUnordered, GoLinkExternal } from "react-icons/go";
import { BiCommentDetail } from "react-icons/bi";
import { useColorPalette } from "../../../hooks/useColorPalette";
import { addAlpha } from "../../../utils/colorExtractor";
import YouTube from "react-youtube";
import Tweets from "../../modules/tweets";
import {
  timelineItemTheme,
  timelinePointTheme,
  timelineContentTheme,
} from "./enhanced-discography";
import { trackOfficialLinkClick } from "../../../utils/analytics";

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

// bilibiliのBV ID（bvid）を抽出する共通関数
const getBilibiliBvid = (url: string | null | undefined): string | null => {
  if (!url) return null;

  // https://www.bilibili.com/video/BV1tt421p7jt 形式
  const pathMatch = url.match(/bilibili\.com\/video\/(BV[0-9A-Za-z]+)/);
  if (pathMatch) return pathMatch[1];

  // player.bilibili.com/player.html?bvid=BV... クエリ形式
  const queryMatch = url.match(/[?&]bvid=(BV[0-9A-Za-z]+)/);
  if (queryMatch) return queryMatch[1];

  return null;
};

// YouTube埋め込みコンポーネント
const YouTubeEmbed: React.FC<{ videoId: string }> = ({ videoId }) => (
  <div
    className="mb-3 transition-all duration-300 rounded-lg border border-bx-line bg-white/5"
    style={{
      overflow: "hidden",
      position: "relative",
      paddingBottom: "56.25%", // 16:9アスペクト比
      height: 0,
    }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
      <YouTube
        videoId={videoId}
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
);

// bilibili埋め込みコンポーネント
const BilibiliEmbed: React.FC<{ bvid: string }> = ({ bvid }) => (
  <div
    className="mb-3 transition-all duration-300 rounded-lg border border-bx-line bg-white/5"
    style={{
      overflow: "hidden",
      position: "relative",
      paddingBottom: "56.25%", // 16:9アスペクト比
      height: 0,
    }}
  >
    <iframe
      src={`https://player.bilibili.com/player.html?bvid=${bvid}&page=1&autoplay=0`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: 0,
      }}
      scrolling="no"
      frameBorder="0"
      allowFullScreen
      loading="lazy"
      title={`bilibili ${bvid}`}
    />
  </div>
);

// 楽曲カードコンポーネント
type SongCardProps = {
  song: Song;
  index: number;
  isSongExpanded: boolean;
  songSlugByUuid: { byUuid: Map<string, string>; byName: Map<string, string> };
  onToggleExpand: (e: React.MouseEvent) => void;
};

const SongCard: React.FC<SongCardProps> = ({ song, index, isSongExpanded, songSlugByUuid, onToggleExpand }) => {
  // song.slug はこの収録盤(ライブ映像作品等の副次的な収録リストを含む)内での
  // 生データのslugであり、楽曲詳細ページ(/songs/<slug>/)は代表曲にしか存在しない
  // ため、そのまま使うと非代表の重複収録で404になる。songStatsの代表slugへ解決する
  const detailSlug =
    songSlugByUuid.byUuid.get(song.songUuid) ??
    songSlugByUuid.byName.get(song.songName) ??
    null;
  const musicVideoId = getYouTubeVideoId(song.musicVideoUrl);
  const lyricVideoId = getYouTubeVideoId(song.lyricVideoUrl);
  const liveVideoId = getYouTubeVideoId(song.liveVideoUrl);
  const musicBilibili = getBilibiliBvid(song.musicVideoUrl);
  const lyricBilibili = getBilibiliBvid(song.lyricVideoUrl);
  const liveBilibili = getBilibiliBvid(song.liveVideoUrl);

  // YouTube / bilibili を自動で出し分ける
  const renderVideo = (
    label: string,
    youTubeId: string | null,
    bvid: string | null
  ) => {
    if (!youTubeId && !bvid) return null;
    return (
      <div className="mb-2">
        <p className="text-xs font-medium mb-1 text-bx-ink2">
          {label}
        </p>
        {youTubeId ? (
          <YouTubeEmbed videoId={youTubeId} />
        ) : (
          <BilibiliEmbed bvid={bvid!} />
        )}
      </div>
    );
  };

  return (    <li
      className="rounded-lg transition-all duration-200 overflow-hidden border border-bx-line bg-white/5"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 曲ヘッダー（クリック可能） */}
      <div
        className="flex items-start gap-3 text-sm p-3 cursor-pointer group hover:bg-white/5 transition-colors"
        onClick={onToggleExpand}
      >
        <span
          className="font-bold min-w-[2rem] text-center px-2 py-1 rounded text-bx-ink2 bg-white/10"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className="flex-1 font-medium group-hover:text-opacity-90 transition-opacity text-bx-ink"
        >
          {song.songName}
        </span>
        {detailSlug && (
          <Link
            to={`/songs/${detailSlug}/`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium text-bx-ink2 hover:text-bx-blue transition-colors underline underline-offset-2 decoration-dotted flex-shrink-0"
            title="楽曲詳細ページを見る"
          >
            詳細
          </Link>
        )}
        <span
          className="text-xs font-medium flex items-center gap-1 text-bx-ink2"
        >
          {isSongExpanded ? (
            <GoChevronUp className="w-4 h-4" />
          ) : (
            <BiCommentDetail className="w-4 h-4" />
          )}
        </span>
      </div>

      {/* 曲詳細（展開時） */}
      {isSongExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-bx-line">
          {/* クレジット情報 */}
          <div className="text-xs space-y-1 mb-3 text-bx-ink" style={{ whiteSpace: "pre-line" }}>
            {song.lyricMember && (
              <p>
                <span className="text-bx-ink2">作詞：</span>
                {song.lyricMember.replace(/<br\s*\/?>/gi, '\n')}
              </p>
            )}
            {song.musicMember && (
              <p>
                <span className="text-bx-ink2">作曲：</span>
                {song.musicMember.replace(/<br\s*\/?>/gi, '\n')}
              </p>
            )}
            {song.produceMember && (
              <p>
                <span className="text-bx-ink2">編曲：</span>
                {song.produceMember.replace(/<br\s*\/?>/gi, '\n')}
              </p>
            )}
          </div>

          {/* 歌詞(歌ネット)・公式配信リンク。旧 item-song.tsx にあった歌詞リンクの移植 */}
          {(song.lyricUrl || song.downloadUrl) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {song.lyricUrl && (
                <a
                  href={song.lyricUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-bx-line text-bx-ink bg-white/5 transition-colors hover:border-bx-blue"
                  onClick={(event) => event.stopPropagation()}
                >
                  <BiCommentDetail />
                  歌詞を見る(歌ネット)
                  <GoLinkExternal className="text-[10px]" />
                </a>
              )}
              {song.downloadUrl && (
                <a
                  href={song.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-bx-yellow text-bx-bg transition-opacity hover:opacity-90"
                  onClick={(event) => {
                    event.stopPropagation();
                    trackOfficialLinkClick("streaming");
                  }}
                >
                  ♪ 配信で聴く
                  <GoLinkExternal className="text-[10px]" />
                </a>
              )}
            </div>
          )}

          {/* 動画埋め込み（MV、歌詞動画、ライブ動画 / YouTube・bilibili対応） */}
          {renderVideo("Music Video", musicVideoId, musicBilibili)}
          {renderVideo("Lyric Video", lyricVideoId, lyricBilibili)}
          {renderVideo("Live Video", liveVideoId, liveBilibili)}

          {/* Spotify埋め込み */}
          {song.spotifyTrackId && (
            <div className="mb-3">
              <p className="text-xs font-medium mb-1 text-bx-ink2">Spotify</p>
              <iframe
                className="rounded-lg w-full"
                src={`https://open.spotify.com/embed/track/${song.spotifyTrackId}?utm_source=generator`}
                height="152"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          )}

          <div className="text-xs text-bx-ink" style={{ whiteSpace: "pre-line" }}>
            {!musicVideoId && !lyricVideoId && !liveVideoId && !musicBilibili && !lyricBilibili && !liveBilibili && !song.spotifyTrackId && !song.lyricMember && !song.musicMember && !song.produceMember && (
              <p className="text-bx-ink2">
                詳細情報は現在登録されていません
              </p>
            )}
          </div>
        </div>
      )}
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
  const [expandedSongs, setExpandedSongs] = useState<Set<number>>(new Set());

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

                {/* 2行目：タイトル　展開ボタン */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <FaMusic className="w-3 h-3 flex-shrink-0 text-bx-ink2" />
                    <h3 className="text-sm font-bold leading-tight hover:opacity-80 transition-opacity truncate text-bx-ink">
                      {item.title}
                    </h3>
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
                  <div className="flex items-center gap-1 mb-0">
                    <FaMusic className="w-4 h-4 flex-shrink-0 text-bx-ink2" />
                    <h3 className="text-base sm:text-lg font-bold leading-tight text-bx-ink">
                      {item.title}
                    </h3>
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
                      className="mt-4 transition-all duration-300 rounded-lg border border-bx-line bg-white/5"
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
                        {item.songs.map((song, index) => {
                          const isSongExpanded = expandedSongs.has(index);
                          return (
                            <SongCard
                              key={song.songUuid}
                              song={song}
                              index={index}
                              isSongExpanded={isSongExpanded}
                              songSlugByUuid={songSlugByUuid}
                              onToggleExpand={(e) => {
                                e.stopPropagation();
                                setExpandedSongs((prev) => {
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
                        posts={item.posts.reverse().map((post) => ({
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
