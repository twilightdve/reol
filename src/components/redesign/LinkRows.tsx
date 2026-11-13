import React from "react";
import { LangLink, useLocalizePath } from "../../i18n/site/SiteLangContext";

/**
 * ほかのページへの入口を、枠で囲まず、細い罫線で区切った行として並べる。
 * カードを並べる代わりに使う(2026-11-13 ユーザー「カードばっかり使ってるデザインあんまり好きじゃない」
 * 「今一番しっくりくるのは読みものコンテンツのデザイン」。plan/71)。
 * 行の中身は 小見出し(任意)・題・説明(任意)・矢印。色は題にだけ付く(重ねた時)。
 */

interface LinkRowProps {
  /** サイト内のページ(表示中の言語の URL になる) */
  to?: string;
  /** 外部のページ。新しいタブで開く */
  href?: string;
  /** 題の上に小さく出す英字の見出し */
  kicker?: React.ReactNode;
  title: React.ReactNode;
  desc?: React.ReactNode;
  /** 題を大きく出す(主要セクションへの入口) */
  large?: boolean;
  /** 題の見出しレベル。既定は見出しにしない */
  as?: "h2" | "h3" | "span";
  onClick?: () => void;
}

export const LinkRow: React.FC<LinkRowProps> = ({ to, href, kicker, title, desc, large = false, as = "span", onClick }) => {
  const localize = useLocalizePath();
  const Title = as;
  const body = (
    <>
      <span className="min-w-0">
        {kicker && (
          <span className="mb-1 block text-[11px] font-extrabold tracking-[0.2em] text-bx-ink3">{kicker}</span>
        )}
        <Title
          className={`block font-bold text-bx-ink transition-colors group-hover:text-bx-blueLight ${
            large ? "text-[17px] font-extrabold tracking-[0.08em] sm:text-[19px]" : "text-[15px]"
          }`}
        >
          {title}
        </Title>
        {desc && <span className="mt-0.5 block text-[12px] leading-relaxed text-bx-ink3">{desc}</span>}
      </span>
      <span aria-hidden="true" className="flex-shrink-0 text-bx-ink3 transition-colors group-hover:text-bx-blueLight">
        →
      </span>
    </>
  );
  const className = "group flex items-center justify-between gap-3 py-3";
  return (
    <li className="border-b border-bx-line">
      {to ? (
        <LangLink to={to} onClick={onClick} className={className}>
          {body}
        </LangLink>
      ) : (
        <a
          href={localize(href ?? "")}
          onClick={onClick}
          className={className}
          {...(href && !href.startsWith("/") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {body}
        </a>
      )}
    </li>
  );
};

interface LinkRowsProps {
  /** 広い画面で2列にする(既定)。false で常に1列 */
  twoColumns?: boolean;
  /** 広い画面で3列にする(項目が3つで、2列だと1つ余る時) */
  threeColumns?: boolean;
  className?: string;
  children: React.ReactNode;
}

const LinkRows: React.FC<LinkRowsProps> = ({ twoColumns = true, threeColumns = false, className = "", children }) => (
  <ul
    className={`grid grid-cols-1 border-t border-bx-line ${
      threeColumns ? "sm:grid-cols-3 sm:gap-x-8" : twoColumns ? "sm:grid-cols-2 sm:gap-x-8" : ""
    } ${className}`}
  >
    {children}
  </ul>
);

export default LinkRows;
