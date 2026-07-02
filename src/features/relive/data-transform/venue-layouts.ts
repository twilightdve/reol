import type {
  AudienceMode,
  GeneratedVenue,
  GeneratedVenueType,
  LayoutShape,
  LayoutVerificationStatus,
  VenueLayoutCoverageJson,
  VenueLayoutMetadata,
  VenueLayoutOverride,
  VenueLayoutOverridesJson,
  VenueLayoutsJson,
} from "./generated-types";
import { normalizeVenueName, uniqueStrings } from "./normalize";

type LayoutDefaults = {
  audienceMode: AudienceMode;
  layoutShape: LayoutShape;
  stagePosition: NonNullable<VenueLayoutMetadata["stage"]>["position"];
};

const DEFAULTS_BY_TYPE: Record<GeneratedVenueType, LayoutDefaults> = {
  live_house: {
    audienceMode: "standing",
    layoutShape: "rectangle",
    stagePosition: "front",
  },
  hall: {
    audienceMode: "seated",
    layoutShape: "fan",
    stagePosition: "front",
  },
  arena: {
    audienceMode: "mixed",
    layoutShape: "arena_bowl",
    stagePosition: "end_stage",
  },
  exhibition: {
    audienceMode: "mixed",
    layoutShape: "rectangle",
    stagePosition: "front",
  },
  outdoor_festival: {
    audienceMode: "festival",
    layoutShape: "outdoor_field",
    stagePosition: "front",
  },
  virtual: {
    audienceMode: "virtual",
    layoutShape: "unknown",
    stagePosition: "unknown",
  },
  unknown: {
    audienceMode: "unknown",
    layoutShape: "unknown",
    stagePosition: "unknown",
  },
};

const layoutStatusFromVenueCapacity = (
  capacityStatus: GeneratedVenue["capacityStatus"]
): LayoutVerificationStatus => {
  if (capacityStatus === "verified") return "verified";
  if (capacityStatus === "unknown") return "unknown";
  return "needs_verification";
};

const zone = (
  zoneId: string,
  name: string,
  type: VenueLayoutMetadata["zones"][number]["type"],
  normalizedX: number,
  normalizedZ: number,
  acousticBias: VenueLayoutMetadata["zones"][number]["acousticBias"] = {}
): VenueLayoutMetadata["zones"][number] => ({
  zoneId,
  name,
  type,
  center: { x: normalizedX, z: normalizedZ },
  listenerPreset: { normalizedX, normalizedZ },
  acousticBias,
});

const createDefaultZones = (type: GeneratedVenueType): VenueLayoutMetadata["zones"] => {
  const common = [
    zone("front_center", "前方中央", "front", 0, 0.18, {
      bassBoostDb: 1.2,
      reverbAmountBias: -0.1,
      crowdDensityBias: 0.18,
    }),
    zone("front_left", "前方下手", "left", -0.55, 0.2, {
      bassBoostDb: 0.8,
      crowdDensityBias: 0.12,
    }),
    zone("front_right", "前方上手", "right", 0.55, 0.2, {
      bassBoostDb: 0.8,
      crowdDensityBias: 0.12,
    }),
    zone("middle_center", "中央", "middle", 0, 0.5, {
      crowdDensityBias: 0.08,
    }),
    zone("rear_center", "後方中央", "rear", 0, 0.82, {
      highDamping: 0.2,
      reverbAmountBias: 0.15,
      reflectionDelayBiasMs: 20,
    }),
  ];

  if (type === "hall" || type === "arena") {
    return [
      ...common,
      zone("reserved_seat_center", "指定席中央", "reserved_seat", 0, 0.52, {
        reverbAmountBias: 0.05,
      }),
      zone("balcony_center", "2階/バルコニー", "balcony", 0, 0.65, {
        bassBoostDb: -0.6,
        reverbAmountBias: 0.1,
        reflectionDelayBiasMs: 12,
      }),
    ].map((item) =>
      item.zoneId === "balcony_center"
        ? { ...item, center: { x: 0, y: 1, z: 0.65 }, listenerPreset: { normalizedX: 0, normalizedZ: 0.65, y: 1 } }
        : item
    );
  }

  if (type === "outdoor_festival") {
    return [
      ...common,
      zone("pa_front", "PA前", "pa_booth", 0, 0.68, {
        highDamping: 0.1,
        reflectionDelayBiasMs: 8,
      }),
    ];
  }

  if (type === "virtual") {
    return [
      zone("virtual_center", "仮想中央", "center", 0, 0.5, {
        reverbAmountBias: 0,
      }),
    ];
  }

  return common;
};

