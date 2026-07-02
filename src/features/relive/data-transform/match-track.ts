import type { TrackAliasIndex } from "./generated-types";
import { normalizeTitle, stripVersionSuffix } from "./normalize";
import type { SourceSetlistSong } from "./source-types";

export type GeneratedTrackMatch =
  | {
      status: "matched";
      trackId: string;
      score: number;
      reason: string;
      candidates?: string[];
    }
  | {
      status: "candidate";
      score: number;
      reason: string;
      candidates: string[];
    }
  | {
      status: "missing";
      reason: string;
      candidates?: string[];
    }
  | {
      status: "special";
      reason: string;
    };

const uniqueTrackIds = (ids: string[]) => [...new Set(ids)].sort();

const collapseEntries = (entries: Array<{ trackId: string; score: number; reason: string }>) => {
  const byTrack = new Map<string, { trackId: string; score: number; reason: string }>();
  entries.forEach((entry) => {
    const current = byTrack.get(entry.trackId);
    if (!current || entry.score > current.score) {
      byTrack.set(entry.trackId, entry);
    }
  });
  return [...byTrack.values()].sort((a, b) => b.score - a.score || a.trackId.localeCompare(b.trackId));
};

const matchByNormalizedTitle = (
  rawTitle: string,
  index: TrackAliasIndex
): GeneratedTrackMatch | null => {
  const normalized = normalizeTitle(rawTitle);
  const direct = collapseEntries(index.byNormalizedTitle.get(normalized) || []);
  if (direct.length === 1) {
    return {
      status: "matched",
      trackId: direct[0].trackId,
      score: direct[0].score,
      reason: direct[0].reason,
    };
  }
  if (direct.length > 1) {
    return {
      status: "candidate",
      score: direct[0].score,
      reason: "multiple_alias_candidates",
      candidates: uniqueTrackIds(direct.map((item) => item.trackId)),
    };
  }

  const stripped = normalizeTitle(stripVersionSuffix(rawTitle));
  if (stripped && stripped !== normalized) {
    const strippedMatches = collapseEntries(index.byNormalizedTitle.get(stripped) || []);
    if (strippedMatches.length === 1) {
      return {
        status: "matched",
        trackId: strippedMatches[0].trackId,
        score: 0.85,
        reason: "version_stripped",
      };
    }
    if (strippedMatches.length > 1) {
      return {
        status: "candidate",
        score: 0.85,
        reason: "multiple_version_stripped_candidates",
        candidates: uniqueTrackIds(strippedMatches.map((item) => item.trackId)),
      };
    }
  }

  if (normalized.length >= 4) {
    const partialMatches: string[] = [];
    index.byNormalizedTitle.forEach((entries, key) => {
      if (key.length >= 4 && (key.includes(normalized) || normalized.includes(key))) {
        partialMatches.push(...entries.map((entry) => entry.trackId));
      }
    });
    const candidates = uniqueTrackIds(partialMatches);
    if (candidates.length > 0) {
      return {
        status: "candidate",
        score: 0.6,
        reason: "partial_title_match",
        candidates,
      };
    }
  }

  return null;
};

export const matchSetlistEntry = (
  entry: SourceSetlistSong,
  index: TrackAliasIndex
): GeneratedTrackMatch => {
  if (typeof entry.songUuid === "string" && entry.songUuid) {
    const bySongUuid = index.bySongUuid.get(entry.songUuid);
    if (bySongUuid) {
      return {
        status: "matched",
        trackId: bySongUuid.trackId,
        score: 1,
        reason: entry.matchSource ? `source_song_uuid:${entry.matchSource}` : "source_song_uuid",
      };
    }
  }

  const byTitle = matchByNormalizedTitle(entry.liveItemSongName, index);
  if (byTitle) {
    return byTitle;
  }

  return { status: "missing", reason: "no_discography_match" };
};
