import React from "react";
import { Link, HeadFC } from "gatsby";
import SEO from "../../components/SEO";
import { activityYears } from "../../constants/artist";
import { FiSearch, FiStar, FiMapPin, FiClock } from "react-icons/fi";
import { LuMic2, LuBarChart2 } from "react-icons/lu";

/**
 * デザインプレビュー: A案「空と雲・磨き上げ」(plan/15-uiux-redesign-ab.md)
 * トップページのリデザイン案を実環境で確認するためのモック。
 * 既存導線には未接続・noindex。採用時はこのページを土台に本実装へ移す。
 */

const NAV_ITEMS = [
  { label: "DISCOGRAPHY", to: "/discography/" },
  { label: "LIVE", to: "/live/" },
  { label: "PLACE", to: "/place/" },
  { label: "PHOTO", to: "/photos/" },
  { label: "TIMELINE", to: "/timeline/" },
];

const ENTRY_CARDS = [
  {
    accent: "#27489b",
    icon: <FiStar size={20} />,
    title: "はじめてのReol",
    body: "代表曲と年代別ガイドで、ここから沼へ",
    cta: "ガイドを見る →",
    to: "/welcome/",
  },
  {
    accent: "#d2af57",
    icon: <LuMic2 size={20} />,
    title: "ライブに行く",
    body: "公演情報とセトリ・初参加ガイド",
    cta: "公演を探す →",
    to: "/live/",
  },
  {
    accent: "#1a7a6e",
    icon: <LuBarChart2 size={20} />,
    title: "データを掘る",
    body: "130曲の演奏回数・初披露日・統計",
    cta: "統計を見る →",
    to: "/songs/stats/",
  },
];

const OFFICIAL_LINKS = ["公式サイト", "YouTube", "X", "Instagram", "グッズ"];

