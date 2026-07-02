import React, { FC } from "react";
import type { HeadFC, PageProps } from "gatsby";
import CGraphPage from "../features/cgraph/CGraphPage";
import SEO from "../components/SEO";

const Page: FC<PageProps> = () => <CGraphPage />;

export default Page;

export const Head: HeadFC = () => (
  <>
    <SEO
      title="相関図(Creator Relations)"
      description="Reol楽曲に関わるクリエイター同士のつながりを相関図で可視化します。"
      path="/cgraph/"
    />
    <meta name="robots" content="noindex" />
  </>
);