const createDefaultListenerPresets = (
  zones: VenueLayoutMetadata["zones"]
): VenueLayoutMetadata["defaultListenerPresets"] =>
  zones
    .filter((item) => item.listenerPreset)
    .map((item) => ({
      presetId: item.zoneId,
      name: item.name,
      normalizedX: item.listenerPreset!.normalizedX,
      normalizedZ: item.listenerPreset!.normalizedZ,
      y: item.listenerPreset!.y,
      zoneId: item.zoneId,
    }));

const sourceUrlsForVenue = (venue: GeneratedVenue): VenueLayoutMetadata["sourceUrls"] => {
  const sources: VenueLayoutMetadata["sourceUrls"] = [];
  if (venue.siteUrl) {
    sources.push({
      sourceType: "official_venue_page",
      title: venue.name,
      url: venue.siteUrl,
      note: "Imported as a reference URL only; no official floor map image or HTML is bundled.",
    });
  }
  if (venue.googleMapsUrl) {
    sources.push({
      sourceType: "google_maps",
      title: `${venue.name} Google Maps`,
      url: venue.googleMapsUrl,
    });
  }
  return sources;
};

const createBaseVenueLayout = (
  venue: GeneratedVenue,
  generatedAt: string
): VenueLayoutMetadata => {
  const defaults = DEFAULTS_BY_TYPE[venue.type];
  const zones = createDefaultZones(venue.type);
  const capacityStatus = layoutStatusFromVenueCapacity(venue.capacityStatus);

  return {
    schemaVersion: 1,
    venueId: venue.venueId,
    venueName: venue.name,
    aliases: venue.aliases,
    layoutStatus: "needs_verification",
    audienceMode: defaults.audienceMode,
    layoutShape: defaults.layoutShape,
    capacity: {
      standing: venue.capacityKind === "standing" ? venue.capacity : null,
      seated: venue.seatedCapacity ?? (venue.capacityKind === "seated" ? venue.capacity : null),
      total: venue.capacity,
      status: capacityStatus,
      sourceUrl: venue.verificationSources?.[0]?.url || venue.siteUrl || undefined,
    },
    dimensions: {
      widthM: null,
      depthM: null,
      heightM: null,
      status: "needs_verification",
    },
    floors: {
      count: null,
      hasBalcony: null,
      hasSecondFloor: null,
      status: "needs_verification",
    },
    stage: {
      position: defaults.stagePosition,
      widthM: null,
      depthM: null,
      heightM: null,
      normalizedCenter: { x: 0, z: 0 },
      status: defaults.stagePosition === "unknown" ? "unknown" : "estimated",
    },
    audienceArea: {
      shape: defaults.layoutShape,
      status: defaults.layoutShape === "unknown" ? "unknown" : "estimated",
    },
    zones,
    defaultListenerPresets: createDefaultListenerPresets(zones),
    sourceUrls: sourceUrlsForVenue(venue),
    notes: "Base layout generated from venue type. Official floor map images and HTML are not bundled.",
    updatedAt: generatedAt,
  };
};

const firstDefined = <T>(overrideValue: T | undefined, baseValue: T): T =>
  overrideValue === undefined ? baseValue : overrideValue;

const mergeObject = <T extends object>(
  baseValue: T | undefined,
  overrideValue: Partial<T> | undefined
): T | undefined => {
  if (!overrideValue) {
    return baseValue;
  }
  return {
    ...((baseValue || {}) as T),
    ...overrideValue,
  };
};

const uniqueSources = (
  sources: VenueLayoutMetadata["sourceUrls"]
): VenueLayoutMetadata["sourceUrls"] => {
  const byKey = new Map<string, VenueLayoutMetadata["sourceUrls"][number]>();
  sources.forEach((source) => {
    const key = `${source.sourceType}:${source.url || source.title || ""}`;
    byKey.set(key, {
      ...byKey.get(key),
      ...source,
    });
  });
  return [...byKey.values()];
};

