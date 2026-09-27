import React, { FC, useEffect } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import { useDispatch } from "react-redux";
import SEO from "../../components/SEO";
import { buildBreadcrumbList } from "../../utils/jsonLd";
import BackToTopButton from "../../components/common/BackToTopButton";
import { PlaceSection } from "../../components/index/sections";
import { Place } from "../../types/places";
import { AppDispatch } from "../../redux/store";
import { setRoute } from "../../redux/slices/routeSlice";
import { ROUTE_NAMES } from "../../types/common";
import { useDeepLinkScroll } from "../../hooks/useDeepLinkScroll";
import { DEFAULT_LANG, isSiteLang } from "../../i18n/site/langs";
import { getDict } from "../../i18n/site/dict";
import { pageDictFor } from "../../i18n/site/SiteLangContext";
import { placeDict } from "../../i18n/site/pages/place";
import { localizePath } from "../../utils/i18nRoutes";

type PlacePageData = {
  site: { siteMetadata: { title: string; description: string; siteUrl: string } };
  place: { places: Place[] };
};

const PlacePage: FC<PageProps<PlacePageData>> = ({ data }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(setRoute({ currentRoute: ROUTE_NAMES[3] }));
  }, [dispatch]);

  useDeepLinkScroll();

  const places = data.place.places;

  return (
    <>
      <main className="relative container mx-auto px-2 w-full">
        <PlaceSection places={places} />
      </main>
      <BackToTopButton />
    </>
  );
};

export default PlacePage;

export const query = graphql`
  query PlacePageQuery {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    place {
      places {
        placeUuid
        slug
        type
        title
        url
        zoom
        items {
          placeItemUuid
          slug
          placeUuid
          name
          memo
          needsCost
          needsPermission
          placeUrl
          address
          mapsUrl
          mapsEmbedUrl
          lat
          lng
          zoom
        }
      }
    }
  }
`;

export const Head: HeadFC<PlacePageData, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = pageDictFor(placeDict, lang);
  return (
    <SEO
      title={t.title}
      description={t.metaDescription}
      path="/place/"
      lang={lang}
      jsonLd={buildBreadcrumbList([
        { name: getDict(lang).site.breadcrumbHome, path: localizePath("/", lang) },
        { name: t.title, path: localizePath("/place/", lang) },
      ])}
    />
  );
};
