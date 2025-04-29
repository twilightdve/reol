// https://redux.js.org/tutorials/typescript-quick-start

import { createSlice } from "@reduxjs/toolkit";
import { ROUTE_NAMES } from "../../types/common";

export interface RouteState {
  currentRoute: string;
}

export const initialState: RouteState = {
  currentRoute: ROUTE_NAMES[0],
};

export const RouteSlice = createSlice({
  name: "Route",
  initialState,
  reducers: {
    setRoute: (state, action) => {
      if (action.payload.currentRoute !== state.currentRoute) {
        state.currentRoute = action.payload.currentRoute;
      }
    },
  },
});

export const { setRoute: setRoute } = RouteSlice.actions;

export default RouteSlice.reducer;
