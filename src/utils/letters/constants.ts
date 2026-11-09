/**
 * 件名のないふくろう便(Reol 誕生日の手紙企画。plan/64)の決まりごと。
 * 締切・選べる値は DB 側(supabase/features/supabase-birthday-letters.sql)と同じにする。
 */

export const LETTERS_TITLE = "件名のないふくろう便";
export const LETTERS_COPY = "この一年の思い出と、お祝いの言葉を。";
/** 手紙のテーマにする思い出の期間(去年の誕生日から今年の誕生日の前日まで。2026-11-08 にユーザーが 11.09 → 11.08 に)。受付の締切とは別 */
export const LETTERS_MEMORY_PERIOD_LABEL = "2025.11.09 — 2026.11.08";
export const LETTERS_ORGANIZER = "!Legitによる非公式バースデー企画";
/** 誕生日企画のページの OGP 画像(scripts/generate-letters-og.ts で作る) */
export const LETTERS_OG_IMAGE = "https://reol.twilightea.com/og/letters.jpg";

/** 受付の境界(これ以降は新規投稿・本人の修正を DB が拒否する)。表示用。判定は DB の時計で行う */
/** 1 人が投函できる手紙の数(取り下げていないもの)。DB の letters_submit と揃える */
export const LETTERS_MAX_PER_PERSON = 10;
export const LETTERS_DEADLINE_ISO = "2026-12-20T15:00:00Z";
export const LETTERS_DEADLINE_LABEL = "2026年12月20日（日）23:59まで";
export const LETTERS_SHIPPING_NOTE =
  "届いた手紙から順に内容を確認・印刷し、締切後に一冊にまとめて、年内の発送を目指します。";

/** 印刷テンプレートの版。用紙が決まって寸法や配置を変えたら上げる(印刷記録に残る) */
/** GA に一切送らないページ(修正画面は URL の # に編集鍵がある。運営画面は非公開の本文を出す)。gatsby-ssr と AuthContext が使う */
export const GA_NO_TRACK_PATH_RE = /^\/letters\/(edit|admin)(\/|$)/;

export const LETTERS_PRINT_TEMPLATE = "postcard-100x148-v1";

/**
 * カードの絵柄。曲のモチーフ(MV・ジャケット・曲名・テーマ)から起こした図形(ジャケットの絵そのものは写さない)。
 * songs は、その絵柄の元にした曲(根拠のある曲だけ。画面には出さない)。並びは DB の letters の決まり(_letters_clean)と揃える
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
  "butterfly",
  "fan",
  "clock",
  "cubes",
  "door",
  "goldfish",
  "fireworks",
  "envelope",
  "glitch",
  "hydrangea",
  "tunnel",
  "cage",
  "balloon",
  "curtain",
  "rose",
  "spider",
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
  { id: "butterfly", label: "飛び立つ蝶", songs: "極彩色・-nil-・Q?" },
  { id: "fan", label: "扇子", songs: "煽げや尊し・宵々古今" },
  { id: "clock", label: "時計の文字盤", songs: "切っ先・secret trip・感情御中" },
  { id: "cubes", label: "積み上がる氷", songs: "Ms.CONTROL・ミュータント・Boy・ウテナ" },
  { id: "door", label: "砂漠の扉", songs: "金字塔・ハーメルン・GRIMOIRE" },
  { id: "goldfish", label: "金魚", songs: "宵々古今" },
  { id: "fireworks", label: "花火", songs: "宵々古今" },
  { id: "envelope", label: "封筒と封蝋", songs: "RE:" },
  { id: "glitch", label: "グリッチの横縞", songs: "ULTRA C・ギミアブレスタッナウ" },
  { id: "hydrangea", label: "紫陽花", songs: "ちるちる" },
  { id: "tunnel", label: "光のトンネル", songs: "ちるちる・エンド・Boy" },
  { id: "cage", label: "鉄格子と金網", songs: "ウテナ・ミッシング・SAIREN" },
  { id: "balloon", label: "赤い風船", songs: "DEAD CENTER・ウテナ" },
  { id: "curtain", label: "幕とアーチ", songs: "赤裸裸・激白" },
  { id: "rose", label: "一輪の薔薇", songs: "極彩色・激白" },
  { id: "spider", label: "蜘蛛と赤い糸", songs: "うつくしじごく" },
];

export type Visibility = "public" | "book";

/** 手紙の書体(本文・差出人。明朝体と手書き風は宛名も)。前からの手紙(書体なし)はゴシック */
export type LetterFont = "sans" | "serif" | "hand";
export const LETTER_FONTS: { id: LetterFont; label: string; family: string; sample: string }[] = [
  { id: "sans", label: "ゴシック", family: "'Noto Sans JP',sans-serif", sample: "おめでとう" },
  { id: "serif", label: "明朝体", family: "'Noto Serif JP',serif", sample: "おめでとう" },
  { id: "hand", label: "手書き風", family: "'Klee One',cursive", sample: "おめでとう" },
];
export const fontOf = (f: string | null | undefined): LetterFont => (f === "serif" || f === "hand" ? f : "sans");

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
