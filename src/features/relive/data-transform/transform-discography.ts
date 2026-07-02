import type { GeneratedTrackMaster, TrackAliasIndex, TrackAliasIndexEntry } from "./generated-types";
import { normalizeTitle, stripParenthetical, stripVersionSuffix, uniqueStrings } from "./normalize";
import type { SourceDiscography, SourceSong, SourceSongFeature } from "./source-types";

const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const pickAudioFeature = (feature: SourceSongFeature | null | undefined) => {
  if (!feature) {
    return undefined;
  }

  return {
    tempo: toNumber(feature.tempo),
    energy: toNumber(feature.energy),
    danceability: toNumber(feature.danceability),
    loudness: toNumber(feature.loudness),
    valence: toNumber(feature.valence),
    acousticness: toNumber(feature.acousticness),
    instrumentalness: toNumber(feature.instrumentalness),
    liveness: toNumber(feature.liveness),
    key: toNumber(feature.key),
    mode: toNumber(feature.mode),
    timeSignature: toNumber(feature.timeSignature),
  };
};

const compactFeature = (feature: ReturnType<typeof pickAudioFeature>) => {
  if (!feature) {
    return undefined;
  }
  const entries = Object.entries(feature).filter(([, value]) => value !== undefined);
  return entries.length > 0 ? Object.fromEntries(entries) as NonNullable<GeneratedTrackMaster["audioFeature"]> : undefined;
};

const makeAliases = (song: SourceSong) =>
  uniqueStrings([
    song.songName,
    song.feature?.songName || undefined,
    stripParenthetical(song.songName),
    stripVersionSuffix(song.songName),
    song.feature?.songName ? stripParenthetical(song.feature.songName) : undefined,
    song.feature?.songName ? stripVersionSuffix(song.feature.songName) : undefined,
  ]).filter((alias) => alias !== song.songName);

export const transformDiscographyToTracks = (
  discographies: SourceDiscography[]
): GeneratedTrackMaster[] => {
  const trackBySongUuid = new Map<string, GeneratedTrackMaster>();

  discographies.forEach((discography) => {
    (discography.songs || []).forEach((song) => {
      if (!song.songUuid || !song.songName || trackBySongUuid.has(song.songUuid)) {
        return;
      }

      const durationMs = toNumber(song.feature?.durationMs);
      const feature = compactFeature(pickAudioFeature(song.feature));
      const isInstrumental = /instrumental|inst\.?/i.test(song.songName);

      trackBySongUuid.set(song.songUuid, {
        schemaVersion: 1,
        trackId: `song_${song.songUuid}`,
        canonicalTitle: song.songName,
        aliases: makeAliases(song),
        artistNames: uniqueStrings([discography.name, "Reol"]),
        kind: isInstrumental ? "instrumental" : "original",
        expectedDurationSec: durationMs ? Math.round(durationMs / 100) / 10 : undefined,
        matchHints: uniqueStrings([
          normalizeTitle(song.songName),
          ...makeAliases(song).map(normalizeTitle),
        ]),
        audioFeature: feature,
        source: {
          type: "fansite-discography-json",
          discographyUuid: song.discographyUuid ?? discography.discographyUuid,
          songUuid: song.songUuid,
          spotifyTrackId: song.spotifyTrackId || song.feature?.spotifyTrackId || null,
        },
      });
    });
  });

  return [...trackBySongUuid.values()].sort((a, b) => {
    const left = a.source.songUuid;
    const right = b.source.songUuid;
    return left.localeCompare(right) || a.canonicalTitle.localeCompare(b.canonicalTitle, "ja");
  });
};

const addAlias = (
  index: TrackAliasIndex,
  normalized: string,
  entry: TrackAliasIndexEntry
) => {
  if (!normalized) {
    return;
  }
  const entries = index.byNormalizedTitle.get(normalized) || [];
  if (!entries.some((item) => item.trackId === entry.trackId && item.reason === entry.reason)) {
    entries.push(entry);
    entries.sort((a, b) => b.score - a.score || a.trackId.localeCompare(b.trackId));
  }
  index.byNormalizedTitle.set(normalized, entries);
};

export const createTrackAliasIndex = (tracks: GeneratedTrackMaster[]): TrackAliasIndex => {
  const index: TrackAliasIndex = {
    bySongUuid: new Map(),
    byTrackId: new Map(),
    byNormalizedTitle: new Map(),
  };

  tracks.forEach((track) => {
    index.bySongUuid.set(track.source.songUuid, track);
    index.byTrackId.set(track.trackId, track);
    addAlias(index, normalizeTitle(track.canonicalTitle), {
      trackId: track.trackId,
      score: 1,
      reason: "exact",
    });
    track.aliases.forEach((alias) => {
      addAlias(index, normalizeTitle(alias), {
        trackId: track.trackId,
        score: 0.92,
        reason: "alias",
      });
    });
    addAlias(index, normalizeTitle(stripVersionSuffix(track.canonicalTitle)), {
      trackId: track.trackId,
      score: 0.85,
      reason: "version_stripped",
    });
  });

  return index;
};
