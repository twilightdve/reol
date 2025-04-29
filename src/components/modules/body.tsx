import React from "react";
import type { FC, ReactNode } from "react";
import { graphql, useStaticQuery } from "gatsby";
import Layout from "./layout";

type Props = {
  children: ReactNode;
};

const Body: FC<Props> = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitle {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);
  return <Layout title={data.site.siteMetadata.title} children={children} />;
};

export default Body;
