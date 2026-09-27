import React, { FC, useEffect } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import { useDispatch } from "react-redux";
import SEO from "../../components/SEO";
import { buildBreadcrumbList } from "../../utils/jsonLd";
import BackToTopButton from "../../components/common/BackToTopButton";
import { PhotosSection } from "../../components/index/sections";
import { AppDispatch } from "../../redux/store";
import { setRoute } from "../../redux/slices/routeSlice";
import { ROUTE_NAMES } from "../../types/common";
import { DEFAULT_LANG, isSiteLang } from "../../i18n/site/langs";
import { getDict } from "../../i18n/site/dict";
import { pageDictFor } from "../../i18n/site/SiteLangContext";
import { photosDict } from "../../i18n/site/pages/photos";
import { localizePath } from "../../utils/i18nRoutes";

type PhotosPageData = {
  site: { siteMetadata: { title: string; description: string; siteUrl: string } };
};

const PhotosPage: FC<PageProps<PhotosPageData>> = ({ data }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(setRoute({ currentRoute: ROUTE_NAMES[4] }));
  }, [dispatch]);

  return (
    <>
      <main className="relative container mx-auto px-2 w-full">
        <PhotosSection />
      </main>
      <BackToTopButton />
    </>
  );
};

export default PhotosPage;

export const query = graphql`
  query PhotosPageQuery {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
  }
`;

export const Head: HeadFC<PhotosPageData, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  return (
    <SEO
      title="PHOTOGRAPHY"
      description={pageDictFor(photosDict, lang).metaDescription}
      path="/photos/"
      lang={lang}
      jsonLd={buildBreadcrumbList([
        { name: getDict(lang).site.breadcrumbHome, path: localizePath("/", lang) },
        { name: "PHOTOGRAPHY", path: localizePath("/photos/", lang) },
      ])}
    />
  );
};
