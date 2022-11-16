import "dotenv/config";
import { promises as fs } from "fs";
import * as path from "path";
import * as process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google, sheets_v4 } from "googleapis";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import { OAuth2Client } from "google-auth-library";
import { Channel, MasterVideo, Video } from "../types/youtube-data";

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
    const client = await this.loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
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
      this.sheets = google.sheets({
        version: "v4",
        auth: await this.authorize(),
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

  async getMasterVideos(): Promise<MasterVideo[]> {
    const values = await this.getValues(`master/videos!A2:C`);
    return values.map((row) => ({
      videoId: row[0],
      start: +row[1],
      end: +row[2],
    }));
  }

  async getSheetIndexes(): Promise<Index[]> {
    const values = await this.getValues("index!A2:B");
    return values.map((row) => ({
      id: row[0],
      name: row[1],
    }));
  }

  async getSheetVideos(sheetName: string): Promise<{ [p: string]: Video }> {
    let videos: { [p: string]: Video } = {};
    const values = await this.getValues(`${sheetName}!A2:l`);
    values.map((row) => {
      videos[`${row[0]}`] = {
        videoId: row[0],
        title: row[1],
        description: row[2],
        thumbnail: row[3],
        channelId: row[4],
        channelTitle: row[5],
        viewCount: +row[6],
        likeCount: +row[7],
        publishedAt: row[8],
      };
    });
    return videos;
  }

  async getSheetChannels(sheetName: string) {
    let channels: { [p: string]: Channel } = {};
    const values = await this.getValues(`${sheetName}!A2:H`);
    values.map((row) => {
      channels[`${row[0]}`] = {
        channelId: row[0],
        title: row[1],
        description: row[2],
        thumbnail: row[3],
        viewCount: +row[4],
        videoCount: +row[5],
        subscriberCount: +row[6],
        publishedAt: row[7],
      };
    });
    return channels;
  }
}
