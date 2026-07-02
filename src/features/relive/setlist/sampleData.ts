import { withPrefix } from "gatsby";
import type { Setlist, TrackMaster, VenuePreset } from "../types/relive";
import { deriveVenueAcoustic } from "./acousticDerivation";

type TracksJson = {
  schemaVersion: 1;
  updatedAt?: string;
  tracks: TrackMaster[];
};

type VenuesJson = {
  schemaVersion: 1;
  updatedAt: string;
  venuePresets: VenuePreset[];
};

type GeneratedVenue = {
  schemaVersion: 1;
  venueId: string;
  name: string;
  type: "live_house" | "hall" | "arena" | "exhibition" | "outdoor_festival" | "virtual" | "unknown";
  capacity: number | null;
  capacityStatus: "needs_web_verification" | "verified" | "unknown";
};

type GeneratedVenuesJson = {
  schemaVersion: 1;
  venues: GeneratedVenue[];
};

type GeneratedSetlistsIndexJson = {
  schemaVersion: 1;
  setlists: GeneratedSetlistIndexItem[];
};

export type GeneratedSetlistIndexItem = {
  setlistId: string;
  liveUuid: string;
  liveItemUuid: string;
  title: string;
  date?: string;
  venueName?: string;
  venueId?: string;
  type?: string | null;
  songCount: number;
};

export type ReliveSampleData = {
  tracks: TrackMaster[];
  venues: VenuePreset[];
  setlist: Setlist;
  setlistsIndex: GeneratedSetlistIndexItem[];
};

const fallbackTracks = require("./data/tracks.json") as TracksJson;
const fallbackVenues = require("./data/venues.json") as VenuesJson;
const fallbackSetlist = require("./data/sample_bijigaku_2026_asahikawa.json") as Setlist;

export const bundledSampleData: ReliveSampleData = {
  tracks: fallbackTracks.tracks,
  venues: fallbackVenues.venuePresets,
  setlist: fallbackSetlist,
  setlistsIndex: [
    {
      setlistId: fallbackSetlist.setlistId,
      liveUuid: "",
      liveItemUuid: "",
      title: fallbackSetlist.liveTitle || fallbackSetlist.tourName || fallbackSetlist.setlistId,
      date: fallbackSetlist.date,
      venueName: fallbackSetlist.venueName,
      venueId: fallbackSetlist.venueId,
      songCount: fallbackSetlist.entries.length,
    },
  ],
};

const readJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(withPrefix(path));
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json() as Promise<T>;
};

const toVenuePreset = (venue: GeneratedVenue): VenuePreset => ({
  schemaVersion: 1,
  venueId: venue.venueId,
  name: venue.name,
  type:
    venue.type === "outdoor_festival"
      ? "outdoor"
      : venue.type === "exhibition" || venue.type === "virtual" || venue.type === "unknown"
        ? "other"
        : venue.type,
  acoustic: deriveVenueAcoustic(venue),
  visualBias: {
    darkness: venue.type === "live_house" ? 0.84 : 0.74,
    particleDensity: venue.type === "arena" ? 0.86 : 0.66,
    afterglowDecay: venue.type === "hall" || venue.type === "arena" ? 0.92 : 0.86,
    bloomBias: venue.type === "arena" ? 0.82 : 0.64,
    fractureBias: venue.type === "live_house" ? 0.72 : 0.5,
    pressureBias: venue.type === "live_house" ? 0.78 : 0.62,
  },
  notes: `capacity: ${venue.capacity ?? "null"} / ${venue.capacityStatus}`,
});

export const loadReliveSampleData = async (): Promise<ReliveSampleData> => {
  const [tracksJson, venuesJson, setlistsIndex] = await Promise.all([
    readJson<TracksJson>("/relive/generated/tracks.json"),
    readJson<GeneratedVenuesJson>("/relive/generated/venues.json"),
    readJson<GeneratedSetlistsIndexJson>("/relive/generated/setlists/index.json"),
  ]);
  const selectedSetlist =
    setlistsIndex.setlists.find((item) => item.songCount > 0)?.setlistId ||
    setlistsIndex.setlists[0]?.setlistId;
  if (!selectedSetlist) {
    throw new Error("Generated relive setlist index is empty");
  }
  const setlist = await readJson<Setlist>(`/relive/generated/setlists/${selectedSetlist}.json`);

  return {
    tracks: tracksJson.tracks,
    venues: venuesJson.venues.map(toVenuePreset),
    setlist,
    setlistsIndex: setlistsIndex.setlists,
  };
};

export const loadGeneratedSetlist = (setlistId: string) =>
  readJson<Setlist>(`/relive/generated/setlists/${setlistId}.json`);
