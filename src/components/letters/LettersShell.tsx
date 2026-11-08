/**
 * 手紙企画(plan/64)のページの枠。サイト全体のテーマ(黒背景・ヘッダー・下部タブ)は被せず(body.tsx)、
 * 見本どおりの紙色のページに、自前の見出し・足元・スマホの下部ナビを置く。
 * 書体(Noto Sans JP / Noto Serif JP)と CSS は、このページの Head だけで読む。
 */
import React from "react";
import { Link } from "gatsby";
import SEO from "../SEO";
import { LETTERS_CSS } from "./lettersStyles";
import { LETTERS_ORGANIZER, LETTERS_TITLE } from "../../utils/letters/constants";

export const LettersHead: React.FC<{ title?: string; description: string; path: string; noindex?: boolean }> = ({
  title,
  description,
  path,
  noindex,
}) => (
  <>
    <SEO title={title ? `${title}｜${LETTERS_TITLE}` : LETTERS_TITLE} description={description} path={path} />
    {noindex && <meta name="robots" content="noindex,nofollow" />}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=Noto+Serif+JP:wght@400;500;600&display=swap"
    />
    <style>{LETTERS_CSS}</style>
  </>
);

type Current = "about" | "write" | "read" | "edit" | "admin";

export const LettersShell: React.FC<{ current: Current; children: React.ReactNode }> = ({ current, children }) => {
  return (
    <div className="lp" lang="ja">
      <div className="lp-wrap">
        <header className="lp-header lp-noprint">
          <Link className="lp-brand" to="/">
            <b>!</b>Legit<span>Reol UNOFFICIAL FAN SITE</span>
          </Link>
          <nav className="lp-header-nav" aria-label={LETTERS_TITLE}>
            <Link to="/letters/" aria-current={current === "about" ? "page" : undefined}>
              企画について
            </Link>
            <Link to="/letters/write/" aria-current={current === "write" ? "page" : undefined}>
              手紙を書く
            </Link>
            <Link to="/letters/read/" aria-current={current === "read" ? "page" : undefined}>
              届いた手紙
            </Link>
            <span className="lp-header-date">BIRTHDAY LETTERS / 11.09</span>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="lp-footer lp-noprint">
          <Link className="lp-brand" to="/" style={{ fontSize: 20, flexShrink: 0 }}>
            <b>!</b>Legit
          </Link>
          <p>
            {LETTERS_ORGANIZER}。Reol さんご本人・所属事務所とは関係ありません。
            <br />
            年表参照：
            <a href="https://reol.jp/feature/history_of_reol" target="_blank" rel="noopener noreferrer">
              HISTORY OF Reol
            </a>{" "}
            ／ <Link to="/privacy/">プライバシーポリシー</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};
