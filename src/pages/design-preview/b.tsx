import React, { useEffect, useRef, useState } from "react";
import { Link, HeadFC } from "gatsby";
import SEO from "../../components/SEO";
import { activityYears } from "../../constants/artist";

/**
 * デザインプレビュー: B案「BLACKBOX / CHRONICLE」(plan/15-uiux-redesign-ab.md)
 * 旧オープニングのBLACKBOX意匠(黒×オレンジ #ea6000)を本編まで貫通させる
 * リデザイン案を実環境で確認するためのモック。既存導線には未接続・noindex。
 * 統計値は実データのスナップショット(2026-07-03: 130曲/167公演/総演奏2,107回)。
 * 本実装ではビルド時にGraphQLから焼き込む。
 */

const STATS = [
  { value: 130, label: "SONGS" },
  { value: 167, label: "LIVES" },
  { value: 2107, label: "PERFORMANCES" },
];

const ERAS = [
  {
    color: "#7fd1c0",
    years: "2012–2014",
    name: "れをる時代",
    desc: "ニコニコ動画・歌ってみた",
  },
  {
    color: "#e4c15a",
    years: "2015–2016",
    name: "REOL",
    desc: "ユニット期・ΣMPATHY〜Σ",
  },
  {
    color: "#ea6000",
    years: "2017–NOW",
    name: "Reol",
    desc: "ソロ期・事変〜BLACK BOX〜現在",
  },
];

