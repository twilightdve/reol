/**
 * プロフィールカード(plan/48)の中身と、QR・リンクに入れる文字列への変換。
 *
 * QR は `/card/view/#<中身>`。`#` 以降はブラウザから外に送られないので、カードの内容はサーバーにもアクセス解析にも残らない。
 * 受け取った側では、中身は「作った人が入力した、確かめていない文字」として扱う:
 * 文字としてだけ表示し、長さを切り詰め、SNS は決まったサービスの ID の形を満たす時だけリンクにする。
 */

export const CARD_LIMITS = {
  name: 24,
  song: 40,
  songs: 3,
  bio: 60,
  event: 40,
  live: 80,
} as const;

export type SnsKey = "x" | "ig" | "th" | "bs" | "tt";

export const SNS: { key: SnsKey; label: string; placeholder: string; pattern: RegExp; url: (id: string) => string }[] = [
  { key: "x", label: "X", placeholder: "reol_official", pattern: /^[A-Za-z0-9_]{1,15}$/, url: (id) => `https://x.com/${id}` },
  { key: "ig", label: "Instagram", placeholder: "reol_official", pattern: /^[A-Za-z0-9._]{1,30}$/, url: (id) => `https://www.instagram.com/${id}/` },
  { key: "th", label: "Threads", placeholder: "reol_official", pattern: /^[A-Za-z0-9._]{1,30}$/, url: (id) => `https://www.threads.com/@${id}` },
  {
    key: "bs",
    label: "Bluesky",
    placeholder: "name.bsky.social",
    pattern: /^(?=.{3,253}$)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/,
    url: (id) => `https://bsky.app/profile/${id}`,
  },
  { key: "tt", label: "TikTok", placeholder: "reol_official", pattern: /^[A-Za-z0-9._]{2,24}$/, url: (id) => `https://www.tiktok.com/@${id}` },
];

/** QR・リンクに入れる中身(短いキー。載せない項目は入れない) */
export type CardPayload = {
  v: 1;
  /** 名前 */
  n: string;
  /** 好きな曲(3曲まで) */
  s?: string[];
  /** Reol タイプ診断のタイプコード */
  t?: string;
  /** 参戦記録: 参戦数・はじめて行ったライヴ・直近のライヴ(「2018.06.10 公演名」の形の文字) */
  a?: { c: number; f?: string; l?: string };
  /** SNS の ID */
  x?: Partial<Record<SnsKey, string>>;
  /** ひとこと */
  b?: string;
  /** 今日のライヴ */
  e?: string;
};

/** 入力の SNS ID を正規化する(先頭の @ や URL の貼り付けを取り除く)。形が合わなければ null */
export const normalizeSnsId = (key: SnsKey, input: string): string | null => {
  const def = SNS.find((s) => s.key === key);
  if (!def) return null;
  let id = input.trim();
  // URL を貼られた時は最後の部分(bsky は profile の後ろ)
  const m = /^https?:\/\/[^/]+\/(?:profile\/)?@?([^/?#]+)/.exec(id);
  if (m) id = m[1];
  id = id.replace(/^@/, "");
  return def.pattern.test(id) ? id : null;
};

// 制御文字・改行(U+2028/2029 を含む)
const CONTROL_CHARS = new RegExp("[\\u0000-\\u001f\\u007f\\u2028\\u2029]", "g");

const clip = (v: unknown, max: number): string | undefined => {
  if (typeof v !== "string") return undefined;
  // 制御文字・改行は空白に(表示は文字としてだけなので、崩れ防止のため)
  const s = v.replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim();
  if (!s) return undefined;
  return Array.from(s).slice(0, max).join("");
};

const TYPE_CODE = /^[FB][GE][SQ][AI]$/;

/** 受け取った中身を確かめて、表示してよい形にそろえる。名前が無い・形が違う時は null */
export const sanitizePayload = (raw: unknown): CardPayload | null => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.v !== 1) return null;
  const n = clip(r.n, CARD_LIMITS.name);
  if (!n) return null;
  const out: CardPayload = { v: 1, n };
  if (Array.isArray(r.s)) {
    const s = r.s.map((x) => clip(x, CARD_LIMITS.song)).filter((x): x is string => !!x).slice(0, CARD_LIMITS.songs);
    if (s.length) out.s = s;
  }
  if (typeof r.t === "string" && TYPE_CODE.test(r.t)) out.t = r.t;
  if (r.a && typeof r.a === "object") {
    const a = r.a as Record<string, unknown>;
    const c = typeof a.c === "number" && Number.isInteger(a.c) && a.c >= 0 && a.c <= 9999 ? a.c : null;
    if (c !== null) {
      out.a = { c };
      const f = clip(a.f, CARD_LIMITS.live);
      const l = clip(a.l, CARD_LIMITS.live);
      if (f) out.a.f = f;
      if (l) out.a.l = l;
    }
  }
  if (r.x && typeof r.x === "object") {
    const x: Partial<Record<SnsKey, string>> = {};
    for (const def of SNS) {
      const v = (r.x as Record<string, unknown>)[def.key];
      if (typeof v === "string" && def.pattern.test(v)) x[def.key] = v;
    }
    if (Object.keys(x).length) out.x = x;
  }
  const b = clip(r.b, CARD_LIMITS.bio);
  if (b) out.b = b;
  const e = clip(r.e, CARD_LIMITS.event);
  if (e) out.e = e;
  return out;
};

const toBase64Url = (bytes: Uint8Array): string => {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (s: string): Uint8Array => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

/** 中身を `#` の後ろに入れる文字列にする */
export const encodeCard = (payload: CardPayload): string => toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));

/** `#` の後ろの文字列を中身に戻す。読めない時は null */
export const decodeCard = (fragment: string): CardPayload | null => {
  const s = fragment.replace(/^#/, "").trim();
  if (!s || s.length > 4000 || !/^[A-Za-z0-9_-]+$/.test(s)) return null;
  try {
    return sanitizePayload(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(fromBase64Url(s))));
  } catch {
    return null;
  }
};

export const CARD_VIEW_PATH = "/card/view/";
export const cardViewUrl = (origin: string, payload: CardPayload) => `${origin}${CARD_VIEW_PATH}#${encodeCard(payload)}`;
