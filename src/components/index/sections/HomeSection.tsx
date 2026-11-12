import React from "react";
import { Link } from "gatsby";
import { LangLink, useDict, usePageDict } from "../../../i18n/site/SiteLangContext";
import { featuresDict } from "../../../i18n/site/pages/features";
import RecommendList from "../recommend-list";
import { Recommend } from "../../../types/recommend";
import { trackEvent, trackOfficialLinkClick } from "../../../utils/analytics";
import { Kicker, StatCounter, ExploreGrid, LinkRows, LinkRow } from "../../redesign";
import OnThisDay from "../OnThisDay";
import HomeListen from "../HomeListen";
import ArticleCarousel from "../../songArticles/ArticleCarousel";
import FeaturedArticle from "../FeaturedArticle";

/**
 * トップページ本体。リデザインB案「BLACKBOX / CHRONICLE」(plan/15, plan/16)の
 * 本実装。見た目のリファレンスは src/pages/design-preview/b.tsx。
 */

export interface SiteStatsNextLive {
  title: string | null;
  itemName: string | null;
  date: string | null;
  place: string | null;
}

export interface SiteStats {
  songCount: number;
  liveItemCount: number;
  performanceCount: number;
  nextLive: SiteStatsNextLive | null;
}

/** HOME の「読みもの」欄に出す楽曲記事(gatsby-node.ts の onCreatePage で渡す) */
export interface HomeArticle {
  slug: string;
  title: string;
  songTitle: string;
  createdAt: string | null;
  /** 公開日時(予約公開の判定に使う。plan/43) */
  publishedAt?: string | null;
  /** 表紙の画像(plan/59) */
  cover?: string | null;
  /** OGP 画像(1200×630)。HOME でいちばん大きく出す1本に使う(plan/59 段3) */
  ogImage?: string | null;
}

interface HomeSectionProps {
  recommend: Recommend[];
  siteStats: SiteStats;
  homeArticles: HomeArticle[];
}

/** "YYYY-MM-DD" -> "MM.DD"（変換できない場合はそのまま返す） */
const formatMonthDay = (iso: string | null): string => {
  if (!iso) return "";
  const m = iso.match(/^\d{4}-(\d{2})-(\d{2})/);
  return m ? `${m[1]}.${m[2]}` : iso;
};

