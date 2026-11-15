/**
 * /live/unheard/ — まだ生で聴いていない曲(plan/74)
 *
 * 参戦済みにした公演(LIVE の一覧の ✓)のセットリストに載っている曲を「生で聴いた曲」とみなし、
 * まだ聴いていない曲を一覧にする。数え方は LIVE ページの「生で聴いた曲 N / M」と同じ(utils/heardSongs)。
 * 参戦済みの印はブラウザの中(ログイン中はアカウント)にあるので、ビルド時の HTML には全曲を出し、
 * 表示のあとで聴いた曲を外す。
 */
import React, { FC, useEffect, useMemo, useState } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import { useDispatch } from "react-redux";
import Layout from "../../components/modules/layout";
import SEO from "../../components/SEO";
import { ExpandMark, Kicker } from "../../components/redesign";
import { buildBreadcrumbList } from "../../utils/jsonLd";
import { heardKeysOf, tallyLiveSongs, SongTally, TallyLive } from "../../utils/heardSongs";
import { useCollectionOwned } from "../../hooks/useCollectionOwned";
import { AppDispatch } from "../../redux/store";
import { setRoute } from "../../redux/slices/routeSlice";
import { ROUTE_NAMES } from "../../types/common";
import { LangLink, pageDictFor, useDict, usePageDict } from "../../i18n/site/SiteLangContext";
import { unheardDict } from "../../i18n/site/pages/unheard";
import { DEFAULT_LANG, isSiteLang } from "../../i18n/site/langs";
import { getDict } from "../../i18n/site/dict";
import { localizePath } from "../../utils/i18nRoutes";

type SongRow = { songUuid: string; slug: string; songName: string; totalPlays: number };

type UnheardPageData = {
  live: { liveInfos: TallyLive[] };
  songStats: { songStats: SongRow[] };
};

type SortKey = "plays" | "recent";

const compare: Record<SortKey, (a: SongTally, b: SongTally) => number> = {
  plays: (a, b) => b.plays - a.plays || (b.last?.date ?? "").localeCompare(a.last?.date ?? ""),
  recent: (a, b) => (b.last?.date ?? "").localeCompare(a.last?.date ?? "") || b.plays - a.plays,
};

const ROW = "flex items-center gap-3 py-3";
const ARROW = "flex-shrink-0 text-bx-ink3 transition-colors group-hover:text-bx-blueLight";