const overrideMatchesLayout = (
  override: VenueLayoutOverride,
  layout: VenueLayoutMetadata
) => {
  if (override.venueId === layout.venueId) {
    return true;
  }
  const names = [
    override.venueName,
    ...(override.aliases || []),
  ].filter(Boolean).map((value) => normalizeVenueName(value as string));
  const layoutNames = [
    layout.venueName,
    ...(layout.aliases || []),
  ].filter(Boolean).map((value) => normalizeVenueName(value as string));

  return names.some((name) => name && layoutNames.includes(name));
};

const mergeVenueLayoutOverride = (
  base: VenueLayoutMetadata,
  override?: VenueLayoutOverride
): VenueLayoutMetadata => {
  if (!override) {
    return base;
  }

  const zones = override.zones || [
    ...base.zones,
    ...(override.additionalZones || []),
  ];
  return {
    ...base,
    venueName: firstDefined(override.venueName, base.venueName),
    aliases: uniqueStrings([
      ...(base.aliases || []),
      ...(override.aliases || []),
    ]),
    layoutStatus: firstDefined(override.layoutStatus, base.layoutStatus),
    audienceMode: firstDefined(override.audienceMode, base.audienceMode),
    layoutShape: firstDefined(override.layoutShape, base.layoutShape),
    capacity: mergeObject(base.capacity, override.capacity),
    dimensions: mergeObject(base.dimensions, override.dimensions),
    floors: mergeObject(base.floors, override.floors),
    stage: mergeObject(base.stage, override.stage),
    audienceArea: mergeObject(base.audienceArea, override.audienceArea),
    zones,
    defaultListenerPresets:
      override.defaultListenerPresets || createDefaultListenerPresets(zones),
    sourceUrls: uniqueSources([
      ...base.sourceUrls,
      ...(override.sourceUrls || []),
    ]),
    notes: firstDefined(override.notes, base.notes),
    updatedAt: firstDefined(override.updatedAt, base.updatedAt),
  };
};

const buildOverrideIndex = (
  overrides: VenueLayoutOverridesJson
): Map<string, VenueLayoutOverride> => {
  const byVenueId = new Map<string, VenueLayoutOverride>();
  overrides.layouts.forEach((override) => {
    byVenueId.set(override.venueId, override);
  });
  return byVenueId;
};

const findOverride = (
  layout: VenueLayoutMetadata,
  overrides: VenueLayoutOverridesJson,
  byVenueId: Map<string, VenueLayoutOverride>
) =>
  byVenueId.get(layout.venueId) ||
  overrides.layouts.find((override) => overrideMatchesLayout(override, layout));

const capacityNeedsWork = (layout: VenueLayoutMetadata) =>
  !layout.capacity ||
  layout.capacity.status !== "verified" ||
  (
    layout.capacity.standing == null &&
    layout.capacity.seated == null &&
    layout.capacity.total == null
  );

const dimensionsNeedWork = (layout: VenueLayoutMetadata) =>
  !layout.dimensions ||
  layout.dimensions.status !== "verified" ||
  layout.dimensions.widthM == null ||
  layout.dimensions.depthM == null ||
  layout.dimensions.heightM == null;

const floorsNeedWork = (layout: VenueLayoutMetadata) =>
  !layout.floors || layout.floors.status !== "verified" || layout.floors.count == null;

const stageNeedsWork = (layout: VenueLayoutMetadata) =>
  !layout.stage || (layout.stage.status !== "verified" && layout.stage.status !== "partially_verified");

const fieldsNeededFor = (layout: VenueLayoutMetadata) => {
  const fields: string[] = [];
  if (layout.layoutStatus !== "verified") fields.push("layoutStatus");
  if (capacityNeedsWork(layout)) fields.push("capacity");
  if (dimensionsNeedWork(layout)) fields.push("dimensions");
  if (floorsNeedWork(layout)) fields.push("floors");
  if (stageNeedsWork(layout)) fields.push("stage");
  if (!layout.sourceUrls.some((source) => source.sourceType === "official_venue_page" && source.url)) {
    fields.push("officialSite");
  }
  return fields;
};

