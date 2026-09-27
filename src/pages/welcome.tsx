/**
 * /welcome/ — 新規リスナー向け入門ページ「はじめてのReol」
 *
 * サイト内データ(discography / songStats)から代表曲を機械選定して紹介する。
 * - 埋め込み/リンクは楽曲データの musicVideoUrl(公式YouTube)と
 *   downloadUrl(公式配信リンク)のみ使用。非公式転載は使わない。
 * - 紹介文はリリース日・演奏回数などサイト内データから導出できる事実に留める。
 * - JSなしでも全文が読める静的ページ(SSG)。onClick は計測のみで導線はすべて <a>/<Link>。
 */
import React, { useMemo } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import SEO from "../components/SEO";
import { buildBreadcrumbList } from "../utils/jsonLd";
import { trackEvent, trackOfficialLinkClick } from "../utils/analytics";
import { reolTypes } from "../data/reol-type/types";
import { ACTIVITY_START_YEAR, activityYears } from "../constants/artist";
import { Kicker } from "../components/redesign";
import { LangLink as Link, pageDictFor, usePageDict } from "../i18n/site/SiteLangContext";
import { welcomeDict } from "../i18n/site/pages/welcome";
import { DEFAULT_LANG, isSiteLang } from "../i18n/site/langs";
import { getDict } from "../i18n/site/dict";
import { localizePath } from "../utils/i18nRoutes";

// ---------- データ型 ----------

type WelcomeSongNode = {
  songUuid: string;
  slug: string;
  songName: string;
  musicVideoUrl: string | null;
  downloadUrl: string | null;
};

type WelcomeDiscNode = {
  slug: string;
  releaseDate: string | null;
  songs: WelcomeSongNode[];
};

type WelcomeStatRow = {
  songUuid: string;
  slug: string;
  songName: string;
  totalPlays: number;
  firstPlayedDate: string | null;
};

type WelcomePageData = {
  discography: { discographyWithSongs: WelcomeDiscNode[] };
  songStats: { songStats: WelcomeStatRow[] };
};

/** 選定処理で使う、統計とディスコグラフィをマージした曲情報 */
type PickedSong = {
  songUuid: string;
  slug: string;
  songName: string;
  musicVideoUrl: string;
  downloadUrl: string | null;
  totalPlays: number;
  firstPlayedDate: string | null;
  releaseDate: string;
};

// ---------- 選定ロジック(すべてビルド時データからの機械選定) ----------

/** youtu.be / youtube.com/watch 形式のURLから動画IDを取り出す */
const youTubeId = (url: string): string | null => {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/
  );
  return m ? m[1] : null;
};

