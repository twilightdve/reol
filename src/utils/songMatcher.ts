/**
 * セトリの曲名と Discography 楽曲を相互参照するためのマッチング層。
 *
 * - シート側の表記揺れを吸収して `songUuid` を解決する。
 * - 完全一致 → 副題ストリップ → 正規化 → エイリアス辞書 の順で照合する。
 * - 「代表 songUuid」は同一表記の中で最も古い (= songUuid の文字列順で最小) を採用する。
 *   UUIDv7 は時系列で単調増加するため、文字列順 = リリース順となる前提。
 */

import { Song } from "../types/discography";
import { SONG_ALIASES } from "../data/songAliases";

/** Unicode 正規化 + 小文字化 + 余白/記号除去 */
export const normalizeSongName = (s: string | null | undefined): string => {
  if (!s) return "";
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s()（）\[\]【】「」『』!?！？/／・,，.。\-_~〜]+/g, "");
};

/** 副題などの括弧書きを除去 */
export const stripParenthetical = (s: string | null | undefined): string => {
  if (!s) return "";
  return s.replace(/\s*[（(].*?[)）]\s*/g, "").trim();
};

export interface SongIndex {
  byExact: Map<string, string>;
  byStripped: Map<string, string>;
  byNormalized: Map<string, string>;
}

/** Discography 楽曲一覧から照合用インデックスを構築する。 */
export const buildSongIndex = (songs: Song[]): SongIndex => {
  const byExact = new Map<string, string>();
  const byStripped = new Map<string, string>();
  const byNormalized = new Map<string, string>();

  // 代表 songUuid は UUIDv7 文字列順で最小（最古のリリース）を採用
  const sorted = [...songs].sort((a, b) =>
    a.songUuid.localeCompare(b.songUuid)
  );
  for (const s of sorted) {
    const name = s.songName;
    if (!name || !s.songUuid) continue;
    if (!byExact.has(name)) byExact.set(name, s.songUuid);
    const stripped = stripParenthetical(name);
    if (stripped && !byStripped.has(stripped))
      byStripped.set(stripped, s.songUuid);
    const norm = normalizeSongName(name);
    if (norm && !byNormalized.has(norm)) byNormalized.set(norm, s.songUuid);
  }
  return { byExact, byStripped, byNormalized };
};

export type MatchSource =
  | "sheet"
  | "exact"
  | "alias"
  | "stripped"
  | "normalized"
  | "stripped+normalized"
  | "none";

export interface MatchResult {
  songUuid: string | null;
  source: MatchSource;
}

/** セトリ表記から songUuid を解決する */
export const matchSongId = (
  setlistName: string | null | undefined,
  index: SongIndex
): MatchResult => {
  if (!setlistName) return { songUuid: null, source: "none" };

  // 1) 完全一致
  const exact = index.byExact.get(setlistName);
  if (exact !== undefined) return { songUuid: exact, source: "exact" };

  // 2) 手動 alias 辞書
  const aliased = SONG_ALIASES[setlistName];
  if (aliased !== undefined) return { songUuid: aliased, source: "alias" };

  // 3) 副題ストリップで一致
  const stripped = stripParenthetical(setlistName);
  if (stripped) {
    const s = index.byExact.get(stripped) ?? index.byStripped.get(stripped);
    if (s !== undefined) return { songUuid: s, source: "stripped" };
  }

  // 4) 正規化で一致
  const norm = normalizeSongName(setlistName);
  if (norm) {
    const s = index.byNormalized.get(norm);
    if (s !== undefined) return { songUuid: s, source: "normalized" };
  }

  // 5) ストリップ + 正規化
  if (stripped) {
    const ns = normalizeSongName(stripped);
    if (ns) {
      const s = index.byNormalized.get(ns);
      if (s !== undefined)
        return { songUuid: s, source: "stripped+normalized" };
    }
  }

  return { songUuid: null, source: "none" };
};

/**
 * 楽曲マスタ自身の名寄せ用。
 *
 * `matchSongId` は「完全一致」を最優先するため、"煽げや尊し(Agitate)" のように
 * 曲名自体に副題が含まれるレコードは常に自分自身と完全一致してしまい、
 * 副題なし版("煽げや尊し")等の別レコードへ正規化されない
 * (`byExact` は文字列完全一致でしか引けないため)。
 *
 * そのため楽曲マスタ同士の名寄せは、副題を落とした文字列
 * (`stripParenthetical`)をグルーピングキーとして行う。
 * 同一グループ内では songUuid が UUIDv7 で文字列順=時系列順になる前提のもと、
 * 最小(最古)の songUuid を代表として採用する。
 *
 * "mede:mede" と "mede:mede -JJJ Remix-" のように括弧書きでない別曲は
 * `stripParenthetical` で変化しないため、別グループのまま維持される。
 * "ディア(Instrumental)" のように括弧書きが別アレンジ/別トラックを示す場合も
 * (`isArrangementVariant`)、同一楽曲の副題とはみなさず名寄せしない。
 */
// 括弧書きの中身がこれらのキーワードを含む場合、副題(別題)ではなく
// 別アレンジ/別トラックの印なので名寄せしない(例: "ディア(Instrumental)"は
// "ディア"とは別の1トラックであり、同一楽曲の副題違いではない)。
const ARRANGEMENT_VARIANT_KEYWORDS = [
  "instrumental",
  "remix",
  "anime size",
  "ending",
  "special edition",
  "off vocal",
  "acoustic",
  "tv size",
  "short ver",
];

/** 括弧書きの中身が別アレンジ/別トラックを示すものかどうか */
const isArrangementVariant = (songName: string): boolean => {
  const matches = songName.match(/[（(]([^）)]*)[)）]/g) ?? [];
  return matches.some((m) => {
    const inner = m.slice(1, -1).toLowerCase();
    return ARRANGEMENT_VARIANT_KEYWORDS.some((kw) => inner.includes(kw));
  });
};

export const buildCanonicalUuidMap = (
  songs: { songUuid: string; songName: string | null }[]
): Map<string, string> => {
  const groups = new Map<string, string[]>();
  for (const s of songs) {
    if (!s.songUuid || !s.songName) continue;
    // 別アレンジ/別トラックは名寄せせず、曲名そのものを単独グループのキーにする
    const key = isArrangementVariant(s.songName)
      ? s.songName
      : stripParenthetical(s.songName) || s.songName;
    const list = groups.get(key) ?? [];
    list.push(s.songUuid);
    groups.set(key, list);
  }

  const canonical = new Map<string, string>();
  for (const uuids of groups.values()) {
    const representative = [...uuids].sort((a, b) => a.localeCompare(b))[0];
    for (const uuid of uuids) {
      canonical.set(uuid, representative);
    }
  }
  return canonical;
};
