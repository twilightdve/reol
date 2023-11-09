// https://redux.js.org/tutorials/typescript-quick-start

import { createSlice } from "@reduxjs/toolkit";
import React from "react";
import YouTube from "react-youtube";

export interface PlayerState {
  isLoaded: boolean;
  currentVideoId: string;
  isShrinked: boolean;
  playerRef: React.RefObject<YouTube> | null;
}

export const initialState: PlayerState = {
  isLoaded: false,
  currentVideoId: "",
  isShrinked: false,
  playerRef: null,
};

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setNextVideo: (state, action) => {
      if (action.payload.videoId !== state.currentVideoId) {
        state.isLoaded = false;
        state.currentVideoId = action.payload.videoId;
      }
    },
    setIsLoaded: (state, action) => {
      state.isLoaded = true;
      state.playerRef = action.payload;
    },
    setIsShrinked: (state, action) => {
      state.isShrinked = action.payload;
    },
  },
});

export const { setNextVideo, setIsLoaded, setIsShrinked } = playerSlice.actions;

export default playerSlice.reducer;
