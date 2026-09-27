import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

/**
 * 新規コンテンツ案C「コレクション台帳」(plan/legit-improvement-plan.md 5章)の
 * 所有/視聴済み・参戦済み状態。DISCOGRAPHY / LIVE / PLACE の各ページに統合。
 *
 * 未ログイン時: これまで通りlocalStorage(このブラウザ内のみ)で完結する。
 * ログイン時: localStorageをキャッシュとして即時反映しつつ、Supabaseの
 * user_collectionsテーブルにも書き込む(fire-and-forget)。ログインの
 * 度にゲスト分とDB分を一度だけ合流させ(bootstrapMergeCollections、
 * AuthContext.signIn参照)、以降はDBを正とする。
 *
 * ゲストとログインユーザーで別々の状態を混同しないよう、ログイン時は
 * ユーザーIDをキーに付与する(別アカウントへの切り替え時に前のユーザーの
 * チェック状態が紛れ込まないようにするため)。
 *
 * 同じページ内に複数箇所(各カードの✓ボタン、全体コンプ率バー)でこのフックを
 * 呼び出すため、1箇所での変更を他のインスタンスにも反映する必要がある。
 * storageイベントは同一タブ内では発火しないため、専用のカスタムイベントで
 * 同期する。
 */
export type CollectionNamespace = "owned" | "attended" | "visited";

const BASE_STORAGE_KEY: Record<CollectionNamespace, string> = {
  owned: "reol-collection-owned",
  attended: "reol-collection-attended",
  visited: "reol-collection-visited",
};
const CHANGE_EVENT: Record<CollectionNamespace, string> = {
  owned: "reol-collection-changed",
  attended: "reol-collection-attended-changed",
  visited: "reol-collection-visited-changed",
};

const storageKeyFor = (ns: CollectionNamespace, userId?: string | null) =>
  userId ? `${BASE_STORAGE_KEY[ns]}:${userId}` : BASE_STORAGE_KEY[ns];

const loadOwned = (ns: CollectionNamespace, userId?: string | null): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(storageKeyFor(ns, userId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
};

const saveOwned = (ns: CollectionNamespace, owned: Set<string>, userId?: string | null) => {
  try {
    window.localStorage.setItem(
      storageKeyFor(ns, userId),
      JSON.stringify(Array.from(owned))
    );
    window.dispatchEvent(new Event(CHANGE_EVENT[ns]));
  } catch {
    // ignore (Safari Private mode 等)
  }
};

export const useCollectionOwned = (ns: CollectionNamespace = "owned") => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  // マウント前(SSR/初回描画)はlocalStorageを読めないため空集合で揃え、
  // hydration mismatchを避ける。
  const [mounted, setMounted] = useState(false);
  const [owned, setOwned] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOwned(loadOwned(ns, userId));
    setMounted(true);

    const onChange = () => setOwned(loadOwned(ns, userId));
    window.addEventListener(CHANGE_EVENT[ns], onChange);
    return () => window.removeEventListener(CHANGE_EVENT[ns], onChange);
  }, [ns, userId]);

  const toggle = useCallback(
    (uuid: string) => {
      const next = loadOwned(ns, userId);
      const willAdd = !next.has(uuid);
      if (willAdd) next.add(uuid);
      else next.delete(uuid);
      saveOwned(ns, next, userId);
      setOwned(next);

      if (userId) {
        // supabase-js は全ページ共通のJS(ヘッダー経由で読み込まれる)に含めないよう、
        // ログイン中の書き込み時にだけ動的に読み込む(AuthContext と同じ方針)
        void import("../lib/supabase").then(({ supabase }) => {
          if (!supabase) return;
          if (willAdd) {
            supabase
              .from("user_collections")
              .insert({ user_id: userId, namespace: ns, item_uuid: uuid })
              .then(({ error }) => {
                if (error) console.error("collection insert error:", error);
              });
          } else {
            supabase
              .from("user_collections")
              .delete()
              .eq("user_id", userId)
              .eq("namespace", ns)
              .eq("item_uuid", uuid)
              .then(({ error }) => {
                if (error) console.error("collection delete error:", error);
              });
          }
        });
      }
    },
    [ns, userId]
  );

  return { owned, mounted, toggle };
};
