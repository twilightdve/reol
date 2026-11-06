/**
 * この端末だけに置くもの(plan/64)。どれも無くても動く(読めなければ空として扱う)。
 * - 書きかけの手紙(送るまで。送ったら消す)
 * - 送った手紙の ID と編集鍵(この端末から直せるように。鍵はサーバーにはハッシュしか無い)
 */
import type { LetterContent } from "./service";

const DRAFT_KEY = "legit-letters-draft";
const MINE_KEY = "legit-letters-mine";

export type Draft = Partial<Omit<LetterContent, "eventKey">> & {
  eventKey?: string | null;
  /** 送信中・結果が分からなかった時に、同じ 1 通として送り直すための値 */
  pending?: { requestId: string; editKey: string } | null;
};

export type MyLetter = { id: string; key: string; address: string; createdAt: string };

const read = <T>(key: string): T | null => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const write = (key: string, value: unknown) => {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 保存できない環境(プライベートブラウズなど)でも書くことはできる
  }
};

export const loadDraft = () => read<Draft>(DRAFT_KEY);
export const saveDraft = (d: Draft | null) => write(DRAFT_KEY, d);

export const loadMyLetters = (): MyLetter[] => {
  const list = read<MyLetter[]>(MINE_KEY);
  return Array.isArray(list) ? list.filter((x) => x && typeof x.id === "string" && typeof x.key === "string") : [];
};
export const rememberMyLetter = (l: MyLetter) => write(MINE_KEY, [l, ...loadMyLetters().filter((x) => x.id !== l.id)].slice(0, 50));
export const forgetMyLetter = (id: string) => write(MINE_KEY, loadMyLetters().filter((x) => x.id !== id));

const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

/** 編集鍵(32 バイトの乱数を 16 進 64 桁で) */
export const newEditKey = () => {
  const a = new Uint8Array(32);
  window.crypto.getRandomValues(a);
  return hex(a);
};

export const newRequestId = (): string => {
  if (typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  const a = new Uint8Array(16);
  window.crypto.getRandomValues(a);
  a[6] = (a[6] & 0x0f) | 0x40;
  a[8] = (a[8] & 0x3f) | 0x80;
  const h = hex(a);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

/** 修正用の URL(鍵は # の後ろだけに置く。サーバーにもアクセス解析にも渡らない) */
export const editUrl = (id: string, key: string) => `${window.location.origin}/letters/edit/#${id}.${key}`;
