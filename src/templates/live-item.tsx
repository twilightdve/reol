/**
 * /live/<slug>/ — 公演(1日程)詳細ページ
 *
 * gatsby-node.ts の createPages で Live(セットリスト等)を liveItem 単位に
 * 分解し、曲詳細ページ(/songs/<slug>/)と同じ songStats 代表slugへ解決した
 * うえで context を焼き込んで静的生成している。
 *
 * 見た目: リデザインB案「BLACKBOX / CHRONICLE」(plan/15, plan/16)。song.tsx と
 * 同じセクション構成(ヒーロー→導線ボタン→本編→回遊)に揃えている。
 */
import React, { useState } from "react";
import { HeadFC, Link, PageProps } from "gatsby";
import { GoLinkExternal } from "react-icons/go";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import EmptyState from "../components/common/EmptyState";
import LazyComponent from "../components/modules/LazyComponent";
import Tweets from "../components/modules/tweets";
import YouTube from "react-youtube";
import { FiMusic, FiPlay, FiX, FiCopy, FiCheck } from "react-icons/fi";
import { GlassCard, Kicker } from "../components/redesign";
import { trackEvent } from "../utils/analytics";
import { buildBreadcrumbList, buildMusicEvent, isValidIsoDate, REOL_PERFORMER } from "../utils/jsonLd";

type SetListSong = {
  liveItemSongUuid: string;
  liveItemSongName: string;
  type: string | null;
  youtubeVideoId: string | null;
  slug: string | null;
};

const isNonSongItem = (song: Pick<SetListSong, "type">): boolean =>
  song.type === "segment";

// live/live_itemの「youtube」列は動画IDとプレイリストIDを共存させている。
// YouTubeの動画IDは常に11文字、プレイリストIDはそれより長いため長さで判定する。
const isYoutubePlaylistId = (id: string | null | undefined): boolean =>
  !!id && id.length !== 11;

type SiblingItem = {
  slug: string;
  date: string;
  liveItemName: string | null;
  place: string | null;
};

export interface LiveItemPageContext {
  liveItemUuid: string;
  slug: string;
  liveUuid: string;
  liveSlug: string;
  liveTitle: string;
  liveItemName: string | null;
  date: string;
  place: string | null;
  placeSite: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  spotifyPlaylistId: string | null;
  youtubeVideoId: string | null;
  setList: SetListSong[];
  posts: {
    liveItemPostUuid: string;
    liveItemPostId: string;
    liveItemPostHTML: string;
  }[];
  reports: {
    liveReportUuid: string;
    liveReportName: string;
    liveReportUrl: string;
  }[];
  /** 同ツアー内の他公演(回遊用) */
  siblingItems: SiblingItem[];
}

