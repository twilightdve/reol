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
import { Kicker, LinkRows, LinkRow } from "../components/redesign";
import PlayerSlot from "../components/player/PlayerSlot";
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

// 読みものと同じく、枠で囲まず罫線と余白で区切る(plan/71)
const containerCls = "border-t border-bx-line pt-10";
const headingCls = "text-[21px] sm:text-[23px] font-extrabold leading-snug text-bx-ink mb-2";
const leadCls = "text-[13px] leading-relaxed text-bx-ink3 mb-6";
const textLinkCls =
  "text-bx-blue underline decoration-1 underline-offset-4 hover:text-bx-blueLight transition-colors";

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
    <main className="relative container mx-auto w-full max-w-[42rem] px-4 sm:px-6 py-8 text-bx-ink space-y-12">
      {/* 1. ヒーロー */}
      <section>
        <Kicker color="text-bx-ink3" className="mb-3">
          WELCOME
        </Kicker>
        <h1 className="text-[28px] sm:text-[36px] font-extrabold leading-[1.35] text-bx-ink mb-4">
          {t.title}
        </h1>
        <p className="text-[15px] sm:text-[16px] leading-[1.95] text-bx-ink">
          {t.intro(activityYears())}
        </p>
      </section>

      {/* 2. まずはこの曲から */}
      <section className={containerCls} aria-labelledby="welcome-top-songs">
        <h2
          id="welcome-top-songs"
          className={headingCls}
        >
          {t.topHeading}
        </h2>
        <p className={leadCls}>
          {t.topLead}
        </p>
        <div className="space-y-10">
          {topSongs.map((song) => {
            const videoId = youTubeId(song.musicVideoUrl);
            return (
              <article key={song.songUuid}>
                {videoId && (
                  <PlayerSlot
                    videoId={videoId}
                    title={t.mvTitle(song.songName)}
                    className="rounded-lg border border-bx-line"
                  />
                )}
                <div className="pt-3">
                  <h3 className="text-[18px] font-bold leading-snug text-bx-ink">
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
        <p className="text-[11px] text-bx-ink3 mt-6">
          {t.playsNote}
        </p>
      </section>

      {/* 3. 年代からたどる */}
      <section className={containerCls} aria-labelledby="welcome-era">
        <h2 id="welcome-era" className={headingCls}>
          {t.eraHeading}
        </h2>
        <p className={leadCls}>
          {t.eraLead}
        </p>
        <div className="space-y-8">
          {eraPicks.map(({ era, picks }) => (
            <div key={era.key}>
              <h3 className="mb-3 text-[11px] font-extrabold tracking-[0.2em] text-bx-ink3">
                <span className="tabular-nums">{era.label}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                {picks.map((song) => {
                  const videoId = youTubeId(song.musicVideoUrl);
                  return (
                    <div key={song.songUuid}>
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
                            className="w-full aspect-video object-cover rounded-lg border border-bx-line"
                          />
                        )}
                        <div className="pt-2.5">
                          <span className="text-[15px] font-bold text-bx-ink group-hover:text-bx-blueLight transition-colors">
                            {song.songName}
                          </span>
                          <p className="text-[11px] text-bx-ink3 mt-1">
                            {t.eraMeta(song.releaseDate.slice(0, 4), song.totalPlays)}
                          </p>
                          <span className="inline-block text-[12px] text-bx-blue underline decoration-1 underline-offset-4 mt-1">
                            {t.watchMv}
                          </span>
                        </div>
                      </a>
                      {song.downloadUrl && (
                        <div className="pt-1">
                          <a
                            href={song.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackOfficialLinkClick("streaming")}
                            className="text-[12px] text-bx-ink3 underline underline-offset-4 hover:text-bx-ink"
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
        <h2 id="welcome-next" className={headingCls}>
          {t.nextHeading}
        </h2>
        <p className={leadCls}>
          {t.nextLead}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-8">
          {(
            [
              {
                key: "gori",
                title: t.goriTitle,
                desc: t.goriDesc,
                pick: branchPicks.gori,
              },
              {
                key: "emo",
                title: t.emoTitle,
                desc: t.emoDesc,
                pick: branchPicks.emo,
              },
            ] as const
          ).map(({ key, title, desc, pick }) => (
            <div key={key}>
              <h3 className="text-[16px] font-bold text-bx-ink mb-1">
                {title}
              </h3>
              <p className="text-[13px] leading-relaxed text-bx-ink3 mb-2">{desc}</p>
              {pick && (
                <a
                  href={pick.musicVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackOfficialLinkClick("youtube_mv")}
                  className={`inline-flex flex-wrap items-baseline gap-x-1.5 text-[14px] ${textLinkCls}`}
                >
                  {t.listenPick(pick.songName)}
                  <span className="text-[11px] text-bx-ink3 font-normal">
                    {t.pickPlays(pick.totalPlays)}
                  </span>
                </a>
              )}
            </div>
          ))}
        </div>
        <LinkRows twoColumns={false}>
          <LinkRow
            to="/quiz/reol-type/"
            title={t.quizTitle}
            desc={t.quizDesc}
            onClick={() =>
              trackEvent("welcome_link_click", { label: "quiz_reol_type" })
            }
          />
        </LinkRows>
      </section>

      {/* 5. もっと掘る */}
      <section className={containerCls} aria-labelledby="welcome-more">
        <h2 id="welcome-more" className={headingCls}>
          {t.moreHeading}
        </h2>
        <p className={leadCls}>
          {t.moreLead}
        </p>
        <LinkRows twoColumns={false}>
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
            <LinkRow
              key={item.label}
              to={item.to}
              title={item.title}
              desc={item.desc}
              onClick={() =>
                trackEvent("welcome_link_click", { label: item.label })
              }
            />
          ))}
        </LinkRows>
      </section>

      {/* 6. 公式CTA */}
      <section className={containerCls} aria-labelledby="welcome-official">
        <div>
          <h2 id="welcome-official" className={headingCls}>
            {t.officialHeading}
          </h2>
          <p className={leadCls}>
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