const UnheardSongsPage: FC<PageProps<UnheardPageData>> = ({ data }) => {
  const t = usePageDict(unheardDict);
  const { live: liveDict } = useDict();
  const dispatch = useDispatch<AppDispatch>();

  // TrackingFooter で LIVE タブをアクティブ表示にするため Redux ルートを更新
  useEffect(() => {
    dispatch(setRoute({ currentRoute: ROUTE_NAMES[3] }));
  }, [dispatch]);

  const { owned: attended, mounted } = useCollectionOwned("attended");
  const [sortKey, setSortKey] = useState<SortKey>("plays");
  const [othersOpen, setOthersOpen] = useState(false);

  const tally = useMemo(() => tallyLiveSongs(data.live.liveInfos), [data.live.liveInfos]);
  const songBySongUuid = useMemo(
    () => new Map(data.songStats.songStats.map((s) => [s.songUuid, s])),
    [data.songStats.songStats]
  );
  const heardKeys = useMemo(
    () => (mounted ? heardKeysOf(attended, tally) : new Set<string>()),
    [attended, mounted, tally]
  );
  const attendedShows = mounted ? Array.from(attended).filter((uuid) => tally.keysByItem.has(uuid)).length : 0;

  const total = tally.songs.size;
  const heardRate = total > 0 ? Math.round((heardKeys.size / total) * 100) : 0;

  const unheard = useMemo(
    () => Array.from(tally.songs.values()).filter((s) => !heardKeys.has(s.key)).sort(compare[sortKey]),
    [tally, heardKeys, sortKey]
  );
  // 楽曲データと結び付いている曲と、結び付かない演目(カバーなど)を分ける
  const unheardSongs = unheard.filter((s) => s.songUuid);
  const unheardOthers = unheard.filter((s) => !s.songUuid);
  // セットリストに一度も載っていない曲。「生で聴いた曲」の母数(ライヴで演奏された曲)には入らない
  const neverPlayed = data.songStats.songStats.filter((s) => s.totalPlays === 0);

  const lastLine = (s: SongTally) =>
    s.last && (
      <span className="mt-0.5 block break-words text-[12px] leading-relaxed text-bx-ink3 [text-wrap:balance]">
        {t.last} <span className="tabular-nums">{s.last.date}</span>
        {s.last.liveTitle && ` ・ ${s.last.liveTitle}`}
      </span>
    );
  const playsCell = (s: SongTally) => (
    <span className="flex-shrink-0 text-[13px] font-bold tabular-nums text-bx-ink2">{t.plays(s.plays)}</span>
  );

  return (
    <Layout title={t.title}>
      <main className="container mx-auto max-w-3xl px-3 py-4 text-bx-ink sm:px-4">
        <header className="mb-5">
          <Kicker color="text-bx-blue" className="mb-2">
            LIVE
          </Kicker>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-bx-ink sm:text-3xl">{t.title}</h1>
          <p className="text-xs leading-relaxed text-bx-ink3">{t.lead}</p>
        </header>

        <section className="border-y border-bx-line py-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-bx-ink3">{liveDict.heardLabel}</span>
            <span className="text-sm font-bold tabular-nums text-bx-yellow">
              {heardKeys.size} / {total} ・ {heardRate}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bx-line/50">
            <div className="h-full bg-bx-yellow transition-all" style={{ width: `${heardRate}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-bx-ink3">
            {mounted && attendedShows === 0
              ? t.noAttended
              : `${t.attendedShows(attendedShows)} ・ ${t.unheardTotal(unheard.length)}`}
          </p>
          <LangLink
            to="/live/"
            className="group mt-3 flex items-center justify-between gap-3 border-t border-bx-line pt-3 text-[13px] font-bold text-bx-ink"
          >
            <span className="min-w-0 transition-colors group-hover:text-bx-blueLight">{t.toLive}</span>
            <span aria-hidden="true" className={ARROW}>
              →
            </span>
          </LangLink>
        </section>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          <span className="text-xs text-bx-ink3">{t.sortLabel}</span>
          {(["plays", "recent"] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={sortKey === key}
              onClick={() => setSortKey(key)}
              className={`border-b-2 py-1 font-bold transition-colors ${
                sortKey === key ? "border-bx-yellow text-bx-yellow" : "border-transparent text-bx-ink2 hover:text-bx-ink"
              }`}
            >
              {key === "plays" ? t.sortPlays : t.sortRecent}
            </button>
          ))}
        </div>

        <section className="mt-6" aria-labelledby="unheard-songs">
          <h2 id="unheard-songs" className="flex items-baseline justify-between gap-3 border-b border-bx-line pb-2">
            <span className="text-[17px] font-extrabold tracking-[0.04em] text-bx-ink">{t.songsHeading}</span>
            <span className="text-xs font-normal tabular-nums text-bx-ink3">{liveDict.songCount(unheardSongs.length)}</span>
          </h2>
          {unheardSongs.length === 0 ? (
            <p className="border-b border-bx-line py-4 text-sm text-bx-ink2">{t.songsAllHeard}</p>
          ) : (
            <ul>
              {unheardSongs.map((s) => {
                const song = s.songUuid ? songBySongUuid.get(s.songUuid) : undefined;
                const body = (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold text-bx-ink transition-colors group-hover:text-bx-blueLight">
                        {song?.songName ?? s.name}
                      </span>
                      {lastLine(s)}
                    </span>
                    {playsCell(s)}
                  </>
                );
                return (
                  <li key={s.key} className="border-b border-bx-line">
                    {song ? (
                      <LangLink to={`/songs/${song.slug}/`} className={`group ${ROW}`}>
                        {body}
                        <span aria-hidden="true" className={ARROW}>
                          →
                        </span>
                      </LangLink>
                    ) : (
                      <div className={ROW}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {neverPlayed.length > 0 && (
          <section className="mt-10" aria-labelledby="never-played">
            <h2 id="never-played" className="flex items-baseline justify-between gap-3 border-b border-bx-line pb-2">
              <span className="text-[17px] font-extrabold tracking-[0.04em] text-bx-ink">{t.neverHeading}</span>
              <span className="text-xs font-normal tabular-nums text-bx-ink3">{liveDict.songCount(neverPlayed.length)}</span>
            </h2>
            <p className="pt-2 text-[12px] leading-relaxed text-bx-ink3">{t.neverNote}</p>
            <ul>
              {neverPlayed.map((s) => (
                <li key={s.songUuid} className="border-b border-bx-line">
                  <LangLink to={`/songs/${s.slug}/`} className={`group ${ROW}`}>
                    <span className="min-w-0 flex-1 text-[15px] font-bold text-bx-ink transition-colors group-hover:text-bx-blueLight">
                      {s.songName}
                    </span>
                    <span aria-hidden="true" className={ARROW}>
                      →
                    </span>
                  </LangLink>
                </li>
              ))}
            </ul>
          </section>
        )}

        {unheardOthers.length > 0 && (
          <section className="mt-10" aria-labelledby="unheard-others">
            <h2 id="unheard-others" className="border-b border-bx-line">
              <button
                type="button"
                aria-expanded={othersOpen}
                aria-controls="unheard-others-list"
                title={othersOpen ? t.close : t.open}
                onClick={() => setOthersOpen((v) => !v)}
                className="group flex w-full items-center justify-between gap-3 pb-2 text-left"
              >
                <span className="text-[17px] font-extrabold tracking-[0.04em] text-bx-ink">{t.othersHeading}</span>
                <span className="flex flex-shrink-0 items-center gap-1.5 text-xs font-normal tabular-nums text-bx-ink3 transition-colors group-hover:text-bx-ink">
                  {liveDict.songCount(unheardOthers.length)}
                  <ExpandMark open={othersOpen} />
                </span>
              </button>
            </h2>
            {othersOpen && (
              <div id="unheard-others-list">
                <p className="pt-2 text-[12px] leading-relaxed text-bx-ink3">{t.othersNote}</p>
                <ul>
                  {unheardOthers.map((s) => (
                    <li key={s.key} className={`border-b border-bx-line ${ROW}`}>
                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-[15px] font-bold text-bx-ink">{s.name}</span>
                        {lastLine(s)}
                      </span>
                      {playsCell(s)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>
    </Layout>
  );
};

export default UnheardSongsPage;

export const query = graphql`
  query UnheardSongsPage {
    live {
      liveInfos {
        title
        items {
          liveItemUuid
          slug
          date
          setList {
            songUuid
            liveItemSongName
            type
          }
        }
      }
    }
    songStats {
      songStats {
        songUuid
        slug
        songName
        totalPlays
      }
    }
  }
`;

export const Head: HeadFC<UnheardPageData, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = pageDictFor(unheardDict, lang);
  return (
    <SEO
      title={t.title}
      description={t.metaDescription}
      path="/live/unheard/"
      lang={lang}
      jsonLd={buildBreadcrumbList([
        { name: getDict(lang).site.breadcrumbHome, path: localizePath("/", lang) },
        { name: "LIVE", path: localizePath("/live/", lang) },
        { name: t.title, path: localizePath("/live/unheard/", lang) },
      ])}
    />
  );
};
