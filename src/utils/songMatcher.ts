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
