// フォントは全ページ共通CSSに入れない(以前は @fontsource の4書体が base64 で全HTMLに
// 約590KB埋め込まれていた)。本文はシステムフォント、ロゴの Cormorant は
// gatsby-plugin-webfonts でセルフホスト、Klee One は bbq2025 のページ側で読み込む。
import "./src/styles/global.scss";
import "./src/i18n/config";
import React from "react";
import Body from "./src/components/modules/body";
import { GatsbyBrowser } from "gatsby";
import { store } from "./src/redux/store";
import { Provider } from "react-redux";
import { AuthProvider } from "./src/contexts/AuthContext";
import { SiteLangProvider } from "./src/i18n/site/SiteLangContext";
import { isSiteLang, DEFAULT_LANG } from "./src/i18n/site/langs";

// iOS環境でbodyにクラスを追加
export const onClientEntry: GatsbyBrowser["onClientEntry"] = () => {
  if (typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.documentElement.classList.add('is-ios');
    document.body.classList.add('is-ios');
  }
};

// gatsby-plugin-offline(Service Worker)が新しい版を検出したら即座に再読み込みする。
// これが無いと、デプロイ後も古いHTML/JSで動き続けるタブが残る(サーバー側の変更と
// 食い違った古いクライアントからの書き込みが失敗し続ける)。
export const onServiceWorkerUpdateReady: GatsbyBrowser["onServiceWorkerUpdateReady"] = () => {
  window.location.reload();
};

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({
  element,
  pathname,
}) => {
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
export const wrapPageElement: GatsbyBrowser["wrapPageElement"] = ({
  element,
  props,
}) => {
  const lang = (props.pageContext as { lang?: unknown })?.lang;
  return (
    <SiteLangProvider lang={isSiteLang(lang) ? lang : DEFAULT_LANG}>{element}</SiteLangProvider>
  );
};

