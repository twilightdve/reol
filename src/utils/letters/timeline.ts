/**
 * 手紙の宛先にする年表(plan/64)。サイトの DISCOGRAPHY / LIVE のシート(公開情報)から作る。
 * 宛先のキーは song:<songUuid> / release:<discographyUuid> / live:<liveUuid> / era:<時代> で、表記が変わっても同じ宛先を指す。
 * 既定の宛名は、その曲・作品・ライヴの名義から作る(れをる → 氏へ、ほかは名義 + へ)。宛名は「前につける言葉 + 名義 + 呼び方 + へ」を選んで作る(自由入力はしない)。
 * 時代は しぇりー(れをる以前の名前。作品の記録はない)→ れをる → あにょすぺにょすゃゃ → REOL → Reol。
 * それ以外の名義(Reol & nqrse など)は、日付のいちばん近い出来事の時代(れをる / REOL / Reol)に入れる(手紙は時代を選んでから書くため)。
 */
import { Era, LIMITS } from "./constants";

export type LetterEventKind = "song" | "release" | "cover" | "live" | "era";

export type LetterEvent = {
  key: string;
  kind: LetterEventKind;
  /** YYYY-MM-DD(時代は空) */
  date: string;
  title: string;
  /** 名義 / 形態 など */
  sub: string;
  era: Era;
  defaultAddress: string;
  /** 検索用(収録曲名・会場など) */
  searchText: string;
  /** サイト内の参照ページ */
  href: string | null;
};

type DiscInput = {
  discographyUuid: string;
  slug: string;
  title: string;
  releaseDate: string | null;
  name: string | null;
  format: string | null;
  songs?: ({ songUuid?: string | null; songName: string | null } | null)[] | null;
};

type LiveInput = {
  liveUuid: string;
  title: string;
  name: string | null;
  date: string | null;
  type?: string | null;
  items?: ({ slug: string | null; date: string | null; place: string | null } | null)[] | null;
};

export const eraOfName = (name: string | null | undefined): Era =>
  name === "れをる" ? "reoru" : name === "あにょすぺにょすゃゃ" ? "anyo" : name === "REOL" ? "unit" : name === "Reol" ? "reol" : "other";

/** 宛名に使える名義(手順の時期と同じ、新しい順)と呼び方 */
export const ADDRESS_NAMES = ["Reol", "REOL", "あにょすぺにょすゃゃ", "れをる", "しぇりー"] as const;
export const ADDRESS_HONORIFICS = ["様", "氏", "さん", ""] as const;
export type AddressParts = { prefix: string; name: string; honorific: string };

/** 時代ごとの既定の名義と呼び方(れをるは「れをる氏」) */
export const ERA_ADDRESS: Record<Era, { name: string; honorific: string }> = {
  sherry: { name: "しぇりー", honorific: "" },
  reoru: { name: "れをる", honorific: "氏" },
  anyo: { name: "あにょすぺにょすゃゃ", honorific: "" },
  unit: { name: "REOL", honorific: "" },
  reol: { name: "Reol", honorific: "" },
  other: { name: "Reol", honorific: "" },
};

export const ADDRESS_SUFFIX: Record<Era, string> = {
  sherry: "しぇりーへ",
  reoru: "れをる氏へ",
  anyo: "あにょすぺにょすゃゃへ",
  unit: "REOLへ",
  reol: "Reolへ",
  other: "あなたへ",
};

const ADDRESS_RE = /^(.*?)(Reol|REOL|あにょすぺにょすゃゃ|れをる|しぇりー)(様|氏|さん)?へ$/;

/** 宛名を「前につける言葉 / 名義 / 呼び方」に分ける。形に合わない(前に自由に書いた)宛名は null */
export const parseAddress = (address: string): AddressParts | null => {
  const m = address.match(ADDRESS_RE);
  return m ? { prefix: m[1], name: m[2], honorific: m[3] ?? "" } : null;
};

export const composeAddress = (p: AddressParts): string => `${p.prefix}${p.name}${p.honorific}へ`;

const FORMAT_LABELS: Record<string, string> = {
  fullAL: "フルアルバム",
  miniAL: "ミニアルバム",
  SG: "シングル",
  配信SG: "配信シングル",
  EP: "EP",
  "DVD/BD": "映像作品",
};

const LIVE_TYPE_LABELS: Record<string, string> = {
  tour: "ツアー",
  oneman: "ワンマンライヴ",
  event: "イベント出演",
};

/** 「〜の」+ 名義 + 呼び方。長すぎるときは「あの日の」にする(宛名は 30 字まで) */
export const buildAddress = (title: string, era: Era, fallbackPrefix = "あの日の"): string => {
  const suffix = ADDRESS_SUFFIX[era];
  const full = `${title}の${suffix}`;
  return full.length <= LIMITS.address ? full : `${fallbackPrefix}${suffix}`;
};

/** 締切の日までの出来事だけを宛先にする(締切後のライヴは載せない) */
const LAST_DATE = "2026-12-20";