const DesignPreviewA: React.FC = () => {
  return (
    <div
      className="min-h-screen text-[#232733]"
      style={{
        background:
          "radial-gradient(90rem 40rem at 85% -18rem, rgba(255,255,255,0.9), transparent 60%), linear-gradient(165deg, #cfe0f4 0%, #e8f0fa 42%, #fdfdfc 100%)",
      }}
    >
      {/* プレビュー注記 */}
      <div className="bg-[#232733] text-white text-center text-[11px] tracking-wider py-1.5 px-3">
        DESIGN PREVIEW — A案「空と雲・磨き上げ」(plan/15)。本番導線には未接続です
      </div>

      {/* ヘッダー: 常設グローバルナビ(計画2.4) */}
      <header className="bg-[#d2af57]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
          <Link to="/" className="flex items-baseline gap-2.5 min-w-0">
            <span className="font-icon text-2xl font-semibold text-[#27489b]">
              !Legit
            </span>
            <span className="hidden sm:inline text-[10px] font-bold tracking-[0.2em] text-[#6b5a23]">
              REOL UNOFFICIAL FANSITE
            </span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-5 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="hidden md:inline text-xs font-bold tracking-widest text-[#443a15] border-b-2 border-transparent hover:border-[#27489b] pb-0.5 whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/search/"
              className="inline-flex items-center gap-1.5 bg-[#27489b] text-white text-xs font-bold rounded-full px-4 py-1.5 whitespace-nowrap"
            >
              <FiSearch size={12} />
              検索
            </Link>
          </nav>
        </div>
      </header>

      {/* ヒーロー: テキストが主役(計画2.2) */}
      <section className="relative">
        {/* 雲(静的・低透明度) */}
        <div
          aria-hidden
          className="absolute top-6 right-[6%] w-72 h-24 rounded-full bg-white/75 blur-2xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute top-40 left-[3%] w-56 h-20 rounded-full bg-white/60 blur-2xl pointer-events-none"
        />

        <div className="relative z-10 text-center pt-14 px-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-[#27489b] leading-normal">
            Reolの{activityYears()}年を、ぜんぶ遡れる。
          </h1>
          <p className="mt-2 text-sm text-[#5a6070]">
            楽曲・ライブ・セトリ・ロケ地まで。非公式ファンサイト !Legit
          </p>
          <Link
            to="/search/"
            className="mt-6 mx-auto max-w-md flex items-center gap-2.5 bg-white border border-[#dfe3ec] rounded-full px-5 py-3 text-sm text-[#5a6070] text-left shadow-[0_8px_24px_-16px_rgba(39,72,155,0.35)]"
          >
            <FiSearch size={14} className="flex-shrink-0" />
            <span className="truncate">
              曲名・ライブ・場所で横断検索(例: 第六感)
            </span>
          </Link>
        </div>

        {/* 入口3カード: 白カード1種+左ボーダーで区別(計画2.3) */}
        <div className="relative z-10 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3.5 px-6 pt-8">
          {ENTRY_CARDS.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="relative block bg-white border border-[#dfe3ec] rounded-xl p-4 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: card.accent }}
              />
              <div className="mb-1.5" style={{ color: card.accent }}>
                {card.icon}
              </div>
              <h2 className="text-sm font-bold">{card.title}</h2>
              <p className="mt-0.5 text-xs text-[#5a6070] leading-relaxed">
                {card.body}
              </p>
              <span className="inline-block mt-2.5 text-[11.5px] font-bold text-[#27489b]">
                {card.cta}
              </span>
            </Link>
          ))}
        </div>

        {/* 特集導線: バナーではなく統一の行スタイル(計画2.3) */}
        <div className="relative z-10 max-w-4xl mx-auto grid gap-2.5 px-6 pt-3.5">
          <a
            href="/quiz/reol-type/"
            className="flex items-center gap-3.5 bg-white border border-[#dfe3ec] rounded-xl px-4 py-3 hover:shadow-md transition-shadow"
          >
            <span className="flex-shrink-0 grid place-items-center w-9 h-9 rounded-lg bg-[#27489b] text-white">
              <FiClock size={16} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-bold">
                Reolファンタイプ診断
              </span>
              <span className="block text-[11px] text-[#5a6070]">
                全20問であなたのファンタイプを診断
              </span>
            </span>
            <span className="ml-auto font-bold text-[#27489b]">→</span>
          </a>
          <a
            href="/bijigaku-navi/"
            className="flex items-center gap-3.5 bg-white border border-[#dfe3ec] rounded-xl px-4 py-3 hover:shadow-md transition-shadow"
          >
            <span className="flex-shrink-0 grid place-items-center w-9 h-9 rounded-lg bg-[#d2af57] text-[#443a15]">
              <FiMapPin size={16} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-bold">美辞学ナビ</span>
              <span className="block text-[11px] text-[#5a6070]">
                7/10 LINE CUBE SHIBUYA ファイナル — 会場・アクセス情報
              </span>
            </span>
            <span className="ml-auto font-bold text-[#27489b]">→</span>
          </a>
        </div>

        {/* Now Playing: 動画は主役からカードへ格下げ(計画2.2) */}
        <div className="relative z-10 max-w-4xl mx-auto grid sm:grid-cols-2 gap-4 items-center px-6 pt-8 pb-12">
          <div
            className="relative aspect-video rounded-xl border border-[#dfe3ec] grid place-items-center overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1c2233, #2c3a5e)" }}
          >
            <span className="grid place-items-center w-14 h-14 rounded-full bg-white/90 text-[#27489b]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5l12 7-12 7z" />
              </svg>
            </span>
            <span className="absolute left-3 bottom-2.5 text-[10px] font-bold tracking-widest text-white/85">
              YouTube — @reolch
            </span>
          </div>
          <div>
            <p className="text-[10.5px] font-extrabold tracking-[0.2em] text-[#a07a2c]">
              NOW PLAYING — 公式XFD
            </p>
            <h2 className="mt-1 text-base font-bold">
              最新作クロスフェードを再生中
            </h2>
            <p className="mt-1.5 text-xs text-[#5a6070] leading-relaxed">
              公式YouTubeの埋め込みのみを使用。フルで聴くなら配信・公式チャンネルへ。
              (プレビューでは実プレイヤーの代わりに枠のみ表示)
            </p>
          </div>
        </div>
      </section>

      {/* 公式送客フッター(現行OfficialFooterの配色統一版) */}
      <footer className="bg-[#d2af57] text-center px-6 py-4">
        <p className="text-[10px] font-extrabold tracking-[0.3em] text-[#27489b] mb-2">
          OFFICIAL LINKS
        </p>
        <div className="flex justify-center flex-wrap gap-2">
          {OFFICIAL_LINKS.map((label) => (
            <span
              key={label}
              className="text-[11px] font-semibold text-[#443a15] border border-[#443a15]/40 rounded-full px-3.5 py-1"
            >
              {label}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default DesignPreviewA;

export const Head: HeadFC = () => (
  <>
    <SEO title="デザインプレビュー A案" path="/design-preview/a/" />
    <meta name="robots" content="noindex" />
  </>
);
