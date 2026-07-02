import { classifySpecialEntry } from "../classify-entry";
import { inferVenueType } from "../infer-venue";
import { matchSetlistEntry } from "../match-track";
import { normalizeTitle, normalizeVenueName } from "../normalize";
import { createTrackAliasIndex, transformDiscographyToTracks } from "../transform-discography";
import { transformLiveToSetlists, transformLiveToVenues } from "../transform-live";
import { buildVenueEnrichmentIndex } from "../venue-enrichment";
import { buildVenueLayouts } from "../venue-layouts";

const discographies = [
  {
    discographyUuid: "disc-uuid-1",
    title: "Test Disc",
    name: "Reol",
    songs: [
      {
        songUuid: "song-uuid-10",
        discographyUuid: "disc-uuid-1",
        discographyTitle: "Test Disc",
        songNo: 1,
        songName: "感情御中 -WANT U LUV IT",
        spotifyTrackId: "spotify-1",
        feature: {
          spotifyTrackId: "spotify-1",
          songName: "感情御中 - WANT U LUV IT",
          durationMs: 175231,
          energy: 0.9,
          danceability: 0.6,
          tempo: 145,
        },
      },
    ],
  },
];

const lives = [
  {
    liveUuid: "live-uuid-1",
    type: "oneman",
    title: "Test Live",
    name: "Reol",
    date: "2026-01-01",
    items: [
      {
        liveUuid: "live-uuid-1",
        liveItemUuid: "live-item-uuid-1",
        liveItemName: "Tokyo",
        date: "2026-01-01",
        place: "日本武道館",
        placeSite: "https://example.com",
        address: "東京都",
        googleMapsUrl: null,
        spotifyPlaylistId: null,
        setList: [
          {
            liveItemSongUuid: "lis-uuid-1",
            liveItemUuid: "live-item-uuid-1",
            liveItemSongName: "感情御中 - WANT U LUV IT",
          },
          {
            liveItemSongUuid: "lis-uuid-2",
            liveItemUuid: "live-item-uuid-1",
            liveItemSongName: "-Opening-",
            type: "segment" as const,
          },
          {
            liveItemSongUuid: "lis-uuid-3",
            liveItemUuid: "live-item-uuid-1",
            liveItemSongName: "A<br/>B",
            type: "medley" as const,
          },
        ],
      },
    ],
  },
];

describe("relive data transform", () => {
  it("normalizes titles and venue names", () => {
    expect(normalizeTitle("感情御中 - WANT U LUV IT-")).toBe("感情御中wantuluvit");
    expect(normalizeVenueName("Spotify O-EAST")).toBe("spotify_o_east");
  });

  it("infers venue types without capacity guesses", () => {
    expect(inferVenueType("日本武道館").type).toBe("arena");
    expect(inferVenueType("Spotify O-EAST").type).toBe("live_house");
    expect(inferVenueType("YouTube").type).toBe("virtual");
  });

  it("builds tracks, matches aliases, and classifies special entries", () => {
    const tracks = transformDiscographyToTracks(discographies);
    const index = createTrackAliasIndex(tracks);
    expect(tracks).toHaveLength(1);
    expect(matchSetlistEntry(lives[0].items![0].setList![0], index).status).toBe("matched");
    expect(classifySpecialEntry(lives[0].items![0].setList![1]).special).toBe(true);
    expect(classifySpecialEntry(lives[0].items![0].setList![2]).policy).toBe("medley");
  });

  it("builds setlists and venues from source JSON shape", () => {
    const tracks = transformDiscographyToTracks(discographies);
    const index = createTrackAliasIndex(tracks);
    const setlists = transformLiveToSetlists(lives, index);
    const venues = transformLiveToVenues(lives);

    expect(setlists).toHaveLength(1);
    expect(setlists[0].entries).toHaveLength(3);
    expect(setlists[0].entries[0].match.status).toBe("matched");
    expect(venues[0].capacity).toBeNull();
    expect(venues[0].capacityStatus).toBe("needs_web_verification");
  });

  it("applies externally verified venue enrichment without guessing", () => {
    const enriched = transformLiveToVenues(
      lives,
      buildVenueEnrichmentIndex({
        schemaVersion: 1,
        updatedAt: "2026-05-17",
        policy: "test",
        venues: [
          {
            venueIds: ["venue_日本武道館"],
            canonicalName: "日本武道館",
            type: "arena",
            capacity: 14471,
            capacityStatus: "verified",
            capacityKind: "max",
            verifiedAt: "2026-05-17",
            sources: [
              {
                title: "日本武道館 施設概要",
                url: "https://example.com/budokan",
                sourceType: "official",
                fields: ["capacity"],
              },
            ],
          },
        ],
      })
    );

    expect(enriched[0].capacity).toBe(14471);
    expect(enriched[0].capacityStatus).toBe("verified");
    expect(enriched[0].verificationSources?.[0].sourceType).toBe("official");
  });

  it("builds base venue layouts and merges overrides", () => {
    const venues = transformLiveToVenues(lives);
    const result = buildVenueLayouts(
      "2026-05-17T00:00:00.000Z",
      venues,
      {
        schemaVersion: 1,
        updatedAt: "2026-05-17T00:00:00.000Z",
        layouts: [
          {
            venueId: "venue_日本武道館",
            layoutStatus: "partially_verified",
            capacity: {
              standing: null,
              seated: 14471,
              total: 14471,
              status: "verified",
              sourceUrl: "https://example.com/budokan",
            },
            floors: {
              count: 3,
              hasBalcony: true,
              hasSecondFloor: true,
              status: "partially_verified",
            },
            additionalZones: [
              {
                zoneId: "second_floor_center",
                name: "2階中央",
                type: "second_floor",
                listenerPreset: { normalizedX: 0, normalizedZ: 0.62, y: 1 },
              },
            ],
            sourceUrls: [
              {
                sourceType: "official_venue_page",
                title: "日本武道館",
                url: "https://example.com/budokan",
                checkedAt: "2026-05-17",
              },
            ],
          },
        ],
      },
      {
        type: "generated-from-venues",
        venuesPath: "/relive/generated/venues.json",
        overridePath: "src/data/relive/venue-layout-overrides.json",
      }
    );

    expect(result.venueLayoutsJson.layouts).toHaveLength(1);
    expect(result.venueLayoutsJson.layouts[0].layoutShape).toBe("arena_bowl");
    expect(result.venueLayoutsJson.layouts[0].audienceMode).toBe("mixed");
    expect(result.venueLayoutsJson.layouts[0].layoutStatus).toBe("partially_verified");
    expect(result.venueLayoutsJson.layouts[0].capacity?.status).toBe("verified");
    expect(result.venueLayoutsJson.layouts[0].zones.map((zone) => zone.zoneId)).toContain("second_floor_center");
    expect(result.venueLayoutCoverageJson.counts.withOverrides).toBe(1);
    expect(result.venueLayoutCoverageJson.counts.withCapacity).toBe(1);
  });
});
