import React from "react";
import type { FC, ReactNode } from "react";
import PropTypes from "prop-types";
import { StaticQuery, graphql } from "gatsby";

import { GoLinkExternal } from "react-icons/go";
// import "./layout.css";

type Props = {
  children: ReactNode;
};

const Layout: FC<Props> = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={(data) => {
      console.log(data);
      return (
        <>
          <header className="bg-zinc-900">
            <h1 className="text-xs hidden">{data.site.siteMetadata.title}</h1>
          </header>
          <main className="relative container bg-white text-black mx-auto inset-auto w-screen">
            {children}
            <footer className="relative bg-zinc-900 text-white py-3">
              <ul className="flex justify-around py-3">
                <li>
                  <a href="/articles">articles</a>
                </li>
                <li>
                  <a href="/contents">contents</a>
                </li>
                <li>
                  <a
                    href="https://twitter.com/twilightplc"
                    target="_blank"
                    className="flex justify-between items-center"
                  >
                    Twitter
                    <GoLinkExternal className="ml-1" />
                  </a>
                </li>
              </ul>
              <div className="text-center py-3">
                <p className="p-creative-commons">© 2022 TWILIGHTEA.</p>
              </div>
            </footer>
          </main>
        </>
      );
    }}
  />
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
