import { Channel, MasterVideo, Video } from "../types/youtube-data";

const fetchJson = async (path: string) =>
  (await fetch(`/static/data${path}`)).json();

export const fetchMasterVideos = (): Promise<MasterVideo[]> => {
  console.log("fetchMasterVideos");
  return fetchJson(`/master/videos.json`);
};

export const fetchVideos = (dateStr: string): Promise<Video[]> => {
  console.log("fetchVideos");
  return fetchJson(`/archive/videos/${dateStr}.json`);
};

export const fetchChannels = (
  dateStr: string
): Promise<{
  [p: string]: Channel;
}> => {
  console.log("fetchChannels");
  return fetchJson(`/archive/channels/${dateStr}.json`);
};
