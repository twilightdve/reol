import React, { FC } from "react";
import type { HeadFC, PageProps } from "gatsby";
import CGraphPage from "../features/cgraph/CGraphPage";
import SEO from "../components/SEO";
import { pageDictFor } from "../i18n/site/SiteLangContext";
import { cgraphDict } from "../i18n/site/pages/cgraph";
import { DEFAULT_LANG, isSiteLang } from "../i18n/site/langs";

const Page: FC<PageProps> = () => <CGraphPage />;

export default Page;

export const Head: HeadFC<object, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = pageDictFor(cgraphDict, lang);
  return (
    <>
      <SEO title={t.title} description={t.metaDescription} path="/cgraph/" lang={lang} />
      <meta name="robots" content="noindex" />
    </>
  );
};
