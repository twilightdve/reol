import type { Setlist, SetlistEntry, TrackKind, TrackMaster } from "../types/relive";

export type GeneratedTrackMaster = TrackMaster & {
  audioFeature?: {
    tempo?: number;
    energy?: number;
    danceability?: number;
    loudness?: number;
    valence?: number;
    acousticness?: number;
    instrumentalness?: number;
    liveness?: number;
    key?: number;
    mode?: number;
    timeSignature?: number;
  };
  source: {
    type: "fansite-discography-json";
    discographyUuid: string;
    songUuid: string;
    spotifyTrackId?: string | null;
  };
};

export type GeneratedTracksJson = {
  schemaVersion: 1;
  source: {
    type: "fansite-discography-json";
    path: string;
  };
  tracks: GeneratedTrackMaster[];
};

export type GeneratedVenueType =
  | "live_house"
  | "hall"
  | "arena"
  | "exhibition"
  | "outdoor_festival"
  | "virtual"
  | "unknown";

export type VenueCapacityKind =
  | "standing"
  | "seated"
  | "max"
  | "flexible_max"
  | "event_dependent";

export type VenueVerificationSourceType = "official" | "public_agency" | "secondary";

export type VenueVerificationSource = {
  title: string;
  url: string;
  sourceType: VenueVerificationSourceType;
  fields: Array<"name" | "type" | "siteUrl" | "address" | "capacity">;
  note?: string;
};

export type GeneratedVenue = {
  schemaVersion: 1;
  venueId: string;
  name: string;
  aliases: string[];
  type: GeneratedVenueType;
  typeGuessReason: string[];
  siteUrl?: string | null;
  address?: string | null;
  googleMapsUrl?: string | null;
  capacity: number | null;
  capacityStatus: "needs_web_verification" | "verified" | "unknown";
  capacityKind?: VenueCapacityKind | null;
  seatedCapacity?: number | null;
  capacityRange?: { min: number; max: number } | null;
  verifiedAt?: string | null;
  verificationSources?: VenueVerificationSource[];
  verificationNotes?: string[];
  sourceLiveUuids: string[];
  sourceSetlistIds: string[];
};

export type LayoutVerificationStatus =
  | "verified"
  | "partially_verified"
  | "estimated"
  | "needs_verification"
  | "unknown";

export type AudienceMode =
  | "standing"
  | "seated"
  | "mixed"
  | "festival"
  | "virtual"
  | "unknown";

export type LayoutShape =
  | "rectangle"
  | "trapezoid"
  | "fan"
  | "arena_bowl"
  | "outdoor_field"
  | "unknown";

export type LayoutPoint = {
  x: number;
  y?: number;
  z: number;
};

export type LayoutPolygon = {
  points: LayoutPoint[];
};

export type VenueLayoutZoneType =
  | "front"
  | "middle"
  | "rear"
  | "left"
  | "center"
  | "right"
  | "balcony"
  | "second_floor"
  | "reserved_seat"
  | "standing_area"
  | "pa_booth"
  | "aisle"
  | "pillar_obstruction"
  | "stage"
  | "sub_stage"
  | "unknown";

export type VenueLayoutZone = {
  zoneId: string;
  name: string;
  type: VenueLayoutZoneType;
  polygon?: LayoutPolygon;
  center?: LayoutPoint;
  listenerPreset?: {
    normalizedX: number;
    normalizedZ: number;
    y?: number;
  };
  acousticBias?: {
    bassBoostDb?: number;
    highDamping?: number;
    reverbAmountBias?: number;
    reflectionDelayBiasMs?: number;
    crowdDensityBias?: number;
  };
  notes?: string;
};

export type VenueLayoutSource = {
  sourceType:
    | "official_venue_page"
    | "official_event_page"
    | "ticketing_page"
    | "fan_manual"
    | "google_maps"
    | "unknown";
  title?: string;
  url?: string;
  checkedAt?: string;
  note?: string;
};

export type VenueLayoutMetadata = {
  schemaVersion: 1;
  venueId: string;
  venueName: string;
  aliases?: string[];
  layoutStatus: LayoutVerificationStatus;
  audienceMode: AudienceMode;
  layoutShape: LayoutShape;
  capacity?: {
    standing?: number | null;
    seated?: number | null;
    total?: number | null;
    status: LayoutVerificationStatus;
    sourceUrl?: string;
  };
  dimensions?: {
    widthM?: number | null;
    depthM?: number | null;
    heightM?: number | null;
    status: LayoutVerificationStatus;
  };
  floors?: {
    count?: number | null;
    hasBalcony?: boolean | null;
    hasSecondFloor?: boolean | null;
    status: LayoutVerificationStatus;
  };
  stage?: {
    position: "front" | "center" | "end_stage" | "unknown";
    widthM?: number | null;
    depthM?: number | null;
    heightM?: number | null;
    normalizedCenter?: { x: number; z: number };
    status: LayoutVerificationStatus;
  };
  audienceArea?: {
    shape: LayoutShape;
    polygon?: LayoutPolygon;
    status: LayoutVerificationStatus;
  };
  zones: VenueLayoutZone[];
  defaultListenerPresets: {
    presetId: string;
    name: string;
    normalizedX: number;
    normalizedZ: number;
    y?: number;
    zoneId?: string;
  }[];
  sourceUrls: VenueLayoutSource[];
  notes?: string;
  updatedAt: string;
};

