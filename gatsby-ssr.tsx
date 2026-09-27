import React from "react";
import { GatsbySSR } from "gatsby";
import Body from "./src/components/modules/body";
import { store } from "./src/redux/store";
import { Provider } from "react-redux";
import { AuthProvider } from "./src/contexts/AuthContext";
import { SiteLangProvider } from "./src/i18n/site/SiteLangContext";
import { isSiteLang, DEFAULT_LANG, HTML_LANG } from "./src/i18n/site/langs";
import { stripLangPrefix } from "./src/utils/i18nRoutes";

export const wrapRootElement: GatsbySSR["wrapRootElement"] = ({ element, pathname }) => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Body initialPathname={pathname}>{element}</Body>
      </AuthProvider>
    </Provider>
  );
};

// MainVideo と TopHeader は Body 内で wrapRootElement に載っている。
// ページ本体には pageContext.lang の言語を渡す(多言語ページ: plan/28)。
export const wrapPageElement: GatsbySSR["wrapPageElement"] = ({ element, props }) => {
  const lang = (props.pageContext as { lang?: unknown })?.lang;
  return (
    <SiteLangProvider lang={isSiteLang(lang) ? lang : DEFAULT_LANG}>{element}</SiteLangProvider>
  );
};

// Gatsby は本番ビルドでグローバルCSSを全ページの <style> にインライン展開する。
// CSS が大きく(数百KB)、ページ間で共通なので、ハッシュ付きの外部CSSへの <link> に
// 置き換えてブラウザ/Service Worker にキャッシュさせる(ページ遷移ごとの再ダウンロードを避ける)。
export const onPreRenderHTML: GatsbySSR["onPreRenderHTML"] = ({
  getHeadComponents,
  replaceHeadComponents,
}) => {
  if (process.env.NODE_ENV !== "production") return;
  const headComponents = getHeadComponents().map((component) => {
    const el = component as React.ReactElement<Record<string, unknown>>;
    if (el?.type !== "style" || typeof el.props?.["data-href"] !== "string") return component;
    return (
      <link
        key={el.key ?? (el.props["data-href"] as string)}
        rel="stylesheet"
        href={el.props["data-href"] as string}
      />
    );
  });
  replaceHeadComponents(headComponents);
};

export const onRenderBody: GatsbySSR["onRenderBody"] = ({
  pathname,
  setHtmlAttributes,
  setPreBodyComponents,
}) => {
  // 多言語ページ(/en/... 等)は URL の言語を <html lang> にする(plan/28)
  setHtmlAttributes({ lang: HTML_LANG[stripLangPrefix(pathname).lang] });
  // ライトモード設定 (localStorage) を初回描画前に <html> へ反映する (FOUC 対策)。
  // useTheme フックの STORAGE_KEY/クラス名と一致させること。
  setPreBodyComponents([
    <script
      key="theme-init"
      dangerouslySetInnerHTML={{
        __html: `(function(){try{if(localStorage.getItem("reol-theme")==="light"){document.documentElement.classList.add("light");}}catch(e){}})();`,
      }}
    />,
  ]);
};
