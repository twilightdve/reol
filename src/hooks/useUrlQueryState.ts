import { useCallback, useEffect, useState } from "react";

/**
 * URLクエリパラメータと React state を双方向同期する軽量フック。
 *
 * - 初期値は URL → 無ければ defaultValue
 * - setState 時に history.replaceState で URL を更新（履歴を汚さない）
 * - 値が defaultValue と一致する場合はクエリから削除し URL を綺麗に保つ
 * - SSR 時は defaultValue を返す
 */
export function useUrlQueryState<T extends string>(
  key: string,
  defaultValue: T,
  allowed?: readonly T[]
): [T, (value: T) => void] {
  const readFromUrl = useCallback((): T => {
    if (typeof window === "undefined") return defaultValue;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(key);
    if (raw === null) return defaultValue;
    if (allowed && !allowed.includes(raw as T)) return defaultValue;
    return raw as T;
  }, [key, defaultValue, allowed]);

  const [value, setValueState] = useState<T>(readFromUrl);

  // 戻る/進むに追随
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => setValueState(readFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [readFromUrl]);

  const setValue = useCallback(
    (next: T) => {
      setValueState(next);
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (next === defaultValue || next === "" || next == null) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, String(next));
      }
      // 履歴を増やさない
      window.history.replaceState({}, "", url.toString());
    },
    [key, defaultValue]
  );

  return [value, setValue];
}
