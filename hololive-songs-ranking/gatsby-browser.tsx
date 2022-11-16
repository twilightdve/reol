import "@fontsource/work-sans";
import "./src/styles/global.css";
import React from "react";
import Layout from "./src/components/layout";
import { GatsbyBrowser } from "gatsby";
import { store } from "./src/redux/store";
import { Provider } from "react-redux";

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({
  element,
  props,
}) => {
  return (
    <Provider store={store}>
      {props ? (
        <Layout {...props}>{element}</Layout>
      ) : (
        <Layout>{element}</Layout>
      )}
    </Provider>
  );
};
