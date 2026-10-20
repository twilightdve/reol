/**
 * プロフィールカード(plan/48)のスタイル。作る人が選び、カードの中身(`y`)に入れて受け取った人にも同じ見た目で出す。
 * 画面(ProfileCardFace)と画像(cardImage)の両方がこの色を使う。
 * accent は Reol タイプの色(診断していなければ既定の青)。
 */
import { CardStyleId } from "../../utils/profileCard/codec";

export type CardStyle = {
  id: CardStyleId;
  label: string;
  /** 背景のグラデーション(上 → 下) */
  bg: (accent: string) => [string, string];
  /** 上の帯 */
  bar: (accent: string) => string;
  /** 名前・曲名など */
  ink: string;
  /** ひとこと・SNS など */
  ink2: string;
  /** 見出し(FAVORITE SONGS など) */
  muted: string;
  /** サイト名 */
  faint: string;
  /** 枠 */
  line: string;
  avatarBg: (accent: string) => string;
  avatarInk: string;
};

/** #rrggbb を黒に寄せる(amount: 0〜1) */
const darken = (hex: string, amount: number): string => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount));
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
};

const LEGIT_YELLOW = "#e2bf57";

export const CARD_STYLES: CardStyle[] = [
  {
    id: "dark",
    label: "ダーク",
    bg: () => ["#101014", "#101014"],
    bar: (a) => a,
    ink: "#ffffff",
    ink2: "rgba(255,255,255,.85)",
    muted: "rgba(255,255,255,.5)",
    faint: "rgba(255,255,255,.35)",
    line: "rgba(255,255,255,.2)",
    avatarBg: (a) => a,
    avatarInk: "#ffffff",
  },
  {
    id: "color",
    label: "カラー",
    bg: (a) => [a, darken(a, 0.55)],
    bar: () => "rgba(255,255,255,.85)",
    ink: "#ffffff",
    ink2: "rgba(255,255,255,.9)",
    muted: "rgba(255,255,255,.65)",
    faint: "rgba(255,255,255,.5)",
    line: "rgba(255,255,255,.4)",
    avatarBg: () => "rgba(255,255,255,.92)",
    avatarInk: "#101014",
  },
  {
    id: "light",
    label: "ライト",
    bg: () => ["#f7f5f0", "#ebe8e0"],
    bar: (a) => a,
    ink: "#15151a",
    ink2: "rgba(21,21,26,.82)",
    muted: "rgba(21,21,26,.5)",
    faint: "rgba(21,21,26,.4)",
    line: "rgba(21,21,26,.2)",
    avatarBg: (a) => a,
    avatarInk: "#ffffff",
  },
  {
    id: "legit",
    label: "!Legit",
    bg: () => ["#27489b", "#0b1230"],
    bar: () => LEGIT_YELLOW,
    ink: "#ffffff",
    ink2: "rgba(255,255,255,.88)",
    muted: LEGIT_YELLOW,
    faint: "rgba(255,255,255,.45)",
    line: "rgba(226,191,87,.55)",
    avatarBg: () => LEGIT_YELLOW,
    avatarInk: "#0b1230",
  },
];

export const cardStyleOf = (id: string | undefined): CardStyle => CARD_STYLES.find((s) => s.id === id) ?? CARD_STYLES[0];
