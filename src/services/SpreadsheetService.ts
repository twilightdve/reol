/* eslint-disable */
import "dotenv/config";
import { promises as fs } from "fs";
import * as path from "path";
import * as process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google, sheets_v4 } from "googleapis";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import { OAuth2Client } from "google-auth-library";
import { Video } from "../types/youtube-data";
import {
  Discography,
  DiscographyPost,
  DiscographyRepo,
  Song,
  SongFeature,
} from "../types/discography";
import {
  Live,
  LiveItem,
  LiveReport,
  LiveItemSong,
  LiveItemPost,
  LivePost,
} from "../types/live";
import { Recommend } from "../types/recommend";
import { Place, PlaceItem } from "../types/places";

export type Index = {
  id: string;
  name: string;
};

const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const spreadsheetId = `${process.env.SPREADSHEET_ID}`;

/**
 * 各シートの列定義。
 * 既存列インデックスは GAS スクリプト `scripts/gas/add-uuid-slug.gs` の SHEET_DEFS と一致させること。
 * 新列 (uuid / slug / parentUuid) は各シートの末尾に追加される前提。
 */
const COL = {
  discography: {
    range: "discography!A2:L",
    title: 1,
    releaseDate: 2,
    name: 3,
    format: 4,
    siteUrl: 5,
    xfdUrl: 6,
    themeColorPrimary: 8,
    themeColorSecondary: 9,
    uuid: 10,
    slug: 11,
  },
  song: {
    range: "song!A2:T",
    discographyTitle: 2,
    songNo: 3,
    songName: 4,
    tieupDescription: 5,
    downloadUrl: 6,
    musicVideoUrl: 7,
    lyricVideoUrl: 8,
    liveVideoUrl: 9,
    lyricUrl: 10,
    spotifyTrackId: 11,
    lyricMember: 12,
    musicMember: 13,
    produceMember: 14,
    etcMember: 15,
    uuid: 17,
    slug: 18,
    discographyUuid: 19,
  },
  discographyRepo: {
    range: "discography_repo!A2:G",
    discographyReportName: 3,
    discographyReportUrl: 4,
    uuid: 5,
    discographyUuid: 6,
  },
  discographyPost: {
    range: "discography_post!A2:G",
    discographyPostId: 3,
    discographyPostHTML: 4,
    uuid: 5,
    discographyUuid: 6,
  },
  live: {
    range: "live!A2:K",
    type: 1,
    title: 2,
    name: 3,
    date: 4,
    siteUrl: 5,
    spotifyPlaylistId: 6,
    themeColorPrimary: 7,
    themeColorSecondary: 8,
    uuid: 9,
    slug: 10,
  },
  livePost: {
    range: "live_post!A2:J",
    livePostId: 4,
    livePostHTML: 5,
    uuid: 8,
    liveUuid: 9,
  },
  liveItem: {
    range: "live_item!A2:Q",
    liveItemName: 4,
    date: 5,
    place: 6,
    placeSite: 7,
    address: 8,
    googleMapsUrl: 9,
    spotifyPlaylistId: 10,
    uuid: 14,
    slug: 15,
    liveUuid: 16,
  },
  liveItemSong: {
    range: "live_item_song!A2:N",
    liveItemSongName: 6,
    type: 7,
    uuid: 11,
    liveItemUuid: 12,
    songUuid: 13,
  },
  liveItemPost: {
    range: "live_item_post!A2:L",
    liveItemPostId: 6,
    liveItemPostHTML: 7,
    uuid: 10,
    liveItemUuid: 11,
  },
  liveReport: {
    range: "live_repo!A2:H",
    liveReportName: 4,
    liveReportUrl: 5,
    uuid: 6,
    liveUuid: 7,
  },
  place: {
    range: "place_index!A2:G",
    type: 1,
    title: 2,
    url: 3,
    zoom: 4,
    uuid: 5,
    slug: 6,
  },
  placeItem: {
    range: "places!A2:S",
    name: 5,
    memo: 6,
    needsCost: 7,
    needsPermission: 8,
    placeUrl: 9,
    address: 10,
    mapsUrl: 11,
    mapsEmbedUrl: 12,
    lat: 13,
    lng: 14,
    zoom: 15,
    uuid: 16,
    slug: 17,
    placeUuid: 18,
  },
} as const;

