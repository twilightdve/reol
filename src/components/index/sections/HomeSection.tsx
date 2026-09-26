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
              {liveItemCount}公演のセトリアーカイブと初参加ガイド。
            </p>
          </Link>
          <Link
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
            {songCount}曲の演奏回数・初披露・最終演奏を全曲収録。
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
          <h2 className="mt-2 text-[15px] font-bold text-bx-ink">タイムマシン</h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
            年月スライダーで、当時の楽曲数・ライブ数・演奏数を再現。
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
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">相関図</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              楽曲に関わったクリエイター同士のつながりを可視化。
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
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">開催地マップ</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              都道府県別の公演数を色分けしたヒートマップ。
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
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">楽曲ソーター</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              2曲ずつ勝ち抜き戦。あなたの一番好きな曲を決めるトーナメント。
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
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">セトリの文法</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              曲の隣接関係・定位置・年別傾向をデータで解析。
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
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">セトリ比較</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              2公演のセットリストを比較し、共通曲・差分・曲順の変化を可視化。
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
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">ツアーヒートマップ</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              1ツアーの全公演を横断し、楽曲ごとの演奏有無・曲順を一覧表示。
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
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">セトリ類似度ランキング</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              異なるツアー同士でセトリが特に似ている公演ペアをランキング。
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
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">関連ポスト</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              楽曲・ライブ・各公演の関連ポストを時系列で横断表示。
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
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">Reolファンタイプ診断</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              全20問の質問であなたのファンタイプを診断！
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
            <h2 className="mt-2 text-[15px] font-bold text-bx-ink">ライヴ参戦ガイド</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-bx-ink3">
              持ち物・服装・マナーから遠征のコツまで
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
