/**
 * /songs/<slug>/ — 曲詳細ハブページ
 *
 * gatsby-node.ts の createPages で SongStats(演奏統計 + plays)と
 * discography(クレジット等の追加メタ)を songUuid で結合し、
 * 曲ごとに context を焼き込んで静的生成している(全130曲)。
 *
 * 権利方針: 埋め込み/リンクは公式のみ(公式MV / 公式配信 / 歌ネット / Spotify埋め込み)。
 * 非公式ファンサイトのため、JSON-LD で Reol 本人を名乗る Organization/Person は作らない。
 *
 * 見た目: リデザインB案「BLACKBOX / CHRONICLE」(plan/15, plan/16)。
 * ヘッダー/フッター/背景は Body (wrapRootElement) 側で既にダークテーマ適用済みのため、
 * ここでは <main> 配下の見た目のみを bx トークンで揃える。
 */
import React, { useState } from "react";
import { HeadFC, PageProps } from "gatsby";
import { FiMic, FiPlay, FiX } from "react-icons/fi";
import { GoLinkExternal } from "react-icons/go";
import YouTube from "react-youtube";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import EmptyState from "../components/common/EmptyState";
import LazyComponent from "../components/modules/LazyComponent";
import Tweets from "../components/modules/tweets";
import { GlassCard, Kicker } from "../components/redesign";
import { trackEvent, trackOfficialLinkClick } from "../utils/analytics";
import { LangLink, useDict, useSiteLang } from "../i18n/site/SiteLangContext";
import { getDict, SiteDict } from "../i18n/site/dict";
import { DEFAULT_LANG, INTL_LOCALE, isSiteLang } from "../i18n/site/langs";
import { localizePath } from "../utils/i18nRoutes";
import {
  buildBreadcrumbList,
  buildMusicRecording,
  buildMusicEvent,
  buildMusicEventItemList,
  isValidIsoDate,
} from "../utils/jsonLd";

// YouTubeのビデオIDを抽出する共通関数(discography/liveの実装と同様)
const getYouTubeVideoId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  const longMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return longMatch[1];
  return null;
};

// bilibiliのBV ID(bvid)を抽出する共通関数
const getBilibiliBvid = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const pathMatch = url.match(/bilibili\.com\/video\/(BV[0-9A-Za-z]+)/);
  if (pathMatch) return pathMatch[1];
  const queryMatch = url.match(/[?&]bvid=(BV[0-9A-Za-z]+)/);
  if (queryMatch) return queryMatch[1];
  return null;
};

type Play = {
  date: string;
  place: string | null;
  liveTitle: string;
  liveSlug: string;
  liveItemSlug: string;
  liveItemName: string | null;
  liveItemSongUuid: string;
  youtubeVideoId: string | null;
};

export interface SongPageContext {
  songUuid: string;
  slug: string;
  songName: string;
  discographyUuid: string | null;
  discographySlug: string | null;
  discographyTitle: string | null;
  totalPlays: number;
  firstPlayedDate: string | null;
  lastPlayedDate: string | null;
  musicVideoUrl: string | null;
  downloadUrl: string | null;
  lyricUrl: string | null;
  spotifyTrackId: string | null;
  lyricMember: string | null;
  musicMember: string | null;
  lyricVideoUrl: string | null;
  liveVideoUrl: string | null;
  /** 同アルバム収録曲(slugは代表曲ページが存在する場合のみ) */
  albumSongs: { songName: string; slug: string | null }[];
  /** 収録アルバムのインタビュー・関連ポスト(アルバム単位のデータを転載) */
  albumReports: {
    discographyRepoUuid: string;
    discographyReportName: string;
    discographyReportUrl: string;
  }[];
  albumPosts: {
    discographyPostUuid: string;
    discographyPostId: string;
    discographyPostHTML: string;
  }[];
  plays: Play[];
}

