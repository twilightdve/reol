import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { setAutoFreeze } from "immer";
import playerReducer from "./slices/playerSlice";
import routeReducer from "./slices/routeSlice";
import { ROUTE_NAMES } from "../types/common";

// Redux ストアに React の RefObject (mutable な `current` を持つ) を格納している。
// Immer のオートフリーズが有効だと、React が ref を detach する際に
// `ref.current = null` を実行できず "Cannot assign to read only property 'current'" が発生する。
setAutoFreeze(false);

export const store = configureStore({
  reducer: {
    player: playerReducer,
    route: routeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["payload.current"],
        ignoredPaths: ["player.playerRef.current"],
      },
      immutableCheck: {
        ignoredPaths: ["player.playerRef"],
      },
    }),
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
