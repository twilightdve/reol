import React from "react";
import { Link, HeadFC } from "gatsby";
import SEO from "../../components/SEO";

/**
 * デザインプレビュー・ハブページ(plan/15・16)
 * リデザインA/B案の各モックページへの入口。既存導線には未接続・noindex。
 */

// 公式カラーセット(reol.jp)。b.tsxと完全に揃える。
const YELLOW = "#e2bf57";
const BLUE = "#6b8ce0";
const INK = "#f2f0eb";
const INK2 = "#8f8e96";
const LINE = "#26262e";

const PREVIEW_CARDS = [
  {
    kicker: "PLAN A",
    title: "A案 トップ(空と雲・磨き上げ)",
    body: "既存トーン踏襲・明るい配色でのブラッシュアップ案。",
    to: "/design-preview/a/",
    accent: BLUE,
    adopted: false,
  },
  {
    kicker: "PLAN B",
    title: "B案 トップ(BLACKBOX/CHRONICLE・採用案)",
    body: "黒背景×公式カラー(青×黄)のリデザイン案。",
    to: "/design-preview/b/",
    accent: YELLOW,
    adopted: true,
  },
  {
    kicker: "PLAN B",
    title: "B案 曲詳細(第六感)",
    body: "曲詳細ページ(/songs/<slug>/)のリデザイン版モック。",
    to: "/design-preview/b-song/",
    accent: YELLOW,
    adopted: false,
  },
  {
    kicker: "PLAN B",
    title: "B案 楽曲統計",
    body: "楽曲統計ページ(/songs/stats/)のリデザイン版モック。",
    to: "/design-preview/b-stats/",
    accent: YELLOW,
    adopted: false,
  },
];

const DesignPreviewIndex: React.FC = () => {
  return (
    <div
      className="min-h-screen"
      style={{
        color: INK,
        background: `radial-gradient(70rem 30rem at 50% -14rem, rgba(39,72,155,0.35), transparent 65%), #0b0b10`,
        fontFeatureSettings: '"palt"',
      }}
    >
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <h1 className="text-2xl sm:text-3xl font-extrabold leading-snug">
          DESIGN PREVIEW — リデザイン検討(plan/15・16)
        </h1>
        <p className="mt-3 text-sm max-w-lg leading-relaxed" style={{ color: INK2 }}>
          noindex・本番導線未接続の検討用モックです。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-10">
          {PREVIEW_CARDS.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="relative block rounded-xl p-5 transition-colors"
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
              {card.adopted && (
                <span
                  className="absolute right-4 top-4 text-[9.5px] font-extrabold tracking-[0.2em] rounded-full px-2.5 py-1"
                  style={{ backgroundColor: YELLOW, color: "#0b0b10" }}
                >
                  ADOPTED
                </span>
              )}
              <p
                className="text-[9.5px] font-extrabold tracking-[0.26em]"
                style={{ color: card.accent }}
              >
                {card.kicker}
              </p>
              <h2 className="mt-2 text-[15px] font-bold pr-16">{card.title}</h2>
              <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: INK2 }}>
                {card.body}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DesignPreviewIndex;

export const Head: HeadFC = () => (
  <>
    <SEO title="デザインプレビュー" path="/design-preview/" />
    <meta name="robots" content="noindex" />
  </>
);
