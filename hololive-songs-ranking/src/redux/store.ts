import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import archiveReducer from "./slices/archiveSlice";
import modalReducer from "./slices/modalSlice";
import playerReducer from "./slices/playerSlice";

export const store = configureStore({
  reducer: {
    archives: archiveReducer,
    modal: modalReducer,
    player: playerReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
