/**
 * Legitの件名のない郵便やさん(Reol 誕生日の手紙企画。plan/64)の決まりごと。
 * 締切・選べる値は DB 側(supabase/features/supabase-birthday-letters.sql)と同じにする。
 */

export const LETTERS_TITLE = "Legitの件名のない郵便やさん";
export const LETTERS_COPY = "あの日の思いに、Legitからの返信";
export const LETTERS_ORGANIZER = "!Legitによる非公式バースデー企画";

/** 受付の境界(これ以降は新規投稿・本人の修正を DB が拒否する)。表示用。判定は DB の時計で行う */
export const LETTERS_DEADLINE_ISO = "2026-12-20T15:00:00Z";
export const LETTERS_DEADLINE_LABEL = "2026年12月20日（日）23:59まで";
export const LETTERS_SHIPPING_NOTE =
  "届いたメッセージから順に内容を確認・印刷し、締切後に一冊にまとめて、年内の発送を目指します。";

/** 印刷テンプレートの版。用紙が決まって寸法や配置を変えたら上げる(印刷記録に残る) */
export const LETTERS_PRINT_TEMPLATE = "postcard-100x148-v1";

export type Motif = "color" | "water" | "stars";
export const MOTIFS: { id: Motif; label: string }[] = [
  { id: "color", label: "色が重なる" },
  { id: "water", label: "水底の手紙" },
  { id: "stars", label: "星と軌道" },
];

export type Visibility = "public" | "book";

export type SnsType = "x" | "instagram" | "tiktok" | "bluesky" | "threads";
export const SNS_TYPES: { id: SnsType; label: string }[] = [
  { id: "x", label: "X" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "bluesky", label: "Bluesky" },
  { id: "threads", label: "Threads" },
];
export const snsLabel = (t: string | null | undefined) => SNS_TYPES.find((s) => s.id === t)?.label ?? "";

export type Era = "reoru" | "unit" | "reol" | "other";
export const ERA_LABELS: Record<Era, string> = {
  reoru: "れをる",
  unit: "REOL",
  reol: "Reol",
  other: "ほかの名義",
};

/** 文字の色(本文の装飾)。どの絵柄の裏面でも読める濃さにする */
export type TextColor = "rose" | "indigo" | "gold" | "teal";
export const TEXT_COLORS: { id: TextColor; label: string; value: string }[] = [
  { id: "rose", label: "紅", value: "#a93149" },
  { id: "indigo", label: "藍", value: "#2d4f86" },
  { id: "gold", label: "金茶", value: "#8a6a1f" },
  { id: "teal", label: "青緑", value: "#2a6f75" },
];
export const textColorValue = (c: string | undefined) => TEXT_COLORS.find((t) => t.id === c)?.value;

export type TextSize = "s" | "l";

/** 入力の上限(DB と同じ) */
export const LIMITS = {
  address: 30,
  sender: 20,
  snsId: 40,
  bodyChars: 1200,
} as const;
