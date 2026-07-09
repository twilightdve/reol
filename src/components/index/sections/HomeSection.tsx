import React from "react";
import { Link } from "gatsby";
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
        <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold leading-[1.22] text-bx-ink">
          Reolのこれまでを、
          <br />
          <span className="text-bx-yellow">まるっと</span>遡れる。
        </h1>
        <p className="mt-4 text-sm max-w-lg leading-relaxed text-bx-ink2">
          楽曲・ライブ・セトリ・ロケ地。れをる時代から現在まで、
          公式コンテンツへの案内板を兼ねた非公式アーカイブ。
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
              公式サイトでチケット →
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

      {/* 入口3カード：初見の人が最初に触れる導線 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 px-2 sm:px-4 pt-10">
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
          <h2 className="mt-2 text-[15px] font-bold text-bx-ink">はじめてのReol</h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
            代表曲と年代別ガイド。どのeraから入っても迷わない。
          </p>
        </GlassCard>

        {/* ライブに行く（カード内に初参加ガイドへのサブリンクを併設） */}
        <GlassCard accent="blue" className="h-full flex flex-col overflow-hidden">
          <Link
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
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">ライブに行く</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              167公演のセトリアーカイブと初参加ガイド。
            </p>
          </Link>
          <Link
            to="/bijigaku-navi/articles/live-tips-first-timer/"
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: "初参加ガイドを読む",
                card_type: "live_guide",
              })
            }
            className="block text-center text-[10px] sm:text-xs text-bx-ink3 border-t border-bx-line py-1.5 hover:text-bx-blueLight transition-colors"
          >
            初参加ガイドを読む →
          </Link>
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
          <h2 className="mt-2 text-[15px] font-bold text-bx-ink">データを掘る</h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
            130曲の演奏回数・初披露・最終演奏を全曲収録。
          </p>
        </GlassCard>
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
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">Reolファンタイプ診断</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              全20問の質問であなたのファンタイプを診断！
            </p>
          </div>
          <span className="flex-shrink-0 font-extrabold text-bx-blueLight">→</span>
        </GlassCard>

        <GlassCard
          href="/bijigaku-navi/"
          className="flex items-center justify-between gap-3 p-4 sm:p-5 hover:border-bijigaku-header"
        >
          <div>
            <p className="text-[9.5px] font-extrabold tracking-[0.26em] text-bijigaku-header">
              BIJIGAKU NAVI
            </p>
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">美辞学ナビ</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              会場情報・アクセス・参加者情報をチェック
            </p>
          </div>
          <span className="flex-shrink-0 font-extrabold text-bijigaku-header">→</span>
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
