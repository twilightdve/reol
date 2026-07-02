import { promises as fs } from "fs";
import path from "path";
import type { VenueLayoutOverridesJson } from "./generated-types";
import type { SourceDiscography, SourceLive } from "./source-types";
import type { VenueEnrichmentSnapshot } from "./venue-enrichment";
import { sha256 } from "./hash";

export type LoadedSources = {
  liveJsonPath: string;
  discographyJsonPath: string;
  venueEnrichmentPath?: string | null;
  venueLayoutOverridesPath?: string | null;
  liveJsonHash: string;
  discographyJsonHash: string;
  venueEnrichmentHash?: string | null;
  venueLayoutOverridesHash?: string | null;
  lives: SourceLive[];
  discographies: SourceDiscography[];
  venueEnrichment?: VenueEnrichmentSnapshot | null;
  venueLayoutOverrides: VenueLayoutOverridesJson;
};

const readJsonFile = async <T>(filePath: string): Promise<{ data: T; raw: string }> => {
  const raw = await fs.readFile(filePath, "utf8");
  return { raw, data: JSON.parse(raw) as T };
};

const exists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const resolveSourcePath = async (preferredPath: string, fallbackPath?: string) => {
  if (await exists(preferredPath)) {
    return preferredPath;
  }
  if (fallbackPath && await exists(fallbackPath)) {
    return fallbackPath;
  }
  throw new Error(
    `Required relive source JSON was not found: ${preferredPath}${fallbackPath ? ` or ${fallbackPath}` : ""}`
  );
};

const resolveOptionalSourcePath = async (preferredPath?: string, fallbackPath?: string) => {
  if (preferredPath && await exists(preferredPath)) {
    return preferredPath;
  }
  if (fallbackPath && await exists(fallbackPath)) {
    return fallbackPath;
  }
  return null;
};

export const loadSources = async (options: {
  liveJsonPath: string;
  discographyJsonPath: string;
  liveJsonFallbackPath?: string;
  discographyJsonFallbackPath?: string;
  venueEnrichmentPath?: string;
  venueEnrichmentFallbackPath?: string;
  venueLayoutOverridesPath?: string;
}): Promise<LoadedSources> => {
  const liveJsonPath = await resolveSourcePath(options.liveJsonPath, options.liveJsonFallbackPath);
  const discographyJsonPath = await resolveSourcePath(
    options.discographyJsonPath,
    options.discographyJsonFallbackPath
  );
  const [liveJson, discographyJson] = await Promise.all([
    readJsonFile<SourceLive[]>(liveJsonPath),
    readJsonFile<SourceDiscography[]>(discographyJsonPath),
  ]);
  const venueEnrichmentPath = await resolveOptionalSourcePath(
    options.venueEnrichmentPath,
    options.venueEnrichmentFallbackPath
  );
  const venueEnrichmentJson = venueEnrichmentPath
    ? await readJsonFile<VenueEnrichmentSnapshot>(venueEnrichmentPath)
    : null;
  const venueLayoutOverrides = await loadVenueLayoutOverrides(
    options.venueLayoutOverridesPath || "src/data/relive/venue-layout-overrides.json"
  );

  if (!Array.isArray(liveJson.data)) {
    throw new Error(`${liveJsonPath} must be an array`);
  }
  if (!Array.isArray(discographyJson.data)) {
    throw new Error(`${discographyJsonPath} must be an array`);
  }

  return {
    liveJsonPath: path.normalize(liveJsonPath),
    discographyJsonPath: path.normalize(discographyJsonPath),
    venueEnrichmentPath: venueEnrichmentPath ? path.normalize(venueEnrichmentPath) : null,
    venueLayoutOverridesPath: venueLayoutOverrides.path,
    liveJsonHash: sha256(liveJson.raw),
    discographyJsonHash: sha256(discographyJson.raw),
    venueEnrichmentHash: venueEnrichmentJson ? sha256(venueEnrichmentJson.raw) : null,
    venueLayoutOverridesHash: venueLayoutOverrides.hash,
    lives: liveJson.data,
    discographies: discographyJson.data,
    venueEnrichment: venueEnrichmentJson?.data || null,
    venueLayoutOverrides: venueLayoutOverrides.data,
  };
};

const emptyVenueLayoutOverrides = (): VenueLayoutOverridesJson => ({
  schemaVersion: 1,
  updatedAt: new Date(0).toISOString(),
  layouts: [],
});

export const loadVenueLayoutOverrides = async (
  filePath: string
): Promise<{ path: string | null; hash: string | null; data: VenueLayoutOverridesJson }> => {
  if (!await exists(filePath)) {
    return { path: null, hash: null, data: emptyVenueLayoutOverrides() };
  }

  const json = await readJsonFile<VenueLayoutOverridesJson>(filePath);
  if (json.data.schemaVersion !== 1) {
    throw new Error(`${filePath} must have schemaVersion 1`);
  }
  if (!Array.isArray(json.data.layouts)) {
    throw new Error(`${filePath} must have a layouts array`);
  }

  return {
    path: path.normalize(filePath),
    hash: sha256(json.raw),
    data: json.data,
  };
};
