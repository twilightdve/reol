import React, { useEffect, useRef, useState } from "react";
import { Link, HeadFC } from "gatsby";
import SEO from "../../components/SEO";

/**
 * デザインプレビュー: B案「BLACKBOX / CHRONICLE」(plan/15-uiux-redesign-ab.md)
 * 黒背景×公式カラーセット(青 #27489b / 黄 #e2bf57、reol.jpより)のリデザイン案を
 * 実環境で確認するためのモック。既存導線には未接続・noindex。
 * 統計値は実データのスナップショット(2026-07-03: 130曲/167公演/総演奏2,107回)。
 * 本実装ではビルド時にGraphQLから焼き込む。
 */

// 公式カラーセット(reol.jp): 青 #27489b・黄 #e2bf57・白。
// 黒背景では #27489b が沈むため、アクセント用に明度を上げた青を併用する。
const YELLOW = "#e2bf57"; // 公式イエロー: CTA・ハイライト・「現在」
const BLUE = "#6b8ce0"; // 公式ブルーの明度調整版: 構造・リンク・見出し
const BLUE_DEEP = "#27489b"; // 公式ブルー原色: グロー・面
const BLUE_LIGHT = "#a8c0ff"; // 淡青: 第3のアクセント
const INK = "#f2f0eb";
const INK2 = "#8f8e96";
const LINE = "#26262e";

const STATS = [
  { value: 130, label: "SONGS" },
  { value: 167, label: "LIVES" },
  { value: 2107, label: "PERFORMANCES" },
];

/** 主要セクションへの導線タイル(EXPLORE) */
const SECTIONS = [
  {
    label: "DISCOGRAPHY",
    jp: "リリースと全曲情報",
    to: "/discography/",
    accent: BLUE,
  },
  {
    label: "LIVE",
    jp: "公演情報・セトリ",
    to: "/live/",
    accent: YELLOW,
  },
  {
    label: "PLACE",
    jp: "ロケ地マップ",
    to: "/place/",
    accent: BLUE_LIGHT,
  },
  {
    label: "PHOTO",
    jp: "フォトギャラリー",
    to: "/photos/",
    accent: INK,
  },
];

const ERAS = [
  {
    color: BLUE,
    years: "2012–2014",
    name: "れをる時代",
    desc: "ニコニコ動画・歌ってみた",
  },
  {
    color: YELLOW,
    years: "2015–2016",
    name: "REOL",
    desc: "ユニット期・ΣMPATHY〜Σ",
  },
  {
    color: INK,
    years: "2017–NOW",
    name: "Reol",
    desc: "ソロ期・事変〜BLACK BOX〜現在",
  },
];

const ENTRY_CARDS = [
  {
    accent: YELLOW,
    kicker: "START HERE",
    title: "はじめてのReol",
    body: "代表曲と年代別ガイド。どのeraから入っても迷わない。",
    to: "/welcome/",
  },
  {
    accent: BLUE,
    kicker: "LIVE & SETLIST",
    title: "ライブに行く",
    body: "167公演のセトリアーカイブと初参加ガイド。",
    to: "/live/",
  },
  {
    accent: BLUE_LIGHT,
    kicker: "DATA",
    title: "データを掘る",
    body: "130曲の演奏回数・初披露・最終演奏を全曲収録。",
    to: "/songs/stats/",
  },
];

const YEAR_TICKS = [
  { year: 2012, left: "0%" },
  { year: 2015, left: "21.5%" },
  { year: 2018, left: "43%" },
  { year: 2021, left: "64.5%" },
  { year: 2024, left: "86%" },
  { year: 2026, left: "100%", now: true },
];

const NAV_ITEMS = [
  { label: "DISCOGRAPHY", to: "/discography/" },
  { label: "LIVE", to: "/live/" },
  { label: "PLACE", to: "/place/" },
  { label: "PHOTO", to: "/photos/" },
  { label: "TIMELINE", to: "/timeline/" },
];

const OFFICIAL_LINKS = ["公式サイト", "YouTube", "X", "Instagram", "グッズ"];

