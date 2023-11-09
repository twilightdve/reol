import "@fontsource/noto-serif-jp";
import "@fontsource/cormorant";
import "./src/styles/global.css";
import React from "react";
import Body from "./src/components/modules/body";
import { GatsbyBrowser } from "gatsby";
import { store } from "./src/redux/store";
import { Provider } from "react-redux";

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({
  element,
}) => {
  return (
    <Provider store={store}>
      <Body>{element}</Body>
    </Provider>
  );
};
