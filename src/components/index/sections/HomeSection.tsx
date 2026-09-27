import React from "react";
import { LangLink, useDict } from "../../../i18n/site/SiteLangContext";
import RecommendList from "../recommend-list";
import { Recommend } from "../../../types/recommend";
import { trackEvent, trackOfficialLinkClick } from "../../../utils/analytics";
import { GlassCard, Kicker, StatCounter, ExploreGrid } from "../../redesign";
import OnThisDay from "../OnThisDay";

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

interface HomeSectionProps {
  recommend: Recommend[];
  siteStats: SiteStats;
}

/** "YYYY-MM-DD" -> "MM.DD"（変換できない場合はそのまま返す） */
const formatMonthDay = (iso: string | null): string => {
  if (!iso) return "";
  const m = iso.match(/^\d{4}-(\d{2})-(\d{2})/);
  return m ? `${m[1]}.${m[2]}` : iso;
};

const HomeSection: React.FC<HomeSectionProps> = ({ recommend, siteStats }) => {
  const { songCount, liveItemCount, performanceCount, nextLive } = siteStats;
  const dict = useDict();
  const t = dict.home;
  const stats = [
    { value: songCount, label: "SONGS" },
    { value: liveItemCount, label: "LIVES" },
    { value: performanceCount, label: "PERFORMANCES" },
  ];

  return (
    <section id="HOME" style={{ contentVisibility: "auto" }} className="max-w-5xl mx-auto">
      {/* ヒーロー: 巨大タイポ+動くデータ */}
      <div className="px-2 sm:px-4 pt-10 sm:pt-14 pb-6">
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

        {/* NEXT LIVE行 */}
        {nextLive && (
          <div className="flex items-center flex-wrap gap-3 mt-5 text-xs text-bx-ink2">
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-bx-yellow shadow-[0_0_10px_rgba(226,191,87,0.8)]"
            />
            <span>
              <b className="font-bold text-bx-ink">NEXT LIVE:</b>{" "}
              {nextLive.title}
              {nextLive.itemName ? ` ${nextLive.itemName}` : ""} —{" "}
              {formatMonthDay(nextLive.date)} {nextLive.place}
            </span>
            <a
              href="https://reol.jp/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOfficialLinkClick("site")}
              className="ml-auto font-extrabold tracking-wide rounded-full px-4 py-1.5 border border-bx-yellow text-bx-yellow"
            >
              {t.ticketCta}
            </a>
          </div>
        )}
      </div>

      {/* EXPLORE: 主要セクションへの大タイル導線 */}
      <div className="px-2 sm:px-4 pt-6">
        <ExploreGrid />
      </div>

      {/* ON THIS DAY: 今日は何の日(該当イベントがある日のみ表示) */}
      <OnThisDay />

      {/* 入口カード：初見の人が最初に触れる導線 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 px-2 sm:px-4 pt-10">
        {/* はじめてのReol */}
        <GlassCard
          to="/welcome/"
          accent="yellow"
          className="p-4"
          onClick={() =>
            trackEvent("entry_card_click", {
              category: "navigation",
              label: "はじめてのReol",
              card_type: "welcome",
            })
          }
        >
          <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-yellow">
            START HERE
          </p>
          <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.welcomeTitle}</h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
            {t.welcomeDesc}
          </p>
        </GlassCard>

        {/* ライブに行く（カード内に初参加ガイドへのサブリンクを併設） */}
        <GlassCard accent="blue" className="h-full flex flex-col overflow-hidden">
          <LangLink
            to="/live/"
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: "ライブに行く",
                card_type: "live",
              })
            }
            className="block flex-1 p-4"
          >
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blue">
              LIVE & SETLIST
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.liveTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              {t.liveDesc(liveItemCount)}
            </p>
          </LangLink>
          <LangLink
            to="/live/guide/"
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: "初参加ガイドを読む",
                card_type: "live_guide",
              })
            }
            className="block text-center text-[10px] sm:text-xs text-bx-ink3 border-t border-bx-line py-1.5 hover:text-bx-blueLight transition-colors"
          >
            {t.liveGuideLink}
          </LangLink>
        </GlassCard>

        {/* データを掘る */}
        <GlassCard
          to="/songs/stats/"
          accent="blueLight"
          className="p-4"
          onClick={() =>
            trackEvent("entry_card_click", {
              category: "navigation",
              label: "データを掘る",
              card_type: "stats",
            })
          }
        >
          <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blueLight">
            DATA
          </p>
          <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.dataTitle}</h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
            {t.dataDesc(songCount)}
          </p>
        </GlassCard>

        {/* タイムマシン */}
        <GlassCard
          to="/timemachine/"
          accent="ink"
          className="p-4"
          onClick={() =>
            trackEvent("entry_card_click", {
              category: "navigation",
              label: "タイムマシン",
              card_type: "timemachine",
            })
          }
        >
          <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-ink">
            TIME MACHINE
          </p>
          <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.timemachineTitle}</h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
            {t.timemachineDesc}
          </p>
        </GlassCard>
      </div>

      {/* 深堀りツール：相関図・開催地マップ・楽曲ソーター・セトリの文法 */}
      <div className="px-2 sm:px-4 pt-8">
        <Kicker color="text-bx-blueLight">MORE TOOLS</Kicker>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-3.5">
          <GlassCard
            to="/cgraph"
            accent="blueLight"
            className="p-4"
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: "相関図",
                card_type: "cgraph",
              })
            }
          >
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blueLight">
              CREATOR RELATIONS
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.cgraphTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              {t.cgraphDesc}
            </p>
          </GlassCard>

          <GlassCard
            to="/live/heatmap/"
            accent="blueLight"
            className="p-4"
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: "開催地マップ",
                card_type: "heatmap",
              })
            }
          >
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blueLight">
              LIVE HEATMAP
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.heatmapTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              {t.heatmapDesc}
            </p>
          </GlassCard>

          <GlassCard
            to="/songs/sorter/"
            accent="blueLight"
            className="p-4"
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: "楽曲ソーター",
                card_type: "song_sorter",
              })
            }
          >
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blueLight">
              SONG SORTER
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.sorterTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              {t.sorterDesc}
            </p>
          </GlassCard>

          <GlassCard
            to="/live/setlist-grammar/"
            accent="blueLight"
            className="p-4"
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: "セトリの文法",
                card_type: "setlist_grammar",
              })
            }
          >
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blueLight">
              SETLIST GRAMMAR
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.grammarTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              {t.grammarDesc}
            </p>
          </GlassCard>

          <GlassCard
            to="/live/compare/"
            accent="blueLight"
            className="p-4"
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: "セトリ比較",
                card_type: "setlist_compare",
              })
            }
          >
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blueLight">
              SETLIST COMPARE
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.compareTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              {t.compareDesc}
            </p>
          </GlassCard>

          <GlassCard
            to="/live/tour-heatmap/"
            accent="blueLight"
            className="p-4"
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: "ツアーヒートマップ",
                card_type: "tour_heatmap",
              })
            }
          >
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blueLight">
              TOUR HEATMAP
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.tourHeatmapTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              {t.tourHeatmapDesc}
            </p>
          </GlassCard>

          <GlassCard
            to="/live/similarity-ranking/"
            accent="blueLight"
            className="p-4"
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: "セトリ類似度ランキング",
                card_type: "similarity_ranking",
              })
            }
          >
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blueLight">
              SIMILARITY RANKING
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.similarityTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              {t.similarityDesc}
            </p>
          </GlassCard>

          <GlassCard
            to="/posts/"
            accent="blueLight"
            className="p-4"
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: "関連ポスト",
                card_type: "posts",
              })
            }
          >
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blueLight">
              POSTS
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.postsTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              {t.postsDesc}
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Reolファンタイプ診断・美辞学ナビへの導線 */}
      <div className="flex flex-col gap-3 px-2 sm:px-4 pt-6">
        <GlassCard
          href="/quiz/reol-type/"
          className="flex items-center justify-between gap-3 p-4 sm:p-5 hover:border-bx-blueLight"
        >
          <div>
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blueLight">
              FAN TYPE QUIZ
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.quizTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              {t.quizDesc}
            </p>
          </div>
          <span className="flex-shrink-0 font-extrabold text-bx-blueLight">→</span>
        </GlassCard>

        {/* Reol検定: 出題内容レビュー中のためHOME導線を一時停止(ページ・コードは残置) */}

        <GlassCard
          href="/live/guide/"
          className="flex items-center justify-between gap-3 p-4 sm:p-5 hover:border-bx-blueLight"
          onClick={() =>
            trackEvent("entry_card_click", {
              category: "navigation",
              label: "ライヴ参戦ガイド",
              card_type: "live_guide",
            })
          }
        >
          <div>
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bx-blueLight">
              LIVE GUIDE
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">{t.guideTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              {t.guideDesc}
            </p>
          </div>
          <span className="flex-shrink-0 font-extrabold text-bx-blueLight">→</span>
        </GlassCard>
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