export const buildLetterEvents = (discs: DiscInput[], lives: LiveInput[]): LetterEvent[] => {
  const events: LetterEvent[] = [];

  for (const d of discs) {
    const date = (d.releaseDate ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > LAST_DATE) continue;
    const era = eraOfName(d.name);
    const isCover = d.format === "歌ってみた";
    const songs = (d.songs ?? []).map((s) => s?.songName ?? "").filter(Boolean);
    events.push({
      key: `release:${d.discographyUuid}`,
      kind: isCover ? "cover" : "release",
      date,
      title: d.title,
      sub: [d.name, isCover ? "歌ってみた" : FORMAT_LABELS[d.format ?? ""] ?? d.format].filter(Boolean).join(" / "),
      era,
      defaultAddress: buildAddress(d.title, era),
      searchText: [d.title, d.name, ...songs].join(" ").toLowerCase(),
      href: `/discography/#disc-${d.slug}`,
    });
  }

  for (const l of lives) {
    const items = (l.items ?? []).filter((i): i is NonNullable<typeof i> => !!i);
    const dates = items.map((i) => (i.date ?? "").slice(0, 10)).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)).sort();
    const date = dates[0] ?? (l.date ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > LAST_DATE) continue;
    const era = eraOfName(l.name);
    const places = Array.from(new Set(items.map((i) => i.place).filter((p): p is string => !!p)));
    const first = items.find((i) => i.slug);
    events.push({
      key: `live:${l.liveUuid}`,
      kind: "live",
      date,
      title: l.title,
      sub: [l.name, LIVE_TYPE_LABELS[l.type ?? ""] ?? "ライヴ", places.length === 1 ? places[0] : places.length > 1 ? `${places.length}公演` : ""]
        .filter(Boolean)
        .join(" / "),
      era,
      defaultAddress: buildAddress(l.title, era, "あのライヴの"),
      searchText: [l.title, l.name, ...places].join(" ").toLowerCase(),
      href: first?.slug ? `/live/${first.slug}/` : null,
    });
  }

  // 曲(歌ってみた・映像作品以外の収録曲)。同じ時代の同じ曲名は、いちばん早く出た 1 つにまとめる
  const songs = new Map<string, LetterEvent>();
  for (const d of discs) {
    const date = (d.releaseDate ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > LAST_DATE || d.format === "歌ってみた" || d.format === "DVD/BD") continue;
    const era = eraOfName(d.name);
    for (const s of d.songs ?? []) {
      const name = (s?.songName ?? "").trim();
      if (!s?.songUuid || !name) continue;
      const id = `${era}:${name.normalize("NFKC").toLowerCase()}`;
      const prev = songs.get(id);
      if (prev && prev.date <= date) continue;
      songs.set(id, {
        key: `song:${s.songUuid}`,
        kind: "song",
        date,
        title: name,
        sub: [d.title !== name ? `『${d.title}』` : "", FORMAT_LABELS[d.format ?? ""] ?? d.format].filter(Boolean).join(" / "),
        era,
        defaultAddress: buildAddress(name, era),
        searchText: [name, d.title, d.name].join(" ").toLowerCase(),
        href: `/discography/#disc-${d.slug}`,
      });
    }
  }
  events.push(...songs.values());

  // それ以外の名義は、日付のいちばん近い れをる / REOL / Reol の出来事の時代へ(宛名もその時代の呼び方に)
  const known = events.filter((e) => e.era === "reoru" || e.era === "unit" || e.era === "reol");
  const dayOf = (d: string) => Date.parse(`${d}T00:00:00Z`);
  for (const e of events) {
    if (e.era !== "other" || !known.length) continue;
    const near = known.reduce((a, b) => (Math.abs(dayOf(b.date) - dayOf(e.date)) < Math.abs(dayOf(a.date) - dayOf(e.date)) ? b : a));
    e.era = near.era;
    e.defaultAddress = buildAddress(e.title, near.era, e.kind === "live" ? "あのライヴの" : "あの日の");
  }

  // 新しい順(同じ日は作品 → ライヴ)
  return events.sort((a, b) => b.date.localeCompare(a.date) || a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title));
};

/** 時代そのものへ宛てる(手順の 1 画面目に、この順で並ぶ) */
export const ERA_EVENTS: LetterEvent[] = [
  { key: "era:reol", kind: "era", date: "", title: "今のReol", sub: "Reol", era: "reol", defaultAddress: "今のReolへ", searchText: "", href: null },
  { key: "era:unit", kind: "era", date: "", title: "REOLの頃", sub: "REOL(ユニット)", era: "unit", defaultAddress: "あの頃のREOLへ", searchText: "", href: null },
  { key: "era:anyo", kind: "era", date: "", title: "あにょすぺにょすゃゃの頃", sub: "あにょすぺにょすゃゃ", era: "anyo", defaultAddress: "あの頃のあにょすぺにょすゃゃへ", searchText: "", href: null },
  { key: "era:reoru", kind: "era", date: "", title: "れをるの頃", sub: "れをる", era: "reoru", defaultAddress: "あの頃のれをる氏へ", searchText: "", href: null },
  { key: "era:sherry", kind: "era", date: "", title: "しぇりーの頃", sub: "しぇりー", era: "sherry", defaultAddress: "あの頃のしぇりーへ", searchText: "", href: null },
];

/** 宛名をカードの上で 2 行に分ける(「極彩色の / れをる氏へ」)。分けられない時は 1 つ */
export const splitAddress = (address: string): [string, string] | [string] => {
  const m = address.match(/^(.+の)((?:れをる|REOL|Reol|あにょすぺにょすゃゃ|しぇりー|あなた)(?:様|氏|さん|ちゃん)?へ)$/);
  return m ? [m[1], m[2]] : [address];
};
