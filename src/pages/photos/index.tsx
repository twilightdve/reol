/**
 * /photos/ — 旧 PHOTO(写真の一覧)の置き場所。
 * 写真は読みものの「記録」48 本へ移し(plan/72)、2026-11-14 に一覧のページ自体をやめた(ユーザー「消して転送」)。
 * サイトは静的配信(GitHub Pages)で、サーバーの側の転送ができないので、このページからシリーズ「ライヴと遠征の記録」へ送る。
 * 検索や SNS に残った前の URL のために置いておく(サイトマップには載せない。gatsby-config の excludes)。
 * 各言語版(/en/photos/ など。i18nRoutes の LOCALIZED_EXACT)も同じページで、日本語のシリーズのページへ送る(読みものは日本語だけ)
 */
import React, { FC, useEffect } from "react";
import { HeadFC, Link, navigate } from "gatsby";
import SEO from "../../components/SEO";
import { seriesBySlug, seriesPath } from "../../utils/songArticles/series";

const SERIES_SLUG = "live-to-ensei-no-kiroku";
const TO = seriesPath(SERIES_SLUG);
const SERIES = seriesBySlug(SERIES_SLUG);
const TITLE = SERIES?.name ?? "ライヴと遠征の記録";

const PhotosMovedPage: FC = () => {
  useEffect(() => {
    // サイトの中のリンクから来た時(Head の script が動かない時)のため
    navigate(TO, { replace: true });
  }, []);

  return (
    <main className="container mx-auto w-full max-w-3xl px-4 py-10 text-bx-ink" lang="ja">
      <p className="text-sm text-bx-ink2">
        写真は「読みもの」の記録へ移しました。
        <br />
        <Link to={TO} className="text-bx-blue underline underline-offset-2 hover:text-bx-blueLight">
          {TITLE}
        </Link>
      </p>
    </main>
  );
};

export default PhotosMovedPage;

// 正規 URL(canonical)と og:url は新しい URL。
// script はページを読み込む途中で動くので、meta refresh より先に送る。JS が動かない時は meta refresh で送る
export const Head: HeadFC = () => (
  <>
    <SEO title={TITLE} description={SERIES?.description} path={TO} lang="ja" />
    <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(TO)})` }} />
    <meta httpEquiv="refresh" content={`0; url=${TO}`} />
  </>
);
