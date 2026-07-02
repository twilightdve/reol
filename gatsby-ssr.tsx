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

export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: "ja" });
};
