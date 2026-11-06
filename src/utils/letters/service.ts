/**
 * 手紙の読み書き(plan/64)。すべて Supabase の関数(RPC)を通す。テーブルは直接読めない。
 * - 一般向け: 運営が確認した版だけ。「贈る本だけ」の本文は DB が返さない。
 * - 本人: 編集鍵(投稿時にこのブラウザーで作る)で。
 * - 運営: ログイン中のセッションが運営の ID の時だけ DB が答える。
 * 呼び出しは POST なので、Service Worker のキャッシュには残らない。
 */
import type { LetterBody } from "./body";
import type { Era, Motif, SnsType, Visibility } from "./constants";

export type LetterContent = {
  eventKey: string;
  eventLabel: string;
  eventDate: string | null;
  era: Era;
  address: string;
  sender: string;
  snsType: SnsType | null;
  snsId: string | null;
  motif: Motif;
  visibility: Visibility;
  body: LetterBody;
};

/** 一般向け(body は「Webでも公開」の時だけ。一覧では常に null) */
export type PublicLetter = Omit<LetterContent, "body"> & { id: string; createdAt: string; body: LetterBody | null };

export type OwnLetter = {
  id: string;
  version: number;
  content: LetterContent;
  reviewed: boolean;
  onWeb: boolean;
  withdrawn: boolean;
  editable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminLetter = {
  id: string;
  createdAt: string;
  updatedAt: string;
  currentVersion: number;
  reviewedVersion: number | null;
  reviewedAt: string | null;
  webHidden: boolean;
  withdrawnAt: string | null;
  withdrawnBy: string | null;
  pulledAt: string | null;
  content: LetterContent;
  printedVersion: number | null;
  printedAt: string | null;
  queuedVersion: number | null;
};

export type PrintBatchSummary = {
  id: string;
  template: string;
  note: string | null;
  createdAt: string;
  printedAt: string | null;
  cancelledAt: string | null;
  count: number;
};

export type PrintBatch = Omit<PrintBatchSummary, "count"> & {
  items: { position: number; id: string; version: number; currentVersion: number; withdrawn: boolean; content: LetterContent }[];
};

/** 呼べなかった理由。'unavailable' は SQL がまだ流れていない(関数が無い)か、Supabase の設定が無い */
export class LettersError extends Error {
  constructor(public code: "unavailable" | "network" | "forbidden" | "server", message?: string) {
    super(message ?? code);
  }
}

type RpcError = { code?: string; message?: string; status?: number } | null;

const rpc = async <T>(fn: string, args?: Record<string, unknown>): Promise<T> => {
  const { supabase } = await import("../../lib/supabase");
  if (!supabase) throw new LettersError("unavailable");
  let res: { data: unknown; error: RpcError; status?: number };
  try {
    res = (await supabase.rpc(fn, args)) as typeof res;
  } catch {
    throw new LettersError("network");
  }
  const { data, error } = res;
  if (error) {
    // 関数が無い(SQL 未実行)
    if (error.code === "PGRST202" || error.code === "42883" || res.status === 404) throw new LettersError("unavailable");
    if (/forbidden/.test(error.message ?? "")) throw new LettersError("forbidden");
    // fetch 自体が失敗した時は supabase-js が message に TypeError を入れて返す
    if (!error.code && /fetch|network|Failed/i.test(error.message ?? "")) throw new LettersError("network");
    throw new LettersError("server", error.message);
  }
  return data as T;
};

export type Result<T = Record<string, never>> = ({ ok: true } & T) | { ok: false; error: string };

export const fetchLettersStatus = () => rpc<{ open: boolean; deadline: string; now: string }>("letters_status");

export const submitLetter = (requestId: string, editKey: string, letter: LetterContent & { consent: true }) =>
  rpc<Result<{ id: string; version: number }>>("letters_submit", { p_request_id: requestId, p_edit_key: editKey, p_letter: letter });

export const fetchPublicLetters = (opts: { eventKey?: string | null; era?: Era | null; order?: "new" | "timeline"; limit?: number; offset?: number }) =>
  rpc<PublicLetter[]>("letters_public_list", {
    p_event_key: opts.eventKey ?? null,
    p_era: opts.era ?? null,
    p_order: opts.order ?? "new",
    p_limit: opts.limit ?? 60,
    p_offset: opts.offset ?? 0,
  });

export const fetchPublicLetter = (id: string) => rpc<PublicLetter | null>("letters_public_get", { p_id: id });

export const fetchPublicCounts = () => rpc<Record<string, number>>("letters_public_counts");

export const fetchOwnLetter = (id: string, key: string) => rpc<Result<OwnLetter>>("letters_own_get", { p_id: id, p_edit_key: key });

export const updateOwnLetter = (id: string, key: string, baseVersion: number, letter: LetterContent & { consent: true }) =>
  rpc<Result<{ id: string; version: number; unchanged?: boolean }>>("letters_own_update", {
    p_id: id,
    p_edit_key: key,
    p_base_version: baseVersion,
    p_letter: letter,
  });

export const withdrawOwnLetter = (id: string, key: string) => rpc<Result>("letters_own_withdraw", { p_id: id, p_edit_key: key });

export const adminListLetters = () => rpc<AdminLetter[]>("letters_admin_list");

export type AdminAction = "approve" | "unapprove" | "hide" | "show" | "withdraw" | "restore" | "pulled";
export const adminAct = (id: string, action: AdminAction, version?: number) =>
  rpc<Result>("letters_admin_act", { p_id: id, p_action: action, p_version: version ?? null });

export const adminCreateBatch = (ids: string[], template: string, note?: string) =>
  rpc<Result<{ batchId: string; count: number; skipped: number }>>("letters_admin_create_batch", { p_ids: ids, p_template: template, p_note: note ?? null });

export const adminListBatches = () => rpc<PrintBatchSummary[]>("letters_admin_batches");

export const adminGetBatch = (id: string) => rpc<PrintBatch | null>("letters_admin_batch", { p_batch: id });

export const adminMarkPrinted = (id: string) => rpc<{ ok: boolean }>("letters_admin_mark_printed", { p_batch: id });

export const adminCancelBatch = (id: string) => rpc<{ ok: boolean }>("letters_admin_cancel_batch", { p_batch: id });

/** 入力の誤りを、画面の言葉に */
export const ERROR_MESSAGES: Record<string, string> = {
  closed: "受付は終了しました(2026年12月20日 23:59まで)。",
  busy: "いま投稿が混み合っています。少し時間をおいて、もう一度お試しください。",
  conflict: "別の画面で先に修正されています。ページを読み込み直してから直してください。",
  withdrawn: "この手紙は取り下げ済みです。",
  too_many_edits: "この手紙はこれ以上修正できません。直したい時は運営までご連絡ください。",
  author_withdrawn: "本人が取り下げた手紙は戻せません。",
  not_found: "手紙が見つかりませんでした。修正用のURLをもう一度確かめてください。",
  invalid: "送信内容を確かめられませんでした。ページを読み込み直してお試しください。",
  "invalid:eventKey": "宛先を選び直してください。",
  "invalid:eventLabel": "宛先を選び直してください。",
  "invalid:eventDate": "宛先を選び直してください。",
  "invalid:era": "宛先を選び直してください。",
  "invalid:address": "宛名を確かめてください(30字まで)。",
  "invalid:sender": "差出人の名前を入れてください(20字まで)。",
  "invalid:snsType": "SNS の種類を選び直してください。",
  "invalid:snsId": "SNS ID を確かめてください(英数字と _ . - の40字まで。載せない時は種類も「載せない」に)。",
  "invalid:motif": "カードの絵柄を選び直してください。",
  "invalid:visibility": "本文の公開範囲を選んでください。",
  "invalid:consent": "運営による確認・印刷への同意にチェックを入れてください。",
  "invalid:body": "本文を確かめてください(空の本文、1,200字を超える本文、装飾を細かく切り替えすぎた本文は送れません)。",
};
export const errorMessage = (code: string) => ERROR_MESSAGES[code] ?? "送信できませんでした。時間をおいてもう一度お試しください。";
