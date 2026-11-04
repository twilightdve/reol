import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import playerReducer from "./slices/playerSlice";
import routeReducer from "./slices/routeSlice";
import { ROUTE_NAMES } from "../types/common";

export const store = configureStore({
  reducer: {
    player: playerReducer,
    route: routeReducer,
  },
  preloadedState: {
    player: {
      current: null,
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
