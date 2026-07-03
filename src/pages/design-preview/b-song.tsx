import React from "react";
import { Link, HeadFC } from "gatsby";
import SEO from "../../components/SEO";

/**
 * デザインプレビュー: B案「BLACKBOX / CHRONICLE」曲詳細ページ(plan/15-uiux-redesign-ab.md)
 * 既存 /songs/<slug>/ のリデザイン版モック。既存導線には未接続・noindex。
 * データは「第六感」の実データスナップショット(2026-07-03時点)。
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

const SONG_STATS = [
  { value: "85", label: "PERFORMANCES" },
  { value: "2020.08.16", label: "FIRST" },
  { value: "2026.06.27", label: "LATEST" },
];

/** 演奏履歴(直近5件)。ツアー名はINK2、会場名はINK、年月日はYELLOW。 */
const HISTORY = [
  {
    date: "2026.06.27",
    tour: "Reol Oneman Live 2026 美辞学",
    pref: "福岡",
    venue: "福岡国際会議場メインホール",
  },
  {
    date: "2026.06.19",
    tour: "Reol Oneman Live 2026 美辞学",
    pref: "大阪",
    venue: "オリックス劇場",
  },
  {
    date: "2026.06.12",
    tour: "Reol Oneman Live 2026 美辞学",
    pref: "宮城",
    venue: "トークネットホール仙台",
  },
  {
    date: "2026.05.31",
    tour: "Reol Oneman Live 2026 美辞学",
    pref: "岐阜",
    venue: "岐阜Club-G",
  },
  {
    date: "2026.05.30",
    tour: "Reol Oneman Live 2026 美辞学",
    pref: "京都",
    venue: "KYOTO FANJ",
  },
];

const RELATED_CARDS = [
  {
    accent: BLUE_LIGHT,
    kicker: "DATA",
    title: "楽曲統計へ",
    body: "130曲の演奏回数・初披露・最終演奏を全曲収録。",
    to: "/songs/stats/",
  },
  {
    accent: YELLOW,
    kicker: "SEARCH",
    title: "横断検索へ",
    body: "楽曲・ライブ・ロケ地を横断してキーワード検索。",
    to: "/search/",
  },
];

const DesignPreviewBSong: React.FC = () => {
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
        DESIGN PREVIEW — B案「BLACKBOX / CHRONICLE」曲詳細ページ(plan/15)。本番導線には未接続です
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

      {/* パンくず */}
      <div className="max-w-5xl mx-auto px-6 pt-5">
        <p
          className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide"
          style={{ color: INK2 }}
        >
          <Link
            to="/"
            className="transition-colors"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = BLUE)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = INK2)
            }
          >
            HOME
          </Link>
          <span aria-hidden>/</span>
          <Link
            to="/songs/stats/"
            className="transition-colors"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = BLUE)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = INK2)
            }
          >
            SONGS
          </Link>
          <span aria-hidden>/</span>
          <span style={{ color: INK }}>第六感</span>
        </p>
      </div>

      {/* 曲名ヒーロー */}
      <section className="max-w-5xl mx-auto px-6 pt-8 pb-8">
        <p
          className="flex items-center gap-2.5 text-[11px] font-extrabold tracking-[0.3em]"
          style={{ color: BLUE }}
        >
          SONG ARCHIVE
          <span
            aria-hidden
            className="inline-block h-px w-16"
            style={{ backgroundColor: BLUE, opacity: 0.6 }}
          />
        </p>
        <h1 className="mt-4 text-5xl sm:text-7xl font-extrabold leading-[1.1]">
          第六感
        </h1>
        <p
          className="mt-5 text-[13px] leading-relaxed max-w-2xl"
          style={{ color: INK2 }}
        >
          収録: シングル「第六感」(2020.07.29 Release)
          <span className="mx-2" aria-hidden>
            /
          </span>
          作詞: Reol
          <span className="mx-2" aria-hidden>
            /
          </span>
          作曲: Reol, Giga
        </p>

        <div
          className="flex mt-10"
          style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}
        >
          {SONG_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex-1 px-4 sm:px-6 py-5"
              style={
                i < SONG_STATS.length - 1
                  ? { borderRight: `1px solid ${LINE}` }
                  : undefined
              }
            >
              <div
                className="text-2xl sm:text-4xl font-extrabold leading-none"
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

      {/* シアター: 公式MV枠(b.tsxと同じ黒フレーム+黄再生ボタン) */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <p className="flex items-baseline gap-3 mb-3">
          <span className="text-[13px] font-bold tracking-wider">THEATER</span>
          <span className="text-[10.5px] tracking-wider" style={{ color: INK2 }}>
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
            「第六感」MV — YouTube @reolch
          </span>
        </div>

        {/* 公式導線3ボタン */}
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <a
            href="https://jvcmusic.lnk.to/reol_thesixthsense"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-extrabold tracking-wide rounded-full px-5 py-2"
            style={{ backgroundColor: YELLOW, color: "#0b0b10" }}
          >
            配信で聴く
          </a>
          <a
            href="https://www.uta-net.com/song/288552/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-extrabold tracking-wide rounded-full px-5 py-2"
            style={{ color: INK, border: `1px solid ${LINE}` }}
          >
            歌詞(歌ネット)
          </a>
          <a
            href="https://youtu.be/Ue6VQTcKPQo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-extrabold tracking-wide rounded-full px-5 py-2"
            style={{ color: INK, border: `1px solid ${LINE}` }}
          >
            公式MV
          </a>
        </div>
      </section>

      {/* 演奏履歴タイムライン */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <p
          className="text-[10.5px] font-extrabold tracking-[0.3em] mb-4"
          style={{ color: INK2 }}
        >
          PERFORMANCE HISTORY — 直近5公演
        </p>
        <div className="relative pl-6">
          <span
            aria-hidden
            className="absolute left-[3px] top-1.5 bottom-1.5 w-px"
            style={{ backgroundColor: LINE }}
          />
          {HISTORY.map((h) => (
            <div key={`${h.date}-${h.venue}`} className="relative pb-6">
              <span
                aria-hidden
                className="absolute -left-6 top-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: YELLOW, boxShadow: `0 0 8px ${YELLOW}` }}
              />
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span
                  className="text-sm font-extrabold"
                  style={{ color: YELLOW, fontVariantNumeric: "tabular-nums" }}
                >
                  {h.date}
                </span>
                <span className="text-[11px]" style={{ color: INK2 }}>
                  {h.tour}
                </span>
              </div>
              <p className="mt-1 text-[15px] font-bold" style={{ color: INK }}>
                {h.venue}
                <span
                  className="ml-2 text-[11px] font-normal"
                  style={{ color: INK2 }}
                >
                  {h.pref}
                </span>
              </p>
            </div>
          ))}
          <div className="relative pb-1">
            <span
              aria-hidden
              className="absolute -left-6 top-1.5 w-2 h-2 rounded-full"
              style={{ backgroundColor: LINE }}
            />
            <Link
              to="/live/"
              className="text-[12.5px] font-bold transition-colors"
              style={{ color: INK2 }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = BLUE)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = INK2)
              }
            >
              …ほか80公演をすべて見る →
            </Link>
          </div>
        </div>
      </section>

      {/* 回遊 */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 px-6 pb-12">
        {RELATED_CARDS.map((card) => (
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

export default DesignPreviewBSong;

export const Head: HeadFC = () => (
  <>
    <SEO title="デザインプレビュー B案 曲詳細" path="/design-preview/b-song/" />
    <meta name="robots" content="noindex" />
  </>
);
