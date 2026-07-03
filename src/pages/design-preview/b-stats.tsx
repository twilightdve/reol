import React from "react";
import { Link, HeadFC } from "gatsby";
import SEO from "../../components/SEO";

/**
 * デザインプレビュー: B案「BLACKBOX / CHRONICLE」楽曲統計ページ(plan/15-uiux-redesign-ab.md)
 * 既存 /songs/stats/ のリデザイン版モック。既存導線には未接続・noindex。
 * 統計値は実データのスナップショット(2026-07-03: 130曲/167公演/総演奏2,107回)。
 * 本実装ではビルド時にGraphQLから焼き込む。
 */

// 公式カラーセット(reol.jp): 青 #27489b・黄 #e2bf57・白。b.tsxと完全に揃える。
const YELLOW = "#e2bf57";
const BLUE = "#6b8ce0";
const BLUE_DEEP = "#27489b";
const BLUE_LIGHT = "#a8c0ff";
const INK = "#f2f0eb";
const INK2 = "#8f8e96";
const LINE = "#26262e";

const NAV_ITEMS = [
  { label: "DISCOGRAPHY", to: "/discography/" },
  { label: "LIVE", to: "/live/" },
  { label: "PLACE", to: "/place/" },
  { label: "PHOTO", to: "/photos/" },
  { label: "TIMELINE", to: "/timeline/" },
];

const OFFICIAL_LINKS = ["公式サイト", "YouTube", "X", "Instagram", "グッズ"];

const SUMMARY_STATS = [
  { value: "130", label: "SONGS" },
  { value: "167", label: "LIVES" },
  { value: "2,107", label: "PERFORMANCES" },
];

/** 演奏回数ランキング(上位7曲・実データ) */
const RANKING = [
  {
    rank: 1,
    song: "第六感",
    plays: 85,
    first: "2020.08.16",
    last: "2026.06.27",
  },
  {
    rank: 2,
    song: "No title",
    plays: 63,
    first: "2017.02.26",
    last: "2026.05.31",
  },
  {
    rank: 3,
    song: "赤裸裸(NAKED)",
    plays: 54,
    first: "2022.04.27",
    last: "2026.05.31",
  },
  {
    rank: 4,
    song: "平面鏡",
    plays: 48,
    first: "2018.03.17",
    last: "2026.06.27",
  },
  {
    rank: 5,
    song: "劣等上等",
    plays: 42,
    first: "2018.11.30",
    last: "2026.06.27",
  },
  {
    rank: 6,
    song: "SCORPION",
    plays: 41,
    first: "2022.12.23",
    last: "2025.11.09",
  },
  {
    rank: 7,
    song: "ヒビカセ",
    plays: 39,
    first: "2017.10.20",
    last: "2026.05.31",
  },
];

