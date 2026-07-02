export type SchemaVersion = 1;
export type ID = string;
export type ISODateString = string;
export type ISODateTimeString = string;
export type Seconds = number;
export type Milliseconds = number;
export type Decibel = number;
export type Hertz = number;
export type Normalized = number;

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type TrackKind =
  | "original"
  | "instrumental"
  | "se"
  | "cover"
  | "medley"
  | "unreleased"
  | "unknown";

export type TrackMaster = {
  schemaVersion: SchemaVersion;
  trackId: ID;
  canonicalTitle: string;
  aliases: string[];
  artistNames: string[];
  kind: TrackKind;
  expectedDurationSec?: Seconds;
  matchHints?: string[];
  notes?: string;
};

export type SetlistEntryPolicy =
  | "required"
  | "optional"
  | "substitutable"
  | "cover"
  | "medley"
  | "se"
  | "unreleased";

export type SetlistEntry = {
  schemaVersion: SchemaVersion;
  entryId: ID;
  order: number;
  trackId?: ID;
  displayTitle: string;
  aliases?: string[];
  policy: SetlistEntryPolicy;
  expectedDurationSec?: Seconds;
  afterglowTailSec?: Seconds;
  substituteTrackIds?: ID[];
  note?: string;
};

export type Setlist = {
  schemaVersion: SchemaVersion;
  setlistId: ID;
  tourName?: string;
  liveTitle?: string;
  date?: ISODateString;
  venueName?: string;
  venueId?: ID;
  entries: SetlistEntry[];
  source?: {
    type: "site_db" | "spreadsheet" | "manual";
    sourceId?: string;
    updatedAt?: ISODateTimeString;
  };
};

export type AudioExtension =
  | "flac"
  | "mp3"
  | "m4a"
  | "aac"
  | "wav"
  | "mp4"
  | "unknown";

export type LocalFileKey = string;

export type AudioMetadata = {
  title?: string;
  artist?: string;
  album?: string;
  albumArtist?: string;
  trackNo?: number;
  discNo?: number;
  durationSec?: Seconds;
  codec?: string;
  sampleRate?: number;
  bitRate?: number;
  channels?: number;
};

export type LocalTrackRecord = {
  schemaVersion: SchemaVersion;
  fileKey: LocalFileKey;
  fileName: string;
  relativePath?: string;
  extension: AudioExtension;
  mimeType?: string;
  size: number;
  lastModified: number;
  metadata?: AudioMetadata;
  normalized: {
    titleKeys: string[];
    artistKeys: string[];
    fileNameKey: string;
    pathKey?: string;
  };
  scannedAt: ISODateTimeString;
};

export type TrackMatchStatus =
  | "matched"
  | "candidate"
  | "missing"
  | "manual_required"
  | "special";

export type TrackMatchReason =
  | "manual"
  | "track_id"
  | "metadata_exact"
  | "metadata_alias"
  | "filename_exact"
  | "filename_alias"
  | "duration_hint"
  | "special_policy";

export type TrackMatchCandidate = {
  fileKey: LocalFileKey;
  score: number;
  reasons: TrackMatchReason[];
};

export type SetlistEntryMatch = {
  schemaVersion: SchemaVersion;
  setlistId: ID;
  entryId: ID;
  status: TrackMatchStatus;
  matchedFileKey?: LocalFileKey;
  candidates?: TrackMatchCandidate[];
  missingReason?: string;
};

export type SetlistReadinessReport = {
  schemaVersion: SchemaVersion;
  setlistId: ID;
  totalEntries: number;
  playableEntries: number;
  missingEntries: number;
  candidateEntries: number;
  specialEntries: number;
  isFullyPlayable: boolean;
  isPlayableWithWarnings: boolean;
  entries: SetlistEntryMatch[];
  checkedAt: ISODateTimeString;
};

export type ManualTrackMapping = {
  schemaVersion: SchemaVersion;
  mappingId: ID;
  setlistEntryTrackId?: ID;
  setlistEntryTitle?: string;
  trackId?: ID;
  fileKey: LocalFileKey;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
};

export type VenueType = "live_house" | "hall" | "arena" | "outdoor" | "other";

export type EqBandType =
  | "lowshelf"
  | "highshelf"
  | "peaking"
  | "lowpass"
  | "highpass";

export type EqBand = {
  type: EqBandType;
  frequencyHz: Hertz;
  gainDb: Decibel;
  q?: number;
};

export type EqPreset = {
  bands: EqBand[];
};

export type ReverbPreset = {
  amount: Normalized;
  decaySec: Seconds;
  preDelayMs: Milliseconds;
  damping: Normalized;
};

export type ReflectionPreset = {
  earlyReflectionAmount: Normalized;
  slapDelayMs: Milliseconds;
  sideReflectionMs: Milliseconds;
};

export type SpeakerLayoutSource = {
  /** 出典の表示名 (例: "LINE CUBE SHIBUYA 公式 技術仕様書 PDF") */
  label: string;
  /** 参照リンク (公式サイト・仕様書・取材記事等)。 */
  url?: string;
  /** 補足 (例: "メイン PA: NEXO STM、FOH 位置は実測ではなく図面からの推定") */
  note?: string;
};

export type SpatialPreset = {
  stageWidth: number;
  depth: number;
  height: number;
  leftPaPosition: Vec3;
  rightPaPosition: Vec3;
  centerPosition?: Vec3;
  subPosition?: Vec3;
  defaultListenerPosition: Vec3;
  paSpread: number;
  /**
   * PA / スピーカー構成の出典。
   * 指定があれば「実情報源あり」、未指定または空配列の場合は「会場規模(タイプ/stageWidth/depth)からの推定値」を意味する。
   */
  sources?: SpeakerLayoutSource[];
};

