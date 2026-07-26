import { useSyncExternalStore, useCallback } from "react";

/**
 * サイト全体のライト/ダークテーマ切替。
 *
 * 実体は <html> の `light` クラス有無 (デフォルト = dark、`.light` 付与で明色)。
 * gatsby-ssr.tsx の inline script が初回描画前に localStorage を読んで
 * クラスを確定させるため (FOUC 対策)、ここでは DOM とほぼ同期するだけでよい。
 * 複数コンポーネントから同時に参照されるため、window イベントで同期する。
 */
export type Theme = "dark" | "light";

const STORAGE_KEY = "reol-theme";
const THEME_CHANGE_EVENT = "reol-theme-change";

const getSnapshot = (): Theme => {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
};

const getServerSnapshot = (): Theme => "dark";

const subscribe = (callback: () => void): (() => void) => {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
};

const applyTheme = (theme: Theme): void => {
  document.documentElement.classList.toggle("light", theme === "light");
  window.localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
};

export const useTheme = (): { theme: Theme; toggleTheme: () => void; setTheme: (t: Theme) => void } => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((t: Theme) => applyTheme(t), []);
  const toggleTheme = useCallback(() => {
    applyTheme(getSnapshot() === "light" ? "dark" : "light");
  }, []);

  return { theme, toggleTheme, setTheme };
};
