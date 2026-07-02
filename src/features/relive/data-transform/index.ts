import path from "path";
import type {
  GeneratedSetlist,
  GeneratedTransformResult,
  GeneratedVenue,
  ImportReport,
} from "./generated-types";
import { loadSources } from "./io";
import { createTrackAliasIndex, transformDiscographyToTracks } from "./transform-discography";
import { buildSetlistIndex, transformLiveToSetlists, transformLiveToVenues } from "./transform-live";
import { buildVenueEnrichmentIndex } from "./venue-enrichment";
import { buildVenueLayouts } from "./venue-layouts";
import { writeGeneratedFiles } from "./write-generated-files";

export type GenerateReliveDataOptions = {
  liveJsonPath?: string;
  discographyJsonPath?: string;
  liveJsonFallbackPath?: string;
  discographyJsonFallbackPath?: string;
  venueEnrichmentPath?: string;
  venueEnrichmentFallbackPath?: string;
  venueLayoutOverridesPath?: string;
  outputDir?: string;
  mirrorOutputDir?: string;
  generatedAt?: string;
  writeFiles?: boolean;
};

const csvEscape = (value: unknown) => {
  const text = Array.isArray(value) ? value.join("|") : `${value ?? ""}`;
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const buildUnmatched = (setlists: GeneratedSetlist[]) => {
  const unmatched = new Map<
    string,
    { rawTitle: string; normalizedTitle: string; count: number; exampleSetlistIds: string[]; reason: string }
  >();

  setlists.forEach((setlist) => {
    setlist.entries.forEach((entry) => {
      if (entry.match.status !== "missing") {
        return;
      }
      const key = `${entry.normalizedTitle || entry.rawTitle}`;
      const current = unmatched.get(key) || {
        rawTitle: entry.rawTitle,
        normalizedTitle: entry.normalizedTitle,
        count: 0,
        exampleSetlistIds: [],
        reason: entry.match.reason || "missing",
      };
      current.count += 1;
      if (current.exampleSetlistIds.length < 5 && !current.exampleSetlistIds.includes(setlist.setlistId)) {
        current.exampleSetlistIds.push(setlist.setlistId);
      }
      unmatched.set(key, current);
    });
  });

  return [...unmatched.values()].sort((a, b) => b.count - a.count || a.rawTitle.localeCompare(b.rawTitle, "ja"));
};

const buildImportReport = (
  generatedAt: string,
  sourceCounts: {
    sourceLives: number;
    sourceLiveItems: number;
    sourceSetlistEntries: number;
    sourceDiscographies: number;
    sourceSongs: number;
  },
  setlists: GeneratedSetlist[],
  tracksCount: number,
  venues: GeneratedVenue[],
  warnings: string[]
): ImportReport => {
  const entries = setlists.flatMap((setlist) => setlist.entries);
  const unmatchedRawTitles = buildUnmatched(setlists);

  return {
    schemaVersion: 1,
    generatedAt,
    counts: {
      ...sourceCounts,
      generatedTracks: tracksCount,
      generatedSetlists: setlists.length,
      generatedVenues: venues.length,
      verifiedVenueCapacities: venues.filter((venue) => venue.capacityStatus === "verified").length,
      venueCapacitiesNeedingVerification: venues.filter(
        (venue) => venue.capacityStatus === "needs_web_verification"
      ).length,
      matchedEntries: entries.filter((entry) => entry.match.status === "matched").length,
      candidateEntries: entries.filter((entry) => entry.match.status === "candidate").length,
      specialEntries: entries.filter((entry) => entry.match.status === "special").length,
      unmatchedEntries: entries.filter((entry) => entry.match.status === "missing").length,
    },
    unmatchedRawTitles,
    warnings,
  };
};

const buildVenueTasksCsv = (venues: GeneratedVenue[]) => {
  const header = [
    "venueId",
    "name",
    "typeGuess",
    "capacity",
    "capacityKind",
    "seatedCapacity",
    "capacityStatus",
    "verifiedAt",
    "verificationSourceUrls",
    "siteUrl",
    "address",
    "sourceLiveUuids",
  ];
  const rows = venues.map((venue) =>
    [
      venue.venueId,
      venue.name,
      venue.type,
      venue.capacity ?? "",
      venue.capacityKind || "",
      venue.seatedCapacity ?? "",
      venue.capacityStatus,
      venue.verifiedAt || "",
      (venue.verificationSources || []).map((source) => source.url).join("|"),
      venue.siteUrl || "",
      venue.address || "",
      venue.sourceLiveUuids.join("|"),
    ].map(csvEscape).join(",")
  );
  return `${[header.join(","), ...rows].join("\n")}\n`;
};

const buildUnmatchedCsv = (report: ImportReport) => {
  const header = ["rawTitle", "normalizedTitle", "count", "exampleSetlistIds", "reason"];
  const rows = report.unmatchedRawTitles.map((item) =>
    [
      item.rawTitle,
      item.normalizedTitle,
      item.count,
      item.exampleSetlistIds.join("|"),
      item.reason,
    ].map(csvEscape).join(",")
  );
  return `${[header.join(","), ...rows].join("\n")}\n`;
};

export const buildReliveData = async (
  options: GenerateReliveDataOptions = {}
): Promise<GeneratedTransformResult> => {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const sources = await loadSources({
    liveJsonPath: options.liveJsonPath || "static/data/live.json",
    discographyJsonPath: options.discographyJsonPath || "static/data/discography.json",
    liveJsonFallbackPath: options.liveJsonFallbackPath || "public/static/data/live.json",
    discographyJsonFallbackPath: options.discographyJsonFallbackPath || "public/static/data/discography.json",
    venueEnrichmentPath: options.venueEnrichmentPath || "static/data/relive-venue-enrichment.json",
    venueEnrichmentFallbackPath:
      options.venueEnrichmentFallbackPath || "public/static/data/relive-venue-enrichment.json",
    venueLayoutOverridesPath:
      options.venueLayoutOverridesPath || "src/data/relive/venue-layout-overrides.json",
  });

  const tracks = transformDiscographyToTracks(sources.discographies);
  const trackIndex = createTrackAliasIndex(tracks);
  const venues = transformLiveToVenues(
    sources.lives,
    buildVenueEnrichmentIndex(sources.venueEnrichment)
  );
  const setlists = transformLiveToSetlists(sources.lives, trackIndex);
  const sourceLiveItems = sources.lives.flatMap((live) => live.items || []);
  const sourceSetlistEntries = sourceLiveItems.flatMap((item) => item.setList || []);
  const sourceSongs = sources.discographies.flatMap((discography) => discography.songs || []);
  const warnings: string[] = [];

  if (sourceLiveItems.some((item) => !item.setList || item.setList.length === 0)) {
    warnings.push("Some live items have empty setlists.");
  }
  if (sourceSongs.some((song) => !song.feature)) {
    warnings.push("Some discography songs do not have Spotify audio features.");
  }
  if (venues.some((venue) => venue.capacityStatus === "needs_web_verification")) {
    warnings.push("Venue capacity is intentionally null until web verification is completed.");
  }
  if (sources.venueLayoutOverrides.layouts.length === 0) {
    warnings.push("Venue layouts are generated from base venue type defaults until overrides are added.");
  }

  const importReport = buildImportReport(
    generatedAt,
    {
      sourceLives: sources.lives.length,
      sourceLiveItems: sourceLiveItems.length,
      sourceSetlistEntries: sourceSetlistEntries.length,
      sourceDiscographies: sources.discographies.length,
      sourceSongs: sourceSongs.length,
    },
    setlists,
    tracks.length,
    venues,
    warnings
  );
  const venueLayoutArtifacts = buildVenueLayouts(
    generatedAt,
    venues,
    sources.venueLayoutOverrides,
    {
      type: "generated-from-venues",
      venuesPath: "/relive/generated/venues.json",
      overridePath: sources.venueLayoutOverridesPath,
    }
  );

  return {
    manifest: {
      schemaVersion: 1,
      generatedAt,
      source: {
        liveJsonPath: sources.liveJsonPath,
        discographyJsonPath: sources.discographyJsonPath,
        venueEnrichmentPath: sources.venueEnrichmentPath,
        venueLayoutOverridesPath: sources.venueLayoutOverridesPath,
        liveJsonHash: sources.liveJsonHash,
        discographyJsonHash: sources.discographyJsonHash,
        venueEnrichmentHash: sources.venueEnrichmentHash,
        venueLayoutOverridesHash: sources.venueLayoutOverridesHash,
      },
      counts: {
        tracks: tracks.length,
        venues: venues.length,
        setlists: setlists.length,
        setlistEntries: setlists.reduce((sum, setlist) => sum + setlist.entries.length, 0),
      },
      paths: {
        tracks: "/relive/generated/tracks.json",
        venues: "/relive/generated/venues.json",
        venueLayouts: "/relive/generated/venue-layouts.json",
        setlistsIndex: "/relive/generated/setlists/index.json",
      },
    },
    tracksJson: {
      schemaVersion: 1,
      source: {
        type: "fansite-discography-json",
        path: sources.discographyJsonPath,
      },
      tracks,
    },
    venuesJson: {
      schemaVersion: 1,
      source: {
        type: "fansite-live-json",
        path: sources.liveJsonPath,
      },
      venues,
    },
    venueLayoutsJson: venueLayoutArtifacts.venueLayoutsJson,
    setlistsIndexJson: {
      schemaVersion: 1,
      source: {
        type: "fansite-live-json",
        path: sources.liveJsonPath,
      },
      setlists: buildSetlistIndex(sources.lives, setlists),
    },
    setlists,
    importReport,
    venueLayoutCoverageJson: venueLayoutArtifacts.venueLayoutCoverageJson,
    venueTasksCsv: buildVenueTasksCsv(venues),
    venueLayoutTasksCsv: venueLayoutArtifacts.venueLayoutTasksCsv,
    unmatchedRawTitlesCsv: buildUnmatchedCsv(importReport),
  };
};

export const generateReliveData = async (options: GenerateReliveDataOptions = {}) => {
  const outputDir = options.outputDir || path.join("static", "relive", "generated");
  const result = await buildReliveData(options);
  if (options.writeFiles !== false) {
    await writeGeneratedFiles(outputDir, result);
    if (options.mirrorOutputDir) {
      await writeGeneratedFiles(options.mirrorOutputDir, result);
    }
  }
  return result;
};
