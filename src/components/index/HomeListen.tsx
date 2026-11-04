import React from "react";
import { graphql, useStaticQuery } from "gatsby";
import { LangLink, useDict } from "../../i18n/site/SiteLangContext";
import { formatLabel } from "../../i18n/site/dict";
import { Kicker } from "../redesign";
import PlayerSlot from "../player/PlayerSlot";
import { trackEvent } from "../../utils/analytics";

/**
 * HOME の NEW RELEASE(plan/60)。いちばん新しい作品の XFD を、押すとサイト全体のプレイヤーで流す。
 * MainVideo(全ページの一番上で XFD を流していた)をやめた代わりに、HOME に動画を1本置く。
 * 流し始めたあとは、スクロールしても別のページへ移っても右上の小窓で流れ続ける。
 */
type Disc = { slug: string; title: string; releaseDate?: string | null; format?: string | null; xfdUrl?: string | null };

const videoIdOf = (url: string) => /(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{11})/.exec(url)?.[1] ?? null;

const HomeListen: React.FC = () => {
  const dict = useDict();
  const t = dict.home;
  const data = useStaticQuery(graphql`
    query HomeListenLatestRelease {
      discography {
        discographyWithSongs {
          slug
          title
          releaseDate
          format
          xfdUrl
        }
      }
    }
  `);
  // 一覧は発売日の新しい順(gatsby-node)。XFD のある最初の1枚
  const discs: Disc[] = data?.discography?.discographyWithSongs ?? [];
  const latest = discs.find((d) => d.xfdUrl && videoIdOf(d.xfdUrl));
  if (!latest?.xfdUrl) return null;
  const videoId = videoIdOf(latest.xfdUrl) as string;

  return (
    <section aria-labelledby="home-listen" className="px-2 sm:px-4 pt-8">
      <div className="grid items-center gap-x-8 gap-y-4 md:grid-cols-[3fr_2fr]">
        <PlayerSlot
          videoId={videoId}
          title={`${latest.title} XFD`}
          className="rounded-xl border border-bx-line"
          onStart={() => trackEvent("home_listen_play", { category: "engagement", label: latest.slug })}
        />
        <div>
          <Kicker color="text-bx-yellow">NEW RELEASE</Kicker>
          <h2 id="home-listen" className="mt-1 text-[20px] font-extrabold leading-snug text-bx-ink sm:text-[22px] [overflow-wrap:anywhere]">
            {latest.title}
          </h2>
          <p className="mt-1 text-[12.5px] text-bx-ink2">
            {latest.releaseDate && <span className="tabular-nums">{latest.releaseDate.replaceAll("-", ".")}</span>}
            {latest.format && <span className="ml-2">{formatLabel(dict, latest.format)}</span>}
            <span className="ml-2">XFD</span>
          </p>
          <LangLink
            to={`/discography/#disc-${latest.slug}`}
            className="mt-3 inline-block text-[12.5px] font-bold text-bx-ink2 underline underline-offset-4 transition-colors hover:text-bx-yellow"
          >
            {t.listenCta}
          </LangLink>
        </div>
      </div>
    </section>
  );
};

export default HomeListen;
