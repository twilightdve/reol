export const defaultChannel = "UCJFZiqLMntJufDCHc6bQixg"; // hololive

export type Video = {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  start: number;
  end: number;
};

export type Channel = {
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
  viewCount: number;
  videoCount: number;
  subscriberCount: number;
  publishedAt: string;
};

export type Channels = {
  [p: string]: Channel;
};

export type MasterVideo = {
  videoId: string;
  start: number;
  end: number;
};
