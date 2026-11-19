/**
 * /live/tour/<slug>/ — ツアー・連続公演のページ(plan/80)
 *
 * 公演が 2 つ以上ある LIVE だけ、gatsby-node.ts の createPages で作る。
 * 1 公演だけの LIVE は、公演ページ(/live/<公演の slug>/)が詳細ページの役をする。
 *
 * 見た目は公演ページ(live-item.tsx)と同じ並び(ヒーロー→本編→回遊)。箱は使わず、行と罫線で組む(plan/71)。
 * 演奏された曲は、セットリストが登録されている公演だけから数える(全公演とは書かない)。
 */
import React, { useEffect, useState } from "react";
import { HeadFC, PageProps } from "gatsby";
import { GoLinkExternal } from "react-icons/go";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import LazyComponent from "../components/modules/LazyComponent";
import Tweets from "../components/modules/tweets";
import PlayerSlot from "../components/player/PlayerSlot";
import { Kicker, LinkRows, LinkRow } from "../components/redesign";
import { trackEvent } from "../utils/analytics";
import { LangLink, useDict } from "../i18n/site/SiteLangContext";
import { getDict } from "../i18n/site/dict";
import { DEFAULT_LANG, isSiteLang } from "../i18n/site/langs";
import { localizePath } from "../utils/i18nRoutes";
import { buildBreadcrumbList } from "../utils/jsonLd";
import { useTheme } from "../hooks/useTheme";
import { isOngoing, spoilerStorageKey, tourTitleColor } from "../utils/liveTour";

// live の「youtube」列は動画IDとプレイリストIDを共存させている(動画IDは常に11文字)
const isYoutubePlaylistId = (id: string | null | undefined): boolean => !!id && id.length !== 11;

export interface LiveTourPageContext {
  liveUuid: string;
  slug: string;
  title: string;
  date: string;
  siteUrl: string | null;
  themeColorPrimary: string | null;
  themeColorSecondary: string | null;
  youtubeVideoId: string | null;
  spotifyPlaylistId: string | null;
  items: { slug: string; date: string; liveItemName: string | null; place: string | null; songCount: number }[];
  /** セットリストが登録されている公演の数(演奏された曲の分母) */
  setlistShowCount: number;
  /** 演奏された曲。count は演奏された公演の数。多い順、同じ数なら最初に出てきた順 */
  songs: { name: string; slug: string | null; count: number }[];
  reports: { liveReportUuid: string; liveReportName: string; liveReportUrl: string }[];
  posts: { livePostUuid: string; livePostId: string; livePostHTML: string }[];
}

