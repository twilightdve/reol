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

/**
 * 全ページ共通の公式送客フッター。
 * 「もっと聴きたい/知りたい」と思った瞬間の受け皿として、
 * 確認済みの公式リンクのみを掲載する(非公式サイトとしての信頼性表記も兼ねる)。
 */

type OfficialLink = {
  type: string;
  label: string;
  href: string;
  icon: React.ReactNode;
};

const OFFICIAL_LINKS: OfficialLink[] = [
  {
    type: "site",
    label: "公式サイト",
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
    label: "グッズ",
    href: "https://reol.ec-front.jp/",
    icon: <FaBagShopping />,
  },
];

const OfficialFooter: React.FC = () => {
  return (
    <footer className="relative bg-theme text-white pt-6 pb-4 px-4">
      <h2 className="text-center text-xs font-bold tracking-[0.3em] text-letter mb-3">
        OFFICIAL LINKS
      </h2>
      <ul className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4">
        {OFFICIAL_LINKS.map((link) => (
          <li key={link.type}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-white/30 hover:border-white/70 hover:bg-white/10 transition-colors"
              onClick={() => trackOfficialLinkClick(link.type)}
            >
              <span className="text-sm">{link.icon}</span>
              <span>{link.label}</span>
              <GoLinkExternal className="text-[10px] opacity-70" />
            </a>
          </li>
        ))}
      </ul>
      <p className="text-center text-[11px] leading-relaxed text-white/70 max-w-xl mx-auto mb-3">
        本サイトはReol公式とは関係のない非公式ファンサイトです。
        楽曲・映像は公式の埋め込み/リンクのみ使用しています。
      </p>
      <div className="flex justify-center items-center gap-2 text-[11px] text-white/60">
        <a
          href="https://twitter.com/twilightplc"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-white/90 transition-colors"
        >
          <FaXTwitter />
          <span>運営(非公式ファンサイト)</span>
          <GoLinkExternal className="text-[10px]" />
        </a>
        <span aria-hidden>|</span>
        <span>&copy; 2023 Pochi</span>
      </div>
    </footer>
  );
};

export default OfficialFooter;
