import React from "react";
import { GatsbySSR } from "gatsby";
import Body from "./src/components/modules/body";
import { store } from "./src/redux/store";
import { Provider } from "react-redux";

export const wrapRootElement: GatsbySSR["wrapRootElement"] = ({ element }) => {
  return (
    <Provider store={store}>
      <Body>{element}</Body>
    </Provider>
  );
};

// MainVideo と TopHeader は Body 内で wrapRootElement に載っているため
// wrapPageElement では何も追加せずそのまま返す。
export const wrapPageElement: GatsbySSR["wrapPageElement"] = ({ element }) => element;

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