/** 実データのカウントアップ表示(reduced-motion時は即時表示) */
const CountUp: React.FC<{ value: number }> = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let start: number | null = null;
    const duration = 1400;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    setDisplay(0);
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display.toLocaleString()}</>;
};

const DesignPreviewB: React.FC = () => {
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
        DESIGN PREVIEW — B案「BLACKBOX / CHRONICLE」青×黄版(plan/15)。本番導線には未接続です
      </div>

      {/* ヘッダー */}
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

      {/* ヒーロー: 巨大タイポ+動くデータ(計画3.3) */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-8">
        <p
          className="flex items-center gap-2.5 text-[11px] font-extrabold tracking-[0.3em]"
          style={{ color: BLUE }}
        >
          UNBOXED — SINCE 2012
          <span
            aria-hidden
            className="inline-block h-px w-16"
            style={{ backgroundColor: BLUE, opacity: 0.6 }}
          />
        </p>
        <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold leading-[1.22]">
          Reolのこれまでを、
          <br />
          <span style={{ color: YELLOW }}>まるっと</span>遡れる。
        </h1>
        <p
          className="mt-4 text-sm max-w-lg leading-relaxed"
          style={{ color: INK2 }}
        >
          楽曲・ライブ・セトリ・ロケ地。れをる時代から現在まで、
          公式コンテンツへの案内板を兼ねた非公式アーカイブ。
        </p>

        <div className="flex mt-10" style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex-1 px-4 sm:px-6 py-5"
              style={
                i < STATS.length - 1 ? { borderRight: `1px solid ${LINE}` } : undefined
              }
            >
              <div
                className="text-3xl sm:text-5xl font-extrabold leading-none"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                <CountUp value={stat.value} />
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

        <div
          className="flex items-center flex-wrap gap-3 mt-5 text-xs"
          style={{ color: INK2 }}
        >
          <span
            aria-hidden
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: YELLOW, boxShadow: `0 0 10px ${YELLOW}` }}
          />
          <span>
            <b className="font-bold" style={{ color: INK }}>
              NEXT LIVE:
            </b>{" "}
            Reol Oneman Live 2026「美辞学」FINAL — 07.10 LINE CUBE SHIBUYA
          </span>
          <a
            href="https://reol.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto font-extrabold tracking-wide rounded-full px-4 py-1.5"
            style={{ color: YELLOW, border: `1px solid ${YELLOW}` }}
          >
            公式サイトでチケット →
          </a>
        </div>
      </section>

      {/* EXPLORE: 主要セクションへの大タイル導線(モバイルでも常時表示) */}
      <section className="max-w-5xl mx-auto px-6 pt-6">
        <p
          className="text-[10.5px] font-extrabold tracking-[0.3em] mb-3.5"
          style={{ color: INK2 }}
        >
          EXPLORE — 主要コンテンツ
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {SECTIONS.map((section) => (
            <Link
              key={section.label}
              to={section.to}
              className="group relative block rounded-xl p-5 transition-colors"
              style={{
                border: `1px solid ${LINE}`,
                backgroundColor: "rgba(255,255,255,0.035)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor =
                  section.accent)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = LINE)
              }
            >
              <span
                aria-hidden
                className="block w-6 h-1 rounded-full mb-3"
                style={{ backgroundColor: section.accent }}
              />
              <span className="block text-base sm:text-lg font-extrabold tracking-[0.08em]">
                {section.label}
              </span>
              <span
                className="block mt-1 text-[11px] leading-relaxed"
                style={{ color: INK2 }}
              >
                {section.jp}
              </span>
              <span
                className="absolute right-4 bottom-4 font-extrabold"
                style={{ color: section.accent }}
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* クロニクルナビ(計画3.3) */}
      <section className="max-w-5xl mx-auto px-6 pt-12">
        <p
          className="text-[10.5px] font-extrabold tracking-[0.3em] mb-3.5"
          style={{ color: INK2 }}
        >
          CHRONICLE — 年代から遡る
        </p>
        <div className="flex gap-2.5 overflow-x-auto pb-1.5">
          {ERAS.map((era) => (
            <Link
              key={era.name}
              to="/timeline/"
              className="flex-shrink-0 min-w-[168px] rounded-lg px-4 py-3 transition-colors"
              style={{
                border: `1px solid ${LINE}`,
                backgroundColor: "rgba(255,255,255,0.035)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = era.color)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = LINE)
              }
            >
              <p
                className="text-[10.5px] font-extrabold tracking-[0.14em]"
                style={{ color: era.color }}
              >
                {era.years}
              </p>
              <p className="mt-1 text-sm font-bold">{era.name}</p>
              <p className="text-[11px]" style={{ color: INK2 }}>
                {era.desc}
              </p>
            </Link>
          ))}
        </div>
        <div aria-hidden className="relative h-7 mt-3.5">
          <span
            className="absolute left-0 right-0 top-3 h-px"
            style={{ backgroundColor: LINE }}
          />
          {YEAR_TICKS.map((tick) => (
            <span
              key={tick.year}
              className={`absolute top-0 -translate-x-1/2 text-[9px] tracking-wider ${
                tick.now ? "font-extrabold" : ""
              }`}
              style={{
                left: tick.left,
                fontVariantNumeric: "tabular-nums",
                color: tick.now ? YELLOW : INK2,
              }}
            >
              {tick.year}
              <span
                className={`absolute left-1/2 top-[14px] ${
                  tick.now ? "h-2 w-0.5" : "h-[5px] w-px"
                }`}
                style={{ backgroundColor: tick.now ? YELLOW : INK2 }}
              />
            </span>
          ))}
        </div>
      </section>

      {/* 入口カード: ダークガラス1系統(計画3.2) */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3.5 px-6 pt-10">
        {ENTRY_CARDS.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="block rounded-xl p-4 transition-colors"
            style={{
              border: `1px solid ${LINE}`,
              backgroundColor: "rgba(255,255,255,0.035)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = card.accent)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = LINE)
            }
          >
            <p
              className="text-[9.5px] font-extrabold tracking-[0.26em]"
              style={{ color: card.accent }}
            >
              {card.kicker}
            </p>
            <h2 className="mt-2 text-[15px] font-bold">{card.title}</h2>
            <p
              className="mt-1 text-[11.5px] leading-relaxed"
              style={{ color: INK2 }}
            >
              {card.body}
            </p>
          </Link>
        ))}
      </section>

      {/* シアター: 公式埋め込みの見せ方(計画3.1) */}
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-12">
        <p className="flex items-baseline gap-3 mb-3">
          <span className="text-[13px] font-bold tracking-wider">THEATER</span>
          <span
            className="text-[10.5px] tracking-wider"
            style={{ color: INK2 }}
          >
            OFFICIAL VIDEO ONLY — YouTube @reolch
          </span>
        </p>
        <div
          className="relative rounded-xl grid place-items-center overflow-hidden"
          style={{
            aspectRatio: "21 / 9",
            border: `1px solid ${LINE}`,
            background: `radial-gradient(40rem 16rem at 50% 110%, rgba(39,72,155,0.4), transparent 70%), #000`,
          }}
        >
          <span
            className="grid place-items-center w-14 h-14 rounded-full"
            style={{ border: `2px solid ${YELLOW}`, color: YELLOW }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5l12 7-12 7z" />
            </svg>
          </span>
          <span
            className="absolute right-3.5 bottom-3 text-[10px] font-bold tracking-widest"
            style={{ color: "rgba(242,240,235,0.6)" }}
          >
            YouTube — @reolch
          </span>
        </div>
      </section>

      {/* フッター: 公式送客CTAが最強調(計画3.1) */}
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

export default DesignPreviewB;

export const Head: HeadFC = () => (
  <>
    <SEO title="デザインプレビュー B案" path="/design-preview/b/" />
    <meta name="robots" content="noindex" />
  </>
);
