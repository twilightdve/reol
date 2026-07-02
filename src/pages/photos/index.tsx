import React, { FC, useEffect } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import { useDispatch } from "react-redux";
import SEO from "../../components/SEO";
import TrackingFooter from "../../components/modules/trackingFooter";
import BackToTopButton from "../../components/common/BackToTopButton";
import { PhotosSection } from "../../components/index/sections";
import { AppDispatch } from "../../redux/store";
import { setRoute } from "../../redux/slices/routeSlice";
import { ROUTE_NAMES } from "../../types/common";

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
      <TrackingFooter />
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

export const Head: HeadFC<PhotosPageData> = () => (
  <SEO
    title="PHOTOGRAPHY"
    description="Reol 関連のライヴや聖地巡礼で撮影した写真・動画を掲載しています。"
    path="/photos/"
  />
);
