/**
 * /place/shibuya/ — 聖地巡礼ガイド 渋谷編の前の置き場所(2026-11-12 公開)。
 * 2026-11-13 に読みもの(/articles/shibuya-guide/)へ移した。
 * サイトは静的配信(GitHub Pages)で、サーバーの側の転送ができないので、このページから新しい URL へ送る。
 * 検索や SNS に残った前の URL のために置いておく(サイトマップには載せない。gatsby-config の excludes)
 */
import React, { FC, useEffect } from "react";
import { HeadFC, Link, navigate } from "gatsby";
import SEO from "../../components/SEO";
import { SHIBUYA_GUIDE, guidePath } from "../../utils/songArticles/guides";

const TO = guidePath(SHIBUYA_GUIDE);

const ShibuyaGuideMovedPage: FC = () => {
  useEffect(() => {
    // サイトの中のリンクから来た時(Head の script が動かない時)のため
    navigate(`${TO}${window.location.hash}`, { replace: true });
  }, []);

  return (
    <main className="container mx-auto w-full max-w-3xl px-4 py-10 text-bx-ink" lang="ja">
      <p className="text-sm text-bx-ink2">
        このページは「読みもの」へ移しました。
        <br />
        <Link to={TO} className="text-bx-blue underline underline-offset-2 hover:text-bx-blueLight">
          {SHIBUYA_GUIDE.title}
        </Link>
      </p>
    </main>
  );
};

export default ShibuyaGuideMovedPage;

// 正規 URL(canonical)と og:url は新しい URL。
// script はページを読み込む途中で動くので、meta refresh より先に送る(場所ごとの見出しへのリンク #modi などを引き継ぐ)。
// JS が動かない時は meta refresh で送る
export const Head: HeadFC = () => (
  <>
    <SEO title={SHIBUYA_GUIDE.title} description={SHIBUYA_GUIDE.summary} path={TO} lang="ja" />
    <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(TO)}+location.hash)` }} />
    <meta httpEquiv="refresh" content={`0; url=${TO}`} />
  </>
);
