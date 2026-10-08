/**
 * URL を変えたページの旧URLに置く転送ページ(plan/27 P3 スラッグ)。
 *
 * GitHub Pages ではサーバー側のリダイレクトができないため、静的HTMLの meta refresh と
 * canonical で転送先を示す。JS が動く環境では head のインラインスクリプト(とマウント後の navigate)で
 * クエリとハッシュを引き継いで置き換え遷移する。
 * 旧URLは noindex にし、サイトマップにも載せない(gatsby-node で pageContext.noindex を付ける)。
 */
import React, { useEffect } from "react";
import { HeadFC, Link, PageProps, navigate } from "gatsby";
import { DEFAULT_LANG, HTML_LANG, isSiteLang } from "../i18n/site/langs";
import { localizePath } from "../utils/i18nRoutes";

const SITE_URL = "https://reol.twilightea.com";

type RedirectContext = {
  /** 転送先(日本語側のパス) */
  to: string;
  lang?: string;
};

const targetOf = (ctx: RedirectContext) =>
  localizePath(ctx.to, isSiteLang(ctx.lang) ? ctx.lang : DEFAULT_LANG);

const RedirectPage: React.FC<PageProps<object, RedirectContext>> = ({ pageContext, location }) => {
  const target = targetOf(pageContext);
  useEffect(() => {
    void navigate(`${target}${location.search}${location.hash}`, { replace: true });
  }, [target, location.search, location.hash]);

  return (
    <main className="container mx-auto max-w-xl px-4 py-16 text-center text-bx-ink">
      <p className="text-sm text-bx-ink2">
        このページは移動しました。<Link to={target} className="text-bx-blueLight underline">新しいページへ</Link>
      </p>
    </main>
  );
};

export default RedirectPage;

export const Head: HeadFC<object, RedirectContext> = ({ pageContext }) => {
  const target = targetOf(pageContext);
  const lang = isSiteLang(pageContext.lang) ? pageContext.lang : DEFAULT_LANG;
  return (
    <>
      <html lang={HTML_LANG[lang]} />
      <title>移動しました | !Legit</title>
      <meta name="robots" content="noindex,follow" />
      {/* meta refresh より先に、クエリ(utm 等)とハッシュを引き継いで置き換え遷移する */}
      <script
        dangerouslySetInnerHTML={{
          __html: `location.replace(${JSON.stringify(target)}+location.search+location.hash);`,
        }}
      />
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <link rel="canonical" href={`${SITE_URL}${target}`} />
    </>
  );
};