const LiveItemPage: React.FC<PageProps<object, LiveItemPageContext>> = ({
  pageContext,
}) => {
  const {
    slug,
    liveSlug,
    liveTitle,
    liveItemName,
    date,
    place,
    placeSite,
    address,
    googleMapsUrl,
    spotifyPlaylistId,
    youtubeVideoId,
    setList,
    posts,
    reports,
    siblingItems,
  } = pageContext;

  const heading = liveItemName || liveTitle;
  const mcCount = setList.filter(isNonSongItem).length;
  const songCount = setList.length - mcCount;

  // セットリスト内の曲ごとのYouTube映像(演奏映像)はクリックで展開する
  const [expandedSongVideos, setExpandedSongVideos] = useState<Set<string>>(
    new Set()
  );
  const toggleSongVideo = (key: string) => {
    setExpandedSongVideos((prev) => {
      // 同時に複数の動画が自動再生されて音声が二重にならないよう、
      // 開く際は他を全て閉じて常に最大1件だけ展開する
      if (prev.has(key)) return new Set();
      trackEvent("live_item_song_video_toggle", {
        category: "engagement",
        label: key,
      });
      return new Set([key]);
    });
  };

  // セットリストのクリップボードコピー
  const [setListCopied, setSetListCopied] = useState(false);
  const handleCopySetList = () => {
    const numberedLines: string[] = [];
    let songIndex = 0;
    for (const song of setList) {
      if (isNonSongItem(song)) {
        numberedLines.push(`（${song.liveItemSongName}）`);
      } else {
        songIndex += 1;
        numberedLines.push(`${songIndex}. ${song.liveItemSongName}`);
      }
    }
    const title = liveItemName ? `${liveTitle} ${liveItemName}` : liveTitle;
    const text = [
      `${title} セットリスト`,
      ...numberedLines,
      "",
      `https://reol.twilightea.com/live/${slug}/`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setSetListCopied(true);
      setTimeout(() => setSetListCopied(false), 2000);
    });
  };

  // Xシェア: intentリンク(外部サービスへの送信はユーザーのクリック起点)
  const shareUrl = `https://reol.twilightea.com/live/${slug}/`;
  const shareText = `Reol「${heading}」のセットリスト・会場情報 | !Legit(非公式ファンサイト)`;
  const shareIntentUrl = `https://x.com/intent/post?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <Layout title={heading}>
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl text-bx-ink">
        {/* パンくず */}
        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-bx-ink3">
          <Link to="/" className="hover:text-bx-blue transition-colors">
            HOME
          </Link>
          <span aria-hidden>/</span>
          <Link to="/live/" className="hover:text-bx-blue transition-colors">
            LIVE
          </Link>
          <span aria-hidden>/</span>
          <span className="text-bx-ink">{heading}</span>
        </p>

        {/* ①公演名ヒーロー */}
        <header className="mt-4 mb-8">
          <Kicker color="text-bx-blue">LIVE ARCHIVE</Kicker>
          <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold leading-tight text-bx-ink">
            {heading}
          </h1>
          <p className="mt-4 text-[13px] text-bx-ink3">
            {liveTitle !== heading && (
              <Link
                to={`/live/#live-item-${slug}`}
                className="text-bx-blue hover:text-bx-blueLight underline underline-offset-2"
              >
                {liveTitle}
              </Link>
            )}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-bx-ink3">
            <span>{date?.replaceAll("-", "/")}</span>
            {place && <span>会場: {place}</span>}
          </div>
        </header>

        {/* ②公式導線ボタン群 + Xシェア */}
        <section className="mb-8 flex flex-wrap items-center gap-3">
          {placeSite && (
            <a
              href={placeSite}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("venue_site_click", { category: "outbound", label: heading })
              }
              className="text-[12px] font-extrabold tracking-wide rounded-full px-5 py-2 border border-bx-line text-bx-ink hover:border-bx-blue transition-colors"
            >
              会場サイトを見る
            </a>
          )}
          {setList.length > 0 && (
            <Link
              to={`/relive/?setlistId=${slug}`}
              onClick={() =>
                trackEvent("relive_player_click", { category: "engagement", label: heading })
              }
              className="text-[12px] font-extrabold tracking-wide rounded-full px-5 py-2 bg-bx-yellow text-bx-bg hover:opacity-90 transition-opacity"
              title="Relive Player (β) — このセットリストをローカル音源で再生します"
            >
              Relive Playerで聴く (β)
            </Link>
          )}
          <a
            href={shareIntentUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("live_item_share", { category: "share", label: heading })
            }
            className="text-[12px] font-extrabold tracking-wide rounded-full px-5 py-2 border border-bx-line text-bx-ink3 hover:border-bx-blue hover:text-bx-ink transition-colors"
            title="この公演のページをXでシェア"
          >
            Xでシェア
          </a>
        </section>

        {/* ③会場マップ */}
        {googleMapsUrl && (
          <section className="mb-8">
            <LazyComponent>
              <div className="rounded-xl border border-bx-line overflow-hidden">
                <iframe
                  src={googleMapsUrl}
                  className="w-full block"
                  height="240"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`会場マップ - ${heading}`}
                />
              </div>
              {address && <p className="mt-2 text-[12px] text-bx-ink3">{address}</p>}
            </LazyComponent>
          </section>
        )}

        {/* ④'YouTube(公演のアーカイブ動画等) */}
        {youtubeVideoId && (
          <section className="mb-8">
            <LazyComponent>
              <div className="rounded-xl border border-bx-line overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
                <iframe
                  src={
                    isYoutubePlaylistId(youtubeVideoId)
                      ? `https://www.youtube-nocookie.com/embed/videoseries?list=${youtubeVideoId}`
                      : `https://www.youtube-nocookie.com/embed/${youtubeVideoId}`
                  }
                  title={`YouTube - ${heading}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </LazyComponent>
          </section>
        )}

        {/* ⑤セットリスト */}
        <section className="mb-10">
          <div className="flex items-center justify-between gap-2 mb-4">
            <Kicker className="mb-0">
              SETLIST — {songCount}曲
              {mcCount > 0 ? `（MC ${mcCount}）` : ""}
            </Kicker>
            {setList.length > 0 && (
              <button
                type="button"
                onClick={handleCopySetList}
                className="inline-flex items-center gap-1 text-xs font-semibold text-bx-ink2 hover:text-bx-blue transition-colors flex-shrink-0"
              >
                {setListCopied ? (
                  <>
                    <FiCheck className="w-3.5 h-3.5" />
                    コピーしました
                  </>
                ) : (
                  <>
                    <FiCopy className="w-3.5 h-3.5" />
                    コピー
                  </>
                )}
              </button>
            )}
          </div>
          {setList.length === 0 ? (
            <EmptyState
              icon={<FiMusic />}
              tone="dark"
              title="セットリスト情報は現在登録されていません"
              description="情報が確認でき次第、追加します。"
            />
          ) : (
            <ul className="space-y-1 text-sm list-none text-bx-ink">
              {(() => {
                let songIndex = 0;
                return setList.map((song) => {
                  if (isNonSongItem(song)) {
                    return (
                      <li
                        key={song.liveItemSongUuid}
                        className="leading-relaxed pl-6 text-bx-ink3 text-xs italic"
                      >
                        {song.liveItemSongName}
                      </li>
                    );
                  }
                  songIndex += 1;
                  const isVideoExpanded = expandedSongVideos.has(
                    song.liveItemSongUuid
                  );
                  return (
                    <li key={song.liveItemSongUuid} className="leading-relaxed pl-1">
                      <span className="inline-block w-6 text-bx-ink3">{songIndex}.</span>
                      {song.slug ? (
                        <Link
                          to={`/songs/${song.slug}/`}
                          className="hover:text-bx-blue underline underline-offset-2 decoration-dotted transition-colors"
                        >
                          {song.liveItemSongName}
                        </Link>
                      ) : (
                        song.liveItemSongName
                      )}
                      {song.youtubeVideoId && (
                        <button
                          type="button"
                          onClick={() => toggleSongVideo(song.liveItemSongUuid)}
                          aria-expanded={isVideoExpanded}
                          className="ml-2 inline-flex items-center gap-1 align-middle text-[11px] text-bx-blue hover:opacity-80 transition-opacity"
                        >
                          {isVideoExpanded ? (
                            <>
                              <FiX className="w-3 h-3" />
                              閉じる
                            </>
                          ) : (
                            <>
                              <FiPlay className="w-3 h-3" />
                              映像を見る
                            </>
                          )}
                        </button>
                      )}
                      {song.youtubeVideoId && isVideoExpanded && (
                        <div
                          className="mt-2 mb-1 rounded-lg border border-bx-line overflow-hidden"
                          style={{ aspectRatio: "16 / 9" }}
                        >
                          <YouTube
                            videoId={song.youtubeVideoId}
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
                    </li>
                  );
                });
              })()}
            </ul>
          )}
        </section>

        {/* ⑤'Spotifyプレイリスト */}
        {spotifyPlaylistId && (
          <section className="mb-8">
            <LazyComponent>
              <div className="rounded-xl border border-bx-line overflow-hidden">
                <iframe
                  className="block w-full"
                  src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistId}?utm_source=generator`}
                  width="100%"
                  height="400"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title={`Spotify - ${heading}`}
                />
              </div>
            </LazyComponent>
          </section>
        )}

        {/* ⑤''LIVE REPORT(ツアー単位) */}
        {reports.length > 0 && (
          <section className="mb-8">
            <Kicker className="mb-4">LIVE REPORT</Kicker>
            <ul className="list-disc pl-5 text-xs space-y-1">
              {reports.map((report) => (
                <li key={report.liveReportUuid} className="leading-relaxed">
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
          </section>
        )}

        {/* ⑤'''同ツアーの他公演(回遊) */}
        {/* 通過コストがほぼゼロの一覧型セクションを、没入型で長い関連ポストより
            前に置く。逆順だと関連ポストの後がスクロールで到達されにくいため。 */}
        {siblingItems.length > 0 && (
          <section className="mb-10">
            <Kicker className="mb-4">OTHER DATES — 『{liveTitle}』</Kicker>
            <div className="relative pl-6">
              <span
                aria-hidden
                className="absolute left-[3px] top-1.5 bottom-1.5 w-px bg-bx-line"
              />
              {siblingItems.map((s) => (
                <div key={s.slug} className="relative pb-6 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-bx-yellow"
                  />
                  <Link to={`/live/${s.slug}/`} className="group block">
                    <span className="text-sm font-extrabold text-bx-yellow tabular-nums">
                      {s.date?.replaceAll("-", "/")}
                    </span>
                    <p className="mt-1 text-[15px] font-bold text-bx-ink group-hover:text-bx-blue transition-colors">
                      {s.place ?? "会場未定"}
                      {s.liveItemName && (
                        <span className="ml-2 text-[11px] font-normal text-bx-ink3">
                          {s.liveItemName}
                        </span>
                      )}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ⑤''''関連ポスト */}
        {posts.length > 0 && (
          <section className="mb-8">
            <Kicker className="mb-4">関連ポスト</Kicker>
            <Tweets
              parentId={`live-item-${slug}`}
              posts={posts.map((post) => ({
                id: post.liveItemPostId,
                html: post.liveItemPostHTML,
              }))}
            />
          </section>
        )}

        {/* ⑥回遊 */}
        <section className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <GlassCard to="/live/" accent="blueLight" className="p-4">
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blueLight">
              ARCHIVE
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">
              LIVEアーカイブ一覧へ
            </h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              歴代ライブのセットリスト・公演情報をまとめて見る。
            </p>
          </GlassCard>
          <GlassCard to="/search/" accent="yellow" className="p-4">
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-yellow">
              SEARCH
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">横断検索へ</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              楽曲・ライブ・ロケ地を横断してキーワード検索。
            </p>
          </GlassCard>
        </section>
        <p className="text-right">
          <Link
            to="/"
            className="text-[11.5px] font-bold text-bx-ink3 hover:text-bx-blue transition-colors"
          >
            トップに戻る
          </Link>
        </p>
      </main>
    </Layout>
  );
};

export default LiveItemPage;

/**
 * 機械生成の description(登録データから導出できる事実のみ)。
 */
const buildDescription = (ctx: LiveItemPageContext): string => {
  const parts = [`Reol「${ctx.liveItemName || ctx.liveTitle}」の公演情報。`];
  if (ctx.place) parts.push(`会場: ${ctx.place}。`);
  const songCount = ctx.setList.filter((s) => !isNonSongItem(s)).length;
  if (songCount > 0) {
    parts.push(`セットリスト${songCount}曲を掲載。`);
  }
  return parts.join("");
};

export const Head: HeadFC<object, LiveItemPageContext> = ({ pageContext }) => {
  const { liveTitle, liveItemName, place, date, slug, setList } = pageContext;
  const heading = liveItemName || liveTitle;
  const jsonLd: object[] = [
    buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "LIVE", path: "/live/" },
      { name: heading },
    ]),
  ];
  if (isValidIsoDate(date)) {
    const event = buildMusicEvent({ name: heading, startDate: date, place });
    // セットリスト(MC等は除く)を構造化データ化する。「この公演で何を演奏したか」に
    // 生成AIが直接答えられるようにするため。楽曲詳細ページがある曲はurlで紐付ける。
    const workPerformed = setList
      .filter((song) => !isNonSongItem(song))
      .map((song) => ({
        "@type": "MusicRecording" as const,
        name: song.liveItemSongName.replace(/<br\s*\/?>/gi, " / "),
        byArtist: REOL_PERFORMER,
        ...(song.slug ? { url: `https://reol.twilightea.com/songs/${song.slug}/` } : {}),
      }));
    jsonLd.push(workPerformed.length > 0 ? { ...event, workPerformed } : event);
  }
  return (
    <SEO
      title={`${heading}(Reol)`}
      description={buildDescription(pageContext)}
      path={`/live/${slug}/`}
      jsonLd={jsonLd}
    />
  );
};
