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
import React from "react";
import { HeadFC, Link, PageProps } from "gatsby";
import { GoLinkExternal } from "react-icons/go";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import EmptyState from "../components/common/EmptyState";
import LazyComponent from "../components/modules/LazyComponent";
import Tweets from "../components/modules/tweets";
import { FiMusic } from "react-icons/fi";
import { GlassCard, Kicker } from "../components/redesign";
import { trackEvent } from "../utils/analytics";
import { buildBreadcrumbList, buildMusicEvent, isValidIsoDate } from "../utils/jsonLd";

type SetListSong = {
  liveItemSongUuid: string;
  liveItemSongName: string;
  slug: string | null;
};

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
    setList,
    posts,
    reports,
    siblingItems,
  } = pageContext;

  const heading = liveItemName || liveTitle;

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

        {/* ④Spotifyプレイリスト */}
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

        {/* ⑤セットリスト */}
        <section className="mb-10">
          <Kicker className="mb-4">SETLIST — {setList.length}曲</Kicker>
          {setList.length === 0 ? (
            <EmptyState
              icon={<FiMusic />}
              tone="dark"
              title="セットリスト情報は現在登録されていません"
              description="情報が確認でき次第、追加します。"
            />
          ) : (
            <ol className="space-y-1 text-sm list-decimal list-inside text-bx-ink">
              {setList.map((song) => (
                <li key={song.liveItemSongUuid} className="leading-relaxed">
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
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* ⑤'LIVE REPORT(ツアー単位) */}
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

        {/* ⑤''関連ポスト */}
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

        {/* ⑤'''同ツアーの他公演(回遊) */}
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
  if (ctx.setList.length > 0) {
    parts.push(`セットリスト${ctx.setList.length}曲を掲載。`);
  }
  return parts.join("");
};

export const Head: HeadFC<object, LiveItemPageContext> = ({ pageContext }) => {
  const { liveTitle, liveItemName, place, date, slug } = pageContext;
  const heading = liveItemName || liveTitle;
  const jsonLd: object[] = [
    buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "LIVE", path: "/live/" },
      { name: heading },
    ]),
  ];
  if (isValidIsoDate(date)) {
    jsonLd.push(buildMusicEvent({ name: heading, startDate: date, place }));
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
