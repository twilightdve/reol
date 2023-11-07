type Merge<T> = {
  [K in keyof T]: T[K];
};

export type Live = {
  liveId: number;
  type: string;
  title: string;
  name: string;
  date: string;
  siteUrl: string | null;
};

export type LivePost = {
  liveId: number;
  livePostNo: number;
  livePostId: string;
  livePostHTML: string;
};

export type LiveItem = {
  liveId: number;
  liveItemNo: number;
  liveItemName: string | null;
  date: string;
  place: string | null;
  placeSite: string | null;
  address: string | null;
  googleMapsUrl: string | null;
};

export type LiveItemSong = {
  liveId: number;
  liveItemNo: number;
  liveItemSongNo: number;
  liveItemSongName: string;
};

export type LiveItemPost = {
  liveId: number;
  liveItemNo: number;
  liveItemPostNo: number;
  liveItemPostId: string;
  liveItemPostHTML: string;
};

export type LiveReport = {
  liveId: number;
  liveReportNo: number;
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