const csvEscape = (value: unknown) => {
  const text = Array.isArray(value) ? value.join("|") : `${value ?? ""}`;
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const buildVenueLayoutEnrichmentTasksCsv = (
  layouts: VenueLayoutMetadata[],
  venues: GeneratedVenue[]
) => {
  const venueById = new Map(venues.map((venue) => [venue.venueId, venue]));
  const header = [
    "venueId",
    "venueName",
    "typeGuess",
    "layoutStatus",
    "capacityStatus",
    "hasOfficialSite",
    "siteUrl",
    "address",
    "sourceLiveUuids",
    "sourceSetlistIds",
    "neededFields",
  ];
  const rows = layouts
    .map((layout) => {
      const neededFields = fieldsNeededFor(layout);
      if (neededFields.length === 0) {
        return null;
      }
      const venue = venueById.get(layout.venueId);
      const officialSite = layout.sourceUrls.find(
        (source) => source.sourceType === "official_venue_page" && source.url
      )?.url;
      return [
        layout.venueId,
        layout.venueName,
        venue?.type || "",
        layout.layoutStatus,
        layout.capacity?.status || "unknown",
        officialSite ? "yes" : "no",
        officialSite || venue?.siteUrl || "",
        venue?.address || "",
        venue?.sourceLiveUuids.join("|") || "",
        venue?.sourceSetlistIds.join("|") || "",
        neededFields.join("|"),
      ].map(csvEscape).join(",");
    })
    .filter((row): row is string => Boolean(row));

  return `${[header.join(","), ...rows].join("\n")}\n`;
};

export const buildVenueLayoutCoverage = (
  generatedAt: string,
  layouts: VenueLayoutMetadata[],
  venues: GeneratedVenue[],
  overrides: VenueLayoutOverridesJson,
  tasksCsv: string
): VenueLayoutCoverageJson => {
  const taskCount = Math.max(0, tasksCsv.trim().split("\n").length - 1);
  return {
    schemaVersion: 1,
    generatedAt,
    counts: {
      venues: venues.length,
      layouts: layouts.length,
      verified: layouts.filter((layout) => layout.layoutStatus === "verified").length,
      partiallyVerified: layouts.filter((layout) => layout.layoutStatus === "partially_verified").length,
      estimated: layouts.filter((layout) => layout.layoutStatus === "estimated").length,
      needsVerification: layouts.filter((layout) => layout.layoutStatus === "needs_verification").length,
      unknown: layouts.filter((layout) => layout.layoutStatus === "unknown").length,
      withCapacity: layouts.filter(
        (layout) =>
          layout.capacity &&
          layout.capacity.status === "verified" &&
          (
            layout.capacity.standing != null ||
            layout.capacity.seated != null ||
            layout.capacity.total != null
          )
      ).length,
      withDimensions: layouts.filter(
        (layout) =>
          layout.dimensions &&
          layout.dimensions.status === "verified" &&
          layout.dimensions.widthM != null &&
          layout.dimensions.depthM != null &&
          layout.dimensions.heightM != null
      ).length,
      withFloorStructure: layouts.filter(
        (layout) =>
          layout.floors &&
          layout.floors.status === "verified" &&
          layout.floors.count != null
      ).length,
      withOfficialSite: layouts.filter((layout) =>
        layout.sourceUrls.some((source) => source.sourceType === "official_venue_page" && source.url)
      ).length,
      withGoogleMaps: layouts.filter((layout) =>
        layout.sourceUrls.some((source) => source.sourceType === "google_maps" && source.url)
      ).length,
      withOverrides: layouts.filter((layout) =>
        overrides.layouts.some((override) => overrideMatchesLayout(override, layout))
      ).length,
      enrichmentTasks: taskCount,
    },
  };
};

export const buildVenueLayouts = (
  generatedAt: string,
  venues: GeneratedVenue[],
  overrides: VenueLayoutOverridesJson,
  source: VenueLayoutsJson["source"]
): {
  venueLayoutsJson: VenueLayoutsJson;
  venueLayoutTasksCsv: string;
  venueLayoutCoverageJson: VenueLayoutCoverageJson;
} => {
  const overrideByVenueId = buildOverrideIndex(overrides);
  const layouts = venues
    .map((venue) => {
      const base = createBaseVenueLayout(venue, generatedAt);
      return mergeVenueLayoutOverride(base, findOverride(base, overrides, overrideByVenueId));
    })
    .sort((a, b) => a.venueName.localeCompare(b.venueName, "ja"));
  const venueLayoutTasksCsv = buildVenueLayoutEnrichmentTasksCsv(layouts, venues);

  return {
    venueLayoutsJson: {
      schemaVersion: 1,
      generatedAt,
      source,
      layouts,
    },
    venueLayoutTasksCsv,
    venueLayoutCoverageJson: buildVenueLayoutCoverage(
      generatedAt,
      layouts,
      venues,
      overrides,
      venueLayoutTasksCsv
    ),
  };
};
