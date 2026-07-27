import { useCallback, useEffect, useState } from "react";

/**
 * 新規コンテンツ案C「コレクション台帳」(plan/legit-improvement-plan.md 5章)の
 * 所有/視聴済み状態。DISCOGRAPHYページに統合されているため、
 * discographyUuid を localStorage(このブラウザ内のみ)に保存するだけで、
 * アカウント登録やサーバー送信は行わない。
 *
 * 同じページ内に複数箇所(各カードの✓ボタン、全体コンプ率バー)でこのフックを
 * 呼び出すため、1箇所での変更を他のインスタンスにも反映する必要がある。
 * storageイベントは同一タブ内では発火しないため、専用のカスタムイベントで
 * 同期する。
 */
const STORAGE_KEY = "reol-collection-owned";
const CHANGE_EVENT = "reol-collection-changed";

const loadOwned = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
};

const saveOwned = (owned: Set<string>) => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Array.from(owned))
    );
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore (Safari Private mode 等)
  }
};

export const useCollectionOwned = () => {
  // マウント前(SSR/初回描画)はlocalStorageを読めないため空集合で揃え、
  // hydration mismatchを避ける。
  const [mounted, setMounted] = useState(false);
  const [owned, setOwned] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOwned(loadOwned());
    setMounted(true);

    const onChange = () => setOwned(loadOwned());
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  const toggle = useCallback((uuid: string) => {
    const next = loadOwned();
    if (next.has(uuid)) next.delete(uuid);
    else next.add(uuid);
    saveOwned(next);
    setOwned(next);
  }, []);

  return { owned, mounted, toggle };
};
