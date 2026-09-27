import React from "react";
import { GatsbySSR } from "gatsby";
import Body from "./src/components/modules/body";
import { store } from "./src/redux/store";
import { Provider } from "react-redux";
import { AuthProvider } from "./src/contexts/AuthContext";

export const wrapRootElement: GatsbySSR["wrapRootElement"] = ({ element }) => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Body>{element}</Body>
      </AuthProvider>
    </Provider>
  );
};

// MainVideo と TopHeader は Body 内で wrapRootElement に載っているため
// wrapPageElement では何も追加せずそのまま返す。
export const wrapPageElement: GatsbySSR["wrapPageElement"] = ({ element }) => element;

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
  setHtmlAttributes,
  setPreBodyComponents,
}) => {
  setHtmlAttributes({ lang: "ja" });
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
