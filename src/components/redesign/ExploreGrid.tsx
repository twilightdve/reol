import React from "react";
import Kicker from "./Kicker";
import LinkRows, { LinkRow } from "./LinkRows";
import { trackEvent } from "../../utils/analytics";
import { useDict } from "../../i18n/site/SiteLangContext";
import type { SiteDict } from "../../i18n/site/dict";

/**
 * B案「BLACKBOX / CHRONICLE」の EXPLORE セクション。主要4セクションへの入口。
 * 2026-11-13 に、大きなタイル(カード)から罫線で区切った行に変えた(plan/71)。
 */
interface ExploreItem {
  label: string;
  /** 計測用ラベル(GA4 で集計するため日本語のまま) */
  jp: string;
  /** 表示用の説明(言語ごと) */
  desc: (dict: SiteDict) => string;
  to: string;
}

const SECTIONS: ExploreItem[] = [
  {
    label: "DISCOGRAPHY",
    jp: "リリースと全曲情報",
    desc: (d) => d.explore.discography,
    to: "/discography/",
  },
  {
    label: "LIVE",
    jp: "公演情報・セトリ",
    desc: (d) => d.explore.live,
    to: "/live/",
  },
  {
    label: "PLACE",
    jp: "ロケ地マップ",
    desc: (d) => d.explore.place,
    to: "/place/",
  },
  {
    label: "PHOTO",
    jp: "フォトギャラリー",
    desc: (d) => d.explore.photo,
    to: "/photos/",
  },
];

const ExploreGrid: React.FC = () => {
  const dict = useDict();
  return (
    <section>
      <Kicker>{dict.explore.kicker}</Kicker>
      <LinkRows className="mt-3.5">
        {SECTIONS.map((section) => (
          <LinkRow
            key={section.label}
            to={section.to}
            title={section.label}
            desc={section.desc(dict)}
            large
            onClick={() =>
              trackEvent("entry_card_click", {
                category: "navigation",
                label: section.jp,
                card_type: `explore_${section.label.toLowerCase()}`,
              })
            }
          />
        ))}
      </LinkRows>
    </section>
  );
};

export default ExploreGrid;