const LiveTourPage: React.FC<PageProps<object, LiveTourPageContext>> = ({ pageContext }) => {
  const dict = useDict();
  const t = dict.tour;
  const tShow = dict.show;
  const tLive = dict.live;
  const { theme } = useTheme();
  const {
    liveUuid,
    slug,
    title,
    date,
    siteUrl,
    themeColorPrimary,
    themeColorSecondary,
    youtubeVideoId,
    spotifyPlaylistId,
    items,
    setlistShowCount,
    songs,
    reports,
    posts,
  } = pageContext;

  const titleColor = tourTitleColor(themeColorPrimary, themeColorSecondary, theme);
  const total = items.length;
  const everyShow = songs.filter((s) => s.count === setlistShowCount);
  const someShows = songs.filter((s) => s.count < setlistShowCount);
  const onlySetlistItem = setlistShowCount === 1 ? items.find((it) => it.songCount > 0) : undefined;

  // 開催中のツアーは、LIVE 一覧と同じく、演奏された曲を同意してから出す(同意は一覧と共有)
  const dates = [date, ...items.map((it) => it.date)];
  const [ongoing, setOngoing] = useState(() => isOngoing(dates));
  const [spoilerAck, setSpoilerAck] = useState(false);
  useEffect(() => {
    setOngoing(isOngoing(dates));
    try {
      if (window.sessionStorage.getItem(spoilerStorageKey(liveUuid)) === "1") setSpoilerAck(true);
    } catch {
      // 読めない時は同意していない扱い
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveUuid]);
  const acceptSpoiler = () => {
    setSpoilerAck(true);
    try {
      window.sessionStorage.setItem(spoilerStorageKey(liveUuid), "1");
    } catch {
      // 覚えられなくても、このページでは出す
    }
  };
  const hideSongs = ongoing && !spoilerAck;

  const songRow = (s: { name: string; slug: string | null; count: number }, showCount: boolean) => (
    <li key={`${s.slug ?? s.name}`} className="flex items-baseline justify-between gap-4 border-b border-bx-line py-2 text-sm">
      {s.slug ? (
        <LangLink to={`/songs/${s.slug}/`} className="min-w-0 text-bx-ink transition-colors hover:text-bx-blue">
          {s.name}
        </LangLink>
      ) : (
        <span className="min-w-0 text-bx-ink">{s.name}</span>
      )}
      {showCount && <span className="flex-shrink-0 text-xs tabular-nums text-bx-ink3">{t.playedIn(s.count, setlistShowCount)}</span>}
    </li>
  );

  return (
    <Layout title={title}>
      <main className="container mx-auto max-w-3xl px-4 py-8 text-bx-ink sm:px-6">
        {/* パンくず(/live/tour/ の一覧ページは無いので LIVE まで) */}
        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-bx-ink3">
          <LangLink to="/" className="transition-colors hover:text-bx-blue">
            HOME
          </LangLink>
          <span aria-hidden>/</span>
          <LangLink to="/live/" className="transition-colors hover:text-bx-blue">
            LIVE
          </LangLink>
          <span aria-hidden>/</span>
          <span className="text-bx-ink">{title}</span>
        </p>

        {/* ①ヒーロー。題名は公演の色(LIVE 一覧のワンマンと同じ決まり。読めない色は無彩色のまま) */}
        <header className="mb-8 mt-4">
          <Kicker color="text-bx-blue">{t.kicker}</Kicker>
          <h1
            className={`mt-3 text-2xl font-extrabold leading-tight sm:text-4xl ${titleColor ? "" : "text-bx-ink"}`}
            style={titleColor ? { color: titleColor } : undefined}
          >
            {title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-bx-ink3">
            <span>{date?.replaceAll("-", "/")}</span>
            <span>{t.showsCount(total)}</span>
            {siteUrl && (
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("live_tour_official_click", { category: "outbound", label: title })}
                className="inline-flex items-center gap-1 text-bx-ink2 underline underline-offset-2 transition-colors hover:text-bx-blue"
              >
                {t.official}
                <GoLinkExternal className="h-3 w-3" aria-hidden />
              </a>
            )}
          </div>
        </header>

        {/* ②映像 */}
        {youtubeVideoId && (
          <section className="mb-10">
            <PlayerSlot
              {...(isYoutubePlaylistId(youtubeVideoId) ? { list: youtubeVideoId } : { videoId: youtubeVideoId })}
              title={title}
              className="rounded-xl border border-bx-line"
            />
          </section>
        )}

        {/* ③公演一覧 */}
        <section className="mb-10">
          <Kicker className="mb-4">{t.datesKicker}</Kicker>
          <LinkRows twoColumns={false}>
            {items.map((it) => (
              <LinkRow
                key={it.slug}
                to={`/live/${it.slug}/`}
                kicker={it.date?.replaceAll("-", "/")}
                title={it.place ?? tShow.venueTbd}
                desc={[it.liveItemName, it.songCount > 0 ? t.songCount(it.songCount) : null].filter(Boolean).join(" · ") || undefined}
              />
            ))}
          </LinkRows>
        </section>

        {/* ④演奏された曲 */}
        <section className="mb-10">
          <Kicker className="mb-4">{t.songsKicker}</Kicker>
          {setlistShowCount === 0 ? (
            <p className="text-sm text-bx-ink3">{t.noSetlist}</p>
          ) : hideSongs ? (
            <div className="border-y border-bx-line py-5">
              <p className="text-sm font-bold text-bx-ink">{tLive.spoilerNoticeTitle}</p>
              <p className="mt-2 text-xs leading-relaxed text-bx-ink2">
                {tLive.spoilerNotice1}
                <br />
                {tLive.spoilerNotice2}
                <br />
                {tLive.spoilerNotice3}
              </p>
              <button
                type="button"
                onClick={acceptSpoiler}
                className="mt-4 rounded-full border border-bx-yellow px-4 py-2 text-xs font-bold text-bx-yellow transition-colors hover:bg-bx-yellow hover:text-bx-bg"
              >
                {tLive.showSpoiler}
              </button>
            </div>
          ) : onlySetlistItem ? (
            <>
              <p className="mb-3 text-sm text-bx-ink2">{t.oneSetlist}</p>
              <LinkRows twoColumns={false}>
                <LinkRow
                  to={`/live/${onlySetlistItem.slug}/`}
                  kicker={onlySetlistItem.date?.replaceAll("-", "/")}
                  title={onlySetlistItem.place ?? tShow.venueTbd}
                  desc={t.songCount(onlySetlistItem.songCount)}
                />
              </LinkRows>
            </>
          ) : (
            <>
              <p className="mb-6 text-xs text-bx-ink3">{t.songsLead(setlistShowCount, total)}</p>
              {everyShow.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-2 text-sm font-bold text-bx-ink">
                    {t.everyShow(setlistShowCount, total)}
                    <span className="ml-2 text-xs font-normal text-bx-ink3">{t.songCount(everyShow.length)}</span>
                  </h2>
                  <ul className="border-t border-bx-line">{everyShow.map((s) => songRow(s, false))}</ul>
                </div>
              )}
              {someShows.length > 0 && (
                <div>
                  <h2 className="mb-2 text-sm font-bold text-bx-ink">
                    {t.someShows}
                    <span className="ml-2 text-xs font-normal text-bx-ink3">{t.songCount(someShows.length)}</span>
                  </h2>
                  <ul className="border-t border-bx-line">{someShows.map((s) => songRow(s, true))}</ul>
                </div>
              )}
            </>
          )}
        </section>

        {/* ⑤Spotify */}
        {spotifyPlaylistId && (
          <section className="mb-10">
            <LazyComponent>
              <div className="overflow-hidden rounded-xl border border-bx-line">
                <iframe
                  className="block w-full"
                  src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistId}`}
                  width="100%"
                  height="400"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title={`Spotify - ${title}`}
                />
              </div>
            </LazyComponent>
          </section>
        )}

        {/* ⑥LIVE REPORT */}
        {reports.length > 0 && (
          <section className="mb-10">
            <Kicker className="mb-4">LIVE REPORT</Kicker>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              {reports.map((report) => (
                <li key={report.liveReportUuid} className="leading-relaxed">
                  <a
                    href={report.liveReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("report_click", { category: "outbound", label: report.liveReportName })}
                    className="inline-flex items-center gap-1 text-bx-ink transition-opacity hover:opacity-80"
                  >
                    {report.liveReportName}
                    <GoLinkExternal className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ⑦関連ポスト */}
        {posts.length > 0 && (
          <section className="mb-10">
            <Kicker className="mb-4">{tShow.relatedPosts}</Kicker>
            <Tweets
              parentId={`live-tour-${slug}`}
              reference={{ kind: "live", date }}
              posts={posts.map((post) => ({ id: post.livePostId, html: post.livePostHTML }))}
            />
          </section>
        )}

        {/* ⑧回遊 */}
        <section className="mb-4">
          <LinkRows>
            <LinkRow as="h2" to="/live/" kicker="ARCHIVE" title={tShow.toArchiveTitle} desc={tShow.toArchiveDesc} />
            <LinkRow as="h2" to="/search/" kicker="SEARCH" title={tShow.toSearchTitle} desc={tShow.toSearchDesc} />
          </LinkRows>
        </section>
      </main>
    </Layout>
  );
};

export default LiveTourPage;

export const Head: HeadFC<object, LiveTourPageContext> = ({ pageContext }) => {
  const { title, slug, items, setlistShowCount, songs } = pageContext;
  const langCtx = (pageContext as { lang?: unknown }).lang;
  const lang = isSiteLang(langCtx) ? langCtx : DEFAULT_LANG;
  const t = getDict(lang).tour;
  const hasSetlist = setlistShowCount > 0;
  const description = [t.metaLead(title, items.length), hasSetlist ? t.metaSongs(setlistShowCount, songs.length) : ""].join("");
  return (
    <SEO
      title={t.metaTitle(title, hasSetlist)}
      description={description}
      path={`/live/tour/${slug}/`}
      lang={lang}
      image={`https://reol.twilightea.com/og/live-tour/${slug}.jpg`}
      jsonLd={[
        buildBreadcrumbList([
          { name: getDict(lang).site.breadcrumbHome, path: localizePath("/", lang) },
          { name: "LIVE", path: localizePath("/live/", lang) },
          { name: title },
        ]),
      ]}
    />
  );
};
