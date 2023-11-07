import { discovery_v1 } from "googleapis";

type Merge<T> = {
  [K in keyof T]: T[K];
};

export type Discography = {
  discographyId: number;
  title: string;
  releaseDate?: string;
  name?: string;
  format?: string;
  siteUrl?: string;
  xfdUrl?: string | null;
};

export type DiscographyPost = {
  discographyId: number;
  discographyPostNo: number;
  discographyPostId: string;
  discographyPostHTML: string;
};

export type Song = {
  songId: number;
  discographyId: number;
  discographyTitle: string;
  songNo: number;
  songName: string;
  tieupDescription: string;
  downloadUrl?: string | null;
  musicVideoUrl?: string | null;
  lyricVideoUrl?: string | null;
  liveVideoUrl?: string | null;
};

export type DiscographyWithSongs = Merge<
  Discography & {
    posts: DiscographyPost[];
    songs: Song[];
  }
>;