const HomeSection: React.FC<HomeSectionProps> = ({ recommend, siteStats, homeArticles }) => {
  const { songCount, liveItemCount, performanceCount, nextLive } = siteStats;
  const dict = useDict();
  const t = dict.home;
  const features = usePageDict(featuresDict);
  const stats = [
    { value: songCount, label: "SONGS" },
    { value: liveItemCount, label: "LIVES" },
    { value: performanceCount, label: "PERFORMANCES" },
  ];

  // 読みもの(日本語の HOME だけ)がある時は、いちばん新しい1本を大きく出し、残りをカルーセルにする(plan/59 段3)
  const [featured, ...shelf] = homeArticles;
  const hasReading = featured !== undefined;

  // サイトの紹介(巨大タイポ+統計)。HOME の先頭に置く(2026-11-04 ユーザー「サイトの紹介はやっぱり最初に来るべき」)
  const about = (padding: string) => (
    <div className="px-2 sm:px-4">
      <div className={padding}>
        <p className="flex items-center gap-2.5 text-[11px] font-extrabold tracking-[0.3em] text-bx-blue">
          UNBOXED — SINCE 2012
          <span aria-hidden className="inline-block h-px w-16 bg-bx-blue opacity-60" />
        </p>
        {/*
          見出しは各行を折り返さず(nowrap)、文字サイズを画面幅から逆算して1行に収める。
          固定サイズだと端末幅や言語によって「知/る。」のような変な位置で折り返されるため。
          --hero-em-* は各行の幅(em・辞書で言語ごとに定義)。計算上82%に収める(実測では小さいサイズほど
          文字幅が広がり90%前後になる。さらに Windows/Android の欧文フォントの幅の差の余裕を持たせる)。
          スマホでは2行目の字下げを外して文字を大きく保ち、sm 以上で字下げを戻す。
        */}
        <h1
          className="mt-4 font-extrabold leading-[1.22] text-bx-ink text-[length:clamp(1rem,calc((100vw_-_16px)*0.82/var(--hero-em-m)),3.75rem)] sm:text-[length:clamp(1rem,calc((100vw_-_32px)*0.82/var(--hero-em-w)),3.75rem)]"
          style={{ "--hero-em-m": t.heroEmMobile, "--hero-em-w": t.heroEmWide } as React.CSSProperties}
        >
          <span className="block text-left whitespace-nowrap">
            {t.heroLine1Before}
            <span className="text-bx-blue">{t.heroLine1Accent}</span>
            {t.heroLine1After}
          </span>
          <span className="block text-left whitespace-nowrap">
            <span className="invisible hidden sm:inline" aria-hidden="true">{t.heroLine2Indent}</span>
            <span className="text-bx-yellow">{t.heroLine2Accent}</span>
            {t.heroLine2After}
          </span>
        </h1>
        <p className="mt-4 text-sm max-w-lg leading-relaxed text-bx-ink2">
          {t.heroLead1}{" "}
          {t.heroLead2}
        </p>

        {/* 統計3枚 */}
        <div className="flex mt-10 border-y border-bx-line">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex-1 px-4 sm:px-6 py-5 ${
                i < stats.length - 1 ? "border-r border-bx-line" : ""
              }`}
            >
              <div className="text-3xl sm:text-5xl font-extrabold leading-none tabular-nums text-bx-ink">
                <StatCounter value={stat.value} />
              </div>
              <div className="mt-2 text-[10px] font-extrabold tracking-[0.26em] text-bx-ink3">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // TODAY: NEXT LIVE と「今日は何の日」を1つの帯にまとめる(plan/59 段3)。PC は2列。
  // 「今日は何の日」は「今日」がビルド時に決まらないので、表示はマウント後(それまで NEXT LIVE だけ)
  const today = (
    <section aria-label="TODAY" className="px-2 sm:px-4 pt-8">
      <div className="grid gap-x-8 gap-y-6 border-y border-bx-line py-6 md:grid-cols-2 empty:hidden">
        {nextLive && (
          <div>
            <Kicker color="text-bx-yellow">NEXT LIVE</Kicker>
            <p className="mt-2 text-[15px] font-bold leading-snug text-bx-ink [overflow-wrap:anywhere]">
              {nextLive.title}
              {nextLive.itemName ? ` ${nextLive.itemName}` : ""}
            </p>
            <p className="mt-1 text-[12.5px] text-bx-ink2">
              <span className="tabular-nums">{formatMonthDay(nextLive.date)}</span> {nextLive.place}
            </p>
            <a
              href="https://reol.jp/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOfficialLinkClick("site")}
              className="mt-3 inline-flex items-center rounded-full bg-bx-yellow px-4 py-1.5 text-[12.5px] font-extrabold tracking-wide text-bx-bg transition-opacity hover:opacity-90"
            >
              {t.ticketCta}
            </a>
          </div>
        )}
        <OnThisDay className={nextLive ? "md:border-l md:border-bx-line md:pl-8" : ""} />
      </div>
    </section>
  );

  return (
    <section id="HOME" style={{ contentVisibility: "auto" }} className="max-w-5xl mx-auto">
      {about("pt-10 sm:pt-14 pb-2")}

      {hasReading && (
        // 読みもの: いちばん新しい1本を大きく、続く10本をカルーセルで(plan/59)。一覧への導線
        <section aria-labelledby="home-reading" className="px-2 sm:px-4 pt-8 sm:pt-10">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <Kicker color="text-bx-yellow">READING</Kicker>
              <h2 id="home-reading" className="mt-1 text-[20px] sm:text-[22px] font-extrabold text-bx-ink">
                読みもの
              </h2>
            </div>
            <Link
              to="/articles/"
              onClick={() => trackEvent("home_reading_click", { category: "navigation", label: "一覧" })}
              className="text-[13px] font-bold text-bx-ink underline underline-offset-4 hover:text-bx-yellow"
            >
              読みもの一覧へ →
            </Link>
          </div>
          <div className="mt-4">
            <FeaturedArticle article={featured} />
          </div>
          {/* 表紙付きのカードのカルーセル(plan/59)。自動で次へ送る。スマホ1枚・sm 2枚・md 3枚ずつ */}
          {shelf.length > 0 && (
            <ArticleCarousel
              className="mt-4"
              layout="home"
              label="ほかの読みもの"
              items={shelf.map((a) => ({
                key: a.slug,
                slug: a.slug,
                title: a.title,
                songTitle: a.songTitle,
                cover: a.cover,
                onClick: () => trackEvent("home_reading_click", { category: "navigation", label: a.slug }),
              }))}
            />
          )}
        </section>
      )}

      {today}

      {/* NEW RELEASE: いちばん新しい作品の XFD(MainVideo の代わり、plan/60) */}
      <HomeListen />

      {/* EXPLORE: 主要セクションへの大タイル導線 */}
      <div className="px-2 sm:px-4 pt-8">
        <ExploreGrid />
      </div>

      {/* 入口: 初見の人が最初に触れる導線。カードを並べず、罫線で区切った行にする(plan/71)。
          ファンタイプ診断とライヴ参戦ガイドも、同じ並びに入れる */}
      <div className="px-2 sm:px-4 pt-10">
        <LinkRows>
          {(
            [
              { to: "/welcome/", kicker: "START HERE", title: t.welcomeTitle, desc: t.welcomeDesc, label: "はじめてのReol", cardType: "welcome" },
              { to: "/live/", kicker: "LIVE & SETLIST", title: t.liveTitle, desc: t.liveDesc(liveItemCount), label: "ライブに行く", cardType: "live" },
              { to: "/songs/stats/", kicker: "DATA", title: t.dataTitle, desc: t.dataDesc(songCount), label: "データを掘る", cardType: "stats" },
              { to: "/timemachine/", kicker: "TIME MACHINE", title: t.timemachineTitle, desc: t.timemachineDesc, label: "タイムマシン", cardType: "timemachine" },
              // Reol検定: 出題内容レビュー中のためHOME導線を一時停止(ページ・コードは残置)
              { to: "/quiz/reol-type/", kicker: "FAN TYPE QUIZ", title: t.quizTitle, desc: t.quizDesc, label: null, cardType: null },
              { to: "/live/guide/", kicker: "LIVE GUIDE", title: t.guideTitle, desc: t.guideDesc, label: "ライヴ参戦ガイド", cardType: "live_guide" },
            ] as const
          ).map((entry) => (
            <LinkRow
              key={entry.to}
              to={entry.to}
              kicker={entry.kicker}
              title={entry.title}
              desc={entry.desc}
              as="h2"
              onClick={
                entry.label
                  ? () =>
                      trackEvent("entry_card_click", {
                        category: "navigation",
                        label: entry.label,
                        card_type: entry.cardType,
                      })
                  : undefined
              }
            />
          ))}
        </LinkRows>
      </div>

      {/* 深堀りツール: カードを並べると増えるたびに HOME が長くなるため、簡潔なリストにして
          全体は /features/ にまとめる(plan/27 ステップ5) */}
      <div className="px-2 sm:px-4 pt-8">
        <Kicker color="text-bx-blueLight">MORE TOOLS</Kicker>
        <LinkRows className="mt-3.5">
          {(
            [
              { to: "/cgraph/", title: t.cgraphTitle, desc: t.cgraphDesc, label: "相関図", cardType: "cgraph" },
              { to: "/live/heatmap/", title: t.heatmapTitle, desc: t.heatmapDesc, label: "開催地マップ", cardType: "heatmap" },
              { to: "/songs/sorter/", title: t.sorterTitle, desc: t.sorterDesc, label: "楽曲ソーター", cardType: "song_sorter" },
              { to: "/live/setlist-grammar/", title: t.grammarTitle, desc: t.grammarDesc, label: "セトリの文法", cardType: "setlist_grammar" },
              { to: "/live/compare/", title: t.compareTitle, desc: t.compareDesc, label: "セトリ比較", cardType: "setlist_compare" },
              { to: "/live/tour-heatmap/", title: t.tourHeatmapTitle, desc: t.tourHeatmapDesc, label: "ツアーヒートマップ", cardType: "tour_heatmap" },
              { to: "/live/similarity-ranking/", title: t.similarityTitle, desc: t.similarityDesc, label: "セトリ類似度ランキング", cardType: "similarity_ranking" },
              { to: "/posts/", title: t.postsTitle, desc: t.postsDesc, label: "関連ポスト", cardType: "posts" },
            ] as const
          ).map((tool) => (
            <LinkRow
              key={tool.cardType}
              to={tool.to}
              title={tool.title}
              desc={tool.desc}
              onClick={() =>
                trackEvent("entry_card_click", {
                  category: "navigation",
                  label: tool.label,
                  card_type: tool.cardType,
                })
              }
            />
          ))}
        </LinkRows>
        <LangLink
          to="/features/"
          onClick={() =>
            trackEvent("entry_card_click", {
              category: "navigation",
              label: "機能一覧",
              card_type: "features",
            })
          }
          className="mt-4 inline-block text-[13px] font-bold text-bx-ink underline underline-offset-4 hover:text-bx-blueLight transition-colors"
        >
          {features.seeAll}
        </LangLink>
      </div>

      {/* Pick Up Post */}
      <div id="RECOMMEND" className="pt-10">
        <Kicker color="text-bx-ink" className="px-2 sm:px-4">
          PICK UP POST
        </Kicker>
        <RecommendList data={recommend} />
      </div>
    </section>
  );
};

export default HomeSection;
