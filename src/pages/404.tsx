import * as React from "react";
import { HeadFC, Link } from "gatsby";
import SEO from "../components/SEO";
import { Kicker } from "../components/redesign";

const NotFoundPage = () => {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-16 max-w-3xl text-bx-ink">
      <Kicker color="text-bx-yellow">404 — NOT FOUND</Kicker>
      <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold leading-tight text-bx-ink">
        ページが見つかりません
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-bx-ink3">
        お探しのページは移動または削除された可能性があります。
        <br />
        楽曲・ライブ・ロケ地をお探しの場合は横断検索をお試しください。
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          to="/"
          className="text-[12px] font-extrabold tracking-wide rounded-full px-5 py-2 bg-bx-yellow text-bx-bg hover:opacity-90 transition-opacity"
        >
          トップに戻る
        </Link>
        <Link
          to="/search/"
          className="text-[12px] font-extrabold tracking-wide rounded-full px-5 py-2 border border-bx-line text-bx-ink hover:border-bx-blue transition-colors"
        >
          横断検索へ
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;

export const Head: HeadFC = () => (
  <SEO
    title="404 Not Found"
    description="お探しのページが見つかりませんでした。"
    path="/404/"
  />
);
