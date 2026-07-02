export type SourceDiscography = {
  discographyUuid: string;
  slug?: string;
  title: string;
  releaseDate?: string;
  name?: string;
  format?: string;
  siteUrl?: string | null;
  songs?: SourceSong[];
};

export type SourceSongFeature = {
  spotifyTrackId?: string | null;
  songName?: string | null;
  tempo?: number | string | null;
  durationMs?: number | string | null;
  energy?: number | string | null;
  danceability?: number | string | null;
  loudness?: number | string | null;
  valence?: number | string | null;
  acousticness?: number | string | null;
  instrumentalness?: number | string | null;
  liveness?: number | string | null;
  key?: number | string | null;
  mode?: number | string | null;
  timeSignature?: number | string | null;
};

export type SourceSong = {
  songUuid: string;
  slug?: string;
  discographyUuid: string;
  discographyTitle?: string;
  songNo?: number;
  songName: string;
  spotifyTrackId?: string | null;
  lyricMember?: string | null;
  musicMember?: string | null;
  produceMember?: string | null;
  feature?: SourceSongFeature | null;
};

export type SourceLive = {
  liveUuid: string;
  slug?: string;
  type?: string | null;
  title: string;
  name?: string | null;
  date?: string | null;
  siteUrl?: string | null;
  spotifyPlaylistId?: string | null;
  items?: SourceLiveItem[];
};

export type SourceLiveItem = {
  liveItemUuid: string;
  slug?: string;
  liveUuid: string;
  liveItemName?: string | null;
  date?: string | null;
  place?: string | null;
  placeSite?: string | null;
  address?: string | null;
  googleMapsUrl?: string | null;
  spotifyPlaylistId?: string | null;
  setList?: SourceSetlistSong[];
};

export type SourceSetlistSongType =
  | "song"
  | "inst"
  | "cover"
  | "medley"
  | "segment"
  | "live_only";

export type SourceSetlistSong = {
  liveItemSongUuid: string;
  liveItemUuid: string;
  liveItemSongName: string;
  type?: SourceSetlistSongType | null;
  songUuid?: string | null;
  matchSource?: string | null;
};
