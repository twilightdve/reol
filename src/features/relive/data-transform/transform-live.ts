import type { GeneratedSetlist, GeneratedSetlistEntry, GeneratedVenue, SetlistIndexItem, TrackAliasIndex } from "./generated-types";
import { inferVenueType } from "./infer-venue";
import { normalizeTitle, toVenueId, uniqueStrings } from "./normalize";
import { classifySpecialEntry } from "./classify-entry";
import { matchSetlistEntry } from "./match-track";
import type { SourceLive, SourceLiveItem, SourceSetlistSong } from "./source-types";
import type { VenueEnrichmentIndex } from "./venue-enrichment";
import { applyVenueEnrichment } from "./venue-enrichment";

const setlistIdFor = (liveItemUuid: string) => `live_item_${liveItemUuid}`;

const titleFor = (live: SourceLive, item: SourceLiveItem) =>
  item.liveItemName ? `${live.title} ${item.liveItemName}` : live.title;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const transformLiveToVenues = (
  lives: SourceLive[],
  venueEnrichment: VenueEnrichmentIndex = new Map()
): GeneratedVenue[] => {
  const venueById = new Map<string, GeneratedVenue>();

  lives.forEach((live) => {
    (live.items || []).forEach((item) => {
      const place = item.place?.trim();
      if (!place) {
        return;
      }
      const venueId = toVenueId(place);
      if (!venueId) {
        return;
      }
      const inferred = inferVenueType(place);
      const setlistId = setlistIdFor(item.liveItemUuid);
      const current = venueById.get(venueId);

      if (current) {
        current.aliases = uniqueStrings([...current.aliases, place]);
        current.siteUrl ||= item.placeSite || null;
        current.address ||= item.address || null;
        current.googleMapsUrl ||= item.googleMapsUrl || null;
        current.sourceLiveUuids = [...new Set([...current.sourceLiveUuids, live.liveUuid])].sort();
        current.sourceSetlistIds = [...new Set([...current.sourceSetlistIds, setlistId])].sort();
        return;
      }

      venueById.set(venueId, {
        schemaVersion: 1,
        venueId,
        name: place,
        aliases: [],
        type: inferred.type,
        typeGuessReason: inferred.reasons,
        siteUrl: item.placeSite || null,
        address: item.address || null,
        googleMapsUrl: item.googleMapsUrl || null,
        capacity: null,
        capacityStatus: "needs_web_verification",
        sourceLiveUuids: [live.liveUuid],
        sourceSetlistIds: [setlistId],
      });
    });
  });

  return [...venueById.values()]
    .map((venue) => applyVenueEnrichment(venue, venueEnrichment.get(venue.venueId)))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));
};

const afterglowTailSec = (
  match: ReturnType<typeof matchSetlistEntry>,
  index: TrackAliasIndex,
  order: number,
  total: number,
  special: boolean
) => {
  if (special) {
    return 4;
  }
  if (match.status !== "matched") {
    return order >= total - 1 ? 12 : 8;
  }

  const track = index.byTrackId.get(match.trackId);
  const energy = track?.audioFeature?.energy;
  const danceability = track?.audioFeature?.danceability;
  const computed =
    typeof energy === "number" && typeof danceability === "number"
      ? clamp(6 + energy * 5 + (1 - danceability) * 4, 6, 16)
      : 8;
  return Math.round((computed + (order >= total - 1 ? 4 : 0)) * 10) / 10;
};

const toGeneratedEntry = (
  setlistId: string,
  sourceEntry: SourceSetlistSong,
  trackIndex: TrackAliasIndex,
  order: number,
  total: number
): GeneratedSetlistEntry => {
  const classification = classifySpecialEntry(sourceEntry);
  const match = classification.special
    ? ({ status: "special", reason: classification.reason || "special_policy" } as const)
    : matchSetlistEntry(sourceEntry, trackIndex);
  const matchedTrack =
    match.status === "matched" ? trackIndex.byTrackId.get(match.trackId) : undefined;

  return {
    schemaVersion: 1,
    entryId: `${setlistId}_entry_${sourceEntry.liveItemSongUuid}`,
    order,
    rawTitle: sourceEntry.liveItemSongName,
    displayTitle: sourceEntry.liveItemSongName,
    normalizedTitle: normalizeTitle(sourceEntry.liveItemSongName),
    policy: classification.policy,
    trackId: matchedTrack?.trackId,
    aliases: matchedTrack?.aliases,
    expectedDurationSec: matchedTrack?.expectedDurationSec,
    afterglowTailSec: afterglowTailSec(match, trackIndex, order, total, classification.special),
    note: classification.reason,
    match:
      match.status === "matched"
        ? {
            status: "matched",
            score: match.score,
            candidates: match.candidates,
            reason: match.reason,
          }
        : match.status === "candidate"
          ? {
              status: "candidate",
              score: match.score,
              candidates: match.candidates,
              reason: match.reason,
            }
          : match.status === "missing"
            ? {
                status: "missing",
                candidates: match.candidates,
                reason: match.reason,
              }
            : {
                status: "special",
                reason: match.reason,
              },
  };
};

export const transformLiveToSetlists = (
  lives: SourceLive[],
  trackIndex: TrackAliasIndex
): GeneratedSetlist[] =>
  lives
    .flatMap((live) =>
      (live.items || []).map((item) => {
        const setlistId = setlistIdFor(item.liveItemUuid);
        const sourceEntries = [...(item.setList || [])];
        const entries = sourceEntries.map((entry, idx) =>
          toGeneratedEntry(setlistId, entry, trackIndex, idx + 1, sourceEntries.length)
        );

        return {
          schemaVersion: 1 as const,
          setlistId,
          tourName: live.title,
          liveTitle: titleFor(live, item),
          date: item.date || live.date || undefined,
          venueName: item.place || undefined,
          venueId: item.place ? toVenueId(item.place) : undefined,
          source: {
            type: "site_db" as const,
            liveUuid: item.liveUuid,
            liveItemUuid: item.liveItemUuid,
            sourceId: setlistId,
          },
          entries,
        };
      })
    )
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.setlistId.localeCompare(a.setlistId));

export const buildSetlistIndex = (lives: SourceLive[], setlists: GeneratedSetlist[]): SetlistIndexItem[] => {
  const liveByUuid = new Map(lives.map((live) => [live.liveUuid, live]));

  return setlists
    .map((setlist) => {
      const live = liveByUuid.get(setlist.source.liveUuid);
      const summary = {
        required: 0,
        special: 0,
        medley: 0,
        cover: 0,
        se: 0,
        unknown: 0,
      };
      setlist.entries.forEach((entry) => {
        if (entry.match.status === "special") summary.special += 1;
        if (entry.policy === "medley") summary.medley += 1;
        else if (entry.policy === "cover") summary.cover += 1;
        else if (entry.policy === "se") summary.se += 1;
        else if (entry.policy === "required") summary.required += 1;
        else summary.unknown += 1;
      });

      return {
        setlistId: setlist.setlistId,
        liveUuid: setlist.source.liveUuid,
        liveItemUuid: setlist.source.liveItemUuid,
        title: setlist.liveTitle || setlist.tourName || setlist.setlistId,
        date: setlist.date,
        venueName: setlist.venueName,
        venueId: setlist.venueId,
        type: live?.type,
        songCount: setlist.entries.length,
        playablePolicySummary: summary,
      };
    })
    .sort(
      (a, b) =>
        (b.date || "").localeCompare(a.date || "") ||
        b.liveUuid.localeCompare(a.liveUuid) ||
        b.liveItemUuid.localeCompare(a.liveItemUuid)
    );
};
