import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import playerReducer from "./slices/playerSlice";

export const store = configureStore({
  reducer: {
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["payload.current"],
        ignoredPaths: ["player.playerRef.current"],
      },
    });
  },
  preloadedState: {
    player: {
      isLoaded: false,
      currentVideoId: "",
      isShrinked: false,
      playerRef: null,
    },
  },
  devTools: process.env.NODE_ENV !== "production",
});
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export default () => store;
