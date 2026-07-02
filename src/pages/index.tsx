import React, { FC } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import IndexContents from "../components/index/contents";
import SEO from '../components/SEO'
import { buildWebSite } from "../utils/jsonLd";
import { Recommend } from "../types/recommend";

type siteMetadata = {
  title: string;
  description: string;
  siteUrl: string;
};

export const query = graphql`
  query IndexPage {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    recommend {
      recommend {
        no
        id
      }
    }
  }
`;

const IndexPage: FC<PageProps<any>> = ({ data }) => {
  const recommend: Recommend[] = data.recommend.recommend;

  return (
    <>
      <main className="relative bg-transparent mx-auto inset-auto w-screen">
        <IndexContents
          recommend={recommend}
        />
      </main>
      {/* フッター(公式リンク・運営情報)は Body 共通の OfficialFooter に統合 */}
    </>
  );
};

export default IndexPage;

export const Head: HeadFC<any> = ({ data }) => {
  const siteMetadata: siteMetadata = data.site.siteMetadata;
  // ?section=place などのクエリがあればセクション別タイトル/OGに反映
  // Gatsby v5 の Head の location は pathname しか持たないため、ブラウザ側で
  // 取得できる場合のみ参照する
  const search =
    typeof window !== "undefined" && typeof window.location?.search === "string"
      ? window.location.search
      : "";
  const section = (() => {
    const m = search.match(/[?&]section=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : undefined;
  })();
  return (
    <SEO
      description={siteMetadata.description}
      path="/"
      section={section}
      jsonLd={buildWebSite()}
    />
  );
};