const str = (v: unknown): string => (v == null ? "" : String(v));
const strOrNull = (v: unknown): string | null => {
  const s = str(v).trim();
  return s === "" ? null : s;
};

export class SheetService {
  sheets: sheets_v4.Sheets | undefined;
  constructor() {}

  async loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content.toString());
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

  async saveCredentials(client: JSONClient | OAuth2Client | null) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content.toString());
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: "authorized_user",
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client?.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }

  async authorize() {
    const oAuth2Client = await authenticate({
      scopes,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (oAuth2Client.credentials) {
      await this.saveCredentials(oAuth2Client);
    }
    return oAuth2Client;
  }

  async initialize() {
    if (!this.sheets) {
      const client = await this.loadSavedCredentialsIfExist();
      const auth = client ? client : await this.authorize();
      await this.loadSavedCredentialsIfExist();
      this.sheets = google.sheets({
        version: "v4",
        auth: auth as OAuth2Client,
      });
    }
  }

  async getValues(range: string) {
    const res = await this.sheets?.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = res?.data.values;
    if (!rows || rows.length === 0) {
      throw new Error("No data found.");
    }
    return rows ?? [];
  }

  async getRowValues(sheetName: string): Promise<string[]> {
    const values = await this.getValues(`${sheetName}!A1:A`);
    return values.flat(1);
  }

  async getMusicVideos(): Promise<Video[]> {
    const values = await this.getValues(`mv!A2:E`);
    return values.map((row) => ({
      videoId: row[0],
      title: row[1],
      description: row[2],
      thumbnail: row[3],
      publishedAt: row[4],
    }));
  }

  async getDiscography(): Promise<Discography[]> {
    const values = await this.getValues(COL.discography.range);
    return values
      .map((row) => ({
        discographyUuid: str(row[COL.discography.uuid]),
        slug: str(row[COL.discography.slug]),
        title: str(row[COL.discography.title]),
        releaseDate: str(row[COL.discography.releaseDate]),
        name: str(row[COL.discography.name]),
        format: str(row[COL.discography.format]),
        siteUrl: str(row[COL.discography.siteUrl]),
        xfdUrl: strOrNull(row[COL.discography.xfdUrl]),
        themeColorPrimary: strOrNull(row[COL.discography.themeColorPrimary]),
        themeColorSecondary: strOrNull(
          row[COL.discography.themeColorSecondary]
        ),
      }))
      .filter((v) => v.discographyUuid !== "");
  }

  async getDiscographyRepos(): Promise<DiscographyRepo[]> {
    const values = await this.getValues(COL.discographyRepo.range);
    return values
      .map((row) => ({
        discographyRepoUuid: str(row[COL.discographyRepo.uuid]),
        discographyUuid: str(row[COL.discographyRepo.discographyUuid]),
        discographyReportName: str(
          row[COL.discographyRepo.discographyReportName]
        ),
        discographyReportUrl: str(
          row[COL.discographyRepo.discographyReportUrl]
        ),
      }))
      .filter((v) => v.discographyRepoUuid !== "");
  }

  async getDiscographyPosts(): Promise<DiscographyPost[]> {
    const values = await this.getValues(COL.discographyPost.range);
    return values
      .map((row) => ({
        discographyPostUuid: str(row[COL.discographyPost.uuid]),
        discographyUuid: str(row[COL.discographyPost.discographyUuid]),
        discographyPostId: str(row[COL.discographyPost.discographyPostId]),
        discographyPostHTML: str(row[COL.discographyPost.discographyPostHTML]),
      }))
      .filter((v) => v.discographyPostUuid !== "");
  }

  async getSongs(): Promise<Song[]> {
    const values = await this.getValues(COL.song.range);
    return values
      .map((row) => ({
        songUuid: str(row[COL.song.uuid]),
        slug: str(row[COL.song.slug]),
        discographyUuid: str(row[COL.song.discographyUuid]),
        discographyTitle: str(row[COL.song.discographyTitle]),
        songNo: +str(row[COL.song.songNo] ?? 0),
        songName: str(row[COL.song.songName]),
        tieupDescription: str(row[COL.song.tieupDescription]),
        downloadUrl: strOrNull(row[COL.song.downloadUrl]),
        musicVideoUrl: strOrNull(row[COL.song.musicVideoUrl]),
        lyricVideoUrl: strOrNull(row[COL.song.lyricVideoUrl]),
        liveVideoUrl: strOrNull(row[COL.song.liveVideoUrl]),
        lyricUrl: strOrNull(row[COL.song.lyricUrl]),
        spotifyTrackId: strOrNull(row[COL.song.spotifyTrackId]),
        lyricMember: strOrNull(row[COL.song.lyricMember]),
        musicMember: strOrNull(row[COL.song.musicMember]),
        produceMember: strOrNull(row[COL.song.produceMember]),
        etcMember: strOrNull(row[COL.song.etcMember]),
      }))
      .filter((v) => v.songUuid !== "");
  }

  async getSongFeature(): Promise<SongFeature[]> {
    const values = await this.getValues(`song_feature!A2:R`);
    return values.map((row) => ({
      spotifyTrackId: row[2],
      songName: row[1],
      popularity: row[4],
      danceability: +row[5],
      energy: +row[6],
      key: +row[7],
      loudness: +row[8],
      mode: +row[9],
      speechiness: +row[10],
      acousticness: +row[11],
      instrumentalness: +row[12],
      liveness: +row[13],
      valence: +row[14],
      tempo: +row[15],
      durationMs: +row[16],
      timeSignature: +row[17],
    }));
  }

  async getLives(): Promise<Live[]> {
    const values = await this.getValues(COL.live.range);
    return values
      .map((row) => ({
        liveUuid: str(row[COL.live.uuid]),
        slug: str(row[COL.live.slug]),
        type: str(row[COL.live.type]),
        title: str(row[COL.live.title]),
        name: str(row[COL.live.name]),
        date: str(row[COL.live.date]),
        siteUrl: strOrNull(row[COL.live.siteUrl]),
        spotifyPlaylistId: strOrNull(row[COL.live.spotifyPlaylistId]),
        themeColorPrimary: strOrNull(row[COL.live.themeColorPrimary]),
        themeColorSecondary: strOrNull(row[COL.live.themeColorSecondary]),
      }))
      .filter((v) => v.liveUuid !== "");
  }

  async getLivePosts(): Promise<LivePost[]> {
    const values = await this.getValues(COL.livePost.range);
    return values
      .map((row) => ({
        livePostUuid: str(row[COL.livePost.uuid]),
        liveUuid: str(row[COL.livePost.liveUuid]),
        livePostId: str(row[COL.livePost.livePostId]),
        livePostHTML: str(row[COL.livePost.livePostHTML]),
      }))
      .filter((v) => v.livePostUuid !== "");
  }

  async getLiveItems(): Promise<LiveItem[]> {
    const values = await this.getValues(COL.liveItem.range);
    return values
      .map((row) => ({
        liveItemUuid: str(row[COL.liveItem.uuid]),
        slug: str(row[COL.liveItem.slug]),
        liveUuid: str(row[COL.liveItem.liveUuid]),
        liveItemName: strOrNull(row[COL.liveItem.liveItemName]),
        date: str(row[COL.liveItem.date]),
        place: strOrNull(row[COL.liveItem.place]),
        placeSite: strOrNull(row[COL.liveItem.placeSite]),
        address: strOrNull(row[COL.liveItem.address]),
        googleMapsUrl: strOrNull(row[COL.liveItem.googleMapsUrl]),
        spotifyPlaylistId: strOrNull(row[COL.liveItem.spotifyPlaylistId]),
      }))
      .filter((v) => v.liveItemUuid !== "");
  }

  async getLiveItemSongs(): Promise<LiveItemSong[]> {
    const values = await this.getValues(COL.liveItemSong.range);
    return values
      .map((row) => {
        const rawType = (row[COL.liveItemSong.type] ?? "")
          .toString()
          .trim()
          .toLowerCase();
        const allowed = [
          "song",
          "inst",
          "cover",
          "medley",
          "segment",
          "live_only",
        ] as const;
        const type = (allowed as readonly string[]).includes(rawType)
          ? (rawType as LiveItemSong["type"])
          : null;
        return {
          liveItemSongUuid: str(row[COL.liveItemSong.uuid]),
          liveItemUuid: str(row[COL.liveItemSong.liveItemUuid]),
          liveItemSongName: str(row[COL.liveItemSong.liveItemSongName]),
          type,
          songUuid: strOrNull(row[COL.liveItemSong.songUuid]),
        };
      })
      .filter((v) => v.liveItemSongUuid !== "");
  }

  async getLiveItemPosts(): Promise<LiveItemPost[]> {
    const values = await this.getValues(COL.liveItemPost.range);
    return values
      .map((row) => ({
        liveItemPostUuid: str(row[COL.liveItemPost.uuid]),
        liveItemUuid: str(row[COL.liveItemPost.liveItemUuid]),
        liveItemPostId: str(row[COL.liveItemPost.liveItemPostId]),
        liveItemPostHTML: str(row[COL.liveItemPost.liveItemPostHTML]),
      }))
      .filter((v) => v.liveItemPostUuid !== "");
  }

  async getLiveReports(): Promise<LiveReport[]> {
    const values = await this.getValues(COL.liveReport.range);
    return values
      .map((row) => ({
        liveReportUuid: str(row[COL.liveReport.uuid]),
        liveUuid: str(row[COL.liveReport.liveUuid]),
        liveReportName: str(row[COL.liveReport.liveReportName]),
        liveReportUrl: str(row[COL.liveReport.liveReportUrl]),
      }))
      .filter((v) => v.liveReportUuid !== "");
  }

  async getRecommends(): Promise<Recommend[]> {
    const values = await this.getValues(`recommend!A2:B`);
    return values.map((row) => ({
      no: +row[0],
      id: row[1],
    }));
  }

  async getPlaces(): Promise<Place[]> {
    const values = await this.getValues(COL.place.range);
    return values
      .map((row) => ({
        placeUuid: str(row[COL.place.uuid]),
        slug: str(row[COL.place.slug]),
        type: str(row[COL.place.type]),
        title: str(row[COL.place.title]),
        url: str(row[COL.place.url]),
        zoom: +str(row[COL.place.zoom] ?? 0),
      }))
      .filter((v) => v.placeUuid !== "");
  }

  async getPlaceItems(): Promise<PlaceItem[]> {
    const values = await this.getValues(COL.placeItem.range);
    return values
      .map((row) => ({
        placeItemUuid: str(row[COL.placeItem.uuid]),
        slug: str(row[COL.placeItem.slug]),
        placeUuid: str(row[COL.placeItem.placeUuid]),
        name: str(row[COL.placeItem.name]),
        memo: str(row[COL.placeItem.memo]),
        needsCost: !!row[COL.placeItem.needsCost],
        needsPermission: !!row[COL.placeItem.needsPermission],
        placeUrl: str(row[COL.placeItem.placeUrl]),
        address: str(row[COL.placeItem.address]),
        mapsUrl: str(row[COL.placeItem.mapsUrl]),
        mapsEmbedUrl: str(row[COL.placeItem.mapsEmbedUrl]),
        lat: +str(row[COL.placeItem.lat] ?? 0),
        lng: +str(row[COL.placeItem.lng] ?? 0),
        zoom: +str(row[COL.placeItem.zoom] ?? 0),
      }))
      .filter((v) => v.placeItemUuid !== "");
  }
}
