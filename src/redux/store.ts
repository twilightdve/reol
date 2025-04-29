import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import playerReducer from "./slices/playerSlice";
import routeReducer from "./slices/routeSlice";
import { ROUTE_NAMES } from "../types/common";

export const store = configureStore({
  reducer: {
    player: playerReducer,
    route: routeReducer,
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
    route: {
      currentRoute: ROUTE_NAMES[0],
    },
  },
  devTools: process.env.NODE_ENV !== "production",
});
export type AppDispatch = typeof store.dispatch;
export type RouteState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RouteState,
  unknown,
  Action<string>
>;
export default () => store;