export type DynamicsPreset = {
  limiterEnabled: boolean;
  compressorEnabled: boolean;
  outputGainDb: Decibel;
  thresholdDb?: Decibel;
  ratio?: number;
  attackSec?: Seconds;
  releaseSec?: Seconds;
};

export type VenueAcousticPreset = {
  eq: EqPreset;
  reverb: ReverbPreset;
  reflections: ReflectionPreset;
  spatial: SpatialPreset;
  dynamics: DynamicsPreset;
};

export type VenuePreset = {
  schemaVersion: SchemaVersion;
  venueId: ID;
  name: string;
  type: VenueType;
  acoustic: VenueAcousticPreset;
  visualBias?: {
    darkness: Normalized;
    particleDensity: Normalized;
    afterglowDecay: Normalized;
    bloomBias: Normalized;
    fractureBias: Normalized;
    pressureBias: Normalized;
  };
  notes?: string;
};

export type MemoryTags = {
  heat: Normalized;
  pressure: Normalized;
  pain: Normalized;
  release: Normalized;
  distance: Normalized;
  aftertaste: Normalized;
};

export type ListenerPositionMemory = {
  position: Vec3;
  label?: string;
};

export type VisualPalette = {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
};

export type VisualResidualPreset = {
  palette: VisualPalette;
  particleDensity: Normalized;
  afterglowDecay: Normalized;
  pressureBias: Normalized;
  bloomBias: Normalized;
  fractureBias: Normalized;
  driftBias: Normalized;
  beatSensitivity: Normalized;
  bassGravity: Normalized;
};

export type LiveMemoryPreset = {
  schemaVersion: SchemaVersion;
  liveMemoryId: ID;
  title: string;
  tourName?: string;
  liveTitle?: string;
  date?: ISODateString;
  venueId?: ID;
  venueName?: string;
  setlistId?: ID;
  listener: ListenerPositionMemory;
  acousticOverride?: Partial<VenueAcousticPreset>;
  visual: VisualResidualPreset;
  memoryTags: MemoryTags;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
};

export type AudioAnalysisCache = {
  schemaVersion: SchemaVersion;
  analysisVersion: number;
  fileKey: LocalFileKey;
  durationSec?: Seconds;
  summary: {
    averageRms: Normalized;
    lowEnergy: Normalized;
    midEnergy: Normalized;
    highEnergy: Normalized;
    spectralBrightness: Normalized;
    dynamicRange: Normalized;
  };
  createdAt: ISODateTimeString;
};

export type PlaybackQueueItemKind = "track" | "afterglow" | "gap" | "special";

export type PlaybackQueueItem = {
  schemaVersion: SchemaVersion;
  queueItemId: ID;
  kind: PlaybackQueueItemKind;
  setlistId?: ID;
  entryId?: ID;
  trackId?: ID;
  fileKey?: LocalFileKey;
  title: string;
  durationSec?: Seconds;
  afterglowTailSec?: Seconds;
  note?: string;
};

export type PlaybackQueue = {
  schemaVersion: SchemaVersion;
  queueId: ID;
  title: string;
  setlistId?: ID;
  liveMemoryId?: ID;
  items: PlaybackQueueItem[];
  createdAt: ISODateTimeString;
};

export type PerformanceMode = "battery_saver" | "standard" | "high_visual";

export type OutputDeviceProfile =
  | "default"
  | "earphones"
  | "airpods"
  | "wired_headphones"
  | "speaker"
  | "car_bluetooth";

export type AppSettings = {
  schemaVersion: SchemaVersion;
  performanceMode: PerformanceMode;
  outputDeviceProfile: OutputDeviceProfile;
  wakeLockEnabled: boolean;
  mediaSessionEnabled: boolean;
  deviceOrientationEnabled: boolean;
  visual: {
    showTrackTitle: boolean;
    showPositionMap: boolean;
    reduceMotion: boolean;
  };
  audio: {
    masterGainDb: Decibel;
    limiterEnabled: boolean;
    normalizeTrackGain: boolean;
    /** ユーザー調整可能な 8 バンドグラフィック EQ の gain (dB)。
     *  バンド順 (中心周波数): 60, 170, 350, 700, 1500, 3000, 6000, 12000 Hz。 */
    userEqBands?: number[];
    /** ユーザーが保存したカスタム EQ プリセット。 */
    customEqPresets?: { id: string; name: string; bands: number[] }[];
    /** ユーザーが手動で上書きした残響 (リバーブ) パラメータ。
     *  未指定の場合は会場プリセットの reverb 値が使われる。 */
    reverb?: ReverbPreset;
  };
  privacy: {
    localOnlyNoticeAccepted: boolean;
    analyticsEnabled: false;
  };
  updatedAt: ISODateTimeString;
};

export type StaticAppData = {
  schemaVersion: SchemaVersion;
  tracks: TrackMaster[];
  setlists: Setlist[];
  venuePresets: VenuePreset[];
  updatedAt: ISODateTimeString;
};

export type AudioReactiveFrame = {
  lowEnergy: number;
  midEnergy: number;
  highEnergy: number;
  rms: number;
  kickLike: number;
  snareLike: number;
  hatLike: number;
  bassFlow: number;
  vocalBloom: number;
};
