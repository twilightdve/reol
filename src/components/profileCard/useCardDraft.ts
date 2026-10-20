/**
 * プロフィールカード(plan/48)の入力内容の保存と、カードに入れる情報の組み立て。
 *
 * - 非会員: このブラウザの localStorage だけ(消えることがある。画面に明記する)。
 * - 会員: localStorage(ユーザーごとのキー)に加えて、アカウントにも保存する(get_my_card / set_my_card)。
 *   アカウント保存用の関数がまだ無い(SQL 未実行)時は、この端末だけに保存して動く。
 * - Reol タイプ・参戦記録は保存せず、その時のプロフィール・記録から毎回作る(載せるかどうかだけ保存)。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCollectionOwned } from "../../hooks/useCollectionOwned";
import { CARD_LIMITS, CardPayload, SnsKey, normalizeSnsId, sanitizePayload, SNS } from "../../utils/profileCard/codec";

export type CardDraft = {
  name: string;
  songs: string[];
  /** カバー曲(歌ってみた) */
  covers: string[];
  showType: boolean;
  showLives: boolean;
  sns: Partial<Record<SnsKey, string>>;
  bio: string;
  event: string;
};

export type LiveItemRef = { uuid: string; date: string | null; label: string };

const STORAGE_KEY = "reol-profile-card";
const keyFor = (userId: string | null) => (userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY);

const emptyDraft = (): CardDraft => ({ name: "", songs: [], covers: [], showType: true, showLives: true, sns: {}, bio: "", event: "" });

const parseDraft = (raw: unknown): CardDraft | null => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<CardDraft>;
  return {
    name: typeof r.name === "string" ? r.name : "",
    songs: Array.isArray(r.songs) ? r.songs.filter((s): s is string => typeof s === "string").slice(0, CARD_LIMITS.songs) : [],
    covers: Array.isArray(r.covers) ? r.covers.filter((s): s is string => typeof s === "string").slice(0, CARD_LIMITS.covers) : [],
    showType: r.showType !== false,
    showLives: r.showLives !== false,
    sns: r.sns && typeof r.sns === "object" ? (r.sns as CardDraft["sns"]) : {},
    bio: typeof r.bio === "string" ? r.bio : "",
    event: typeof r.event === "string" ? r.event : "",
  };
};

