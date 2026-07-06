import React from "react";
import GlassCard, { GlassCardAccent } from "./GlassCard";
import Kicker from "./Kicker";
import { trackEvent } from "../../utils/analytics";

/**
 * B案「BLACKBOX / CHRONICLE」の EXPLORE セクション。
 * design-preview/b.tsx の SECTIONS と同構成(主要4セクションへの大タイル導線)。
 */
interface ExploreItem {
  label: string;
  jp: string;
  to: string;
  accent: GlassCardAccent;
}

const SECTIONS: ExploreItem[] = [
  {
    label: "DISCOGRAPHY",
    jp: "リリースと全曲情報",
    to: "/discography/",
    accent: "blue",
  },
  {
    label: "LIVE",
    jp: "公演情報・セトリ",
    to: "/live/",
    accent: "yellow",
  },
  {
    label: "PLACE",
    jp: "ロケ地マップ",
    to: "/place/",
    accent: "blueLight",
  },
  {
    label: "PHOTO",
    jp: "フォトギャラリー",
    to: "/photos/",
    accent: "ink",
  },
];

const ACCENT_BAR: Record<GlassCardAccent, string> = {
  blue: "bg-bx-blue",
  blueDeep: "bg-bx-blueDeep",
  blueLight: "bg-bx-blueLight",
  yellow: "bg-bx-yellow",
  ink: "bg-bx-ink",
};

const ACCENT_TEXT: Record<GlassCardAccent, string> = {
  blue: "text-bx-blue",
  blueDeep: "text-bx-blueDeep",
  blueLight: "text-bx-blueLight",
  yellow: "text-bx-yellow",
  ink: "text-bx-ink",
};

const ExploreGrid: React.FC = () => (
  <section>
    <Kicker>EXPLORE — 主要コンテンツ</Kicker>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3.5">
      {SECTIONS.map((section) => (
        <GlassCard
          key={section.label}
          to={section.to}
          accent={section.accent}
          className="p-5"
          onClick={() =>
            trackEvent("entry_card_click", {
              category: "navigation",
              label: section.jp,
              card_type: `explore_${section.label.toLowerCase()}`,
            })
          }
        >
          <span
            aria-hidden
            className={`block w-6 h-1 rounded-full mb-3 ${ACCENT_BAR[section.accent]}`}
          />
          <span className="block text-base sm:text-lg font-extrabold tracking-[0.08em] text-bx-ink">
            {section.label}
          </span>
          <span className="block mt-1 text-[11px] leading-relaxed text-bx-ink3">
            {section.jp}
          </span>
          <span
            className={`absolute right-4 bottom-4 font-extrabold ${ACCENT_TEXT[section.accent]}`}
          >
            →
          </span>
        </GlassCard>
      ))}
    </div>
  </section>
);

export default ExploreGrid;
