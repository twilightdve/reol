/**
 * 手紙の宛先にする「この一年」の出来事(plan/64。2026-11-08 のユーザーの決定で、宛先はこの一年の分だけ)。
 * 2025-11-09〜2026-11-08 のライヴ(live-year.json)・作品の発売と MV の公開(year-releases.json)。
 * 宛先のキーは DB の決まり(^(song|release|live|era):[A-Za-z0-9-]{1,64}$)に合わせる: live:<id> / release:<作品> / song:<MV の曲> / era:reol(選ばずに書く)。
 * 入口の年表・手紙を書く画面・届いた手紙で同じキーを使う。前の宛先(時代・昔の曲)で届いた手紙は消さず、届いた手紙では別の枠に出す。
 */
import liveYear from "./live-year.json";
import yearReleases from "./year-releases.json";
import { buildAddress, LetterEvent } from "./timeline";

export type YearTab = "live" | "release" | "mv";
export type YearEvent = LetterEvent & { tab: YearTab | null; place?: string };

type LiveRow = { id: string; date: string; city: string; venue: string; title: string };
type ReleaseRow = { id: string; date: string; title: string; format: string };
type MvRow = { videoId: string; song: string; date: string; songUuid: string };

/** 宛名に使う短い名前(英語の副題・feat. を外す) */
export const shortTitle = (t: string) =>
  t
    .replace(/\s*\((?:[^()]*)\)\s*$/, "")
    .replace(/\s+-\s+.*$/, "")
    .replace(/\s+feat\.\s.*$/i, "")
    .trim();

/** 選ばずに書く時の宛先(この一年の Reol へ) */
export const YEAR_ERA_EVENT: YearEvent = {
  key: "era:reol",
  kind: "era",
  date: "",
  title: "この一年のReol",
  sub: "",
  era: "reol",
  defaultAddress: "この一年のReolへ",
  searchText: "",
  href: null,
  tab: null,
};

const lives: YearEvent[] = (liveYear as LiveRow[]).map((l) => ({
  key: `live:${l.id}`,
  kind: "live",
  date: l.date,
  title: `${l.city}・${l.venue}`,
  sub: l.title,
  era: "reol",
  defaultAddress: buildAddress(l.city, "reol", "あのライヴの"),
  searchText: [l.city, l.venue, l.title].join(" ").toLowerCase(),
  href: null,
  tab: "live",
  place: l.city,
}));

const releases: YearEvent[] = (yearReleases as { releases: ReleaseRow[] }).releases.map((r) => ({
  key: `release:${r.id.replace(/^release-/, "")}`,
  kind: "release",
  date: r.date,
  title: r.title,
  sub: r.format,
  era: "reol",
  defaultAddress: buildAddress(shortTitle(r.title), "reol"),
  searchText: [r.title, r.format].join(" ").toLowerCase(),
  href: null,
  tab: "release",
}));

const mvs: YearEvent[] = (yearReleases as { mvs: MvRow[] }).mvs.map((m) => ({
  key: `song:${m.songUuid}`,
  kind: "song",
  date: m.date,
  title: m.song,
  sub: "MV公開",
  era: "reol",
  defaultAddress: buildAddress(shortTitle(m.song), "reol"),
  searchText: m.song.toLowerCase(),
  href: null,
  tab: "mv",
}));

/** この一年の出来事(日付の順。同じ日は 作品 → MV → ライヴ) */
const ORDER: Record<YearTab, number> = { release: 0, mv: 1, live: 2 };
export const YEAR_EVENTS: YearEvent[] = [...releases, ...mvs, ...lives].sort(
  (a, b) => a.date.localeCompare(b.date) || ORDER[a.tab as YearTab] - ORDER[b.tab as YearTab]
);

export const YEAR_EVENT_BY_KEY = new Map<string, YearEvent>([YEAR_ERA_EVENT, ...YEAR_EVENTS].map((e) => [e.key, e]));

/** 月ごとにまとめる(年表の表示用) */
export const yearMonths = <T extends { date: string }>(items: T[]) => {
  const out: { key: string; year: string; month: number; items: T[] }[] = [];
  for (const it of items) {
    const key = it.date.slice(0, 7);
    let m = out.find((x) => x.key === key);
    if (!m) {
      m = { key, year: key.slice(0, 4), month: Number(key.slice(5, 7)), items: [] };
      out.push(m);
    }
    m.items.push(it);
  }
  return out;
};

export const MONTH_NAMES = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
