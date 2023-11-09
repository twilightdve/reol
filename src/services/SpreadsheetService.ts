import "dotenv/config";
import { promises as fs } from "fs";
import * as path from "path";
import * as process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google, sheets_v4 } from "googleapis";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import { OAuth2Client } from "google-auth-library";
import { Video } from "../types/youtube-data";
import { Discography, DiscographyPost, Song } from "../types/discography";
import { News } from "../types/news";
import {
  Live,
  LiveItem,
  LiveReport,
  LiveItemSong,
  LiveItemPost,
  LivePost,
} from "../types/live";

export type Index = {
  id: string;
  name: string;
};

const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const spreadsheetId = `${process.env.SPREADSHEET_ID}`;

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
        auth,
      });
    }
  }

  async getValues(range: string) {
    await this.initialize();
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
    const values = await this.getValues(`discography!A2:G`);
    return values.map((row) => ({
      discographyId: +row[0],
      title: row[1],
      releaseDate: row[2],
      name: row[3],
      format: row[4],
      siteUrl: row[5],
      xfdUrl: row[6],
    }));
  }

  async getDiscographyPosts(): Promise<DiscographyPost[]> {
    const values = await this.getValues(`discography_post!A2:F`);
    return values
      .map((row) => {
        return {
          discographyId: +row[0],
          discographyPostNo: +row[2],
          discographyPostId: row[3],
          discographyPostHTML: row[4],
        };
      })
      .filter((v) => v.discographyPostNo);
  }

  async getSongs(): Promise<Song[]> {
    const values = await this.getValues(`song!A2:J`);
    return values.map((row) => ({
      songId: +row[0],
      discographyId: +row[1],
      discographyTitle: row[2],
      songNo: +row[3],
      songName: row[4],
      tieupDescription: row[5] ?? null,
      downloadUrl: row[6] ?? null,
      musicVideoUrl: row[7] ?? null,
      lyricVideoUrl: row[8] ?? null,
      liveVideoUrl: row[9] ?? null,
    }));
  }

  async getNews(): Promise<News[]> {
    const values = await this.getValues(`news!A2:C`);
    return values.map((row) => ({
      date: row[0],
      title: row[1],
      content: row[2],
    }));
  }

  async getLives(): Promise<Live[]> {
    const values = await this.getValues(`live!A2:G`);
    return values.map((row) => ({
      liveId: +row[0],
      type: row[1],
      title: row[2],
      name: row[3],
      date: row[4],
      siteUrl: row[5] ?? null,
    }));
  }

  async getLivePosts(): Promise<LivePost[]> {
    const values = await this.getValues(`live_post!A2:F`);
    return values
      .map((row) => {
        return {
          liveId: +row[1],
          livePostNo: +row[3],
          livePostId: row[4],
          livePostHTML: row[5],
        };
      })
      .filter((v) => v.livePostNo);
  }

  async getLiveItems(): Promise<LiveItem[]> {
    const values = await this.getValues(`live_item!A2:M`);
    return values.map((row) => ({
      liveId: +row[1],
      liveItemNo: +row[3],
      liveItemName: row[4] ?? null,
      date: row[5],
      place: row[6] ?? null,
      placeSite: row[7] ?? null,
      address: row[8] ?? null,
      googleMapsUrl: row[9] ?? null,
    }));
  }

  async getLiveItemSongs(): Promise<LiveItemSong[]> {
    const values = await this.getValues(`live_item_song!A2:G`);
    return values
      .map((row) => {
        return {
          liveId: +row[1],
          liveItemNo: +row[3],
          liveItemSongNo: +row[5],
          liveItemSongName: row[6],
        };
      })
      .filter((v) => v.liveItemSongNo);
  }

  async getLiveItemPosts(): Promise<LiveItemPost[]> {
    const values = await this.getValues(`live_item_post!A2:H`);
    return values
      .map((row) => {
        return {
          liveId: +row[1],
          liveItemNo: +row[3],
          liveItemPostNo: +row[5],
          liveItemPostId: row[6],
          liveItemPostHTML: row[7],
        };
      })
      .filter((v) => v.liveItemPostNo);
  }

  async getLiveReports(): Promise<LiveReport[]> {
    const values = await this.getValues(`live_repo!A2:F`);
    return values
      .map((row) => ({
        liveId: +row[1],
        liveReportNo: +row[3],
        liveReportName: row[4],
        liveReportUrl: row[5],
      }))
      .filter((v) => v.liveReportNo);
  }
}
