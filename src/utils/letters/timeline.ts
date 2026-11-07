/**
 * 手紙の宛先にする年表(plan/64)。サイトの DISCOGRAPHY / LIVE のシート(公開情報)から作る。
 * 宛先のキーは song:<songUuid> / release:<discographyUuid> / live:<liveUuid> / era:<時代> で、表記が変わっても同じ宛先を指す。
 * 既定の宛名は、その曲・作品・ライヴの名義から作る(れをる → 様へ、REOL / Reol → へ)。
 * 3 つの名義以外(あにょすぺにょすゃゃ など)は、日付のいちばん近い出来事の時代に入れる(手紙は時代を選んでから書くため)。
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
  name === "れをる" ? "reoru" : name === "REOL" ? "unit" : name === "Reol" ? "reol" : "other";

const ADDRESS_SUFFIX: Record<Era, string> = {
  reoru: "れをる様へ",
  unit: "REOLへ",
  reol: "Reolへ",
  other: "あなたへ",
};

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

/** 「〜の」+ 名義。長すぎるときは「あの日の」にする(宛名は 30 字まで) */
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

  // 3 つの名義以外は、日付のいちばん近い出来事の時代へ(宛名もその時代の呼び方に)
  const known = events.filter((e) => e.era !== "other");
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

/** 時代そのものへ宛てる */
export const ERA_EVENTS: LetterEvent[] = [
  { key: "era:reol", kind: "era", date: "", title: "今のReol", sub: "Reol", era: "reol", defaultAddress: "今のReolへ", searchText: "", href: null },
  { key: "era:unit", kind: "era", date: "", title: "REOLの頃", sub: "REOL(ユニット)", era: "unit", defaultAddress: "あの頃のREOLへ", searchText: "", href: null },
  { key: "era:reoru", kind: "era", date: "", title: "れをるの頃", sub: "れをる", era: "reoru", defaultAddress: "あの頃のれをる様へ", searchText: "", href: null },
];

/** 宛名をカードの上で 2 行に分ける(「極彩色の / れをる様へ」)。分けられない時は 1 つ */
export const splitAddress = (address: string): [string, string] | [string] => {
  const m = address.match(/^(.+の)((?:れをる|REOL|Reol|あなた)(?:様|さん|ちゃん)?へ)$/);
  return m ? [m[1], m[2]] : [address];
};
