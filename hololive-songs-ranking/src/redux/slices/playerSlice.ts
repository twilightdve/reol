// https://redux.js.org/tutorials/typescript-quick-start

import { createSlice } from "@reduxjs/toolkit";
import { RankRange } from "../../components/index-list";
import { Video } from "../../types/youtube-data";

export interface PlayerState {
  isLoaded: boolean;
  currentIndex: number;
  currentVideo: Video;
  currentChunkIndex: number;
  currentRange: RankRange;
}

const initialState: PlayerState = {
  isLoaded: false,
  currentIndex: 0,
  currentVideo: {
    videoId: "",
    title: "",
    description: "",
    thumbnail: "",
    channelId: "",
    channelTitle: "",
    viewCount: 0,
    likeCount: 0,
    publishedAt: "",
    start: 0,
    end: 0,
  },
  currentChunkIndex: 0,
  currentRange: { start: 0, end: 0 },
};

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setNextVideo: (state, action) => {
      console.log(action);
      if (!state.isLoaded) state.isLoaded = true;
      state.currentIndex = action.payload.index;
      state.currentVideo = action.payload.video;
    },
    setNextChunk: (state, action) => {
      console.log(action);
      state.currentChunkIndex = action.payload.index;
      state.currentRange = action.payload.range;
    },
  },
});

export const { setNextVideo, setNextChunk } = playerSlice.actions;

export default playerSlice.reducer;
