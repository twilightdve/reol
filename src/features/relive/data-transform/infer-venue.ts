import type { GeneratedVenueType } from "./generated-types";

const includesAny = (value: string, needles: string[]) =>
  needles.some((needle) => value.includes(needle.toLowerCase()));

export const inferVenueType = (
  name: string | null | undefined
): { type: GeneratedVenueType; reasons: string[] } => {
  const normalized = (name || "").normalize("NFKC").toLowerCase();
  if (!normalized) {
    return { type: "unknown", reasons: ["missing_place"] };
  }

  if (includesAny(normalized, ["youtube", "vrchat", "配信", "オンライン"])) {
    return { type: "virtual", reasons: ["virtual_keyword"] };
  }

  if (includesAny(normalized, ["幕張メッセ", "kintex", "インテックス", "展示場", "convention center", "tobacco dock"])) {
    return { type: "exhibition", reasons: ["exhibition_keyword"] };
  }

  if (includesAny(normalized, ["アリーナ", "arena", "日本武道館", "横浜アリーナ", "大阪城ホール", "代々木", "さいたまスーパーアリーナ", "istora", "体育中心"])) {
    return { type: "arena", reasons: ["arena_keyword"] };
  }

  if (includesAny(normalized, ["公園", "野外", "fes", "フェス", "music festival", "スポーツアイランド", "音楽堂", "海岸", "green park", "緑地", "海とのふれあい広場"])) {
    return { type: "outdoor_festival", reasons: ["outdoor_keyword"] };
  }

  if (includesAny(normalized, [
    "zepp",
    "zeep",
    "hatch",
    "o-east",
    "o-west",
    "o-crest",
    "o-nest",
    "drum",
    "pit",
    "club",
    "loft",
    "bigcat",
    "big cat",
    "liquidroom",
    "www",
    "unit",
    "quattro",
    "heaven's rock",
    "ex theater",
    "cube garden",
    "fanj",
    "roxy",
    "live house",
    "livehouse",
    "garage",
    "reny",
    "veats",
    "meta valley",
    "casino drive",
    "crazymama",
    "dime",
    "central",
    "b.9",
    "penny lane",
    "ペニーレーン",
    "m'axa",
    "wstudio",
    "lots",
    "studio",
    "quarter",
    "blitz",
    "gigs",
    "rensa",
    "e.l.l.",
    "phase live",
    "east live",
    "ell.",
    "modernsky lab",
    "tango live",
    "harbor studio",
    "ハーバースタジオ",
    "スタジオコースト",
    "クラブクアトロ",
    "桜坂セントラル",
  ])) {
    return { type: "live_house", reasons: ["live_house_keyword"] };
  }

  if (includesAny(normalized, ["ホール", "市民会館", "文化会館", "公会堂", "会館", "hall", "theater", "theatre", "劇場", "芸術館", "講堂", "ソニックシティ", "サンプラザ", "テルサ", "スカラエスパシオ", "line cube", "フェニーチェ"])) {
    return { type: "hall", reasons: ["hall_keyword"] };
  }

  return { type: "unknown", reasons: ["no_type_keyword"] };
};
