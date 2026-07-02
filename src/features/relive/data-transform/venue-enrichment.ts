import type {
  GeneratedVenue,
  GeneratedVenueType,
  VenueCapacityKind,
  VenueVerificationSource,
} from "./generated-types";
import { uniqueStrings } from "./normalize";

export type VenueEnrichmentEntry = {
  venueIds: string[];
  canonicalName?: string;
  aliases?: string[];
  type?: GeneratedVenueType;
  siteUrl?: string | null;
  address?: string | null;
  googleMapsUrl?: string | null;
  capacity?: number | null;
  capacityStatus?: GeneratedVenue["capacityStatus"];
  capacityKind?: VenueCapacityKind | null;
  seatedCapacity?: number | null;
  capacityRange?: { min: number; max: number } | null;
  verifiedAt: string;
  sources: VenueVerificationSource[];
  notes?: string[];
};

export type VenueEnrichmentSnapshot = {
  schemaVersion: 1;
  updatedAt: string;
  policy: string;
  venues: VenueEnrichmentEntry[];
};

export type VenueEnrichmentIndex = Map<string, VenueEnrichmentEntry>;

export const buildVenueEnrichmentIndex = (
  snapshot?: VenueEnrichmentSnapshot | null
): VenueEnrichmentIndex => {
  const index: VenueEnrichmentIndex = new Map();
  (snapshot?.venues || []).forEach((entry) => {
    entry.venueIds.forEach((venueId) => {
      index.set(venueId, entry);
    });
  });
  return index;
};

export const applyVenueEnrichment = (
  venue: GeneratedVenue,
  entry?: VenueEnrichmentEntry
): GeneratedVenue => {
  if (!entry) {
    return venue;
  }

  const capacityKnown =
    typeof entry.capacity === "number" ||
    typeof entry.seatedCapacity === "number" ||
    Boolean(entry.capacityRange);

  return {
    ...venue,
    name: entry.canonicalName || venue.name,
    aliases: uniqueStrings([
      ...venue.aliases,
      venue.name,
      ...(entry.aliases || []),
    ]).filter((alias) => alias !== (entry.canonicalName || venue.name)),
    type: entry.type || venue.type,
    typeGuessReason: entry.type
      ? uniqueStrings([...venue.typeGuessReason, "venue_enrichment_snapshot"])
      : venue.typeGuessReason,
    siteUrl: entry.siteUrl ?? venue.siteUrl ?? null,
    address: entry.address ?? venue.address ?? null,
    googleMapsUrl: entry.googleMapsUrl ?? venue.googleMapsUrl ?? null,
    capacity:
      typeof entry.capacity === "number" || entry.capacity === null
        ? entry.capacity
        : venue.capacity,
    capacityStatus:
      entry.capacityStatus ||
      (capacityKnown ? "verified" : venue.capacityStatus),
    capacityKind: entry.capacityKind ?? venue.capacityKind ?? null,
    seatedCapacity:
      typeof entry.seatedCapacity === "number" || entry.seatedCapacity === null
        ? entry.seatedCapacity
        : venue.seatedCapacity ?? null,
    capacityRange: entry.capacityRange ?? venue.capacityRange ?? null,
    verifiedAt: entry.verifiedAt || venue.verifiedAt || null,
    verificationSources: uniqueVenueSources([
      ...(venue.verificationSources || []),
      ...entry.sources,
    ]),
    verificationNotes: uniqueStrings([
      ...(venue.verificationNotes || []),
      ...(entry.notes || []),
    ]),
  };
};

const uniqueVenueSources = (sources: VenueVerificationSource[]) => {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = `${source.url}::${source.fields.join("|")}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
