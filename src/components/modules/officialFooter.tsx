import React from "react";
import {
  FaGlobe,
  FaYoutube,
  FaXTwitter,
  FaInstagram,
  FaBagShopping,
} from "react-icons/fa6";
import { GoLinkExternal } from "react-icons/go";
import { trackOfficialLinkClick } from "../../utils/analytics";
import { useDict } from "../../i18n/site/SiteLangContext";
import type { SiteDict } from "../../i18n/site/dict";

/**
 * 全ページ共通の公式送客フッター。
 * 「もっと聴きたい/知りたい」と思った瞬間の受け皿として、
 * 確認済みの公式リンクのみを掲載する(非公式サイトとしての信頼性表記も兼ねる)。
 */

type OfficialLink = {
  type: string;
  /** 表示名(言語ごとに変わるものは辞書から引く) */
  label: string | ((dict: SiteDict) => string);
  href: string;
  icon: React.ReactNode;
};

const OFFICIAL_LINKS: OfficialLink[] = [
  {
    type: "site",
    label: (dict) => dict.footer.officialSite,
    href: "https://reol.jp/",
    icon: <FaGlobe />,
  },
  {
    type: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@reolch",
    icon: <FaYoutube />,
  },
  {
    type: "x",
    label: "X",
    href: "https://twitter.com/RRReol",
    icon: <FaXTwitter />,
  },
  {
    type: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/rrreol999/",
    icon: <FaInstagram />,
  },
  {
    type: "goods",
    label: (dict) => dict.footer.goods,
    href: "https://reol.ec-front.jp/",
    icon: <FaBagShopping />,
  },
];

const OfficialFooter: React.FC = () => {
  const dict = useDict();
  return (
    <footer className="relative bg-bx-bg border-t border-bx-line text-bx-ink pt-6 pb-4 px-4">
      <h2 className="text-center text-xs font-bold tracking-[0.3em] text-bx-ink2 mb-3">
        OFFICIAL LINKS
      </h2>
      <ul className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4">
        {OFFICIAL_LINKS.map((link) => (
          <li key={link.type}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-bx-line text-bx-ink3 hover:border-bx-blue hover:text-bx-ink transition-colors"
              onClick={() => trackOfficialLinkClick(link.type)}
            >
              <span className="text-sm">{link.icon}</span>
              <span>{typeof link.label === "function" ? link.label(dict) : link.label}</span>
              <GoLinkExternal className="text-[10px] opacity-70" />
            </a>
          </li>
        ))}
        <li>
          <a
            href="https://reol.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold tracking-wide rounded-full bg-bx-yellow text-bx-bg hover:opacity-90 transition-opacity"
            onClick={() => trackOfficialLinkClick("site")}
          >
            <span>REOL.JP →</span>
          </a>
        </li>
      </ul>
      <p className="text-center text-[11px] leading-relaxed text-bx-ink3 max-w-xl mx-auto mb-3">
        {dict.footer.disclaimer}
      </p>
      <div className="flex justify-center items-center gap-2 text-[11px] text-bx-ink3">
        <a
          href="https://twitter.com/twilightplc"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-bx-ink transition-colors"
        >
          <FaXTwitter />
          <span>{dict.footer.operator}</span>
          <GoLinkExternal className="text-[10px]" />
        </a>
        <span aria-hidden>|</span>
        {/* SSGのためビルド時点の年で焼き込まれる(デプロイごとに更新される) */}
        <span>&copy; 2023–{new Date().getFullYear()} Pochi</span>
      </div>
    </footer>
  );
};

export default OfficialFooter;
