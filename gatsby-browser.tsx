import "@fontsource/noto-sans-jp";
import "@fontsource/cormorant";
import "@fontsource/klee-one";
import "@fontsource/niconne";
import "./src/styles/global.scss";
import "./src/i18n/config";
import React from "react";
import Body from "./src/components/modules/body";
import { GatsbyBrowser } from "gatsby";
import { store } from "./src/redux/store";
import { Provider } from "react-redux";

// iOS環境でbodyにクラスを追加
export const onClientEntry: GatsbyBrowser["onClientEntry"] = () => {
  if (typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.documentElement.classList.add('is-ios');
    document.body.classList.add('is-ios');
  }
};

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({
  element,
}) => {
  return (
    <Provider store={store}>
      <Body>{element}</Body>
    </Provider>
  );
};

// MainVideo と TopHeader は Body 内で wrapRootElement に載っているため
// wrapPageElement では何も追加せずそのまま返す。
export const wrapPageElement: GatsbyBrowser["wrapPageElement"] = ({
  element,
}) => element;

