// https://redux.js.org/tutorials/typescript-quick-start

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * サイト全体で1つだけのプレイヤー(GlobalPlayer、plan/60)で今流しているもの。
 * どの枠(PlayerSlot)から始めたかを slotId で持ち、その枠が画面に見えている間は枠の上に重ねる。
 */
export type PlayerMedia = {
  /** 動画のID。再生リストの時は無い */
  videoId?: string;
  /** 再生リストのID(PL… / UU… / OLAK5uy_…) */
  list?: string;
  /** 始める位置(秒) */
  start?: number;
  /** 小窓に出す題 */
  title: string;
  /** 再生を始めた枠 */
  slotId: string;
};

export interface PlayerState {
  current: PlayerMedia | null;
}

export const initialState: PlayerState = {
  current: null,
};

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    playMedia: (state, action: PayloadAction<PlayerMedia>) => {
      state.current = action.payload;
    },
    /** 流しているものはそのままで、重ねる枠だけ替える(同じ動画の枠のあるページに戻ってきた時) */
    adoptSlot: (state, action: PayloadAction<string>) => {
      if (state.current) state.current.slotId = action.payload;
    },
    stopMedia: (state) => {
      state.current = null;
    },
  },
});

export const { playMedia, adoptSlot, stopMedia } = playerSlice.actions;

export default playerSlice.reducer;