const SongPage: React.FC<PageProps<object, SongPageContext>> = ({ pageContext }) => {
  const lang = useSiteLang();
  const t = useDict().song;
  const locale = INTL_LOCALE[lang];
  const {
    songName,
    slug,
    discographySlug,
    discographyTitle,
    totalPlays,
    firstPlayedDate,
    lastPlayedDate,
    musicVideoUrl,
    downloadUrl,
    lyricUrl,
    spotifyTrackId,
    lyricMember,
    musicMember,
    lyricVideoUrl,
    liveVideoUrl,
    albumSongs,
    albumReports,
    albumPosts,
    plays,
  } = pageContext;

  const sortedPlays = [...plays].sort((a, b) => b.date.localeCompare(a.date));

  // 演奏履歴内のYouTube映像(演奏映像)はクリックで展開する
  const [expandedPlayVideos, setExpandedPlayVideos] = useState<Set<string>>(
    new Set()
  );
  const togglePlayVideo = (key: string) => {
    setExpandedPlayVideos((prev) => {
      // 同時に複数の動画が自動再生されて音声が二重にならないよう、
      // 開く際は他を全て閉じて常に最大1件だけ展開する
      if (prev.has(key)) return new Set();
      trackEvent("song_play_video_toggle", {
        category: "engagement",
        label: key,
      });
      const next = new Set([key]);
      return next;
    });
  };

  // Xシェア: intentリンク(外部サービスへの送信はユーザーのクリック起点)
  const shareUrl = `https://reol.twilightea.com${localizePath(`/songs/${slug}/`, lang)}`;
  const shareText = t.shareText(songName);
  const shareIntentUrl = `https://x.com/intent/post?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;

  const otherAlbumSongs = (albumSongs ?? []).filter((s) => s.slug !== slug);

  const videoEmbeds = [
    { label: "Music Video", url: musicVideoUrl },
    { label: "Lyric Video", url: lyricVideoUrl },
    { label: "Live Video", url: liveVideoUrl },
  ]
    .map(({ label, url }) => {
      const youTubeId = getYouTubeVideoId(url);
      const bvid = youTubeId ? null : getBilibiliBvid(url);
      return { label, youTubeId, bvid };
    })
    .filter((v) => v.youTubeId || v.bvid);

  const statCards = [
    { label: t.totalPlays, value: t.playsValue(totalPlays.toLocaleString(locale)) },
    { label: t.firstPlayed, value: firstPlayedDate ?? "―" },
    { label: t.lastPlayed, value: lastPlayedDate ?? "―" },
  ];

  return (
    <Layout title={songName}>
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl text-bx-ink">
        {/* パンくず */}
        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-bx-ink3">
          <LangLink to="/" className="hover:text-bx-blue transition-colors">
            HOME
          </LangLink>
          <span aria-hidden>/</span>
          <LangLink to="/songs/stats/" className="hover:text-bx-blue transition-colors">
            SONGS
          </LangLink>
          <span aria-hidden>/</span>
          <span className="text-bx-ink">{songName}</span>
        </p>

        {/* ①曲名ヒーロー + 収録アルバム + クレジット */}
        <header className="mt-4 mb-8">
          <Kicker color="text-bx-blue">SONG ARCHIVE</Kicker>
          <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold leading-tight text-bx-ink">
            {songName}
          </h1>
          {discographyTitle && discographySlug && (
            <p className="mt-4 text-[13px] text-bx-ink3">
              {t.album}{" "}
              <LangLink
                to={`/discography/#disc-${discographySlug}`}
                className="text-bx-blue hover:text-bx-blueLight underline underline-offset-2"
              >
                {discographyTitle}
              </LangLink>
            </p>
          )}
          {(lyricMember || musicMember) && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-bx-ink3">
              {lyricMember && <span>{t.lyrics}: {lyricMember}</span>}
              {musicMember && <span>{t.music}: {musicMember}</span>}
            </div>
          )}
        </header>

        {/* ②演奏統計カード */}
        <section className="mb-8 flex border-t border-b border-bx-line">
          {statCards.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex-1 px-3 sm:px-6 py-5 ${
                i < statCards.length - 1 ? "border-r border-bx-line" : ""
              }`}
            >
              <div className="text-xl sm:text-3xl font-extrabold leading-none text-bx-ink tabular-nums">
                {stat.value}
              </div>
              <div className="mt-2 text-[10px] font-extrabold tracking-[0.26em] text-bx-ink3">
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* ③公式導線ボタン群(あるものだけ) + Xシェア */}
        <section className="mb-8 flex flex-wrap items-center gap-3">
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOfficialLinkClick("streaming")}
                className="text-[12px] font-extrabold tracking-wide rounded-full px-5 py-2 bg-bx-yellow text-bx-bg hover:opacity-90 transition-opacity"
              >
                {t.stream}
              </a>
            )}
            {lyricUrl && (
              <a
                href={lyricUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOfficialLinkClick("lyrics")}
                className="text-[12px] font-extrabold tracking-wide rounded-full px-5 py-2 border border-bx-line text-bx-ink hover:border-bx-blue transition-colors"
              >
                {t.lyricsLink}
              </a>
            )}
            {musicVideoUrl && (
              <a
                href={musicVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOfficialLinkClick("youtube_mv")}
                className="text-[12px] font-extrabold tracking-wide rounded-full px-5 py-2 border border-bx-line text-bx-ink hover:border-bx-blue transition-colors"
              >
                {t.watchMv}
              </a>
            )}
            <a
              href={shareIntentUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("song_share", { category: "share", label: songName })
              }
              className="text-[12px] font-extrabold tracking-wide rounded-full px-5 py-2 border border-bx-line text-bx-ink3 hover:border-bx-blue hover:text-bx-ink transition-colors"
              title={t.shareTitle}
            >
              {t.share}
            </a>
          </section>

        {/* ③'公式動画埋め込みプレイヤー(MV / 歌詞動画 / ライブ映像) */}
        {videoEmbeds.length > 0 && (
          <section className="mb-8 space-y-4">
            {videoEmbeds.map(({ label, youTubeId, bvid }) => (
              <LazyComponent key={label}>
                <p className="mb-2 text-[11px] font-extrabold tracking-wide text-bx-ink3">
                  {label}
                </p>
                <div
                  className="rounded-xl border border-bx-line bg-bx-surface/5 overflow-hidden relative"
                  style={{ paddingBottom: "56.25%", height: 0 }}
                >
                  <div className="absolute top-0 left-0 w-full h-full">
                    {youTubeId ? (
                      <YouTube
                        videoId={youTubeId}
                        opts={{
                          width: "100%",
                          height: "100%",
                          playerVars: { autoplay: 0 },
                        }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    ) : (
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
                        title={`${label} - ${songName}`}
                      />
                    )}
                  </div>
                </div>
              </LazyComponent>
            ))}
          </section>
        )}

        {/* ④Spotify埋め込み */}
        {spotifyTrackId && (
          <section className="mb-8">
            <LazyComponent>
              <div className="rounded-xl border border-bx-line overflow-hidden">
                <iframe
                  className="block w-full"
                  src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator`}
                  width="100%"
                  height="152"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title={`Spotify - ${songName}`}
                />
              </div>
            </LazyComponent>
          </section>
        )}

        {/* ④'収録アルバムのインタビュー */}
        {albumReports && albumReports.length > 0 && (
          <section className="mb-8">
            <Kicker className="mb-4">INTERVIEW</Kicker>
            <ul className="list-disc pl-5 text-xs space-y-1">
              {albumReports.map((report) => (
                <li key={report.discographyRepoUuid} className="leading-relaxed">
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
          </section>
        )}

        {/* ⑤演奏履歴タイムライン */}
        {/* 通過コストがほぼゼロの一覧型セクションを、没入型で長い関連ポストより
            前に置く。逆順だと関連ポストの後がスクロールで到達されにくいため。 */}
        <section className="mb-10">
          <Kicker className="mb-4">
            {t.historyKicker(totalPlays.toLocaleString(locale))}
          </Kicker>

          {sortedPlays.length === 0 ? (
            <EmptyState
              icon={<FiMic />}
              tone="dark"
              title={t.noHistoryTitle}
              description={t.noHistoryDesc}
            />
          ) : (
            <div className="relative pl-6">
              <span
                aria-hidden
                className="absolute left-[3px] top-1.5 bottom-1.5 w-px bg-bx-line"
              />
              {sortedPlays.map((p) => {
                const formattedDate = p.date.replaceAll("-", ".");
                return (
                  <div key={p.liveItemSongUuid} className="relative pb-6 last:pb-0">
                    <span
                      aria-hidden
                      className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-bx-yellow"
                    />
                    <LangLink
                      to={`/live/#live-item-${p.liveItemSlug}`}
                      className="group block"
                    >
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <span className="text-sm font-extrabold text-bx-yellow tabular-nums">
                          {formattedDate}
                        </span>
                        <span className="text-[11px] text-bx-ink3">{p.liveTitle}</span>
                      </div>
                      <p className="mt-1 text-[15px] font-bold text-bx-ink group-hover:text-bx-blue transition-colors">
                        {p.place ?? t.venueTbd}
                        {p.liveItemName && (
                          <span className="ml-2 text-[11px] font-normal text-bx-ink3">
                            {p.liveItemName}
                          </span>
                        )}
                      </p>
                    </LangLink>
                    {p.youtubeVideoId && (
                      <button
                        type="button"
                        onClick={() => togglePlayVideo(p.liveItemSongUuid)}
                        aria-expanded={expandedPlayVideos.has(p.liveItemSongUuid)}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-bx-blue hover:opacity-80 transition-opacity"
                      >
                        {expandedPlayVideos.has(p.liveItemSongUuid) ? (
                          <>
                            <FiX className="w-3 h-3" />
                            {t.closeVideo}
                          </>
                        ) : (
                          <>
                            <FiPlay className="w-3 h-3" />
                            {t.watchVideo}
                          </>
                        )}
                      </button>
                    )}
                    {p.youtubeVideoId &&
                      expandedPlayVideos.has(p.liveItemSongUuid) && (
                        <div
                          className="mt-2 rounded-lg border border-bx-line overflow-hidden"
                          style={{ aspectRatio: "16 / 9" }}
                        >
                          <YouTube
                            videoId={p.youtubeVideoId}
                            opts={{
                              width: "100%",
                              height: "100%",
                              playerVars: { autoplay: 1 },
                            }}
                            style={{ width: "100%", height: "100%" }}
                            className="w-full h-full"
                          />
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ④''収録アルバムの関連ポスト */}
        {albumPosts && albumPosts.length > 0 && (
          <section className="mb-8">
            <Kicker className="mb-4">{t.relatedPosts}</Kicker>
            <Tweets
              parentId={`song-${slug}`}
              posts={albumPosts.map((post) => ({
                id: post.discographyPostId,
                html: post.discographyPostHTML,
              }))}
            />
          </section>
        )}

        {/* ⑤'同アルバム収録曲(回遊) */}
        {discographyTitle && otherAlbumSongs.length > 0 && (
          <section className="mb-10">
            <Kicker className="mb-4">
              ALSO ON 『{discographyTitle}』
            </Kicker>
            <ul className="flex flex-wrap gap-2">
              {otherAlbumSongs.map((s, i) =>
                s.slug ? (
                  <li key={`${s.slug}-${i}`}>
                    <LangLink
                      to={`/songs/${s.slug}/`}
                      className="inline-block text-[12px] font-semibold rounded-full px-3.5 py-1.5 border border-bx-line text-bx-ink hover:border-bx-blue transition-colors"
                    >
                      {s.songName}
                    </LangLink>
                  </li>
                ) : (
                  <li key={`nolink-${i}`}>
                    <span className="inline-block text-[12px] font-semibold rounded-full px-3.5 py-1.5 border border-bx-line text-bx-ink3">
                      {s.songName}
                    </span>
                  </li>
                )
              )}
            </ul>
          </section>
        )}


        {/* ⑥回遊 */}
        <section className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <GlassCard to="/songs/stats/" accent="blueLight" className="p-4">
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blueLight">
              DATA
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.toStatsTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              {t.toStatsDesc}
            </p>
          </GlassCard>
          <GlassCard to="/search/" accent="yellow" className="p-4">
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-yellow">
              SEARCH
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.toSearchTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              {t.toSearchDesc}
            </p>
          </GlassCard>
        </section>
        <p className="text-right">
          <LangLink
            to="/"
            className="text-[11.5px] font-bold text-bx-ink3 hover:text-bx-blue transition-colors"
          >
            {t.backToTop}
          </LangLink>
        </p>
      </main>
    </Layout>
  );
};

export default SongPage;

/**
 * 機械生成の description(演奏統計から導出できる事実のみ)。
 * SSGでの翻訳キー露出を避けるため、Head では react-i18next の t() を使用しない。
 */
const buildDescription = (ctx: SongPageContext, t: SiteDict["song"]): string => {
  const parts = [t.metaLead(ctx.songName)];
  if (ctx.totalPlays > 0) {
    parts.push(t.metaPlays(ctx.totalPlays, ctx.firstPlayedDate));
  } else {
    parts.push(t.metaNoPlays);
  }
  parts.push(t.metaTail);
  return parts.join("");
};

export const Head: HeadFC<object, SongPageContext> = ({ pageContext }) => {
  const { songName, discographyTitle, slug, plays } = pageContext;
  const langCtx = (pageContext as { lang?: unknown }).lang;
  const lang = isSiteLang(langCtx) ? langCtx : DEFAULT_LANG;
  const dict = getDict(lang);

  // 演奏履歴(日付が正しいものだけ)をMusicEventのItemListとして構造化データ化する。
  // 「この曲はいつ初披露/最後に演奏されたか」に生成AIが直接答えられるようにするため。
  const performanceEvents = [...plays]
    .filter((p) => isValidIsoDate(p.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) =>
      buildMusicEvent({
        name: p.liveItemName ? `${p.liveTitle} / ${p.liveItemName}` : p.liveTitle,
        startDate: p.date,
        place: p.place,
      })
    );

  return (
    <SEO
      title={`${songName}(Reol)`}
      description={buildDescription(pageContext, dict.song)}
      path={`/songs/${slug}/`}
      lang={lang}
      image={`https://reol.twilightea.com/og/songs/${slug}.png`}
      jsonLd={[
        buildMusicRecording({ name: songName, albumName: discographyTitle }),
        buildBreadcrumbList([
          { name: dict.site.breadcrumbHome, path: localizePath("/", lang) },
          { name: dict.song.breadcrumbStats, path: localizePath("/songs/stats/", lang) },
          { name: songName },
        ]),
        ...(performanceEvents.length > 0 ? [buildMusicEventItemList(performanceEvents)] : []),
      ]}
    />
  );
};
