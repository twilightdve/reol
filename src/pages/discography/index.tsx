import React, { FC, useEffect } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import { useDispatch } from "react-redux";
import SEO from "../../components/SEO";
import { buildBreadcrumbList, buildMusicAlbum, buildMusicAlbumItemList } from "../../utils/jsonLd";
import BackToTopButton from "../../components/common/BackToTopButton";
import { DiscographySection } from "../../components/index/sections";
import { DiscographyWithSongs } from "../../types/discography";
import { AppDispatch } from "../../redux/store";
import { setRoute } from "../../redux/slices/routeSlice";
import { ROUTE_NAMES } from "../../types/common";
import { useDeepLinkScroll } from "../../hooks/useDeepLinkScroll";
import { DEFAULT_LANG, isSiteLang } from "../../i18n/site/langs";
import { getDict } from "../../i18n/site/dict";
import { localizePath } from "../../utils/i18nRoutes";

type DiscographyPageData = {
  site: { siteMetadata: { title: string; description: string; siteUrl: string } };
  discography: { discographyWithSongs: DiscographyWithSongs[] };
};

const DiscographyPage: FC<PageProps<DiscographyPageData>> = ({ data }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(setRoute({ currentRoute: ROUTE_NAMES[1] }));
  }, [dispatch]);

  useDeepLinkScroll();

  const discographies = data.discography.discographyWithSongs;

  return (
    <>
      <main className="relative container mx-auto px-2 w-full">
        <DiscographySection discographies={discographies} />
      </main>
      <BackToTopButton />
    </>
  );
};

export default DiscographyPage;

export const query = graphql`
  query DiscographyPageQuery {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    discography {
      discographyWithSongs {
        discographyUuid
        slug
        title
        releaseDate
        name
        format
        siteUrl
        xfdUrl
        themeColorPrimary
        themeColorSecondary
        songs {
          songUuid
          slug
          discographyUuid
          discographyTitle
          songNo
          songName
          tieupDescription
          downloadUrl
          musicVideoUrl
          lyricVideoUrl
          liveVideoUrl
          lyricUrl
          spotifyTrackId
          lyricMember
          musicMember
          produceMember
          etcMember
          feature {
            spotifyTrackId
            songName
            popularity
            danceability
            energy
            key
            loudness
            mode
            speechiness
            acousticness
            instrumentalness
            liveness
            valence
            tempo
            durationMs
            timeSignature
          }
        }
        reports {
          discographyRepoUuid
          discographyUuid
          discographyReportName
          discographyReportUrl
        }
        posts {
          discographyPostUuid
          discographyUuid
          discographyPostId
          discographyPostHTML
        }
      }
    }
  }
`;

export const Head: HeadFC<DiscographyPageData, { lang?: string }> = ({ data, pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const dict = getDict(lang);
  // リリースごとの収録曲一覧をMusicAlbumとして構造化データ化する。「アルバムYの収録曲」に
  // 生成AIが直接答えられるようにするため。曲ページへのリンク解決は行わず曲名のみ扱う
  // (収録盤内の生データslugは代表曲ページのslugと一致しない場合があるため)。
  const albums = (data.discography.discographyWithSongs ?? []).map((disc) =>
    buildMusicAlbum({
      name: disc.title,
      datePublished: disc.releaseDate ?? null,
      url: `https://reol.twilightea.com/discography/#disc-${disc.slug}`,
      trackNames: (disc.songs ?? []).map((song) => song.songName),
    })
  );

  return (
    <SEO
      title="DISCOGRAPHY"
      description={dict.discography.metaDescription}
      path="/discography/"
      lang={lang}
      jsonLd={[
        buildBreadcrumbList([
          { name: dict.site.breadcrumbHome, path: localizePath("/", lang) },
          { name: "DISCOGRAPHY", path: localizePath("/discography/", lang) },
        ]),
        ...(albums.length > 0 ? [buildMusicAlbumItemList(albums)] : []),
      ]}
    />
  );
};
