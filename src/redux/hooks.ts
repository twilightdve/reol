import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RouteState, AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RouteState> = useSelector;
