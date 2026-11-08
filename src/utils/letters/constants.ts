/**
 * 件名のないふくろう便(Reol 誕生日の手紙企画。plan/64)の決まりごと。
 * 締切・選べる値は DB 側(supabase/features/supabase-birthday-letters.sql)と同じにする。
 */

export const LETTERS_TITLE = "件名のないふくろう便";
export const LETTERS_COPY = "あの日の思いに、ふくろうが運ぶ返信";
export const LETTERS_ORGANIZER = "!Legitによる非公式バースデー企画";

/** 受付の境界(これ以降は新規投稿・本人の修正を DB が拒否する)。表示用。判定は DB の時計で行う */
export const LETTERS_DEADLINE_ISO = "2026-12-20T15:00:00Z";
export const LETTERS_DEADLINE_LABEL = "2026年12月20日（日）23:59まで";
export const LETTERS_SHIPPING_NOTE =
  "届いたメッセージから順に内容を確認・印刷し、締切後に一冊にまとめて、年内の発送を目指します。";

/** 印刷テンプレートの版。用紙が決まって寸法や配置を変えたら上げる(印刷記録に残る) */
/** GA に一切送らないページ(修正画面は URL の # に編集鍵がある。運営画面は非公開の本文を出す)。gatsby-ssr と AuthContext が使う */
export const GA_NO_TRACK_PATH_RE = /^\/letters\/(edit|admin)(\/|$)/;

export const LETTERS_PRINT_TEMPLATE = "postcard-100x148-v1";

/**
 * カードの絵柄。曲のモチーフ(MV・ジャケット・曲名・テーマ)から起こした図形(ジャケットの絵そのものは写さない)。
 * songs は選ぶ画面に添える「ゆかりの曲」。並びは DB の letters の決まり(_letters_clean)と揃える
 */
export const MOTIF_IDS = [
  "color",
  "water",
  "stars",
  "mirror",
  "moon",
  "candy",
  "petals",
  "glitter",
  "film",
  "edge",
  "brush",
  "monitor",
  "lantern",
  "rings",
  "pulse",
  "sky",
  "moss",
  "key",
] as const;
export type Motif = (typeof MOTIF_IDS)[number];
export const MOTIFS: { id: Motif; label: string; songs: string }[] = [
  { id: "color", label: "色が重なる", songs: "極彩色" },
  { id: "water", label: "水底の手紙", songs: "水底游歩道・No title" },
  { id: "stars", label: "星と軌道", songs: "SHINOBI・secret trip" },
  { id: "mirror", label: "割れた鏡", songs: "平面鏡・カルト・ミッシング" },
  { id: "moon", label: "三日月と結晶", songs: "No title・オオエドランヴ" },
  { id: "candy", label: "雨と飴玉", songs: "drop pop candy" },
  { id: "petals", label: "舞う花びら", songs: "ディア・あ可よろし・エンド" },
  { id: "glitter", label: "きらめき", songs: "綺羅綺羅・赤裸裸" },
  { id: "film", label: "虹色のフィルム", songs: "ウテナ・たい・シンカロン" },
  { id: "edge", label: "切っ先と花", songs: "切っ先" },
  { id: "brush", label: "筆の走り書き", songs: "Danger Danger" },
  { id: "monitor", label: "古いモニター", songs: "Danger Danger・DEAD CENTER" },
  { id: "lantern", label: "行灯と祭り", songs: "煽げや尊し" },
  { id: "rings", label: "輪と曼荼羅", songs: "カルト・ミッシング・-MANDARA FACT-" },
  { id: "pulse", label: "鼓動の線", songs: "-nil-・染・生命線" },
  { id: "sky", label: "雲の浮かぶ空", songs: "TAKE OFF・ロジックエージェント" },
  { id: "moss", label: "苔と丸い鏡", songs: "うつくしじごく・美辞目録" },
  { id: "key", label: "鍵と額縁", songs: "RE:・失楽園" },
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

export type Era = "sherry" | "reoru" | "anyo" | "unit" | "reol" | "other";
export const ERA_LABELS: Record<Era, string> = {
  sherry: "しぇりー",
  reoru: "れをる",
  anyo: "あにょすぺにょすゃゃ",
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
