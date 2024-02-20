import type { GatsbyNode, SourceNodesArgs } from "gatsby";
import { promises as fs } from "fs";
import { SheetService } from "./src/services/SpreadsheetService";
import { DiscographyWithSongs } from "./src/types/discography";
import {
  Live,
  LiveItem,
  LiveInfo,
  LiveItemSong,
  LiveReport,
  LiveItemPost,
  LivePost,
} from "./src/types/live";
import { Recommend } from "./src/types/recommend";
import { Place, PlaceItem } from "./src/types/places";

const createVideoNodes = async (
  sheet: SheetService,
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;

  const list = await sheet.getMusicVideos();
  createNode({
    id: createNodeId("MusicVideos"),
    list,
    internal: {
      type: "MusicVideos",
      content: JSON.stringify(list),
      contentDigest: createContentDigest(list),
    },
  });
  await fs.mkdir("./public/static/data/", { recursive: true });
  await fs.writeFile(
    `./public/static/data/mv.json`,
    JSON.stringify(list, null, 2)
  );
};

const createDiscographyNodes = async (
  sheet: SheetService,
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;

  const discography = await sheet.getDiscography();
  const posts = await sheet.getDiscographyPosts();
  const songs = await sheet.getSongs();
  const discographyWithSongs: DiscographyWithSongs[] = discography
    .map((item) => {
      return {
        ...item,
        posts: posts
          .filter((song) => item.discographyId === song.discographyId)
          .sort((a, b) => a.discographyPostNo - b.discographyPostNo),
        songs: songs
          .filter((song) => item.discographyId === song.discographyId)
          .sort((a, b) => a.songNo - b.songNo),
      };
    })
    .sort((a, b) => b.discographyId - a.discographyId);

  createNode({
    id: createNodeId("Discography"),
    discographyWithSongs,
    internal: {
      type: "Discography",
      content: JSON.stringify(discographyWithSongs),
      contentDigest: createContentDigest(discographyWithSongs),
    },
  });
  await fs.mkdir("./public/static/data/", { recursive: true });
  await fs.writeFile(
    `./public/static/data/discography.json`,
    JSON.stringify(discographyWithSongs, null, 2)
  );
};

const createNewsNodes = async (
  sheet: SheetService,
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;

  const news = await sheet.getNews();

  createNode({
    id: createNodeId("News"),
    news,
    internal: {
      type: "News",
      content: JSON.stringify(news),
      contentDigest: createContentDigest(news),
    },
  });
  await fs.mkdir("./public/static/data/", { recursive: true });
  await fs.writeFile(
    `./public/static/data/news.json`,
    JSON.stringify(news, null, 2)
  );
};

const createLiveNodes = async (
  sheet: SheetService,
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;

  const live: Live[] = await sheet.getLives();
  const liveItems: LiveItem[] = await sheet.getLiveItems();
  const livePosts: LivePost[] = await sheet.getLivePosts();
  const liveItemSongs: LiveItemSong[] = await sheet.getLiveItemSongs();
  const liveItemPosts: LiveItemPost[] = await sheet.getLiveItemPosts();
  const liveReports: LiveReport[] = await sheet.getLiveReports();
  const liveInfos: LiveInfo[] = live
    .map((item) => {
      return {
        ...item,
        posts: livePosts
          .filter((post) => item.liveId === post.liveId)
          .sort((a, b) => (a.livePostNo ?? 0) - (b.livePostNo ?? 0)),
        items: liveItems
          .map((liveItem) => {
            return {
              ...liveItem,
              setList: liveItemSongs
                .filter(
                  (song) =>
                    liveItem.liveId === song.liveId &&
                    liveItem.liveItemNo === song.liveItemNo
                )
                .sort(
                  (a, b) => (a.liveItemSongNo ?? 0) - (b.liveItemSongNo ?? 0)
                ),
              posts: liveItemPosts
                .filter(
                  (post) =>
                    liveItem.liveId === post.liveId &&
                    liveItem.liveItemNo === post.liveItemNo
                )
                .sort(
                  (a, b) => (a.liveItemPostNo ?? 0) - (b.liveItemPostNo ?? 0)
                ),
            };
          })
          .filter((liveItem) => item.liveId === liveItem.liveId)
          .sort((a, b) => a.liveItemNo - b.liveItemNo),
        reports: liveReports.filter((report) => item.liveId === report.liveId),
      };
    })
    .sort((a, b) => b.liveId - a.liveId);

  createNode({
    id: createNodeId("Live"),
    liveInfos,
    internal: {
      type: "Live",
      content: JSON.stringify(liveInfos),
      contentDigest: createContentDigest(liveInfos),
    },
  });
  await fs.mkdir("./public/static/data/", { recursive: true });
  await fs.writeFile(
    `./public/static/data/live.json`,
    JSON.stringify(liveInfos, null, 2)
  );
};

const createRecommendNodes = async (
  sheet: SheetService,
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;
  const recommend: Recommend[] = await sheet.getRecommends();
  createNode({
    id: createNodeId("Recommend"),
    recommend,
    internal: {
      type: "Recommend",
      content: JSON.stringify(recommend),
      contentDigest: createContentDigest(recommend),
    },
  });
  await fs.mkdir("./public/static/data/", { recursive: true });
  await fs.writeFile(
    `./public/static/data/recommend.json`,
    JSON.stringify(recommend, null, 2)
  );
};

const createPlaceNodes = async (
  sheet: SheetService,
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;
  const placeItems: PlaceItem[] = await sheet.getPlaceItems();
  const places: Place[] = (await sheet.getPlaces())
    .map((place) => ({
      ...place,
      items: placeItems.filter((item) => item.placeId === place.placeId),
    }))
    .sort((a, b) => b.placeId - a.placeId);

  createNode({
    id: createNodeId("Place"),
    places,
    internal: {
      type: "Place",
      content: JSON.stringify(places),
      contentDigest: createContentDigest(places),
    },
  });
  await fs.mkdir("./public/static/data/", { recursive: true });
  await fs.writeFile(
    `./public/static/data/places.json`,
    JSON.stringify(places, null, 2)
  );
};

export const sourceNodes: GatsbyNode["sourceNodes"] = async (args) => {
  try {
    const sheet = new SheetService();
    await createVideoNodes(sheet, args);
    await createDiscographyNodes(sheet, args);
    await createNewsNodes(sheet, args);
    await createLiveNodes(sheet, args);
    await createRecommendNodes(sheet, args);
    await createPlaceNodes(sheet, args);
  } catch (error) {}
};