const readLocal = (userId: string | null): CardDraft | null => {
  try {
    const raw = window.localStorage.getItem(keyFor(userId));
    return raw ? parseDraft(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

const writeLocal = (userId: string | null, draft: CardDraft) => {
  try {
    window.localStorage.setItem(keyFor(userId), JSON.stringify(draft));
  } catch {
    // プライベートモードなどで保存できない時は、画面を閉じるまでだけ残る
  }
};

/** 「2018.06.10 公演名」の形 */
export const liveLabel = (date: string | null, title: string | null, itemName: string | null): string =>
  [date ? date.trim().slice(0, 10).replace(/-/g, ".") : null, title, itemName].filter(Boolean).join(" ");

/** 入力から QR に入れる中身を作る(載せない項目・空の項目は入れない) */
export const buildPayload = (
  draft: CardDraft,
  sources: { typeCode: string | null; lives: LiveItemRef[] }
): CardPayload | null => {
  const x: Partial<Record<SnsKey, string>> = {};
  for (const s of SNS) {
    const id = draft.sns[s.key] ? normalizeSnsId(s.key, draft.sns[s.key]!) : null;
    if (id) x[s.key] = id;
  }
  const sorted = [...sources.lives].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  return sanitizePayload({
    v: 1,
    n: draft.name,
    s: draft.songs,
    c: draft.covers,
    t: draft.showType ? sources.typeCode ?? undefined : undefined,
    a:
      draft.showLives && sorted.length > 0
        ? { c: sorted.length, f: sorted[0].label, l: sorted[sorted.length - 1].label }
        : undefined,
    x,
    b: draft.bio,
    e: draft.event,
  });
};

type RemoteState = "unknown" | "available" | "unavailable";
/** アカウントへの保存の状態(会員でアカウントに保存できる時だけ使う) */
export type SaveState = "saved" | "pending" | "saving" | "error";

export const useCardDraft = (allLives: LiveItemRef[]) => {
  const { user, profile } = useAuth();
  const userId = user?.id ?? null;
  const [draft, setDraft] = useState<CardDraft>(emptyDraft);
  const [loaded, setLoaded] = useState(false);
  const [remote, setRemote] = useState<RemoteState>("unknown");
  // 保存する時に送る最新の入力(タイマーから読むため ref にも持つ)
  const latest = useRef<CardDraft>(emptyDraft());
  const { owned: attended, mounted: attendedMounted } = useCollectionOwned("attended");

  // 読み込み: この端末の保存 → (会員なら)アカウントの保存で上書き。何も無ければプロフィールから最初の値を入れる
  useEffect(() => {
    let alive = true;
    const local = readLocal(userId);
    const initial = local ?? {
      ...emptyDraft(),
      name: userId ? profile?.username || profile?.full_name || user?.username || "" : "",
      songs: profile?.favorite_song ? [profile.favorite_song] : [],
    };
    setDraft(initial);
    latest.current = initial;
    setLoaded(true);
    if (!userId) {
      setRemote("unavailable");
      return;
    }
    (async () => {
      try {
        const { supabase } = await import("../../lib/supabase");
        if (!supabase) throw new Error("no supabase");
        const { data, error } = await supabase.rpc("get_my_card");
        if (!alive) return;
        if (error) throw error;
        setRemote("available");
        const fromRemote = parseDraft(data);
        if (fromRemote) {
          setDraft(fromRemote);
          latest.current = fromRemote;
          writeLocal(userId, fromRemote);
        }
      } catch {
        if (alive) setRemote("unavailable");
      }
    })();
    return () => {
      alive = false;
    };
    // プロフィールは最初の値にだけ使う(読み込み直しはしない)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // 保存: この端末にはすぐ、アカウントには少し待ってから(「保存」ボタンでは待たずに)
  const timer = useRef<number | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const useRemote = !!userId && remote === "available";

  const pushRemote = useCallback(async (): Promise<boolean> => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setSaveState("saving");
    try {
      const { supabase } = await import("../../lib/supabase");
      if (!supabase) throw new Error("no supabase");
      const { data, error } = await supabase.rpc("set_my_card", { p_card: latest.current });
      if (error || data !== true) throw error ?? new Error("not saved");
      // 保存している間に書き換えた時は、まだ保存待ち
      setSaveState(timer.current ? "pending" : "saved");
      return true;
    } catch {
      // この端末には残っている。次の変更か「保存」でまた送る
      setSaveState("error");
      return false;
    }
  }, []);

  const update = useCallback(
    (patch: Partial<CardDraft>) => {
      setDraft((prev) => {
        const next = { ...prev, ...patch };
        latest.current = next;
        writeLocal(userId, next);
        if (useRemote) {
          setSaveState("pending");
          if (timer.current) window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => void pushRemote(), 800);
        }
        return next;
      });
    },
    [userId, useRemote, pushRemote]
  );

  /** 「保存」ボタン: 会員はアカウントへすぐ送る。非会員はこの端末に保存し直す */
  const saveNow = useCallback(async (): Promise<boolean> => {
    writeLocal(userId, latest.current);
    if (!useRemote) return true;
    return pushRemote();
  }, [userId, useRemote, pushRemote]);

  // ページを離れる時に保存待ちがあれば送る
  useEffect(
    () => () => {
      if (timer.current) void pushRemote();
    },
    [pushRemote]
  );

  // 静的HTMLと最初の描画は null(読み込み後に入れる。食い違いを避ける)
  const typeCode = useMemo(() => {
    if (!loaded) return null;
    if (profile?.reol_type) return profile.reol_type;
    try {
      return window.localStorage.getItem("reol_type_result");
    } catch {
      return null;
    }
    // loaded の後に読み直す(静的HTMLの時は window が無い)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.reol_type, loaded]);

  const lives = useMemo(
    () => (attendedMounted ? allLives.filter((l) => attended.has(l.uuid)) : []),
    [allLives, attended, attendedMounted]
  );

  const payload = useMemo(() => buildPayload(draft, { typeCode, lives }), [draft, typeCode, lives]);

  return { draft, update, loaded, payload, typeCode, lives, isMember: !!userId, remote, saveState, saveNow };
};
