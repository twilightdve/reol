import React, { FC, useContext } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import type { IndexPageQuery } from "../gatsby-types";
import queryString from "query-string";
import IndexPageContent from "../components/index-page-content";

export const query = graphql`
  query IndexPage {
    allVideoArchive {
      nodes {
        list
      }
    }
    allChannelArchive {
      nodes {
        list
      }
    }
  }
`;

const IndexPage: FC<PageProps<IndexPageQuery>> = ({ data }) => {
  console.log("IndexPage");
  return (
    <>
      <IndexPageContent
        videoArchiveNames={data.allVideoArchive.nodes[0].list}
        channelArchiveNames={data.allChannelArchive.nodes[0].list}
        queries={queryString.parse(location.search)}
      />
    </>
  );
};

export default IndexPage;

export const Head: HeadFC = () => {
  return (
    <>
      <title>Hololive オリ曲ランキング</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </>
  );
};
