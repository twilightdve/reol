type Merge<T> = {
  [K in keyof T]: T[K];
};

export type Discography = {
  discographyUuid: string;
  slug: string;
  title: string;
  releaseDate?: string;
  name?: string;
  format?: string;
  siteUrl?: string;
  xfdUrl?: string | null;
  artworkUrl?: string | null;
  themeColorPrimary?: string | null;
  themeColorSecondary?: string | null;
};

export type DiscographyRepo = {
  discographyRepoUuid: string;
  discographyUuid: string;
  discographyReportName: string;
  discographyReportUrl: string;
};

export type DiscographyPost = {
  discographyPostUuid: string;
  discographyUuid: string;
  discographyPostId: string;
  discographyPostHTML: string;
};

export type Song = {
  songUuid: string;
  slug: string;
  discographyUuid: string;
  discographyTitle: string;
  songNo: number;
  songName: string;
  tieupDescription: string;
  downloadUrl?: string | null;
  musicVideoUrl?: string | null;
  lyricVideoUrl?: string | null;
  liveVideoUrl?: string | null;
  lyricUrl?: string | null;
  spotifyTrackId?: string | null;
  lyricMember?: string | null;
  musicMember?: string | null;
  produceMember?: string | null;
  etcMember?: string | null;
  feature?: SongFeature | null;
};

export type SongFeature = {
  spotifyTrackId?: string | null;
  songName: string;
  popularity: number;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  durationMs: number;
  timeSignature: number;
};

export type DiscographyWithSongs = Merge<
  Discography & {
    reports?: DiscographyRepo[];
    posts: DiscographyPost[];
    songs: Song[];
  }
>;