const ENTRY_CARDS = [
  {
    accent: "#ea6000",
    kicker: "START HERE",
    title: "はじめてのReol",
    body: "代表曲と年代別ガイド。どのeraから入っても迷わない。",
    to: "/welcome/",
  },
  {
    accent: "#e4c15a",
    kicker: "LIVE & SETLIST",
    title: "ライブに行く",
    body: "167公演のセトリアーカイブと初参加ガイド。",
    to: "/live/",
  },
  {
    accent: "#7fd1c0",
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
      className="min-h-screen text-[#f2f0eb]"
      style={{
        background:
          "radial-gradient(70rem 30rem at 50% -14rem, rgba(234,96,0,0.13), transparent 65%), #0b0b10",
        fontFeatureSettings: '"palt"',
      }}
    >
      {/* プレビュー注記 */}
      <div className="bg-[#ea6000] text-[#0b0b10] text-center text-[11px] font-bold tracking-wider py-1.5 px-3">
        DESIGN PREVIEW — B案「BLACKBOX / CHRONICLE」(plan/15)。本番導線には未接続です
      </div>

      {/* ヘッダー */}
      <header className="border-b border-[#26262e]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-baseline gap-2.5 min-w-0">
            <span className="font-icon text-xl font-semibold">!Legit</span>
            <span className="hidden sm:inline text-[9.5px] font-bold tracking-[0.24em] text-[#8f8e96]">
              REOL UNOFFICIAL ARCHIVE
            </span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-5 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="hidden md:inline text-[11.5px] font-bold tracking-widest text-[#8f8e96] hover:text-[#f2f0eb] whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/search/"
              className="text-[11.5px] font-bold tracking-widest bg-[#ea6000] text-[#0b0b10] rounded-full px-4 py-1.5 whitespace-nowrap"
            >
              検索
            </Link>
          </nav>
        </div>
      </header>

      {/* ヒーロー: 巨大タイポ+動くデータ(計画3.3) */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-8">
        <p className="flex items-center gap-2.5 text-[11px] font-extrabold tracking-[0.3em] text-[#ea6000]">
          UNBOXED — SINCE 2012
          <span aria-hidden className="inline-block h-px w-16 bg-[#ea6000]/60" />
        </p>
        <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold leading-[1.22]">
          Reolの{activityYears()}年を、
          <br />
          <span className="text-[#ea6000]">ぜんぶ</span>遡れる。
        </h1>
        <p className="mt-4 text-sm text-[#8f8e96] max-w-lg leading-relaxed">
          楽曲・ライブ・セトリ・ロケ地。れをる時代から現在まで、
          公式コンテンツへの案内板を兼ねた非公式アーカイブ。
        </p>

        <div className="flex mt-10 border-y border-[#26262e]">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex-1 px-4 sm:px-6 py-5 ${
                i < STATS.length - 1 ? "border-r border-[#26262e]" : ""
              }`}
            >
              <div
                className="text-3xl sm:text-5xl font-extrabold leading-none"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                <CountUp value={stat.value} />
              </div>
              <div className="mt-2 text-[10px] font-extrabold tracking-[0.26em] text-[#8f8e96]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center flex-wrap gap-3 mt-5 text-xs text-[#8f8e96]">
          <span
            aria-hidden
            className="w-1.5 h-1.5 rounded-full bg-[#ea6000] shadow-[0_0_10px_#ea6000] flex-shrink-0"
          />
          <span>
            <b className="text-[#f2f0eb] font-bold">NEXT LIVE:</b>{" "}
            Reol Oneman Live 2026「美辞学」FINAL — 07.10 LINE CUBE SHIBUYA
          </span>
          <a
            href="https://reol.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[#ea6000] font-extrabold tracking-wide border border-[#ea6000] rounded-full px-4 py-1.5"
          >
            公式サイトでチケット →
          </a>
        </div>
      </section>

      {/* クロニクルナビ(計画3.3) */}
      <section className="max-w-5xl mx-auto px-6 pt-8">
        <p className="text-[10.5px] font-extrabold tracking-[0.3em] text-[#8f8e96] mb-3.5">
          CHRONICLE — 年代から遡る
        </p>
        <div className="flex gap-2.5 overflow-x-auto pb-1.5">
          {ERAS.map((era) => (
            <Link
              key={era.name}
              to="/timeline/"
              className="flex-shrink-0 min-w-[168px] border border-[#26262e] rounded-lg bg-white/[0.035] px-4 py-3 hover:border-[#8f8e96] transition-colors"
            >
              <p
                className="text-[10.5px] font-extrabold tracking-[0.14em]"
                style={{ color: era.color }}
              >
                {era.years}
              </p>
              <p className="mt-1 text-sm font-bold">{era.name}</p>
              <p className="text-[11px] text-[#8f8e96]">{era.desc}</p>
            </Link>
          ))}
        </div>
        <div aria-hidden className="relative h-7 mt-3.5">
          <span className="absolute left-0 right-0 top-3 h-px bg-[#26262e]" />
          {YEAR_TICKS.map((tick) => (
            <span
              key={tick.year}
              className={`absolute top-0 -translate-x-1/2 text-[9px] tracking-wider ${
                tick.now ? "text-[#ea6000] font-extrabold" : "text-[#8f8e96]"
              }`}
              style={{ left: tick.left, fontVariantNumeric: "tabular-nums" }}
            >
              {tick.year}
              <span
                className={`absolute left-1/2 top-[14px] w-px ${
                  tick.now ? "h-2 w-0.5 bg-[#ea6000]" : "h-[5px] bg-[#8f8e96]"
                }`}
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
            className="block border border-[#26262e] rounded-xl bg-white/[0.035] p-4 transition-colors"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = card.accent)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "#26262e")
            }
          >
            <p
              className="text-[9.5px] font-extrabold tracking-[0.26em]"
              style={{ color: card.accent }}
            >
              {card.kicker}
            </p>
            <h2 className="mt-2 text-[15px] font-bold">{card.title}</h2>
            <p className="mt-1 text-[11.5px] text-[#8f8e96] leading-relaxed">
              {card.body}
            </p>
          </Link>
        ))}
      </section>

      {/* シアター: 公式埋め込みの見せ方(計画3.1) */}
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-12">
        <p className="flex items-baseline gap-3 mb-3">
          <span className="text-[13px] font-bold tracking-wider">THEATER</span>
          <span className="text-[10.5px] tracking-wider text-[#8f8e96]">
            OFFICIAL VIDEO ONLY — YouTube @reolch
          </span>
        </p>
        <div
          className="relative rounded-xl border border-[#26262e] grid place-items-center overflow-hidden"
          style={{
            aspectRatio: "21 / 9",
            background:
              "radial-gradient(40rem 16rem at 50% 110%, rgba(234,96,0,0.16), transparent 70%), #000",
          }}
        >
          <span className="grid place-items-center w-14 h-14 rounded-full border-2 border-[#ea6000] text-[#ea6000]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5l12 7-12 7z" />
            </svg>
          </span>
          <span className="absolute right-3.5 bottom-3 text-[10px] font-bold tracking-widest text-[#f2f0eb]/60">
            YouTube — @reolch
          </span>
        </div>
      </section>

      {/* フッター: 公式送客CTAが最強調(計画3.1) */}
      <footer className="border-t border-[#26262e]">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3.5 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {OFFICIAL_LINKS.map((label) => (
              <span
                key={label}
                className="text-[10.5px] font-semibold tracking-wide text-[#8f8e96] border border-[#26262e] rounded-full px-3.5 py-1"
              >
                {label}
              </span>
            ))}
          </div>
          <a
            href="https://reol.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11.5px] font-extrabold tracking-wider bg-[#ea6000] text-[#0b0b10] rounded-full px-4 py-1.5"
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
