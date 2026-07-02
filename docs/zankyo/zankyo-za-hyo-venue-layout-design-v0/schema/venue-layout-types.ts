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
