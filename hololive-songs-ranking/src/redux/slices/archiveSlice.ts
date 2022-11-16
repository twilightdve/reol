// https://redux.js.org/tutorials/typescript-quick-start

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchMasterVideos, fetchVideos, fetchChannels } from "../api";
import { Channel, Video } from "../../types/youtube-data";

export interface ArchiveState {
  videos: Video[];
  channels: { [p: string]: Channel };
  status: "idle" | "loading" | "failed";
}

const initialState: ArchiveState = {
  videos: [],
  channels: {},
  status: "idle",
};

export const fetchArchive = createAsyncThunk(
  "archive/fetchArchive",
  async (dateString: string) => {
    const [masterVideos, videos, channels] = await Promise.all([
      fetchMasterVideos(),
      fetchVideos(dateString),
      fetchChannels(dateString),
    ]);

    return {
      channels,
      videos: videos
        .slice()
        .map((video) => {
          const matchedMaster = masterVideos.find(
            (master) => master.videoId === video.videoId
          );
          return {
            ...video,
            start: matchedMaster?.start ?? 40,
            end: matchedMaster?.end ?? 100,
          };
        })
        .sort((a, b) => b.viewCount - a.viewCount),
    };
  }
);

export const archiveSlice = createSlice({
  name: "archive",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArchive.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchArchive.fulfilled, (state, action) => {
        state.status = "idle";
        state.videos = action.payload.videos;
        state.channels = action.payload.channels;
      })
      .addCase(fetchArchive.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default archiveSlice.reducer;