export type VenueLayoutsJson = {
  schemaVersion: 1;
  generatedAt: string;
  source: {
    type: "generated-from-venues";
    venuesPath: string;
    overridePath?: string | null;
  };
  layouts: VenueLayoutMetadata[];
};

export type VenueLayoutOverride = Partial<Omit<VenueLayoutMetadata, "schemaVersion" | "venueId">> & {
  schemaVersion?: 1;
  venueId: string;
  additionalZones?: VenueLayoutZone[];
};

export type VenueLayoutOverridesJson = {
  schemaVersion: 1;
  updatedAt: string;
  layouts: VenueLayoutOverride[];
};

export type VenueLayoutCoverageJson = {
  schemaVersion: 1;
  generatedAt: string;
  counts: {
    venues: number;
    layouts: number;
    verified: number;
    partiallyVerified: number;
    estimated: number;
    needsVerification: number;
    unknown: number;
    withCapacity: number;
    withDimensions: number;
    withFloorStructure: number;
    withOfficialSite: number;
    withGoogleMaps: number;
    withOverrides: number;
    enrichmentTasks: number;
  };
};

export type GeneratedVenuesJson = {
  schemaVersion: 1;
  source: {
    type: "fansite-live-json";
    path: string;
  };
  venues: GeneratedVenue[];
};

export type GeneratedSetlistEntry = SetlistEntry & {
  rawTitle: string;
  normalizedTitle: string;
  match: {
    status: "matched" | "candidate" | "missing" | "special";
    score?: number;
    candidates?: string[];
    reason?: string;
  };
};

export type GeneratedSetlist = Omit<Setlist, "entries"> & {
  source: {
    type: "site_db";
    liveUuid: string;
    liveItemUuid: string;
    sourceId: string;
  };
  entries: GeneratedSetlistEntry[];
};

export type SetlistIndexItem = {
  setlistId: string;
  liveUuid: string;
  liveItemUuid: string;
  title: string;
  date?: string;
  venueName?: string;
  venueId?: string;
  type?: string | null;
  songCount: number;
  playablePolicySummary: {
    required: number;
    special: number;
    medley: number;
    cover: number;
    se: number;
    unknown: number;
  };
};

export type GeneratedSetlistsIndexJson = {
  schemaVersion: 1;
  source: {
    type: "fansite-live-json";
    path: string;
  };
  setlists: SetlistIndexItem[];
};

export type ImportReport = {
  schemaVersion: 1;
  generatedAt: string;
  counts: {
    sourceLives: number;
    sourceLiveItems: number;
    sourceSetlistEntries: number;
    sourceDiscographies: number;
    sourceSongs: number;
    generatedTracks: number;
    generatedSetlists: number;
    generatedVenues: number;
    verifiedVenueCapacities: number;
    venueCapacitiesNeedingVerification: number;
    matchedEntries: number;
    candidateEntries: number;
    specialEntries: number;
    unmatchedEntries: number;
  };
  unmatchedRawTitles: Array<{
    rawTitle: string;
    normalizedTitle: string;
    count: number;
    exampleSetlistIds: string[];
    reason: string;
  }>;
  warnings: string[];
};

export type GeneratedManifest = {
  schemaVersion: 1;
  generatedAt: string;
  source: {
    liveJsonPath: string;
    discographyJsonPath: string;
    venueEnrichmentPath?: string | null;
    venueLayoutOverridesPath?: string | null;
    liveJsonHash: string;
    discographyJsonHash: string;
    venueEnrichmentHash?: string | null;
    venueLayoutOverridesHash?: string | null;
  };
  counts: {
    tracks: number;
    venues: number;
    setlists: number;
    setlistEntries: number;
  };
  paths: {
    tracks: string;
    venues: string;
    venueLayouts: string;
    setlistsIndex: string;
  };
};

export type TrackAliasIndexEntry = {
  trackId: string;
  score: number;
  reason: "exact" | "alias" | "version_stripped" | "partial";
};

export type TrackAliasIndex = {
  bySongUuid: Map<string, GeneratedTrackMaster>;
  byTrackId: Map<string, GeneratedTrackMaster>;
  byNormalizedTitle: Map<string, TrackAliasIndexEntry[]>;
};

export type GeneratedTransformResult = {
  manifest: GeneratedManifest;
  tracksJson: GeneratedTracksJson;
  venuesJson: GeneratedVenuesJson;
  venueLayoutsJson: VenueLayoutsJson;
  setlistsIndexJson: GeneratedSetlistsIndexJson;
  setlists: GeneratedSetlist[];
  importReport: ImportReport;
  venueLayoutCoverageJson: VenueLayoutCoverageJson;
  venueTasksCsv: string;
  venueLayoutTasksCsv: string;
  unmatchedRawTitlesCsv: string;
};

export type GeneratedTrackKind = TrackKind;