const DesignPreviewBStats: React.FC = () => {
  return (
    <div
      className="min-h-screen"
      style={{
        color: INK,
        background: `radial-gradient(70rem 30rem at 50% -14rem, rgba(39,72,155,0.35), transparent 65%), #0b0b10`,
        fontFeatureSettings: '"palt"',
      }}
    >
      {/* プレビュー注記 */}
      <div
        className="text-center text-[11px] font-bold tracking-wider py-1.5 px-3"
        style={{ backgroundColor: YELLOW, color: "#0b0b10" }}
      >
        DESIGN PREVIEW — B案「BLACKBOX / CHRONICLE」楽曲統計ページ(plan/15)。本番導線には未接続です
      </div>

      {/* ヘッダー(b.tsxと同一) */}
      <header style={{ borderBottom: `1px solid ${LINE}` }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-baseline gap-2.5 min-w-0">
            <span className="font-icon text-xl font-semibold">!Legit</span>
            <span
              className="hidden sm:inline text-[9.5px] font-bold tracking-[0.24em]"
              style={{ color: INK2 }}
            >
              REOL UNOFFICIAL ARCHIVE
            </span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-5 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="hidden md:inline text-[11.5px] font-bold tracking-widest whitespace-nowrap transition-colors"
                style={{ color: INK2 }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = BLUE)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = INK2)
                }
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/search/"
              className="text-[11.5px] font-bold tracking-widest rounded-full px-4 py-1.5 whitespace-nowrap"
              style={{ backgroundColor: YELLOW, color: "#0b0b10" }}
            >
              検索
            </Link>
          </nav>
        </div>
      </header>

      {/* ページヒーロー */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-8">
        <p
          className="flex items-center gap-2.5 text-[11px] font-extrabold tracking-[0.3em]"
          style={{ color: BLUE }}
        >
          DATA
          <span
            aria-hidden
            className="inline-block h-px w-16"
            style={{ backgroundColor: BLUE, opacity: 0.6 }}
          />
        </p>
        <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold leading-[1.22]">
          楽曲統計
        </h1>
        <p
          className="mt-4 text-sm max-w-lg leading-relaxed"
          style={{ color: INK2 }}
        >
          130曲の演奏回数・初披露・最終演奏を全曲収録。
        </p>

        <div
          className="flex mt-10"
          style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}
        >
          {SUMMARY_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex-1 px-4 sm:px-6 py-5"
              style={
                i < SUMMARY_STATS.length - 1
                  ? { borderRight: `1px solid ${LINE}` }
                  : undefined
              }
            >
              <div
                className="text-3xl sm:text-5xl font-extrabold leading-none"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {stat.value}
              </div>
              <div
                className="mt-2 text-[10px] font-extrabold tracking-[0.26em]"
                style={{ color: INK2 }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ランキングテーブル */}
      <section className="max-w-5xl mx-auto px-6 pb-4">
        <p
          className="text-[10.5px] font-extrabold tracking-[0.3em] mb-3.5"
          style={{ color: INK2 }}
        >
          RANKING — 演奏回数の多い曲
        </p>
        <div
          className="overflow-x-auto rounded-xl"
          style={{ border: `1px solid ${LINE}` }}
        >
          <table className="w-full min-w-[560px] text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: `1px solid ${LINE}` }}>
                <th
                  className="text-left font-extrabold text-[10px] tracking-[0.2em] px-4 py-3"
                  style={{ color: INK2 }}
                >
                  RANK
                </th>
                <th
                  className="text-left font-extrabold text-[10px] tracking-[0.2em] px-4 py-3"
                  style={{ color: INK2 }}
                >
                  SONG
                </th>
                <th
                  className="text-right font-extrabold text-[10px] tracking-[0.2em] px-4 py-3"
                  style={{ color: INK2 }}
                >
                  PLAYS
                </th>
                <th
                  className="text-left font-extrabold text-[10px] tracking-[0.2em] px-4 py-3"
                  style={{ color: INK2 }}
                >
                  FIRST
                </th>
                <th
                  className="text-left font-extrabold text-[10px] tracking-[0.2em] px-4 py-3"
                  style={{ color: INK2 }}
                >
                  LAST
                </th>
              </tr>
            </thead>
            <tbody>
              {RANKING.map((row) => (
                <tr
                  key={row.rank}
                  className="transition-colors"
                  style={{ borderBottom: `1px solid ${LINE}` }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "transparent")
                  }
                >
                  <td
                    className="px-4 py-3 font-extrabold"
                    style={{
                      color: row.rank <= 3 ? YELLOW : INK,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row.rank}
                  </td>
                  <td className="px-4 py-3 font-bold whitespace-nowrap">
                    {row.song}
                  </td>
                  <td
                    className="px-4 py-3 text-right font-extrabold"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {row.plays}
                  </td>
                  <td
                    className="px-4 py-3 whitespace-nowrap"
                    style={{ color: INK2, fontVariantNumeric: "tabular-nums" }}
                  >
                    {row.first}
                  </td>
                  <td
                    className="px-4 py-3 whitespace-nowrap"
                    style={{ color: INK2, fontVariantNumeric: "tabular-nums" }}
                  >
                    {row.last}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11.5px]" style={{ color: INK2 }}>
          全130曲を見る(検索・並び替えは本実装で)
        </p>
      </section>

      <div className="pb-8" />

      {/* フッター(b.tsxと同一) */}
      <footer style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3.5 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {OFFICIAL_LINKS.map((label) => (
              <span
                key={label}
                className="text-[10.5px] font-semibold tracking-wide rounded-full px-3.5 py-1"
                style={{ color: INK2, border: `1px solid ${LINE}` }}
              >
                {label}
              </span>
            ))}
          </div>
          <a
            href="https://reol.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11.5px] font-extrabold tracking-wider rounded-full px-4 py-1.5"
            style={{ backgroundColor: YELLOW, color: "#0b0b10" }}
          >
            REOL.JP →
          </a>
        </div>
      </footer>
    </div>
  );
};

export default DesignPreviewBStats;

export const Head: HeadFC = () => (
  <>
    <SEO title="デザインプレビュー B案 楽曲統計" path="/design-preview/b-stats/" />
    <meta name="robots" content="noindex" />
  </>
);
