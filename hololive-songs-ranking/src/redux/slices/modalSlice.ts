// https://redux.js.org/tutorials/typescript-quick-start

import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface ModalState {
  isOpen: boolean;
}

const initialState: ModalState = {
  isOpen: false,
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    open: (state) => {
      state.isOpen = true;
    },
    close: (state) => {
      state.isOpen = false;
    },
  },
});

export const { open, close } = modalSlice.actions;

export default modalSlice.reducer;
