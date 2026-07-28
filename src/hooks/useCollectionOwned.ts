import { useCallback, useEffect, useState } from "react";

/**
 * 新規コンテンツ案C「コレクション台帳」(plan/legit-improvement-plan.md 5章)の
 * 所有/視聴済み・参戦済み状態。DISCOGRAPHY / LIVE の各ページに統合されているため、
 * 対象のuuidをlocalStorage(このブラウザ内のみ)に保存するだけで、
 * アカウント登録やサーバー送信は行わない。
 *
 * DISCOGRAPHYの「所有/視聴済み」、LIVEの「参戦済み」、PLACEの「巡礼済み」は
 * 別の記録なので、namespace ごとにストレージキーを分ける(混ざらないように)。
 *
 * 同じページ内に複数箇所(各カードの✓ボタン、全体コンプ率バー)でこのフックを
 * 呼び出すため、1箇所での変更を他のインスタンスにも反映する必要がある。
 * storageイベントは同一タブ内では発火しないため、専用のカスタムイベントで
 * 同期する。
 */
export type CollectionNamespace = "owned" | "attended" | "visited";

const STORAGE_KEY: Record<CollectionNamespace, string> = {
  owned: "reol-collection-owned",
  attended: "reol-collection-attended",
  visited: "reol-collection-visited",
};
const CHANGE_EVENT: Record<CollectionNamespace, string> = {
  owned: "reol-collection-changed",
  attended: "reol-collection-attended-changed",
  visited: "reol-collection-visited-changed",
};

const loadOwned = (ns: CollectionNamespace): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY[ns]);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
};

const saveOwned = (ns: CollectionNamespace, owned: Set<string>) => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY[ns],
      JSON.stringify(Array.from(owned))
    );
    window.dispatchEvent(new Event(CHANGE_EVENT[ns]));
  } catch {
    // ignore (Safari Private mode 等)
  }
};

export const useCollectionOwned = (ns: CollectionNamespace = "owned") => {
  // マウント前(SSR/初回描画)はlocalStorageを読めないため空集合で揃え、
  // hydration mismatchを避ける。
  const [mounted, setMounted] = useState(false);
  const [owned, setOwned] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOwned(loadOwned(ns));
    setMounted(true);

    const onChange = () => setOwned(loadOwned(ns));
    window.addEventListener(CHANGE_EVENT[ns], onChange);
    return () => window.removeEventListener(CHANGE_EVENT[ns], onChange);
  }, [ns]);

  const toggle = useCallback(
    (uuid: string) => {
      const next = loadOwned(ns);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      saveOwned(ns, next);
      setOwned(next);
    },
    [ns]
  );

  return { owned, mounted, toggle };
};
