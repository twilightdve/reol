/**
 * Creator relationship graph data model.
 *
 * Source data: `static/data/relations.json` (curated from MusicBrainz).
 * Top-level artists (Reol, Giga) contain releases → recordings → tracks → relations.
 */

export type RawRelationsArtist = {
  name: string;
  releases: RawRelease[];
};

export type RawRelease = {
  title: string;
  disambiguation: string;
  date: string;
  recordings: RawRecording[];
};

export type RawRecording = {
  position: number;
  format: string;
  title: string;
  tracks: RawTrack[];
};

export type RawTrack = {
  id: string;
  position: number;
  title: string;
  relations: RawRelation[];
};

export type RawRelation = {
  type: string;
  targetCredit?: string;
  targetType?: string;
  artist?: {
    id: string;
    disambiguation?: string;
    name: string;
    type?: string;
  };
};

export type CGraphNodeKind =
  | "artist"
  | "song"
  | "release"
  | "tieup"
  | "category";

export type AudioFeatures = {
  tempo?: number;
  energy?: number;
  danceability?: number;
  valence?: number;
  key?: number;
  mode?: number;
  popularity?: number | string;
  durationMs?: number;
  spotifyTrackId?: string;
};

export type CGraphNode = {
  /** Unique id: `artist:<name>` / `song:<discographyUuid>:<songUuid>` / `release:<discographyUuid>` / `tieup:<key>` */
  id: string;
  kind: CGraphNodeKind;
  name: string;
  /** Earliest known year for the song / release node (yyyy). */
  year?: number;
  /** Top-level owner artist for a song node (e.g. "Reol"). */
  primaryArtist?: string;
  /** Degree (computed). */
  degree?: number;
  /** Song / release nodes only. Used for deep-linking back to the discography section. */
  discographyUuid?: string;
  discographySlug?: string;
  songUuid?: string;
  /** Song nodes: Spotify audio features when available. */
  audioFeatures?: AudioFeatures;
  /** Tieup nodes: raw description for tooltip / link. */
  tieupRaw?: string;
  /** Artist nodes: Reol との共演曲数 (Reol 本人は全 Reol 曲数)。サイズ計算に使う。 */
  reolCoCount?: number;
  /** Artist nodes: 最も多く担当している role (vocal / music / lyrics / ...)。色付けに使う。 */
  dominantRole?: string;
  /** Artist nodes: Reol からの BFS hop 距離 (Reol=0, 直接共演=1, ...)。未到達は undefined。 */
  reolDistance?: number;
};

export type CGraphLink = {
  source: string;
  target: string;
  /** e.g. vocal, arranger, producer, mix, instrument, ... */
  role: string;
  /** 共演曲数 (このペアが同じ楽曲にクレジットされた回数)。リンクの太さに使う。 */
  weight?: number;
};

/** Per-artist aggregated detail surfaced in the inspector when the graph
 *  itself is rendered with artist nodes only. */
export type CGraphArtistSongRef = {
  /** discography song uuid when known. */
  discographyUuid?: string;
  songUuid?: string;
  name: string;
  year?: number;
  /** Roles this artist played on the song (e.g. lyrics, music, vocal). */
  roles: string[];
  /** Other artists credited on the same song (excluding self). */
  coArtists: string[];
};

export type CGraphArtistReleaseRef = {
  discographyUuid: string;
  title: string;
  year?: number;
  category?: string;
};

export type CGraphArtistTieupRef = {
  /** Tieup label (normalized title). */
  label: string;
  /** Raw `tieupDescription` for tooltip / external link. */
  raw?: string;
  /** Song title this tieup is attached to. */
  songName: string;
};

export type CGraphArtistDetail = {
  songs: CGraphArtistSongRef[];
  releases: CGraphArtistReleaseRef[];
  tieups: CGraphArtistTieupRef[];
  /** Reol と共演した楽曲数。Reol 自身については全 Reol 楽曲数。 */
  reolCoCount?: number;
  /** Reol との初共演年 (該当 song の最小 year)。 */
  reolFirstYear?: number;
  /** Reol との最新共演年 (該当 song の最大 year)。 */
  reolLastYear?: number;
  /** このアーティストが参加した楽曲全体での role 別曲数。 */
  roleBreakdown?: Record<string, number>;
  /** タイアップ曲数 (関連タイアップに紐付く楽曲のユニーク数)。 */
  tieupSongCount?: number;
};

export type CGraphData = {
  nodes: CGraphNode[];
  links: CGraphLink[];
  /** Keyed by artist node id (`artist:<canonical name>`). Optional so the
   *  type stays backwards compatible with consumers that don't need it. */
  artistDetails?: Record<string, CGraphArtistDetail>;
};