/** 「煽げや尊し(Agitate)」→「煽げや尊し」のように括弧サフィックスを外して比較する */
const normalizeSongName = (name: string): string =>
  name.replace(/\s*[\(（].*$/u, "").trim();

/** songStats × discography を songUuid でマージし、MVを持つ曲だけを返す */
const mergeSongs = (data: WelcomePageData): PickedSong[] => {
  const statByUuid = new Map(
    data.songStats.songStats.map((s) => [s.songUuid, s])
  );
  const seen = new Set<string>();
  const merged: PickedSong[] = [];
  for (const disc of data.discography.discographyWithSongs) {
    if (!disc.releaseDate) continue;
    for (const song of disc.songs) {
      if (!song.musicVideoUrl || seen.has(song.songUuid)) continue;
      const stat = statByUuid.get(song.songUuid);
      // songStats に載っている代表曲のみ対象(重複収録の別バージョン等を除外)
      if (!stat || stat.totalPlays <= 0) continue;
      seen.add(song.songUuid);
      merged.push({
        songUuid: song.songUuid,
        slug: song.slug,
        songName: song.songName,
        musicVideoUrl: song.musicVideoUrl,
        downloadUrl: song.downloadUrl ?? null,
        totalPlays: stat.totalPlays,
        firstPlayedDate: stat.firstPlayedDate,
        releaseDate: disc.releaseDate,
      });
    }
  }
  return merged.sort((a, b) => b.totalPlays - a.totalPlays);
};

/** 年代区分の定義(リリース日ベースの機械区分。起点はれをる名義の活動開始年=2012) */
const ERAS: { key: string; label: string; from: number; to: number }[] = [
  { key: "2012-2016", label: "2012–2016", from: ACTIVITY_START_YEAR, to: 2016 },
  { key: "2017-2019", label: "2017–2019", from: 2017, to: 2019 },
  { key: "2020-2022", label: "2020–2022", from: 2020, to: 2022 },
  { key: "2023-", label: "2023–", from: 2023, to: 9999 },
];

/** ファンタイプ診断の GE 軸(G=ゴリゴリ / E=エモ・バラード)ごとの代表曲名リスト */
const axisSongNames = (axis: "G" | "E"): string[] =>
  Object.values(reolTypes)
    .filter((t) => t.code[1] === axis)
    .map((t) => normalizeSongName(t.song));

// ---------- ページ本体 ----------

const containerCls =
  "bg-bx-surface/5 border border-bx-line rounded-xl p-4 sm:p-6";

const WelcomePage: React.FC<PageProps<WelcomePageData>> = ({ data }) => {
  const t = usePageDict(welcomeDict);
  const songs = useMemo(() => mergeSongs(data), [data]);

  // 1) まずはこの曲から: 演奏回数上位×MV有りの3曲(公式MV埋め込み)
  const topSongs = useMemo(() => songs.slice(0, 3), [songs]);
  const topSlugs = useMemo(
    () => new Set(topSongs.map((s) => s.slug)),
    [topSongs]
  );

  // 2) 年代からたどる: 各年代の演奏回数上位2曲(埋め込み済みの曲は除外)
  const eraPicks = useMemo(
    () =>
      ERAS.map((era) => ({
        era,
        picks: songs
          .filter((s) => {
            const y = Number(s.releaseDate.slice(0, 4));
            return y >= era.from && y <= era.to && !topSlugs.has(s.slug);
          })
          .slice(0, 2),
      })).filter((e) => e.picks.length > 0),
    [songs, topSlugs]
  );

  // 3) 次に聴くなら: 診断のGE軸の代表曲群から、演奏回数最上位(埋め込み済みは除外)
  const branchPicks = useMemo(() => {
    const pickByAxis = (axis: "G" | "E"): PickedSong | undefined => {
      const names = new Set(axisSongNames(axis));
      return songs.find(
        (s) => names.has(normalizeSongName(s.songName)) && !topSlugs.has(s.slug)
      );
    };
    return { gori: pickByAxis("G"), emo: pickByAxis("E") };
  }, [songs, topSlugs]);

  return (
    <main className="relative container mx-auto w-full max-w-4xl px-3 sm:px-4 py-6 text-bx-ink space-y-8">
      {/* 1. ヒーロー */}
      <section className={containerCls}>
        <Kicker color="text-bx-blue" className="mb-2">
          WELCOME
        </Kicker>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-bx-ink mb-3">
          {t.title}
        </h1>
        <p className="text-sm leading-relaxed text-bx-ink2">
          {t.intro(activityYears())}
        </p>
      </section>

      {/* 2. まずはこの曲から */}
      <section className={containerCls} aria-labelledby="welcome-top-songs">
        <h2
          id="welcome-top-songs"
          className="text-xl font-bold text-bx-ink mb-1"
        >
          {t.topHeading}
        </h2>
        <p className="text-xs text-bx-ink3 mb-4">
          {t.topLead}
        </p>
        <div className="space-y-6">
          {topSongs.map((song) => {
            const videoId = youTubeId(song.musicVideoUrl);
            return (
              <article
                key={song.songUuid}
                className="rounded-lg border border-bx-line bg-bx-surface/5 overflow-hidden"
              >
                {videoId && (
                  <div className="aspect-w-16 aspect-h-9 bg-black">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                      title={t.mvTitle(song.songName)}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}
                <div className="p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-bx-ink">
                    {song.songName}
                  </h3>
                  <p className="text-xs text-bx-ink3 mt-1">
                    {t.livePlays(song.totalPlays)}
                    {song.firstPlayedDate && (
                      <> ／ {t.firstPlayed(song.firstPlayedDate)}</>
                    )}
                    {" ／ "}
                    {t.released(song.releaseDate)}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {song.downloadUrl && (
                      <a
                        href={song.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackOfficialLinkClick("streaming")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-bx-yellow text-bx-bg hover:opacity-90 transition-opacity"
                      >
                        {t.listen}
                      </a>
                    )}
                    <a
                      href={song.musicVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackOfficialLinkClick("youtube_mv")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border border-bx-line text-bx-ink hover:border-bx-blue transition-colors"
                    >
                      {t.openYouTube}
                    </a>
                    <Link
                      to={`/songs/stats/?songSlug=${encodeURIComponent(song.slug)}`}
                      onClick={() =>
                        trackEvent("welcome_link_click", {
                          label: `top_song_stats:${song.slug}`,
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border border-bx-line text-bx-ink hover:border-bx-blue transition-colors"
                    >
                      {t.playHistory}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="text-[11px] text-bx-ink3 mt-3">
          {t.playsNote}
        </p>
      </section>

      {/* 3. 年代からたどる */}
      <section className={containerCls} aria-labelledby="welcome-era">
        <h2 id="welcome-era" className="text-xl font-bold text-bx-ink mb-1">
          {t.eraHeading}
        </h2>
        <p className="text-xs text-bx-ink3 mb-4">
          {t.eraLead}
        </p>
        <div className="space-y-5">
          {eraPicks.map(({ era, picks }) => (
            <div key={era.key}>
              <h3 className="text-sm font-bold mb-2">
                <span className="text-bx-blue tabular-nums">{era.label}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {picks.map((song) => {
                  const videoId = youTubeId(song.musicVideoUrl);
                  return (
                    <div
                      key={song.songUuid}
                      className="rounded-lg border border-bx-line bg-bx-surface/5 hover:border-bx-blue transition-colors overflow-hidden"
                    >
                      <a
                        href={song.musicVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackOfficialLinkClick("youtube_mv")}
                        className="block group"
                      >
                        {videoId && (
                          <img
                            src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
                            alt={t.thumbAlt(song.songName)}
                            loading="lazy"
                            width={320}
                            height={180}
                            className="w-full aspect-video object-cover"
                          />
                        )}
                        <div className="p-3">
                          <span className="text-sm font-semibold text-bx-ink group-hover:text-bx-blue transition-colors">
                            {song.songName}
                          </span>
                          <p className="text-[11px] text-bx-ink3 mt-1">
                            {t.eraMeta(song.releaseDate.slice(0, 4), song.totalPlays)}
                          </p>
                          <span className="inline-block text-[11px] text-bx-blue mt-1">
                            {t.watchMv}
                          </span>
                        </div>
                      </a>
                      {song.downloadUrl && (
                        <div className="px-3 pb-3">
                          <a
                            href={song.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackOfficialLinkClick("streaming")}
                            className="text-[11px] text-bx-ink3 underline hover:text-bx-ink"
                          >
                            {t.listen}
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 次に聴くなら */}
      <section className={containerCls} aria-labelledby="welcome-next">
        <h2 id="welcome-next" className="text-xl font-bold text-bx-ink mb-1">
          {t.nextHeading}
        </h2>
        <p className="text-xs text-bx-ink3 mb-4">
          {t.nextLead}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {(
            [
              {
                key: "gori",
                emoji: "🎸",
                title: t.goriTitle,
                desc: t.goriDesc,
                pick: branchPicks.gori,
              },
              {
                key: "emo",
                emoji: "🎹",
                title: t.emoTitle,
                desc: t.emoDesc,
                pick: branchPicks.emo,
              },
            ] as const
          ).map(({ key, emoji, title, desc, pick }) => (
            <div
              key={key}
              className="rounded-lg border border-bx-line bg-bx-surface/5 p-4"
            >
              <h3 className="text-sm font-bold text-bx-ink mb-1">
                <span className="mr-1.5">{emoji}</span>
                {title}
              </h3>
              <p className="text-xs text-bx-ink3 mb-3">{desc}</p>
              {pick && (
                <a
                  href={pick.musicVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackOfficialLinkClick("youtube_mv")}
                  className="inline-flex items-center gap-1 text-sm font-medium text-bx-blue hover:underline"
                >
                  {t.listenPick(pick.songName)}
                  <span className="text-[10px] text-bx-ink3 font-normal">
                    {t.pickPlays(pick.totalPlays)}
                  </span>
                </a>
              )}
            </div>
          ))}
        </div>
        <Link
          to="/quiz/reol-type/"
          onClick={() =>
            trackEvent("welcome_link_click", { label: "quiz_reol_type" })
          }
          className="block group rounded-xl overflow-hidden border border-bx-line hover:border-bx-blue transition-colors"
        >
          <div className="relative bg-bx-surface/5 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-base font-bold text-bx-ink">
                    {t.quizTitle}
                  </span>
                </div>
                <p className="text-xs text-bx-ink3">
                  {t.quizDesc}
                </p>
              </div>
              <div className="flex-shrink-0 ml-3 w-9 h-9 rounded-full border border-bx-line flex items-center justify-center group-hover:border-bx-blue transition-colors">
                <svg
                  className="w-4 h-4 text-bx-blue group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* 5. もっと掘る */}
      <section className={containerCls} aria-labelledby="welcome-more">
        <h2 id="welcome-more" className="text-xl font-bold text-bx-ink mb-1">
          {t.moreHeading}
        </h2>
        <p className="text-xs text-bx-ink3 mb-4">
          {t.moreLead}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              to: "/songs/stats/",
              label: "song_stats",
              title: t.moreStatsTitle,
              desc: t.moreStatsDesc,
            },
            {
              to: "/live/",
              label: "live",
              title: "LIVE",
              desc: t.moreLiveDesc,
            },
            {
              to: "/search/",
              label: "search",
              title: t.moreSearchTitle,
              desc: t.moreSearchDesc,
            },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() =>
                trackEvent("welcome_link_click", { label: item.label })
              }
              className="group rounded-lg border border-bx-line bg-bx-surface/5 hover:border-bx-blue transition-colors p-4"
            >
              <div className="text-sm font-bold text-bx-ink group-hover:text-bx-blue transition-colors">
                {item.title} →
              </div>
              <p className="text-[11px] text-bx-ink3 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. 公式CTA */}
      <section
        className="rounded-xl overflow-hidden border border-bx-line"
        aria-labelledby="welcome-official"
      >
        <div className="bg-bx-surface/5 p-5 sm:p-6">
          <h2 id="welcome-official" className="text-lg font-bold text-bx-ink mb-1">
            {t.officialHeading}
          </h2>
          <p className="text-xs text-bx-ink3 mb-4">
            {t.officialLead}
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://reol.jp/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOfficialLinkClick("site")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-bx-yellow text-bx-bg hover:opacity-90 transition-opacity"
            >
              {t.officialSite}
            </a>
            <a
              href="https://www.youtube.com/@reolch"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOfficialLinkClick("youtube")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-bx-line text-bx-ink hover:border-bx-blue transition-colors"
            >
              {t.officialYouTube}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default WelcomePage;

export const query = graphql`
  query WelcomePageQuery {
    discography {
      discographyWithSongs {
        slug
        releaseDate
        songs {
          songUuid
          slug
          songName
          musicVideoUrl
          downloadUrl
        }
      }
    }
    songStats {
      songStats {
        songUuid
        slug
        songName
        totalPlays
        firstPlayedDate
      }
    }
  }
`;

export const Head: HeadFC<WelcomePageData, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = pageDictFor(welcomeDict, lang);
  return (
    <SEO
      title={t.metaTitle}
      description={t.metaDescription}
      path="/welcome/"
      lang={lang}
      jsonLd={buildBreadcrumbList([
        { name: getDict(lang).site.breadcrumbHome, path: localizePath("/", lang) },
        { name: t.title, path: localizePath("/welcome/", lang) },
      ])}
    />
  );
};
