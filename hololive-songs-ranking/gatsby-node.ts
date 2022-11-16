import type { GatsbyNode, SourceNodesArgs } from "gatsby";
import { promises as fs } from "fs";
import { Index, SheetService } from "./src/services/SpreadsheetService";
import { Channel, MasterVideo, Video } from "./src/types/youtube-data";

const createVideoNodes = async (
  sheet: SheetService,
  indexes: Index[],
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;

  let videoInfoArchives: { [p: string]: { [p: string]: Video } } = {};
  await Promise.all(
    indexes
      .filter(({ name }) => name.startsWith("videos/"))
      .map(async ({ name }) => {
        videoInfoArchives[name] = await sheet.getSheetVideos(name);
        return videoInfoArchives[name];
      })
  );
  const list = Object.entries(videoInfoArchives).map(
    ([sheetName]) => sheetName
  );
  createNode({
    id: createNodeId("VideoAchive"),
    list,
    internal: {
      type: "VideoArchive",
      content: JSON.stringify(list),
      contentDigest: createContentDigest(list),
    },
  });
  await fs.mkdir("./public/static/data/archive/videos", { recursive: true });
  Object.entries(videoInfoArchives).map(async ([sheetName, archive]) => {
    await fs.writeFile(
      `./public/static/data/archive/${sheetName}.json`,
      JSON.stringify(
        Object.entries(archive).map(([videoId, video]) => video),
        null,
        2
      )
    );
  });
};

const createChannelNodes = async (
  sheet: SheetService,
  indexes: Index[],
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;

  let channelInfoArchives: { [p: string]: { [p: string]: Channel } } = {};
  await Promise.all(
    indexes
      .filter(({ name }) => name.startsWith("channels/"))
      .map(async ({ name }) => {
        channelInfoArchives[name] = await sheet.getSheetChannels(name);
        return channelInfoArchives[name];
      })
  );
  const list = Object.entries(channelInfoArchives).map(
    ([sheetName]) => sheetName
  );
  createNode({
    id: createNodeId("ChannelArchive"),
    list,
    internal: {
      type: "ChannelArchive",
      content: JSON.stringify(list),
      contentDigest: createContentDigest(list),
    },
  });
  await fs.mkdir("./public/static/data/archive/channels", { recursive: true });
  Object.entries(channelInfoArchives).map(async ([sheetName, archive]) => {
    await fs.writeFile(
      `./public/static/data/archive/${sheetName}.json`,
      JSON.stringify(archive, null, 2)
    );
  });
};

const createMasterVideoNodes = async (
  sheet: SheetService,
  { actions, createNodeId, createContentDigest }: SourceNodesArgs
) => {
  const { createNode } = actions;

  const masterVideos = await sheet.getMasterVideos();
  await fs.mkdir("./public/static/data/master/", { recursive: true });
  await fs.writeFile(
    `./public/static/data/master/videos.json`,
    JSON.stringify(masterVideos, null, 2)
  );
  // masterVideos.map(async (master: MasterVideo) => {
  // createNode({
  //   id: createNodeId(`master/videos/${master.videoId}`),
  //   ...master,
  //   internal: {
  //     type: "MasterVideo",
  //     content: JSON.stringify(master),
  //     contentDigest: createContentDigest(master),
  //   },
  // });
  // });
};

export const sourceNodes: GatsbyNode["sourceNodes"] = async (args) => {
  try {
    const sheet = new SheetService();
    const indexes = await sheet.getSheetIndexes();
    const listChannels = await sheet.getRowValues("master/channels");

    await createVideoNodes(sheet, indexes, args);
    await createChannelNodes(sheet, indexes, args);
    await createMasterVideoNodes(sheet, args);
  } catch (error) {
    console.error("error" + error);
  }
};
