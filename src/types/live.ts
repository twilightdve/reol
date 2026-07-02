type Merge<T> = {
  [K in keyof T]: T[K];
};

export type Live = {
  liveUuid: string;
  slug: string;
  type: string;
  title: string;
  name: string;
  date: string;
  siteUrl: string | null;
  spotifyPlaylistId: string | null;
  imageUrl?: string | null;
  themeColorPrimary?: string | null;
  themeColorSecondary?: string | null;
};

export type LivePost = {
  livePostUuid: string;
  liveUuid: string;
  livePostId: string;
  livePostHTML: string;
};

export type LiveItem = {
  liveItemUuid: string;
  slug: string;
  liveUuid: string;
  liveItemName: string | null;
  date: string;
  place: string | null;
  placeSite: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  spotifyPlaylistId: string | null;
};

export type LiveItemSongType =
  | "song"
  | "inst"
  | "cover"
  | "medley"
  | "segment"
  | "live_only";

export type LiveItemSong = {
  liveItemSongUuid: string;
  liveItemUuid: string;
  liveItemSongName: string;
  type?: LiveItemSongType | null;
  /** songMatcher で解決された Discography 上の楽曲 UUID。未解決時は null */
  songUuid?: string | null;
  /** 解決経路 (sheet / exact / alias / stripped / normalized / stripped+normalized / none) */
  matchSource?: string | null;
};

export type LiveItemPost = {
  liveItemPostUuid: string;
  liveItemUuid: string;
  liveItemPostId: string;
  liveItemPostHTML: string;
};

export type LiveReport = {
  liveReportUuid: string;
  liveUuid: string;
  liveReportName: string;
  liveReportUrl: string;
};

export type MergedLive = Merge<
  Live & {
    reports: LiveReport[];
    posts: LivePost[];
  }
>;

export type MergedLiveItem = Merge<
  LiveItem & {
    setList: LiveItemSong[];
    posts: LiveItemPost[];
  }
>;

export type LiveInfo = Merge<
  MergedLive & {
    items: MergedLiveItem[];
  }
>;
