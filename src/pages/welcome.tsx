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
import { graphql, HeadFC, Link, PageProps } from "gatsby";
import SEO from "../components/SEO";
import { buildBreadcrumbList } from "../utils/jsonLd";
import { trackEvent, trackOfficialLinkClick } from "../utils/analytics";
import { reolTypes } from "../data/reol-type/types";

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

/** 年代区分の定義(リリース日ベースの機械区分。2014年以前の曲は「まずはこの曲から」側で自然に出る) */
const ERAS: { key: string; label: string; from: number; to: number }[] = [
  { key: "2015-2016", label: "2015–2016", from: 2015, to: 2016 },
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
  "bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 sm:p-6";

const WelcomePage: React.FC<PageProps<WelcomePageData>> = ({ data }) => {
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
    <main className="relative container mx-auto w-full max-w-4xl px-3 sm:px-4 py-6 text-gray-800 space-y-8">
      {/* 1. ヒーロー */}
      <section className={containerCls}>
        <p className="text-xs font-semibold tracking-[0.25em] text-[#27489b] mb-2">
          WELCOME
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3">
          はじめてのReol
        </h1>
        <p className="text-sm leading-relaxed text-gray-700">
          Reolに出会ったばかりのあなたへ。楽曲・ライブ・セトリ・ロケ地まで、10年分の活動を記録した非公式ファンサイトです。まずは代表曲から。気になったら、そのまま公式へ飛べます。
        </p>
      </section>

      {/* 2. まずはこの曲から */}
      <section className={containerCls} aria-labelledby="welcome-top-songs">
        <h2
          id="welcome-top-songs"
          className="text-xl font-bold text-gray-900 mb-1"
        >
          まずはこの曲から
        </h2>
        <p className="text-xs text-gray-600 mb-4">
          当サイトに収録した歴代ライブのセットリストから、演奏回数が多い順に選んだ3曲です。公式MVをそのまま見られます。
        </p>
        <div className="space-y-6">
          {topSongs.map((song) => {
            const videoId = youTubeId(song.musicVideoUrl);
            return (
              <article
                key={song.songUuid}
                className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                {videoId && (
                  <div className="aspect-w-16 aspect-h-9 bg-black">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                      title={`${song.songName} - 公式ミュージックビデオ`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}
                <div className="p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {song.songName}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    ライブ演奏回数 {song.totalPlays}回
                    {song.firstPlayedDate && (
                      <> ／ 初披露 {song.firstPlayedDate}</>
                    )}
                    {" ／ "}
                    リリース {song.releaseDate}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {song.downloadUrl && (
                      <a
                        href={song.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackOfficialLinkClick("streaming")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-[#27489b] text-white hover:bg-[#1a3a7a] transition-colors"
                      >
                        配信で聴く ↗
                      </a>
                    )}
                    <a
                      href={song.musicVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackOfficialLinkClick("youtube_mv")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      YouTubeで開く ↗
                    </a>
                    <Link
                      to={`/songs/stats/?songSlug=${encodeURIComponent(song.slug)}`}
                      onClick={() =>
                        trackEvent("welcome_link_click", {
                          label: `top_song_stats:${song.slug}`,
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border border-amber-300 text-amber-800 hover:bg-amber-50 transition-colors"
                    >
                      演奏履歴を見る →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-500 mt-3">
          ※演奏回数は当サイト収録のセットリスト集計に基づく参考値です。
        </p>
      </section>

      {/* 3. 年代からたどる */}
      <section className={containerCls} aria-labelledby="welcome-era">
        <h2 id="welcome-era" className="text-xl font-bold text-gray-900 mb-1">
          年代からたどる
        </h2>
        <p className="text-xs text-gray-600 mb-4">
          各年代のリリース曲から、ライブ演奏回数の多い代表曲を選びました。カードを開くと公式MVに飛べます。
        </p>
        <div className="space-y-5">
          {eraPicks.map(({ era, picks }) => (
            <div key={era.key}>
              <h3 className="text-sm font-bold mb-2">
                <span className="text-[#27489b] tabular-nums">{era.label}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {picks.map((song) => {
                  const videoId = youTubeId(song.musicVideoUrl);
                  return (
                    <div
                      key={song.songUuid}
                      className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-400 transition-all overflow-hidden"
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
                            alt={`${song.songName} MVサムネイル`}
                            loading="lazy"
                            width={320}
                            height={180}
                            className="w-full aspect-video object-cover"
                          />
                        )}
                        <div className="p-3">
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-[#27489b] transition-colors">
                            {song.songName}
                          </span>
                          <p className="text-[11px] text-gray-600 mt-1">
                            {song.releaseDate.slice(0, 4)}年リリース ／ 演奏
                            {song.totalPlays}回
                          </p>
                          <span className="inline-block text-[11px] text-[#27489b] mt-1">
                            公式MVを見る ↗
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
                            className="text-[11px] text-gray-600 underline hover:text-gray-900"
                          >
                            配信で聴く ↗
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
        <h2 id="welcome-next" className="text-xl font-bold text-gray-900 mb-1">
          次に聴くなら
        </h2>
        <p className="text-xs text-gray-600 mb-4">
          当サイトのファンタイプ診断で使っている「楽曲の好み」の2軸です。ピンとくる方から掘ってみてください。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {(
            [
              {
                key: "gori",
                emoji: "🎸",
                title: "ゴリゴリ系",
                desc: "攻撃的なビートとエレクトロサウンド。ライブで飛びたい人はこちら。",
                pick: branchPicks.gori,
              },
              {
                key: "emo",
                emoji: "🎹",
                title: "エモ・バラード系",
                desc: "歌詞とメロディにじっくり浸る楽曲群。言葉を味わいたい人はこちら。",
                pick: branchPicks.emo,
              },
            ] as const
          ).map(({ key, emoji, title, desc, pick }) => (
            <div
              key={key}
              className="rounded-lg border border-gray-200 bg-white shadow-sm p-4"
            >
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                <span className="mr-1.5">{emoji}</span>
                {title}
              </h3>
              <p className="text-xs text-gray-600 mb-3">{desc}</p>
              {pick && (
                <a
                  href={pick.musicVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackOfficialLinkClick("youtube_mv")}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#27489b] hover:underline"
                >
                  代表曲「{pick.songName}」を聴く ↗
                  <span className="text-[10px] text-gray-500 font-normal">
                    (演奏{pick.totalPlays}回)
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
          className="block group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="relative bg-gradient-to-r from-[#1a1040] via-[#2d1b69] to-[#1a1040] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl">🎵</span>
                  <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300">
                    あなたのタイプを診断する
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  最前突撃派? 後方俯瞰派? 全20問・2分で、あなたのReolファンタイプを診断。
                </p>
              </div>
              <div className="flex-shrink-0 ml-3 w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <svg
                  className="w-4 h-4 text-purple-300 group-hover:translate-x-0.5 transition-transform"
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
        <h2 id="welcome-more" className="text-xl font-bold text-gray-900 mb-1">
          もっと掘る
        </h2>
        <p className="text-xs text-gray-600 mb-4">
          気になり始めたら、ここから先が本編です。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              to: "/songs/stats/",
              label: "song_stats",
              emoji: "📊",
              title: "楽曲統計",
              desc: "全楽曲の通算演奏回数・初披露日を一覧",
            },
            {
              to: "/live/",
              label: "live",
              emoji: "🎤",
              title: "LIVE",
              desc: "歴代ライブの情報とセットリスト",
            },
            {
              to: "/search/",
              label: "search",
              emoji: "🔍",
              title: "横断検索",
              desc: "曲名・ライブ名・場所をまとめて検索",
            },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() =>
                trackEvent("welcome_link_click", { label: item.label })
              }
              className="group rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-[#27489b]/50 transition-all p-4"
            >
              <div className="text-2xl mb-2">{item.emoji}</div>
              <div className="text-sm font-bold text-gray-900 group-hover:text-[#27489b] transition-colors">
                {item.title} →
              </div>
              <p className="text-[11px] text-gray-600 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. 公式CTA */}
      <section
        className="rounded-xl overflow-hidden shadow-md"
        aria-labelledby="welcome-official"
      >
        <div className="bg-gradient-to-r from-[#27489b] via-[#1a3a7a] to-[#27489b] p-5 sm:p-6 text-white">
          <h2 id="welcome-official" className="text-lg font-bold mb-1">
            ここから先は、公式で。
          </h2>
          <p className="text-xs text-white/80 mb-4">
            最新情報・音源・映像はすべて公式から。このサイトは非公式ファンサイトです。
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://reol.jp/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOfficialLinkClick("site")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-white text-[#27489b] hover:bg-white/90 transition-colors"
            >
              公式サイト ↗
            </a>
            <a
              href="https://www.youtube.com/@reolch"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOfficialLinkClick("youtube")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-white/50 text-white hover:bg-white/10 transition-colors"
            >
              公式YouTube ↗
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

export const Head: HeadFC = () => (
  <SEO
    title="はじめてのReol - 入門ガイド"
    description="Reol(れをる)に出会ったばかりの人のための入門ガイド。ライブ演奏回数のデータから選んだ代表曲の公式MV、年代別の代表曲、楽曲統計・セットリストへの入り口をまとめました。"
    path="/welcome/"
    jsonLd={buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "はじめてのReol", path: "/welcome/" },
    ])}
  />
);
